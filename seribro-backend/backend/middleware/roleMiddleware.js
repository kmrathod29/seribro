// backend/middleware/roleMiddleware.js
// Hinglish: Role-based access control middleware - admin, company, student

/**
 * Hinglish: Check karo ki user admin hai ya nahi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isAdmin = (req, res, next) => {
  try {
    // Hinglish: Check karo req.user.role ko (authMiddleware se aata hai)
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Pehle login karo'
      });
    }

    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Admin ho ke hi admin dashboard access kar sakte ho'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Role check mein error aaya: ' + error.message
    });
  }
};

/**
 * Hinglish: Check karo ki user company hai ya nahi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isCompany = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Pehle login karo'
      });
    }

    if (req.user.role !== 'company') {
      return res.status(403).json({
        success: false,
        message: 'Company ho ke hi ye feature use kar sakte ho'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Role check mein error aaya: ' + error.message
    });
  }
};

/**
 * Hinglish: Check karo ki user student hai ya nahi
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
const isStudent = (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Pehle login karo'
      });
    }

    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Student ho ke hi ye feature use kar sakte ho'
      });
    }

    next();
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Role check mein error aaya: ' + error.message
    });
  }
};

module.exports = { isAdmin, isCompany, isStudent };
