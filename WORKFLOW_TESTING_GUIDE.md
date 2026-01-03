# SERIBRO Workflow Testing Guide - Quick Reference

## Complete End-to-End Workflow Test

Follow these steps in order to verify all three issues have been fixed:

---

## 1️⃣ APPLICATION APPROVAL & PAYMENT WORKFLOW

### Step 1.1: Student Application
- [ ] Login as Student
- [ ] Navigate to `/browse-projects` or `/student/browse-projects`
- [ ] Find a project posted by a company
- [ ] Click on project
- [ ] Fill out application form with cover letter and proposed price
- [ ] Click "Apply" or "Submit Application"
- [ ] Verify: "Application submitted successfully" toast appears

### Step 1.2: Company Application Review (ApplicationDetails Page)
- [ ] Login as the Company that posted the project
- [ ] Navigate to `/company/applications`
- [ ] Find the application from the student
- [ ] Click on the application to open details page
- [ ] Verify: "Accept Application", "Shortlist", "Send Message" buttons are present
- [ ] Click "Accept Application"
- [ ] Verify: Confirmation dialog appears asking to confirm
- [ ] Click "OK"
- [ ] Verify: Success toast: "Student approved successfully! Navigating to payment..."
- [ ] Page should automatically redirect to payment page

### Step 1.3: Payment Page (Main Fix #1)
- [ ] After redirect, you should see Payment page at `/payment/:projectId`
- [ ] **Verify: Payment page loads without errors** ✓ (FIX #1)
- [ ] **Verify: Project details display:**
  - [ ] Project Title
  - [ ] Budget Amount (should show correctly)
  - [ ] Assigned Student name
  - [ ] Payment Status: "Pending"
- [ ] **Verify: Payment Summary shows:**
  - [ ] Project Name
  - [ ] Student Name
  - [ ] Base Amount
  - [ ] Platform Fee breakdown
  - [ ] Total Amount
- [ ] **Verify: Test Mode Banner appears** (if using test API key)
- [ ] **Verify: Pay button shows correct amount**
- [ ] Click "Pay ₹[amount]" button
- [ ] Razorpay checkout modal should open
- [ ] **Test Payment:**
  - Card: 4111 1111 1111 1111
  - Expiry: Any future date (e.g., 12/25)
  - CVV: Any 3 digits (e.g., 123)
  - Name: Any name
- [ ] Click Pay
- [ ] Verify: "Payment successful! Redirecting..." appears
- [ ] Page should redirect to project workspace
- [ ] **Database Check**: Payment status should be 'captured' in MongoDB Payment collection

---

## 2️⃣ PROJECT WORKSPACE & MESSAGING WORKFLOW

### Step 2.1: Project Workspace
- [ ] You should now be in the workspace at `/workspace/projects/:projectId`
- [ ] **Verify: Project details load correctly**
- [ ] **Verify: Message Board is visible and empty**

### Step 2.2: Message Board - Send First Message (Main Fix #2)
- [ ] In Message Board, type a test message: "Hello, testing message board"
- [ ] Click "Send" button
- [ ] **Verify: Message appears immediately in the board** (optimistic message) ✓ (FIX #2)
- [ ] **Verify: No white screen error occurs** ✓ (FIX #2)
- [ ] **Verify: Success toast: "Message sent" appears**
- [ ] Wait a moment for server response
- [ ] **Verify: Message is still visible (replaced with server version)**
- [ ] Check browser console: no errors should appear

### Step 2.3: Message Board - Test File Attachment
- [ ] Click paperclip icon to attach file
- [ ] Select a file (PDF, image, or Word doc under 5MB)
- [ ] Type message: "Here is my file"
- [ ] Click "Send"
- [ ] **Verify: Message with attachment appears**
- [ ] **Verify: File link is clickable in the message**
- [ ] Try uploading a file > 5MB
- [ ] **Verify: Error message: "exceeds 5MB" appears**

### Step 2.4: Switch to Other User's Perspective
- [ ] Open a new incognito/private window
- [ ] Login as the other user (student if you were company, or vice versa)
- [ ] Navigate to the same project workspace
- [ ] **Verify: The message you sent appears in their view**
- [ ] Type a response message
- [ ] Click "Send"
- [ ] **Verify: Message appears in both windows** (via Socket.io or polling)

---

## 3️⃣ START WORK WORKFLOW

### Step 3.1: Student Starts Work (Main Fix #3)
- [ ] Switch back to Student's window
- [ ] Ensure you're viewing the project workspace
- [ ] Verify: Project status shows "assigned"
- [ ] **Verify: "Start Work" button is visible** (only visible to student)
- [ ] Click "Start Work" button
- [ ] **Verify: Confirmation dialog appears:** "Start work on this project? This will change the project status to In Progress."
- [ ] Click "OK"
- [ ] **Verify: "Start Work" button becomes disabled (visual feedback)** ✓ (FIX #3)
- [ ] **Verify: Success toast: "Work started successfully" appears** ✓ (FIX #3)
- [ ] **Verify: Page updates automatically WITHOUT manual refresh** ✓ (FIX #3)
- [ ] **Verify: Project status changes from "assigned" to "in-progress"**
- [ ] **Verify: "Submit Work" button appears** (only appears when status is in-progress)
- [ ] **Verify: No page freeze or lag** ✓ (FIX #3)

### Step 3.2: Database Verification
- [ ] Open MongoDB Compass or terminal
- [ ] Query Project collection:
  ```
  db.projects.findOne({ _id: ObjectId("your-project-id") })
  ```
- [ ] **Verify: status field is "in-progress"**
- [ ] **Verify: startedAt field contains current timestamp**
- [ ] **Verify: workStarted field is true**

---

## 4️⃣ WORK SUBMISSION WORKFLOW (Optional - Full Workflow)

### Step 4.1: Student Submits Work
- [ ] Click "Submit Work" button (now visible after starting work)
- [ ] You should navigate to `/workspace/projects/:projectId/submit`
- [ ] Upload work files
- [ ] Add submission notes
- [ ] Click "Submit"
- [ ] **Verify: Success toast appears**
- [ ] Navigate back to workspace
- [ ] **Verify: Status changes to "under-review"**

### Step 4.2: Company Reviews Submission
- [ ] Switch to Company's view
- [ ] **Verify: "Review Submission" button appears**
- [ ] Click it
- [ ] You should navigate to `/workspace/projects/:projectId/review`
- [ ] Review the submitted files
- [ ] Either "Approve" or "Request Revision"
- [ ] **Verify: Status updates accordingly**

### Step 4.3: Complete Project
- [ ] If approved, status should change to "completed"
- [ ] **Verify: "Rate Project" button appears for both users**
- [ ] Click "Rate Project" button
- [ ] Add rating (1-5 stars) and review
- [ ] Click "Submit Rating"
- [ ] **Verify: Rating is saved**

---

## Error Scenarios to Test

### Scenario A: Network Error During Message Send
- [ ] Open browser DevTools (F12)
- [ ] Go to Network tab
- [ ] Throttle to "Slow 3G"
- [ ] Send a message
- [ ] **Verify: Message appears optimistically immediately**
- [ ] After delay, **verify: Message is replaced with server version**

### Scenario B: Invalid Payment Amount
- [ ] Manually modify project budgetMax to 0 (for testing)
- [ ] Try to access payment page
- [ ] **Verify: Error toast: "Invalid payment amount" appears**
- [ ] Reset budgetMax to correct value

### Scenario C: Server Error on Start Work
- [ ] Manually make the API endpoint return 500 error (for testing)
- [ ] Click "Start Work"
- [ ] **Verify: Error toast appears with error message**
- [ ] **Verify: Project status remains "assigned"**
- [ ] **Verify: No page freeze**

### Scenario D: Missing Project Data
- [ ] Try to access payment page with invalid projectId
- [ ] **Verify: Error toast appears**
- [ ] **Verify: Back button is available**
- [ ] **Verify: No white screen error**

---

## Browser Console Checks

After completing each section, check browser console for errors:

```javascript
// Should NOT see:
- Uncaught Error
- Uncaught ReferenceError
- Cannot read property 'xxx' of undefined
- Failed to fetch

// SHOULD see:
- Network requests completing successfully
- Socket.io connection logs (if debugging enabled)
- No 4xx or 5xx status codes in Network tab
```

---

## Performance Checklist

- [ ] Message board loads within 2 seconds
- [ ] Payment page loads within 2 seconds
- [ ] Start Work API call completes within 3 seconds
- [ ] Page transitions are smooth (no jank)
- [ ] No memory leaks (check DevTools Performance tab)
- [ ] Razorpay script loads within 5 seconds

---

## Final Verification

### All Issues Fixed ✓
- [ ] **FIX #1 (Payment Page)**: Page loads, fetches correct data, displays amounts properly
- [ ] **FIX #2 (Message Board)**: Messages send without white screen error, proper error handling
- [ ] **FIX #3 (Start Work)**: Page updates immediately without freeze, status changes reflected

### Workflow Completeness ✓
- [ ] Application → Approval → Payment → Project Workspace → Messaging → Start Work → Submit Work → Review → Rating
- [ ] All transitions are smooth
- [ ] All notifications appear
- [ ] All status changes are reflected immediately

### User Experience ✓
- [ ] All error messages are clear and helpful
- [ ] Loading states provide visual feedback
- [ ] Success messages confirm actions
- [ ] No unexpected page refreshes required
- [ ] Navigation works correctly throughout flow

---

## Rollback Instructions (if needed)

If any issue occurs:
1. Identify which file has the issue
2. Reference the git commit hash
3. Revert only the problematic file
4. Test the specific workflow again

All changes are backward compatible and can be reverted individually.

---

## Support Commands

### Clear Browser Cache
```bash
# Clear localStorage
localStorage.clear()

# Clear sessionStorage  
sessionStorage.clear()

# Or: Ctrl+Shift+Delete (Windows) / Cmd+Shift+Delete (Mac)
```

### Check API Endpoints
```bash
# From terminal, test payment creation:
curl -X POST http://localhost:7000/api/payments/create-order \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"projectId":"YOUR_PROJECT_ID"}'

# Test workspace overview:
curl -X GET http://localhost:7000/api/workspace/projects/YOUR_PROJECT_ID \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Database Queries
```javascript
// Check payment status
db.payments.findOne({ project: ObjectId("projectId") })

// Check project status
db.projects.findOne({ _id: ObjectId("projectId") }, { status: 1, startedAt: 1 })

// Check messages
db.messages.find({ project: ObjectId("projectId") }).sort({ createdAt: -1 }).limit(10)
```

