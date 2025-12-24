// backend/controllers/studentProjectController.js
// Student projects ke liye controller - Phase 4.2

const Project = require('../models/Project');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/companyProfile');
const Application = require('../models/Application');
const Notification = require('../models/Notification');
const User = require('../models/User');
const { calculateSkillMatch, getRecommendedProjects } = require('../utils/students/projectHelpers');

// ============================================
// UTILITY FUNCTIONS
// ============================================

// Consistent response format
const sendResponse = (res, success, message, data = null, status = 200) => {
    return res.status(status).json({ success, message, data });
};

/**
 * Hinglish: Notification create karo
 */
const createNotification = async (userId, userRole, message, type, relatedProfileId = null) => {
    try {
        await Notification.create({
            userId,
            userRole,
            message,
            type,
            relatedProfileId,
            isRead: false,
        });
    } catch (error) {
        console.error('Error creating notification:', error);
    }
};

// ============================================
// BROWSE PROJECTS
// ============================================

// @desc    Browse all open projects (no profile check required)
// @route   GET /api/student/projects/browse
// @access  Private (Student)
exports.browseProjects = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 12; // 12 per page
        const search = req.query.search || '';
        const category = req.query.category || '';
        const skills = req.query.skills ? req.query.skills.split(',') : [];
        const budgetMin = req.query.budgetMin ? parseInt(req.query.budgetMin) : 0;
        const budgetMax = req.query.budgetMax ? parseInt(req.query.budgetMax) : Infinity;
        const sortBy = req.query.sortBy || 'newest'; // newest, deadline, budget-high, budget-low

        // Student profile dhundo - skill matching ke liye zaruri hai
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        // Filter banao - sirf open projects (not assigned)
        const filter = {
            status: 'open',
            isDeleted: false,
            assignedStudent: null, // PART 7: Don't show assigned projects
        };

        // Search filter
        if (search) {
            filter.$or = [
                { title: { $regex: search, $options: 'i' } },
                { description: { $regex: search, $options: 'i' } },
            ];
        }

        // Category filter
        if (category) {
            filter.category = category;
        }

        // Budget filter
        filter.budgetMin = { $lte: budgetMax };
        filter.budgetMax = { $gte: budgetMin };

        // Required skills filter - agar student ne skill select kiye hain
        if (skills.length > 0) {
            filter.requiredSkills = { $in: skills };
        }

        // Sorting
        let sortOptions = { createdAt: -1 }; // Default - newest first
        if (sortBy === 'deadline') {
            sortOptions = { deadline: 1 }; // Deadline soon
        } else if (sortBy === 'budget-high') {
            sortOptions = { budgetMax: -1 }; // Highest budget first
        } else if (sortBy === 'budget-low') {
            sortOptions = { budgetMin: 1 }; // Lowest budget first
        }

        // Count total documents
        const total = await Project.countDocuments(filter);

        // Fetch projects with pagination
        // Populate both company and companyId for backward compatibility
        const projects = await Project.find(filter)
            .populate('company', 'companyName city logo isVerified')
            .populate('companyId', 'companyName city logo isVerified')
            .sort(sortOptions)
            .limit(limit)
            .skip((page - 1) * limit)
            .lean();

        // Get Company model for manual lookup if needed
        const Company = require('../models/Company');

        // Ensure company data is available (use companyId if company is missing)
        const enrichedProjects = await Promise.all(projects.map(async (project) => {
            // Use companyId first, fallback to company for backward compatibility
            let companyData = project.companyId || project.company;

            // If company data is still not available, try manual lookup
            if (!companyData) {
                const companyId = project.company || project.companyId;
                if (companyId) {
                    try {
                        companyData = await Company.findById(companyId).lean();
                    } catch (err) {
                        console.error(`Error fetching company for project ${project._id}:`, err);
                    }
                }
            }

            const studentSkills = studentProfile
                ? [
                    ...(studentProfile.skills?.technical || []),
                    ...(studentProfile.skills?.soft || []),
                    ...(studentProfile.skills?.languages || []),
                  ].map((s) => s.toLowerCase())
                : [];
            const projectSkills = project.requiredSkills.map((s) => s.toLowerCase());
            const matchPercentage = calculateSkillMatch(studentSkills, projectSkills);

            return {
                _id: project._id,
                title: project.title,
                description: project.description,
                category: project.category,
                budgetMin: project.budgetMin,
                budgetMax: project.budgetMax,
                deadline: project.deadline,
                projectDuration: project.projectDuration,
                requiredSkills: project.requiredSkills,
                status: project.status,
                assignedStudent: project.assignedStudent,
                applicationsCount: project.applicationsCount || 0,
                company: companyData ? {
                    name: companyData.companyName,
                    city: companyData.city,
                    logo: companyData.logo,
                    isVerified: companyData.isVerified,
                } : null,
                skillMatch: matchPercentage,
            };
        }));

        return sendResponse(
            res,
            true,
            'Projects successfully fetch ho gaye!',
            {
                projects: enrichedProjects,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            },
            200
        );
    } catch (error) {
        console.error('Browse projects error:', error);
        return sendResponse(res, false, 'Projects fetch karte samay error aaya.', null, 500);
    }
};

