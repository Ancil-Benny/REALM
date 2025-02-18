import cv2
import os
import torch
import numpy as np
from ultralytics import YOLO
from facenet_pytorch import MTCNN, InceptionResnetV1
from PIL import Image
import warnings
import csv
import datetime
import json
from v1 import analyze_image, extract_json 
from analysis_utils import save_analysis_results

warnings.filterwarnings('ignore', category=RuntimeWarning)

device = "cuda:0" if torch.cuda.is_available() else "cpu"
print("Running on device:", device)

# ----------------- Face Recognition Setup -----------------
face_mtcnn = MTCNN(keep_all=True, device=device)
face_model = InceptionResnetV1(pretrained='vggface2').eval()

def load_known_embeddings(known_faces_dir='dataset/known_faces'):
    known_embeddings = {}
    known_ids = {}
    if not os.path.isdir(known_faces_dir):
        print(f"Known faces directory {known_faces_dir} does not exist.")
        return known_embeddings, known_ids
    counter = 1
    for person_name in os.listdir(known_faces_dir):
        person_path = os.path.join(known_faces_dir, person_name)
        if not os.path.isdir(person_path):
            continue
        embeddings = []
        for image_name in os.listdir(person_path):
            image_path = os.path.join(person_path, image_name)
            image = cv2.imread(image_path)
            if image is None:
                print(f"Could not read image: {image_path}")
                continue
            pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
            boxes, _ = face_mtcnn.detect(pil_image)
            if boxes is None:
                continue
            extracted = face_mtcnn.extract(pil_image, boxes, save_path=None)
            if extracted is None or len(extracted) == 0:
                continue
            face_tensor = extracted[0]
            with torch.no_grad():
                embedding = face_model(face_tensor.unsqueeze(0))
            emb_np = embedding[0].cpu().numpy()
            if not np.isnan(emb_np).any():
                embeddings.append(emb_np)
        if embeddings:
            known_embeddings[person_name] = np.mean(embeddings, axis=0)
            # Assign a unique ID for the person
            known_ids[person_name] = counter
            counter += 1
        else:
            print(f"No valid embeddings found for {person_name}")
    return known_embeddings, known_ids

def match_face(face_embedding, known_embeddings, threshold=1.0):
    min_distance = float('inf')
    matched_person = "Unknown"
    for person, known_emb in known_embeddings.items():
        try:
            distance = np.linalg.norm(face_embedding - known_emb)
            if distance < min_distance and distance < threshold:
                min_distance = distance
                matched_person = person
        except Exception as e:
            print(f"Error matching {person}: {e}")
    return matched_person

def perform_face_recognition(image):
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    boxes, _ = face_mtcnn.detect(pil_image)
    if boxes is not None:
        extracted_faces = face_mtcnn.extract(pil_image, boxes, save_path=None)
        if extracted_faces is not None:
            for face_tensor, box in zip(extracted_faces, boxes):
                with torch.no_grad():
                    embedding = face_model(face_tensor.unsqueeze(0))
                recognized_person = match_face(embedding[0].cpu().numpy(), known_embeddings)
                x1, y1, x2, y2 = map(int, box)
                # Draw bounding box
                cv2.rectangle(image, (x1, y1), (x2, y2), (0, 0, 255), 2)
                # Prepare label and compute its size
                label = recognized_person
                (text_width, text_height), baseline = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.9, 2)
                # Draw filled rectangle for label background
                cv2.rectangle(image, (x1, y1 - text_height - baseline), (x1 + text_width, y1), (0, 0, 0), -1)
                # Put text over the background
                cv2.putText(image, label, (x1, y1 - baseline), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 255, 255), 2)
    return image

known_embeddings, known_person_ids = load_known_embeddings('dataset/known_faces')
# ----------------- End Face Recognition Setup -----------------

model = YOLO("yolo_models/yolo11x.pt")
model.model.to(device)

cap = cv2.VideoCapture(0)
if not cap.isOpened():
    print("Error: Could not open webcam.")
    exit(1)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

window_name = "REALM"
cv2.namedWindow(window_name)
cv2.resizeWindow(window_name, 800, 600)

classes_to_detect = [0, 24, 25, 26, 32, 34, 39, 41, 45, 63, 64, 65, 66, 67, 73, 76]
results_folder = "results"
os.makedirs(results_folder, exist_ok=True)

