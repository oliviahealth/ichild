from flask import Blueprint, render_template, request, jsonify
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import certifi
import os
import time

from search_controller import core_search, grab_info, create_addresses, create_address_links, getLatLng, checkIfStreetViewExists

search_routes_bp = Blueprint('search_routes', __name__)

# Executes when first user accesses site
@search_routes_bp.before_app_first_request
def connection_and_setup():
    MONGODB_HOST = os.getenv('MONGO_DB_URL')
    client = MongoClient(MONGODB_HOST, tlsCAFile=certifi.where())
    db = client["IntelligentChild"]
    global collection_name
    collection_name = db["Preprocess"]
    global embedder
    embedder = SentenceTransformer('../models/model1')
    resources = collection_name.find({}, {"Organization": 1, "Description": 1, "Email": 1, "Work Phone": 1, "PDescription": 1})
    global corpus
    corpus = [resource["PDescription"] for resource in resources]

    print("******BEGINNING PREPROCESS*******")
    embeddings = embedder.encode(corpus, convert_to_tensor=True)
    global encoding_dict
    encoding_dict = {}
    encoding_dict["Encodings"] = embeddings
    print("*******END PREPROCESS********")

# Render json search page
@search_routes_bp.route("/", methods=['POST', 'GET'])
def msg():
    return render_template('index.html')

# API route for ICHILD frontend
@search_routes_bp.route("/formattedresults", methods=['POST', 'GET'])
def formatted_db_search():
    query = request.form['data']

    crossEncoderItems, crossEncoderScoresDict = core_search(query, embedder, corpus, encoding_dict)

    info_list = grab_info(crossEncoderItems, crossEncoderScoresDict, collection_name)

    names_list = [info[1] for info in info_list]
    desc_list = [info[2] for info in info_list]
    conf_list = [info[4].item() for info in info_list]
    phone_list = [info[3] for info in info_list]
    address_list = [address for address in create_addresses([info[0] for info in info_list])]
    address_links_list = [address_link for address_link in create_address_links([info[0] for info in info_list])]

    validThreshold = 0.25 #threshold for "valid" results

    results = []

    for (index, name) in enumerate(names_list):
        confidence = conf_list[index]

        if(confidence < validThreshold):
            break

        description = desc_list[index]
        phone = phone_list[index]
        address = address_list[index]
        addressLink = address_links_list[index]

        latitude, longitude = getLatLng(address).values()
        streetViewExists = checkIfStreetViewExists(latitude, longitude)

        date_created = int(time.time() * 1000)

        results.append({ 'name': name, 'description': description, 'confidence': confidence, 'phone': phone, 'address': address, 'addressLink': addressLink, "latitude": latitude, "longitude": longitude, 'streetViewExists': streetViewExists, 'isSaved': False })

    results = {
        'userQuery': query,
        'locations': results,
        'dateCreated': date_created
    }