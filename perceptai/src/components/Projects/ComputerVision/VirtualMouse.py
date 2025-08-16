import cv2
import numpy as np
import HandTrackingModule as htm
import pyautogui
import time

# Webcam resolution
wCam, hCam = 640, 480

# Screen resolution
wScr, hScr = pyautogui.size()

# Frame reduction for movement box
frameR = 100
smoothening = 2

cap = cv2.VideoCapture(0)
cap.set(3, wCam)
cap.set(4, hCam)

detector = htm.HandDetector(maxHands=1)
plocX, plocY = 0, 0  # previous location
clocX, clocY = 0, 0  # current location

while True:
    success, img = cap.read()
    img = detector.findHands(img)
    lmList = detector.findPosition(img, draw=False)

    if len(lmList) != 0:
        x1, y1 = lmList[8][1:]  # Index finger tip
        x2, y2 = lmList[12][1:] # Middle finger tip

        # Step 1: Only Index finger up => Moving mode
        fingers = []

        # Tip > PIP means finger is up (y-coordinate)
        for tipId in [8, 12]:
            fingers.append(1 if lmList[tipId][2] < lmList[tipId - 2][2] else 0)

        cv2.rectangle(img, (frameR, frameR), (wCam - frameR, hCam - frameR),
                      (255, 0, 255), 2)

        if fingers[0] == 1 and fingers[1] == 0:
            # Step 2: Convert Coordinates
            x3 = np.interp(x1, (frameR, wCam - frameR), (0, wScr))
            y3 = np.interp(y1, (frameR, hCam - frameR), (0, hScr))

            # Step 3: Smooth Movement
            clocX = plocX + (x3 - plocX) / smoothening
            clocY = plocY + (y3 - plocY) / smoothening

            # Step 4: Move mouse
            pyautogui.moveTo(wScr - clocX, clocY)  # Flip x-axis if needed
            plocX, plocY = clocX, clocY

            # Draw pointer
            cv2.circle(img, (x1, y1), 7, (0, 255, 0), cv2.FILLED)

        # Step 5: Both Index & Middle finger up => Click mode
        if fingers[0] == 1 and fingers[1] == 1:
            length = np.hypot(x2 - x1, y2 - y1)
            if length < 30:
                cv2.circle(img, (x1, y1), 10, (0, 0, 255), cv2.FILLED)
                pyautogui.click()

    # Display
    cv2.imshow("Virtual Mouse", img)
    if cv2.waitKey(1) == ord('q'):
        break
