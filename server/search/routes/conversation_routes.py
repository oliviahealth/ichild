from flask import Blueprint, request, jsonify
from flask_login import login_required

from db_search import db
from db_models.ConversationModel import Conversation
from db_models.ResponseModel import Response

conversation_routes_bp = Blueprint('conversation_routes', __name__)

@login_required
@conversation_routes_bp.route('/conversations', methods=['POST'])
def add_conversations():
    data = request.get_json()
    
    id = data['id']
    title = data['title']
    user_id = data['userId']

    try:
        new_conversation = Conversation(id=id, title=title, user_id=user_id)

        print(f"Conversation: {new_conversation}")

        db.session.add(new_conversation)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500
            
    return jsonify({ 'message': "Conversation created successfully" }), 201

@login_required
@conversation_routes_bp.route('/conversations', methods=['GET'])
def get_conversations():
    user_id = request.args.get('userId')

    try:
        user_conversations = Conversation.query.filter_by(user_id=user_id)
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify({ 'conversations' : [{ 'id': conversation.id, 'title': conversation.title, 'responses': [{ 'id': response.id, 'locations': response.locations, 'conversationId': response.conversation_id, 'userQuery': response.user_query } for response in conversation.responses], 'userId': user_id } for conversation in user_conversations] })

@login_required
@conversation_routes_bp.route("/conversations", methods=['DELETE'])
def delete_conversations():
    conversation_id = request.args.get('id')

    try:
        conversation_to_delete = Conversation.query.get(conversation_id)
        db.session.delete(conversation_to_delete)
        
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500
    
    return jsonify({ 'message': 'Conversation deleted successfully' })

@conversation_routes_bp.route('/response', methods=['POST'])
def add_response():
    data = request.get_json()
    locations = data.get('locations')
    user_query = data.get('userQuery')
    conversation_id = data.get('conversationId')

    try:
        new_response = Response(locations=locations, user_query=user_query, conversation_id=conversation_id)

        db.session.add(new_response)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'erorr': 'Unexpected error' }), 500
    
    return jsonify({ 'response': { "id": new_response.id, "locations": new_response.locations, "userQuery": new_response.user_query, "conversation_id": new_response.conversation_id } }), 201
        


