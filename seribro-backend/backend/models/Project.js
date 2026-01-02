// backend/models/Project.js
// Company ke projects ka schema - Phase 4.1

const mongoose = require('mongoose');

// Shortlisted student ka structure
const shortlistedStudentSchema = new mongoose.Schema({
    studentId: {
        type: mongoose.Schema.ObjectId,
        ref: 'StudentProfile',
        required: true,
    },
    studentName: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
    },
    skills: [String], // Student ke matching skills
    shortlistedAt: {
        type: Date,
        default: Date.now,
    },
}, { _id: false });

// Main Project Schema
const ProjectSchema = new mongoose.Schema(
    {
        // Company ka reference
        company: {
            type: mongoose.Schema.ObjectId,
            ref: 'Company',
            required: true,
        },
        companyId: {
            // Redundant field for easy filtering - index ke liye
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Company',
            required: true,
        },

        // Project ki basic info
        title: {
            type: String,
            required: [true, 'Project title zaroori hai'],
            trim: true,
            maxlength: [100, 'Title 100 characters se zyada nahi ho sakta'],
        },
        description: {
            type: String,
            required: [true, 'Project description zaroori hai'],
            maxlength: [5000, 'Description 5000 characters se zyada nahi ho sakta'],
        },

        // Category - Jaise: Web Development, Mobile App, Data Science, AI/ML, etc.
        category: {
            type: String,
            enum: [
                'Web Development',
                'Mobile Development',
                'Data Science',
                'AI/ML',
                'Cloud & DevOps',
                'Backend Development',
                'Frontend Development',
                'Full Stack',
                'Blockchain',
                'IoT',
                'Cybersecurity',
                'Other',
            ],
            required: [true, 'Category select karna zaroori hai'],
        },

        // Required skills - Array of strings
        requiredSkills: {
            type: [
                {
                    type: String,
                    trim: true,
                },
            ],
            required: [true, 'Kam se kam ek skill add karna zaroori hai'],
            validate: {
                validator: (v) => v.length > 0,
                message: 'Kam se kam ek skill zaroori hai',
            },
        },

        // Budget information
        budgetMin: {
            type: Number,
            required: [true, 'Minimum budget zaroori hai'],
            min: [0, 'Budget negative nahi ho sakta'],
        },
        budgetMax: {
            type: Number,
            required: [true, 'Maximum budget zaroori hai'],
            min: [0, 'Budget negative nahi ho sakta'],
        },

        // Project duration (in days)
        projectDuration: {
            type: String,
            enum: ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months', '1 year'],
            required: [true, 'Project duration select karna zaroori hai'],
        },

        // Deadline
        deadline: {
            type: Date,
            required: [true, 'Deadline set karna zaroori hai'],
            validate: {
                validator: (v) => v > new Date(),
                message: 'Deadline future ki date honi chahiye',
            },
        },

        // Project status
        status: {
            type: String,
            enum: ['open', 'selection_pending', 'assigned', 'in-progress', 'submitted', 'under-review', 'revision-requested', 'approved', 'completed', 'cancelled', 'closed', 'disputed'],
            default: 'open',
        },

        // Work submission tracking
        submissions: [
            {
                version: { type: Number, required: true },
                files: [
                    {
                        filename: String,
                        originalName: String,
                        fileType: String,
                        url: String,
                        public_id: String,
                        size: Number,
                        uploadedAt: { type: Date, default: Date.now },
                    },
                ],
                links: [
                    {
                        url: String,
                        description: String,
                        addedAt: { type: Date, default: Date.now },
                    },
                ],
                message: {
                    type: String,
                    maxlength: 2000,
                },
                submittedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'StudentProfile',
                    required: true,
                },
                submittedAt: {
                    type: Date,
                    default: Date.now,
                },
                status: {
                    type: String,
                    enum: ['submitted', 'under-review', 'approved', 'revision-requested', 'rejected'],
                    default: 'submitted',
                },
                reviewedAt: Date,
                reviewedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                companyFeedback: {
                    type: String,
                    maxlength: 2000,
                },
                revisionRequested: {
                    type: Boolean,
                    default: false,
                },
                revisionReason: String,
            },
        ],

        currentSubmission: {
            version: Number,
            submissionId: mongoose.Schema.Types.ObjectId,
            status: String,
            submittedAt: Date,
        },

        revisionCount: {
            type: Number,
            default: 0,
            max: Number(process.env.MAX_SUBMISSION_REVISIONS || 2),
        },
        maxRevisionsAllowed: {
            type: Number,
            default: Number(process.env.MAX_SUBMISSION_REVISIONS || 2),
        },
        revisionHistory: [
            {
                version: Number,
                requestedAt: Date,
                requestedBy: mongoose.Schema.Types.ObjectId,
                reason: String,
                resubmittedAt: Date,
            },
        ],

        // Status timestamps
        startedAt: Date,
        submittedAt: Date,
        reviewedAt: Date,
        approvedAt: Date,
        completedAt: Date,

        workStarted: {
            type: Boolean,
            default: false,
        },

        // ========== Phase 5.3: Payment & Rating Tracking ==========
        paymentStatus: {
            type: String,
            enum: ['not_required','pending','captured','ready_for_release','released','refunded'],
            default: 'pending',
        },
        payment: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Payment',
            default: null,
        },
        paymentAmount: { type: Number },
        paymentCapturedAt: Date,
        paymentReleasedAt: Date,

        ratingCompleted: { type: Boolean, default: false },
        rating: { type: mongoose.Schema.Types.ObjectId, ref: 'Rating' },

        // Applications count
        applicationsCount: {
            type: Number,
            default: 0,
        },

        // Hinglish: Project kab band hua (auto-close ke liye)
        closedAt: {
            type: Date,
            default: null,
        },

        // Hinglish: Kyon band hua
        closedReason: {
            type: String,
            default: null,
        },

        // Shortlisted students array
        shortlistedStudents: [shortlistedStudentSchema],

        // Selected student - jab project assign ho jaye
        selectedStudentId: {
            type: mongoose.Schema.ObjectId,
            ref: 'StudentProfile',
            default: null,
        },

        // ========== Phase 4.5: Assigned Student ==========
        // Student assigned to this project (when approved)
        assignedStudent: {
            type: mongoose.Schema.ObjectId,
            ref: 'StudentProfile',
            default: null,
            index: true,
        },

        // ========== Phase 4.5+: Selection System ==========
        // Current student under consideration (awaiting_acceptance)
        studentUnderConsideration: {
            type: mongoose.Schema.ObjectId,
            ref: 'StudentProfile',
            default: null,
        },

        // Application under consideration
        applicationUnderConsideration: {
            type: mongoose.Schema.ObjectId,
            ref: 'Application',
            default: null,
        },

        // Deadline for student response
        selectionDeadline: {
            type: Date,
            default: null,
            index: true,
        },

        // Current selection round (increments if student declines)
        currentSelectionRound: {
            type: Number,
            default: 0,
        },

        // Selection history
        selectionHistory: [
            {
                studentId: mongoose.Schema.ObjectId,
                applicationId: mongoose.Schema.ObjectId,
                selectedAt: Date,
                deadline: Date,
                outcome: {
                    type: String,
                    enum: ['accepted', 'declined', 'expired', 'pending'],
                },
                respondedAt: Date,
                reason: String,
            },
        ],

        // Workspace tracking
        lastActivity: {
            type: Date,
            default: Date.now,
        },
        workspaceCreatedAt: {
            type: Date,
            default: null,
        },
        messageCount: {
            type: Number,
            default: 0,
        },

        // Soft delete ke liye
        isDeleted: {
            type: Boolean,
            default: false,
            select: false, // By default query mein include nahi hoga
        },

        // Track who created/modified
        createdBy: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: true,
        },
    },
    {
        timestamps: true, // createdAt aur updatedAt automatically add hoga
    }
);

