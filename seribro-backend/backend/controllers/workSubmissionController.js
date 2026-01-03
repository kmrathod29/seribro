// backend/controllers/workSubmissionController.js
const Project = require('../models/Project');
const Company = require('../models/Company');
const CompanyProfile = require('../models/companyProfile');
const User = require('../models/User');
const StudentProfile = require('../models/StudentProfile');
const sendEmail = require('../utils/sendEmail');
const { sendNotification, sendAdminNotification } = require('../utils/notifications/sendNotification');
const { uploadWorkFilesToCloudinary } = require('../utils/workspace/uploadWorkToCloudinary');
const { validateWorkspaceAccess } = require('../utils/workspace/validateWorkspaceAccess');
const sendResponse = require('../utils/students/sendResponse');
const Payment = require('../models/Payment');

// POST /api/workspace/projects/:projectId/start-work
exports.startWork = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const access = await validateWorkspaceAccess(project, req.user);
    if (!access.hasAccess || access.role !== 'student') return sendResponse(res, 403, false, access.error || 'Access denied');

    if (project.status !== 'assigned') return sendResponse(res, 400, false, 'Cannot start work in current project status');

    await project.startWork();

    // Notify company
    const company = await Company.findById(project.companyId);
    if (company && company.user) {
      const companyUser = await User.findById(company.user);
      await sendNotification(companyUser._id, 'company', `Student has started work on project ${project.title}`, 'project-started', 'project', project._id);
      try {
        if (companyUser && companyUser.email && process.env.EMAIL_NOTIFY_ON_SUBMISSION !== 'false') {
          await sendEmail({ email: companyUser.email, subject: 'Student started work', message: `<p>Student has started work on project <strong>${project.title}</strong>.</p>` });
        }
      } catch (e) {
        console.warn('Email send failed for startWork:', e.message);
      }
    }

    return sendResponse(res, 200, true, 'Work started successfully', { project: { _id: project._id, status: project.status, startedAt: project.startedAt } });
  } catch (error) {
    console.error('❌ startWork error:', error);
    return sendResponse(res, 500, false, 'Server error while starting work', null, error.message);
  }
};

// POST /api/workspace/projects/:projectId/submit-work
exports.submitWork = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const access = await validateWorkspaceAccess(project, req.user);
    if (!access.hasAccess || access.role !== 'student') return sendResponse(res, 403, false, access.error || 'Access denied');

    if (!['in-progress', 'revision-requested'].includes(project.status)) return sendResponse(res, 400, false, 'Cannot submit work at this stage');

    // Parse links if provided (JSON string)
    let links = [];
    if (req.body.links) {
      try {
        links = typeof req.body.links === 'string' ? JSON.parse(req.body.links) : req.body.links;
        if (!Array.isArray(links)) links = [];
      } catch (err) {
        return sendResponse(res, 400, false, 'Invalid links format');
      }
    }

    // Validate files/links presence
    const filesProvided = Array.isArray(req.files) && req.files.length > 0;
    const linksProvided = Array.isArray(links) && links.length > 0;
    if (!filesProvided && !linksProvided) return sendResponse(res, 400, false, 'Provide at least one file or one external link');

    // Additional server-side validation: files count and sizes
    if (filesProvided) {
      if (req.files.length > Number(process.env.WORK_MAX_FILES || 10)) return sendResponse(res, 400, false, 'Too many files');
      for (const f of req.files) {
        if (f.size > Number(process.env.WORK_MAX_FILE_SIZE_MB || 100) * 1024 * 1024) return sendResponse(res, 400, false, `File too large: ${f.originalname}`);
      }
    }

    // Upload files to Cloudinary
    let uploadedFiles = [];
    if (filesProvided) {
      try {
        uploadedFiles = await uploadWorkFilesToCloudinary(req.files, projectId);
      } catch (err) {
        console.error('UploadWorkFiles error:', err);
        return sendResponse(res, 500, false, 'Failed to upload files', null, err.message);
      }
    }

    const submissionData = {
      files: uploadedFiles,
      links,
      message: (req.body.message || '').toString().slice(0, 2000),
    };

    // Find student profile for submittedBy
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (!studentProfile) return sendResponse(res, 404, false, 'Student profile not found');

    const { submission, project: updated } = await project.submitWork(submissionData, studentProfile._id);

    // Increment message count and update lastActivity
    updated.messageCount = (updated.messageCount || 0) + 1;
    await updated.updateLastActivity();

    // Notify company
    const company = await Company.findById(updated.companyId);
    if (company && company.user) {
      const companyUser = await User.findById(company.user);
      await sendNotification(companyUser._id, 'company', `Student submitted work for project ${updated.title}`, 'work-submitted', 'project', updated._id);
      try {
        if (companyUser && companyUser.email && process.env.EMAIL_NOTIFY_ON_SUBMISSION !== 'false') {
          await sendEmail({ email: companyUser.email, subject: 'Work submitted for review', message: `<p>Student submitted work for project <strong>${updated.title}</strong>. Please review.</p>` });
        }
      } catch (e) {
        console.warn('Email send failed for submitWork:', e.message);
      }
    }

    return sendResponse(res, 200, true, 'Work submitted successfully. Company will review your submission.', { submission, project: { _id: updated._id, status: updated.status, currentSubmission: updated.currentSubmission, revisionCount: updated.revisionCount, maxRevisionsAllowed: updated.maxRevisionsAllowed } });
  } catch (error) {
    console.error('❌ submitWork error:', error);
    return sendResponse(res, 500, false, 'Server error while submitting work', null, error.message);
  }
};

