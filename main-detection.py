import cv2
import os
import torch
import numpy as np
import argparse
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
from vision import analyze_image
from analysis_utils import save_analysis_results
from output_manager import output_manager
import io
import base64
from PIL import Image as PILImage
import traceback
import random
import sys

warnings.filterwarnings('ignore', category=RuntimeWarning)

def parse_arguments():
    parser = argparse.ArgumentParser(description='REALM Vision Detection System')
    parser.add_argument('--mode', '-m', type=str, choices=['realtime', 'video'], default='realtime',
                       help='Detection mode: "realtime" for webcam or "video" for pre-recorded video')
    parser.add_argument('--video', '-v', type=str, 
                       help='Path to video file (required if mode is "video")')
    parser.add_argument('--no-display', action='store_true', default=False,
                       help='Run in headless mode without showing any windows')
    
    args = parser.parse_args()
    
    # Validate arguments
    if args.mode == 'video' and not args.video:
        parser.error('--video argument is required when mode is "video"')
    
    if args.mode == 'video' and not os.path.exists(args.video):
        parser.error(f'Video file does not exist: {args.video}')
    
    return args

# Create processed videos directory 
os.makedirs("results/processed_videos", exist_ok=True)

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

# Global variables for tracking
frame_count = 0
snapshot_count = 0
snapshot_tracker = {}  # Track objects we've already seen
FORGET_FRAMES = 45  # Increased for better tracking stability
analysis_queue = queue.Queue()
analysis_in_progress = False
analysis_results = {}
MAX_ANALYSIS_QUEUE = 10  # Maximum number of pending analyses
last_analysis_time = 0
MIN_ANALYSIS_INTERVAL = 5.0  # Minimum seconds between analyses

