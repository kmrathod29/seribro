const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/student/roleMiddleware');
const {
  createOrder,
  verifyPayment,
  markReadyForRelease,
  getPendingReleases,
  releasePayment,
  refundPayment,
  getPaymentDetails,
  getStudentEarnings,
} = require('../controllers/paymentController');

// Company routes
router.post('/create-order', protect, roleMiddleware(['company']), createOrder);
router.post('/verify', protect, roleMiddleware(['company']), verifyPayment);

// Student routes
router.get('/student/earnings', protect, roleMiddleware(['student']), getStudentEarnings);

// Admin routes
router.get('/admin/pending-releases', protect, roleMiddleware(['admin']), getPendingReleases);
router.post('/admin/:paymentId/release', protect, roleMiddleware(['admin']), releasePayment);
router.post('/admin/:paymentId/refund', protect, roleMiddleware(['admin']), refundPayment);

// Shared
router.get('/:paymentId', protect, getPaymentDetails);

module.exports = router;