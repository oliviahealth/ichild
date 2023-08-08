from flask import Blueprint, request, jsonify
from flask_login import login_required

from db_search import db
from db_models.SavedLocationModel import SavedLocation
from db_models.LocationModel import Location

saved_location_routes_bp = Blueprint('saved_location_routes', __name__)

@login_required
@saved_location_routes_bp.route('/savedlocation', methods=['POST'])
def add_saved_location():
    data = request.get_json()
    location_name = data.get('locationName')
    user_id = data.get('userId')

    try:
        existing_location = Location.query.filter_by(name=location_name).first()
        if(not existing_location):
            return jsonify({ 'error': "Location doesn't exist" }), 400
        
        saved_location = SavedLocation(location_name=location_name, user_id=user_id)
        
        db.session.add(saved_location)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify({ 'response': "success" })

