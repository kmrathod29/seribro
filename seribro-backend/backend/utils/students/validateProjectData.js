// utils/student/validateProjectData.js
// Project add/update karte time fields (title, description) validate karta hai.

/**
 * Validates project data.
 * @param {object} data - Project data from request body.
 * @param {boolean} isPartialUpdate - Flag to indicate if it's a partial update (PUT).
 * @returns {string|null} - Error message string or null if validation passes.
 */
const validateProjectData = (data, isPartialUpdate = false) => {
    const { title, description } = data;

    if (!isPartialUpdate) {
        // Full validation for POST (addProject)
        if (!title || title.trim().length === 0) {
            return 'Project title is required.';
        }
        if (!description || description.trim().length === 0) {
            return 'Project description is required.';
        }
    } else {
        // Partial validation for PUT (updateProject)
        if (title !== undefined && title.trim().length === 0) {
            return 'Project title cannot be empty.';
        }
        if (description !== undefined && description.trim().length === 0) {
            return 'Project description cannot be empty.';
        }
    }

    // Additional checks can be added here (e.g., max length, technology format)

    return null; // Validation successful
};

module.exports = { validateProjectData };