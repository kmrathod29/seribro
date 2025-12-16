// validationMiddleware.js
// Request body data ko validate karne ka middleware

const validator = require('validator');
const { validateBasicCompanyInfo, validateAuthorizedPersonData } = require('../../utils/company/validateCompanyData');

// Utility function for consistent error response
const sendError = (res, message) => {
    return res.status(400).json({
        success: false,
        message: message,
    });
};

// Basic info update ke liye validation
const validateBasicInfo = (req, res, next) => {
    const { companyName, mobile, website } = req.body;

    const validation = validateBasicCompanyInfo({ companyName, mobile, website });

    if (!validation.isValid) {
        const errorMessages = validation.errors.map(err => err.message).join(', ');
        return sendError(res, errorMessages);
    }

    next();
};

// Authorized person update ke liye validation
const validateAuthorizedPerson = (req, res, next) => {
    const { name, designation, email, linkedIn } = req.body;

    const validation = validateAuthorizedPersonData({ name, designation, email, linkedIn });

    if (!validation.isValid) {
        const errorMessages = validation.errors.map(err => err.message).join(', ');
        return sendError(res, errorMessages);
    }

    next();
};

// Details update ke liye validation (zyada validation ki zaroorat nahi, bas basic checks)
const validateDetails = (req, res, next) => {
    const { about } = req.body;

    // about section ki max length check karna
    if (about && about.length > 500) {
        return sendError(res, 'About section 500 aksharon se zyada nahi hona chahiye.');
    }

    next();
};

module.exports = {
    validateBasicInfo,
    validateAuthorizedPerson,
    validateDetails,
};