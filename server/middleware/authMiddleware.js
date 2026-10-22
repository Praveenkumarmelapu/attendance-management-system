/**
 * middleware/authMiddleware.js — JWT Authentication Middleware
 *
 * What this does:
 * - Intercepts every protected API request
 * - Reads the JWT token from the Authorization header
 * - Verifies the token is valid and not expired
 * - Attaches the logged-in user's data to req.user
 * - Calls next() to allow the request to continue to the route handler
 *
 * How JWT works:
 * 1. User logs in → Server creates a JWT token with user data inside
 * 2. Client stores the token (localStorage)
 * 3. Client sends token in every request header: "Authorization: Bearer <token>"
 * 4. This middleware checks the token on every protected route
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // Check if Authorization header exists and starts with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    try {
      // Extract token from "Bearer <token>"
      token = req.headers.authorization.split(' ')[1];

      // Verify the token using our secret key
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Find the user from DB using the ID stored inside the token
      // .select('-password') means: get all fields EXCEPT password
      req.user = await User.findById(decoded.id).select('-password');

      if (!req.user) {
        return res.status(401).json({ success: false, message: 'User not found' });
      }

      next(); // Token is valid, continue to the route handler
    } catch (error) {
      console.error('JWT Error:', error.message);
      res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }
  } else {
    res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
};

module.exports = { protect };
