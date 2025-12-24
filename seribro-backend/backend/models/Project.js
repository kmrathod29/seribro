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
            enum: ['open', 'selection_pending', 'assigned', 'in-progress', 'completed', 'cancelled', 'closed'],
            default: 'open',
        },

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

module.exports = mongoose.model('Project', ProjectSchema);
