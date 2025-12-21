// backend/controllers/StudentProfileController.js
// Student Profile Management Controllers - Phase 2.1

const StudentProfile = require('../models/StudentProfile');
const Student = require('../models/Student');
const User = require('../models/User');
const sendResponse = require('../utils/students/sendResponse');
const { uploadToCloudinary } = require('../utils/students/uploadToCloudinary');
const { validateProjectData } = require('../utils/students/validateProjectData');
const { checkGithubLink } = require('../utils/students/checkGithubLink');

// Helper function to find and populate profile
const findProfile = async (studentId) => {
    try {
        return await StudentProfile.findByStudentId(studentId);
    } catch (error) {
        throw new Error(`Profile lookup failed: ${error.message}`);
    }
};

// Helper to get student ID from request
const getStudentId = (req) => {
    // Auth middleware now attaches req.student and sets req.user.studentId
    return req.user?.studentId || req.student?._id || req.student?.id;
};

// Helper to get user ID from request
const getUserId = (req) => {
    return req.user?.id || req.user?._id;
};

/**
 * @desc    Get student profile (creates if doesn't exist)
 * @route   GET /api/student/profile
 * @access  Private (Student)
 */
exports.getProfile = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const userId = getUserId(req);

        if (!studentId || !userId) {
            return sendResponse(res, 401, false, 'Authentication data missing. Please login again.');
        }

        let profile = await findProfile(studentId);

        // Create new profile if doesn't exist
        if (!profile) {
            // Verify student exists
            const student = await Student.findById(studentId);
            if (!student) {
                return sendResponse(res, 404, false, 'Student record not found. Please complete registration.');
            }

            // Create empty profile with all fields initialized for new student
            profile = await StudentProfile.create({
                student: studentId,
                user: userId,
                basicInfo: {
                    fullName: student.fullName || '',
                    email: req.user?.email || '',
                    phone: '',
                    collegeName: student.college || '',
                    degree: '',
                    branch: '',
                    graduationYear: '',
                    currentYear: '',
                    semester: '',
                    studentId: '',
                    rollNumber: '',
                    location: '',
                    bio: ''
                },
                skills: {
                    technical: [],
                    soft: [],
                    languages: [],
                    primarySkills: [],
                    techStack: []
                },
                projects: [],
                documents: {
                    resume: { filename: null, path: null, uploadedAt: null },
                    collegeId: { filename: null, path: null, uploadedAt: null },
                    certificates: []
                },
                links: {
                    github: '',
                    linkedin: '',
                    portfolio: ''
                },
                profileStats: {
                    profileCompletion: 0,
                    lastUpdated: new Date()
                },
                verification: {
                    status: 'incomplete',
                    submittedAt: null,
                    reviewedAt: null,
                    reviewNotes: ''
                },
                status: 'active'
            });

            return sendResponse(res, 201, true, 'Profile created successfully', profile);
        }

        // Update completion and return
        profile.calculateProfileCompletion();
        await profile.save();

        return sendResponse(res, 200, true, 'Profile fetched successfully', profile);
    } catch (error) {
        console.error('❌ Error in getProfile:', error);
        return sendResponse(res, 500, false, 'Server error while fetching profile', null, error.message);
    }
};

/**
 * @desc    Update basic information
 * @route   PUT /api/student/profile/basic
 * @access  Private (Student)
 */
exports.updateBasicInfo = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const {
            fullName, phone, collegeName, degree, branch,
            graduationYear, currentYear, semester, studentId: studentIdInput,
            rollNumber, location, bio
        } = req.body;

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found. Please create profile first.');
        }

        // Update basic info fields
        const fieldsToUpdate = {
            fullName, phone, collegeName, degree, branch,
            graduationYear, currentYear, semester, studentId: studentIdInput,
            rollNumber, location, bio
        };

        Object.keys(fieldsToUpdate).forEach(key => {
            if (fieldsToUpdate[key] !== undefined) {
                profile.basicInfo[key] = fieldsToUpdate[key];
            }
        });

        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, 'Basic information updated successfully', profile.basicInfo);
    } catch (error) {
        console.error('❌ Error in updateBasicInfo:', error);
        return sendResponse(res, 500, false, 'Server error while updating basic info', null, error.message);
    }
};

