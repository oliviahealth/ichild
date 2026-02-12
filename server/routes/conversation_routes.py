from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
import requests
import time
import os

from database import db, Conversation, SavedLocation

OLLIE_API_URL = os.getenv('OLLIE_API_URL')

conversation_routes_bp = Blueprint('conversation_routes', __name__)

"""
    Add Conversation Endpoint.

    This endpoint allows authenticated users to add conversations.
    It checks if a conversation with the provided ID already exists and if not, it creates a new conversation and returns its details.

    Request JSON Parameters:
        - id (UUID): The ID of the conversation.
        - title (str): The title or description of the conversation.
        - userId (UUID): The ID of the user associated with the conversation.

    Returns:
        - If the conversation already exists, returns JSON with conversation details and status code 201.
        - If the conversation is added successfully, returns JSON with new conversation details and status code 201.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""


@conversation_routes_bp.route('/conversations', methods=['POST'])
@jwt_required()
def add_conversations():
    data = request.get_json()

    id = data['id']
    title = data['title']

    user_id = get_jwt_identity()

    if (not user_id):
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    # Check if a conversation with the provided id exists, and if so, return that conversation
    existing_conversation = Conversation.query.filter_by(id=id).first()
    if (existing_conversation):
        date_updated = int(time.time() * 1000)
        existing_conversation.date_updated = date_updated
        db.session.commit()

        return jsonify({'id': existing_conversation.id, 'title': existing_conversation.title, 'userId': existing_conversation.user_id, 'dateCreated': existing_conversation.date_created, 'dateUpdated': existing_conversation.date_updated}), 201

    try:
        date_created = int(time.time() * 1000)

        new_conversation = Conversation(
            id=id, title=title, user_id=user_id, date_created=date_created, date_updated=date_created)

        db.session.add(new_conversation)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({'error': 'Something went wrong!'}), 500

    return jsonify({'id': new_conversation.id, 'title': new_conversation.title, 'userId': new_conversation.user_id, 'dateCreated': new_conversation.date_created, 'dateUpdated': new_conversation.date_updated}), 201


"""
    Get Conversation Preview Endpoint.

    This endpoint allows authenticated users to retrieve a few details about their previous conversations
    It retrieves only the id, title and date_updated for each previous conversation so that they can be displayed on the side panel
    
    Request Query Parameters:
        - conversationId (UUID): The ID of the conversation to be retrieved.

    Returns:
        - If successful, returns JSON with the id, title and date_updated for each conversation.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""


@conversation_routes_bp.route('/conversationpreviews')
@jwt_required()
def get_conversation_previews():
    limit = request.args.get('limit')
    user_id = get_jwt_identity()

    if (not user_id):
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    try:
        conversation_previews = [{
            'id': conversation[0],
            'title': conversation[1]}
            for conversation in Conversation.query
            .filter_by(user_id=user_id)
            # include dateUpdated
            .with_entities(Conversation.id, Conversation.title, Conversation.date_updated)
            # sort by dateUpdated in descending order
            .order_by(Conversation.date_updated.desc())
            .limit(limit or 5)  # limit the results to the first 5 records
            .all()
        ]

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({'error': 'Something went wrong!'}), 500

    return jsonify(conversation_previews)


