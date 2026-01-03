# 📊 PROJECT WORKFLOW - VISUAL DIAGRAMS

---

## 1️⃣ COMPLETE PROJECT LIFECYCLE

```
┌──────────────────────────────────────────────────────────────────────────────────┐
│                         COMPLETE PROJECT WORKFLOW                                 │
└──────────────────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 1: PROJECT POSTING (Company)                                             │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. Company Login                                                               │
│     └─→ /api/auth/login                                                        │
│         └─→ Redirected to /company/dashboard                                   │
│                                                                                  │
│  2. Complete Profile (Required - 100%)                                          │
│     └─→ /api/company/profile                                                   │
│         └─→ Must have: Basic Info, Details, Authorized Person, Logo, Docs     │
│                                                                                  │
│  3. Post Project                                                                │
│     └─→ /company/post-project                                                  │
│         └─→ Fill: Title, Description, Skills, Budget, Duration, Deadline      │
│             └─→ POST /api/company/projects/create                              │
│                 └─→ Validation: Profile 100%, No duplicate titles              │
│                     └─→ ✅ PROJECT CREATED - Status: OPEN                     │
│                                                                                  │
│  4. Project Visible On:                                                         │
│     ├─→ /company/projects (My Projects)                                        │
│     ├─→ /student/browse-projects (Students can see)                            │
│     ├─→ /browse-projects (Public page)                                         │
│     └─→ /admin/projects (Admin dashboard)                                      │
│                                                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                          [PROJECT STATUS: OPEN]
                                      ↓
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 2: STUDENT APPLICATION (Student)                                         │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. Student Login                                                               │
│     └─→ /api/auth/login                                                        │
│         └─→ Redirected to /student/dashboard                                   │
│                                                                                  │
│  2. Browse Projects                                                             │
│     └─→ /student/browse-projects                                               │
│         └─→ Filter by: Category, Skills, Budget, Deadline                      │
│             └─→ GET /api/student/projects/browse                               │
│                 └─→ See list of OPEN projects                                  │
│                                                                                  │
│  3. View Project Details                                                        │
│     └─→ /student/projects/:projectId                                           │
│         └─→ GET /api/student/projects/:projectId                               │
│             └─→ See: Full description, skills, budget, company info            │
│                                                                                  │
│  4. Apply to Project                                                            │
│     └─→ Submit Application Form                                                │
│         ├─→ Cover Letter (150-1000 chars)                                      │
│         ├─→ Proposed Price (must be within budget range)                       │
│         ├─→ Portfolio Link (optional)                                          │
│         └─→ Estimated Days (45, 60, etc.)                                      │
│             └─→ POST /api/student/projects/:projectId/apply                    │
│                 └─→ ✅ APPLICATION CREATED - Status: PENDING                  │
│                                                                                  │
│  5. Student Can Track Application                                               │
│     └─→ /student/my-applications                                               │
│         └─→ GET /api/student/projects/my-applications                          │
│             └─→ See: Status (Pending), Project details                         │
│                 └─→ Can WITHDRAW if still pending                              │
│                                                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                      [APPLICATION STATUS: PENDING]
                                      ↓
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 3: APPLICATION REVIEW (Company)                                          │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. Company Gets Notification                                                   │
│     └─→ Bell Icon Updates                                                       │
│         └─→ Message: "New application for 'Build AI Chatbot'"                  │
│                                                                                  │
│  2. Review All Applications                                                     │
│     └─→ /company/applications                                                  │
│         └─→ GET /api/company/applications?status=pending                       │
│             └─→ Filter by: Status, Project                                     │
│                 └─→ See: Student name, photo, cover letter, price              │
│                                                                                  │
│  3. View Application Details                                                    │
│     └─→ Modal or Details Page                                                  │
│         └─→ GET /api/company/applications/:applicationId                       │
│             └─→ See: Full profile, resume, portfolio, all details              │
│                                                                                  │
│  4. Accept or Reject                                                            │
│     ├─→ ACCEPT Student                                                         │
│     │   └─→ POST /api/company/applications/:applicationId/approve              │
│     │       └─→ Application.status = "accepted"                                │
│     │           └─→ All other apps for this project = "rejected"               │
│     │               └─→ ✅ PROJECT STATUS: ASSIGNED                            │
│     │                   └─→ WORKSPACE CREATED                                  │
│     │                       └─→ Student notification: "You're selected!"        │
│     │                                                                            │
│     └─→ REJECT Student                                                         │
│         └─→ POST /api/company/applications/:applicationId/reject               │
│             └─→ Application.status = "rejected"                                │
│                 └─→ Student notification: "Application not selected"           │
│                                                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                      [PROJECT STATUS: ASSIGNED]
                                      ↓
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 4: WORKSPACE & WORK START (Both)                                         │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. Workspace Route Available                                                   │
│     └─→ /workspace/projects/:projectId                                         │
│         └─→ GET /api/workspace/projects/:projectId                             │
│             └─→ Access Control: Only assigned student & company owner          │
│                 └─→ See: Project overview, company/student info, message board │
│                                                                                  │
│  2. Message Board Activated                                                     │
│     └─→ Real-time messaging via Socket.IO                                      │
│         ├─→ Send messages with file attachments                                │
│         ├─→ File upload: Max 5MB, 3 files per message                          │
│         ├─→ Typing indicators                                                  │
│         ├─→ Online status                                                      │
│         └─→ Routes:                                                             │
│             ├─→ POST /api/workspace/projects/:id/messages (send)               │
│             ├─→ GET /api/workspace/projects/:id/messages (get)                 │
│             └─→ PUT /api/workspace/projects/:id/messages/read (mark read)      │
│                                                                                  │
│  3. Student Starts Work                                                         │
│     └─→ Click "Start Work" button in workspace                                 │
│         └─→ POST /api/workspace/projects/:projectId/start-work                 │
│             └─→ Project.status = "in-progress"                                 │
│                 └─→ Project.workStarted = true                                 │
│                     └─→ Project.startedAt = now                                │
│                         └─→ ✅ BUTTON CHANGES TO "SUBMIT WORK"                │
│                                                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                        [PROJECT STATUS: IN-PROGRESS]
                                      ↓
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 5: WORK SUBMISSION & REVIEW (Both)                                       │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. Student Submits Work                                                        │
│     └─→ /workspace/projects/:projectId/submit                                  │
│         └─→ Upload Files:                                                       │
│         │   ├─→ Supported: Images, PDFs, Documents, Archives                   │
│         │   ├─→ Max: 5MB per file, 3 files total                               │
│         │   └─→ Uploaded to Cloudinary                                         │
│         ├─→ Add Links (optional):                                              │
│         │   ├─→ GitHub repo                                                    │
│         │   ├─→ Live demo                                                      │
│         │   └─→ Portfolio link                                                 │
│         ├─→ Submission Message:                                                │
│         │   └─→ "Here's the completed chatbot..."                              │
│         └─→ POST /api/workspace/projects/:projectId/submit-work                │
│             └─→ ✅ SUBMISSION CREATED - Status: SUBMITTED                     │
│                 └─→ Submission.submissionNumber = 1                            │
│                     └─→ Project.status = "submitted"                           │
│                         └─→ Company notification: "Work submitted for review"  │
│                                                                                  │
│  2. Company Reviews Work                                                        │
│     └─→ /workspace/projects/:projectId/review                                  │
│         └─→ GET /api/workspace/projects/:projectId/submission-history          │
│             └─→ See: All submitted files with previews                         │
│                 └─→ See: Submission history (1st, 2nd, revision, etc.)         │
│                     └─→ See: All student messages                              │
│                                                                                  │
│  3. Company Actions:                                                            │
│                                                                                  │
│     ┌─→ APPROVE ✅                                                             │
│     │   └─→ Click "Approve" button                                             │
│     │       └─→ POST /api/workspace/projects/:projectId/approve-work           │
│     │           └─→ Submission.status = "approved"                             │
│     │               └─→ ✅ PROJECT.STATUS = "COMPLETED"                       │
│     │                   └─→ Project.completedAt = now                          │
│     │                       └─→ Payment can now be processed                   │
│     │                           └─→ Student notification: "Work approved!"      │
│     │                                                                            │
│     ├─→ REQUEST REVISION 🔄                                                    │
│     │   └─→ Click "Request Revision" + enter feedback                          │
│     │       └─→ POST /api/workspace/projects/:projectId/request-revision       │
│     │           └─→ Project.status = "revision-requested"                      │
│     │               └─→ Project.revisionCount = 1                              │
│     │                   └─→ Project.maxRevisionsAllowed = 3                    │
│     │                       └─→ Student can resubmit                           │
│     │                           └─→ Student notification: "Revision requested" │
│     │                               └─→ Back to Submission step ⬆️              │
│     │                                                                            │
│     └─→ REJECT ❌                                                              │
│         └─→ Click "Reject" button                                              │
│             └─→ POST /api/workspace/projects/:projectId/reject-work            │
│                 └─→ Project.status = "rejected"                                │
│                     └─→ Student notification: "Work rejected"                  │
│                         └─→ May need to restart                                │
│                                                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
                                      ↓
                        [PROJECT STATUS: COMPLETED]
                                      ↓
┌────────────────────────────────────────────────────────────────────────────────┐
│ PHASE 6: PAYMENT & RATING (Both)                                               │
├────────────────────────────────────────────────────────────────────────────────┤
│                                                                                  │
│  1. Payment (Can happen anytime after project assigned)                         │
│     └─→ /payment/:projectId                                                    │
│         └─→ Company clicks "Pay Now"                                           │
│             └─→ POST /api/payments/create-order                                │
│                 └─→ Razorpay payment gateway opens                             │
│                     └─→ Company enters/confirms amount (from budget)           │
│                         └─→ Payment processed                                  │
│                             └─→ POST /api/payments/verify                      │
│                                 └─→ ✅ PAYMENT RECORDED                       │
│                                     └─→ Project.paymentStatus = "paid"         │
│                                         └─→ Project.paidAt = now               │
│                                                                                  │
│  2. Student Sees Earnings                                                       │
│     └─→ /student/payments                                                      │
│         └─→ GET /api/payments                                                  │
│             └─→ See: Payment received, amount, date                            │
│                 └─→ See: Total earnings across all projects                    │
│                                                                                  │
│  3. Rating System                                                               │
│     └─→ /workspace/projects/:projectId/rate                                    │
│         └─→ Available when: Project.status = "completed"                       │
│                                                                                  │
│     ┌─→ STUDENT RATES COMPANY 🌟                                              │
│     │   ├─→ Star Rating (1-5)                                                  │
│     │   ├─→ Review Text (optional)                                             │
│     │   └─→ Would Recommend (Yes/No)                                           │
│     │       └─→ POST /api/ratings/projects/:id/rate-company                    │
│     │           └─→ Rating saved                                               │
│     │                                                                            │
│     └─→ COMPANY RATES STUDENT 🌟                                              │
│         ├─→ Star Rating (1-5)                                                  │
│         ├─→ Review Text (optional)                                             │
│         └─→ Would Rehire (Yes/No)                                              │
│             └─→ POST /api/ratings/projects/:id/rate-student                    │
│                 └─→ Rating saved                                               │
│                                                                                  │
│  4. Project Completion Summary                                                  │
│     └─→ Project.ratingCompleted = true                                         │
│         └─→ Both ratings visible on profiles                                   │
│             └─→ Project shows on portfolio for both                            │
│                 └─→ ✅ WORKFLOW COMPLETE                                       │
│                                                                                  │
└────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2️⃣ DATABASE STATUS PROGRESSION

```
┌───────────────────────────────────────────────────────────────────────────────┐
│                    PROJECT STATUS PROGRESSION IN DB                            │
└───────────────────────────────────────────────────────────────────────────────┘

