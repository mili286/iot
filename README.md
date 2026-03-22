# SecureWatch IoT Camera System

SecureWatch is an end-to-end IoT security camera solution featuring real-time video streaming, motion detection, automated recording management, and a comprehensive web dashboard.

## 🌟 Project Overview

This project consists of three main components:
1.  **[ESP32 Firmware](file:///c:/Users/PAGE/source/fitRepos/iot/ESP32/)**: Embedded C++ code for ESP32-CAM modules to capture video, detect motion, and stream data.
2.  **[Backend API](file:///c:/Users/PAGE/source/fitRepos/iot/Backend/)**: Node.js/TypeScript server implementing CQRS and Hexagonal architecture for robust IoT data handling.
3.  **[Frontend Dashboard](file:///c:/Users/PAGE/source/fitRepos/iot/Frontend/)**: React-based web application for live monitoring, recording playback, and system metrics.

---

## 🛠️ Key Features

-   **Real-time Streaming**: Low-latency MJPEG video streaming from ESP32 to the browser via Socket.io.
-   **Motion Detection**: Automated PIR sensor triggers to capture and upload event-based recordings.
-   **Offline Recording & Sync**: ESP32 records to local SD card when offline and automatically syncs with the server once reconnected.
-   **Comprehensive Dashboard**: View system metrics, camera status, and managed recordings in one place.
-   **Secure Authentication**: JWT-based user authentication with secure registration and login flows.
-   **Infinite Scroll History**: Seamlessly browse through thousands of recordings with an optimized infinite scroll interface.

---

## 🚀 Getting Started

### Prerequisites

-   **Node.js** (v18+) & **npm**
-   **MongoDB** (running instance)
-   **Arduino IDE** (for ESP32 deployment)
-   **FFmpeg** (installed on the backend server for video processing)

### Installation & Launch

#### 1. Backend Setup
```bash
cd Backend
npm install
# Configure your .env file with MONGODB_URI and JWT_SECRET
npm run dev
```

#### 2. Frontend Setup
```bash
cd Frontend
npm install
npm run dev
```

#### 3. ESP32 Deployment
1.  Open `ESP32/security_camera/security_camera.ino` in Arduino IDE.
2.  Update `ssid`, `password`, and `serverIP` with your network credentials.
3.  Flash the firmware to your ESP32-CAM module.

---

## 🏗️ Architecture Architecture Overview

The project follows modern software engineering practices across the entire stack:

-   **Backend**: Utilizes **CQRS (Command Query Responsibility Segregation)** to separate read and write operations, **InversifyJS** for Dependency Injection, and **Hexagonal Architecture** (Ports and Adapters) to isolate domain logic from external infrastructures.
-   **Frontend**: Built with **React** and **Redux Toolkit (RTK)**. It uses **RTK Query** for efficient API communication and **Socket.io** for real-time binary data streaming.
-   **IoT**: Implements a robust **reconnection and sync mechanism**, ensuring no data is lost during network outages by utilizing local SD storage.

---

## 📂 Project Structure

```
.
├── Backend/           # Node.js/TypeScript CQRS API
├── Frontend/          # React/Redux Dashboard
├── ESP32/             # ESP32-CAM Firmware (C++)
└── README.md          # Root Documentation
```

For more detailed information on each component, please refer to their respective README files.
