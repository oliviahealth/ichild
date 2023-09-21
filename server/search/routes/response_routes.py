from flask import Blueprint, request, jsonify
from flask_login import login_required
import time

from database import db, Response, Location

response_routes_bp = Blueprint('response_routes', __name__)

"""
    Add Response Endpoint.

    This endpoint allows authenticated users to add a response to a conversation.
    It creates a new response with associated location details and returns them.

    Request JSON Parameters:
        - userQuery (str): The user's query or message.
        - conversationId (UUID): The ID of the conversation.
        - locations (list of dict): List of location details associated with the response.

    Returns:
        - If successful, returns JSON with response details and associated location details.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""
@login_required
@response_routes_bp.route('/response', methods=['POST'])
def add_response():
    data = request.get_json()
    locations = data.get('locations')
    user_query = data.get('userQuery')
    conversation_id = data.get('conversationId')
    date_created = data.get('dateCreated')
    locationsArr = [Location.query.filter_by(name=location.get('name')).first().name for location in locations] # This array will hold only the name of the locations that are then stored as a column on the response record. Do not store entire location objects. 

    try:    
        new_response = Response(user_query=user_query, conversation_id=conversation_id, locations=locationsArr, date_created=date_created)

        db.session.add(new_response)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500

    return jsonify({ "id": new_response.id, 'locations': [
                {                    
                    'address': location.get('address'),
                    'addressLink': location.get('addressLink'),
                    'description': location.get('description'),
                    'latitude': location.get('latitude'),
                    'longitude': location.get('longitude'),
                    'website': location.get('website'),
                    'name': location.get('name'),
                    'streetViewExists': location.get('streetViewExists'),
                    'phone': location.get('phone'),
                    'rating': location.get('rating')
                }
                for location in locations
            ],
            'dateCreated': new_response.date_created,
            "userQuery": new_response.user_query,
            "conversation_id": new_response.conversation_id }), 201