Timeline:
├─ Day 0: Company posts
├─ Day 1: Students apply
├─ Day 2: Company reviews, accepts
├─ Day 3: Student starts work
├─ Day 10: Student submits
├─ Day 12: Company approves
├─ Day 13: Company pays
└─ Day 14: Both rate

Database Evolution:

DAY 0 - PROJECT POSTED
┌──────────────────────────┐
│ Project Document         │
├──────────────────────────┤
│ _id: 507f...0011         │
│ title: "Build AI..."     │
│ companyId: 507f...0012   │
│ status: "open"  ⭐       │
│ createdAt: 2025-05-15    │
│ applicationsCount: 0     │
│ workspaceCreatedAt: null │
└──────────────────────────┘

DAY 1 - STUDENT APPLIED
┌──────────────────────────┐  ┌──────────────────────────┐
│ Project Document         │  │ Application Document     │
├──────────────────────────┤  ├──────────────────────────┤
│ status: "open"           │  │ _id: 507f...0013         │
│ applicationsCount: 1  ⭐ │  │ projectId: 507f...0011   │
│                          │  │ studentId: 507f...0014   │
│                          │  │ status: "pending"  ⭐    │
│                          │  │ proposedPrice: 15000     │
│                          │  │ createdAt: 2025-05-16    │
│                          │  └──────────────────────────┘
└──────────────────────────┘

