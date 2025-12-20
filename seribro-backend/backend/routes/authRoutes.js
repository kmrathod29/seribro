// routes/authRoutes.js (Hinglish: Authentication ke saare routes)

const express = require('express');
const router = express.Router();
const {
  registerStudent,
  registerCompany,
  createStudentAccount,
  createCompanyAccount,
  sendOtp,
  verifyOtp,
  loginUser,
  logoutUser,
  forgotPassword, // Hinglish: Naya function import kiya
  resetPassword, // Hinglish: Naya function import kiya
} = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');
const { protect } = require('../middleware/authMiddleware');

// Hinglish: Student registration route (accepts multipart for flexibility)
router.post('/student/register', upload.single('collegeId'), registerStudent);
// New: finalize student account creation after OTP signup verification
router.post('/student/create-account', createStudentAccount);

// Hinglish: Company registration route (file upload ke saath)
router.post('/company/register', upload.single('verificationDocument'), registerCompany);
// New: finalize company account creation after OTP signup verification
router.post('/company/create-account', createCompanyAccount);

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


