import cv2
import time
import numpy as np
import HandTrackingModule as htm
import math
import screen_brightness_control as sbc

################################
wCam, hCam = 640, 480
################################

cap = cv2.VideoCapture(0)
cap.set(3, wCam)
cap.set(4, hCam)

pTime = 0

detector = htm.HandDetector(detectionCon=0.7)

minDist = 15     # min finger distance
maxDist = 150    # max finger distance

while True:
    success, img = cap.read()
    img = detector.findHands(img, draw=True)
    lmList = detector.findPosition(img, draw=False)

    if lmList:
        x1, y1 = lmList[4][1], lmList[4][2]    # Thumb tip
        x2, y2 = lmList[8][1], lmList[8][2]    # Index tip
        cx, cy = (x1 + x2)//2, (y1 + y2)//2

        cv2.circle(img, (x1, y1), 10, (255, 0, 0), cv2.FILLED)
        cv2.circle(img, (x2, y2), 10, (255, 0, 0), cv2.FILLED)
        cv2.line(img, (x1, y1), (x2, y2), (255, 0, 0), 3)
        cv2.circle(img, (cx, cy), 7, (0, 255, 0), cv2.FILLED)

        length = math.hypot(x2 - x1, y2 - y1)

        # Convert distance to brightness
        brightness = np.interp(length, [minDist, maxDist], [0, 100])
        sbc.set_brightness(int(brightness))

        # Visual bar
        cv2.rectangle(img, (50, 150), (85, 400), (0, 255, 0), 3)
        bar = np.interp(length, [minDist, maxDist], [400, 150])
        cv2.rectangle(img, (50, int(bar)), (85, 400), (0, 255, 0), cv2.FILLED)
        cv2.putText(img, f'{int(brightness)} %', (40, 430), cv2.FONT_HERSHEY_COMPLEX,
                    1, (255, 255, 255), 2)

    # FPS
    cTime = time.time()
    fps = 1 / (cTime - pTime + 1e-6)
    pTime = cTime
    cv2.putText(img, f'FPS: {int(fps)}', (10, 40), cv2.FONT_HERSHEY_COMPLEX,
                1, (0, 255, 0), 2)

    cv2.imshow("Img", img)
    if cv2.waitKey(1) == ord('q'):
        break
