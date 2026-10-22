/**
 * routes/studentRoutes.js
 */

const express = require('express');
const router = express.Router();
const {
  getStudents,
  getMyProfile,
  getStudent,
  createStudent,
  updateStudent,
  deleteStudent,
} = require('../controllers/studentController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// GET current student's own profile
router.get('/profile/me', protect, getMyProfile);

// GET all students — Admin, Teacher, and Student (returns own record for student)
router.get('/', protect, authorize('admin', 'teacher', 'student'), getStudents);

// GET single student
router.get('/:id', protect, authorize('admin', 'teacher', 'student'), getStudent);

// POST create student — Admin only
router.post('/', protect, authorize('admin'), createStudent);

// PUT update student — Admin only
router.put('/:id', protect, authorize('admin'), updateStudent);

// DELETE student — Admin only
router.delete('/:id', protect, authorize('admin'), deleteStudent);

module.exports = router;
