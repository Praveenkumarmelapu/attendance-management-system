/**
 * controllers/attendanceController.js — Attendance Logic
 *
 * Handles:
 * - Marking attendance (bulk upsert with UTC day normalization)
 * - Intelligent teacher resolution (admin / teacher fallback)
 * - Filtering attendance with robust date ranges
 * - Updating and deleting attendance records
 * - Statistics calculations
 */

const mongoose = require('mongoose');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');

/**
 * Normalizes any date input (YYYY-MM-DD string, ISO string, Date object)
 * to exact UTC midnight (00:00:00.000Z).
 * Eliminates timezone drift issues across all client/server locations.
 */
const parseToMidnightUTC = (dateInput) => {
  if (!dateInput) {
    const now = new Date();
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), 0, 0, 0, 0));
  }
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}/.test(dateInput)) {
    const parts = dateInput.substring(0, 10).split('-');
    return new Date(
      Date.UTC(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10), 0, 0, 0, 0)
    );
  }
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), 0, 0, 0, 0));
};

// ─── POST /api/attendance ─────────────────────────────────────────────────────
// @desc   Mark attendance for multiple students (Create or Update)
// @access Private (Teacher, Admin)
const markAttendance = async (req, res) => {
  try {
    const { classId, teacherId, date, attendanceData } = req.body;

    if (!classId || !date || !attendanceData || !Array.isArray(attendanceData) || attendanceData.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide classId, date, and attendanceData array',
      });
    }

    // 1. Resolve Teacher ID intelligently
    let resolvedTeacherId = null;

    if (teacherId && mongoose.Types.ObjectId.isValid(teacherId)) {
      const byTeacherId = await Teacher.findById(teacherId);
      if (byTeacherId) {
        resolvedTeacherId = byTeacherId._id;
      } else {
        const byUserId = await Teacher.findOne({ userId: teacherId });
        if (byUserId) resolvedTeacherId = byUserId._id;
      }
    }

    if (!resolvedTeacherId && req.user) {
      const userTeacher = await Teacher.findOne({
        $or: [{ userId: req.user._id }, { email: req.user.email }],
      });
      if (userTeacher) resolvedTeacherId = userTeacher._id;
    }

    if (!resolvedTeacherId) {
      const classDoc = await Class.findById(classId);
      if (classDoc && classDoc.teacher) {
        resolvedTeacherId = classDoc.teacher;
      }
    }

    if (!resolvedTeacherId) {
      const fallbackTeacher = await Teacher.findOne();
      if (fallbackTeacher) resolvedTeacherId = fallbackTeacher._id;
    }

    if (!resolvedTeacherId) {
      return res.status(400).json({
        success: false,
        message: 'No teacher found or assigned to this class. Please assign a teacher first.',
      });
    }

    // 2. Normalize date to exact UTC midnight and compute day bounds
    const attendanceDate = parseToMidnightUTC(date);
    const dayStart = new Date(attendanceDate.getTime());
    const dayEnd = new Date(attendanceDate.getTime() + 24 * 60 * 60 * 1000);

    const results = [];
    const errors = [];

    // 3. Process each student record
    for (const record of attendanceData) {
      try {
        if (!record.studentId) continue;

        // Check if attendance already exists for this student on this day
        let attendanceRecord = await Attendance.findOne({
          student: record.studentId,
          class: classId,
          date: { $gte: dayStart, $lt: dayEnd },
        });

        if (attendanceRecord) {
          // Update existing record
          attendanceRecord.status = record.status || 'present';
          attendanceRecord.remarks = record.remarks || '';
          attendanceRecord.teacher = resolvedTeacherId;
          attendanceRecord.date = attendanceDate;
          await attendanceRecord.save();
          results.push(attendanceRecord);
        } else {
          // Create new attendance record
          attendanceRecord = await Attendance.create({
            student: record.studentId,
            teacher: resolvedTeacherId,
            class: classId,
            date: attendanceDate,
            status: record.status || 'present',
            remarks: record.remarks || '',
          });
          results.push(attendanceRecord);
        }
      } catch (err) {
        console.error(`Error saving attendance for student ${record.studentId}:`, err.message);
        errors.push({ studentId: record.studentId, error: err.message });
      }
    }

    if (results.length === 0 && errors.length > 0) {
      return res.status(400).json({
        success: false,
        message: errors[0].error || 'Failed to save attendance records',
        errors,
      });
    }

    res.status(201).json({
      success: true,
      message: `Attendance recorded for ${results.length} students`,
      results,
      errors,
    });
  } catch (error) {
    console.error('markAttendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/attendance ──────────────────────────────────────────────────────
// @desc   Get attendance with filters
// @access Private (Admin, Teacher)
const getAttendance = async (req, res) => {
  try {
    const { classId, date, status, startDate, endDate } = req.query;
    let query = {};

    if (classId) query.class = classId;
    if (status) query.status = status;

    if (date) {
      const d = parseToMidnightUTC(date);
      const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      query.date = { $gte: d, $lt: next };
    } else if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = parseToMidnightUTC(startDate);
      if (endDate) {
        const endD = parseToMidnightUTC(endDate);
        query.date.$lt = new Date(endD.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId email department year section')
      .populate('teacher', 'name teacherId email')
      .populate('class', 'className department year section')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/attendance/student/:studentId ───────────────────────────────────
const getStudentAttendance = async (req, res) => {
  try {
    const { startDate, endDate, classId } = req.query;
    let targetStudentId = req.params.studentId;

    let studentDoc = null;

    // 1. If a valid ObjectId was passed, check Student collection directly
    if (targetStudentId && targetStudentId !== 'me' && mongoose.Types.ObjectId.isValid(targetStudentId)) {
      studentDoc = await Student.findById(targetStudentId);
      if (!studentDoc) {
        studentDoc = await Student.findOne({ userId: targetStudentId });
      }
    }

    // 2. If still not found and we have a logged-in user (especially if role is student or param was 'me')
    if (!studentDoc && req.user) {
      studentDoc = await Student.findOne({
        $or: [
          { userId: req.user._id },
          { email: { $regex: new RegExp(`^${req.user.email}$`, 'i') } },
        ],
      });
    }

    // 3. If student user still has no Student profile in DB, auto-create one so their dashboard works
    if (!studentDoc && req.user && req.user.role === 'student') {
      const defaultClass = await Class.findOne();
      studentDoc = await Student.create({
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
          $addToSet: { students: studentDoc._id },
        });
      }
    }

    // Collect all valid ObjectIds representing this student
    const studentQueryIds = [];
    if (studentDoc) {
      studentQueryIds.push(studentDoc._id);
      if (studentDoc.userId) studentQueryIds.push(studentDoc.userId);
    }
    if (targetStudentId && targetStudentId !== 'me' && mongoose.Types.ObjectId.isValid(targetStudentId)) {
      if (!studentQueryIds.some((id) => id.toString() === targetStudentId.toString())) {
        studentQueryIds.push(new mongoose.Types.ObjectId(targetStudentId));
      }
    }
    if (req.user && req.user._id) {
      if (!studentQueryIds.some((id) => id.toString() === req.user._id.toString())) {
        studentQueryIds.push(req.user._id);
      }
    }

    if (studentQueryIds.length === 0) {
      return res.json({
        success: true,
        attendance: [],
        stats: { total: 0, present: 0, absent: 0, late: 0, percentage: '0.00' },
      });
    }

    let query = { student: { $in: studentQueryIds } };

    if (classId) query.class = classId;

    if (startDate || endDate) {
      query.date = {};
      if (startDate) query.date.$gte = parseToMidnightUTC(startDate);
      if (endDate) {
        const endD = parseToMidnightUTC(endDate);
        query.date.$lt = new Date(endD.getTime() + 24 * 60 * 60 * 1000);
      }
    }

    const attendance = await Attendance.find(query)
      .populate('class', 'className department year section')
      .populate('teacher', 'name teacherId email')
      .sort({ date: -1, createdAt: -1 });

    const total = attendance.length;
    const present = attendance.filter((a) => a.status === 'present').length;
    const absent = attendance.filter((a) => a.status === 'absent').length;
    const late = attendance.filter((a) => a.status === 'late').length;

    const percentage = total > 0 ? ((present / total) * 100).toFixed(2) : '0.00';

    res.json({
      success: true,
      attendance,
      stats: { total, present, absent, late, percentage },
    });
  } catch (error) {
    console.error('getStudentAttendance error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/attendance/class/:classId ───────────────────────────────────────
// @desc   Get attendance for a specific class
// @access Private
const getClassAttendance = async (req, res) => {
  try {
    const { date } = req.query;
    let query = { class: req.params.classId };

    if (date) {
      const d = parseToMidnightUTC(date);
      const next = new Date(d.getTime() + 24 * 60 * 60 * 1000);
      query.date = { $gte: d, $lt: next };
    }

    const attendance = await Attendance.find(query)
      .populate('student', 'name studentId email department year section')
      .populate('teacher', 'name teacherId email')
      .sort({ date: -1, createdAt: -1 });

    res.json({ success: true, count: attendance.length, attendance });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── GET /api/attendance/stats/overview ───────────────────────────────────────
// @desc   Get overall attendance statistics for admin dashboard
// @access Private (Admin)
const getAttendanceStats = async (req, res) => {
  try {
    const today = parseToMidnightUTC();
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    const todayAttendance = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
    });

    const todayPresent = await Attendance.countDocuments({
      date: { $gte: today, $lt: tomorrow },
      status: 'present',
    });

    const totalStudents = await Student.countDocuments();
    const totalTeachers = await Teacher.countDocuments();
    const totalClasses = await Class.countDocuments();

    const totalAttendance = await Attendance.countDocuments();
    const totalPresent = await Attendance.countDocuments({ status: 'present' });
    const overallPercentage =
      totalAttendance > 0 ? ((totalPresent / totalAttendance) * 100).toFixed(2) : '0.00';

    const recentAttendance = await Attendance.find()
      .populate('student', 'name studentId department')
      .populate('class', 'className department')
      .sort({ createdAt: -1 })
      .limit(10);

    res.json({
      success: true,
      stats: {
        totalStudents,
        totalTeachers,
        totalClasses,
        todayAttendance,
        todayPresent,
        totalAttendance,
        overallPercentage,
      },
      recentAttendance,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── PUT /api/attendance/:id ──────────────────────────────────────────────────
// @desc   Update an attendance record
// @access Private (Teacher, Admin)
const updateAttendance = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const attendance = await Attendance.findById(req.params.id);

    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    if (status) attendance.status = status;
    if (remarks !== undefined) attendance.remarks = remarks;

    await attendance.save();

    const populated = await Attendance.findById(attendance._id)
      .populate('student', 'name studentId email department year section')
      .populate('teacher', 'name teacherId email')
      .populate('class', 'className department year section');

    res.json({
      success: true,
      message: 'Attendance record updated successfully',
      attendance: populated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ─── DELETE /api/attendance/:id ───────────────────────────────────────────────
// @desc   Delete an attendance record
// @access Private (Admin)
const deleteAttendance = async (req, res) => {
  try {
    const attendance = await Attendance.findByIdAndDelete(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }
    res.json({ success: true, message: 'Attendance record deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  markAttendance,
  getAttendance,
  getStudentAttendance,
  getClassAttendance,
  getAttendanceStats,
  updateAttendance,
  deleteAttendance,
};
