// backend/controllers/adminProjectController.js
// Hinglish: Admin project monitoring controller - sabhi projects dekho, stats dekho

const Project = require('../models/Project');
const Company = require('../models/companyProfile');
const Application = require('../models/Application');

/**
 * Hinglish: Consistent response format
 */
const sendResponse = (res, success, message, data = null, status = 200) => {
  return res.status(status).json({ 
    success, 
    message: String(message || 'Operation completed'), 
    data 
  });
};

/**
 * Hinglish: Projects ke stats nikalo - total, by status, etc
 * @desc Get project statistics
 * @route GET /api/admin/projects/stats
 * @access Private (Admin)
 */
exports.getProjectStats = async (req, res) => {
  try {
    // Hinglish: Total projects count karo
    const total = await Project.countDocuments({ isDeleted: false });

    // Hinglish: Status ke basis par count karo
    const stats = await Project.aggregate([
      {
        $match: { isDeleted: false }
      },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    // Hinglish: Stats ko organize karo
    const statsMap = {
      open: 0,
      assigned: 0,
      'in-progress': 0,
      completed: 0,
      closed: 0
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
    console.error('Error getting project stats:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Sabhi projects nikalo filters aur pagination ke saath
 * @desc Get all projects with filters and pagination
 * @route GET /api/admin/projects/all
 * @access Private (Admin)
 */
exports.getAllProjects = async (req, res) => {
  try {
    const {
      status,
      companyId,
      startDate,
      endDate,
      minBudget,
      maxBudget,
      page = 1,
      limit = 20
    } = req.query;

    // Hinglish: Filter object banao
    const filter = { isDeleted: false };

    if (status) {
      filter.status = status;
    }

    if (companyId) {
      filter.companyId = companyId;
    }

    // Hinglish: Date range filter
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) {
        filter.createdAt.$gte = new Date(startDate);
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        filter.createdAt.$lte = end;
      }
    }

    // Hinglish: Budget range filter
    if (minBudget || maxBudget) {
      // Hinglish: Agar budget range diya to check karo ki woh range mein ho
      filter.$or = [
        {
          budgetMin: {
            ...(minBudget && { $gte: parseInt(minBudget) }),
            ...(maxBudget && { $lte: parseInt(maxBudget) })
          }
        },
        {
          budgetMax: {
            ...(minBudget && { $gte: parseInt(minBudget) }),
            ...(maxBudget && { $lte: parseInt(maxBudget) })
          }
        }
      ];
    }

    // Hinglish: Pagination setup karo
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Hinglish: Projects nikalo aur company data populate karo
    const projects = await Project.find(filter)
      .populate('companyId', 'name email logo')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Hinglish: Har project ke liye application stats nikalo
    const projectsWithStats = await Promise.all(
      projects.map(async (project) => {
        const appStats = await Application.aggregate([
          { $match: { projectId: project._id } },
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 }
            }
          }
        ]);

        const applicationStats = {
          total: 0,
          pending: 0,
          shortlisted: 0,
          accepted: 0,
          rejected: 0
        };

        appStats.forEach(stat => {
          if (applicationStats.hasOwnProperty(stat._id)) {
            applicationStats[stat._id] = stat.count;
          }
          applicationStats.total += stat.count;
        });

        return {
          ...project,
          applicationStats
        };
      })
    );

    const total = await Project.countDocuments(filter);
    const totalPages = Math.ceil(total / limitNum);

    return sendResponse(res, true, 'Projects fetched successfully', {
      projects: projectsWithStats,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error getting projects:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Single project ka detailed view dekho
 * @desc Get project details
 * @route GET /api/admin/projects/:projectId
 * @access Private (Admin)
 */
exports.getProjectDetails = async (req, res) => {
  try {
    const { projectId } = req.params;

    const project = await Project.findById(projectId)
      .populate('companyId', 'companyName officeAddress.city officeAddress.state email logo industryType')
      .lean();

    if (!project) {
      return sendResponse(res, false, 'Project nahi mila', null, 404);
    }

    // Hinglish: Application stats nikalo
    const appStats = await Application.aggregate([
      { $match: { projectId: project._id } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const applicationStats = {
      total: 0,
      pending: 0,
      shortlisted: 0,
      accepted: 0,
      rejected: 0
    };

    appStats.forEach(stat => {
      if (applicationStats.hasOwnProperty(stat._id)) {
        applicationStats[stat._id] = stat.count;
      }
      applicationStats.total += stat.count;
    });

    return sendResponse(res, true, 'Project details fetched', {
      project,
      company: project.companyId, // Explicitly pass company data
      applicationStats
    });
  } catch (error) {
    console.error('Error getting project details:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};

/**
 * Hinglish: Specific project ke applications dekho
 * @desc Get project applications
 * @route GET /api/admin/projects/:projectId/applications
 * @access Private (Admin)
 */
exports.getProjectApplications = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 20;
    const skip = (pageNum - 1) * limitNum;

    // Hinglish: Project check karo exist karta hai ya nahi
    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, false, 'Project nahi mila', null, 404);
    }

    // Hinglish: Applications nikalo aur student data populate karo
    const applications = await Application.find({ projectId })
      .populate('student', 'basicInfo.fullName basicInfo.collegeName basicInfo.location')
      .sort({ appliedAt: -1 })
      .skip(skip)
      .limit(limitNum)
      .lean();

    // Hinglish: Har application ke liye student data extract karo
    const enrichedApplications = applications.map(app => {
      // Try to get student name from different sources (priority order)
      const studentName = 
        app.studentSnapshot?.name || 
        app.studentData?.fullName || 
        app.student?.basicInfo?.fullName || 
        app.studentName || 
        'Unknown';

      // Try to get college name from different sources (priority order)
      const studentCollege = 
        app.studentSnapshot?.collegeName || 
        app.studentData?.college || 
        app.student?.basicInfo?.collegeName || 
        app.studentCollege || 
        'N/A';

      return {
        ...app,
        // Override with enriched data
        studentName,
        studentCollege,
        studentCity: app.studentSnapshot?.city || app.studentData?.city || app.student?.basicInfo?.location || ''
      };
    });

    const total = await Application.countDocuments({ projectId });
    const totalPages = Math.ceil(total / limitNum);

    return sendResponse(res, true, 'Applications fetched', {
      applications: enrichedApplications,
      pagination: {
        total,
        page: pageNum,
        limit: limitNum,
        pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error getting project applications:', error);
    return sendResponse(res, false, error.message, null, 500);
  }
};
