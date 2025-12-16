// utils/generateResetToken.js (Hinglish: Password reset ke liye secure token generate karne ka utility)

const crypto = require('crypto');

/**
 * Hinglish: Secure, random token generate karta hai.
 * @returns {string} 32-40 characters ka secure token.
 */
const generateResetToken = () => {
  // Hinglish: 20 bytes ka random data generate karna
  const token = crypto.randomBytes(20).toString('hex');
  // Hinglish: Token ki length 40 characters hogi (20 bytes * 2 for hex)
  return token;
};

module.exports = generateResetToken;
