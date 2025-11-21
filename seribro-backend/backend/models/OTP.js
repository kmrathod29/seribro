const mongoose = require('mongoose');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    // Hinglish: Email jiske liye OTP generate hua hai
  },
  otp: {
    type: String,
    required: true,
    // Hinglish: 6-digit OTP code
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 600, // Hinglish: 10 minutes (600 seconds) ke baad document automatically delete ho jayega
    // Hinglish: Yeh TTL index hai, jo 10 minute mein expire ho jayega
  },
});

const OTP = mongoose.model('OTP', OTPSchema);

module.exports = OTP;