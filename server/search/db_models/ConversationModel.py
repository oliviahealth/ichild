from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db
        
class Conversation(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = db.Column(db.String(), nullable=False)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'))
    author = db.relationship('User', backref='users')
    responses = db.relationship('Response', backref='conversation', lazy=True, cascade='all, delete-orphan')