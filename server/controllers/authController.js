/**
 * controllers/authController.js — Authentication Logic
 *
 * This file contains the business logic for:
 * 1. register — Create a new user account
 * 2. login    — Authenticate user and return JWT
 * 3. getMe    — Return current logged-in user data
 *
 * Controllers keep the route files clean — they just call these functions.
 */

const User = require('../models/User');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const jwt = require('jsonwebtoken');

// ─── Helper: Generate JWT Token ───────────────────────────────────────────────
// A JWT contains encoded user data (id, role) and expires in 7 days
const generateToken = (id, role) => {
  return jwt.sign({ id, role }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  });
};

// ─── @route  POST /api/auth/register ─────────────────────────────────────────
// @desc   Register a new user
// @access Public
const register = async (req, res) => {
  try {
    const { name, email, password, role, phone } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    // Check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Email is already registered',
      });
    }

    // Create user (password will be hashed by the pre-save hook in User model)
    const user = await User.create({
      name,
      email,
      password,
      role: role || 'student',
      phone,
    });

    // Auto-create associated role profile
    if (user.role === 'student') {
      const defaultClass = await Class.findOne();
      const studentDoc = await Student.create({
        studentId: `STU${Date.now().toString().slice(-5)}`,
        name: user.name,
        email: user.email.toLowerCase(),
        phone: user.phone || '',
        department: defaultClass?.department || 'General Engineering',
        year: defaultClass?.year || '1',
        section: defaultClass?.section || 'A',
        class: defaultClass?._id || null,
        userId: user._id,
      });

      if (defaultClass) {
        await Class.findByIdAndUpdate(defaultClass._id, {
          $addToSet: { students: studentDoc._id },
        });
      }
    } else if (user.role === 'teacher') {
      await Teacher.create({
        teacherId: `TCH${Date.now().toString().slice(-4)}`,
        name: user.name,
        email: user.email.toLowerCase(),
        phone: user.phone || '',
        department: 'General Faculty',
        userId: user._id,
      });
    }

    // Return user data + token
    res.status(201).json({
      success: true,
      message: 'Registration successful',
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Register Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  POST /api/auth/login ────────────────────────────────────────────
// @desc   Login user
// @access Public
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password',
      });
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Check if password matches the hashed password in DB
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    res.json({
      success: true,
      message: 'Login successful',
      token: generateToken(user._id, user.role),
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── @route  GET /api/auth/me ─────────────────────────────────────────────────
// @desc   Get current logged-in user
// @access Private (requires JWT)
const getMe = async (req, res) => {
  try {
    // req.user is set by authMiddleware
    const user = await User.findById(req.user._id).select('-password');
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { register, login, getMe };
