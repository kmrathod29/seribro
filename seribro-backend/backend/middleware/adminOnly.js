// middleware/adminOnly.js
// Hinglish: Admin-only access middleware - sirf admin hi access kar sakta hai

/**
 * @desc Admin-only middleware
 * @note Yeh middleware protect middleware ke baad run hota hai
 * @note Agar user admin nahi hai, toh 403 error throw karta hai
 */
const adminOnly = (req, res, next) => {
  // Hinglish: Check karo ki req.user exist karta hai
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, user not found (Hinglish: Unauthorized, user nahi mila)');
  }

  // Hinglish: Check karo ki user ka role 'admin' hai ya nahi
  if (req.user.role !== 'admin') {
    return res.status(403).json({
      success: false,
message: 'Access denied. Admin only.'
    });
  }

  // Hinglish: Agar admin hai toh aage badho
  next();
};

module.exports = adminOnly;
