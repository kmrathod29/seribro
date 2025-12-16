// backend/routes/applicationSelectionRoutes.js
// Routes for multi-stage application selection - Phase 4.5+

const express = require('express');
const router = express.Router();
const {
    shortlistApplications,
    selectStudent,
    acceptApplication,
    declineApplication,
    autoTimeoutApplications,
    getApplicationsByStatus,
} = require('../controllers/applicationSelectionController');
const {
    validateShortlist,
    validateSelection,
    validateStudentResponse,
    rateLimitAcceptance,
} = require('../middleware/applicationSelectionValidation');
const { protect, authorize } = require('../middleware/authMiddleware');

// ============================================
// COMPANY ROUTES
// ============================================

/**
 * POST /api/company/applications/shortlist
 * Shortlist applications (bulk) with priority
 */
router.post(
    '/shortlist',
    protect,
    authorize('company'),
    validateShortlist,
    shortlistApplications
);

/**
 * POST /api/company/applications/select
 * Select one student (set deadline, move others to on_hold)
 */
router.post(
    '/select',
    protect,
    authorize('company'),
    validateSelection,
    selectStudent
);

/**
 * GET /api/company/applications/grouped/:projectId
 * Get applications grouped by status
 */
router.get(
    '/grouped/:projectId',
    protect,
    authorize('company'),
    getApplicationsByStatus
);

// ============================================
// STUDENT ROUTES
// ============================================

/**
 * POST /api/student/applications/:id/accept
 * Student accepts the selected project
 */
router.post(
    '/:id/accept',
    protect,
    authorize('student'),
    rateLimitAcceptance,
    validateStudentResponse,
    acceptApplication
);

/**
 * POST /api/student/applications/:id/decline
 * Student declines the selected project
 */
router.post(
    '/:id/decline',
    protect,
    authorize('student'),
    rateLimitAcceptance,
    validateStudentResponse,
    declineApplication
);

// ============================================
// ADMIN/SYSTEM ROUTES
// ============================================

/**
 * POST /api/system/applications/auto-timeout
 * Auto-expire applications that exceeded deadline
 * Background job - runs every 5 minutes
 */
router.post(
    '/system/auto-timeout',
    protect,
    authorize('admin'),
    autoTimeoutApplications
);

module.exports = router;
