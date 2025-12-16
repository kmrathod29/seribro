// backend/controllers/companyProjectController.js
// Company Projects ke liye controller - Phase 4.1

const Project = require('../models/Project');
const CompanyProfile = require('../models/companyProfile');
const StudentProfile = require('../models/StudentProfile');
const { calculateCompanyProfileCompletion } = require('../utils/company/calculateCompanyProfileCompletion');

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Consistent response format
const sendResponse = (res, success, message, data = null, status = 200) => {
    return res.status(status).json({ success, message, data });
};

// ============================================
// PROJECT CREATION
// ============================================

// @desc    Create a new project
// @route   POST /api/company/projects/create
// @access  Private (Company - profile 100% complete)
exports.createProject = async (req, res) => {
    try {
        const { title, description, category, requiredSkills, budgetMin, budgetMax, projectDuration, deadline } = req.body;

        // Company ka profile check karo - 100% complete hona chahiye
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });

        // Hinglish: Duplicate project check - same company ne same title ka active project post nahi kar sakta
        if (companyProfile) {
            const duplicateProject = await Project.findOne({
                companyId: companyProfile._id,
                title: { $regex: new RegExp('^' + title.trim() + '$', 'i') }, // Case-insensitive exact match
                status: { $in: ['open', 'assigned', 'in-progress'] }
            });

            if (duplicateProject) {
                return sendResponse(
                    res,
                    false,
                    'You already have an active project with this title. Please use a different title or close the existing project first.',
                    {
                        duplicateProject: {
                            id: duplicateProject._id,
                            title: duplicateProject.title,
                            status: duplicateProject.status,
                            postedAt: duplicateProject.createdAt
                        }
                    },
                    400
                );
            }
        }

        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila. Pehle profile complete karo.', null, 404);
        }

        const { percentage, missingFields } = calculateCompanyProfileCompletion(companyProfile);
        if (percentage < 100) {
            const fieldNames = {
                companyName: 'Company Name',
                mobile: 'Mobile Number (10 digits)',
                industryType: 'Industry Type',
                logoUrl: 'Company Logo',
                documents: 'Documents/Certificates',
                authorizedPerson: 'Authorized Person Details (Name, Designation, Email)'
            };
            const missingFieldLabels = missingFields.map(f => fieldNames[f] || f).join(', ');
            return sendResponse(
                res,
                false,
                `Profile ${percentage}% complete hai. Complete karne ke liye ye fields required hain: ${missingFieldLabels}`,
                null,
                400
            );
        }

        // Naya project create karo
        const newProject = new Project({
            company: companyProfile._id,
            companyId: companyProfile._id,
            title: title.trim(),
            description: description.trim(),
            category,
            requiredSkills: Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills],
            budgetMin: parseFloat(budgetMin),
            budgetMax: parseFloat(budgetMax),
            projectDuration,
            deadline: new Date(deadline),
            createdBy: req.user.id,
        });

        // Validations - explicit check
        if (newProject.budgetMin > newProject.budgetMax) {
            return sendResponse(
                res,
                false,
                'Minimum budget, maximum budget se zyada nahi ho sakta.',
                null,
                400
            );
        }

        if (new Date(deadline) <= new Date()) {
            return sendResponse(
                res,
                false,
                'Deadline future ki date honi chahiye.',
                null,
                400
            );
        }

        // Save karo
        await newProject.save();

        // Company ke project count update karo
        if (!companyProfile.postedProjectsCount) companyProfile.postedProjectsCount = 0;
        if (!companyProfile.activeProjectsCount) companyProfile.activeProjectsCount = 0;

        companyProfile.postedProjectsCount += 1;
        companyProfile.activeProjectsCount += 1;
        await companyProfile.save();

        return sendResponse(res, true, 'Project successfully create ho gaya!', { project: newProject }, 201);
    } catch (error) {
        console.error('Create project error:', error);

        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return sendResponse(res, false, `Validation error: ${messages.join(', ')}`, null, 400);
        }

        return sendResponse(res, false, 'Project create karte samay error aaya.', null, 500);
    }
};

// ============================================
// PROJECT RETRIEVAL
// ============================================

// @desc    Get all projects of a company
// @route   GET /api/company/projects/my-projects
// @access  Private (Company)
exports.getCompanyProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || 'all';
        const search = req.query.search || '';

        // Company profile dhundo
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila.', null, 404);
        }

        // Filter banao
        const filter = {
            companyId: companyProfile._id,
            isDeleted: false,
        };

        // Status filter
        if (status !== 'all') {
            filter.status = status;
        }

        // Search filter
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
                { category: { $regex: search, $options: 'i' } },
            ];
        }

        // Total count aur pagination
        const total = await Project.countDocuments(filter);
        const pages = Math.ceil(total / limit);
        const skip = (page - 1) * limit;

        // Projects fetch karo
        const projects = await Project.find(filter)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('selectedStudentId', 'basicInfo');

        return sendResponse(
            res,
            true,
            `${projects.length} projects found.`,
            {
                projects,
                pagination: { page, limit, total, pages },
            },
            200
        );
    } catch (error) {
        console.error('Get projects error:', error);
        return sendResponse(res, false, 'Projects fetch karte samay error aaya.', null, 500);
    }
};

