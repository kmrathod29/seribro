# Phase 3 Quick Testing & Verification Guide

## Pre-Testing Checklist

### Backend Setup
- [ ] MongoDB is running and contains the Seribro database
- [ ] Admin user exists with email: `admin@seribro.com` and role: `admin`
  - If not, create via MongoDB Compass or CLI
- [ ] Backend server running on `http://localhost:7000`
- [ ] All backend routes are working (check Postman or browser console)

### Frontend Setup
- [ ] Frontend running on `http://localhost:5173`
- [ ] All dependencies installed (`npm install` completed)
- [ ] No console errors on page load

---

## Step-by-Step Testing Flow

### Phase 1: Admin Login & Access Verification Panel

```
STEP 1: Login as Admin
├─ Go to http://localhost:5173/login
├─ Email: admin@seribro.com
├─ Password: Admin@123
└─ Click Login

EXPECTED: Redirects to /admin/dashboard

STEP 2: Navigate to Verification Panel
├─ Go to http://localhost:5173/admin/verification
└─ OR Click link from admin dashboard
  
EXPECTED: 
├─ Page loads with 2 tabs (Students, Companies)
├─ Shows stats cards with pending counts
└─ Lists appear with columns (Name, Email, College/Industry, %, Date, Actions)
```

### Phase 2: Student Profile Verification Flow

```
STEP 1: Create Test Student Profile (if not exists)
├─ Logout from admin
├─ Go to http://localhost:5173/signup
├─ Select role: Student
├─ Create account: student@test.com / Student@123
└─ Fill 50%+ of profile and submit for verification

STEP 2: Login as Admin & Review Student
├─ Login as admin
├─ Go to /admin/verification
├─ Students tab should show the pending student
├─ Click blue "View Profile" button
  
EXPECTED:
├─ Modal opens with student profile
├─ Shows all basic info, skills, documents
├─ Can scroll and see projects
└─ Close modal returns to list

STEP 3: Test Reject Flow
├─ Click red X button on student row
├─ Rejection modal appears
├─ Type rejection reason (at least 10 chars)
├─ Click "Reject" button
  
EXPECTED:
├─ Toast shows: "Student rejected. Notification sent! ❌"
├─ List refreshes automatically
├─ Student disappears from pending list
├─ Audit log created in database

STEP 4: Verify Student Gets Notification
├─ Logout from admin
├─ Login as the student (student@test.com)
├─ Go to /student/dashboard
├─ Wait 5-10 seconds for auto-refresh
  
EXPECTED:
├─ Verification status banner shows: "rejected"
├─ Banner color is red/danger
├─ Rejection reason might appear (check design)
└─ Can resubmit after fixing issues
```

### Phase 3: Company Profile Verification Flow

```
STEP 1: Create Test Company Profile (if not exists)
├─ Logout from admin
├─ Go to http://localhost:5173/signup
├─ Select role: Company
├─ Create account: company@test.com / Company@123
└─ Fill 50%+ of profile and submit for verification

STEP 2: Login as Admin & Approve Company
├─ Login as admin
├─ Go to /admin/verification
├─ Click Companies tab
├─ Company should appear in pending list
├─ Click green checkmark button

EXPECTED:
├─ Approval modal appears
├─ Modal shows confirmation message
├─ No reason field (only for rejections)
├─ Click "Approve" button

RESULT:
├─ Toast shows: "Company approved successfully! ✅"
├─ List refreshes automatically
├─ Company disappears from pending list
├─ Email sent to company email

STEP 3: Verify Company Gets Notification
├─ Logout from admin
├─ Login as company (company@test.com)
├─ Go to /company/dashboard
├─ Wait 5-10 seconds for auto-refresh
  
EXPECTED:
├─ Verification status badge shows: "approved" or "verified"
├─ Badge color is green
├─ Profile completion shows updated %
└─ Can now access restricted features
```

### Phase 4: Document Viewer Testing

```
STEP 1: View PDF Document
├─ Go to /admin/verification
├─ Click "View Profile" on any student
├─ Scroll down to Documents section
├─ Click on Resume document
  
EXPECTED:
├─ DocumentViewer modal opens
├─ PDF displays with toolbar
├─ Can scroll through PDF
├─ Download button works

STEP 2: View Image Document
├─ Same as above but click College ID
├─ Click Eye icon next to College ID
  
EXPECTED:
├─ Modal opens with centered image
├─ Image is responsive
├─ Download button functional
└─ Close button works
```

### Phase 5: Auto-Refresh Testing

```
STEP 1: Test Student Dashboard Auto-Refresh
├─ Login as student with pending profile
├─ Go to /student/dashboard
├─ Note the verification status (should be "pending")
├─ Open second browser window/tab
├─ In second window: Login as admin
├─ Go to /admin/verification
├─ Find the student and click Approve
└─ Watch the first window (student dashboard)

EXPECTED (after ~30 seconds):
├─ Student dashboard refreshes automatically
├─ Status badge changes from "pending" to "approved"
├─ No manual refresh required
├─ Animation/transition is smooth

STEP 2: Test Company Dashboard Auto-Refresh
├─ Same as above but with company
├─ Should work identically
```

### Phase 6: Error Handling Testing

