// backend/routes/studentProfileRoute.js
// Student Profile API Routes - Phase 2.1

const express = require('express');
const router = express.Router();

// Controller Imports
const {
    getProfile,
    updateBasicInfo,
    updateSkills,
    updateTechStack,
    updatePortfolioLinks,
    uploadResume,
    addProject,
    updateProject,
    deleteProject,
    uploadCollegeId,
    submitForVerification,
    getDashboard
} = require('../controllers/StudentProfileController');

// Middleware Imports - All from student-specific folder
const { protect } = require('../middleware/authMiddleware'); // Phase 1 auth middleware
const { roleMiddleware } = require('../middleware/student/roleMiddleware');
const { validationMiddleware } = require('../middleware/student/validationMiddleware');
const { uploadMiddleware } = require('../middleware/student/uploadMiddleware');
const { profileCompletionCheck } = require('../middleware/student/profileCompletionCheck');
const { isProfileVerified } = require('../middleware/student/isVerified');

// Apply common middleware to all routes
router.use(protect, roleMiddleware(['student']));

// Profile & Dashboard Routes
router.get('/profile', getProfile);
router.get('/dashboard', getDashboard);

// Update Routes
router.put('/profile/basic', validationMiddleware('basicInfo'), updateBasicInfo);
router.put('/profile/skills', validationMiddleware('skills'), updateSkills);
router.put('/profile/tech', validationMiddleware('techStack'), updateTechStack);
router.put('/profile/links', updatePortfolioLinks);

// Document Upload Routes
router.post('/profile/resume', uploadMiddleware.single('resume'), uploadResume);
router.post('/profile/college-id', uploadMiddleware.single('collegeId'), uploadCollegeId);
// Certificates upload route intentionally removed as per updated requirements

// Project Management Routes
router.post('/profile/projects', validationMiddleware('project'), addProject);
router.put('/profile/projects/:id', validationMiddleware('project'), updateProject);
router.delete('/profile/projects/:id', deleteProject);

// Verification Submission Route
// Note: isProfileVerified checks email verification status
// profileCompletionCheck ensures 100% completion
router.post(
    '/profile/submit-verification',
    isProfileVerified,          // Check email verification
    profileCompletionCheck,     // Check 100% profile completion
    submitForVerification
);

module.exports = router;