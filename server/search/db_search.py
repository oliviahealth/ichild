import os
from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import ssl

from routes import routes_bp

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
cors = CORS(app)

# Use a route controller to handle all incoming requests
app.register_blueprint(routes_bp)