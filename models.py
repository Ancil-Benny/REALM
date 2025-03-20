import datetime
from mongoengine import (
    Document, EmbeddedDocument, 
    StringField, IntField, DateTimeField, 
    DictField, ListField, EmbeddedDocumentField,
    BooleanField, FloatField, DynamicField
)

class ObjectProperty(EmbeddedDocument):
    """Properties of a detected object"""
    color = StringField(default="")
    category = StringField(default="")
    brand = StringField(default="")
    extra = StringField(default="")

class DetectedObject(EmbeddedDocument):
    """An object detected in an image"""
    name = StringField(required=True)
    properties = EmbeddedDocumentField(ObjectProperty)

class PersonWithObjects(EmbeddedDocument):
    """A person with associated objects"""
    person = StringField(default="unknown")
    objects = ListField(EmbeddedDocumentField(DetectedObject))

class VisionAnalysis(Document):
    """Main document for vision analysis results"""
    # Identification and metadata
    snapshot_id = IntField(required=True)
    timestamp = DateTimeField(default=datetime.datetime.now)
    image_path = StringField()
    
    # Analysis results
    analysis_result = ListField(EmbeddedDocumentField(PersonWithObjects))
    
    # Raw analysis data for reference - using DynamicField to accept any type
    raw_data = DynamicField()  # Changed from DictField to DynamicField
    
    meta = {
        'collection': 'auto-vision',
        'indexes': [
            'snapshot_id',
            'timestamp',
            {'fields': ['analysis_result.person'], 'cls': False},
        ],
        'ordering': ['-timestamp']
    }

class SystemLog(Document):
    """System log entries"""
    timestamp = DateTimeField(default=datetime.datetime.now)
    level = StringField(choices=['INFO', 'WARNING', 'ERROR'], default='INFO')
    message = StringField(required=True)
    
    meta = {
        'collection': 'system_logs',
        'indexes': ['timestamp', 'level'],
        'ordering': ['-timestamp']
    }