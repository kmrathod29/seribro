const Payment = require('../models/Payment');
const Project = require('../models/Project');
const CompanyProfile = require('../models/companyProfile');
const StudentProfile = require('../models/StudentProfile');
const User = require('../models/User');
const { createRazorpayOrder, verifyPaymentSignature } = require('../utils/payment/razorpayHelper');
const sendResponse = require('../utils/students/sendResponse');
const { sendNotification, sendAdminNotification } = require('../utils/notifications/sendNotification');
const sendEmail = require('../utils/sendEmail');

// POST /api/payments/create-order
exports.createOrder = async (req, res) => {
  try {
    const { projectId, studentId } = req.body;
    const project = await Project.findById(projectId);
    if (!project) return sendResponse(res, 404, false, 'Project not found');
    // verify company ownership
    if (!req.user || req.user.role !== 'company') return sendResponse(res, 403, false, 'Only companies can create payment orders');

    const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
    if (!companyProfile || companyProfile._id.toString() !== project.companyId?.toString()) return sendResponse(res, 403, false, 'You do not own this project');

    const amount = project.budgetMax || project.budgetMin || 0;
    const platformPercent = Number(process.env.PLATFORM_FEE_PERCENTAGE || 7);
    const platformFee = Math.round((amount * platformPercent) / 100);
    const netAmount = amount - platformFee;

    // Attempt to create Razorpay order
    let order;
    try {
      order = await createRazorpayOrder(amount, project._id, studentId || project.assignedStudent);
    } catch (err) {
      console.warn('Razorpay order creation failed:', err.message);
      // Create payment record in DB (pending) so admin can inspect
      const payment = await Payment.create({
        razorpayOrderId: null,
        project: project._id,
        company: companyProfile._id,
        student: studentId || project.assignedStudent,
        amount,
        platformFee,
        netAmount,
        status: 'pending',
      });
      await project.linkPayment(payment._id, amount);
      return sendResponse(res, true, 'Payment record created, but Razorpay is not configured. Complete configuration to generate an order.', { orderId: null, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID || null, payment });
    }

    const paymentDoc = await Payment.create({
      razorpayOrderId: order.id,
      project: project._id,
      company: companyProfile._id,
      student: studentId || project.assignedStudent,
      amount,
      platformFee,
      netAmount,
      status: 'pending'
    });

    await project.linkPayment(paymentDoc._id, amount);

    return sendResponse(res, true, 'Order created', { orderId: order.id, amount, currency: order.currency || 'INR', keyId: process.env.RAZORPAY_KEY_ID || null, projectId: project._id, projectTitle: project.title });
  } catch (error) {
    console.error('createOrder error:', error);
    return sendResponse(res, false, 'Failed to create order', null, 500);
  }
};

// POST /api/payments/verify
exports.verifyPayment = async (req, res) => {
  try {
    const { razorpayOrderId, razorpayPaymentId, razorpaySignature, projectId } = req.body;
    const payment = await Payment.findOne({ razorpayOrderId });
    if (!payment) return sendResponse(res, 404, false, 'Payment record not found');

    // verify using helper
    let valid = false;
    try { valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature); } catch (err) { return sendResponse(res, false, 'Razorpay verification failed: ' + err.message, null, 400); }
    if (!valid) {
      payment.status = 'failed';
      await payment.addTransactionHistory('failed', req.user._id, 'Signature verification failed');
      await payment.save();
      return sendResponse(res, false, 'Invalid payment signature', null, 400);
    }

    payment.razorpayPaymentId = razorpayPaymentId;
    payment.razorpaySignature = razorpaySignature;
    payment.status = 'captured';
    payment.capturedAt = new Date();
    await payment.addTransactionHistory('captured', req.user._id, 'Payment captured via Razorpay');
    await payment.save();

    // Link to project
    const project = await Project.findById(payment.project);
    if (project) await project.markPaymentCaptured();

    // Update student pending payments
    const studentProfile = await StudentProfile.findById(payment.student);
    if (studentProfile) {
      await studentProfile.updateEarnings(payment.amount, 'pending');
      await sendNotification(studentProfile.user, 'student', `Payment received for project ${project ? project.title : ''}`, 'payment_received', 'project', project?._id);
    }

    // Notify company
    const companyUser = await User.findById(req.user._id);
    if (companyUser && companyUser.email && process.env.EMAIL_NOTIFY_ON_PAYMENT !== 'false') {
      try { await sendEmail({ email: companyUser.email, subject: 'Payment successful', message: `<p>Payment of ₹${payment.amount} received for project ${project ? project.title : ''}</p>` }); } catch (e) { console.warn('Email send failed for verifyPayment:', e.message); }
    }

    return sendResponse(res, true, 'Payment verified successfully', { payment, project });
  } catch (error) {
    console.error('verifyPayment error:', error);
    return sendResponse(res, false, 'Failed to verify payment', null, 500);
  }
};

