# COMPANY IMPLEMENTATION - COMPLETE FILE STRUCTURE & CHECKLIST

## 📁 EXACT FOLDER & FILE STRUCTURE

```
seribro-backend/
└── backend/
    ├── models/
    │   ├── Company.js ........................... NEW (Company Profile)
    │   ├── CompanyJob.js ........................ NEW (Job Postings)
    │   └── CompanyApplication.js ............... NEW (Applications)
    │
    ├── controllers/
    │   └── company/ ............................ NEW FOLDER
    │       ├── CompanyProfileController.js .... NEW (Profile Management)
    │       └── CompanyJobController.js ........ NEW (Jobs & Search)
    │
    ├── middleware/
    │   └── company/ ............................ NEW FOLDER
    │       ├── roleMiddleware.js .............. NEW (Role Checking)
    │       ├── validationMiddleware.js ........ NEW (Data Validation)
    │       ├── uploadMiddleware.js ............ NEW (File Upload)
    │       ├── isVerified.js .................. NEW (Email Verification)
    │       └── verificationCheck.js ........... NEW (Profile Verification)
    │
    ├── routes/
    │   └── companyRoutes.js ................... NEW (Company API Routes)
    │
    └── utils/
        └── company/ ............................ NEW FOLDER
            ├── sendResponse.js ................ NEW (Response Utility)
            ├── uploadToCloudinary.js ......... NEW (Cloudinary Upload)
            ├── validateCompanyData.js ........ NEW (Data Validation)
            ├── checkLinkedInProfile.js ....... NEW (LinkedIn Validation)
            └── calculateProfileCompletion.js  NEW (Completion Calc)

seribro-frontend/
└── client/src/
    ├── apis/
    │   └── companyProfileApi.js .............. NEW (API Endpoints)
    │
    ├── components/
    │   └── companyComponent/ ................. NEW FOLDER
    │       ├── CompanyBasicInfoForm.jsx ...... NEW
    │       ├── CompanyDetailsForm.jsx ........ NEW
    │       ├── CompanyLinksForm.jsx .......... NEW
    │       ├── CompanyDocumentsUpload.jsx .... NEW
    │       ├── CompanyJobPostings.jsx ........ NEW
    │       ├── JobApplicationsView.jsx ....... NEW
    │       ├── CompanyProfileCompletion.jsx .. NEW
    │       └── JobModal.jsx .................. NEW
    │
    └── pages/
        └── company/ ........................... NEW FOLDER
            ├── CompanyProfile.jsx ............ NEW (Main Profile Page)
            ├── CompanyDashboard.jsx .......... NEW (Dashboard)
            └── ManageJobs.jsx ................ NEW (Job Management)
```

---

## 🎯 BACKEND FILES DETAILED SPECIFICATION

### 1. models/Company.js
```
FIELDS:
├── user (ObjectId, ref: User, required, unique)
├── basicInfo (Object)
│   ├── companyName (String, required)
│   ├── email (String, unique, lowercase)
│   ├── phone (String, 10-20 chars)
│   ├── industry (String, enum)
│   ├── companySize (String, enum)
│   ├── foundedYear (Number, 1950-2025)
│   ├── headquarters (String)
│   ├── website (String, URL validation)
│   ├── tagline (String, max 200)
│   └── description (String, max 1000)
├── details (Object)
│   ├── mission (String, max 500)
│   ├── vision (String, max 500)
│   ├── culture ([String], max 10)
│   ├── specialties ([String], max 15)
│   ├── techStack ([String], max 20)
│   ├── hrContactName (String)
│   ├── hrContactPhone (String)
│   └── hrContactEmail (String)
├── links (Object)
│   ├── website (String)
│   ├── linkedin (String)
│   ├── twitter (String)
│   ├── github (String)
│   └── other ([{name, url}])
├── documents (Object)
│   ├── logo ({filename, path, uploadedAt})
│   ├── certificate ({filename, path, uploadedAt})
│   └── others ([{filename, path, uploadedAt}])
├── verification (Object)
│   ├── status (enum: incomplete, pending, verified, rejected)
│   ├── isEmailVerified (Boolean)
│   ├── verifiedAt (Date)
│   ├── verifiedBy (ObjectId, ref: User)
│   ├── rejectionReason (String)
│   └── submittedForVerificationAt (Date)
├── profileStats (Object)
│   ├── profileCompletion (Number, 0-100)
│   ├── lastUpdated (Date)
│   ├── viewCount (Number)
│   └── applicantCount (Number)
├── activeJobs ([ObjectId], ref: CompanyJob)
├── applications ([ObjectId], ref: CompanyApplication)
└── status (Object)
    ├── isActive (Boolean)
    ├── isBlocked (Boolean)
    └── blockedReason (String)

METHODS:
- calculateProfileCompletion()
- submitForVerification()
- verifyProfile()
- rejectProfile()
- getActiveJobs()
- getApplicationsCount()
- isFullyVerified()

STATIC METHODS:
- findByUserId(userId)
- findVerified()
- searchByIndustry(industry)
- searchByTechStack(technologies)

INDEXES:
- { 'verification.status': 1 }
- { 'basicInfo.industry': 1 }
- { 'profileStats.profileCompletion': -1 }
```

