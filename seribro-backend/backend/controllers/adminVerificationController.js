// controllers/adminVerificationController.js
// Hinglish: Admin ke liye verification controller - students aur companies ko verify karne ke liye

const StudentProfile = require('../models/StudentProfile');
const CompanyProfile = require('../models/companyProfile');
const Student = require('../models/Student');
const Company = require('../models/Company');
const { logAdminAction } = require('../utils/admin/auditLog');
const { sendVerificationEmail } = require('../utils/admin/sendVerificationEmail');

/**
 * @desc    Get admin dashboard data with counts and recent pending verifications
 * @route   GET /api/admin/dashboard
 * @access  Private/Admin
 */
exports.getAdminDashboard = async (req, res) => {
  try {
    // Hinglish: Sabhi counts nikaalo - students, companies, pending verifications
    const [
      totalStudents,
      totalCompanies,
      pendingStudentVerifications,
      pendingCompanyVerifications,
      // Hinglish: Projects aur applications future ke liye hai, abhi 0 set kar do
] = await Promise.all([
      StudentProfile.countDocuments(),
      CompanyProfile.countDocuments(),
      StudentProfile.countDocuments({ verificationStatus: 'pending' }),
      CompanyProfile.countDocuments({ verificationStatus: 'pending' }),
    ]);

    console.log('📊 Admin Dashboard - Pending Counts | Students:', pendingStudentVerifications, '| Companies:', pendingCompanyVerifications);

    // Hinglish: Last 10 pending students aur companies ko fetch karo with basic info
const recentPendingStudents = await StudentProfile.find({ verificationStatus: 'pending' })
      .populate('user', 'email')
      .populate('student', 'fullName college')
      .select('basicInfo verification profileStats verificationRequestedAt updatedAt')
      .sort({ 'verificationRequestedAt': -1 })
      .limit(10);

    console.log('👥 Pending Students Found:', recentPendingStudents.length);
    if (recentPendingStudents.length > 0) {
      console.log('📅 First pending student requested at:', recentPendingStudents[0].verificationRequestedAt);
    }

    const recentPendingCompanies = await CompanyProfile.find({ verificationStatus: 'pending' })
      .populate('user', 'email')
      .select('companyName companyEmail verificationStatus profileCompletionPercentage updatedAt')
      .sort({ updatedAt: -1 })
      .limit(10);

    // Hinglish: Dono lists ko combine karo aur last 10 return karo
    const recentPending = [
      ...recentPendingStudents.map(s => ({
        id: s._id,
        type: 'student',
        name: s.basicInfo?.fullName || s.student?.fullName || 'N/A',
        email: s.user?.email || 'N/A',
        college: s.basicInfo?.collegeName || 'N/A',
submittedAt: s.verificationRequestedAt || s.updatedAt,
        profileCompletion: s.profileStats?.profileCompletion || 0
      })),
      ...recentPendingCompanies.map(c => ({
        id: c._id,
        type: 'company',
        name: c.companyName || 'N/A',
        email: c.companyEmail || c.user?.email || 'N/A',
        submittedAt: c.updatedAt,
        profileCompletion: c.profileCompletionPercentage || 0
      }))
    ].sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt)).slice(0, 10);

    // Hinglish: Log admin action
    await logAdminAction(req.user._id, 'VIEW_DASHBOARD', null, 'Admin viewed dashboard');

    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: {
        totalStudents,
        totalCompanies,
        pendingStudentVerifications,
        pendingCompanyVerifications,
        totalProjects: 0, // Hinglish: Future use ke liye
        totalApplications: 0, // Hinglish: Future use ke liye
        recentPending
      }
    });
  } catch (error) {
    console.error('❌ Error in getAdminDashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching dashboard data',
      error: error.message
    });
  }
};

/**
 * @desc    Get all pending student verifications
 * @route   GET /api/admin/students/pending
 * @access  Private/Admin
 */
exports.getPendingStudents = async (req, res) => {
  try {
    // Hinglish: Sabhi pending students ko fetch karo with populated data
const pendingStudents = await StudentProfile.find({ verificationStatus: 'pending' })
      .populate('user', 'email role')
      .populate('student', 'fullName college')
      .select('basicInfo verification profileStats projects documents')
.sort({ 'verificationRequestedAt': -1 });

    // Hinglish: Data ko format karo for frontend
    const formattedStudents = pendingStudents.map(student => ({
      id: student._id,
      name: student.basicInfo?.fullName || student.student?.fullName || 'N/A',
      email: student.user?.email || 'N/A',
      college: student.basicInfo?.collegeName || student.student?.college || 'N/A',
      profileCompletion: student.profileStats?.profileCompletion || 0,
submittedAt: student.verificationRequestedAt || student.updatedAt,
      projectsCount: student.projects?.length || 0
    }));

    res.status(200).json({
      success: true,
      message: 'Pending students fetched successfully',
      data: formattedStudents
    });
  } catch (error) {
    console.error('❌ Error in getPendingStudents:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending students',
      error: error.message
    });
  }
};