// Indexes for better query performance
ProjectSchema.index({ companyId: 1 }); // Company ke sabhi projects dhundo
ProjectSchema.index({ status: 1 }); // Status ke basis par filter karo
ProjectSchema.index({ createdAt: -1 }); // Latest projects pehle
ProjectSchema.index({ companyId: 1, status: 1 }); // Company + Status ke basis par
ProjectSchema.index({ isDeleted: 1 }); // Soft delete ke liye

// Workspace helper - update last activity timestamp
ProjectSchema.methods.updateLastActivity = function () {
    this.lastActivity = new Date();
    return this.save();
};

// Start work on project
ProjectSchema.methods.startWork = async function () {
    if (this.status !== 'assigned') {
        throw new Error('Can only start work on assigned projects');
    }
    this.status = 'in-progress';
    this.workStarted = true;
    this.startedAt = new Date();
    await this.save();
    return this;
};

// Submit work
ProjectSchema.methods.submitWork = async function (submissionData, studentId) {
    if (!['in-progress', 'revision-requested'].includes(this.status)) {
        throw new Error('Cannot submit work at this stage');
    }

    const version = (this.submissions ? this.submissions.length : 0) + 1;

    const submission = {
        version,
        files: submissionData.files || [],
        links: submissionData.links || [],
        message: submissionData.message || '',
        submittedBy: studentId,
        submittedAt: new Date(),
        status: 'submitted',
    };

    this.submissions = this.submissions || [];
    this.submissions.push(submission);

    const submissionId = this.submissions[this.submissions.length - 1]._id;

    this.currentSubmission = {
        version,
        submissionId,
        status: 'submitted',
        submittedAt: new Date(),
    };

    this.status = 'under-review';
    if (version === 1 && !this.submittedAt) {
        this.submittedAt = new Date();
    }

    await this.save();
    return { submission: this.submissions.id(submissionId), project: this };
};