/**
 * @desc    Update skills
 * @route   PUT /api/student/profile/skills
 * @access  Private (Student)
 */
exports.updateSkills = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const { technical, soft, languages, primarySkills } = req.body;

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        // Update skills
        if (technical !== undefined) profile.skills.technical = technical;
        if (soft !== undefined) profile.skills.soft = soft;
        if (languages !== undefined) profile.skills.languages = languages;
        if (primarySkills !== undefined) profile.skills.primarySkills = primarySkills;

        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, 'Skills updated successfully', profile.skills);
    } catch (error) {
        console.error('❌ Error in updateSkills:', error);
        return sendResponse(res, 500, false, 'Server error while updating skills', null, error.message);
    }
};

/**
 * @desc    Update tech stack
 * @route   PUT /api/student/profile/tech
 * @access  Private (Student)
 */
exports.updateTechStack = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const { techStack } = req.body;

        if (!Array.isArray(techStack)) {
            return sendResponse(res, 400, false, 'Tech stack must be an array of strings.');
        }

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        profile.skills.techStack = techStack;
        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, 'Technical stack updated successfully', profile.skills.techStack);
    } catch (error) {
        console.error('❌ Error in updateTechStack:', error);
        return sendResponse(res, 500, false, 'Server error while updating tech stack', null, error.message);
    }
};

/**
 * @desc    Update portfolio links (GitHub, LinkedIn, Portfolio, Other)
 * @route   PUT /api/student/profile/links
 * @access  Private (Student)
 */
exports.updatePortfolioLinks = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const { github, linkedin, portfolio, other } = req.body;

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        // Validate URLs if provided
        const urlRegex = /^https?:\/\/.+/;

        if (github && !urlRegex.test(github)) {
            return sendResponse(res, 400, false, 'Invalid GitHub URL format');
        }

        if (linkedin && !urlRegex.test(linkedin)) {
            return sendResponse(res, 400, false, 'Invalid LinkedIn URL format');
        }

        if (portfolio && !urlRegex.test(portfolio)) {
            return sendResponse(res, 400, false, 'Invalid Portfolio URL format');
        }

        // Update links
        profile.links.github = github || '';
        profile.links.linkedin = linkedin || '';
        profile.links.portfolio = portfolio || '';

        // Update other links if provided
        if (Array.isArray(other)) {
            // Validate each other link
            for (const link of other) {
                if (link.url && !urlRegex.test(link.url)) {
                    return sendResponse(res, 400, false, `Invalid URL format for ${link.name}`);
                }
            }
            profile.links.other = other;
        }

        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, 'Portfolio links updated successfully', profile.links);
    } catch (error) {
        console.error('❌ Error in updatePortfolioLinks:', error);
        return sendResponse(res, 500, false, 'Server error while updating portfolio links', null, error.message);
    }
};

/**
 * @desc    Upload resume to Cloudinary
 * @route   POST /api/student/profile/resume
 * @access  Private (Student)
 */
exports.uploadResume = async (req, res) => {
    try {
        const studentId = getStudentId(req);

        if (!req.file) {
            return sendResponse(res, 400, false, 'Resume file not provided.');
        }

        // Validate file type (additional check)
        if (req.file.mimetype !== 'application/pdf') {
            return sendResponse(res, 400, false, 'Only PDF files are allowed for resume.');
        }

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.path, 'resumes', studentId);

        // Update profile - store both public_id and url for proper file access
        profile.documents.resume = {
            filename: req.file.originalname,
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
            path: uploadResult.secure_url, // Keep path for backward compatibility
            uploadedAt: new Date()
        };

        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, 'Resume uploaded successfully', profile.documents.resume);
    } catch (error) {
        console.error('❌ Error in uploadResume:', error);
        return sendResponse(res, 500, false, 'Server error while uploading resume', null, error.message);
    }
};

