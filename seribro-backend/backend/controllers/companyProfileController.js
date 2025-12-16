// backend/controllers/companyProfileController.js
// Company Profile se related saare controller functions

const CompanyProfile = require('../models/companyProfile');
const { calculateCompanyProfileCompletion } = require('../utils/company/calculateCompanyProfileCompletion');
const { uploadToCloudinary } = require('../utils/company/uploadToCloudinary');
const cloudinary = require('cloudinary').v2; // Cloudinary instance for cleanup
const fs = require('fs'); // File system for temp file deletion

// Utility function for consistent response
const sendResponse = (res, success, message, data = null, status = 200) => {
    return res.status(status).json({ success, message, data });
};

// Utility function to handle profile update and completion calculation
const updateProfileAndRecalculate = async (profile, res) => {
    try {
        // Profile completion percentage aur status calculate karna
        const { percentage, profileComplete } = calculateCompanyProfileCompletion(profile);

        // Profile mein update karna
        profile.profileCompletionPercentage = percentage;
        profile.profileComplete = profileComplete;

        // Profile save karna
        await profile.save();

        // Response mein updated profile aur completion details dena
        return sendResponse(
            res,
            true,
            'Profile safaltapoorvak update ho gaya.',
            {
                profile,
                completion: { percentage, profileComplete },
            }
        );
    } catch (error) {
        console.error('Profile save/recalculate mein error:', error);
        // Mongoose validation error handling
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return sendResponse(
                res,
                false,
                `Validation mein gadbad: ${messages.join(', ')}`,
                null,
                400
            );
        }
        // Duplicate key error handling (e.g., authorizedPerson email)
        if (error.code === 11000) {
            return sendResponse(
                res,
                false,
                'Yeh email address pehle se hi kisi aur profile mein istemaal ho chuka hai.',
                null,
                400
            );
        }
        return sendResponse(
            res,
            false,
            'Profile update karte samay server mein gadbad ho gayi.',
            null,
            500
        );
    }
};

// @desc    Company Profile create karna (agar nahi hai)
// @route   POST /api/company/profile/init
// @access  Private (Company)
const initializeCompanyProfile = async (req, res) => {
    try {
        // Check karna ki profile pehle se exist karta hai
        let profile = await CompanyProfile.findOne({ user: req.user.id });

        if (profile) {
            return sendResponse(
                res,
                true,
                'Company profile pehle se exist karta hai.',
                { profile }
            );
        }

        // Naya profile create karna
        const User = require('../models/User');
        const user = await User.findById(req.user.id);

        if (!user) {
            return sendResponse(
                res,
                false,
                'User nahi mila.',
                null,
                404
            );
        }

        profile = new CompanyProfile({
            user: req.user.id,
            companyName: '',
            companyEmail: user.email || '',
            mobile: '',
            website: '',
            industryType: '',
            companySize: '',
            about: '',
            logoUrl: '',
            logoPublicId: '',
            documents: [],
            authorizedPerson: {
                name: '',
                designation: '',
                email: '',
                linkedIn: '',
            },
            officeAddress: {
                addressLine: '',
                city: 'Bhavnagar',
                state: 'Gujarat',
                postal: '',
            },
            gstNumber: '',
            profileComplete: false,
            profileCompletionPercentage: 0,
            verificationStatus: 'draft',
        });

        await profile.save();

        sendResponse(
            res,
            true,
            'Company profile successfully create ho gaya.',
            { profile }
        );
    } catch (error) {
        console.error('Profile initialize karte samay error:', error);
        sendResponse(
            res,
            false,
            'Profile initialize karte samay server mein gadbad ho gayi.',
            null,
            500
        );
    }
};

// @desc    Company Profile ki jaankari lena
// @route   GET /api/company/profile
// @access  Private (Company)
const getCompanyProfile = async (req, res) => {
    try {
        let profile = await CompanyProfile.findOne({ user: req.user.id });

        if (!profile) {
            // Auto-create profile agar nahi hai
            const User = require('../models/User');
            const user = await User.findById(req.user.id);

            profile = new CompanyProfile({
                user: req.user.id,
                companyName: '',
                companyEmail: user.email || '',
                mobile: '',
                website: '',
                industryType: '',
                companySize: '',
                about: '',
                logoUrl: '',
                logoPublicId: '',
                documents: [],
                authorizedPerson: {
                    name: '',
                    designation: '',
                    email: '',
                    linkedIn: '',
                },
                officeAddress: {
                    addressLine: '',
                    city: 'Bhavnagar',
                    state: 'Gujarat',
                    postal: '',
                },
                gstNumber: '',
                profileComplete: false,
                profileCompletionPercentage: 0,
                verificationStatus: 'draft',
            });

            await profile.save();
        }

        sendResponse(res, true, 'Company profile safaltapoorvak mil gaya.', { profile });
    } catch (error) {
        console.error('Profile nikalne mein error:', error);
        sendResponse(
            res,
            false,
            'Profile nikalte samay server mein gadbad ho gayi.',
            null,
            500
        );
    }
};

