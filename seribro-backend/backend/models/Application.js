// backend/models/Application.js
// Student applications ka model - Phase 4.2

const mongoose = require('mongoose');

// Main Application Schema
const ApplicationSchema = new mongoose.Schema(
    {
        // Project ka reference
        project: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: [true, 'Project ID zaroori hai'],
            index: true,
        },
        projectId: {
            // Redundant for easy filtering
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Project',
            required: true,
            index: true,
        },

        // Student ka reference
        student: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StudentProfile',
            required: [true, 'Student ID zaroori hai'],
            index: true,
        },
        studentId: {
            // Redundant for easy filtering
            type: mongoose.Schema.Types.ObjectId,
            ref: 'StudentProfile',
            required: true,
            index: true,
        },

        // Company ka reference
        company: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CompanyProfile',
            required: [true, 'Company ID zaroori hai'],
        },
        companyId: {
            // Redundant for easy filtering
            type: mongoose.Schema.Types.ObjectId,
            ref: 'CompanyProfile',
            required: true,
            index: true,
        },

        // Student ka cover letter
        coverLetter: {
            type: String,
            required: [true, 'Cover letter zaroori hai'],
            minlength: [50, 'Cover letter kam se kam 50 characters ka hona chahiye'],
            maxlength: [1000, 'Cover letter 1000 characters se zyada nahi ho sakta'],
            trim: true,
        },

        // Student ka proposed price (budget mein student kya lena chahta hai)
        proposedPrice: {
            type: Number,
            required: [true, 'Proposed price zaroori hai'],
            min: [0, 'Price negative nahi ho sakta'],
            validate: {
                validator: function(value) {
                    return value > 0;
                },
                message: 'Proposed price zero se zyada hona chahiye',
            },
        },

        // Estimated time to complete
        estimatedTime: {
            type: String,
            enum: [
                '1 week',
                '2 weeks',
                '3-4 weeks',
                '1-2 months',
                '2-3 months',
            ],
            required: [true, 'Estimated time select karna zaroori hai'],
        },

        // Application ki status
        status: {
            type: String,
            enum: ['pending', 'shortlisted', 'awaiting_acceptance', 'accepted', 'rejected', 'rejected_by_student', 'on_hold', 'withdrawn', 'expired'],
            default: 'pending',
            index: true,
        },

        // Timestamps
        appliedAt: {
            type: Date,
            default: Date.now,
            index: true,
        },
        reviewedAt: {
            type: Date,
            default: null,
        },
        respondedAt: {
            type: Date,
            default: null,
        },
        withdrawnAt: {
            type: Date,
            default: null,
        },

        // Company ka response / feedback
        companyResponse: {
            type: String,
            default: '',
            maxlength: [500, 'Company response 500 characters se zyada nahi ho sakta'],
        },

        // Rejection reason - agar rejected ho
        rejectionReason: {
            type: String,
            default: '',
            maxlength: [500, 'Rejection reason 500 characters se zyada nahi ho sakta'],
        },

        // ========== Phase 4.3: Company Response Fields ==========

        // Company ne jab pehli bar dekha
        companyViewedAt: {
            type: Date,
            default: null,
        },

        // When shortlisted
        shortlistedAt: {
            type: Date,
            default: null,
        },

        // When accepted
        acceptedAt: {
            type: Date,
            default: null,
        },

        // When rejected
        rejectedAt: {
            type: Date,
            default: null,
        },

        // ========== Phase 4.3: Cached Student Data ==========
        // Ye caching ke liye zaroori hai - jab application accept/reject hote hain
        // tab bhi student ka data accessible rahe

        // Student ka naam - cached
        studentName: {
            type: String,
            default: '',
        },

        // Student ka email - cached
        studentEmail: {
            type: String,
            default: '',
        },

        // Student ka college - cached
        studentCollege: {
            type: String,
            default: '',
        },

        // Student ke skills - cached
        studentSkills: {
            type: [String],
            default: [],
        },

        // Student ka photo - cached
        studentPhoto: {
            type: String,
            default: '',
        },

        // Student ka resume URL - cached
        studentResume: {
            type: String,
            default: '',
        },

        // ========== Phase 4.5: Student Snapshot at Apply Time ==========
        // Complete snapshot of student data when they applied
        studentSnapshot: {
            name: {
                type: String,
                default: '',
            },
            collegeName: {
                type: String,
                default: '',
            },
            city: {
                type: String,
                default: '',
            },
            skills: {
                type: [String],
                default: [],
            },
            resumeUrl: {
                type: String,
                default: '',
            },
            collegeIdUrl: {
                type: String,
                default: '',
            },
            appliedAt: {
                type: Date,
                default: Date.now,
            },
        },

        // ========== Phase 4: Student Data with Hidden Fields ==========
        // Complete student profile snapshot with hidden email/phone for security
        studentData: {
            type: mongoose.Schema.Types.Mixed,
            default: {},
            // Structure:
            // {
            //   fullName: String,
            //   college: String,
            //   city: String,
            //   course: String,
            //   year: String,
            //   skills: [String],
            //   projects: [Object],
            //   resume: String,
            //   certificates: [String],
            //   profilePicture: String,
            //   cgpa: Number,
            //   _hiddenEmail: String,  // NOT sent to frontend
            //   _hiddenPhone: String   // NOT sent to frontend
            // }
        },

        // ========== Phase 4.5+: Selection System Fields ==========

        // Priority assigned during shortlisting (1-5, 1 = highest)
        shortlistPriority: {
            type: Number,
            default: null,
            min: 1,
            max: 5,
        },

        // When company selected this student for final consideration
        selectedAt: {
            type: Date,
            default: null,
        },

        // Deadline for student response (24h from selection)
        acceptanceDeadline: {
            type: Date,
            default: null,
            index: true,
        },

        // When student accepted or declined
        respondedToSelectionAt: {
            type: Date,
            default: null,
        },

        // Student's decision (accept/decline)
        studentDecision: {
            type: String,
            enum: ['accept', 'decline', null],
            default: null,
        },

        // If student declined, why?
        declineReason: {
            type: String,
            default: '',
            maxlength: [500, 'Decline reason 500 characters se zyada nahi ho sakta'],
        },

        // Audit log for all status transitions
        statusHistory: [
            {
                status: String,
                changedAt: {
                    type: Date,
                    default: Date.now,
                },
                changedBy: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: 'User',
                },
                reason: String,
                metadata: mongoose.Schema.Types.Mixed,
            },
        ],

        // Transaction ID for atomicity
        transactionId: {
            type: String,
            default: null,
        },

        // Is this application part of a selection round?
        selectionRound: {
            type: Number,
            default: null,
        },
    },
    {
        timestamps: true, // createdAt aur updatedAt automatically add honge
    }
);

