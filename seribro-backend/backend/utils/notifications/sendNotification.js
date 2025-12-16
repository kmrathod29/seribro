// backend/utils/notifications/sendNotification.js
// Notification Utility - Phase 3
// Hinglish: Notifications send karne ka utility function

const Notification = require('../../models/Notification');

/**
 * Hinglish: Notification send karna function
 * @param {String} userId - User ID jisko notification send karna hai
 * @param {String} userRole - User ka role (student, company, admin)
 * @param {String} message - Notification ka message
 * @param {String} type - Notification ki type (profile-submitted, approved, rejected)
 * @param {String} relatedProfileType - Related profile ka type (student, company)
 * @param {String} relatedProfileId - Related profile ka ID
 * @returns {Object} Created notification object
 */
const sendNotification = async (
  userId,
  userRole,
  message,
  type,
  relatedProfileType,
  relatedProfileId
) => {
  try {
    // Hinglish: Validation check karna
    if (!userId || !userRole || !message || !type) {
      console.error('Missing required parameters for notification');
      return null;
    }

    // Hinglish: Notification object create karna
    const notificationData = {
      userId,
      userRole,
      message,
      type,
      isRead: false,
      createdAt: new Date(),
    };

    // Hinglish: Optional fields add karna agar provided hain
    if (relatedProfileType) {
      notificationData.relatedProfileType = relatedProfileType;
    }
    if (relatedProfileId) {
      notificationData.relatedProfileId = relatedProfileId;
    }

    // Hinglish: Notification database mein save karna
    const notification = await Notification.create(notificationData);

    console.log(`Notification sent successfully to user ${userId}`);
    return notification;
  } catch (error) {
    console.error(`Error sending notification: ${error.message}`);
    return null;
  }
};

/**
 * Hinglish: Admin ko notification send karna
 * @param {String} message - Notification ka message
 * @param {String} type - Notification ki type
 * @param {String} relatedProfileType - Related profile ka type
 * @param {String} relatedProfileId - Related profile ka ID
 */
const sendAdminNotification = async (
  message,
  type,
  relatedProfileType,
  relatedProfileId
) => {
  try {
    // Hinglish: Admin user ko database se fetch karna
    const User = require('../../models/User');
    const adminUser = await User.findOne({ role: 'admin' }).limit(1);

    if (!adminUser) {
      console.error('No admin user found');
      return null;
    }

    // Hinglish: Admin ko notification send karna
    return await sendNotification(
      adminUser._id,
      'admin',
      message,
      type,
      relatedProfileType,
      relatedProfileId
    );
  } catch (error) {
    console.error(`Error sending admin notification: ${error.message}`);
    return null;
  }
};

module.exports = {
  sendNotification,
  sendAdminNotification,
};
