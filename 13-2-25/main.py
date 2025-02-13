import os
import cv2
import face_recognition
from tkinter import filedialog
import sys

# Load the Haar cascade classifier
cascade_path = 'Haarcascades/haarcascade_frontalface_default.xml'
if not os.path.exists(cascade_path):
    print(f"Error: Cascade file '{cascade_path}' not found. Please ensure it is in the correct folder.")
    sys.exit(1)
face_classifier = cv2.CascadeClassifier(cascade_path)

# Build a dictionary of face images from the database
directory_path = 'database/'
faces_dict = {}
for filename in os.listdir(directory_path):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.tiff', '.bmp', '.gif')):
        person_name = os.path.splitext(filename)[0]  # Remove the file extension to get the person's name
        file_path = os.path.join(directory_path, filename)
        faces_dict[person_name] = file_path

# Ask the user to choose a file using a file dialog
file_path = filedialog.askopenfilename(title="Select an image file")
while not file_path:
    file_path = filedialog.askopenfilename(title="Select an image file")

# Load the selected image
live = cv2.imread(file_path)
if live is None:
    print(f"Error: Could not load image from '{file_path}'. Please ensure it is a valid image file.")
    sys.exit(1)

# Convert image to grayscale for face detection
gray = cv2.cvtColor(live, cv2.COLOR_BGR2GRAY)
faces = face_classifier.detectMultiScale(gray, scaleFactor=1.3, minNeighbors=5)

# Define font properties for labeling
font = cv2.FONT_HERSHEY_SIMPLEX
font_scale = 1
font_color = (255, 255, 255)  # white color
thickness = 2

count = 0
# Process each registered face in the dictionary for recognition in the input image
for person_name, image_path in faces_dict.items():
    try:
        first_image = face_recognition.load_image_file(image_path)
        first_encoding = face_recognition.face_encodings(first_image)[0]
    except IndexError:
        print(f'Face not detected in the image for {person_name}')
        continue

    # Only process if at least one face is detected in the live image
    if faces is None or len(faces) == 0:
        print("No faces found in the provided image.")
        break

    for (x, y, w, h) in faces:
        # Crop the detected face from the live image
        face_image = live[y:y+h, x:x+w]
        cv2.imwrite('face.jpg', face_image)
        try:
            face_loaded = face_recognition.load_image_file("face.jpg")
            second_encoding = face_recognition.face_encodings(face_loaded)[0]
            # Clean up the temporary saved file
            if os.path.exists('face.jpg'):
                os.remove('face.jpg')
        except IndexError:
            print('Face not detected in the cropped image from the live input')
            continue

        try:
            result = face_recognition.compare_faces([first_encoding], second_encoding)
            if result[0]:
                count += 1
                # Draw rectangle and label the recognized face
                cv2.rectangle(live, (x, y), (x + w, y + h), (127, 0, 255), 2)
                text_position = (x, y - 10)
                text_size = cv2.getTextSize(person_name, font, font_scale, thickness)[0]
                bg_x = x
                bg_y = y - text_size[1] - 10
                # Draw a filled rectangle as background for the text
                cv2.rectangle(live, (bg_x, bg_y), (bg_x + text_size[0], bg_y + text_size[1] + 5), (0, 0, 0), -1)
                cv2.putText(live, person_name, text_position, font, font_scale, font_color, thickness)
        except Exception as e:
            print('Error during face comparison:', e)

if count == 0:
    print("No face was recognized.")
elif count == 1:
    print("1 face was recognized.")
else:
    print(f'{count} faces were recognized.')

# Save the result image with the recognized faces highlighted
result_path = "result.jpg"
cv2.imwrite(result_path, live)
print(f"Processed image saved as '{result_path}'.")