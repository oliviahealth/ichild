from flask import Blueprint, request, jsonify
from flask_login import login_required

from db_search import db
from db_models.ConversationModel import Conversation

conversation_routes_bp = Blueprint('conversation_routes', __name__)

@login_required
@conversation_routes_bp.route('/conversations', methods=['POST'])
def conversations():
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
            
            return jsonify({ 'id': id, 'title': title, 'created': created, 'lastAccessed': lastAccessed, 'responses': responses, 'userId': user_id })

        try:
            new_conversation = Conversation(id=id, title=title, created=created, lastAccessed=lastAccessed, responses=responses, user_id=user_id)

            db.session.add(new_conversation)
            db.session.commit()
        except Exception as error:
            db.session.rollback()
            print(error)
            return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify({ 'message' : 'success' })