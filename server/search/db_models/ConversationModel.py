from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.types import TypeDecorator, JSON, ARRAY
import json
import uuid

from db_search import db

class ApiResponseType(TypeDecorator):
    impl = JSON

    def process_bind_params(self, value, dialect):
        # Called when Python data is bound to the database
        # Convert the ApiResponse object to JSON string for storage
        if value is not None:
            return json.dumps({
                'locationIds': value['locations'],
                'userQuery': value['userQuery']
            })
        return None
    
    def process_result_value(self, value, dialect):
        # Called when data is fetched from the database
        # Convert the stored JSON strign back to an ApiResponse object
        if value is not None:
            location_data = json.loads(value)
            return {
                'locationIds': location_data['locationIds'],
                'userQuery': location_data['userQuery']
            }
        return None
    

    
class Conversation(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(), nullable=False)
    created = db.Column(db.String(), nullable=False)
    lastAccessed =  db.Column(db.String(), nullable=False)
    responses = db.Column(ARRAY(ApiResponseType), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
    author = db.relationship('User', backref='users')