// ============================================
// PROJECT DETAILS (REQUIRES PROFILE CHECK)
// ============================================

// @desc    Get project details (requires 100% profile + verified)
// @route   GET /api/student/projects/:id
// @access  Private (Student - 100% profile + verified)
exports.getProjectDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Check if student has already applied
        const hasApplied = await Application.findOne({
            studentId: req.user.id,
            projectId: id,
            status: { $ne: 'withdrawn' },
        });

        // Project dhundo
        // Populate both company and companyId for backward compatibility
        let project = await Project.findById(id)
            .populate('company', 'companyName city logo isVerified')
            .populate('companyId', 'companyName city logo isVerified')
            .lean();

        if (!project) {
            return sendResponse(res, false, 'Project nahi mila.', null, 404);
        }

        // Manual company lookup if populate failed
        const Company = require('../models/Company');
        let companyData = project.companyId || project.company;
        if (!companyData) {
            const companyId = project.company || project.companyId;
            if (companyId) {
                try {
                    companyData = await Company.findById(companyId).lean();
                } catch (err) {
                    console.error(`Error fetching company for project ${id}:`, err);
                }
            }
        }

        // Get student profile for skill comparison and identity
        const studentProfile = await StudentProfile.findOne({ user: req.user.id }).lean();
        
        // Extract skills from nested structure (technical, soft, languages)
        const studentSkills = studentProfile 
            ? [
                ...(studentProfile.skills?.technical || []),
                ...(studentProfile.skills?.soft || []),
                ...(studentProfile.skills?.languages || []),
              ].map((s) => s.toLowerCase())
            : [];
        
        const projectSkills = project.requiredSkills.map((s) => s.toLowerCase());
        const matchPercentage = calculateSkillMatch(studentSkills, projectSkills);

        // Matched skills indicator
        const matchedSkills = project.requiredSkills.filter(
            (skill) => studentSkills.includes(skill.toLowerCase())
        );

        // Per-student assignment status based on assignedStudent / selectedStudentId
        const assignedStudentId = project.assignedStudent || project.selectedStudentId || null;
        const isAssignedToYou =
            !!assignedStudentId &&
            !!studentProfile &&
            assignedStudentId.toString() === studentProfile._id.toString();
        const isAssignedToOther = !!assignedStudentId && !isAssignedToYou;

        return sendResponse(
            res,
            true,
            'Project details successfully fetch ho gaye!',
            {
                project: {
                    _id: project._id,
                    title: project.title,
                    description: project.description,
                    category: project.category,
                    budgetMin: project.budgetMin,
                    budgetMax: project.budgetMax,
                    deadline: project.deadline,
                    projectDuration: project.projectDuration,
                    requiredSkills: project.requiredSkills,
                    status: project.status,
                assignedStudent: project.assignedStudent,
                selectedStudentId: project.selectedStudentId || null,
                    applicationsCount: project.applicationsCount || 0,
                    company: companyData ? {
                        name: companyData.companyName,
                        city: companyData.city,
                        logo: companyData.logo,
                        isVerified: companyData.isVerified,
                    } : null,
                    skillMatch: matchPercentage,
                    matchedSkills,
                    hasApplied: !!hasApplied,
                applicationStatus: hasApplied?.status || null,
                // Per-student assignment flags for frontend logic
                isAssignedToYou,
                isAssignedToOther,
                },
            },
            200
        );
    } catch (error) {
        console.error('Get project details error:', error);
        return sendResponse(res, false, 'Project details fetch karte samay error aaya.', null, 500);
    }
};

