import torch
from sentence_transformers import util

from database import Location

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
    info_list = []
    
    for i in range(len(crossEncoderItems)):
        resource = crossEncoderItems[i][1]
    
        location = Location.query.filter_by(description=resource).first()

        id = location.id
        name = location.name
        description = location.description
        phone = location.phone
        latitude = location.latitude
        longitude = location.longitude
        address = location.address
        website = location.website
        address_link = location.address_link
        rating = location.rating
        hoursOfOperation = [{ "sunday": location.sunday_hours }, { "monday": location.monday_hours }, { "tuesday": location.tuesday_hours }, { "wednesday": location.wednesday_hours }, {  "thursday": location.thursday_hours }, { "friday": location.friday_hours }, { "saturday": location.saturday_hours }]
        confidence = crossEncoderScoresDict[resource]
        
        info_list.append((location, name, description, phone, confidence, latitude, longitude, address, website, address_link, rating, hoursOfOperation, id))
    
    return info_list

def create_address(location):
    address = 'No location provided'

    if location.zip_code != "":
            address = location.address + ", " + location.city + ", " + location.state + " " + str(int(location.zip_code))
            if address[0] == ',' and address[2] == ',':
                address = "No location provided"
            elif address[0] == ',':
                address = location.city + ", " + location.state + " " + str(int(location.zip_code))
    
    return address