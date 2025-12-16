// backend/routes/adminProjectRoutes.js
// Hinglish: Admin project monitoring routes

const express = require('express');
const router = express.Router();

const {
  getProjectStats,
  getAllProjects,
  getProjectDetails,
  getProjectApplications
} = require('../controllers/adminProjectController');

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Hinglish: Sab routes protected hain - admin login zaroori hai

// GET /api/admin/projects/stats
// Project statistics
router.get('/stats', protect, isAdmin, getProjectStats);

// GET /api/admin/projects/all
// Sab projects fetch karo filters ke saath
router.get('/all', protect, isAdmin, getAllProjects);

// GET /api/admin/projects/:projectId
// Single project ka detailed view
router.get('/:projectId', protect, isAdmin, getProjectDetails);

// GET /api/admin/projects/:projectId/applications
// Specific project ke applications
router.get('/:projectId/applications', protect, isAdmin, getProjectApplications);

module.exports = router;