DAY 2 - COMPANY ACCEPTED
┌──────────────────────────┐  ┌──────────────────────────┐
│ Project Document         │  │ Application Document     │
├──────────────────────────┤  ├──────────────────────────┤
│ status: "assigned"  ⭐   │  │ status: "accepted"  ⭐   │
│ assignedStudent: 507f... │  │ acceptedAt: 2025-05-17   │
│ workspaceCreatedAt: now  │  │                          │
│ applicationsCount: 1     │  │ Other apps: "rejected"   │
│                          │  │                          │
│ Workspace CREATED! 🎉    │  │ Student notified ✅      │
└──────────────────────────┘  └──────────────────────────┘

DAY 3 - STUDENT STARTED WORK
┌──────────────────────────┐
│ Project Document         │
├──────────────────────────┤
│ status: "in-progress" ⭐ │
│ workStarted: true        │
│ startedAt: 2025-05-18    │
│                          │
│ Workspace accessible ✅  │
│ Can submit work ✅       │
│ Message board active ✅  │
└──────────────────────────┘

DAY 10 - STUDENT SUBMITTED
┌──────────────────────────┐  ┌──────────────────────────┐
│ Project Document         │  │ Submission Document      │
├──────────────────────────┤  ├──────────────────────────┤
│ status: "submitted"  ⭐  │  │ _id: 507f...0015         │
│                          │  │ projectId: 507f...0011   │
│ Student submitted work   │  │ studentId: 507f...0014   │
│ Company can review ✅    │  │ status: "submitted"  ⭐  │
│                          │  │ submittedAt: 2025-05-25  │
│                          │  │ files: [...]             │
│                          │  │ submissionNumber: 1      │
│                          │  └──────────────────────────┘
└──────────────────────────┘

