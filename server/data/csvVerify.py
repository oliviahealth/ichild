import pandas as pd
import requests
import os

current_path = os.path.dirname(os.path.abspath(__file__))
parent_directory = os.path.dirname(current_path)
data_path = os.path.join(current_path, 'CHILD_Working_DB_v2 - Sheet1.csv')

googleAPIKey = os.getenv("GOOGLE_API_KEY")

data = pd.read_csv(data_path)

#print(data)
#print(data.columns)
#print(data['Street Address'])
oldHeaders = data.columns.values.tolist()
#print(oldHeaders)
#print(len(data.index))
dataArray = data.to_numpy()
dataDictList = data.to_dict('records')

class location:
    def __init__(self, name, 
                 streetNumber, route, city, state, country, zipCode,
                 latitude, longitude,
                 description,
                 phoneNumber, 
                 openTimesSun, openTimesMon, openTimesTue, openTimesWed, openTimesThu, openTimesFri, openTimesSat, 
                 photoArray,
                 rating, googleUrl, website,
                 tamuAffiliation, resourceType):
        
        self.name = name

        self.streetNumber = streetNumber
        self.route = route
        self.city = city
        self.state = state
        self.country = country
        self.zipCode = zipCode

        self.latitude = latitude
        self.longitude = longitude

        self.description = description

        self.phoneNumber = phoneNumber

        self.openTimesSun = openTimesSun
        self.openTimesMon = openTimesMon
        self.openTimesTue = openTimesTue
        self.openTimesWed = openTimesWed
        self.openTimesThu = openTimesThu
        self.openTimesFri = openTimesFri
        self.openTimesSat = openTimesSat

        self.photoArray = photoArray #PlacePhoto object that gives photo url via .getUrl()
        
        self.rating = rating
        
        self.googleUrl = googleUrl
        self.website = website
        
        self.tamuAffiliation = tamuAffiliation
        self.resourceType = resourceType #state or community resource
    
    def __str__(self):
        resultStr = f"Name: {self.name},\nAddress: {self.streetNumber} {self.route}, {self.city}, {self.state}, {self.country}, {self.zipCode},\nDescription: {self.description},\nCoordinates: {self.latitude},{self.longitude},\nPhone: {self.phoneNumber},\nSunday: {self.openTimesSun}, Monday: {self.openTimesMon}, Tuesday: {self.openTimesTue}, Wednesday: {self.openTimesWed}, Thursday: {self.openTimesThu}, Friday: {self.openTimesFri}, Saturday: {self.openTimesSat},\nphotoArray: {self.photoArray},\nRating: {self.rating},\nGoogle URL: {self.googleUrl},\nWebsite: {self.website},\nTAMU Affiliation: {self.tamuAffiliation}, Community/State Resource: {self.resourceType}\n\n"

        return resultStr

def get_photo(api_key, photo_reference, max_width=400):
    base_url = "https://maps.googleapis.com/maps/api/place/photo"
    params = {
        "key": api_key,
        "photoreference": photo_reference,
        "maxwidth": max_width
    }
    
    response = requests.get(base_url, params=params)
    if response.status_code == 200:
        return response.content
    else:
        #print(f"Error fetching photo: {response.status_code}")
        return None

locationList = []

