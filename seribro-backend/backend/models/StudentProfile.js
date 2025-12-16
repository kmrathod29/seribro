// backend/models/StudentProfile.js
// Student Profile Model - Phase 2.1

const mongoose = require('mongoose');

// Project Sub-Schema
const ProjectSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [100, 'Title cannot exceed 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true,
        maxlength: [1000, 'Description cannot exceed 1000 characters']
    },
    technologies: {
        type: [String],
        default: [],
        validate: {
            validator: function(arr) {
                return arr.length <= 10; // Max 10 technologies per project
            },
            message: 'Maximum 10 technologies allowed per project'
        }
    },
    role: {
        type: String,
        trim: true,
        default: '',
        maxlength: 50
    },
    duration: {
        type: String,
        trim: true,
        default: '',
        maxlength: 50
    },
    link: {
        type: String,
        trim: true,
        default: '',
        validate: {
            validator: function(url) {
                if (!url) return true; // Optional field
                return /^https?:\/\/.+/.test(url);
            },
            message: 'Please provide a valid URL'
        }
    },
    isLive: {
        type: Boolean,
        default: false
    },
    screenshot: {
        type: String,
        default: null
    }
}, { _id: true, timestamps: true });

// Main Student Profile Schema
const StudentProfileSchema = new mongoose.Schema({
    // Link to Student model (Phase 1)
    student: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Student',
        required: true,
        unique: true,
        index: true
    },

    // Link to User model (Phase 1)
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true,
        index: true
    },

    // ========== BASIC PROFILE INFO ==========
    basicInfo: {
        fullName: {
            type: String,
            trim: true,
            minlength: [2, 'Name must be at least 2 characters'],
            default: ''
        },
        email: {
            type: String,
            trim: true,
            lowercase: true,
            match: [/^$|^\S+@\S+\.\S+$/, 'Please provide a valid email'],
            default: ''
        },
        phone: {
            type: String,
            trim: true,
            match: [/^$|^[0-9+\-\s()]{10,20}$/, 'Please provide a valid phone number'],
            default: ''
        },
        collegeName: {
            type: String,
            trim: true,
            default: ''
        },
        degree: {
            type: String,
            enum: {
                values: ['B.Tech', 'M.Tech', 'BCA', 'MCA', 'B.Sc', 'M.Sc', 'Diploma', 'Other', ''],
                message: 'Please select a valid degree'
            },
            default: ''
        },
        branch: {
            type: String,
            trim: true,
            default: ''
        },
        graduationYear: {
            type: Number,
            min: [2020, 'Graduation year must be 2020 or later'],
            max: [2035, 'Graduation year cannot be beyond 2035'],
            default: null
        },
        currentYear: {
            type: String,
            enum: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Passout', ''],
            default: ''
        },
        semester: {
            type: String,
            enum: ['1', '2', '3', '4', '5', '6', '7', '8', ''],
            default: ''
        },
        studentId: {
            type: String,
            trim: true,
            default: ''
        },
        rollNumber: {
            type: String,
            trim: true,
            default: ''
        },
        location: {
            type: String,
            trim: true,
            default: ''
        },
        bio: {
            type: String,
            trim: true,
            maxlength: [500, 'Bio cannot exceed 500 characters'],
            default: ''
        }
    },

    // ========== SKILLS ==========
    skills: {
        technical: {
            type: [String],
            default: [],
            validate: {
                validator: function(arr) {
                    return arr.length <= 20; // Max 20 technical skills
                },
                message: 'Maximum 20 technical skills allowed'
            }
        },
        soft: {
            type: [String],
            default: [],
            validate: {
                validator: function(arr) {
                    return arr.length <= 10;
                },
                message: 'Maximum 10 soft skills allowed'
            }
        },
        languages: {
            type: [String],
            default: [],
            validate: {
                validator: function(arr) {
                    return arr.length <= 10;
                },
                message: 'Maximum 10 languages allowed'
            }
        },
        primarySkills: {
            type: [String],
            enum: {
                values: [
  'Web Development',
  'Full Stack Web Development',
  'Frontend Development',
  'Backend Development',
  'App Development',
  'UI/UX Design',
  'Data Science',
  'Cloud Computing',
  'Cyber Security',
  'Machine Learning',
  'Blockchain',
  'DevOps',
  'Game Development',
  'Other',
  ''
],

                message: 'Invalid primary skill selected'
            },
            default: []
        },
        techStack: {
            type: [String],
            default: [],
            validate: {
                validator: function(arr) {
                    return arr.length <= 15;
                },
                message: 'Maximum 15 technologies in tech stack allowed'
            }
        }
    },

    // ========== PROJECTS (Minimum 3 for verification) ==========
    projects: {
        type: [ProjectSchema],
        default: []
    },

    // ========== DOCUMENTS ==========
    documents: {
        resume: {
            filename: {
                type: String,
                default: null
            },
            public_id: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            },
            path: {
                type: String,
                default: null
            },
            uploadedAt: {
                type: Date,
                default: null
            }
        },
        collegeId: {
            filename: {
                type: String,
                default: null
            },
            public_id: {
                type: String,
                default: null
            },
            url: {
                type: String,
                default: null
            },
            path: {
                type: String,
                default: null
            },
            uploadedAt: {
                type: Date,
                default: null
            }
        },
        certificates: [{
            filename: String,
            public_id: String,
            url: String,
            path: String,
            title: String,
            uploadedAt: {
                type: Date,
                default: Date.now
            }
        }]
    },

    // ========== PORTFOLIO LINKS ==========
    links: {
        github: {
            type: String,
            trim: true,
            default: '',
            validate: {
                validator: function(url) {
                    if (!url) return true;
                    return /^https?:\/\/(www\.)?github\.com\/[a-zA-Z0-9_-]+\/[a-zA-Z0-9_-]+(\/)?$/.test(url);
                },
                message: 'Please provide a valid GitHub repository link'
            }
        },
        linkedin: {
            type: String,
            trim: true,
            default: '',
            validate: {
                validator: function(url) {
                    if (!url) return true;
                    return /^https?:\/\/(www\.)?linkedin\.com\/in\/.+/.test(url);
                },
                message: 'Please provide a valid LinkedIn profile link'
            }
        },
        portfolio: {
            type: String,
            trim: true,
            default: '',
            validate: {
                validator: function(url) {
                    if (!url) return true;
                    return /^https?:\/\/.+/.test(url);
                },
                message: 'Please provide a valid URL'
            }
        },
        other: [{
            name: {
                type: String,
                trim: true,
                maxlength: 50
            },
            url: {
                type: String,
                trim: true,
                validate: {
                    validator: function(url) {
                        if (!url) return true;
                        return /^https?:\/\/.+/.test(url);
                    },
                    message: 'Please provide a valid URL'
                }
            }
        }]
    },

    // ========== ADMIN VERIFICATION FIELDS (Phase 3.2) ==========
    // Hinglish: Admin verification ke liye top-level fields add kiye gaye
    verificationStatus: {
        type: String,
        enum: ['draft', 'pending', 'approved', 'rejected'],
        default: 'draft',
        index: true
    },
    verificationRequestedAt: { type: Date, default: null },
    verifiedAt: { type: Date, default: null },
    verifiedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    rejectionReason: { type: String, default: '', maxlength: 500 },

    // ========== LEGACY VERIFICATION (Phase 2) ==========
    // Hinglish: Backward-compatibility ke liye purana verification object bhi rakha hai
    verification: {
        status: {
            type: String,
            enum: {
                values: ['incomplete', 'pending', 'verified', 'rejected'],
                message: 'Invalid verification status'
            },
            default: 'incomplete'
        },
        isCollegeIdVerified: {
            type: Boolean,
            default: false
        },
        verifiedAt: {
            type: Date,
            default: null
        },
        verifiedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            default: null
        },
        rejectionReason: {
            type: String,
            default: '',
            maxlength: [500, 'Rejection reason cannot exceed 500 characters']
        },
        submittedForVerificationAt: {
            type: Date,
            default: null
        }
    },

    // ========== PROFILE STATS ==========
    profileStats: {
        profileCompletion: {
            type: Number,
            default: 0,
            min: [0, 'Completion cannot be negative'],
            max: [100, 'Completion cannot exceed 100'],
            index: true
        },
        lastUpdated: {
            type: Date,
            default: Date.now
        },
        viewCount: {
            type: Number,
            default: 0,
            min: 0
        }
    },

    // ========== APPLICATIONS (Future Use) ==========
    applications: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Application'
    }],

    // ========== STATUS ==========
    status: {
        isActive: {
            type: Boolean,
            default: true
        },
        isBlocked: {
            type: Boolean,
            default: false
        },
        blockedReason: {
            type: String,
            default: '',
            maxlength: [500, 'Block reason cannot exceed 500 characters']
        }
    },

    // ========== PHASE 4.2: PROJECT APPLICATION TRACKING ==========
    appliedProjectsCount: {
        type: Number,
        default: 0, // Kitne projects mein student ne apply kiya
    },
    activeProjectsCount: {
        type: Number,
        default: 0, // Active applications (pending, shortlisted, accepted)
    },

}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// ========== INDEXES ==========
// Note: Fields with unique: true are auto-indexed. Only define compound or special indexes here.
StudentProfileSchema.index({ 'basicInfo.collegeName': 1 });
StudentProfileSchema.index({ 'skills.technical': 1 });
StudentProfileSchema.index({ 'profileStats.profileCompletion': -1 }); // Descending for sorting

