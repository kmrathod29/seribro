# COMPANY IMPLEMENTATION - REFERENCE FILES MATRIX

## 📊 COMPLETE FILE MAPPING & REFERENCE GUIDE

### BACKEND REFERENCE FILES

#### 1. **FOR COMPANY MODEL** → Reference: `StudentProfile.js`
**Location**: `seribro-backend/backend/models/StudentProfile.js`

**What to Reference**:
```
- Schema structure with nested objects (basicInfo, skills, documents, etc.)
- Validation patterns (match, enum, minlength, maxlength)
- Indexed fields for faster queries
- Virtual fields (totalProjects, hasMinimumProjects)
- Instance methods (calculateProfileCompletion, submitForVerification)
- Static methods (findByStudentId, searchBySkills)
- Pre-save middleware for auto-calculation
- Error messages in validators
```

**Key Code Sections to Copy/Adapt**:
```javascript
Lines 1-60: Schema imports and sub-schema definition
Lines 68-90: Basic validation pattern examples
Lines 350-380: Virtual fields pattern
Lines 380-440: Instance methods pattern
Lines 450-490: Static methods pattern
Lines 500-530: Pre-save middleware pattern
```

**What's DIFFERENT for Company**:
- No projects array (use activeJobs instead)
- Add industry/companySize enums
- No semester/graduation fields
- Add HR contact details
- Enhanced links (LinkedIn company page, etc.)
- Add job posting management

---

#### 2. **FOR COMPANY CONTROLLER** → Reference: `StudentProfileController.js`
**Location**: `seribro-backend/backend/controllers/StudentProfileController.js`

**What to Reference**:
```
- Helper functions (findProfile, getStudentId, getUserId)
- Controller function structure and error handling
- CRUD operations pattern
- Response handling with sendResponse utility
- File upload handling with Cloudinary
- Validation error checking
- Profile completion calculation
- Verification submission logic
```

**Key Code Sections to Copy/Adapt**:
```javascript
Lines 1-25: Helper functions pattern
Lines 30-60: getProfile() method pattern
Lines 65-100: updateBasicInfo() method pattern
Lines 200-240: uploadResume() file upload pattern
Lines 280-320: addProject() with validation pattern
Lines 540-610: getDashboard() with alerts pattern
```

**Methods to Implement for Company**:
```
✓ getProfile()                  - GET /api/company/profile
✓ updateBasicInfo()             - PUT /api/company/profile/basic
✓ updateDetails()               - PUT /api/company/profile/details (NEW)
✓ updatePortfolioLinks()        - PUT /api/company/profile/links
✓ uploadCompanyLogo()           - POST /api/company/profile/logo
✓ uploadDocuments()             - POST /api/company/profile/documents
✓ createJobPosting()            - POST /api/company/jobs (NEW)
✓ updateJobPosting()            - PUT /api/company/jobs/:id
✓ deleteJobPosting()            - DELETE /api/company/jobs/:id
✓ getApplications()             - GET /api/company/applications (NEW)
✓ respondToApplication()        - PUT /api/company/applications/:id (NEW)
✓ getDashboard()                - GET /api/company/dashboard
✓ submitForVerification()       - POST /api/company/submit-verification
```

---

#### 3. **FOR COMPANY MIDDLEWARE** → Reference: Student Middleware Folder
**Location**: `seribro-backend/backend/middleware/student/`

**Files to Reference**:

**a) roleMiddleware.js** (Lines 1-30)
```javascript
Pattern:
- Check req.user.role
- Use next() or sendResponse for errors
- Match against allowed roles array

For Company:
- Check role === 'company'
- Similar structure, just different role
```

**b) validationMiddleware.js** (Lines 1-50)
```javascript
Pattern:
- Factory function that takes validation type
- Return middleware function
- Check different fields based on type

For Company:
- Add validation types for 'basicInfo', 'details', 'links'
- Similar structure to student validation
```

**c) uploadMiddleware.js** (Lines 1-40)
```javascript
Pattern:
- Use multer for file handling
- Set file size limits
- Configure storage location
- Filter file types

For Company:
- Upload to 'company_profiles', 'company_logos' folders
- Similar configuration, different paths
```

**d) isVerified.js** (Lines 1-20)
```javascript
Pattern:
- Check req.user.isEmailVerified
- Check profile verification status
- Return 400/403 if not verified

For Company:
- Similar pattern
- Check company email verification
```

