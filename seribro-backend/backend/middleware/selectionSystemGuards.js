// backend/middleware/selectionSystemGuards.js
// Prevent invalid state transitions in selection system

const Application = require('../models/Application');
const Project = require('../models/Project');

/**
 * Ensure no duplicate selection in progress on a project
 * Prevents multiple students being awaiting_acceptance simultaneously
 */
exports.preventDuplicateSelection = async (req, res, next) => {
    try {
        const { projectId, applicationId } = req.body;

        if (!projectId) {
            return next(); // Skip if no projectId
        }

        const existingSelection = await Application.findOne({
            projectId,
            status: 'awaiting_acceptance',
            _id: { $ne: applicationId }, // Exclude current app
        });

        if (existingSelection) {
            return res.status(409).json({
                success: false,
                error: 'CONCURRENT_SELECTION',
                message: 'Another student is already under selection for this project',
                details: {
                    existingApplicationId: existingSelection._id,
                    studentId: existingSelection.studentId,
                    deadline: existingSelection.acceptanceDeadline,
                },
            });
        }

        next();
    } catch (error) {
        console.error('preventDuplicateSelection error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Ensure project is eligible for selection
 */
exports.validateProjectSelectionEligibility = async (req, res, next) => {
    try {
        const { projectId } = req.body;

        if (!projectId) {
            return next();
        }

        const project = await Project.findById(projectId).lean();

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        // Check if project is in a state that allows selection
        const selectableStates = ['open', 'applications_received', 'selection_pending'];

        if (!selectableStates.includes(project.status)) {
            return res.status(409).json({
                success: false,
                error: 'PROJECT_INELIGIBLE',
                message: `Cannot select students for project in "${project.status}" status`,
                details: {
                    currentStatus: project.status,
                    validStatuses: selectableStates,
                },
            });
        }

        next();
    } catch (error) {
        console.error('validateProjectSelectionEligibility error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Ensure student is not already assigned to another project in same company
 * Prevents double-booking of students
 */
exports.preventStudentDoubleBooking = async (req, res, next) => {
    try {
        const { projectId } = req.body;
        const studentId = req.user?.id;

        if (!studentId || !projectId) {
            return next();
        }

        // Check if student has accepted another project
        const existingAssignment = await Application.findOne({
            studentId,
            status: 'accepted',
        })
            .populate('projectId', 'companyId')
            .lean();

        if (existingAssignment) {
            const project = await Project.findById(projectId).lean();
            const sameCompany =
                existingAssignment.projectId?.companyId?.toString() === project.companyId?.toString();

            if (sameCompany) {
                return res.status(409).json({
                    success: false,
                    error: 'DOUBLE_BOOKING',
                    message: 'You already accepted a project from this company',
                    details: {
                        existingProjectId: existingAssignment.projectId._id,
                        studentId,
                    },
                });
            }
        }

        next();
    } catch (error) {
        console.error('preventStudentDoubleBooking error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Lock project during selection to prevent race conditions
 * Adds version control
 */
exports.validateProjectVersion = async (req, res, next) => {
    try {
        const { projectId, expectedVersion } = req.body;

        if (!projectId || expectedVersion === undefined) {
            return next();
        }

        const project = await Project.findById(projectId).lean();

        if (!project) {
            return res.status(404).json({ success: false, error: 'Project not found' });
        }

        if (project.__v !== expectedVersion) {
            return res.status(409).json({
                success: false,
                error: 'VERSION_MISMATCH',
                message: 'Project has been modified. Please refresh and try again.',
                details: {
                    expectedVersion,
                    currentVersion: project.__v,
                },
            });
        }

        next();
    } catch (error) {
        console.error('validateProjectVersion error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Ensure applications are for correct project and status
 */
exports.validateApplicationBatch = async (req, res, next) => {
    try {
        const { projectId, applicationIds } = req.body;

        if (!projectId || !applicationIds || !Array.isArray(applicationIds)) {
            return next();
        }

        // Validate all applications belong to same project
        const apps = await Application.find({
            _id: { $in: applicationIds },
        }).lean();

        const allCorrectProject = apps.every((app) => app.projectId.toString() === projectId);

        if (!allCorrectProject) {
            return res.status(400).json({
                success: false,
                error: 'INVALID_APPLICATION_BATCH',
                message: 'All applications must belong to the same project',
            });
        }

        // Check no duplicates in batch
        const uniqueIds = new Set(applicationIds);
        if (uniqueIds.size !== applicationIds.length) {
            return res.status(400).json({
                success: false,
                error: 'DUPLICATE_APPLICATION',
                message: 'Duplicate application IDs in batch',
            });
        }

        next();
    } catch (error) {
        console.error('validateApplicationBatch error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
};

/**
 * Middleware to add guard information to request
 * Useful for debugging and audit trails
 */
exports.addGuardContext = (guardName) => {
    return (req, res, next) => {
        req.guardContext = {
            guardName,
            timestamp: new Date(),
            userId: req.user?.id,
        };
        next();
    };
};

module.exports = exports;
