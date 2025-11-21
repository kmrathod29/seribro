# SERIBRO Phase 2.1 - Frontend-Backend Integration Testing Guide

**Purpose:** Complete manual testing guide for Student Profile Management system with step-by-step instructions.

**Prerequisites:**
- Backend running on `http://localhost:7000`
- Frontend running on `http://localhost:5173` (Vite default)
- MongoDB connected and running
- Valid JWT token from authentication

---

## Part 1: Environment Setup & Prerequisites

### Step 1.1: Verify Backend is Running
```bash
# Terminal 1: Start backend
cd d:\seribro\phase -1\seribro-backend
npm start
# Expected output: "Server running on port 7000"
```

### Step 1.2: Verify Frontend is Running
```bash
# Terminal 2: Start frontend
cd d:\seribro\phase -1\seribro-frontend\client
npm run dev
# Expected output: "Local: http://localhost:5173"
```

### Step 1.3: Test API Connection
Open DevTools Console (F12) and run:
```javascript
// Check if API is reachable
fetch('http://localhost:7000/api/student/profile', {
    headers: {
        'Authorization': `Bearer ${localStorage.getItem('jwtToken')}`
    }
}).then(r => r.json()).then(d => console.log(d))
```
**Expected:** Profile data or 401 error (if not logged in)

---

## Part 2: Authentication Testing (Prerequisite)

### Test 2.1: Signup New User
1. Navigate to: `http://localhost:5173/signup`
2. Fill form:
   - Name: "Test Student"
   - Email: "test.student@example.com"
   - Password: "Test@123"
   - Role: "student"
3. Click "Sign Up"
4. **Verify:** JWT token appears in localStorage
   ```javascript
   console.log(localStorage.getItem('jwtToken'))
   ```

### Test 2.2: Login
1. Navigate to: `http://localhost:5173/login`
2. Fill form:
   - Email: "test.student@example.com"
   - Password: "Test@123"
3. Click "Login"
4. **Verify:** Redirects to Dashboard with profile data

---

## Part 3: Dashboard Testing

### Test 3.1: Dashboard Load
1. After login, you should see Dashboard automatically
2. **Verify elements:**
   - Profile completion percentage (starts at 0%)
   - Status badge (should show "Incomplete")
   - Project count (0/3)
   - Verification status (Unverified)
   - Quick stats cards with icons
   - Navigation buttons to Profile page

### Test 3.2: Dashboard Error Handling
1. Clear localStorage: `localStorage.clear()`
2. Manually navigate to: `http://localhost:5173/student/dashboard`
3. **Verify:** Redirects to login page or shows error

### Test 3.3: Dashboard Styling
1. **Check visual elements:**
   - Navy gradient background ✓
   - Gold accent text ✓
   - Glass morphism cards (semi-transparent) ✓
   - Lucide icons display properly ✓
   - Smooth hover effects ✓
   - Responsive on mobile ✓

---

## Part 4: Student Profile - Basic Info Testing

### Test 4.1: Navigate to Profile
1. From Dashboard, click "Complete Profile" or "Go to Profile"
2. Should land on StudentProfile page with tab navigation
3. Click "Basic Info" tab

### Test 4.2: Fill Basic Information
Form fields to fill:
```
First Name: "John"
Last Name: "Doe"
Phone Number: "+919876543210"
College Name: "IIT Delhi"
Degree: "B.Tech"
Department: "Computer Science"
Graduation Year: "2025"
Location: "Delhi, India"
```

1. Fill all fields
2. Click "Save" or submit button
3. **Verify in Console:**
   ```javascript
   console.log('Check Network tab: PUT /api/student/profile/basic')
   ```
4. **Expected Response:**
   ```json
   {
     "success": true,
     "message": "Basic information updated successfully"
   }
   ```

### Test 4.3: Verify Data Persistence
1. Refresh page (F5)
2. Click "Basic Info" tab
3. **Verify:** All fields still contain saved data

### Test 4.4: Validation Testing
1. Clear "First Name" field
2. Try to save
3. **Expected:** Error message shows "First Name is required"

### Test 4.5: Profile Completion Update
1. After saving, check completion percentage
2. **Expected:** Should increase (basicInfo = 25% weight)

---

## Part 5: Student Profile - Skills Testing

### Test 5.1: Navigate to Skills Tab
1. Click "Skills" tab in StudentProfile

### Test 5.2: Add Technical Skills
1. Add technical skills:
   - React
   - Node.js
   - MongoDB
   - Tailwind CSS
   - JavaScript
2. Click "Add" or "Save"
3. **Verify in Network tab:** POST/PUT to `/api/student/profile/skills`

