# SERIBRO Phase 2.1 - Quick Start Guide

**For running and testing the complete Student Profile System**

---

## Prerequisites Checklist

- [ ] Node.js installed
- [ ] MongoDB running
- [ ] Backend dependencies installed
- [ ] Frontend dependencies installed
- [ ] VS Code or editor ready

---

## 1. Start Backend (Terminal 1)

```powershell
# Navigate to backend
cd d:\seribro\phase -1\seribro-backend

# Install dependencies (first time only)
npm install

# Start server
npm start

# Expected output:
# Server running on port 7000
# DB Connected
```

---

## 2. Start Frontend (Terminal 2)

```powershell
# Navigate to frontend
cd d:\seribro\phase -1\seribro-frontend\client

# Install dependencies (first time only)
npm install

# Start development server
npm run dev

# Expected output:
# ➜  Local:   http://localhost:5173/
```

---

## 3. Access Application

Open browser and navigate to:
```
http://localhost:5173
```

---

## 4. Complete Workflow

### Step 1: Signup
```
URL: http://localhost:5173/signup
Fill:
- Name: Test Student
- Email: test.student@example.com
- Password: Test@123
- Role: student
Click: Sign Up
```

### Step 2: Dashboard
```
After signup, redirects to:
http://localhost:5173/student/dashboard

Verify:
- Profile completion: 0%
- Status: Incomplete
- Project count: 0/3
```

### Step 3: Student Profile
```
Click: Complete Profile button

You're now on:
http://localhost:5173/student/profile

Tab navigation visible:
- 👤 Basic Info
- 🎯 Skills
- 📁 Projects
- 📄 Documents
- ✓ Verification
```

### Step 4: Fill All Sections

**Tab 1: Basic Info**
- Click "Basic Info" tab
- Fill form fields (name, college, degree, etc.)
- Click "Save"
- Verify completion % increases

**Tab 2: Skills**
- Click "Skills" tab
- Add technical skills (React, Node.js, MongoDB)
- Add soft skills (Communication, Teamwork)
- Click "Save"

**Tab 3: Projects**
- Click "Projects" tab
- Click "+ Add Project"
- Fill project form:
  - Title: "My Project"
  - Description: "Project details"
  - Technologies: "React,Node.js"
  - Link: "https://github.com/..."
- Click "Add"
- Repeat until 3+ projects added

**Tab 4: Documents**
- Click "Documents" tab
- Upload Resume (PDF, < 5MB)
- Upload College ID (Image, < 5MB)
- Upload Certificate (PDF/Image, < 5MB)

**Tab 5: Verification**
- Click "Verification" tab
- Verify all checkmarks green ✓
- Click "Submit for Verification"
- Success message appears

### Step 5: Verify Results

Return to Dashboard:
```
URL: http://localhost:5173/student/dashboard

Verify:
- Profile completion: 100%
- Status: Pending
- Project count: 3+
- All stats updated
```

---

## 5. Testing All Features

### Test API Endpoints
Open Browser Console (F12):

```javascript
// Check JWT token
localStorage.getItem('jwtToken')

// Test fetch profile
fetch('http://localhost:7000/api/student/profile', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
}).then(r => r.json()).then(d => console.log(d))

// Test all endpoints
const test = async () => {
    const token = localStorage.getItem('jwtToken');
    const endpoints = [
        '/profile',
        '/dashboard',
        '/profile/basic',
        '/profile/skills',
        '/profile/tech'
    ];
    
    for (let ep of endpoints) {
        const res = await fetch(`http://localhost:7000/api/student${ep}`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        console.log(`${ep}: ${res.status}`);
    }
};
test();
```

### Check Network Requests
1. Open DevTools (F12)
2. Go to "Network" tab
3. Perform actions (click buttons, fill forms)
4. Verify API calls show in Network tab
5. Check Response tab for JSON data

### Test Mobile Responsiveness
1. DevTools → Toggle device toolbar (Ctrl+Shift+M)
2. Select device (iPhone 12)
3. Verify layout adapts
4. Test with multiple screen sizes

---

## 6. Common Issues & Fixes

### Backend won't start
```
Error: Cannot find module
Fix: cd d:\seribro\phase -1\seribro-backend && npm install
```

### Frontend won't start
```
Error: Cannot find module
Fix: cd d:\seribro\phase -1\seribro-frontend\client && npm install
```

### 404 errors on API calls
```
Error: Cannot POST /api/student/...
Fix: Verify backend is running (npm start in backend terminal)
     Verify baseURL in studentProfileApi.js = http://localhost:7000/api/student
```

### 401 Unauthorized
```
Error: Invalid or missing JWT token
Fix: Re-login to get new token
     Check localStorage.getItem('jwtToken')
```

### File upload fails
```
Error: Request failed
Fix: Check file size < 5MB
     Check file format (PDF for resume, JPG/PNG for ID)
     Check /uploads folder has write permissions
```

### Profile not loading
```
Error: Cannot read property 'map' of undefined
Fix: Check API response in Network tab
     Verify backend database is connected
     Check MongoDB is running
```

---

## 7. File Locations Reference

```
Backend:
- Routes: d:\seribro\phase -1\seribro-backend\backend\routes\studentProfileRoute.js
- Controller: d:\seribro\phase -1\seribro-backend\backend\controllers\StudentProfileController.js
- Models: d:\seribro\phase -1\seribro-backend\backend\models\StudentProfile.js
- Utils: d:\seribro\phase -1\seribro-backend\backend\utils\students\

