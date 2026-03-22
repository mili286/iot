# SecureWatch Backend API

The SecureWatch Backend is a robust, scalable Node.js/TypeScript application that handles IoT device communication, video stream processing, and system management.

## 🏗️ Architecture & Practices

This project adheres to high-standard architectural principles to ensure maintainability and testability:

-   **CQRS (Command Query Responsibility Segregation)**: Read and write operations are strictly separated. Commands handle state changes (e.g., `SaveRecordingCommand`), while Queries handle data retrieval (e.g., `GetRecordingsQuery`).
-   **Hexagonal Architecture (Ports & Adapters)**: The domain logic is isolated from external infrastructures. Repositories and services are defined as interfaces (Ports) and implemented as concrete classes (Adapters).
-   **Dependency Injection (DI)**: Powered by **InversifyJS**, enabling loose coupling and easy mocking for unit tests.
-   **Clean Domain Modeling**: Business entities and rules reside in the `domain` layer, independent of framework-specific code.
-   **Centralized Error Handling**: Middleware-based error processing with standardized API responses.

---

## 🚀 Core Features

### 1. MJPEG Stream Processing
-   **Binary Streaming**: Receives binary frame data from IoT devices via Socket.io.
-   **Frame Assembly**: Utilizes **FFmpeg** to process and save MJPEG streams into persistent storage.
-   **Real-time Relay**: Instantly broadcasts incoming camera frames to connected frontend clients.

### 2. IoT Event Management
-   **Motion Triggers**: API endpoints for devices to report motion or manual triggers.
-   **Automated Recording**: Automatically starts and stops recording sessions based on IoT events.
-   **System Metrics**: Tracks global statistics like total recordings, duration, and motion event counts.

### 3. User Authentication
-   **JWT Security**: Secure login and registration with JSON Web Tokens.
-   **Token Rotation**: Implements refresh token logic for extended session management.
-   **Password Protection**: Argon2 or Bcrypt-based hashing for user credentials.

---

## 📡 API Endpoints

### Authentication
-   `POST /api/auth/register`: Register a new user.
-   `POST /api/auth/login`: Authenticate and receive JWT/Refresh tokens.
-   `POST /api/auth/refresh-token`: Exchange a refresh token for a new JWT.

### Recordings
-   `GET /api/recordings`: List all recordings with pagination support.
-   `GET /api/recordings/:id`: Retrieve details and stream for a specific recording.
-   `DELETE /api/recordings/:id`: Permanently delete a recording.

### System
-   `GET /api/system/parameters`: Get real-time system metrics and camera status.

### IoT (Internal/Device)
-   `POST /api/events/trigger`: Endpoint for devices to report PIR or button events.
-   `POST /api/upload/stream`: Multipart upload for offline recording synchronization.

---

## 🛠️ Technical Stack

-   **Runtime**: Node.js (TypeScript)
-   **Framework**: Express.js
-   **Database**: MongoDB (Mongoose)
-   **Real-time**: Socket.io
-   **Processing**: FFmpeg & Fluent-FFmpeg
-   **DI Container**: InversifyJS
-   **Documentation**: Swagger/OpenAPI

---

## 📦 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure environment**:
    Create a `.env` file based on `.env.example`:
    ```env
    PORT=3000
    MONGODB_URI=mongodb://localhost:27017/securewatch
    JWT_SECRET=your_super_secret_key
    ```
3.  **Run in development**:
    ```bash
    npm run dev
    ```
4.  **View API Docs**:
    Visit `http://localhost:3000/api-docs` for full Swagger documentation.