/**
 * @desc    Add new project
 * @route   POST /api/student/profile/projects
 * @access  Private (Student)
 */
exports.addProject = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const { title, description, technologies, role, duration, link, isLive } = req.body;

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        // Check project limit (max 5)
        if (profile.projects.length >= 5) {
            return sendResponse(res, 400, false, 'Maximum 5 projects allowed. Delete an existing project first.');
        }

        // Validate project data
        const validationError = validateProjectData(req.body);
        if (validationError) {
            return sendResponse(res, 400, false, validationError);
        }

        // Validate GitHub link if provided
        if (link && link.toLowerCase().includes('github.com')) {
            const githubError = await checkGithubLink(link);
            if (githubError) {
                return sendResponse(res, 400, false, githubError);
            }
        }

        const newProject = {
            title,
            description,
            technologies: technologies || [],
            role: role || '',
            duration: duration || '',
            link: link || '',
            isLive: isLive === 'true' || isLive === true,
            screenshot: null // Handle separately if needed
        };

        profile.projects.push(newProject);
        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 201, true, 'Project added successfully', profile.projects[profile.projects.length - 1]);
    } catch (error) {
        console.error('❌ Error in addProject:', error);
        return sendResponse(res, 500, false, 'Server error while adding project', null, error.message);
    }
};

/**
 * @desc    Update existing project
 * @route   PUT /api/student/profile/projects/:id
 * @access  Private (Student)
 */
exports.updateProject = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const { id } = req.params;
        const updateData = req.body;

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        const project = profile.projects.id(id);

        if (!project) {
            return sendResponse(res, 404, false, 'Project not found with the given ID.');
        }

        // Validate project data (partial update)
        const validationError = validateProjectData(updateData, true);
        if (validationError) {
            return sendResponse(res, 400, false, validationError);
        }

        // Validate GitHub link if provided
        if (updateData.link && updateData.link.toLowerCase().includes('github.com')) {
            const githubError = await checkGithubLink(updateData.link);
            if (githubError) {
                return sendResponse(res, 400, false, githubError);
            }
        }

        // Update project
        Object.keys(updateData).forEach(key => {
            if (updateData[key] !== undefined) {
                project[key] = updateData[key];
            }
        });

        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, 'Project updated successfully', project);
    } catch (error) {
        console.error('❌ Error in updateProject:', error);
        return sendResponse(res, 500, false, 'Server error while updating project', null, error.message);
    }
};

/**
 * @desc    Delete project (minimum 3 required)
 * @route   DELETE /api/student/profile/projects/:id
 * @access  Private (Student)
 */
exports.deleteProject = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const { id } = req.params;

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        // Check minimum limit
        if (profile.projects.length <= 3) {
            return sendResponse(res, 400, false, 'Cannot delete project. Minimum 3 projects are required.');
        }

        const project = profile.projects.id(id);

        if (!project) {
            return sendResponse(res, 404, false, 'Project not found with the given ID.');
        }

        // Remove project
        profile.projects.pull(id);
        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, 'Project deleted successfully', { projectId: id });
    } catch (error) {
        console.error('❌ Error in deleteProject:', error);
        return sendResponse(res, 500, false, 'Server error while deleting project', null, error.message);
    }
};

/**
 * @desc    Upload multiple certificates
 * @route   POST /api/student/profile/certificates
 * @access  Private (Student)
 */
exports.uploadCertificates = async (req, res) => {
    try {
        const studentId = getStudentId(req);

        if (!req.files || req.files.length === 0) {
            return sendResponse(res, 400, false, 'Certificate files not provided.');
        }

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        const uploadedCertificates = [];

        // Process each file
        for (const file of req.files) {
            const uploadResult = await uploadToCloudinary(file.path, 'certificates', studentId);

            const newCertificate = {
                filename: file.originalname,
                public_id: uploadResult.public_id,
                url: uploadResult.secure_url,
                path: uploadResult.secure_url, // Keep path for backward compatibility
                title: file.originalname.split('.').slice(0, -1).join('.'), // Remove extension
                uploadedAt: new Date()
            };

            profile.documents.certificates.push(newCertificate);
            uploadedCertificates.push(newCertificate);
        }

        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, `${uploadedCertificates.length} certificates uploaded successfully`, uploadedCertificates);
    } catch (error) {
        console.error('❌ Error in uploadCertificates:', error);
        return sendResponse(res, 500, false, 'Server error while uploading certificates', null, error.message);
    }
};