DAY 12 - COMPANY APPROVED
┌──────────────────────────┐  ┌──────────────────────────┐
│ Project Document         │  │ Submission Document      │
├──────────────────────────┤  ├──────────────────────────┤
│ status: "completed"  ⭐  │  │ status: "approved"  ⭐   │
│ completedAt: 2025-05-27  │  │ approvedAt: 2025-05-27   │
│                          │  │                          │
│ Student notified ✅      │  │ Workspace read-only ✅   │
│ Payment ready ✅         │  │ Can now rate ✅          │
│ Can rate company ✅      │  │                          │
└──────────────────────────┘  └──────────────────────────┘

DAY 13 - COMPANY PAID
┌──────────────────────────┐
│ Project Document         │
├──────────────────────────┤
│ paymentStatus: "paid" ⭐ │
│ paymentAmount: 15000     │
│ paidAt: 2025-05-28       │
│                          │
│ Student sees earning ✅  │
│ Can withdraw (if app) ✅ │
└──────────────────────────┘

DAY 14 - BOTH RATED
┌──────────────────────────┐
│ Project Document         │
├──────────────────────────┤
│ ratingCompleted: true ⭐ │
│ studentRating: 4.5       │
│ companyRating: 5         │
│                          │
│ Project on both profiles │
│ ✅ WORKFLOW COMPLETE    │
└──────────────────────────┘
```

---

## 3️⃣ APPLICATION STATUS FLOW

```
                    STUDENT APPLIES
                          ↓
                    ┌──────────────┐
                    │   PENDING    │  ← Student submitted application
                    └──────┬───────┘     Company hasn't decided yet
                           │
              ┌────────────┴────────────┐
              │                         │
              ↓                         ↓
        ┌──────────────┐         ┌──────────────┐
        │   ACCEPTED   │         │   REJECTED   │
        └──────┬───────┘         └──────────────┘
               │
               │ ← Company selected this student
               │    Workspace created
               │    Other apps auto-rejected
               │
        ┌──────────────┐
        │   ACTIVE IN  │
        │   WORKSPACE  │
        └────────────┬─┘
                     │
                     │ ← Work in progress
                     │    Messages exchanged
                     │    Work submitted & approved
                     │
            ┌────────────────┐
            │   COMPLETED    │
            └────────────────┘
                 (Project finalized)