// GET /api/workspace/projects/:projectId/submissions
exports.getSubmissionHistory = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('submissions.submittedBy submissions.reviewedBy');
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const access = await validateWorkspaceAccess(project, req.user);
    if (!access.hasAccess) return sendResponse(res, 403, false, access.error || 'Access denied');

    const submissions = (project.submissions || []).slice().sort((a, b) => b.version - a.version);

    return sendResponse(res, 200, true, 'Submissions fetched successfully', { submissions, revisionHistory: project.revisionHistory || [], revisionCount: project.revisionCount || 0, maxRevisionsAllowed: project.maxRevisionsAllowed || Number(process.env.MAX_SUBMISSION_REVISIONS || 2), currentSubmission: project.currentSubmission || null });
  } catch (error) {
    console.error('❌ getSubmissionHistory error:', error);
    return sendResponse(res, 500, false, 'Server error fetching submissions', null, error.message);
  }
};

// GET /api/workspace/projects/:projectId/submissions/current
exports.getCurrentSubmission = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId).populate('submissions.submittedBy submissions.reviewedBy');
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const access = await validateWorkspaceAccess(project, req.user);
    if (!access.hasAccess) return sendResponse(res, 403, false, access.error || 'Access denied');

    const currentId = project.currentSubmission && project.currentSubmission.submissionId;
    const submission = currentId ? project.submissions.id(currentId) : null;

    const isCompany = req.user.role === 'company' && access.role === 'company';
    const isStudent = req.user.role === 'student' && access.role === 'student';

    const canRequestRevision = isCompany && project.status === 'under-review' && (project.revisionCount < project.maxRevisionsAllowed);
    const canApprove = isCompany && project.status === 'under-review';
    const canResubmit = isStudent && project.status === 'revision-requested';

    return sendResponse(res, 200, true, 'Current submission fetched', { submission, canRequestRevision, canApprove, canResubmit });
  } catch (error) {
    console.error('❌ getCurrentSubmission error:', error);
    return sendResponse(res, 500, false, 'Server error fetching current submission', null, error.message);
  }
};

