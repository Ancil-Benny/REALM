import os
import cv2
import pickle
from deepface import DeepFace



KNOWN_DIR = "known"


TRAINED_DIR = "trained"
EMBEDDINGS_FILE = os.path.join(TRAINED_DIR, "deepface_db.pkl")


os.makedirs(TRAINED_DIR, exist_ok=True)

def enroll_faces(known_dir):

    embeddings = {}
    
    for filename in os.listdir(known_dir):
        file_path = os.path.join(known_dir, filename)
        if os.path.isfile(file_path):
          
            base_name = os.path.splitext(filename)[0]
            person_name = base_name.split("_")[0]
            print(f"Processing '{filename}' for person '{person_name}'")
            
         
            img = cv2.imread(file_path)
            if img is None:
                print(f"Warning: Could not read image '{filename}'. Skipping.")
                continue

            
            try:
                rep = DeepFace.represent(img, model_name="Facenet", enforce_detection=False)
            except Exception as e:
                print(f"Error processing '{filename}': {str(e)}")
                continue

            if not rep:
                print(f"Warning: No embedding computed for '{filename}'.")
                continue

           
            embedding = rep[0]["embedding"]
            
            if person_name not in embeddings:
                embeddings[person_name] = []
            embeddings[person_name].append(embedding)
            print(f"Enrolled embedding for '{person_name}' from '{filename}'.")
    
    return embeddings

def main():
    embeddings = enroll_faces(KNOWN_DIR)
    if not embeddings:
        print("No valid face embeddings were computed. Exiting.")
        return

    with open(EMBEDDINGS_FILE, "wb") as f:
        pickle.dump(embeddings, f)
    print(f"Enrollment complete. Saved embeddings for {len(embeddings)} person(s) into '{EMBEDDINGS_FILE}'.")

if __name__ == "__main__":
    main()