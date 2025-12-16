// backend/middleware/student/validationMiddleware.js
// Phase 2.1 - Validation Middleware (Updated for real StudentProfile model)

const sendResponse = require('../../utils/students/sendResponse');
const { validateProjectData } = require('../../utils/students/validateProjectData');
const StudentProfile = require('../../models/StudentProfile');

// Helper → check allowed fields are valid
const validateAllowedFields = (allowedFields, data) => {
    const errors = {};

    for (const key in data) {
        if (!allowedFields.includes(key)) {
            errors[key] = `${key} is not allowed here.`;
        }
    }

    return Object.keys(errors).length ? errors : null;
};

const validationMiddleware = (validationType) => async (req, res, next) => {
    try {
        let validationError = null;

        // ============================================================
        // BASIC INFO VALIDATION
        // ============================================================
        if (validationType === 'basicInfo') {
            // Allowed fields directly from your model
            const allowedFields = Object.keys(StudentProfile.schema.obj.basicInfo);

            // Check if request contains invalid fields
            validationError = validateAllowedFields(allowedFields, req.body);

            // Extra validation (optional)
            if (!validationError) {
                if (req.body.fullName && req.body.fullName.length < 2) {
                    validationError = { fullName: "Full name must be at least 2 characters" };
                }

                if (req.body.bio && req.body.bio.length > 500) {
                    validationError = { bio: "Bio cannot exceed 500 characters" };
                }

                if (req.body.phone && !/^[0-9+\-\s()]{10,20}$/.test(req.body.phone)) {
                    validationError = { phone: "Invalid phone number format" };
                }
            }
        }

        // ============================================================
        // SKILLS VALIDATION
        // ============================================================
        if (validationType === 'skills') {
            // Allowed fields inside skills
            const allowedSkills = Object.keys(StudentProfile.schema.obj.skills);

            validationError = validateAllowedFields(allowedSkills, req.body);

            if (!validationError) {
                // Check if each skill field is array
                for (const key in req.body) {
                    if (!Array.isArray(req.body[key])) {
                        validationError = { [key]: `${key} must be an array` };
                    }
                }
            }
        }

        // ============================================================
        // TECH STACK VALIDATION
        // ============================================================
        if (validationType === 'techStack') {
            if (!req.body.techStack || !Array.isArray(req.body.techStack)) {
                validationError = { techStack: "techStack must be an array of strings" };
            }
        }

        // ============================================================
        // PROJECT VALIDATION
        // ============================================================
        if (validationType === 'project') {
            const isPartialUpdate = req.method === 'PUT';

            const projectError = validateProjectData(req.body, isPartialUpdate);
            if (projectError) {
                validationError = { project: projectError };
            }
        }

        // ============================================================
        // IF VALIDATION FAILED → RETURN ERROR
        // ============================================================
        if (validationError) {
            return sendResponse(res, 400, false, "Validation failed", validationError);
        }

        // Everything OK → proceed
        next();

    } catch (error) {
        console.error('❌ Error in validationMiddleware:', error);
        return sendResponse(
            res,
            500,
            false,
            "Server error during validation",
            null,
            error.message
        );
    }
};

module.exports = { validationMiddleware };
