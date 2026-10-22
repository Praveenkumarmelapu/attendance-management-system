/**
 * routes/authRoutes.js
 *
 * These are the API endpoints for authentication.
 * Each route maps an HTTP method + URL to a controller function.
 *
 * Public routes:  No token needed
 * Private routes: Require JWT token (protect middleware)
 */

const express = require('express');
const router = express.Router();
const { register, login, getMe } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// POST /api/auth/register → register a new user
router.post('/register', register);

// POST /api/auth/login → login and get JWT token
router.post('/login', login);

// GET /api/auth/me → get current user info (requires login)
router.get('/me', protect, getMe);

module.exports = router;
