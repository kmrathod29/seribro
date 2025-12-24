// backend/models/Message.js
// Workspace Message Model - Phase 5.1

const mongoose = require('mongoose');

const attachmentSchema = new mongoose.Schema({
    filename: String,
    originalName: String,
    fileType: String,
    url: String,
    public_id: String,
    size: Number,
    uploadedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

const MessageSchema = new mongoose.Schema(
    {
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },
        sender: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        senderRole: {
            type: String,
            enum: ['student', 'company'],
            required: true,
        },
        senderName: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            minlength: 1,
            maxlength: 2000,
            trim: true,
        },
        attachments: [attachmentSchema],
        isRead: {
            type: Boolean,
            default: false,
        },
        readAt: {
            type: Date,
            default: null,
        },
    },
    {
        timestamps: true,
    }
);

// Indexes
MessageSchema.index({ project: 1, createdAt: -1 });
MessageSchema.index({ sender: 1 });

// Instance method: mark a single message as read
MessageSchema.methods.markAsRead = async function () {
    if (!this.isRead) {
        this.isRead = true;
        this.readAt = new Date();
        await this.save();
    }
    return this;
};

// Static: paginated messages for a project (newest first, returned chronologically)
MessageSchema.statics.getProjectMessages = async function (projectId, page = 1, limit = 20) {
    const pageNum = Math.max(parseInt(page) || 1, 1);
    const limitNum = Math.min(Math.max(parseInt(limit) || 20, 1), 100);
    const skip = (pageNum - 1) * limitNum;

    const [messages, total] = await Promise.all([
        this.find({ project: projectId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limitNum)
            .lean(),
        this.countDocuments({ project: projectId }),
    ]);

    const totalPages = Math.ceil(total / limitNum) || 1;
    // Return chronologically (oldest first) for easy rendering
    const chronological = [...messages].reverse();

    return {
        messages: chronological,
        pagination: {
            currentPage: pageNum,
            totalPages,
            totalMessages: total,
            hasMore: pageNum < totalPages,
        },
    };
};

// Static: unread count for a user on a project
MessageSchema.statics.getUnreadCount = async function (projectId, userId) {
    return this.countDocuments({
        project: projectId,
        sender: { $ne: userId },
        isRead: false,
    });
};

// Static: mark all as read for current user (marks messages sent by the other party)
MessageSchema.statics.markAllAsRead = async function (projectId, userId) {
    const now = new Date();
    const result = await this.updateMany(
        { project: projectId, sender: { $ne: userId }, isRead: false },
        { $set: { isRead: true, readAt: now } }
    );
    return result.modifiedCount || 0;
};

module.exports = mongoose.model('Message', MessageSchema);

