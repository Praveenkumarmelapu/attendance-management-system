/**
 * controllers/classController.js — Class CRUD Operations
 */

const mongoose = require('mongoose');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Student = require('../models/Student');

// ─── GET /api/classes ─────────────────────────────────────────────────────────
const getClasses = async (req, res) => {
  try {
    const classes = await Class.find()
      .populate('teacher', 'name teacherId department email')
      .populate('students', 'name studentId email department year section')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: classes.length, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/classes/:id ─────────────────────────────────────────────────────
const getClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id)
      .populate('teacher', 'name teacherId department email')
      .populate('students', 'name studentId email department year section');

    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Also fetch all students that point to this class directly
    const directStudents = await Student.find({ class: classData._id });
    const existingStudentIds = new Set((classData.students || []).map((s) => s._id.toString()));
    const allStudents = [...(classData.students || [])];

    for (const ds of directStudents) {
      if (!existingStudentIds.has(ds._id.toString())) {
        allStudents.push(ds);
        existingStudentIds.add(ds._id.toString());
      }
    }

    const result = classData.toObject();
    result.students = allStudents;

    res.json({ success: true, class: result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/classes/teacher/:teacherId ──────────────────────────────────────
const getClassesByTeacher = async (req, res) => {
  try {
    const teacherIdParam = req.params.teacherId;

    // If admin requesting all or special param, return all classes
    if (req.user?.role === 'admin' && (!teacherIdParam || teacherIdParam === 'admin' || teacherIdParam === 'all')) {
      const classes = await Class.find()
        .populate('teacher', 'name teacherId department email')
        .populate('students', 'name studentId email department year section')
        .sort({ createdAt: -1 });
      return res.json({ success: true, classes });
    }

    // Find teacher by userId OR by _id
    let teacher = null;
    if (mongoose.Types.ObjectId.isValid(teacherIdParam)) {
      teacher = await Teacher.findOne({
        $or: [{ userId: teacherIdParam }, { _id: teacherIdParam }],
      });
    }

    if (!teacher && req.user) {
      teacher = await Teacher.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
    }

    // Fallback for admin user viewing teacher pages
    if (!teacher && req.user?.role === 'admin') {
      const classes = await Class.find()
        .populate('teacher', 'name teacherId department email')
        .populate('students', 'name studentId email department year section')
        .sort({ createdAt: -1 });
      return res.json({ success: true, classes });
    }

    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const classes = await Class.find({ teacher: teacher._id })
      .populate('teacher', 'name teacherId department email')
      .populate('students', 'name studentId email department year section');

    res.json({ success: true, classes });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/classes ────────────────────────────────────────────────────────
const createClass = async (req, res) => {
  try {
    const { className, department, year, section, teacherId } = req.body;

    if (!className || !department || !year || !section) {
      return res.status(400).json({
        success: false,
        message: 'Please provide className, department, year, and section',
      });
    }

    const newClass = await Class.create({
      className,
      department,
      year,
      section,
      teacher: teacherId || null,
    });

    const populated = await Class.findById(newClass._id).populate(
      'teacher',
      'name teacherId'
    );

    res.status(201).json({
      success: true,
      message: 'Class created successfully',
      class: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/classes/:id ─────────────────────────────────────────────────────
const updateClass = async (req, res) => {
  try {
    const { className, department, year, section, teacherId } = req.body;

    const updatedClass = await Class.findByIdAndUpdate(
      req.params.id,
      { className, department, year, section, teacher: teacherId || null },
      { new: true, runValidators: true }
    ).populate('teacher', 'name teacherId');

    if (!updatedClass) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    res.json({ success: true, message: 'Class updated successfully', class: updatedClass });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/classes/:id ──────────────────────────────────────────────────
const deleteClass = async (req, res) => {
  try {
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    // Remove class reference from all students in this class
    await Student.updateMany(
      { class: classData._id },
      { $unset: { class: '' } }
    );

    await Class.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Class deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/classes/:id/students ──────────────────────────────────────────
// Add a student to a class
const addStudentToClass = async (req, res) => {
  try {
    const { studentId } = req.body;
    const classData = await Class.findById(req.params.id);
    if (!classData) {
      return res.status(404).json({ success: false, message: 'Class not found' });
    }

    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Remove from old class if any
    if (student.class) {
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: student._id },
      });
    }

    // Add to new class
    await Class.findByIdAndUpdate(req.params.id, {
      $addToSet: { students: student._id },
    });

    // Update student's class reference
    await Student.findByIdAndUpdate(studentId, { class: req.params.id });

    res.json({ success: true, message: 'Student added to class successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getClasses,
  getClass,
  getClassesByTeacher,
  createClass,
  updateClass,
  deleteClass,
  addStudentToClass,
};
