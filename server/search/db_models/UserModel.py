from flask_login import UserMixin
from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db

'''
The User model represents a user in the application.

It includes essential attributes to define a user, such as an identifier, name, email, password hash, and creation timestamp.
This model also establishes relationships with the Conversation and SavedLocation models to associate users with their conversations and saved locations.

Child Relationship: The conversation model holds a foreign key relationship to an array of 'conversations'. 
                    These 'conversations' represent the dialogue between a user and a chatbot and are defined by the Conversation model

Child Relationship: The conversation model holds a foreign key relationship to an array of 'SavedLocations'. 
                    These 'saved locations' represents locations that a user has saved.

The password must be hashed before its stored in the database
'''
class User(UserMixin, db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    password = db.Column(db.String(), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    conversations = db.relationship('Conversation', backref='user', cascade='all, delete-orphan')
    saved_locations = db.relationship('SavedLocation', backref='user', lazy=True, cascade='all, delete-orphan')