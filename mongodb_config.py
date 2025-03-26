import os
from mongoengine import connect, disconnect
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# MongoDB connection settings
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
MONGO_DB_NAME = os.getenv("MONGO_DB_NAME", "REALM")

# Keep track of connection state
_connection = None
_is_closed = False

def initialize_db():
    """Initialize MongoDB connection"""
    global _connection, _is_closed
    
    try:
        if _is_closed:
            # Don't reconnect if we've explicitly closed
            return False
            
        # Connect to MongoDB
        _connection = connect(db=MONGO_DB_NAME, host=MONGO_URI, alias='default')
        _is_closed = False
        return True
    except Exception as e:
        print(f"Error connecting to MongoDB: {e}")
        _connection = None
        return False

def close_db():
    """Close MongoDB connection"""
    global _connection, _is_closed
    
    if _is_closed:
        # Already closed
        return True
    
    try:
        disconnect()
        _connection = None
        _is_closed = True
        return True
    except Exception as e:
        print(f"Error disconnecting from MongoDB: {e}")
        return False