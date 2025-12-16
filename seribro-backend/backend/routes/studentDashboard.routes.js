// backend/routes/studentDashboard.routes.js
// Student Dashboard Routes - Phase 3
// Hinglish: Student dashboard ke liye routes

const express = require('express');
const router = express.Router();
const { protect, roleCheck } = require('../middleware/authMiddleware');
const { isProfileVerified } = require('../middleware/student/isVerified');
const {
  getStudentDashboard,
  submitForVerification,
  resubmitForVerification,
} = require('../controllers/studentDashboard.controller');

// ============ STUDENT DASHBOARD ROUTES ============

/**
 * @route   GET /api/student/dashboard
 * @desc    Get student dashboard overview
 * @access  Private (Student + Verified)
 * Hinglish: Student ka dashboard data fetch karna
 */
router.get('/dashboard', protect, roleCheck(['student']), isProfileVerified, getStudentDashboard);

/**
 * @route   POST /api/student/submit-verification
 * @desc    Submit student profile for verification (initial submit)
 * @access  Private (Student)
 * Hinglish: Student profile ko verification ke liye submit karna
 */
router.post('/submit-verification', protect, roleCheck(['student']), submitForVerification);

/**
 * @route   POST /api/student/resubmit-verification
 * @desc    Resubmit student profile for verification (after rejection)
 * @access  Private (Student)
 * Hinglish: Rejected profile ko fir se submit karna
 */
router.post('/resubmit-verification', protect, roleCheck(['student']), resubmitForVerification);

module.exports = router;
