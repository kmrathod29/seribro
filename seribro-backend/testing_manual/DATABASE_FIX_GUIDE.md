# Database Reset & Testing Guide

If you're getting "Student record not found" error, follow these steps:

## Option 1: Fresh Start (Recommended)

### Step 1: Clear Database
```powershell
# In MongoDB or via MongoDB Compass:
# 1. Delete all documents from: users, students, studentprofiles, otps
# 2. Or drop the entire database and start fresh

# Via MongoDB CLI:
mongo
use seribro
db.users.deleteMany({})
db.students.deleteMany({})
db.studentprofiles.deleteMany({})
db.otps.deleteMany({})
exit
```

### Step 2: Restart Backend
```powershell
cd d:\seribro\phase -1\seribro-backend
npm start
# Wait for "Server running on port 7000"
# Wait for "DB Connected"
```

### Step 3: Fresh Signup
1. Open: `http://localhost:5173`
2. Go to Signup
3. Fill form:
   - Name: "Test Student"
   - Email: "test@example.com"
   - Password: "Test@123"
   - Role: "student"
4. Click "Sign Up"

### Step 4: Login
1. Go to Login
2. Email: "test@example.com"
3. Password: "Test@123"
4. Click "Login"

### Step 5: Verify Profile Page Loads
1. Should redirect to Dashboard
2. Click "Complete Profile"
3. Should now see StudentProfile page with tabs (no error)

---

## Option 2: If Still Getting Error

The issue is likely that:

1. **Student record not created during signup**
   - Check Backend Console for errors during signup
   - Look for "Student registration error" messages

2. **Student record created but not found**
   - Check if collegeId file upload succeeded
   - Database might have incomplete Student document

### Quick Fix:
```javascript
// In MongoDB, verify Student records exist
db.students.find().pretty()
// Should show at least 1 student with user reference

// Verify User records exist
db.users.find().pretty()
// Should show at least 1 user with role: "student"
```

---

## Option 3: Manual Database Insert (Debug Only)

If nothing works, manually create records:

```javascript
// In MongoDB shell or Compass:

// 1. Create User
db.users.insertOne({
  email: "test@example.com",
  password: "$2b$10$...", // Hashed password
  role: "student",
  emailVerified: true,
  createdAt: new Date()
})

// Get the _id from above result
let userId = ObjectId("..."); // Replace with actual ID

// 2. Create Student
db.students.insertOne({
  user: userId,
  fullName: "Test Student",
  college: "Test College",
  skills: ["React", "Node.js"],
  collegeId: "",
  createdAt: new Date()
})

// 3. Create StudentProfile
db.studentprofiles.insertOne({
  student: ObjectId("..."), // Student _id from step 2
  user: userId,
  basicInfo: {
    fullName: "Test Student",
    email: "test@example.com",
    phone: "",
    collegeName: "Test College",
    degree: "",
    graduationYear: null
  },
  skills: {
    technical: ["React", "Node.js"],
    soft: [],
    languages: [],
    primarySkills: []
  },
  techStack: [],
  projects: [],
  documents: {
    resume: {},
    collegeId: {},
    certificates: []
  },
  links: {
    github: "",
    linkedin: "",
    portfolio: ""
  },
  profileStats: {
    profileCompletion: 0
  },
  verification: {
    status: "incomplete"
  },
  createdAt: new Date()
})
```

---

## Changes Made to Fix This Issue

### 1. Updated authMiddleware.js
- Now fetches `Student` record when user is a student
- Attaches `req.student` to request
- Sets `req.user.studentId` for controllers to use

### 2. Updated StudentProfileController.js
- Fixed `getStudentId()` to use `req.user.studentId` first

### 3. Updated Student.js Model
- Made `collegeId` optional (default: '')
- Can now be uploaded later in profile completion

---

## Testing Checklist After Fix

- [ ] Backend starts without errors
- [ ] Can signup with all fields
- [ ] Can login successfully
- [ ] Dashboard loads without errors
- [ ] Dashboard shows profile stats
- [ ] Can click "Complete Profile"
- [ ] StudentProfile page loads without error
- [ ] Can see all tabs (Basic Info, Skills, Projects, Documents, Verification)
- [ ] Can fill Basic Info and save
- [ ] Profile completion percentage updates

---

## Still Having Issues?

Check these in order:

1. **Backend logs**: Look for error messages during signup/login
   ```
   npm start
   # Watch for errors like:
   # ❌ Error in getProfile
   # Student registration error
   ```

2. **MongoDB connection**: Verify database is running
   ```powershell
   # Check if MongoDB is running
   mongosh
   # Should connect successfully
   ```

3. **Network tab**: In browser DevTools (F12)
   - Check response from `/api/student/profile`
   - Should show profile JSON (not error message)

4. **Console logs**: Run this in browser console
   ```javascript
   // Check JWT token
   console.log(localStorage.getItem('jwtToken'))
   
   // Check User data
   fetch('http://localhost:7000/api/student/profile', {
     headers: { 'Authorization': `Bearer ${localStorage.getItem('jwtToken')}` }
   }).then(r => {
     console.log('Status:', r.status);
     return r.json();
   }).then(d => console.log('Response:', d))
   ```

---

## Common Causes & Solutions

| Error | Cause | Solution |
|-------|-------|----------|
| "Student record not found" | Student not created during signup | Redo signup, check backend logs |
| "Cannot read property '_id'" | Student document incomplete | Delete and create fresh Student |
| "Authentication data missing" | JWT token invalid/expired | Re-login to get new token |
| "Profile lookup failed" | Database connection issue | Verify MongoDB running |
| File upload failed | Path issues | Check `/uploads` folder exists |

---

## After Testing, Remember

Once you get past the "Student record not found" error:

1. You'll see StudentProfile page with all tabs
2. Fill each tab and save
3. Profile completion percentage will increase
4. Submit for verification when 100% complete
5. Dashboard will update with new status

Good luck! Let me know if you hit any other errors.
