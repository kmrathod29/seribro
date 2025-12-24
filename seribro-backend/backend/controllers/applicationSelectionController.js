// backend/controllers/applicationSelectionController.js
// ⚠️ PHASE 6 - DORMANT / FUTURE WORK ⚠️
// Multi-stage project application selection system - Phase 4.5+
// 
// ARCHITECTURAL DECISION: This advanced multi-stage selection system is currently
// dormant and NOT active in production. The MVP uses the simpler approveStudentForProject
// flow from companyApplicationController.js.
//
// DO NOT USE THIS CONTROLLER IN CURRENT MVP.
// This is reserved for Phase 6 implementation when multi-stage selection is needed.

const mongoose = require('mongoose');
const Application = require('../models/Application');
const Project = require('../models/Project');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/companyProfile');
const Notification = require('../models/Notification');
const User = require('../models/User');

// ============================================
// UTILITY FUNCTIONS
// ============================================

const sendResponse = (res, success, message, data = null, status = 200) => {
    return res.status(status).json({ success, message, data });
};

/**
 * Add status transition to audit log
 */
const addStatusHistory = (application, newStatus, changedBy, reason = '', metadata = {}) => {
    if (!application.statusHistory) {
        application.statusHistory = [];
    }
    
    application.statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        changedBy,
        reason,
        metadata,
    });
};

/**
 * Send notification to user
 */
const createNotification = async (userId, userRole, message, type, relatedApplicationId = null) => {
    try {
        await Notification.create({
            userId,
            userRole,
            message,
            type,
            relatedApplicationId,
            isRead: false,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

/**
 * Verify server-side deadline
 */
const isDeadlineExpired = (deadline) => {
    return new Date() > new Date(deadline);
};

// ============================================
// COMPANY-SIDE: SHORTLIST APPLICATIONS
// ============================================

/**
 * @desc    Shortlist applications (bulk) with priority
 * @route   POST /api/company/applications/shortlist
 * @access  Private (Company)
 */
exports.shortlistApplications = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { projectId, applicationIds, priorities } = req.body;

        // Validate input
        if (!projectId || !applicationIds || !Array.isArray(applicationIds)) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Project ID and application IDs are required', null, 400);
        }

        if (applicationIds.length === 0 || applicationIds.length > 5) {
            await session.abortTransaction();
            return sendResponse(res, false, 'You can shortlist 1-5 students only', null, 400);
        }

        // Get project
        const project = await Project.findById(projectId).session(session);
        if (!project) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Project not found', null, 404);
        }

        // Verify company owns this project
        if (project.createdBy.toString() !== req.user.id) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Unauthorized - You do not own this project', null, 403);
        }

        // Update applications to shortlisted with priority
        const shortlistedApps = await Application.updateMany(
            { _id: { $in: applicationIds }, status: 'pending' },
            {
                $set: {
                    status: 'shortlisted',
                    shortlistedAt: new Date(),
                },
                $push: {
                    statusHistory: {
                        status: 'shortlisted',
                        changedAt: new Date(),
                        changedBy: req.user.id,
                        reason: 'Shortlisted by company',
                    },
                },
            },
            { session }
        );

        // Assign priorities
        for (let i = 0; i < applicationIds.length; i++) {
            const priority = priorities && priorities[i] ? priorities[i] : i + 1;
            await Application.findByIdAndUpdate(
                applicationIds[i],
                { shortlistPriority: priority },
                { session }
            );
        }

        // Notify shortlisted students
        const applications = await Application.find(
            { _id: { $in: applicationIds } },
            { student: 1, studentId: 1 }
        ).session(session);

        for (const app of applications) {
            await createNotification(
                app.studentId,
                'student',
                `Congratulations! You have been shortlisted for "${project.title}"`,
                'shortlisted',
                app._id
            );
        }

        await session.commitTransaction();

        return sendResponse(
            res,
            true,
            `Successfully shortlisted ${applicationIds.length} students`,
            { shortlistedCount: applicationIds.length },
            200
        );
    } catch (error) {
        await session.abortTransaction();
        console.error('Shortlist error:', error);
        return sendResponse(res, false, 'Error shortlisting applications', null, 500);
    } finally {
        await session.endSession();
    }
};

