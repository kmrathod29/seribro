// backend/utils/background/applicationTimeoutJob.js
// Background job for auto-timeout - Phase 4.5+

const mongoose = require('mongoose');
const Application = require('../../models/Application');
const Project = require('../../models/Project');
const CompanyProfile = require('../../models/companyProfile');
const User = require('../../models/User');
const Notification = require('../../models/Notification');

/**
 * Process expired applications every 5 minutes
 */
exports.processExpiredApplications = async () => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const now = new Date();
        let processed = 0;

        console.log(`[${new Date().toISOString()}] Starting application timeout job...`);

        // Find expired applications
        const expiredApplications = await Application.find({
            status: 'awaiting_acceptance',
            acceptanceDeadline: { $lt: now },
        })
            .session(session)
            .lean();

        console.log(`Found ${expiredApplications.length} expired applications`);

        for (const expiredAppData of expiredApplications) {
            const expiredApp = await Application.findById(expiredAppData._id).session(session);

            if (!expiredApp || expiredApp.status !== 'awaiting_acceptance') {
                continue; // Skip if already processed
            }

            // Mark as expired
            expiredApp.status = 'expired';
            expiredApp.respondedToSelectionAt = now;

            if (!expiredApp.statusHistory) {
                expiredApp.statusHistory = [];
            }

            expiredApp.statusHistory.push({
                status: 'expired',
                changedAt: now,
                reason: 'Automatic timeout - 24h deadline exceeded',
                metadata: { expiredAt: now },
            });

            await expiredApp.save({ session });
            processed++;

            console.log(`Marked application ${expiredApp._id} as expired`);

            // Get project
            const project = await Project.findById(expiredApp.projectId).session(session);
            if (!project) {
                console.error(`Project ${expiredApp.projectId} not found`);
                continue;
            }

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

                if (!nextStudent.statusHistory) {
                    nextStudent.statusHistory = [];
                }

                nextStudent.statusHistory.push({
                    status: 'awaiting_acceptance',
                    changedAt: now,
                    reason: 'Auto-selected from backup after previous student timeout',
                    metadata: { previousStudent: expiredApp.studentId },
                });

                await nextStudent.save({ session });

                project.studentUnderConsideration = nextStudent.studentId;
                project.applicationUnderConsideration = nextStudent._id;
                project.selectionDeadline = newDeadline;

                console.log(`Auto-selected backup student ${nextStudent.studentId} for project ${project._id}`);

                // Notify next student
                try {
                    await Notification.create(
                        [
                            {
                                userId: nextStudent.studentId,
                                userRole: 'student',
                                message: `You've been selected for "${project.title}"! You have 24 hours to accept or decline.`,
                                type: 'selected',
                                relatedApplicationId: nextStudent._id,
                                isRead: false,
                            },
                        ],
                        { session }
                    );
                } catch (notifError) {
                    console.error('Error creating notification:', notifError);
                    // Continue anyway
                }
            } else {
                // No backup students - reopen project
                project.status = 'open';
                project.studentUnderConsideration = null;
                project.applicationUnderConsideration = null;
                project.selectionDeadline = null;
                project.currentSelectionRound = (project.currentSelectionRound || 0) + 1;

                console.log(`Reopened project ${project._id} - no backup students`);

                // Notify company
                try {
                    const company = await CompanyProfile.findById(project.companyId).session(session);
                    if (company) {
                        const companyUser = await User.findById(company.user).session(session);
                        if (companyUser) {
                            await Notification.create(
                                [
                                    {
                                        userId: companyUser._id,
                                        userRole: 'company',
                                        message: `The selected student did not respond within 24 hours for "${project.title}". All backup students have also declined. Please select new students or reopen the project.`,
                                        type: 'all_declined',
                                        isRead: false,
                                    },
                                ],
                                { session }
                            );
                        }
                    }
                } catch (notifError) {
                    console.error('Error creating notification:', notifError);
                }
            }

            await project.save({ session });
        }

        await session.commitTransaction();

        console.log(`[${new Date().toISOString()}] Application timeout job completed. Processed: ${processed}`);
        return { success: true, processed };
    } catch (error) {
        await session.abortTransaction();
        console.error('Application timeout job error:', error);
        return { success: false, error: error.message };
    } finally {
        await session.endSession();
    }
};

/**
 * Start the background job (call this in server.js)
 */
exports.startApplicationTimeoutJob = (interval = 5 * 60 * 1000) => {
    console.log(`Starting application timeout job with interval: ${interval}ms`);

    setInterval(async () => {
        try {
            await this.processExpiredApplications();
        } catch (error) {
            console.error('Background job error:', error);
        }
    }, interval);
};

module.exports = exports;
