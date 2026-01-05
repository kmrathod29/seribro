// backend/middleware/company/applicationAccessMiddleware.js
// Application access control middleware - Phase 4.3

const Application = require('../../models/Application');
const Project = require('../../models/Project');
const CompanyProfile = require('../../models/companyProfile');

/**
 * Hinglish: Simple HTML stripper - XSS protection ke liye
 */
const stripHtml = (html) => {
    return html.replace(/<[^>]*>/g, '').trim();
};

/**
 * Hinglish: Check karo ki application company ki hai ya nahi
 * @desc Ensure application belongs to company's project
 * @access Private (Company)
 */
exports.ensureApplicationOwnership = async (req, res, next) => {
    try {
        const { applicationId } = req.params;

        // Validate applicationId format - check for undefined, null, empty string, or string 'undefined'
        if (!applicationId || 
            applicationId === 'undefined' || 
            applicationId === 'null' || 
            applicationId.trim() === '') {
            console.error('Application ID validation failed:', { 
                applicationId, 
                type: typeof applicationId,
                params: req.params,
                url: req.url 
            });
            return res.status(400).json({
                success: false,
                message: 'Application ID zaroori hai. Please provide a valid application ID.',
            });
        }

        // Application fetch karo
        const application = await Application.findById(applicationId);

        if (!application) {
            return res.status(404).json({
                success: false,
                message: 'Application nahi mila',
            });
        }

        // Project fetch karo
        const project = await Project.findById(application.projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project nahi mila',
            });
        }

        // Get company profile for ownership check
        // project.companyId references CompanyProfile, not User
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return res.status(404).json({
                success: false,
                message: 'Company profile nahi mila',
            });
        }

        // Check karo ki project company ki hai
        // Compare project.companyId (CompanyProfile ID) with companyProfile._id
        if (project.companyId.toString() !== companyProfile._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Yeh application aapke project se nahi hai. Access denied!',
            });
        }

        // Application ko request mein store karo
        req.application = application;
        req.project = project;

        next();
    } catch (error) {
        console.error('Application ownership error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while checking application ownership',
            error: error.message,
        });
    }
};

/**
 * Hinglish: Rejection reason validate karo
 * @desc Validate rejection reason field
 * @access Private (Company)
 */
exports.validateRejectionReason = (req, res, next) => {
    try {
        const { rejectionReason } = req.body;

        // Check karo ki reason present hai
        if (!rejectionReason) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason zaroori hai',
            });
        }

        // Check karo ki length 10-500 characters hai
        if (rejectionReason.length < 10 || rejectionReason.length > 500) {
            return res.status(400).json({
                success: false,
                message: 'Rejection reason kam se kam 10 characters aur zyada se zyada 500 characters ka hona chahiye',
            });
        }

        // Sanitize karo - XSS se bachne ke liye
        const sanitizedReason = stripHtml(rejectionReason).trim();

        // Sanitized reason ko request mein store karo
        req.body.rejectionReason = sanitizedReason;

        next();
    } catch (error) {
        console.error('Rejection reason validation error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while validating rejection reason',
            error: error.message,
        });
    }
};

/**
 * Hinglish: Ensure project belongs to company
 * @desc Validate project ownership before operations
 * @access Private (Company)
 */
exports.ensureProjectOwner = async (req, res, next) => {
    try {
        const { projectId } = req.params;

        const project = await Project.findById(projectId);

        if (!project) {
            return res.status(404).json({
                success: false,
                message: 'Project nahi mila',
            });
        }

        // Get company profile for ownership check
        // project.companyId references CompanyProfile, not User
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return res.status(404).json({
                success: false,
                message: 'Company profile nahi mila',
            });
        }

        // Check ownership
        // Compare project.companyId (CompanyProfile ID) with companyProfile._id
        if (project.companyId.toString() !== companyProfile._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Yeh project aapka nahi hai. Access denied!',
            });
        }

        req.project = project;
        next();
    } catch (error) {
        console.error('Project ownership check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while checking project ownership',
            error: error.message,
        });
    }
};

/**
 * Hinglish: Check karo application pending status mein hai
 * @desc Validate application is in pending status for transitions
 * @access Private
 */
exports.ensurePendingStatus = (req, res, next) => {
    try {
        if (req.application.status !== 'pending') {
            return res.status(400).json({
                success: false,
                message: `Yeh operation sirf pending applications pe ho sakta hai. Current status: ${req.application.status}`,
            });
        }

        next();
    } catch (error) {
        console.error('Status check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Server error while checking application status',
            error: error.message,
        });
    }
};
