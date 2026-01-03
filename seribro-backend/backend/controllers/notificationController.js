// backend/controllers/notificationController.js
// Hinglish: Notification management controller - get, mark as read, delete

const Notification = require('../models/Notification');

/**
 * Hinglish: Consistent response format
 */
const sendResponse = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ 
    success, 
    message: String(message || 'Operation completed'), 
    data 
  });
};

/**
 * Hinglish: User ke sab notifications nikalo paginated
 * @desc Get user notifications
 * @route GET /api/notifications
 * @access Private
 */
exports.getNotifications = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user.id;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Hinglish: Notifications nikalo latest pehle
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Hinglish: Unread count nikalo
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    const total = await Notification.countDocuments({ userId });
    const totalPages = Math.ceil(total / limitNum);

    return sendResponse(res, true, 'Notifications fetched successfully', {
      notifications,
      unreadCount,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error getting notifications:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Single notification ko read mark karo
 * @desc Mark notification as read
 * @route PUT /api/notifications/:notificationId/read
 * @access Private
 */
exports.markAsRead = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Hinglish: Check karo notification user ka hai ya nahi
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return sendResponse(res, false, 'Notification nahi mila', null, 404);
    }

    if (notification.userId.toString() !== userId) {
      return sendResponse(res, false, 'Access denied', null, 403);
    }

    // Hinglish: Mark as read
    notification.isRead = true;
    await notification.save();

    return sendResponse(res, true, 'Notification marked as read', notification);
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Sab notifications ko read mark karo
 * @desc Mark all notifications as read
 * @route PUT /api/notifications/read-all
 * @access Private
 */
exports.markAllAsRead = async (req, res) => {
  try {
    const userId = req.user.id;

    // Hinglish: Sab unread notifications ko read mark karo
    const result = await Notification.updateMany(
      { userId, isRead: false },
      { $set: { isRead: true } }
    );

    return sendResponse(res, true, 'All notifications marked as read', {
      modifiedCount: result.modifiedCount
    });
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Single notification delete karo
 * @desc Delete notification
 * @route DELETE /api/notifications/:notificationId
 * @access Private
 */
exports.deleteNotification = async (req, res) => {
  try {
    const { notificationId } = req.params;
    const userId = req.user.id;

    // Hinglish: Check karo notification user ka hai ya nahi
    const notification = await Notification.findById(notificationId);

    if (!notification) {
      return sendResponse(res, false, 'Notification nahi mila', null, 404);
    }

    if (notification.userId.toString() !== userId) {
      return sendResponse(res, false, 'Access denied', null, 403);
    }

    // Hinglish: Delete karo
    await Notification.findByIdAndDelete(notificationId);

    return sendResponse(res, true, 'Notification deleted successfully');
  } catch (error) {
    console.error('Error deleting notification:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Sab unread notifications delete karo
 * @desc Delete all read notifications
 * @route DELETE /api/notifications/delete-read
 * @access Private
 */
exports.deleteReadNotifications = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await Notification.deleteMany({
      userId,
      isRead: true
    });

    return sendResponse(res, true, 'Read notifications deleted', {
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error deleting read notifications:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Unread notifications count
 * @desc Get unread count
 * @route GET /api/notifications/unread/count
 * @access Private
 */
exports.getUnreadCount = async (req, res) => {
  try {
    const userId = req.user.id;

    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false
    });

    return sendResponse(res, true, 'Unread count fetched', { unreadCount });
  } catch (error) {
    console.error('Error getting unread count:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};
