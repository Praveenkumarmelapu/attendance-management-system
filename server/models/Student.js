/**
 * models/Student.js — Student Profile Schema
 *
 * Each Student has:
 * - Their own profile data (name, email, department, etc.)
 * - A reference to a User (for login)
 * - A reference to a Class they belong to
 *
 * "ref: 'User'" creates a relationship (like a foreign key in SQL)
 */

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID is required'],
      unique: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    phone: {
      type: String,
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
      trim: true,
    },
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class', // Links to Class model
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Links to User model (for login)
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Student', studentSchema);