// POST /api/workspace/projects/:projectId/approve
exports.approveWork = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { feedback } = req.body;

    const project = await Project.findById(projectId);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const access = await validateWorkspaceAccess(project, req.user);
    if (!access.hasAccess || access.role !== 'company') return sendResponse(res, 403, false, access.error || 'Access denied');

    // Only allow approval when status is 'under-review' (work is submitted and waiting for review)
    // The approveWork method will change status to 'completed' and set completedAt timestamp
    if (project.status !== 'under-review') {
      return sendResponse(res, 400, false, 'No submission under review. Project status must be "under-review" to approve.');
    }

    // Approve work - this sets status to 'completed' and completedAt timestamp atomically
    // The approveWork method internally calls save(), so the status change is persisted
    const { submission, project: updated } = await project.approveWork(req.user._id, (feedback || '').toString().slice(0, 2000));

    // Reload project to ensure we have the latest status (should be 'completed' now)
    const refreshedProject = await Project.findById(projectId);
    if (!refreshedProject) {
      console.error('Project not found after approval - this should not happen');
      return sendResponse(res, 500, false, 'Error verifying project status after approval');
    }

    // Update lastActivity
    await refreshedProject.updateLastActivity();

    // ========== PHASE 2: Auto-create Payment Record ==========
    // Get student and company profiles for payment creation
    const studentProfile = await StudentProfile.findById(submission.submittedBy);
    const companyProfile = await CompanyProfile.findOne({ user: refreshedProject.company }) || 
                           await CompanyProfile.findOne({ company: refreshedProject.companyId });

    if (studentProfile && companyProfile) {
      try {
        // Check if payment already exists
        let payment = await Payment.findById(refreshedProject.payment);
        
        if (!payment) {
          // Auto-create Payment record after work approval
          const paymentAmount = refreshedProject.paymentAmount || refreshedProject.budgetMax || refreshedProject.budgetMin || 0;
          const platformPercent = Number(process.env.PLATFORM_FEE_PERCENTAGE || 7);
          const platformFee = Math.round((paymentAmount * platformPercent) / 100);
          const netAmount = paymentAmount - platformFee;

          payment = await Payment.create({
            project: refreshedProject._id,
            company: companyProfile._id,
            student: studentProfile._id,
            amount: paymentAmount,
            platformFee,
            netAmount,
            status: 'ready_for_release',
            capturedAt: new Date(),
          });

          // Add transaction history
          await payment.addTransactionHistory('ready_for_release', req.user._id, 'Auto-created after work approval');

          // Link payment to project
          await refreshedProject.linkPayment(payment._id, paymentAmount);
          await refreshedProject.markPaymentReadyForRelease();

          // Update student earnings - add to pending
          studentProfile.earnings = studentProfile.earnings || { totalEarned: 0, pendingPayments: 0, completedProjects: 0 };
          studentProfile.earnings.pendingPayments = (studentProfile.earnings.pendingPayments || 0) + netAmount;
          await studentProfile.save();
        } else if (payment.status === 'captured') {
          // If payment exists but not released, mark as ready
          await payment.markReadyForRelease(req.user._id, 'Marked ready after company approval');
          await refreshedProject.markPaymentReadyForRelease();
        }
      } catch (err) {
        console.error('Payment auto-creation error:', err);
        // Non-fatal: continue even if payment creation fails
        await sendAdminNotification(`⚠️ Payment creation failed for project ${refreshedProject.title}: ${err.message}`, 'payment-error', 'project', refreshedProject._id);
      }
    }

    // Notify student and company
    if (studentProfile) {
      await sendNotification(studentProfile.user, 'student', `Your submission for project ${refreshedProject.title} has been approved! The project is now completed. You can now rate the company.`, 'work-approved', 'project', refreshedProject._id);
      try {
        const studentUser = await User.findById(studentProfile.user);
        if (studentUser && studentUser.email && process.env.EMAIL_NOTIFY_ON_REVIEW !== 'false') {
          await sendEmail({ email: studentUser.email, subject: 'Work approved - Project completed', message: `<p>Your submission for project <strong>${refreshedProject.title}</strong> has been approved! The project is now completed. You can now rate the company.</p>` });
        }
      } catch (e) {
        console.warn('Email send failed for approveWork:', e.message);
      }
    }

    // Notify company that work is approved and they can now rate the student
    if (companyProfile && companyProfile.user) {
      const companyUser = await User.findById(companyProfile.user);
      if (companyUser) {
        await sendNotification(companyUser._id, 'company', `Work for project ${refreshedProject.title} has been approved! The project is now completed. You can now rate the student and make payment.`, 'work-approved', 'project', refreshedProject._id);
      }
    }

    // Admin notification for payment release (if payment system is used)
    await sendAdminNotification(`✅ Work approved and project completed: ${refreshedProject.title}`, 'work-approved', 'project', refreshedProject._id);

    // Reload project one more time to get final state including any payment updates
    const finalProject = await Project.findById(projectId);

    return sendResponse(res, 200, true, 'Work approved successfully. Project status changed to completed.', { 
      project: { 
        _id: finalProject._id, 
        status: finalProject.status, // Should be 'completed'
        completedAt: finalProject.completedAt, // Return completedAt timestamp
        paymentStatus: finalProject.paymentStatus 
      }, 
      submission 
    });
  } catch (error) {
    console.error('❌ approveWork error:', error);
    return sendResponse(res, 500, false, 'Server error while approving work', null, error.message);
  }
};

