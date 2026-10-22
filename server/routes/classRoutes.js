/**
 * routes/classRoutes.js
 */

const express = require('express');
const router = express.Router();
const {
  getClasses,
  getClass,
  getClassesByTeacher,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
} = require('../controllers/classController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

router.get('/', protect, authorize('admin', 'teacher', 'student'), getClasses);
router.get('/teacher/:teacherId', protect, getClassesByTeacher);
router.get('/:id', protect, authorize('admin', 'teacher', 'student'), getClass);
router.post('/', protect, authorize('admin'), createClass);
router.put('/:id', protect, authorize('admin'), updateClass);
router.delete('/:id', protect, authorize('admin'), deleteClass);
router.post('/:id/students', protect, authorize('admin'), addStudentToClass);

module.exports = router;
