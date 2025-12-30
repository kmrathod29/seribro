# 🚀 Sub-Phase 5.4 QUICK START & INTEGRATION GUIDE

## One-Minute Overview
✅ **FileUploadZone**: Drag-drop component for file uploads
✅ **SubmissionCard**: Reusable submission display & review component  
✅ **ReviewWork**: Company review interface with submission history
✅ **SubmitWork**: Student submission form integrated with FileUploadZone

---

## 📦 Import Components

### FileUploadZone
```javascript
import FileUploadZone from '../../components/workspace/FileUploadZone';

// In JSX
<FileUploadZone
  onFilesSelected={(files) => setSelectedFiles(files)}
  maxFiles={10}
  maxSizePerFile={100 * 1024 * 1024}
/>
```

### SubmissionCard
```javascript
import SubmissionCard from '../../components/workspace/SubmissionCard';

// In JSX
<SubmissionCard
  submission={submission}
  isLatest={true}
  canReview={userRole === 'company'}
  userRole={userRole}
  onApprove={handleApprove}
  onRequestRevision={handleRequestRevision}
  onReject={handleReject}
  maxRevisions={3}
  currentRevisions={1}
/>
```

---

## 🔌 API Calls

### Get Submission History
```javascript
import { getSubmissionHistory } from '../../apis/workSubmissionApi';

const res = await getSubmissionHistory(projectId);
// res = {
//   success: true,
//   data: {
//     submissions: [],
//     project: { title, maxRevisionsAllowed },
//     userRole: 'company'
//   }
// }
```

### Submit Work
```javascript
import { submitWork } from '../../apis/workSubmissionApi';

const formData = new FormData();
selectedFiles.forEach(f => formData.append('workFiles', f));
formData.append('links', JSON.stringify(links));
formData.append('message', message);

const res = await submitWork(projectId, formData);
```

### Approve/Revision/Reject
```javascript
import { approveWork, requestRevision, rejectWork } from '../../apis/workSubmissionApi';

// Approve
const res = await approveWork(projectId, feedback);

// Request Revision
const res = await requestRevision(projectId, revisionReason);

// Reject
const res = await rejectWork(projectId, rejectionReason);
```

---

## 🎨 Styling Reference

### Dark Theme Colors
```javascript
// Backgrounds
'bg-gray-900'      // Darkest
'bg-gray-800/50'   // Cards
'bg-gray-900/50'   // Input fields

// Accent (Primary Yellow)
'text-yellow-400'  // Headings
'bg-yellow-400'    // Buttons
'hover:bg-yellow-500'

// Status Colors
'bg-blue-500/20'   // Submitted
'bg-yellow-500/20' // Revision Requested
'bg-green-500/20'  // Approved
'bg-red-500/20'    // Rejected

// Borders
'border-gray-700'  // Default
'border-yellow-400' // Focused/Active
'border-blue-500'  // Submitted
'border-green-500' // Approved
```

---

## 💡 Common Patterns

### Sort Submissions (Newest First)
```javascript
submissionHistory.sort((a, b) => b.version - a.version)
```

### Count Revisions
```javascript
const revisionCount = submissionHistory.filter(
  s => s.status === 'revision-requested'
).length;
```

### Check if Latest
```javascript
const isLatest = index === 0; // After sorting by version DESC
```

### Show Error State
```javascript
if (error) {
  return (
    <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
      <AlertCircle className="w-5 h-5 inline mr-2" />
      {error}
    </div>
  );
}
```

### Show Loading State
```javascript
if (loading) {
  return (
    <div className="flex items-center justify-center p-12">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
      <p className="ml-4 text-gray-400">Loading...</p>
    </div>
  );
}
```

---

## 📋 File Validation Example

```javascript
// Check file count
if (selectedFiles.length + newFiles.length > maxFiles) {
  toast.error(`Maximum ${maxFiles} files allowed`);
  return;
}

// Check file size
if (file.size > maxSizePerFile) {
  toast.error(`${file.name} exceeds size limit`);
  return;
}

// Check file type
const validTypes = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf',
  'application/msword'
];
if (!validTypes.includes(file.type)) {
  toast.error(`${file.name}: unsupported type`);
  return;
}
```

---

## 🔄 Feedback Character Count Validation

```javascript
// Approve: optional (0+)
if (action === 'approve') {
  // No validation needed
}

// Revision: required (10+)
if (action === 'revision' && feedback.length < 10) {
  toast.error('Feedback must be at least 10 characters');
  return;
}

// Reject: required (20+)
if (action === 'reject' && feedback.length < 20) {
  toast.error('Rejection reason must be at least 20 characters');
  return;
}
```

---

## 🎯 Key Integration Points

| File | Component | Action |
|------|-----------|--------|
| SubmitWork.jsx | FileUploadZone | File selection |
| ReviewWork.jsx | SubmissionCard | Display & review |
| workSubmissionApi.js | Backend | API calls |
| Project Model | Backend | Store submissions |

---

## ⚡ Performance Tips

1. **Blob URL Cleanup**: Always revoke Blob URLs to prevent memory leaks
   ```javascript
   URL.revokeObjectURL(blobUrl);
   ```

2. **Lazy Load Large Files**: Show thumbnail only if file is image
   ```javascript
   if (file.type.startsWith('image/')) {
     const url = URL.createObjectURL(file);
     // use url
   }
   ```

3. **Pagination**: Implement for large submission histories
   ```javascript
   const page = 1;
   const limit = 10;
   const res = await getSubmissionHistory(projectId, { page, limit });
   ```

---

## 🐛 Debugging

### Check Component Props
```javascript
console.log('Submission:', submission);
console.log('Files:', submission.files);
console.log('User Role:', userRole);
console.log('Can Review:', canReview);
```

### Check API Responses
```javascript
const res = await getSubmissionHistory(projectId);
console.log('API Response:', res);
if (!res.success) {
  console.error('API Error:', res.message);
}
```

### Check Form Data
```javascript
const formData = new FormData();
selectedFiles.forEach(f => formData.append('workFiles', f));
for (let [key, value] of formData.entries()) {
  console.log(`${key}:`, value);
}
```

---

## ✅ Pre-Deployment Checklist

- [ ] FileUploadZone component renders correctly
- [ ] SubmissionCard component renders with data
- [ ] ReviewWork page loads submission history
- [ ] SubmitWork form accepts file uploads
- [ ] All API endpoints return correct data
- [ ] Error toasts display on failures
- [ ] Loading states show during API calls
- [ ] Responsive design works on mobile
- [ ] Blob URLs are cleaned up on unmount
- [ ] Character counts validate correctly

---

## 📞 Support

For issues, check:
1. Browser console for JavaScript errors
2. Network tab for API response errors
3. Toast notifications for user-facing errors
4. Backend logs for server-side issues
5. Component props in React DevTools

---

**Status**: ✅ Ready for deployment
**Last Updated**: 2024
**Maintainer**: Development Team
