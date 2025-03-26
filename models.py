import datetime
from mongoengine import (
    Document, StringField, IntField, DateTimeField, 
    ListField, BooleanField, FloatField, DictField
)

class DetectedItem(Document):
    """
    Flattened document for detection data - optimized for search
    Each detected object becomes its own document
    """
    # Identification fields
    snapshot_id = IntField(required=True)
    
    # Person association
    person = StringField(default="Unknown")
    person_id = IntField(default=-1)  # -1 means no associated person
    
    # Object tracking ID from YOLO (if available)
    object_id = IntField()
    
    # Core object data
    name = StringField()  # Object name/label
    category = StringField()
    color = StringField()
    brand = StringField()
    details = StringField()
    
    # Context information
    timestamp = DateTimeField(default=datetime.datetime.now)
    location = StringField(default="CAM ID 1, location_name") 
    
    # Image reference
    image_path = StringField()
    
    meta = {
        'collection': 'auto-vision',
        'indexes': [
            'snapshot_id', 
            'timestamp',
            'name',
            'category',
            'color',
            'brand',
            'person',
        ],
        'ordering': ['-timestamp']
    }

class SystemLog(Document):
    """System log entries - kept separate from detection data"""
    timestamp = DateTimeField(default=datetime.datetime.now)
    level = StringField(choices=['INFO', 'WARNING', 'ERROR'], default='INFO')
    message = StringField(required=True)
    
    meta = {
        'collection': 'system_logs',
        'indexes': ['timestamp', 'level'],
        'ordering': ['-timestamp']
    }