FORGET_FRAMES = 30
frame_count = 0
snapshot_count = 0
snapshot_tracker = {}

print("Press 'q' to quit.")
while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        print("Failed to grab frame.")
        break

    frame_count += 1

    results = model.track(
        frame,
        persist=True,
        classes=classes_to_detect,
        conf=0.7,
        iou=0.5,
        tracker="bytetrack.yaml",
        verbose=False
    )

    live_frame = frame.copy()
    snapshot_frame = frame.copy()

    if not results or len(results) == 0:
        snapshot_tracker = {tid: last_seen for tid, last_seen in snapshot_tracker.items()
                            if frame_count - last_seen < FORGET_FRAMES}
        cv2.imshow(window_name, live_frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        continue

    result = results[0]

    if (not hasattr(result.boxes, 'id') or result.boxes.id is None or len(result.boxes.id) == 0 
        or result.boxes.xyxy is None):
        snapshot_tracker = {tid: last_seen for tid, last_seen in snapshot_tracker.items()
                            if frame_count - last_seen < FORGET_FRAMES}
        cv2.imshow(window_name, live_frame)
        if cv2.waitKey(1) & 0xFF == ord("q"):
            break
        continue

    track_ids = result.boxes.id.cpu().numpy() if hasattr(result.boxes, 'id') else np.array([])
    boxes = result.boxes.xyxy.cpu().numpy() 
    confidences = result.boxes.conf.cpu().numpy() if result.boxes.conf is not None else np.array([])
    class_ids = result.boxes.cls.cpu().numpy() if hasattr(result.boxes, 'cls') else np.array([])

    labels = []
    for cls in class_ids:
        label = model.names[int(cls)] if hasattr(model, "names") and int(cls) in model.names else f"Class:{int(cls)}"
        labels.append(label)

    new_snapshot = False
    for tid in track_ids:
        if int(tid) not in snapshot_tracker:
            new_snapshot = True
            snapshot_tracker[int(tid)] = frame_count
        else:
            snapshot_tracker[int(tid)] = frame_count

    snapshot_tracker = {tid: last_seen for tid, last_seen in snapshot_tracker.items()
                        if frame_count - last_seen < FORGET_FRAMES}

    for i in range(len(boxes)):
        x1, y1, x2, y2 = map(int, boxes[i])
        # Construct live text with details for live camera feed
        live_text = f"{labels[i]} | ID: {int(track_ids[i])} | Index: {int(class_ids[i])} | {confidences[i]:.2f}"
        cv2.rectangle(live_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
        (text_width, text_height), baseline = cv2.getTextSize(live_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
        cv2.rectangle(live_frame, (x1, y1 - text_height - baseline), (x1 + text_width, y1), (0, 0, 0), -1)
        cv2.putText(live_frame, live_text, (x1, y1 - baseline), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

        # For snapshot frame, only use the label or class name
        if int(class_ids[i]) != 0:
            cv2.rectangle(snapshot_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            snapshot_text = labels[i]
            (snap_text_width, snap_text_height), snap_baseline = cv2.getTextSize(snapshot_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(snapshot_frame, (x1, y1 - snap_text_height - snap_baseline), (x1 + snap_text_width, y1), (0, 0, 0), -1)
            cv2.putText(snapshot_frame, snapshot_text, (x1, y1 - snap_baseline), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    if new_snapshot:
        # Run face recognition on the snapshot frame
        snapshot_frame = perform_face_recognition(snapshot_frame)
        snapshot_count += 1
        output_path = os.path.join(results_folder, f"snapshot_{snapshot_count:03d}.jpg")
        cv2.imwrite(output_path, snapshot_frame)
        print(f"New object detected. Snapshot saved to {output_path}")

        detected_objects = []
        for i in range(len(boxes)):
            obj = {
                "label": labels[i],
                "box": boxes[i].tolist(),
                "properties": {}
            }
            detected_objects.append(obj)

        analysis_result = analyze_image(output_path)
        print("Analysis result:", analysis_result)

        # Save analysis results to CSV
        save_analysis_results(analysis_result, known_person_ids, results_folder)
    
    cv2.imshow(window_name, live_frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()