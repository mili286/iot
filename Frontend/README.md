# SecureWatch Frontend Dashboard

SecureWatch Frontend is a modern, responsive web application built with React and TypeScript, designed to provide a seamless interface for security camera monitoring and recording management.

## 🏗️ Architecture & Practices

The frontend is built with a focus on scalability, performance, and clean code:

-   **Feature-Based Structure**: Code is organized by domain features (e.g., `features/auth`, `features/recordings`), making it easy to locate and maintain logic related to specific functionalities.
-   **State Management**: Powered by **Redux Toolkit (RTK)** for predictable global state.
-   **Efficient Data Fetching**: Utilizes **RTK Query** for API communication, featuring automated caching, optimistic updates, and simplified loading/error states.
-   **Real-time Binary Streaming**: Uses **Socket.io-client** to receive binary MJPEG frame data, which is efficiently rendered using `URL.createObjectURL` to minimize memory overhead.
-   **Infinite Scroll Architecture**: Implemented for the recordings list to handle large datasets efficiently by fetching data in chunks as the user scrolls.
-   **Responsive UI**: Built with **Tailwind CSS** and **Shadcn UI** components for a consistent, modern, and mobile-friendly experience.

---

## 🚀 Core Features

### 1. Live Stream Viewer
-   **Real-time Monitoring**: Low-latency view of the camera feed.
-   **Connection Status**: Visual indicators for "LIVE" or "DISCONNECTED" states.
-   **Fullscreen Mode**: Support for immersive monitoring.
-   **Status Integration**: Displays current camera resolution and system status in real-time.

### 2. Recording Management
-   **Infinite Scroll List**: Browse through recording history seamlessly without manual pagination.
-   **Detailed Playback**: Dedicated page for watching saved recordings with full video controls.
-   **Search & Filter**: Find recordings based on trigger type (motion, manual) or date.
-   **Secure Deletion**: Remove unwanted recordings directly from the dashboard.

### 3. System Metrics Dashboard
-   **Overview Cards**: Real-time stats for total recordings, cumulative duration, and motion event frequency.
-   **Activity Status**: Instant feedback on whether the camera system is currently active or recording.

### 4. Authentication & Security
-   **Protected Routes**: Ensures only authenticated users can access the monitoring tools.
-   **Persistence**: Securely stores JWT in `localStorage` for persistent sessions.
-   **JWT Refresh**: Automated token refresh logic to keep users logged in securely.

---

## 🛠️ Technical Stack

-   **Framework**: React (TypeScript)
-   **Build Tool**: Vite / Rsbuild
-   **State & API**: Redux Toolkit & RTK Query
-   **Real-time**: Socket.io-client
-   **Styling**: Tailwind CSS & Lucide Icons
-   **UI Components**: Shadcn UI (Radix UI)
-   **Routing**: React Router v6

---

## 📦 Getting Started

1.  **Install dependencies**:
    ```bash
    npm install
    ```
2.  **Configure environment**:
    Create a `.env` file with your backend API URL:
    ```env
    VITE_API_URL=http://localhost:3000/api
    VITE_SOCKET_URL=http://localhost:3000
    ```
3.  **Run in development**:
    ```bash
    npm run dev # Accessible at http://localhost:3030
    ```
4.  **Build for production**:
    ```bash
    npm run build
    ```
