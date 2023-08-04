from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TypeDecorator, JSON, ARRAY, Text
import json
import uuid

from db_search import db

class ApiResponseType(TypeDecorator):
    impl = Text

    def process_bind_param(self, value, dialect):
        # Called when Python data is bound to the database
        # Convert the ApiResponse object to JSON string for storage
        if value is not None:
            return json.dumps({
                'locations': value['locations'],
                'userQuery': value['userQuery']
            })
        return None
    
    def process_result_value(self, value, dialect):
        # Called when data is fetched from the database
        # Convert the stored JSON dict back to an ApiResponse object
        if value is not None:
            return json.loads(value)
        return None
        
class Conversation(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(), nullable=False)
    created = db.Column(db.String(), nullable=False)
    lastAccessed =  db.Column(db.String(), nullable=False)
    responses = db.Column(ARRAY(ApiResponseType), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
    author = db.relationship('User', backref='users')