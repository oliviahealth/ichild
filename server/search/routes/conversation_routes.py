from flask import Blueprint, request, jsonify
from flask_login import login_required

from db_search import db
from db_models.ConversationModel import Conversation
from db_models.LocationModel import Location

conversation_routes_bp = Blueprint('conversation_routes', __name__)

@login_required
@conversation_routes_bp.route('/conversations', methods=['POST'])
def add_conversations():
    data = request.get_json()
    
    id = data['id']
    title = data['title']
    user_id = data['userId']

    existing_conversation = Conversation.query.filter_by(id=id).first()
    if(existing_conversation):
        return jsonify({ 'id': existing_conversation.id, 'title': existing_conversation.title, 'userId': existing_conversation.user_id }), 201

    try:
        new_conversation = Conversation(id=id, title=title, user_id=user_id)
    
        db.session.add(new_conversation)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500
            
    return jsonify({ 'id': new_conversation.id, 'title': new_conversation.title, 'userId': new_conversation.user_id }), 201

@login_required
@conversation_routes_bp.route('/conversations', methods=['GET'])
def get_conversations():
    user_id = request.args.get('userId')

    try:
        user_conversations = Conversation.query.filter_by(user_id=user_id).all()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500               


    ## Should be optimized
    location_dict = {location.name: location for location in Location.query.all()}

    data = [
        {
            'id': conversation.id,
            'title': conversation.title,
            'responses': [
                {
                    'id': response.id,
                    'conversationId': response.conversation_id,
                    'userQuery': response.user_query,
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
    
    return jsonify({ 'success': 'Conversation deleted successfully' })
        


