# Face Detection using OpenCV
import cv2
import numpy as np

# Load the pre-trained face detection model
face_cascade = cv2.CascadeClassifier(cv2.data.haarcascades + 'haarcascade_frontalface_default.xml')

# Start capturing video from webcam
cap = cv2.VideoCapture(0)

print("Face Detection Started!")
print("Press 'q' to quit")

window_name = 'Face Detection'
while True:
    # Read video frame by frame
    success, img = cap.read()
    
    if not success:
        print("Failed to grab frame")
        break
    
    # Flip the image(frame)
    img = cv2.flip(img, 1)
    
    # Convert to grayscale for face detection
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    
    # Detect faces
    faces = face_cascade.detectMultiScale(
        gray,
        scaleFactor=1.1,
        minNeighbors=5,
        minSize=(30, 30)
    )
    
    # Draw rectangle around faces
    for (x, y, w, h) in faces:
        cv2.rectangle(img, (x, y), (x+w, y+h), (255, 0, 0), 2)
        cv2.putText(img, 'Face', (x, y-10), cv2.FONT_HERSHEY_SIMPLEX, 0.9, (255, 0, 0), 2)
    
    # Display number of faces detected
    if len(faces) > 0:
        cv2.putText(img, f'Faces Detected: {len(faces)}', (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
    else:
        cv2.putText(img, 'No Faces Detected', (10, 30), 
                    cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    # Display the frame
    cv2.imshow(window_name, img)
    
    # Break the loop if 'q' is pressed
    if (cv2.waitKey(1) & 0xFF == ord('q')) or cv2.getWindowProperty(window_name, cv2.WND_PROP_VISIBLE) < 1:
        break

# Release the capture and destroy windows
cap.release()
cv2.destroyAllWindows()
print("Face Detection Stopped!")
