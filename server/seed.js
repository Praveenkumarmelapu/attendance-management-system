/**
 * server/seed.js — Database Seeder Script
 *
 * This script creates demo data so you can test the app immediately.
 * It creates:
 * - 1 Admin user
 * - 2 Teachers
 * - 6 Students
 * - 2 Classes
 * - Sample attendance records
 *
 * HOW TO RUN:
 *   cd server
 *   node seed.js
 *
 * WARNING: This will clear existing data in the database!
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');
const Student = require('./models/Student');
const Teacher = require('./models/Teacher');
const Class = require('./models/Class');
const Attendance = require('./models/Attendance');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // ─── Clear existing data ──────────────────────────────────────
    console.log('🗑️  Clearing existing data...');
    await Promise.all([
      User.deleteMany({}),
      Student.deleteMany({}),
      Teacher.deleteMany({}),
      Class.deleteMany({}),
      Attendance.deleteMany({}),
    ]);

    // ─── Create Admin User ────────────────────────────────────────
    console.log('👤 Creating admin...');
    const adminUser = await User.create({
      name: 'System Admin',
      email: 'admin@school.com',
      password: 'admin123',
      role: 'admin',
      phone: '+91 9000000000',
    });
    console.log('   ✅ Admin: admin@school.com / admin123');

    // ─── Create Teachers ──────────────────────────────────────────
    console.log('👨‍🏫 Creating teachers...');
    const teacher1User = await User.create({
      name: 'Dr. Rajesh Kumar',
      email: 'teacher@school.com',
      password: 'teacher123',
      role: 'teacher',
      phone: '+91 9111111111',
    });
    const teacher1 = await Teacher.create({
      teacherId: 'TCH001',
      name: 'Dr. Rajesh Kumar',
      email: 'teacher@school.com',
      phone: '+91 9111111111',
      department: 'Computer Science',
      userId: teacher1User._id,
    });

    const teacher2User = await User.create({
      name: 'Prof. Priya Sharma',
      email: 'teacher2@school.com',
      password: 'teacher123',
      role: 'teacher',
      phone: '+91 9222222222',
    });
    const teacher2 = await Teacher.create({
      teacherId: 'TCH002',
      name: 'Prof. Priya Sharma',
      email: 'teacher2@school.com',
      phone: '+91 9222222222',
      department: 'Electronics',
      userId: teacher2User._id,
    });
    console.log('   ✅ teacher@school.com / teacher123');
    console.log('   ✅ teacher2@school.com / teacher123');

    // ─── Create Classes ───────────────────────────────────────────
    console.log('🏫 Creating classes...');
    const class1 = await Class.create({
      className: 'CS-2A',
      department: 'Computer Science',
      year: '2',
      section: 'A',
      teacher: teacher1._id,
    });

    const class2 = await Class.create({
      className: 'EC-3B',
      department: 'Electronics',
      year: '3',
      section: 'B',
      teacher: teacher2._id,
    });

    // ─── Create Students ──────────────────────────────────────────
    console.log('👥 Creating students...');
    const studentsData = [
      { studentId: 'STU001', name: 'Arjun Singh', email: 'student@school.com', phone: '+91 9333333333', department: 'Computer Science', year: '2', section: 'A', class: class1._id },
      { studentId: 'STU002', name: 'Priya Patel', email: 'priya@school.com', phone: '+91 9444444444', department: 'Computer Science', year: '2', section: 'A', class: class1._id },
      { studentId: 'STU003', name: 'Rahul Verma', email: 'rahul@school.com', phone: '+91 9555555555', department: 'Computer Science', year: '2', section: 'A', class: class1._id },
      { studentId: 'STU004', name: 'Sneha Reddy', email: 'sneha@school.com', phone: '+91 9666666666', department: 'Electronics', year: '3', section: 'B', class: class2._id },
      { studentId: 'STU005', name: 'Vikram Nair', email: 'vikram@school.com', phone: '+91 9777777777', department: 'Electronics', year: '3', section: 'B', class: class2._id },
      { studentId: 'STU006', name: 'Anjali Gupta', email: 'anjali@school.com', phone: '+91 9888888888', department: 'Computer Science', year: '2', section: 'A', class: class1._id },
    ];

    const createdStudents = [];
    for (const data of studentsData) {
      const user = await User.create({
        name: data.name,
        email: data.email,
        password: 'student123',
        role: 'student',
        phone: data.phone,
      });
      const student = await Student.create({ ...data, userId: user._id });
      createdStudents.push(student);
    }

    // Update classes with students
    const class1Students = createdStudents.filter(s => s.class.toString() === class1._id.toString());
    const class2Students = createdStudents.filter(s => s.class.toString() === class2._id.toString());

    await Class.findByIdAndUpdate(class1._id, { students: class1Students.map(s => s._id) });
    await Class.findByIdAndUpdate(class2._id, { students: class2Students.map(s => s._id) });

    console.log('   ✅ student@school.com / student123 (and 5 more students)');

    // ─── Create Sample Attendance ─────────────────────────────────
    console.log('📅 Creating sample attendance records...');

    const statuses = ['present', 'present', 'present', 'present', 'absent', 'late'];
    const today = new Date();

    // Create attendance for last 10 days
    for (let dayOffset = 1; dayOffset <= 10; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() - dayOffset);
      date.setHours(0, 0, 0, 0);

      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;

      for (const student of class1Students) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        try {
          await Attendance.create({
            student: student._id,
            teacher: teacher1._id,
            class: class1._id,
            date,
            status,
            remarks: status === 'absent' ? 'No reason provided' : '',
          });
        } catch (e) {
          // Skip duplicate
        }
      }

      for (const student of class2Students) {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        try {
          await Attendance.create({
            student: student._id,
            teacher: teacher2._id,
            class: class2._id,
            date,
            status,
          });
        } catch (e) {}
      }
    }

    console.log('   ✅ Sample attendance created');

    // ─── Done ─────────────────────────────────────────────────────
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('═══════════════════════════════════════════');
    console.log('  LOGIN CREDENTIALS');
    console.log('═══════════════════════════════════════════');
    console.log('  🛡️  Admin:   admin@school.com   / admin123');
    console.log('  👨‍🏫 Teacher: teacher@school.com / teacher123');
    console.log('  🎒 Student: student@school.com / student123');
    console.log('═══════════════════════════════════════════\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seed error:', error);
    process.exit(1);
  }
};

seed();
