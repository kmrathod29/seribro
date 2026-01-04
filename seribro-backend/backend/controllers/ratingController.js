const Rating = require('../models/Rating');
const Project = require('../models/Project');
const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/companyProfile');
const sendResponse = require('../utils/students/sendResponse');
const { sendNotification } = require('../utils/notifications/sendNotification');

exports.rateStudent = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, review } = req.body;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return sendResponse(res, 400, false, 'Rating must be between 1-5');
    }

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    // Authorization check - ensure company owns project
    if (!req.user || req.user.role !== 'company') {
      return sendResponse(res, 403, false, 'Only company can rate student');
    }

    const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
    if (!companyProfile || companyProfile._id.toString() !== project.companyId?.toString()) {
      return sendResponse(res, 403, false, 'Not authorized to rate this project');
    }

    // Check project status
    if (!['completed', 'approved', 'released'].includes(project.status) && project.status !== 'completed') {
      return sendResponse(res, 400, false, 'Project must be completed before rating');
    }

    // Find or create rating document
    let ratingDoc = await Rating.findOne({ project: project._id });
    if (!ratingDoc) {
      ratingDoc = await Rating.create({ project: project._id });
    }

    // Check if already rated and if within 24 hours
    if (ratingDoc.companyRating && ratingDoc.companyRating.ratedAt) {
      const ratedAt = new Date(ratingDoc.companyRating.ratedAt);
      const now = new Date();
      const diffHours = (now - ratedAt) / (1000 * 60 * 60);
      
      if (diffHours >= 24) {
        return sendResponse(res, 400, false, 'Editing window closed (24 hours expired)');
      }
      
      // Update existing rating
      await ratingDoc.updateCompanyRating(rating, review || '');
    } else {
      // Add new rating
      await ratingDoc.addCompanyRating(rating, review || '', req.user._id);
    }

    // Update student profile rating
    const studentProfile = await StudentProfile.findById(project.assignedStudent || project.selectedStudentId);
    if (studentProfile) {
      await studentProfile.updateRating(rating);
      await sendNotification(
        studentProfile.user,
        'student',
        `Company rated you ${rating}★ for project "${project.title}"`,
        'rating_received',
        'project',
        project._id
      );
    }

    // Check if both parties have rated
    await ratingDoc.checkBothRated();
    if (ratingDoc.bothRated) {
      project.ratingCompleted = true;
      await project.save();
    }

    return sendResponse(res, 200, true, 'Rating submitted successfully', {
      rating: ratingDoc,
      studentNewRating: studentProfile?.ratings?.averageRating || null
    });

  } catch (error) {
    console.error('rateStudent error:', error);
    console.error('Error stack:', error.stack);
    return sendResponse(res, 500, false, 'Failed to submit rating', null, error.message);
  }
};

exports.rateCompany = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, review } = req.body;
    
    // Validation
    if (!rating || rating < 1 || rating > 5) {
      return sendResponse(res, 400, false, 'Rating must be between 1-5');
    }

    // Find project
    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    // Authorization check - ensure student worked on this project
    if (!req.user || req.user.role !== 'student') {
      return sendResponse(res, 403, false, 'Only student can rate company');
    }

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile || studentProfile._id.toString() !== (project.assignedStudent || project.selectedStudentId)?.toString()) {
      return sendResponse(res, 403, false, 'Not authorized to rate this project');
    }

    // Check project status
    if (!['completed', 'approved', 'released'].includes(project.status) && project.status !== 'completed') {
      return sendResponse(res, 400, false, 'Project must be completed before rating');
    }

    // Find or create rating document
    let ratingDoc = await Rating.findOne({ project: project._id });
    if (!ratingDoc) {
      ratingDoc = await Rating.create({ project: project._id });
    }

    // Check if already rated and if within 24 hours
    if (ratingDoc.studentRating && ratingDoc.studentRating.ratedAt) {
      const ratedAt = new Date(ratingDoc.studentRating.ratedAt);
      const now = new Date();
      const diffHours = (now - ratedAt) / (1000 * 60 * 60);
      
      if (diffHours >= 24) {
        return sendResponse(res, 400, false, 'Editing window closed (24 hours expired)');
      }
      
      // Update existing rating
      await ratingDoc.updateStudentRating(rating, review || '');
    } else {
      // Add new rating
      await ratingDoc.addStudentRating(rating, review || '', req.user._id);
    }

    // Update company profile rating
    const companyProfile = await CompanyProfile.findById(project.companyId);
    if (companyProfile) {
      await companyProfile.updateRating(rating);
      await sendNotification(
        companyProfile.user,
        'company',
        `Student rated your company ${rating}★ for project "${project.title}"`,
        'rating_received',
        'project',
        project._id
      );
    }

    // Check if both parties have rated
    await ratingDoc.checkBothRated();
    if (ratingDoc.bothRated) {
      project.ratingCompleted = true;
      await project.save();
    }

    return sendResponse(res, 200, true, 'Rating submitted successfully', {
      rating: ratingDoc,
      companyNewRating: companyProfile?.ratings?.averageRating || null
    });

  } catch (error) {
    console.error('rateCompany error:', error);
    console.error('Error stack:', error.stack);
    return sendResponse(res, 500, false, 'Failed to submit rating', null, error.message);
  }
};