// ============================================
// COMPANY-SIDE: SELECT STUDENT
// ============================================

/**
 * @desc    Select one student from shortlist (set deadline, move others to on_hold)
 * @route   POST /api/company/applications/select
 * @access  Private (Company)
 */
exports.selectStudent = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { applicationId, projectId } = req.body;

        // Validate
        if (!applicationId || !projectId) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Application ID and Project ID required', null, 400);
        }

        // Get application
        const application = await Application.findById(applicationId).session(session);
        if (!application) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Application not found', null, 404);
        }

        // Get project
        const project = await Project.findById(projectId).session(session);
        if (!project) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Project not found', null, 404);
        }

        // Verify company owns project
        if (project.createdBy.toString() !== req.user.id) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Unauthorized', null, 403);
        }

        // Check if another student is already awaiting acceptance
        const existingAwaitingApplication = await Application.findOne(
            {
                project: projectId,
                status: 'awaiting_acceptance',
                _id: { $ne: applicationId },
            }
        ).session(session);

        if (existingAwaitingApplication) {
            await session.abortTransaction();
            return sendResponse(
                res,
                false,
                'Another student is already under consideration. Wait for their response or reject them first.',
                null,
                400
            );
        }

        // Calculate deadline: 24 hours from now
        const deadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

        // Update selected application
        const transactionId = new mongoose.Types.ObjectId().toString();
        
        application.status = 'awaiting_acceptance';
        application.selectedAt = new Date();
        application.acceptanceDeadline = deadline;
        application.transactionId = transactionId;
        application.currentSelectionRound = (project.currentSelectionRound || 0) + 1;

        addStatusHistory(
            application,
            'awaiting_acceptance',
            req.user.id,
            'Selected by company',
            { deadline, selectionRound: application.currentSelectionRound }
        );

        await application.save({ session });

        // Move other shortlisted to on_hold
        const onHoldApplications = await Application.updateMany(
            {
                project: projectId,
                status: 'shortlisted',
                _id: { $ne: applicationId },
            },
            {
                $set: { status: 'on_hold' },
                $push: {
                    statusHistory: {
                        status: 'on_hold',
                        changedAt: new Date(),
                        changedBy: req.user.id,
                        reason: 'Moved to backup list',
                    },
                },
            },
            { session }
        );

        // Reject remaining pending applications
        await Application.updateMany(
            {
                project: projectId,
                status: 'pending',
                _id: { $ne: applicationId },
            },
            {
                $set: { status: 'rejected', rejectedAt: new Date() },
                $push: {
                    statusHistory: {
                        status: 'rejected',
                        changedAt: new Date(),
                        changedBy: req.user.id,
                        reason: 'Not selected in this round',
                    },
                },
            },
            { session }
        );

        // Update project status
        project.status = 'selection_pending';
        project.studentUnderConsideration = application.studentId;
        project.applicationUnderConsideration = applicationId;
        project.selectionDeadline = deadline;
        project.currentSelectionRound = application.currentSelectionRound;

        await project.save({ session });

        // Notify selected student
        await createNotification(
            application.studentId,
            'student',
            `You've been selected for "${project.title}"! You have 24 hours to accept or decline.`,
            'selected',
            applicationId
        );

        // Notify on-hold students
        const onHoldApps = await Application.find({
            project: projectId,
            status: 'on_hold',
        }).session(session);

        for (const app of onHoldApps) {
            await createNotification(
                app.studentId,
                'student',
                `You are on the backup list for "${project.title}". We'll notify you if the selected student declines.`,
                'on_hold',
                app._id
            );
        }

        await session.commitTransaction();

        return sendResponse(
            res,
            true,
            'Student selected successfully',
            {
                application: application._id,
                deadline: deadline,
                onHoldCount: onHoldApplications.modifiedCount,
            },
            200
        );
    } catch (error) {
        await session.abortTransaction();
        console.error('Selection error:', error);
        return sendResponse(res, false, 'Error selecting student', null, 500);
    } finally {
        await session.endSession();
    }
};