```

---

## 4️⃣ COMPANY SIDE - VIEW FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    COMPANY USER JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

Company Login
     ↓
Company Dashboard (/company/dashboard)
     │
     ├─→ Quick Links:
     │   ├─→ "Post Project" ← START HERE
     │   ├─→ "View Projects"
     │   └─→ "Manage Applications"
     │
     └─→ Stats Section:
         ├─→ Projects Posted: 5
         ├─→ Active Projects: 3
         ├─→ Pending Applications: 12
         └─→ Total Earnings: ₹125,000

1️⃣ POSTING PROJECTS
   │
   └─→ /company/post-project
       ├─→ Form: Title, Description, Skills, Budget, Deadline
       ├─→ Validate: Profile 100% complete
       ├─→ Submit: POST /api/company/projects/create
       │
       └─→ Success! Redirected to:
           └─→ /company/projects (My Projects)
               ├─→ View all your projects
               ├─→ Filter by: Status (Open, Assigned, In Progress, etc.)
               ├─→ Search projects
               ├─→ Actions: View, Edit (if open), Delete
               │
               └─→ Each project card shows:
                   ├─→ Status badge (Open, Assigned, etc.)
                   ├─→ Budget & Deadline
                   ├─→ Applications count
                   ├─→ Buttons: View Details, Edit, Delete

2️⃣ VIEWING SINGLE PROJECT
   │
   └─→ /company/projects/:projectId (Project Details)
       ├─→ Full project information
       ├─→ Applications count
       ├─→ Button: "View Applications"
       │
       └─→ Actions:
           ├─→ Edit (if status = "open")
           ├─→ Delete (if status = "open" and no apps)
           └─→ View Applications

3️⃣ MANAGING APPLICATIONS
   │
   ├─→ /company/applications (All Applications)
   │   ├─→ List of ALL applications across ALL projects
   │   ├─→ Filter by: Status (Pending, Accepted, Rejected)
   │   ├─→ Sort by: Date, Price, Project
   │   │
   │   └─→ Each app shows:
   │       ├─→ Student name & photo
   │       ├─→ Project title
   │       ├─→ Proposed price
   │       ├─→ Cover letter preview
   │       ├─→ Status badge
   │       └─→ Buttons: View Details, Accept, Reject
   │
   └─→ Click "View Details"
       │
       └─→ Application Details Modal/Page
           ├─→ Full student profile
           ├─→ Resume download link
           ├─→ Portfolio link
           ├─→ Full cover letter
           ├─→ Proposed price & timeline
           │
           └─→ Actions:
               ├─→ Accept ← Creates workspace, project = "assigned"
               └─→ Reject ← App status = "rejected"

4️⃣ PROJECT WORKSPACE (After Acceptance)
   │
   └─→ /workspace/projects/:projectId
       ├─→ Status: ASSIGNED
       │
       ├─→ See:
       │   ├─→ Project overview
       │   ├─→ Assigned student info
       │   ├─→ Message board
       │   └─→ "Pay Now" button
       │
       └─→ Workspace available for messaging
           ├─→ Real-time chat with student
           ├─→ File sharing
           └─→ Track work progress

5️⃣ PAYMENT
   │
   ├─→ /payment/:projectId
   │   ├─→ Company clicks "Pay Now"
   │   ├─→ Razorpay payment gateway opens
   │   ├─→ Company enters amount
   │   └─→ Payment confirmed
   │
   └─→ Project status updated:
       └─→ paymentStatus = "paid"

6️⃣ REVIEW SUBMITTED WORK
   │
   └─→ /workspace/projects/:projectId/review
       ├─→ Status: SUBMITTED
       │
       ├─→ See:
       │   ├─→ Submitted files with previews
       │   ├─→ Submission history
       │   ├─→ All student messages
       │   │
       │   └─→ Actions:
       │       ├─→ ✅ APPROVE
       │       │   └─→ Project = "completed"
       │       │       Student can now rate
       │       │
       │       ├─→ 🔄 REQUEST REVISION
       │       │   └─→ Project = "revision-requested"
       │       │       Student resubmits
       │       │
       │       └─→ ❌ REJECT
       │           └─→ Project = "rejected"
       │
       └─→ After Approval:
           └─→ Can rate student at:
               └─→ /workspace/projects/:projectId/rate
                   ├─→ Star rating (1-5)
                   ├─→ Review text
                   ├─→ Would rehire?
                   └─→ ✅ Workflow complete!
```

