// middleware/authMiddleware.js (Hinglish: Routes ko protect karne ka middleware)

const jwt = require('jsonwebtoken');
const asyncHandler = require('express-async-handler');
const User = require('../models/User');

// Hinglish: JWT token ko verify karke user ko request object mein add karta hai
const protect = asyncHandler(async (req, res, next) => {
  let token;

  // Hinglish: Cookie se token nikalna
  if (req.cookies.jwt) {
    token = req.cookies.jwt;
  }

  if (token) {
    try {
      // Token verify karna (Hinglish: Verifying the token)
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // User ko database se fetch karna (password field exclude karke)
      // Hinglish: User ko database se fetch kiya (password ke bina)
      req.user = await User.findById(decoded.userId).select('-password');

      // Fetch Student record if user is a student
      if (req.user.role === 'student') {
        const Student = require('../models/Student');
        req.student = await Student.findOne({ user: req.user._id });
        // Attach student ID for controllers
        if (req.student) {
          req.user.studentId = req.student._id;
        }
      }

      next(); // Hinglish: Agle middleware ya controller function par jaao
    } catch (error) {
      console.error(error);
      res.status(401);
      throw new Error('Not authorized, token failed (Hinglish: Unauthorized, token galat hai)');
    }
  } else {
    res.status(401);
    throw new Error('Not authorized, no token (Hinglish: Unauthorized, token nahi mila)');
  }
});

// Hinglish: Role-based access control (RBAC)
const roleCheck = (roles) => (req, res, next) => {
  if (!req.user) {
    res.status(401);
    throw new Error('Not authorized, user not found (Hinglish: Unauthorized, user nahi mila)');
  }

  // Hinglish: Check karna ki user ka role allowed roles mein hai ya nahi
  if (!roles.includes(req.user.role)) {
    res.status(403);
    throw new Error('Not authorized to access this route (Hinglish: Is route ko access karne ki permission nahi hai)');
  }

  next();
};

module.exports = { protect, roleCheck };