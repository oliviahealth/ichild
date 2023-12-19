from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
import time

from database import db, SavedLocation, Location

saved_location_routes_bp = Blueprint('saved_location_routes', __name__)

"""
    Add Saved Locations Endpoint.

    This endpoint allows authenticated users to add a save a location.
    It creates a new saved location object and returns it.

    Request JSON Parameters:
        - locationName (str): The name of the location the user wants to save (This is the primary key of the LocationModel).
        - userId (UUID): The ID of the user that is wants to save the location.

    Returns:
        - If successful, returns JSON with saved location details
        - If no location can be found with the name, return an error with status code 400
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""

@saved_location_routes_bp.route('/savedlocations', methods=['POST'])
@jwt_required()
def add_saved_location():
    user_id = get_jwt_identity()
    
    data = request.get_json()
    location_name = data['name'] # Remember, the name is the primary key for the LocationModel

    if(not user_id):
        return jsonify({ 'Unauthorized': 'Unauthorized' }), 401

    try:
        # Check if the user provided location exists in the Locations table, and if not, return and error to the user
        existing_location = Location.query.filter_by(name=location_name).first()
        if(not existing_location):
            return jsonify({ 'error': "Location doesn't exist" }), 400
        
        date_created = int(time.time() * 1000)
        saved_location = SavedLocation(name=location_name, user_id=user_id, date_created=date_created)
        
        db.session.add(saved_location)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500

    return jsonify({ 'name': saved_location.name, 'userId': saved_location.user_id, 'dateCreated': saved_location.date_created })

"""
    Get Saved Locations Endpoint.

    This endpoint retrieves all of the saved locations for an authenticated user

    Request JSON Parameters:
        - userId (UUID): The ID of the user that wants to get their saved locations

    Returns:
        - If successful, returns JSON with saved location details
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""

@saved_location_routes_bp.route('/savedlocations', methods=['GET'])
@jwt_required()
def get_saved_locations():
    user_id = get_jwt_identity()
    
    if(not user_id):
        return jsonify({ 'Unauthorized': 'Unauthorized' }), 401

    try:
        # Step 1: Retrieve saved location names for the user sorted from newest to oldest
        saved_location_info = [{ 'id': saved_location.id, 'name': saved_location.name, 'dateCreated': saved_location.date_created } for saved_location in SavedLocation.query.filter_by(user_id=user_id).order_by(db.func.to_timestamp(SavedLocation.date_created / 1000).desc()).all()]
        
        # Step 2: Use the saved location names to fetch Location objects
        saved_locations = []
        for info in saved_location_info:
            # We need to query the database to find the entire location object from the name
            location = Location.query.filter_by(name=info['name']).first()
            if location:
                location_info = {
                    'id': info['id'],
                    'address': location.street_number + ' ' + location.route + ", " + location.city + ", " + location.state + " " + str(int(location.zip_code)),
                    'addressLink': location.address_link,
                    'description': location.description,
                    'latitude': float(location.latitude),
                    'longitude': float(location.longitude),
                    'website': location.website,
                    'name': location.name,
                    'phone': location.phone,
                    'dateCreated': info['dateCreated'],
                    'streetViewExists': location.streetview_exists,
                    'hoursOfOperation': [{ "sunday": location.sunday_hours }, { "monday": location.monday_hours }, { "tuesday": location.tuesday_hours }, { "wednesday": location.wednesday_hours }, {  "thursday": location.thursday_hours }, { "friday": location.friday_hours }, { "saturday": location.saturday_hours }],
                    'rating': float(location.rating) if location.rating.isalnum() else None,
                    'isSaved': True
                }
                saved_locations.append(location_info)

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500

    return jsonify(saved_locations)

"""
    Delete Saved Locations Endpoint.

    This endpoint retrieves all of the saved locations for an authenticated user

    Request JSON Parameters:
        - userId (UUID): The ID of the user that wants to get their saved locations

    Returns:
        - If successful, returns JSON with saved location details
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""

@saved_location_routes_bp.route('/savedlocations', methods=['DELETE'])
@jwt_required()
def delete_saved_location():
    location_name = request.args.get('name')
    user_id = get_jwt_identity()
    
    if(not user_id):
        return jsonify({ 'Unauthorized': 'Unauthorized' }), 401

    try:
        saved_location_to_delete = SavedLocation.query.filter_by(name=location_name, user_id=user_id).first()

        if(not(str(user_id).strip() == str(saved_location_to_delete.user_id).strip())):
            return jsonify({ 'Unauthorized': 'Unauthorized' }), 401

        if(not saved_location_to_delete):
            return jsonify({ 'error': 'Saved location not found' }), 500
        
        db.session.delete(saved_location_to_delete)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500
    
    return jsonify({ 'success': 'Saved location deleted successfully' }), 201