---

## 5️⃣ STUDENT SIDE - VIEW FLOW

```
┌─────────────────────────────────────────────────────────────────┐
│                    STUDENT USER JOURNEY                          │
└─────────────────────────────────────────────────────────────────┘

Student Login
     ↓
Student Dashboard (/student/dashboard)
     │
     ├─→ Quick Links:
     │   ├─→ "Browse Projects"
     │   ├─→ "My Applications"
     │   ├─→ "My Earnings"
     │   └─→ "My Profile"
     │
     └─→ Stats Section:
         ├─→ Applications Submitted: 8
         ├─→ Active Projects: 2
         ├─→ Total Earnings: ₹80,000
         └─→ Rating: 4.8 ⭐

1️⃣ BROWSING PROJECTS
   │
   └─→ /student/browse-projects
       ├─→ Filters:
       │   ├─→ By Category (Web Dev, AI/ML, Mobile, etc.)
       │   ├─→ By Skills
       │   ├─→ By Budget Range
       │   └─→ By Deadline
       │
       ├─→ Search: By project title/description
       │
       └─→ Project Cards (Status: OPEN):
           ├─→ Company name
           ├─→ Project title
           ├─→ Budget range
           ├─→ Required skills
           ├─→ Deadline countdown
           └─→ Button: "Apply Now" / "View Details"

2️⃣ VIEWING PROJECT DETAILS
   │
   └─→ /student/projects/:projectId
       ├─→ Full project description
       ├─→ All required skills
       ├─→ Budget and deadline
       ├─→ Company profile preview
       │
       └─→ Button: "Apply Now"
           └─→ Opens Application Form

3️⃣ APPLYING TO PROJECT
   │
   └─→ Application Form (on project page)
       ├─→ Cover Letter
       │   └─→ "I have 2 years Python experience..."
       │
       ├─→ Proposed Price
       │   └─→ Must be within project budget range
       │
       ├─→ Portfolio Link (optional)
       │   └─→ GitHub, behance, portfolio site
       │
       └─→ Estimated Days
           └─→ 30, 45, 60, 90 days
               │
               └─→ Submit Application
                   └─→ ✅ Application created (Status: PENDING)

4️⃣ TRACKING APPLICATIONS
   │
   └─→ /student/my-applications
       ├─→ List of all applications
       │
       └─→ Each application shows:
           ├─→ Project title
           ├─→ Company name
           ├─→ Status badge:
           │   ├─→ "Pending" (yellow) - waiting for response
           │   ├─→ "Accepted" (green) - selected!
           │   └─→ "Rejected" (red) - not selected
           │
           ├─→ Application date
           ├─→ Proposed price
           │
           └─→ Actions:
               ├─→ If Pending: "Withdraw Application"
               └─→ If Accepted: "Go to Workspace"

5️⃣ WORKSPACE (After Company Accepts)
   │
   └─→ /workspace/projects/:projectId
       ├─→ Status changes: ASSIGNED → IN-PROGRESS
       │
       ├─→ Can see:
       │   ├─→ Project overview
       │   ├─→ Company profile
       │   ├─→ Message board
       │   └─→ "Start Work" button (to change status)
       │
       ├─→ Message Board:
       │   ├─→ Real-time chat with company
       │   ├─→ Ask questions
       │   ├─→ Share clarifications
       │   └─→ File attachments
       │
       └─→ Click "Start Work":
           └─→ Status: IN-PROGRESS
               └─→ Workspace updates
                   └─→ "Start Work" → "Submit Work" button

6️⃣ SUBMITTING WORK
   │
   └─→ /workspace/projects/:projectId/submit
       ├─→ Upload Files:
       │   ├─→ Source code, documents, images
       │   ├─→ Max 5MB per file, 3 files total
       │   └─→ Uploaded to Cloudinary
       │
       ├─→ Add Links:
       │   ├─→ GitHub repo
       │   ├─→ Live demo
       │   └─→ Portfolio link
       │
       ├─→ Submission Message:
       │   └─→ "Here's the chatbot with documentation..."
       │
       └─→ Submit Work
           └─→ ✅ Submission created (Status: SUBMITTED)
               └─→ Project status: SUBMITTED
                   └─→ Company gets notification

7️⃣ AWAITING REVIEW
   │
   └─→ Company reviews at:
       └─→ /workspace/projects/:projectId/review
           │
           └─→ Company can:
               ├─→ ✅ APPROVE (work complete!)
               ├─→ 🔄 REQUEST REVISION (need changes)
               └─→ ❌ REJECT (redo work)

8️⃣ HANDLING REVISIONS (if requested)
   │
   └─→ If Company requests revision:
       ├─→ Status: REVISION-REQUESTED
       ├─→ Student sees revision message
       │
       └─→ Student can resubmit:
           └─→ Go back to submission page
               └─→ Upload revised files
               └─→ Submit again
                   └─→ Submission #2
                       └─→ Company reviews again

9️⃣ AFTER APPROVAL
   │
   └─→ Project status: COMPLETED
       │
       ├─→ Can see earnings:
       │   └─→ /student/payments
       │       ├─→ Payment status: Pending or Paid
       │       ├─→ Amount received
       │       └─→ Total earnings dashboard
       │
       ├─→ Can rate company:
       │   └─→ /workspace/projects/:projectId/rate
       │       ├─→ Star rating (1-5)
       │       ├─→ Review text
       │       ├─→ Would recommend?
       │       │
       │       └─→ ✅ Workflow complete!
       │           └─→ Project on your portfolio
       │               Rating visible on profile
       │
       └─→ Workspace becomes read-only
           └─→ Can still message company
           └─→ Can't resubmit

1️⃣0️⃣ EARNINGS & RATING
   │
   ├─→ /student/payments
   │   └─→ See all payments received
   │       ├─→ Project title
   │       ├─→ Amount earned
   │       ├─→ Date received
   │       └─→ Status (Paid/Pending)
   │
   └─→ Profile Updates:
       ├─→ Project added to portfolio
       ├─→ Rating visible (if given)
       ├─→ Company review visible
       └─→ All future employers can see!
```

