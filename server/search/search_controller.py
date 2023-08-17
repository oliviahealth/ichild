import os
import requests
import torch
from sentence_transformers import util
import urllib.parse

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

def grab_info(crossEncoderItems, crossEncoderScoresDict, collection_name):
    item_count = 5  # Number of items to retrieve
    info_list = []
    
    for i in range(item_count):
        resource = crossEncoderItems[i][1]
        p_description = collection_name.find_one({"PDescription": resource})
        
        name = p_description["Organization"]
        description = p_description["Description"]
        work_phone = p_description["Work Phone"]
        confidence = crossEncoderScoresDict[resource]
        
        info_list.append((p_description, name, description, work_phone, confidence))
    
    return info_list

# algorithm to create addresses separated out for testing
def create_addresses(p_descriptions):
    addresses = []

    for p_description in p_descriptions:
        address = 'No location provided'

        if p_description["ZIP"] != "":
            address = p_description["Street Address"] + ", " + p_description["City"] + ", " + p_description["State"] + " " + str(int(p_description["ZIP"]))
            if address[0] == ',' and address[2] == ',':
                address = "No location provided"
            elif address[0] == ',':
                address = p_description["City"] + ", " + p_description["State"] + " " + str(int(p_description["ZIP"]))

        addresses.append(address)

    return tuple(addresses)

# algorithm to create address links
def create_address_links(p_descriptions):
    addresses = []

    for p_description in p_descriptions:
        if p_description["ZIP"] != "":
            address = "https://www.google.com/maps/search/?api=1&query=" + urllib.parse.quote(
                p_description["Street Address"] + ", " + p_description["City"] + ", " +
                p_description["State"] + " " + str(int(p_description["ZIP"])))
            addresses.append(address)
        else:
            addresses.append("")

    return tuple(addresses)

def getLatLng(address):
    geocodingResponse = requests.get(f'https://maps.googleapis.com/maps/api/geocode/json?address={address}&key={os.getenv("GOOGLE_API_KEY")}').json()

    latLng = geocodingResponse['results'][0]['geometry']['location']

    return latLng

def checkIfStreetViewExists(latitude, longitude):
    response = requests.get(f'https://maps.googleapis.com/maps/api/streetview/metadata?key={os.getenv("GOOGLE_API_KEY")}&location={latitude},{longitude}').json()

    status = response['status']

    if(status == 'OK'):
        return True
    
    return False