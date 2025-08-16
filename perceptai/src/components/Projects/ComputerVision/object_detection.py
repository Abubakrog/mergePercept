# Object Detection using YOLO and OpenCV
import cv2
import numpy as np

# Load YOLO model
try:
    # Try to load YOLO model (you may need to download the weights file)
    net = cv2.dnn.readNet("yolov3.weights", "yolov3.cfg")
    classes = []
    with open("coco.names", "r") as f:
        classes = [line.strip() for line in f.readlines()]
    layer_names = net.getLayerNames()
    output_layers = [layer_names[i - 1] for i in net.getUnconnectedOutLayers()]
    yolo_available = True
    print("YOLO model loaded successfully!")
except:
    print("YOLO model not found. Using basic object detection...")
    yolo_available = False

# Start capturing video from webcam
cap = cv2.VideoCapture(0)

print("Object Detection Started!")
print("Press 'q' to quit")

window_name = 'Object Detection'
while True:
    # Read video frame by frame
    success, img = cap.read()
    
    if not success:
        print("Failed to grab frame")
        break
    
    # Flip the image(frame)
    img = cv2.flip(img, 1)
    height, width, channels = img.shape
    
    if yolo_available:
        # YOLO Object Detection
        # Detecting objects
        blob = cv2.dnn.blobFromImage(img, 0.00392, (416, 416), (0, 0, 0), True, crop=False)
        net.setInput(blob)
        outs = net.forward(output_layers)
        
        # Information to display on screen
        class_ids = []
        confidences = []
        boxes = []
        
        for out in outs:
            for detection in out:
                scores = detection[5:]
                class_id = np.argmax(scores)
                confidence = scores[class_id]
                if confidence > 0.5:
                    # Object detected
                    center_x = int(detection[0] * width)
                    center_y = int(detection[1] * height)
                    w = int(detection[2] * width)
                    h = int(detection[3] * height)
                    
                    # Rectangle coordinates
                    x = int(center_x - w / 2)
                    y = int(center_y - h / 2)
                    
                    boxes.append([x, y, w, h])
                    confidences.append(float(confidence))
                    class_ids.append(class_id)
        
        indexes = cv2.dnn.NMSBoxes(boxes, confidences, 0.5, 0.4)
        
        font = cv2.FONT_HERSHEY_SIMPLEX
        for i in range(len(boxes)):
            if i in indexes:
                x, y, w, h = boxes[i]
                label = str(classes[class_ids[i]])
                confidence = confidences[i]
                color = (0, 255, 0)
                cv2.rectangle(img, (x, y), (x + w, y + h), color, 2)
                cv2.putText(img, f"{label} {confidence:.2f}", (x, y - 10), font, 0.5, color, 2)
        
        # Display number of objects detected
        if len(indexes) > 0:
            cv2.putText(img, f'Objects Detected: {len(indexes)}', (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        else:
            cv2.putText(img, 'No Objects Detected', (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    else:
        # Basic motion detection
        gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
        gray = cv2.GaussianBlur(gray, (21, 21), 0)
        
        # For the first frame, we need to initialize the background
        if 'first_frame' not in locals():
            first_frame = gray
            continue
        
        # Calculate difference and threshold
        frame_delta = cv2.absdiff(first_frame, gray)
        thresh = cv2.threshold(frame_delta, 25, 255, cv2.THRESH_BINARY)[1]
        
        # Dilate the thresholded image to fill in holes
        thresh = cv2.dilate(thresh, None, iterations=2)
        
        # Find contours on thresholded image
        contours, _ = cv2.findContours(thresh.copy(), cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        
        # Draw rectangles around moving objects
        for contour in contours:
            if cv2.contourArea(contour) < 500:
                continue
            
            (x, y, w, h) = cv2.boundingRect(contour)
            cv2.rectangle(img, (x, y), (x + w, y + h), (0, 255, 0), 2)
            cv2.putText(img, 'Motion', (x, y - 10), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 255, 0), 2)
        
        # Display number of moving objects
        moving_objects = len([c for c in contours if cv2.contourArea(c) > 500])
        if moving_objects > 0:
            cv2.putText(img, f'Moving Objects: {moving_objects}', (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
        else:
            cv2.putText(img, 'No Motion Detected', (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 0, 255), 2)
    
    # Display the frame
    cv2.imshow(window_name, img)
    
    # Break the loop if 'q' is pressed
    if (cv2.waitKey(1) & 0xFF == ord('q')) or cv2.getWindowProperty(window_name, cv2.WND_PROP_VISIBLE) < 1:
        break

# Release the capture and destroy windows
cap.release()
cv2.destroyAllWindows()
print("Object Detection Stopped!")
