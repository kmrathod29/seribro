// middleware/student/profileCompletionCheck.js
// Ensures profile is 100% complete before verification - Phase 2.1

const sendResponse = require('../../utils/students/sendResponse');
const StudentProfile = require('../../models/StudentProfile');

const profileCompletionCheck = async (req, res, next) => {
    try {
        const studentId = req.student?.id || req.user?.studentId || req.user?.id;

        if (!studentId) {
            return sendResponse(res, 401, false, 'Authentication data missing.');
        }

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found. Please create your profile first.');
        }

        // Calculate fresh completion status
        const completion = profile.calculateProfileCompletion();
        await profile.save();

        if (completion < 100) {
            const missingItems = [];

            if (!profile.basicInfo.fullName || !profile.basicInfo.phone || !profile.basicInfo.degree || !profile.basicInfo.graduationYear) {
                missingItems.push('Complete Basic Info (name, phone, degree, graduation year)');
            }
            if (!profile.skills.technical || profile.skills.technical.length === 0) {
                missingItems.push('Add Technical Skills');
            }
            if (profile.projects.length < 3) {
                missingItems.push(`Add ${3 - profile.projects.length} more project(s)`);
            }
            if (!profile.documents.resume.path) {
                missingItems.push('Upload Resume (PDF)');
            }
            if (!profile.documents.collegeId.path) {
                missingItems.push('Upload College ID');
            }

            return sendResponse(res, 400, false, 
                `Profile incomplete (${completion}%). Please complete: ${missingItems.join(', ')}`);
        }

        // Profile is complete, attach to request for next middleware
        req.profile = profile;
        next();
    } catch (error) {
        console.error('❌ Error in profileCompletionCheck middleware:', error);
        return sendResponse(res, 500, false, 'Server error during profile completion check.', null, error.message);
    }
};

module.exports = { profileCompletionCheck };