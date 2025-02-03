from ultralytics import YOLO
import cv2


model = YOLO("yolo11n.pt") 


cap = cv2.VideoCapture(0)

# full-screen
cv2.namedWindow("YOLOv8 + ByteTrack", cv2.WND_PROP_FULLSCREEN)
cv2.setWindowProperty("YOLOv8 + ByteTrack", cv2.WND_PROP_FULLSCREEN, cv2.WINDOW_FULLSCREEN)

# Define classes 
classes_to_detect = [0, 24, 56, 63, 64, 66, 67, 73, 76]


while cap.isOpened():
    success, frame = cap.read()
    if not success:
        break

  
    results = model.track(
        frame,
        persist=True,  # Critical for ID consistency
        classes=classes_to_detect,
        conf=0.7,  # Increase confidence threshold to reduce false positives
        iou=0.5,  # Adjust IoU threshold for Non-Max Suppression
        tracker="bytetrack.yaml", 
        verbose=False  # Disable logging for speed
    )


    annotated_frame = results[0].plot()

   
    cv2.imshow("YOLOv8 + ByteTrack", annotated_frame)
    if cv2.waitKey(1) & 0xFF == ord("q"):
        break

cap.release()
cv2.destroyAllWindows()