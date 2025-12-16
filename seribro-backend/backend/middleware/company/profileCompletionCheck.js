// profileCompletionCheck.js
// Company profile ki completion check karne ka middleware (Phase-3 ke liye)

const CompanyProfile = require('../../models/companyProfile'); // Model ko require karna
const { calculateCompanyProfileCompletion } = require('../../utils/company/calculateCompanyProfileCompletion'); // Utility function

/**
 * Company profile ki completion check karta hai.
 * Agar profile incomplete hai, to aage ki action ko rokta hai.
 * @param {Object} req - Request object.
 * @param {Object} res - Response object.
 * @param {Function} next - Next middleware function.
 */
const profileCompletionCheck = async (req, res, next) => {
    // Ye middleware Phase-3 ke liye hai, abhi sirf check karke aage badh jayenge
    // Lekin future mein yahan logic add hoga jo incomplete profile par action ko rokega.

    try {
        // User ID protect middleware se aayega
        const userId = req.user.id;

        // Company profile find karna
        const profile = await CompanyProfile.findOne({ user: userId });

        // Agar profile nahi mila to error
        if (!profile) {
            return res.status(404).json({
                success: false,
                message: 'Company profile nahi mila. Kripya pehle profile banayein.', // Company profile not found
            });
        }

        // Completion status calculate karna
        const { profileComplete } = calculateCompanyProfileCompletion(profile);

        // Profile complete hai ya nahi, req object mein store kar sakte hain
        req.profileComplete = profileComplete;

        // Agar profile incomplete hai to future mein yahan action rok sakte hain
        // if (!profileComplete) {
        //     return res.status(403).json({
        //         success: false,
        //         message: 'Aapka profile abhi incomplete hai. Kripya pehle profile pura karein.',
        //     });
        // }

        // Sab theek hai to aage badhna
        next();
    } catch (error) {
        console.error('Profile completion check mein error:', error); // Error log karna
        return res.status(500).json({
            success: false,
            message: 'Server mein kuch gadbad ho gayi. Kripya dobara prayas karein.', // Server error
        });
    }
};

module.exports = { profileCompletionCheck };