```
STEP 1: Test Rejection Without Reason
├─ Go to /admin/verification
├─ Click red X button on any profile
├─ Leave reason field empty
├─ Try to click "Reject" button
  
EXPECTED:
├─ Button is disabled (grayed out)
├─ Cannot click it
├─ Tooltip or error message appears

STEP 2: Test Long Rejection Reason
├─ Open rejection modal
├─ Paste text with 500+ characters
  
EXPECTED:
├─ Text field stops accepting after 500 chars
├─ Character counter shows: "500/500"
└─ Reason is truncated

STEP 3: Test Network Error
├─ Open DevTools (F12) → Network tab
├─ Check "Offline" or "Throttle" to simulate slow/no network
├─ Try to approve/reject a profile
  
EXPECTED:
├─ Error toast appears: "Failed to approve/reject"
├─ List doesn't break
├─ Can retry when network is back
```

### Phase 7: UI Consistency Testing

```
STEP 1: Check Colors Match Theme
├─ Navy background (#0f2e3d): ✓
├─ Gold accents (#ffc107): ✓
├─ White text on navy: ✓
├─ Modals have border: ✓
└─ Icons are lucide-react: ✓

STEP 2: Check Responsive Design
├─ Desktop (1920px): All columns visible
├─ Tablet (768px): Columns might stack
├─ Mobile (375px): Table scrolls horizontally
└─ Modals are centered and readable

STEP 3: Check Accessibility
├─ All buttons have hover states
├─ All buttons have title/tooltip
├─ Text has good contrast
├─ Modals can be closed with Escape
└─ Focus management works
```

---

## Expected Test Results

### ✅ Success Criteria

| Test | Expected Result | Status |
|------|-----------------|--------|
| Admin can access verification panel | Page loads with tabs | ✓ |
| Pending lists show correct data | Students & companies appear | ✓ |
| View profile button works | Modal opens with all data | ✓ |
| Approve works | Profile approved, email sent | ✓ |
| Reject works | Profile rejected, reason saved | ✓ |
| Dashboard auto-refreshes | Status updates within 30 sec | ✓ |
| Document viewer works | PDFs and images display | ✓ |
| Theme is consistent | Colors and fonts match | ✓ |
| No errors in console | Console is clean | ✓ |
| No breaking changes | Login, profile, etc. still work | ✓ |

---

## Common Issues & Quick Fixes

### Issue: Admin Can't Access Verification Panel
```
Error: "Unauthorized (admin only)"

SOLUTION:
1. Check admin user exists: db.users.find({ role: 'admin' })
2. Check token is valid: Logout and login again
3. Check middleware in backend: adminOnly.js file
```

### Issue: Pending Lists Are Empty
```
No pending profiles showing

SOLUTION:
1. Create test student/company account
2. Fill 50%+ of profile
3. Submit for verification
4. Check database: db.studentprofiles.find({ verificationStatus: 'pending' })
```

### Issue: Documents Won't Display
```
Document viewer shows error

SOLUTION:
1. Check document URL is valid and accessible
2. Check file format is supported (PDF, JPG, PNG)
3. Check CORS settings if using external storage
4. Check browser console for specific error
```

### Issue: Auto-Refresh Not Working
```
Dashboard doesn't update automatically

SOLUTION:
1. Check browser console for errors
2. Check network requests (should see API call every 30 sec)
3. Check if API returns correct data
4. Try refreshing page manually (Ctrl+R)
```

### Issue: Emails Not Sent
```
Users don't receive approval/rejection emails

SOLUTION:
1. Check nodemailer config in backend
2. Check email in DB is valid
3. Check spam/junk folder
4. Check backend logs for send errors
```

---

## Performance Testing

### Loading Times
- [ ] Admin Verification page loads in < 2 seconds
- [ ] Profile preview modal opens in < 1 second
- [ ] Document viewer loads in < 3 seconds (for PDFs)
- [ ] List refresh takes < 1 second

### Data Volume
- [ ] With 100 pending profiles: Page still responsive
- [ ] With 1000 pending profiles: Consider pagination (future enhancement)

### Network Requests
- [ ] Initial page load: ~3-5 API calls
- [ ] Auto-refresh: 1 API call every 30 seconds
- [ ] Approve/reject: 1 API call, returns within 2 seconds

---

## Security Testing

### Authorization
- [ ] Non-admin users cannot access /admin/verification
- [ ] Non-admin users get redirected to login
- [ ] Student cannot approve/reject profiles
- [ ] Company cannot access admin panel

### Data Validation
- [ ] Rejection reason is sanitized (no XSS)
- [ ] Profile IDs are validated (no SQL injection)
- [ ] Email addresses are validated
- [ ] No sensitive data in error messages

### Audit Logging
- [ ] Every approve/reject creates audit log
- [ ] Audit log contains: admin ID, action, timestamp, reason
- [ ] Audit log is not editable/deletable

---

## Final Verification Checklist

Before declaring Phase 3 complete, verify:

- [ ] All 10 files created/modified successfully
- [ ] No console errors or warnings (except CORS which is OK)
- [ ] Admin can approve profiles
- [ ] Admin can reject profiles with reasons
- [ ] Students/Companies notified of approval/rejection
- [ ] Dashboards auto-refresh every 30 seconds
- [ ] Documents can be viewed in modals
- [ ] All UI matches existing theme
- [ ] No Phase 1/2 features broken
- [ ] Test data cleaned up (optional)

---

## 🚀 Phase 3 is COMPLETE when all tests pass!

Save this document for future reference and troubleshooting.
