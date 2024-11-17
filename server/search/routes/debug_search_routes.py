from flask import Blueprint, render_template, request, jsonify, Response, stream_with_context, current_app
from sentence_transformers import SentenceTransformer
from flask_jwt_extended import get_jwt_identity, jwt_required
import os
import time
import openai
import sys
import logging
import json
import re
from route_handlers.query_handlers import search_direct_questions, search_location_questions, determine_search_type, tools
from database import Location, message_store, db


app_logger = logging.getLogger(__name__)

search_routes_bp = Blueprint('search_routes', __name__)

# Executes when first user accesses site
@search_routes_bp.before_app_first_request
def connection_and_setup():
    model_path = os.getenv('MODEL_PATH')

    global embedder
    embedder = SentenceTransformer(model_path)

    global corpus
    # Get all the location records from PSQL
    corpus = [location.description for location in Location.query.all()]

    print("******BEGINNING PREPROCESS*******")
    embeddings = embedder.encode(corpus, convert_to_tensor=True)
    global encoding_dict
    encoding_dict = {}
    encoding_dict["Encodings"] = embeddings
    print("*******END PREPROCESS********")

# Render json search page


@search_routes_bp.route("/", methods=['POST', 'GET'])
def msg():
    return render_template('index.html')


def split_into_smaller_chunks(text):
    """
    Split text into smaller, meaningful chunks based on structure (e.g., bullet points, numbered items, sentences, phrases).
    """
    lines = text.split('\n')
    chunks = []
    
    for line in lines:
        if not line.strip():
            continue
        
        #bullet point or numbered item (generalized for any number)
        if re.match(r'^\s*[-\d]+\.', line.strip()): 
            chunks.append(line.strip())
        #for longer paragraph split by sentences or phrases
        else:
            sentences = [s.strip() + '.' for s in line.split('.') if s.strip()]
            for sentence in sentences:
                if len(sentence) > 50:  # arbitrary threshold for splitting long sentences
                    phrases = [p.strip() + ',' for p in sentence.split(',') if p.strip()]
                    chunks.extend(phrases)
                else:
                    chunks.append(sentence)
    
    return chunks


# API route for formatted results
@search_routes_bp.route("/formattedresults", methods=['POST', 'GET'])
@jwt_required()
def formatted_db_search_streaming():
    user_id = get_jwt_identity()
    app_logger.info(f"=== Starting new request ===")
    app_logger.info(f"User ID: {user_id}")
    
    if not user_id:
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    search_query = request.form.get('data')
    conversation_id = request.form.get('conversationId')
    date_created = int(time.time() * 1000)
    
    # app_logger.info(f"Search Query: {search_query}")
    # app_logger.info(f"Conversation ID: {conversation_id}")

    determine_search_type_response = determine_search_type(search_query, conversation_id)
    # app_logger.info(f"Search type determined: {determine_search_type_response.choices[0].message}")

    def log_response_chunk(chunk_content):
        """
        Logs each response chunk as it is generated - keep track of the content being streamed and assists with debugging.
        """
        try:
            with open('response_chunks.log', 'a', encoding='utf-8') as f:
                timestamp = time.strftime('%Y-%m-%d %H:%M:%S')
                f.write(f"{timestamp} - CHUNK: {chunk_content}\n")
                f.flush()
        except Exception as e:
            app_logger.error(f"Error logging chunk: {e}")

    def generate_response():
        #Generates the response in smaller chunks and streams them back to the client incrementally.
        if not determine_search_type_response.choices[0].message.tool_calls:
            content = determine_search_type_response.choices[0].message.content
            chunks = split_into_smaller_chunks(content)
            collected_response = []
            
            for chunk in chunks:
                collected_response.append(chunk)
                log_response_chunk(chunk)
                yield json.dumps({
                    'userQuery': search_query,
                    'response': ' '.join(collected_response),
                    'response_type': 'direct',
                    'locations': [],
                    'dateCreated': date_created,
                    'conversationId': conversation_id
                })
                time.sleep(0.1)  

        else:
            function_name = determine_search_type_response.choices[0].message.tool_calls[0].function.name

            if function_name == 'search_direct_questions':
                response = search_direct_questions(conversation_id, search_query)
                chunks = split_into_smaller_chunks(response)
                collected_response = []
                
                for chunk in chunks:
                    collected_response.append(chunk)
                    log_response_chunk(chunk)
                    yield json.dumps({
                        'userQuery': search_query,
                        'response': ' '.join(collected_response),
                        'response_type': 'direct',
                        'locations': [],
                        'dateCreated': date_created,
                        'conversationId': conversation_id
                    })
                    time.sleep(0.1)

            elif function_name == 'search_location_questions':
                data = search_location_questions(conversation_id, search_query)
                response = data.get("response")
                locations = data.get("locations")
                chunks = split_into_smaller_chunks(response)
                collected_response = []
                
                for chunk in chunks:
                    collected_response.append(chunk)
                    log_response_chunk(chunk)
                    yield json.dumps({
                        'userQuery': search_query,
                        'response': ' '.join(collected_response),
                        'response_type': 'location',
                        'locations': locations,
                        'dateCreated': date_created,
                        'conversationId': conversation_id
                    })
                    time.sleep(0.1)

            else:
                try:
                    response = openai.ChatCompletion.create(
                        model='gpt-4',
                        messages=[{'role': 'user', 'content': search_query}],
                        stream=True
                    )

                    collected_response = []
                    current_sentence = []
                    
                    for chunk in response:
                        if 'choices' in chunk and len(chunk['choices']) > 0:
                            content = chunk['choices'][0]['delta'].get('content', '')
                            if content:
                                current_sentence.append(content)
                                
                                # If we hit a sentence end or significant punctuation
                                if any(content.endswith(p) for p in ['.', '!', '?', ':', '-', ',']):
                                    full_chunk = ''.join(current_sentence)
                                    log_response_chunk(full_chunk)
                                    collected_response.append(full_chunk)
                                    current_sentence = []
                                    
                                    yield json.dumps({
                                        'userQuery': search_query,
                                        'response': ' '.join(collected_response),
                                        'response_type': 'streaming',  # Streaming response type
                                        'locations': [],
                                        'dateCreated': date_created,
                                        'conversationId': conversation_id
                                    })
                    
                    if current_sentence:
                        final_chunk = ''.join(current_sentence)
                        log_response_chunk(final_chunk)
                        collected_response.append(final_chunk)
                        yield json.dumps({
                            'userQuery': search_query,
                            'response': ' '.join(collected_response),
                            'response_type': 'streaming',
                            'locations': [],
                            'dateCreated': date_created,
                            'conversationId': conversation_id
                        })

                    final_response = ' '.join(collected_response)
                    new_user_message = message_store(
                        session_id=conversation_id,
                        message=f'{{"type": "human", "data": {{"content": "{search_query}"}}}}'
                    )
                    new_response_message = message_store(
                        session_id=conversation_id,
                        message=f'{{"type": "ai", "data": {{"content": "{final_response}"}}}}'
                    )
                    db.session.add(new_user_message)
                    db.session.add(new_response_message)
                    db.session.commit()

                except Exception as e:
                    error_msg = f"Error while streaming response: {str(e)}"
                    app_logger.error(error_msg)
                    log_response_chunk(f"ERROR: {error_msg}")
                    yield json.dumps({
                        'userQuery': search_query,
                        'response': "Error occurred while processing the request.",
                        'response_type': 'error',
                        'locations': [],
                        'dateCreated': date_created,
                        'conversationId': conversation_id
                    })

    return Response(stream_with_context(generate_response()), content_type='application/json')
