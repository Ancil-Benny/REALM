import os
import csv
import datetime
import json
import traceback
from output_manager import output_manager

def extract_json_from_string(text):
    """Extract JSON from a string that might contain other text."""
    try:
        # Try to parse the entire string as JSON
        return json.loads(text)
    except json.JSONDecodeError:
        # If that fails, try to find JSON within the string
        try:
            # Look for content between triple backticks
            import re
            json_match = re.search(r'```json\s*([\s\S]*?)\s*```', text)
            if json_match:
                return json.loads(json_match.group(1))
                
            # Try to find anything that looks like JSON array
            json_match = re.search(r'\[\s*\{[\s\S]*\}\s*\]', text)
            if json_match:
                return json.loads(json_match.group(0))
                
            # As a last resort, try to find anything that looks like JSON object
            json_match = re.search(r'\{\s*"[\s\S]*\}', text)
            if json_match:
                return json.loads(json_match.group(0))
        except Exception:
            pass
    
    # If we get here, we couldn't extract valid JSON
    raise ValueError("Could not extract valid JSON from the response")

def save_analysis_results(analysis_result, known_person_ids):
    """
    Save analysis results to a single CSV file in the organized directory structure.
    
    Args:
        analysis_result: Either a JSON string (from v0) or already parsed JSON (from v2)
        known_person_ids: Dictionary mapping person names to IDs
    """
    analysis_timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    csv_file = output_manager.get_csv_path()
    file_exists = os.path.isfile(csv_file)

    # Create parent directory if it doesn't exist
    os.makedirs(os.path.dirname(csv_file), exist_ok=True)

    # Create CSV writer
    with open(csv_file, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        # Updated header to reflect flattened object data
        if not file_exists:
            writer.writerow([
                "Timestamp",
                "ID",
                "Name",
                "Object-Name",
                "Color",
                "Category", 
                "Brand",
                "Extra"
            ])

        # Parse the analysis result - handling both string (v0) and parsed JSON (v2)
        try:
            if isinstance(analysis_result, str):
                # This is from v0 - need to extract JSON from string
                analysis_json = extract_json_from_string(analysis_result)
            else:
                # This is from v2 - already parsed JSON
                analysis_json = analysis_result
                
            # Handle both formats - list of persons or results containing a list
            if isinstance(analysis_json, dict) and "results" in analysis_json:
                entries = analysis_json["results"]
            elif isinstance(analysis_json, list):
                entries = analysis_json
            else:
                entries = [analysis_json]  # Wrap single object in list
                
        except Exception as e:
            output_manager.log_error("Error parsing analysis result", e)
            traceback.print_exc()
            entries = []

        # Write entries to CSV
        for entry in entries:
            person_name = entry.get("person", "unknown")
            person_id = known_person_ids.get(person_name, -1) if person_name.lower() != "unknown" else -1
            objects = entry.get("objects", [])
            if not objects:
                # Write a single row if no objects
                writer.writerow([analysis_timestamp, person_id, person_name, "", "", "", "", ""])
            else:
                for obj in objects:
                    object_name = obj.get("name", "")
                    props = obj.get("properties", {})
                    color = props.get("color", "")
                    category = props.get("category", "")
                    brand = props.get("brand", "")
                    extra = props.get("extra", "")
                    writer.writerow([
                        analysis_timestamp,
                        person_id,
                        person_name,
                        object_name,
                        color,
                        category,
                        brand,
                        extra
                    ])
    
    # Log that we saved the analysis results
    output_manager.log_system(f"Analysis results saved to CSV: {csv_file}")
    return csv_file