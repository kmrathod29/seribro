# FileUploadZone Quick Reference & Integration Guide

## 📍 File Location
`client/src/components/workspace/FileUploadZone.jsx` (397 lines)

---

## 🚀 Quick Start

### Basic Import & Usage
```jsx
import FileUploadZone from '../../components/workspace/FileUploadZone';

function MyComponent() {
  const handleFilesSelected = (files) => {
    console.log('Files selected:', files);
    // Convert to FormData for API
    const formData = new FormData();
    files.forEach(file => formData.append('files', file));
  };

  return (
    <FileUploadZone
      onFilesSelected={handleFilesSelected}
      maxFiles={10}
      maxSizePerFile={100 * 1024 * 1024}
    />
  );
}
```

---

## 📦 Component Props Cheat Sheet

| Prop | Type | Default | Example |
|------|------|---------|---------|
| `onFilesSelected` | `function` | REQUIRED | `(files) => { ... }` |
| `maxFiles` | `number` | `10` | `5` |
| `maxSizePerFile` | `number` | `104857600` (100MB) | `52428800` (50MB) |
| `acceptedTypes` | `array` | See below | `['image/*', 'application/pdf']` |
| `existingFiles` | `array` | `[]` | `[{filename: 'old.pdf', type: 'pdf', url: '...', size: 1024}]` |
| `onRemoveFile` | `function` | `null` | `(index) => { ... }` |
| `selectedFiles` | `array` | `[]` | `[file1, file2]` |
| `onFileRemove` | `function` | `null` | `(index) => { ... }` |

---

## 🎯 Default Accepted MIME Types

```javascript
[
  'image/jpeg',    // JPG files
  'image/png',     // PNG files
  'image/gif',     // GIF files
  'image/webp',    // WebP files
  'application/pdf', // PDF files
  'application/msword', // DOC files
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // DOCX
  'application/vnd.ms-excel', // XLS files
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // XLSX
  'application/zip', // ZIP files
  'application/x-rar-compressed', // RAR files
  'text/plain', // TXT files
]
```

---

## 💡 Common Use Cases

### Use Case 1: Work Submission Form
```jsx
import FileUploadZone from '../../components/workspace/FileUploadZone';

function SubmitWorkPage({ projectId }) {
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([]);
  const [message, setMessage] = useState('');

  const handleFilesSelected = (selectedFiles) => {
    setFiles(Array.from(selectedFiles));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const formData = new FormData();
    files.forEach(f => formData.append('workFiles', f));
    formData.append('links', JSON.stringify(links));
    formData.append('message', message);
    
    const res = await submitWork(projectId, formData);
    if (res.success) {
      toast.success('Work submitted successfully!');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-6">
      <h2 className="text-2xl font-bold mb-6">Submit Your Work</h2>
      
      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        maxFiles={10}
        maxSizePerFile={100 * 1024 * 1024}
      />
      
      <textarea
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Add a message (optional)"
        className="w-full mt-6 p-3 rounded bg-gray-800 text-white"
      />
      
      <button
        type="submit"
        disabled={files.length === 0}
        className="mt-6 px-6 py-2 bg-yellow-400 text-navy rounded font-semibold disabled:opacity-50"
      >
        Submit Work ({files.length} file(s))
      </button>
    </form>
  );
}
```

### Use Case 2: Review Existing Submission (Read-Only)
```jsx
function ReviewWorkPage({ submission }) {
  const existingFiles = submission.files.map(f => ({
    filename: f.originalName,
    type: f.fileType.includes('pdf') ? 'pdf' 
         : f.fileType.includes('image') ? 'image'
         : f.fileType.includes('zip') ? 'archive'
         : 'document',
    url: f.url,
    size: f.size,
  }));

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-6">Review Submission</h2>
      
      <FileUploadZone
        existingFiles={existingFiles}
        onRemoveFile={null}  // Prevent removal
        maxFiles={0}  // Prevent adding more
      />
      
      <div className="mt-6 flex gap-3">
        <button
          onClick={() => approveWork(submission._id)}
          className="px-6 py-2 bg-green-500 text-white rounded"
        >
          Approve
        </button>
        <button
          onClick={() => requestRevision(submission._id)}
          className="px-6 py-2 bg-yellow-500 text-white rounded"
        >
          Request Revision
        </button>
      </div>
    </div>
  );
}
```