// ============================================
// APPLY TO PROJECT
// ============================================

// @desc    Apply to a project
// @route   POST /api/student/projects/:id/apply
// @access  Private (Student - 100% profile + verified)
exports.applyToProject = async (req, res) => {
    try {
        const { id: projectId } = req.params;
        const { coverLetter, proposedPrice, estimatedTime } = req.body;

        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila.', null, 404);
        }

        // Project dhundo
        const project = await Project.findById(projectId);

        if (!project) {
            return sendResponse(res, false, 'Project nahi mila.', null, 404);
        }

        // Check if project is open and not assigned
        if (project.status !== 'open') {
            return sendResponse(res, false, 'Yeh project ab applications nahi le raha.', null, 400);
        }

        // PART 7: Check if project is already assigned
        if (project.assignedStudent) {
            return sendResponse(res, false, 'This project has already been assigned to a student.', null, 400);
        }

        // Check if already applied - PART 3: Prevent duplicate applications
        const alreadyApplied = await Application.findOne({
            studentId: studentProfile._id,
            projectId,
            status: { $ne: 'withdrawn' },
        });

        if (alreadyApplied) {
            return sendResponse(res, false, 'You have already applied for this project.', null, 400);
        }

        // Check if project is already assigned
        if (project.assignedStudent) {
            return sendResponse(res, false, 'This project has already been assigned to a student.', null, 400);
        }

        // PART 5: Create student snapshot at apply time
        const studentSnapshot = {
            name: studentProfile.basicInfo?.fullName || '',
            collegeName: studentProfile.basicInfo?.collegeName || '',
            city: studentProfile.basicInfo?.location || '',
            skills: [
                ...(studentProfile.skills?.technical || []),
                ...(studentProfile.skills?.soft || []),
                ...(studentProfile.skills?.languages || []),
            ],
            resumeUrl: studentProfile.documents?.resume?.url || studentProfile.documents?.resume?.path || '',
            collegeIdUrl: studentProfile.documents?.collegeId?.url || studentProfile.documents?.collegeId?.path || '',
            appliedAt: new Date(),
        };

        // Phase 4: Create studentData with hidden email/phone for security
        const studentData = {
            fullName: studentProfile.basicInfo?.fullName || '',
            college: studentProfile.basicInfo?.collegeName || '',
            city: studentProfile.basicInfo?.location || '',
            course: studentProfile.basicInfo?.degree || '',
            year: studentProfile.basicInfo?.currentYear || '',
            skills: [
                ...(studentProfile.skills?.technical || []),
                ...(studentProfile.skills?.soft || []),
                ...(studentProfile.skills?.languages || []),
            ],
            projects: studentProfile.projects || [],
            resume: studentProfile.documents?.resume?.url || studentProfile.documents?.resume?.path || '',
            certificates: (studentProfile.documents?.certificates || []).map(cert => cert.url || cert.path || ''),
            profilePicture: studentProfile.basicInfo?.profilePicture || '',
            cgpa: studentProfile.basicInfo?.cgpa || null,
            // Hidden fields - NOT sent to frontend
            _hiddenEmail: studentProfile.basicInfo?.email || '',
            _hiddenPhone: studentProfile.basicInfo?.phone || '',
        };

        // Create application
        const application = new Application({
            project: projectId,
            projectId,
            student: studentProfile._id,
            studentId: studentProfile._id,
            company: project.company,
            companyId: project.company,
            coverLetter: coverLetter.trim(),
            proposedPrice: parseFloat(proposedPrice),
            estimatedTime,
            studentSnapshot, // Keep for backward compatibility
            studentData, // Phase 4: Complete snapshot with hidden fields
        });

        // Save application
        await application.save();

        // Phase 4: Send notifications
        // Get student user for notification
        const studentUser = await User.findById(req.user.id);
        if (studentUser) {
            await createNotification(
                studentUser._id,
                'student',
                `Your application for "${project.title}" has been submitted successfully!`,
                'application_submitted',
                application._id
            );
        }

        // Get company user for notification
        const companyProfile = await CompanyProfile.findById(project.company);
        if (companyProfile) {
            const companyUser = await User.findById(companyProfile.user);
            if (companyUser) {
                await createNotification(
                    companyUser._id,
                    'company',
                    `New application received for project "${project.title}" from ${studentProfile.basicInfo?.fullName || 'a student'}`,
                    'application_received',
                    application._id
                );
            }
        }

        // Update project applications count aur shortlist mein add karo
        project.applicationsCount = (project.applicationsCount || 0) + 1;
        project.shortlistedStudents.push({
            studentId: studentProfile._id,
            studentName: studentProfile.basicInfo?.fullName || 'Unknown',
            email: studentProfile.basicInfo?.email || '',
            skills: studentProfile.skills || [],
            shortlistedAt: new Date(),
        });
        await project.save();

        // Update student profile
        studentProfile.appliedProjectsCount = (studentProfile.appliedProjectsCount || 0) + 1;
        studentProfile.activeProjectsCount = (studentProfile.activeProjectsCount || 0) + 1;
        await studentProfile.save();

        return sendResponse(res, true, 'Application successfully submit ho gaya!', { application }, 201);
    } catch (error) {
        console.error('Apply to project error:', error);

        // Mongoose validation error
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((val) => val.message);
            return sendResponse(res, false, `Validation error: ${messages.join(', ')}`, null, 400);
        }

        return sendResponse(res, false, 'Application submit karte samay error aaya.', null, 500);
    }
};

