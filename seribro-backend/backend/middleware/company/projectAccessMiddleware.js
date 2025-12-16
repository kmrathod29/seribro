// backend/middleware/company/projectAccessMiddleware.js
// Project access control aur status checking - Phase 4.1

const Project = require('../../models/Project');
const CompanyProfile = require('../../models/companyProfile');

// @desc    Check karo ki project company ke paas hai
// @middleware
const ensureProjectOwner = async (req, res, next) => {
    try {
        const { id: projectId } = req.params;

        // Company profile fetch karo
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });

        if (!companyProfile) {
            return res.status(403).json({
                success: false,
                message: 'Company profile nahi mila. Unauthorized access.',
            });
        }

        // Project fetch karo aur check karo ki yeh company ka hi hai
        const project = await Project.findById(projectId);

        if (!project || project.isDeleted) {
            return res.status(404).json({
                success: false,
                message: 'Project nahi mila.',
            });
        }

        // Check karo ki project company ke paas hai
        if (project.companyId.toString() !== companyProfile._id.toString()) {
            return res.status(403).json({
                success: false,
                message: 'Aap is project ko access nahi kar sakte. Yeh project aapka nahi hai.',
            });
        }

        // Project ko request mein attach karo taaki controller mein use kar sake
        req.project = project;

        next();
    } catch (error) {
        console.error('Project owner check error:', error);
        return res.status(500).json({
            success: false,
            message: 'Project access check karte samay error aaya.',
        });
    }
};

// @desc    Check karo project ki status
// @middleware
const checkProjectStatus = (allowedStatuses = ['open']) => {
    return async (req, res, next) => {
        try {
            const project = req.project; // ensureProjectOwner se aata hai

            if (!allowedStatuses.includes(project.status)) {
                return res.status(400).json({
                    success: false,
                    message: `Yeh operation project ke ${project.status} status mein nahi ho sakta. Allowed statuses: ${allowedStatuses.join(', ')}`,
                });
            }

            next();
        } catch (error) {
            console.error('Project status check error:', error);
            return res.status(500).json({
                success: false,
                message: 'Project status check karte samay error aaya.',
            });
        }
    };
};

module.exports = { ensureProjectOwner, checkProjectStatus };
