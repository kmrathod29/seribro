const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/student/roleMiddleware');
const { rateStudent, rateCompany, getProjectRating, getUserRatings } = require('../controllers/ratingController');

router.post('/projects/:projectId/rate-student', protect, roleMiddleware(['company']), rateStudent);
router.post('/projects/:projectId/rate-company', protect, roleMiddleware(['student']), rateCompany);
router.get('/projects/:projectId', protect, getProjectRating);
router.get('/users/:userId', protect, getUserRatings);

module.exports = router;