// ============================================
// MY APPLICATIONS
// ============================================

// @desc    Get all applications of a student
// @route   GET /api/student/applications/my-applications
// @access  Private (Student)
exports.getMyApplications = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const status = req.query.status || 'all';

        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila.', null, 404);
        }

        // Filter banao
        const filter = {
            studentId: studentProfile._id,
        };

        // Status filter
        if (status !== 'all' && status !== 'withdrawn') {
            filter.status = status;
        } else if (status !== 'all') {
            filter.status = status;
        }

        // Count total
        const total = await Application.countDocuments(filter);

        // Fetch applications
        const applications = await Application.find(filter)
            .populate('project', 'title category budgetMin budgetMax deadline')
            .populate('company', 'companyName logoUrl')
            .sort({ appliedAt: -1 })
            .limit(limit)
            .skip((page - 1) * limit)
            .lean();

        return sendResponse(
            res,
            true,
            'Applications successfully fetch ho gaye!',
            {
                applications,
                pagination: {
                    total,
                    page,
                    limit,
                    pages: Math.ceil(total / limit),
                },
            },
            200
        );
    } catch (error) {
        console.error('Get applications error:', error);
        return sendResponse(res, false, 'Applications fetch karte samay error aaya.', null, 500);
    }
};

// ============================================
// APPLICATION STATISTICS
// ============================================

// @desc    Get application statistics
// @route   GET /api/student/applications/stats
// @access  Private (Student)
exports.getApplicationStats = async (req, res) => {
    try {
        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila.', null, 404);
        }

        // Get stats using model method
        const stats = await Application.getStudentStats(studentProfile._id);

        return sendResponse(
            res,
            true,
            'Statistics successfully fetch ho gaye!',
            stats,
            200
        );
    } catch (error) {
        console.error('Get stats error:', error);
        return sendResponse(res, false, 'Statistics fetch karte samay error aaya.', null, 500);
    }
};

// ============================================
// APPLICATION DETAILS
// ============================================

