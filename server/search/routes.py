from flask import Blueprint, render_template, request, jsonify
from pymongo import MongoClient
from sentence_transformers import SentenceTransformer
import certifi
import os

from controller import core_search, grab_info, create_addresses, getLatLng

routes_bp = Blueprint('routes', __name__)

# Executes when first user accesses site
@routes_bp.before_app_first_request
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
@routes_bp.route("/", methods=['POST', 'GET'])
def msg():
    return render_template('index.html')

# API route for ICHILD frontend
@routes_bp.route("/formattedresults", methods=['POST', 'GET'])
def formatted_db_search():
    query = request.form['data']

    crossEncoderItems, crossEncoderScoresDict = core_search(query, embedder, corpus, encoding_dict)
    winningPDescription, secondPDescription, thirdPDescription, fourthPDescription, fifthPDescription, winningName, secondName, thirdName, fourthName, fifthName, winningDescription, secondDescription, thirdDescription, fourthDescription, fifthDescription, winningWorkPhone, secondWorkPhone, thirdWorkPhone, fourthWorkPhone, fifthWorkPhone, winningConfidence, secondConfidence, thirdConfidence, fourthConfidence, fifthConfidence = grab_info(crossEncoderItems, crossEncoderScoresDict, collection_name)

    winningAddress, winningAddressUnencoded, secondAddress, secondAddressUnencoded, thirdAddress, thirdAddressUnencoded, fourthAddress, fourthAddressUnencoded, fifthAddress, fifthAddressUnencoded = create_addresses(winningPDescription, secondPDescription, thirdPDescription, fourthPDescription, fifthPDescription)

    namesList = [winningName, secondName, thirdName, fourthName, fifthName]
    descList = [winningDescription, secondDescription, thirdDescription, fourthDescription, fifthDescription]
    confList = [winningConfidence.item(), secondConfidence.item(), thirdConfidence.item(), fourthConfidence.item(), fifthConfidence.item()]
    phoneList = [winningWorkPhone, secondWorkPhone, thirdWorkPhone, fourthWorkPhone, fifthWorkPhone]
    addList = [winningAddress, winningAddressUnencoded, secondAddress, secondAddressUnencoded, thirdAddress, thirdAddressUnencoded, fourthAddress, fourthAddressUnencoded, fifthAddress, fifthAddressUnencoded]
    unencAddList = [winningAddressUnencoded, secondAddressUnencoded, thirdAddressUnencoded, fourthAddressUnencoded, fifthAddressUnencoded]
    addLinksList = [winningAddress, secondAddress, thirdAddress, fourthAddress, fifthAddress]

    validThreshold = 0.25 #threshold for "valid" results

    results = []

    for (index, name) in enumerate(namesList):
        confidence = confList[index]

        if(confidence < validThreshold):
            break

        description = descList[index]
        phone = phoneList[index]
        address = unencAddList[index]
        addressLink = addLinksList[index]

        latitude, longitude = getLatLng(address).values()

        results.append({ 'name': name, 'description': description, 'confidence': confidence, 'phone': phone, 'address': address, 'addressLink': addressLink, "latitude": latitude, "longitude": longitude })

    results = {
        'userQuery': query,
        'locations': results
    }

    return jsonify(results)
    """return render_template('results.html',
                            userQuery = query,
                            results = results
"""

