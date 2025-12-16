# Company Profile Frontend Implementation - Complete Setup Guide

## Overview
A complete React + Tailwind CSS frontend for company profile management that matches the student profile setup theme and styling.

## Project Structure

### API Integration (`src/apis/companyProfileApi.js`)
- **fetchCompanyProfile()** - Fetch company profile data
- **fetchCompanyDashboard()** - Get dashboard overview
- **initializeCompanyProfile()** - Auto-create profile if not exists
- **updateCompanyBasicInfo()** - Update company name, mobile, website
- **updateCompanyDetails()** - Update industry, size, address, GST
- **updateAuthorizedPerson()** - Update authorized person info
- **uploadCompanyLogo()** - Upload company logo to Cloudinary
- **uploadCompanyDocuments()** - Upload supporting documents
- **submitCompanyForVerification()** - Submit profile for verification

### Components (`src/components/companyComponent/`)

1. **ProfileCompletionBar.jsx**
   - Displays profile completion percentage
   - Shows verification status badge
   - Visual progress indicator with color coding
   - Status types: Draft, Pending, Approved, Rejected

2. **BasicInfoForm.jsx**
   - Company name input
   - Mobile number (10 digits)
   - Website URL
   - Email (read-only, auto-populated)
   - Real-time validation
   - Success/error messaging

3. **DetailsForm.jsx**
   - Industry type dropdown (11 options)
   - Company size dropdown (5 options)
   - Office address (street, city, state, postal)
   - About company (textarea, max 500 chars)
   - GST number validation
   - GST format: 27ABCPA1234H1Z0

4. **AuthorizedPersonForm.jsx**
   - Full name
   - Designation
   - Email address
   - LinkedIn profile URL
   - Email uniqueness validation

5. **LogoUpload.jsx**
   - Drag & drop or click to upload
   - Image preview
   - File size limit: 5MB
   - Supported formats: PNG, JPG, GIF
   - Real-time preview

6. **DocumentUpload.jsx**
   - Multi-file upload
   - File size limit: 10MB per file
   - Supported formats: PDF, DOC, DOCX, JPG, PNG
   - Document list with download links
   - Delete document functionality

### Pages (`src/pages/company/`)

1. **CompanyProfile.jsx**
   - Main profile management page
   - Tab-based navigation system
   - 6 tabs: Basic Info, Details, Authorized Person, Logo, Documents, Verification
   - Auto-initializes profile if not created
   - Profile completion tracking
   - Submit for verification button
   - Responsive layout

2. **CompanyDashboard.jsx**
   - Dashboard overview page
   - Quick stats cards
   - Profile completion percentage
   - Verification status display
   - Company information display
   - Logo preview
   - Quick navigation to all profile sections
   - Status-based styling

## Features

### Auto-Initialization
- If company profile doesn't exist in database, it's automatically created
- Empty template with default values:
  - Default city: Bhavnagar
  - Default state: Gujarat
  - Email auto-populated from user account

### Theme & Styling
- **Consistent with Student Profile**:
  - Navy gradient background
  - Gold/Yellow accent colors
  - White/translucent cards with border
  - Lucide icons throughout
  - Responsive design
  - Smooth transitions and animations

### Data Validation
- **Company Name**: Min 2 characters
- **Mobile**: Exactly 10 digits
- **Website**: Valid URL format
- **Industry Type**: Dropdown selection (required)
- **Company Size**: Dropdown selection (required)
- **Authorized Person Email**: Unique, valid format
- **GST Number**: Indian GST format validation
- **Documents**: File type and size validation

### Error Handling
- Graceful error messages
- Auto-retry with initialization
- User-friendly error displays
- Loading states on all async operations

## API Endpoints Used

```
POST   /api/company/profile/init              - Initialize profile
GET    /api/company/dashboard                 - Get dashboard data
GET    /api/company/profile                   - Get profile
PUT    /api/company/profile/basic             - Update basic info
PUT    /api/company/profile/details           - Update details
PUT    /api/company/profile/person            - Update authorized person
POST   /api/company/profile/logo              - Upload logo
POST   /api/company/profile/documents         - Upload documents
POST   /api/company/profile/submit-verification - Submit for verification
```

## Navigation Routes

Added to `src/App.jsx`:
```
/company/dashboard    - Company dashboard page
/company/profile      - Company profile management
```

## Backend Changes

### Controller Updates (`companyProfileController.js`)
- Added `initializeCompanyProfile()` function
- Updated `getCompanyProfile()` to auto-create profile if missing
- Both functions handle missing profiles gracefully

### Route Updates (`companyProfileRoutes.js`)
- Added `POST /profile/init` endpoint
- Maintained all existing endpoints

## Usage Flow

1. **First Time Login**:
   - User logs in as company
   - Navigates to `/company/dashboard` or `/company/profile`
   - Profile is automatically initialized if not exists
   - User sees empty form templates

2. **Profile Completion**:
   - User fills in one section at a time
   - Each update recalculates completion percentage
   - Profile completion tracked in real-time

3. **Verification**:
   - Once profile is 100% complete
   - User can submit for verification
   - Status changes to "Pending"
   - Admin reviews and approves/rejects

4. **Document Upload**:
   - Supports multiple document types
   - Uploaded to Cloudinary
   - Can be downloaded from profile

## File Organization

```
src/
├── apis/
│   └── companyProfileApi.js          (NEW)
├── components/companyComponent/
│   ├── ProfileCompletionBar.jsx       (NEW)
│   ├── BasicInfoForm.jsx              (NEW)
│   ├── DetailsForm.jsx                (NEW)
│   ├── AuthorizedPersonForm.jsx       (NEW)
│   ├── LogoUpload.jsx                 (NEW)
│   └── DocumentUpload.jsx             (NEW)
├── pages/company/
│   ├── CompanyProfile.jsx             (NEW)
│   └── CompanyDashboard.jsx           (NEW)
└── App.jsx                            (UPDATED)

backend/
├── controllers/
│   └── companyProfileController.js    (UPDATED)
└── routes/
    └── companyProfileRoutes.js        (UPDATED)
```

## Testing Checklist

- [ ] Company user can access dashboard
- [ ] Profile auto-initializes on first access
- [ ] Basic info form saves correctly
- [ ] Details form validates all fields
- [ ] Authorized person form validates email uniqueness
- [ ] Logo upload shows preview
- [ ] Documents can be uploaded and downloaded
- [ ] Profile completion percentage updates
- [ ] Submit for verification works
- [ ] Tab navigation works smoothly
- [ ] Responsive design on mobile
- [ ] Error messages display correctly
- [ ] All API endpoints working properly

## Notes

- All components follow the student profile styling and theme
- No student-related files were modified
- Backend changes are backward compatible
- Profile auto-initialization prevents 404 errors
- All forms include client-side validation before API calls
- File uploads handled via FormData with Cloudinary
- Auto-retry mechanism for profile initialization
