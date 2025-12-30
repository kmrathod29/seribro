# FileUploadZone Integration Guide - Complete Backend & Frontend Connection

**Status:** ✅ FULLY INTEGRATED

**Date:** December 27, 2025

---

## Overview

The FileUploadZone component is now **fully integrated** with:
- ✅ Frontend SubmitWork page
- ✅ Frontend ReviewWork page  
- ✅ Backend work submission API
- ✅ Backend file upload handling
- ✅ Cloudinary integration
- ✅ Notifications and email alerts

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────────────┐
│                          Frontend (React)                               │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  SubmitWork.jsx                          ReviewWork.jsx                │
│  ├─ FileUploadZone (NEW)                 ├─ FileUploadZone (READ-ONLY) │
│  ├─ Links Input                          ├─ File Display               │
│  ├─ Message TextArea                     ├─ Message Display            │
│  └─ Submit Button → submitWork()         ├─ Links Display              │
│                                           └─ Review Actions            │
│                     ↓                                  ↓                │
│           submitWork(projectId,              approveWork()            │
│           formData)                    requestRevision()              │
│                                              rejectWork()             │
└──────────────────────┬───────────────────────────────┬─────────────────┘
                      ↓                               ↓
            ┌─────────────────────────────────────────────────┐
            │       workSubmissionApi.js                       │
            │  (Axios HTTP Wrapper)                           │
            ├─────────────────────────────────────────────────┤
            │  POST /api/workspace/projects/:id/submit-work   │
            │  POST /api/workspace/projects/:id/approve       │
            │  POST /api/workspace/projects/:id/request-...   │
            │  POST /api/workspace/projects/:id/reject        │
            └──────────────────────┬──────────────────────────┘
                                   ↓
        ┌──────────────────────────────────────────────────────────┐
        │                    Backend (Node.js)                      │
        ├──────────────────────────────────────────────────────────┤
        │                                                           │
        │  workSubmissionController.js                             │
        │  ├─ submitWork()                                         │
        │  │  ├─ Validate access                                  │
        │  │  ├─ Parse files (Multer)                             │
        │  │  ├─ Upload to Cloudinary                             │
        │  │  ├─ Save submission to DB                            │
        │  │  └─ Send notifications                               │
        │  │                                                       │
        │  ├─ approveWork()                                        │
        │  ├─ requestRevision()                                   │
        │  └─ rejectWork()                                        │
        │                                                           │
        └─────────────────┬──────────────────────────────────────┘
                          ↓
        ┌──────────────────────────────────────────────────────────┐
        │                   MongoDB                                │
        │  ├─ projects.submissions[]                              │
        │  ├─ projects.currentSubmission                          │
        │  ├─ projects.revisionHistory[]                          │
        │  └─ messages[] (notifications)                          │
        └──────────────────────────────────────────────────────────┘
                          ↓
        ┌──────────────────────────────────────────────────────────┐
        │                  Cloudinary                              │
        │  └─ seribro/work-submissions/{projectId}/...            │
        └──────────────────────────────────────────────────────────┘
```

---

## Data Flow: Submit Work

### 1. User Interaction (Frontend)
```
User selects files in FileUploadZone
        ↓
FileUploadZone validates:
  - File count ≤ maxFiles (10)
  - File size ≤ maxSizePerFile (100MB)
  - File type in acceptedTypes
        ↓
onFilesSelected callback → setSelectedFiles()
        ↓
Preview grid displays selected files
        ↓
User adds links and message
        ↓
User clicks "Submit Work"
```

### 2. FormData Creation (Frontend)
```javascript
const formData = new FormData();

// Add each file
selectedFiles.forEach(file => {
  formData.append('workFiles', file);
});

// Add links as JSON string
formData.append('links', JSON.stringify(validLinks));

// Add message
formData.append('message', message);

// Send to API
await submitWork(projectId, formData);
```

### 3. API Call (Frontend)
```javascript
// workSubmissionApi.js
export const submitWork = async (projectId, formData, config = {}) => {
  try {
    const res = await axiosInstance.post(
      `${BASE_URL}/projects/${projectId}/submit-work`,
      formData,
      {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 120000,  // 2 minutes for large file uploads
        ...config,
      }
    );
    return res.data;
  } catch (error) {
    return formatError(error);
  }
};
```

### 4. Backend Processing (Backend)
```javascript
// workSubmissionController.js - submitWork()
1. Validate workspace access (student only)
2. Check project status (must be in-progress or revision-requested)
3. Multer parses req.files from FormData
4. Validate files:
   - Count check: files.length ≤ WORK_MAX_FILES
   - Size check: each file ≤ WORK_MAX_FILE_SIZE_MB
