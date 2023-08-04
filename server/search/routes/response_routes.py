from flask import Blueprint, request, jsonify
from flask_login import login_required

from db_search import db
from db_models.ResponseModel import Response

response_routes_bp = Blueprint('response_routes', __name__)

@login_required
@response_routes_bp.route('/response', methods=['POST'])
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
        return jsonify({ 'error': 'Unexpected error' }), 500
    
    return jsonify({ 'response': { "id": new_response.id, "locations": new_response.locations, "userQuery": new_response.user_query, "conversation_id": new_response.conversation_id } }), 201