### 2. models/CompanyJob.js
```
FIELDS:
├── company (ObjectId, ref: Company, required)
├── title (String, required, max 100)
├── description (String, required, max 2000)
├── requiredSkills ([String], max 15)
├── experienceRequired (Number, in years)
├── salaryRange (Object)
│   ├── min (Number)
│   └── max (Number)
├── location (String)
├── isRemote (Boolean)
├── jobType (String, enum: Full-time, Part-time, Contract, Intern)
├── applicationDeadline (Date)
├── status (String, enum: Open, Closed, Filled, Draft)
├── applications ([ObjectId], ref: CompanyApplication)
├── applicationsCount (Number)
└── timestamps (auto)

METHODS:
- getApplications()
- getApplicantCount()
- close()
- reopen()

INDEXES:
- { company: 1 }
- { status: 1 }
- { createdAt: -1 }
```

### 3. models/CompanyApplication.js
```
FIELDS:
├── job (ObjectId, ref: CompanyJob, required)
├── company (ObjectId, ref: Company, required)
├── student (ObjectId, ref: Student, required)
├── studentProfile (ObjectId, ref: StudentProfile)
├── status (String, enum: Applied, Reviewed, Shortlisted, Rejected, Accepted, Withdrawn)
├── appliedAt (Date)
├── reviewedAt (Date)
├── companyNotes (String)
├── studentNotes (String)
├── phone (String)
├── email (String)
├── resume (String, file URL)
└── timestamps (auto)

INDEXES:
- { job: 1 }
- { company: 1 }
- { student: 1 }
- { status: 1 }
```

### 4. controllers/company/CompanyProfileController.js
```
EXPORTS:
✓ getProfile()              - Fetch or create profile
✓ updateBasicInfo()         - Update company name, email, phone, etc.
✓ updateDetails()           - Update mission, vision, culture, specialties
✓ updatePortfolioLinks()    - Update website, LinkedIn, Twitter, GitHub
✓ uploadCompanyLogo()       - Upload company logo to Cloudinary
✓ uploadDocuments()         - Upload company certificate/documents
✓ getDashboard()            - Get dashboard data with stats
✓ submitForVerification()   - Submit profile for admin review

HELPERS:
- findProfile(companyId)
- getCompanyId(req)
- getUserId(req)
- validateURLs()
```

### 5. controllers/company/CompanyJobController.js
```
EXPORTS:
✓ createJobPosting()        - Create new job
✓ getJobPostings()          - Get all company jobs
✓ updateJobPosting()        - Update job details
✓ deleteJobPosting()        - Delete/Close job
✓ getApplicationsForJob()   - Get applications for specific job
✓ getApplications()         - Get all applications
✓ respondToApplication()    - Accept/Reject application
✓ searchStudentProfiles()   - Search verified students by skills
✓ getStudentProfile()       - View student profile

HELPERS:
- validateJobData()
- checkJobOwnership()
```

### 6. middleware/company/roleMiddleware.js
```
PATTERN (Reference: student/roleMiddleware.js):

Check:
- req.user.role === 'company'
- req.user.isCompanyVerified (optional)
- req.user.companyId exists

Return:
- next() if valid
- 403 Forbidden if invalid
```

### 7. middleware/company/validationMiddleware.js
```
TYPES:
- 'basicInfo'    : Validate companyName, email, phone, industry, etc.
- 'details'      : Validate mission, vision, culture, etc.
- 'links'        : Validate URLs format
- 'job'          : Validate job title, description, skills, etc.

PATTERN:
Factory function returning middleware
Check fields based on type
Return error if validation fails
```