### Test 5.3: Add Soft Skills
1. Add soft skills:
   - Communication
   - Problem Solving
   - Teamwork
   - Leadership
2. Save

### Test 5.4: Add Languages
1. Add languages:
   - English
   - Hindi
2. Save

### Test 5.5: Set Primary Skills
1. Select 3 primary skills from technical
2. **Verify:** Can only select max 3

### Test 5.6: Tech Stack Selection
1. Select framework: "MERN"
2. Select databases: "MongoDB", "PostgreSQL"
3. Save
4. **Verify:** Reflects in profile stats

### Test 5.7: Skills Validation
1. Try adding more than 20 technical skills
2. **Expected:** Warning or error: "Maximum 20 technical skills allowed"

---

## Part 6: Student Profile - Projects Testing

### Test 6.1: Navigate to Projects Tab
1. Click "Projects" tab in StudentProfile
2. Click "+ Add Project" button

### Test 6.2: Add First Project
Fill form:
```
Title: "E-Commerce Platform"
Description: "Full-stack MERN e-commerce app with payment integration"
Technologies: "React,Node.js,MongoDB,Stripe"
Role: "Full Stack Developer"
Duration: "3 months"
Start Date: "2024-01-01"
End Date: "2024-03-31"
Project Link: "https://github.com/username/ecommerce"
Is Live: Yes
Live Link: "https://ecommerce.example.com"
```
1. Click "Save Project"
2. **Verify in Console:**
   ```
   Network tab: POST /api/student/profile/projects
   Response: 201 Created with project ID
   ```

### Test 6.3: Add Second Project
Repeat Test 6.2 with different project:
```
Title: "Social Media App"
Description: "Real-time social media platform with WebSocket"
Technologies: "React,Express,Socket.io,MongoDB"
Role: "Backend Developer"
```

### Test 6.4: Add Third Project
Repeat to have minimum 3 projects required

### Test 6.5: Try Adding 6th Project
After adding 5 projects:
1. Click "+ Add Project"
2. Fill form
3. Click "Save"
4. **Expected Error:** "Maximum 5 projects allowed"

### Test 6.6: Edit Project
1. Click "Edit" on first project
2. Change title: "E-Commerce Platform v2"
3. Click "Update"
4. **Verify:** Changes appear in list

### Test 6.7: Delete Project (After 3+ added)
1. Click "Delete" on a project
2. Confirm deletion
3. **Verify:** Project removed from list
4. **Verify:** If less than 3 projects now, completion % decreases

### Test 6.8: Projects Impact on Completion
1. After adding 3+ projects:
2. **Expected:** Completion increases (projects = 30% weight)

---

## Part 7: Student Profile - Documents Testing

### Test 7.1: Navigate to Documents Tab
1. Click "Documents" tab in StudentProfile

### Test 7.2: Upload Resume
1. Click "Upload Resume"
2. Select a PDF file (max 5MB)
   - Can use sample PDF from `testing_manual/` folder
3. **Verify in Console:**
   ```
   Network tab: POST /api/student/profile/resume
   Status: 200 OK
   Response includes: url, uploadedAt
   ```
4. **Expected in UI:**
   - File name displayed
   - Upload success message
   - Download link appears

### Test 7.3: Upload College ID
1. Click "Upload College ID"
2. Select image (JPG/PNG, max 5MB)
3. **Verify:** Same as 7.2
4. **Expected:** Image preview appears

### Test 7.4: Upload Multiple Certificates
1. Click "Add Certificate"
2. Upload first certificate (PDF/Image)
3. Click "Add Certificate" again
4. Upload second certificate
5. **Expected:** Both listed in UI

### Test 7.5: Replace Existing Document
1. Click "Replace" on Resume
2. Select new PDF
3. **Verify:** Old file replaced, new one shown

### Test 7.6: Delete Certificate
1. Click "Delete" on a certificate
2. Confirm deletion
3. **Verify:** Certificate removed from list

### Test 7.7: Document Validation
1. Try uploading non-PDF as Resume
2. **Expected Error:** "Resume must be PDF format"
3. Try uploading file > 5MB
4. **Expected Error:** "File size must be less than 5MB"

### Test 7.8: Documents Impact on Completion
1. After uploading resume and college ID:
2. **Expected:** Completion increases (documents = 30% weight combined)

---

## Part 8: Profile Verification Testing

### Test 8.1: Navigate to Verification Tab
1. Click "Verification" tab in StudentProfile

### Test 8.2: Check Requirements Checklist
**Verify all show green checkmarks:**
- ✓ Profile 100% Complete
- ✓ At least 3 projects
- ✓ Resume uploaded
- ✓ College ID uploaded

