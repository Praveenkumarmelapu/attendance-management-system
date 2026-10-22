/**
 * models/Class.js — Class/Section Schema
 *
 * A Class groups students together under a teacher.
 * - "teacher" is a reference (ObjectId) to the Teacher who teaches this class
 * - "students" is an array of Student ObjectIds enrolled in this class
 */

const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    className: {
      type: String,
      required: [true, 'Class name is required'],
      trim: true,
    },
    department: {
      type: String,
      required: [true, 'Department is required'],
      trim: true,
    },
    year: {
      type: String,
      required: [true, 'Year is required'],
    },
    section: {
      type: String,
      required: [true, 'Section is required'],
      trim: true,
    },
    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Teacher', // Which teacher is assigned to this class
    },
    students: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student', // Array of students in this class
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Class', classSchema);