Frontend:
- Dashboard: d:\seribro\phase -1\seribro-frontend\client\src\pages\Dashboard.jsx
- Profile: d:\seribro\phase -1\seribro-frontend\client\src\pages\students\StudentProfile.jsx
- API: d:\seribro\phase -1\seribro-frontend\client\src\apis\studentProfileApi.js
- Components: d:\seribro\phase -1\seribro-frontend\client\src\components\studentComponent\

Documentation:
- Testing Guide: d:\seribro\phase -1\TESTING_GUIDE_PHASE2.1.md
- Implementation Summary: d:\seribro\phase -1\FRONTEND_IMPLEMENTATION_SUMMARY.md
```

---

## 8. Key Information

### API Base URL
```
http://localhost:7000/api/student
```

### Frontend Base URL
```
http://localhost:5173
```

### Default Credentials (for testing)
```
Email: test.student@example.com
Password: Test@123
```

### All 12 API Endpoints
```
1. GET /profile - Fetch/create profile
2. GET /dashboard - Dashboard data
3. PUT /profile/basic - Update basic info
4. PUT /profile/skills - Update skills
5. PUT /profile/tech - Update tech stack
6. POST /profile/projects - Add project
7. PUT /profile/projects/:id - Update project
8. DELETE /profile/projects/:id - Delete project
9. POST /profile/resume - Upload resume
10. POST /profile/college-id - Upload college ID
11. POST /profile/certificates - Upload certificates
12. POST /profile/submit-verification - Submit for review
```

### Theme Colors (CSS)
```
Navy (Primary): #001a4d
Gold (Accent): #fbbf24
White (Text): white
Transparent Cards: white/10 to white/20
```

---

## 9. Testing Checklist (Quick Version)

- [ ] Backend starts without errors
- [ ] Frontend starts without errors
- [ ] Can signup with new email
- [ ] Dashboard shows after login
- [ ] Dashboard shows 0% completion
- [ ] Can navigate to StudentProfile
- [ ] Can fill Basic Info and save
- [ ] Can add skills and save
- [ ] Can add 3+ projects
- [ ] Can upload documents
- [ ] Can submit for verification
- [ ] Dashboard shows 100% completion after submit
- [ ] No console errors (F12)
- [ ] Mobile responsive (Ctrl+Shift+M)
- [ ] Styling matches Home.jsx colors

---

## 10. Performance Tips

### Frontend Optimization
- Clear cache: `Ctrl+Shift+Delete`
- DevTools → Network → Throttle to simulate slow network
- Check page load: Should be < 2 seconds

### Backend Optimization
- Monitor logs for slow queries
- Check database indexes: `db.studentprofiles.getIndexes()`
- Monitor memory: `node --max-old-space-size=4096 server.js`

### Browser Tools
- DevTools (F12) → Performance tab
- DevTools → Network tab
- DevTools → Console tab (for logs)

---

## 11. Debug Mode

### Enable Verbose Logging

**Frontend (Browser Console):**
```javascript
// Enable detailed API logs
window.DEBUG = true;

// See all localStorage data
console.table(Object.entries(localStorage))

// Watch network requests
fetch('http://localhost:7000/api/student/profile', {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
}).then(r => {
    console.log('Status:', r.status);
    console.log('Headers:', r.headers);
    return r.json();
}).then(d => console.log('Data:', d))
```

**Backend (Terminal):**
```
Add console.log statements in:
- studentProfileRoute.js
- StudentProfileController.js
- Middleware files
```

---

## 12. Data Model Reference

### Basic Info Fields
```
firstName, lastName, phone, collegeName, degree, 
department, graduationYear, location
```

### Skills Arrays
```
technical: 20 max
soft: 10 max
languages: 10 max
primarySkills: 3 max
```

### Project Fields
```
title, description, technologies, role, duration,
link, isLive, screenshot
```

### Document Types
```
resume: PDF (5MB max)
collegeId: Image/PDF (5MB max)
certificates: Multiple PDF/Image (5MB max each)
```

---

## 13. Deployment Checklist (When Ready)

- [ ] All 12 APIs tested
- [ ] Frontend styling verified
- [ ] Error handling tested
- [ ] File uploads tested
- [ ] Mobile responsive verified
- [ ] Performance optimized
- [ ] Security: CORS configured
- [ ] Security: JWT validated
- [ ] Database backups scheduled
- [ ] Monitoring set up
- [ ] Documentation complete

---

## 14. Support Documentation

**For detailed testing:** Open `TESTING_GUIDE_PHASE2.1.md`

**For architecture overview:** Open `FRONTEND_IMPLEMENTATION_SUMMARY.md`

**For backend structure:** Open `BACKEND_STRUCTURE.md`

**For student profile:** Open `2.1studentprofileReadME.md`

---

## 15. Summary (2 Minutes)

1. Start backend: `npm start` in backend folder
2. Start frontend: `npm run dev` in frontend/client
3. Open: `http://localhost:5173`
4. Signup with test email
5. Fill all profile sections
6. Submit for verification
7. Verify Dashboard updates
8. Open console (F12) and test APIs

**Total time to test:** ~10 minutes

---

## Quick Commands Reference

```powershell
# Start backend
cd d:\seribro\phase -1\seribro-backend; npm start

# Start frontend  
cd d:\seribro\phase -1\seribro-frontend\client; npm run dev

# Install dependencies (if needed)
npm install

# Clear npm cache
npm cache clean --force

# Kill process on port 7000
netstat -ano | findstr :7000
taskkill /PID <PID> /F

# Clear browser cache
# Chrome: Ctrl+Shift+Delete
# Firefox: Ctrl+Shift+Delete
```

---

**Status:** ✅ READY TO TEST

**Start testing:** Follow steps 1-4 above

