from flask import Blueprint, request, jsonify
from flask_login import login_user, login_required, logout_user

from db_search import db, login_manager, bcrypt
from db_models.UserModel import User

auth_routes_bp = Blueprint('auth_routes', __name__)
    
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(str(user_id))

@auth_routes_bp.route("/signup", methods=['POST'])
def signup():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    password = data.get('password')

    existing_user = User.query.filter_by(email=email).first()
    if existing_user:
        return jsonify({ 'error': 'Username already exists' }), 400

    try:
        hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')

        new_user = User(name=name, email=email, password=hashed_password)

        db.session.add(new_user)
        db.session.commit()

        login_user(new_user, remember=True)
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': "Unexpected error" }), 500

    return jsonify({ 'id': new_user.id, "name": new_user.name, "email": new_user.email }), 201

@auth_routes_bp.route('/signin', methods=['POST'])
def signin():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if(user == None or bcrypt.check_password_hash(user.password, password) == False):
        return jsonify({ 'error': 'Invalid credentials' }), 401
    
    try:
        login_user(user, remember=True)
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500
        
    return jsonify({ 'id': user.id, 'name': user.name, 'email': user.email }), 200
    
@auth_routes_bp.route('/signout', methods=['POST'])
@login_required
def signout():
    try:
        logout_user()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify({ 'success' : 'User logged out successfully' }), 200