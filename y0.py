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
import time
import shutil
import threading
import queue
from collections import deque
from v2 import analyze_image
from analysis_utils import save_analysis_results
from output_manager import output_manager

warnings.filterwarnings('ignore', category=RuntimeWarning)

# Main code begins
device = "cuda:0" if torch.cuda.is_available() else "cpu"
print(f"Running on device: {device}")

# ----------------- Face Recognition Setup -----------------
output_manager.log_system(f"System initialized on device: {device}")
output_manager.log_system("Initializing face recognition system")

face_mtcnn = MTCNN(keep_all=True, device=device)
face_model = InceptionResnetV1(pretrained='vggface2').eval()

def load_known_embeddings(known_faces_dir='dataset/known_faces'):
    known_embeddings = {}
    known_ids = {}
    if not os.path.isdir(known_faces_dir):
        output_manager.log_warning(f"Known faces directory {known_faces_dir} does not exist.")
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
                output_manager.log_warning(f"Could not read image: {image_path}")
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
            known_ids[person_name] = counter
            output_manager.log_system(f"Loaded face embedding for person: {person_name} (ID: {counter})")
            counter += 1
        else:
            output_manager.log_warning(f"No valid embeddings found for {person_name}")
    
    output_manager.log_system(f"Loaded {len(known_embeddings)} known face embeddings")
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
            output_manager.log_error(f"Error matching {person}", e)
    return matched_person

def perform_face_recognition(image):
    pil_image = Image.fromarray(cv2.cvtColor(image, cv2.COLOR_BGR2RGB))
    boxes, _ = face_mtcnn.detect(pil_image)
    recognized_faces = []
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
                recognized_faces.append((recognized_person, (x1, y1, x2, y2)))
    return image, recognized_faces

known_embeddings, known_person_ids = load_known_embeddings('dataset/known_faces')
# ----------------- End Face Recognition Setup -----------------

# Load YOLO model
output_manager.log_system("Loading YOLO model")
model = YOLO("yolo_models/yolo11n.pt")
model.model.to(device)

# Setup webcam capture
output_manager.log_system("Initializing webcam")
cap = cv2.VideoCapture(0)
if not cap.isOpened():
    output_manager.log_error("Could not open webcam", None)
    print("Error: Could not open webcam.")
    exit(1)

cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)

# Setup display window
window_name = "REALM"
cv2.namedWindow(window_name)
cv2.resizeWindow(window_name, 800, 600)

# Classes to detect (person, backpack, umbrella, handbag, etc.)
classes_to_detect = [0, 24, 25, 26, 32, 34, 39, 41, 45, 63, 64, 65, 66, 67, 73, 76]

# Tracking variables
FORGET_FRAMES = 30
frame_count = 0
snapshot_count = 0
snapshot_tracker = {}  # Track objects we've already seen

output_manager.log_system("System ready - press 'q' to quit")
print("Press 'q' to quit.")

# Add these variables after your other initialization code
analysis_queue = queue.Queue()
analysis_in_progress = False
analysis_results = {}
MAX_ANALYSIS_QUEUE = 10  # Maximum number of pending analyses
last_analysis_time = 0
MIN_ANALYSIS_INTERVAL = 3.0  # Minimum seconds between analyses

# Create a separate thread for image analysis
def analysis_worker():
    global analysis_in_progress
    
    while True:
        try:
            # Get the next analysis task from the queue
            task = analysis_queue.get()
            if task is None:  # None is our signal to exit
                break
                
            snapshot_id, output_path, timestamp = task
            analysis_in_progress = True
            
            # Wait a moment to ensure file is fully written
            time.sleep(0.2)
            
            # Log the start of analysis
            output_manager.log_system(f"Starting analysis for snapshot {snapshot_id}")
            
            try:
                # Create a copy of the file to avoid handle conflicts
                analysis_copy = os.path.join(output_manager.dirs["images"], f"analysis_copy_{snapshot_id:03d}.jpg")
                shutil.copy2(output_path, analysis_copy)
                
                # Analyze the copy
                result, _ = analyze_image(analysis_copy, snapshot_id=snapshot_id, debug=True)
                
                # Add the analysis result to the consolidated file
                output_manager.append_analysis(
                    snapshot_id=snapshot_id,
                    timestamp=timestamp,
                    image_path=output_path,
                    analysis_result=result
                )
                
                # Save analysis results to CSV
                save_analysis_results(result, known_person_ids)
                
                # Store results for potential use
                analysis_results[snapshot_id] = result
                
                output_manager.log_system(f"Analysis complete for snapshot {snapshot_id}")
                print(f"Analysis complete for snapshot {snapshot_id}")
                
                # Clean up the copy
                try:
                    os.remove(analysis_copy)
                except Exception as cleanup_err:
                    print(f"Warning: Failed to clean up temporary file: {cleanup_err}")
                    
            except Exception as e:
                output_manager.log_error(f"Error during image analysis for snapshot {snapshot_id}", e)
                print(f"Error during image analysis: {e}")
                import traceback
                traceback.print_exc()
                
            finally:
                analysis_in_progress = False
                analysis_queue.task_done()
                
        except Exception as thread_error:
            print(f"Error in analysis worker thread: {thread_error}")
            time.sleep(1)  # Wait before retrying
            
