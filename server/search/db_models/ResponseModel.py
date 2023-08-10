from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db

'''
The Response model represents the api response the chatbot gives to a user query.

It encompasses the text of the user's query, a list of associated locations, the creation timestamp, and the connection to the conversation it belongs to.
This model establishes a relationship with the Conversation model to provide context for the messages exchanged.

Parent Relationship: The conversation is anchored by a foreign key that links it to the conversation for which this response is a part of.
                     This relationship captures the conversations's role as the response initiator.

This model also holds an array of locations defined by the Location model.
When the chatbot responds to a user query, it will respond with up to 5 locations that best match the users needs.
Those 5 locations would be defined by the Location model and be part of the locations array

Example:
{
  "conversationId": "78bd4f1b-c2b7-4115-a016-e00bb91a8d59",
  "id": "0c2cd970-aec7-40d3-9836-27dae149a706",
  "locations": [
    {
      "address": "1501 Independence Ave, Bryan, TX 77803",
      "addressLink": "https://www.google.com/maps/search/?api=1&query=1501%20Independence%20Ave%2C%20Bryan%2C%20TX%2077803",
      "description": "Regional food collection and distribution warehouses that have a goal of collecting and safely storing surplus food, organizing and sorting it with the help of volunteers, then distributing it to areas of high need through partner agencies and special programs to ensure that hungry neighbors are fed.",
      "latitude": 30.6594912,
      "longitude": -96.4084533,
      "name": "Brazos Valley Food Bank",
      "phone": "979-779-3663"
    },
    {
      "address": "304 W 26th St, Bryan, TX 77803",
      "addressLink": "https://www.google.com/maps/search/?api=1&query=304%20W%2026th%20St%2C%20Bryan%2C%20TX%2077803",
      "description": "If you are in need of an emergency supply of groceries please come to the pantry and let us help you. The Pantry is here so hungry families can get food in emergency situations.",
      "latitude": 30.6741009,
      "longitude": -96.3756704,
      "name": "Brazos Church Pantry",
      "phone": "979-822-2660"
    },
    {
      "address": "Bryan, TX 77802",
      "addressLink": "https://www.google.com/maps/search/?api=1&query=%2C%20Bryan%2C%20TX%2077802",
      "description": "Food Services primary focus is to provide nutritional services to the elderly population of the Brazos Valley. These services are provided through four programs: Congregate Meals served at Senior Centers, Home Delivered Meals, Meals on Wheels and CBA Meals and Private Pay Meals for those who do not qualify for the other programs offered but want to insure they receive the daily nutrition they require.",
      "latitude": 30.6563999,
      "longitude": -96.3172906,
      "name": "Meals on Wheels",
      "phone": "979-823-2203"
    }
  ],
  "userQuery": "whats the nearest mcdonalds"
}
'''

class Response(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_query = db.Column(db.String(), nullable=False)
    locations = db.Column(db.ARRAY(db.String()), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    conversation_id = db.Column(UUID(as_uuid=True), db.ForeignKey('conversation.id', ondelete='CASCADE'), nullable=False)
    author = db.relationship('Conversation', backref='conversations')