// POST /api/workspace/projects/:projectId/request-revision
exports.requestRevision = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.length < 10 || reason.length > 2000) return sendResponse(res, 400, false, 'Revision reason required (10-2000 chars)');

    const project = await Project.findById(projectId);
    if (!project) return sendResponse(res, 404, false, 'Project not found');

    const access = await validateWorkspaceAccess(project, req.user);
    if (!access.hasAccess || access.role !== 'company') return sendResponse(res, 403, false, access.error || 'Access denied');

    if (project.status !== 'under-review') return sendResponse(res, 400, false, 'No submission under review');

    const { submission, project: updated } = await project.requestRevision(req.user._id, (reason || '').toString().slice(0, 2000));

    // Update lastActivity
    await updated.updateLastActivity();

    // Notify student
    const studentProfile = await StudentProfile.findById(submission.submittedBy);
    if (studentProfile) {
      await sendNotification(studentProfile.user, 'student', `Your submission for project ${updated.title} has been requested for revision.`, 'revision-requested', 'project', updated._id);
      try {
        const studentUser = await User.findById(studentProfile.user);
        if (studentUser && studentUser.email && process.env.EMAIL_NOTIFY_ON_REVIEW !== 'false') {
          await sendEmail({ email: studentUser.email, subject: 'Revision requested', message: `<p>Your submission for project <strong>${updated.title}</strong> has been requested for revision.</p>` });
        }
      } catch (e) {
        console.warn('Email send failed for requestRevision:', e.message);
      }
    }

    return sendResponse(res, 200, true, 'Revision requested successfully', { project: { _id: updated._id, status: updated.status, currentSubmission: updated.currentSubmission, revisionCount: updated.revisionCount, maxRevisionsAllowed: updated.maxRevisionsAllowed } });
  } catch (error) {
    console.error('❌ requestRevision error:', error);
    return sendResponse(res, 500, false, 'Server error while requesting revision', null, error.message);
  }
};

// POST /api/workspace/projects/:projectId/reject
exports.rejectWork = async (req, res) => {
  try {
    const { projectId } = req.params;
    const { reason } = req.body;

    if (!reason || reason.length < 10 || reason.length > 2000) {
      return sendResponse(res, 400, false, 'Rejection reason required (10-2000 chars)');
    }

    const project = await Project.findById(projectId);
    if (!project) {
      return sendResponse(res, 404, false, 'Project not found');
    }

    const access = await validateWorkspaceAccess(project, req.user);
    if (!access.hasAccess || access.role !== 'company') {
      return sendResponse(res, 403, false, access.error || 'Access denied');
    }

    if (project.status !== 'under-review') {
      return sendResponse(res, 400, false, 'No submission under review');
    }

    const { submission, project: updated } = await project.rejectWork(req.user._id, reason);

    // Update lastActivity
    await updated.updateLastActivity();

    // Notify student
    const studentProfile = await StudentProfile.findById(submission.submittedBy);
    if (studentProfile) {
      await sendNotification(
        studentProfile.user,
        'student',
        `Your submission for project ${updated.title} has been rejected. Reason: ${reason}`,
        'work-rejected',
        'project',
        updated._id
      );
      try {
        const studentUser = await User.findById(studentProfile.user);
        if (studentUser && studentUser.email && process.env.EMAIL_NOTIFY_ON_REVIEW !== 'false') {
          await sendEmail({
            email: studentUser.email,
            subject: 'Work rejected',
            message: `<p>Your submission for project <strong>${updated.title}</strong> has been rejected.</p><p><strong>Reason:</strong> ${reason}</p>`
          });
        }
      } catch (e) {
        console.warn('Email send failed for rejectWork:', e.message);
      }
    }

    // Admin notification
    await sendAdminNotification(`Work rejected for project ${updated.title}`, 'work-rejected', 'project', updated._id);

    return sendResponse(res, 200, true, 'Work rejected successfully', {
      project: { _id: updated._id, status: updated.status, rejectedReason: reason }
    });
  } catch (error) {
    console.error('❌ rejectWork error:', error);
    return sendResponse(res, 500, false, 'Server error while rejecting work', null, error.message);
  }
};
