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

    await ratingDoc.addCompanyRating(rating, review || '', req.user._id);

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

    await ratingDoc.addStudentRating(rating, review || '', req.user._id);

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