#'''
for i in range(len(dataDictList)):
    #print(f"Resource {i+1}: {dataDictList[i]['First Name']}")
    
    placeName = dataDictList[i]['Name']
    
    text_search_url = f"https://maps.googleapis.com/maps/api/place/textsearch/json?key={googleAPIKey}&location=30.627808,-96.334863&radius=15000&query={placeName}"
    response = requests.get(text_search_url)
    googleData = response.json()

    if googleData["status"] == "OK" and len(googleData["results"]) > 0:
        place_id = googleData["results"][0]["place_id"]
        locationRestriction = "30.627808, -96.334863"
        radiusRestriction = "15000"

        details_url = f"https://maps.googleapis.com/maps/api/place/details/json?key={googleAPIKey}&place_id={place_id}"
        details_response = requests.get(details_url)
        details_data = details_response.json()

        if details_data["status"] == "OK":
            place_details = details_data["result"]

            #print(place_details)
            
            try:    
                locName = place_details['name']
            except:
                locName = "Error: Not Found"
            
            '''
            try:
                locStreetNumber = place_details['address_components'][1]['long_name']
            except:
                locStreetNumber = "Error: Not Found"
            try:    
                locRoute = place_details['address_components'][2]['long_name']
            except:
                locRoute = "Error: Not Found"
            try:    
                locCity = place_details['address_components'][4]['long_name']
            except:
                locCity = "Error: Not Found"
            try:    
                locState = place_details['address_components'][6]['long_name']
            except:
                locState = "Error: Not Found"
            try:    
                locCountry = place_details['address_components'][7]['long_name']
            except:
                locCountry = "Error: Not Found"
            try:    
                locZipCode = place_details['address_components'][8]['long_name']
            except:
                locZipCode = "Error: Not Found"
            '''

            locStreetNumber = "Error: Not Found"
            locRoute = "Error: Not Found"
            locCity = "Error: Not Found"
            locState = "Error: Not Found"
            locCountry = "Error: Not Found"
            locZipCode = "Error: Not Found"
            
            addressList = place_details['address_components']
            for i in range(len(addressList)):
                if 'street_number' in addressList[i]['types']:
                    locStreetNumber = addressList[i]['long_name']
                elif 'route' in addressList[i]['types']:
                    locRoute = addressList[i]['long_name']
                elif 'locality' in addressList[i]['types']:
                    locCity = addressList[i]['long_name']
                elif 'administrative_area_level_1' in addressList[i]['types']:
                    locState = addressList[i]['long_name']    
                elif 'country' in addressList[i]['types']:
                    locCountry = addressList[i]['long_name']
                elif 'postal_code' in addressList[i]['types']:
                    locZipCode = addressList[i]['long_name']
            
            try:
                locLatitude = place_details['geometry']['location']['lat']
            except:
                locLatitude = "Error: Not Found"
            try:        
                locLongitude = place_details['geometry']['location']['lng']
            except:
                locLongitude = "Error: Not Found"
            try:
                locDescription = dataDictList[i]['Description']
            except:
                locDescription = "Error: Not Found"
            try:    
                locPhoneNumber = place_details['formatted_phone_number']
            except:
                locPhoneNumber = "Error: Not Found"
            try:
                locOpenTimeSun = place_details['current_opening_hours']['weekday_text'][6]
            except:
                locOpenTimeSun = "Error: Not Found"
            try:    
                locOpenTimeMon = place_details['current_opening_hours']['weekday_text'][0]
            except:
                locOpenTimeMon = "Error: Not Found"
            try:    
                locOpenTimeTue = place_details['current_opening_hours']['weekday_text'][1]
            except:
                locOpenTimeTue = "Error: Not Found"
            try:    
                locOpenTimeWed = place_details['current_opening_hours']['weekday_text'][2]
            except:
                locOpenTimeWed = "Error: Not Found"
            try:    
                locOpenTimeThu = place_details['current_opening_hours']['weekday_text'][3]
            except:
                locOpenTimeThu = "Error: Not Found"
            try:    
                locOpenTimeFri = place_details['current_opening_hours']['weekday_text'][4]
            except:
                locOpenTimeFri = "Error: Not Found"
            try:    
                locOpenTimeSat = place_details['current_opening_hours']['weekday_text'][5]
            except:
                locOpenTimeSat = "Error: Not Found"
            try:    
                locPhotoArray = place_details['photos']         
            except:
                locPhotoArray = ["Error: Not Found"]
            try:
                locRating = place_details['rating']
            except:
                locRating = "Error: Not Found"
            try:
                locUrl = place_details['url']
            except:
                locUrl = "Error: Not Found"
            try:    
                locWebsite = place_details['website']
            except:
                locWebsite = "Error: Not Found"
            try:
                locTAMUAffiliation = dataDictList[i]['TAMU Affiliation']
            except:
                locTAMUAffiliation = "Error: Not Found"
            try:   
                locResourceType = dataDictList[i]['Community Resource/ State Resource']
            except:
                locResourceType = "Error: Not Found"

            newLoc = location(locName, 
                              locStreetNumber, locRoute, locCity, locState, locCountry, locZipCode, 
                              locLatitude, locLongitude, 
                              locDescription, 
                              locPhoneNumber,
                              locOpenTimeSun, locOpenTimeMon, locOpenTimeTue, locOpenTimeWed, locOpenTimeThu, locOpenTimeFri, locOpenTimeSat,
                              locPhotoArray,
                              locRating, 
                              locUrl, locWebsite, 
                              locTAMUAffiliation, locResourceType)

            locationList.append(newLoc)

            del newLoc

        else:
            print("Error fetching place details:", details_data["status"])
    else:
        print(f"Resource {i+1} not found or error in text search:", googleData["status"])
