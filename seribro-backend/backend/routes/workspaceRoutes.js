// backend/routes/workspaceRoutes.js
// Project Workspace routes - Phase 5.1

const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/student/roleMiddleware');
const { uploadMessageFiles } = require('../middleware/workspaceUploadMiddleware');
const {
    getWorkspaceOverview,
    sendMessage,
    getMessages,
    markMessagesAsRead,
} = require('../controllers/workspaceController');

// All routes require authentication
router.use(protect);

// Workspace overview
router.get('/projects/:projectId', roleMiddleware(['student', 'company']), getWorkspaceOverview);

// Message routes
router.post(
    '/projects/:projectId/messages',
    roleMiddleware(['student', 'company']),
    uploadMessageFiles,
    sendMessage
);
router.get('/projects/:projectId/messages', roleMiddleware(['student', 'company']), getMessages);
router.put('/projects/:projectId/messages/read', roleMiddleware(['student', 'company']), markMessagesAsRead);

module.exports = router;