"""
    Get Conversation Endpoint.

    This endpoint allows authenticated users to retrieve a specific conversation and all the fields associated with it based on a provided conversation id.

    Request Query Parameters:
        - conversationId (UUID): The ID of the conversation to be retrieved.

    Returns:
        - If successful, returns JSON with the conversation and associated response details.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""


@conversation_routes_bp.route('/conversation', methods=['GET'])
@jwt_required()
def get_conversation():
    def resolve_documents(document_ids):
        resolved_documents = []

        for doc_id in document_ids:
            if doc_id in resource_index:
                resolved_documents.append(resource_index[doc_id])

        return resolved_documents

    conversation_id = request.args.get('id')
    user_id = get_jwt_identity()
    try:
        conversation = Conversation.query.filter_by(id=conversation_id).first()

        if not conversation:
            return jsonify({'error': 'Conversation not found'}), 404

        conversation_user_id = str(conversation.user_id).strip()
        if not (user_id == conversation_user_id):
            return jsonify({'Unauthorized': 'Unauthorized'}), 403

        resources = requests.get(
            "https://oliviahealth.org/wp-content/uploads/resources.json",
            timeout=5
        )
        resources.raise_for_status()  # Raises error if request failed

        resources_json = resources.json()

        # Build index once
        resource_index = {}

        for section_name, section_value in resources_json.items():
            if not isinstance(section_value, list):
                continue

            for item in section_value:
                if isinstance(item, dict) and "id" in item:
                    resource_index[item["id"]] = {
                        **item,
                        "resource_type": section_name
                    }

        final = {
            'id': conversation.id,
            'title': conversation.title,
            'dateCreated': conversation.date_created,
            'dateUpdated': conversation.date_updated,
            'responses': []
        }

        for response in conversation.responses:
            res = {
                'id': response.id,
                'conversationId': response.conversation_id,
                'userQuery': response.user_query,
                'response_type': response.response_type,
                'response': response.response,
                'dateCreated': response.date_created,
                'locations': []
            }

            # Get locations from the internal API
            locations_response = requests.post(
                f'{OLLIE_API_URL}/locations',
                data={'location_ids': response.locations}
            )

            # Resolve the complete source documents from the response.documents array
            resolved_documents = resolve_documents(response.documents)
            res['resolved_documents'] = resolved_documents

            if locations_response.status_code == 200:
                # Parse JSON response
                res['locations'] = locations_response.json()

            final['responses'].append(res)

        return jsonify(final)

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({'error': 'Something went wrong'}), 500


"""
    Get Conversations Endpoint.

    This endpoint allows authenticated users to retrieve all of their conversations with all associated fields.

    Request Query Parameters:
        - userId (UUID): The ID of the user whose conversations are to be retrieved.

    Returns:
        - If successful, returns JSON with user conversations and associated details.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""


@conversation_routes_bp.route('/conversations', methods=['GET'])
@jwt_required()
def get_conversations():
    user_id = get_jwt_identity()
    if not user_id:
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    try:
        # Get the conversations that match the userid and filter them from most recently updated to oldest
        user_conversations = Conversation.query.filter_by(user_id=user_id).order_by(
            db.func.to_timestamp(Conversation.date_updated / 1000).desc()
        )

        # Get all of the saved locations so we can check if each location is saved by the user
        saved_location_ids = [
            saved_location[0] for saved_location in SavedLocation.query.filter_by(
                user_id=user_id
            ).with_entities(SavedLocation.existing_location_id).all()
        ]

        data = []

        for conversation in user_conversations:
            conversation_data = {
                'id': conversation.id,
                'title': conversation.title,
                'dateCreated': conversation.date_created,
                'dateUpdated': conversation.date_updated,
                'responses': [],
                'userId': user_id
            }

            for response in conversation.responses:
                response_data = {
                    'id': response.id,
                    'conversationId': response.conversation_id,
                    'userQuery': response.user_query,
                    'dateCreated': response.date_created,
                    'locations': []
                }

                # Get locations from the internal API
                if response.locations:
                    locations_response = requests.post(
                        f'{OLLIE_API_URL}/locations',
                        json={'location_ids': response.locations}
                    )

                    if locations_response.status_code == 200:
                        locations = locations_response.json()

                        # Update isSaved flag for each location
                        for location in locations:
                            location['isSaved'] = location['id'] in saved_location_ids

                        response_data['locations'] = locations

                conversation_data['responses'].append(response_data)

            data.append(conversation_data)

        return jsonify(data)

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({'error': 'Something went wrong!'}), 500


"""
    Delete Conversations Endpoint.

    This endpoint allows authenticated users to delete conversations.

    Request Query Parameters:
        - id (UUID): The ID of the conversation to be deleted.

    Returns:
        - If successful, returns JSON with a success message.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""


@conversation_routes_bp.route("/conversation", methods=['DELETE'])
@jwt_required()
def delete_conversations():
    conversation_id = request.args.get('id')
    user_id = get_jwt_identity()

    try:
        conversation_to_delete = Conversation.query.filter_by(
            id=conversation_id).first()
        conversation_to_delete_user_id = str(
            conversation_to_delete.user_id).strip()

        if (not (user_id == conversation_to_delete_user_id)):
            return jsonify({'Unauthorized': 'Unauthorized'}), 403

        if (not conversation_to_delete):
            return jsonify({'error': 'Conversation not found'})

        db.session.delete(conversation_to_delete)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({'error': 'Something went wrong!'}), 500

    return jsonify({'success': 'Conversation deleted successfully'})
