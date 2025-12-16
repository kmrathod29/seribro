// backend/controllers/companyApplicationController.js
// Company Application Management Controller - Phase 4.3

const Application = require('../models/Application');
const Project = require('../models/Project');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/companyProfile');
const User = require('../models/User');
const Notification = require('../models/Notification');
const mongoose = require('mongoose');

// ============================================
// UTILITY FUNCTIONS
// ============================================

/**
 * Hinglish: Consistent response format
 */
const sendResponse = (res, success, message, data = null, status = 200) => {
    return res.status(status).json({ success, message, data });
};

/**
 * Hinglish: Skill match calculator - kitne %age ke liye skills match ho rahe hain
 * Isme check karo ki dono arrays hain, agar nahi to default empty array use karo
 */
const calculateSkillMatch = (requiredSkills, studentSkills) => {
    // Validate inputs
    if (!requiredSkills || !Array.isArray(requiredSkills) || requiredSkills.length === 0) {
        return 0;
    }
    
    // Ensure studentSkills is an array
    const skills = Array.isArray(studentSkills) ? studentSkills : [];
    
    if (skills.length === 0) {
        return 0;
    }
    
    const matchedSkills = requiredSkills.filter(skill =>
        skills.some(s => {
            const skillStr = String(s).toLowerCase();
            return skillStr === String(skill).toLowerCase();
        })
    ).length;

    return Math.round((matchedSkills / requiredSkills.length) * 100);
};

/**
 * Hinglish: Student ke data ko cache karo application mein
 */
const cacheStudentData = async (studentId, application) => {
    try {
        const studentProfile = await StudentProfile.findById(studentId);
        
        if (studentProfile) {
            application.studentName = studentProfile.name || '';
            application.studentEmail = studentProfile.email || '';
            application.studentCollege = studentProfile.college || '';
            application.studentSkills = studentProfile.skills || [];
            application.studentPhoto = studentProfile.profilePhoto || '';
            application.studentResume = studentProfile.resumeUrl || '';
        }
    } catch (error) {
        console.error('Error caching student data:', error);
    }
};

/**
 * Hinglish: Notification create karo student ko
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
// 1. GET /api/company/applications/projects/:projectId/applications
// ============================================

/**
 * Hinglish: Project ke saare applications fetch kar rahe hain
 * @desc Get all applications for a specific project
 * @route GET /api/company/applications/:projectId/applications
 * @access Private (Company)
 */