def analysis_worker():
    """Worker thread that handles image analysis without file handle conflicts"""
    while True:
        try:
            task = analysis_queue.get()
            if task is None:
                break
                
            snapshot_id, image_path, timestamp = task
            
            print(f"Starting analysis for snapshot {snapshot_id} from {image_path}")
            output_manager.log_system(f"Starting analysis for snapshot {snapshot_id}")
            
            try:
                img_data = None
                
                try:
                    time.sleep(1.5)
                    img = cv2.imread(image_path)
                    if img is not None and img.size > 0:
                        success, buffer = cv2.imencode(".jpg", img)
                        if success:
                            img_data = buffer.tobytes()
                except Exception as e:
                    print(f"OpenCV image loading failed: {e}")
                
                if img_data is None:
                    try:
                        time.sleep(0.5)
                        pil_img = PILImage.open(image_path)
                        img_byte_arr = io.BytesIO()
                        pil_img.save(img_byte_arr, format='JPEG')
                        img_data = img_byte_arr.getvalue()
                    except Exception as e:
                        print(f"PIL image loading failed: {e}")
                
                if img_data is None:
                    try:
                        time.sleep(1.0)
                        with open(image_path, 'rb') as f:
                            img_data = f.read()
                    except Exception as e:
                        print(f"Binary image loading failed: {e}")
                
                if img_data is None or len(img_data) == 0:
                    raise ValueError(f"Could not load image data from {image_path} using any method")
                
                base64_image = base64.b64encode(img_data).decode('utf-8')
                
                from knowledge_base import KnowledgeBase
                kb = KnowledgeBase()
                prompt = kb.build_prompt(None)
                
                try:
                    debug_prompt_path = os.path.join(output_manager.dirs["logs"], f"prompt_{snapshot_id}.txt")
                    with open(debug_prompt_path, 'w') as f:
                        f.write(prompt)
                except Exception as e:
                    print(f"Warning: Could not save debug prompt: {e}")
                
                from mistralai import Mistral
                client = Mistral(api_key=os.getenv("MISTRAL_API_KEY"))
                
                print(f"Sending image to API (base64 length: {len(base64_image)})")
                start_time = datetime.datetime.now()
                
                try:
                    messages = [
                        {"role": "user", "content": [
                            {"type": "text", "text": prompt},
                            {"type": "image_url", "image_url": f"data:image/jpeg;base64,{base64_image}"}
                        ]}
                    ]
                    
                    response = client.chat.complete(
                        model="pixtral-12b-2409",
                        messages=messages,
                        max_tokens=5000,
                        response_format={"type": "json_object"}
                    )
                    
                    end_time = datetime.datetime.now()
                    response_time_ms = (end_time - start_time).total_seconds() * 1000
                    
                    content = response.choices[0].message.content
                    
                    analysis_result = json.loads(content)
                    
                    formatted_output = json.dumps(analysis_result, indent=4)
                    
                    print(f"✓ Analysis successful! Response received in {response_time_ms:.0f}ms")
                    
                    unique_id = random.randint(10000, 99999)
                    timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
                    output_file = os.path.join(
                        output_manager.dirs["analysis"], 
                        f"analysis_{snapshot_id:03d}_{timestamp_str}_{unique_id}.json"
                    )
                    
                    try:
                        os.makedirs(os.path.dirname(output_file), exist_ok=True)
                        
                        temp_file = f"{output_file}.tmp"
                        with open(temp_file, 'w') as f:
                            f.write(formatted_output)
                        
                        if os.path.exists(temp_file) and os.path.getsize(temp_file) > 0:
                            if os.path.exists(output_file):
                                os.remove(output_file)
                            os.rename(temp_file, output_file)
                            print(f"Analysis saved to {output_file}")
                        else:
                            raise IOError(f"Temporary file {temp_file} was not created properly")
                            
                    except Exception as file_err:
                        print(f"Warning: Could not save analysis to {output_file}: {file_err}")
                        fallback_file = f"emergency_analysis_{snapshot_id}_{timestamp_str}.json"
                        print(f"Trying fallback location: {fallback_file}")
                        with open(fallback_file, 'w') as f:
                            f.write(formatted_output)
                    
                    try:
                        output_manager.append_analysis(
                            snapshot_id=snapshot_id,
                            timestamp=timestamp,
                            image_path=image_path,
                            analysis_result=analysis_result
                        )
                    except Exception as append_err:
                        print(f"Warning: Failed to append analysis to consolidated file: {append_err}")
                    
                    try:
                        from analysis_utils import save_analysis_results
                        save_analysis_results(analysis_result, known_person_ids)
                        print(f"Analysis results for snapshot {snapshot_id} saved to CSV")
                    except Exception as csv_err:
                        print(f"Warning: Failed to save analysis to CSV: {csv_err}")
                    
                    output_manager.log_system(f"Analysis complete for snapshot {snapshot_id}")
                    print(f"✓ Analysis complete for snapshot {snapshot_id}")
                    
                except Exception as api_err:
                    print(f"Mistral API error: {api_err}")
                    traceback.print_exc()
                    output_manager.log_error(f"Mistral API error for snapshot {snapshot_id}", api_err)
                
            except Exception as process_err:
                print(f"Error during image processing: {process_err}")
                traceback.print_exc()
                output_manager.log_error(f"Error processing image for snapshot {snapshot_id}", process_err)
                
            finally:
                analysis_queue.task_done()
                
        except Exception as worker_err:
            print(f"Critical error in analysis worker: {worker_err}")
            traceback.print_exc()
            time.sleep(1.0)
            
            if 'task' in locals() and task is not None:
                try:
                    if not hasattr(task, '_task_done'):
                        analysis_queue.task_done()
                        task._task_done = True
                except ValueError:
                    pass

