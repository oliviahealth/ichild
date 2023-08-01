from flask import Blueprint, request, jsonify
from flask_login import UserMixin, login_user, login_required, logout_user

from db_search import db, login_manager, bcrypt

auth_routes_bp = Blueprint('auth_routes', __name__)

class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    password = db.Column(db.String(), nullable=False)
    
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@auth_routes_bp.route("/register", methods=['POST'])
def register():
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

        login_user(new_user)
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': "Unexpected error" }), 500

    return jsonify({ 'id': new_user.id, "name": new_user.name, "email": new_user.email }), 201

@auth_routes_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    user = User.query.filter_by(email=email).first()

    if(user == None or bcrypt.check_password_hash(user.password, password) == False):
        return jsonify({ 'error': 'Invalid credentials' }), 401
    
    try:
        login_user(user)
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500
        
    return jsonify({ 'id': user.id, 'name': user.name, 'email': user.email }), 200
    
@auth_routes_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    try:
        logout_user()
    except Exception as error:
        db.session.rollback()
        print(error)
        return jsonify({ 'error': 'Unexpected error' }), 500

    return jsonify({ 'message' : 'User logged out successfully' }), 200