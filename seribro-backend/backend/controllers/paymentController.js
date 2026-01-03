const mongoose = require('mongoose');
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
      return sendResponse(res, 200, true, 'Payment record created, but Razorpay is not configured. Complete configuration to generate an order.', { orderId: null, amount, currency: 'INR', keyId: process.env.RAZORPAY_KEY_ID || null, payment });
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

    // Return order details - amount is in rupees (for display), order already has amount in paise
    // Frontend should NOT multiply this amount again when using order_id
    return sendResponse(res, 200, true, 'Order created', { 
      orderId: order.id, 
      amount, // Amount in rupees (for display only)
      currency: order.currency || 'INR', 
      keyId: process.env.RAZORPAY_KEY_ID || null, 
      projectId: project._id, 
      projectTitle: project.title,
      // Include order amount in paise for verification (order already has this)
      orderAmount: order.amount // Amount in paise as stored in Razorpay order
    });
  } catch (error) {
    console.error('createOrder error:', error);
    return sendResponse(res, 500, false, 'Failed to create order');
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
    try { valid = verifyPaymentSignature(razorpayOrderId, razorpayPaymentId, razorpaySignature); } catch (err) { return sendResponse(res, 400, false, 'Razorpay verification failed: ' + err.message); }
    if (!valid) {
      payment.status = 'failed';
      await payment.addTransactionHistory('failed', req.user._id, 'Signature verification failed');
      await payment.save();
      return sendResponse(res, 400, false, 'Invalid payment signature');
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
    return sendResponse(res, 500, false, 'Failed to verify payment');
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

    return sendResponse(res, 200, true, 'Payment marked ready for release', { paymentId: payment._id });
  } catch (error) {
    console.error('markReadyForRelease error:', error);
    return sendResponse(res, 500, false, 'Failed to mark ready for release');
  }
};