### Test 8.3: Submit for Verification
1. Ensure all requirements met (100% completion)
2. Click "Submit for Verification" button
3. **Verify in Console:**
   ```
   Network tab: POST /api/student/profile/submit-verification
   Response: { success: true, message: "..." }
   ```
4. **Expected UI:**
   - Success message shows
   - Button becomes disabled
   - Status updates to "Pending"

### Test 8.4: Attempt Submit Without Completion
1. Navigate to Basic Info tab
2. Delete first name to make profile incomplete
3. Go back to Verification tab
4. **Expected:** "Submit for Verification" button disabled
5. **Tooltip:** "Profile must be 100% complete"

### Test 8.5: Attempt Re-submit After Pending
1. Verification status shows "Pending"
2. Try clicking "Submit for Verification"
3. **Expected:** Button disabled or error: "Already submitted for verification"

---

## Part 9: End-to-End Workflow Testing

### Test 9.1: Complete User Journey
```
1. Signup → 2. Dashboard → 3. Profile Page →
4. Fill All Sections → 5. Submit Verification →
6. See Success Message
```

**Step-by-step:**
1. Login/Signup
2. Click "Go to Dashboard"
3. Verify stats show 0%
4. Click "Complete Profile"
5. Fill Basic Info → Save → Verify % increases
6. Fill Skills → Save → Verify % increases
7. Add 3+ Projects → Save → Verify % increases
8. Upload Documents → Verify % increases to 100%
9. Go to Verification → Click Submit
10. **Expected:** Success message, status = "Pending"

### Test 9.2: Cross-Tab Navigation
1. Fill Basic Info → Save
2. Go to Skills tab → Add skills → Save
3. Go back to Basic Info → Verify data still there
4. Go to Projects tab → Add projects
5. **Verify:** All previous data persists

---

## Part 10: Error Handling & Edge Cases

### Test 10.1: Network Error Handling
1. Stop backend server
2. Try to load Profile page
3. **Expected:**
   - Error message displays
   - "Try Again" button appears
   - No crash

### Test 10.2: Unauthorized Access
1. Logout (clear localStorage)
2. Manually go to: `http://localhost:5173/student/profile`
3. **Expected:** Redirect to login

### Test 10.3: Form Submission While Loading
1. Fill Basic Info form
2. Click Save
3. Immediately click Save again before request completes
4. **Expected:** Second click ignored or queued

### Test 10.4: Large File Upload
1. Try uploading 10MB PDF (if test file available)
2. **Expected:** Error: "File must be less than 5MB"

### Test 10.5: Session Timeout
1. Wait 30 minutes without activity
2. Try to save form
3. **Expected:** 401 error, redirect to login

---

## Part 11: Performance & Styling Testing

### Test 11.1: Page Load Time
1. Open DevTools (F12) → Network tab
2. Load StudentProfile page
3. **Expected:** Initial load < 2 seconds

### Test 11.2: Responsive Design
1. Open StudentProfile on Desktop (1920x1080)
2. **Verify:** All elements properly spaced
3. Resize to Tablet (768x1024)
4. **Verify:** Cards stack properly
5. Resize to Mobile (375x667)
6. **Verify:** Mobile navigation shows, text readable

### Test 11.3: Theme Consistency
1. Compare StudentProfile with Dashboard
2. **Verify:** Same colors:
   - Navy background
   - Gold accents
   - White/transparent text
   - Same icon style (Lucide)
3. **Verify:** Similar card styling (glass morphism)

### Test 11.4: Animation Performance
1. Open DevTools → Performance tab
2. Load StudentProfile
3. **Expected:** Smooth animations, no jank
4. **Note:** Should see "fade-in-up", "animate-blob" effects

### Test 11.5: Accessibility
1. Test keyboard navigation (Tab key)
2. **Verify:** Can reach all form fields
3. Test with screen reader (if available)

---

## Part 12: API Endpoint Verification Checklist

| # | Endpoint | Method | Expected Status | Test Date |
|---|----------|--------|-----------------|-----------|
| 1 | `/api/student/profile` | GET | 200 | ☐ |
| 2 | `/api/student/profile/basic` | PUT | 200 | ☐ |
| 3 | `/api/student/profile/skills` | PUT | 200 | ☐ |
| 4 | `/api/student/profile/tech` | PUT | 200 | ☐ |
| 5 | `/api/student/profile/projects` | POST | 201 | ☐ |
| 6 | `/api/student/profile/projects/:id` | PUT | 200 | ☐ |
| 7 | `/api/student/profile/projects/:id` | DELETE | 200 | ☐ |
| 8 | `/api/student/profile/resume` | POST | 200 | ☐ |
| 9 | `/api/student/profile/college-id` | POST | 200 | ☐ |
| 10 | `/api/student/profile/certificates` | POST | 200 | ☐ |
| 11 | `/api/student/dashboard` | GET | 200 | ☐ |
| 12 | `/api/student/profile/submit-verification` | POST | 200 | ☐ |

