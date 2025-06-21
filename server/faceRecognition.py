import cv2
import numpy as np
import face_recognition
import os
import asyncio
import websockets
import json
import base64
from io import BytesIO
import tempfile
import threading
import queue

# Shared queue for frames between WebSocket thread and processing thread
frame_queue = queue.Queue(maxsize=10)
processed_results = queue.Queue(maxsize=10)

# FUNCTIONS
def findEncoding(images):   # images -> array of image paths
    encodeList = []
    for img in images:
        if img is None:
            print("Warning: Skipping None image")
            continue
        try:
            img = cv2.cvtColor(img, cv2.COLOR_BGR2RGB)
            faces = face_recognition.face_encodings(img)
            if len(faces) > 0:
                currEncode = faces[0]
                encodeList.append(currEncode)
            else:
                print("Warning: No face found in training image")
        except Exception as e:
            print(f"Error encoding image: {e}")
    return encodeList

# Load training images
print("Loading training images...")
trainingImages = []
friendNames = []
image_dir = "server/images"
if not os.path.exists(image_dir):
    print(f"Creating images directory: {image_dir}")
    os.makedirs(image_dir)

files = os.listdir(image_dir)
files = [i for i in files if i.lower().endswith(('.png', '.jpg', '.jpeg'))]
print(f"Found {len(files)} image files: {files}")

for i in files:
    currImg = cv2.imread(f'{image_dir}/{i}')
    if currImg is None:
        print(f"Warning: Could not read image {i}")
        continue
    trainingImages.append(currImg)
    friendNames.append(os.path.splitext(i)[0])  # removes the .png

if len(trainingImages) == 0:
    print("No valid training images found! Please add images to the images folder.")
else:
    trainingEncodings = findEncoding(trainingImages)
    print(f"*************ENCODING DONE: {len(trainingEncodings)} faces encoded*************")

# Function to process frames
def process_frame(frame):
    # Make a copy to avoid modifying the original
    img = frame.copy()
    
    # Resize for faster processing
    imgS = cv2.resize(img, (0,0), None, 0.25, 0.25)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)
    
    # Find faces in the frame
    imgSLocs = face_recognition.face_locations(imgS)
    imgSEncodings = face_recognition.face_encodings(imgS, imgSLocs)
    
    recognition_results = []
    
    # Check if we have training data
    if len(trainingEncodings) == 0:
        cv2.putText(img, "NO TRAINING FACES", (10, 50), cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)
    else:
        # Process each face in the frame
        for loc, encoding in zip(imgSLocs, imgSEncodings):
            if len(trainingEncodings) > 0:  # Double-check we have training data
                matches = face_recognition.compare_faces(trainingEncodings, encoding)
                faceDist = face_recognition.face_distance(trainingEncodings, encoding)
                
                if len(faceDist) > 0:  # Make sure we got some distances
                    matchIndex = np.argmin(faceDist)
                    
                    # Check if there's a match
                    if matchIndex < len(matches) and matches[matchIndex]:
                        name = friendNames[matchIndex].upper()
                        confidence = 1.0 - faceDist[matchIndex]
                        
                        # Draw on the image
                        y1, x2, y2, x1 = loc
                        y1, x2, y2, x1 = y1*4, x2*4, y2*4, x1*4
                        cv2.rectangle(img, (x1, y1), (x2, y2), (0,255,0), 2)
                        cv2.putText(img, name, (x1+6, y1-6), cv2.FONT_HERSHEY_PLAIN, 3, (0,255,0), 5)
                        
                        # Store recognition result
                        recognition_results.append({
                            "name": name,
                            "confidence": float(confidence),
                            "location": {"x1": int(x1), "y1": int(y1), "x2": int(x2), "y2": int(y2)}
                        })
                    else:
                        # Unknown face
                        y1, x2, y2, x1 = loc
                        y1, x2, y2, x1 = y1*4, x2*4, y2*4, x1*4
                        cv2.rectangle(img, (x1, y1), (x2, y2), (0,0,255), 2)
                        cv2.putText(img, "UNKNOWN", (x1+6, y1-6), cv2.FONT_HERSHEY_PLAIN, 3, (0,0,255), 5)
    
    # Return the processed frame and recognition results
    return img, recognition_results

# Frame processing thread
def process_frames_thread():
    while True:
        try:
            # Get frame from queue with a timeout
            frame = frame_queue.get(timeout=1.0)
            
            # Process the frame
            processed_frame, results = process_frame(frame)
            
            # Encode the processed frame to JPEG
            _, buffer = cv2.imencode('.jpg', processed_frame)
            encoded_frame = base64.b64encode(buffer).decode('utf-8')
            
            # Put results in the result queue
            processed_results.put({
                "type": "recognition_result",
                "image": encoded_frame,
                "faces": results
            })
            
            # Mark task as done
            frame_queue.task_done()
            
        except queue.Empty:
            pass  # No frames in the queue
        except Exception as e:
            print(f"Error in frame processing: {e}")

# WebSocket handler
async def handle_client(websocket, path):
    print("New client connected!")
    
    # Start processing thread when a client connects
    processor = threading.Thread(target=process_frames_thread, daemon=True)
    processor.start()
    
    # Keep track of frames received
    frame_count = 0
    decoded_frame = None
    
    try:
        # Send a welcome message
        await websocket.send(json.dumps({
            "type": "status",
            "data": "Connected to face recognition server"
        }))
        
        # Handle incoming messages
        async for message in websocket:
            try:
                # Process binary data (video frames)
                if isinstance(message, bytes):
                    # Save the binary data to a temporary file
                    with tempfile.NamedTemporaryFile(suffix='.webm', delete=True) as temp:
                        temp.write(message)
                        temp.flush()
                        
                        # Open the video file
                        cap = cv2.VideoCapture(temp.name)
                        if cap.isOpened():
                            success, frame = cap.read()
                            if success:
                                # Put frame in queue for processing
                                frame_count += 1
                                print(f"Received frame {frame_count}")
                                
                                # Skip frames if queue is full to avoid lag
                                if not frame_queue.full():
                                    frame_queue.put(frame)
                                
                                decoded_frame = frame
                            cap.release()
                
                # Process JSON commands
                else:
                    data = json.loads(message)
                    print(f"Received command: {data}")
                    
                    if data.get("command") == "stop":
                        print("Client requested stop")
                        break
                
                # Send back any processed results
                while not processed_results.empty():
                    result = processed_results.get()
                    await websocket.send(json.dumps(result))
                    processed_results.task_done()
                    
            except Exception as e:
                print(f"Error processing message: {e}")
                await websocket.send(json.dumps({
                    "type": "error",
                    "data": str(e)
                }))
    
    except websockets.exceptions.ConnectionClosed:
        print("Connection closed")
    finally:
        print("Client disconnected")

# Start server
async def main():
    server = await websockets.serve(
        handle_client,
        "localhost",
        8765
    )
    
    print("Face recognition WebSocket server started at ws://localhost:8765")
    await server.wait_closed()

# If running directly (not imported)
if __name__ == "__main__":
    # Display a message if no training images
    if len(trainingEncodings) == 0:
        print("""
        ⚠️  WARNING: No valid training images found!
        Please add face images to the 'server/images' folder.
        Images should be named with the person's name (e.g., 'tunku_abdul_rahman.jpg')
        """)
    
    # Run the WebSocket server
    asyncio.run(main())