// GET /api/admin/payments/pending-releases
exports.getPendingReleases = async (req, res) => {
  try {
    const page = Number(req.query.page || 1);
    const limit = Number(req.query.limit || 20);
    const skip = (page - 1) * limit;
    const dateRange = req.query.dateRange || 'all';
    const sortBy = req.query.sortBy || 'oldest';
    const search = req.query.search || '';

    // Build date filter
    let dateFilter = {};
    const now = new Date();
    if (dateRange === 'today') {
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      dateFilter = { capturedAt: { $gte: startOfDay } };
    } else if (dateRange === '7days') {
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      dateFilter = { capturedAt: { $gte: sevenDaysAgo } };
    } else if (dateRange === '30days') {
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      dateFilter = { capturedAt: { $gte: thirtyDaysAgo } };
    }

    // Build search filter
    let searchFilter = {};
    if (search && search.trim()) {
      searchFilter = {
        $or: [
          { 'project.title': { $regex: search, $options: 'i' } },
          { 'company.companyName': { $regex: search, $options: 'i' } }
        ]
      };
    }

    const query = {
      status: 'ready_for_release',
      ...dateFilter
    };

    // For search, we need aggregation
    let payments;
    let total;

    if (Object.keys(searchFilter).length > 0) {
      const pipeline = [
        { $match: query },
        {
          $lookup: {
            from: 'projects',
            localField: 'project',
            foreignField: '_id',
            as: 'project'
          }
        },
        { $unwind: '$project' },
        {
          $lookup: {
            from: 'companyprofiles',
            localField: 'company',
            foreignField: '_id',
            as: 'company'
          }
        },
        { $unwind: '$company' },
        { $match: searchFilter },
        {
          $lookup: {
            from: 'studentprofiles',
            localField: 'student',
            foreignField: '_id',
            as: 'student'
          }
        },
        { $unwind: '$student' }
      ];

      // Add sorting
      if (sortBy === 'newest') {
        pipeline.push({ $sort: { createdAt: -1 } });
      } else if (sortBy === 'highest_amount') {
        pipeline.push({ $sort: { amount: -1 } });
      } else {
        pipeline.push({ $sort: { createdAt: 1 } });
      }

      pipeline.push({ $skip: skip }, { $limit: limit });

      payments = await Payment.collection.aggregate(pipeline).toArray();
      total = await Payment.collection.aggregate([
        ...pipeline.slice(0, -2),
        { $count: 'total' }
      ]).toArray();
      total = total[0]?.total || 0;

      // Convert MongoDB objects back to model instances if needed
      payments = await Payment.populate(payments, [
        { path: 'project' },
        { path: 'company' },
        { path: 'student' }
      ]);
    } else {
      total = await Payment.countDocuments(query);
      let sort = { createdAt: 1 };
      if (sortBy === 'newest') sort = { createdAt: -1 };
      else if (sortBy === 'highest_amount') sort = { amount: -1 };

      payments = await Payment.find(query)
        .populate('project company student')
        .sort(sort)
        .skip(skip)
        .limit(limit);
    }

    return sendResponse(res, 200, true, 'Pending releases fetched', {
      payments,
      pagination: { total, page, limit, pages: Math.ceil(total / limit) }
    });
  } catch (error) {
    console.error('getPendingReleases error:', error);
    return sendResponse(res, 500, false, 'Failed to fetch pending releases');
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

    // Update student's earnings - use netAmount (amount after platform fee deduction)
    const studentProfile = await StudentProfile.findById(payment.student);
    if (studentProfile) {
      const netAmount = payment.netAmount || (payment.amount - (payment.platformFee || 0));
      await studentProfile.updateEarnings(netAmount, 'released');
      
      await sendNotification(studentProfile.user, 'student', `Payment of ₹${netAmount} released for project ${project ? project.title : ''}`, 'payment_released', 'project', project?._id);
      try {
        const studentUser = await User.findById(studentProfile.user);
        if (studentUser && studentUser.email && process.env.EMAIL_NOTIFY_ON_PAYMENT !== 'false') {
          await sendEmail({ email: studentUser.email, subject: 'Payment released', message: `<p>Payment of ₹${netAmount} has been released to you for project <strong>${project ? project.title : ''}</strong>.</p>` });
        }
      } catch (e) { console.warn('Email send failed for releasePayment:', e.message); }
    }

    // Update company stats
    const companyProfile = await CompanyProfile.findById(payment.company);
    if (companyProfile) await companyProfile.updatePayments(payment.amount);

    return sendResponse(res, 200, true, 'Payment released successfully', { payment });
  } catch (error) {
    console.error('releasePayment error:', error);
    return sendResponse(res, 500, false, 'Failed to release payment');
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

    return sendResponse(res, 200, true, 'Refund processed', { payment });
  } catch (error) {
    console.error('refundPayment error:', error);
    return sendResponse(res, 500, false, 'Failed to process refund');
  }
};

// GET /api/payments/:paymentId
exports.getPaymentDetails = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId)
      .populate({
        path: 'project',
        select: 'title description category requiredSkills budgetMin budgetMax'
      })
      .populate({
        path: 'company',
        select: 'companyName companyLogo companyEmail companyPhone'
      })
      .populate({
        path: 'student',
        select: 'basicInfo.fullName basicInfo.email'
      })
      .lean();
    
    if (!payment) return sendResponse(res, 404, false, 'Payment not found');

    // Access control: student/company/admin check
    const studentProfile = await StudentProfile.findOne({ user: req.user._id });
    if (req.user.role === 'student' && payment.student._id.toString() !== studentProfile._id.toString()) {
      return sendResponse(res, 403, false, 'Access denied');
    }
    if (req.user.role === 'company') {
      const companyProfile = await CompanyProfile.findOne({ user: req.user._id });
      if (payment.company._id.toString() !== companyProfile._id.toString()) {
        return sendResponse(res, 403, false, 'Access denied');
      }
    }

    return sendResponse(res, 200, true, 'Payment details fetched', { payment });
  } catch (error) {
    console.error('getPaymentDetails error:', error);
    return sendResponse(res, 500, false, 'Failed to fetch payment details');
  }
};

