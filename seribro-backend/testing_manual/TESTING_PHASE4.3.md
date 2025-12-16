# Phase 4.3 Testing Guide: Company Application Management

## 📋 Overview
This document provides comprehensive testing instructions for Phase 4.3 - Company-side application review and management system.

---

## 🚀 Prerequisites

### Backend Requirements
- Server running on `http://localhost:7000`
- MongoDB database connected
- All dependencies installed: `npm install`

### Frontend Requirements
- Frontend running on `http://localhost:5173` (Vite)
- Node modules installed: `npm install`

### Test Data Required
1. At least one company account with 100% profile completion
2. At least 3-5 projects posted by the company
3. At least 5-10 student applications on these projects

---

## ✅ API Testing

### 1. Get Application Statistics
**Endpoint:** `GET /api/company/applications/stats`

**Test Steps:**
1. Login as company user
2. Open browser DevTools → Network tab
3. Send request with auth token

**Expected Response:**
```json
{
  "success": true,
  "message": "Application stats fetched",
  "data": {
    "total": 10,
    "pending": 5,
    "shortlisted": 2,
    "accepted": 1,
    "rejected": 2,
    "newToday": 2
  }
}
```

**Verification:**
- ✅ All status values are numbers
- ✅ Total = pending + shortlisted + accepted + rejected
- ✅ newToday is accurate (today's applications)

---

### 2. Get All Company Applications
**Endpoint:** `GET /api/company/applications/all?page=1&limit=20&status=all&projectId=all`

**Test Steps:**
1. Test with different status filters: `all`, `pending`, `shortlisted`, `accepted`, `rejected`
2. Test with specific projectId
3. Test pagination: `page=1`, `page=2`, etc.
4. Test limit: `limit=10`, `limit=50`

**Expected Response:**
```json
{
  "success": true,
  "message": "All applications fetched",
  "data": {
    "applications": [
      {
        "_id": "...",
        "studentName": "John Doe",
        "studentEmail": "john@example.com",
        "studentSkills": ["React", "Node.js"],
        "skillMatch": 85,
        "status": "pending",
        "proposedPrice": 15000,
        "appliedAt": "2024-01-15T10:30:00Z"
      }
    ],
    "total": 10,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

**Verification:**
- ✅ Correct pagination (total/pages calculation)
- ✅ Applications filtered by status
- ✅ Applications filtered by projectId
- ✅ Skill match percentage calculated correctly
- ✅ Student data is populated (name, email, skills)

---

### 3. Get Application Details
**Endpoint:** `GET /api/company/applications/:applicationId`

**Test Steps:**
1. Copy an application ID from previous response
2. Send GET request with that ID

**Expected Response:**
```json
{
  "success": true,
  "message": "Application details fetched",
  "data": {
    "_id": "...",
    "studentName": "John Doe",
    "studentEmail": "john@example.com",
    "studentCollege": "MIT",
    "studentSkills": ["React", "Node.js", "MongoDB"],
    "studentPhoto": "URL",
    "studentResume": "URL",
    "coverLetter": "I am interested in this project...",
    "proposedPrice": 15000,
    "estimatedTime": "2 weeks",
    "status": "pending",
    "skillMatch": 85,
    "appliedAt": "2024-01-15T10:30:00Z",
    "companyViewedAt": "2024-01-16T09:00:00Z"
  }
}
```

**Verification:**
- ✅ `companyViewedAt` updated to current timestamp (if first view)
- ✅ Full student profile data populated
- ✅ Cover letter displayed
- ✅ Resume URL accessible
- ✅ Skill match calculated

---

### 4. Shortlist Application
**Endpoint:** `POST /api/company/applications/:applicationId/shortlist`

**Test Steps:**
1. Get a pending application ID
2. Send POST request

**Expected Response:**
```json
{
  "success": true,
  "message": "Application shortlisted successfully",
  "data": {
    "_id": "...",
    "status": "shortlisted",
    "shortlistedAt": "2024-01-16T10:30:00Z"
  }
}
```

**Verification:**
- ✅ Status changed to "shortlisted"
- ✅ `shortlistedAt` timestamp set
- ✅ Student receives notification
- ✅ Cannot shortlist if status ≠ pending

---

### 5. Reject Application
**Endpoint:** `POST /api/company/applications/:applicationId/reject`

**Request Body:**
```json
{
  "rejectionReason": "Skills don't match our project requirements. We need more experience with backend development."
}
```

**Test Cases:**

**Case A: Valid Rejection**
- Rejection reason: 10-500 characters ✅
- Expected: Application rejected, notification sent

**Case B: Reason Too Short**
- Reason: "Bad fit" (6 chars)
- Expected: 400 error - "must be at least 10 characters"

**Case C: Reason Too Long**
- Reason: > 500 characters
- Expected: 400 error - "cannot exceed 500 characters"

**Case D: Missing Reason**
- No `rejectionReason` in body
- Expected: 400 error - "Rejection reason zaroori hai"

**Expected Response (Valid):**
```json
{
  "success": true,
  "message": "Application rejected successfully",
  "data": {
    "_id": "...",
    "status": "rejected",
    "rejectionReason": "Skills don't match our project requirements. We need more experience with backend development.",
    "rejectedAt": "2024-01-16T10:30:00Z"
  }
}
```

---

### 6. Accept Application (CRITICAL - Transaction Test)
**Endpoint:** `POST /api/company/applications/:applicationId/accept`

**Test Setup:**
- Create 5 pending applications on same project
- Accept the first one

**Expected Behavior:**
1. First application: status → "accepted", `acceptedAt` set
2. Project: status → "assigned", `assignedStudent` set
3. Other 4 applications: auto-rejected
4. All students notified

**Verification Steps:**

**Step 1: Before Accept**
```bash
GET /api/company/applications/all?projectId=PROJECT_ID&status=pending
# Should show 5 pending applications
```

**Step 2: Accept First Application**
```bash
POST /api/company/applications/APP_ID_1/accept
```

**Step 3: Check Application Status**
```bash
GET /api/company/applications/all?projectId=PROJECT_ID
# Response should show:
# - 1 accepted
# - 4 rejected (with auto-rejection reason)
# - 0 pending
```

**Step 4: Check Project Status**
```bash
GET /api/company/projects/PROJECT_ID
# Project status should be "assigned"
```

**Step 5: Check Notifications**
- Login as first student → should see acceptance notification
- Login as other students → should see rejection notifications

**Expected Response:**
```json
{
  "success": true,
  "message": "Application accepted and others rejected",
  "data": {
    "application": {
      "_id": "...",
      "status": "accepted",
      "acceptedAt": "2024-01-16T10:30:00Z"
    },
    "rejectedCount": 4
  }
}
```

---

### 7. Bulk Reject Applications
**Endpoint:** `POST /api/company/applications/bulk-reject`

**Request Body:**
```json
{
  "applicationIds": ["ID1", "ID2", "ID3"],
  "rejectionReason": "We have selected other candidates who better match our requirements."
}
```

**Test Steps:**
1. Get 3-4 pending application IDs
2. Send POST request with array of IDs

**Expected Response:**
```json
{
  "success": true,
  "message": "3 applications rejected",
  "data": {
    "rejectedCount": 3
  }
}
```

**Verification:**
- ✅ All applications status changed to "rejected"
- ✅ All students notified
- ✅ Only pending/shortlisted applications rejected
- ✅ Already accepted/rejected applications unaffected

---

### 8. Get Project Applications
**Endpoint:** `GET /api/company/applications/projects/:projectId/applications?status=all&page=1&limit=20`

**Test Steps:**
1. Get a specific project ID
2. Send GET request

**Expected Response:**
```json
{
  "success": true,
  "message": "Applications fetched successfully",
  "data": {
    "applications": [
      {
        "_id": "...",
        "studentName": "John",
        "status": "pending",
        "skillMatch": 85,
        "proposedPrice": 15000
      }
    ],
    "total": 5,
    "page": 1,
    "limit": 20,
    "pages": 1
  }
}
```

---

## 🎨 Frontend Testing

### 1. CompanyApplications Page
**URL:** `http://localhost:5173/company/applications`

**Test Steps:**

1. **Page Load**
   - [ ] Stats cards display correctly
   - [ ] Applications list loads
   - [ ] Filters visible and functional
   - [ ] No console errors

2. **Stats Cards**
   - [ ] Total count matches API
   - [ ] Status breakdown accurate
   - [ ] "New Today" count correct
   - [ ] Icons and colors display

3. **Filter by Project**
   - [ ] Dropdown shows all projects
   - [ ] Filtering by project works
   - [ ] Applications update on change
   - [ ] Page resets to 1 on filter change

4. **Filter by Status**
   - [ ] All status options available: pending, shortlisted, accepted, rejected
   - [ ] Filtering works correctly
   - [ ] Applications count matches

5. **Pagination**
   - [ ] Previous/Next buttons work
   - [ ] Page indicator accurate
   - [ ] Correct applications displayed per page
   - [ ] Items per page selector works (10, 20, 50, 100)

---

### 2. ApplicationCard Component
**Test Steps:**

1. **Display Information**
   - [ ] Student name displayed
   - [ ] Student email shown
   - [ ] College/university shown
   - [ ] Status badge visible with correct color
   - [ ] Applied date shown
   - [ ] Proposed price shown
   - [ ] Est. time shown
   - [ ] Skills tags displayed

2. **Skill Match**
   - [ ] Skill match percentage visible (0-100%)
   - [ ] Progress bar fills correctly
   - [ ] Color changes with percentage (red < 40%, orange 40-60%, yellow 60-80%, green > 80%)

3. **Action Buttons (Pending)**
   - [ ] "View Details" button visible
   - [ ] "⭐" (Shortlist) button visible and clickable
   - [ ] "✅" (Accept) button visible and clickable
   - [ ] "❌" (Reject) button visible and clickable

4. **Action Buttons (Shortlisted)**
   - [ ] "View Details" visible
   - [ ] "Accept" button visible
   - [ ] "Reject" button visible
   - [ ] Shortlist button NOT visible

5. **Action Buttons (Accepted/Rejected)**
   - [ ] Only "View Details" visible
   - [ ] Action buttons disabled/hidden

---

### 3. StudentProfileModal
**Test Steps:**

1. **Open Modal**
   - [ ] Click "View Details" on any application card
   - [ ] Modal opens smoothly

2. **Student Information**
   - [ ] Student photo displayed (if available)
   - [ ] Student name shown
   - [ ] Email displayed
   - [ ] College displayed
   - [ ] Skills section shows all skills
   - [ ] Skills count shown (+X more if > 4)

3. **Application Details**
   - [ ] Applied date shown
   - [ ] Proposed price displayed
   - [ ] Est. timeline shown
   - [ ] Skill match % shown
   - [ ] Status badge visible

4. **Cover Letter**
   - [ ] Displayed in full
   - [ ] Properly formatted
   - [ ] Scrollable if long

5. **Resume**
   - [ ] Resume link/button visible (if available)
   - [ ] Download button works
   - [ ] Opens in new tab

6. **Action Buttons**
   - [ ] For pending: Shortlist, Accept, Reject buttons visible
   - [ ] For shortlisted: Accept, Reject buttons visible
   - [ ] Buttons are functional

7. **Close Modal**
   - [ ] X button closes modal
   - [ ] Close button closes modal
   - [ ] Modal closes on outside click (optional)

---

### 4. AcceptApplicationModal
**Test Steps:**

1. **Open Modal**
   - [ ] Click "Accept" button on pending/shortlisted application
   - [ ] Modal opens

2. **Content Display**
   - [ ] Student name shown
   - [ ] Application summary visible:
     - Proposed price
     - Est. timeline
     - Skill match %
   - [ ] Warning message displayed about auto-rejection
   - [ ] Confirmation checkbox present

3. **Confirmation Checkbox**
   - [ ] Initially unchecked
   - [ ] Cannot confirm without checking
   - [ ] Accept button disabled until checked

4. **Accept Button**
   - [ ] Disabled state: grayed out
   - [ ] Click confirms action
   - [ ] Shows "Accepting..." while processing
   - [ ] Modal closes on success

5. **Cancel Button**
   - [ ] Closes modal without action
   - [ ] Modal state resets

6. **Validation**
   - [ ] Cannot submit without confirmation
   - [ ] Success message displays
   - [ ] Application list refreshes
   - [ ] Stats update

---

### 5. RejectApplicationModal
**Test Steps:**

1. **Open Modal**
   - [ ] Click "Reject" button on application
   - [ ] Modal opens

2. **Form Display**
   - [ ] Student name shown
   - [ ] Rejection reason textarea visible
   - [ ] Character count shown (0/500)
   - [ ] Placeholder text helpful

3. **Input Validation**
   - [ ] Too short (< 10 chars): Error message
   - [ ] Too long (> 500 chars): Error message
   - [ ] Empty: Error message
   - [ ] Valid (10-500 chars): Accepted

4. **Character Counter**
   - [ ] Updates in real-time
   - [ ] Shows X/500 format
   - [ ] Color changes when approaching limit

5. **Submit**
   - [ ] Button disabled if validation fails
   - [ ] Shows "Rejecting..." while processing
   - [ ] Modal closes on success

6. **Information Message**
   - [ ] Shows that student will be notified
   - [ ] Reason will be included in notification

---

### 6. ApplicationStatsCards
**Test Steps:**

1. **Card Display**
   - [ ] 6 stat cards visible:
     - Total Applications
     - Pending
     - Shortlisted
     - Accepted
     - Rejected
     - New Today

2. **Card Styling**
   - [ ] Each card has unique color scheme
   - [ ] Icons displayed correctly
   - [ ] Status colors match design:
     - Pending: Orange
     - Shortlisted: Blue
     - Accepted: Green
     - Rejected: Red

3. **Data Accuracy**
   - [ ] Numbers match API response
   - [ ] Total = sum of all statuses
   - [ ] New Today accurate for current date
   - [ ] Updates when applications change

4. **Responsive**
   - [ ] Single column on mobile
   - [ ] 2 columns on tablet
   - [ ] 3 columns on desktop

---

## 🔄 User Flow Testing

### Complete User Journey: Company

1. **Login & Navigate**
   - [ ] Login as company
   - [ ] Click "Applications" in navbar
   - [ ] Redirect to /company/applications

2. **View Dashboard**
   - [ ] Stats cards load
   - [ ] Applications list visible
   - [ ] Filters functional

3. **Filter Applications**
   - [ ] Filter by project
   - [ ] Filter by status (pending, shortlisted, accepted, rejected)
   - [ ] Change items per page
   - [ ] Navigate pages

4. **View Application**
   - [ ] Click "View Details"
   - [ ] Modal opens with full info
   - [ ] Close modal

5. **Shortlist Application**
   - [ ] Click shortlist on pending app
   - [ ] Confirm action
   - [ ] Status changes to shortlisted
   - [ ] Success message shown
   - [ ] App list refreshes

6. **Reject Application**
   - [ ] Click reject on shortlisted app
   - [ ] Enter rejection reason (valid)
   - [ ] Confirm
   - [ ] Status changes to rejected
   - [ ] Success message shown

7. **Accept Application**
   - [ ] Click accept on pending app
   - [ ] Read confirmation message
   - [ ] Check confirmation box
   - [ ] Click accept
   - [ ] Modal closes
   - [ ] Success message: "other applications auto-rejected"
   - [ ] Filter by accepted: shows 1
   - [ ] Filter by rejected: shows 4+ (auto-rejected)
   - [ ] Filter by pending: shows remaining

8. **Bulk Operations**
   - [ ] Select multiple pending applications
   - [ ] Bulk reject
   - [ ] All rejected with same reason

---

## ⚠️ Error Handling Tests

### 1. Authorization Errors

**Test Case: Access Someone Else's Application**
```bash
# Get company1's application
# Login as company2
# Try to reject that application
```
**Expected:** 403 Forbidden - "Yeh application aapke project se nahi hai"

**Test Case: Non-Company Accessing Page**
```bash
# Login as student
# Go to /company/applications
```
**Expected:** Redirect to student dashboard or 403

---

### 2. Validation Errors

**Test Case: Rejection Reason Validation**
- Reason < 10 chars: Error
- Reason > 500 chars: Error
- Missing reason: Error
- HTML/XSS in reason: Sanitized

**Test Case: Status Transition Errors**
- Cannot shortlist already rejected app
- Cannot accept accepted app
- Cannot reject non-pending/shortlisted app

---

### 3. Network Errors

**Test Case: Slow Network**
- [ ] Loading states show
- [ ] Buttons disabled during request
- [ ] Timeout handling (if applicable)

**Test Case: Server Errors**
- [ ] 500 errors handled gracefully
- [ ] Error messages displayed
- [ ] Retry option provided

---

## 📊 Performance Testing

### 1. Large Dataset
- [ ] Load page with 1000+ applications
- [ ] Pagination works smoothly
- [ ] No UI lag
- [ ] Filters responsive

### 2. Pagination Performance
- [ ] Switching between pages smooth
- [ ] No data duplication
- [ ] Correct data per page

### 3. Stats Updates
- [ ] Stats refresh every 30 seconds
- [ ] No performance degradation
- [ ] Real-time accuracy

---

## 🔐 Security Testing

### 1. Authorization
- [ ] Company cannot view other company's applications
- [ ] Company cannot reject others' applications
- [ ] Student cannot access company applications page

### 2. Input Sanitization
- [ ] XSS attempts in rejection reason blocked
- [ ] HTML tags removed from reason
- [ ] Special characters handled

### 3. Data Privacy
- [ ] Student data only shown when viewing application
- [ ] Resume URLs not exposed to unauthorized users
- [ ] Email addresses properly protected

---

## 📝 Manual Testing Checklist

### Backend
- [ ] All 8 controller functions implemented
- [ ] All middleware functions implemented
- [ ] All routes mounted correctly
- [ ] Error handling comprehensive
- [ ] Transactions work for accept operation
- [ ] Notifications sent on all status changes
- [ ] Indexes created for performance

### Frontend
- [ ] All components created
- [ ] All API functions implemented
- [ ] All routes added to App.jsx
- [ ] Navbar updated with links
- [ ] Responsive design works
- [ ] Error messages displayed
- [ ] Success messages displayed
- [ ] Loading states show
- [ ] No console errors

### Integration
- [ ] Backend and frontend communicate correctly
- [ ] Authentication tokens passed correctly
- [ ] CORS working
- [ ] Database operations successful
- [ ] Notifications working end-to-end

---

## 🚀 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database migrations run
- [ ] Indexes created
- [ ] API responses tested
- [ ] Frontend builds without errors
- [ ] All routes accessible
- [ ] No console errors/warnings
- [ ] Performance acceptable
- [ ] Security measures in place

---

## 📞 Support & Debugging

### Common Issues

**Issue: Applications not loading**
- Check: API running on port 7000
- Check: Database connected
- Check: Auth token valid
- Check: Console for errors

**Issue: Stats not updating**
- Check: Interval running (every 30s)
- Check: API endpoint working
- Check: Network tab for failed requests

**Issue: Modal not closing**
- Check: onClick handlers attached
- Check: onClose callback working
- Check: No event propagation issues

**Issue: Notifications not sent**
- Check: Notification model connected
- Check: User IDs valid
- Check: Student dashboard loading notifications

---

## ✨ End of Testing Guide

All tests should pass before considering Phase 4.3 complete. Document any failed tests and create issues for fixes.
