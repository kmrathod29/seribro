// backend/middleware/student/projectAccessMiddleware.js
// Student project access checks - Phase 4.2

const StudentProfile = require('../../models/StudentProfile');

/**
 * Hinglish: Check karo ki student profile 100% complete hai aur admin ne verify kar diya hai
 * Yeh middleware project details aur apply ke liye zaruri hai
 */
exports.ensureProfileComplete = async (req, res, next) => {
    try {
        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return res.status(403).json({
                success: false,
                message: 'Student profile nahi mila.',
                requiresCompletion: true,
                data: null,
            });
        }

        // Check profile completion percentage (100% required)
        const completionPercentage = studentProfile.profileStats?.profileCompletion || 0;
        const profileComplete = completionPercentage === 100;
        const isVerified = studentProfile.verificationStatus === 'approved';

        if (!profileComplete || !isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Aapka profile 100% complete aur admin-verified hona zaroori hai.',
                requiresCompletion: true,
                data: {
                    currentCompletion: completionPercentage,
                    verificationStatus: studentProfile.verificationStatus,
                    profileComplete,
                    isVerified,
                },
            });
        }

        // Profile is complete and verified
        req.studentProfile = studentProfile;
        next();
    } catch (error) {
        console.error('Profile complete check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Profile check karte samay error aaya.',
            requiresCompletion: true,
            data: null,
        });
    }
};

/**
 * Hinglish: Check karo ki student project details ko access kar sakta hai
 * Browse ke liye nahi, sirf details aur apply ke liye
 */
exports.checkCanViewDetails = async (req, res, next) => {
    try {
        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return res.status(403).json({
                success: false,
                message: 'Student profile nahi mila.',
                requiresCompletion: true,
                data: null,
            });
        }

        // Check profile completion - STRICT: 100% required
        const completionPercentage = studentProfile.profileStats?.profileCompletion || 0;
        const isComplete = completionPercentage === 100;
        const isVerified = studentProfile.verificationStatus === 'approved';

        if (!isComplete || !isVerified) {
            return res.status(403).json({
                success: false,
                message: 'Aapka profile 100% complete aur verified hona zaruri hai project details dekhne ke liye.',
                requiresCompletion: true,
                data: {
                    currentCompletion: completionPercentage,
                    verificationStatus: studentProfile.verificationStatus,
                },
            });
        }

        // Approved for viewing
        req.studentProfile = studentProfile;
        next();
    } catch (error) {
        console.error('View details permission check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Permission check karte samay error aaya.',
            requiresCompletion: true,
            data: null,
        });
    }
};