#'''  

bruteForceLocList = []
bruteForceLocList.append(location("Pride Community Center, Inc", "2130", "Harvey Mitchell Parkway South #9706", "College Station", "Texas", "United States", "77845", "30.596346021911383", "-96.30435604963766", "Services for LGBTQ+ Provides a safe place for persons of all sexual orientations, gender identities, and gender expressions, their families and friends, to meet and socialize without having to worry about who they are. NO PHYSICAL LOCATION YET", "979-217-1324", "Open 24 Hours", "Open 24 Hours", "Open 24 Hours", "Open 24 Hours", "Open 24 Hours", "Open 24 Hours", "Open 24 Hours", "Error: No Photos", "5.0", "https://www.google.com/maps/place/Pride+Community+Center,+Inc/@30.5909728,-96.3740621,12z/data=!4m6!3m5!1s0x864685f697fdcec3:0xbd2408c72058c27f!8m2!3d30.590851!4d-96.291661!16s%2Fg%2F11jmzjz53d?authuser=0&entry=ttu", "http://www.pridecc.org/", "No", "Community Resource"))

#Google Place Details Result Example
'''"Resource 38: Brazos Church Pantry"
{'address_components': [{'long_name': 'A', 
                         'short_name': 'A', 
                         'types': ['subpremise']}, 
                        {'long_name': '304', 
                         'short_name': '304', 
                         'types': ['street_number']}, 
                        {'long_name': 'West 26th Street', 
                         'short_name': 'W 26th St', 
                         'types': ['route']}, 
                        {'long_name': 'Downtown', 
                         'short_name': 'Downtown', 
                         'types': ['neighborhood', 'political']}, 
                        {'long_name': 'Bryan', 
                         'short_name': 'Bryan', 
                         'types': ['locality', 'political']}, 
                        {'long_name': 'Brazos County', 
                         'short_name': 'Brazos County', 
                         'types': ['administrative_area_level_2', 'political']}, 
                        {'long_name': 'Texas', 
                         'short_name': 'TX', 
                         'types': ['administrative_area_level_1', 'political']},
                        {'long_name': 'United States', 
                         'short_name': 'US', 
                         'types': ['country', 'political']},
                        {'long_name': '77803', 
                         'short_name': '77803', 
                         'types': ['postal_code']},
                        {'long_name': '3233', 
                         'short_name': '3233', 
                         'types': ['postal_code_suffix']}], 
 'adr_address': '<span class="street-address">304 W 26th St A</span>, <span class="locality">Bryan</span>, <span class="region">TX</span> <span class="postal-code">77803-3233</span>, <span class="country-name">USA</span>', 
 'business_status': 'OPERATIONAL', 
 'current_opening_hours': {'open_now': False, 
                           'periods': [{'close': {'date': '2023-08-14', 'day': 1, 'time': '1430'}, 
                                        'open': {'date': '2023-08-14', 'day': 1, 'time': '1300'}}, 
                                       {'close': {'date': '2023-08-15', 'day': 2, 'time': '1100'}, 
                                        'open': {'date': '2023-08-15', 'day': 2, 'time': '0930'}}, 
                                       {'close': {'date': '2023-08-16', 'day': 3, 'time': '1430'}, 
                                        'open': {'date': '2023-08-16', 'day': 3, 'time': '1300'}}, 
                                       {'close': {'date': '2023-08-10', 'day': 4, 'time': '1100'}, 
                                        'open': {'date': '2023-08-10', 'day': 4, 'time': '0930'}},
                                       {'close': {'date': '2023-08-11', 'day': 5, 'time': '1100'}, 
                                        'open': {'date': '2023-08-11', 'day': 5, 'time': '0930'}}, 
                                       {'close': {'date': '2023-08-12', 'day': 6, 'time': '1130'}, 
                                        'open': {'date': '2023-08-12', 'day': 6, 'time': '1000'}}],
                           'weekday_text': ['Monday: 1:00\u2009–\u20092:30\u202fPM', 
                                            'Tuesday: 9:30\u2009–\u200911:00\u202fAM', 
                                            'Wednesday: 1:00\u2009–\u20092:30\u202fPM', 
                                            'Thursday: 9:30\u2009–\u200911:00\u202fAM', 
                                            'Friday: 9:30\u2009–\u200911:00\u202fAM', 
                                            'Saturday: 10:00\u2009–\u200911:30\u202fAM', 
                                            'Sunday: Closed']}, 
 'formatted_address': '304 W 26th St A, Bryan, TX 77803, USA', 
 'formatted_phone_number': '(979) 822-2660', 
 'geometry': {'location': {'lat': 30.6741156, 'lng': -96.3756739}, 
              'viewport': {'northeast': {'lat': 30.6753863802915, 'lng': -96.3743102697085}, 
                           'southwest': {'lat': 30.6726884197085, 'lng': -96.37700823029151}}}, 
 'icon': 'https://maps.gstatic.com/mapfiles/place_api/icons/v1/png_71/generic_business-71.png', 
 'icon_background_color': '#7B9EB0', 
 'icon_mask_base_uri': 'https://maps.gstatic.com/mapfiles/place_api/icons/v2/generic_pinlet', 
 'international_phone_number': '+1 979-822-2660', 
 'name': 'Brazos Church Pantry', 
 'opening_hours': {'open_now': False, 
                   'periods': [{'close': {'day': 1, 'time': '1430'}, 
                                'open': {'day': 1, 'time': '1300'}}, 
                               {'close': {'day': 2, 'time': '1100'}, 
                                'open': {'day': 2, 'time': '0930'}},
                               {'close': {'day': 3, 'time': '1430'},
                                'open': {'day': 3, 'time': '1300'}},
                               {'close': {'day': 4, 'time': '1100'}, 
                                'open': {'day': 4, 'time': '0930'}}, 
                               {'close': {'day': 5, 'time': '1100'}, 
                                'open': {'day': 5, 'time': '0930'}},
                               {'close': {'day': 6, 'time': '1130'}, 
                                'open': {'day': 6, 'time': '1000'}}], 
                   'weekday_text': ['Monday: 1:00\u2009–\u20092:30\u202fPM', 
                                    'Tuesday: 9:30\u2009–\u200911:00\u202fAM', 
                                    'Wednesday: 1:00\u2009–\u20092:30\u202fPM', 
                                    'Thursday: 9:30\u2009–\u200911:00\u202fAM', 
                                    'Friday: 9:30\u2009–\u200911:00\u202fAM', 
                                    'Saturday: 10:00\u2009–\u200911:30\u202fAM', 
                                    'Sunday: Closed']}, 
 'photos': [{'height': 3120, 
             'html_attributions': ['<a href="https://maps.google.com/maps/contrib/101153631049116010947">Danna</a>'], 
             'photo_reference': 'AUacShha7snHlH1rwQZUme03bzmZlDmtQPA9WxngK2xwWCcleMyMqANJrojUvvGRbLGjDNMSav7Pg6f1uZzTk2VA4nVzztz17C01wz5gb85NAgVcppqdJjpW0LvfEWLUZMOikstpezvJ8FIxrmF7LvLkW4lAJAsoh3AWQWdvZTs-TsROwLUu', 
             'width': 4160}], 
 'place_id': 'ChIJQedrLaOBRoYRxNYwSF9rwOk', 
 'plus_code': {'compound_code': 'MJFF+JP Bryan, TX, USA', 
               'global_code': '8625MJFF+JP'}, 
 'rating': 4.8, 
 'reference': 'ChIJQedrLaOBRoYRxNYwSF9rwOk', 
 'reviews': [{'author_name': 'Ezekiel Gonzalez', 
              'author_url': 'https://www.google.com/maps/contrib/103399988935153034916/reviews', 
              'language': 'en', 
              'original_language': 'en', 
              'profile_photo_url': 'https://lh3.googleusercontent.com/a-/AD_cMMSVNALLCNnvAtlvmUvN-WlYyr3pBuBvZSaoVQbeXoWgNKI=s128-c0x00000000-cc-rp-mo', 
              'rating': 5, 
              'relative_time_description': 'in the last week', 
              'text': 'They Are Great 👍\n5 Stars Hands Down\nLovely People/Great Service.\nMay The Alpha And Omega Bless Them For All Their Service.', 
              'time': 1691508396, 
              'translated': False}, 
             {'author_name': 'Carolyn Thomas', 
              'author_url': 'https://www.google.com/maps/contrib/100249875915386142821/reviews', 
              'language': 'en', 
              'original_language': 'en', 
              'profile_photo_url': 'https://lh3.googleusercontent.com/a-/AD_cMMQVfmFZc6jFPB0k32PvlEXPLXPq-_qPj1TdGzwJoGWSALc=s128-c0x00000000-cc-rp-mo', 
              'rating': 5, 
              'relative_time_description': 'a month ago', 
              'text': 'Awesome and they will Pray for you. Do not have to get out of your car they will bring it to you.', 
              'time': 1687578256, 
              'translated': False}, 
             {'author_name': "Annette Simpson-O'Neal", 
              'author_url': 'https://www.google.com/maps/contrib/114577936798163891673/reviews', 
              'language': 'en', 
              'original_language': 'en', 
              'profile_photo_url': 'https://lh3.googleusercontent.com/a-/AD_cMMT6M4kyLHBiEiPP9tMIruohZpQ1e19yY1puEJIe5LaXH1Bn=s128-c0x00000000-cc-rp-mo-ba2', 
              'rating': 4, 
              'relative_time_description': '3 months ago', 
              'text': 'Drive-through service is very efficient. Awesome workers and all the items provided were very useful.', 
              'time': 1683001802, 
              'translated': False}, 
             {'author_name': 'Rosalinda Calderon', 
              'author_url': 'https://www.google.com/maps/contrib/104316607058912705555/reviews', 
              'language': 'en', 
              'original_language': 'en', 
              'profile_photo_url': 'https://lh3.googleusercontent.com/a-/AD_cMMRJ2Ip1BskWc3ItZjoTjgB6nH0jscroRTRRa6sg6bbiOg4=s128-c0x00000000-cc-rp-mo-ba3', 
              'rating': 5, 
              'relative_time_description': 'a month ago', 
              'text': 'Very friendly people they help with anything that they can 🥰❤️', 
              'time': 1687808295, 
              'translated': False}, 
             {'author_name': 'Clara Kamara', 
             'author_url': 'https://www.google.com/maps/contrib/102947283902838863230/reviews', 
             'language': 'en', 
             'original_language': 'en', 
             'profile_photo_url': 'https://lh3.googleusercontent.com/a/AAcHTtemxU4ar-SOtK_r_fgvFkh1KuQgUmuIR9Xqwqbg2UkY=s128-c0x00000000-cc-rp-mo', 
             'rating': 5, 
             'relative_time_description': 'a month ago', 
             'text': 'They gave us the necessities and even took the time to pray for your needs', 
             'time': 1688144334, 
             'translated': False}], 
 'types': ['point_of_interest', 'establishment'], 
 'url': 'https://maps.google.com/?cid=16843580663342880452', 
 'user_ratings_total': 158, 
 'utc_offset': -300, 
 'vicinity': '304 West 26th Street A, Bryan', 
 'website': 'http://brazoschurchpantry.org/', 
 'wheelchair_accessible_entrance': True}'''

