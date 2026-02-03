
import cv2
import socket
import threading
import numpy as np
import time
import os
import asyncio
from typing import List
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, UploadFile, File, BackgroundTasks, Request, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configuration
TCP_HOST = '0.0.0.0'
TCP_PORT = 8080
HTTP_PORT = 8000
UPLOAD_DIR = "recordings"

# Ensure upload directory exists
os.makedirs(UPLOAD_DIR, exist_ok=True)

app = FastAPI()

# Enable CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global state
class VideoServerState:
    def __init__(self):
        self.latest_frame = None
        self.esp32_socket = None
        self.clients: List[WebSocket] = []
        self.is_recording = False
        self.lock = threading.Lock()

state = VideoServerState()

# TCP Server to handle ESP32 Video Stream (Backwards compatible)
def run_tcp_server():
    server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
    server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
    server_socket.bind((TCP_HOST, TCP_PORT))
    server_socket.listen(1)
    print(f"TCP Video Server listening on {TCP_HOST}:{TCP_PORT}")

    while True:
        try:
            client_socket, addr = server_socket.accept()
            print(f"ESP32 Connected from {addr}")
            
            with state.lock:
                state.esp32_socket = client_socket

            buffer = b""
            
            while True:
                try:
                    # Receive frame size (4 bytes)
                    size_header = client_socket.recv(4)
                    if not size_header:
                        break
                    
                    frame_size = int.from_bytes(size_header, byteorder='little')
                    
                    # Receive frame data
                    frame_data = b""
                    while len(frame_data) < frame_size:
                        chunk = client_socket.recv(min(4096, frame_size - len(frame_data)))
                        if not chunk:
                            break
                        frame_data += chunk
                    
                    if len(frame_data) != frame_size:
                        break

                    # Decode and update latest frame
                    nparr = np.frombuffer(frame_data, np.uint8)
                    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                    
                    if frame is not None:
                        # Encode to JPEG for web streaming
                        _, buffer_jpg = cv2.imencode('.jpg', frame)
                        state.latest_frame = buffer_jpg.tobytes()

                except Exception as e:
                    print(f"Stream error: {e}")
                    break
            
            print("ESP32 Disconnected")
            with state.lock:
                state.esp32_socket = None
            client_socket.close()
            
        except Exception as e:
            print(f"Server error: {e}")
            time.sleep(1)

# Start TCP server in background thread
threading.Thread(target=run_tcp_server, daemon=True).start()

# FastAPI Endpoints

@app.get("/")
async def root():
    return {"status": "running", "message": "ESP32 Video Stream Server"}

@app.websocket("/ws/video")
async def video_stream(websocket: WebSocket):
    await websocket.accept()
    try:
        while True:
            if state.latest_frame:
                await websocket.send_bytes(state.latest_frame)
            await asyncio.sleep(0.033) # ~30 FPS
    except WebSocketDisconnect:
        pass

@app.post("/record/start")
async def start_recording():
    with state.lock:
        if state.esp32_socket:
            try:
                # Send custom command header or string
                # Protocol: "CMD:START\n"
                state.esp32_socket.send(b"CMD:START\n")
                state.is_recording = True
                return {"status": "success", "message": "Recording started"}
            except Exception as e:
                return {"status": "error", "message": str(e)}
        return {"status": "error", "message": "ESP32 not connected"}

@app.post("/record/stop")
async def stop_recording():
    with state.lock:
        if state.esp32_socket:
            try:
                state.esp32_socket.send(b"CMD:STOP\n")
                state.is_recording = False
                return {"status": "success", "message": "Recording stopped"}
            except Exception as e:
                return {"status": "error", "message": str(e)}
        return {"status": "error", "message": "ESP32 not connected"}

def process_video(file_path: str):
    """
    Convert MJPEG to AVI for better compatibility.
    """
    try:
        # Check if file exists and has size
        if not os.path.exists(file_path) or os.path.getsize(file_path) == 0:
            print(f"Skipping conversion for empty/missing file: {file_path}")
            return

        cap = cv2.VideoCapture(file_path)
        if not cap.isOpened():
            print(f"Error reading video file: {file_path}")
            return

        # Output file path (change extension to .avi)
        output_path = file_path.rsplit('.', 1)[0] + ".avi"
        
        frame_width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
        frame_height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
        
        # Fallback if properties are 0 (common with raw streams)
        if frame_width == 0 or frame_height == 0:
             ret, frame = cap.read()
             if ret:
                 frame_height, frame_width = frame.shape[:2]
                 # Re-open to start from beginning
                 cap.release()
                 cap = cv2.VideoCapture(file_path)
             else:
                 print(f"Could not determine frame size for {file_path}")
                 return

        # Define the codec and create VideoWriter
        # MJPG codec is widely supported in AVI container
        fourcc = cv2.VideoWriter_fourcc(*'MJPG') 
        # Assume 10 FPS for now (matching ESP32 recording speed roughly)
        out = cv2.VideoWriter(output_path, fourcc, 10.0, (frame_width, frame_height))

        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            out.write(frame)

        cap.release()
        out.release()
        print(f"Converted {file_path} to {output_path}")
        
        # Optional: Remove original raw file to save space
        # os.remove(file_path)
        
    except Exception as e:
        print(f"Conversion failed for {file_path}: {e}")

@app.post("/upload")
async def upload_video(request: Request, background_tasks: BackgroundTasks, x_filename: str = Header(None)):
    if not x_filename:
        x_filename = "unknown_file.mjpeg"
    
    file_location = f"{UPLOAD_DIR}/{int(time.time())}_{x_filename}"
    
    # Read raw body
    body = await request.body()
    
    with open(file_location, "wb+") as file_object:
        file_object.write(body)
        
    print(f"Video file received: {file_location}")
    
    # Trigger background conversion
    background_tasks.add_task(process_video, file_location)
    
    return {"status": "success", "filename": file_location}

@app.post("/event/recording_started")
async def event_recording_started():
    print("Event: Recording started via physical button")
    # Here you could push this event to React via WebSocket
    return {"status": "acknowledged"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=HTTP_PORT)
