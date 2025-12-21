// utils/generateToken.js (Hinglish: JWT token generate aur cookie mein set karne ka utility)

const jwt = require('jsonwebtoken');

// Hinglish: JWT token generate karke response mein HTTP-only cookie set karta hai
// extras: optional object with additional fields to include in token payload (e.g., name, email)
const generateToken = (res, userId, role, extras = {}) => {
  // Token payload (Hinglish: Token mein kya data jayega)
  const payload = Object.assign({ userId, role }, extras || {});
  const token = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_COOKIE_EXPIRE, // Hinglish: Token ki expiry
  });

  // Cookie options (Hinglish: Cookie ki settings)
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRE.match(/(\d+)/)[0] * 24 * 60 * 60 * 1000 // Hinglish: Expiry ko milliseconds mein convert kiya
    ),
    httpOnly: true, // Hinglish: JavaScript se access nahi hoga, security ke liye
    secure: process.env.NODE_ENV === 'production', // Hinglish: Production mein HTTPS par hi bhejna
    sameSite: 'strict', // Hinglish: CSRF protection ke liye
  };

  // Cookie set karna (Hinglish: Cookie set kar rahe hain)
  res.cookie('jwt', token, cookieOptions);
};

module.exports = generateToken;