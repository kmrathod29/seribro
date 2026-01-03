// backend/controllers/workspaceController.js
// Project Workspace & Message Board - Phase 5.1

const mongoose = require('mongoose');
const Project = require('../models/Project');
const Message = require('../models/Message');
const CompanyProfile = require('../models/companyProfile');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { uploadToCloudinary } = require('../utils/students/uploadToCloudinary');
const { sendNotification } = require('../utils/notifications/sendNotification');
const { validateWorkspaceAccess } = require('../utils/workspace/validateWorkspaceAccess');
const { emitNewMessage } = require('../utils/socket/socketManager');

const sendResponse = (res, success, message, data = null, status = 200) => {
    return res.status(status).json({ success, message, data });
};

const getProjectWithRelations = async (projectId) => {
    return Project.findById(projectId)
        .populate('assignedStudent', 'basicInfo documents resume skills user')
        .populate('selectedStudentId', 'basicInfo documents resume skills user')
        .populate('companyId', 'companyName industryType about logoUrl user');
};

const buildSenderName = (role, studentProfile, companyProfile) => {
    if (role === 'student') {
        return (
            studentProfile?.basicInfo?.fullName ||
            studentProfile?.basicInfo?.email ||
            'Student'
        );
    }
    return companyProfile?.companyName || 'Company';
};

// GET /api/workspace/projects/:projectId
exports.getWorkspaceOverview = async (req, res) => {
    try {
        const { projectId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(projectId)) {
            return sendResponse(res, false, 'Invalid project ID', null, 400);
        }

        const project = await getProjectWithRelations(projectId);
        if (!project) {
            return sendResponse(res, false, 'Project not found', null, 404);
        }

        const access = await validateWorkspaceAccess(project, req.user);
        if (!access.hasAccess) {
            return sendResponse(res, false, access.error || 'Access denied', null, 403);
        }

        const studentProfile = access.role === 'student'
            ? access.studentProfile
            : await StudentProfile.findById(project.assignedStudent || project.selectedStudentId);
        const companyProfile = access.role === 'company'
            ? access.companyProfile
            : await CompanyProfile.findById(project.companyId);

        const deadline = project.deadline ? new Date(project.deadline) : null;
        const daysRemaining = deadline
            ? Math.ceil((deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24))
            : null;

        const messageCount = project.messageCount || 0;
        const unreadMessages = await Message.getUnreadCount(projectId, req.user._id);
        const latestMessages = await Message.find({ project: projectId })
            .sort({ createdAt: -1 })
            .limit(5)
            .lean();

        const recentMessages = [...latestMessages].reverse(); // chronological

        const statusAllowsSubmit = ['assigned', 'in-progress'].includes(project.status);
        const statusAllowsReview = ['submitted', 'under-review', 'completed'].includes(project.status);

        return sendResponse(res, true, 'Workspace loaded', {
            project: {
                _id: project._id,
                title: project.title,
                description: project.description,
                category: project.category,
                requiredSkills: project.requiredSkills,
                budgetMin: project.budgetMin,
                budgetMax: project.budgetMax,
                deadline: project.deadline,
                status: project.status,
                revisionCount: project.revisionCount || 0,
                maxRevisionsAllowed: project.maxRevisionsAllowed || 0,
                paymentStatus: project.paymentStatus || 'not_required',
                paymentAmount: project.paymentAmount || project.budgetMax || 0,
                ratingCompleted: project.ratingCompleted || false,
                createdAt: project.createdAt,
                assignedAt: project.updatedAt,
            },
            student: studentProfile
                ? {
                    _id: studentProfile._id,
                    user: studentProfile.user,
                    name: studentProfile.basicInfo?.fullName || '',
                    email: studentProfile.basicInfo?.email || '',
                    college: studentProfile.basicInfo?.collegeName || '',
                    skills: [
                        ...(studentProfile.skills?.technical || []),
                        ...(studentProfile.skills?.soft || []),
                        ...(studentProfile.skills?.languages || []),
                    ],
                    profilePhoto: studentProfile.basicInfo?.profilePicture || '',
                    resumeUrl: studentProfile.documents?.resume?.url || studentProfile.documents?.resume?.path || '',
                }
                : null,
            company: companyProfile
                ? {
                    _id: companyProfile._id,
                    user: companyProfile.user,
                    companyName: companyProfile.companyName,
                    industryType: companyProfile.industryType || '',
                    about: companyProfile.about || '',
                    logoUrl: companyProfile.logoUrl || companyProfile.logo || '',
                }
                : null,
            workspace: {
                daysRemaining,
                messageCount,
                unreadMessages,
                role: access.role,
                canSubmitWork: access.role === 'student' && statusAllowsSubmit,
                canReview: access.role === 'company' && statusAllowsReview,
                lastActivity: project.lastActivity,
            },
            recentMessages,
            currentUserId: req.user._id,
        });
    } catch (error) {
        console.error('getWorkspaceOverview error:', error);
        return sendResponse(res, false, 'Failed to load workspace', null, 500);
    }
};

