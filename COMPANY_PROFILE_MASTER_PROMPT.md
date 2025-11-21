# COMPANY PROFILE IMPLEMENTATION - PHASE 2.1 MASTER PROMPT

## 📋 PROJECT OVERVIEW

This document provides a complete specification for implementing Company Profile functionality similar to StudentProfile (Phase 2.1), including backend controllers, middleware, utilities, models, and frontend components with proper folder structure separation.

---

## 🏗️ ARCHITECTURE OVERVIEW

### Backend Structure
```
seribro-backend/backend/
├── models/
│   ├── Company.js                    (NEW - Company Profile Model)
│   ├── CompanyApplication.js         (NEW - Job Applications from Students)
│   └── CompanyJob.js                 (NEW - Job Postings)
├── controllers/
│   └── company/                      (NEW FOLDER)
│       ├── CompanyProfileController.js
│       └── CompanyJobController.js
├── middleware/
│   └── company/                      (NEW FOLDER)
│       ├── roleMiddleware.js
│       ├── validationMiddleware.js
│       ├── uploadMiddleware.js
│       ├── isVerified.js
│       └── verificationCheck.js
├── routes/
│   └── companyRoutes.js              (NEW - Company API Routes)
└── utils/
    └── company/                      (NEW FOLDER)
        ├── sendResponse.js
        ├── uploadToCloudinary.js
        ├── validateCompanyData.js
        ├── checkLinkedInProfile.js
        └── calculateProfileCompletion.js
```

### Frontend Structure
```
seribro-frontend/client/src/
├── apis/
│   └── companyProfileApi.js          (NEW)
├── components/
│   └── companyComponent/             (NEW FOLDER)
│       ├── CompanyBasicInfoForm.jsx
│       ├── CompanyDetailsForm.jsx
│       ├── CompanyLinksForm.jsx
│       ├── CompanyDocumentsUpload.jsx
│       ├── CompanyJobPostings.jsx
│       ├── JobApplicationsView.jsx
│       └── CompanyProfileCompletion.jsx
└── pages/
    └── company/                      (NEW FOLDER)
        ├── CompanyDashboard.jsx
        ├── CompanyProfile.jsx
        └── ManageJobs.jsx
```

---

## 📁 FILES AFFECTED FOR REFERENCE

### Reference Files for Company Code Generation:

1. **StudentProfile Model** → Reference for Company Model
   - File: `seribro-backend/backend/models/StudentProfile.js`
   - Reference Points:
     - Schema structure with nested objects
     - Validation patterns
     - Instance methods (calculateCompletion, submitForVerification)
     - Static methods (findByStudentId, searchBySkills)
     - Pre-save middleware

2. **StudentProfileController** → Reference for CompanyProfileController
   - File: `seribro-backend/backend/controllers/StudentProfileController.js`
   - Reference Points:
     - Helper functions (findProfile, getStudentId)
     - CRUD operations pattern
     - Error handling with sendResponse
     - File upload handling with Cloudinary
     - Verification submission logic

3. **Student Middleware** → Reference for Company Middleware
   - File: `seribro-backend/backend/middleware/student/`
   - Files: roleMiddleware.js, validationMiddleware.js, uploadMiddleware.js
   - Reference Points:
     - Role checking pattern
     - Data validation logic
     - File upload configuration

4. **BasicInfoForm.jsx** → Reference for CompanyBasicInfoForm.jsx
   - File: `seribro-frontend/client/src/components/studentComponent/BasicInfoForm.jsx`
   - Reference Points:
     - Form validation pattern
     - Error handling and display
     - Icon usage with lucide-react
     - Tailwind styling approach

5. **SkillsForm.jsx** → Reference for CompanyDetailsForm.jsx
   - File: `seribro-frontend/client/src/components/studentComponent/SkillsForm.jsx`
   - Reference Points:
     - Tab-based UI pattern
     - Add/Remove functionality
     - Tag display system

6. **PortfolioLinksForm.jsx** → Reference for CompanyLinksForm.jsx
   - File: `seribro-frontend/client/src/components/studentComponent/PortfolioLinksForm.jsx`
   - Reference Points:
     - URL validation pattern
     - Multiple link management
     - External link opening

