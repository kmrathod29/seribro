// backend/routes/companyApplicationRoutes.js
// Company Application Management Routes - Phase 4.3

const express = require('express');
const router = express.Router();

// Controllers
const {
    getProjectApplications,
    getAllCompanyApplications,
    getApplicationDetails,
    shortlistApplication,
    approveStudentForProject, // Phase 4.5
    acceptApplication,
    rejectApplication,
    bulkRejectApplications,
    getApplicationStats,
} = require('../controllers/companyApplicationController');

// Middleware
const { protect, roleCheck } = require('../middleware/authMiddleware');
const {
    ensureApplicationOwnership,
    validateRejectionReason,
    ensureProjectOwner,
} = require('../middleware/company/applicationAccessMiddleware');

// ============================================
// APPLICATION ROUTES
// ============================================

// IMPORTANT: Route order matters in Express!
// More specific routes MUST come before generic :paramName routes

// GET    /api/company/applications/stats
// Company ke sabhi applications ke stats
// @access Private (Company)
router.get(
    '/stats',
    protect,
    roleCheck('company'),
    getApplicationStats
);

// GET    /api/company/applications/all
// Company ke sabhi projects ke sab applications
// Params: page, limit, status, projectId
// @access Private (Company)
router.get(
    '/all',
    protect,
    roleCheck('company'),
    getAllCompanyApplications
);

// GET    /api/company/applications/projects/:projectId/applications
// Project ke liye sab applications
// @access Private (Company)
router.get(
    '/projects/:projectId/applications',
    protect,
    roleCheck('company'),
    ensureProjectOwner,
    getProjectApplications
);

// POST   /api/company/applications/:applicationId/shortlist
// Application ko shortlist karo
// @access Private (Company)
router.post(
    '/:applicationId/shortlist',
    protect,
    roleCheck('company'),
    ensureApplicationOwnership,
    shortlistApplication
);

// POST   /api/company/applications/:applicationId/approve (Phase 4.5)
// Application ko approve karo (other auto-reject, project assign)
// @access Private (Company)
router.post(
    '/:applicationId/approve',
    protect,
    roleCheck('company'),
    ensureApplicationOwnership,
    approveStudentForProject
);

// POST   /api/company/applications/:applicationId/accept (Legacy - backward compatibility)
// Application ko accept karo (other auto-reject)
// @access Private (Company)
router.post(
    '/:applicationId/accept',
    protect,
    roleCheck('company'),
    ensureApplicationOwnership,
    acceptApplication
);

// POST   /api/company/applications/:applicationId/reject
// Application ko reject karo with reason
// @access Private (Company)
router.post(
    '/:applicationId/reject',
    protect,
    roleCheck('company'),
    ensureApplicationOwnership,
    validateRejectionReason,
    rejectApplication
);

// POST   /api/company/applications/bulk-reject
// Multiple applications ko bulk reject karo
// @access Private (Company)
router.post(
    '/bulk-reject',
    protect,
    roleCheck('company'),
    validateRejectionReason,
    bulkRejectApplications
);

// GET    /api/company/applications/:applicationId
// Single application ka complete details
// IMPORTANT: This MUST be last because :applicationId matches anything
// @access Private (Company)
router.get(
    '/:applicationId',
    protect,
    roleCheck('company'),
    ensureApplicationOwnership,
    getApplicationDetails
);

module.exports = router;