// @desc    Get single project details
// @route   GET /api/company/projects/:id
// @access  Private (Company)
exports.getProjectDetails = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id)
            .populate('company', 'companyName')
            .populate('selectedStudentId', 'basicInfo')
            .populate('shortlistedStudents.studentId', 'basicInfo');

        if (!project || project.isDeleted) {
            return sendResponse(res, false, 'Project nahi mila.', null, 404);
        }

        return sendResponse(res, true, 'Project details successfully fetch ho gaye.', { project }, 200);
    } catch (error) {
        console.error('Get project details error:', error);
        return sendResponse(res, false, 'Project details fetch karte samay error aaya.', null, 500);
    }
};

// ============================================
// PROJECT UPDATES
// ============================================

// @desc    Update a project
// @route   PUT /api/company/projects/:id
// @access  Private (Company - only if status is 'open')
exports.updateProject = async (req, res) => {
    try {
        const { id } = req.params;
        const { title, description, category, requiredSkills, budgetMin, budgetMax, projectDuration, deadline } = req.body;

        // Project dhundo
        const project = await Project.findById(id);
        if (!project || project.isDeleted) {
            return sendResponse(res, false, 'Project nahi mila.', null, 404);
        }

        // Sirf 'open' status wale projects edit ho sakte hain
        if (project.status !== 'open') {
            return sendResponse(
                res,
                false,
                `Project ${project.status} status mein hai. Sirf 'open' projects edit ho sakte hain.`,
                null,
                400
            );
        }

        // Update karo
        if (title) project.title = title.trim();
        if (description) project.description = description.trim();
        if (category) project.category = category;
        if (requiredSkills) project.requiredSkills = Array.isArray(requiredSkills) ? requiredSkills : [requiredSkills];
        if (budgetMin !== undefined) project.budgetMin = parseFloat(budgetMin);
        if (budgetMax !== undefined) project.budgetMax = parseFloat(budgetMax);
        if (projectDuration) project.projectDuration = projectDuration;
        if (deadline) project.deadline = new Date(deadline);

        // Budget validation
        if (project.budgetMin > project.budgetMax) {
            return sendResponse(
                res,
                false,
                'Minimum budget, maximum budget se zyada nahi ho sakta.',
                null,
                400
            );
        }

        // Deadline validation
        if (new Date(project.deadline) <= new Date()) {
            return sendResponse(
                res,
                false,
                'Deadline future ki date honi chahiye.',
                null,
                400
            );
        }

        await project.save();

        return sendResponse(res, true, 'Project successfully update ho gaya!', { project }, 200);
    } catch (error) {
        console.error('Update project error:', error);

        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return sendResponse(res, false, `Validation error: ${messages.join(', ')}`, null, 400);
        }

        return sendResponse(res, false, 'Project update karte samay error aaya.', null, 500);
    }
};

// @desc    Delete a project (soft delete)
// @route   DELETE /api/company/projects/:id
// @access  Private (Company - only if no applications)
exports.deleteProject = async (req, res) => {
    try {
        const { id } = req.params;

        const project = await Project.findById(id);
        if (!project || project.isDeleted) {
            return sendResponse(res, false, 'Project nahi mila.', null, 404);
        }

        // Agar applications hain to delete nahi kar sakte
        if (project.applicationsCount > 0) {
            return sendResponse(
                res,
                false,
                `${project.applicationsCount} applications iss project par hain. Sabhi applications reject karne ke baad delete kar sakte ho.`,
                null,
                400
            );
        }

        // Soft delete - isDeleted flag set karo
        project.isDeleted = true;
        await project.save();

        // Company ke activeProjectsCount decrease karo
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (companyProfile && companyProfile.activeProjectsCount > 0) {
            companyProfile.activeProjectsCount -= 1;
            await companyProfile.save();
        }

        return sendResponse(res, true, 'Project successfully delete ho gaya!', null, 200);
    } catch (error) {
        console.error('Delete project error:', error);
        return sendResponse(res, false, 'Project delete karte samay error aaya.', null, 500);
    }
};

// ============================================
// APPLICATIONS MANAGEMENT
// ============================================

