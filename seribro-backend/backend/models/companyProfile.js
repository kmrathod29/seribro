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

// Check if model already exists to prevent OverwriteModelError
const CompanyProfile = mongoose.models.CompanyProfile || mongoose.model('CompanyProfile', CompanyProfileSchema);

module.exports = CompanyProfile;