---

## 6️⃣ KEY STATUS TRANSITIONS

```
PROJECT STATUS MACHINE:

┌─────────┐
│  OPEN   │  Company posts project, waiting for applications
└────┬────┘
     │ Company accepts student
     ↓
┌──────────┐
│ ASSIGNED │  Student selected, workspace created
└────┬─────┘
     │ Student clicks "Start Work"
     ↓
┌──────────────┐
│ IN-PROGRESS  │  Student is working on project
└────┬─────────┘
     │ Student submits work
     ↓
┌───────────┐
│ SUBMITTED │  Waiting for company review
└────┬──────┘
     │
  ┌──┴──┐
  │     │
  │ ┌───┴────────┐
  │ │            │
  ↓ ↓            ↓
REVISION   COMPLETED  REJECTED
REQUESTED     ✅       (rare)
  │
  └──→ IN-PROGRESS (again for revisions)
       │ (resubmit)
       └──→ SUBMITTED (again)
            │
            └──→ COMPLETED ✅


APPLICATION STATUS MACHINE:

┌─────────┐
│ PENDING │  Student just applied
└────┬────┘
     │
  ┌──┴──┐
  │     │
  ↓     ↓
ACCEPTED  REJECTED  ← Company decision
  │        │
  │        └──→ (end)
  │
  ↓
Project → ASSIGNED
  │
  └──→ (continues to completion)


SUBMISSION STATUS:

┌───────────┐
│ SUBMITTED │
└────┬──────┘
     │
  ┌──┴──┐
  │     │
  ↓     ↓
APPROVED REVISION-REQUESTED
  │      │
  │      └──→ (new submission)
  │           │
  │           └──→ SUBMITTED (again)
  │
  └──→ PROJECT COMPLETED ✅
```