def process_detection_source(source_type, args):
    global frame_count, snapshot_count, snapshot_tracker, last_analysis_time
    
    # Add video mode specific variables
    last_snapshot_frame = 0
    FRAME_INTERVAL = 0  # Will be set based on video properties
    
    if source_type == 'realtime':
        output_manager.log_system("Initializing webcam")
        cap = cv2.VideoCapture(0)
        if not cap.isOpened():
            output_manager.log_error("Could not open webcam", None)
            print("Error: Could not open webcam.")
            return
            
        cap.set(cv2.CAP_PROP_FRAME_WIDTH, 1280)
        cap.set(cv2.CAP_PROP_FRAME_HEIGHT, 720)
        
        output_video = None
        total_frames = float('inf')
        
    elif source_type == 'video':
        video_path = args.video
        output_manager.log_system(f"Opening video file: {video_path}")
        cap = cv2.VideoCapture(video_path)
        if not cap.isOpened():
            output_manager.log_error(f"Could not open video file: {video_path}", None)
            print(f"Error: Could not open video file: {video_path}")
            return
            
        fps = cap.get(cv2.CAP_PROP_FPS)
        width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
        
        # Calculate frame interval based on video properties - at least 90 frames between snapshots,
        # or roughly 3 seconds at 30fps
        FRAME_INTERVAL = max(90, int(fps * 3))
        output_manager.log_system(f"Video properties: {width}x{height}, {fps} fps, {total_frames} frames")
        output_manager.log_system(f"Frame interval for snapshot triggering: {FRAME_INTERVAL} frames")
        
        video_name = os.path.basename(video_path)
        base_name, ext = os.path.splitext(video_name)
        timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
        output_filename = f"{base_name}_processed_{timestamp}.mp4"
        output_path = os.path.join("results", "processed_videos", output_filename)
        
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        output_video = cv2.VideoWriter(output_path, fourcc, fps, (width, height))
        output_manager.log_system(f"Output video will be saved to: {output_path}")
    
    # Rest of the initialization code remains the same
    if not args.no_display:
        window_name = "REALM"
        cv2.namedWindow(window_name)
        cv2.resizeWindow(window_name, 800, 600)
    
    classes_to_detect = [0, 24, 25, 26, 32, 34, 39, 41, 45, 63, 64, 65, 66, 67, 73, 76]
    
    progress_interval = max(1, total_frames // 100)
    
    frame_count = 0
    start_time = time.time()
    
    # Add object frame counting for stability
    object_frame_counter = {}  # Track how many frames each object has been seen
    MIN_DETECTION_FRAMES = 3  # Only consider objects seen for at least this many frames
    
    output_manager.log_system(f"Starting detection using source: {source_type}")
    print(f"Starting detection. Press 'q' to quit.")
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            if source_type == 'video':
                output_manager.log_system("Reached end of video file")
                print("End of video reached.")
            else:
                output_manager.log_warning("Failed to grab frame from camera")
                print("Failed to grab frame from camera.")
            break
        
        frame_count += 1
        
        # Show progress for video mode
        if source_type == 'video' and frame_count % progress_interval == 0:
            progress = (frame_count / total_frames) * 100
            elapsed = time.time() - start_time
            estimated_total = elapsed / (frame_count / total_frames) if frame_count > 0 else 0
            remaining = max(0, estimated_total - elapsed)
            
            progress_str = f"Progress: {progress:.1f}% ({frame_count}/{total_frames}) | "
            time_str = f"Remaining: {int(remaining//60)}m {int(remaining%60)}s"
            
            if args.no_display:
                progress_bar = '█' * int(progress // 2) + '▒' * (50 - int(progress // 2))
                print(f"\r[{progress_bar}] {progress_str}{time_str}", end="")
            else:
                print(f"{progress_str}{time_str}")
        
        results = model.track(
            frame,
            persist=True,
            classes=classes_to_detect,
            conf=0.45,
            iou=0.3,
            tracker="bytetrack.yaml",
            verbose=False
        )
        
        live_frame = frame.copy()
        snapshot_frame = None
        
        if not results or len(results) == 0:
            snapshot_tracker = {tid: last_seen for tid, last_seen in snapshot_tracker.items()
                                if frame_count - last_seen < FORGET_FRAMES}
            
            # Also clean up the object frame counter
            object_frame_counter = {tid: count for tid, count in object_frame_counter.items()
                                   if tid in snapshot_tracker}
            
            if source_type == 'video' and output_video is not None:
                timestamp_str = f"Frame: {frame_count}/{total_frames}"
                cv2.putText(live_frame, timestamp_str, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                            0.7, (255, 255, 255), 2, cv2.LINE_AA)
                output_video.write(live_frame)
                
            if not args.no_display:
                cv2.imshow(window_name, live_frame)
                if cv2.waitKey(1) & 0xFF == ord("q"):
                    break
            continue
        
        result = results[0]
        
        if (not hasattr(result.boxes, 'id') or result.boxes.id is None or len(result.boxes.id) == 0 
            or result.boxes.xyxy is None):
            snapshot_tracker = {tid: last_seen for tid, last_seen in snapshot_tracker.items()
                                if frame_count - last_seen < FORGET_FRAMES}
            
            # Also clean up the object frame counter
            object_frame_counter = {tid: count for tid, count in object_frame_counter.items()
                                   if tid in snapshot_tracker}
            
            if source_type == 'video' and output_video is not None:
                timestamp_str = f"Frame: {frame_count}/{total_frames}"
                cv2.putText(live_frame, timestamp_str, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                            0.7, (255, 255, 255), 2, cv2.LINE_AA)
                output_video.write(live_frame)
                
            if not args.no_display:
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
        snapshot_ids = []
        trigger_classes = []
        
        # Update object frame counter for all objects
        for i, tid in enumerate(track_ids):
            tid_int = int(tid)
            
            # Update frame counter for this object
            if tid_int not in object_frame_counter:
                object_frame_counter[tid_int] = 1
            else:
                object_frame_counter[tid_int] += 1
            
            # Update last seen frame
            snapshot_tracker[tid_int] = frame_count
        
        # Check for stable new objects that should trigger snapshots
        for i, tid in enumerate(track_ids):
            tid_int = int(tid)
            class_id = int(class_ids[i])
            
            # Only consider stable objects that have been tracked for a minimum number of frames
            is_stable = object_frame_counter[tid_int] >= MIN_DETECTION_FRAMES
            
            if tid_int not in snapshot_tracker or (frame_count - snapshot_tracker[tid_int] > FORGET_FRAMES):
                # It's a new object (or one we haven't seen for a while)
                if class_id != 0 and is_stable:  # Not a person and it's stable
                    # Check if we've waited long enough since the last snapshot (video mode only)
                    if source_type != 'video' or (frame_count - last_snapshot_frame) >= FRAME_INTERVAL:
                        new_snapshot = True
                        snapshot_ids.append(tid_int)
                        trigger_classes.append(class_id)
                        print(f"New stable object ID {tid_int} (class {class_id}: {labels[i]}) will trigger snapshot")
                        
                        # Update last snapshot frame for video mode
                        if source_type == 'video':
                            last_snapshot_frame = frame_count
        
        # Clean up old entries in tracking dictionaries
        snapshot_tracker = {tid: last_seen for tid, last_seen in snapshot_tracker.items()
                            if frame_count - last_seen < FORGET_FRAMES}
        
        object_frame_counter = {tid: count for tid, count in object_frame_counter.items()
                               if tid in snapshot_tracker}
        
        # Draw bounding boxes and labels
        for i in range(len(boxes)):
            x1, y1, x2, y2 = map(int, boxes[i])
            tid_int = int(track_ids[i])
            
            # Add stability indicator to live text
            stability = ""
            if tid_int in object_frame_counter:
                if object_frame_counter[tid_int] >= MIN_DETECTION_FRAMES:
                    stability = "✓"  # Checkmark for stable objects
                else:
                    stability = "..."  # Dots for objects not yet stable
            
            live_text = f"{labels[i]} | ID: {tid_int} | {confidences[i]:.2f} {stability}"
            cv2.rectangle(live_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
            (text_width, text_height), baseline = cv2.getTextSize(live_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(live_frame, (x1, y1 - text_height - baseline), (x1 + text_width, y1), (0, 0, 0), -1)
            cv2.putText(live_frame, live_text, (x1, y1 - baseline), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
        
        # Rest of your code for handling new snapshots remains the same...
        if new_snapshot:
            snapshot_frame = frame.copy()
            
            for i in range(len(boxes)):
                if int(class_ids[i]) != 0:
                    x1, y1, x2, y2 = map(int, boxes[i])
                    cv2.rectangle(snapshot_frame, (x1, y1), (x2, y2), (0, 255, 0), 2)
                    snapshot_text = labels[i]
                    (snap_text_width, snap_text_height), snap_baseline = cv2.getTextSize(
                        snapshot_text, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
                    cv2.rectangle(snapshot_frame, 
                                 (x1, y1 - snap_text_height - snap_baseline), 
                                 (x1 + snap_text_width, y1), (0, 0, 0), -1)
                    cv2.putText(snapshot_frame, snapshot_text, (x1, y1 - snap_baseline), 
                               cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 2)
            
            snapshot_frame, recognized_faces = perform_face_recognition(snapshot_frame)
            snapshot_count += 1
            
            timestamp_str = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            random_suffix = random.randint(1000, 9999)
            
            source_prefix = "cam" if source_type == "realtime" else "vid"
            snapshot_filename = f"{source_prefix}_snapshot_{snapshot_count:03d}_{timestamp_str}_{random_suffix}.jpg"
            output_path = os.path.join(output_manager.dirs["images"], snapshot_filename)
            
            try:
                cv2.imwrite(output_path, snapshot_frame)
            except Exception as save_err:
                print(f"Error saving snapshot: {save_err}")
                fallback_path = f"emergency_snapshot_{snapshot_count}.jpg"
                try:
                    cv2.imwrite(fallback_path, snapshot_frame)
                    output_path = fallback_path
                    print(f"Snapshot saved to fallback location: {fallback_path}")
                except Exception as fallback_err:
                    print(f"Critical error: Could not save snapshot: {fallback_err}")
            
            trigger_details = []
            for tid in snapshot_ids:
                idx = np.where(track_ids == tid)[0]
                if len(idx) > 0:
                    i = idx[0]
                    trigger_details.append(f"{int(tid)}({labels[i]})")
                else:
                    trigger_details.append(f"{int(tid)}(unknown)")
            
            trigger_info = ", ".join(trigger_details)
            log_message = f"New snapshot {snapshot_count} triggered by object IDs: {trigger_info}"
            output_manager.log_system(log_message)
            
            timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
            metadata_entry = {
                "snapshot_id": snapshot_count,
                "timestamp": timestamp,
                "image_path": output_path,
                "source": source_type,
                "source_details": args.video if source_type == "video" else "webcam",
                "trigger_objects": [int(id) for id in snapshot_ids],
                "people": [{"name": name, "box": box} for name, box in recognized_faces],
                "objects": []
            }
            
            for i in range(len(boxes)):
                obj_data = {
                    "id": int(track_ids[i]),
                    "label": labels[i],
                    "box": boxes[i].tolist(),
                    "confidence": float(confidences[i]),
                    "class_id": int(class_ids[i])
                }
                metadata_entry["objects"].append(obj_data)
            
            try:
                output_manager.append_metadata(metadata_entry)
            except Exception as meta_err:
                print(f"Warning: Failed to save metadata: {meta_err}")
            
            current_time = time.time()
            
            # Adjusted throttling for video mode - longer interval
            min_interval = MIN_ANALYSIS_INTERVAL
            if source_type == 'video':
                min_interval = 10.0  # Longer interval for video mode
            
            if (current_time - last_analysis_time >= min_interval and 
                analysis_queue.qsize() < MAX_ANALYSIS_QUEUE):
                
                analysis_queue.put((snapshot_count, output_path, timestamp))
                last_analysis_time = current_time
                print(f"Queued snapshot {snapshot_count} for analysis. Queue size: {analysis_queue.qsize()}")
            else:
                reason = "too soon after last analysis" if current_time - last_analysis_time < min_interval else "queue full"
                print(f"Skipping analysis for snapshot {snapshot_count} (throttling: {reason})")
                output_manager.log_system(f"Analysis skipped for snapshot {snapshot_count} due to throttling: {reason}")
        
        # Continue with video output...
        if source_type == 'video' and output_video is not None:
            timestamp_str = f"Frame: {frame_count}/{total_frames}"
            cv2.putText(live_frame, timestamp_str, (10, 30), cv2.FONT_HERSHEY_SIMPLEX, 
                        0.7, (255, 255, 255), 2, cv2.LINE_AA)
            output_video.write(live_frame)
        
        if not args.no_display:
            cv2.imshow(window_name, live_frame)
            if cv2.waitKey(1) & 0xFF == ord("q"):
                output_manager.log_system("User requested exit (pressed 'q')")
                break
        else:
            time.sleep(0.001)
    
    cap.release()
    if output_video is not None:
        output_video.release()
        print(f"Processed video saved to: {output_path}")
    
    if not args.no_display:
        cv2.destroyAllWindows()
    
    output_manager.log_system(f"Session ended. Processed {frame_count} frames, captured {snapshot_count} snapshots.")

def main():
    args = parse_arguments()
    
    analysis_thread = threading.Thread(target=analysis_worker, daemon=True)
    analysis_thread.start()
    
    process_detection_source(args.mode, args)
    
    time.sleep(0.5)
    
    analysis_queue.put(None)
    analysis_thread.join(timeout=5.0)
    
    output_manager.close()

if __name__ == "__main__":
    main()