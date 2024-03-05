from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.postgresql import UUID
from flask_bcrypt import Bcrypt
from flask_login import UserMixin
import uuid

db = SQLAlchemy()
bcrypt = Bcrypt()

class Conversation(db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    title = db.Column(db.String(), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    date_updated = db.Column(db.BigInteger(), nullable=False)
    user_id = db.Column(db.String(), db.ForeignKey('user.id', ondelete='CASCADE'))
    author = db.relationship('User', backref='conversation_user')
    responses = db.relationship('Response', backref='conversation', lazy=True, cascade='all, delete-orphan')

class Location(db.Model):
    __bind_key__ = 'admin_db'

    name = db.Column(db.String(), primary_key=True, nullable=False, unique=True)
    address = db.Column(db.String(), nullable=False)
    city = db.Column(db.String(), nullable=False)
    state = db.Column(db.String(), nullable=False)
    country = db.Column(db.String(), nullable=False)
    zip_code = db.Column(db.String(), nullable=False)
    latitude = db.Column(db.Float(), nullable=False)
    longitude = db.Column(db.Float(), nullable=False)
    description = db.Column(db.String(), nullable=False)
    phone = db.Column(db.String(), nullable=False)
    sunday_hours = db.Column(db.String(), nullable=False)
    monday_hours = db.Column(db.String(), nullable=False)
    tuesday_hours = db.Column(db.String(), nullable=False)
    wednesday_hours = db.Column(db.String(), nullable=False)
    thursday_hours = db.Column(db.String(), nullable=False)
    friday_hours = db.Column(db.String(), nullable=False)
    saturday_hours = db.Column(db.String(), nullable=False)
    rating = db.Column(db.String(), nullable=False)
    address_link = db.Column(db.String(), nullable=False)
    website = db.Column(db.String(), nullable=False)
    resource_type = db.Column(db.String(), nullable=False)

class Response(db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_query = db.Column(db.String(), nullable=False)
    locations = db.Column(db.ARRAY(db.String()), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    conversation_id = db.Column(db.String(), db.ForeignKey('conversation.id', ondelete='CASCADE'), nullable=False)
    author = db.relationship('Conversation', backref='conversations')

class SavedLocation(db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = db.Column(db.String(), db.ForeignKey('user.id', ondelete='CASCADE'), nullable=False)
    name = db.Column(db.String(), db.ForeignKey(Location.name, ondelete='CASCADE'), nullable=False)
    date_created = db.Column(db.BigInteger(), nullable=False)
    author = db.relationship('User', backref='saved_location_user')

class User(UserMixin, db.Model):
    id = db.Column(db.String(), primary_key=True, default=lambda: str(uuid.uuid4()))
    name = db.Column(db.String(), nullable=False)
    email = db.Column(db.String(), nullable=False, unique=True)
    password = db.Column(db.String(), nullable=False)
    is_admin=db.Column(db.Boolean(), nullable=False, default=False)
    date_created = db.Column(db.BigInteger(), nullable=False)

    conversations = db.relationship('Conversation', backref='user', cascade='all, delete-orphan')
    saved_locations = db.relationship('SavedLocation', backref='user', lazy=True, cascade='all, delete-orphan')