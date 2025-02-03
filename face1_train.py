import cv2
import os
import numpy as np


KNOWN_FACES_DIR = "known"   
TRAINED_DIR = "trained"     
MODEL_FILENAME = os.path.join(TRAINED_DIR, "face_recognizer.yml")

CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

def load_known_faces(known_dir):
 
    faces = []
    labels = []
    label_dict = {}
    current_label = 0

    for filename in os.listdir(known_dir):
        file_path = os.path.join(known_dir, filename)
        if os.path.isfile(file_path):
          
            person_name = os.path.splitext(filename)[0]

            if person_name not in label_dict:
                label_dict[person_name] = current_label
                current_label += 1

     
            image = cv2.imread(file_path, cv2.IMREAD_GRAYSCALE)
            if image is None:
                print(f"Warning: Unable to read image {file_path}")
                continue

       
            face_cascade = cv2.CascadeClassifier(CASCADE_PATH)
            faces_rects = face_cascade.detectMultiScale(image, scaleFactor=1.1, minNeighbors=5)
            if len(faces_rects) == 0:
            
                roi = image
            else:
             
                (x, y, w, h) = faces_rects[0]
                roi = image[y:y+h, x:x+w]

            faces.append(roi)
            labels.append(label_dict[person_name])
            print(f"Loaded face for '{person_name}' from {filename}")

   
    return faces, labels, {v: k for k, v in label_dict.items()}

def train_model():
   
    os.makedirs(TRAINED_DIR, exist_ok=True)

    faces, labels, label_map = load_known_faces(KNOWN_FACES_DIR)
    if len(faces) == 0:
        print("No faces found in the known directory. ")
        return

   
    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.train(faces, np.array(labels))
    recognizer.write(MODEL_FILENAME)
    print(f"Model trained using {len(faces)} faces and saved to '{MODEL_FILENAME}'")

 
    label_map_path = os.path.join(TRAINED_DIR, "labels.npy")
    np.save(label_map_path, label_map)
    print(f"Saved label mapping to '{label_map_path}'")

if __name__ == "__main__":
    train_model()