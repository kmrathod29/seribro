// backend/middleware/student/isVerified.js
// Checks if student's email is verified (OTP completed) - Phase 2.1

const sendResponse = require('../../utils/students/sendResponse');
const User = require('../../models/User');

const isProfileVerified = async (req, res, next) => {
    try {
        const userId = req.user?.id || req.user?._id;

        if (!userId) {
            return sendResponse(res, 401, false, 'User authentication failed. Please login again.');
        }

        const user = await User.findById(userId).select('emailVerified');

        if (!user) {
            return sendResponse(res, 404, false, 'User record not found.');
        }

        if (!user.emailVerified) {
            return sendResponse(res, 403, false, 'Access denied. Your email is not verified. Please complete OTP verification first.');
        }

        // Email is verified, proceed
        next();
    } catch (error) {
        console.error('❌ Error in isProfileVerified middleware:', error);
        return sendResponse(res, 500, false, 'Server error during verification check.', null, error.message);
    }
};

module.exports = { isProfileVerified };