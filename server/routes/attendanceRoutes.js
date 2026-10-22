/**
 * routes/attendanceRoutes.js
 */

const express = require('express');
const router = express.Router();
const {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getClassAttendance,
  getAttendanceStats,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendanceController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

// Mark attendance (bulk)
router.post('/', protect, authorize('admin', 'teacher'), markAttendance);

// Get all attendance records (admin/teacher)
router.get('/', protect, authorize('admin', 'teacher'), getAttendance);

// Get dashboard stats
router.get('/stats/overview', protect, authorize('admin'), getAttendanceStats);

// Get attendance for a specific student
router.get('/student/:studentId', protect, getStudentAttendance);

// Get attendance for a specific class
router.get('/class/:classId', protect, authorize('admin', 'teacher'), getClassAttendance);

// Update attendance record
router.put('/:id', protect, authorize('admin', 'teacher'), updateAttendance);

// Delete attendance record
router.delete('/:id', protect, authorize('admin'), deleteAttendance);

module.exports = router;