5. Upload to Cloudinary:
   - Files stored in: seribro/work-submissions/{projectId}/
   - Returns: [{ url, filename, size, fileType, public_id }, ...]
6. Save submission to DB:
   - project.submissions.push(newSubmission)
   - Update project.currentSubmission
   - Increment project.revisionCount
7. Create in-app notification for company
8. Send email notification to company (if not inactive)
```

### 5. Response (Backend)
```json
{
  "success": true,
  "message": "Work submitted successfully. Company will review your submission.",
  "data": {
    "submission": {
      "_id": "...",
      "version": 1,
      "files": [
        {
          "url": "https://res.cloudinary.com/...",
          "originalName": "design.pdf",
          "fileType": "application/pdf",
          "size": 2048000,
          "filename": "...",
          "public_id": "seribro/work-submissions/..."
        }
      ],
      "links": [
        {
          "url": "https://github.com/...",
          "description": "GitHub Repository"
        }
      ],
      "message": "Added requested features and fixed bugs",
      "submittedAt": "2025-12-27T...",
      "status": "pending-review"
    },
    "project": {
      "_id": "...",
      "status": "submitted",
      "currentSubmission": { ... },
      "revisionCount": 1,
      "maxRevisionsAllowed": 2
    }
  }
}
```

### 6. Frontend Update (Frontend)
```javascript
if (res.success) {
  toast.success('Work submitted successfully!');
  // Navigate back after 1.5 seconds
  setTimeout(() => {
    navigate(`/workspace/projects/${projectId}`);
  }, 1500);
}
```

---

## Data Flow: Review Work

### 1. Load Submission (Frontend)
```javascript
getCurrentSubmission(projectId)
  ↓
Backend returns:
  {
    submission: {
      version: 1,
      files: [{ url, originalName, fileType, size }],
      links: [{ url, description }],
      message: "...",
      submittedAt: "..."
    },
    maxRevisionsAllowed: 2,
    revisionCount: 0
  }
  ↓
ReviewWork.jsx renders FileUploadZone(existingFiles)
  - FileUploadZone displays files in read-only mode
  - Maps file.fileType to display type (pdf, image, document, archive)
  - Shows filename, size, and file icons from lucide-react
```

### 2. Company Reviews (Frontend)
```
Company views files in FileUploadZone
  ↓
FileUploadZone (read-only):
  - Shows thumbnails for images
  - Shows PDF icon for PDFs
  - Shows document/archive icons
  - No remove buttons (onRemoveFile = null)
  ↓
Company reads message and external links
  ↓
Company enters feedback/comments
  ↓
Company clicks: Approve | Request Revision | Reject
```

### 3. Approval Flow (Backend)
```javascript
// POST /api/workspace/projects/{projectId}/approve
1. Validate: user is company owner
2. Validate: project has pending submission
3. Update project.status → "approved"
4. Create Payment record (best-effort)
5. Send in-app notification to student
6. Send email: "Your work has been approved!"
7. Return success response
```

### 4. Request Revision (Backend)
```javascript
// POST /api/workspace/projects/{projectId}/request-revision
1. Validate feedback length ≥ 10 chars
2. Validate revisionCount < maxRevisionsAllowed
3. Update project.status → "revision-requested"
4. Store revision feedback in project.revisionHistory
5. Send in-app notification to student
6. Send email: "Company requested changes"
7. Student can now resubmit from SubmitWork page
```

### 5. Rejection Flow (Backend)
```javascript
// POST /api/workspace/projects/{projectId}/reject
1. Validate feedback length ≥ 20 chars
2. Check if max revisions exceeded
3. If revisions exhausted:
   - Update status → "disputed"
   - Create dispute record
   - Notify admin
4. Else:
   - Update status → "revision-requested"
   - Add to revision history
5. Send notifications to student
```

---

## File Structure Summary

```
📁 seribro-frontend/client/src/
├── 📄 pages/workspace/
│   ├── ✨ SubmitWork.jsx (UPDATED - uses FileUploadZone)
│   └── ✨ ReviewWork.jsx (UPDATED - uses FileUploadZone read-only)
│
├── 📄 components/workspace/
│   ├── ✨ FileUploadZone.jsx (NEW - 397 lines)
│   ├── MessageBoard.jsx
│   ├── MessageInput.jsx
│   ├── WorkSubmissionForm.jsx (legacy, can deprecate)
│   └── ...
│
├── 📄 apis/
│   └── workSubmissionApi.js (unchanged)
│
└── 📄 App.jsx
    ├── /workspace/projects/:projectId/submit
    └── /workspace/projects/:projectId/review