// GET /api/payments/:paymentId (old method - keeping for backward compatibility)
const getPaymentDetailsOld = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const payment = await Payment.findById(paymentId).populate('project company student');
    if (!payment) return sendResponse(res, 404, false, 'Payment not found');

    // Access control: student/company/admin check
    if (req.user.role === 'student' && payment.student.toString() !== (await StudentProfile.findOne({ user: req.user._id }))._id.toString()) return sendResponse(res, 403, false, 'Access denied');
    if (req.user.role === 'company' && payment.company.toString() !== (await CompanyProfile.findOne({ user: req.user._id }))._id.toString()) return sendResponse(res, 403, false, 'Access denied');

    return sendResponse(res, 200, true, 'Payment details fetched', { payment });
  } catch (error) {
    console.error('getPaymentDetails error:', error);
    return sendResponse(res, 500, false, 'Failed to fetch payment details');
  }
};

// GET /api/student/earnings
exports.getStudentEarnings = async (req, res) => {
  try {
    const student = await StudentProfile.findOne({ user: req.user._id });
    if (!student) return sendResponse(res, 404, false, 'Student profile not found');

    // Fetch recent payments (limit 10) with populated details
    const recentPayments = await Payment.find({ student: student._id })
      .populate({
        path: 'project',
        select: 'title description category budgetMax budgetMin'
      })
      .populate({
        path: 'company',
        select: 'companyName companyLogo'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch monthly earnings for last 12 months
    const monthly = await Payment.aggregate([
      { $match: { student: new mongoose.Types.ObjectId(student._id), status: 'released' } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$releasedAt" } }, 
          total: { $sum: { $ifNull: ["$netAmount", "$amount"] } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    // Calculate summary stats
    const totalEarned = student.earnings?.totalEarned || 0;
    const pendingPayments = student.earnings?.pendingPayments || 0;
    const completedProjects = student.earnings?.completedProjects || 0;
    const lastPaymentDate = student.earnings?.lastPaymentDate || null;

    // Calculate available for withdrawal (released but not transferred)
    const allPayments = await Payment.find({ student: student._id, status: 'released' }).lean();
    const availableForWithdrawal = allPayments.reduce((sum, p) => sum + (p.netAmount || p.amount), 0);

    return sendResponse(res, 200, true, 'Earnings fetched', {
      summary: {
        totalEarned,
        pendingPayments,
        completedProjects,
        lastPaymentDate,
        availableForWithdrawal
      },
      recentPayments: recentPayments.map(p => ({
        _id: p._id,
        amount: p.amount,
        netAmount: p.netAmount || (p.amount - (p.platformFee || 0)),
        status: p.status,
        createdAt: p.createdAt,
        capturedAt: p.capturedAt,
        releasedAt: p.releasedAt,
        projectName: p.project?.title || 'Unknown Project',
        projectId: p.project?._id,
        companyName: p.company?.companyName || 'Unknown Company',
        companyId: p.company?._id,
        transactionId: p.razorpayPaymentId || p.razorpayOrderId,
        paymentMethod: p.paymentMethod || 'Razorpay'
      })),
      monthlyEarnings: monthly.map(m => ({
        month: m._id,
        total: m.total,
        projectCount: m.count
      }))
    });
  } catch (error) {
    console.error('getStudentEarnings error:', error);
    return sendResponse(res, 500, false, 'Failed to fetch earnings');
  }
};

// POST /api/admin/payments/bulk-release
exports.bulkReleasePayments = async (req, res) => {
  try {
    const { paymentIds, method = 'manual_transfer', notes = '' } = req.body;
    
    if (!Array.isArray(paymentIds) || paymentIds.length === 0) {
      return sendResponse(res, 400, false, 'Invalid payment IDs');
    }

    const results = {
      released: 0,
      failed: 0,
      errors: []
    };

    // Process each payment
    for (const paymentId of paymentIds) {
      try {
        const payment = await Payment.findById(paymentId);
        if (!payment) {
          results.failed++;
          results.errors.push({ paymentId, error: 'Payment not found' });
          continue;
        }

        if (payment.status !== 'ready_for_release') {
          results.failed++;
          results.errors.push({ paymentId, error: 'Payment not ready for release' });
          continue;
        }

        // Release the payment
        await payment.releasePayment(req.user._id, method, notes);

        // Update project
        const project = await Project.findById(payment.project);
        if (project) {
          await project.markPaymentReleased();
          project.status = 'completed';
          project.completedAt = new Date();
          await project.save();
        }

        // Update student's earnings
        const studentProfile = await StudentProfile.findById(payment.student);
        if (studentProfile) {
          await studentProfile.updateEarnings(payment.amount, 'add');
          await sendNotification(
            studentProfile.user,
            'student',
            `Payment of ₹${payment.amount} released for project ${project ? project.title : ''}`,
            'payment_released',
            'project',
            project?._id
          );

          // Send email notification
          try {
            const studentUser = await User.findById(studentProfile.user);
            if (studentUser && studentUser.email && process.env.EMAIL_NOTIFY_ON_PAYMENT !== 'false') {
              await sendEmail({
                email: studentUser.email,
                subject: 'Payment released',
                message: `<p>Payment of ₹${payment.amount} has been released to you for project <strong>${project ? project.title : ''}</strong>.</p>`
              });
            }
          } catch (e) {
            console.warn('Email send failed for bulk release:', e.message);
          }
        }

        // Update company stats
        const companyProfile = await CompanyProfile.findById(payment.company);
        if (companyProfile) {
          await companyProfile.updatePayments(payment.amount);
        }

        results.released++;
      } catch (error) {
        results.failed++;
        results.errors.push({
          paymentId,
          error: error.message
        });
      }
    }

    return sendResponse(res, 200, true, 'Bulk release completed', {
      released: results.released,
      failed: results.failed,
      errors: results.errors.length > 0 ? results.errors : undefined
    });
  } catch (error) {
    console.error('bulkReleasePayments error:', error);
    return sendResponse(res, 500, false, 'Failed to process bulk release');
  }
};

// GET /api/company/payments - Get company payment history
exports.getCompanyPayments = async (req, res) => {
  try {
    const company = await CompanyProfile.findOne({ user: req.user._id });
    if (!company) return sendResponse(res, 404, false, 'Company profile not found');

    // Fetch recent payments (limit 10)
    const recentPayments = await Payment.find({ company: company._id })
      .populate({
        path: 'project',
        select: 'title description category budgetMax budgetMin'
      })
      .populate({
        path: 'student',
        select: 'basicInfo.fullName basicInfo.email'
      })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    // Fetch monthly spending for last 12 months
    const monthly = await Payment.aggregate([
      { $match: { company: new mongoose.Types.ObjectId(company._id), status: 'released' } },
      { 
        $group: { 
          _id: { $dateToString: { format: "%Y-%m", date: "$releasedAt" } }, 
          total: { $sum: { $ifNull: ["$netAmount", "$amount"] } },
          count: { $sum: 1 }
        } 
      },
      { $sort: { _id: 1 } },
      { $limit: 12 }
    ]);

    // Calculate summary stats
    const totalSpent = company.payments?.totalSpent || 0;
    const completedProjects = company.payments?.completedProjects || 0;
    const lastPaymentDate = company.payments?.lastPaymentDate || null;

    // Count active projects
    const Project = require('../models/Project');
    const activeProjects = await Project.countDocuments({ 
      companyId: company._id,
      status: { $in: ['open', 'assigned', 'in-progress'] }
    });

    return sendResponse(res, 200, true, 'Company payments fetched', {
      summary: {
        totalSpent,
        completedProjects,
        activeProjects,
        lastPaymentDate
      },
      recentPayments: recentPayments.map(p => ({
        _id: p._id,
        amount: p.amount,
        netAmount: p.netAmount || (p.amount - (p.platformFee || 0)),
        status: p.status,
        createdAt: p.createdAt,
        capturedAt: p.capturedAt,
        releasedAt: p.releasedAt,
        projectName: p.project?.title || 'Unknown Project',
        projectId: p.project?._id,
        studentName: p.student?.basicInfo?.fullName || 'Unknown Student',
        studentId: p.student?._id,
        transactionId: p.razorpayPaymentId || p.razorpayOrderId,
        paymentMethod: p.paymentMethod || 'Razorpay'
      })),
      monthlySpending: monthly.map(m => ({
        month: m._id,
        total: m.total,
        projectCount: m.count
      }))
    });
  } catch (error) {
    console.error('getCompanyPayments error:', error);
    return sendResponse(res, 500, false, 'Failed to fetch company payments');
  }
};
