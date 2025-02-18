import os
import csv
import datetime
import json
from v3 import extract_json

def save_analysis_results(analysis_result, known_person_ids, results_folder):
    analysis_timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    csv_file = os.path.join(results_folder, "analysis_results.csv")
    file_exists = os.path.isfile(csv_file)

    with open(csv_file, mode="a", newline="", encoding="utf-8") as f:
        writer = csv.writer(f)
        # Updated header to reflect flattened object data
        if not file_exists:
            writer.writerow([
                "Date",
                "ID",
                "Name",
                "Object-Name",
                "Color",
                "Category",
                "Brand",
                "Extra"
            ])

        try:
            analysis_json = extract_json(analysis_result)
            entries = analysis_json if isinstance(analysis_json, list) else [analysis_json]
        except Exception as e:
            print("Error parsing analysis result:", e)
            entries = []

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