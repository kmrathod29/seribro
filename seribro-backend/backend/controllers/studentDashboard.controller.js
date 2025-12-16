// backend/controllers/studentDashboard.controller.js
// Student Dashboard Controller - Phase 3
// Hinglish: Student ke dashboard ke liye complete overview return karta hai

const asyncHandler = require('express-async-handler');
const StudentProfile = require('../models/StudentProfile');
const Student = require('../models/Student');
const User = require('../models/User');
const Notification = require('../models/Notification');

// ============ HELPER FUNCTIONS ============

/**
 * Hinglish: Student ka verification status check karte hue appropriate alert message generate karna
 */
const generateAlertMessage = (verificationStatus) => {
  switch (verificationStatus) {
    case 'pending':
      return 'Your profile is pending verification';
    case 'rejected':
      return 'Your profile is rejected — fix issues and resubmit';
    case 'approved':
      return 'Congrats! Your profile is approved';
    default:
      return 'Your profile is pending review';
  }
};

/**
 * Hinglish: Student ke profile completion percentage calculate karna
 */
const calculateProfileCompletion = (profile) => {
  if (!profile) return 0;
  
  let completedFields = 0;
  let totalFields = 0;

  // Hinglish: Basic info fields check karna
  const basicInfoFields = ['fullName', 'email', 'phone', 'collegeName', 'degree', 'branch', 'graduationYear'];
  basicInfoFields.forEach(field => {
    totalFields++;
    if (profile.basicInfo?.[field]) completedFields++;
  });

  // Hinglish: Skills check karna
  totalFields += 2; // Technical aur soft skills
  if (profile.skills?.technical?.length > 0) completedFields++;
  if (profile.skills?.soft?.length > 0) completedFields++;

  // Hinglish: Documents check karna
  totalFields += 2; // Resume aur collegeId
  if (profile.documents?.resume?.path) completedFields++;
  if (profile.documents?.collegeId?.path) completedFields++;

  // Hinglish: Links check karna
  totalFields += 2; // GitHub aur LinkedIn
  if (profile.links?.github) completedFields++;
  if (profile.links?.linkedin) completedFields++;

  // Hinglish: Projects check karna
  totalFields += 1;
  if (profile.projects?.length > 0) completedFields++;

  const percentage = Math.round((completedFields / totalFields) * 100) || 0;
  return Math.min(percentage, 100);
};

/**
 * Hinglish: Student profile analytics prepare karna
 */
const getProfileAnalytics = (profile) => {
  return {
    skillsCount: {
      technical: profile?.skills?.technical?.length || 0,
      soft: profile?.skills?.soft?.length || 0,
      languages: profile?.skills?.languages?.length || 0,
    },
    documentsStatus: {
      resume: !!profile?.documents?.resume?.path,
      collegeId: !!profile?.documents?.collegeId?.path,
      certificates: profile?.documents?.certificates?.length || 0,
    },
    portfolioLinks: {
      github: !!profile?.links?.github,
      linkedin: !!profile?.links?.linkedin,
      portfolio: !!profile?.links?.portfolio,
    },
    lastUpdated: profile?.profileStats?.lastUpdated || profile?.updatedAt,
  };
};

// ============ CONTROLLERS ============

/**
 * @desc    Get student dashboard overview
 * @route   GET /api/student/dashboard
 * @access  Private (Student + Verified)
 * @returns Student overview including profile, documents, analytics, alerts
 */
