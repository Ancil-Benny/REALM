import datetime
import traceback
from models import DetectedItem, SystemLog
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
        """Save analysis results to MongoDB with simplified structure"""
        if not self.ensure_connection():
            return False
        
        try:
            # Convert string timestamp to datetime 
            if isinstance(timestamp, str):
                try:
                    timestamp = datetime.datetime.strptime(timestamp, "%Y-%m-%d %H:%M:%S")
                except:
                    timestamp = datetime.datetime.now()
            
            # Process and save the detected items
            saved_count = 0
            
            # Extract entries based on analysis result format
            if isinstance(analysis_result, list):
                entries = analysis_result
            elif isinstance(analysis_result, dict) and "results" in analysis_result:
                entries = analysis_result["results"]
            else:
                entries = [analysis_result]
            
            # Process each entry in the results
            for entry in entries:
                person_name = entry.get("person", "Unknown")
                objects_data = entry.get("objects", [])
                
                # If no objects were found, still create an entry for the person
                if not objects_data:
                    detected_item = DetectedItem(
                        snapshot_id=snapshot_id,
                        person=person_name,
                        person_id=-1,  # Unknown person ID
                        timestamp=timestamp,
                        image_path=image_path,
                        location="CAM ID 1, Main Room" 
                    )
                    detected_item.save()
                    saved_count += 1
                    continue
                
                # Process each object for this person
                for obj in objects_data:
                    obj_name = obj.get("name", "")
                    props = obj.get("properties", {})
                    
                    # Create a flattened document with streamlined fields
                    detected_item = DetectedItem(
                        snapshot_id=snapshot_id,
                        person=person_name,
                        person_id=-1,  # Default to -1, can be updated if known
                        timestamp=timestamp,
                        image_path=image_path,
                        name=obj_name,
                        category=props.get("category", ""),
                        color=props.get("color", ""),
                        brand=props.get("brand", ""),
                        details=props.get("extra", ""),
                        location="CAM ID 1, location_name",
                        object_id=obj.get("id", None)
                    )
                    
                    # Save to database
                    detected_item.save()
                    saved_count += 1
            
            print(f"Saved {saved_count} objects to MongoDB for snapshot {snapshot_id}")
            return saved_count > 0
        
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
    
    def search_items(self, query_params, limit=20):
        """
        Search for items with improved query structure
        
        Args:
            query_params: Dict of search parameters
            limit: Maximum results to return
        """
        if not self.ensure_connection():
            return []
            
        try:
            # Build query
            query = {}
            
            # Add basic search fields
            if "name" in query_params and query_params["name"]:
                query["name"] = {"$regex": query_params["name"], "$options": "i"}
            
            if "category" in query_params and query_params["category"]:
                query["category"] = {"$regex": query_params["category"], "$options": "i"}
                
            if "color" in query_params and query_params["color"]:
                query["color"] = {"$regex": query_params["color"], "$options": "i"}
                
            if "brand" in query_params and query_params["brand"]:
                query["brand"] = {"$regex": query_params["brand"], "$options": "i"}
                
            if "person" in query_params and query_params["person"]:
                query["person"] = {"$regex": query_params["person"], "$options": "i"}
            
            if "snapshot_id" in query_params and query_params["snapshot_id"]:
                query["snapshot_id"] = int(query_params["snapshot_id"])
            
            # Handle date range
            if "date" in query_params and query_params["date"]:
                search_date = datetime.datetime.strptime(query_params["date"], "%Y-%m-%d")
                next_day = search_date + datetime.timedelta(days=1)
                query["timestamp"] = {"$gte": search_date, "$lt": next_day}
            
            # Execute search
            items = DetectedItem.objects(__raw__=query).order_by("-timestamp").limit(limit)
            return items
            
        except Exception as e:
            print(f"Error searching items: {e}")
            return []
    
    def close(self):
        """Close database connection"""
        self.is_closing = True
        result = close_db()
        return result

# Create a global instance
db_service = DBService()