// ============================================
// STUDENT-SIDE: ACCEPT APPLICATION
// ============================================

/**
 * @desc    Student accepts the selected project
 * @route   POST /api/student/applications/:id/accept
 * @access  Private (Student)
 */
exports.acceptApplication = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: applicationId } = req.params;

        // Get application
        const application = await Application.findById(applicationId).session(session);
        if (!application) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Application not found', null, 404);
        }

        // Verify student owns this application
        if (application.studentId.toString() !== req.user.id) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Unauthorized', null, 403);
        }

        // Verify status is awaiting_acceptance
        if (application.status !== 'awaiting_acceptance') {
            await session.abortTransaction();
            return sendResponse(
                res,
                false,
                `Cannot accept - Application status is ${application.status}`,
                null,
                400
            );
        }

        // Server-side deadline check
        if (isDeadlineExpired(application.acceptanceDeadline)) {
            await session.abortTransaction();
            return sendResponse(
                res,
                false,
                'Deadline has expired. The project has been offered to another student.',
                null,
                400
            );
        }

        // Update application
        application.status = 'accepted';
        application.respondedToSelectionAt = new Date();
        application.studentDecision = 'accept';
        application.acceptedAt = new Date();

        addStatusHistory(
            application,
            'accepted',
            req.user.id,
            'Student accepted the project',
            { acceptedAt: new Date() }
        );

        await application.save({ session });

        // Update project
        const project = await Project.findById(application.projectId).session(session);
        // IMPORTANT: Keep both legacy and new selection fields in sync
        project.status = 'assigned';
        project.selectedStudentId = application.studentId;
        project.assignedStudent = application.studentId;
        project.selectionHistory.push({
            studentId: application.studentId,
            applicationId: applicationId,
            selectedAt: application.selectedAt,
            deadline: application.acceptanceDeadline,
            outcome: 'accepted',
            respondedAt: new Date(),
        });

        await project.save({ session });

        // Reject all on_hold applications
        await Application.updateMany(
            {
                project: application.projectId,
                status: 'on_hold',
                _id: { $ne: applicationId },
            },
            {
                $set: { status: 'rejected', rejectedAt: new Date() },
                $push: {
                    statusHistory: {
                        status: 'rejected',
                        changedAt: new Date(),
                        changedBy: req.user.id,
                        reason: 'Another student accepted the project',
                    },
                },
            },
            { session }
        );

        // Notify company
        const company = await CompanyProfile.findById(application.companyId).session(session);
        const companyUser = await User.findById(company.user).session(session);

        await createNotification(
            companyUser._id,
            'company',
            `Student accepted your project "${project.title}"! The project is now assigned.`,
            'accepted',
            applicationId
        );

        // Notify rejected students
        const rejectedApps = await Application.find({
            project: application.projectId,
            status: 'rejected',
            updatedAt: { $gte: new Date(Date.now() - 1000) },
        }).session(session);

        for (const app of rejectedApps) {
            await createNotification(
                app.studentId,
                'student',
                `The project "${project.title}" has been assigned to another student.`,
                'project_assigned',
                app._id
            );
        }

        await session.commitTransaction();

        return sendResponse(
            res,
            true,
            'Project accepted successfully! Your project will start soon.',
            { application: application._id, project: project._id },
            200
        );
    } catch (error) {
        await session.abortTransaction();
        console.error('Accept error:', error);
        return sendResponse(res, false, 'Error accepting application', null, 500);
    } finally {
        await session.endSession();
    }
};

