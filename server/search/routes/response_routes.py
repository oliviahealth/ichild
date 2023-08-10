from flask import Blueprint, request, jsonify
from flask_login import login_required
import time

from db_search import db
from db_models.ResponseModel import Response
from db_models.LocationModel import Location

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
    locationsArr = [] # This array will hold only the name of the locations that are then stored as a column on the response record. Do not store entire location objects. 

    try:
        # Loop through the user provided locations array and destructure all of the properties
        for location in locations:
            address = location.get('address')
            addressLink = location.get('addressLink')
            description = location.get('description')
            latitude = location.get('latitude')
            longitude = location.get('longitude')
            name = location.get('name')
            phone = location.get('phone')

            # Check if the location already exists in the database, and if not, add it to the database
            # Store the name of the location in the locationsArr so we can attach it to the new_response record in the database
            existing_location = Location.query.filter_by(name=name).first()
            if(existing_location == None):
                location = Location(address=address, addressLink=addressLink, description=description, latitude=latitude, longitude=longitude, name=name, phone=phone)
                db.session.add(location)
                db.session.commit()
                
                locationsArr.append(location.name)
            else:
                locationsArr.append(existing_location.name)
            
        new_response = Response(user_query=user_query, conversation_id=conversation_id, locations=locationsArr, date_created=date_created)
    
        db.session.add(new_response)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify({ "id": new_response.id, 'locations': [
                {                    
                    'address': location.get('address'),
                    'addressLink': location.get('addressLink'),
                    'description': location.get('description'),
                    'latitude': location.get('latitude'),
                    'longitude': location.get('longitude'),
                    'name': location.get('name'),
                    'phone': location.get('phone'),
                }
                for location in locations
            ],
            'dateCreated': new_response.date_created,
            "userQuery": new_response.user_query,
            "conversation_id": new_response.conversation_id }), 201