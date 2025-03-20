import os
import json
import datetime
import shutil
from typing import Dict, Any, Optional

# Import MongoDB service
try:
    from db_service import db_service
    DB_AVAILABLE = True
except ImportError:
    DB_AVAILABLE = False
    print("Warning: MongoDB service not available. Only file-based storage will be used.")

class OutputManager:
    """Centralized manager for all output files and directories"""
    
    def __init__(self, base_dir="results"):
        """Initialize the output manager with base directory"""
        self.base_dir = base_dir
        self.dirs = {
            "images": os.path.join(base_dir, "images"),
            "metadata": os.path.join(base_dir, "metadata"),
            "analysis": os.path.join(base_dir, "analysis"),
            "logs": os.path.join(base_dir, "logs"),
            "csv": os.path.join(base_dir, "csv")
        }
        self.log_files = {
            "system": os.path.join(self.dirs["logs"], "system.log"),
            "api": os.path.join(self.dirs["logs"], "api.log"),
            "error": os.path.join(self.dirs["logs"], "error.log")
        }
        self.csv_file = os.path.join(self.dirs["csv"], "analysis_results.csv")
        self.metadata_file = os.path.join(self.dirs["metadata"], "metadata.json")
        self.analysis_file = os.path.join(self.dirs["analysis"], "analysis.json")
        self._ensure_directories()
        self._initialize_files()
        
        # Log MongoDB status
        if DB_AVAILABLE:
            self.log_system("MongoDB service initialized and available")
        else:
            self.log_warning("MongoDB service not available - using file storage only")
        
    def _ensure_directories(self):
        """Create the directory structure if it doesn't exist"""
        for dir_path in self.dirs.values():
            os.makedirs(dir_path, exist_ok=True)
    
    def _initialize_files(self):
        """Initialize consolidated files if they don't exist"""
        # Initialize metadata file
        if not os.path.exists(self.metadata_file):
            with open(self.metadata_file, 'w') as f:
                json.dump([], f)
                
        # Initialize analysis file
        if not os.path.exists(self.analysis_file):
            with open(self.analysis_file, 'w') as f:
                json.dump([], f)
                
        # Initialize system log with session marker
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.log_files["system"], "a") as f:
            f.write("\n" + "="*50 + "\n")
            f.write(f"SESSION START: {timestamp}\n")
            f.write("="*50 + "\n\n")
            
    def get_snapshot_path(self, snapshot_id):
        """Get path for a snapshot image"""
        return os.path.join(self.dirs["images"], f"snapshot_{snapshot_id:03d}.jpg")
    
    def get_metadata_path(self):
        """Get path for the consolidated metadata JSON file"""
        return self.metadata_file
    
    def get_analysis_path(self, snapshot_id=None):
        """Get path for an analysis output"""
        if snapshot_id is not None:
            # Return path in the format used by append_analysis
            return snapshot_id
        return self.analysis_file
    
    def append_metadata(self, metadata_entry):
        """Append a metadata entry to the consolidated file"""
        try:
            with open(self.metadata_file, 'r') as f:
                metadata_list = json.load(f)
            
            metadata_list.append(metadata_entry)
            
            with open(self.metadata_file, 'w') as f:
                json.dump(metadata_list, f, indent=2)
                
            return True
        except Exception as e:
            self.log_error(f"Error updating metadata file", e)
            return False
            
    def append_analysis(self, snapshot_id, timestamp, image_path, analysis_result):
        """Append an analysis entry to the consolidated file and MongoDB"""
        # First, save to file system (existing behavior)
        file_saved = False
        try:
            analysis_entry = {
                "snapshot_id": snapshot_id,
                "timestamp": timestamp,
                "image_path": image_path,
                "analysis_result": analysis_result
            }
            
            with open(self.analysis_file, 'r') as f:
                analysis_list = json.load(f)
            
            analysis_list.append(analysis_entry)
            
            with open(self.analysis_file, 'w') as f:
                json.dump(analysis_list, f, indent=2)
                
            file_saved = True
        except Exception as e:
            self.log_error(f"Error updating analysis file", e)
        
        # Then, save to MongoDB if available
        db_saved = False
        if DB_AVAILABLE:
            try:
                db_saved = db_service.save_analysis(
                    snapshot_id=snapshot_id,
                    timestamp=timestamp,
                    image_path=image_path,
                    analysis_result=analysis_result
                )
                
                if db_saved:
                    self.log_system(f"Analysis data for snapshot {snapshot_id} saved to MongoDB")
                else:
                    self.log_warning(f"Failed to save analysis data for snapshot {snapshot_id} to MongoDB")
                    
            except Exception as e:
                self.log_error(f"Error saving to MongoDB", e)
                
        return file_saved or db_saved
    
    def log_system(self, message):
        """Log a system message to file and MongoDB if available"""
        # File logging
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.log_files["system"], "a") as f:
            f.write(f"[{timestamp}] [INFO] {message}\n")
        
        # MongoDB logging if available
        if DB_AVAILABLE:
            db_service.log_system_event(message, "INFO")
    
    def log_api_request(self, data: Dict[str, Any]):
        """Log API request details"""
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.log_files["api"], "a") as f:
            f.write(f"[{timestamp}] - {json.dumps(data, indent=2)}\n\n")
    
    def log_error(self, error_message, exception=None):
        """Log an error message and exception to file and MongoDB if available"""
        # File logging
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.log_files["error"], "a") as f:
            f.write(f"[{timestamp}] [ERROR] {error_message}\n")
            if exception:
                f.write(f"Exception: {str(exception)}\n")
                import traceback
                f.write(traceback.format_exc())
            f.write("\n")
        
        # MongoDB logging if available
        if DB_AVAILABLE:
            full_message = error_message
            if exception:
                full_message += f" - Exception: {str(exception)}"
            db_service.log_system_event(full_message, "ERROR")
    
    def log_warning(self, warning_message):
        """Log a warning message to file and MongoDB if available"""
        # File logging
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.log_files["system"], "a") as f:
            f.write(f"[{timestamp}] [WARNING] {warning_message}\n")
        
        # MongoDB logging if available
        if DB_AVAILABLE:
            db_service.log_system_event(warning_message, "WARNING")
    
    def save_json(self, path, data):
        """Save JSON data to a file"""
        with open(path, "w") as f:
            json.dump(data, f, indent=4)
    
    def get_csv_path(self):
        """Get the path to the CSV file"""
        return self.csv_file
    
    def cleanup_old_files(self, max_files=1000):
        """Clean up old files if there are too many"""
        for dir_name, dir_path in self.dirs.items():
            if dir_name == "images":  # Only cleanup individual image files
                files = sorted([os.path.join(dir_path, f) for f in os.listdir(dir_path)])
                if len(files) > max_files:
                    for old_file in files[:-max_files]:
                        try:
                            os.remove(old_file)
                            self.log_system(f"Removed old file: {old_file}")
                        except:
                            pass
    
    def close(self):
        """Close resources"""
        # First log the final closing message to file (this always works)
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        with open(self.log_files["system"], "a") as f:
            f.write(f"[{timestamp}] [INFO] Output manager closing - end of session\n")
        
        # Then close the MongoDB connection
        if DB_AVAILABLE:
            db_success = db_service.close()
            print("MongoDB connection closed")

# Initialize a global output manager
output_manager = OutputManager()