// ========== VIRTUAL FIELDS ==========
StudentProfileSchema.virtual('totalProjects').get(function() {
    return this.projects ? this.projects.length : 0;
});

StudentProfileSchema.virtual('hasMinimumProjects').get(function() {
    return this.projects && this.projects.length >= 3;
});

StudentProfileSchema.virtual('isFullyVerified').get(function() {
    return this.verification.status === 'verified' && this.verification.isCollegeIdVerified;
});

// ========== INSTANCE METHODS ==========

// Calculate profile completion percentage
StudentProfileSchema.methods.calculateProfileCompletion = function() {
    let completion = 0;
    const weights = {
        basicInfo: 25,
        skills: 15,
        projects: 30,
        resume: 10,
        collegeId: 20
    };

    // Basic Info (25%) - Check all required fields
    const basic = this.basicInfo;
    if (basic && 
        basic.fullName && basic.email && basic.phone && 
        basic.collegeName && basic.degree && basic.graduationYear) {
        completion += weights.basicInfo;
    }

    // Skills (15%) - Check technical skills
    if (this.skills && this.skills.technical && this.skills.technical.length > 0) {
        completion += weights.skills;
    }

    // Projects (30%) - Check minimum 3 projects
    if (this.projects && this.projects.length >= 3) {
        completion += weights.projects;
    }

    // Resume (10%) - Check if uploaded
    if (this.documents && this.documents.resume && this.documents.resume.path) {
        completion += weights.resume;
    }

    // College ID (20%) - Check if uploaded
    if (this.documents && this.documents.collegeId && this.documents.collegeId.path) {
        completion += weights.collegeId;
    }

    // Update the field
    if (this.profileStats) {
        this.profileStats.profileCompletion = completion;
    }

    return completion;
};