7. **StudentProfile.jsx** → Reference for CompanyProfile.jsx
   - File: `seribro-frontend/client/src/pages/students/StudentProfile.jsx`
   - Reference Points:
     - Tab navigation system
     - Component integration pattern
     - API data fetching and state management

8. **studentProfileApi.js** → Reference for companyProfileApi.js
   - File: `seribro-frontend/client/src/apis/studentProfileApi.js`
   - Reference Points:
     - API endpoint patterns
     - Error handling
     - Token management with interceptors

9. **User Model** → Reference for linking to Company
   - File: `seribro-backend/backend/models/User.js`
   - Reference Points:
     - User role enum (student, company, admin)
     - Authentication fields

10. **authRoutes.js** → Reference for route structure
    - File: `seribro-backend/backend/routes/authRoutes.js`
    - Reference Points:
      - Route middleware application pattern

---

## 🎯 COMPANY PROFILE MODEL SPECIFICATION

### Company Model: `backend/models/Company.js`

```
// Company Profile Schema (Reference: StudentProfile.js)

CompanySchema Structure:
├── user (ObjectId, ref: User, required, unique)
├── company (ObjectId, ref: CompanyUser, required, unique)
├── basicInfo
│   ├── companyName (String, required)
│   ├── email (String, valid email)
│   ├── phone (String, 10-20 chars)
│   ├── industry (String, enum)
│   ├── companySize (String, enum)
│   ├── foundedYear (Number, 1950-2025)
│   ├── headquarters (String)
│   ├── website (String, URL validation)
│   ├── description (String, max 1000)
│   └── tagline (String, max 200)
├── details
│   ├── mission (String, max 500)
│   ├── vision (String, max 500)
│   ├── culture (Array of Strings, max 10)
│   ├── specialties (Array of Strings, max 15)
│   ├── techStack (Array of Strings, max 20)
│   ├── hrContactName (String)
│   ├── hrContactPhone (String)
│   └── hrContactEmail (String)
├── links
│   ├── website (String)
│   ├── linkedin (String)
│   ├── twitter (String)
│   ├── github (String)
│   └── other (Array of {name, url})
├── documents
│   ├── companyLogo (filename, path, uploadedAt)
│   ├── companyCertificate (filename, path, uploadedAt)
│   └── otherDocuments (Array of documents)
├── verification
│   ├── status (enum: incomplete, pending, verified, rejected)
│   ├── isEmailVerified (Boolean)
│   ├── verifiedAt (Date)
│   ├── verifiedBy (ObjectId, ref: User)
│   ├── rejectionReason (String)
│   └── submittedForVerificationAt (Date)
├── profileStats
│   ├── profileCompletion (Number, 0-100)
│   ├── lastUpdated (Date)
│   ├── viewCount (Number)
│   └── applicantCount (Number)
├── activeJobs (Array of ObjectIds, ref: CompanyJob)
├── applications (Array of ObjectIds, ref: CompanyApplication)
└── status
    ├── isActive (Boolean)
    ├── isBlocked (Boolean)
    └── blockedReason (String)
```

---

## 🎨 COMPANY BASIC INFO FORM FIELDS

### CompanyBasicInfoForm.jsx Input Fields:

```jsx
Form Tabs: 
1. Basic Information (Required Fields)
   - Company Name (String, required)
   - Email (String, email validation)
   - Phone Number (String, 10 digits)
   - Industry (Select dropdown)
   - Company Size (Select dropdown)
   - Founded Year (Number input, 1950-2025)
   - Headquarters/Location (String)
   - Website (URL, optional)
   - Company Tagline (String, max 200, optional)

2. About Company (Rich Information)
   - Company Description (Textarea, max 1000)
   - Mission Statement (Textarea, max 500, optional)
   - Vision Statement (Textarea, max 500, optional)
   - Company Culture Tags (Add/Remove tags, max 10)
   - Specialties/Services (Add/Remove tags, max 15)

3. HR Contact Details
   - HR Contact Name (String)
   - HR Contact Phone (String)
   - HR Contact Email (String, email validation)
   - HR Contact Position (String, optional)
```

---

## 🔗 COMPANY LINKS FORM FIELDS

### CompanyLinksForm.jsx Structure:

```jsx
Main Links Section:
1. Website (URL)
2. LinkedIn Company Page (URL)
3. Twitter/X Profile (URL)
4. GitHub Organization (URL)

Additional Links Section:
- Add custom links (Name, URL pairs)
- Manage multiple links
- Preview/Open links
- Delete links
```

