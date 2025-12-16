// models/Company.js (Hinglish: Company ka detailed model)

const mongoose = require('mongoose');
const User = require('./User'); // Hinglish: Base User model ko import kiya

const CompanySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
    // Hinglish: Har company ka ek corresponding User document hoga
  },
  contactPersonName: {
    type: String,
    required: [true, 'Contact Person Name is required'], // Hinglish: Contact person ka naam zaroori hai
    trim: true,
  },
  companyName: {
    type: String,
    required: [true, 'Company Name is required'], // Hinglish: Company ka naam zaroori hai
    unique: true,
    trim: true,
  },
  verificationDocument: {
    type: String, // Hinglish: File path store hoga
    required: [true, 'Verification Document is required'], // Hinglish: Verification document zaroori hai
  },
  // Hinglish: Baaki fields Phase-2 mein aayenge
}, {
  timestamps: true,
});

const Company = mongoose.model('Company', CompanySchema);

module.exports = Company;