---

## Part 13: Console Log Checklist

**What to look for in Console (F12):**

✓ No red errors on page load
✓ No "404 Not Found" errors
✓ No "CORS" errors
✓ JWT token visible in localStorage
✓ API requests show in Network tab
✓ Responses have proper JSON format

**Common errors to fix:**
- `Cannot read property 'map' of undefined` → Check API response
- `401 Unauthorized` → Token expired, re-login
- `CORS error` → Check backend CORS headers
- `Network error` → Backend not running

---

## Part 14: Testing Checklist Summary

```
AUTHENTICATION
☐ Signup works
☐ Login works
☐ JWT token stored

DASHBOARD
☐ Loads after login
☐ Shows initial stats (0% completion)
☐ Styling matches Home.jsx

BASIC INFO
☐ Can add/edit all fields
☐ Validates required fields
☐ Persists after refresh
☐ Updates completion %

SKILLS
☐ Can add technical skills
☐ Can add soft skills
☐ Can add languages
☐ Can select primary skills
☐ Max limits enforced

PROJECTS
☐ Can add project (minimum 3)
☐ Can edit project
☐ Can delete project (if > 3)
☐ Cannot add > 5 projects
☐ All projects show in list

DOCUMENTS
☐ Can upload resume (PDF)
☐ Can upload college ID (image)
☐ Can upload certificates
☐ File validation works
☐ Can replace files
☐ Can delete files

VERIFICATION
☐ Shows requirements checklist
☐ All checkmarks when ready
☐ Can submit when 100% complete
☐ Cannot submit when incomplete
☐ Success message on submit
☐ Status updates to "Pending"

STYLING
☐ Navy gradient background
☐ Gold accents on buttons
☐ Glass morphism cards
☐ Lucide icons display
☐ Hover effects smooth
☐ Mobile responsive

ERROR HANDLING
☐ Network error shows message
☐ Validation errors display
☐ 401 redirects to login
☐ File size errors show
☐ Format validation works
```

---

## Part 15: Troubleshooting Common Issues

### Issue: "Cannot find module 'studentProfileApi'"
**Solution:** Check file path in import:
```javascript
// Correct:
import { fetchProfile } from '../../apis/studentProfileApi';
```

### Issue: JWT token not persisting
**Solution:** Check localStorage:
```javascript
localStorage.getItem('jwtToken') // Should return token string
```

### Issue: Profile not loading
**Solution:** Check backend:
```bash
# In backend terminal
console.log('Check if MongoDB is connected')
npm start
# Look for: "DB Connected" message
```

### Issue: File upload fails
**Solution:** Check file requirements:
- Resume: PDF only, < 5MB
- College ID: JPG/PNG, < 5MB
- Certificates: PDF or JPG/PNG, < 5MB

### Issue: Completion % not updating
**Solution:** Refresh page and check:
```javascript
// In console:
fetch('http://localhost:7000/api/student/profile', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
}).then(r => r.json()).then(d => console.log(d.profileStats))
```

---

## Part 16: Quick Test Commands (Browser Console)

```javascript
// Check JWT token
localStorage.getItem('jwtToken')

// Fetch full profile
fetch('http://localhost:7000/api/student/profile', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
}).then(r => r.json()).then(d => console.log(d))

// Check all endpoints working
const endpoints = [
    '/profile', '/dashboard', '/profile/basic', '/profile/skills'
];
endpoints.forEach(ep => {
    fetch(`http://localhost:7000/api/student${ep}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
    }).then(r => console.log(`${ep}: ${r.status}`))
});

// Clear all data and start fresh
localStorage.removeItem('jwtToken');
sessionStorage.clear();
console.log('Cleared - please login again')
```

---

## Part 17: Success Criteria

**Testing is COMPLETE when:**
1. ✅ All 12 API endpoints respond correctly
2. ✅ Profile completion updates accurately
3. ✅ All form validations work
4. ✅ File uploads succeed with proper validation
5. ✅ Verification submission works
6. ✅ Styling matches Home.jsx
7. ✅ No console errors
8. ✅ Mobile responsive
9. ✅ Error handling shows user-friendly messages
10. ✅ All data persists after refresh

---

**Created:** Phase 2.1 Testing
**Last Updated:** 2024
**Status:** Ready for Testing

