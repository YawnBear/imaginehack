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
import traceback  # For better error reporting
import time  # For timing control

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
    
    # Resize for faster processing (make it even smaller for better performance)
    height, width = img.shape[:2]
    scale = 0.25  # Reduce to 25% of original size
    
    # Calculate new dimensions
    new_width = int(width * scale)
    new_height = int(height * scale)
    
    # Resize using a faster method
    imgS = cv2.resize(img, (new_width, new_height), interpolation=cv2.INTER_NEAREST)
    imgS = cv2.cvtColor(imgS, cv2.COLOR_BGR2RGB)
    
    # Find faces in the frame (with model='hog' for speed)
    imgSLocs = face_recognition.face_locations(imgS, model='hog')
    
    # Only proceed with encoding if faces are found
    if not imgSLocs:
        return img, []  # Return early if no faces
    
    # Get face encodings (with fewer jitters for speed)
    imgSEncodings = face_recognition.face_encodings(imgS, imgSLocs, num_jitters=1)
    
    recognition_results = []
    
    # Check if we have training data
    if len(trainingEncodings) == 0:
        cv2.putText(img, "NO TRAINING FACES", (10, 50), cv2.FONT_HERSHEY_PLAIN, 2, (0, 0, 255), 2)
    else:
        # Process each face in the frame
        for loc, encoding in zip(imgSLocs, imgSEncodings):
            # Compare with reduced tolerance for speed
            matches = face_recognition.compare_faces(trainingEncodings, encoding, tolerance=0.6)
            faceDist = face_recognition.face_distance(trainingEncodings, encoding)
            
            if len(faceDist) > 0:  # Make sure we got some distances
                matchIndex = np.argmin(faceDist)
                min_distance = faceDist[matchIndex]
                
                # Check if there's a match
                if matchIndex < len(matches) and matches[matchIndex]:
                    name = friendNames[matchIndex].upper()
                    confidence = 1.0 - min_distance
                    
                    # Draw on the image
                    y1, x2, y2, x1 = loc
                    y1, x2, y2, x1 = y1*4, x2*4, y2*4, x1*4
                    cv2.rectangle(img, (x1, y1), (x2, y2), (0,255,0), 2)
                    cv2.putText(img, name, (x1+6, y1-6), cv2.FONT_HERSHEY_PLAIN, 2, (0,255,0), 2)
                    
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
                    cv2.putText(img, "UNKNOWN", (x1+6, y1-6), cv2.FONT_HERSHEY_PLAIN, 2, (0,0,255), 2)
    
    # Return the processed frame and recognition results
    return img, recognition_results

# Update the following parts for better performance:

# 1. Add a frame skip counter to process only every N frames
frame_skip_count = 0
frame_skip_interval = 3  # Process every 3rd frame

# 2. Update the process_frames_thread function
def process_frames_thread():
    global frame_skip_count
    while True:
        try:
            # Get frame from queue with a timeout
            frame = frame_queue.get(timeout=1.0)
            
            # Skip frames to improve performance
            frame_skip_count += 1
            if frame_skip_count % frame_skip_interval != 0:
                # Just acknowledge the frame but don't process it
                frame_queue.task_done()
                continue
            
            # Process the frame
            processed_frame, results = process_frame(frame)
            
            # Encode the processed frame to JPEG (with reduced quality for speed)
            encode_params = [cv2.IMWRITE_JPEG_QUALITY, 70]  # 70% quality
            _, buffer = cv2.imencode('.jpg', processed_frame, encode_params)
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
async def handle_client(websocket):  # Remove 'path' parameter
    print("New client connected!")
    
    # Start processing thread when a client connects
    processor = threading.Thread(target=process_frames_thread, daemon=True)
    processor.start()
    
    # Keep track of frames received and timing
    frame_count = 0
    last_result_time = time.time()
    
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
                    try:
                        # Try to decode as a JPEG image
                        np_arr = np.frombuffer(message, np.uint8)
                        frame = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)
                        
                        if frame is not None:
                            # Successfully decoded as image
                            frame_count += 1
                            
                            # Only acknowledge every 10th frame in logs (reduce console spam)
                            if frame_count % 10 == 0:
                                print(f"Received frame {frame_count}")
                            
                            # Skip frames if queue is full to avoid lag
                            if not frame_queue.full():
                                frame_queue.put(frame)
                        else:
                            # Fallback to WebM handling removed for performance
                            pass
                    except Exception as e:
                        print(f"Error processing binary data: {str(e)}")
                
                # Process JSON commands
                else:
                    try:
                        data = json.loads(message)
                        
                        if data.get("type") == "audio":
                            # Process audio data
                            audio_data = data.get("data")
                            if audio_data:
                                # Log when audio data is received
                                print(f"Received audio data: {len(audio_data)} samples")
                                
                                # Calculate audio level for debugging
                                if isinstance(audio_data, list) and len(audio_data) > 0:
                                    try:
                                        audio_level = sum(abs(float(x)) for x in audio_data[:100]) / min(100, len(audio_data))
                                        print(f"Audio level: {audio_level:.4f}")
                                    except:
                                        print("Could not calculate audio level")
                                
                                # Here you would process the audio data
                                # For example, save it, analyze it, etc.
                                pass
                        
                        elif data.get("command") == "stop":
                            print("Client requested stop")
                            break
                    except json.JSONDecodeError:
                        pass
                
                # Send back any processed results, but not too frequently
                current_time = time.time()
                if current_time - last_result_time >= 0.2:  # Send results at max 5fps
                    while not processed_results.empty():
                        result = processed_results.get()
                        await websocket.send(json.dumps(result))
                        processed_results.task_done()
                        last_result_time = current_time
                    
            except Exception as e:
                print(f"Error processing message: {e}")
    
    except websockets.exceptions.ConnectionClosed as e:
        print(f"Connection closed with code {e.code}")
    finally:
        print("Client disconnected")

# Start server
async def main():
    async with websockets.serve(
        handle_client,
        "localhost",
        8765
    ) as server:
        print("Face recognition WebSocket server started at ws://localhost:8765")
        await asyncio.Future()  # Run forever

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