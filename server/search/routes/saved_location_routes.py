from flask import Blueprint, request, jsonify
from flask_login import login_required
import time

from db_search import db
from db_models.SavedLocationModel import SavedLocation
from db_models.LocationModel import Location

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
@login_required
@saved_location_routes_bp.route('/savedlocations', methods=['POST'])
def add_saved_location():
    data = request.get_json()
    location_name = data.get('name') # Remember, the name is the primary key for the LocationModel
    user_id = data.get('userId')

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
@login_required
@saved_location_routes_bp.route('/savedlocations', methods=['GET'])
def get_saved_locations():
    user_id = request.args.get('userId')

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
                    'address': location.address,
                    'addressLink': location.addressLink,
                    'description': location.description,
                    'latitude': location.latitude,
                    'longitude': location.longitude,
                    'website': location.website,
                    'name': location.name,
                    'phone': location.phone,
                    'dateCreated': info['dateCreated'],
                    'streetViewExists': location.streetViewExists,
                    'rating': location.rating,
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
@login_required
@saved_location_routes_bp.route('/savedlocations', methods=['DELETE'])
def delete_saved_location():
    name = request.args.get('name')

    try:
        saved_location_to_delete = SavedLocation.query.filter_by(name=name).first()

        if(not saved_location_to_delete):
            return jsonify({ 'error': 'Saved location not found' }), 500
        
        db.session.delete(saved_location_to_delete)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500
    
    return jsonify({ 'success': 'Saved location deleted successfully' }), 201