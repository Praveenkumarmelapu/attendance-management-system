/**
 * config/db.js — MongoDB Connection
 *
 * What this does:
 * - Uses Mongoose to connect to MongoDB
 * - Mongoose is an ODM (Object Data Modeling) library for MongoDB
 * - It lets us define Schemas and Models to interact with the database
 *
 * MongoDB concepts:
 * - Database: Like a folder that holds all your data (attendance_system)
 * - Collection: Like a table in SQL (users, students, attendance...)
 * - Document: Like a row in SQL — a single record in JSON format
 * - Mongoose Schema: Blueprint for a document (defines fields, types, validation)
 * - Mongoose Model: JS class built from Schema used to query the DB
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI);
    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure if DB connection fails
    process.exit(1);
  }
};

module.exports = connectDB;