// @desc    Get all applications for a project
// @route   GET /api/company/projects/:id/applications
// @access  Private (Company)
exports.getProjectApplications = async (req, res) => {
    try {
        const { id } = req.params;

        // Project dhundo - applications ke saath
        const project = await Project.findById(id).populate('shortlistedStudents.studentId', 'basicInfo email');

        if (!project || project.isDeleted) {
            return sendResponse(res, false, 'Project nahi mila.', null, 404);
        }

        return sendResponse(
            res,
            true,
            `${project.shortlistedStudents.length} applications found.`,
            {
                project,
                applicationsCount: project.applicationsCount,
                shortlistedStudents: project.shortlistedStudents,
                selectedStudent: project.selectedStudentId,
            },
            200
        );
    } catch (error) {
        console.error('Get applications error:', error);
        return sendResponse(res, false, 'Applications fetch karte samay error aaya.', null, 500);
    }
};

// @desc    Shortlist a student for a project
// @route   POST /api/company/projects/:id/shortlist/:studentId
// @access  Private (Company)
exports.shortlistStudent = async (req, res) => {
    try {
        const { id, studentId } = req.params;

        // Project dhundo
        const project = await Project.findById(id);
        if (!project || project.isDeleted) {
            return sendResponse(res, false, 'Project nahi mila.', null, 404);
        }

        // Student profile dhundo
        const studentProfile = await StudentProfile.findById(studentId).populate('user', 'email');
        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila.', null, 404);
        }

        // Check karo agar pehle se shortlist hai
        const alreadyShortlisted = project.shortlistedStudents.some(
            (s) => s.studentId.toString() === studentId
        );

        if (alreadyShortlisted) {
            return sendResponse(res, false, 'Yeh student pehle se shortlist hai.', null, 400);
        }

        // Student ko shortlist karo
        project.shortlistedStudents.push({
            studentId,
            studentName: studentProfile.basicInfo?.fullName || 'Unknown',
            email: studentProfile.user.email,
            skills: studentProfile.skillsInfo?.technicalSkills || [],
        });

        await project.save();

        return sendResponse(res, true, 'Student successfully shortlist ho gaya!', { project }, 200);
    } catch (error) {
        console.error('Shortlist student error:', error);
        return sendResponse(res, false, 'Student shortlist karte samay error aaya.', null, 500);
    }
};

// @desc    Assign a project to a student
// @route   POST /api/company/projects/:id/assign/:studentId
// @access  Private (Company)
exports.assignProject = async (req, res) => {
    try {
        const { id, studentId } = req.params;

        // Project dhundo
        const project = await Project.findById(id);
        if (!project || project.isDeleted) {
            return sendResponse(res, false, 'Project nahi mila.', null, 404);
        }

        // Agar pehle se assigned hai to warning deo
        if (project.status === 'assigned' || project.status === 'in-progress') {
            return sendResponse(
                res,
                false,
                'Yeh project pehle se assign hai. Naya assign karne se pehle pichle student ke saath clear karo.',
                null,
                400
            );
        }

        // Student profile dhundo
        const studentProfile = await StudentProfile.findById(studentId);
        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila.', null, 404);
        }

        // Assign karo
        project.selectedStudentId = studentId;
        project.status = 'assigned';

        // Shortlist se remove karo (sirf assigned student rhe)
        project.shortlistedStudents = project.shortlistedStudents.filter(
            (s) => s.studentId.toString() === studentId
        );

        await project.save();

        return sendResponse(
            res,
            true,
            'Project successfully student ko assign ho gaya!',
            { project },
            200
        );
    } catch (error) {
        console.error('Assign project error:', error);
        return sendResponse(res, false, 'Project assign karte samay error aaya.', null, 500);
    }
};

// @desc    Get project stats
// @route   GET /api/company/projects/stats/summary
// @access  Private (Company)
exports.getProjectStats = async (req, res) => {
    try {
        const companyProfile = await CompanyProfile.findOne({ user: req.user.id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila.', null, 404);
        }

        // Stats calculate karo
        const stats = await Project.aggregate([
            { $match: { companyId: companyProfile._id, isDeleted: false } },
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 },
                },
            },
        ]);

        const formattedStats = {
            total: 0,
            open: 0,
            assigned: 0,
            'in-progress': 0,
            completed: 0,
            cancelled: 0,
        };

        stats.forEach((stat) => {
            if (formattedStats.hasOwnProperty(stat._id)) {
                formattedStats[stat._id] = stat.count;
                formattedStats.total += stat.count;
            }
        });

        return sendResponse(res, true, 'Project stats successfully fetch ho gaye.', { stats: formattedStats }, 200);
    } catch (error) {
        console.error('Get stats error:', error);
        return sendResponse(res, false, 'Stats fetch karte samay error aaya.', null, 500);
    }
};
