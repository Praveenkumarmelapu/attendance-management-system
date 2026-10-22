/**
 * controllers/teacherController.js — Teacher CRUD Operations
 */

const Teacher = require('../models/Teacher');
const User = require('../models/User');
const Class = require('../models/Class');

// ─── GET /api/teachers ────────────────────────────────────────────────────────
const getTeachers = async (req, res) => {
  try {
    const { search, department } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { teacherId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = { $regex: department, $options: 'i' };

    const teachers = await Teacher.find(query).sort({ createdAt: -1 });
    res.json({ success: true, count: teachers.length, teachers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/teachers/:id ───────────────────────────────────────────────────
const getTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }
    res.json({ success: true, teacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/teachers ──────────────────────────────────────────────────────
const createTeacher = async (req, res) => {
  try {
    const { teacherId, name, email, phone, department, password } = req.body;

    const existingTeacher = await Teacher.findOne({ teacherId });
    if (existingTeacher) {
      return res.status(400).json({
        success: false,
        message: `Teacher ID '${teacherId}' already exists`,
      });
    }

    const existingEmail = await Teacher.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email '${email}' is already registered`,
      });
    }

    // Create User account for teacher login
    const user = await User.create({
      name,
      email,
      password: password || 'teacher123',
      role: 'teacher',
      phone,
    });

    const teacher = await Teacher.create({
      teacherId,
      name,
      email,
      phone,
      department,
      userId: user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Teacher created successfully',
      teacher,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/teachers/:id ───────────────────────────────────────────────────
const updateTeacher = async (req, res) => {
  try {
    const { name, email, phone, department } = req.body;

    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    const updatedTeacher = await Teacher.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, department },
      { new: true, runValidators: true }
    );

    if (teacher.userId) {
      await User.findByIdAndUpdate(teacher.userId, { name, email, phone });
    }

    res.json({ success: true, message: 'Teacher updated successfully', teacher: updatedTeacher });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/teachers/:id ────────────────────────────────────────────────
const deleteTeacher = async (req, res) => {
  try {
    const teacher = await Teacher.findById(req.params.id);
    if (!teacher) {
      return res.status(404).json({ success: false, message: 'Teacher not found' });
    }

    if (teacher.userId) {
      await User.findByIdAndDelete(teacher.userId);
    }

    await Teacher.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Teacher deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getTeachers, getTeacher, createTeacher, updateTeacher, deleteTeacher };
