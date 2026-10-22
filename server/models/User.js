/**
 * models/User.js — User Schema
 *
 * The User model handles authentication for Admin, Teacher, and Student.
 * Every person who logs in must have a User record.
 *
 * Why separate User from Student/Teacher?
 * - Keeps login/auth logic clean and separate from profile data
 * - One User can link to one Student or Teacher profile
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,       // No two users can share the same email
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
    },
    role: {
      type: String,
      enum: ['admin', 'teacher', 'student'],  // Only these 3 values allowed
      default: 'student',
    },
    phone: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt fields
  }
);

// ─── Hash password before saving ─────────────────────────────────────────────
// This is a Mongoose "pre-save hook" — it runs automatically before save()
// bcrypt converts the plain password into a secure hash
// Note: In Mongoose 7+, async hooks should NOT call next() — they just resolve.
userSchema.pre('save', async function () {
  // Only hash if password was changed (not on other updates)
  if (!this.isModified('password')) return;

  const salt = await bcrypt.genSalt(10); // 10 rounds = good security/speed balance
  this.password = await bcrypt.hash(this.password, salt);
});

// ─── Method to compare passwords on login ────────────────────────────────────
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
