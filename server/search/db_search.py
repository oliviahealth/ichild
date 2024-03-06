import os
import ssl
from flask import Flask
from flask_cors import CORS
from flask_admin import Admin, AdminIndexView
from flask_admin.contrib.sqla import ModelView
from flask_login import LoginManager, current_user
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

# Override the admin panel views to prevent access to non-admin users
class IndexAdminView(AdminIndexView):
    def is_accessible(self):
        if(not current_user.is_authenticated):
            return False
        
        user = User.query.get(str(current_user.id))

        return user.is_admin
    
class LocationView(ModelView):
    def is_accessible(self):
        if not current_user.is_authenticated:
            return False

        user = User.query.get(str(current_user.id))
        return user.is_admin

    def get_query(self):
        # The Location model is now bound to 'second_db'
        return super(LocationView, self).get_query()

    def get_count_query(self):
        # Use the second connection string for the count query
        return super(LocationView, self).get_count_query()

    def create_model(self, form):
        # Explicitly bind the session to 'second_db' when creating a new model instance
        with self.session.get_bind(self.model.__bind_key__).begin():
            return super(LocationView, self).create_model(form)

def create_app():
    app = Flask(__name__)

    app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_CONNECTION_STRING')
    app.config['ADMIN_SQLALCHEMY_DATABASE_URI'] = os.getenv('ADMIN_POSTGRESQL_CONNECTION_STRING')
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY')  # Change this

    app.config['SQLALCHEMY_BINDS'] = {
        'admin_db': app.config['ADMIN_SQLALCHEMY_DATABASE_URI']
    }
    
    CORS(app, supports_credentials=True)
    bcrypt.init_app(app)
    jwt = JWTManager(app)

    register_extensions(app)
    register_blueprints(app)

    admin = Admin(app, index_view=IndexAdminView(name='iCHILD Admin'), template_mode='bootstrap3')
    admin.add_view(LocationView(Location, db.session))

    login_manager = LoginManager()
    login_manager.init_app(app)

    @login_manager.user_loader
    def load_user(user_id):
        return User.query.get(str(user_id))

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

app = create_app()
setup_database(app)

if __name__ == '__main__':
    app.run()
