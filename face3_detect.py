import os
import cv2
import pickle
import numpy as np
from deepface import DeepFace

   
    THRESHOLD = 0.7

    def load_embeddings(embeddings_path):
     
        if not os.path.exists(embeddings_path):
            raise FileNotFoundError(f"Embeddings file not found at '{embeddings_path}'")
        with open(embeddings_path, 'rb') as f:
            embeddings = pickle.load(f)
        return embeddings

    def compute_embedding(image):
  
        try:
          
            rep = DeepFace.represent(image, model_name="Facenet", enforce_detection=False)
        except Exception as e:
            print(f"Error computing embedding: {str(e)}")
            return None

        if rep and isinstance(rep, list) and len(rep) > 0:
            return rep[0].get("embedding")
        else:
            print("No embedding computed for the provided image.")
            return None

    def euclidean_distance(emb1, emb2):
        """
        Computes the Euclidean distance between two embedding vectors.
        
        Args:
            emb1 (list or np.ndarray): First embedding vector.
            emb2 (list or np.ndarray): Second embedding vector.
            
        Returns:
            float: The Euclidean distance.
        """
        emb1 = np.array(emb1)
        emb2 = np.array(emb2)
        return np.linalg.norm(emb1 - emb2)

    def detect_face(image_path, embeddings, threshold=THRESHOLD):
        """
        Detects the person in the input image by comparing its embedding with stored embeddings.
        
        Args:
            image_path (str): Path to the image for face detection.
            embeddings (dict): Dictionary mapping person names to saved embedding vectors.
            threshold (float): Distance threshold for recognizing a face.
            
        Returns:
            str: The recognized person's name or 'Unknown' if no match is found.
        """
        if not os.path.isfile(image_path):
            raise FileNotFoundError(f"Image file not found at '{image_path}'")

      
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Could not read the image from '{image_path}'")

      
        embedding = compute_embedding(img)
        if embedding is None:
            return "Unknown"

        best_match = None
        best_distance = float("inf")

     
        for person_name, emb_list in embeddings.items():
            for saved_emb in emb_list:
                distance = euclidean_distance(embedding, saved_emb)
                if distance < best_distance:
                    best_distance = distance
                    best_match = person_name

        print(f"Best match: {best_match if best_match is not None else 'None'} with distance {best_distance:.3f}")
        if best_distance <= threshold:
            return best_match
        return "Unknown"

    def main():
       
        import argparse

        parser = argparse.ArgumentParser(description="Detect face using saved embeddings")
        parser.add_argument("image_path", type=str, help="Path to the input image for face detection.")
        parser.add_argument("--embeddings_path", type=str, default=os.path.join("trained", "deepface_db.pkl"),
                            help="Path to the saved embeddings pickle file (default: trained/deepface_db.pkl)")
        parser.add_argument("--threshold", type=float, default=THRESHOLD, help="Distance threshold for recognition.")
        args = parser.parse_args()

        try:
            embeddings = load_embeddings(args.embeddings_path)
        except Exception as e:
            print(f"Error loading embeddings: {str(e)}")
            return

        try:
            result = detect_face(args.image_path, embeddings, threshold=args.threshold)
        except Exception as e:
            print(f"Error during face detection: {str(e)}")
            return

        print(f"Detected face: {result}")

    if __name__ == "__main__":
        main()