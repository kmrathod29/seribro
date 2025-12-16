// backend/routes/notificationRoutes.js
// Hinglish: Notification routes

const express = require('express');
const router = express.Router();

const {
  getNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  deleteReadNotifications,
  getUnreadCount
} = require('../controllers/notificationController');

const { protect } = require('../middleware/authMiddleware');

// Hinglish: Sab routes protected hain - login zaroori hai

// GET /api/notifications
// Sab notifications fetch karo
router.get('/', protect, getNotifications);

// GET /api/notifications/unread/count
// Unread count nikalo
router.get('/unread/count', protect, getUnreadCount);

// PUT /api/notifications/:notificationId/read
// Single notification ko read mark karo
router.put('/:notificationId/read', protect, markAsRead);

// PUT /api/notifications/read-all
// Sab notifications ko read mark karo
router.put('/read-all', protect, markAllAsRead);

// DELETE /api/notifications/:notificationId
// Single notification delete karo
router.delete('/:notificationId', protect, deleteNotification);

// DELETE /api/notifications/delete-read
// Read notifications delete karo
router.delete('/delete-read', protect, deleteReadNotifications);

module.exports = router;