exports.getProjectApplications = async (req, res) => {
    try {
        const { projectId } = req.params;
        const { status = 'all', page = 1, limit = 20 } = req.query;

        // Get company profile for current user
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // Project verify karo
        const project = await Project.findById(projectId);

        if (!project) {
            return sendResponse(res, false, 'Project nahi mila', null, 404);
        }

        // Check ownership - compare with company profile ID
        if (project.companyId.toString() !== companyProfile._id.toString()) {
            return sendResponse(res, false, 'Yeh project aapka nahi hai', null, 403);
        }

        // Query build karo
        const query = { projectId };
        if (status !== 'all') {
            query.status = status;
        }

        // Applications fetch karo with pagination
        const skip = (page - 1) * limit;
        const applications = await Application.find(query)
            .populate('student', 'name email')
            .lean()
            .sort({ appliedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        // Total count
        const total = await Application.countDocuments(query);

        // PART 4: Student profile data fetch karo - ONLY allowed fields (NO email/phone)
        const applicationsWithStudentData = await Promise.all(
            applications.map(async (app) => {
                // Use snapshot if available, otherwise fetch from profile
                const studentData = app.studentSnapshot || {};
                const studentProfile = await StudentProfile.findById(app.student?._id || app.studentId)
                    .select('basicInfo.fullName basicInfo.collegeName basicInfo.location skills.technical skills.soft skills.languages documents.resume.url documents.collegeId.url');
                
                // PART 4: Return ONLY allowed fields - NO email, NO phone
                return {
                    ...app,
                    studentName: studentData.name || studentProfile?.basicInfo?.fullName || 'Unknown Student',
                    studentCollege: studentData.collegeName || studentProfile?.basicInfo?.collegeName || 'Not Specified',
                    city: studentData.city || studentProfile?.basicInfo?.location || '',
                    studentSkills: studentData.skills || [
                        ...(studentProfile?.skills?.technical || []),
                        ...(studentProfile?.skills?.soft || []),
                        ...(studentProfile?.skills?.languages || []),
                    ],
                    // DO NOT include email or phone
                };
            })
        );

        // Skill match calculate karo har application ke liye
        const applicationsWithMatch = applicationsWithStudentData.map(app => {
            // Ensure we have an array of skills
            const skillsArray = Array.isArray(app.studentSkills) ? app.studentSkills : [];
            const requiredSkillsArray = Array.isArray(project.requiredSkills) ? project.requiredSkills : [];
            
            const skillMatch = calculateSkillMatch(requiredSkillsArray, skillsArray);
            return {
                ...app,
                skillMatch,
            };
        });

        // Sort by skill match (pending pehle, phir skill match)
        applicationsWithMatch.sort((a, b) => {
            if (a.status === 'pending' && b.status !== 'pending') return -1;
            if (a.status !== 'pending' && b.status === 'pending') return 1;
            return b.skillMatch - a.skillMatch;
        });

        return sendResponse(res, true, 'Applications fetched successfully', {
            applications: applicationsWithMatch,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get project applications error:', error);
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ============================================
// 2. GET /api/company/applications/all
// ============================================

/**
 * Hinglish: Company ke sabhi projects ke applications laa rahe hain
 * @desc Get all applications for all company projects with pagination
 * @route GET /api/company/applications/all
 * @access Private (Company)
 */
exports.getAllCompanyApplications = async (req, res) => {
    try {
        const { status = 'all', projectId = 'all', page = 1, limit = 20 } = req.query;

        // Get company profile for current user
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // Query build karo
        const query = {};
        
        if (status !== 'all') {
            query.status = status;
        }

        // Pehle company ke sab projects fetch karo agar projectId filter nahi hai
        let projectIds = [];
        if (projectId === 'all') {
            const projects = await Project.find({ companyId: companyProfile._id });
            projectIds = projects.map(p => p._id);
        } else {
            // Verify ownership
            const project = await Project.findById(projectId);
            if (!project || project.companyId.toString() !== companyProfile._id.toString()) {
                return sendResponse(res, false, 'Project nahi mila ya access denied', null, 404);
            }
            projectIds = [projectId];
        }

        query.projectId = { $in: projectIds };

        // Pagination
        const skip = (page - 1) * limit;

        // Applications fetch karo
        const applications = await Application.find(query)
            .populate('student', 'name email college')
            .populate('projectId', 'title category requiredSkills')
            .lean()
            .sort({ appliedAt: -1 })
            .skip(skip)
            .limit(parseInt(limit));

        const total = await Application.countDocuments(query);

        // PART 4: Student profile data fetch karo - use studentData if available
        const applicationsWithStudentData = await Promise.all(
            applications.map(async (app) => {
                // Phase 4: Use studentData (with hidden fields) if available, otherwise use studentSnapshot or fetch fresh
                const cachedData = app.studentData || app.studentSnapshot || {};
                const studentProfile = await StudentProfile.findById(app.student?._id || app.studentId)
                    .select('basicInfo.fullName basicInfo.collegeName basicInfo.location skills.technical skills.soft skills.languages documents.resume.url documents.collegeId.url');
                
                // PART 4: Return ONLY allowed fields - NO email, NO phone, NO _hiddenEmail, NO _hiddenPhone
                // Remove hidden fields before sending to frontend
                const sanitizedData = { ...cachedData };
                delete sanitizedData._hiddenEmail;
                delete sanitizedData._hiddenPhone;
                
                return {
                    ...app,
                    studentName: cachedData.fullName || cachedData.name || studentProfile?.basicInfo?.fullName || 'Unknown Student',
                    studentCollege: cachedData.college || cachedData.collegeName || studentProfile?.basicInfo?.collegeName || 'Not Specified',
                    city: cachedData.city || studentProfile?.basicInfo?.location || '',
                    studentSkills: cachedData.skills || [
                        ...(studentProfile?.skills?.technical || []),
                        ...(studentProfile?.skills?.soft || []),
                        ...(studentProfile?.skills?.languages || []),
                    ],
                    // DO NOT include email, phone, _hiddenEmail, or _hiddenPhone
                };
            })
        );

        // Skills match add karo
        const applicationsWithMatch = applicationsWithStudentData.map(app => {
            // Ensure we have arrays
            const skillsArray = Array.isArray(app.studentSkills) ? app.studentSkills : [];
            const requiredSkillsArray = Array.isArray(app.projectId?.requiredSkills) ? app.projectId.requiredSkills : [];
            
            const skillMatch = calculateSkillMatch(requiredSkillsArray, skillsArray);
            return {
                ...app,
                skillMatch,
            };
        });

        return sendResponse(res, true, 'All applications fetched', {
            applications: applicationsWithMatch,
            total,
            page: parseInt(page),
            limit: parseInt(limit),
            pages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error('Get all company applications error:', error);
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ============================================
// 3. GET /api/company/applications/:applicationId
// ============================================

/**
 * Hinglish: Application ki complete details laa rahe hain
 * @desc Get complete details of a single application
 * @route GET /api/company/applications/:applicationId
 * @access Private (Company)
 */
exports.getApplicationDetails = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Application fetch karo
        const application = await Application.findById(applicationId)
            .populate('student', 'name email college')
            .populate('projectId', 'title category requiredSkills');

        if (!application) {
            return sendResponse(res, false, 'Application nahi mila', null, 404);
        }

        // Get company profile for ownership check
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // PART 2: Check ownership - fix project ownership check
        const project = await Project.findById(application.projectId);
        if (!project) {
            return sendResponse(res, false, 'Project nahi mila', null, 404);
        }

        // Fix: Compare with companyId properly - check if companyId exists
        if (!project.companyId) {
            return sendResponse(res, false, 'Project ka company ID nahi mila', null, 500);
        }

        if (project.companyId.toString() !== companyProfile._id.toString()) {
            return sendResponse(res, false, 'Yeh application aapke project se nahi hai. Access denied!', null, 403);
        }

        // PART 2: Populate student fields properly
        const studentProfile = await StudentProfile.findById(application.studentId || application.student?._id)
            .select('basicInfo.fullName basicInfo.collegeName basicInfo.location basicInfo.email basicInfo.phone skills.technical skills.soft skills.languages documents.resume.url documents.collegeId.url projects');
        
        if (!studentProfile) {
            return sendResponse(res, false, 'Student profile nahi mila', null, 404);
        }

        // Mark as viewed agar pehli bar dekh rahe ho
        if (!application.companyViewedAt) {
            application.companyViewedAt = new Date();
            await application.save();
        }

        // Skill match calculate karo
        const studentSkills = [
            ...(studentProfile.skills?.technical || []),
            ...(studentProfile.skills?.soft || []),
            ...(studentProfile.skills?.languages || []),
        ];
        const requiredSkillsArray = Array.isArray(project.requiredSkills) ? project.requiredSkills : [];
        const skillMatch = calculateSkillMatch(requiredSkillsArray, studentSkills);

        // Phase 4: Use studentData if available, otherwise fallback to studentSnapshot or fresh data
        const cachedData = application.studentData || application.studentSnapshot || {};
        
        // Remove hidden fields before sending to frontend
        const sanitizedStudentData = { ...cachedData };
        delete sanitizedStudentData._hiddenEmail;
        delete sanitizedStudentData._hiddenPhone;
        
        // PART 2: Return clean JSON with proper student data (NO hidden fields)
        return sendResponse(res, true, 'Application details fetched', {
            application: application.toObject(),
            student: {
                name: cachedData.fullName || cachedData.name || studentProfile.basicInfo?.fullName || 'Unknown Student',
                college: cachedData.college || cachedData.collegeName || studentProfile.basicInfo?.collegeName || 'Not Specified',
                city: cachedData.city || studentProfile.basicInfo?.location || '',
                course: cachedData.course || studentProfile.basicInfo?.degree || '',
                year: cachedData.year || studentProfile.basicInfo?.currentYear || '',
                skills: cachedData.skills || studentSkills,
                projects: cachedData.projects || studentProfile.projects || [],
                resume: cachedData.resume || studentProfile.documents?.resume?.url || studentProfile.documents?.resume?.path || '',
                certificates: cachedData.certificates || (studentProfile.documents?.certificates || []).map(cert => cert.url || cert.path || ''),
                profilePicture: cachedData.profilePicture || studentProfile.basicInfo?.profilePicture || '',
                cgpa: cachedData.cgpa || null,
                // NO email, NO phone, NO _hiddenEmail, NO _hiddenPhone
            },
            project: {
                _id: project._id,
                title: project.title,
                category: project.category,
                requiredSkills: project.requiredSkills,
                budgetMin: project.budgetMin,
                budgetMax: project.budgetMax,
                deadline: project.deadline,
                status: project.status,
                assignedStudent: project.assignedStudent,
                companyId: project.companyId,
            },
            skillMatch,
        });
    } catch (error) {
        console.error('Get application details error:', error);
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ============================================
// 4. POST /api/company/applications/:applicationId/shortlist
// ============================================

/**
 * Hinglish: Application ko shortlist kar rahe hain
 * @desc Shortlist an application
 * @route POST /api/company/applications/:applicationId/shortlist
 * @access Private (Company)
 */
exports.shortlistApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;

        // Application fetch karo
        const application = await Application.findById(applicationId);

        if (!application) {
            return sendResponse(res, false, 'Application nahi mila', null, 404);
        }

        // Get company profile for ownership check
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // Check ownership - compare with company profile ID
        const project = await Project.findById(application.projectId);
        if (!project) {
            return sendResponse(res, false, 'Project nahi mila', null, 404);
        }

        if (project.companyId.toString() !== companyProfile._id.toString()) {
            return sendResponse(res, false, 'Access denied', null, 403);
        }

        // Check status - sirf pending ko shortlist kar sakte hain
        if (application.status !== 'pending') {
            return sendResponse(
                res,
                false,
                `Sirf pending applications ko shortlist kar sakte hain. Current: ${application.status}`,
                null,
                400
            );
        }

        // Update status
        application.status = 'shortlisted';
        application.shortlistedAt = new Date();
        await application.save();

        // Phase 4: Notification bhejo student ko with correct type
        const studentProfile = await StudentProfile.findById(application.studentId);
        if (studentProfile) {
            const studentUser = await User.findById(studentProfile.user);
            if (studentUser) {
                await createNotification(
                    studentUser._id,
                    'student',
                    `Congratulations! Your application for "${project.title}" has been shortlisted!`,
                    'application_shortlisted',
                    application._id
                );
            }
        }

        return sendResponse(res, true, 'Application shortlisted successfully', application);
    } catch (error) {
        console.error('Shortlist application error:', error);
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ============================================
// 5. POST /api/company/applications/:applicationId/approve (Phase 4.5)
// ============================================

/**
 * PART 6: Company APPROVES one student → Phase 4 Final Workflow
 * Hinglish: Application approve kar rahe hain - CRITICAL - MongoDB transaction use
 * @desc Approve an application, reject all others, assign project to student
 * @route POST /api/company/applications/:applicationId/approve
 * @access Private (Company)
 */
exports.approveStudentForProject = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { applicationId } = req.params;

        // Get company profile
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id }).session(session);
        if (!companyProfile) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // Application fetch karo
        const application = await Application.findById(applicationId).session(session);

        if (!application) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Application nahi mila', null, 404);
        }

        // Check ownership
        const project = await Project.findById(application.projectId).session(session);
        if (!project) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Project nahi mila', null, 404);
        }

        if (project.companyId.toString() !== companyProfile._id.toString()) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Yeh application aapke project se nahi hai. Access denied!', null, 403);
        }

        // Check if project is already assigned
        if (project.assignedStudent) {
            await session.abortTransaction();
            return sendResponse(res, false, 'This project has already been assigned to a student.', null, 400);
        }

        // Check status - pending aur shortlisted ko approve kar sakte hain
        if (!['pending', 'shortlisted'].includes(application.status)) {
            await session.abortTransaction();
            return sendResponse(
                res,
                false,
                `Application is already ${application.status}`,
                null,
                400
            );
        }

        // PART 6: Step 1 - Mark this application as accepted
        application.status = 'accepted';
        application.acceptedAt = new Date();
        await application.save({ session });

        // PART 6: Step 2 - Mark ALL OTHER applications for the same project as rejected
        const otherApplications = await Application.find({
            projectId: application.projectId,
            _id: { $ne: applicationId },
            status: { $in: ['pending', 'shortlisted', 'accepted'] },
        }).session(session);

        const rejectionIds = otherApplications.map(app => app._id);

        if (rejectionIds.length > 0) {
            await Application.updateMany(
                { _id: { $in: rejectionIds } },
                {
                    $set: {
                        status: 'rejected',
                        rejectedAt: new Date(),
                        rejectionReason: 'Another candidate has been selected for this project',
                    },
                },
                { session }
            );
        }

        // PART 6: Step 3 - Update project document
        project.assignedStudent = application.studentId;
        project.status = 'assigned';
        await project.save({ session });

        // PART 6: Step 4 - Send notifications
        // Get student user for notification
        const studentProfile = await StudentProfile.findById(application.studentId).session(session);
        const studentUser = studentProfile ? await User.findOne({ _id: studentProfile.user }).session(session) : null;

        // To approved student
        if (studentUser) {
            await createNotification(
                studentUser._id,
                'student',
                `Your application has been approved. You are assigned to this project: "${project.title}".`,
                'application_accepted',
                application._id
            );
        }

        // Phase 4: To company with correct type
        const studentName = studentProfile?.basicInfo?.fullName || 
                           studentProfile?.name || 
                           application.studentSnapshot?.name || 
                           'student';
        await createNotification(
            req.user._id,
            'company',
            `Project "${project.title}" successfully assigned to ${studentName}.`,
            'project_assigned',
            project._id
        );

        // To rejected students
        for (const rejectedApp of otherApplications) {
            const rejectedStudentProfile = await StudentProfile.findById(rejectedApp.studentId).session(session);
            if (rejectedStudentProfile) {
                const rejectedStudentUser = await User.findOne({ _id: rejectedStudentProfile.user }).session(session);
                if (rejectedStudentUser) {
                    await createNotification(
                        rejectedStudentUser._id,
                        'student',
                        `Your application was not selected for project: "${project.title}".`,
                        'application_rejected',
                        rejectedApp._id
                    );
                }
            }
        }

        await session.commitTransaction();

        return sendResponse(res, true, 'Student approved and project assigned successfully', {
            application,
            project: {
                _id: project._id,
                title: project.title,
                status: project.status,
                assignedStudent: project.assignedStudent,
            },
            rejectedCount: otherApplications.length,
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Approve student error:', error);
        return sendResponse(res, false, error.message, null, 500);
    } finally {
        session.endSession();
    }
};

// ============================================
// 5.1. POST /api/company/applications/:applicationId/accept (Legacy - keep for backward compatibility)
// ============================================

/**
 * Hinglish: Application accept kar rahe hain - CRITICAL - MongoDB transaction use
 * @desc Accept an application and reject all others for the project
 * @route POST /api/company/applications/:applicationId/accept
 * @access Private (Company)
 */
exports.acceptApplication = async (req, res) => {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const { applicationId } = req.params;

        // Application fetch karo
        const application = await Application.findById(applicationId).session(session);

        if (!application) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Application nahi mila', null, 404);
        }

        // Get company profile for ownership check
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id }).session(session);
        if (!companyProfile) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // Check ownership - compare with company profile ID
        const project = await Project.findById(application.projectId).session(session);
        if (!project) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Project nahi mila', null, 404);
        }

        if (project.companyId.toString() !== companyProfile._id.toString()) {
            await session.abortTransaction();
            return sendResponse(res, false, 'Access denied', null, 403);
        }

        // Check status - pending aur shortlisted ko accept kar sakte hain
        if (!['pending', 'shortlisted'].includes(application.status)) {
            await session.abortTransaction();
            return sendResponse(
                res,
                false,
                `Application is already ${application.status}`,
                null,
                400
            );
        }

        // Update accepted application
        application.status = 'accepted';
        application.acceptedAt = new Date();
        await application.save({ session });

        // Update project status
        project.status = 'assigned';
        project.assignedStudent = application.studentId;
        await project.save({ session });

        // Get all other applications for this project
        const otherApplications = await Application.find({
            projectId: application.projectId,
            _id: { $ne: applicationId },
            status: { $in: ['pending', 'shortlisted'] },
        }).session(session);

        // Reject all other applications
        const rejectionIds = otherApplications.map(app => app._id);

        await Application.updateMany(
            { _id: { $in: rejectionIds } },
            {
                $set: {
                    status: 'rejected',
                    rejectedAt: new Date(),
                    rejectionReason: 'Another candidate has been selected for this project',
                },
            },
            { session }
        );

        // Phase 4: Notify accepted student with correct type
        const acceptedStudentProfile = await StudentProfile.findById(application.studentId);
        if (acceptedStudentProfile) {
            const acceptedStudentUser = await User.findById(acceptedStudentProfile.user);
            if (acceptedStudentUser) {
                await createNotification(
                    acceptedStudentUser._id,
                    'student',
                    `Great! Your application for "${project.title}" has been accepted! You are assigned to this project.`,
                    'application_accepted',
                    application._id
                );
            }
        }

        // Phase 4: Notify rejected students with correct type
        for (const rejectedApp of otherApplications) {
            const rejectedStudentProfile = await StudentProfile.findById(rejectedApp.studentId);
            if (rejectedStudentProfile) {
                const rejectedStudentUser = await User.findById(rejectedStudentProfile.user);
                if (rejectedStudentUser) {
                    await createNotification(
                        rejectedStudentUser._id,
                        'student',
                        `Your application for "${project.title}" has been rejected as another candidate was selected.`,
                        'application_rejected',
                        rejectedApp._id
                    );
                }
            }
        }

        await session.commitTransaction();

        return sendResponse(res, true, 'Application accepted and others rejected', {
            application,
            rejectedCount: otherApplications.length,
        });
    } catch (error) {
        await session.abortTransaction();
        console.error('Accept application error:', error);
        return sendResponse(res, false, error.message, null, 500);
    } finally {
        session.endSession();
    }
};

