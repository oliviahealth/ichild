from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db

class Response(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_query = db.Column(db.String(), nullable=False)
    locations = db.Column(db.ARRAY(db.String()), nullable=False)
    conversation_id = db.Column(UUID(as_uuid=True), db.ForeignKey('conversation.id', ondelete='CASCADE'), nullable=False)
    author = db.relationship('Conversation', backref='conversations')