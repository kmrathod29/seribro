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
    if (!rating || rating < 1 || rating > 5) return sendResponse(res, false, 'Rating must be 1-5', null, 400);

    const project = await Project.findById(projectId);
    if (!project) return sendResponse(res, false, 'Project not found', null, 404);
    // ensure company owns project
    if (!req.user || req.user.role !== 'company') return sendResponse(res, false, 'Only company can rate student', null, 403);

    const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
    if (!companyProfile || companyProfile._id.toString() !== project.companyId?.toString()) return sendResponse(res, false, 'Not authorized', null, 403);

    if (!['completed','approved','released'].includes(project.status) && project.status !== 'completed') return sendResponse(res, false, 'Project not in completed state', null, 400);

    let ratingDoc = await Rating.findOne({ project: project._id });
    if (!ratingDoc) ratingDoc = await Rating.create({ project: project._id });

    // Check if already rated and if within 24 hours
    if (ratingDoc.companyRating && ratingDoc.companyRating.ratedAt) {
      const ratedAt = new Date(ratingDoc.companyRating.ratedAt);
      const now = new Date();
      const diffHours = (now - ratedAt) / (1000 * 60 * 60);
      
      if (diffHours >= 24) {
        return sendResponse(res, false, 'Editing window closed (24 hours)', null, 400);
      }
      
      // Update existing rating
      await ratingDoc.updateCompanyRating(rating, review || '');
    } else {
      // Add new rating
      await ratingDoc.addCompanyRating(rating, review || '', req.user._id);
    }

    // Update student profile
    const studentProfile = await StudentProfile.findById(project.assignedStudent || project.selectedStudentId);
    if (studentProfile) {
      await studentProfile.updateRating(rating);
      await sendNotification(studentProfile.user, 'student', `Company rated you ${rating}★ for project ${project.title}`, 'rating_received', 'project', project._id);
    }

    // Mark project rating if both rated
    await ratingDoc.checkBothRated();
    if (ratingDoc.bothRated) {
      project.ratingCompleted = true;
      await project.save();
    }

    return sendResponse(res, true, 'Rating submitted successfully', { rating: ratingDoc, studentNewRating: studentProfile?.ratings?.averageRating || null });
  } catch (error) {
    console.error('rateStudent error:', error);
    return sendResponse(res, false, 'Failed to submit rating', null, 500);
  }
};

exports.rateCompany = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { rating, review } = req.body;
    if (!rating || rating < 1 || rating > 5) return sendResponse(res, false, 'Rating must be 1-5', null, 400);

    const project = await Project.findById(projectId);
    if (!project) return sendResponse(res, false, 'Project not found', null, 404);
    if (!req.user || req.user.role !== 'student') return sendResponse(res, false, 'Only student can rate company', null, 403);

    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile || studentProfile._id.toString() !== (project.assignedStudent || project.selectedStudentId)?.toString()) return sendResponse(res, false, 'Not authorized', null, 403);

    if (!['completed','approved','released'].includes(project.status) && project.status !== 'completed') return sendResponse(res, false, 'Project not in completed state', null, 400);

    let ratingDoc = await Rating.findOne({ project: project._id });
    if (!ratingDoc) ratingDoc = await Rating.create({ project: project._id });

    // Check if already rated and if within 24 hours
    if (ratingDoc.studentRating && ratingDoc.studentRating.ratedAt) {
      const ratedAt = new Date(ratingDoc.studentRating.ratedAt);
      const now = new Date();
      const diffHours = (now - ratedAt) / (1000 * 60 * 60);
      
      if (diffHours >= 24) {
        return sendResponse(res, false, 'Editing window closed (24 hours)', null, 400);
      }
      
      // Update existing rating
      await ratingDoc.updateStudentRating(rating, review || '');
    } else {
      // Add new rating
      await ratingDoc.addStudentRating(rating, review || '', req.user._id);
    }

    const companyProfile = await CompanyProfile.findById(project.companyId);
    if (companyProfile) {
      await companyProfile.updateRating(rating);
      await sendNotification(companyProfile.user, 'company', `Student rated your company ${rating}★ for project ${project.title}`, 'rating_received', 'project', project._id);
    }

    await ratingDoc.checkBothRated();
    if (ratingDoc.bothRated) {
      project.ratingCompleted = true;
      await project.save();
    }

    return sendResponse(res, true, 'Rating submitted successfully', { rating: ratingDoc, companyNewRating: companyProfile?.ratings?.averageRating || null });
  } catch (error) {
    console.error('rateCompany error:', error);
    return sendResponse(res, false, 'Failed to submit rating', null, 500);
  }
};