/**
 * @desc    Get all pending company verifications
 * @route   GET /api/admin/companies/pending
 * @access  Private/Admin
 */
exports.getPendingCompanies = async (req, res) => {
  try {
    // Hinglish: Sabhi pending companies ko fetch karo with populated data
    const pendingCompanies = await CompanyProfile.find({ verificationStatus: 'pending' })
      .populate('user', 'email role')
      .select('companyName companyEmail website industryType companySize verificationStatus profileCompletionPercentage documents updatedAt')
      .sort({ updatedAt: -1 });

    // Hinglish: Data ko format karo for frontend
    const formattedCompanies = pendingCompanies.map(company => ({
      id: company._id,
      name: company.companyName || 'N/A',
      email: company.companyEmail || company.user?.email || 'N/A',
      website: company.website || 'N/A',
      industryType: company.industryType || 'N/A',
      companySize: company.companySize || 'N/A',
      profileCompletion: company.profileCompletionPercentage || 0,
      submittedAt: company.updatedAt,
      documentsCount: company.documents?.length || 0
    }));

    res.status(200).json({
      success: true,
      message: 'Pending companies fetched successfully',
      data: formattedCompanies
    });
  } catch (error) {
    console.error('❌ Error in getPendingCompanies:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching pending companies',
      error: error.message
    });
  }
};

/**
 * @desc    Get detailed student profile for verification
 * @route   GET /api/admin/student/:id
 * @access  Private/Admin
 */
exports.getStudentDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // PART 1: Student profile ko fetch karo with full details including proper document URLs
    const studentProfile = await StudentProfile.findById(id)
      .populate('user', 'email role createdAt')
      .populate('student', 'fullName college skills collegeId')
      .select('basicInfo documents resume collegeId certificates projects skills verification verificationStatus');

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Hinglish: Pehle se approved profiles ko dobara approve nahi kar sakte
    if (studentProfile.verification.status === 'verified') {
      return res.status(400).json({
        success: false,
        message: 'This student is already verified'
      });
    }

    // PART 1: Format response with proper document URLs
    const formattedData = {
      ...studentProfile.toObject(),
      documents: {
        resume: {
          url: studentProfile.documents?.resume?.url || studentProfile.documents?.resume?.path || '',
          public_id: studentProfile.documents?.resume?.public_id || '',
          filename: studentProfile.documents?.resume?.filename || '',
        },
        collegeId: {
          url: studentProfile.documents?.collegeId?.url || studentProfile.documents?.collegeId?.path || '',
          public_id: studentProfile.documents?.collegeId?.public_id || '',
          filename: studentProfile.documents?.collegeId?.filename || '',
        },
        certificates: (studentProfile.documents?.certificates || []).map(cert => ({
          url: cert.url || cert.path || '',
          public_id: cert.public_id || '',
          filename: cert.filename || '',
          title: cert.title || '',
        })),
      },
    };

    res.status(200).json({
      success: true,
      message: 'Student details fetched successfully',
      data: formattedData
    });
  } catch (error) {
    console.error('❌ Error in getStudentDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching student details',
      error: error.message
    });
  }
};

/**
 * @desc    Get detailed company profile for verification
 * @route   GET /api/admin/company/:id
 * @access  Private/Admin
 */
exports.getCompanyDetails = async (req, res) => {
  try {
    const { id } = req.params;

    // Hinglish: Company profile ko fetch karo with full details
    const companyProfile = await CompanyProfile.findById(id)
      .populate('user', 'email role createdAt');

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Hinglish: Pehle se approved profiles ko dobara approve nahi kar sakte
    if (companyProfile.verificationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'This company is already approved'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Company details fetched successfully',
      data: companyProfile
    });
  } catch (error) {
    console.error('❌ Error in getCompanyDetails:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while fetching company details',
      error: error.message
    });
  }
};

/**
 * @desc    Approve student verification
 * @route   POST /api/admin/student/:id/approve
 * @access  Private/Admin
 */
