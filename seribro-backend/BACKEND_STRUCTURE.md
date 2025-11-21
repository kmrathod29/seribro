# 📁 SERIBRO Backend - Folder Structure & File Overview

**Project:** SERIBRO Backend (Node.js + Express + MongoDB)  
**Date:** November 19, 2025  
**Environment:** Development  

---

## 🏗️ Root Directory Structure

```
seribro-backend/
├── backend/                          # Main backend application folder
│   ├── config/                       # Configuration files
│   ├── controllers/                  # Business logic handlers
│   ├── middleware/                   # Request interceptors & validators
│   ├── models/                       # MongoDB schemas
│   ├── routes/                       # API endpoints
│   ├── uploads/                      # Temporary file storage
│   └── utils/                        # Helper functions
├── node_modules/                     # Dependencies (npm packages)
├── testing_manual/                   # Manual testing guides
├── .env                              # Environment variables (not committed)
├── .gitignore                        # Git ignore rules
├── package.json                      # Project metadata & scripts
├── package-lock.json                 # Dependency lock file
├── server.js                         # Express server entry point
└── README-auth.md                    # Authentication documentation
```

---

## 📂 Detailed Backend Folder Structure

### 1. **backend/config/** - Configuration Files
Stores database and third-party service configurations.

```
backend/config/
├── dbconection.js          # MongoDB connection setup
│   ├── MongoDB URI configuration
│   ├── Connection pooling settings
│   └── Error handling for DB connections
│
└── cloudinary.js           # Cloudinary API configuration
    ├── API key setup
    ├── Cloud name configuration
    └── Upload presets
```

**Files Details:**

| File | Purpose | Usage |
|------|---------|-------|
| `dbconection.js` | MongoDB connection manager | Imported in `server.js` to connect to database |
| `cloudinary.js` | Cloudinary SDK setup | Used in `utils/students/uploadToCloudinary.js` for file uploads |

---

### 2. **backend/controllers/** - Business Logic Layer
Handles all API request logic and database operations.

```
backend/controllers/
├── authController.js                 # Authentication logic
│   ├── signup()              # User registration
│   ├── login()               # User authentication
│   ├── verifyOTP()           # OTP verification
│   ├── resendOTP()           # Resend OTP to email
│   ├── forgotPassword()      # Password reset request
│   └── resetPassword()       # Complete password reset
│
└── StudentProfileController.js       # Student profile management
    ├── getProfile()          # Fetch/create student profile
    ├── getDashboard()        # Get dashboard summary
    ├── updateBasicInfo()     # Update personal details
    ├── updateSkills()        # Update technical & soft skills
    ├── updateTechStack()     # Update technology stack
    ├── addProject()          # Add new project
    ├── updateProject()       # Modify existing project
    ├── deleteProject()       # Remove project
    ├── uploadResume()        # Upload resume file
    ├── uploadCollegeId()     # Upload college ID
    ├── uploadCertificates()  # Upload certificates
    └── submitForVerification()  # Submit profile for admin review
```

**File Details:**

| File | Functions | Lines | Status |
|------|-----------|-------|--------|
| `authController.js` | 6 main functions | ~200 | ✅ Existing |
| `StudentProfileController.js` | 12 main functions | 545 | ✅ Active |

---

### 3. **backend/middleware/** - Request Processing Layer
Interceptors that process requests before they reach controllers.

#### **Main Middleware Directory**
```
backend/middleware/
├── authMiddleware.js         # JWT token verification
│   └── authMiddleware(req, res, next)
│       ├── Extracts JWT token from headers/cookies
│       ├── Verifies token validity
│       ├── Attaches user data to req.user
│       └── Blocks unauthorized requests (401 errors)
│
├── uploadMiddleware.js       # Multer configuration (root level)
│   └── Sets up temporary file storage for uploads
│       (Note: Also exists in student/ subdirectory)
│
└── student/                  # Student-specific middleware
    ├── roleMiddleware.js
    ├── isVerified.js
    ├── validationMiddleware.js
    ├── uploadMiddleware.js
    └── profileCompletionCheck.js
```