/**
 * @desc    Upload College ID for verification
 * @route   POST /api/student/profile/college-id
 * @access  Private (Student)
 */
exports.uploadCollegeId = async (req, res) => {
    try {
        const studentId = getStudentId(req);

        if (!req.file) {
            return sendResponse(res, 400, false, 'College ID file not provided.');
        }

        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        // Upload to Cloudinary
        const uploadResult = await uploadToCloudinary(req.file.path, 'college_ids', studentId);

        // Update document - store both public_id and url for proper file access
        profile.documents.collegeId = {
            filename: req.file.originalname,
            public_id: uploadResult.public_id,
            url: uploadResult.secure_url,
            path: uploadResult.secure_url, // Keep path for backward compatibility
            uploadedAt: new Date()
        };

        // Reset verification if already verified
        if (profile.verification.status === 'verified') {
            profile.verification.status = 'incomplete';
            profile.verification.isCollegeIdVerified = false;
        }

        profile.profileStats.lastUpdated = new Date();
        await profile.save();

        return sendResponse(res, 200, true, 'College ID uploaded successfully', profile.documents.collegeId);
    } catch (error) {
        console.error('❌ Error in uploadCollegeId:', error);
        return sendResponse(res, 500, false, 'Server error while uploading college ID', null, error.message);
    }
};

/**
 * @desc    Submit profile for verification
 * @route   POST /api/student/profile/submit-verification
 * @access  Private (Student)
 */
exports.submitForVerification = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const profile = await StudentProfile.findOne({ student: studentId });

        if (!profile) {
            return sendResponse(res, 404, false, 'Profile not found.');
        }

        // Final verification checks (redundant but safe)
        if (profile.profileStats.profileCompletion < 100) {
            return sendResponse(res, 400, false, `Profile is not 100% complete. Current: ${profile.profileStats.profileCompletion}%`);
        }

        if (profile.projects.length < 3) {
            return sendResponse(res, 400, false, 'Minimum 3 projects required for verification.');
        }

        if (!profile.documents.resume.path || !profile.documents.collegeId.path) {
            return sendResponse(res, 400, false, 'Resume and College ID must be uploaded.');
        }

        // Submit for verification
        await profile.submitForVerification();

        // Debug logs to verify verification fields after submit
        console.log('✅ StudentProfile submitForVerification called for student:', studentId);
        console.log('   Legacy verification.status:', profile.verification?.status);
        console.log('   Legacy submittedForVerificationAt:', profile.verification?.submittedForVerificationAt);
        console.log('   Top-level verificationStatus:', profile.verificationStatus);
        console.log('   Top-level verificationRequestedAt:', profile.verificationRequestedAt);

        // Create admin notification for new verification request
        const { sendAdminNotification } = require('../utils/notifications/sendNotification');
        await sendAdminNotification(
            `New student profile submitted for verification: ${profile.basicInfo.fullName || 'Unknown'}`,
            'profile-submitted',
            'student',
            profile._id
        );
        console.log('✅ Admin notification sent for student verification request');

        return sendResponse(res, 200, true, 'Profile submitted for verification successfully. Admin will review it shortly.', {
            status: profile.verification.status,
            submittedAt: profile.verification.submittedForVerificationAt
        });
    } catch (error) {
        console.error('❌ Error in submitForVerification:', error);
        return sendResponse(res, 500, false, 'Server error while submitting for verification', null, error.message);
    }
};

/**
 * @desc    Get student dashboard data
 * @route   GET /api/student/dashboard
 * @access  Private (Student)
 */