exports.approveStudent = async (req, res) => {
  try {
    const { id } = req.params;

    // Hinglish: Student profile ko fetch karo
    const studentProfile = await StudentProfile.findById(id)
      .populate('user', 'email')
      .populate('student', 'fullName');

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Hinglish: Already approved check karo
    if (studentProfile.verificationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Student is already approved'
      });
    }

    // Hinglish: Verification status update karo (Phase 3.2 fields)
    studentProfile.verificationStatus = 'approved';
    studentProfile.verifiedAt = new Date();
    studentProfile.verifiedByAdmin = req.user._id;
    studentProfile.rejectionReason = '';
    // Legacy sync for Phase-2 structure (optional but safe)
    if (studentProfile.verification) {
      studentProfile.verification.status = 'verified';
      studentProfile.verification.isCollegeIdVerified = true;
      studentProfile.verification.verifiedAt = studentProfile.verifiedAt;
      studentProfile.verification.verifiedBy = req.user._id;
      studentProfile.verification.rejectionReason = '';
    }
    studentProfile.profileStats.lastUpdated = new Date();

    await studentProfile.save();

    // Hinglish: Admin action log karo
    await logAdminAction(
      req.user._id, 
      'APPROVE_STUDENT', 
      studentProfile._id, 
      `Admin approved student: ${studentProfile.basicInfo?.fullName || 'N/A'}`
    );

    // Hinglish: Student ko email notification bhejo
    await sendVerificationEmail(
      studentProfile.user?.email || studentProfile.basicInfo?.email,
      'approved',
      'student',
      studentProfile.basicInfo?.fullName || 'Student'
    );

    res.status(200).json({
      success: true,
      message: 'Student verified successfully',
      data: {
        id: studentProfile._id,
        status: studentProfile.verificationStatus,
        verifiedAt: studentProfile.verifiedAt
      }
    });
  } catch (error) {
    console.error('❌ Error in approveStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving student',
      error: error.message
    });
  }
};

/**
 * @desc    Reject student verification
 * @route   POST /api/admin/student/:id/reject
 * @access  Private/Admin
 */
exports.rejectStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Hinglish: Rejection reason validation
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required (Hinglish: Rejection reason zaroori hai)'
      });
    }

    // Hinglish: Reason ko sanitize karo (basic XSS prevention)
    const sanitizedReason = reason.trim().substring(0, 500);

    // Hinglish: Student profile ko fetch karo
    const studentProfile = await StudentProfile.findById(id)
      .populate('user', 'email')
      .populate('student', 'fullName');

    if (!studentProfile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found'
      });
    }

    // Hinglish: Verification status update karo (Phase 3.2 fields)
    studentProfile.verificationStatus = 'rejected';
    studentProfile.rejectionReason = sanitizedReason;
    studentProfile.verifiedAt = null;
    studentProfile.verifiedByAdmin = null;
    if (studentProfile.verification) {
      studentProfile.verification.status = 'rejected';
      studentProfile.verification.rejectionReason = sanitizedReason;
      studentProfile.verification.verifiedAt = null;
      studentProfile.verification.verifiedBy = null;
    }
    studentProfile.profileStats.lastUpdated = new Date();

    await studentProfile.save();

    // Hinglish: Admin action log karo
    await logAdminAction(
      req.user._id, 
      'REJECT_STUDENT', 
      studentProfile._id, 
      `Admin rejected student: ${studentProfile.basicInfo?.fullName || 'N/A'}. Reason: ${sanitizedReason}`
    );

    // Hinglish: Student ko email notification bhejo with reason
    await sendVerificationEmail(
      studentProfile.user?.email || studentProfile.basicInfo?.email,
      'rejected',
      'student',
      studentProfile.basicInfo?.fullName || 'Student',
      sanitizedReason
    );

    res.status(200).json({
      success: true,
      message: 'Student verification rejected',
      data: {
        id: studentProfile._id,
        status: studentProfile.verificationStatus,
        rejectionReason: studentProfile.rejectionReason
      }
    });
  } catch (error) {
    console.error('❌ Error in rejectStudent:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting student',
      error: error.message
    });
  }
};

/**
 * @desc    Approve company verification
 * @route   POST /api/admin/company/:id/approve
 * @access  Private/Admin
 */
exports.approveCompany = async (req, res) => {
  try {
    const { id } = req.params;

    // Hinglish: Company profile ko fetch karo
    const companyProfile = await CompanyProfile.findById(id)
      .populate('user', 'email');

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Hinglish: Already approved check karo
    if (companyProfile.verificationStatus === 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Company is already approved'
      });
    }

    // Hinglish: Verification status update karo
    companyProfile.verificationStatus = 'approved';
    companyProfile.verifiedAt = new Date();
    companyProfile.verifiedByAdmin = req.user._id;
    companyProfile.rejectionReason = '';

    await companyProfile.save();

    // Hinglish: Admin action log karo
    await logAdminAction(
      req.user._id, 
      'APPROVE_COMPANY', 
      companyProfile._id, 
      `Admin approved company: ${companyProfile.companyName || 'N/A'}`
    );

    // Hinglish: Company ko email notification bhejo
    await sendVerificationEmail(
      companyProfile.companyEmail || companyProfile.user?.email,
      'approved',
      'company',
      companyProfile.companyName || 'Company'
    );

    res.status(200).json({
      success: true,
      message: 'Company verified successfully',
      data: {
        id: companyProfile._id,
        status: companyProfile.verificationStatus,
approvedAt: companyProfile.verifiedAt
      }
    });
  } catch (error) {
    console.error('❌ Error in approveCompany:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while approving company',
      error: error.message
    });
  }
};

