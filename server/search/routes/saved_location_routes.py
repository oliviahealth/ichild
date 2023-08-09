from flask import Blueprint, request, jsonify
from flask_login import login_required
import time

from db_search import db
from db_models.SavedLocationModel import SavedLocation
from db_models.LocationModel import Location

saved_location_routes_bp = Blueprint('saved_location_routes', __name__)

@login_required
@saved_location_routes_bp.route('/savedlocations', methods=['POST'])
def add_saved_location():
    data = request.get_json()
    location_name = data.get('locationName')
    user_id = data.get('userId')

    try:
        existing_location = Location.query.filter_by(name=location_name).first()
        if(not existing_location):
            return jsonify({ 'error': "Location doesn't exist" }), 400
        
        date_created = int(time.time() * 1000)
        saved_location = SavedLocation(location_name=location_name, user_id=user_id, date_created=date_created)
        
        db.session.add(saved_location)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify({ 'response': "success" })

@login_required
@saved_location_routes_bp.route('/savedlocations', methods=['GET'])
def get_saved_locations():
    user_id = request.args.get('userId')

    try:
        # Step 1: Retrieve saved location names for the user
        saved_location_info = [{ 'name': saved_location.location_name, 'dateCreated': saved_location.date_created } for saved_location in SavedLocation.query.filter_by(user_id=user_id).all()]
        
        # Step 2: Use the saved location names to fetch Location objects
        saved_locations = []
        for info in saved_location_info:
            location = Location.query.filter_by(name=info['name']).first()
            if location:
                location_info = {
                    'address': location.address,
                    'addressLink': location.addressLink,
                    'description': location.description,
                    'latitude': location.latitude,
                    'longitude': location.longitude,
                    'name': location.name,
                    'phone': location.phone,
                    'dateCreated': info['dateCreated'],
                }
                saved_locations.append(location_info)

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify(saved_locations)