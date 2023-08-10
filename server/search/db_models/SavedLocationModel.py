from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db

'''
The SavedLocation model represents a location that a user has saved.

It captures information about the saved location, such as its identifier, the associated user, the location's name, and the creation timestamp.
This model establishes relationships with the User and Location models to associate users and specific locations.

Parent Relationship: The conversation is anchored by a foreign key that links it to the user who saved the location.

Child Relationship: The conversation model holds a foreign key relationship to an array of 'locations'. 
                    These 'locations' are defined by the Location model and are returned by the chatbot when the user enters a query

Example:
{
  "address": "1501 Independence Ave, Bryan, TX 77803",
  "addressLink": "https://www.google.com/maps/search/?api=1&query=1501%20Independence%20Ave%2C%20Bryan%2C%20TX%2077803",
  "dateCreated": 1691563218732,
  "description": "Regional food collection and distribution warehouses that have a goal of collecting and safely storing surplus food, organizing and sorting it with the help of volunteers, then distributing it to areas of high need through partner agencies and special programs to ensure that hungry neighbors are fed.",
  "latitude": 30.6594912,
  "longitude": -96.4084533,
  "name": "Brazos Valley Food Bank",
  "phone": "979-779-3663"
}
'''

class SavedLocation(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'), nullable=False)
    location_name = db.Column(db.String(), db.ForeignKey('location.name'), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    author = db.relationship('User', backref='saved_location_user')