/**
 * @desc    Reject company verification
 * @route   POST /api/admin/company/:id/reject
 * @access  Private/Admin
 */
exports.rejectCompany = async (req, res) => {
  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Hinglish: Rejection reason validation
    if (!reason || reason.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'Rejection reason is required (Hinglish: Rejection reason zaroori hai)'
      });
    }

    // Hinglish: Reason ko sanitize karo (basic XSS prevention)
    const sanitizedReason = reason.trim().substring(0, 500);

    // Hinglish: Company profile ko fetch karo
    const companyProfile = await CompanyProfile.findById(id)
      .populate('user', 'email');

    if (!companyProfile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found'
      });
    }

    // Hinglish: Verification status update karo
    companyProfile.verificationStatus = 'rejected';
    companyProfile.rejectionReason = sanitizedReason;
    companyProfile.verifiedAt = null;
    companyProfile.verifiedByAdmin = null;

    await companyProfile.save();

    // Hinglish: Admin action log karo
    await logAdminAction(
      req.user._id, 
      'REJECT_COMPANY', 
      companyProfile._id, 
      `Admin rejected company: ${companyProfile.companyName || 'N/A'}. Reason: ${sanitizedReason}`
    );

    // Hinglish: Company ko email notification bhejo with reason
    await sendVerificationEmail(
      companyProfile.companyEmail || companyProfile.user?.email,
      'rejected',
      'company',
      companyProfile.companyName || 'Company',
      sanitizedReason
    );

    res.status(200).json({
      success: true,
      message: 'Company verification rejected',
      data: {
        id: companyProfile._id,
        status: companyProfile.verificationStatus,
rejectionReason: companyProfile.rejectionReason
      }
    });
  } catch (error) {
    console.error('❌ Error in rejectCompany:', error);
    res.status(500).json({
      success: false,
      message: 'Server error while rejecting company',
      error: error.message
    });
  }
};

// ============ NOTIFICATION CONTROLLERS (PHASE 3) ============
// Hinglish: Admin ke notifications ke liye controllers

/**
 * @desc    Get all notifications for admin (read + unread)
 * @route   GET /api/admin/notifications
 * @access  Private (Admin)
 * Hinglish: Admin ke liye sabhi notifications fetch karna
 */
exports.getNotifications = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication data missing',
        data: null,
      });
    }

    // Hinglish: Admin ke liye notifications fetch karna - recent ones first
    const notifications = await Notification.find({ userId })
      .sort({ createdAt: -1 })
      .limit(50);

    // Hinglish: Unread count nikalna
    const unreadCount = await Notification.countDocuments({
      userId,
      isRead: false,
    });

    res.status(200).json({
      success: true,
      message: 'Notifications fetched successfully',
      data: {
        notifications: notifications.map(notif => ({
          id: notif._id,
          message: notif.message,
          type: notif.type,
          isRead: notif.isRead,
          createdAt: notif.createdAt,
          readAt: notif.readAt,
          relatedProfileType: notif.relatedProfileType,
          relatedProfileId: notif.relatedProfileId,
        })),
        unreadCount,
        total: notifications.length,
      },
    });
  } catch (error) {
    console.error('Error fetching notifications:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching notifications',
      data: null,
    });
  }
};

/**
 * @desc    Mark a notification as read
 * @route   PATCH /api/admin/notifications/:id/read
 * @access  Private (Admin)
 * Hinglish: Notification ko read mark karna
 */
exports.markNotificationAsRead = async (req, res) => {
  try {
    const Notification = require('../models/Notification');
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: 'Authentication data missing',
        data: null,
      });
    }

    // Hinglish: Notification find karna aur verify karna ki owner hai
    const notification = await Notification.findOne({
      _id: id,
      userId,
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: 'Notification not found',
        data: null,
      });
    }

    // Hinglish: Notification ko read mark karna
    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json({
      success: true,
      message: 'Notification marked as read',
      data: {
        id: notification._id,
        isRead: notification.isRead,
        readAt: notification.readAt,
      },
    });
  } catch (error) {
    console.error('Error marking notification as read:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error marking notification as read',
      data: null,
    });
  }
};
