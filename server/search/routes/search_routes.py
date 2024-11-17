from flask import Blueprint, render_template, request, jsonify, Response, stream_with_context, current_app
from sentence_transformers import SentenceTransformer
from flask_jwt_extended import get_jwt_identity, jwt_required
import os
import time
import openai
import sys
import logging
import json
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


# API route for ICHILD frontend
@search_routes_bp.route("/formattedresults", methods=['POST', 'GET'])
@jwt_required()
def formatted_db_search_streaming():
    user_id = get_jwt_identity()
    # app_logger.info(f"=== Starting new request ===")
    # app_logger.info(f"User ID: {user_id}")
    
    if not user_id:
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    search_query = request.form.get('data')
    conversation_id = request.form.get('conversationId')
    date_created = int(time.time() * 1000)
    
    # app_logger.info(f"Search Query: {search_query}")
    # app_logger.info(f"Conversation ID: {conversation_id}")

    determine_search_type_response = determine_search_type(search_query, conversation_id)
    # app_logger.info(f"Search type determined: {determine_search_type_response.choices[0].message}")

    def generate_response():
        """
        Generates the response to be streamed. This function processes the search query and yields parts of the 
        response as they are available, which allows the client to start receiving data before the entire process 
        is completed.
        """
        if not determine_search_type_response.choices[0].message.tool_calls:
            content = determine_search_type_response.choices[0].message.content
            yield json.dumps({
                'userQuery': search_query,
                'response': content,
                'response_type': 'direct',
                'locations': [],
                'dateCreated': date_created,
                'conversationId': conversation_id
            })

        else:
            function_name = determine_search_type_response.choices[0].message.tool_calls[0].function.name

            if function_name == 'search_direct_questions':
                response = search_direct_questions(conversation_id, search_query)
                yield json.dumps({
                    'userQuery': search_query,
                    'response': response,
                    'response_type': 'direct',
                    'locations': [],
                    'dateCreated': date_created,
                    'conversationId': conversation_id
                })

            elif function_name == 'search_location_questions':
                data = search_location_questions(conversation_id, search_query)
                response = data.get("response")
                locations = data.get("locations")
                yield json.dumps({
                    'userQuery': search_query,
                    'response': response,
                    'response_type': 'location',
                    'locations': locations,
                    'dateCreated': date_created,
                    'conversationId': conversation_id
                })

            else:
                # OpenAI Streaming --- This part handles streaming responses from OpenAI where the data is returned
                # in chunks. Each chunk is processed as soon as it's received, and we stream that back to the client(which is not implemented yet)
                try:
                    response = openai.ChatCompletion.create(
                        model='gpt-4',
                        messages=[{'role': 'user', 'content': search_query}],
                        stream=True    #enable streaming of the response
                    )

                    collected_response = []
                    for chunk in response:
                        # collect content from each chunk as it arrives, and yield it incrementally 
                        if 'choices' in chunk and len(chunk['choices']) > 0:
                            content = chunk['choices'][0]['delta'].get('content', '')
                            if content:
                                collected_response.append(content)

                                yield json.dumps({
                                    'userQuery': search_query,
                                    'response': ''.join(collected_response),
                                    'response_type': 'streaming',  # this indicates the response is being streamed
                                    'locations': [],
                                    'dateCreated': date_created,
                                    'conversationId': conversation_id
                                })

                    final_response = ''.join(collected_response)
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
                    yield json.dumps({
                        'userQuery': search_query,
                        'response': "Error occurred while processing the request.",
                        'response_type': 'error',
                        'locations': [],
                        'dateCreated': date_created,
                        'conversationId': conversation_id
                    })
    #response object with streaming context
    return Response(stream_with_context(generate_response()), content_type='application/json')