// POST /api/payments/projects/:projectId/ready-for-release
exports.markReadyForRelease = async (req, res) => {
  try {
    const { projectId } = req.params;
    const project = await Project.findById(projectId);
    if (!project) return sendResponse(res, 404, false, 'Project not found');
    if (project.status !== 'approved') return sendResponse(res, 400, false, 'Project not approved yet');
    const payment = await Payment.findById(project.payment);
    if (!payment) return sendResponse(res, 404, false, 'Payment not found');

    payment.status = 'ready_for_release';
    await payment.addTransactionHistory('ready_for_release', req.user._id, 'Marked ready after approval');
    await payment.save();

    await project.markPaymentReadyForRelease();

    // Notify admins
    await sendAdminNotification(`Payment release pending for project ${project.title}`, 'payment_release_pending', 'project', project._id);

    return sendResponse(res, true, 'Payment marked ready for release', { paymentId: payment._id });
  } catch (error) {
    console.error('markReadyForRelease error:', error);
    return sendResponse(res, false, 'Failed to mark ready for release', null, 500);
  }
};

// GET /api/admin/payments/pending-releases
exports.getPendingReleases = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;

    const query = { status: 'ready_for_release' };
    const total = await Payment.countDocuments(query);
    const payments = await Payment.find(query).populate('project company student').sort({ createdAt: 1 }).skip(skip).limit(limit);

    return sendResponse(res, true, 'Pending releases fetched', { payments, pagination: { total, page, limit } });
  } catch (error) {
    console.error('getPendingReleases error:', error);
    return sendResponse(res, false, 'Failed to fetch pending releases', null, 500);
  }
};

// POST /api/admin/payments/:paymentId/release
exports.releasePayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { method = 'manual_transfer', notes = '' } = req.body;
    const payment = await Payment.findById(paymentId);
    if (!payment) return sendResponse(res, 404, false, 'Payment not found');
    if (payment.status !== 'ready_for_release') return sendResponse(res, 400, false, 'Payment not ready for release');

    await payment.releasePayment(req.user._id, method, notes);

    // Update project
    const project = await Project.findById(payment.project);
    if (project) {
      await project.markPaymentReleased();
      project.status = 'completed';
      project.completedAt = new Date();
      await project.save();
    }

    // Update student's earnings (add)
    const studentProfile = await StudentProfile.findById(payment.student);
    if (studentProfile) {
      await studentProfile.updateEarnings(payment.amount, 'add');
      await sendNotification(studentProfile.user, 'student', `Payment of ₹${payment.amount} released for project ${project ? project.title : ''}`, 'payment_released', 'project', project?._id);
      try {
        const studentUser = await User.findById(studentProfile.user);
        if (studentUser && studentUser.email && process.env.EMAIL_NOTIFY_ON_PAYMENT !== 'false') {
          await sendEmail({ email: studentUser.email, subject: 'Payment released', message: `<p>Payment of ₹${payment.amount} has been released to you for project <strong>${project ? project.title : ''}</strong>.</p>` });
        }
      } catch (e) { console.warn('Email send failed for releasePayment:', e.message); }
    }

    // Update company stats
    const companyProfile = await CompanyProfile.findById(payment.company);
    if (companyProfile) await companyProfile.updatePayments(payment.amount);

    return sendResponse(res, true, 'Payment released successfully', { payment });
  } catch (error) {
    console.error('releasePayment error:', error);
    return sendResponse(res, false, 'Failed to release payment', null, 500);
  }
};