exports.getDashboard = async (req, res) => {
    try {
        const studentId = getStudentId(req);
        const userId = getUserId(req);

        if (!studentId || !userId) {
            return sendResponse(res, 401, false, 'Authentication data missing. Please login again.');
        }

    let profile = await findProfile(studentId);

            // If no profile exists, create an initial empty profile (same behavior as GET /profile)
            if (!profile) {
                // Ensure Student and User exist
                const student = await Student.findById(studentId);
                const user = await User.findById(req.user?._id || req.user?.id);

                // Create an initialized profile so dashboard can show basic info immediately
                profile = await StudentProfile.create({
                    student: studentId,
                    user: req.user?._id || req.user?.id,
                    basicInfo: {
                        fullName: (student && student.fullName) ? student.fullName : (user && user.email ? user.email.split('@')[0] : ''),
                        email: (user && user.email) ? user.email : '',
                        phone: '',
                        collegeName: (student && student.college) ? student.college : '',
                        degree: '',
                        branch: '',
                        graduationYear: '',
                        currentYear: '',
                        semester: '',
                        studentId: '',
                        rollNumber: '',
                        location: '',
                        bio: ''
                    },
                    skills: {
                        technical: [],
                        soft: [],
                        languages: [],
                        primarySkills: [],
                        techStack: []
                    },
                    projects: [],
                    documents: {
                        resume: { filename: null, path: null, uploadedAt: null },
                        collegeId: { filename: null, path: null, uploadedAt: null },
                        certificates: []
                    },
                    links: {
                        github: '',
                        linkedin: '',
                        portfolio: ''
                    },
                    profileStats: {
                        profileCompletion: 0,
                        lastUpdated: new Date()
                    },
                    verification: {
                        status: 'incomplete',
                        submittedAt: null,
                        reviewedAt: null,
                        reviewNotes: ''
                    },
                    status: 'active'
                });
            }

        // Update completion
        profile.calculateProfileCompletion();
        await profile.save();

        // Generate alerts
        const alerts = [];
        const completion = profile.profileStats.profileCompletion;

        if (completion < 100) {
            alerts.push(`📊 Your profile is ${completion}% complete. Complete it to submit for verification.`);

            if (!profile.basicInfo.fullName || !profile.basicInfo.phone) {
                alerts.push('📝 Complete your basic information (name, phone).');
            }
            if (!profile.skills.technical || profile.skills.technical.length === 0) {
                alerts.push('💡 Add at least one technical skill.');
            }
            if (profile.projects.length < 3) {
                alerts.push(`🚀 Add ${3 - profile.projects.length} more project(s) to meet the minimum requirement.`);
            }
            if (!profile.documents.resume.path) {
                alerts.push('📄 Upload your latest resume (PDF only).');
            }
            if (!profile.documents.collegeId.path) {
                alerts.push('🎓 Upload your College ID for verification.');
            }
        } else {
            alerts.push('✅ Your profile is 100% complete! Submit for verification when ready.');
        }

        if (profile.verification.status === 'pending') {
            alerts.push('⏳ Your profile is under review for verification.');
        } else if (profile.verification.status === 'rejected') {
            alerts.push(`❌ Verification rejected: ${profile.verification.rejectionReason || 'N/A'}. Update and resubmit.`);
        } else if (profile.verification.status === 'verified') {
            alerts.push('✔️ Your profile is verified!');
        }

        const dashboardData = {
            profileCompletion: completion,
            verificationStatus: profile.verification.status,
            totalProjects: profile.projects.length,
            alerts: alerts.length > 0 ? alerts : ['Your profile is in good standing.'],
            basicInfo: {
                fullName: profile.basicInfo.fullName,
                collegeName: profile.basicInfo.collegeName,
                degree: profile.basicInfo.degree,
                email: profile.basicInfo.email,
                phone: profile.basicInfo.phone,
            },
            stats: {
                viewCount: profile.profileStats.viewCount,
                lastUpdated: profile.profileStats.lastUpdated
            }
        };

        return sendResponse(res, 200, true, 'Dashboard data fetched successfully', dashboardData);
    } catch (error) {
        console.error('❌ Error in getDashboard:', error);
        return sendResponse(res, 500, false, 'Server error while fetching dashboard', null, error.message);
    }
};