#### **Student Middleware Directory**
```
backend/middleware/student/
├── roleMiddleware.js
│   └── roleMiddleware(role)(req, res, next)
│       ├── Checks if user has required role
│       ├── Restricts routes by role ('student', 'company', 'admin')
│       └── Returns 403 Forbidden if unauthorized
│
├── isVerified.js
│   └── isVerified(req, res, next)
│       ├── Checks if student's email is verified (OTP completed)
│       ├── Queries Student model for isVerified flag
│       └── Blocks unverified students (403 Forbidden)
│
├── validationMiddleware.js
│   └── validationMiddleware(type)(req, res, next)
│       ├── Validates request body schema
│       ├── Handles: basicInfo, skills, techStack, project
│       ├── Checks required fields & data types
│       └── Returns 400 Bad Request if validation fails
│
├── uploadMiddleware.js
│   └── Multer configuration for file uploads
│       ├── Disk storage setup (temporary uploads folder)
│       ├── File filters (PDF, images only)
│       ├── File size limits (5MB max)
│       └── Field name mapping (resume, collegeId, certificates)
│
└── profileCompletionCheck.js
    └── profileCompletionCheck(req, res, next)
        ├── Validates profile is 100% complete
        ├── Checks for: basicInfo, skills, projects, documents
        ├── Used before submitForVerification endpoint
        └── Returns 400 if incomplete
```

**Middleware Flow:**
```
Request
  ↓
authMiddleware (JWT validation)
  ↓
roleMiddleware (Role check)
  ↓
isVerified (Email verification check)
  ↓
validationMiddleware (Request validation)
  ↓
uploadMiddleware (File handling if needed)
  ↓
profileCompletionCheck (Completion check if needed)
  ↓
Controller Function
  ↓
Response
```

---

### 4. **backend/models/** - Database Schemas
MongoDB Mongoose schemas defining data structure.

```
backend/models/
├── User.js
│   └── Base user schema
│       ├── email (unique, required)
│       ├── password (hashed)
│       ├── role (enum: 'student', 'company', 'admin')
│       ├── createdAt
│       └── updatedAt
│
├── Student.js
│   └── Student-specific information
│       ├── userId (ref: User)
│       ├── isVerified (OTP verification status)
│       ├── phone
│       ├── createdAt
│       └── updatedAt
│
├── StudentProfile.js
│   └── Complete student profile data
│       ├── studentId (ref: Student)
│       ├── basicInfo { fullName, phone, collegeName, branch, semester }
│       ├── skills { technical[], soft[], primarySkills[] }
│       ├── techStack []
│       ├── projects [] { title, description, link, technologies }
│       ├── documents { resume, collegeId, certificates[] }
│       ├── profileCompletion (0-100%)
│       ├── verificationStatus (incomplete, pending, verified, rejected)
│       ├── createdAt
│       └── updatedAt
│
├── Company.js
│   └── Company profile information
│       ├── userId (ref: User)
│       ├── companyName
│       ├── industryType
│       ├── description
│       ├── website
│       └── (other company fields)
│
└── OTP.js
    └── OTP verification tracking
        ├── email (unique)
        ├── otp (temporary code)
        ├── expiresAt (TTL index)
        ├── attempts (rate limiting)
        └── verified (boolean)
```

**Model Relationships:**
```
User (Base)
  ├── Student
  │   └── StudentProfile
  └── Company
```

---

### 5. **backend/routes/** - API Endpoint Definitions
Express route handlers mapping HTTP methods to controllers.

```
backend/routes/
├── authRoutes.js
│   └── Authentication endpoints
│       ├── POST /api/auth/signup
│       ├── POST /api/auth/login
│       ├── POST /api/auth/verify-otp
│       ├── POST /api/auth/resend-otp
│       ├── POST /api/auth/forgot-password
│       └── POST /api/auth/reset-password
│
└── studentProfileRroute.js
    └── Student profile endpoints
        ├── GET /api/student/profile
        ├── GET /api/student/dashboard
        ├── PUT /api/student/profile/basic
        ├── PUT /api/student/profile/skills
        ├── PUT /api/student/profile/tech
        ├── POST /api/student/profile/projects
        ├── PUT /api/student/profile/projects/:id
        ├── DELETE /api/student/profile/projects/:id
        ├── POST /api/student/profile/resume
        ├── POST /api/student/profile/college-id
        ├── POST /api/student/profile/certificates
        └── POST /api/student/profile/submit-verification
```

**Route Structure:**
```
Routes
  ├── Connect HTTP methods to URLs
  ├── Apply middleware (auth, validation, etc.)
  └── Call controller functions
```

---

### 6. **backend/utils/** - Helper Functions
Reusable utility functions used across controllers.

#### **Root Utils Directory**
```
backend/utils/
├── generateOTP.js
│   └── generateOTP()
│       ├── Creates 6-digit OTP
│       └── Returns random code for email verification
│
├── generateToken.js
│   └── generateToken(userId, role)
│       ├── Creates JWT token
│       ├── Sets expiration (24 hours)
│       └── Returns encoded token
│
├── generateResetToken.js
│   └── generateResetToken(userId)
│       ├── Creates password reset token
│       ├── Shorter expiration (1 hour)
│       └── Returns secure token
│
├── sendEmail.js
│   └── sendEmail(email, subject, message)
│       ├── Sends OTP emails
│       ├── Sends password reset emails
│       ├── Uses Nodemailer or similar service
│       └── Handles email delivery errors
│
└── students/                # Student-specific utilities
    ├── sendResponse.js
    ├── uploadToCloudinary.js
    ├── calculateProfileCompletion.js
    ├── validateProjectData.js
    └── checkGithubLink.js
```