---

#### 4. **FOR COMPANY UTILITIES** → Reference: Student Utils Folder
**Location**: `seribro-backend/backend/utils/students/`

**Files to Reference**:

**a) sendResponse.js**
```javascript
Pattern:
function(res, statusCode, success, message, data, error)
Returns: JSON response with standard format

Use: Exact same for Company (No changes needed)
```

**b) uploadToCloudinary.js**
```javascript
Pattern:
- Accept file path, folder name, identifier
- Upload to Cloudinary using SDK
- Return secure_url

For Company:
- Use same function, just different folder names
- No changes needed to function
```

**c) validateProjectData.js** → `validateCompanyData.js`
```javascript
Pattern:
- Validate required fields
- Check field lengths
- Return error message if invalid

For Company:
- Validate basicInfo, details, links
- Similar pattern
- Different field names
```

**d) checkGithubLink.js** → `checkLinkedInProfile.js`
```javascript
Pattern:
- Make external API call to validate URL
- Check if repository/profile exists
- Return true/false

For Company:
- Validate LinkedIn company page
- Check if company page exists
- Similar pattern
```

**e) calculateProfileCompletion.js** (NEW)
```javascript
Pattern (Reference from StudentProfile.js calculateProfileCompletion method):
- Define weights for each section
- Check if fields are populated
- Calculate percentage

For Company:
- Weights: basicInfo 20, details 20, links 15, documents 20, jobs 15, verification 10
- Check if required fields exist
```

---

#### 5. **FOR COMPANY ROUTES** → Reference: `studentProfileRoute.js`
**Location**: `seribro-backend/backend/routes/studentProfileRoute.js`

**Pattern to Reference**:
```javascript
Lines 1-30: Route file structure, imports, controller
Lines 30-45: middleware.use() pattern
Lines 45-60: GET, PUT routes pattern
Lines 60-70: POST routes with file upload
```

**Routes to Create for Company**:
```
GET    /api/company/profile                  → getProfile()
PUT    /api/company/profile/basic            → updateBasicInfo()
PUT    /api/company/profile/details          → updateDetails()
PUT    /api/company/profile/links            → updatePortfolioLinks()
POST   /api/company/profile/logo             → uploadCompanyLogo()
POST   /api/company/profile/documents        → uploadDocuments()
GET    /api/company/jobs                     → getJobPostings()
POST   /api/company/jobs                     → createJobPosting()
PUT    /api/company/jobs/:id                 → updateJobPosting()
DELETE /api/company/jobs/:id                 → deleteJobPosting()
GET    /api/company/applications             → getApplications()
PUT    /api/company/applications/:id         → respondToApplication()
POST   /api/company/submit-verification      → submitForVerification()
GET    /api/company/dashboard                → getDashboard()
```

---

### FRONTEND REFERENCE FILES

#### 1. **FOR COMPANY BASIC INFO FORM** → Reference: `BasicInfoForm.jsx`
**Location**: `seribro-frontend/client/src/components/studentComponent/BasicInfoForm.jsx`

**What to Reference**:
```
Lines 1-20: Imports and icon usage
Lines 30-50: State management pattern
Lines 60-100: Validation function
Lines 110-150: handleChange function
Lines 160-200: handleSubmit with API call
Lines 210-300: Form JSX structure
Lines 310-350: Input fields with error display
```

**Pattern to Adapt**:
```
✓ Import lucide-react icons
✓ useState for form data and errors
✓ useEffect to sync initialData
✓ Validation function for all fields
✓ handleChange with error clearing
✓ Try-catch in handleSubmit
✓ Error message display format
✓ Success message handling
✓ Loading state management
```

**Fields for Company**:
```
- Company Name (required)
- Email (required)
- Phone (required)
- Industry (select dropdown)
- Company Size (select dropdown)
- Founded Year (number)
- Headquarters (text)
- Website (URL, optional)
- Company Tagline (text, optional)
- Description (textarea)
```

---

#### 2. **FOR COMPANY DETAILS FORM** → Reference: `SkillsForm.jsx`
**Location**: `seribro-frontend/client/src/components/studentComponent/SkillsForm.jsx`

**What to Reference**:
```
Lines 1-20: Imports
Lines 30-60: Tab-based UI structure
Lines 70-120: Add/Remove item logic
Lines 130-180: Skill tag component
Lines 200-250: Form submission
```