// ============================================
// 6. POST /api/company/applications/:applicationId/reject
// ============================================

/**
 * Hinglish: Application reject kar rahe hain
 * @desc Reject an application with reason
 * @route POST /api/company/applications/:applicationId/reject
 * @access Private (Company)
 */
exports.rejectApplication = async (req, res) => {
    try {
        const { applicationId } = req.params;
        const { rejectionReason } = req.body;

        // Validation
        if (!rejectionReason || rejectionReason.length < 10 || rejectionReason.length > 500) {
            return sendResponse(
                res,
                false,
                'Rejection reason 10-500 characters ke beech hona chahiye',
                null,
                400
            );
        }

        // Application fetch karo
        const application = await Application.findById(applicationId);

        if (!application) {
            return sendResponse(res, false, 'Application nahi mila', null, 404);
        }

        // Get company profile for ownership check
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // Check ownership - compare with company profile ID
        const project = await Project.findById(application.projectId);
        if (!project) {
            return sendResponse(res, false, 'Project nahi mila', null, 404);
        }

        if (project.companyId.toString() !== companyProfile._id.toString()) {
            return sendResponse(res, false, 'Access denied', null, 403);
        }

        // Check status - pending aur shortlisted ko accept kar sakte hain
        if (!['pending', 'shortlisted'].includes(application.status)) {
            return sendResponse(
                res,
                false,
                `Application is already ${application.status}`,
                null,
                400
            );
        }

        // Update application
        application.status = 'rejected';
        application.rejectionReason = rejectionReason;
        application.rejectedAt = new Date();
        await application.save();

        // Phase 4: Notify student with correct type
        const studentProfile = await StudentProfile.findById(application.studentId);
        if (studentProfile) {
            const studentUser = await User.findById(studentProfile.user);
            if (studentUser) {
                await createNotification(
                    studentUser._id,
                    'student',
                    `Your application for "${project.title}" has been rejected. Reason: ${rejectionReason}`,
                    'application_rejected',
                    application._id
                );
            }
        }

        return sendResponse(res, true, 'Application rejected successfully', application);
    } catch (error) {
        console.error('Reject application error:', error);
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ============================================
// 7. POST /api/company/applications/bulk-reject
// ============================================

/**
 * Hinglish: Multiple applications ko bulk reject kar rahe hain
 * @desc Bulk reject applications
 * @route POST /api/company/applications/bulk-reject
 * @access Private (Company)
 */
exports.bulkRejectApplications = async (req, res) => {
    try {
        const { applicationIds, rejectionReason } = req.body;

        // Validation
        if (!Array.isArray(applicationIds) || applicationIds.length === 0) {
            return sendResponse(res, false, 'Application IDs zaroori hain', null, 400);
        }

        if (!rejectionReason || rejectionReason.length < 10 || rejectionReason.length > 500) {
            return sendResponse(
                res,
                false,
                'Rejection reason 10-500 characters ke beech hona chahiye',
                null,
                400
            );
        }

        // Applications fetch karo
        const applications = await Application.find({ _id: { $in: applicationIds } });

        if (applications.length === 0) {
            return sendResponse(res, false, 'Koi bhi application nahi mila', null, 404);
        }

        // Get company profile for ownership check
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // Check ownership - sab applications company ke hone chahiye
        for (const app of applications) {
            const project = await Project.findById(app.projectId);
            if (!project) {
                return sendResponse(res, false, 'Project nahi mila', null, 404);
            }
            if (project.companyId.toString() !== companyProfile._id.toString()) {
                return sendResponse(res, false, 'Kuch applications aapke nahi hain', null, 403);
            }
        }

        // Update all applications
        await Application.updateMany(
            { _id: { $in: applicationIds }, status: { $in: ['pending', 'shortlisted'] } },
            {
                $set: {
                    status: 'rejected',
                    rejectionReason,
                    rejectedAt: new Date(),
                },
            }
        );

        // Notify all students
        for (const app of applications) {
            if (['pending', 'shortlisted'].includes(app.status)) {
                const studentProfile = await StudentProfile.findById(app.studentId);
                if (studentProfile) {
                    const studentUser = await User.findById(studentProfile.user);
                    if (studentUser) {
                        const project = await Project.findById(app.projectId);
                        await createNotification(
                            studentUser._id,
                            'student',
                            `Your application for "${project.title}" has been rejected. Reason: ${rejectionReason}`,
                            'application_rejected',
                            app._id
                        );
                    }
                }
            }
        }

        return sendResponse(res, true, `${applicationIds.length} applications rejected`, {
            rejectedCount: applicationIds.length,
        });
    } catch (error) {
        console.error('Bulk reject error:', error);
        return sendResponse(res, false, error.message, null, 500);
    }
};

// ============================================
// 8. GET /api/company/applications/stats
// ============================================

/**
 * Hinglish: Stats dikh rahe hain company ke applications ke
 * @desc Get application statistics for company
 * @route GET /api/company/applications/stats
 * @access Private (Company)
 */
exports.getApplicationStats = async (req, res) => {
    try {
        // Get company profile
        const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
        if (!companyProfile) {
            return sendResponse(res, false, 'Company profile nahi mila', null, 404);
        }

        // Company ke sab projects
        const projects = await Project.find({ companyId: companyProfile._id });
        const projectIds = projects.map(p => p._id);

        // Stats query
        const stats = await Application.aggregate([
            {
                $match: {
                    projectId: { $in: projectIds },
                },
            },
            {
                $facet: {
                    byStatus: [
                        {
                            $group: {
                                _id: '$status',
                                count: { $sum: 1 },
                            },
                        },
                    ],
                    newToday: [
                        {
                            $match: {
                                appliedAt: {
                                    $gte: new Date(new Date().setHours(0, 0, 0, 0)),
                                },
                            },
                        },
                        {
                            $count: 'count',
                        },
                    ],
                },
            },
        ]);

        // Format response
        const byStatus = stats[0].byStatus;
        const newTodayCount = stats[0].newToday[0]?.count || 0;

        const result = {
            total: byStatus.reduce((sum, s) => sum + s.count, 0),
            pending: byStatus.find(s => s._id === 'pending')?.count || 0,
            shortlisted: byStatus.find(s => s._id === 'shortlisted')?.count || 0,
            accepted: byStatus.find(s => s._id === 'accepted')?.count || 0,
            rejected: byStatus.find(s => s._id === 'rejected')?.count || 0,
            newToday: newTodayCount,
        };

        return sendResponse(res, true, 'Application stats fetched', result);
    } catch (error) {
        console.error('Get application stats error:', error);
        return sendResponse(res, false, error.message, null, 500);
    }
};
