// validateFileHelpers.js
// File type aur size validate karne ke liye simple helper functions

/**
 * File ka MIME type allowed types ki list mein hai ya nahi, check karta hai.
 * @param {string} mimetype - File ka MIME type (e.g., 'image/jpeg').
 * @param {string[]} allowedTypes - Allowed MIME types ki array.
 * @returns {boolean} - Validation status.
 */
const validateFileType = (mimetype, allowedTypes) => {
    // Check karna ki mimetype allowedTypes array mein shamil hai ya nahi
    const isValid = allowedTypes.includes(mimetype);
    // Agar valid nahi hai to console mein log kar sakte hain
    if (!isValid) {
        console.log(`Invalid file type: ${mimetype}. Allowed types: ${allowedTypes.join(', ')}`); // Hinglish mein log
    }
    return isValid;
};

/**
 * File ka size maximum allowed size se kam hai ya nahi, check karta hai.
 * @param {number} size - File ka size bytes mein.
 * @param {number} maxSize - Maximum allowed size bytes mein.
 * @returns {boolean} - Validation status.
 */
const validateFileSize = (size, maxSize) => {
    // Check karna ki size maximum size se kam hai
    const isValid = size <= maxSize;
    // Agar valid nahi hai to console mein log kar sakte hain
    if (!isValid) {
        console.log(`File size too large: ${size} bytes. Max allowed: ${maxSize} bytes`); // Hinglish mein log
    }
    return isValid;
};

// Maximum size constants (bytes mein)
const MAX_LOGO_SIZE = 2 * 1024 * 1024; // 2MB
const MAX_DOCUMENT_SIZE = 3 * 1024 * 1024; // 3MB

// Allowed MIME types
const ALLOWED_LOGO_TYPES = ['image/jpeg', 'image/png', 'image/webp'];
const ALLOWED_DOCUMENT_TYPES = ['application/pdf', 'image/jpeg', 'image/png'];

module.exports = {
    validateFileType,
    validateFileSize,
    MAX_LOGO_SIZE,
    MAX_DOCUMENT_SIZE,
    ALLOWED_LOGO_TYPES,
    ALLOWED_DOCUMENT_TYPES,
};