**Pattern to Adapt**:
```
✓ Tab navigation system
✓ Add button and input for new items
✓ Remove button for existing items
✓ Tag display with X button
✓ Add on Enter key press
✓ Prevent duplicates
✓ API call structure
```

**Tabs for Company**:
```
Tab 1: Mission & Vision
- Mission statement (textarea)
- Vision statement (textarea)

Tab 2: Culture & Values
- Company Culture (tags)
- Specialties/Services (tags)

Tab 3: Tech Stack
- Technologies used (tags)
- Development tools (tags)
```

---

#### 3. **FOR COMPANY LINKS FORM** → Reference: `PortfolioLinksForm.jsx`
**Location**: `seribro-frontend/client/src/components/studentComponent/PortfolioLinksForm.jsx`

**What to Reference**:
```
Lines 1-30: Imports and component structure
Lines 50-100: URL validation
Lines 120-180: Add/Remove link logic
Lines 200-250: Link card component
Lines 270-320: Form submission
```

**Pattern to Adapt**:
```
✓ URL validation with regex
✓ External link preview
✓ Add multiple links
✓ Remove link functionality
✓ Validate before submit
✓ Error display for URLs
```

**Links for Company**:
```
Main Links:
- Website
- LinkedIn Company Page
- Twitter/X Profile
- GitHub Organization

Additional:
- Custom name/URL pairs
```

---

#### 4. **FOR COMPANY DOCUMENTS UPLOAD** → Reference: `DocumentUpload.jsx`
**Location**: `seribro-frontend/client/src/components/studentComponent/DocumentUpload.jsx`

**Pattern to Reference**:
```
- File input with accept attribute
- File preview
- Upload progress
- Delete uploaded file
- Multiple file support
```

**Documents for Company**:
```
1. Company Logo (required)
   - Image formats (JPG, PNG)
   - Max 5MB
   - Preview as image

2. Company Certificate (required)
   - PDF format
   - Max 10MB
   - Preview as document

3. Other Documents (optional)
   - Multiple formats
   - Max 3 files
```

---

#### 5. **FOR COMPANY PROFILE PAGE** → Reference: `StudentProfile.jsx`
**Location**: `seribro-frontend/client/src/pages/students/StudentProfile.jsx`

**What to Reference**:
```
Lines 1-30: Imports and setup
Lines 40-80: State management
Lines 90-130: loadProfile function
Lines 140-180: Tab navigation array
Lines 200-300: Tab content rendering
Lines 310-350: Component integration
```

**Pattern to Adapt**:
```
✓ Tab navigation system
✓ loadProfile() pattern
✓ Component integration with onUpdate
✓ Loading/Error states
✓ Profile refresh on update
```

**Tabs for Company**:
```
- Basic Information
- Company Details
- Portfolio Links
- Documents
- Job Postings
- Applications
- Verification Status
```

---

#### 6. **FOR COMPANY API FILE** → Reference: `studentProfileApi.js`
**Location**: `seribro-frontend/client/src/apis/studentProfileApi.js`

**What to Reference**:
```
Lines 1-30: API setup with axios
Lines 30-50: Interceptor for JWT token
Lines 60-80: Response and error handlers
Lines 90-130: Endpoint functions
Lines 140-180: File upload patterns
```

**Pattern to Adapt**:
```
✓ Axios create with baseURL
✓ Request interceptor for JWT
✓ handleResponse utility
✓ handleError utility
✓ Function structure
✓ FormData for file uploads
```

**Endpoints for Company**:
```
export const updateCompanyBasicInfo()
export const updateCompanyDetails()
export const updateCompanyLinks()
export const uploadCompanyLogo()
export const uploadDocuments()
export const createJobPosting()
export const getJobPostings()
export const updateJobPosting()
export const deleteJobPosting()
export const getApplications()
export const respondToApplication()
export const submitForVerification()
export const fetchCompanyDashboard()
```

---

### USER MODEL REFERENCE → For User/Company Relationship
**Location**: `seribro-backend/backend/models/User.js`

**What to Reference**:
```
- role enum values
- How student role is handled
- Authentication fields
```

**For Company**:
```
- Add role: 'company' to enum if not exists
- Similar authentication pattern
- Email verification pattern
```

---

### AUTH ROUTES REFERENCE → For Route Structure Pattern
**Location**: `seribro-backend/backend/routes/authRoutes.js`

