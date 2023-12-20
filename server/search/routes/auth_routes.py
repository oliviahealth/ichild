from flask import Blueprint, request, jsonify
import time
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity

from database import db, User, bcrypt

auth_routes_bp = Blueprint('auth_routes', __name__)
    
'''
Restore User Endpoint

This endpoint restores a users session on the frontend by taking in a jwt access token, validating it and returning the user object to the frontend
'''    
@auth_routes_bp.route("/restoreuser", methods=['POST'])
@jwt_required()
def getUser():
    user = None

    try:
        user_id = get_jwt_identity()

        user = User.query.filter_by(id=user_id).first()

        if(user is None):
            return jsonify({ 'error': 'Invalid credentials' }), 401
        
    except Exception as error:
        print(error)
        return jsonify({ 'error': "Something went wrong!" }), 500

    return jsonify({ 'id': user.id, 'name': user.name, 'email': user.email, 'dateCreated': user.date_created }), 200

"""
    User Signup Endpoint.
    
    This endpoint allows users to sign up by providing their name, email, and password.
    It checks if the provided email is not already associated with an existing user, then
    hashes the password, creates a new user record, and logs the user in.

    Request JSON Parameters:
        - name (str): The user's name.
        - email (str): The user's email address.
        - password (str): The user's password.

    Returns:
        - If successful, returns JSON with user details and a success message.
        - If the provided email is already in use, returns a JSON error message with status code 400.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""
@auth_routes_bp.route("/signup", methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')
    
    access_token = None

    # Check if a user exists and if so, send an error message
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({ 'error': 'Username already exists' }), 400

    try:
        # Hash the user password before storing it in the db
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        date_created = int(time.time() * 1000)

        new_user = User(name=name, email=email, password=hashed_password, date_created=date_created)

        access_token = create_access_token(identity=new_user.id)

        db.session.add(new_user)
        db.session.commit()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': "Something went wrong!" }), 500

    return jsonify({ 'id': new_user.id, "name": new_user.name, "email": new_user.email, 'dateCreated': date_created, 'accessToken': access_token }), 201


"""
    User Signin Endpoint.
    
    This endpoint allows users to sign in by providing their email and password.
    It validates the provided credentials, logs the user in, and returns user details.

    Request JSON Parameters:
        - email (str): The user's email address.
        - password (str): The user's password.

    Returns:
        - If successful, returns JSON with user details and a success message.
        - If the provided credentials are invalid, returns a JSON error message with status code 401.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""
@auth_routes_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    access_token = None
    
    try:
        # Check if a user with the email and password exists, and if not, send an error message
        user = User.query.filter_by(email=email).first()

        if(user is None or not bcrypt.check_password_hash(user.password, password)):
            return jsonify({ 'error': 'Invalid credentials' }), 401
        
        access_token = create_access_token(identity=user.id)
    
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500
        
    return jsonify({ 'id': user.id, 'name': user.name, 'email': user.email, 'dateCreated': user.date_created, 'accessToken': access_token }), 200

"""
    User Signout Endpoint.
    
    This endpoint allows logged-in users to sign out.
    It logs the user out and returns a success message.

    Returns:
        - If successful, returns JSON with a success message.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""
@auth_routes_bp.route('/signout', methods=['POST'])
@jwt_required()
def signout():
    try:
        user_id = get_jwt_identity()

        if(not user_id):
            return jsonify({ 'Unauthorized': 'Unauthorized' }), 401

    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500

    return jsonify({ 'success' : 'User logged out successfully' }), 200