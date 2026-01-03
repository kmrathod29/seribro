# 🎯 PROJECT WORKFLOW - ONE PAGE SUMMARY

## Complete Flow from Post to End

---

## THE COMPLETE WORKFLOW IN 6 PHASES

### **PHASE 1️⃣: COMPANY POSTS PROJECT** (5 min)

**What Company Does:**
1. Login → `/login`
2. Ensure profile 100% complete → `/company/profile`
3. Go to post project → `/company/post-project`
4. Fill form: Title, Description, Skills, Budget, Deadline
5. Submit

**Result:**
- ✅ Project created with status: **"OPEN"**
- ✅ Visible in `/company/projects` (MY Projects)
- ✅ Visible in `/student/browse-projects` (for students)
- ✅ Visible in `/browse-projects` (public)
- ✅ Visible in `/admin/projects` (for admins)

**Backend:** `POST /api/company/projects/create` → Project.status = "open"

---

### **PHASE 2️⃣: STUDENT BROWSES & APPLIES** (10 min)

**What Student Does:**
1. Login → `/login`
2. Browse projects → `/student/browse-projects`
3. Click "View Details" on a project
4. Fill application form:
   - Cover Letter
   - Proposed Price (must be in project budget range)
   - Portfolio Link (optional)
   - Estimated Days
5. Submit application

**Result:**
- ✅ Application created with status: **"PENDING"**
- ✅ Visible in `/student/my-applications`
- ✅ Student can withdraw if still pending
- ✅ Company gets notification

**Backend:** `POST /api/student/projects/:projectId/apply` → Application.status = "pending"

---

### **PHASE 3️⃣: COMPANY REVIEWS APPLICATIONS** (3 min)

