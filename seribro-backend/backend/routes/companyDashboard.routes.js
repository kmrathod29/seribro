// backend/routes/companyDashboard.routes.js
// Company Dashboard Routes - Phase 3
// Hinglish: Company dashboard ke liye routes

const express = require('express');
const router = express.Router();
const { protect, roleCheck } = require('../middleware/authMiddleware');
const {
  getCompanyDashboard,
  submitForVerification,
  resubmitForVerification,
} = require('../controllers/companyDashboard.controller');

// ============ COMPANY DASHBOARD ROUTES ============

/**
 * @route   GET /api/company/dashboard
 * @desc    Get company dashboard overview
 * @access  Private (Company)
 * Hinglish: Company ka dashboard data fetch karna
 */
router.get('/dashboard', protect, roleCheck('company'), getCompanyDashboard);

/**
 * @route   POST /api/company/submit-verification
 * @desc    Submit company profile for verification
 * @access  Private (Company)
 * Hinglish: Company profile ko verification ke liye submit karna
 */
router.post('/submit-verification', protect, roleCheck('company'), submitForVerification);

/**
 * @route   POST /api/company/resubmit-verification
 * @desc    Resubmit company profile for verification (after rejection)
 * @access  Private (Company)
 * Hinglish: Rejected company profile ko fir se submit karna
 */
router.post('/resubmit-verification', protect, roleCheck('company'), resubmitForVerification);

module.exports = router;
