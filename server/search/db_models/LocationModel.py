from db_search import db

'''
The Location model represents a geographical place with associated information.

It includes various attributes to define a location, such as its name, address, address link, description, latitude, longitude, and contact phone number.
Additionally, it maintains a one-to-many relationship with the SavedLocation model to allow users to save and associate locations with their accounts.

The Location model maintains the name as the primary key and must be unique.

There should be no parent relationship between the Location model and and any other model as it must be able to stand alone.

Child Relationship: The conversation model holds a foreign key relationship to an array of 'SavedLocations'. 
                    These SavedLocations are the locations that a user can link to their account for future reference

Example:
{
  "address": "1501 Independence Ave, Bryan, TX 77803",
  "addressLink": "https://www.google.com/maps/search/?api=1&query=1501%20Independence%20Ave%2C%20Bryan%2C%20TX%2077803",
  "description": "Regional food collection and distribution warehouses that have a goal of collecting and safely storing surplus food, organizing and sorting it with the help of volunteers, then distributing it to areas of high need through partner agencies and special programs to ensure that hungry neighbors are fed.",
  "latitude": 30.6594912,
  "longitude": -96.4084533,
  "name": "Brazos Valley Food Bank",
  "phone": "979-779-3663"
}                    
'''

class Location(db.Model):
    name = db.Column(db.String(), primary_key=True)
    address = db.Column(db.String(), nullable=False)
    addressLink = db.Column(db.String(), nullable=False)
    description = db.Column(db.String(), nullable=False)
    latitude = db.Column(db.Float())
    longitude = db.Column(db.Float())
    website = db.Column(db.String())
    streetViewExists = db.Column(db.Boolean(), default=False)
    phone = db.Column(db.String(), nullable=False)
    saved_locations = db.relationship('SavedLocation', backref='location', lazy=True, cascade='all, delete-orphan')