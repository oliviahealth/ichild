from flask import Blueprint, request, jsonify
from flask_jwt_extended import get_jwt_identity, jwt_required
import requests
import time
import os

from database import db, SavedLocation

OLLIE_API_URL = os.getenv('OLLIE_API_URL')

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
    existing_location_id = data['id']

    if not user_id:
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    try:
        # Check if the location exists using the internal API
        location_response = requests.post(
            f'{OLLIE_API_URL}/locations',
            data={'location_ids': [existing_location_id]}
        )

        if location_response.status_code != 200:
            return jsonify({'error': "Location doesn't exist"}), 400

        location_data = location_response.json()

        # Check if we got a valid location back
        if not location_data or len(location_data) == 0:
            return jsonify({'error': "Location doesn't exist"}), 400

        location_name = location_data[0]['name']

        # Check if user already saved this location
        existing_saved = SavedLocation.query.filter_by(
            user_id=user_id,
            existing_location_id=existing_location_id
        ).first()

        if existing_saved:
            return jsonify({'error': 'Location already saved'}), 400

        date_created = int(time.time() * 1000)
        saved_location = SavedLocation(
            name=location_name,
            user_id=user_id,
            date_created=date_created,
            existing_location_id=existing_location_id
        )

        db.session.add(saved_location)
        db.session.commit()

        return jsonify({
            'name': saved_location.name,
            'userId': saved_location.user_id,
            'dateCreated': saved_location.date_created,
            'existingLocationId': saved_location.existing_location_id
        })

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({'error': 'Something went wrong!'}), 500

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
    if not user_id:
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    try:
        # Step 1: Retrieve saved location info for the user sorted from newest to oldest
        saved_location_info = SavedLocation.query.filter_by(user_id=user_id).order_by(
            db.func.to_timestamp(SavedLocation.date_created / 1000).desc()
        ).all()

        # Step 2: Collect all location IDs
        location_ids = [
            saved_location.existing_location_id for saved_location in saved_location_info]

        if not location_ids:
            return jsonify([])

        # Step 3: Fetch all locations in one API call
        locations_response = requests.post(
            f'{OLLIE_API_URL}/locations',
            json={'location_ids': location_ids}
        )

        if locations_response.status_code != 200:
            return jsonify({'error': 'Failed to fetch locations'}), 500

        locations = locations_response.json()

        # Step 4: Create a mapping of location_id to location data
        location_map = {location['id']: location for location in locations}

        # Step 5: Build the final response with saved location info
        saved_locations = []
        for saved_location in saved_location_info:
            location_data = location_map.get(
                saved_location.existing_location_id)
            if location_data:
                # Add dateCreated from saved_location and ensure isSaved is True
                location_data['dateCreated'] = saved_location.date_created
                location_data['isSaved'] = True
                saved_locations.append(location_data)

        return jsonify(saved_locations)

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({'error': 'Something went wrong!'}), 500


"""
    Delete Saved Locations Endpoint.

    This endpoint retrieves all of the saved locations for an authenticated user

    Request Query Parameters:
        - id (UUID): The ID of the location that needs to to be unsaved. Note, this is not the savedlocation.id, it is the id of the actual location

    Request JSON Parameters:
        - userId (UUID): The ID of the user that wants to get their saved locations

    Returns:
        - If successful, returns JSON with saved location details
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""


@saved_location_routes_bp.route('/savedlocations', methods=['DELETE'])
@jwt_required()
def delete_saved_location():
    existing_location_id = request.args.get('id')
    user_id = get_jwt_identity()

    if (not user_id):
        return jsonify({'Unauthorized': 'Unauthorized'}), 403

    try:
        saved_location_to_delete = SavedLocation.query.filter_by(
            existing_location_id=existing_location_id, user_id=user_id).first()

        if (not (str(user_id).strip() == str(saved_location_to_delete.user_id).strip())):
            return jsonify({'Unauthorized': 'Unauthorized'}), 403

        if (not saved_location_to_delete):
            return jsonify({'error': 'Saved location not found'}), 500

        db.session.delete(saved_location_to_delete)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({'error': 'Something went wrong!'}), 500

    return jsonify({'success': 'Saved location deleted successfully'}), 201
