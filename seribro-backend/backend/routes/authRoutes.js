// routes/authRoutes.js (Hinglish: Authentication ke saare routes)

const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerCompany,
  sendOtp,
  verifyOtp,
  loginUser,
  logoutUser,
  forgotPassword, // Hinglish: Naya function import kiya
  resetPassword, // Hinglish: Naya function import kiya
} = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Hinglish: Student registration route (file upload ke saath)
router.post('/student/register', upload.single('collegeId'), registerStudent);

// Hinglish: Company registration route (file upload ke saath)
router.post('/company/register', upload.single('verificationDocument'), registerCompany);

// Hinglish: OTP se related routes
router.post('/send-otp', sendOtp);
router.post('/verify-otp', verifyOtp);

// Hinglish: Login aur Logout routes
router.post('/login', loginUser);
router.post('/logout', logoutUser);

// Hinglish: Password Reset routes
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;


