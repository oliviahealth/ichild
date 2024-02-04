import os
from flask import Flask
from flask_cors import CORS
from flask_admin import Admin
from flask_admin.contrib.sqla import ModelView
from dotenv import load_dotenv
import ssl

from flask_jwt_extended import JWTManager

from database import db, bcrypt, Location

load_dotenv()

os.environ["TOKENIZERS_PARALLELISM"] = "false"

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

from routes.search_routes import search_routes_bp
from routes.auth_routes import auth_routes_bp
from routes.conversation_routes import conversation_routes_bp
from routes.response_routes import response_routes_bp
from routes.saved_location_routes import saved_location_routes_bp

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_CONNECTION_STRING')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY') # Change this
    
    CORS(app, supports_credentials=True)
    bcrypt.init_app(app)
    jwt = JWTManager(app)

    register_extensions(app)
    register_blueprints(app)
    
    admin = Admin(app, name='iCHILD Admin', template_mode='bootstrap3')
    admin.add_view(ModelView(Location, db.session))

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