// Check if profile is 100% complete
StudentProfileSchema.methods.isProfileComplete = function() {
    return this.calculateProfileCompletion() === 100;
};

// Submit profile for verification
StudentProfileSchema.methods.submitForVerification = async function() {
    if (!this.isProfileComplete()) {
        throw new Error('Profile is not 100% complete. Please fill all mandatory fields.');
    }
    
    if (!this.projects || this.projects.length < 3) {
        throw new Error('Minimum 3 projects required for verification.');
    }

    // Legacy verification object update (Phase 2)
    this.verification.status = 'pending';
    this.verification.submittedForVerificationAt = new Date();

    // New top-level admin verification fields (Phase 3.2)
    this.verificationStatus = 'pending';
    this.verificationRequestedAt = new Date();
    this.verifiedAt = null;
    this.verifiedByAdmin = null;
    this.rejectionReason = '';

    this.profileStats.lastUpdated = new Date();
    await this.save();
    return this;
};

// Verify profile (Admin action)
StudentProfileSchema.methods.verifyProfile = async function(adminUserId) {
    this.verification.status = 'verified';
    this.verification.isCollegeIdVerified = true;
    this.verification.verifiedAt = new Date();
    this.verification.verifiedBy = adminUserId;
    this.profileStats.lastUpdated = new Date();
    await this.save();
    return this;
};