### Use Case 3: Custom File Type Restrictions
```jsx
// Only allow images and PDFs, max 5MB each
<FileUploadZone
  onFilesSelected={handleFilesSelected}
  maxFiles={5}
  maxSizePerFile={5 * 1024 * 1024}  // 5MB
  acceptedTypes={['image/jpeg', 'image/png', 'application/pdf']}
/>
```

### Use Case 4: Replace Existing File
```jsx
function ReplaceFileForm({ existingFile }) {
  const [newFiles, setNewFiles] = useState([]);

  const handleRemoveExisting = () => {
    deleteFile(existingFile._id);
  };

  return (
    <FileUploadZone
      onFilesSelected={setNewFiles}
      existingFiles={[existingFile]}
      onRemoveFile={handleRemoveExisting}
      maxFiles={1}  // Only one file
    />
  );
}
```

---

## 🎨 Styling Overview

### Upload Zone States
| State | Appearance |
|-------|-----------|
| Default | Gray dashed border, dark background |
| Hover | Light blue border, subtle background change |
| Dragging | Blue border, blue tinted background, slight zoom |

### Preview Grid
| Breakpoint | Columns |
|-----------|---------|
| Mobile (<768px) | 2 |
| Tablet (768-1024px) | 3 |
| Desktop (>1024px) | 4 |

### File Icons
| Type | Icon | Color |
|------|------|-------|
| Image | Thumbnail | N/A |
| PDF | FileText | Red |
| Document | FileImage | Blue |
| Archive | FileArchive | Yellow |
| Generic | File | Gray |

---

## 🔧 Customization Examples

### Custom Tailwind Styling (if needed)
```jsx
// You can wrap the component and override via CSS modules or styled-components
// The component uses only utility classes, so it's easily themeable

// Example: Dark theme (already applied)
// - border-gray-400 → border-gray-300
// - bg-gray-900/30 → bg-slate-800
// - text-gray-200 → text-gray-100
```

### Environment Variable Integration
```jsx
// In .env
REACT_APP_WORK_MAX_FILES=10
REACT_APP_WORK_MAX_FILE_SIZE_MB=100
REACT_APP_ACCEPTED_FILE_TYPES=image/*,application/pdf,application/zip

// In component
<FileUploadZone
  maxFiles={parseInt(process.env.REACT_APP_WORK_MAX_FILES || '10')}
  maxSizePerFile={parseInt(process.env.REACT_APP_WORK_MAX_FILE_SIZE_MB || '100') * 1024 * 1024}
  acceptedTypes={(process.env.REACT_APP_ACCEPTED_FILE_TYPES || 'image/*,application/pdf').split(',')}
/>
```

---

## 🛡️ Error Messages Reference

| Scenario | Error Message |
|----------|---------------|
| Too many files | `Maximum 10 files allowed. You already have 5 file(s).` |
| File too large | `"large-file.pdf" exceeds max size (100 MB)` |
| Wrong type | `"script.exe" is not an allowed file type. Allowed: image/*, application/pdf, ...` |
| Success | `3 file(s) added successfully` |
| Removal | `File removed` |

---

## 📊 State & Data Structures

### Component Internal State
```javascript
// What FileUploadZone manages internally:
[
  {
    id: 1234567890,      // Random temp ID
    file: File,          // Original File object from browser
    name: 'photo.jpg',   // Filename
    size: '2.5 MB',      // Formatted size
    type: 'image',       // Type for icon selection
    objectUrl: 'blob:...', // For image thumbnail preview
  }
]
```

### Existing Files Format (input)
```javascript
[
  {
    filename: 'submission-v1.pdf',  // Original filename
    type: 'pdf',                     // 'pdf'|'document'|'image'|'archive'|'file'
    url: 'https://cloudinary.com/...', // CDN URL
    size: 102400,                    // Bytes (optional)
  }
]
```

