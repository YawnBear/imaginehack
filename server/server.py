# server.py
import asyncio
import websockets
import json
import os
import uuid
from datetime import datetime

# Directory to save received media chunks
MEDIA_DIR = "received_media"
os.makedirs(MEDIA_DIR, exist_ok=True)

async def handle_client(websocket, path):
    # Each client gets a unique ID
    client_id = str(uuid.uuid4())
    print(f"New client connected: {client_id}")
    
    # Create a directory for this client's recordings
    client_dir = os.path.join(MEDIA_DIR, client_id)
    os.makedirs(client_dir, exist_ok=True)
    
    # File to save the stream
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    media_file = os.path.join(client_dir, f"stream_{timestamp}.webm")
    
    try:
        with open(media_file, "wb") as f:
            # Send a welcome message
            await websocket.send(json.dumps({
                "type": "status",
                "data": "Connected successfully. Ready to receive media stream."
            }))
            
            # Receive and process data
            async for message in websocket:
                # If message is binary data (media chunk)
                if isinstance(message, bytes):
                    # Write the binary data to file
                    f.write(message)
                    f.flush()  # Make sure data is written immediately
                    
                    # Example: Send periodic acknowledgment
                    await websocket.send(json.dumps({
                        "type": "status",
                        "data": "Receiving stream data..."
                    }))
                    
                # If message is text (JSON command)
                else:
                    try:
                        data = json.loads(message)
                        print(f"Received command: {data}")
                        
                        # Handle different command types
                        if data.get("command") == "stop":
                            break
                            
                    except json.JSONDecodeError:
                        print(f"Invalid JSON received: {message}")
                        
    except websockets.exceptions.ConnectionClosed:
        print(f"Connection closed for client: {client_id}")
    except Exception as e:
        print(f"Error handling client {client_id}: {e}")
    finally:
        print(f"Client disconnected: {client_id}")
        
        # Process the completed recording if needed
        print(f"Recording saved to {media_file}")
        
        # Here you could trigger any post-processing
        # For example, running speech recognition on the audio
        # or sending the file to another service

async def main():
    server = await websockets.serve(
        handle_client,
        "localhost",  # Change to your server's IP address for remote access
        8765          # Port number
    )
    
    print("WebSocket server started at ws://localhost:8765")
    await server.wait_closed()

if __name__ == "__main__":
    asyncio.run(main())