// Link a payment to this project
ProjectSchema.methods.linkPayment = async function (paymentId, amount) {
    this.payment = paymentId;
    this.paymentAmount = amount || this.paymentAmount || this.budgetMax;
    this.paymentStatus = 'pending';
    await this.save();
    return this;
};

ProjectSchema.methods.markPaymentCaptured = async function () {
    this.paymentStatus = 'captured';
    this.paymentCapturedAt = new Date();
    await this.save();
    return this;
};

ProjectSchema.methods.markPaymentReadyForRelease = async function () {
    this.paymentStatus = 'ready_for_release';
    await this.save();
    return this;
};

ProjectSchema.methods.markPaymentReleased = async function () {
    this.paymentStatus = 'released';
    this.paymentReleasedAt = new Date();
    await this.save();
    return this;
};

ProjectSchema.methods.markPaymentRefunded = async function () {
    this.paymentStatus = 'refunded';
    await this.save();
    return this;
};

// Approve work
ProjectSchema.methods.approveWork = async function (reviewerId, feedback = '') {
    if (this.status !== 'under-review') {
        throw new Error('Can only approve work that is under review');
    }

    const currentSubId = this.currentSubmission && this.currentSubmission.submissionId;
    const currentSub = this.submissions.id(currentSubId);
    if (!currentSub) {
        throw new Error('Current submission not found');
    }

    currentSub.status = 'approved';
    currentSub.reviewedAt = new Date();
    currentSub.reviewedBy = reviewerId;
    currentSub.companyFeedback = feedback;

    this.status = 'completed';
    this.reviewedAt = new Date();
    this.completedAt = new Date();

    await this.save();
    return { submission: currentSub, project: this };
};

// Request revision
ProjectSchema.methods.requestRevision = async function (reviewerId, reason) {
    if (this.status !== 'under-review') {
        throw new Error('Can only request revision for work under review');
    }

    if (this.revisionCount >= this.maxRevisionsAllowed) {
        throw new Error(`Maximum ${this.maxRevisionsAllowed} revisions reached. Please approve or reject.`);
    }

    const currentSubId = this.currentSubmission && this.currentSubmission.submissionId;
    const currentSub = this.submissions.id(currentSubId);
    if (!currentSub) {
        throw new Error('Current submission not found');
    }

    currentSub.status = 'revision-requested';
    currentSub.reviewedAt = new Date();
    currentSub.reviewedBy = reviewerId;
    currentSub.revisionRequested = true;
    currentSub.revisionReason = reason;

    this.revisionHistory = this.revisionHistory || [];
    this.revisionHistory.push({
        version: currentSub.version,
        requestedAt: new Date(),
        requestedBy: reviewerId,
        reason: reason,
    });

    this.revisionCount = (this.revisionCount || 0) + 1;
    this.status = 'revision-requested';
    this.reviewedAt = new Date();

    await this.save();
    return { submission: currentSub, project: this };
};

// Reject work (opens dispute)
ProjectSchema.methods.rejectWork = async function (reviewerId, reason) {
    if (this.status !== 'under-review') {
        throw new Error('Can only reject work that is under review');
    }

    if (this.revisionCount < this.maxRevisionsAllowed) {
        throw new Error('Please use revision request instead. Rejection is only allowed after maximum revisions.');
    }

    const currentSubId = this.currentSubmission && this.currentSubmission.submissionId;
    const currentSub = this.submissions.id(currentSubId);
    if (!currentSub) {
        throw new Error('Current submission not found');
    }

    currentSub.status = 'rejected';
    currentSub.reviewedAt = new Date();
    currentSub.reviewedBy = reviewerId;
    currentSub.companyFeedback = reason;

    this.status = 'disputed';
    this.reviewedAt = new Date();

    await this.save();
    return { submission: currentSub, project: this };
};

module.exports = mongoose.model('Project', ProjectSchema);