---

## 🏢 COMPANY DETAILS FORM FIELDS

### CompanyDetailsForm.jsx Structure:

```jsx
Tab 1: Culture & Team
- Company Culture (Tags: Innovation, Teamwork, Growth-Focused, etc.)
- Specialties (Tags: Web Development, Mobile Apps, AI/ML, DevOps, etc.)
- Work Environment (Options: Remote, Hybrid, On-site)
- Employee Perks (Tags: Health Insurance, Remote Work, Stock Options, etc.)

Tab 2: Technology Stack
- Technologies Used (Add/Remove tags, max 20)
- Development Tools (Select from predefined list)
- Cloud Platforms (AWS, Azure, GCP, etc.)

Tab 3: Jobs & Hiring
- Open Positions Count (Display)
- Hiring Urgency (Select: High, Medium, Low)
- Target Skills (Add skills they're looking for)
- Average Salary Range (Optional select)
```

---

## 📋 COMPANY DOCUMENTS UPLOAD

### CompanyDocumentsUpload.jsx:

```jsx
Documents to Upload:
1. Company Logo (Image, required)
   - Formats: JPG, PNG
   - Max size: 5MB
   - Preview display

2. Company Certificate/Registration (PDF)
   - File: government registration certificate
   - Required for verification

3. Other Documents (Optional)
   - Any supporting documents
   - Max 3 files
   - Multiple formats allowed
```

---

## 💼 COMPANY JOBS MANAGEMENT

### CompanyJobPostings.jsx & ManageJobs.jsx:

```jsx
Job Posting Fields:
- Job Title (String, required)
- Job Description (Textarea, rich text)
- Required Skills (Array of skills)
- Experience Required (Number of years)
- Salary Range (Min-Max)
- Location (String or Remote)
- Job Type (Full-time, Part-time, Contract, Intern)
- Application Deadline (Date)
- Status (Open, Closed, Filled)

Job Management Actions:
- Create New Job
- Edit Existing Job
- Close Job Posting
- View Applications for Job
- Accept/Reject Candidates
```

---

## 📊 COMPANY PROFILE COMPLETION CALCULATION

### Formula:

```
Total Points: 100

Basic Info: 20 points
- Company Name, Email, Phone, Industry, Company Size, Founded Year

Details: 20 points
- Description, Mission, HR Contact Details

Links: 15 points
- At least 3 main links (Website, LinkedIn, Twitter/GitHub)

Documents: 20 points
- Logo uploaded
- Certificate uploaded

Jobs: 15 points
- At least 2 active job postings
- Proper job descriptions

Verification: 10 points
- Email verified
- Certificate verified
```

---

## 🔐 COMPANY VERIFICATION PROCESS

```
Step 1: Email Verification
- Send verification code to company email
- Code validation required

Step 2: Document Verification
- Admin reviews company certificate
- Verify company registration
- Check if company is legitimate

Step 3: Profile Review
- Check profile completeness (80%+)
- Check for proper information
- Review job postings

Step 4: Final Approval
- Admin marks as verified
- Company can post jobs and view student applications
- Verified badge displayed
```

---

## 🛠️ BACKEND IMPLEMENTATION REQUIREMENTS

### CompanyProfileController.js Methods:

```javascript
Exports (Similar to StudentProfileController.js):

1. getProfile()
   - GET /api/company/profile
   - Create if doesn't exist

2. updateBasicInfo()
   - PUT /api/company/profile/basic
   - Update company name, email, phone, etc.

3. updateDetails()
   - PUT /api/company/profile/details
   - Update mission, vision, culture, specialties

4. updatePortfolioLinks()
   - PUT /api/company/profile/links
   - Update website, LinkedIn, Twitter, etc.

5. uploadCompanyLogo()
   - POST /api/company/profile/logo
   - Upload company logo to Cloudinary

6. uploadCompanyDoc()
   - POST /api/company/profile/documents
   - Upload company certificate/documents

7. createJobPosting()
   - POST /api/company/jobs
   - Create new job posting

8. getJobPostings()
   - GET /api/company/jobs
   - Get all company's job postings

9. updateJobPosting()
   - PUT /api/company/jobs/:id
   - Update job posting

10. deleteJobPosting()
    - DELETE /api/company/jobs/:id
    - Close/Delete job posting

11. getDashboard()
    - GET /api/company/dashboard
    - Get company dashboard data

12. submitForVerification()
    - POST /api/company/submit-verification
    - Submit profile for admin review

13. getApplications()
    - GET /api/company/applications
    - Get all applications to company's jobs

14. respondToApplication()
    - PUT /api/company/applications/:id
    - Accept/Reject student application
```