# Avoid using this route. Use the /formattedresults route instead
@routes_bp.route('/api/ollie/results', methods=['POST', 'GET'])
def db_search():
    query = request.form['data']

    crossEncoderItems, crossEncoderScoresDict = core_search(query, embedder, corpus, encoding_dict)
    winningPDescription, secondPDescription, thirdPDescription, fourthPDescription, fifthPDescription, winningName, secondName, thirdName, fourthName, fifthName, winningDescription, secondDescription, thirdDescription, fourthDescription, fifthDescription, winningWorkPhone, secondWorkPhone, thirdWorkPhone, fourthWorkPhone, fifthWorkPhone, winningConfidence, secondConfidence, thirdConfidence, fourthConfidence, fifthConfidence = grab_info(crossEncoderItems, crossEncoderScoresDict, collection_name)

    
    winningAddress, winningAddressUnencoded, secondAddress, secondAddressUnencoded, thirdAddress, thirdAddressUnencoded, fourthAddress, fourthAddressUnencoded, fifthAddress, fifthAddressUnencoded = create_addresses(winningPDescription, secondPDescription, thirdPDescription, fourthPDescription, fifthPDescription)

    namesList = [winningName, secondName, thirdName, fourthName, fifthName]
    descList = [winningDescription, secondDescription, thirdDescription, fourthDescription, fifthDescription]
    confList = [winningConfidence.item(), secondConfidence.item(), thirdConfidence.item(), fourthConfidence.item(), fifthConfidence.item()]
    phoneList = [winningWorkPhone, secondWorkPhone, thirdWorkPhone, fourthWorkPhone, fifthWorkPhone]
    addList = [winningAddress, winningAddressUnencoded, secondAddress, secondAddressUnencoded, thirdAddress, thirdAddressUnencoded, fourthAddress, fourthAddressUnencoded, fifthAddress, fifthAddressUnencoded]
    unencAddList = [winningAddressUnencoded, secondAddressUnencoded, thirdAddressUnencoded, fourthAddressUnencoded, fifthAddressUnencoded]
    addLinksList = [winningAddress, secondAddress, thirdAddress, fourthAddress, fifthAddress]

    results_list = [namesList, descList, confList, phoneList, addList, unencAddList] # list of unfiltered results
    validThreshold = 0.25 #threshold for "valid" results

    for val in reversed(confList):
        if float(val) < validThreshold:
            namesList.pop(confList.index(val))
            descList.pop(confList.index(val))
            phoneList.pop(confList.index(val))
            addList.pop(confList.index(val))
            unencAddList.pop(confList.index(val))
            confList.pop(confList.index(val))

    results_dict = {
        'userQuery': query,
        'names': namesList,
        'descriptions': descList,
        'confidences': confList,
        'phone': phoneList,
        'address': addList,
        'unencodedAddress': unencAddList,
        "addressLinks": addLinksList,
        'notFoundMessage': "Unfortunately we did not find any results for your question. Maybe try asking in a different way?",
    }

    return jsonify(results_dict)
    """return render_template('results.html',
                            userQuery = query,
                            winnername = winningName,
                            secondname = secondName,
                            thirdname = thirdName,
                            fourthname = fourthName,
                            fifthname = fifthName,
                            notFoundMessage = "Unfortunately we did not find any results for your question. Maybe try asking in a different way?",
                            winningDescription = winningDescription,
                            secondDescription = secondDescription,
                            thirdDescription = thirdDescription,
                            fourthDescription = fourthDescription,
                            fifthDescription = fifthDescription,
                            winningConfidence = winningConfidence,
                            secondConfidence = secondConfidence,
                            thirdConfidence = thirdConfidence,
                            fourthConfidence = fourthConfidence,
                            fifthConfidence = fifthConfidence,
                            winningWorkPhone =  winningWorkPhone,
                            secondWorkPhone = secondWorkPhone,
                            thirdWorkPhone = thirdWorkPhone,
                            fourthWorkPhone = fourthWorkPhone,
                            fifthWorkPhone = fifthWorkPhone,
                            winningAddress = winningAddress,
                            winningAddressUnencoded = winningAddressUnencoded,
                            secondAddress = secondAddress,
                            secondAddressUnencoded = secondAddressUnencoded,
                            thirdAddress = thirdAddress,
                            thirdAddressUnencoded = thirdAddressUnencoded,
                            fourthAddress = fourthAddress,
                            fourthAddressUnencoded = fourthAddressUnencoded,
                            fifthAddress = fifthAddress,
                            fifthAddressUnencoded = fifthAddressUnencoded)
"""