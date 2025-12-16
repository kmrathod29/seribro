// backend/middleware/student/applicationValidation.js
// Student applications ke liye validation middleware - Phase 4.2

/**
 * Hinglish: Application data ko validate karna
 */
exports.validateApplicationData = async (req, res, next) => {
    try {
        const { coverLetter, proposedPrice, estimatedTime } = req.body;

        // Check if all required fields are present
        if (!coverLetter || !proposedPrice || !estimatedTime) {
            return res.status(400).json({
                success: false,
                message: 'Cover letter, proposed price, aur estimated time sab zaruri hain.',
                data: null,
            });
        }

        // Cover letter validation - 50-1000 characters
        if (coverLetter.trim().length < 50) {
            return res.status(400).json({
                success: false,
                message: 'Cover letter kam se kam 50 characters ka hona chahiye.',
                data: null,
            });
        }

        if (coverLetter.trim().length > 1000) {
            return res.status(400).json({
                success: false,
                message: 'Cover letter 1000 characters se zyada nahi ho sakta.',
                data: null,
            });
        }

        // Proposed price validation - must be positive number
        const price = parseFloat(proposedPrice);
        if (isNaN(price) || price <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Proposed price positive number hona chahiye.',
                data: null,
            });
        }

        // Estimated time validation - enum check
        const validTimes = ['1 week', '2 weeks', '3-4 weeks', '1-2 months', '2-3 months'];
        if (!validTimes.includes(estimatedTime)) {
            return res.status(400).json({
                success: false,
                message: `Estimated time ye values mein se ek honi chahiye: ${validTimes.join(', ')}`,
                data: null,
            });
        }

        // Validation successful
        next();
    } catch (error) {
        console.error('Application validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Validation karte samay error aaya.',
            data: null,
        });
    }
};

/**
 * Hinglish: Check karo ki student pehle se apply kar chuka hai ya nahi
 */
exports.checkDuplicateApplication = async (req, res, next) => {
    try {
        const StudentProfile = require('../../models/StudentProfile');
        const Application = require('../../models/Application');

        const { id: projectId } = req.params;

        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return res.status(404).json({
                success: false,
                message: 'Student profile nahi mila.',
                data: null,
            });
        }

        // Check if already applied
        const existingApplication = await Application.findOne({
            studentId: studentProfile._id,
            projectId,
            status: { $ne: 'withdrawn' },
        });

        if (existingApplication) {
            return res.status(400).json({
                success: false,
                message: 'Aap pehle se is project mein apply kar chuke ho.',
                data: null,
            });
        }

        // Check passed
        next();
    } catch (error) {
        console.error('Duplicate check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Duplicate check karte samay error aaya.',
            data: null,
        });
    }
};

/**
 * Hinglish: Check karo ki project available hai aur open hai
 */
exports.checkProjectAvailable = async (req, res, next) => {
    try {
        const Project = require('../../models/Project');

        const { id: projectId } = req.params;

        // Project dhundo
        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project nahi mila.',
                data: null,
            });
        }

        // Check if deleted
        if (project.isDeleted) {
            return res.status(410).json({
                success: false,
                message: 'Yeh project delete ho gaya hai.',
                data: null,
            });
        }

        // Check if open
        if (project.status !== 'open') {
            return res.status(400).json({
                success: false,
                message: 'Yeh project ab applications nahi le raha.',
                data: null,
            });
        }

        // Project available
        next();
    } catch (error) {
        console.error('Project availability check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Project check karte samay error aaya.',
            data: null,
        });
    }
};