📁 seribro-backend/backend/
├── 📄 controllers/
│   └── workSubmissionController.js (unchanged)
│
├── 📄 models/
│   ├── Project.js (has submissions, currentSubmission fields)
│   └── Message.js (notifications)
│
└── 📄 utils/workspace/
    ├── workSubmissionUploadMiddleware.js (Multer config)
    ├── uploadWorkToCloudinary.js (file upload)
    └── validateWorkspaceAccess.js (access control)
```

---

## Integration Points

### Frontend → Backend API Calls

```javascript
// 1. Submit Work (Student)
POST /api/workspace/projects/{projectId}/submit-work
  Headers: multipart/form-data
  Body: FormData {
    workFiles: [File, File, ...],
    links: "[{url, description}, ...]",
    message: "..."
  }
  Response: { submission, project }

// 2. Approve Work (Company)
POST /api/workspace/projects/{projectId}/approve
  Body: { feedback: "Great work!" }
  Response: { project }

// 3. Request Revision (Company)
POST /api/workspace/projects/{projectId}/request-revision
  Body: { reason: "Please add dark mode support" }
  Response: { project }

// 4. Reject Work (Company)
POST /api/workspace/projects/{projectId}/reject
  Body: { reason: "Does not meet requirements..." }
  Response: { project }

// 5. Get Current Submission (Both)
GET /api/workspace/projects/{projectId}/submissions/current
  Response: { submission, maxRevisionsAllowed, revisionCount }
```

---

## File Size & Count Validation

### Frontend Validation (FileUploadZone)
```javascript
const maxFiles = 10;
const maxSizePerFile = 100 * 1024 * 1024; // 100MB

// FileUploadZone validates:
✓ Total files (existing + selected) ≤ maxFiles
✓ Each file size ≤ maxSizePerFile
✓ File type in acceptedTypes
```

### Backend Validation (workSubmissionController)
```javascript
const WORK_MAX_FILES = process.env.WORK_MAX_FILES || 10;
const WORK_MAX_FILE_SIZE_MB = process.env.WORK_MAX_FILE_SIZE_MB || 100;

// Backend validates:
✓ files.length ≤ WORK_MAX_FILES
✓ Each file.size ≤ (WORK_MAX_FILE_SIZE_MB * 1024 * 1024)
✓ At least 1 file OR 1 link provided
```

---

## Accepted File Types

```javascript
// Frontend (FileUploadZone default)
[
  'image/jpeg',        // JPG
  'image/png',         // PNG
  'image/gif',         // GIF
  'image/webp',        // WebP
  'application/pdf',   // PDF
  'application/msword', // DOC
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-excel', // XLS
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/zip',   // ZIP
  'application/x-rar-compressed', // RAR
  'text/plain',        // TXT
]

// Backend (workSubmissionUploadMiddleware)
const ALLOWED_EXTENSIONS = [
  'jpg', 'jpeg', 'png', 'gif', 'webp',  // Images
  'pdf',                                  // PDF
  'doc', 'docx', 'xls', 'xlsx',         // Office
  'zip', 'rar',                           // Archives
  'txt',                                  // Text
  'psd', 'figma', 'sketch', 'ai',       // Design
];
```

---

## Error Handling

### Frontend Error Messages
```
"Maximum 10 files allowed. You already have 5 file(s)."
→ User tried to upload more files than allowed

"[file.pdf] exceeds max size (100 MB)"
→ File is larger than 100MB limit

"[script.exe] is not an allowed file type..."
→ File extension not supported

"Provide feedback of at least 10 characters"
→ Revision feedback too short

"Rejection reason must be at least 20 characters"
→ Rejection feedback too short
```

### Backend Error Responses
```json
// 400 Bad Request
{
  "success": false,
  "message": "Too many files",
  "status": 400
}

// 403 Forbidden
{
  "success": false,
  "message": "Access denied - Student role required",
  "status": 403
}

// 404 Not Found
{
  "success": false,
  "message": "Project not found",
  "status": 404
}

