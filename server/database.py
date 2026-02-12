from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import UserDefinedType
from flask_bcrypt import Bcrypt
from flask_login import UserMixin
import uuid

db = SQLAlchemy()
bcrypt = Bcrypt()
revoked_tokens = set()

class Vector(UserDefinedType):
    def get_col_spec(self):
        return "VECTOR(1536)"

    def bind_expression(self, bindvalue):
        return bindvalue

    def column_expression(self, col):
        return col
class Conversation(db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    date_updated = db.Column(db.BigInteger(), nullable=False)
    user_id = db.Column(db.String(), db.ForeignKey('user.id', ondelete='CASCADE'))
    author = db.relationship('User', backref='conversation_user')
    responses = db.relationship('Response', backref='conversation', lazy=True, cascade='all, delete-orphan')

class Response(db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_query = db.Column(db.String(), nullable=False)
    locations = db.Column(db.ARRAY(db.String()), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    response_type = db.Column(db.String(), nullable=False)
    response = db.Column(db.String(), nullable=False)
    documents = db.Column(db.String(), nullable=False)
    conversation_id = db.Column(db.String(), db.ForeignKey('conversation.id', ondelete='CASCADE'), nullable=False)
    author = db.relationship('Conversation', backref='conversations')

class User(UserMixin, db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    password = db.Column(db.String(), nullable=False)
    is_admin=db.Column(db.Boolean(), nullable=False, default=False)
    date_created = db.Column(db.BigInteger(), nullable=False)

    conversations = db.relationship('Conversation', backref='user', cascade='all, delete-orphan')
    saved_locations = db.relationship('SavedLocation', backref='user', lazy=True, cascade='all, delete-orphan')

class SavedLocation(db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(), db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)

    existing_location_id = db.Column(db.String(), nullable=False)

    author = db.relationship('User', backref='saved_location_user')
