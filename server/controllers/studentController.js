/**
 * controllers/studentController.js — Student CRUD Operations
 *
 * CRUD = Create, Read, Update, Delete
 * These are the 4 basic operations for any data in a database.
 *
 * Each function here handles one API endpoint.
 * Routes call these functions and pass req/res objects.
 */

const Student = require('../models/Student');
const User = require('../models/User');
const Class = require('../models/Class');

// ─── GET /api/students ────────────────────────────────────────────────────────
// @desc   Get all students with optional search (or student's own record)
// @access Private
const getStudents = async (req, res) => {
  try {
    // If student user calls this endpoint, return their own profile record
    if (req.user?.role === 'student') {
      const student = await Student.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      }).populate('class', 'className department year section');

      return res.json({
        success: true,
        count: student ? 1 : 0,
        students: student ? [student] : [],
      });
    }

    const { search, department, year } = req.query;

    let query = {};

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { studentId: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    if (department) query.department = { $regex: department, $options: 'i' };
    if (year) query.year = year;

    const students = await Student.find(query)
      .populate('class', 'className department year section')
      .sort({ createdAt: -1 });

    res.json({ success: true, count: students.length, students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/students/profile/me ─────────────────────────────────────────────
// @desc   Get current logged-in student profile
// @access Private (Student)
const getMyProfile = async (req, res) => {
  try {
    let student = await Student.findOne({
      $or: [
        { userId: req.user._id },
        { email: { $regex: new RegExp(`^${req.user.email}$`, 'i') } },
      ],
    }).populate('class', 'className department year section');

    if (!student && req.user && req.user.role === 'student') {
      const defaultClass = await Class.findOne();
      student = await Student.create({
        studentId: `STU${Date.now().toString().slice(-5)}`,
        name: req.user.name,
        email: req.user.email.toLowerCase(),
        phone: req.user.phone || '',
        department: defaultClass?.department || 'General Engineering',
        year: defaultClass?.year || '1',
        section: defaultClass?.section || 'A',
        class: defaultClass?._id || null,
        userId: req.user._id,
      });

      if (defaultClass) {
        await Class.findByIdAndUpdate(defaultClass._id, {
          $addToSet: { students: student._id },
        });
      }

      student = await Student.findById(student._id).populate(
        'class',
        'className department year section'
      );
    }

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student profile not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/students/:id ───────────────────────────────────────────────────
// @desc   Get a single student by ID
// @access Private
const getStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate(
      'class',
      'className department year section'
    );

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.json({ success: true, student });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── POST /api/students ──────────────────────────────────────────────────────
// @desc   Create a new student + linked User account
// @access Private (Admin only)
const createStudent = async (req, res) => {
  try {
    const { studentId, name, email, phone, department, year, section, classId, password } = req.body;

    // Check for duplicate studentId
    const existingStudent = await Student.findOne({ studentId });
    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: `Student ID '${studentId}' already exists`,
      });
    }

    // Check for duplicate email
    const existingEmail = await Student.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        success: false,
        message: `Email '${email}' is already registered`,
      });
    }

    // Create a User account for the student (so they can log in)
    const user = await User.create({
      name,
      email,
      password: password || 'student123', // Default password
      role: 'student',
      phone,
    });

    // Create the student profile linked to the user
    const student = await Student.create({
      studentId,
      name,
      email,
      phone,
      department,
      year,
      section,
      class: classId || null,
      userId: user._id,
    });

    // If a class was provided, add student to that class's students array
    if (classId) {
      await Class.findByIdAndUpdate(classId, {
        $addToSet: { students: student._id }, // $addToSet prevents duplicates
      });
    }

    res.status(201).json({
      success: true,
      message: 'Student created successfully',
      student,
    });
  } catch (error) {
    console.error('Create Student Error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/students/:id ───────────────────────────────────────────────────
// @desc   Update a student
// @access Private (Admin only)
const updateStudent = async (req, res) => {
  try {
    const { name, email, phone, department, year, section, classId } = req.body;

    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // If class is being changed, update the old and new class records
    if (classId && classId !== student.class?.toString()) {
      // Remove from old class
      if (student.class) {
        await Class.findByIdAndUpdate(student.class, {
          $pull: { students: student._id },
        });
      }
      // Add to new class
      await Class.findByIdAndUpdate(classId, {
        $addToSet: { students: student._id },
      });
    }

    const updatedStudent = await Student.findByIdAndUpdate(
      req.params.id,
      { name, email, phone, department, year, section, class: classId },
      { new: true, runValidators: true } // new: true returns the updated doc
    );

    // Also update the linked User record
    if (student.userId) {
      await User.findByIdAndUpdate(student.userId, { name, email, phone });
    }

    res.json({ success: true, message: 'Student updated successfully', student: updatedStudent });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/students/:id ────────────────────────────────────────────────
// @desc   Delete a student
// @access Private (Admin only)
const deleteStudent = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    // Remove from class if assigned
    if (student.class) {
      await Class.findByIdAndUpdate(student.class, {
        $pull: { students: student._id },
      });
    }

    // Delete linked user account
    if (student.userId) {
      await User.findByIdAndDelete(student.userId);
    }

    await Student.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'Student deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = { getStudents, getMyProfile, getStudent, createStudent, updateStudent, deleteStudent };
