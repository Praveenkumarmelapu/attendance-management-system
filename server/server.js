/**
 * server.js — Entry point of the Express backend
 *
 * What this file does:
 * 1. Loads environment variables from .env
 * 2. Creates an Express application
 * 3. Connects to MongoDB
 * 4. Registers middleware (cors, json parsing)
 * 5. Registers all API routes
 * 6. Starts the server on the configured port
 */

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');

// Load .env variables FIRST before anything else
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// ─── Middleware ───────────────────────────────────────────────────────────────
// cors: Allows our React frontend (port 5173) to talk to this backend (port 5000)
app.use(cors());

// express.json(): Parses incoming JSON request bodies so we can read req.body
app.use(express.json());

// ─── API Routes ──────────────────────────────────────────────────────────────
// Each route file handles a specific resource
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/classes', require('./routes/classRoutes'));
app.use('/api/attendance', require('./routes/attendanceRoutes'));

const path = require('path');
const fs = require('fs');

// ─── Static Production Bundle (Ultra-fast Loading) ───────────────────────────
const clientDistPath = path.join(__dirname, '../client/dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath, { maxAge: '7d' }));
  app.use((req, res, next) => {
    if (req.method === 'GET' && !req.path.startsWith('/api')) {
      return res.sendFile(path.join(clientDistPath, 'index.html'));
    }
    next();
  });
} else {
  app.get('/', (req, res) => {
    res.json({ message: 'Attendance Management System API is running!' });
  });
}

// ─── Global Error Handler ─────────────────────────────────────────────────────
// Catches any errors that routes throw using next(error)
app.use((err, req, res, next) => {
  console.error('Server Error:', err.message);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

// ─── Start Server ─────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