---

## 7️⃣ PERMISSION & ACCESS MATRIX

```
┌──────────────────────────────────────────────────────────────────────┐
│                    WHO CAN ACCESS WHAT                                │
└──────────────────────────────────────────────────────────────────────┘

PROJECTS:
┌───────────────────┬────────────┬───────────┬──────────┐
│ Route             │ Company    │ Student   │ Admin    │
├───────────────────┼────────────┼───────────┼──────────┤
│ /company/projects │ Own only   │ ❌        │ All      │
│ /browse-projects  │ Own listed │ ✅ View   │ All      │
│ /admin/projects   │ ❌         │ ❌        │ ✅ All   │
└───────────────────┴────────────┴───────────┴──────────┘

WORKSPACE (after project assigned):
┌─────────────────────────────┬────────────┬───────────┬──────────┐
│ Route                       │ Company    │ Student   │ Admin    │
├─────────────────────────────┼────────────┼───────────┼──────────┤
│ /workspace/projects/:id     │ Owner only │ Assigned  │ ✅       │
│ /workspace/:id/submit       │ ❌         │ Assigned  │ ❌       │
│ /workspace/:id/review       │ Owner only │ ❌        │ ❌       │
│ /workspace/:id/rate         │ ✅         │ ✅        │ ❌       │
└─────────────────────────────┴────────────┴───────────┴──────────┘

APPLICATIONS:
┌──────────────────────────┬────────────┬───────────┬──────────┐
│ Route                    │ Company    │ Student   │ Admin    │
├──────────────────────────┼────────────┼───────────┼──────────┤
│ /company/applications    │ Own only   │ ❌        │ All      │
│ /student/my-applications │ ❌         │ Own only  │ ✅       │
└──────────────────────────┴────────────┴───────────┴──────────┘

PAYMENTS:
┌──────────────────┬────────────┬───────────┬──────────┐
│ Route            │ Company    │ Student   │ Admin    │
├──────────────────┼────────────┼───────────┼──────────┤
│ /payment/:id     │ Payer only │ ❌        │ ✅       │
│ /student/payments│ ❌         │ Own only  │ ✅       │
│ /admin/payments  │ ❌         │ ❌        │ ✅ All   │
└──────────────────┴────────────┴───────────┴──────────┘
```

---

**Version:** 1.0  
**Last Updated:** January 1, 2026  
**Scope:** Complete Project Workflow (Phase 1 → Phase 6)
