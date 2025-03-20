import datetime
import traceback
from models import VisionAnalysis, PersonWithObjects, DetectedObject, ObjectProperty, SystemLog
from mongodb_config import initialize_db, close_db

class DBService:
    """Service for database operations"""
    
    def __init__(self):
        """Initialize the database service"""
        self.db_available = initialize_db()
        self.is_closing = False
    
    def ensure_connection(self):
        """Ensure MongoDB connection is active"""
        if self.is_closing:
            return False
            
        if not self.db_available:
            # Try to reconnect
            self.db_available = initialize_db()
        return self.db_available
    
    def save_analysis(self, snapshot_id, timestamp, image_path, analysis_result):
        """Save analysis results to MongoDB"""
        if not self.ensure_connection():
            return False
        
        try:
            # Convert string timestamp to datetime if needed
            if isinstance(timestamp, str):
                try:
                    timestamp = datetime.datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
                except:
                    timestamp = datetime.datetime.now()
            
            # Create the VisionAnalysis document
            analysis = VisionAnalysis(
                snapshot_id=snapshot_id,
                timestamp=timestamp,
                image_path=image_path,
                raw_data=analysis_result
            )
            
            # Process and structure the analysis result
            structured_results = []
            
            # Handle different formats of analysis_result
            if isinstance(analysis_result, list):
                entries = analysis_result
            elif isinstance(analysis_result, dict) and "results" in analysis_result:
                entries = analysis_result["results"]
            else:
                entries = [analysis_result]
            
            for entry in entries:
                person_name = entry.get("person", "unknown")
                objects_data = entry.get("objects", [])
                
                # Create person with objects entry
                person_entry = PersonWithObjects(person=person_name)
                detected_objects = []
                
                for obj in objects_data:
                    obj_name = obj.get("name", "")
                    props = obj.get("properties", {})
                    
                    # Create object properties
                    obj_props = ObjectProperty(
                        color=props.get("color", ""),
                        category=props.get("category", ""),
                        brand=props.get("brand", ""),
                        extra=props.get("extra", "")
                    )
                    
                    # Create detected object
                    detected_obj = DetectedObject(
                        name=obj_name,
                        properties=obj_props
                    )
                    
                    detected_objects.append(detected_obj)
                
                person_entry.objects = detected_objects
                structured_results.append(person_entry)
            
            # Add structured results
            analysis.analysis_result = structured_results
            
            # Save to database
            analysis.save()
            return True
        
        except Exception as e:
            print(f"Error saving to MongoDB: {e}")
            traceback.print_exc()
            return False
    
    def log_system_event(self, message, level="INFO"):
        """Log a system event to MongoDB"""
        if not self.ensure_connection():
            # Just log to console if MongoDB is not available
            print(f"[{level}] {message} (not saved to MongoDB)")
            return False
        
        try:
            log = SystemLog(
                message=message,
                level=level
            )
            log.save()
            return True
        except Exception as e:
            print(f"Error logging system event: {e}")
            return False
    
    def close(self):
        """Close database connection"""
        self.is_closing = True
        result = close_db()
        return result

# Create a global instance
db_service = DBService()