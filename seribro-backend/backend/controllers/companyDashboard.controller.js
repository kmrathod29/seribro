// backend/controllers/companyDashboard.controller.js
// Company Dashboard Controller - Phase 3
// Hinglish: Company ke dashboard ke liye complete overview return karta hai

const asyncHandler = require('express-async-handler');
const CompanyProfile = require('../models/companyProfile');
const Company = require('../models/Company');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { calculateCompanyProfileCompletion } = require('../utils/company/calculateCompanyProfileCompletion');

// ============ HELPER FUNCTIONS ============

/**
 * Hinglish: Company ka verification status check karte hue appropriate alert message generate karna
 */
const generateAlertMessage = (verificationStatus) => {
  switch (verificationStatus) {
    case 'pending':
      return 'Your company profile is pending verification';
    case 'rejected':
      return 'Your company profile is rejected — fix issues and resubmit';
    case 'approved':
      return 'Congrats! Your company profile is approved';
    case 'draft':
      return 'Your company profile is in draft status. Complete and submit for verification';
    default:
      return 'Your company profile is pending review';
  }
};

/**
 * Hinglish: Company ke profile completion percentage calculate karna
 * Yeh strict calculation use karta hai jo project posting ke liye required fields check karta hai
 */
const getProfileCompletion = (profile) => {
  const { percentage, profileComplete, missingFields } = calculateCompanyProfileCompletion(profile);
  return { percentage, profileComplete, missingFields };
};

/**
 * Hinglish: Company profile analytics prepare karna
 */
const getCompanyAnalytics = (profile) => {
  return {
    documentsStatus: {
      total: profile?.documents?.length || 0,
      uploaded: profile?.documents?.length || 0,
    },
    logoStatus: {
      uploaded: !!profile?.logoUrl,
    },
    authorizedPersonStatus: {
      nameProvided: !!profile?.authorizedPerson?.name,
      emailProvided: !!profile?.authorizedPerson?.email,
    },
    lastUpdated: profile?.updatedAt,
  };
};

// ============ CONTROLLERS ============

/**
 * @desc    Get company dashboard overview
 * @route   GET /api/company/dashboard
 * @access  Private (Company)
 * @returns Company overview including profile, documents, analytics, alerts
 */
exports.getCompanyDashboard = asyncHandler(async (req, res) => {
  // Hinglish: Company aur User ID ko request se nikalna
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication data missing',
      data: null,
    });
  }

  try {
    // Hinglish: User ka data fetch karna
    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User record not found',
        data: null,
      });
    }

    // Hinglish: Company profile ko fetch karna
    let profile = await CompanyProfile.findOne({ user: userId });
    
    // Agar profile nahi hai toh empty profile create karna
    if (!profile) {
      profile = await CompanyProfile.create({
        user: userId,
        companyName: '',
        companyEmail: user.email || '',
      });
    }

    // Hinglish: Profile completion percentage calculate karna
    const { percentage, profileComplete } = getProfileCompletion(profile);

    // Hinglish: Verification status ko check karna
    const verificationStatus = profile.verificationStatus || 'draft';
    const alertMessage = generateAlertMessage(verificationStatus);

    // Hinglish: Admin notifications fetch karna
    const notifications = await Notification.find({
      userId: userId,
      userRole: 'company',
    })
      .sort({ createdAt: -1 })
      .limit(10);

    // Hinglish: Dashboard data ko prepare karna
    const dashboardData = {
      // Hinglish: Company basic info
      company: {
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
        percentage: percentage,
        status: percentage === 100 ? 'complete' : 'incomplete',
      },

      // Hinglish: Company info
      companyInfo: {
        companyName: profile.companyName || '',
        companyEmail: profile.companyEmail || '',
        mobile: profile.mobile || '',
        website: profile.website || '',
        industryType: profile.industryType || '',
        companySize: profile.companySize || '',
        about: profile.about || '',
        gstNumber: profile.gstNumber || '',
        logoUrl: profile.logoUrl || null,
      },

      // Hinglish: Office address
      officeAddress: {
        addressLine: profile.officeAddress?.addressLine || '',
        city: profile.officeAddress?.city || '',
        state: profile.officeAddress?.state || '',
        postal: profile.officeAddress?.postal || '',
      },

      // Hinglish: Authorized person details
      authorizedPerson: {
        name: profile.authorizedPerson?.name || '',
        designation: profile.authorizedPerson?.designation || '',
        email: profile.authorizedPerson?.email || '',
        linkedIn: profile.authorizedPerson?.linkedIn || '',
      },

      // Hinglish: Documents info
      documents: profile.documents?.map(doc => ({
        url: doc.url,
        type: doc.type,
      })) || [],

      // Hinglish: Profile analytics
      analytics: getCompanyAnalytics(profile),

      // Phase 4.1: Project management stats
      projects: {
        postedCount: profile.postedProjectsCount || 0,
        activeCount: profile.activeProjectsCount || 0,
      },

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
      message: 'Company dashboard data fetched successfully',
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
 * @desc    Submit company profile for verification
 * @route   POST /api/company/submit-verification
 * @access  Private (Company)
 * @returns Success message with verification details
 */
exports.submitForVerification = asyncHandler(async (req, res) => {
  // Hinglish: User ID ko request se nikalna
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication data missing',
      data: null,
    });
  }

  try {
    // Hinglish: Company profile ko fetch karna
    let profile = await CompanyProfile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
        data: null,
      });
    }

    // Hinglish: Profile completion check karna
    const { percentage } = getProfileCompletion(profile);
    if (percentage < 50) {
      return res.status(400).json({
        success: false,
        message: `Profile is only ${percentage}% complete. Please complete at least 50% before submitting.`,
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
      `New company profile submitted for verification: ${profile.companyName || user.email}`,
      'profile-submitted',
      'company',
      profile._id
    );
    console.log('✅ Admin notification sent for company verification request');

    res.status(200).json({
      success: true,
      message: 'Company profile submitted for verification successfully',
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
 * @desc    Resubmit company profile for verification (after rejection)
 * @route   POST /api/company/resubmit-verification
 * @access  Private (Company)
 * @returns Success message with verification details
 */
exports.resubmitForVerification = asyncHandler(async (req, res) => {
  // Hinglish: User ID ko request se nikalna
  const userId = req.user?.id || req.user?._id;

  if (!userId) {
    return res.status(401).json({
      success: false,
      message: 'Authentication data missing',
      data: null,
    });
  }

  try {
    // Hinglish: Company profile ko fetch karna
    let profile = await CompanyProfile.findOne({ user: userId });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: 'Company profile not found',
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
      `Company profile resubmitted for verification: ${profile.companyName || user.email}`,
      'resubmitted',
      'company',
      profile._id
    );
    console.log('✅ Admin notification sent for company resubmission');

    res.status(200).json({
      success: true,
      message: 'Company profile resubmitted for verification successfully',
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