### 8. middleware/company/uploadMiddleware.js
```
CONFIG:
- Destination: company_profiles/
- File size: 10MB
- File types: PNG, JPG, PDF
- Folder: company_logos, company_certificates, company_docs

PATTERNS:
- single('logo')
- single('certificate')
- array('documents', 3)
```

### 9. middleware/company/isVerified.js
```
CHECK:
- req.user.isEmailVerified === true
- req.user.email verified in User model

RETURN:
- next() if verified
- 403 Forbidden if not verified
```

### 10. routes/companyRoutes.js
```
ROUTES:

Profile Management:
GET    /api/company/profile
PUT    /api/company/profile/basic
PUT    /api/company/profile/details
PUT    /api/company/profile/links

Document Upload:
POST   /api/company/profile/logo
POST   /api/company/profile/documents

Job Management:
GET    /api/company/jobs
POST   /api/company/jobs
PUT    /api/company/jobs/:id
DELETE /api/company/jobs/:id

Applications:
GET    /api/company/applications
GET    /api/company/jobs/:jobId/applications
PUT    /api/company/applications/:id

Verification & Dashboard:
POST   /api/company/submit-verification
GET    /api/company/dashboard

Search:
GET    /api/company/search/students
GET    /api/company/students/:studentId

MIDDLEWARE:
- protect (auth)
- roleMiddleware(['company'])
- validationMiddleware() where needed
- uploadMiddleware where needed
- isVerified for sensitive operations
```

### 11-15. utils/company/
```
sendResponse.js:
- Same as student version
- No changes needed

uploadToCloudinary.js:
- Same as student version
- No changes needed

validateCompanyData.js:
- Validate companyName, email, phone
- Validate mission, vision, culture
- Validate URLs (website, linkedin, etc.)
- Return error message or null

checkLinkedInProfile.js:
- Make API call to validate LinkedIn company page
- Return true if exists, false if not
- Similar to checkGithubLink.js

calculateProfileCompletion.js:
- Calculate based on filled fields
- Return percentage (0-100)
- Weights: basicInfo 20, details 20, links 15, 
           documents 20, jobs 15, verification 10
```

---

## 🎨 FRONTEND FILES DETAILED SPECIFICATION

### 1. apis/companyProfileApi.js
```
BASE_URL: http://localhost:7000/api/company

FUNCTIONS:

PROFILE:
- fetchProfile()
- updateCompanyBasicInfo(data)
- updateCompanyDetails(data)
- updatePortfolioLinks(data)

UPLOADS:
- uploadCompanyLogo(file)
- uploadDocuments(files)

JOBS:
- createJobPosting(data)
- getJobPostings()
- updateJobPosting(jobId, data)
- deleteJobPosting(jobId)

APPLICATIONS:
- getApplications()
- getJobApplications(jobId)
- respondToApplication(appId, status, notes)

VERIFICATION:
- submitForVerification()
- fetchDashboard()

SEARCH:
- searchStudents(query)
- getStudentProfile(studentId)
```

### 2. CompanyBasicInfoForm.jsx
```
FIELDS:
- Company Name (text)
- Email (email)
- Phone (tel)
- Industry (select)
- Company Size (select)
- Founded Year (number)
- Headquarters (text)
- Website (url)
- Tagline (textarea)
- Description (textarea)

FEATURES:
- Form validation
- Error display
- Loading state
- Success message
- Icon display (lucide-react)
- Tailwind styling
```

### 3. CompanyDetailsForm.jsx
```
TABS:
1. Mission & Vision
   - Mission statement (textarea)
   - Vision statement (textarea)

2. Culture & Values
   - Company Culture (add/remove tags)
   - Specialties/Services (add/remove tags)

3. Tech Stack
   - Technologies used (add/remove tags)
   - Development tools (add/remove tags)

FEATURES:
- Tab navigation
- Add/Remove functionality
- Tag display
- Input validation
```

### 4. CompanyLinksForm.jsx
```
SECTIONS:
1. Main Links
   - Website (URL)
   - LinkedIn Company Page (URL)
   - Twitter/X Profile (URL)
   - GitHub Organization (URL)

2. Additional Links
   - Custom name/URL pairs
   - Add new link
   - Remove link
   - Preview link

FEATURES:
- URL validation
- External link preview
- Add/Remove functionality
- Error messages
```