### CompanyJobController.js Methods:

```javascript
Exports:

1. getApplicationsForJob()
   - GET /api/company/jobs/:jobId/applications

2. searchStudentProfiles()
   - GET /api/company/search/students
   - Search by skills, location, experience

3. getStudentProfile()
   - GET /api/company/students/:studentId
   - View verified student profile
```

---

## 🎯 FRONTEND API ENDPOINTS

### companyProfileApi.js:

```javascript
Endpoints:

PROFILE & DASHBOARD:
- fetchCompanyProfile()           GET /api/company/profile
- fetchCompanyDashboard()         GET /api/company/dashboard

BASIC INFO:
- updateCompanyBasicInfo()        PUT /api/company/profile/basic

DETAILS:
- updateCompanyDetails()          PUT /api/company/profile/details

LINKS:
- updateCompanyLinks()            PUT /api/company/profile/links

UPLOADS:
- uploadCompanyLogo()             POST /api/company/profile/logo
- uploadCompanyDoc()              POST /api/company/profile/documents

JOBS:
- createJobPosting()              POST /api/company/jobs
- getJobPostings()                GET /api/company/jobs
- updateJobPosting()              PUT /api/company/jobs/:id
- deleteJobPosting()              DELETE /api/company/jobs/:id

APPLICATIONS:
- getApplications()               GET /api/company/applications
- respondToApplication()          PUT /api/company/applications/:id

VERIFICATION:
- submitForVerification()         POST /api/company/submit-verification
```

---

## 🎨 FRONTEND COMPONENTS STRUCTURE

### Component Hierarchy:

```
CompanyProfile.jsx (Main Page)
├── ProfileCompletionBar.jsx
├── CompanyBasicInfoForm.jsx
├── CompanyDetailsForm.jsx
├── CompanyLinksForm.jsx
├── CompanyDocumentsUpload.jsx
├── CompanyJobPostings.jsx
├── JobApplicationsView.jsx
└── VerificationStatus.jsx

CompanyDashboard.jsx
├── ProfileCompletion (Widget)
├── ActiveJobs (Widget)
├── Recent Applications (Widget)
├── Quick Stats (Widget)
└── Action Buttons

ManageJobs.jsx
├── JobList.jsx
├── JobModal.jsx (Add/Edit)
├── JobStats.jsx
└── Application Manager.jsx
```

---

## 💻 CODING STANDARDS

### Backend (Node.js/CommonJS):

```javascript
// Hinglish Comments (No Print Side)
// कमेंट्स ही होंगे Hinglish में, console.log में नहीं

// File: models/Company.js
// Hinglish: Company ka profile model, refer StudentProfile.js se

// File: controllers/company/CompanyProfileController.js
// Hinglish: Company profile ko manage karne ke liye controller

// File: middleware/company/validationMiddleware.js
// Hinglish: Company ke data ko validate karne ke middleware

// Use require() - CommonJS
const mongoose = require('mongoose');
const express = require('express');

// Error handling with try-catch
try {
    // Code
} catch (error) {
    console.error('❌ Error message:', error);
    return sendResponse(res, 500, false, 'Error message');
}
```

### Frontend (React/JSX - No TypeScript/Hooks):

```javascript
// Hinglish Comments Only
// कमेंट्स में Hinglish use करें

// File: components/companyComponent/CompanyBasicInfoForm.jsx
// Hinglish: Company ki basic details update karne ka form

// Use Class Component Pattern (if needed) or regular JSX
// NO React Hooks (useState, useEffect, etc.)
// Use state management if class component

// Standard JSX structure
const CompanyBasicInfoForm = ({ initialData, onUpdate }) => {
    // Component logic
};

// Use lucide-react icons
import { User, Mail, Phone } from 'lucide-react';
```

---

## 📦 INTEGRATION CHECKLIST