// POST /api/workspace/projects/:projectId/messages
exports.sendMessage = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { message } = req.body;

        if (!message || !message.trim()) {
            return sendResponse(res, false, 'Message text is required', null, 400);
        }

        const project = await getProjectWithRelations(projectId);
        if (!project) {
            return sendResponse(res, false, 'Project not found', null, 404);
        }

        const access = await validateWorkspaceAccess(project, req.user);
        if (!access.hasAccess) {
            return sendResponse(res, false, access.error || 'Access denied', null, 403);
        }

        const studentProfile = await StudentProfile.findById(project.assignedStudent || project.selectedStudentId);
        const companyProfile = await CompanyProfile.findById(project.companyId);

        // Handle attachments (uploaded by multer to local disk)
        let attachments = [];
        if (req.files && req.files.length > 0) {
            const uploads = [];
            for (const file of req.files) {
                uploads.push(
                    uploadToCloudinary(file.path, 'workspace-messages', req.user._id.toString())
                        .then((result) => ({
                            filename: file.filename,
                            originalName: file.originalname,
                            fileType: file.mimetype,
                            url: result.secure_url || result.url,
                            public_id: result.public_id || result.publicId,
                            size: file.size,
                            uploadedAt: new Date(),
                        }))
                );
            }
            attachments = await Promise.all(uploads);
        }

        const senderRole = req.user.role;
        const senderName = buildSenderName(senderRole, studentProfile, companyProfile);

        const newMessage = await Message.create({
            project: project._id,
            sender: req.user._id,
            senderRole,
            senderName,
            message: message.trim(),
            attachments,
            isRead: false,
        });

        // Update project workspace metadata
        project.messageCount = (project.messageCount || 0) + 1;
        if (!project.workspaceCreatedAt) {
            project.workspaceCreatedAt = new Date();
        }
        // Use instance helper to update lastActivity and persist
        await project.updateLastActivity();
        await project.save();

        // Determine recipient
        let recipientUserId = null;
        let recipientRole = null;
        if (senderRole === 'student' && companyProfile) {
            recipientUserId = companyProfile.user;
            recipientRole = 'company';
        } else if (senderRole === 'company' && studentProfile) {
            recipientUserId = studentProfile.user;
            recipientRole = 'student';
        }

        // Send in-app notification (non-blocking, wrapped in try-catch)
        if (recipientUserId && recipientRole) {
            try {
                await sendNotification(
                    recipientUserId,
                    recipientRole,
                    `New message in project "${project.title}"`,
                    'workspace_message',
                    'project',
                    project._id
                );
            } catch (notificationErr) {
                // Log error but don't block message sending
                console.warn('[Notification] Failed to create notification (non-blocking):', notificationErr.message || notificationErr);
            }
        }

        // Emit message via Socket.io for real-time delivery
        try {
            emitNewMessage(projectId, {
                _id: newMessage._id,
                message: newMessage.message,
                sender: newMessage.sender,
                senderName: newMessage.senderName,
                senderRole: newMessage.senderRole,
                attachments: newMessage.attachments,
                createdAt: newMessage.createdAt,
                isRead: newMessage.isRead,
            });
        } catch (socketErr) {
            console.warn('[Socket.io] Failed to emit message (non-blocking):', socketErr.message);
        }

        return sendResponse(res, true, 'Message sent successfully', { message: newMessage }, 201);
    } catch (error) {
        console.error('sendMessage error:', error);
        return sendResponse(res, false, 'Failed to send message', null, 500);
    }
};

// GET /api/workspace/projects/:projectId/messages
exports.getMessages = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const project = await getProjectWithRelations(projectId);
        if (!project) {
            return sendResponse(res, false, 'Project not found', null, 404);
        }

        const access = await validateWorkspaceAccess(project, req.user);
        if (!access.hasAccess) {
            return sendResponse(res, false, access.error || 'Access denied', null, 403);
        }

        const result = await Message.getProjectMessages(projectId, page, limit);

        // Mark visible messages as read if they are not sent by the current user
        await Message.updateMany(
            { project: projectId, sender: { $ne: req.user._id }, isRead: false },
            { $set: { isRead: true, readAt: new Date() } }
        );

        const unreadCount = await Message.getUnreadCount(projectId, req.user._id);

        return sendResponse(res, true, 'Messages fetched', {
            messages: result.messages,
            pagination: { ...result.pagination, unreadCount },
        });
    } catch (error) {
        console.error('getMessages error:', error);
        return sendResponse(res, false, 'Failed to fetch messages', null, 500);
    }
};

// PUT /api/workspace/projects/:projectId/messages/read
exports.markMessagesAsRead = async (req, res) => {
    try {
        const { projectId } = req.params;

        const project = await getProjectWithRelations(projectId);
        if (!project) {
            return sendResponse(res, false, 'Project not found', null, 404);
        }

        const access = await validateWorkspaceAccess(project, req.user);
        if (!access.hasAccess) {
            return sendResponse(res, false, access.error || 'Access denied', null, 403);
        }

        await Message.markAllAsRead(projectId, req.user._id);
        const unreadCount = await Message.getUnreadCount(projectId, req.user._id);

        return sendResponse(res, true, 'Messages marked as read', { unreadCount });
    } catch (error) {
        console.error('markMessagesAsRead error:', error);
        return sendResponse(res, false, 'Failed to mark messages as read', null, 500);
    }
};