// @desc    Get single application details
// @route   GET /api/student/applications/:id
// @access  Private (Student)
exports.getApplicationDetails = async (req, res) => {
    try {
        const { id } = req.params;

        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila.', null, 404);
        }

        // Application dhundo
        const application = await Application.findById(id)
            .populate('project')
            .populate('company')
            .lean();

        if (!application) {
            return sendResponse(res, false, 'Application nahi mila.', null, 404);
        }

        // Verify ownership
        if (application.studentId.toString() !== studentProfile._id.toString()) {
            return sendResponse(res, false, 'Aapko is application ko access karne ki permission nahi hai.', null, 403);
        }

        return sendResponse(
            res,
            true,
            'Application details successfully fetch ho gaye!',
            { application },
            200
        );
    } catch (error) {
        console.error('Get application details error:', error);
        return sendResponse(res, false, 'Application details fetch karte samay error aaya.', null, 500);
    }
};

// ============================================
// WITHDRAW APPLICATION
// ============================================

// @desc    Withdraw an application
// @route   PUT /api/student/applications/:id/withdraw
// @access  Private (Student)
exports.withdrawApplication = async (req, res) => {
    try {
        const { id } = req.params;

        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila.', null, 404);
        }

        // Application dhundo
        const application = await Application.findById(id);

        if (!application) {
            return sendResponse(res, false, 'Application nahi mila.', null, 404);
        }

        // Verify ownership
        if (application.studentId.toString() !== studentProfile._id.toString()) {
            return sendResponse(res, false, 'Aapko is application ko access karne ki permission nahi hai.', null, 403);
        }

        // Check if already pending
        if (application.status !== 'pending') {
            return sendResponse(res, false, 'Sirf pending applications ko withdraw kar sakte ho.', null, 400);
        }

        // Update application
        application.status = 'withdrawn';
        application.withdrawnAt = new Date();
        await application.save();

        // Update project
        const project = await Project.findById(application.projectId);
        if (project) {
            project.applicationsCount = Math.max(0, (project.applicationsCount || 1) - 1);
            project.shortlistedStudents = project.shortlistedStudents.filter(
                (s) => s.studentId.toString() !== studentProfile._id.toString()
            );
            await project.save();
        }

        // Update student profile
        studentProfile.activeProjectsCount = Math.max(0, (studentProfile.activeProjectsCount || 1) - 1);
        await studentProfile.save();

        return sendResponse(res, true, 'Application successfully withdraw ho gaya!', { application }, 200);
    } catch (error) {
        console.error('Withdraw application error:', error);
        return sendResponse(res, false, 'Application withdraw karte samay error aaya.', null, 500);
    }
};

// ============================================
// RECOMMENDED PROJECTS
// ============================================

// @desc    Get recommended projects based on student skills
// @route   GET /api/student/projects/recommended
// @access  Private (Student)
exports.getRecommendedProjects = async (req, res) => {
    try {
        // Student profile dhundo
        const studentProfile = await StudentProfile.findOne({ user: req.user.id });

        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila.', null, 404);
        }

        // Open projects fetch karo
        const projects = await Project.find({
            status: 'open',
            isDeleted: false,
        }).populate('company', 'companyName logoUrl');

        // Skill match calculate karo har project ke liye
        const scored = projects
            .map((project) => {
                const studentSkills = studentProfile.skills?.map((s) => s.toLowerCase()) || [];
                const projectSkills = project.requiredSkills.map((s) => s.toLowerCase());
                const matchPercentage = calculateSkillMatch(studentSkills, projectSkills);

                return {
                    ...project.toObject(),
                    skillMatch: matchPercentage,
                };
            })
            .sort((a, b) => b.skillMatch - a.skillMatch)
            .slice(0, 6); // Top 6 projects

        return sendResponse(
            res,
            true,
            'Recommended projects successfully fetch ho gaye!',
            { projects: scored },
            200
        );
    } catch (error) {
        console.error('Get recommended projects error:', error);
        return sendResponse(res, false, 'Recommended projects fetch karte samay error aaya.', null, 500);
    }
};
