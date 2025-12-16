const nodemailer = require('nodemailer');

// Hinglish: Brevo SMTP transporter setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,      // smtp-relay.brevo.com
  port: process.env.SMTP_PORT,      // 587
  secure: false,                    // Brevo requires secure:false
  auth: {
    user: process.env.SMTP_USER,    // Brevo SMTP username
    pass: process.env.SMTP_PASS,    // Brevo SMTP key
  },
});

// Hinglish: Email bhejne ka function
const sendEmail = async (options) => {
  const mailOptions = {
    from: `"Seribro" <${process.env.FROM_EMAIL}>`, // Verified Brevo sender email
    to: options.email,                             // Receiver
    subject: options.subject,                      // Subject
    html: options.message,                         // HTML message
  };

  try {
    // Verify SMTP connection before sending (helps debug connection/auth issues)
    try {
      await transporter.verify();
      console.log('✅ SMTP connection verified:', {
        host: process.env.SMTP_HOST,
        user: process.env.SMTP_USER ? process.env.SMTP_USER.replace(/(.{3}).+(@.*)/, '$1***$2') : undefined,
        port: process.env.SMTP_PORT,
      });
    } catch (vErr) {
      console.warn('⚠️ SMTP verification failed (continuing to send, may still work):', vErr && vErr.message ? vErr.message : vErr);
    }
    const info = await transporter.sendMail(mailOptions);
    console.log("📧 Email sent via Brevo:", info.messageId);
  } catch (error) {
    console.error("❌ Email send error:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = sendEmail;
