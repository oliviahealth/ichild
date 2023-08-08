from flask import Blueprint, request, jsonify
from flask_login import login_required

from db_search import db
from db_models.ResponseModel import Response
from db_models.LocationModel import Location

response_routes_bp = Blueprint('response_routes', __name__)

@login_required
@response_routes_bp.route('/response', methods=['POST'])
def add_response():
    data = request.get_json()
    locations = data.get('locations')
    user_query = data.get('userQuery')
    conversation_id = data.get('conversationId')
    locationsArr = []
    
    try:
        for location in locations:
            address = location.get('address')
            addressLink = location.get('addressLink')
            description = location.get('description')
            latitude = location.get('latitude')
            longitude = location.get('longitude')
            name = location.get('name')
            phone = location.get('phone')

            location = Location(address=address, addressLink=addressLink, description=description, latitude=latitude, longitude=longitude, name=name, phone=phone, response_id=conversation_id)
            locationsArr.append(location)

        new_response = Response(locations=locationsArr, user_query=user_query, conversation_id=conversation_id)
    
        db.session.add(new_response)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500
    
    return jsonify({ 'response': { "id": new_response.id, 'locations': [
                {                    
                    'address': location.address,
                    'addressLink': location.addressLink,
                    'description': location.description,
                    'latitude': location.latitude,
                    'longitude': location.longitude,
                    'name': location.name,
                    'phone': location.phone,
                }
                for location in new_response.locations
            ], "userQuery": new_response.user_query, "conversation_id": new_response.conversation_id } }), 201