// @desc    Company ki basic jaankari update karna
// @route   PUT /api/company/profile/basic
// @access  Private (Company)
const updateBasicInfo = async (req, res) => {
    try {
        const { companyName, mobile, website } = req.body;

        let profile = await CompanyProfile.findOne({ user: req.user.id });

        if (!profile) {
            // Naya profile banana agar nahi hai
            profile = await CompanyProfile.create({
                user: req.user.id,
                companyName,
                mobile,
                website,
                companyEmail: req.user.email,
            });
            return updateProfileAndRecalculate(profile, res);
        }

        // Existing profile ko update karna
        profile.companyName = companyName || profile.companyName;
        profile.mobile = mobile || profile.mobile;
        profile.website = website || profile.website;

        return updateProfileAndRecalculate(profile, res);
    } catch (error) {
        console.error('Basic info update mein error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return sendResponse(res, false, `Validation mein gadbad: ${messages.join(', ')}`, null, 400);
        }
        sendResponse(
            res,
            false,
            'Basic info update karte samay server mein gadbad ho gayi.',
            null,
            500
        );
    }
};

// @desc    Company ki details update karna
// @route   PUT /api/company/profile/details
// @access  Private (Company)
const updateDetails = async (req, res) => {
    try {
        const { industryType, companySize, officeAddress, about, gstNumber } = req.body;

        const profile = await CompanyProfile.findOne({ user: req.user.id });

        if (!profile) {
            return sendResponse(
                res,
                false,
                'Profile nahi mila. Kripya pehle basic info update karein.',
                null,
                404
            );
        }

        // Profile fields update karna
        profile.industryType = industryType || profile.industryType;
        profile.companySize = companySize || profile.companySize;
        profile.about = about || profile.about;
        profile.gstNumber = gstNumber || profile.gstNumber;

        // Office address ko update karna
        if (officeAddress) {
            profile.officeAddress.addressLine = officeAddress.addressLine || profile.officeAddress.addressLine;
            profile.officeAddress.city = officeAddress.city || profile.officeAddress.city;
            profile.officeAddress.state = officeAddress.state || profile.officeAddress.state;
            profile.officeAddress.postal = officeAddress.postal || profile.officeAddress.postal;
        }

        return updateProfileAndRecalculate(profile, res);
    } catch (error) {
        console.error('Details update mein error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return sendResponse(res, false, `Validation mein gadbad: ${messages.join(', ')}`, null, 400);
        }
        sendResponse(
            res,
            false,
            'Details update karte samay server mein gadbad ho gayi.',
            null,
            500
        );
    }
};

// @desc    Authorized Person ki jaankari update karna
// @route   PUT /api/company/profile/person
// @access  Private (Company)
const updateAuthorizedPerson = async (req, res) => {
    try {
        const { name, designation, email, linkedIn } = req.body;

        const profile = await CompanyProfile.findOne({ user: req.user.id });

        if (!profile) {
            return sendResponse(
                res,
                false,
                'Profile nahi mila. Kripya pehle basic info update karein.',
                null,
                404
            );
        }

        // Authorized person subdoc update karna
        profile.authorizedPerson.name = name || profile.authorizedPerson.name;
        profile.authorizedPerson.designation = designation || profile.authorizedPerson.designation;
        profile.authorizedPerson.email = email || profile.authorizedPerson.email;
        profile.authorizedPerson.linkedIn = linkedIn || profile.authorizedPerson.linkedIn;

        return updateProfileAndRecalculate(profile, res);
    } catch (error) {
        console.error('Authorized person update mein error:', error);
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return sendResponse(res, false, `Validation mein gadbad: ${messages.join(', ')}`, null, 400);
        }
        if (error.code === 11000) {
            return sendResponse(
                res,
                false,
                'Yeh email address pehle se hi kisi aur profile mein istemaal ho chuka hai.',
                null,
                400
            );
        }
        sendResponse(
            res,
            false,
            'Authorized person ki jaankari update karte samay server mein gadbad ho gayi.',
            null,
            500
        );
    }
};

// @desc    Company ka logo upload karna
// @route   POST /api/company/profile/logo
// @access  Private (Company)
const uploadLogo = async (req, res) => {
    let tempFilePath = null;
    try {
        const profile = await CompanyProfile.findOne({ user: req.user.id });
        if (!profile) {
            return sendResponse(res, false, 'Profile nahi mila. Kripya pehle basic info update karein.', null, 404);
        }

        if (!req.file) {
            return sendResponse(res, false, 'Kripya logo file chunein.', null, 400);
        }

        tempFilePath = req.file.path;

        // Cloudinary par upload karna
        const { url, publicId } = await uploadToCloudinary(tempFilePath, 'seribro/company-logos');

        // Purana logo delete karna
        if (profile.logoPublicId) {
            await cloudinary.uploader.destroy(profile.logoPublicId);
        }

        // Profile mein naya logo save karna
        profile.logoUrl = url;
        profile.logoPublicId = publicId;

        return updateProfileAndRecalculate(profile, res);
    } catch (error) {
        console.error('Logo upload mein error:', error);
        sendResponse(res, false, error.message || 'Logo upload karte samay server mein gadbad ho gayi.', null, 500);
    } finally {
        // Temporary file ko hamesha delete karna
        if (tempFilePath && fs.existsSync(tempFilePath)) {
            fs.unlinkSync(tempFilePath);
            console.log(`Temporary file deleted: ${tempFilePath}`);
        }
    }
};

