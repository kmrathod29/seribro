# Phase 3 - Quick Reference & Summary

## Quick Start

### For Development
```bash
# Terminal 1: Backend
cd seribro-backend
npm install
npm start  # Starts at http://localhost:7000

# Terminal 2: Frontend
cd seribro-frontend/client
npm install
npm run dev  # Starts at http://localhost:5173
```

### Default Credentials (For Testing)

#### Admin Account
- **Email**: admin@seribro.com
- **Password**: Admin@123
- **Role**: admin
- **Status**: Uses to verify all student/company profiles

#### Test Student Account
- **Email**: student@test.com
- **Password**: Student@123
- **Role**: student

#### Test Company Account
- **Email**: company@test.com
- **Password**: Company@123
- **Role**: company

---

## Phase 3 Components Summary

### Backend Controllers
1. **studentDashboard.controller.js**
   - `getStudentDashboard()`: Returns complete student overview
   - `submitForVerification()`: Submit profile (50%+ required)
   - `resubmitForVerification()`: Resubmit rejected profile

2. **companyDashboard.controller.js**
   - `getCompanyDashboard()`: Returns complete company overview
   - `submitForVerification()`: Submit profile (50%+ required)
   - `resubmitForVerification()`: Resubmit rejected profile

### Backend Routes
1. **studentDashboard.routes.js**
   - `GET /api/student/dashboard`
   - `POST /api/student/submit-verification`
   - `POST /api/student/resubmit-verification`

2. **companyDashboard.routes.js**
   - `GET /api/company/dashboard`
   - `POST /api/company/submit-verification`
   - `POST /api/company/resubmit-verification`

### Admin Routes (Updated)
- `GET /api/admin/notifications` - Fetch all notifications
- `PATCH /api/admin/notifications/:id/read` - Mark as read

### Frontend Pages
1. **StudentDashboard.jsx** - Student main dashboard page
2. **CompanyDashboard.jsx** - Company main dashboard page
3. **AdminDashboard.jsx** - Updated with notification bell

### Frontend APIs
1. **studentDashboardApi.js** - Student endpoints
2. **companyDashboardApi.js** - Company endpoints
3. **adminNotificationApi.js** - Admin notification endpoints

---

## Key Features

### Verification Status Auto-Alerts
| Status | Alert Message | Color |
|--------|--------------|-------|
| pending | Your profile is pending verification | Yellow |
| rejected | Your profile is rejected — fix issues and resubmit | Red |
| approved | Congrats! Your profile is approved | Green |
| draft | Profile not submitted yet | Gray |

### Profile Completion Thresholds
- **< 50%**: Cannot submit for verification
- **50-99%**: Can submit for verification
- **100%**: Profile complete (optional message)

### Notification Types
- `profile-submitted`: When student/company submits
- `approved`: When admin approves
- `rejected`: When admin rejects
- `info`: General information
- `alert`: Important alerts

---

## Common Issues & Quick Fixes

| Issue | Quick Fix |
|-------|-----------|
| Dashboard returns 404 | Check token is valid, verify authMiddleware working |
| Profile completion is 0% | Fill at least 1 basic field and refresh |
| Cannot see dashboard button | Ensure profile is 50%+ complete |
| Notifications not showing | Check user is admin, verify notifications exist |
| Re-submit button disabled | Profile status must be 'rejected' |
| Admin can't login | Ensure admin record exists in MongoDB |

---

## Database Quick Check

### Check if Admin Exists
```javascript
// In MongoDB
db.users.find({ role: 'admin' })

// Should return:
[{
  _id: ObjectId(...),
  email: "admin@seribro.com",
  role: "admin",
  emailVerified: true,
  ...
}]
```

### Check Notifications
```javascript
// Recent notifications
db.notifications.find().sort({ createdAt: -1 }).limit(10)
```

### Check Student Pending Profiles
```javascript
// Pending students
db.studentprofiles.find({ verificationStatus: "pending" })
```

---

## Testing Checklist

- [ ] Backend server starts without errors
- [ ] Frontend loads at localhost:5173
- [ ] Student can register and login
- [ ] Company can register and login
- [ ] Student dashboard loads and shows data
- [ ] Company dashboard loads and shows data
- [ ] Student can submit profile (if 50%+ complete)
- [ ] Company can submit profile (if 50%+ complete)
- [ ] Admin can login
- [ ] Admin sees notification bell with count
- [ ] Admin can view notifications dropdown
- [ ] Admin can mark notification as read
- [ ] Admin can approve student profile
- [ ] Admin can reject student profile
- [ ] Student gets notification of approval/rejection
- [ ] Rejected student can re-submit

