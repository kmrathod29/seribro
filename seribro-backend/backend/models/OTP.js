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
  // Purpose indicates where OTP is used: 'signup' for account creation, 'verify' for login/verification
  purpose: {
    type: String,
    enum: ['signup', 'verify'],
    default: 'verify',
  },
  // When an OTP for signup has been validated, we mark verified=true so account creation can proceed
  verified: {
    type: Boolean,
    default: false,
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