// ============================================
// STUDENT-SIDE: DECLINE APPLICATION
// ============================================

/**
 * @desc    Student declines the selected project (triggers next in queue)
 * @route   POST /api/student/applications/:id/decline
 * @access  Private (Student)
 */
exports.declineApplication = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { id: applicationId } = req.params;
        const { reason } = req.body;

        // Get application
        const application = await Application.findById(applicationId).session(session);
        if (!application) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Application not found', null, 404);
        }

        // Verify student owns
        if (application.studentId.toString() !== req.user.id) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Unauthorized', null, 403);
        }

        // Verify status
        if (application.status !== 'awaiting_acceptance') {
            await session.abortTransaction();
            return sendResponse(res, false, 'Cannot decline - Invalid application status', null, 400);
        }

        // Update application
        application.status = 'rejected_by_student';
        application.respondedToSelectionAt = new Date();
        application.studentDecision = 'decline';
        application.declineReason = reason || '';

        addStatusHistory(
            application,
            'rejected_by_student',
            req.user.id,
            'Student declined the project',
            { reason }
        );

        await application.save({ session });

        // Get project
        const project = await Project.findById(application.projectId).session(session);

        // Try to assign to next on_hold student
        const nextStudent = await Application.findOne({
            project: application.projectId,
            status: 'on_hold',
        })
            .sort({ shortlistPriority: 1, createdAt: 1 })
            .session(session);

                if (nextStudent) {
            // Update next student to awaiting_acceptance
            const newDeadline = new Date(Date.now() + 24 * 60 * 60 * 1000);

            nextStudent.status = 'awaiting_acceptance';
            nextStudent.selectedAt = new Date();
            nextStudent.acceptanceDeadline = newDeadline;
            nextStudent.currentSelectionRound = application.currentSelectionRound;

            addStatusHistory(
                nextStudent,
                'awaiting_acceptance',
                'system',
                'Auto-selected from backup after previous student declined',
                { previousStudent: application.studentId }
            );

            await nextStudent.save({ session });

            // Update project
            project.studentUnderConsideration = nextStudent.studentId;
            project.applicationUnderConsideration = nextStudent._id;
            project.selectionDeadline = newDeadline;

            await project.save({ session });

            // Notify next student
            await createNotification(
                nextStudent.studentId,
                'student',
                `You've been selected for "${project.title}"! You have 24 hours to accept or decline.`,
                'selected',
                nextStudent._id
            );
                } else {
            // No backup students - reopen project
            project.status = 'open';
            project.studentUnderConsideration = null;
            project.applicationUnderConsideration = null;
            project.selectionDeadline = null;
            project.currentSelectionRound = (project.currentSelectionRound || 0) + 1;

            await project.save({ session });

            // Notify company
            const company = await CompanyProfile.findById(application.companyId).session(session);
            const companyUser = await User.findById(company.user).session(session);

            await createNotification(
                companyUser._id,
                'company',
                `The selected student declined your project "${project.title}". All backup students have also declined. Please select new students or reopen the project.`,
                'all_declined',
                null
            );
        }

        await session.commitTransaction();

        const message = nextStudent
            ? 'Your decline has been recorded. The next qualified student has been offered the project.'
            : 'Your decline has been recorded. The project is being reopened for new applications.';

        return sendResponse(res, true, message, { application: application._id }, 200);
    } catch (error) {
        await session.abortTransaction();
        console.error('Decline error:', error);
        return sendResponse(res, false, 'Error declining application', null, 500);
    } finally {
        await session.endSession();
    }
};

// ============================================
// AUTO-TIMEOUT JOB
// ============================================

/**
 * @desc    Auto-expire applications that exceeded 24h deadline
 * Background job - runs every 5 minutes
 * @access  System
 */