**What Company Does:**
1. Check notification bell (shows new application count)
2. Go to → `/company/applications`
3. Click on application to view details
4. See student profile, resume, cover letter, proposed price
5. Click either:
   - **"ACCEPT"** ✅ (select this student)
   - **"REJECT"** ❌ (don't select)

**Result if ACCEPTED:**
- ✅ Application status: **"ACCEPTED"**
- ✅ **All other pending applications for this project AUTO-REJECTED**
- ✅ Project status changes: "open" → **"ASSIGNED"**
- ✅ **WORKSPACE AUTOMATICALLY CREATED! 🎉**
- ✅ Workspace available at `/workspace/projects/:projectId`
- ✅ Student gets notification: "You've been selected!"
- ✅ Other students get notification: "Application not selected"

**Backend:** `POST /api/company/applications/:applicationId/approve`
- Updates: Application.status = "accepted"
- Updates: Project.status = "assigned"
- Creates: Workspace (messageCount = 0, workspaceCreatedAt = now)
- Auto-rejects: All other pending applications

---

### **PHASE 4️⃣: STUDENT STARTS WORK** (2 min)

**What Student Does:**
1. See notification: "You've been selected!"
2. Go to `/student/my-applications`
3. Click "Go to Workspace" OR directly visit `/workspace/projects/:projectId`
4. In workspace, click **"START WORK"** button

**What They See in Workspace:**
- Project overview
- Company info (name, logo, about, industry)
- Message board (empty initially)
- Days remaining countdown
- Various action buttons

**Result:**
- ✅ Project status changes: "assigned" → **"IN-PROGRESS"**
- ✅ Button changes: "Start Work" → **"SUBMIT WORK"**
- ✅ Student can now:
  - Message the company (real-time via Socket.IO)
  - Upload file attachments
  - See company's online/offline status
  - Ask questions about requirements

**Backend:** `POST /api/workspace/projects/:projectId/start-work`
- Updates: Project.status = "in-progress"
- Updates: Project.workStarted = true, Project.startedAt = now

---

### **PHASE 5️⃣: WORK SUBMISSION & REVIEW** (10-20 min)

#### **Step A: Student Submits Work**

**What Student Does:**
1. Click **"SUBMIT WORK"** button
2. Go to `/workspace/projects/:projectId/submit`
3. Upload files (max 3 files, 5MB each):
   - Source code, documentation, assets, etc.
4. Add links (optional):
   - GitHub repo, live demo, portfolio
5. Write message: "Here's the completed project..."
6. Click "Submit Work"

**Result:**
- ✅ Submission created
- ✅ Project status changes: "in-progress" → **"SUBMITTED"**
- ✅ Company gets notification: "Work submitted for review"

**Backend:** `POST /api/workspace/projects/:projectId/submit-work`
- Creates: Submission document
- Updates: Project.status = "submitted"

#### **Step B: Company Reviews & Decides**

**What Company Does:**
1. Get notification: "Work submitted"
2. Go to `/workspace/projects/:projectId/review`
3. See all submitted files with preview/download
4. See submission message and links
5. See all previous submissions (if revisions)
6. Click ONE of three buttons:

**Option 1: APPROVE ✅**
- Submits: Work is perfect, project complete
- Result:
  - ✅ Submission status: "approved"
  - ✅ Project status: "completed"
  - ✅ Student notified: "Work approved!"
  - ✅ Student can now rate company
  - ✅ Company can rate student
  - ✅ Payment can now be processed

**Option 2: REQUEST REVISION 🔄**
- Says: Please fix these issues...
- Student can resubmit up to max allowed (usually 3)
- Result:
  - ✅ Project status: "revision-requested"
  - ✅ Project.revisionCount += 1
  - ✅ Student notified: "Revision requested"
  - ✅ Student goes back to submit page
  - ✅ Student fixes issues
  - ✅ Student resubmits (Submission #2, #3, etc.)
  - ✅ Company reviews again

**Option 3: REJECT ❌**
- Says: Work doesn't meet requirements
- Rare - usually just request revisions
- Result:
  - ✅ Submission status: "rejected"
  - ✅ Project status: "rejected"
  - ✅ Student notified
  - ✅ May need to restart

**Backend:**
- Approve: `POST /api/workspace/projects/:projectId/approve-work`
- Revision: `POST /api/workspace/projects/:projectId/request-revision`

---

### **PHASE 6️⃣: PAYMENT & RATING** (5 min total)

#### **Step A: Company Pays (Can happen anytime after project assigned)**

**What Company Does:**
1. In workspace, click **"PAY NOW"** button
2. Redirected to `/payment/:projectId`
3. See payment amount (from project budget)
4. Razorpay payment gateway opens
5. Enter test card details:
   - Card: 4111 1111 1111 1111
   - Expiry: 12/25
   - CVV: 123
6. Click "PAY"

**Result:**
- ✅ Payment processed
- ✅ Project.paymentStatus = **"PAID"**
- ✅ Student sees earnings in `/student/payments`
- ✅ Can view total earnings dashboard

**Backend:** `POST /api/payments/create-order` → Payment recorded

#### **Step B: Both Rate Each Other**

**What Student Does:**
1. Go to `/workspace/projects/:projectId/rate`
2. Click 5 stars (or whatever rating)
3. Write review: "Great company to work with..."
4. Select "Would recommend?" → Yes/No
5. Submit

**What Company Does:**
1. Same URL `/workspace/projects/:projectId/rate`
2. Click 5 stars
3. Write review: "Excellent work, very professional..."
4. Select "Would rehire?" → Yes/No
5. Submit

**Result:**
- ✅ Ratings saved
- ✅ Project.ratingCompleted = true
- ✅ Both ratings visible on both profiles
- ✅ **✅ WORKFLOW COMPLETE!** 🎉

**Backend:** 
- `POST /api/ratings/projects/:id/rate-company` (Student rates)
- `POST /api/ratings/projects/:id/rate-student` (Company rates)

---

## 📊 STATUS CHANGES AT A GLANCE

```
PROJECT STATUS:
open 
  ↓ (company accepts application)
assigned 
  ↓ (student clicks "start work")
in-progress 
  ↓ (student submits)
submitted 
  ├─ (company requests revision) → in-progress (loop back)
  │
  └─ (company approves) → completed

APPLICATION STATUS:
pending 
  ├─ (company rejects) → rejected
  └─ (company accepts) → accepted

SUBMISSION STATUS:
submitted 
  ├─ (request revision) → revision-requested
  ├─ (resubmit) → submitted (loops back)
  └─ (approve) → approved
```

---

## 🔑 KEY NUMBERS

```
Profile Completion: 100% (required to post project)
File Size Limit: 5MB per file
Files Per Submission: Max 3 files
Max Revisions: Usually 3 allowed
Workspace Access: Only assigned student + company owner
Application Window: Until project status changes from "open"
Payment Gateway: Razorpay
Rating Scale: 1-5 stars
```

---

## 🎯 WHERE TO GO AT EACH STEP

| Phase | Person | URL | Action |
|-------|--------|-----|--------|
| 1 | Company | `/company/post-project` | Post project |
| 2 | Student | `/student/browse-projects` | Browse & apply |
| 3 | Company | `/company/applications` | Review & accept |
| 4 | Student | `/workspace/projects/:id` | Click "Start Work" |
| 5a | Student | `/workspace/projects/:id/submit` | Submit work |
| 5b | Company | `/workspace/projects/:id/review` | Approve/reject/revise |
| 6a | Company | `/payment/:id` | Pay for project |
| 6b | Both | `/workspace/projects/:id/rate` | Rate each other |

---

## 🚀 TEST IT IN 30 MINUTES

```
Minute 0-5:    Company posts project
Minute 5-15:   Student applies
Minute 15-18:  Company accepts
Minute 18-20:  Student starts work
Minute 20-25:  Student submits
Minute 25-27:  Company approves
Minute 27-29:  Company pays
Minute 29-30:  Both rate

Done! ✅
```

---

## 📚 FULL DOCUMENTATION

For complete details, see:
- `PROJECT_WORKFLOW_COMPLETE_GUIDE.md` - Full step-by-step guide
- `PROJECT_WORKFLOW_VISUAL_DIAGRAMS.md` - Visual flowcharts
- `PROJECT_WORKFLOW_QUICK_REFERENCE.md` - Testing guide with examples
- `PROJECT_WORKFLOW_DOCUMENTATION_INDEX.md` - Navigation guide

---

**Version:** 1.0  
**Last Updated:** January 1, 2026  
**For:** Complete project workflow understanding and testing  
**Time to Read:** 5 minutes  
**Time to Understand:** 15 minutes with examples  
**Time to Test:** 30 minutes hands-on