**What to Reference**:
```
- How middleware is applied
- How routes are organized
- Error handling pattern
```

---

## 🔄 IMPLEMENTATION WORKFLOW

### Phase 1: Create Models
1. Reference `StudentProfile.js`
2. Create `Company.js` with similar structure
3. Create `CompanyJob.js` for job postings
4. Create `CompanyApplication.js` for applications

### Phase 2: Create Backend Infrastructure
1. Reference Student middleware folder
2. Create `middleware/company/` with similar files
3. Reference Student utils folder
4. Create `utils/company/` with adapted files
5. Reference StudentProfileController.js
6. Create `controllers/company/CompanyProfileController.js` and `CompanyJobController.js`
7. Reference studentProfileRoute.js
8. Create `routes/companyRoutes.js`

### Phase 3: Create Frontend API
1. Reference `studentProfileApi.js`
2. Create `apis/companyProfileApi.js`

### Phase 4: Create Frontend Components
1. Reference `BasicInfoForm.jsx` → Create `CompanyBasicInfoForm.jsx`
2. Reference `SkillsForm.jsx` → Create `CompanyDetailsForm.jsx`
3. Reference `PortfolioLinksForm.jsx` → Create `CompanyLinksForm.jsx`
4. Reference `DocumentUpload.jsx` → Create `CompanyDocumentsUpload.jsx`
5. Create `CompanyJobPostings.jsx` (reference ProjectModal.jsx)
6. Create `JobApplicationsView.jsx`
7. Create `CompanyProfileCompletion.jsx` (reference ProfileCompletionBar.jsx)

### Phase 5: Create Frontend Pages
1. Reference `StudentProfile.jsx` → Create `CompanyProfile.jsx`
2. Create `CompanyDashboard.jsx`
3. Create `ManageJobs.jsx`

### Phase 6: Integration
1. Update `server.js` to include company routes
2. Update main app routing
3. Test all endpoints
4. Test all frontend components

---

## 📋 FILE SIZE REFERENCE

Approximate line counts for reference:
- StudentProfile.js: ~650 lines
- StudentProfileController.js: ~630 lines
- BasicInfoForm.jsx: ~420 lines
- SkillsForm.jsx: ~280 lines
- PortfolioLinksForm.jsx: ~380 lines
- StudentProfile.jsx: ~360 lines
- studentProfileApi.js: ~215 lines

**Expected for Company**:
- Company.js: ~700 lines (more complex with jobs)
- CompanyProfileController.js: ~500 lines
- CompanyJobController.js: ~300 lines
- CompanyBasicInfoForm.jsx: ~450 lines
- Total codebase: ~3500-4000 lines

---

## ✅ QUICK REFERENCE CHECKLIST

### Backend Files to Create:
- [ ] models/Company.js
- [ ] models/CompanyJob.js
- [ ] models/CompanyApplication.js
- [ ] controllers/company/CompanyProfileController.js
- [ ] controllers/company/CompanyJobController.js
- [ ] middleware/company/roleMiddleware.js
- [ ] middleware/company/validationMiddleware.js
- [ ] middleware/company/uploadMiddleware.js
- [ ] middleware/company/isVerified.js
- [ ] routes/companyRoutes.js
- [ ] utils/company/sendResponse.js (copy from student)
- [ ] utils/company/uploadToCloudinary.js (copy from student)
- [ ] utils/company/validateCompanyData.js
- [ ] utils/company/checkLinkedInProfile.js

### Frontend Files to Create:
- [ ] apis/companyProfileApi.js
- [ ] components/companyComponent/CompanyBasicInfoForm.jsx
- [ ] components/companyComponent/CompanyDetailsForm.jsx
- [ ] components/companyComponent/CompanyLinksForm.jsx
- [ ] components/companyComponent/CompanyDocumentsUpload.jsx
- [ ] components/companyComponent/CompanyJobPostings.jsx
- [ ] components/companyComponent/JobApplicationsView.jsx
- [ ] components/companyComponent/CompanyProfileCompletion.jsx
- [ ] pages/company/CompanyProfile.jsx
- [ ] pages/company/CompanyDashboard.jsx
- [ ] pages/company/ManageJobs.jsx

---

**Master Prompt Status**: ✅ Ready
**Reference Files**: ✅ All Mapped
**Implementation Guide**: ✅ Complete
**Date**: November 20, 2025
