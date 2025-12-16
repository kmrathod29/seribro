# Phase 3 Complete Implementation Guide

## Overview
Phase 3 implements complete Student Dashboard, Company Dashboard, Admin Notification System, and Verification Request Flow for the Seribro platform.

---

## Table of Contents
1. [Phase 3 Features](#phase-3-features)
2. [Admin Credentials & Setup](#admin-credentials--setup)
3. [Complete Test Flow](#complete-test-flow)
4. [API Endpoints](#api-endpoints)
5. [File Structure](#file-structure)
6. [Troubleshooting](#troubleshooting)

---

## Phase 3 Features

### 1. Student Dashboard
- **Complete Overview**: Student account information, email, role, verification status
- **Profile Completion Tracking**: Real-time percentage calculation
- **Verification Status Banner**: Auto-generated alerts based on status
  - Pending: "Your profile is pending verification"
  - Rejected: "Your profile is rejected — fix issues and resubmit"
  - Approved: "Congrats! Your profile is approved"
- **Document Management**: Resume, College ID, Certificates status display
- **Profile Analytics**: Skills count, documents status, portfolio links
- **Submit for Verification Button**: For verified students with 50%+ completion
- **Re-Submit for Verification Button**: For rejected profiles
- **Recent Notifications**: Latest 5 notifications from admin

### 2. Company Dashboard
- **Company Profile Overview**: Company name, email, logo, industry type, company size
- **Verification Status**: Same auto-generated alerts as student
- **Profile Completion Tracking**: Percentage-based completion
- **Company Details**: Full address, website, GST number, mobile
- **Authorized Person Info**: Name, designation, email, LinkedIn
- **Document Management**: Uploaded documents display with view links
- **Submit/Re-Submit Buttons**: Based on verification status
- **Notifications Panel**: Latest company-related notifications

### 3. Admin Notification System
- **Notification Model**: userId, userRole, message, type, isRead, createdAt, relatedProfileType, relatedProfileId
- **Notification Triggers**:
  - Student profile submitted for verification
  - Company profile submitted for verification
  - Admin approval notifications
  - Admin rejection notifications
  - Resubmission after rejection
- **Bell Icon with Unread Count**: On admin dashboard
- **Notification Dropdown**: Shows latest 10 notifications
- **Mark as Read**: Click notification to mark as read
- **Auto-refresh**: Notifications refresh every 30 seconds

### 4. Verification Request Flow
- **Submit for Verification**: Check 50%+ profile completion, set status to 'pending', log action, notify admin
- **Re-Submit After Rejection**: Clear rejectionReason, set status to 'pending', notify admin
- **No Breaking Changes**: All Phase 1 & Phase 2 logic preserved
- **Consistent API Response Format**: `{ success, message, data }`

---

## Admin Credentials & Setup

### How to Create Admin User (First Time)

Since you don't have admin credentials yet, follow these steps:

#### Option 1: Create Admin via Database (Recommended)
1. Connect to MongoDB directly using MongoDB Compass or CLI
2. Create a new document in `users` collection with these fields:
```javascript
{
  "email": "admin@seribro.com",
  "password": "$2a$10$...", // Use bcrypt to hash "Admin@123"
  "role": "admin",
  "emailVerified": true,
  "profileCompleted": true,
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

#### Option 2: Create via MongoDB Atlas Dashboard
1. Navigate to MongoDB Atlas Dashboard
2. Find the database
3. Create new document in `users` collection
4. Set email to `admin@seribro.com` and role to `admin`

#### Option 3: Backend CLI Script (Create script if needed)
```bash
# Create a file: scripts/createAdmin.js
# Run: node scripts/createAdmin.js
```

### Default Admin Login (After Setup)
- **Email**: `admin@seribro.com`
- **Password**: `Admin@123`

---

## Complete Test Flow

### Step 1: Student Registration & Signup
```
1. Navigate to: http://localhost:5173/signup
2. Select Role: "Student"
3. Enter Email: student@test.com
4. Click "Send OTP"
5. Check email/logs for OTP
6. Enter OTP
7. Set Password: Student@123
8. Click "Sign Up"
9. Redirect to Login Page
```

### Step 2: Student Login
```
1. Navigate to: http://localhost:5173/login
2. Enter Email: student@test.com
3. Enter Password: Student@123
4. Click "Login"
5. Wait for OTP verification (if required)
6. Verify OTP
7. Redirect to Dashboard or Profile Setup
```

### Step 3: Fill Student Profile
```
1. Navigate to: /student/profile
2. Fill Basic Information:
   - Full Name: John Doe
   - Email: student@test.com (auto-filled)
   - Phone: 9876543210
   - College Name: IIT Bombay
   - Degree: B.Tech
   - Branch: Computer Science
   - Graduation Year: 2025
3. Add Technical Skills: React, Node.js, MongoDB
4. Add Soft Skills: Leadership, Communication
5. Add Languages: English, Hindi
6. Upload Resume (PDF file)
7. Upload College ID (Image file)
8. Add GitHub Link: https://github.com/student
9. Add LinkedIn Link: https://linkedin.com/in/student
10. Add Projects (at least 1):
    - Title: E-Commerce Platform
    - Description: Full stack e-commerce app
    - Technologies: React, Node.js, MongoDB
    - Link: https://github.com/student/ecommerce
    - Duration: 3 months
11. Click "Save Profile"
12. Profile completion should reach 50-80%
```

### Step 4: Student Dashboard Access
```
1. Navigate to: /student/dashboard
2. Verify displaying:
   - Profile Completion: X% (should be 50%+)
   - Account Overview: Email, Role, Verification Status
   - Documents: Resume (Uploaded), College ID (Uploaded), Certificates (0)
   - Basic Information: All filled fields
   - Profile Analytics: Skills count, documents status
   - Recent Notifications: Empty initially
```

### Step 5: Submit Profile for Verification
```
1. On Student Dashboard, click "Submit for Verification"
2. If profile < 50%: Error message "Profile is only X% complete"
3. If profile >= 50%:
   - Success message: "Profile submitted for verification successfully"
   - Status changes to: "pending"
   - Button changes to: (Disabled during pending)
4. Profile now visible in Admin's "Pending Students" list
```

### Step 6: Company Registration & Signup
```
1. Navigate to: http://localhost:5173/signup
2. Select Role: "Company"
3. Enter Company Email: company@test.com
4. Select Company Name: Tech Solutions Pvt Ltd
5. Enter Contact Person: Ram Kumar
6. Upload Verification Document: GST certificate or Incorporation doc
7. Click "Send OTP"
8. Verify OTP
9. Set Password: Company@123
10. Click "Sign Up"
11. Redirect to Login
```

### Step 7: Fill Company Profile
```
1. Navigate to: /company/profile
2. Fill Company Information:
   - Company Name: Tech Solutions Pvt Ltd (auto-filled)
   - Email: company@test.com
   - Mobile: 9999999999
   - Website: https://techsolutions.com
   - Industry Type: Software Development
   - Company Size: 50-100
   - GST Number: 27AABCS1234B1Z5
3. Fill Address:
   - Address Line: 123 Tech Park, Downtown
   - City: Bangalore
   - State: Karnataka
   - Postal: 560001
4. Fill About Company:
   - "Leading software development company focused on web and mobile solutions"
5. Upload Company Logo (Image)
6. Add Authorized Person:
   - Name: Ram Kumar
   - Designation: Managing Director
   - Email: ram@techsolutions.com
   - LinkedIn: https://linkedin.com/in/ramkumar
7. Upload Documents: GST certificate, Incorporation doc
8. Click "Save Profile"
9. Profile completion should reach 60-80%
```

### Step 8: Company Dashboard Access
```
1. Navigate to: /company/dashboard
2. Verify displaying:
   - Profile Completion: X% (should be 50%+)
   - Account Overview: Email, Role, Verification Status
   - Company Info: Name, Industry, Size
   - Company Details: All filled information
   - Office Address: Complete address
   - Authorized Person: Full details
   - Uploaded Documents: All documents visible
   - Recent Notifications: Empty initially
```

### Step 9: Submit Company Profile
```
1. On Company Dashboard, click "Submit for Verification"
2. If profile < 50%: Error message
3. If profile >= 50%:
   - Success: "Company profile submitted for verification successfully"
   - Status changes to: "pending"
   - Notification sent to admin
```

### Step 10: Admin Login
```
1. Navigate to: http://localhost:5173/login
2. Enter Email: admin@seribro.com
3. Enter Password: Admin@123
4. Click "Login"
5. Redirect to Admin Dashboard
```

### Step 11: Admin Dashboard - View Notifications
```
1. On Admin Dashboard, click Bell Icon (top right)
2. Dropdown shows:
   - Unread notification count (red badge)
   - Latest notifications:
     * "New student profile submitted for verification: student@test.com"
     * "New company profile submitted for verification: Tech Solutions Pvt Ltd"
   - Each notification shows:
     * Message
     * Type: profile-submitted
     * Submitted timestamp
     * Blue dot if unread
3. Click notification to mark as read
4. Blue dot disappears
5. Click "Refresh Notifications" button to fetch latest
```

### Step 12: Admin Review Pending Submissions
```
1. Click "Pending Students" link on Admin Dashboard
2. View table with all pending students:
   - Type: Student
   - Name: John Doe
   - Email: student@test.com
   - College: IIT Bombay
   - Submitted: Timestamp
   - Action: "View" link
3. Click "View" to see student details and approval/rejection buttons
4. Similarly, click "Pending Companies" to see company submissions
```

### Step 13: Admin Approve Student Profile
```
1. Navigate to: /admin/student/:id
2. Review all student information:
   - Basic info
   - Skills
   - Projects
   - Documents
   - Links
3. Click "Approve" button
4. Enter approval comment: "Great profile! All documents verified."
5. Click "Confirm Approve"
6. Success message: "Student verification approved"
7. Notification sent to student
8. Student verification status changes to "approved"
9. Student's dashboard shows success message: "Congrats! Your profile is approved"
```

### Step 14: Admin Reject Student Profile (Test Re-submit)
```
1. Navigate to: /admin/student/:student_id_2
2. Review student information
3. Click "Reject" button
4. Enter rejection reason: "Resume not properly formatted"
5. Click "Confirm Reject"
6. Success message: "Student verification rejected"
7. Notification sent to student with rejection reason
8. Back to student:
   - Login as rejected student
   - Navigate to /student/dashboard
   - See rejection banner with reason
   - Click "Re-Submit for Verification"
   - Fix the resume
   - Submit again
   - Status changes back to "pending"
   - Admin can review again
```

### Step 15: Verify Notification Flow
```
1. As Student (login):
   - Complete profile
   - Submit for verification
   - Check /student/dashboard for "Pending" status
   - Wait for admin action

2. As Admin (login):
   - Check Bell Icon - shows notification
   - Click Pending Students
   - View student details
   - Approve/Reject student

3. Back to Student:
   - Logout and login
   - Go to /student/dashboard
   - See notification from admin
   - Status updated (approved/rejected)
   - If rejected, see "Re-Submit for Verification" button

4. Company Flow: Same as student
```

---

## API Endpoints

### Student Dashboard Endpoints
```
GET /api/student/dashboard
- Protected: authMiddleware + roleCheck('student') + isVerified
- Returns: Complete student dashboard data
- Response: { success, message, data: { student, verification, profileCompletion, ... } }

POST /api/student/submit-verification
- Protected: authMiddleware + roleCheck('student')
- Body: None
- Returns: { success, message, data: { verificationStatus, submittedAt } }
- Validation: Profile >= 50% complete

POST /api/student/resubmit-verification
- Protected: authMiddleware + roleCheck('student')
- Body: None
- Returns: { success, message, data: { verificationStatus, resubmittedAt } }
- Validation: Current status must be 'rejected'
```

### Company Dashboard Endpoints
```
GET /api/company/dashboard
- Protected: authMiddleware + roleCheck('company')
- Returns: Complete company dashboard data
- Response: { success, message, data: { company, verification, profileCompletion, ... } }

POST /api/company/submit-verification
- Protected: authMiddleware + roleCheck('company')
- Body: None
- Returns: { success, message, data: { verificationStatus, submittedAt } }
- Validation: Profile >= 50% complete

POST /api/company/resubmit-verification
- Protected: authMiddleware + roleCheck('company')
- Body: None
- Returns: { success, message, data: { verificationStatus, resubmittedAt } }
- Validation: Current status must be 'rejected'
```

### Admin Notification Endpoints
```
GET /api/admin/notifications
- Protected: authMiddleware + adminOnly
- Returns: { success, message, data: { notifications: [], unreadCount, total } }
- Pagination: Latest 50 notifications

PATCH /api/admin/notifications/:id/read
- Protected: authMiddleware + adminOnly
- Returns: { success, message, data: { id, isRead, readAt } }
```

---

## File Structure

### Backend (Phase 3 New Files)
```
seribro-backend/backend/
├── controllers/
│   ├── studentDashboard.controller.js (NEW)
│   └── companyDashboard.controller.js (NEW)
├── routes/
│   ├── studentDashboard.routes.js (NEW)
│   └── companyDashboard.routes.js (NEW)
├── models/
│   └── Notification.js (UPDATED - already exists)
├── utils/
│   └── notifications/
│       └── sendNotification.js (NEW)
└── [Other existing files unchanged]
```

### Frontend (Phase 3 New Files)
```
seribro-frontend/client/src/
├── pages/
│   ├── students/
│   │   └── StudentDashboard.jsx (NEW)
│   ├── company/
│   │   └── CompanyDashboard.jsx (UPDATED from placeholder)
│   └── admin/
│       └── AdminDashboard.jsx (UPDATED - notification system added)
├── apis/
│   ├── studentDashboardApi.js (NEW)
│   ├── companyDashboardApi.js (NEW)
│   └── adminNotificationApi.js (NEW)
└── [Other existing files unchanged]
```

---

## Database Schema Changes

### Notification Model
```javascript
{
  userId: ObjectId (ref: User),
  userRole: String (enum: ['student', 'company', 'admin']),
  message: String (max 500),
  type: String (enum: ['profile-submitted', 'approved', 'rejected', 'info', 'alert']),
  isRead: Boolean (default: false),
  relatedProfileType: String (enum: ['student', 'company']),
  relatedProfileId: ObjectId,
  createdAt: Date,
  readAt: Date (null initially)
}
```

### StudentProfile Model Updates
```javascript
// Existing fields maintained, verification fields used:
{
  verificationStatus: String (enum: ['draft', 'pending', 'approved', 'rejected']),
  verificationRequestedAt: Date,
  verifiedAt: Date,
  verifiedByAdmin: ObjectId (ref: User),
  rejectionReason: String (max 500)
}
```

### CompanyProfile Model Updates
```javascript
// Existing fields maintained, verification fields used:
{
  verificationStatus: String (enum: ['draft', 'pending', 'approved', 'rejected']),
  verificationRequestedAt: Date,
  verifiedAt: Date,
  verifiedByAdmin: ObjectId (ref: User),
  rejectionReason: String (max 500)
}
```

---

## Key Implementation Details

### Alert Generation Logic
```javascript
// Based on verificationStatus:
pending → "Your profile is pending verification" (warning - yellow)
rejected → "Your profile is rejected — fix issues and resubmit" (error - red)
approved → "Congrats! Your profile is approved" (success - green)
draft → [No submission button shown]
```

### Profile Completion Calculation
- **Student**: Sum of filled fields / Total fields * 100
  - Basic info fields: 7 (name, email, phone, college, degree, branch, year)
  - Skills: 2 (technical + soft)
  - Documents: 2 (resume + college ID)
  - Links: 2 (github + linkedin)
  - Projects: 1
  - **Total**: ~14 fields
  - **Minimum to submit**: 50%

- **Company**: Sum of filled fields / Total fields * 100
  - Company info: 6 (name, email, mobile, website, industry, size)
  - Address: 3 (line, city, state, postal)
  - About: 1
  - Logo: 1
  - Documents: 1
  - Authorized person: 2 (name + email)
  - GST: 1
  - **Total**: ~15 fields
  - **Minimum to submit**: 50%

### Notification Triggers
```javascript
// When student/company submits:
await sendNotification(
  adminUserId,
  'admin',
  'New student profile submitted...',
  'profile-submitted',
  'student',
  studentProfileId
);

// When admin approves:
await sendNotification(
  studentUserId,
  'student',
  'Your profile has been approved!',
  'approved',
  'student',
  studentProfileId
);

// When admin rejects:
await sendNotification(
  studentUserId,
  'student',
  'Your profile was rejected. Reason: ...',
  'rejected',
  'student',
  studentProfileId
);
```

---

## Troubleshooting

### Issue: "Dashboard not found" / 404 Error
**Solution**:
1. Verify backend routes are mounted in server.js
2. Check URL is correct: `/api/student/dashboard` not `/api/student/profile/dashboard`
3. Ensure authentication token is valid
4. Check browser console for actual error

### Issue: "Profile is pending verification" - Can't resubmit
**Solution**:
1. This is expected behavior
2. Only "rejected" profiles can be resubmitted
3. Wait for admin review or ask admin to reject

### Issue: Notification dropdown doesn't show
**Solution**:
1. Check if admin is logged in correctly
2. Verify `/api/admin/notifications` endpoint returns data
3. Check browser console for API errors
4. Ensure Bell icon is visible (top right of admin dashboard)

### Issue: Profile completion shows 0%
**Solution**:
1. Fill at least basic information first
2. Refresh page to recalculate
3. Check if fields are being saved properly

### Issue: "Cannot mark notification as read"
**Solution**:
1. Ensure notification ID is correct
2. Verify user has permission to mark that notification
3. Check network requests in browser DevTools

### Issue: Admin can't approve/reject profiles
**Solution**:
1. Ensure logged in as admin (role = 'admin')
2. Check if profile exists and is in 'pending' status
3. Verify MongoDB connection
4. Check backend logs for errors

---

## Environment Variables Needed

```bash
# .env file (Backend)
PORT=7000
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/seribro
JWT_SECRET=your-secret-key
FRONTEND_URL=http://localhost:5173
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
```

---

## API Response Format (Consistent)

All API responses follow this format:

### Success Response
```javascript
{
  success: true,
  message: "Operation successful",
  data: {
    // Response data
  }
}
```

### Error Response
```javascript
{
  success: false,
  message: "Error description",
  data: null
}
```

---

## Next Steps After Phase 3

1. **Phase 4**: Job Listings & Applications
2. **Phase 5**: Student-Company Matching
3. **Phase 6**: Notifications & Messaging
4. **Phase 7**: Analytics & Reporting
5. **Phase 8**: Advanced Features

---

## Support & Questions

For issues or questions about Phase 3 implementation:
1. Check this documentation first
2. Review API endpoint responses in browser DevTools
3. Check MongoDB data using MongoDB Compass
4. Review backend logs in terminal
5. Check React component props in React DevTools

---

**Last Updated**: November 22, 2025  
**Phase**: Phase 3 (Dashboards & Verification System)  
**Status**: Complete Implementation
