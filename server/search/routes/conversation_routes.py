from flask import Blueprint, request, jsonify
from flask_login import login_required
import time

from db_search import db
from db_models.ConversationModel import Conversation
from db_models.LocationModel import Location

conversation_routes_bp = Blueprint('conversation_routes', __name__)

"""
    Add Conversation Endpoint.

    This endpoint allows authenticated users to add conversations.
    It checks if a conversation with the provided ID already exists,
    and if not, it creates a new conversation and returns its details.

    Request JSON Parameters:
        - id (UUID): The ID of the conversation.
        - title (str): The title or description of the conversation.
        - userId (UUID): The ID of the user associated with the conversation.

    Returns:
        - If the conversation already exists, returns JSON with conversation details and status code 201.
        - If the conversation is added successfully, returns JSON with new conversation details and status code 201.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""
@login_required
@conversation_routes_bp.route('/conversations', methods=['POST'])
def add_conversations():
    data = request.get_json()
    
    id = data['id']
    title = data['title']
    user_id = data['userId']

    # Check if a conversation with the provided id exists, and if so, return that conversation
    existing_conversation = Conversation.query.filter_by(id=id).first()
    if(existing_conversation):
        date_updated = int(time.time() * 1000)
        existing_conversation.date_updated = date_updated
        db.session.commit()

        return jsonify({ 'id': existing_conversation.id, 'title': existing_conversation.title, 'userId': existing_conversation.user_id, 'dateUpdated': existing_conversation.date_updated }), 201

    try:
        date_created = int(time.time() * 1000)

        new_conversation = Conversation(id=id, title=title, user_id=user_id, date_created=date_created, date_updated=date_created)
    
        db.session.add(new_conversation)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500
            
    return jsonify({ 'id': new_conversation.id, 'title': new_conversation.title, 'userId': new_conversation.user_id }), 201

"""
    Get Conversations Endpoint.

    This endpoint allows authenticated users to retrieve their conversations.
    It retrieves user conversations, includes relevant response details, and returns them.
    It retrieves by default 5 conversations but can get paginate more

    Request Query Parameters:
        - userId (UUID): The ID of the user whose conversations are to be retrieved.
        - page (Integer, optional): The page number of results. Default is 1
        - perPage (integer, optional): The number of conversations per page. Default is 5

    Returns:
        - If successful, returns JSON with user conversations and associated response details.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""
@login_required
@conversation_routes_bp.route('/conversations', methods=['GET'])
def get_conversations():
    user_id = request.args.get('userId')
    page = request.args.get('page', default=1, type=int)
    per_page = request.args.get('perPage', default=5, type=int)

    try:
        # Get the conversations that match the userid and filter them from most recently updated to oldest
        user_conversations = Conversation.query.filter_by(user_id=user_id).order_by(db.func.to_timestamp(Conversation.date_updated / 1000).desc()).paginate(page=page, per_page=per_page)

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500               


    ## Should be optimized
    location_dict = {location.name: location for location in Location.query.all()}

    # Destructure all of the data out of user_conversations by running a couple nested loops for some of the nested arrays
    # This process can be inefficient for large data sets, so it should be optimized
    data = [
        {
            'id': conversation.id,
            'title': conversation.title,
            'dateCreated': conversation.date_created,
            'dateUpdated': conversation.date_updated,
            'responses': [
                {
                    'id': response.id,
                    'conversationId': response.conversation_id,
                    'userQuery': response.user_query,
                    'dateCreated': response.date_created,
                    'locations': [
                        {
                            'address': location.address,
                            'addressLink': location.addressLink,
                            'description': location.description,
                            'latitude': location.latitude,
                            'longitude': location.longitude,
                            'name': location.name,
                            'phone': location.phone,
                        }
                        for locationName in response.locations
                        for location in [location_dict.get(locationName)]
                    ]
                }
                for response in conversation.responses
            ],
            'userId': user_id
        }
        for conversation in user_conversations
    ]
    
    return jsonify(data)

"""
    Delete Conversations Endpoint.

    This endpoint allows authenticated users to delete conversations.
    It deletes the specified conversation and returns a success message.

    Request Query Parameters:
        - id (UUID): The ID of the conversation to be deleted.

    Returns:
        - If successful, returns JSON with a success message.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""
@login_required
@conversation_routes_bp.route("/conversations", methods=['DELETE'])
def delete_conversations():
    conversation_id = request.args.get('id')

    try:
        conversation_to_delete = Conversation.query.get(conversation_id)

        if(not conversation_to_delete):
            return jsonify({ 'error': 'Conversation not found' })
        
        db.session.delete(conversation_to_delete)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500
    
    return jsonify({ 'success': 'Conversation deleted successfully' })
        