#### **Students Utilities Directory**
```
backend/utils/students/
├── sendResponse.js
│   └── sendResponse(res, statusCode, success, message, data, error)
│       ├── Standardized JSON response format
│       ├── Used by all controllers
│       └── Consistent error/success structure
│
├── uploadToCloudinary.js
│   └── uploadToCloudinary(filePath, folderName, resourceType)
│       ├── Uploads files to Cloudinary
│       ├── Handles resume, certificates, college ID
│       ├── Returns public URL
│       └── Error handling for upload failures
│
├── calculateProfileCompletion.js
│   └── calculateProfileCompletion(profile)
│       ├── Calculates profile completion percentage
│       ├── Weights: BasicInfo (20%), Skills (20%), TechStack (15%)
│       ├── Projects (20%), Resume (10%), CollegeID (10%), Certs (5%)
│       └── Returns 0-100 number
│
├── validateProjectData.js
│   └── validateProjectData(projectData)
│       ├── Validates project title, description, link
│       ├── Checks GitHub URL format
│       ├── Enforces minimum character counts
│       └── Returns { isValid, errors[] }
│
└── checkGithubLink.js
    └── checkGithubLink(url)
        ├── Validates GitHub URL format
        ├── Verifies URL is reachable (mock)
        └── Returns { isValid, message }
```

---

### 7. **backend/uploads/** - Temporary File Storage
Stores uploaded files temporarily before moving to cloud storage.

```
backend/uploads/
├── collegeId-1763305328177-125610953.jpg
│   └── Temporary college ID upload
│
├── collegeId-1763307269640-778838640.png
│   └── Another temporary college ID
│
└── (Other temporary files)
    └── Format: [fieldname]-[timestamp]-[randomnumber].[extension]
```

**Folder Purpose:**
- Temporary storage during multer processing
- Files are moved to Cloudinary in production
- Can be cleaned up periodically
- Not committed to Git (in `.gitignore`)

---

## 📊 Complete File Count & Structure

```
SERIBRO BACKEND STRUCTURE
│
├─ backend/                           (Main application)
│  ├─ config/                         (2 files)
│  │  ├─ dbconection.js
│  │  └─ cloudinary.js
│  │
│  ├─ controllers/                    (2 files)
│  │  ├─ authController.js
│  │  └─ StudentProfileController.js
│  │
│  ├─ middleware/                     (7 files)
│  │  ├─ authMiddleware.js
│  │  ├─ uploadMiddleware.js
│  │  └─ student/                     (5 files)
│  │     ├─ isVerified.js
│  │     ├─ roleMiddleware.js
│  │     ├─ validationMiddleware.js
│  │     ├─ uploadMiddleware.js
│  │     └─ profileCompletionCheck.js
│  │
│  ├─ models/                         (5 files)
│  │  ├─ User.js
│  │  ├─ Student.js
│  │  ├─ StudentProfile.js
│  │  ├─ Company.js
│  │  └─ OTP.js
│  │
│  ├─ routes/                         (2 files)
│  │  ├─ authRoutes.js
│  │  └─ studentProfileRroute.js
│  │
│  ├─ utils/                          (9 files)
│  │  ├─ generateOTP.js
│  │  ├─ generateToken.js
│  │  ├─ generateResetToken.js
│  │  ├─ sendEmail.js
│  │  └─ students/                    (5 files)
│  │     ├─ sendResponse.js
│  │     ├─ uploadToCloudinary.js
│  │     ├─ calculateProfileCompletion.js
│  │     ├─ validateProjectData.js
│  │     └─ checkGithubLink.js
│  │
│  └─ uploads/                        (2 temporary files)
│
├─ testing_manual/                    (2 testing guides)
│  ├─ frontend_testing_guide.txt
│  └─ Hou to test signup-login api v1.txt
│
├─ node_modules/                      (Dependencies)
│
├─ server.js                          (Express server entry)
├─ package.json                       (Project metadata)
├─ package-lock.json                  (Dependency lock)
├─ .env                               (Environment variables)
├─ .gitignore                         (Git ignore rules)
└─ README-auth.md                     (Auth documentation)

TOTAL: 31 files (excluding node_modules & uploads)
```

---

## 🔗 File Dependencies & Relationships

