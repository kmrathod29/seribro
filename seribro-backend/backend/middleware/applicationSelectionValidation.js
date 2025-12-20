// backend/middleware/applicationSelectionValidation.js
// ⚠️ PHASE 6 - DORMANT / FUTURE WORK ⚠️
// Validation middleware for selection system - Phase 4.5+
//
// ARCHITECTURAL DECISION: This middleware is currently NOT used in production.
// The MVP uses the simpler approveStudentForProject flow.
//
// DO NOT USE THIS MIDDLEWARE IN CURRENT MVP.
// This is reserved for Phase 6 implementation when multi-stage selection is needed.

const Application = require('../models/Application');
const Project = require('../models/Project');

/**
 * Validate shortlist request
 */
exports.validateShortlist = async (req, res, next) => {
    try {
        const { projectId, applicationIds, priorities } = req.body;

        // Validate required fields
        if (!projectId) {
            return res.status(400).json({
                success: false,
                message: 'Project ID is required',
            });
        }

        if (!applicationIds || !Array.isArray(applicationIds) || applicationIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Application IDs array is required and must not be empty',
            });
        }

        if (applicationIds.length > 5) {
            return res.status(400).json({
                success: false,
                message: 'You can only shortlist up to 5 students',
            });
        }

        // Validate project exists
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        // Verify company owns project
        if (project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not own this project',
            });
        }

        // Validate all applications exist and are pending
        const applications = await Application.find({
            _id: { $in: applicationIds },
            projectId: projectId,
        });

        if (applications.length !== applicationIds.length) {
            return res.status(400).json({
                success: false,
                message: 'Some applications not found for this project',
            });
        }

        const invalidStatuses = applications.filter((app) => app.status !== 'pending');
        if (invalidStatuses.length > 0) {
            return res.status(400).json({
                success: false,
                message: 'All applications must be in "pending" status to shortlist',
            });
        }

        // Validate priorities if provided
        if (priorities) {
            if (!Array.isArray(priorities) || priorities.length !== applicationIds.length) {
                return res.status(400).json({
                    success: false,
                    message: 'Priorities array must match application IDs length',
                });
            }

            const invalidPriorities = priorities.filter((p) => p < 1 || p > 5 || !Number.isInteger(p));
            if (invalidPriorities.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Priorities must be integers between 1-5',
                });
            }
        }

        next();
    } catch (error) {
        console.error('Shortlist validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Validation error',
        });
    }
};

/**
 * Validate selection request
 */
exports.validateSelection = async (req, res, next) => {
    try {
        const { applicationId, projectId } = req.body;

        if (!applicationId || !projectId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID and Project ID are required',
            });
        }

        // Validate project
        const project = await Project.findById(projectId);
        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project not found',
            });
        }

        // Verify company
        if (project.createdBy.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'Unauthorized - Project not owned by you',
            });
        }

        // Validate application
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        // Application must be shortlisted
        if (application.status !== 'shortlisted') {
            return res.status(400).json({
                success: false,
                message: `Application must be shortlisted to select. Current status: ${application.status}`,
            });
        }

        // Application must be for this project
        if (application.projectId.toString() !== projectId) {
            return res.status(400).json({
                success: false,
                message: 'Application does not belong to this project',
            });
        }

        next();
    } catch (error) {
        console.error('Selection validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Validation error',
        });
    }
};

/**
 * Validate student response (accept/decline)
 */
exports.validateStudentResponse = async (req, res, next) => {
    try {
        const { id: applicationId } = req.params;

        if (!applicationId) {
            return res.status(400).json({
                success: false,
                message: 'Application ID is required',
            });
        }

        // Get application
        const application = await Application.findById(applicationId);
        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application not found',
            });
        }

        // Verify student owns
        if (application.studentId.toString() !== req.user.id) {
            return res.status(403).json({
                success: false,
                message: 'You do not own this application',
            });
        }

        // Must be awaiting_acceptance
        if (application.status !== 'awaiting_acceptance') {
            return res.status(400).json({
                success: false,
                message: `Cannot respond - Application status is ${application.status}`,
            });
        }

        // Check deadline
        const now = new Date();
        if (now > new Date(application.acceptanceDeadline)) {
            return res.status(400).json({
                success: false,
                message: 'Deadline has expired. The project has been offered to another student.',
            });
        }

        next();
    } catch (error) {
        console.error('Response validation error:', error);
        res.status(500).json({
            success: false,
            message: 'Validation error',
        });
    }
};

/**
 * Rate limiting for acceptance attempts
 */
const attemptCounts = new Map();

exports.rateLimitAcceptance = (req, res, next) => {
    const userId = req.user.id;
    const key = `${userId}:response`;

    const count = attemptCounts.get(key) || 0;

    if (count >= 10) {
        return res.status(429).json({
            success: false,
            message: 'Too many response attempts. Please try again later.',
        });
    }

    attemptCounts.set(key, count + 1);

    // Reset after 1 hour
    setTimeout(() => {
        attemptCounts.delete(key);
    }, 60 * 60 * 1000);

    next();
};

module.exports = exports;