exports.autoTimeoutApplications = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const now = new Date();

        // Find expired applications
        const expiredApplications = await Application.find({
            status: 'awaiting_acceptance',
            acceptanceDeadline: { $lt: now },
        }).session(session);

        if (expiredApplications.length === 0) {
            await session.commitTransaction();
            return sendResponse(res, true, 'No expired applications', { processed: 0 }, 200);
        }

        for (const expiredApp of expiredApplications) {
            // Mark as expired
            expiredApp.status = 'expired';
            expiredApp.respondedToSelectionAt = now;

            addStatusHistory(
                expiredApp,
                'expired',
                'system',
                'Automatic timeout - 24h deadline exceeded',
                { expiredAt: now }
            );

            await expiredApp.save({ session });

            // Get project
            const project = await Project.findById(expiredApp.projectId).session(session);

            // Find next on_hold student
            const nextStudent = await Application.findOne({
                project: expiredApp.projectId,
                status: 'on_hold',
            })
                .sort({ shortlistPriority: 1, createdAt: 1 })
                .session(session);

            if (nextStudent) {
                const newDeadline = new Date(now.getTime() + 24 * 60 * 60 * 1000);

                nextStudent.status = 'awaiting_acceptance';
                nextStudent.selectedAt = now;
                nextStudent.acceptanceDeadline = newDeadline;
                nextStudent.currentSelectionRound = expiredApp.currentSelectionRound;

                addStatusHistory(
                    nextStudent,
                    'awaiting_acceptance',
                    'system',
                    'Auto-selected from backup after previous student timeout',
                    { previousStudent: expiredApp.studentId }
                );

                await nextStudent.save({ session });

                project.studentUnderConsideration = nextStudent.studentId;
                project.applicationUnderConsideration = nextStudent._id;
                project.selectionDeadline = newDeadline;
            } else {
                // Reopen project
                project.status = 'open';
                project.studentUnderConsideration = null;
                project.applicationUnderConsideration = null;
                project.selectionDeadline = null;
                project.currentSelectionRound = (project.currentSelectionRound || 0) + 1;
            }

            await project.save({ session });
        }

        await session.commitTransaction();

        return sendResponse(res, true, 'Auto-timeout completed', { processed: expiredApplications.length }, 200);
    } catch (error) {
        await session.abortTransaction();
        console.error('Auto-timeout error:', error);
        return sendResponse(res, false, 'Error in auto-timeout process', null, 500);
    } finally {
        await session.endSession();
    }
};

// ============================================
// GROUPED APPLICATION LISTING
// ============================================

/**
 * @desc    Get applications grouped by status
 * @route   GET /api/company/applications/grouped/:projectId
 * @access  Private (Company)
 */
exports.getApplicationsByStatus = async (req, res) => {
    try {
        const { projectId } = req.params;

        // Get project
        const project = await Project.findById(projectId);
        if (!project) {
            return sendResponse(res, false, 'Project not found', null, 404);
        }

        // Verify company owns
        if (project.createdBy.toString() !== req.user.id) {
            return sendResponse(res, false, 'Unauthorized', null, 403);
        }

        // Group applications by status
        const grouped = await Application.aggregate([
            {
                $match: { projectId: new mongoose.Types.ObjectId(projectId) },
            },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                    applications: {
                        $push: {
                            _id: '$_id',
                            studentName: '$studentName',
                            proposedPrice: '$proposedPrice',
                            estimatedTime: '$estimatedTime',
                            shortlistPriority: '$shortlistPriority',
                            acceptanceDeadline: '$acceptanceDeadline',
                            appliedAt: '$appliedAt',
                        },
                    },
                },
            },
            {
                $sort: { _id: 1 },
            },
        ]);

        return sendResponse(
            res,
            true,
            'Applications retrieved',
            { grouped },
            200
        );
    } catch (error) {
        console.error('Get applications error:', error);
        return sendResponse(res, false, 'Error retrieving applications', null, 500);
    }
};

module.exports = exports;
