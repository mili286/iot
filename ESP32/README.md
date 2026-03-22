# SecureWatch ESP32 Firmware

The SecureWatch ESP32 Firmware is designed for ESP32-CAM (or compatible) modules to provide real-time video streaming, motion detection, and automated recording synchronization.

## 🏗️ Architecture & Features

This embedded application is built with a focus on reliability and edge-case handling:

-   **Real-time Streaming**: Streams MJPEG frames directly to the backend using **Socket.io (WebSockets)** binary protocol.
-   **Local Storage Fallback**: If the network connection is lost, the device automatically switches to recording MJPEG chunks to a local **SD card**.
-   **Automated Sync**: Once reconnected, the device initiates a background synchronization process to upload stored SD card recordings to the backend via HTTP POST.
-   **Event-Driven Triggers**: Integrated support for **PIR motion sensors** and manual **button triggers** to notify the system and start/stop recording sessions.
-   **Status Feedback**: Utilizes an **I2C LCD** to display real-time status information (WiFi IP, connection status, recording indicator).
-   **Power Optimized**: High-performance CPU configuration (240MHz) and optimized WiFi transmission power for stable high-bandwidth video data.

---

## 🚀 Core Functionalities

### 1. Video Stream Engine
-   Captures frames in **JPEG** format at configurable resolutions (default: QVGA).
-   Efficient frame interval management (~5-10 fps depending on network quality).
-   Binary data transmission to minimize protocol overhead.

### 2. Synchronization Logic
-   Scans local `/rec` directory on the SD card for pending `.mjpeg` files.
-   Uploads files using multipart/form-data to the backend.
-   Verifies server response (200 OK) before deleting local copies to prevent data loss.

### 3. Motion Detection
-   Monitors a PIR sensor on a dedicated interrupt or loop-checked pin.
-   Implements a **cooldown mechanism** to prevent redundant event triggers.
-   Synchronizes time via **NTP** for accurate event timestamping.

---

## 🛠️ Hardware Requirements

-   **ESP32-CAM** (or ESP32-S3 with Camera support)
-   **PIR Motion Sensor** (connected to GPIO 14)
-   **Push Button** (connected to GPIO 3 for manual recording)
-   **I2C LCD Display (16x2)** (connected via SDA/SCL)
-   **Micro SD Card** (formatted in FAT32)

---

## 📡 Pin Configuration

| Component | Pin | Function |
| :--- | :--- | :--- |
| **PIR Sensor** | GPIO 14 | Input |
| **Button** | GPIO 3 (RX) | Manual Trigger |
| **I2C SDA** | GPIO 1 | LCD Data |
| **I2C SCL** | GPIO 2 | LCD Clock |
| **SD CMD** | GPIO 38 | SD Card Command |
| **SD CLK** | GPIO 39 | SD Card Clock |
| **SD D0** | GPIO 40 | SD Card Data 0 |

---

## 📦 Getting Started

1.  **Open Project**:
    Open `security_camera/security_camera.ino` in **Arduino IDE**.
2.  **Install Libraries**:
    Ensure the following libraries are installed:
    -   `WebSocketsClient` (by Markus Sattler)
    -   `LiquidCrystal_I2C` (by Frank de Brabander)
    -   `HTTPClient` (standard ESP32 library)
    -   `SD_MMC` (standard ESP32 library)
3.  **Configure Network**:
    Update the `ssid`, `password`, and `serverIP` constants at the top of the file:
    ```cpp
    const char* ssid = "YOUR_WIFI_SSID";
    const char* password = "YOUR_WIFI_PASSWORD";
    const char* serverIP = "192.168.1.100"; // Your Backend IP
    ```
4.  **Flash Firmware**:
    Select your board (e.g., "AI Thinker ESP32-CAM" or "ESP32S3 Dev Module") and upload the code.
5.  **Monitor Output**:
    Open the Serial Monitor at **115200 baud** to see connection and streaming logs.
