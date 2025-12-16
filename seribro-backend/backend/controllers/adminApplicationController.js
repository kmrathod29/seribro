// backend/controllers/adminApplicationController.js
// Hinglish: Admin application monitoring controller - sabhi applications dekho, student profile dekho

const Application = require('../models/Application');
const Project = require('../models/Project');
const Company = require('../models/companyProfile');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');

/**
 * Hinglish: Consistent response format
 */
const sendResponse = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ success, message, data });
};

/**
 * Hinglish: Applications ke stats nikalo
 * @desc Get application statistics
 * @route GET /api/admin/applications/stats
 * @access Private (Admin)
 */
exports.getApplicationStats = async (req, res) => {
  try {
    const total = await Application.countDocuments();

    // Hinglish: Status ke basis par count karo
    const stats = await Application.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Hinglish: Stats ko organize karo
    const statsMap = {
      pending: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };

    stats.forEach(stat => {
      if (statsMap.hasOwnProperty(stat._id)) {
        statsMap[stat._id] = stat.count;
      }
    });

    // Hinglish: Aaj ke applications count karo
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const applicationsToday = await Application.countDocuments({
      createdAt: { $gte: today }
    });

    return sendResponse(res, true, 'Stats fetched successfully', {
      total,
      byStatus: statsMap,
      applicationsToday
    });
  } catch (error) {
    console.error('Error getting application stats:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Sabhi applications nikalo filters aur pagination ke saath
 * @desc Get all applications with filters and pagination
 * @route GET /api/admin/applications/all
 * @access Private (Admin)
 */
exports.getAllApplications = async (req, res) => {
  try {
    const {
      projectId,
      studentUserId,
      status,
      companyId,
      page = 1,
      limit = 20
    } = req.query;

    // Hinglish: Filter banao
    const filter = {};

    if (projectId) {
      filter.projectId = projectId;
    }
    if (studentUserId) {
      filter.student = studentUserId;
    }
    if (status) {
      filter.status = status;
    }

    // Hinglish: Agar company filter hai to project se match karo
    if (companyId) {
      const companyProjects = await Project.find({ companyId }).select('_id');
      filter.projectId = { $in: companyProjects.map(p => p._id) };
    }

    // Hinglish: Pagination setup
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Hinglish: Applications nikalo (populate project, company and student basic info)
    const applications = await Application.find(filter)
      .populate('projectId', 'title budget')
      .populate('companyId', 'name logo')
      .populate('studentId', 'basicInfo.collegeName basicInfo.fullName')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Hinglish: Skill match calculate karo aur missing student fields fill karo
    const applicationsWithMatch = applications.map(app => {
      const skillMatch = app.skillMatch || 0;

      // Prefer cached snapshot/name, then populated student basic info, then fallback to 'Unknown'
      const resolvedStudentName = app.studentName || app.studentSnapshot?.name || app.studentId?.basicInfo?.fullName || 'Unknown';
      const resolvedStudentCollege = app.studentCollege || app.studentSnapshot?.collegeName || app.studentId?.basicInfo?.collegeName || 'N/A';

      return {
        ...app,
        skillMatch,
        studentName: resolvedStudentName,
        studentCollege: resolvedStudentCollege,
      };
    });

    const total = await Application.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    return sendResponse(res, true, 'Applications fetched successfully', {
      applications: applicationsWithMatch,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error getting applications:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Single application ka full details dekho - student ka PURA profile lao
 * @desc Get application details with full student profile
 * @route GET /api/admin/applications/:applicationId
 * @access Private (Admin)
 */
exports.getApplicationDetails = async (req, res) => {
  try {
    const { applicationId } = req.params;

    // Hinglish: Application nikalo
    const application = await Application.findById(applicationId)
      .populate('projectId')
      .populate('companyId')
      .lean();

    if (!application) {
      return sendResponse(res, false, 'Application nahi mila', null, 404);
    }

    // PART 1: Student ka PURA profile nikalo - projects array include karo with proper document URLs
    const studentProfile = await StudentProfile.findById(application.studentId || application.studentUserId)
      .select('basicInfo.fullName basicInfo.email basicInfo.phone basicInfo.collegeName skills.technical skills.soft skills.languages projects documents.resume.url documents.resume.public_id documents.collegeId.url documents.collegeId.public_id documents.certificates')
      .lean();

    // PART 1: Format documents with proper URLs
    const formattedStudentProfile = studentProfile ? {
      name: studentProfile.basicInfo?.fullName || application.studentName || 'Unknown',
      email: studentProfile.basicInfo?.email || application.studentEmail || 'N/A',
      phone: studentProfile.basicInfo?.phone || 'N/A',
      college: studentProfile.basicInfo?.collegeName || application.studentCollege || 'N/A',
      skills: [
        ...(studentProfile.skills?.technical || []),
        ...(studentProfile.skills?.soft || []),
        ...(studentProfile.skills?.languages || []),
      ],
      projects: studentProfile.projects || [],
      resume: {
        url: studentProfile.documents?.resume?.url || studentProfile.documents?.resume?.path || '',
        public_id: studentProfile.documents?.resume?.public_id || '',
      },
      collegeId: {
        url: studentProfile.documents?.collegeId?.url || studentProfile.documents?.collegeId?.path || '',
        public_id: studentProfile.documents?.collegeId?.public_id || '',
      },
      certificates: (studentProfile.documents?.certificates || []).map(cert => ({
        url: cert.url || cert.path || '',
        public_id: cert.public_id || '',
        filename: cert.filename || '',
        title: cert.title || '',
      })),
    } : {
      name: application.studentName || 'Unknown',
      email: application.studentEmail || 'N/A',
      phone: 'N/A',
      college: application.studentCollege || 'N/A',
      skills: application.studentSkills || [],
      projects: [],
      resume: { url: '', public_id: '' },
      collegeId: { url: '', public_id: '' },
      certificates: [],
    };

    return sendResponse(res, true, 'Application details fetched', {
      application,
      project: application.projectId,
      company: application.companyId,
      studentProfile: formattedStudentProfile,
    });
  } catch (error) {
    console.error('Error getting application details:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};
