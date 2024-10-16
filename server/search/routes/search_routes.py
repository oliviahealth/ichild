from flask import Blueprint, render_template, request, jsonify
from sentence_transformers import SentenceTransformer
from flask_jwt_extended import get_jwt_identity, jwt_required
import certifi
import os
import time
import openai

from route_handlers.query_handlers import search_direct_questions, search_location_questions, tools

from search_controller import core_search, grab_info, create_address
from database import Location

search_routes_bp = Blueprint('search_routes', __name__)

# Executes when first user accesses site
@search_routes_bp.before_app_first_request
def connection_and_setup():
    model_path = os.getenv('MODEL_PATH')
    
    global embedder
    embedder = SentenceTransformer(model_path)

    global corpus
    corpus = [location.description for location in Location.query.all()] # Get all the location records from PSQL

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
@jwt_required()
def formatted_db_search():
    user_id = get_jwt_identity()

    if(not user_id):
        return jsonify({ 'Unauthorized': 'Unauthorized' }), 403

    search_query = request.form['data']
    date_created = int(time.time() * 1000)

    messages = [
        {"role": "system", "content": "You are a helpful assistant. Use the supplied tools to assist the user."},
        {"role": "user", "content": search_query}
    ]

    response = openai.chat.completions.create(
        model="gpt-4o",
        messages=messages,
        tools=tools,
    )

    refusal = response.choices[0].message.refusal

    if(refusal):
        return "Something went wrong: OpenAi Classification Refusal", 500

    function_name = response.choices[0].message.tool_calls[0].function.name
    
    data = None
    if(function_name == 'search_direct_questions'):
        response_type = 'direct'
        
        response = search_direct_questions(id, search_query)

        return {
            'userQuery' : search_query,
            'response' : response,
            'responseType' : response_type,
            'locations' : [],
            'dateCreated' : date_created
        }
    elif(function_name == 'search_location_questions'):
        response_type = 'location'

        data = search_location_questions(id, search_query)
        
        response = data.get("response")
        locations = data.get("locations")
        
        return {
            'userQuery' : search_query,
            'response' : response,
            'responseType' : response_type,
            'locations' : locations,
            'dateCreated': date_created
        }
    else:
        return "error"

'''
def formatted_db_search():
    user_id = get_jwt_identity()

    if(not user_id):
        return jsonify({ 'Unauthorized': 'Unauthorized' }), 403

    query = request.form['data']

    crossEncoderItems, crossEncoderScoresDict = core_search(query, embedder, corpus, encoding_dict)

    info_list = grab_info(crossEncoderItems, crossEncoderScoresDict)

    address_list = [create_address(info[0]) for info in info_list]
    names_list = [info[1] for info in info_list]
    desc_list = [info[2] for info in info_list]
    conf_list = [info[4].item() for info in info_list]
    phone_list = [info[3] for info in info_list]
    latitude_list = [info[5] for info in info_list]
    longitude_list = [info[6] for info in info_list]
    website_list = [info[8] for info in info_list]
    address_links_list = [info[9] for info in info_list]
    rating_list = [info[10] for info in info_list]
    hours_of_operation_list = [info[11] for info in info_list]
    id_list = [info[12] for info in info_list]

    validThreshold = 0.25 #threshold for "valid" results

    results = []

    for (index, name) in enumerate(names_list):
        confidence = conf_list[index]

        if(confidence < validThreshold):
            break

        id = id_list[index]
        description = desc_list[index]
        phone = phone_list[index]
        address = address_list[index]
        addressLink = address_links_list[index]
        latitude = float(latitude_list[index])
        longitude = float(longitude_list[index])
        website = website_list[index]
        hoursOfOperation = hours_of_operation_list[index]
        try:
            rating = float(rating_list[index])
        except:
            rating = None

        results.append({ 'id': id, 'name': name, 'description': description, 'confidence': confidence, 'phone': phone, 'address': address, 'addressLink': addressLink, "latitude": latitude, "longitude": longitude, 'website': website, 'rating': rating, "hoursOfOperation": hoursOfOperation, 'isSaved': False })

    date_created = int(time.time() * 1000)

    results = {
        'userQuery': query,
        'locations': results,
        'dateCreated': date_created
    }

    return jsonify(results)
'''