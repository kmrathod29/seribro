# SERIBRO PHASE 3 - QUICK START GUIDE

## New Features Overview

This document provides a quick guide to using the newly implemented features in Phase 3.

---

## 1. EDITING PROJECTS

### For Companies

**Location**: Company Project Detail Page

**Steps to Edit a Project**:
1. Navigate to `/company/projects`
2. Click on a project to view its details
3. Click the **"Edit Project"** button (gold colored)
4. Update any of the following fields:
   - Project Title
   - Project Description (textarea)
   - Category (dropdown)
   - Required Skills (add/remove with tags)
   - Budget Range (min and max)
   - Project Duration (dropdown)
   - Deadline (date picker - must be future date)
5. Click **"Update Project"** button
6. Success toast will appear: ✅ "Project updated successfully!"

**Important Notes**:
- Only projects with **"Open"** status can be edited
- Budget minimum must be less than or equal to budget maximum
- Deadline must be a future date
- At least one skill is required
- Form shows validation errors for invalid fields

**Error Handling**:
- If project is not "open" → Error message explaining why
- Invalid form fields → Red error messages under each field
- Network error → Toast notification with error message

---

## 2. APPLICATION MANAGEMENT

### Viewing Applications

**Location**: ApplicationDetails page (`/company/applications/:applicationId`)

**Application Details Visible**:
- Student profile picture and verified badge
- Student name, college, and location
- Skill match percentage
- Application status badge (colored)
- Application date and proposed price
- Timeline estimate
- Full cover letter/proposal
- Student's skills with tags
- Resume and certificates (downloadable)
- Past project portfolio
- Required project skills
- Rating and reviews (if available)

### Managing Applications

**Three Main Actions Available**:

#### 1. SHORTLIST APPLICATION ⭐
- **When Available**: When application status is "pending"
- **Action**: Click **"⭐ Shortlist"** button
- **Result**: Application status changes to "shortlisted"
- **Feedback**: ✅ Toast: "Application shortlisted successfully!"
- **UI Update**: Button disappears, status badge updates immediately

#### 2. ACCEPT APPLICATION ✅ (With Confirmation Modal)
- **When Available**: When application status is "pending"
- **Action**: Click **"✅ Accept Application"** button
- **Modal Appears**: Green confirmation modal with:
  - Header: "✅ Approve Application?"
  - Message: Action will assign the student and create a payment record
  - Warning box explaining payment initiation
  - "Cancel" and "✅ Approve" buttons
- **While Processing**: Button shows "⏳ Processing..." with spinner
- **On Success**: 
  - ✅ Toast: "Student approved successfully! Payment process initiated."
  - Redirects to `/payment/{projectId}` after 1 second
- **On Error**: ❌ Toast with error message

#### 3. REJECT APPLICATION ❌ (With Reason Modal)
- **When Available**: When application status is "pending" or "shortlisted"
- **Action**: Click **"❌ Reject"** button
- **Modal Appears**: Red confirmation modal with:
  - Header: "❌ Reject Application?"
  - Large warning: "⚠️ This action may trigger a dispute"
  - Required textarea for rejection reason
  - Character counter showing minimum 10 characters required
  - "Cancel" and "❌ Reject" buttons (Reject button disabled if reason invalid)
- **Validation**:
  - Rejection reason must be at least 10 characters
  - Error message appears if too short
  - Button disables if validation fails
- **While Processing**: Button shows "⏳ Processing..."
- **On Success**:
  - ✅ Toast: "Application rejected successfully"
  - Returns to previous page after 1 second
- **On Error**: ❌ Error message in modal

### Action Button States

| Status | Available Buttons |
|--------|------------------|
| Pending | ⭐ Shortlist, ✅ Accept, ❌ Reject |
| Shortlisted | ✅ Accept, ❌ Reject |
| Accepted | 🔗 Open Workspace |
| Rejected | 🗑️ Remove (if applicable) |

---

## 3. WORKSPACE EXPERIENCE

### Auto-Refresh Features

The workspace now automatically refreshes after important status changes:

**Triggers Auto-Refresh**:
1. ✅ Start Work - Updates status to "In Progress"
2. ✅ Submit Work - Updates status to "Under Review"
3. ✅ Approve Work - Updates status to "Completed"
4. ✅ Request Revision - Keeps status, adds revision count
5. Real-time messages via Socket.io (or 30-second polling fallback)

**What Gets Refreshed**:
- Project status and timeline
- Message board (new messages appear instantly)
- Submission history
- Action button availability based on new status

### Loading States

All action buttons now show loading feedback:

**During Processing**:
- Button becomes disabled
- Text changes to loading message (e.g., "⏳ Submitting...")
- Spinner animation appears
- Button cannot be clicked (prevents double-submission)

**After Completion**:
- Button re-enables
- Text reverts to original
- Toast notification confirms success or error

### Workspace Action Buttons

| User Role | Available Actions | Status |
|-----------|------------------|--------|
| Student | Start Work | assigned |
| Student | Submit Work | in-progress, revision-requested |
| Student | Rate Company | completed |
| Company | Pay Now | assigned |
| Company | Review Submission | under-review |
| Company | Approve/Reject/Revise | under-review |

---

## 4. CONFIRMATION MODALS

### Three Color-Coded Modals