// Reject profile (Admin action)
StudentProfileSchema.methods.rejectProfile = async function(reason) {
    this.verification.status = 'rejected';
    this.verification.rejectionReason = reason;
    this.profileStats.lastUpdated = new Date();
    await this.save();
    return this;
};

// Add project
StudentProfileSchema.methods.addProject = async function(projectData) {
    if (this.projects && this.projects.length >= 5) {
        throw new Error('Maximum 5 projects allowed. Delete an existing project first.');
    }
    
    this.projects.push(projectData);
    this.profileStats.lastUpdated = new Date();
    await this.save();
    return this;
};

// Update project
StudentProfileSchema.methods.updateProject = async function(projectId, projectData) {
    const project = this.projects.id(projectId);
    if (!project) {
        throw new Error('Project not found');
    }
    
    Object.assign(project, projectData);
    this.profileStats.lastUpdated = new Date();
    await this.save();
    return project;
};

// Delete project
StudentProfileSchema.methods.deleteProject = async function(projectId) {
    if (!this.projects || this.projects.length <= 3) {
        throw new Error('Cannot delete project. Minimum 3 projects required.');
    }
    
    const project = this.projects.id(projectId);
    if (!project) {
        throw new Error('Project not found');
    }

    this.projects.pull(projectId);
    this.profileStats.lastUpdated = new Date();
    await this.save();
    return this;
};

// ========== STATIC METHODS ==========

// Find profile by student ID
StudentProfileSchema.statics.findByStudentId = function(studentId) {
    return this.findOne({ student: studentId })
        .populate('student', 'email role')
        .populate('user', 'name email role');
};

// Find profile by user ID
StudentProfileSchema.statics.findByUserId = function(userId) {
    return this.findOne({ user: userId })
        .populate('student', 'email role')
        .populate('user', 'name email role');
};

// Find by verification status
StudentProfileSchema.statics.findByVerificationStatus = function(status) {
    return this.find({ 'verification.status': status })
        .populate('student', 'email role')
        .populate('user', 'name email role');
};

// Find verified profiles
StudentProfileSchema.statics.findVerified = function() {
    return this.find({ 'verification.status': 'verified' })
        .populate('student', 'email role')
        .populate('user', 'name email role');
};

// Search by skills
StudentProfileSchema.statics.searchBySkills = function(skillsArray) {
    return this.find({ 
        'skills.technical': { $in: skillsArray },
        'verification.status': 'verified'
    }).populate('student', 'email role')
      .populate('user', 'name email role');
};

// Search by college
StudentProfileSchema.statics.searchByCollege = function(collegeName) {
    const regex = new RegExp(collegeName, 'i');
    return this.find({ 
        'basicInfo.collegeName': regex,
        'verification.status': 'verified'
    }).populate('student', 'email role')
      .populate('user', 'name email role');
};

// ========== PRE-SAVE MIDDLEWARE ==========

// Update lastUpdated timestamp
StudentProfileSchema.pre('save', function(next) {
    if (this.isModified() && !this.isNew) {
        this.profileStats.lastUpdated = new Date();
    }
    next();
});

// Auto-calculate profile completion before save
StudentProfileSchema.pre('save', function(next) {
    try {
        this.calculateProfileCompletion();
    } catch (error) {
        console.error('Error calculating profile completion:', error);
    }
    next();
});

// Prevent removal of required documents if verified
StudentProfileSchema.pre('save', function(next) {
    if (this.isModified('documents') && this.verification.status === 'verified') {
        // If trying to remove resume or college ID while verified
        if (!this.documents.resume.path || !this.documents.collegeId.path) {
            return next(new Error('Cannot remove required documents while profile is verified. Revert to incomplete first.'));
        }
    }
    next();
});

const StudentProfile = mongoose.model('StudentProfile', StudentProfileSchema);

module.exports = StudentProfile;