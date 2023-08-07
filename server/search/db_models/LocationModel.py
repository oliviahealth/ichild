from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db

class Location(db.Model):
    name = db.Column(db.String(), primary_key=True,)
    address = db.Column(db.String(), nullable=False)
    addressLink = db.Column(db.String(), nullable=False)
    confidence = db.Column(db.Float(), nullable=False)
    description = db.Column(db.String(), nullable=False)
    latitude = db.Column(db.Float(), nullable=False)
    longitude = db.Column(db.Float(), nullable=False)
    phone = db.Column(db.String(), nullable=False)
    response_id = db.Column(UUID(as_uuid=True), db.ForeignKey('response.id', ondelete='CASCADE'), nullable=False)
    author = db.relationship('Response', backref='responses')