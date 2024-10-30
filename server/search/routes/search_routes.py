from flask import Blueprint, render_template, request, jsonify
from sentence_transformers import SentenceTransformer
from flask_jwt_extended import get_jwt_identity, jwt_required
import certifi
import os
import time
import openai
import uuid
import json

from route_handlers.query_handlers import search_direct_questions, search_location_questions, restore_conversation_history, tools

from search_controller import core_search, grab_info, create_address
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

# Render json search page


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

    search_query = request.form['data']
    conversation_id = request.form['conversationId']
    date_created = int(time.time() * 1000)

    messages = [
        {"role": "system", "content": "You are a helpful assistant. Use the supplied tools to assist the user."},
    ]

    if (not conversation_id or conversation_id == "null"):
        conversation_id = uuid.uuid4()
    else:
        conversation_history = message_store.query.filter_by(
            session_id=conversation_id).all()

        for history in conversation_history:
            history = json.loads(history.message)

            type = history["type"]
            content = history["data"]["content"]

            role = None
            if (type == "human"):
                role = "user"
            elif (type == "ai"):
                role = "assistant"

            messages.append({"role": role, "content": content})

    messages.append({"role": "user", "content": search_query})

    print(messages)

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
    )

    print(response)

    refusal = response.choices[0].message.refusal

    if (refusal):
        return "Something went wrong: OpenAi Classification Refusal", 500

    if (response.choices[0].message.tool_calls):
        function_name = response.choices[0].message.tool_calls[0].function.name
    else:
        content = response.choices[0].message.content

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

    data = None

    if (function_name == 'search_direct_questions'):
        response_type = 'direct'

        response = search_direct_questions(conversation_id, search_query)

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

        data = search_location_questions(conversation_id, search_query)

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