// ========== INDEXES ==========

// Student ke liye fast lookup
ApplicationSchema.index({ student: 1, status: 1 });

// Project ke applications
ApplicationSchema.index({ project: 1, status: 1 });

// Company ke applications
ApplicationSchema.index({ company: 1, status: 1 });

// Phase 4.3: Compound index for company and status (most used in company dashboard)
ApplicationSchema.index({ companyId: 1, status: 1, appliedAt: -1 });

// Phase 4.3: Compound index for project and company (for project-wise applications)
ApplicationSchema.index({ projectId: 1, companyId: 1, status: 1 });

// Applied date ke liye sorting
ApplicationSchema.index({ appliedAt: -1 });

// Duplicate prevention - ek student ek project mein sirf ek bar apply kar sakta hai
// Withdrawn applications ko bhi count karte hain taki wo dobara apply kar sakein
ApplicationSchema.index(
    { studentId: 1, projectId: 1 },
    {
        unique: true,
        sparse: true, // NULL values ko unique constraint se exclude karte hain
        partialFilterExpression: { 'status': { $ne: 'withdrawn' } }, // Withdrawn applications ko unique constraint se exclude
    }
);

// Compound index for common queries
ApplicationSchema.index({ company: 1, appliedAt: -1 });

// ========== Phase 4.5+: Selection System Indexes ==========

// For finding applications with deadline approaching
ApplicationSchema.index({ projectId: 1, acceptanceDeadline: 1, status: 1 });

// For shortlist with priority sorting
ApplicationSchema.index({ projectId: 1, status: 1, shortlistPriority: 1 });

// For on_hold applications (backup list)
ApplicationSchema.index({ projectId: 1, status: 1, createdAt: 1 });

// For transaction-based operations
ApplicationSchema.index({ transactionId: 1 });

// For audit trail queries
ApplicationSchema.index({ 'statusHistory.changedAt': -1 });

// ========== METHODS ==========

/**
 * Hinglish: Check karo ki student ne is project mein pehle se apply kiya hai ya nahi
 */
ApplicationSchema.statics.hasStudentApplied = async function(studentId, projectId) {
    const application = await this.findOne({
        student: studentId,
        project: projectId,
        status: { $ne: 'withdrawn' }, // Withdrawn applications count nahi honge
    });
    return !!application;
};

/**
 * Hinglish: Get all active applications (non-withdrawn)
 */
ApplicationSchema.statics.getActiveApplications = function(studentId) {
    return this.find({
        student: studentId,
        status: { $ne: 'withdrawn' },
    }).populate('project company');
};

/**
 * Hinglish: Calculate statistics for a student
 */
ApplicationSchema.statics.getStudentStats = async function(studentId) {
    const stats = await this.aggregate([
        {
            $match: {
                student: new mongoose.Types.ObjectId(studentId),
                status: { $ne: 'withdrawn' },
            },
        },
        {
            $group: {
                _id: '$status',
                count: { $sum: 1 },
            },
        },
    ]);

    // Format karte hain
    const result = {
        total: 0,
        pending: 0,
        shortlisted: 0,
        accepted: 0,
        rejected: 0,
    };

    stats.forEach((stat) => {
        result[stat._id] = stat.count;
        result.total += stat.count;
    });

    return result;
};

const Application = mongoose.model('Application', ApplicationSchema);

module.exports = Application;