### 5. CompanyDocumentsUpload.jsx
```
UPLOADS:
1. Company Logo (required)
   - Image formats: JPG, PNG
   - Max 5MB
   - Preview as image

2. Company Certificate (required)
   - PDF format
   - Max 10MB
   - Preview as document

3. Other Documents (optional)
   - Multiple formats
   - Max 3 files

FEATURES:
- File input with drag-drop
- File preview
- Upload progress
- Delete capability
- File size validation
```

### 6. CompanyJobPostings.jsx
```
FEATURES:
- Display list of job postings
- Add new job button
- Edit job button
- Delete job button
- Job card with details
- Applications count
- Job status display

LAYOUT:
- Grid or list view
- Filter by status (Open, Closed, etc.)
- Sort by date, applications
```

### 7. JobApplicationsView.jsx
```
FEATURES:
- Display list of applications
- Filter by status (Applied, Shortlisted, etc.)
- View student profile
- Accept/Reject button
- Add company notes
- Sort by date

LAYOUT:
- Table or card view
- Student name, email, phone
- Applied job title
- Application date
- Current status
- Action buttons
```

### 8. CompanyProfileCompletion.jsx
```
FEATURES:
- Circular or linear progress bar
- Percentage display
- Status color (red, yellow, green)
- Completion details breakdown
- Tips for increasing completion
```

### 9. JobModal.jsx
```
FEATURES:
- Add/Edit job posting
- Modal dialog
- Form with validation
- Sticky header
- Scrollable content
- Action buttons (Save, Delete, Cancel)

FIELDS:
- Job Title
- Description
- Required Skills (tags)
- Experience (number)
- Salary Range (min/max)
- Location
- Job Type (select)
- Application Deadline
- Status
```

### 10. CompanyProfile.jsx
```
TABS:
- Basic Information
- Company Details
- Portfolio Links
- Documents
- Job Postings
- Applications
- Verification Status

FEATURES:
- Tab navigation
- Profile completion bar
- Component integration
- Load profile on mount
- Refresh on update
- Error handling
- Loading states
```

### 11. CompanyDashboard.jsx
```
WIDGETS:
1. Profile Completion Card
   - Progress bar
   - Percentage
   - Next steps

2. Active Jobs Card
   - Number of jobs
   - Quick actions

3. Recent Applications Card
   - Latest applications
   - Status summary

4. Quick Stats Card
   - Profile views
   - Applicants
   - Jobs posted

5. Action Buttons
   - Complete Profile
   - Post Job
   - View Applications
```

### 12. ManageJobs.jsx
```
FEATURES:
- List all jobs
- Filter by status
- Sort options
- Add new job button
- Edit job (open modal)
- Delete job
- View applications
- Close job

LAYOUT:
- Search bar
- Filter/Sort controls
- Job list/grid
- Job card details
- Action buttons
```

---

## 🔄 FILES AFFECTED FOR REFERENCE

### Backend Reference Files
```
1. StudentProfile.js
   → Reference for Company.js model structure
   Location: seribro-backend/backend/models/StudentProfile.js
   
2. StudentProfileController.js
   → Reference for CompanyProfileController.js & CompanyJobController.js
   Location: seribro-backend/backend/controllers/StudentProfileController.js
   
3. middleware/student/ folder
   → Reference for middleware/company/ folder
   Location: seribro-backend/backend/middleware/student/
   
4. utils/students/ folder
   → Reference for utils/company/ folder
   Location: seribro-backend/backend/utils/students/
   
5. studentProfileRoute.js
   → Reference for companyRoutes.js
   Location: seribro-backend/backend/routes/studentProfileRoute.js
   
6. User.js
   → For user/company relationship
   Location: seribro-backend/backend/models/User.js
```

### Frontend Reference Files
```
1. BasicInfoForm.jsx
   → Reference for CompanyBasicInfoForm.jsx
   Location: seribro-frontend/client/src/components/studentComponent/BasicInfoForm.jsx
   
2. SkillsForm.jsx
   → Reference for CompanyDetailsForm.jsx
   Location: seribro-frontend/client/src/components/studentComponent/SkillsForm.jsx
   
3. PortfolioLinksForm.jsx
   → Reference for CompanyLinksForm.jsx
   Location: seribro-frontend/client/src/components/studentComponent/PortfolioLinksForm.jsx
   
4. DocumentUpload.jsx
   → Reference for CompanyDocumentsUpload.jsx
   Location: seribro-frontend/client/src/components/studentComponent/DocumentUpload.jsx
   
5. ProjectModal.jsx
   → Reference for JobModal.jsx
   Location: seribro-frontend/client/src/components/studentComponent/ProjectModal.jsx
   
6. StudentProfile.jsx
   → Reference for CompanyProfile.jsx
   Location: seribro-frontend/client/src/pages/students/StudentProfile.jsx
   
7. studentProfileApi.js
   → Reference for companyProfileApi.js
   Location: seribro-frontend/client/src/apis/studentProfileApi.js
```

