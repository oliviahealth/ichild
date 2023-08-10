from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db
        
'''
The Conversation model represents a dialogue between a user and a chatbot.

It captures the flow of conversation with attributes such as an identifier, title, date of creation, and associated user.
This model also maintains relationships with the User and Response models to establish connections between participants and the messages exchanged.

Parent Relationship: The conversation is anchored by a foreign key that links it to the user who initiated the first question or message to the chatbot.
                     This relationship captures the user's role as the conversation initiator.

Child Relationship: The conversation model holds a foreign key relationship to an array of 'responses'. 
                    These 'responses' are the api responses given by the chatbot which include the locations, userQuery, etc..., constituting the interaction that follows the user's initial question.
                    This array of 'responses' captures the sequential progression of the conversation.

Example:
{
  "dateCreated": 1691563213384,
  "id": "78bd4f1b-c2b7-4115-a016-e00bb91a8d59",
  "responses": [
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
  ],
  "title": "whats the nearest mcdonalds",
  "userId": "d2e94d1c-2dfc-4618-b444-118087fe0555"
}
'''        
class Conversation(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id', ondelete='CASCADE'))
    author = db.relationship('User', backref='conversation_user')
    responses = db.relationship('Response', backref='conversation', lazy=True, cascade='all, delete-orphan')