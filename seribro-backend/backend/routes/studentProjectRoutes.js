// backend/routes/studentProjectRoutes.js
// Student project routes - Phase 4.2

const express = require('express');
const router = express.Router();

// Controllers
const {
    browseProjects,
    getProjectDetails,
    applyToProject,
    getMyApplications,
    getApplicationStats,
    getApplicationDetails,
    withdrawApplication,
    getRecommendedProjects,
} = require('../controllers/studentProjectController');

// Middleware
const { protect } = require('../middleware/authMiddleware');
const {roleMiddleware} = require('../middleware/student/roleMiddleware'); //
const { ensureProfileComplete, checkCanViewDetails } = require('../middleware/student/projectAccessMiddleware');
const {
    validateApplicationData,
    checkDuplicateApplication,
    checkProjectAvailable,
} = require('../middleware/student/applicationValidation');

// ========== APPLY MIDDLEWARE TO ALL ROUTES ==========
// Sabko authentication aur student role check chahiye
router.use(protect, roleMiddleware(['student']));

// ========== BROWSE & RECOMMEND ROUTES - NO PROFILE CHECK ==========
// Ye routes sab students ke liye available hain, profile check zaruri nahi hai

/**
 * @route   GET /api/student/projects/browse
 * @desc    Browse all open projects with filters
 * @access  Private (Student - no profile check)
 */
router.get('/browse', browseProjects);

/**
 * @route   GET /api/student/projects/recommended
 * @desc    Get recommended projects based on student skills
 * @access  Private (Student - no profile check)
 */
router.get('/recommended', getRecommendedProjects);

// ========== DETAILS & APPLY ROUTES - REQUIRES PROFILE CHECK ==========
// In routes ke liye profile 100% complete + verified hona zaroori hai

/**
 * @route   GET /api/student/projects/:id
 * @desc    Get single project details
 * @access  Private (Student - 100% complete + verified)
 */
router.get('/:id', ensureProfileComplete, getProjectDetails);

/**
 * @route   POST /api/student/projects/:id/apply
 * @desc    Apply to a project
 * @access  Private (Student - 100% complete + verified)
 */
router.post(
    '/:id/apply',
    ensureProfileComplete,
    validateApplicationData,
    checkDuplicateApplication,
    checkProjectAvailable,
    applyToProject
);

// ========== APPLICATIONS ROUTES ==========

/**
 * @route   GET /api/student/applications/my-applications
 * @desc    Get all applications of a student
 * @access  Private (Student)
 */
router.get('/applications/my-applications', getMyApplications);

/**
 * @route   GET /api/student/applications/stats
 * @desc    Get application statistics
 * @access  Private (Student)
 */
router.get('/applications/stats', getApplicationStats);

/**
 * @route   GET /api/student/applications/:id
 * @desc    Get single application details
 * @access  Private (Student)
 */
router.get('/applications/:id', getApplicationDetails);

/**
 * @route   PUT /api/student/applications/:id/withdraw
 * @desc    Withdraw an application
 * @access  Private (Student)
 */
router.put('/applications/:id/withdraw', withdrawApplication);

module.exports = router;
