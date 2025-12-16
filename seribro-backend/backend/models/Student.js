// models/Student.js (Hinglish: Student ka detailed model)

const mongoose = require('mongoose');
const User = require('./User'); // Hinglish: Base User model ko import kiya

const StudentSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    // Hinglish: Har student ka ek corresponding User document hoga
  },
  fullName: {
    type: String,
    required: [true, 'Full Name is required'], // Hinglish: Pura naam zaroori hai
    trim: true,
  },
  college: {
    type: String,
    required: [true, 'College name is required'], // Hinglish: College ka naam zaroori hai
    trim: true,
  },
  skills: {
    type: [String], // Hinglish: Skills ka array
    default: [],
    // Hinglish: Frontend se comma-separated string aayega, jise controller mein array mein convert karenge
  },
  collegeId: {
    type: String, // Hinglish: File path store hoga
    default: '', // Made optional - can be uploaded later in profile
  },
  // Hinglish: Baaki fields Phase-2 mein aayenge
}, {
  timestamps: true,
});

const Student = mongoose.model('Student', StudentSchema);

module.exports = Student;