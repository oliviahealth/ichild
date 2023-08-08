from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db

class SavedLocation(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = db.Column(UUID(as_uuid=True), db.ForeignKey('user.id'), nullable=False)
    location_name = db.Column(db.String(), db.ForeignKey('location.name'), nullable=False)