// POST /api/admin/payments/:paymentId/refund
exports.refundPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { reason, amount } = req.body;
    if (!reason || reason.length < 5) return sendResponse(res, 400, false, 'Refund reason required');

    const payment = await Payment.findById(paymentId);
    if (!payment) return sendResponse(res, 404, false, 'Payment not found');
    const refundAmount = Number(amount) || payment.amount;
    if (refundAmount > payment.amount) return sendResponse(res, 400, false, 'Refund amount cannot exceed original payment');

    await payment.processRefund(req.user._id, reason, refundAmount);

    // Update project
    const project = await Project.findById(payment.project);
    if (project) await project.markPaymentRefunded();

    // Update student pending if applicable
    const studentProfile = await StudentProfile.findById(payment.student);
    if (studentProfile) {
      studentProfile.earnings.pendingPayments = Math.max(0, (studentProfile.earnings.pendingPayments || 0) - refundAmount);
      await studentProfile.save();
    }

    // Notify company and student
    const companyUser = await User.findById(req.user._id);
    if (companyUser && companyUser.email && process.env.EMAIL_NOTIFY_ON_PAYMENT !== 'false') {
      try { await sendEmail({ email: companyUser.email, subject: 'Refund processed', message: `<p>Refund of ₹${refundAmount} processed for project ${project ? project.title : ''}. Reason: ${reason}</p>` }); } catch (e) { console.warn('Email send failed for refundPayment:', e.message); }
    }

    return sendResponse(res, true, 'Refund processed', { payment });
  } catch (error) {
    console.error('refundPayment error:', error);
    return sendResponse(res, false, 'Failed to process refund', null, 500);
  }
};

// GET /api/payments/:paymentId
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate('project company student');
    if (!payment) return sendResponse(res, 404, false, 'Payment not found');

    // Access control: student/company/admin check
    if (req.user.role === 'student' && payment.student.toString() !== (await StudentProfile.findOne({ user: req.user._id }))._id.toString()) return sendResponse(res, 403, false, 'Access denied');
    if (req.user.role === 'company' && payment.company.toString() !== (await CompanyProfile.findOne({ user: req.user._id }))._id.toString()) return sendResponse(res, 403, false, 'Access denied');

    return sendResponse(res, true, 'Payment details fetched', { payment });
  } catch (error) {
    console.error('getPaymentDetails error:', error);
    return sendResponse(res, false, 'Failed to fetch payment details', null, 500);
  }
};

// GET /api/student/earnings
exports.getStudentEarnings = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) return sendResponse(res, 404, false, 'Student profile not found');

    const recentPayments = await Payment.find({ student: student._id }).sort({ createdAt: -1 }).limit(10);
    const monthly = await Payment.aggregate([
      { $match: { student: student._id, status: 'released' } },
      { $project: { month: { $dateToString: { format: "%Y-%m", date: "$releasedAt" } }, amount: "$amount" } },
      { $group: { _id: "$month", total: { $sum: "$amount" } } },
      { $sort: { _id: 1 } }
    ]);

    return sendResponse(res, true, 'Earnings fetched', {
      totalEarned: student.earnings?.totalEarned || 0,
      pendingPayments: student.earnings?.pendingPayments || 0,
      completedProjects: student.earnings?.completedProjects || 0,
      lastPaymentDate: student.earnings?.lastPaymentDate || null,
      recentPayments,
      monthlyEarnings: monthly
    });
  } catch (error) {
    console.error('getStudentEarnings error:', error);
    return sendResponse(res, false, 'Failed to fetch earnings', null, 500);
  }
};
