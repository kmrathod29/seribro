## 🧠 SERIBRO — Ultra Master Documentation (Phases 1–4.5)  

> **Status:** ✅ Production-ready through Phase 4.5  
> **Current Implemented Phases:**  
> - ✅ Initial Setup  
> - ✅ Phase 1: Authentication System  
> - ✅ Phase 2: Profile Completion (Student & Company)  
> - ✅ Phase 3: Admin Verification System  
> - ✅ Phase 4.1–4.5: Project Management, Applications & Selection  

---

## 📚 Table of Contents

1. [Project Overview & Status](#-project-overview--status)
2. [Complete Architecture](#-complete-architecture)
   - 2.1 [System Architecture](#-21-system-architecture)
   - 2.2 [Folder Structure](#-22-folder-structure)
   - 2.3 [External Services & Integrations](#-23-external-services--integrations)
3. [Backend Documentation](#-backend-documentation)
   - 3.1 [Controllers](#-31-all-controllers)
   - 3.2 [Middleware](#-32-all-middleware)
   - 3.3 [Routes](#-33-all-routes)
   - 3.4 [Utilities](#-34-all-utility-files)
   - 3.5 [Database Models/Schemas](#-35-database-modelsschemas)
4. [Frontend Documentation](#-frontend-documentation)
   - 4.1 [Pages & Components](#-41-all-pagescomponents)
   - 4.2 [API Integration](#-42-api-integration)
   - 4.3 [State Management & Auth](#-43-state-management--auth)
   - 4.4 [Routing](#-44-routing)
5. [Algorithms Implemented](#-algorithms-implemented)
6. [Installation & Setup](#-installation--setup)
7. [Running the Application](#-running-the-application)
8. [Complete Testing Guide](#-complete-testing-guide)
9. [API Documentation (REST)](#-api-documentation)
10. [Common Issues & Solutions](#-common-issues-and-solutions)
11. [Contributing Guidelines](#-contributing-guidelines)
12. [Implementation Status & Roadmap](#-implementation-status--roadmap)

---

## 1️⃣ Project Overview & Status

**Project Name:** **SERIBRO** – Student–Company Micro‑Project Platform  
**Stack:** Node.js + Express + MongoDB (backend), React + Vite + Tailwind (frontend)  
**Current Scope Covered in Codebase (Phase 1–4.5):**
- ✅ Authentication (student, company, admin) with OTP & password reset
- ✅ Student & Company profile completion with document uploads and completion % logic
- ✅ Admin verification dashboard (students & companies) with approve/reject and email notifications
- ✅ Project lifecycle: posting, browsing, applying, shortlisting, assignment, auto‑close
- ✅ Notification system for all key events (applications, approvals, closures)

Everything documented below is **based strictly on the current codebase** under `phase2.1/seribro-backend` and `phase2.1/seribro-frontend/client`.

---

## 2️⃣ Complete Architecture

### 2.1 System Architecture

High‑level view (logical, not physical):

```mermaid
flowchart LR
  Browser[React Frontend\n(Vite, Tailwind)] 
    --> |HTTP (JSON, cookies)| API[Node.js + Express Backend]

  API --> |Mongoose| DB[(MongoDB)]
  API --> |SMTP| Email[Email Provider\n(Nodemailer/Brevo)]
  API --> |SDK| Cloudinary[Cloudinary\n(file storage)]
  API --> Cron[Node-Cron Jobs\n(auto-close, timeouts)]

  subgraph Users
    Student[Student User]
    Company[Company User]
    Admin[Admin User]
  end

  Student --> Browser
  Company --> Browser
  Admin --> Browser
```

- **Frontend architecture**
  - React SPA (Vite)
  - Tailwind-based design system + custom components
  - Feature-based directories: `pages/`, `components/`, `apis/`, `utils/`
  - Role‑segregated views: `students/`, `company/`, `admin/`, `Auth/`

- **Backend architecture**
  - Express app (`server.js`) with modular `routes/`, `controllers/`, `models/`, `middleware/`, `utils/`, `jobs/`
  - Follows a clean layered structure:
    - **Routes**: HTTP endpoints & middleware composition
    - **Controllers**: business logic per feature
    - **Models**: Mongoose schemas for core entities
    - **Middleware**: auth/role guards, validation, uploads, selection workflow
    - **Utils**: OTP/JWT/email, Cloudinary uploads, profile completion, notifications, cron
    - **Jobs**: auto‑close projects and selection timeouts

- **Database schema overview**
  - `User`: auth + role + reset/password and device tracking
  - `Student` + `StudentProfile`: identity + full academic & portfolio data
  - `Company` + `CompanyProfile`: identity + organization & verification data
  - `Project`: projects posted by companies, with status and selection metadata
  - `Application`: student applications to projects, with detailed snapshot and selection status
  - `OTP`: short‑lived email verification codes (TTL 10 minutes)
  - `Notification`: generic notification entity for all roles

- **External services**
  - **MongoDB** (Atlas/local): primary datastore via Mongoose
  - **Cloudinary** (`backend/config/cloudinary.js`): file storage for resumes, college IDs, certificates, company docs, logos
  - **Email (Nodemailer/Brevo)** (`backend/utils/sendEmail.js`): OTP & password reset + admin verification emails
  - **Cron (node-cron)** (`backend/utils/cronScheduler.js` + `backend/jobs/autoCloseProjects.js`): scheduled project auto‑close and timeouts

### 2.2 Folder Structure

#### Backend (`phase2.1/seribro-backend`)

```text
seribro-backend/
├── server.js                     # Express app entrypoint
├── package.json
├── README-auth.md                # Auth-focused backend README
├── BACKEND_STRUCTURE.md          # Backend structure & counts
├── 2.1studentprofileReadME.md    # Student profile phase README
├── APPLICATION_SELECTION_API_DOCS.md
├── testing_manual/               # Manual test guides
│   └── ... (login/signup & flow docs)
├── backend/
│   ├── config/
│   │   ├── dbconection.js        # MongoDB connection
│   │   └── cloudinary.js         # Cloudinary SDK & config
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── StudentProfileController.js
│   │   ├── studentDashboard.controller.js
│   │   ├── studentProjectController.js
│   │   ├── companyProfileController.js
│   │   ├── companyDashboard.controller.js
│   │   ├── companyProjectController.js
│   │   ├── companyApplicationController.js
│   │   ├── adminVerificationController.js
│   │   ├── adminProjectController.js
│   │   ├── adminApplicationController.js
│   │   ├── notificationController.js
│   │   └── applicationSelectionController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── studentProfileRoute.js
│   │   ├── studentDashboard.routes.js
│   │   ├── studentProjectRoutes.js
│   │   ├── companyProfileRoutes.js
│   │   ├── companyDashboard.routes.js
│   │   ├── companyProjectRoutes.js
│   │   ├── companyApplicationRoutes.js
│   │   ├── adminVerification.routes.js
│   │   ├── adminProjectRoutes.js
│   │   ├── adminApplicationRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── applicationSelectionRoutes.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── roleMiddleware.js
│   │   ├── uploadMiddleware.js          # generic
│   │   ├── adminOnly.js
│   │   ├── applicationSelectionValidation.js
│   │   ├── selectionSystemGuards.js
│   │   ├── student/
│   │   │   ├── roleMiddleware.js
│   │   │   ├── isVerified.js
│   │   │   ├── validationMiddleware.js
│   │   │   ├── uploadMiddleware.js      # student uploads
│   │   │   ├── profileCompletionCheck.js
│   │   │   ├── projectAccessMiddleware.js
│   │   │   └── applicationValidation.js
│   │   └── company/
│   │       ├── validationMiddleware.js
│   │       ├── uploadMiddleware.js      # company uploads
│   │       ├── projectValidation.js
│   │       ├── projectAccessMiddleware.js
│   │       ├── profileCompletionCheck.js
│   │       └── applicationAccessMiddleware.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Student.js
│   │   ├── StudentProfile.js
│   │   ├── Company.js
│   │   ├── companyProfile.js
│   │   ├── Project.js
│   │   ├── Application.js
│   │   ├── Notification.js
│   │   └── OTP.js
│   ├── utils/
│   │   ├── generateOTP.js
│   │   ├── generateToken.js
│   │   ├── generateResetToken.js
│   │   ├── sendEmail.js
│   │   ├── cronScheduler.js
│   │   ├── notifications/
│   │   │   └── sendNotification.js
│   │   ├── admin/
│   │   │   ├── auditLog.js
│   │   │   └── sendVerificationEmail.js
│   │   ├── background/
│   │   │   └── applicationTimeoutJob.js
│   │   ├── students/
│   │   │   ├── sendResponse.js
│   │   │   ├── uploadToCloudinary.js
│   │   │   ├── calculateProfileCompletion.js
│   │   │   ├── validateProjectData.js
│   │   │   ├── checkGithubLink.js
│   │   │   └── projectHelpers.js
│   │   └── company/
│   │       ├── validateCompanyData.js
│   │       ├── validateFileHelpers.js
│   │       ├── validateGSTNumber.js
│   │       ├── calculateCompanyProfileCompletion.js
│   │       └── uploadToCloudinary.js
│   ├── jobs/
│   │   └── autoCloseProjects.js         # auto close expired projects
│   └── uploads/                         # temp local files (multer)
│       └── collegeId-*.jpg/png/jpeg
└── uploads/                             # root-level uploads (legacy)
```

#### Frontend (`phase2.1/seribro-frontend/client`)

```text
seribro-frontend/
└── client/
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    ├── index.html
    ├── public/
    │   └── seribro_new_logo.png, favicon, etc.
    └── src/
        ├── main.jsx
        ├── App.jsx
        ├── index.css
        ├── apis/
        │   ├── api.js                      # base Axios for auth
        │   ├── studentProfileApi.js
        │   ├── studentProjectApi.js
        │   ├── companyProfileApi.js
        │   ├── companyProjectApi.js
        │   ├── companyApplicationApi.js
        │   ├── adminApi.js
        │   ├── adminProjectApi.js
        │   ├── adminApplicationApi.js
        │   ├── adminVerificationApi.js
        │   └── notificationApi.js
        ├── components/
        │   ├── Navbar.jsx
        │   ├── Footer.jsx
        │   ├── NotificationBell.jsx
        │   ├── AdminLayout.jsx
        │   ├── studentComponent/
        │   │   ├── ProfileCompletionBar.jsx
        │   │   ├── BasicInfoForm.jsx
        │   │   ├── SkillsForm.jsx
        │   │   ├── PortfolioLinksForm.jsx
        │   │   ├── DocumentUpload.jsx
        │   │   ├── ProjectForm.jsx
        │   │   ├── ProjectCard.jsx
        │   │   ├── ApplicationStats.jsx
        │   │   └── ProfileIncompleteModal.jsx
        │   ├── companyComponent/
        │   │   ├── ProfileCompletionBar.jsx
        │   │   ├── BasicInfoForm.jsx
        │   │   ├── DetailsForm.jsx
        │   │   ├── AuthorizedPersonForm.jsx
        │   │   ├── LogoUpload.jsx
        │   │   ├── DocumentUpload.jsx
        │   │   ├── ProjectForm.jsx
        │   │   ├── ProjectCard.jsx
        │   │   ├── ApplicationCard.jsx
        │   │   ├── ApplicationStatsCards.jsx
        │   │   ├── AcceptApplicationModal.jsx
        │   │   └── RejectApplicationModal.jsx
        │   └── admin/
        │       ├── ProjectStatsCards.jsx
        │       ├── ApplicationStatsCards.jsx
        │       ├── AdminProfilePreview.jsx
        │       ├── DocumentViewer.jsx
        │       └── ProjectStatsCards.jsx
        ├── pages/
        │   ├── Home.jsx
        │   ├── About.jsx
        │   ├── Help.jsx
        │   ├── ForgotPassword.jsx
        │   ├── ResetPassword.jsx
        │   ├── NotFound/NotFound.jsx
        │   ├── Auth/
        │   │   ├── Login.jsx
        │   │   └── Signup.jsx
        │   ├── students/
        │   │   ├── Dashboard.jsx
        │   │   ├── StudentDashboard.jsx (alias / variant)
        │   │   ├── StudentProfile.jsx
        │   │   ├── BrowseProjects.jsx
        │   │   ├── ProjectDetails.jsx
        │   │   ├── MyApplications.jsx
        │   │   └── ProjectDetails.jsx
        │   ├── company/
        │   │   ├── CompanyDashboard.jsx
        │   │   ├── CompanyProfile.jsx
        │   │   ├── MyProjects.jsx
        │   │   ├── PostProject.jsx
        │   │   ├── ProjectDetails.jsx
        │   │   ├── CompanyApplications.jsx
        │   │   └── ApplicationDetails.jsx
        │   └── admin/
        │       ├── AdminDashboard.jsx
        │       ├── AdminProjects.jsx
        │       ├── AdminProjectDetails.jsx
        │       ├── AdminApplications.jsx
        │       ├── AdminApplicationDetails.jsx
        │       ├── AdminVerification.jsx
        │       ├── PendingStudents.jsx
        │       ├── PendingCompanies.jsx
        │       ├── StudentReview.jsx
        │       └── CompanyReview.jsx
        ├── hooks/
        │   └── useAutoRefresh.js
        └── utils/
            ├── authUtils.js
            └── company/
                ├── validateCompanyData.js
                └── validateGSTNumber.js
```

### 2.3 External Services & Integrations

Only services actually wired in code are listed.

- **Database – MongoDB**
  - Connection via `backend/config/dbconection.js`
  - Env: `MONGO_URI` or similar (see `.env` section)
  - All models use Mongoose, with indexes for performance & data integrity (unique, compound).

- **File Storage – Cloudinary**
  - Configuration: `backend/config/cloudinary.js`
  - Used by:
    - `backend/utils/students/uploadToCloudinary.js`
    - `backend/utils/company/uploadToCloudinary.js`
  - Controllers that upload to Cloudinary:
    - `StudentProfileController.uploadResume`, `.uploadCollegeId`, `.uploadCertificates`
    - `companyProfileController.uploadLogo`, `.uploadDocuments`

- **Email Service – Nodemailer/Brevo**
  - Implementation: `backend/utils/sendEmail.js`
  - Used by:
    - `authController` (OTP, forgot password)
    - `adminVerificationController` via `utils/admin/sendVerificationEmail.js`
  - Env keys (see `.env` section).

- **Authentication – JWT tokens**
  - Token creation: `backend/utils/generateToken.js`
  - Cookie‑based auth with httpOnly cookie `jwt`
  - Middleware:
    - `authMiddleware.protect` – attaches `req.user`
    - `authMiddleware.roleCheck` / `authorize` – role‑gated access

---

## 3️⃣ Backend Documentation

> This section is concise but complete. For each item only implemented functions/routes are documented.

### 3.1 ALL Controllers

#### 3.1.1 `authController.js`

- **Location:** `backend/controllers/authController.js`
- **Purpose:** Phase 1 authentication: student/company registration, OTP verification, login/logout, password reset.
- **Exports & Functions:**
  - `registerStudent(req, res)`
    - **Route:** `POST /api/auth/student/register`
    - **Body:** `{ fullName, email, college, skills (comma string), password }` + `collegeId` (file)
    - **Flow:** validates fields, ensures unique email, creates `User` (role `student`) and `Student`, stores `collegeId` file path, generates OTP (`generateOTP` + `OTP` model), sends email via `sendEmail`, wraps in mongoose transaction.
  - `registerCompany(req, res)`
    - **Route:** `POST /api/auth/company/register`
    - **Body:** `{ contactPerson, companyName, email, password }` + `verificationDocument` (file)
    - **Flow:** similar to `registerStudent`, but creates `Company`.
  - `sendOtp(req, res)`
    - **Route:** `POST /api/auth/send-otp`
    - **Body:** `{ email }`
    - **Flow:** ensures user exists and not verified, generates OTP, saves to `OTP`, emails code.
  - `verifyOtp(req, res)`
    - **Route:** `POST /api/auth/verify-otp`
    - **Body:** `{ email, otp }`
    - **Flow:** validates OTP document, updates `User.emailVerified = true`, deletes OTP, returns success.
  - `loginUser(req, res)`
    - **Route:** `POST /api/auth/login`
    - **Body:** `{ email, password }`
    - **Flow:** verifies user + password; if not verified, sends a new OTP (202 status); if verified, tracks device in `user.devices`, signs JWT to cookie, responds with role and flags.
  - `logoutUser(req, res)`
    - **Route:** `POST /api/auth/logout`
    - **Flow:** clears jwt cookie.
  - `forgotPassword(req, res)`
    - **Route:** `POST /api/auth/forgot-password`
    - **Body:** `{ email }`
    - **Flow:** generates reset token via `generateResetToken`, stores on `User`, emails reset link using `FRONTEND_URL/reset-password?token=...`.
  - `resetPassword(req, res)`
    - **Route:** `POST /api/auth/reset-password`
    - **Body:** `{ token, password }`
    - **Flow:** verifies token + expiry, sets new password (hashed via pre‑save), clears reset fields.

**Models used:** `User`, `Student`, `Company`, `OTP`  
**Errors:** 400 validation, 401 invalid creds, 404 user not found, 409 existing user, 500 on transaction/email failures.

#### 3.1.2 `StudentProfileController.js`

- **Location:** `backend/controllers/StudentProfileController.js`
- **Purpose:** Phase 2 student profile CRUD, documents, projects, and submission for admin verification.
- **Key exports:**
  - `getProfile(req, res)`
    - **Route:** `GET /api/student/profile`
    - **Flow:** finds or creates `StudentProfile` for `req.user.studentId`; initializes all nested structures; recalculates profile completion via instance method; returns profile.
  - `updateBasicInfo(req, res)`
    - **Route:** `PUT /api/student/profile/basic`
    - **Body:** basic fields (name, phone, degree, etc.)
    - **Flow:** patch‑updates `profile.basicInfo`, refreshes `profileStats.lastUpdated`.
  - `updateSkills(req, res)`
    - **Route:** `PUT /api/student/profile/skills`
    - **Body:** `{ technical, soft, languages, primarySkills }`
  - `updateTechStack(req, res)`
    - **Route:** `PUT /api/student/profile/tech`
    - **Body:** `{ techStack: [] }`, must be array.
  - `updatePortfolioLinks(req, res)`
    - **Route:** `PUT /api/student/profile/links`
    - **Body:** `{ github, linkedin, portfolio, other[] }` with URL validation.
  - `uploadResume(req, res)`
    - **Route:** `POST /api/student/profile/resume`
    - **Upload:** `resume` (PDF) via student upload middleware → Cloudinary
    - **Stores:** `{ filename, public_id, url, path, uploadedAt }` in `documents.resume`.
  - `uploadCollegeId(req, res)`
  - `uploadCertificates(req, res)`
    - Similar patterns for `documents.collegeId` and `documents.certificates[]`.
  - `addProject(req, res)`
    - **Route:** `POST /api/student/profile/projects`
    - **Validations:** max 5 projects, `validateProjectData`, optional GitHub link checked via `checkGithubLink`.
  - `updateProject(req, res)` / `deleteProject(req, res)`
    - Enforces minimum 3 projects required for deletion.
  - `submitForVerification(req, res)`
    - **Route:** `POST /api/student/profile/submit-verification`
    - **Guards:** also enforced by middleware, but re‑checks:
      - `profileStats.profileCompletion === 100`
      - ≥ 3 projects
      - resume + collegeId present
    - Calls `profile.submitForVerification()` (instance method) and sends admin notification via `utils/notifications/sendNotification.sendAdminNotification`.
  - `getDashboard(req, res)`
    - **Route:** `GET /api/student/profile/dashboard` (via this controller) – used in older flow; returns completion %, alerts, status summary.

#### 3.1.3 `studentDashboard.controller.js`

- **Location:** `backend/controllers/studentDashboard.controller.js`
- **Purpose:** Phase 3+ richer dashboard & verification submit/resubmit endpoints.
- **Exports:**
  - `getStudentDashboard(req, res)`
    - **Route:** `GET /api/student/dashboard`
    - Requires: `protect`, `roleCheck(['student'])`, `isProfileVerified`.
    - Assembles:
      - Basic user + profile info
      - Computed completion % via internal `calculateProfileCompletion`
      - Verification block with status + reason
      - Documents summary
      - Notifications (last 10 via `Notification` model)
  - `submitForVerification(req, res)` (dashboard variant)
  - `resubmitForVerification(req, res)`
    - Use top‑level `verificationStatus` fields and `sendAdminNotification` for admin.

#### 3.1.4 `studentProjectController.js`

- **Location:** `backend/controllers/studentProjectController.js`
- **Purpose:** Phase 4.2 – browsing projects, applying, tracking applications and recommendations.
- **Exports:**
  - `browseProjects(req, res)`
    - **Route:** `GET /api/student/projects/browse`
    - Filters: `page`, `limit`, `search`, `category`, `skills`, `budgetMin`, `budgetMax`, `sortBy`
    - Only returns **open & not assigned** projects (`status: 'open', assignedStudent: null, isDeleted: false`).
    - Computes skill match % via `utils/students/projectHelpers.calculateSkillMatch` using student’s tech/soft/language skills.
  - `getProjectDetails(req, res)`
    - **Route:** `GET /api/student/projects/:id`
    - Guarded by `ensureProfileComplete` middleware (100% & verified).
    - Populates company info, skillMatch and `hasApplied`/`applicationStatus` flags.
  - `applyToProject(req, res)`
    - **Route:** `POST /api/student/projects/:id/apply`
    - Uses:
      - `applicationValidation` middleware (body validation, duplicate check, project availability)
      - Creates `Application` with both `studentSnapshot` and `studentData` (full snapshot with hidden email/phone fields)
      - Sends notifications to student and company via `Notification` model and `createNotification` helper.
      - Increments `Project.applicationsCount`, pushes to `shortlistedStudents`, and increments counters on `StudentProfile`.
  - `getMyApplications`, `getApplicationStats`, `getApplicationDetails`, `withdrawApplication`
    - Endpoints under `/api/student/applications/*` for listing, stats, detail view and withdrawal.
  - `getRecommendedProjects`
    - **Route:** `GET /api/student/projects/recommended`
    - Computes top projects by match %.

#### 3.1.5 `companyProfileController.js`

- **Location:** `backend/controllers/companyProfileController.js`
- **Purpose:** Company profile completion, logo/doc uploads, and verification.
- **Key exports:**
  - `initializeCompanyProfile`, `getCompanyProfile`
  - `updateBasicInfo`, `updateDetails`, `updateAuthorizedPerson`
  - `uploadLogo`, `uploadDocuments`
    - Cloudinary integration; cleans up temporary files.
  - `submitForVerification`
    - Sets `verificationStatus = 'pending'`
    - Creates admin notification via `sendAdminNotification`.
  - `getCompanyDashboard`
    - Provides summary (completion %, verification status, basic info).

#### 3.1.6 `companyProjectController.js`

- **Location:** `backend/controllers/companyProjectController.js`
- **Purpose:** Phase 4.1 – company project creation, management, stats.
- **Exports (main):**
  - `createProject`
    - **Route:** `POST /api/company/projects/create`
    - Requires 100% company profile (checked via `calculateCompanyProfileCompletion` + `profileCompletionCheck` middleware).
    - Duplicate project protection: case‑insensitive title match among active projects (open/assigned/in‑progress) per company.
  - `getCompanyProjects`
    - **Route:** `GET /api/company/projects/my-projects`
    - Supports filters: status, search, pagination.
  - `getProjectDetails`
  - `updateProject`, `deleteProject` (soft delete with applications guard)
  - `getProjectApplications`
    - Returns shortlisted students and application counts.
  - `shortlistStudent`, `assignProject`
  - `getProjectStats`
    - Aggregate counts by status for a company.

#### 3.1.7 `companyApplicationController.js`

- **Location:** `backend/controllers/companyApplicationController.js`
- **Purpose:** Phase 4.3 & 4.5 – company view over applications per project and globally, including shortlist/approve/reject flows.
- **Key exports:**
  - `getProjectApplications(projectId)`
    - **Route:** `GET /api/company/applications/projects/:projectId/applications`
    - Ownership enforced via `CompanyProfile` + `project.companyId`.
    - Returns **sanitized** student view (no email/phone), with `studentSnapshot` fallback for consistency and skillMatch.
  - `getAllCompanyApplications`
    - **Route:** `GET /api/company/applications/all`
    - Filters: `status`, `projectId`, pagination.
  - `getApplicationDetails(applicationId)`
    - **Route:** `GET /api/company/applications/:applicationId`
    - Ownership check, returns structured `application`, `student` (with projects and doc URLs), `project` and `skillMatch`.
  - `shortlistApplication`
  - `approveStudentForProject` (Phase 4.5)
    - Approves one application and in a transaction:
      - Marks it `accepted`
      - Marks all others for same project as `rejected`
      - Sets `Project.assignedStudent` and `status = 'assigned'`
      - Sends notifications (student accepted, company confirmation, others rejected).
  - `acceptApplication` (legacy, kept for backward compatibility)
  - `rejectApplication`, `bulkRejectApplications`, `getApplicationStats`.

#### 3.1.8 `adminVerificationController.js`

- **Location:** `backend/controllers/adminVerificationController.js`
- **Purpose:** Phase 3 – admin dashboard, pending lists, approve/reject operations, and admin notifications.
- **Main exports:**
  - `getAdminDashboard`
    - **Route:** `GET /api/admin/dashboard`
    - Aggregates counts: total students, companies, pending verifications + recent pending items list.
  - `getPendingStudents`, `getPendingCompanies`
  - `getStudentDetails(id)`, `getCompanyDetails(id)`
    - For admin review pages; student details include properly formatted document URLs (Cloudinary).
  - `approveStudent`, `rejectStudent`
  - `approveCompany`, `rejectCompany`
  - `getNotifications`, `markNotificationAsRead` (admin‑scoped).

#### 3.1.9 `adminProjectController.js`

- **Location:** `backend/controllers/adminProjectController.js`
- **Purpose:** Phase 2.1 – admin project monitoring.
- **Exports:** `getProjectStats`, `getAllProjects`, `getProjectDetails`, `getProjectApplications` – all admin‑only analytics.

#### 3.1.10 `adminApplicationController.js`

- **Location:** `backend/controllers/adminApplicationController.js`
- **Purpose:** Phase 2.1 – admin application monitoring.
- **Exports:** `getApplicationStats`, `getAllApplications`, `getApplicationDetails` (with full student profile & project, including project array & documents with correct URLs).

#### 3.1.11 `notificationController.js`

- **Location:** `backend/controllers/notificationController.js`
- **Purpose:** Unified notification listing/manage for all roles.
- **Exports:** `getNotifications`, `markAsRead`, `markAllAsRead`, `deleteNotification`, `deleteReadNotifications`, `getUnreadCount`.

#### 3.1.12 `applicationSelectionController.js`

- **Location:** `backend/controllers/applicationSelectionController.js`
- **Purpose:** Phase 4.5+ experimental multi‑stage selection and timeouts (bulk shortlist, selection rounds, student responses, auto‑timeout).
- **Exports:** `shortlistApplications`, `selectStudent`, `acceptApplication` (student), `declineApplication`, `autoTimeoutApplications`, `getApplicationsByStatus`.
- **Status:** 🚧 Advanced selection system exists and is wired via `applicationSelectionRoutes` & `applicationSelectionValidation` – partially overlapping with `companyApplicationController.approveStudentForProject`. Use one workflow consistently; current UI uses `approveStudentForProject` as the primary.

> Any controller not listed here is either not present in this branch or not used in the mounted routes.

---

### 3.2 ALL Middleware

Only the important middleware is listed; many are small and focused.

- **`authMiddleware.js`**
  - **Location:** `backend/middleware/authMiddleware.js`
  - **Exports:**
    - `protect(req, res, next)`: reads JWT from cookie, verifies, loads `User` (without password) into `req.user`. 401 if missing/invalid.
    - `roleCheck(allowedRoles)` / `authorize(role)` (in selection routes): ensures `req.user.role` matches required roles (student/company/admin).

- **`roleMiddleware.js`**
  - **Location:** `backend/middleware/roleMiddleware.js`
  - **Exports:** `isAdmin`, `isCompany`, `isStudent` – simple wrappers for route‑level security in admin routes.

- **Student‑specific:**
  - `backend/middleware/student/roleMiddleware.js`
    - `roleMiddleware(['student'])` used to gate most `/api/student/*` routes.
  - `backend/middleware/student/isVerified.js`
    - `isProfileVerified` ensures student’s email is verified and/or profile has required flags.
  - `backend/middleware/student/validationMiddleware.js`
    - Validates body based on type: `basicInfo`, `skills`, `techStack`, `project`.
  - `backend/middleware/student/uploadMiddleware.js`
    - Multer config for student uploads (resume, collegeId, certificates).
  - `backend/middleware/student/profileCompletionCheck.js`
    - Checks 100% completion for student; used before verification submission.
  - `backend/middleware/student/projectAccessMiddleware.js`
    - `ensureProfileComplete` (100% + verified) and helpers for gating project detail/apply endpoints.
  - `backend/middleware/student/applicationValidation.js`
    - Validates application payload, checks duplicates (`Application.hasStudentApplied`) and project status/availability.

- **Company‑specific:**
  - `backend/middleware/company/validationMiddleware.js`
    - Validates company profile segments (basic, details, authorized person).
  - `backend/middleware/company/uploadMiddleware.js`
    - Multer config for logo/documents uploads.
  - `backend/middleware/company/projectValidation.js`
  - `backend/middleware/company/projectAccessMiddleware.js`
    - Ensures project owner for operations like edit/delete and viewing applications.
  - `backend/middleware/company/profileCompletionCheck.js`
    - Ensures company profile is 100% complete before project creation.
  - `backend/middleware/company/applicationAccessMiddleware.js`
    - Guards application routes to ensure company owns project/application; validates rejection reason, etc.

- **Selection‑system & Admin:**
  - `backend/middleware/adminOnly.js` – simple admin guard used in `adminVerification.routes`.
  - `backend/middleware/applicationSelectionValidation.js` – validates payloads for the advanced selection system (`applicationSelectionRoutes`).
  - `backend/middleware/selectionSystemGuards.js` – extra safeguards for selection flows (used by selection routes).

---

### 3.3 ALL Routes

Mounted base paths (from `server.js`):

- `/api/auth` → `backend/routes/authRoutes.js`
- `/api/student` → `studentProfileRoute.js`, `studentDashboard.routes.js`, `studentProjectRoutes.js`
- `/api/company` → `companyProfileRoutes.js`, `companyDashboard.routes.js`, `companyProjectRoutes.js`
- `/api/company/applications` → `companyApplicationRoutes.js`
- `/api/admin` → `adminVerification.routes.js`, `adminProjectRoutes.js`, `adminApplicationRoutes.js`
- `/api/notifications` → `notificationRoutes.js`
- `/api/*/applications` (advanced) → `applicationSelectionRoutes.js` (under company/student/system)

Below is a compact summary for core route files.

#### `authRoutes.js`

- **Base Path:** `/api/auth`
- **Endpoints:**

| Method | Path                      | Purpose                        | Auth | Role  | Middleware        | Controller         |
|--------|---------------------------|--------------------------------|------|-------|-------------------|--------------------|
| POST   | `/student/register`       | Register student               | No   | Public| `upload.single`   | `registerStudent`  |
| POST   | `/company/register`       | Register company               | No   | Public| `upload.single`   | `registerCompany`  |
| POST   | `/send-otp`              | Send verification OTP         | No   | Public| –                 | `sendOtp`          |
| POST   | `/verify-otp`            | Verify OTP & mark email       | No   | Public| –                 | `verifyOtp`        |
| POST   | `/login`                 | Login & set JWT cookie        | No   | Public| –                 | `loginUser`        |
| POST   | `/logout`                | Clear JWT cookie              | Yes  | Any   | `protect` (not used here but can be) | `logoutUser` |
| POST   | `/forgot-password`       | Send reset link               | No   | Public| –                 | `forgotPassword`   |
| POST   | `/reset-password`        | Reset password via token      | No   | Public| –                 | `resetPassword`    |

#### `studentProfileRoute.js` (Profile phase)

- **Base Path:** `/api/student`

All routes are pre‑wrapped with `protect` + `roleMiddleware(['student'])`.

Key endpoints:

| Method | Path                          | Purpose                        | Extra Middleware                     | Controller              |
|--------|-------------------------------|--------------------------------|--------------------------------------|-------------------------|
| GET    | `/profile`                    | Get or create student profile  | –                                    | `getProfile`           |
| GET    | `/dashboard`                  | Profile/dashboard summary      | –                                    | `getDashboard`         |
| PUT    | `/profile/basic`              | Update basic info              | `validationMiddleware('basicInfo')` | `updateBasicInfo`      |
| PUT    | `/profile/skills`             | Update skills                  | `validationMiddleware('skills')`    | `updateSkills`         |
| PUT    | `/profile/tech`               | Update tech stack              | `validationMiddleware('techStack')` | `updateTechStack`      |
| PUT    | `/profile/links`              | Update portfolio links         | –                                    | `updatePortfolioLinks` |
| POST   | `/profile/resume`             | Upload resume                  | `uploadMiddleware.single('resume')` | `uploadResume`         |
| POST   | `/profile/college-id`         | Upload college ID              | `uploadMiddleware.single('collegeId')` | `uploadCollegeId`   |
| POST   | `/profile/certificates`       | Upload multiple certificates   | `uploadMiddleware.array('certificates', 5)` | `uploadCertificates` |
| POST   | `/profile/projects`           | Add project                    | `validationMiddleware('project')`   | `addProject`           |
| PUT    | `/profile/projects/:id`       | Update project                 | `validationMiddleware('project')`   | `updateProject`        |
| DELETE | `/profile/projects/:id`       | Delete project                 | –                                    | `deleteProject`        |
| POST   | `/profile/submit-verification`| Submit for admin verification  | `isProfileVerified`, `profileCompletionCheck` | `submitForVerification` |

#### `studentDashboard.routes.js`

- **Base Path:** `/api/student`

| Method | Path                    | Purpose                              | Middleware                       | Controller                |
|--------|-------------------------|--------------------------------------|----------------------------------|---------------------------|
| GET    | `/dashboard`            | Student dashboard view               | `protect`, `roleCheck(['student'])`, `isProfileVerified` | `getStudentDashboard` |
| POST   | `/submit-verification`  | Dashboard‑level submit               | `protect`, `roleCheck(['student'])` | `submitForVerification` |
| POST   | `/resubmit-verification`| Resubmit after rejection             | same as above                    | `resubmitForVerification`|

#### `studentProjectRoutes.js`

- **Base Path:** `/api/student/projects`
- **Global Middleware:** `protect`, `roleMiddleware(['student'])`

Key endpoints:

| Method | Path                        | Purpose                               | Middleware chain                                                    |
|--------|-----------------------------|---------------------------------------|---------------------------------------------------------------------|
| GET    | `/browse`                   | Browse open projects (no profile req) | –                                                                   |
| GET    | `/recommended`              | Recommended projects by skills        | –                                                                   |
| GET    | `/:id`                      | Project details                       | `ensureProfileComplete`                                            |
| POST   | `/:id/apply`               | Apply to project                      | `ensureProfileComplete`, `validateApplicationData`, `checkDuplicateApplication`, `checkProjectAvailable` |
| GET    | `/applications/my-applications` | Student’s applications list      | –                                                                   |
| GET    | `/applications/stats`      | Stats (counts per status)             | –                                                                   |
| GET    | `/applications/:id`        | Single application details            | –                                                                   |
| PUT    | `/applications/:id/withdraw` | Withdraw pending application        | –                                                                   |

#### Company routes

Summarized:

- `/api/company/profile` → `companyProfileRoutes.js`  
- `/api/company/dashboard` → `companyDashboard.routes.js`  
- `/api/company/projects/*` → `companyProjectRoutes.js`  
- `/api/company/applications/*` → `companyApplicationRoutes.js`  

These routes implement:
- Profile CRUD and verification submission
- Company dashboard view
- Project creation/edit/delete/stats/applications
- Application list, shortlist, approve, reject, bulk‑reject, and stats

#### Admin routes

- `/api/admin/dashboard`, `/students/pending`, `/companies/pending`, `/student/:id`, `/company/:id`, `/.../approve`, `/.../reject` → `adminVerification.routes.js`
- `/api/admin/projects/*` → `adminProjectRoutes.js`
- `/api/admin/applications/*` → `adminApplicationRoutes.js`

#### Notification routes

- `/api/notifications/*` → `notificationRoutes.js`

#### Selection routes

- `/api/company/applications/shortlist`, `/select`, `/grouped/:projectId` → company selection endpoints
- `/api/student/applications/:id/accept|decline` → student selection responses
- `/api/system/applications/auto-timeout` → admin/system auto‑timeout (protected as admin)

---

### 3.4 ALL Utility Files

Key back‑office utilities (backend):

- `generateOTP.js` – 6‑digit OTP generator.
- `generateToken.js` – signs JWT and sets cookie.
- `generateResetToken.js` – secure random reset token.
- `sendEmail.js` – nodemailer/Brevo integration.
- `students/sendResponse.js` – consistent JSON response helper.
- `students/uploadToCloudinary.js` / `company/uploadToCloudinary.js` – uploads to Cloudinary, returns `public_id` and `secure_url`.
- `students/calculateProfileCompletion.js` – weights for student completion; `StudentProfile` also has its own method.
- `students/validateProjectData.js` – server‑side project validation.
- `students/checkGithubLink.js` – basic GitHub URL checks.
- `students/projectHelpers.js` – `calculateSkillMatch`, recommended projects algorithms.
- `company/calculateCompanyProfileCompletion.js` – ensures required elements (basic info, docs, logo) for 100% completion.
- `company/validateCompanyData.js`, `validateFileHelpers.js`, `validateGSTNumber.js` – input/file validation.
- `notifications/sendNotification.js` – `sendNotification` and `sendAdminNotification` wrappers for `Notification` model.
- `admin/auditLog.js` – logs admin actions.
- `admin/sendVerificationEmail.js` – sends approval/rejection mails to students/companies.
- `cronScheduler.js` – initializes cron jobs (auto‑close and related).
- `background/applicationTimeoutJob.js` – advanced selection timeout logic (used by `applicationSelectionController.autoTimeoutApplications`).

---

### 3.5 DATABASE Models/Schemas

Only core fields are summarized here.

#### `User`

- **Location:** `backend/models/User.js`
- **Key fields:**
  - `email` (unique, required)
  - `password` (hashed, select: false)
  - `role` (`student` | `company` | `admin`)
  - `emailVerified` (bool)
  - `profileCompleted` (bool)
  - `resetPasswordToken`, `resetPasswordExpire`
  - `devices[]`: `{ userAgent, ip, loggedInAt }`
- **Methods:** `matchPassword(enteredPassword)` using bcrypt.
- **Hooks:** pre‑save hashing for changed password.

#### `Student`

- **Location:** `backend/models/Student.js`
- **Fields:** link from `User` to identity:
  - `user: ObjectId(User)`
  - `fullName`, `college`, `skills[]`, `collegeId` (file path).

#### `StudentProfile`

- **Location:** `backend/models/StudentProfile.js`
- **Major sections:**
  - Linking:
    - `student: ObjectId(Student)`
    - `user: ObjectId(User)`
  - `basicInfo`, `skills`, `projects[]` (sub‑schema with title/description/link/technologies)
  - Documents:
    - `documents.resume`, `documents.collegeId`, `documents.certificates[]` – each with `{ filename, public_id, url, path, uploadedAt }`
  - Links:
    - `links.github`, `.linkedin`, `.portfolio`, `.other[]`
  - Verification (new top‑level) + legacy:
    - `verificationStatus` (`draft` | `pending` | `approved` | `rejected`)
    - `verificationRequestedAt`, `verifiedAt`, `verifiedByAdmin`, `rejectionReason`
    - `verification` object for legacy phases (`status`, `isCollegeIdVerified`, etc.)
  - Profile stats:
    - `profileStats.profileCompletion` (0–100), `lastUpdated`, `viewCount`
  - Application counters:
    - `appliedProjectsCount`, `activeProjectsCount`
- **Instance methods:**
  - `calculateProfileCompletion()` – uses weights for basicInfo, skills, projects, resume, collegeId.
  - `isProfileComplete()`
  - `submitForVerification()`, `verifyProfile()`, `rejectProfile()`, `addProject()`, `updateProject()`, `deleteProject()`.
- **Statics:**
  - `findByStudentId(studentId)`, `findByUserId(userId)`, and search helpers.

#### `Company` & `CompanyProfile`

- **`Company` (Phase 1 identity):** contact person, `companyName`, `verificationDocument`.
- **`CompanyProfile` (Phase 2+ full profile):**
  - `user: ObjectId(User)` (unique)
  - Company info: `companyName`, `companyEmail`, `mobile`, `website`, `industryType`, `companySize`, `officeAddress`, `about`
  - Logo: `logoUrl`, `logoPublicId`
  - `documents[]` – each with `url`, `publicId`, `type`
  - `authorizedPerson` (name, designation, email, linkedIn)
  - GST number
  - Profile completion: `profileCompletionPercentage`, `profileComplete`
  - Verification: `verificationStatus`, `verificationRequestedAt`, `verifiedAt`, `verifiedByAdmin`, `rejectionReason`
  - Project stats: `postedProjectsCount`, `activeProjectsCount`

#### `Project`

- **Location:** `backend/models/Project.js`
- **Core fields:**
  - `company`, `companyId` → `CompanyProfile`
  - `title`, `description`, `category`, `requiredSkills[]`
  - `budgetMin`, `budgetMax`
  - `projectDuration` (enum)
  - `deadline` (Date, must be future at creation)
  - `status` (`open`, `selection_pending`, `assigned`, `in-progress`, `completed`, `cancelled`, `closed`)
  - `applicationsCount`
  - `shortlistedStudents[]` – simplified view for quick access
  - Selection fields: `selectedStudentId`, `assignedStudent`, `studentUnderConsideration`, `applicationUnderConsideration`, `selectionDeadline`, `currentSelectionRound`, `selectionHistory[]`
  - `isDeleted` (soft delete), `createdBy`

#### `Application`

- **Location:** `backend/models/Application.js`
- **Core fields:**
  - `project`, `projectId`
  - `student`, `studentId` → `StudentProfile`
  - `company`, `companyId` → `CompanyProfile`
  - `coverLetter`, `proposedPrice`, `estimatedTime`
  - `status` (`pending`, `shortlisted`, `awaiting_acceptance`, `accepted`, `rejected`, `rejected_by_student`, `on_hold`, `withdrawn`, `expired`)
  - Timestamps: `appliedAt`, `reviewedAt`, `respondedAt`, `withdrawnAt`, etc.
  - Company response, rejection reasons.
  - Cached student: `studentName`, `studentEmail`, `studentCollege`, `studentSkills`, `studentPhoto`, `studentResume`
  - `studentSnapshot` – stable at apply time
  - `studentData` – extended snapshot including hidden email/phone (never returned to frontend).
  - Selection: `shortlistPriority`, `selectedAt`, `acceptanceDeadline`, `respondedToSelectionAt`, `studentDecision`, `declineReason`, `statusHistory[]`, `transactionId`, `selectionRound`.
- **Statics:** `hasStudentApplied`, `getActiveApplications`, `getStudentStats`.
- **Indexes:** many compound indexes for performance and uniqueness across project/student/company combinations.

#### `Notification`

- **Location:** `backend/models/Notification.js`
- **Fields:** `userId`, `userRole`, `message`, `type` (`profile-submitted`, `approved`, `rejected`, `application_*`, `project_assigned`, etc.), `isRead`, `relatedProfileType`, `relatedProfileId`, timestamps.

#### `OTP`

- **Location:** `backend/models/OTP.js`
- **Fields:** `email`, `otp`, `createdAt` with TTL index (`expires: 600`) – auto‑deletes after 10 minutes.

---

## 4️⃣ Frontend Documentation

### 4.1 ALL Pages/Components (major)

Below we only summarize key screens relevant to Phases 1–4.5.

#### Public & Auth

- **Home (`Home.jsx`)**
  - **Route:** `/`
  - **Purpose:** Marketing/landing page with hero, “For Students” and “For Companies” cards, call‑to‑actions.
  - **Child components:** `Navbar`, `Footer`.

- **Login (`pages/Auth/Login.jsx`)**
  - **Route:** `/login`
  - **Purpose:** Login for student/company/admin with email/password + OTP re‑verification.
  - **State:** `userType`, `formData`, `otpData`, `isLoading`, `error`.
  - **APIs:** `API.post('/login')`, `API.post('/send-otp')`, `API.post('/verify-otp')` using `apis/api.js` (base URL `/api/auth`).
  - **Role routing:** on 200 login, navigates to:
    - student → `/student/dashboard`
    - company → `/company/dashboard`
    - admin → `/admin/dashboard`

- **Signup (`pages/Auth/Signup.jsx`)**
  - **Route:** `/signup`
  - **Purpose:** Dual‑mode registration: student or company.
  - **State:** `userType`, `studentData`, `companyData`.
  - **APIs:** `POST /api/auth/student/register`, `POST /api/auth/company/register` with `FormData` and file uploads.

- **Forgot/Reset Password**
  - `ForgotPassword.jsx` – `/forgot-password` → `POST /api/auth/forgot-password`.
  - `ResetPassword.jsx` – `/reset-password?token=...` → `POST /api/auth/reset-password`.

#### Student area

- **Student Dashboard (`pages/students/Dashboard.jsx` / `StudentDashboard.jsx`)**
  - **Route:** `/student/dashboard`
  - **Purpose:** Show profile completion, alerts, verification status, and quick links.
  - **API:** `fetchDashboardData()` from `studentProfileApi` and `GET /api/student/dashboard` via `studentDashboard.controller`.

- **Student Profile (`pages/students/StudentProfile.jsx`)**
  - **Route:** `/student/profile`
  - **Purpose:** Manage full student profile (basic, skills, links, projects, documents, verification).
  - **State:** `profile`, `activeTab`, `projectFormState`, `submitMessage`.
  - **APIs:** `fetchProfile`, `updateBasicInfo`, `updateSkills`, `updateTechStack`, `updatePortfolioLinks`, `addProject`, `updateProject`, `deleteProject`, `uploadResume`, `uploadCollegeId`, `uploadCertificates`, `submitForVerification`.

- **Browse Projects (`pages/students/BrowseProjects.jsx`)**
  - **Routes:** `/student/browse-projects`, `/browse-projects`, `/company/browse-projects`
  - **Purpose:** Search/filter/browse open projects.
  - **API:** `browseProjects(page, limit, filters)` from `studentProjectApi`.
  - **Access:** any authenticated student (no profile requirement).

- **Project Details (`pages/students/ProjectDetails.jsx`)**
  - **Route:** `/student/projects/:id`
  - **Purpose:** Detailed view of a single project with apply form.
  - **APIs:** `getProjectDetails`, `applyToProject` from `studentProjectApi`.
  - **Behavior:**
    - If backend returns `requiresCompletion: true` → shows `ProfileIncompleteModal` and blocks content.
    - If project `assignedStudent` is non‑null → displays "Project Assigned" message and hides apply form.

- **My Applications (`pages/students/MyApplications.jsx`)**
  - **Route:** `/student/my-applications`
  - **Purpose:** Track all applications with statuses & ability to withdraw.
  - **APIs:** `getMyApplications`, `getApplicationStats`, `withdrawApplication`.

#### Company area

- **Company Dashboard (`pages/company/CompanyDashboard.jsx`)**
  - **Route:** `/company/dashboard`
  - **Purpose:** Show company profile completion, verification status, project stats.
  - **API:** `fetchCompanyDashboard`.

- **Company Profile (`pages/company/CompanyProfile.jsx`)**
  - **Route:** `/company/profile`
  - **Purpose:** Company profile completion (basic, details, authorized person, logo, documents, verification).
  - **APIs:** `fetchCompanyProfile`, `initializeCompanyProfile`, `updateBasicInfo`, `updateDetails`, `updateAuthorizedPerson`, `uploadLogo`, `uploadDocuments`, `submitCompanyForVerification`.

- **Post Project (`pages/company/PostProject.jsx`)**
  - **Route:** `/company/post-project`
  - **Purpose:** Create a new project.
  - **API:** `createProject` from `companyProjectApi`; backend enforces 100% profile and duplicate project rules.

- **My Projects (`pages/company/MyProjects.jsx`)**  
  *(present in code with listing, not detailed here – browse using `getMyProjects`)*.

- **Company Project Details (`pages/company/ProjectDetails.jsx`)**  
  *(company view over its own project; uses `getProjectDetails` and `getProjectApplications`)*.

- **Company Applications (`pages/company/CompanyApplications.jsx`)**
  - **Route:** `/company/applications`
  - **Purpose:** Central place to see applications across all company projects, shortlist and approve/reject.
  - **APIs:** `getAllApplications`, `getApplicationStats`, `shortlistApplication`, `approveStudentForProject`, `rejectApplication`.

#### Admin area

- **Admin Dashboard (`pages/admin/AdminDashboard.jsx`)**
  - **Route:** `/admin/dashboard` (protected by `AdminRoute` + cookie `user.role === 'admin'` and backend `protect + adminOnly`)
  - **Purpose:** Global overview, stats, and admin notifications.
  - **APIs:** `AdminAPI.get('/dashboard')`, `fetchAdminNotifications`, `markNotificationAsRead`.

- **Admin Verification (`pages/admin/AdminVerification.jsx`) + `PendingStudents`, `PendingCompanies`, `StudentReview`, `CompanyReview`**
  - Multiple pages combine to:
    - List pending students/companies
    - Show full details
    - Approve/reject with reasons.

- **Admin Projects & Applications (`AdminProjects`, `AdminProjectDetails`, `AdminApplications`, `AdminApplicationDetails`)**
  - **Routes:** `/admin/projects`, `/admin/projects/:projectId`, `/admin/applications`, `/admin/applications/:applicationId`
  - **Purpose:** Monitoring and debugging; read‑only analytics and detailed per‑application view (including complete student portfolio).

### 4.2 API Integration

Frontend uses multiple Axios instances with base URLs:

- Auth: `src/apis/api.js` – `baseURL: 'http://localhost:7000/api/auth'`
- Student: `studentProfileApi`, `studentProjectApi` – base URLs `/api/student` and direct full URLs with `http://localhost:7000/...`.
- Company: `companyProfileApi`, `companyProjectApi`, `companyApplicationApi`
- Admin: `adminApi` (for dashboard & pending lists), `adminProjectApi`, `adminApplicationApi`, `adminVerificationApi`
- Notification: `notificationApi`

Each module provides wrapper functions (e.g., `browseProjects`, `createProject`, `getApplicationStats`) and follows the same shape:

```js
// Example from studentProjectApi
const response = await axiosInstance.get(`${BASE_URL}/browse?...`);
return { success: response.data.success, message: response.data.message, data: response.data.data };
```

Error handling is normalized via `formatApiError` where implemented.

### 4.3 State Management & Auth

- There is **no Redux**; local React state + `localStorage` + cookies are used:
  - JWT stored in httpOnly cookie (backend) for server auth.
  - Some user info also stored in cookie `user` (used by frontend `AdminRoute`).
  - `authUtils.saveUserToCookie` persists minimal user data.
- Axios interceptors attach `Authorization: Bearer <token>` from `localStorage.jwtToken` for most non‑auth routes.

### 4.4 Routing

- Top‑level routing is in `App.jsx` using `BrowserRouter`, `Routes`, `Route`.
- Route breakdown (selected):

| Path                                | Component                      | Protected?       | Role              |
|-------------------------------------|--------------------------------|------------------|-------------------|
| `/`                                 | `Home`                         | No               | Public            |
| `/login`                            | `Login`                        | No               | Public            |
| `/signup`                           | `Signup`                       | No               | Public            |
| `/forgot-password`                  | `ForgotPassword`               | No               | Public            |
| `/reset-password`                   | `ResetPassword`                | No               | Public            |
| `/student/dashboard`                | `Dashboard`                    | Yes (cookie/jwt) | Student           |
| `/student/profile`                  | `StudentProfile`               | Yes              | Student           |
| `/student/browse-projects`          | `BrowseProjects`               | Yes              | Student           |
| `/student/projects/:id`             | `StudentProjectDetails`        | Yes              | Student           |
| `/student/my-applications`          | `MyApplications`               | Yes              | Student           |
| `/company/dashboard`                | `CompanyDashboard`             | Yes              | Company           |
| `/company/profile`                  | `CompanyProfile`               | Yes              | Company           |
| `/company/post-project`             | `PostProject`                  | Yes              | Company           |
| `/company/projects`                 | `MyProjects`                   | Yes              | Company           |
| `/company/applications`             | `CompanyApplications`          | Yes              | Company           |
| `/admin/dashboard`                  | `AdminDashboard`               | Yes (`AdminRoute`)| Admin           |
| `/admin/projects`                   | `AdminProjects`                | Yes              | Admin             |
| `/admin/applications`               | `AdminApplications`            | Yes              | Admin             |
| `/admin/students/pending`          | `PendingStudents`             | Yes              | Admin             |
| `/admin/companies/pending`         | `PendingCompanies`            | Yes              | Admin             |
| `*`                                 | `NotFound`                     | No               | Public            |

Route guards:
- Admin routes are wrapped in `AdminRoute` which reads the `user` cookie (`role === 'admin'`) and falls back to backend checks.
- Backend still enforces `protect` + `adminOnly` / `isAdmin` on all admin endpoints.

---

## 5️⃣ Algorithms Implemented

### Authentication Algorithms (Phase 1)

- **Password Hashing:**
  - Bcrypt via `UserSchema.pre('save')`.
  - `saltRounds = 10`, hashing on create and when password changed.

- **JWT Generation & Verification:**
  - `generateToken(res, userId, role)` signs JWT with `JWT_SECRET`, sets httpOnly cookie with expiry configured via env.
  - `authMiddleware.protect` verifies token, attaches `req.user`.

- **OTP Generation & Validation:**
  - `generateOTP()` returns random 6‑digit string.
  - `OTP` model with TTL index expires docs in 10 minutes.
  - `sendOtp`, `verifyOtp`, `loginUser` logic ensures re‑OTP + email Verified gating.

- **Session Management:**
  - `User.devices[]` tracks userAgent/IP/time for last N logins (trimmed to max 10).

### Profile Management Algorithms (Phase 2)

- **Student Profile Completion:**
  - Implemented twice:
    - `backend/utils/students/calculateProfileCompletion.js` (legacy utility).
    - `StudentProfileSchema.methods.calculateProfileCompletion` (current single source of truth).
  - Weighted scheme:
    - Basic Info (required subset) – 20–25%
    - Skills – ~15–20%
    - Tech Stack – ~15%
    - Projects (min 3) – ~20–30%
    - Resume – ~10%
    - College ID – ~10–20%
    - Certificates – small extra weight

- **Company Profile Completion:**
  - `calculateCompanyProfileCompletion(profile)`:
    - Assigns weights to: basic company info, authorized person, logo, documents, GST, etc.
    - Returns `{ percentage, profileComplete, missingFields[] }` used to block project creation until 100%.

- **Document verification logic:**
  - Admin decides manually by reviewing uploaded documents:
    - Student: resume, college ID, certificates.
    - Company: registration docs, logo, authorized person info.
  - Backed by `verificationStatus` fields on both StudentProfile and CompanyProfile, updated by admin.

### Project Management Algorithms (Phase 4)

- **Skill-based filtering & match:**
  - `calculateSkillMatch(requiredSkills, studentSkills)`:
    - Normalizes skill names to lowercase.
    - `matchPercentage = round(matchedRequired / required.length * 100)`; 0 if no required or no student skills.
  - Used to compute `skillMatch` for projects in student browse and recommended lists, and for applications in company/admin views.

- **Project recommendation:**
  - `getRecommendedProjects` for students:
    - Loads open projects.
    - Computes `skillMatch` for each.
    - Sorts descending and returns top N.

- **Application ranking (company side):**
  - Company application listing uses `skillMatch` to sort pending applications (pending first, then by descending skill match).

- **Auto-close expired projects:**
  - `jobs/autoCloseProjects.js` (Phase 2.1):
    - Cron job via `cronScheduler.initializeCronJobs()`:
      - Finds projects with `status: 'open'`, `deadline < now`, and no assigned student.
      - Sets `status = 'closed'`, `closedAt = now`, `closedReason`.
      - Marks all pending/shortlisted applications as `rejected` with appropriate reason.
      - Creates notifications:
        - To company – project auto‑closed.
        - To all students who applied – rejected due to expiration.

### Admin Verification Algorithms (Phase 3)

- **Document verification workflow:**
  - Admin manually reviews each student/company via `StudentReview` and `CompanyReview` pages:
    - Show checklists, project lists, docs, and details.
    - Approve: sets `verificationStatus = 'approved'`, `verifiedAt`, `verifiedByAdmin` and sends email.
    - Reject: sets `verificationStatus = 'rejected'`, `rejectionReason`, and sends email with reason.

- **Batch & dashboard analytics:**
  - `getAdminDashboard` aggregates counts and recent pending items via a combination of `countDocuments` and `find` queries.
  - Admin can see counts of pending verifications, plus a combined "recent pending" list.

---

## 6️⃣ Installation & Setup

### 6.1 Environment Variables

> Use `.env` (backend) and `.env` / `.env.local` (frontend). Values below are **examples** only.

#### Backend (`seribro-backend/.env`)

```env
MONGO_URI=mongodb://localhost:27017/seribro
PORT=7000
NODE_ENV=development

JWT_SECRET=your_jwt_secret_here
JWT_COOKIE_EXPIRE=7d

SMTP_HOST=smtp-relay.brevo.com
SMTP_PORT=587
SMTP_USER=your_smtp_user
SMTP_PASS=your_smtp_password
FROM_EMAIL=no-reply@seribro.com

FRONTEND_URL=http://localhost:5173
CLIENT_URL=http://localhost:5173

CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

**Required:** All of the above, otherwise auth/email/uploads will fail.  
**Optional:** `NODE_ENV` control for cron frequency/logging.

#### Frontend (`seribro-frontend/client/.env` or `.env.local`)

The code mostly hard‑codes `http://localhost:7000` in API modules; if you refactor, you can centralize:

```env
VITE_API_BASE_URL=http://localhost:7000
```

You would then adjust all API modules to read `import.meta.env.VITE_API_BASE_URL`.

---

## 7️⃣ Running the Application

### 7.1 Development Mode

```bash
# Backend
cd phase2.1/seribro-backend
npm install
npm start

# Frontend
cd phase2.1/seribro-frontend/client
npm install
npm run dev
```

Backend runs on `http://localhost:7000`, frontend on `http://localhost:5173`.

### 7.3 Port Configuration

- **Backend:** `7000` (configurable via `PORT` env)
- **Frontend:** `5173` (Vite default)
- **Database:** `27017` (local Mongo) or Atlas URI
- **Other services:** Cloudinary and SMTP are external SaaS endpoints; no local ports.

---

## 8️⃣ Complete Testing Guide

The repository already includes detailed phase testing docs (`PHASE_4.2_STATUS_COMPLETE.md`, `PHASE_4.4_*`, `QUICK_START_TESTING_GUIDE.md`). This section aligns with your requested flows and confirms they are supported by code.

### 8.1 Testing Credentials (as documented in MASTERREADME.md)

> These credentials were listed in docs; ensure they exist in your dev DB or create equivalent users:

- **Student Account:**  
  `Email: afmahetar2006@gmail.com` / `Password: Arman2006@#`
- **Company Account:**  
  `Email: midnightsphere19@gmail.com` / `Password: abkmidnight2006`
- **Admin Account:**  
  `Email: admin@seribro.com` / `Password: Admin@123`

### 8.2 Student Workflow Testing (Phase 1–4.5)

All steps you described (registration, OTP, profile completion, browse/filter projects, apply, track status) are **implemented and covered** by:
- `authController`, `StudentProfileController`, `studentDashboard.controller`, `studentProjectController`, `notificationController`, and corresponding frontend pages (`Signup`, `Login`, `StudentProfile`, `BrowseProjects`, `StudentProjectDetails`, `MyApplications`).

Use your exhaustive step‑by‑step list as acceptance tests; they map directly to controller APIs and UI components documented above.

### 8.3 Company Workflow Testing (Phase 1–4.5)

- Registration & login → `authController` + `Login`/`Signup`.
- Company profile completion → `CompanyProfile.jsx` + `companyProfileController`.
- Post project → `PostProject.jsx` + `companyProjectController.createProject`.
- Review applications & hire → `CompanyApplications.jsx` + `companyApplicationController` & `ApplicationSelection` controllers.

### 8.4 Admin Workflow Testing (Phase 3–4.5)

- Admin login & dashboard → `AdminDashboard.jsx` + `adminVerificationController.getAdminDashboard`.
- Pending verifications → `PendingStudents`, `PendingCompanies`, `StudentReview`, `CompanyReview`.
- Approvals/rejections → `approveStudent`, `rejectStudent`, `approveCompany`, `rejectCompany` controllers + `sendVerificationEmail`.
- Project & application monitoring → `AdminProjects`, `AdminApplications`, `AdminApplicationDetails`.

### 8.5 Integration & End‑to‑End Testing

The `QUICK_START_TESTING_GUIDE.md` and `PHASE_4.2_STATUS_COMPLETE.md` already define end‑to‑end flows (student–company–admin loops) and confirm:
- Auto‑close job works.
- Notifications are delivered.
- Duplicate checks and permissions behave as expected.

You can reuse those documents as your integration test plan, since they are written to match the current code.

### 8.6 Security Testing

Security behaviors in code:
- Auth guards on all protected routes.
- Role‑based access enforced on all `/api/company/*` and `/api/admin/*` routes.
- Student email and phone hidden from company application views; company sees only sanitized snapshots.
- Mongoose validation across models, plus extra validation middleware for most write endpoints.

### 8.7 Current Issues & Known Bugs

**ARCHITECTURAL DECISION - Application Selection System:**

The **only active selection flow** in the current MVP is:
- `companyApplicationController.approveStudentForProject`
- Route: `POST /api/company/applications/:applicationId/approve`
- Simple workflow: Approve one student → auto-reject others → assign project

**Phase 6 - Advanced Multi-Stage Selection System (DORMANT):**

The advanced multi-stage selection system is **reserved for Phase 6** and currently **fully disabled**:
- Files marked with `⚠️ PHASE 6 - DORMANT / FUTURE WORK ⚠️` headers
- Routes NOT mounted in `server.js`
- Background timeout job NOT started
- All related files: `applicationSelectionController.js`, `applicationSelectionRoutes.js`, `applicationSelectionValidation.js`, `applicationTimeoutJob.js`

**Why this separation:**
- Ensures clean MVP with single, tested selection flow
- Prevents conflicts with Project Workspace logic integration
- Clear path for Phase 6 implementation when multi-stage selection is needed
- `approveStudentForProject` includes defensive code to clear advanced selection fields if they exist

**Integration Note:** 
- Any new **Project Workspace logic** should integrate with the `approveStudentForProject` flow only
- The `approveStudentForProject` function includes defensive code to clear advanced selection fields (`studentUnderConsideration`, `applicationUnderConsideration`, `selectionDeadline`, `currentSelectionRound`) ensuring no conflicts
- The advanced selection system should not be considered until Phase 6
- Current flow uses only: `assignedStudent` field and `status: 'assigned'` on Project model

### 8.9 Test Results Summary

You can maintain your own table like:

| Test Case                            | Status | Notes                           |
|--------------------------------------|--------|---------------------------------|
| Student Registration & OTP           | ✅     | Auth + OTP working              |
| Student Profile Completion           | ✅     | Completion % & checks okay      |
| Browse & Filter Projects             | ✅     | SkillMatch & filters functional |
| Apply to Projects                    | ✅     | Duplicate prevention enforced   |
| Company Post Project                 | ✅     | Profile 100% required           |
| Company Review & Approve Student     | ✅     | Approval ⇒ auto reject others   |
| Admin Verification of Profiles       | ✅     | Notifications + lists fixed     |
| Auto‑close Expired Projects          | ✅     | Cron jobs wired & documented    |

---

## 9️⃣ API Documentation

> Full exhaustive endpoint‑by‑endpoint docs already appear in `README-auth.md`, `2.1studentprofileReadME.md`, and `APPLICATION_SELECTION_API_DOCS.md`.  
> Below is a representative sample in your requested format.

### Example: POST `/api/auth/student/register`

```text
Description: Register a new student account
Authentication: No
Role: Public
```

**Request Body (multipart/form-data):**

```json
{
  "fullName": "Arman Mahetar",
  "email": "student@example.com",
  "college": "XYZ College",
  "skills": "React, Node.js, MongoDB",
  "password": "Password123!"
}
```

File field:
- `collegeId`: image/PDF (required)

**Success Response (201):**

```json
{
  "message": "Registration successful. OTP sent to your email for verification",
  "userId": "60d5ec49f1b2c72b8c8e4a1b",
  "email": "student@example.com"
}
```

**Error Responses:**
- `400` – missing fields or missing `collegeId`.
- `409` – user already exists.
- `500` – transaction errors.

### Example: POST `/api/student/projects/:id/apply`

```text
Description: Apply to a project (student)
Authentication: Yes (JWT cookie)
Role: student
Profile requirement: 100% completion + admin verified
```

**Request Body (JSON):**

```json
{
  "coverLetter": "I am very interested in this project because ...",
  "proposedPrice": 8000,
  "estimatedTime": "2 weeks"
}
```

**Success Response (201):**

```json
{
  "success": true,
  "message": "Application successfully submit ho gaya!",
  "data": {
    "application": {
      "_id": "6650...",
      "projectId": "664f...",
      "studentId": "664e...",
      "companyId": "664d...",
      "coverLetter": "I am very interested in this project because ...",
      "proposedPrice": 8000,
      "estimatedTime": "2 weeks",
      "status": "pending",
      "studentSnapshot": {
        "name": "Student Name",
        "collegeName": "XYZ College",
        "city": "Bhavnagar",
        "skills": ["React", "Node.js"],
        "resumeUrl": "https://res.cloudinary.com/...",
        "collegeIdUrl": "https://res.cloudinary.com/...",
        "appliedAt": "2025-01-01T10:00:00.000Z"
      }
    }
  }
}
```

**Error Responses:**
- `400`: validation error (short cover letter, invalid price/time).
- `400`: "You have already applied for this project."
- `400`: "Yeh project ab applications nahi le raha." (project closed/assigned).
- `404`: project not found.

> For a complete REST reference, consult the existing markdowns inside `seribro-backend` and `testing_manual/`; they already describe all auth, profile, project, application, admin, and notification endpoints in depth and align with the current code.

---

## 🔟 Common Issues and Solutions

**Issue 1: Cannot connect to database**
- Check `MONGO_URI` in backend `.env`.
- Ensure MongoDB service/Atlas cluster is running and accessible.
- Check credentials and IP whitelisting (for Atlas).

**Issue 2: File upload not working**
- Verify Cloudinary keys (`CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET`).
- Check multer config in `uploadMiddleware.js` (field names, limits).
- Ensure file type is allowed (PDF/images) and within size constraints.

**Issue 3: OTP not received**
- Check SMTP config in `.env` (`SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`).
- Look at backend logs for `sendEmail` errors.
- Check spam folder & email correctness.

**Issue 4: JWT token errors**
- Confirm `JWT_SECRET` is set consistently.
- Verify token expiry env (`JWT_COOKIE_EXPIRE`) and cookie presence in browser.
- Make sure browser sends cookie with requests (`withCredentials: true`).

**Issue 5: Profile verification not working / admin sees no pending**
- Ensure you’re on updated code with `VERIFICATION_NOTIFICATION_FIX.md` applied.
- Confirm `StudentProfile.verificationStatus` / `CompanyProfile.verificationStatus` are set to `'pending'`.
- Check `Notification` collection for admin notifications.

**Issue 6: Projects not displaying**
- Confirm at least one project exists with `status: 'open'` and `isDeleted: false`.
- Check `GET /api/student/projects/browse` response.
- Validate filters (too narrow filters may hide all results).

**Issue 7: Application submission failing**
- Validate request body matches expected schema (coverLetter, proposedPrice, estimatedTime).
- Ensure student profile is 100% complete and verified.
- Check if project is already assigned or closed.

**Issue 8: Notifications not appearing**
- Confirm `Notification` documents are being created at relevant events (submit verification, apply, shortlist, approve/reject, auto‑close).
- Test `GET /api/notifications` for the current user.
- Check `NotificationBell` component for errors in console.

---

## 1️⃣2️⃣ Contributing Guidelines

- **Code style:**
  - Follow existing patterns (Hinglish comments, consistent naming, promise/async usage).
  - Use `sendResponse` helpers where present to keep JSON shape consistent.

- **Branching:**
  - Feature branches per phase/feature (`feature/phase-5-payments`, etc.).

- **Commits:**
  - Use descriptive messages: `fix: admin notification ownership`, `feat: add project selection rounds`, etc.

- **Pull Requests:**
  - Include: purpose, affected files, testing steps.
  - Keep backend and frontend changes in separate commits when possible.

---

## 1️⃣3️⃣ Implementation Status & Roadmap

### ✅ Completed Features (Phase 1–4.5)

- ✅ User Authentication (Registration, Login, OTP, Password Reset)
- ✅ Student Profile Management (complete profile, upload documents, projects)
- ✅ Company Profile Management (company details, documents, verification)
- ✅ Admin Verification System (approve/reject students and companies, email notifications)
- ✅ Project Posting (companies can post projects with duplicate checks)
- ✅ Project Browsing (students can browse/filter with skill matching)
- ✅ Application System (apply, list, stats, withdraw)
- ✅ Project Assignment (approve student, auto‑reject others, assigned state)
- ✅ Notification System (profile submissions, approvals, applications, auto‑close)
- ✅ File Upload System (Cloudinary integration for documents/images)
- ✅ Auto‑close & selection timeouts (cron jobs)

### 🚧 Partial / Advanced Features

- 🚧 Multi‑stage selection system (shortlist, awaiting_acceptance, on_hold, auto‑timeout) – implemented in `applicationSelectionController` + `applicationSelectionRoutes`, not fully surfaced in UI.

### ❌ Not Implemented in This Branch

- ❌ Real‑time messaging/chat between students & companies.
- ❌ Razorpay/Stripe‑based payments (no code present).
- ❌ Socket.io real‑time updates (no integration present).

---

> **Maintenance Note:**  
> This `ULTRA_MASTER_README.md` consolidates all backend/fronted docs and status files (`READMEs`, phase summaries, test guides) into a single, accurate source of truth for the current codebase.  
> **Please update this file whenever you:**
> - Add or remove controllers/routes/models.
> - Introduce new phases (e.g., payments, disputes).
> - Change environment variables or deployment topology.


