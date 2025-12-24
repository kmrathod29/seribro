const mongoose = require('mongoose');

// Authorized Person ka sub-document schema
const authorizedPersonSchema = new mongoose.Schema({
    name: {
        type: String,
        default: '', // Optional during creation
    },
    designation: {
        type: String,
        default: '', // Optional during creation
    },
    email: {
        type: String,
        default: '', // Optional during creation
        sparse: true, // Allows multiple null values but enforces uniqueness when present
        match: [
            /^$|^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, // Empty or valid email
            'Kripya sahi email address daalein', // Please enter a valid email address
        ],
    },
    linkedIn: {
        type: String,
        default: '',
    },
});

// Document ka sub-document schema
const documentSchema = new mongoose.Schema({
    url: {
        type: String,
        required: true,
    },
    publicId: {
        type: String,
        required: true,
    },
    type: {
        type: String, // Jaise 'pdf', 'image/jpeg'
        required: true,
    },
});

// Main CompanyProfile Schema
const CompanyProfileSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User', // Phase-1 User model se reference
            required: true,
            unique: true, // Har user ka ek hi profile hona chahiye - Yeh apne aap index banata hai
        },
        companyName: {
            type: String,
            default: '', // Optional during creation
            trim: true,
        },
        companyEmail: {
            type: String,
            default: '', // Optional during creation
            match: [
                /^$|^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, // Empty or valid email
                'Kripya sahi company email address daalein',
            ],
        },
        mobile: {
            type: String,
            default: '', // Optional during creation
            match: [/^$|^\d{10}$/, 'Mobile number 10 anko ka hona chahiye ya empty'], // Empty or exactly 10 digits
        },
        website: {
            type: String,
            default: '',
        },
        industryType: {
            type: String,
            default: '',
        },
        companySize: {
            type: String,
            default: '',
        },
        officeAddress: {
            addressLine: {
                type: String,
                default: '',
            },
            city: {
                type: String,
                default: 'Bhavnagar', // Default city
            },
            state: {
                type: String,
                default: 'Gujarat', // Default state
            },
            postal: {
                type: String,
                default: '',
            },
        },
        about: {
            type: String,
            default: '',
            maxlength: [500, 'About section 500 aksharon se zyada nahi hona chahiye'],
        },
        logoUrl: {
            type: String,
            default: '',
        },
        logoPublicId: {
            type: String,
            default: '',
        },
        documents: [documentSchema], // Documents ka array
        authorizedPerson: authorizedPersonSchema, // Authorized person ka sub-document
        gstNumber: {
            type: String,
            default: '',
        },
        profileComplete: {
            type: Boolean,
            default: false, // Shuru mein false
        },
        profileCompletionPercentage: {
            type: Number,
            default: 0, // Shuru mein 0
        },
        verificationStatus: {
            type: String,
            enum: ['draft', 'pending', 'approved', 'rejected'],
            default: 'draft', // Shuru mein draft
            index: true,
        },
        // Phase 3.2 admin fields
        verificationRequestedAt: { type: Date, default: null },
        verifiedAt: { type: Date, default: null },
        verifiedByAdmin: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
        rejectionReason: { type: String, default: '', maxlength: 500 },
        
        // ========== Phase 5.3: Payment & Rating Tracking ==========
        payments: {
            totalSpent: { type: Number, default: 0 },
            completedProjects: { type: Number, default: 0 },
            lastPaymentDate: Date
        },
        ratings: {
            averageRating: { type: Number, default: 0, min: 0, max: 5 },
            totalRatings: { type: Number, default: 0 },
            ratingDistribution: {
                five: { type: Number, default: 0 },
                four: { type: Number, default: 0 },
                three: { type: Number, default: 0 },
                two: { type: Number, default: 0 },
                one: { type: Number, default: 0 }
            }
        },

        // Phase 4.1: Project management fields
        postedProjectsCount: {
            type: Number,
            default: 0, // Company ne kitne projects post kiye
        },
        activeProjectsCount: {
            type: Number,
            default: 0, // Active projects count (open, assigned, in-progress)
        },
    },
    {
        timestamps: true, // createdAt aur updatedAt automatically add honge
    }
);

// Duplicate index warning ko fix karne ke liye yeh line remove kar di gayi
// CompanyProfileSchema.index({ user: 1 }); // ❌ Yeh line hatai gayi

// Methods for updating payments and ratings
CompanyProfileSchema.methods._getRatingKey = function(rating) {
    if (rating >= 5) return 'five';
    if (rating >= 4) return 'four';
    if (rating >= 3) return 'three';
    if (rating >= 2) return 'two';
    return 'one';
};

CompanyProfileSchema.methods.updatePayments = function(amount) {
    if (!this.payments) this.payments = { totalSpent: 0, completedProjects: 0 };
    this.payments.totalSpent = (this.payments.totalSpent || 0) + amount;
    this.payments.completedProjects = (this.payments.completedProjects || 0) + 1;
    this.payments.lastPaymentDate = new Date();
    return this.save();
};

CompanyProfileSchema.methods.updateRating = function(newRating) {
    if (!this.ratings) this.ratings = { averageRating: 0, totalRatings: 0, ratingDistribution: { five:0,four:0,three:0,two:0,one:0 } };
    const total = this.ratings.totalRatings || 0;
    const current = this.ratings.averageRating || 0;

    this.ratings.averageRating = ((current * total) + newRating) / (total + 1);
    this.ratings.totalRatings = total + 1;
    const key = this._getRatingKey(newRating);
    this.ratings.ratingDistribution[key] = (this.ratings.ratingDistribution[key] || 0) + 1;
    return this.save();
};

// Check if model already exists to prevent OverwriteModelError
const CompanyProfile = mongoose.models.CompanyProfile || mongoose.model('CompanyProfile', CompanyProfileSchema);

module.exports = CompanyProfile;