### **Server Entry Point**
```
server.js
├── Loads .env configuration
├── Imports database connection (config/dbconection.js)
├── Imports routes (routes/authRoutes.js, routes/studentProfileRroute.js)
└── Starts Express server on port 7000
```

### **Authentication Flow**
```
Request → authRoutes.js → authController.js
                         ├── Imports: generateOTP.js, generateToken.js, sendEmail.js
                         ├── Models: User, Student, OTP
                         └── Utils: sendResponse.js
```

### **Student Profile Flow**
```
Request → studentProfileRroute.js
          ├── Middleware chain: authMiddleware → roleMiddleware → isVerified → validationMiddleware
          └── StudentProfileController.js
              ├── Models: StudentProfile, Student
              ├── Utils: sendResponse.js, uploadToCloudinary.js, calculateProfileCompletion.js
              └── uploadMiddleware for file handling
```

### **File Upload Flow**
```
FormData (File) → uploadMiddleware (multer) → uploadToCloudinary.js → Cloudinary API
                                            ↓
                                      sendResponse.js (return URL)
```

---

## 📝 Key Import Patterns

### **Controllers Import Pattern**
```javascript
// Models
const StudentProfile = require('../models/StudentProfile');

// Utils
const { sendResponse } = require('../utils/students/sendResponse');
const { uploadToCloudinary } = require('../utils/students/uploadToCloudinary');
```

### **Routes Import Pattern**
```javascript
// Controllers
const { getProfile, updateBasicInfo } = require('../controllers/StudentProfileController');

// Middleware
const { authMiddleware } = require('../middleware/authMiddleware');
const { roleMiddleware } = require('../middleware/student/roleMiddleware');
```

### **Middleware Import Pattern**
```javascript
// Utils
const { sendResponse } = require('../../utils/students/sendResponse');

// Models
const Student = require('../../models/Student');
```

---

## 🚀 Initialization & Startup Sequence

```
1. npm start
   ↓
2. nodemon watches for file changes
   ↓
3. server.js executes
   ↓
4. Load environment variables (.env)
   ↓
5. Connect to MongoDB (config/dbconection.js)
   ↓
6. Initialize Express app
   ↓
7. Import and use routes
   ├── authRoutes (/api/auth/*)
   └── studentProfileRroute (/api/student/*)
   ↓
8. Start listening on port 7000
   ↓
9. Ready for requests ✅
```

---

## 📋 Checklist: Files & Status

| Component | File | Status | Lines | Dependency |
|-----------|------|--------|-------|-----------|
| **Config** | dbconection.js | ✅ | ~50 | MongoDB |
| | cloudinary.js | ✅ | ~30 | Cloudinary |
| **Controllers** | authController.js | ✅ | ~200 | User, OTP, Email |
| | StudentProfileController.js | ✅ | 545 | StudentProfile |
| **Middleware** | authMiddleware.js | ✅ | ~40 | JWT |
| | roleMiddleware.js | ✅ | ~25 | sendResponse |
| | isVerified.js | ✅ | ~30 | Student |
| | validationMiddleware.js | ✅ | 80 | sendResponse |
| | uploadMiddleware.js | ✅ | 68 | multer |
| | profileCompletionCheck.js | ✅ | 38 | StudentProfile |
| **Models** | User.js | ✅ | ~50 | mongoose |
| | Student.js | ✅ | ~40 | User |
| | StudentProfile.js | ✅ | ~100 | Student |
| | Company.js | ✅ | ~50 | User |
| | OTP.js | ✅ | ~40 | mongoose |
| **Routes** | authRoutes.js | ✅ | ~60 | authController |
| | studentProfileRroute.js | ✅ | 68 | StudentProfileController |
| **Utils** | generateOTP.js | ✅ | ~20 | crypto |
| | generateToken.js | ✅ | ~20 | jsonwebtoken |
| | generateResetToken.js | ✅ | ~20 | crypto |
| | sendEmail.js | ✅ | ~50 | nodemailer |
| | sendResponse.js | ✅ | ~30 | (utility) |
| | uploadToCloudinary.js | ✅ | ~60 | cloudinary |
| | calculateProfileCompletion.js | ✅ | ~40 | (utility) |
| | validateProjectData.js | ✅ | ~40 | (utility) |
| | checkGithubLink.js | ✅ | ~30 | axios |

---

## 🎯 Summary

- **Total Backend Files:** 31 files
- **Main Folders:** 7 directories
- **Controllers:** 2 files (12 student functions, 6 auth functions)
- **Models:** 5 Mongoose schemas
- **Middleware:** 7 processing functions
- **Routes:** 2 route files (19 total endpoints)
- **Utils:** 9 helper functions
- **Config:** 2 configuration files

All files are organized following **MVC (Model-View-Controller) architecture** with additional middleware and utility layers for scalability and maintainability.

