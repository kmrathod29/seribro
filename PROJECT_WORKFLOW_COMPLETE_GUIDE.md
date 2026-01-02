# 🎯 COMPLETE PROJECT WORKFLOW GUIDE
## From Project Posting to Completion

---

## 📋 TABLE OF CONTENTS
1. [Phase 1: Company Posts Project](#phase-1-company-posts-project)
2. [Phase 2: Student Browses & Applies](#phase-2-student-browses--applies)
3. [Phase 3: Company Reviews Applications](#phase-3-company-reviews-applications)
4. [Phase 4: Project Acceptance & Workspace](#phase-4-project-acceptance--workspace)
5. [Phase 5: Work Submission & Review](#phase-5-work-submission--review)
6. [Phase 6: Payment & Rating](#phase-6-payment--rating)
7. [API Endpoints Reference](#api-endpoints-reference)
8. [Database Status Tracking](#database-status-tracking)

---

# PHASE 1: COMPANY POSTS PROJECT

## Step 1.1: Company Logs In
**URL:** `http://localhost:5173/login`

**What Happens:**
- Company enters email and password
- Backend verifies credentials via `/api/auth/login`
- JWT token stored in localStorage
- Company is redirected to `/company/dashboard`

**Backend Route:** `POST /api/auth/login`
**API File:** `authController.js`

---

## Step 1.2: Company Completes Profile (Required)
**URL:** `http://localhost:5173/company/profile`

**Requirements:**
- Company must be 100% profile complete to post projects
- Profile completion includes:
  - ✅ Basic Info (company name, email, phone)
  - ✅ Company Details (industry, employees, founded year)
  - ✅ Authorized Person info
  - ✅ Logo upload
  - ✅ Verification documents

**Backend Validation:**
```javascript
// Check in companyProjectController.js
const profileCompletion = calculateCompanyProfileCompletion(companyProfile);
if (profileCompletion < 100) {
  return "Please complete your profile 100% to post projects";
}
```

**Profile Completion API:** `GET /api/company/dashboard`

---

## Step 1.3: Company Posts Project
**URL:** `http://localhost:5173/company/post-project`

### Form Fields:
```
1. Project Title (5-100 characters)
2. Description (20-5000 characters)
3. Category (dropdown - e.g., Web Dev, AI/ML, Mobile App, etc.)
4. Required Skills (multi-select - Tech, Soft, Languages)
5. Budget Range (Min & Max amount in ₹)
6. Project Duration (30, 60, 90 days dropdown)
7. Deadline (future date picker)
```

### Validation Before Submit:
✅ Profile must be 100% complete
✅ No duplicate active projects with same title (case-insensitive)
✅ Budget Min < Max
✅ Deadline must be in future
✅ At least 1 skill selected

**Backend Route:** `POST /api/company/projects/create`

**Request Payload:**
```javascript
{
  "title": "Build AI Chatbot",
  "description": "Create an AI-powered chatbot using GPT...",
  "category": "AI/ML",
  "requiredSkills": ["Python", "Machine Learning", "API Design"],
  "budgetMin": 10000,
  "budgetMax": 25000,
  "projectDuration": "60",
  "deadline": "2025-06-01T00:00:00.000Z"
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Project created successfully",
  "data": {
    "project": {
      "_id": "507f1f77bcf86cd799439011",
      "title": "Build AI Chatbot",
      "status": "open",  // ⭐ NEW PROJECT STARTS HERE
      "companyId": "507f1f77bcf86cd799439012",
      "createdAt": "2025-05-15T10:30:00.000Z"
    }
  }
}
```

---

## Step 1.4: Project Status is "OPEN"
**Database:** `Project` collection
```javascript
{
  "_id": ObjectId,
  "title": "Build AI Chatbot",
  "companyId": ObjectId,
  "status": "open",        // ⭐ Project posted - waiting for applications
  "applicationsCount": 0,
  "createdAt": timestamp,
  "messageCount": 0,
  "workspaceCreatedAt": null  // Created when student accepts
}
```

**Where Project Appears Now:**
✅ `/company/projects` - My Projects page
✅ `/student/browse-projects` - Browse Projects page
✅ `/browse-projects` - Public Projects page
✅ `/admin/projects` - Admin Projects page

---

# PHASE 2: STUDENT BROWSES & APPLIES

## Step 2.1: Student Logs In
**URL:** `http://localhost:5173/login`

**What Happens:**
- Student enters email and password
- JWT token stored, redirected to `/student/dashboard`

---

## Step 2.2: Student Browses Projects
**URL:** `http://localhost:5173/student/browse-projects`

**Features:**
- Filter by category, skills, budget range
- Search by title/description
- See all "open" status projects
- View project card showing:
  - Title, Company name
  - Budget (₹10,000 - ₹25,000)
  - Skills required
  - Deadline countdown
  - "Apply" button

**Backend Route:** `GET /api/student/projects/browse?category=AI&skills=Python&budgetMin=10000`

---

## Step 2.3: Student Views Project Details
**URL:** `http://localhost:5173/student/projects/:projectId`

**What Student Sees:**
- Full project description
- All required skills
- Budget range
- Deadline
- Company profile preview
- "Apply Now" button

**Backend Route:** `GET /api/student/projects/:projectId`

---

## Step 2.4: Student Submits Application
**URL:** Same as Step 2.3 (form on project details page)

### Application Form Fields:
```
1. Cover Letter (150-1000 characters)
   "I have 2 years of Python experience..."

2. Proposed Price (₹)
   "₹15,000"

3. Portfolio Link (optional)
   "https://github.com/student/projects"

4. Expected Delivery (days)
   "45 days"
```

### Validation:
✅ Cover letter required
✅ Proposed price must be within project budget range
✅ Portfolio URL must be valid (optional)

**Backend Route:** `POST /api/student/projects/:projectId/apply`

**Request Payload:**
```javascript
{
  "proposalText": "I have 2 years of Python experience...",
  "proposedPrice": 15000,
  "portfolioLink": "https://github.com/student/projects",
  "estimatedDays": 45
}
```

**Response:**
```javascript
{
  "success": true,
  "message": "Application submitted successfully",
  "data": {
    "application": {
      "_id": "507f1f77bcf86cd799439013",
      "projectId": "507f1f77bcf86cd799439011",
      "studentId": "507f1f77bcf86cd799439014",
      "status": "pending",        // ⭐ APPLICATION CREATED
      "proposedPrice": 15000,
      "createdAt": "2025-05-15T11:00:00.000Z"
    }
  }
}
```

---

## Step 2.5: Application Status is "PENDING"
**Database:** `Application` collection
```javascript
{
  "_id": ObjectId,
  "projectId": ObjectId,
  "studentId": ObjectId,
  "companyId": ObjectId,
  "status": "pending",     // ⭐ Waiting for company review
  "proposedPrice": 15000,
  "proposalText": "I have 2 years...",
  "portfolioLink": "https://github.com/...",
  "estimatedDays": 45,
  "createdAt": timestamp
}
```

---

## Step 2.6: Student Can See Application Status
**URL:** `http://localhost:5173/student/my-applications`

**Features:**
- List of all applications
- Status badge: "Pending" (yellow)
- Project details in card
- "Withdraw" button (if still pending)

**Backend Route:** `GET /api/student/projects/my-applications`

---

# PHASE 3: COMPANY REVIEWS APPLICATIONS

## Step 3.1: Company Gets Notification
**Notification System:**
- Company receives in-app notification
- Bell icon shows notification count
- Notification text: "New application for project 'Build AI Chatbot'"

**Backend Route:** `POST /api/notifications` (created automatically by `sendNotification` function)

---

## Step 3.2: Company Views Applications
**URL:** `http://localhost:5173/company/applications`

**What Company Sees:**
- All applications across ALL projects
- Filter by status (Pending, Accepted, Rejected)
- Application cards showing:
  - Student name & profile photo
  - Project title
  - Proposed price
  - Cover letter preview
  - Application date
  - Actions: "View Details", "Accept", "Reject"

**Backend Route:** `GET /api/company/applications?status=pending`

---

## Step 3.3: Company Views Application Details
**URL:** (Modal or dedicated page)

**Details Shown:**
- Full student profile
- Resume link
- Full cover letter
- Portfolio link
- Proposed price & timeline
- Student skills match percentage

**Backend Route:** `GET /api/company/applications/:applicationId`

---

## Step 3.4: Company Accepts Student
**Action:** Click "Accept" button on application

### What Happens:

**1. Backend Updates Application:**
```javascript
// POST /api/company/applications/:applicationId/approve

// Application status changes to "accepted"
application.status = "accepted"
application.acceptedAt = new Date()
```

**2. All Other Applications for Same Project are REJECTED:**
```javascript
// Auto-reject other pending applications
Application.updateMany(
  { projectId: projectId, studentId: { $ne: acceptedStudentId }, status: "pending" },
  { status: "rejected", rejectionReason: "Another student was selected" }
)
```

**3. Project Status Changes to "ASSIGNED":**
```javascript
project.status = "assigned"
project.assignedStudent = studentId
project.selectedStudentId = studentId
project.messageCount = 0
project.workspaceCreatedAt = new Date()
```

**4. Project Workspace is Created:**
- This enables the `/workspace/projects/:projectId` route
- Message board becomes available
- Work submission becomes available

**5. Notifications Sent:**
```javascript
// To accepted student:
"Congratulations! You've been selected for project 'Build AI Chatbot'"

// To rejected students:
"Your application for 'Build AI Chatbot' was not selected"
```

---

# PHASE 4: PROJECT ACCEPTANCE & WORKSPACE

## Step 4.1: Project Status Changes
**Database Update:**
```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "assigned",           // ⭐ Changed from "open"
  "assignedStudent": "507f1f77bcf86cd799439014",
  "selectedStudentId": "507f1f77bcf86cd799439014",
  "applicationsCount": 3,
  "workspaceCreatedAt": "2025-05-15T12:00:00.000Z"
}
```

---

## Step 4.2: Workspace Route Becomes Available
**URL:** `http://localhost:5173/workspace/projects/:projectId`

**Access Control:**
- Only assigned student can access
- Only company owner can access
- Both get 401/403 if not authorized

**Backend Route:** `GET /api/workspace/projects/:projectId`

**What Students See:**
- Project overview
- Company info card
- Message board (empty at start)
- "Start Work" button
- Days remaining countdown

**What Company Sees:**
- Project overview
- Assigned student info + resume
- Message board (empty at start)
- Days remaining countdown
- Payment status indicator

---

## Step 4.3: Student Can Start Work
**Action:** Click "Start Work" button in workspace

**Backend Route:** `POST /api/workspace/projects/:projectId/start-work`

**What Changes:**
```javascript
project.status = "in-progress"
project.workStarted = true
project.startedAt = new Date()
```

**Student Experience:**
- Button changes: "Start Work" → "Submit Work"
- Workspace shows new status: "In Progress"

---

## Step 4.4: Message Board Available
**Route:** Same workspace `/workspace/projects/:projectId`

**Features:**
- Real-time messaging via Socket.IO
- File attachments (up to 3 per message)
- Typing indicators
- Online status
- Unread message count

**Backend Routes:**
- `POST /api/workspace/projects/:projectId/messages` - Send message
- `GET /api/workspace/projects/:projectId/messages` - Get messages
- `PUT /api/workspace/projects/:projectId/messages/read` - Mark as read

---

# PHASE 5: WORK SUBMISSION & REVIEW

## Step 5.1: Student Submits Work
**URL:** `http://localhost:5173/workspace/projects/:projectId/submit`

### Submission Form:
```
1. File Uploads (multiple files)
   - Images, PDFs, Documents, Archives
   - Max 5MB per file, 3 files total

2. Submission Links
   - GitHub repo link
   - Live demo link
   - Portfolio link

3. Submission Message
   - "Here's the completed chatbot with documentation..."

4. What Changed (for revisions)
   - "Fixed the NLP model accuracy to 94%..."
```

### Validation:
✅ At least one file OR one link required
✅ Files under 5MB
✅ Maximum 3 files

**Backend Route:** `POST /api/workspace/projects/:projectId/submit-work`

**Response:**
```javascript
{
  "success": true,
  "data": {
    "submission": {
      "_id": "507f1f77bcf86cd799439015",
      "projectId": "507f1f77bcf86cd799439011",
      "studentId": "507f1f77bcf86cd799439014",
      "status": "submitted",
      "submittedAt": "2025-05-20T15:00:00.000Z",
      "files": [
        {
          "filename": "chatbot.zip",
          "url": "https://cloudinary.com/..."
        }
      ]
    }
  }
}
```

---

## Step 5.2: Project Status Changes
```javascript
{
  "status": "submitted"     // ⭐ Student submitted work
}
```

---

## Step 5.3: Company Reviews Work
**URL:** `http://localhost:5173/workspace/projects/:projectId/review`

**What Company Sees:**
- Student submission files (preview/download)
- Submission message
- File details (name, size, upload date)
- Submission history (all previous submissions)
- Three action buttons:
  - ✅ "Approve" - Project complete
  - 🔄 "Request Revision" - Ask for changes
  - ❌ "Reject" - Decline project

---

## Step 5.4: Company Approves Work
**Action:** Click "Approve" button

**Backend Route:** `POST /api/workspace/projects/:projectId/approve-work`

**Database Changes:**
```javascript
{
  "_id": "507f1f77bcf86cd799439015",
  "status": "approved",     // Submission approved
  "approvedAt": "2025-05-22T10:00:00.000Z"
}

// Project status also updates
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "completed",    // ⭐ Project marked complete
  "completedAt": "2025-05-22T10:00:00.000Z"
}
```

**Notification to Student:**
"Great! Your work for 'Build AI Chatbot' has been approved!"

---

## Step 5.5: Company Requests Revision (Optional)
**Action:** Click "Request Revision" + Enter message

**Backend Route:** `POST /api/workspace/projects/:projectId/request-revision`

**Changes:**
```javascript
{
  "status": "revision-requested",
  "revisionReason": "Please improve the error handling...",
  "revisionCount": 1,
  "maxRevisionsAllowed": 3
}

// Project status
{
  "status": "in-progress"   // Back to in-progress for revisions
}
```

**Student Can:**
- Update submission with fixes
- Resubmit for review

---

# PHASE 6: PAYMENT & RATING

## Step 6.1: Payment Setup
**Note:** Payment happens BEFORE project starts (Phase 1-2)

**Timeline:**
```
Project Posted (Company) → Student Applies → Company Accepts 
→ PAYMENT HAPPENS → Workspace Created → Work Starts
```

**Payment Flow for Company:**
- Company clicks "Pay Now" in workspace (when project assigned)
- Company enters amount (from project budget)
- Redirected to Razorpay payment gateway
- Completes payment
- Payment recorded with status "paid"

**Backend Route:** `POST /api/payments/create-order`

---

## Step 6.2: Project Completion Triggers Payment
**When Project Status = "completed":**

**Database:**
```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "completed",
  "paymentStatus": "paid",
  "paymentAmount": 15000,
  "paidAt": "2025-05-25T10:00:00.000Z"
}
```

**Student Can See:**
- `/student/payments` - Shows payment received
- Earnings dashboard - Shows total earned

---

## Step 6.3: Student Rates Company
**URL:** `http://localhost:5173/workspace/projects/:projectId/rate`

### Rating Form:
```
1. Star Rating (1-5 stars)
2. Review Text (optional)
   "Great company, very professional..."
3. Would recommend? (Yes/No)
```

**Backend Route:** `POST /api/ratings/projects/:projectId/rate-company`

---

## Step 6.4: Company Rates Student
**URL:** Same rating page (for company role)

### Rating Form:
```
1. Star Rating (1-5 stars)
2. Review Text (optional)
3. Would rehire? (Yes/No)
```

**Backend Route:** `POST /api/ratings/projects/:projectId/rate-student`

---

## Step 6.5: Project Workflow Complete ✅
**Final Status:**
```javascript
{
  "_id": "507f1f77bcf86cd799439011",
  "status": "completed",
  "ratingCompleted": true,
  "studentRating": 4.5,
  "companyRating": 5,
  "paymentStatus": "paid",
  "completedAt": "2025-05-25T10:00:00.000Z"
}
```

---

# API ENDPOINTS REFERENCE

## Authentication
```
POST   /api/auth/login                    Login user
POST   /api/auth/logout                   Logout user
```

## Company - Projects
```
POST   /api/company/projects/create       Create project
GET    /api/company/projects/my-projects  Get all company projects
GET    /api/company/projects/:id          Get project details
PUT    /api/company/projects/:id          Update project
DELETE /api/company/projects/:id          Delete project
GET    /api/company/projects/stats/summary Get project stats
```

## Company - Applications
```
GET    /api/company/applications          Get all applications
GET    /api/company/applications/:id      Get application details
POST   /api/company/applications/:id/approve Approve application
POST   /api/company/applications/:id/reject Reject application
```

## Student - Projects
```
GET    /api/student/projects/browse       Browse all projects
GET    /api/student/projects/:id          Get project details
POST   /api/student/projects/:id/apply    Apply to project
GET    /api/student/projects/my-applications Get my applications
```

## Workspace
```
GET    /api/workspace/projects/:id        Get workspace overview
POST   /api/workspace/projects/:id/messages Send message
GET    /api/workspace/projects/:id/messages Get messages
PUT    /api/workspace/projects/:id/messages/read Mark messages read
```

## Work Submission
```
POST   /api/workspace/projects/:id/submit-work Submit work
GET    /api/workspace/projects/:id/submission-history Get submissions
POST   /api/workspace/projects/:id/approve-work Approve submission
POST   /api/workspace/projects/:id/request-revision Request revision
```

## Payments
```
POST   /api/payments/create-order         Create payment order
POST   /api/payments/verify               Verify payment
GET    /api/payments/:id                  Get payment details
```

## Ratings
```
POST   /api/ratings/projects/:id/rate-student Rate student
POST   /api/ratings/projects/:id/rate-company Rate company
GET    /api/ratings/projects/:id          Get project ratings
```

---

# DATABASE STATUS TRACKING

## Project Status Flow
```
┌─────────────────────────────────────────────────────────────┐
│  OPEN                                                       │
│  Company posted project, waiting for students to apply      │
└──────────────────┬──────────────────────────────────────────┘
                   │ Student applies, Company accepts
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  ASSIGNED                                                   │
│  Company accepted student, workspace created, work ready    │
│  (No workspace yet - awaiting payment/confirmation)        │
└──────────────────┬──────────────────────────────────────────┘
                   │ Student starts work
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  IN-PROGRESS                                                │
│  Student working on project, can submit                     │
└──────────────────┬──────────────────────────────────────────┘
                   │ Student submits work
                   ↓
┌─────────────────────────────────────────────────────────────┐
│  SUBMITTED                                                  │
│  Work submitted, awaiting company review                    │
└──────────────────┬──────────────────────────────────────────┘
                   │
         ┌─────────┴─────────┐
         │ Revision Request   │ Approved
         │                    │
         ↓                    ↓
    REVISION-       ┌─────────────────────┐
    REQUESTED       │  COMPLETED          │
         │          │  Project done,      │
         │          │  ready for payment  │
         └─→────────→ & rating            │
                    └─────────┬───────────┘
                              │ Payment done, rating submitted
                              ↓
                    ┌─────────────────────┐
                    │  COMPLETED (Final)  │
                    │  Everything done    │
                    └─────────────────────┘
```

## Application Status Flow
```
┌──────────────┐
│  PENDING     │  Student just applied
└──────┬───────┘
       │
   ┌───┴────┐
   │         │
   ↓         ↓
ACCEPTED   REJECTED
(Company   (Company
accepted)  rejected)
```

---

## Key Database Fields for Tracking Status

### Project Model
```javascript
{
  _id: ObjectId,
  status: "open|assigned|in-progress|submitted|under-review|completed",
  assignedStudent: ObjectId,              // Student ID once assigned
  workStarted: Boolean,                   // True when student clicks "Start Work"
  startedAt: Date,                        // When work actually started
  completedAt: Date,                      // When project marked complete
  paymentStatus: "pending|paid|failed",
  paymentAmount: Number,
  paidAt: Date,
  ratingCompleted: Boolean,
  messageCount: Number,
  workspaceCreatedAt: Date,               // When workspace created
  applicationsCount: Number,
  revisionCount: Number,
  maxRevisionsAllowed: Number
}
```

### Application Model
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  studentId: ObjectId,
  companyId: ObjectId,
  status: "pending|accepted|rejected|withdrawn",
  proposedPrice: Number,
  proposalText: String,
  portfolioLink: String,
  estimatedDays: Number,
  createdAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  withdrawnAt: Date
}
```

### Submission Model
```javascript
{
  _id: ObjectId,
  projectId: ObjectId,
  studentId: ObjectId,
  status: "submitted|approved|revision-requested|rejected",
  submissionText: String,
  files: [
    {
      filename: String,
      originalName: String,
      url: String,
      size: Number,
      uploadedAt: Date
    }
  ],
  submittedAt: Date,
  approvedAt: Date,
  revisionReason: String,
  submissionNumber: Number  // 1 for first, 2 for revision, etc.
}
```

---

## Admin Monitoring
**URL:** `http://localhost:5173/admin/projects`

Admins can see:
- All projects by status
- Project details
- Student & company info
- Application status
- Payment status
- Timeline information

---

# 🎓 SUMMARY

### Quick Reference Table

| Phase | Actor | Action | URL | Status Change | Route |
|-------|-------|--------|-----|---|---|
| 1 | Company | Posts Project | `/company/post-project` | OPEN | `POST /api/company/projects/create` |
| 2 | Student | Applies | `/student/projects/:id` | Application: PENDING | `POST /api/student/projects/:id/apply` |
| 3 | Company | Reviews Apps | `/company/applications` | - | `GET /api/company/applications` |
| 4 | Company | Accepts Student | Modal/Button | ASSIGNED | `POST /api/company/applications/:id/approve` |
| 4 | Student | Starts Work | `/workspace/projects/:id` | IN-PROGRESS | `POST /api/workspace/projects/:id/start-work` |
| 5 | Student | Submits Work | `/workspace/:id/submit` | SUBMITTED | `POST /api/workspace/projects/:id/submit-work` |
| 5 | Company | Reviews Work | `/workspace/:id/review` | UNDER-REVIEW | `GET /api/workspace/...` |
| 5 | Company | Approves/Requests Revision | Same | COMPLETED/IN-PROGRESS | `POST /api/workspace/.../approve-work` |
| 6 | Company | Pays | `/payment/:id` | paymentStatus: PAID | `POST /api/payments/create-order` |
| 6 | Both | Rate | `/workspace/:id/rate` | ratingCompleted: true | `POST /api/ratings/.../rate-*` |

---

**Last Updated:** January 1, 2026  
**Phase Coverage:** Phase 1 (Auth) → Phase 4.5 (Applications) → Phase 5 (Workspace) → Phase 6 (Payments)
