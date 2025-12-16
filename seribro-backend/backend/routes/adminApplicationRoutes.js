// backend/routes/adminApplicationRoutes.js
// Hinglish: Admin application monitoring routes

const express = require('express');
const router = express.Router();

const {
  getApplicationStats,
  getAllApplications,
  getApplicationDetails
} = require('../controllers/adminApplicationController');

const { protect } = require('../middleware/authMiddleware');
const { isAdmin } = require('../middleware/roleMiddleware');

// Hinglish: Sab routes protected hain - admin login zaroori hai

// GET /api/admin/applications/stats
// Application statistics
router.get('/stats', protect, isAdmin, getApplicationStats);

// GET /api/admin/applications/all
// Sab applications fetch karo filters ke saath
router.get('/all', protect, isAdmin, getAllApplications);

// GET /api/admin/applications/:applicationId
// Single application ka detailed view - full student profile ke saath
router.get('/:applicationId', protect, isAdmin, getApplicationDetails);

module.exports = router;
