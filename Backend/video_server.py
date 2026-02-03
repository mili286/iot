import socket
import threading
import cv2
import numpy as np
import time

class VideoStreamServer:
    def __init__(self, host='0.0.0.0', port=8080):
        self.host = host
        self.port = port
        self.server_socket = None
        self.running = False
        
    def start_server(self):
        """Start the video stream server"""
        self.server_socket = socket.socket(socket.AF_INET, socket.SOCK_STREAM)
        self.server_socket.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        self.server_socket.bind((self.host, self.port))
        self.server_socket.listen(5)
        
        print(f"Video stream server started on {self.host}:{self.port}")
        print("Waiting for ESP32 connection...")
        
        self.running = True
        
        while self.running:
            try:
                client_socket, client_address = self.server_socket.accept()
                print(f"Connected to ESP32 at {client_address}")
                
                # Handle client in a separate thread
                client_thread = threading.Thread(
                    target=self.handle_client,
                    args=(client_socket, client_address)
                )
                client_thread.daemon = True
                client_thread.start()
                
            except Exception as e:
                if self.running:
                    print(f"Error accepting connection: {e}")
    
    def handle_client(self, client_socket, client_address):
        """Handle video stream from a single client"""
        try:
            # Create a window to display the video
            cv2.namedWindow('ESP32 Camera Stream', cv2.WINDOW_NORMAL)
            
            buffer = b""
            frame_count = 0
            start_time = time.time()
            
            while self.running:
                try:
                    # Receive frame size header (4 bytes)
                    size_header = client_socket.recv(4)
                    if len(size_header) != 4:
                        break
                    
                    # Convert header to frame size
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
                    
                    # Convert JPEG data to numpy array
                    nparr = np.frombuffer(frame_data, np.uint8)
                    
                    # Decode JPEG image
                    try:
                        frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
                        if frame is not None:
                            # Display the frame
                            cv2.imshow('ESP32 Camera Stream', frame)
                            
                            frame_count += 1
                            
                            # Calculate and display FPS
                            if time.time() - start_time >= 1.0:
                                fps = frame_count / (time.time() - start_time)
                                print(f"FPS: {fps:.2f}")
                                frame_count = 0
                                start_time = time.time()
                            
                            # Break on 'q' key press
                            if cv2.waitKey(1) & 0xFF == ord('q'):
                                self.running = False
                                break
                                
                    except Exception as e:
                        print(f"Error decoding frame: {e}")
                        
                except Exception as e:
                    print(f"Error receiving frame: {e}")
                    break
            
        except Exception as e:
            print(f"Error handling client {client_address}: {e}")
        finally:
            client_socket.close()
            cv2.destroyAllWindows()
            print(f"Connection to {client_address} closed")
    
    def stop_server(self):
        """Stop the server"""
        self.running = False
        if self.server_socket:
            self.server_socket.close()
        print("Server stopped")

if __name__ == "__main__":
    server = VideoStreamServer()
    
    try:
        server.start_server()
    except KeyboardInterrupt:
        print("\nShutting down server...")
    finally:
        server.stop_server()