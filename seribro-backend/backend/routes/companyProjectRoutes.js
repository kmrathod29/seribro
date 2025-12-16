// backend/routes/companyProjectRoutes.js
// Company project management routes - Phase 4.1

const express = require('express');
const router = express.Router();

// Controllers
const {
    createProject,
    getCompanyProjects,
    getProjectDetails,
    updateProject,
    deleteProject,
    getProjectApplications,
    shortlistStudent,
    assignProject,
    getProjectStats,
} = require('../controllers/companyProjectController');

// Middleware
const { protect, roleCheck } = require('../middleware/authMiddleware');
const { profileCompletionCheck } = require('../middleware/company/profileCompletionCheck');
const { validateProjectCreation, validateProjectUpdate } = require('../middleware/company/projectValidation');
const { ensureProjectOwner, checkProjectStatus } = require('../middleware/company/projectAccessMiddleware');

// ============================================
// PROJECT ROUTES
// ============================================

// POST   /api/company/projects/create
// Create new project
// @access Private (Company - 100% profile complete)
router.post(
    '/create',
    protect,
    roleCheck('company'),
    profileCompletionCheck,
    validateProjectCreation,
    createProject
);

// GET    /api/company/projects/my-projects
// Get all projects of company with pagination & filtering
// @access Private (Company)
router.get(
    '/my-projects',
    protect,
    roleCheck('company'),
    getCompanyProjects
);

// GET    /api/company/projects/stats/summary
// Get project statistics
// @access Private (Company)
router.get(
    '/stats/summary',
    protect,
    roleCheck('company'),
    getProjectStats
);

// GET    /api/company/projects/:id
// Get single project details
// @access Private (Company)
router.get(
    '/:id',
    protect,
    roleCheck('company'),
    ensureProjectOwner,
    getProjectDetails
);

// PUT    /api/company/projects/:id
// Update project (only if status is 'open')
// @access Private (Company)
router.put(
    '/:id',
    protect,
    roleCheck('company'),
    ensureProjectOwner,
    validateProjectUpdate,
    updateProject
);

// DELETE /api/company/projects/:id
// Delete project (soft delete, only if no applications)
// @access Private (Company)
router.delete(
    '/:id',
    protect,
    roleCheck('company'),
    ensureProjectOwner,
    deleteProject
);

// ============================================
// APPLICATIONS & ASSIGNMENTS
// ============================================

// GET    /api/company/projects/:id/applications
// Get all applications for a project
// @access Private (Company)
router.get(
    '/:id/applications',
    protect,
    roleCheck('company'),
    ensureProjectOwner,
    getProjectApplications
);

// POST   /api/company/projects/:id/shortlist/:studentId
// Shortlist a student for the project
// @access Private (Company)
router.post(
    '/:id/shortlist/:studentId',
    protect,
    roleCheck('company'),
    ensureProjectOwner,
    shortlistStudent
);

// POST   /api/company/projects/:id/assign/:studentId
// Assign project to a student
// @access Private (Company)
router.post(
    '/:id/assign/:studentId',
    protect,
    roleCheck('company'),
    ensureProjectOwner,
    assignProject
);

module.exports = router;