newHeaders = ["Name", 
              "Street Number", "Route", "City", "State", "Country", "Zip Code", 
              "Latitude", "Longitude", 
              "Description",
              "Phone Number",
              "Sunday Hours", "Monday Hours", "Tuesday Hours", "Wednesday Hours", "Thursday Hours", "Friday Hours", "Saturday Hours",
              "Photo URL",
              "Rating", 
              "URL", "Website",
              "TAMU Affiliation", "Resource Type"]

newDataFrame = pd.DataFrame(columns = newHeaders)

for loc in locationList:
    locDict = {}
    locDict = loc.__dict__
    locPhoto = ""
    locList = []

    if locDict['photoArray'][0] != "Error: Not Found":
        locPhoto = locDict['photoArray'][0]['photo_reference']
        #print(locPhoto)
    else:
        locPhoto = "Error: No Photo"
    
    locDict['photoArray'] = locPhoto
    locList = list(locDict.values())
    #print(locList)
    newDataFrame = pd.concat([newDataFrame, pd.DataFrame(locList).T])

for loc in bruteForceLocList:
    locDict = {}
    locDict = loc.__dict__
    locList = []

    locList = list(locDict.values())
    #print(locList)
    newDataFrame = pd.concat([newDataFrame, pd.DataFrame(locList).T])

#print(newDataFrame)

headerDict = {}
for i in range(len(newHeaders)):
    headerDict[i] = newHeaders[i]

newDataFrame = newDataFrame.drop(columns=headerDict.values())

newDataFrame.rename(columns=headerDict, inplace=True)

#print(newDataFrame)
newDataFrame.to_csv(data_path, mode='w', index=False)

print("New DataFrame saved to:", data_path)