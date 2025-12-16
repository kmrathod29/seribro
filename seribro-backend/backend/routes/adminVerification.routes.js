// routes/adminVerification.routes.js
// Hinglish: Admin ke verification endpoints - protect + adminOnly ke saath

const express = require('express');
const router = express.Router();

// Auth middlewares
const { protect } = require('../middleware/authMiddleware');
const adminOnly = require('../middleware/adminOnly');

// Controllers
const {
  getAdminDashboard,
  getPendingStudents,
  getPendingCompanies,
  getStudentDetails,
  getCompanyDetails,
  approveStudent,
  rejectStudent,
  approveCompany,
  rejectCompany,
  getNotifications,
  markNotificationAsRead,
} = require('../controllers/adminVerificationController');

// Dashboard
router.get('/dashboard', protect, adminOnly, getAdminDashboard);

// Pending lists
router.get('/students/pending', protect, adminOnly, getPendingStudents);
router.get('/companies/pending', protect, adminOnly, getPendingCompanies);

// Detail pages
router.get('/student/:id', protect, adminOnly, getStudentDetails);
router.get('/company/:id', protect, adminOnly, getCompanyDetails);

// Actions - Students
router.post('/student/:id/approve', protect, adminOnly, approveStudent);
router.post('/student/:id/reject', protect, adminOnly, rejectStudent);

// Actions - Companies
router.post('/company/:id/approve', protect, adminOnly, approveCompany);
router.post('/company/:id/reject', protect, adminOnly, rejectCompany);

// ============ NOTIFICATION ROUTES (PHASE 3) ============
// Hinglish: Admin notifications ke liye routes

/**
 * @route   GET /api/admin/notifications
 * @desc    Get all notifications (read + unread)
 * @access  Private (Admin)
 * Hinglish: Admin ke liye sabhi notifications fetch karna
 */
router.get('/notifications', protect, adminOnly, getNotifications);

/**
 * @route   PATCH /api/admin/notifications/:id/read
 * @desc    Mark a notification as read
 * @access  Private (Admin)
 * Hinglish: Notification ko read mark karna
 */
router.patch('/notifications/:id/read', protect, adminOnly, markNotificationAsRead);

module.exports = router;
