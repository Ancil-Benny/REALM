import cv2
import os
import numpy as np


TRAINED_DIR = "trained"     
MODEL_FILENAME = os.path.join(TRAINED_DIR, "face_recognizer.yml")


CASCADE_PATH = cv2.data.haarcascades + "haarcascade_frontalface_default.xml"

def recognize_faces():
   
    if not os.path.exists(MODEL_FILENAME):
        print(f"Trained model '{MODEL_FILENAME}' not found. Run the training script first.")
        return


    recognizer = cv2.face.LBPHFaceRecognizer_create()
    recognizer.read(MODEL_FILENAME)
    label_map_path = os.path.join(TRAINED_DIR, "labels.npy")
    if os.path.exists(label_map_path):
        label_map = np.load(label_map_path, allow_pickle=True).item()
    else:
        print("Label mapping file not found. Recognition may not return names.")
        label_map = {}

   
    face_cascade = cv2.CascadeClassifier(CASCADE_PATH)

    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("Error: Could not access the webcam.")
        return

    print("Starting face recognition. Press 'q' to quit.")
    while True:
        ret, frame = cap.read()
        if not ret:
            break

 
        gray = cv2.cvtColor(frame, cv2.COLOR_BGR2GRAY)
  
        faces_rects = face_cascade.detectMultiScale(gray, scaleFactor=1.1, minNeighbors=5)

        for (x, y, w, h) in faces_rects:
            roi_gray = gray[y:y+h, x:x+w]
      
            label, confidence = recognizer.predict(roi_gray)
            name = label_map.get(label, "Unknown")
            text = f"{name} ({confidence:.1f})"
          
            cv2.rectangle(frame, (x, y), (x+w, y+h), (0, 255, 0), 2)
            cv2.putText(frame, text, (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (0, 255, 0), 2)

        cv2.imshow("Face Recognition", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()

if __name__ == "__main__":
    recognize_faces()