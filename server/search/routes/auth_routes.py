from flask import Blueprint, request, jsonify, session
from flask_login import login_user, login_required, logout_user
import time

from database import db, User, login_manager, bcrypt

auth_routes_bp = Blueprint('auth_routes', __name__)
    
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(str(user_id))

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
    
    # Check if a user exists and if so, send an error message
    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({ 'error': 'Username already exists' }), 400

    try:
        # Hash the user password before storing it in the db
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        date_created = int(time.time() * 1000)

        new_user = User(name=name, email=email, password=hashed_password, date_created=date_created)

        db.session.add(new_user)
        db.session.commit()

        login_user(new_user, remember=True)
        session['edu.tamu.ollie.user_id'] = new_user.id
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': "Something went wrong!" }), 500

    return jsonify({ 'id': new_user.id, "name": new_user.name, "email": new_user.email, 'dateCreated': date_created }), 201

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

    # Check if a user with the email and password exists, and if not, send an error message
    user = User.query.filter_by(email=email).first()

    if(user is None or not bcrypt.check_password_hash(user.password, password)):
        return jsonify({ 'error': 'Invalid credentials' }), 401
    
    try:
        # Run the login_user function provided by flask_login to create a session
        login_user(user, remember=True)
        session['edu.tamu.ollie.user_id'] = user.id
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500
        
    return jsonify({ 'id': user.id, 'name': user.name, 'email': user.email, 'dateCreated': user.date_created }), 200

"""
    User Signout Endpoint.
    
    This endpoint allows logged-in users to sign out.
    It logs the user out and returns a success message.

    Returns:
        - If successful, returns JSON with a success message.
        - If any unexpected error occurs, returns a JSON error message with status code 500.
"""
@auth_routes_bp.route('/signout', methods=['POST'])
@login_required
def signout():
    try:
        # Delete the session
        logout_user()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Something went wrong!' }), 500

    return jsonify({ 'success' : 'User logged out successfully' }), 200