exports.getStudentDashboard = asyncHandler(async (req, res) => {
  // Hinglish: Student aur User ID ko request se nikalna
  const studentId = req.user?.studentId || req.student?._id;
  const userId = req.user?.id || req.user?._id;

  if (!studentId || !userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication data missing',
      data: null,
    });
  }

  try {
    // Hinglish: Student ka data fetch karna
    const student = await Student.findById(studentId);
    if (!student) {
      return res.status(404).json({
        success: false,
        message: 'Student record not found',
        data: null,
      });
    }

    // Hinglish: User ka data fetch karna
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User record not found',
        data: null,
      });
    }

    // Hinglish: Student profile ko fetch karna
    let profile = await StudentProfile.findOne({ student: studentId });
    
    // Agar profile nahi hai toh empty profile create karna
    if (!profile) {
      profile = await StudentProfile.create({
        student: studentId,
        user: userId,
        basicInfo: {
          fullName: student.fullName || '',
          email: user.email || '',
          collegeName: student.college || '',
        },
      });
    }

    // Hinglish: Profile completion percentage calculate karna
    const profileCompletion = calculateProfileCompletion(profile);

    // Hinglish: Verification status ko check karna
    const verificationStatus = profile.verificationStatus || 'draft';
    const alertMessage = generateAlertMessage(verificationStatus);

    // Hinglish: Admin notifications fetch karna
    const notifications = await Notification.find({
      userId: userId,
      userRole: 'student',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Hinglish: Dashboard data ko prepare karna
    const dashboardData = {
      // Hinglish: Student basic info
      student: {
        name: user.email,
        email: user.email,
        role: user.role,
      },

      // Hinglish: Verification status aur alert
      verification: {
        status: verificationStatus,
        statusMessage: alertMessage,
        requestedAt: profile.verificationRequestedAt,
        verifiedAt: profile.verifiedAt,
        rejectionReason: profile.rejectionReason || '',
      },

      // Hinglish: Profile completion
      profileCompletion: {
        percentage: profileCompletion,
        status: profileCompletion === 100 ? 'complete' : 'incomplete',
      },

      // Hinglish: Basic info
      basicInfo: {
        fullName: profile.basicInfo?.fullName || '',
        email: profile.basicInfo?.email || '',
        phone: profile.basicInfo?.phone || '',
        collegeName: profile.basicInfo?.collegeName || '',
        degree: profile.basicInfo?.degree || '',
        branch: profile.basicInfo?.branch || '',
        graduationYear: profile.basicInfo?.graduationYear || '',
        bio: profile.basicInfo?.bio || '',
      },

      // Hinglish: Documents info
      documents: {
        resume: {
          uploaded: !!profile.documents?.resume?.path,
          url: profile.documents?.resume?.path || null,
          uploadedAt: profile.documents?.resume?.uploadedAt || null,
        },
        collegeId: {
          uploaded: !!profile.documents?.collegeId?.path,
          url: profile.documents?.collegeId?.path || null,
          uploadedAt: profile.documents?.collegeId?.uploadedAt || null,
        },
        certificates: profile.documents?.certificates?.map(cert => ({
          filename: cert.filename,
          url: cert.path,
          uploadedAt: cert.uploadedAt,
        })) || [],
      },

      // Hinglish: Profile analytics
      analytics: getProfileAnalytics(profile),

      // Hinglish: Projects count
      projectsCount: profile.projects?.length || 0,

      // Hinglish: Resume URL
      resumeUrl: profile.documents?.resume?.path || null,

      // Hinglish: College ID
      collegeId: profile.collegeId || student.collegeId || null,

      // Hinglish: Alerts
      alerts: [
        {
          type: verificationStatus,
          message: alertMessage,
          severity: verificationStatus === 'approved' ? 'success' : 
                   verificationStatus === 'rejected' ? 'error' : 'warning',
        },
      ],

      // Hinglish: Admin notifications
      notifications: notifications.map(notif => ({
        id: notif._id,
        message: notif.message,
        type: notif.type,
        isRead: notif.isRead,
        createdAt: notif.createdAt,
      })),
    };

    res.status(200).json({
      success: true,
      message: 'Dashboard data fetched successfully',
      data: dashboardData,
    });
  } catch (error) {
    console.error('Dashboard error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error fetching dashboard',
      data: null,
    });
  }
});

/**
 * @desc    Submit student profile for verification (initial submit)
 * @route   POST /api/student/submit-verification
 * @access  Private (Student)
 * @returns Success message with verification details
 */