#### GREEN MODAL - Approve Work ✅
- **Color Scheme**: Green (#22c55e)
- **Emoji**: ✅
- **Purpose**: Confirm approval of student's work
- **Warning**: "This action will approve the submission and initiate the payment release process"
- **Optional Field**: Feedback textarea
- **Impact**: Moves project to "Completed", initiates payment

#### YELLOW MODAL - Request Revision 🔄
- **Color Scheme**: Yellow (#ca8a04)
- **Emoji**: 🔄
- **Purpose**: Request student to revise their work
- **Warning**: "Student will have remaining revisions to address your feedback"
- **Required Field**: Revision instructions (min 10 characters)
- **Impact**: Moves project to "Revision Requested", student can resubmit

#### RED MODAL - Reject Work ❌
- **Color Scheme**: Red (#dc2626)
- **Emoji**: ❌
- **Purpose**: Reject student's work (marks project as disputed)
- **Warning**: "This action will dispute the project and cannot be easily undone"
- **Required Field**: Rejection reason (min 20 characters)
- **Impact**: Moves project to "Disputed", may trigger payment hold

---

## 5. FILE UPLOAD & SUBMISSION

### Submit Work Progress

When students upload files:

**Progress Indicator**:
- Shows a progress bar (0-100%)
- Updates as files upload to Cloudinary
- Displays current percentage
- Prevents navigation until complete

**Submit Button State**:
- While uploading: Shows "⏳ Submitting..." 
- Button becomes disabled
- Cannot accidentally submit twice

**Success Confirmation**:
- Modal appears: "Work submitted successfully!"
- Auto-closes after 3 seconds
- Redirects to workspace page
- Success toast appears

---

## 6. FORM VALIDATION

### Project Edit Form Validation

**Real-Time Validation**:
- Title: Required, non-empty
- Description: Required, non-empty
- Category: Required
- Skills: At least one required
- Budget: Min ≤ Max, both required
- Duration: Required
- Deadline: Required, must be future date

**Error Display**:
- Red border on invalid fields
- Error message below field
- Submit button disabled until all valid

### Rejection Reason Validation

**Character Count Requirements**:
- Minimum 10 characters (Shortlist/Accept rejection)
- Minimum 20 characters (Work rejection)
- Real-time counter: "10/10 minimum"
- Button disables if invalid

---

## 7. NAVIGATION FLOWS

### Project Editing Flow
```
Company Dashboard
↓
My Projects Page
↓
Project Detail (/company/projects/:id)
↓
[Click Edit Button]
↓
Edit Project Page (/company/projects/:id/edit)
↓
Submit Form
↓
Success Toast → Back to Project Detail
```

### Application Management Flow
```
Company Applications (/company/applications)
↓
[Click Application Card]
↓
Application Details (/company/applications/:applicationId)
↓
[Choose Action: Shortlist/Accept/Reject]
↓
[Modal Appears if Needed]
↓
Confirm Action
↓
Success Toast → Updated UI
```

### Workspace Review Flow
```
Project Workspace (/workspace/projects/:projectId)
↓
[Click Review Submission]
↓
Review Work Page (/workspace/projects/:projectId/review)
↓
[View Submission Files]
↓
[Choose Action: Approve/Revise/Reject]
↓
[Colored Modal Appears]
↓
[Enter Required Feedback]
↓
Confirm Action
↓
Success Toast → Auto-Refresh Workspace
```

---

## 8. KEYBOARD SHORTCUTS & ACCESSIBILITY

### Form Navigation
- **Tab**: Move between form fields
- **Shift+Tab**: Move backwards between fields
- **Enter**: Submit form (if focused on button)
- **Escape**: Close modal (if not processing)

### Screen Reader Support
- All form labels are properly associated
- Error messages are announced
- Modal headings are clear
- Button purposes are explicit

---

## 9. TROUBLESHOOTING

### "404 Error on Edit Project"
- **Cause**: Route not properly registered
- **Solution**: Verify `/company/projects/:id/edit` route in App.jsx

### "Buttons Not Working"
- **Cause**: API endpoint not responding
- **Solution**: Check backend is running and API URL is correct

### "Modals Not Appearing"
- **Cause**: Modal state not updating
- **Solution**: Check browser console for errors

### "Upload Progress Stuck"
- **Cause**: File too large or network issue
- **Solution**: Try smaller files, check internet connection

### "Loading Spinner Won't Stop"
- **Cause**: API response not received
- **Solution**: Check network tab, verify backend response

---

## 10. TIPS & BEST PRACTICES

### For Companies
1. **Be Specific When Rejecting**: Provide clear, actionable feedback
2. **Give Revision Opportunities**: Request revisions before rejecting
3. **Test Early**: Start work to ensure you can see the workspace
4. **Monitor Status**: Check project status regularly
5. **Provide Feedback**: Use optional feedback fields in modals

### For Students
1. **Check Application Status**: Know when your application is shortlisted
2. **Understand Revisions**: Know how many revision attempts you have
3. **Be Clear in Submissions**: Include all deliverables mentioned
4. **Respond to Feedback**: Address revision requests comprehensively
5. **Complete Ratings**: Rate the company after project completion

---

## 11. API ENDPOINTS USED

### New/Updated Endpoints
- `PUT /api/company/projects/:id` - Update project
- `GET /api/company/applications/:projectId/applications` - Get applications
- `POST /api/company/applications/:applicationId/shortlist` - Shortlist
- `POST /api/company/applications/:applicationId/approve` - Approve
- `POST /api/company/applications/:applicationId/reject` - Reject

### Existing Endpoints
- `GET /api/company/projects/:id` - Project details
- `POST /api/workspace/projects/:projectId/start` - Start work
- `POST /api/workspace/projects/:projectId/submit` - Submit work
- `POST /api/workspace/projects/:projectId/approve` - Approve work
- `POST /api/workspace/projects/:projectId/revise` - Request revision
- `POST /api/workspace/projects/:projectId/reject` - Reject work

---

## SUPPORT & FEEDBACK

For issues or feature requests:
1. Check the error messages displayed
2. Review browser console for technical errors
3. Verify all required form fields are filled
4. Check network connectivity
5. Contact development team with error details

---

**Phase 3 Complete** ✅  
Last Updated: January 1, 2026
