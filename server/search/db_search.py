import os
import ssl
from flask import Flask, render_template, redirect, url_for, request
from flask_cors import CORS
from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask_login import LoginManager, login_user, current_user
from dotenv import load_dotenv
from flask_jwt_extended import JWTManager

from database import db, bcrypt, Location, User
from routes.search_routes import search_routes_bp
from routes.auth_routes import auth_routes_bp
from routes.conversation_routes import conversation_routes_bp
from routes.response_routes import response_routes_bp
from routes.saved_location_routes import saved_location_routes_bp

load_dotenv()

os.environ["TOKENIZERS_PARALLELISM"] = "false"

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

class MyAdminIndexView(AdminIndexView):
    def is_accessible(self):
        return current_user.is_authenticated

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_CONNECTION_STRING')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')  # Change this
    
    CORS(app, supports_credentials=True)
    bcrypt.init_app(app)
    jwt = JWTManager(app)

    register_extensions(app)
    register_blueprints(app)

    admin = Admin(app, index_view=MyAdminIndexView(name='iCHILD Admin'), template_mode='bootstrap3')
    admin.add_view(ModelView(Location, db.session))

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(str(user_id))

    @app.route('/login', methods=['GET', 'POST'])
    def login():
        if request.method == 'POST':
            email = request.form.get('email')
            password = request.form.get('password')

            user = User.query.filter_by(email=email).first()

            if(user is None or not bcrypt.check_password_hash(user.password, password)):
                print("Invalid admin login")
                return render_template('login.html')
                
            login_user(user)
            return redirect(url_for('admin.index'))

        return render_template('login.html')

    return app

def register_extensions(app):
    db.init_app(app)  

def register_blueprints(app):
    app.register_blueprint(search_routes_bp)
    app.register_blueprint(auth_routes_bp)
    app.register_blueprint(conversation_routes_bp)
    app.register_blueprint(response_routes_bp)
    app.register_blueprint(saved_location_routes_bp)

def setup_database(app):
    with app.app_context():
        db.create_all()

if __name__ == '__main__':
    app = create_app()
    setup_database(app)
    app.run()
