// backend/utils/company/validateGSTNumber.js
// GST Number Validation Utility

/**
 * Validates Indian GST Number format
 * GST Format: 2 digits (state code) + 5 letters (PAN) + 4 digits + 1 letter + 1 letter/digit + Z + 1 alphanumeric
 * Example: 27ABCPA1234H1Z0
 * 
 * @param {string} gstNumber - GST number to validate
 * @returns {object} - { isValid: boolean, message: string }
 */
const validateGSTNumber = (gstNumber) => {
    // Empty GST is allowed (optional field)
    if (!gstNumber || gstNumber.trim() === '') {
        return {
            isValid: true,
            message: 'GST number optional hai',
        };
    }

    // GST format regex
    // ^[0-9]{2} - 2 digits for state code
    // [A-Z]{5} - 5 uppercase letters
    // [0-9]{4} - 4 digits
    // [A-Z]{1} - 1 uppercase letter
    // [1-9A-Z]{1} - 1 letter or digit (1-9, A-Z)
    // Z - Letter Z
    // [0-9A-Z]{1}$ - 1 alphanumeric
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

    if (!gstRegex.test(gstNumber.trim().toUpperCase())) {
        return {
            isValid: false,
            message: 'GST number format galat hai. Format: 27ABCPA1234H1Z0',
        };
    }

    return {
        isValid: true,
        message: 'GST number valid hai',
    };
};

/**
 * Validates GST number and returns detailed validation result
 * 
 * @param {string} gstNumber - GST number to validate
 * @returns {boolean} - True if valid, false otherwise
 */
const isValidGST = (gstNumber) => {
    if (!gstNumber || gstNumber.trim() === '') {
        return true; // Optional field
    }
    const gstRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstRegex.test(gstNumber.trim().toUpperCase());
};

module.exports = {
    validateGSTNumber,
    isValidGST,
};