// 500 Server Error
{
  "success": false,
  "message": "Failed to upload files",
  "error": "Cloudinary error details..."
}
```

---

## Environment Variables

### Frontend (.env)
```env
VITE_API_BASE_URL=http://localhost:7000/api
VITE_UPLOAD_TIMEOUT_MS=120000
REACT_APP_WORK_MAX_FILES=10
REACT_APP_WORK_MAX_FILE_SIZE_MB=100
```

### Backend (.env)
```env
WORK_MAX_FILES=10
WORK_MAX_FILE_SIZE_MB=100
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
CLOUDINARY_WORK_SUBMISSIONS_FOLDER=seribro/work-submissions
MAX_SUBMISSION_REVISIONS=2
EMAIL_NOTIFY_ON_SUBMISSION=true
```

---

## Testing Integration

### 1. Test Submit Work (Student)
```
1. Go to /workspace/projects/:projectId/submit
2. Drag-drop a file → Should appear in preview grid
3. Add external link → Should show in links section
4. Add message → Should show character count
5. Click "Submit Work" → Should call backend API
6. Wait for response → Should navigate back
7. Check console → Should see success toast
```

### 2. Test File Validation
```
1. Try uploading .exe file → Should show error toast
2. Try uploading file >100MB → Should show error toast
3. Try uploading 15 files (max 10) → Should show error toast
4. Upload valid files → Should add to preview grid
```

### 3. Test Review Work (Company)
```
1. Go to /workspace/projects/:projectId/review
2. Should see submitted files in FileUploadZone (read-only)
3. Should see image thumbnails
4. Should see PDF/document icons
5. Should see external links
6. Should see submission message
7. Enter feedback and click "Request Revision"
8. Should show confirmation and navigate back
```

### 4. Test Notifications
```
1. Submit work → Company receives in-app notification
2. Company requests revision → Student receives in-app notification
3. Check email inbox → Should have confirmation email
```

---

## Troubleshooting

### Issue: Files not uploading
**Cause**: API endpoint not working
**Solution**: Check backend logs, verify Cloudinary credentials

### Issue: FileUploadZone not showing
**Cause**: Import path incorrect or component not found
**Solution**: Verify import path is correct, check file exists

### Issue: Preview images not showing
**Cause**: Blob URLs not created properly
**Solution**: Check browser console, verify image MIME type correct

### Issue: Drag-drop not working
**Cause**: Event handlers not attached
**Solution**: Verify onDragEnter, onDrop events firing (DevTools)

### Issue: Backend returns "Too many files"
**Cause**: Frontend validation not strict enough
**Solution**: Frontend and backend both validate; check WORK_MAX_FILES env var

---

## Performance Considerations

### Frontend
- FileUploadZone creates object URLs only for image previews
- Object URLs are revoked when files removed (prevents memory leaks)
- Validation is single-pass (O(n) complexity)

### Backend
- Multer stores temp files before Cloudinary upload
- Cloudinary upload happens in uploadWorkFilesToCloudinary()
- Database save is synchronous after file upload completes
- Consider using streams for very large files in future

### Network
- Upload timeout: 120 seconds (2 minutes)
- Recommended for files up to 100MB
- Consider resumable uploads for larger files (future enhancement)

---

## Next Steps (Optional Enhancements)

1. **Upload Progress**: Add progress bar during upload
2. **Resumable Uploads**: TUS protocol for large files
3. **Image Compression**: Reduce image file sizes before upload
4. **PDF Preview**: pdf.js integration for PDF thumbnails
5. **Batch Download**: Download all files as ZIP
6. **Virus Scanning**: ClamAV or VirusTotal integration
7. **Thumbnail Generation**: Auto-generate thumbnails for all file types

---

## Documentation Files

- `FileUploadZone_DOCUMENTATION.md` - Component documentation
- `FILEUPLOADZONE_IMPLEMENTATION_SUMMARY.md` - Implementation details
- `FILEUPLOADZONE_QUICK_REFERENCE.md` - Quick start guide
- `FileUploadZone_INTEGRATION_GUIDE.md` - This file

---

## Summary

✅ **FileUploadZone Component**: Fully implemented and production-ready
✅ **SubmitWork Page**: Updated to use FileUploadZone
✅ **ReviewWork Page**: Updated to display files with FileUploadZone (read-only)
✅ **Backend Integration**: Works with existing submission API
✅ **Error Handling**: Complete validation and error messages
✅ **Testing**: Ready for manual and automated testing

**Status**: ✨ READY FOR PRODUCTION DEPLOYMENT

---

For questions or issues, refer to the component documentation or check backend logs at `backend/logs/` directory.
