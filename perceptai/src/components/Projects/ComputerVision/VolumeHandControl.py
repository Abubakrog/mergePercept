import cv2
import time
import numpy as np
import HandTrackingModule as htm
import math
from ctypes import cast, POINTER
from comtypes import CLSCTX_ALL
from pycaw.pycaw import AudioUtilities, IAudioEndpointVolume

############################
wCam, hCam = 640, 480
############################

cap = cv2.VideoCapture(0)
cap.set(3, wCam)
cap.set(4, hCam)

detector = htm.HandDetector(detectionCon=0.7)

# Pycaw audio setup
devices = AudioUtilities.GetSpeakers()
interface = devices.Activate(IAudioEndpointVolume._iid_, CLSCTX_ALL, None)
volume = cast(interface, POINTER(IAudioEndpointVolume))
volRange = volume.GetVolumeRange()
minVol = volRange[0]
maxVol = volRange[1]

vol = 0
volBar = 400
volPer = 0
pTime = 0

while True:
    success, img = cap.read()
    img = detector.findHands(img)
    lmList = detector.findPosition(img, draw=False)

    if len(lmList) != 0:
        # Thumb tip is id 4, index finger tip is id 8
        x1, y1 = lmList[4][1], lmList[4][2]
        x2, y2 = lmList[8][1], lmList[8][2]
        cx, cy = (x1 + x2) // 2, (y1 + y2) // 2

        # Draw line & circles
        cv2.line(img, (x1, y1), (x2, y2), (255, 0, 255), 2)
        cv2.circle(img, (x1, y1), 7, (255, 0, 255), cv2.FILLED)
        cv2.circle(img, (x2, y2), 7, (255, 0, 255), cv2.FILLED)
        cv2.circle(img, (cx, cy), 7, (0, 0, 255), cv2.FILLED)

        # Length of line
        length = math.hypot(x2 - x1, y2 - y1)

        # Convert length to volume
        # Wider mapping range so stretched hand hits 100%
        vol = np.interp(length, [25, 125], [minVol, maxVol])
        volBar = np.interp(length, [25, 125], [400, 150])
        volPer = np.interp(length, [25, 125], [0, 100])




        volume.SetMasterVolumeLevel(vol, None)

    # Volume bar visuals
    cv2.rectangle(img, (50, 150), (85, 400), (0, 0, 0), 2)
    cv2.rectangle(img, (50, int(volBar)), (85, 400), (0, 255, 0), cv2.FILLED)
    cv2.putText(img, f'{int(volPer)} %', (40, 430), cv2.FONT_HERSHEY_PLAIN,
                2, (0, 0, 255), 2)

    # FPS counter
    cTime = time.time()
    fps = 1 / (cTime - pTime + 0.0001)
    pTime = cTime
    cv2.putText(img, f'FPS: {int(fps)}', (500, 40), cv2.FONT_HERSHEY_PLAIN,
                2, (0, 255, 255), 2)

    cv2.imshow("Img", img)
    if cv2.waitKey(1) == ord('q'):
        break