# Start the worker thread
analysis_thread = threading.Thread(target=analysis_worker, daemon=True)
analysis_thread.start()

while cap.isOpened():
    ret, frame = cap.read()
    if not ret:
        output_manager.log_warning("Failed to grab frame.")
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
    snapshot_ids = []  # Track which IDs triggered the new snapshot
    trigger_classes = []  # Store class IDs that triggered the snapshot
    
    # Check for new objects - but only non-person objects trigger snapshots
    for i, tid in enumerate(track_ids):
        tid_int = int(tid)
        class_id = int(class_ids[i])
        
        if tid_int not in snapshot_tracker:
            # New object detected
            if class_id != 0:  # If it's NOT a person (class 0)
                new_snapshot = True
                snapshot_ids.append(tid_int)
                trigger_classes.append(class_id)
                print(f"New object ID {tid_int} (class {class_id}: {labels[i]}) will trigger snapshot")
        
        # Update the last seen frame for this object (all objects including persons)
        snapshot_tracker[tid_int] = frame_count

    # Clean up old entries in the snapshot tracker
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
        if int(class_ids[i]) != 0:  # If it's not a person
            cv2.rectangle(snapshot_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            snapshot_text = labels[i]
            (snap_text_width, snap_text_height), snap_baseline = cv2.getTextSize(snapshot_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(snapshot_frame, (x1, y1 - snap_text_height - snap_baseline), (x1 + snap_text_width, y1), (0, 0, 0), -1)
            cv2.putText(snapshot_frame, snapshot_text, (x1, y1 - snap_baseline), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)

    if new_snapshot:
        # Run face recognition on the snapshot frame
        snapshot_frame, recognized_faces = perform_face_recognition(snapshot_frame)
        snapshot_count += 1
        
        # Save snapshot to the images directory with sequential numbering
        output_path = output_manager.get_snapshot_path(snapshot_count)
        cv2.imwrite(output_path, snapshot_frame)
        
        # Prepare info about the triggering objects with their labels
        trigger_details = []
        for tid in snapshot_ids:
            # Find index of this ID in track_ids array
            idx = np.where(track_ids == tid)[0]
            if len(idx) > 0:
                i = idx[0]
                trigger_details.append(f"{int(tid)}({labels[i]})")
            else:
                trigger_details.append(f"{int(tid)}(unknown)")
                
        trigger_info = ", ".join(trigger_details)
        log_message = f"New snapshot {snapshot_count} triggered by object IDs: {trigger_info}"
        output_manager.log_system(log_message)
        print(f"{log_message}. Saved to {output_path}")

        # Create a metadata entry for this snapshot
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        metadata_entry = {
            "snapshot_id": snapshot_count,
            "timestamp": timestamp,
            "image_path": output_path,
            "trigger_objects": [int(id) for id in snapshot_ids],
            "people": [{"name": name, "box": box} for name, box in recognized_faces],
            "objects": []
        }
        
        # Add metadata about all detected objects
        for i in range(len(boxes)):
            obj_data = {
                "id": int(track_ids[i]),
                "label": labels[i],
                "box": boxes[i].tolist(),
                "confidence": float(confidences[i]),
                "class_id": int(class_ids[i])
            }
            metadata_entry["objects"].append(obj_data)
            
        # Append metadata to the consolidated file
        output_manager.append_metadata(metadata_entry)

        # Check if we should queue this snapshot for analysis
        current_time = time.time()
        if (current_time - last_analysis_time >= MIN_ANALYSIS_INTERVAL and 
            analysis_queue.qsize() < MAX_ANALYSIS_QUEUE):
            
            # Queue the snapshot for analysis in a separate thread
            analysis_queue.put((snapshot_count, output_path, timestamp))
            last_analysis_time = current_time
            print(f"Queued snapshot {snapshot_count} for analysis. Queue size: {analysis_queue.qsize()}")
        else:
            print(f"Skipping analysis for snapshot {snapshot_count} (throttling)")
            output_manager.log_system(f"Analysis skipped for snapshot {snapshot_count} due to throttling")

    cv2.imshow(window_name, live_frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        output_manager.log_system("User requested exit (pressed 'q')")
        break

# Clean up resources
cap.release()
cv2.destroyAllWindows()
# Log final status to file (not MongoDB)
output_manager.log_system(f"Session ended. Processed {frame_count} frames, captured {snapshot_count} snapshots.")

# Give a moment for any pending operations to complete
time.sleep(0.5)

# Signal the worker thread to exit and wait for it to finish
analysis_queue.put(None)
analysis_thread.join(timeout=5.0)  # Wait up to 5 seconds for thread to finish

# Close the MongoDB connection last
output_manager.close()