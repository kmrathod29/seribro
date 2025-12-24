// backend/utils/workspace/validateWorkspaceAccess.js
// Reusable access validator for project workspaces

const Company = require('../../models/Company');
const CompanyProfile = require('../../models/companyProfile');
const StudentProfile = require('../../models/StudentProfile');

/**
 * Check if user has access to project workspace
 * @param {Object} project - Project document (may be populated)
 * @param {Object} user - Authenticated user from req.user
 * @returns {Promise<{ hasAccess: boolean, role: 'student'|'company'|null, error?: string, studentProfile?: object, companyProfile?: object }>}
 */
const validateWorkspaceAccess = async (project, user) => {
    if (!project || !user) {
        return { hasAccess: false, role: null, error: 'Project or user missing' };
    }

    // Only allow when project is in a workspace-ready status
    const allowedStatuses = ['assigned', 'in-progress', 'submitted', 'under-review', 'revision-requested', 'approved', 'completed', 'disputed'];
    if (!allowedStatuses.includes(project.status)) {
        return { hasAccess: false, role: null, error: 'Workspace not available for this project status' };
    }

    // Helper to get an ID string regardless of whether the field is populated
    const extractId = (val) => {
        if (!val) return null;
        if (typeof val === 'string') return val;
        if (val._id) return val._id.toString();
        if (val.toString) return val.toString();
        return null;
    };

    if (user.role === 'company') {
        // Try CompanyProfile and Company record for compatibility
        const companyProfile = await CompanyProfile.findOne({ user: user._id });
        const companyRecord = await Company.findOne({ user: user._id });

        const projectCompanyId = extractId(project.companyId) || extractId(project.company);

        if (companyProfile && projectCompanyId && projectCompanyId === companyProfile._id.toString()) {
            return { hasAccess: true, role: 'company', companyProfile };
        }

        if (companyRecord && projectCompanyId && projectCompanyId === companyRecord._id.toString()) {
            // Return companyProfile if available for display purposes
            return { hasAccess: true, role: 'company', companyProfile: companyProfile || null };
        }

        return { hasAccess: false, role: null, error: 'Access denied: not the project owner' };
    }

    if (user.role === 'student') {
        const studentProfile = await StudentProfile.findOne({ user: user._id });
        const assignedId = extractId(project.assignedStudent) || extractId(project.selectedStudentId);
        if (studentProfile && assignedId && assignedId === studentProfile._id.toString()) {
            return { hasAccess: true, role: 'student', studentProfile };
        }
        return { hasAccess: false, role: null, error: 'Access denied: not the assigned student' };
    }

    return { hasAccess: false, role: null, error: 'Unsupported role for workspace' };
};

module.exports = { validateWorkspaceAccess };

