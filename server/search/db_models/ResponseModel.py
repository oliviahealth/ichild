from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TypeDecorator, JSON, ARRAY, Text
import json
import uuid

from db_search import db

class LocationType(TypeDecorator):
    impl = Text

    def process_bind_param(self, value, dialect):
        # Called when Python data is bound to the database
        # Convert the ApiResponse object to JSON string for storage
        if value is not None:
            return json.dumps({
                'address': value['address'],
                'addressLink': value['addressLink'],
                'confidence': value['confidence'],
                'description': value['description'],
                'latitude': value['latitude'],
                'longitude': value['longitude'],
                'name': value['name'],
                'phone': value['phone']
            })
        
    def process_result_value(self, value, dialect):
        # Called when data is fetched from the database
        # Convert the stored JSON dict back to an ApiResponse object
        if value is not None:
            return json.loads(value)
        return None
    
class Response(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    locations = db.Column(ARRAY(LocationType), nullable=False)
    user_query = db.Column(db.String(), nullable=False)
    conversation_id = db.Column(UUID(as_uuid=True), db.ForeignKey('conversation.id', ondelete='CASCADE'))
    author = db.relationship('Conversation', backref='conversations')