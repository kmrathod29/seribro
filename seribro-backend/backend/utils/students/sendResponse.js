// backend/utils/students/sendResponse.js
// Standardized API response formatter - Phase 2.1

const sendResponse = (res, statusCode, success, message, data = null, internalError = null) => {
    const response = {
        success,
        message,
        timestamp: new Date().toISOString(),
    };

    if (data !== null && data !== undefined) {
        response.data = data;
    }

    // Include error details in development mode for 4xx/5xx errors
    if (internalError && (statusCode >= 400 || statusCode < 500)) {
        if (process.env.NODE_ENV === 'development') {
            response.error = internalError;
        }
    }

    return res.status(statusCode).json(response);
};

module.exports = sendResponse;