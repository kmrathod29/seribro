// utils/admin/auditLog.js
// Hinglish: Admin ke actions ko log karne ka simple helper

// Optional: Aap yahan ActivityLog mongoose model bhi use kar sakte ho in future
// Abhi ke liye simple console logging kar rahe hain

/**
 * Log an admin action
 * @param {String|ObjectId} adminId - Admin user ID
 * @param {String} action - Action code e.g. APPROVE_STUDENT
 * @param {String|ObjectId|null} targetId - Affected document ID
 * @param {String} message - Human readable message
 */
const logAdminAction = async (adminId, action, targetId = null, message = '') => {
  try {
    // Hinglish: Simple console log, future mein DB me save kar sakte ho
    console.info('[ADMIN-ACTION]', {
      at: new Date().toISOString(),
      adminId,
      action,
      targetId,
      message,
    });
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
};

module.exports = { logAdminAction };
