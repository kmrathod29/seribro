// utils/admin/sendVerificationEmail.js
// Hinglish: Approval/Reject par user ko email bhejne ka helper

const sendEmail = require('../sendEmail');

/**
 * Send verification email to user/company
 * @param {string} toEmail
 * @param {'approved'|'rejected'} status
 * @param {'student'|'company'} entityType
 * @param {string} name
 * @param {string} [reason]
 */
const sendVerificationEmail = async (toEmail, status, entityType, name, reason = '') => {
  try {
    if (!toEmail) return;

    const subject =
      status === 'approved'
        ? `${entityType === 'student' ? 'Student' : 'Company'} Verification Approved`
        : `${entityType === 'student' ? 'Student' : 'Company'} Verification Rejected`;

    const title = status === 'approved' ? 'Congratulations!' : 'Verification Update';
    const statusLine =
      status === 'approved'
        ? 'Aapka verification approve ho chuka hai.'
        : 'Aapka verification reject kar diya gaya hai.';

    const reasonLine = status === 'rejected' && reason ? `Reason: ${reason}` : '';

    const html = `
      <div>
        <h2>${title}</h2>
        <p>Hi ${name || ''},</p>
        <p>${statusLine}</p>
        <p>${reasonLine}</p>
        <p>Regards,<br/>Seribro Admin Team</p>
      </div>
    `;

    await sendEmail({ to: toEmail, subject, html });
  } catch (err) {
    console.error('Failed to send verification email:', err.message);
  }
};

module.exports = { sendVerificationEmail };
