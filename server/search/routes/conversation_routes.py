from flask import Blueprint, request, jsonify
from flask_login import login_required

from db_search import db
from db_models.ConversationModel import Conversation

conversation_routes_bp = Blueprint('conversation_routes', __name__)

@login_required
@conversation_routes_bp.route('/conversations', methods=['POST'])
def post_conversations():
    data = request.get_json()

    for conversation in data:
        created = conversation['created']
        id = conversation['id']
        lastAccessed = conversation['lastAccessed']
        responses = conversation['responses']
        title = conversation['title']
        user_id = conversation['userId']

        existing_conversation = db.session.query(Conversation).filter_by(id=id).first()

        if(existing_conversation):
            existing_conversation.lastAccessed = lastAccessed
            existing_conversation.responses = responses
            db.session.commit()
        else:
            try:
                new_conversation = Conversation(id=id, title=title, created=created, lastAccessed=lastAccessed, responses=responses, user_id=user_id)

                db.session.add(new_conversation)
                db.session.commit()
            except Exception as error:
                db.session.rollback()
                print(error)
                return jsonify({ 'error': 'Unexpected error' }), 500
            
    return get_conversations()

@login_required
@conversation_routes_bp.route('/conversations', methods=['GET'])
def get_conversations():
    user_id = request.args.get('userId')

    try:
        user_conversations = Conversation.query.filter_by(user_id=user_id).order_by(Conversation.lastAccessed.desc()).all()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify({ 'conversations' : [{ 'id': conversation.id, 'title': conversation.title, 'created': conversation.created, 'lastAccessed': conversation.lastAccessed, 'responses': conversation.responses, 'userId': user_id } for conversation in user_conversations] })

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