exports.submitForVerification = asyncHandler(async (req, res) => {
  // Hinglish: Student aur User ID ko request se nikalna
  const studentId = req.user?.studentId || req.student?._id;
  const userId = req.user?.id || req.user?._id;

  if (!studentId || !userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication data missing',
      data: null,
    });
  }

  try {
    // Hinglish: Student profile ko fetch karna
    let profile = await StudentProfile.findOne({ student: studentId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
        data: null,
      });
    }

    // Hinglish: Profile completion check karna
    const profileCompletion = calculateProfileCompletion(profile);
    console.log('✅ Submit for Verification - Profile Completion:', profileCompletion, '% | StudentID:', studentId);
    console.log('📋 Profile data check - basicInfo:', !!profile.basicInfo, 'skills:', !!profile.skills, 'documents:', !!profile.documents);
    
    if (profileCompletion < 50) {
      console.log('❌ Profile completion too low:', profileCompletion, '% < 50%');
      return res.status(400).json({
        success: false,
        message: `Profile is only ${profileCompletion}% complete. Please complete at least 50% before submitting.`,
        data: null,
      });
    }

    // Hinglish: Verification status ko pending mein update karna
    profile.verificationStatus = 'pending';
    profile.verificationRequestedAt = new Date();
    profile.rejectionReason = ''; // Clear previous rejection reason
    await profile.save();
    console.log('✅ Profile saved - verificationStatus: pending | verificationRequestedAt:', profile.verificationRequestedAt);

    // Hinglish: Admin ko notification send karna
    const { sendAdminNotification } = require('../utils/notifications/sendNotification');
    const user = await User.findById(userId);
    
    await sendAdminNotification(
      `New student profile submitted for verification: ${user.email}`,
      'profile-submitted',
      'student',
      profile._id
    );
    console.log('✅ Admin notification sent for student verification request');

    res.status(200).json({
      success: true,
      message: 'Profile submitted for verification successfully',
      data: {
        verificationStatus: 'pending',
        submittedAt: profile.verificationRequestedAt,
      },
    });
  } catch (error) {
    console.error('Submission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error submitting for verification',
      data: null,
    });
  }
});

/**
 * @desc    Resubmit student profile for verification (after rejection)
 * @route   POST /api/student/resubmit-verification
 * @access  Private (Student)
 * @returns Success message with verification details
 */
exports.resubmitForVerification = asyncHandler(async (req, res) => {
  // Hinglish: Student aur User ID ko request se nikalna
  const studentId = req.user?.studentId || req.student?._id;
  const userId = req.user?.id || req.user?._id;

  if (!studentId || !userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication data missing',
      data: null,
    });
  }

  try {
    // Hinglish: Student profile ko fetch karna
    let profile = await StudentProfile.findOne({ student: studentId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Student profile not found',
        data: null,
      });
    }

    // Hinglish: Check karna ki profile rejected hai ya nahi
    if (profile.verificationStatus !== 'rejected') {
      return res.status(400).json({
        success: false,
        message: `Cannot resubmit. Current status is: ${profile.verificationStatus}`,
        data: null,
      });
    }

    // Hinglish: Verification status ko pending mein update karna
    profile.verificationStatus = 'pending';
    profile.verificationRequestedAt = new Date();
    profile.rejectionReason = ''; // Clear previous rejection reason
    await profile.save();

    // Hinglish: Admin ko notification send karna
    const { sendAdminNotification } = require('../utils/notifications/sendNotification');
    const user = await User.findById(userId);
    
    await sendAdminNotification(
      `Student profile resubmitted for verification: ${user.email}`,
      'resubmitted',
      'student',
      profile._id
    );
    console.log('✅ Admin notification sent for student resubmission');

    res.status(200).json({
      success: true,
      message: 'Profile resubmitted for verification successfully',
      data: {
        verificationStatus: 'pending',
        resubmittedAt: profile.verificationRequestedAt,
      },
    });
  } catch (error) {
    console.error('Resubmission error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Error resubmitting for verification',
      data: null,
    });
  }
});