---

## File Locations

### Backend Files
```
seribro-backend/backend/
├── controllers/
│   ├── studentDashboard.controller.js
│   └── companyDashboard.controller.js
├── routes/
│   ├── studentDashboard.routes.js
│   └── companyDashboard.routes.js
├── utils/notifications/
│   └── sendNotification.js
└── models/
    └── Notification.js (existing, used by Phase 3)
```

### Frontend Files
```
seribro-frontend/client/src/
├── pages/
│   ├── students/StudentDashboard.jsx
│   ├── company/CompanyDashboard.jsx
│   └── admin/AdminDashboard.jsx (updated)
└── apis/
    ├── studentDashboardApi.js
    ├── companyDashboardApi.js
    └── adminNotificationApi.js
```

---

## Verification Flow Diagram

```
Student/Company
      |
      v
Fill Profile (50%+ required)
      |
      v
Submit for Verification
      |
      v
Status: "pending"
      |
      v
Admin Notified
      |
      +-- Admin Approves --> Status: "approved"
      |                      Student Notified
      |
      +-- Admin Rejects --> Status: "rejected"
                              Student Notified
                              |
                              v
                          Re-Submit Button Available
                              |
                              v
                          Fill Issues & Re-Submit
                              |
                              v
                          Status: "pending" again
                              |
                              v
                          Cycle Repeats
```

---

## Response Format Examples

### Get Student Dashboard
```javascript
{
  success: true,
  message: "Dashboard data fetched successfully",
  data: {
    student: { name, email, role },
    verification: { status, statusMessage, requestedAt, rejectionReason },
    profileCompletion: { percentage, status },
    basicInfo: { fullName, email, phone, college, degree, branch, graduation },
    documents: { resume, collegeId, certificates },
    analytics: { skillsCount, documentsStatus, portfolioLinks },
    projectsCount: 5,
    resumeUrl: "https://...",
    collegeId: "https://...",
    alerts: [{ type, message, severity }],
    notifications: [{ id, message, type, isRead, createdAt }]
  }
}
```

### Submit for Verification
```javascript
{
  success: true,
  message: "Profile submitted for verification successfully",
  data: {
    verificationStatus: "pending",
    submittedAt: "2025-11-22T10:30:00Z"
  }
}
```

### Get Admin Notifications
```javascript
{
  success: true,
  message: "Notifications fetched successfully",
  data: {
    notifications: [
      {
        id: "...",
        message: "New student profile submitted for verification",
        type: "profile-submitted",
        isRead: false,
        createdAt: "2025-11-22T10:30:00Z"
      }
    ],
    unreadCount: 3,
    total: 25
  }
}
```

---

## Environment Variables

Create `.env` file in `seribro-backend/`:

```bash
# Server
PORT=7000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/seribro

# JWT
JWT_SECRET=your-super-secret-key-here

# Frontend
FRONTEND_URL=http://localhost:5173

# Cloudinary
CLOUDINARY_NAME=your-cloudinary-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

# Email
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=your-email@gmail.com
MAIL_PASS=your-app-password
```

---

## Useful Commands

```bash
# Terminal Commands

# Backend
npm start                 # Start backend server
npm run dev             # With nodemon (if configured)
node scripts/createAdmin.js  # Create admin user (if script exists)

# Frontend
npm run dev             # Start Vite dev server
npm run build           # Build for production
npm run preview         # Preview production build

# Database
# MongoDB Compass: Visual database management
# MongoDB CLI: mongosh or mongo shell
# Check collections: show collections
# View documents: db.students.find()
```

---

## Support Resources

1. **Documentation**: See PHASE_3.md for complete guide
2. **Backend Logs**: Check terminal where `npm start` is running
3. **Frontend Errors**: Check browser DevTools Console
4. **Network Errors**: Check DevTools Network tab
5. **Database**: Use MongoDB Compass to inspect collections

---

## Success Indicators

✅ Phase 3 is working correctly when:
- Student dashboard loads with all data
- Company dashboard loads with all data
- Notifications appear and can be marked read
- Profile can be submitted when 50%+ complete
- Rejected profiles can be resubmitted
- Admin receives notifications of submissions
- Approval/rejection status updates correctly

---

**Version**: Phase 3 v1.0  
**Last Updated**: November 22, 2025  
**Status**: Complete & Ready for Testing
