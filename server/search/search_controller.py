import os
import requests
import torch
from sentence_transformers import util
import urllib.parse

from db_models.RecordModel import Record

# core search algorithm separated out for testing
def core_search(query, embedder, corpus, encoding_dict):
    crossEncoderItems = []
    crossEncoderScoresDict = {}
    query_embedding = embedder.encode(query, convert_to_tensor=True)
    cos_scores = util.cos_sim(query_embedding, encoding_dict["Encodings"])[0]
    top_k = min(5, len(corpus))
    top_results = torch.topk(cos_scores, k=top_k)

    for score, idx in zip(top_results[0], top_results[1]):
        crossEncoderItems.append(tuple([query, corpus[idx]]))
        crossEncoderScoresDict[corpus[idx]] = score

    return crossEncoderItems, crossEncoderScoresDict

def grab_info(crossEncoderItems, crossEncoderScoresDict):
    item_count = 5  # Number of items to retrieve
    info_list = []
    
    for i in range(item_count):
        resource = crossEncoderItems[i][1]
    
        location = Record.query.filter_by(description=resource).first()

        name = location.name
        description = location.description
        phone = location.phone_number
        latitude = location.latitude
        longitude = location.longitude
        website = location.website
        address_link = location.url
        rating = location.rating
        confidence = crossEncoderScoresDict[resource]
        
        info_list.append((location, name, description, phone, confidence, latitude, longitude, website, address_link, rating))
    
    return info_list

# algorithm to create addresses separated out for testing
def create_addresses(locations):
    addresses = []

    for location in locations:
        address = 'No location provided'

        if location.zip_code != "":
            address = location.street_number + ' ' + location.route + ", " + location.city + ", " + location.state + " " + str(int(location.zip_code))
            if address[0] == ',' and address[2] == ',':
                address = "No location provided"
            elif address[0] == ',':
                address = location.city + ", " + location.state + " " + str(int(location.zip_code))

        addresses.append(address)

    return tuple(addresses)

def checkIfStreetViewExists(latitude, longitude):
    response = requests.get(f'https://maps.googleapis.com/maps/api/streetview/metadata?key={os.getenv("GOOGLE_API_KEY")}&location={latitude},{longitude}').json()

    status = response['status']

    if(status == 'OK'):
        return True
    
    return False