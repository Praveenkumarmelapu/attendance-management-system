/**
 * models/Attendance.js — Attendance Record Schema
 *
 * Each Attendance document = one student's attendance for one day in one class.
 *
 * The compound unique index on [student + class + date] prevents
 * duplicate attendance from being marked for the same student on the same day.
 */

const mongoose = require('mongoose');

const attendanceSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: [true, 'Student is required'],
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher',
      required: [true, 'Teacher is required'],
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class is required'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    status: {
      type: String,
      enum: ['present', 'absent', 'late'], // Only these values are valid
      required: [true, 'Status is required'],
    },
    remarks: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// ─── Compound Unique Index ────────────────────────────────────────────────────
// Prevents the same student from having two attendance records
// for the same class on the same date
attendanceSchema.index({ student: 1, class: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('Attendance', attendanceSchema);
