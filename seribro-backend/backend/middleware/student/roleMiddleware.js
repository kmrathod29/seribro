// backend/middleware/student/roleMiddleware.js
// Role-based access control - Phase 2.1

const sendResponse = require('../../utils/students/sendResponse');

const roleMiddleware = (allowedRoles) => {
    // Convert single role to array
    const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];

    return (req, res, next) => {
        const userRole = req.user?.role;

        if (!userRole) {
            return sendResponse(res, 401, false, 'Access denied. User role not found.');
        }

        if (!roles.includes(userRole)) {
            return sendResponse(res, 403, false, `Access denied. Only ${roles.join(' or ')} can access this route. Your role: ${userRole}`);
        }

        // Role is authorized, proceed
        next();
    };
};

module.exports = { roleMiddleware };