### Callback: onFilesSelected
```javascript
// Receives array of File objects ready for upload
handleFilesSelected = (files) => {
  // files = [File, File, File]
  // Each File has: name, size, type, lastModified, etc.
  // Use in FormData for API upload
}
```

---

## ⚙️ Integration Checklist

- [ ] Import FileUploadZone component
- [ ] Add onFilesSelected handler
- [ ] Configure maxFiles prop (if needed)
- [ ] Configure maxSizePerFile prop (if needed)
- [ ] Configure acceptedTypes prop (if needed)
- [ ] Create FormData from selected files
- [ ] Pass FormData to API endpoint
- [ ] Handle API response (success/error)
- [ ] Test drag-drop on mobile device
- [ ] Test file type validation
- [ ] Test file size validation
- [ ] Test remove functionality
- [ ] Verify responsive layout

---

## 🐛 Troubleshooting

### Issue: Component doesn't show
**Solution**: Check import path is correct
```jsx
// ✅ Correct
import FileUploadZone from '../../components/workspace/FileUploadZone';

// ❌ Wrong
import FileUploadZone from '../../components/FileUploadZone';
```

### Issue: Toast notifications not showing
**Solution**: Ensure react-hot-toast is initialized in App.jsx
```jsx
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <>
      <Toaster position="top-right" />
      {/* Your routes */}
    </>
  );
}
```

### Issue: Icons not appearing
**Solution**: Check lucide-react is installed
```bash
npm list lucide-react  # Should show version
```

### Issue: Drag-drop not working in older browsers
**Solution**: Component requires modern browsers (Chrome 90+, Firefox 88+, Safari 14+)

### Issue: Images not showing thumbnails
**Solution**: Check browser console for errors. Image previews use blob URLs which should work in all modern browsers.

---

## 📚 Related Phases & Components

- **Sub-Phase 5.4.1**: Workspace messaging (MessageBoard, MessageInput)
- **Sub-Phase 5.4.2**: Work submission (SubmitWork page - will use FileUploadZone)
- **Sub-Phase 5.4.3**: Work review (ReviewWork page - will use FileUploadZone)
- **Phase 5.3**: Payment integration

---

## 🎯 Performance Tips

1. **Lazy load**: Import only when needed
   ```jsx
   const FileUploadZone = React.lazy(() => import('../../components/workspace/FileUploadZone'));
   ```

2. **Memoize callbacks**: Prevent re-renders
   ```jsx
   const handleFilesSelected = useCallback((files) => {
     // Handle files
   }, []);
   ```

3. **Limit previews**: For large file counts, virtualize
   ```jsx
   // Consider virtualizing list if >100 files
   import { FixedSizeList } from 'react-window';
   ```

---

## ✅ Quality Assurance Checklist

Testing Scope:
- [ ] Drag-drop single file
- [ ] Drag-drop multiple files
- [ ] Click to browse files
- [ ] Image preview displays
- [ ] PDF icon displays correctly
- [ ] Document icon displays correctly
- [ ] Archive icon displays correctly
- [ ] File size formatting works
- [ ] Filename truncation shows tooltip
- [ ] Remove button works
- [ ] File count limit enforced
- [ ] File size limit enforced
- [ ] File type validation works
- [ ] Error toasts display
- [ ] Success toasts display
- [ ] Responsive on mobile
- [ ] Responsive on tablet
- [ ] Responsive on desktop
- [ ] Keyboard navigation works
- [ ] No memory leaks (check DevTools)

---

## 📞 Support & Documentation

- **Full Documentation**: `FileUploadZone_DOCUMENTATION.md`
- **Implementation Summary**: `FILEUPLOADZONE_IMPLEMENTATION_SUMMARY.md`
- **Component Location**: `client/src/components/workspace/FileUploadZone.jsx`

---

## 🎉 Ready to Use!

The FileUploadZone component is fully implemented, documented, and ready for integration into your pages.

**Next Step**: Integrate into SubmitWork.jsx and ReviewWork.jsx pages
