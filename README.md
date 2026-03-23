# EduSync School ERP

This is a modern, full-stack School Enterprise Resource Planning (ERP) application built with React, Node.js, Express, and SQLite.

## Features
*   **Premium Dashboard UI**: Dark mode, glassmorphism design.
*   **Student Admissions**: Register students.
*   **Academics Module**: Assign teachers to departmental subjects.
*   **Live Daily Attendance**: Track daily attendance and calculate average percentages.
*   **Local Relational Database**: SQLite + Sequelize ORM for zero-configuration persistent storage.

---

## 🚀 How to Run the Project Locally

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/en/) installed on your machine.

### 1. Start the Backend API
The backend uses a local SQLite database that sets itself up automatically.
1. Open a terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Install the necessary dependencies:
   ```bash
   npm install
   ```
3. Start the Node server (runs on port `5000`):
   ```bash
   node server.js
   ```

### 2. Start the Frontend Application
Leave the backend running in its terminal. Open a **new terminal window**.
1. Navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install the frontend dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Finally, open your browser and navigate to `http://localhost:5173/` to use the ERP system!