exports.getProjectRating = async (req, res) => {
  try {
    const { projectId } = req.params;

    // Validate projectId
    if (!projectId) {
      return sendResponse(res, 400, false, 'Project ID is required');
    }

    // Find rating document
    const ratingDoc = await Rating.findOne({ project: projectId })
      .populate('project', 'title status')
      .lean();

    if (!ratingDoc) {
      return sendResponse(res, 200, true, 'No ratings yet for this project', {
        rating: null,
        hasStudentRating: false,
        hasCompanyRating: false
      });
    }

    // Format response
    const response = {
      rating: ratingDoc,
      hasStudentRating: !!(ratingDoc.studentRating && ratingDoc.studentRating.ratedAt),
      hasCompanyRating: !!(ratingDoc.companyRating && ratingDoc.companyRating.ratedAt),
      bothRated: ratingDoc.bothRated || false
    };

    return sendResponse(res, 200, true, 'Rating fetched successfully', response);

  } catch (error) {
    console.error('getProjectRating error:', error);
    console.error('Error stack:', error.stack);
    return sendResponse(res, 500, false, 'Failed to fetch rating', null, error.message);
  }
};

exports.getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;

    if (!userId) {
      return sendResponse(res, 400, false, 'User ID is required');
    }

    // Find student or company profile
    const student = await StudentProfile.findOne({ user: userId });
    const company = await CompanyProfile.findOne({ user: userId });

    if (!student && !company) {
      return sendResponse(res, 404, false, 'User profile not found');
    }

    // Find all ratings given by this user
    const ratings = await Rating.find({
      $or: [
        { 'studentRating.ratedBy': userId },
        { 'companyRating.ratedBy': userId }
      ]
    })
    .populate('project', 'title status')
    .lean();

    return sendResponse(res, 200, true, 'User ratings fetched successfully', {
      ratings,
      totalRatingsGiven: ratings.length
    });

  } catch (error) {
    console.error('getUserRatings error:', error);
    console.error('Error stack:', error.stack);
    return sendResponse(res, 500, false, 'Failed to fetch user ratings', null, error.message);
  }
};

// GET /api/student/ratings - Get all ratings received by student
exports.getStudentRatings = async (req, res) => {
  try {
    // Find student profile
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) {
      return sendResponse(res, 404, false, 'Student profile not found');
    }

    // Find all ratings where company rated this student
    const ratings = await Rating.find({ 
      'companyRating.ratedAt': { $exists: true } 
    })
    .populate({
      path: 'project',
      select: 'title companyId assignedStudent selectedStudentId',
      populate: { 
        path: 'companyId', 
        select: 'companyName logoUrl' 
      }
    })
    .lean();

    // Filter for ratings on this student's projects
    const studentRatings = ratings
      .filter(r => {
        if (!r.project) return false;
        const assignedId = r.project.assignedStudent?.toString() || r.project.selectedStudentId?.toString();
        return assignedId === studentProfile._id.toString();
      })
      .map(r => ({
        _id: r._id,
        rating: r.companyRating?.rating || 0,
        review: r.companyRating?.review || '',
        ratedAt: r.companyRating?.ratedAt,
        projectName: r.project?.title || 'Unknown Project',
        projectId: r.project?._id,
        raterName: r.project?.companyId?.companyName || 'Company',
        raterLogo: r.project?.companyId?.logoUrl || null
      }))
      .sort((a, b) => new Date(b.ratedAt) - new Date(a.ratedAt));

    return sendResponse(res, 200, true, 'Student ratings fetched successfully', {
      ratings: studentRatings,
      totalRatings: studentRatings.length,
      averageRating: studentProfile.ratings?.averageRating || 0
    });

  } catch (error) {
    console.error('getStudentRatings error:', error);
    console.error('Error stack:', error.stack);
    return sendResponse(res, 500, false, 'Failed to fetch student ratings', null, error.message);
  }
};

// GET /api/company/ratings - Get all ratings received by company
exports.getCompanyRatings = async (req, res) => {
  try {
    // Find company profile
    const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
    if (!companyProfile) {
      return sendResponse(res, 404, false, 'Company profile not found');
    }

    // Find all ratings where student rated this company
    const ratings = await Rating.find({ 
      'studentRating.ratedAt': { $exists: true } 
    })
    .populate({
      path: 'project',
      select: 'title selectedStudentId assignedStudent companyId',
      populate: { 
        path: 'selectedStudentId assignedStudent', 
        select: 'basicInfo' 
      }
    })
    .lean();

    // Filter for ratings on this company's projects
    const companyRatings = ratings
      .filter(r => {
        if (!r.project) return false;
        return r.project.companyId?.toString() === companyProfile._id.toString();
      })
      .map(r => ({
        _id: r._id,
        rating: r.studentRating?.rating || 0,
        review: r.studentRating?.review || '',
        ratedAt: r.studentRating?.ratedAt,
        projectName: r.project?.title || 'Unknown Project',
        projectId: r.project?._id,
        raterName: (r.project?.selectedStudentId?.basicInfo?.fullName || 
                    r.project?.assignedStudent?.basicInfo?.fullName || 
                    'Student')
      }))
      .sort((a, b) => new Date(b.ratedAt) - new Date(a.ratedAt));

    return sendResponse(res, 200, true, 'Company ratings fetched successfully', {
      ratings: companyRatings,
      totalRatings: companyRatings.length,
      averageRating: companyProfile.ratings?.averageRating || 0
    });

  } catch (error) {
    console.error('getCompanyRatings error:', error);
    console.error('Error stack:', error.stack);
    return sendResponse(res, 500, false, 'Failed to fetch company ratings', null, error.message);
  }
};