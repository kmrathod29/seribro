// models/Notification.js
// Hinglish: Notification model - admin, student, aur company ke liye notifications

const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  // Hinglish: Kis user ke liye notification hai
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Hinglish: User ka role - student, company ya admin
  userRole: {
    type: String,
    enum: ['student', 'company', 'admin'],
    required: true
  },
  
  // Hinglish: Notification ka message
  message: {
    type: String,
    required: true,
    maxlength: 500
  },
  
  // Hinglish: Notification ki type
  type: {
    type: String,
    enum: [
      // Phase 3: Profile verification
      'profile-submitted', 'approved', 'rejected', 'resubmitted', 'info',
      // Phase 4: Application workflow
      'application_submitted', 'application_received', 'application_shortlisted',
      'application_accepted', 'application_rejected', 'project_assigned'
    ],
    required: true
  },
  
  // Hinglish: Kya notification read ho gayi hai?
  isRead: {
    type: Boolean,
    default: false,
    index: true
  },
  
  // Hinglish: Related profile type - student ya company
  relatedProfileType: {
    type: String,
    enum: ['student', 'company', null],
    default: null
  },
  
  // Hinglish: Related profile ID (StudentProfile ya CompanyProfile)
  relatedProfileId: {
    type: mongoose.Schema.Types.ObjectId,
    default: null
  }
}, {
  timestamps: true
});

// Hinglish: Compound index for efficient queries
NotificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);

module.exports = Notification;
