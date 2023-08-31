from sqlalchemy.dialects.postgresql import UUID
import uuid

from db_search import db

class Record(db.Model):
    id = db.Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = db.Column(db.String(), nullable=True)
    street_number = db.Column(db.String(), nullable=False)
    route = db.Column(db.String(), nullable=False)
    city = db.Column(db.String(), nullable=False)
    state = db.Column(db.String(), nullable=False)
    country = db.Column(db.String(), nullable=False)
    zip_code = db.Column(db.String(), nullable=False)
    latitude = db.Column(db.String(), nullable=False)
    longitude = db.Column(db.String(), nullable=False)
    description = db.Column(db.String(), nullable=False)
    phone_number = db.Column(db.String(), nullable=False)
    sunday_hours = db.Column(db.String(), nullable=False)
    monday_hours = db.Column(db.String(), nullable=False)
    tuesday_hours = db.Column(db.String(), nullable=False)
    wednesday_hours = db.Column(db.String(), nullable=False)
    thursday_hours = db.Column(db.String(), nullable=False)
    friday_hours = db.Column(db.String(), nullable=False)
    saturday_hours = db.Column(db.String(), nullable=False)
    photo_url = db.Column(db.String(), nullable=False)
    rating = db.Column(db.String(), nullable=False)
    url = db.Column(db.String(), nullable=False)
    website = db.Column(db.String(), nullable=False)
    tamu_affiliation = db.Column(db.String(), nullable=False)
    resource_type = db.Column(db.String(), nullable=False)


    