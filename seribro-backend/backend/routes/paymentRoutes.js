const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/student/roleMiddleware');
const {
  createOrder,
  verifyPayment,
  markReadyForRelease,
  getPendingReleases,
  releasePayment,
  bulkReleasePayments,
  refundPayment,
  getPaymentDetails,
  getStudentEarnings,
  getCompanyPayments,
  getAdminPayments,
} = require('../controllers/paymentController');

// Company routes
router.post('/create-order', protect, roleMiddleware(['company']), createOrder);
router.post('/verify', protect, roleMiddleware(['company']), verifyPayment);

// Student routes
router.get('/student/earnings', protect, roleMiddleware(['student']), getStudentEarnings);

// Company routes
router.get('/company/payments', protect, roleMiddleware(['company']), getCompanyPayments);

// Admin routes
router.get('/admin/pending-releases', protect, roleMiddleware(['admin']), getPendingReleases);
// Admin: full payments list + stats
router.get('/admin/payments', protect, roleMiddleware(['admin']), getAdminPayments);
router.post('/admin/:paymentId/release', protect, roleMiddleware(['admin']), releasePayment);
router.post('/admin/bulk-release', protect, roleMiddleware(['admin']), bulkReleasePayments);
router.post('/admin/:paymentId/refund', protect, roleMiddleware(['admin']), refundPayment);

// Shared
router.get('/:paymentId', protect, getPaymentDetails);

module.exports = router;