exports.getProjectRating = async (req, res) => {
  try {
    const { projectId } = req.params;
    const ratingDoc = await Rating.findOne({ project: projectId });
    if (!ratingDoc) return sendResponse(res, true, 'No ratings yet', { rating: null });
    return sendResponse(res, true, 'Rating fetched', { rating: ratingDoc });
  } catch (error) {
    console.error('getProjectRating error:', error);
    return sendResponse(res, false, 'Failed to fetch rating', null, 500);
  }
};

exports.getUserRatings = async (req, res) => {
  try {
    const { userId } = req.params;
    // Find studentProfile or companyProfile
    const student = await StudentProfile.findOne({ user: userId });
    const company = await CompanyProfile.findOne({ user: userId });

    let ratings = [];
    if (student) ratings = await Rating.find({ $or: [ { 'studentRating.ratedBy': userId }, { 'companyRating.ratedBy': userId } ] });
    if (company) ratings = await Rating.find({ $or: [ { 'studentRating.ratedBy': userId }, { 'companyRating.ratedBy': userId } ] });

    return sendResponse(res, true, 'Ratings fetched', { ratings });
  } catch (error) {
    console.error('getUserRatings error:', error);
    return sendResponse(res, false, 'Failed to fetch user ratings', null, 500);
  }
};

// GET /api/student/ratings - Get all ratings received by student
exports.getStudentRatings = async (req, res) => {
  try {
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) return sendResponse(res, 404, false, 'Student profile not found');

    // Find all ratings where company rated this student
    const ratings = await Rating.find({ 'companyRating.ratedAt': { $exists: true } })
      .populate({
        path: 'project',
        select: 'title companyId',
        populate: { path: 'companyId', select: 'companyName' }
      })
      .lean();

    // Filter for ratings on this student's projects
    const studentRatings = ratings
      .filter(r => r.project && r.project.companyId)
      .map(r => ({
        _id: r._id,
        rating: r.companyRating?.rating || 0,
        review: r.companyRating?.review || '',
        ratedAt: r.companyRating?.ratedAt,
        projectName: r.project?.title,
        projectId: r.project?._id,
        raterName: r.project?.companyId?.companyName || 'Company'
      }))
      .sort((a, b) => new Date(b.ratedAt) - new Date(a.ratedAt));

    return sendResponse(res, true, 'Student ratings fetched', studentRatings);
  } catch (error) {
    console.error('getStudentRatings error:', error);
    return sendResponse(res, false, 'Failed to fetch student ratings', null, 500);
  }
};

// GET /api/company/ratings - Get all ratings received by company
exports.getCompanyRatings = async (req, res) => {
  try {
    const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
    if (!companyProfile) return sendResponse(res, 404, false, 'Company profile not found');

    // Find all ratings where student rated this company
    const ratings = await Rating.find({ 'studentRating.ratedAt': { $exists: true } })
      .populate({
        path: 'project',
        select: 'title selectedStudentId',
        populate: { path: 'selectedStudentId', select: 'basicInfo' }
      })
      .lean();

    // Filter for ratings on this company's projects
    const companyRatings = ratings
      .filter(r => r.project && r.project.selectedStudentId)
      .map(r => ({
        _id: r._id,
        rating: r.studentRating?.rating || 0,
        review: r.studentRating?.review || '',
        ratedAt: r.studentRating?.ratedAt,
        projectName: r.project?.title,
        projectId: r.project?._id,
        raterName: r.project?.selectedStudentId?.basicInfo?.fullName || 'Student'
      }))
      .sort((a, b) => new Date(b.ratedAt) - new Date(a.ratedAt));

    return sendResponse(res, true, 'Company ratings fetched', companyRatings);
  } catch (error) {
    console.error('getCompanyRatings error:', error);
    return sendResponse(res, false, 'Failed to fetch company ratings', null, 500);
  }
};