from flask import Blueprint, render_template, request, jsonify, Response
from sentence_transformers import SentenceTransformer
from flask_jwt_extended import get_jwt_identity, jwt_required
import os
import time
import openai
import json

from socketio_instance import socketio
from langchain.chat_models import ChatOpenAI
from langchain import LLMChain, PromptTemplate
from route_handlers.query_handlers import search_direct_questions, search_location_questions, determine_search_type, tools

from database import Location, message_store, db

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

# Using OpenAI for LLM
llm = ChatOpenAI()

@search_routes_bp.route("/", methods=['POST', 'GET'])
def msg():
    return render_template('index.html')

# API route for ICHILD frontend
@search_routes_bp.route("/formattedresults", methods=['POST', 'GET'])
@jwt_required()
def formatted_db_search():
    user_id = get_jwt_identity()

    if (not user_id):
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    search_query = request.form.get('data').strip()
    conversation_id = request.form.get('conversationId').strip()
    date_created = int(time.time() * 1000)

    print(conversation_id)

    messages = [
        {"role": "system", "content": "You are a helpful assistant. First, summarize the conversation history. Then determine if the user's query is location-based, direct-answer, or requires more information. Provide the summary explicitly."},
    ]

    # Reconstruct the conversation history given the conversation_id
    conversation_history = message_store.query.filter_by(
        session_id=conversation_id).all()
    
    for history in conversation_history:
        history = json.loads(history.message)

        history_type = history["type"]
        content = history["data"]["content"]

        role = None
        if (history_type == "human"):
            role = "user"
        elif (history_type == "ai"):
            role = "assistant"

        messages.append({"role": role, "content": content})
    messages.append({"role": "user", "content": search_query})

    determine_search_type_response = determine_search_type(messages)
    tool_calls = determine_search_type_response.choices[0].message.tool_calls

    if (tool_calls):
        function_name = determine_search_type_response.choices[0].message.tool_calls[0].function.name
    else:
        '''
        Follow up question is needed for more information.
        Need to manually add the user query and ai response to the db
        '''
        
        content = determine_search_type_response.choices[0].message.content

        new_user_message = message_store(
            session_id=conversation_id,
            message=f'{{"type": "human", "data": {{"content": "{search_query}"}}}}'
        )

        new_response_message = message_store(
            session_id=conversation_id,
            message=f'{{"type": "ai", "data": {{"content": "{content}"}}}}'
        )

        db.session.add(new_user_message)
        db.session.add(new_response_message)

        db.session.commit()

        return {
            'userQuery': search_query,
            'response': content,
            'response_type': 'direct',
            'locations': [],
            'dateCreated': date_created,
            'conversationId': conversation_id
        }
    
    arguments = json.loads(tool_calls[0].function.arguments)
    summarized_query = arguments['query']

    if (function_name == 'search_direct_questions'):
        response_type = 'direct'

        response = search_direct_questions(conversation_id, summarized_query)

        return {
            'userQuery': search_query,
            'response': response,
            'response_type': response_type,
            'locations': [],
            'dateCreated': date_created,
            'conversationId': conversation_id
        }
    
    elif (function_name == 'search_location_questions'):
        response_type = 'location'

        data = search_location_questions(conversation_id, summarized_query)

        response = data.get("response")
        locations = data.get("locations")

        return {
            'userQuery': search_query,
            'response': response,
            'response_type': response_type,
            'locations': locations,
            'dateCreated': date_created,
            'conversationId': conversation_id
        }
    
    else:
        return "error"
