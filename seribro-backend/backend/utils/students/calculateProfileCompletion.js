// backend/utils/students/calculateProfileCompletion.js
// Wrapper for StudentProfile model's instance method - Phase 2.1

/**
 * Calculate profile completion percentage
 * Primary logic is in StudentProfile model's instance method
 * This utility is for external use if needed
 * @param {object} profile - StudentProfile document
 * @returns {number} - Completion percentage (0-100)
 */
const calculateProfileCompletion = (profile) => {
    // Use model's instance method if available
    if (profile && typeof profile.calculateProfileCompletion === 'function') {
        return profile.calculateProfileCompletion();
    }

    // Fallback calculation (should not be used in normal flow)
    console.warn('Warning: Using fallback profile completion calculation');
    return 0;
};

module.exports = { calculateProfileCompletion };