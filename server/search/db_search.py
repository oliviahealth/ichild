import os
from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from flask_bcrypt import Bcrypt
from flask_login import LoginManager
from flask_cors import CORS
from dotenv import load_dotenv
import ssl

load_dotenv()

os.environ["TOKENIZERS_PARALLELISM"] = "false"

try:
    _create_unverified_https_context = ssl._create_unverified_context
except AttributeError:
    pass
else:
    ssl._create_default_https_context = _create_unverified_https_context

#Initialization
app = Flask(__name__)
cors = CORS(app, supports_credentials=True)

app.config['SQLALCHEMY_DATABASE_URI'] = os.getenv('POSTGRESQL_CONNECTION_STRING')
app.config['SECRET_KEY'] = 'your_secret_key' # Change this

db = SQLAlchemy(app)
bcrypt = Bcrypt(app)
login_manager = LoginManager(app)

from routes.search_routes import search_routes_bp
from routes.auth_routes import auth_routes_bp
from routes.conversation_routes import conversation_routes_bp

# Use route controllers to handle all incoming requests
app.register_blueprint(search_routes_bp)
app.register_blueprint(auth_routes_bp)
app.register_blueprint(conversation_routes_bp)

# Create tables
with app.app_context():
    db.create_all()