---

## ✅ IMPLEMENTATION CHECKLIST

### Backend Files
- [ ] models/Company.js (Reference: StudentProfile.js)
- [ ] models/CompanyJob.js
- [ ] models/CompanyApplication.js
- [ ] controllers/company/CompanyProfileController.js (Reference: StudentProfileController.js)
- [ ] controllers/company/CompanyJobController.js
- [ ] middleware/company/roleMiddleware.js (Reference: student/roleMiddleware.js)
- [ ] middleware/company/validationMiddleware.js (Reference: student/validationMiddleware.js)
- [ ] middleware/company/uploadMiddleware.js (Reference: student/uploadMiddleware.js)
- [ ] middleware/company/isVerified.js (Reference: student/isVerified.js)
- [ ] routes/companyRoutes.js (Reference: studentProfileRoute.js)
- [ ] utils/company/sendResponse.js (Copy from utils/students/)
- [ ] utils/company/uploadToCloudinary.js (Copy from utils/students/)
- [ ] utils/company/validateCompanyData.js
- [ ] utils/company/checkLinkedInProfile.js
- [ ] Modify server.js to include company routes

### Frontend Files
- [ ] apis/companyProfileApi.js (Reference: studentProfileApi.js)
- [ ] components/companyComponent/CompanyBasicInfoForm.jsx (Reference: BasicInfoForm.jsx)
- [ ] components/companyComponent/CompanyDetailsForm.jsx (Reference: SkillsForm.jsx)
- [ ] components/companyComponent/CompanyLinksForm.jsx (Reference: PortfolioLinksForm.jsx)
- [ ] components/companyComponent/CompanyDocumentsUpload.jsx (Reference: DocumentUpload.jsx)
- [ ] components/companyComponent/CompanyJobPostings.jsx
- [ ] components/companyComponent/JobApplicationsView.jsx
- [ ] components/companyComponent/CompanyProfileCompletion.jsx
- [ ] components/companyComponent/JobModal.jsx (Reference: ProjectModal.jsx)
- [ ] pages/company/CompanyProfile.jsx (Reference: StudentProfile.jsx)
- [ ] pages/company/CompanyDashboard.jsx
- [ ] pages/company/ManageJobs.jsx
- [ ] Modify App.jsx/router to include company routes

---

## 🎯 CODING STANDARDS

### JavaScript Comments (Hinglish)
```javascript
// Hinglish comments only, NO English mixed
// Backend: सभी कमेंट्स Hinglish में होंगे
// Frontend: सभी कमेंट्स Hinglish में होंगे

// अच्छा: Company ka profile model, refer StudentProfile.js se
// गलत: Company profile model, refer StudentProfile.js
```

### File Headers
```javascript
// backend/models/Company.js
// Company Profile Model - Phase 2.1
// Hinglish: Company ka detailed profile model, Student profile jaisa structure

// backend/controllers/company/CompanyProfileController.js
// Company Profile Management Controllers - Phase 2.1
// Hinglish: Company profile ko manage karne ke liye saare controllers

// frontend/components/companyComponent/CompanyBasicInfoForm.jsx
// Company Basic Information Form - Phase 2.1
// Hinglish: Company ki basic details ko update karne ka form
```

### Backend (CommonJS)
```javascript
const mongoose = require('mongoose');
const express = require('express');
const sendResponse = require('../utils/company/sendResponse');

module.exports = exports;
```

### Frontend (JSX - No Hooks)
```javascript
import React from 'react';
import { updateCompanyBasicInfo } from '../../apis/companyProfileApi';
import { User, Mail } from 'lucide-react';

const CompanyBasicInfoForm = ({ initialData, onUpdate }) => {
    // No useState, useEffect, or other hooks
    // Component logic here
};

export default CompanyBasicInfoForm;
```

---

**Master Document Status**: ✅ COMPLETE
**Reference Files**: ✅ MAPPED
**Structure**: ✅ DEFINED
**Implementation Ready**: ✅ YES

Date: November 20, 2025
Phase: 2.1 (Company Profile)