// @desc    Company ke documents upload karna
// @route   POST /api/company/profile/documents
// @access  Private (Company)
const uploadDocuments = async (req, res) => {
    let tempFilePaths = [];
    try {
        const profile = await CompanyProfile.findOne({ user: req.user.id });
        if (!profile) {
            return sendResponse(res, false, 'Profile nahi mila. Kripya pehle basic info update karein.', null, 404);
        }

        if (!req.files || req.files.length === 0) {
            return sendResponse(res, false, 'Kripya document files chunein.', null, 400);
        }

        tempFilePaths = req.files.map((file) => file.path);
        const uploadedDocuments = [];

        // Har file ko Cloudinary par upload karna
        for (const file of req.files) {
            const { url, publicId } = await uploadToCloudinary(file.path, 'seribro/company-docs');
            uploadedDocuments.push({ url, publicId, type: file.mimetype });
        }

        // Profile mein documents add karna
        profile.documents.push(...uploadedDocuments);

        return updateProfileAndRecalculate(profile, res);
    } catch (error) {
        console.error('Documents upload mein error:', error);
        sendResponse(res, false, error.message || 'Documents upload karte samay server mein gadbad ho gayi.', null, 500);
    } finally {
        // Temporary files ko hamesha delete karna
        for (const filePath of tempFilePaths) {
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
                console.log(`Temporary file deleted: ${filePath}`);
            }
        }
    }
};

// @desc    Profile ko verification ke liye submit karna
// @route   POST /api/company/profile/submit-verification
// @access  Private (Company)
const submitForVerification = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ user: req.user.id });
        if (!profile) {
            return sendResponse(res, false, 'Profile nahi mila. Kripya pehle basic info update karein.', null, 404);
        }

        // Check karna ki profile complete hai
        if (!profile.profileComplete) {
            return sendResponse(
                res,
                false,
                'Verification ke liye submit karne se pehle kripya profile pura karein.',
                { completionPercentage: profile.profileCompletionPercentage },
                400
            );
        }

        // Verification status update karna
        profile.verificationStatus = 'pending';
        await profile.save();

        // Create admin notification for new verification request
        const { sendAdminNotification } = require('../utils/notifications/sendNotification');
        await sendAdminNotification(
            `New company profile submitted for verification: ${profile.companyName || 'Unknown'}`,
            'profile-submitted',
            'company',
            profile._id
        );
        console.log('✅ Admin notification sent for company verification request');

        sendResponse(
            res,
            true,
            'Aapka profile safaltapoorvak verification ke liye submit ho gaya hai. Admin jald hi review karenge.',
            { verificationStatus: profile.verificationStatus }
        );
    } catch (error) {
        console.error('Verification submit mein error:', error);
        sendResponse(res, false, 'Verification ke liye submit karte samay server mein gadbad ho gayi.', null, 500);
    }
};

// @desc    Company ka dashboard data lena
// @route   GET /api/company/dashboard
// @access  Private (Company)
const getCompanyDashboard = async (req, res) => {
    try {
        const profile = await CompanyProfile.findOne({ user: req.user.id });
        if (!profile) {
            return sendResponse(res, false, 'Aapka company profile abhi tak nahi bana hai.', null, 404);
        }

        // Dashboard data taiyar karna
        const dashboardData = {
            profileCompletionPercentage: profile.profileCompletionPercentage,
            profileComplete: profile.profileComplete,
            verificationStatus: profile.verificationStatus,
            companyName: profile.companyName,
            logoUrl: profile.logoUrl,
            companyEmail: profile.companyEmail,
            mobile: profile.mobile,
        };

        sendResponse(res, true, 'Dashboard data safaltapoorvak mil gaya.', dashboardData);
    } catch (error) {
        console.error('Dashboard data nikalne mein error:', error);
        sendResponse(res, false, 'Dashboard data nikalte samay server mein gadbad ho gayi.', null, 500);
    }
};

// Export all functions
module.exports = {
    initializeCompanyProfile,
    getCompanyProfile,
    updateBasicInfo,
    updateDetails,
    updateAuthorizedPerson,
    uploadLogo,
    uploadDocuments,
    submitForVerification,
    getCompanyDashboard,
};