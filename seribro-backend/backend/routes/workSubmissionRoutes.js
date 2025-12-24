const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/student/roleMiddleware');
const { uploadWorkFiles } = require('../middleware/workSubmissionUploadMiddleware');
const {
  startWork,
  submitWork,
  getSubmissionHistory,
  getCurrentSubmission,
  approveWork,
  requestRevision,
  rejectWork,
} = require('../controllers/workSubmissionController');

// Student routes
router.post('/projects/:projectId/start-work', protect, roleMiddleware(['student']), startWork);
router.post('/projects/:projectId/submit-work', protect, roleMiddleware(['student']), uploadWorkFiles, submitWork);
router.get('/projects/:projectId/submissions', protect, roleMiddleware(['student', 'company']), getSubmissionHistory);
router.get('/projects/:projectId/submissions/current', protect, roleMiddleware(['student', 'company']), getCurrentSubmission);

// Company routes
router.post('/projects/:projectId/approve', protect, roleMiddleware(['company']), approveWork);
router.post('/projects/:projectId/request-revision', protect, roleMiddleware(['company']), requestRevision);
router.post('/projects/:projectId/reject', protect, roleMiddleware(['company']), rejectWork);

module.exports = router;