### Files to Create:

**Backend:**
- [ ] `models/Company.js`
- [ ] `models/CompanyJob.js`
- [ ] `models/CompanyApplication.js`
- [ ] `controllers/company/CompanyProfileController.js`
- [ ] `controllers/company/CompanyJobController.js`
- [ ] `middleware/company/roleMiddleware.js`
- [ ] `middleware/company/validationMiddleware.js`
- [ ] `middleware/company/uploadMiddleware.js`
- [ ] `middleware/company/isVerified.js`
- [ ] `routes/companyRoutes.js`
- [ ] `utils/company/sendResponse.js`
- [ ] `utils/company/uploadToCloudinary.js`
- [ ] `utils/company/validateCompanyData.js`
- [ ] `utils/company/checkLinkedInProfile.js`

**Frontend:**
- [ ] `apis/companyProfileApi.js`
- [ ] `components/companyComponent/CompanyBasicInfoForm.jsx`
- [ ] `components/companyComponent/CompanyDetailsForm.jsx`
- [ ] `components/companyComponent/CompanyLinksForm.jsx`
- [ ] `components/companyComponent/CompanyDocumentsUpload.jsx`
- [ ] `components/companyComponent/CompanyJobPostings.jsx`
- [ ] `components/companyComponent/JobApplicationsView.jsx`
- [ ] `components/companyComponent/CompanyProfileCompletion.jsx`
- [ ] `pages/company/CompanyProfile.jsx`
- [ ] `pages/company/CompanyDashboard.jsx`
- [ ] `pages/company/ManageJobs.jsx`

### Files to Modify:

**Backend:**
- [ ] `server.js` - Add company routes
- [ ] `models/User.js` - Add company role if not exists

**Frontend:**
- [ ] `App.jsx` or router setup - Add company routes
- [ ] `apis/api.js` - Add company API base if separate

---

## 🔄 SIMILAR PATTERNS TO FOLLOW

### From StudentProfile Implementation:

1. **Model Pattern** → Use same nested schema approach
2. **Controller Pattern** → Follow helper functions, error handling
3. **Middleware Pattern** → Role checking, validation, upload
4. **API Pattern** → Consistent endpoint naming, response format
5. **Component Pattern** → Tab-based forms, icon usage, validation feedback
6. **State Management** → Manual state handling (no Redux)
7. **Error Handling** → Consistent error messages
8. **Styling** → Tailwind CSS with gold/navy color scheme

---

## 🎯 REFERENCE MAPPING

```
StudentProfile Implementation → Company Profile Implementation

StudentProfile.js           → Company.js
StudentProfileController.js → CompanyProfileController.js + CompanyJobController.js
basicInfo field             → basicInfo + details fields
skills object              → details object
links object               → links object (enhanced with company pages)
documents object           → documents object (logo + certificate)
projects array             → activeJobs array
verification object        → verification object (same pattern)
BasicInfoForm              → CompanyBasicInfoForm
SkillsForm                → CompanyDetailsForm
PortfolioLinksForm        → CompanyLinksForm
DocumentUpload            → CompanyDocumentsUpload
ProjectModal              → JobPostingModal
StudentProfile.jsx        → CompanyProfile.jsx
```

---

## 🚀 IMPLEMENTATION ORDER

1. Create Company Model (reference StudentProfile.js)
2. Create Company Middleware (reference Student middleware)
3. Create Company Utilities (reference Student utilities)
4. Create Company Controllers (reference StudentProfileController.js)
5. Create Company Routes
6. Create Frontend API file
7. Create Frontend Components (one by one)
8. Create Frontend Pages
9. Integrate routes in main app

---

## ✅ COMPLETION CRITERIA

- ✅ All backend files created with proper structure
- ✅ All frontend components created and functional
- ✅ Hinglish comments in all code files
- ✅ No TypeScript (JSX only on frontend)
- ✅ No React Hooks used
- ✅ CommonJS (require) on backend
- ✅ Proper error handling
- ✅ Consistent styling with StudentProfile
- ✅ All API endpoints working
- ✅ Profile completion calculation working
- ✅ Verification process implemented

---

**Date**: November 20, 2025
**Status**: Ready for Implementation
**Reference Version**: Phase 2.1 (StudentProfile)
**Architecture**: Monolithic with Modular Folder Structure
