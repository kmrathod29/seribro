# FileUploadZone Component Documentation

**Location:** `client/src/components/workspace/FileUploadZone.jsx`

**Sub-Phase:** 5.4.2 - Work Submission & Review UX Enhancement

---

## Overview

FileUploadZone is a **reusable, drag-drop file upload component** with built-in validation, preview grid, and error handling. It provides a modern, accessible file upload experience for work submissions and document uploads throughout the workspace.

---

## Features

### ✅ Drag & Drop
- Users can drag files onto the upload zone
- Visual feedback (border color change, background highlight) when dragging
- Click-to-browse functionality as fallback

### ✅ File Validation
- **Maximum file count** validation
- **File size** validation per file (default 100MB)
- **File type** validation against accepted MIME types
- Clear error toasts for each validation failure

### ✅ Preview Grid
- **Image files**: Display thumbnail preview
- **PDF files**: Show PDF icon
- **Document files**: Show document icon
- **Archive files**: Show archive icon
- **Generic files**: Show generic file icon
- Each preview card shows:
  - Thumbnail/icon
  - Filename (truncated to 30 chars)
  - File size in human-readable format (KB/MB/GB)
  - Remove (X) button with hover reveal

### ✅ UI/UX
- Responsive grid (2 columns mobile, 3 columns tablet, 4 columns desktop)
- Dashed border zone with hover states
- Tailwind CSS styling matching project design
- React-hot-toast notifications for user feedback
- Lucide-react icons for visual consistency

### ✅ File Management
- Remove files from selection before upload
- Preserve already uploaded files in separate section
- Clean up object URLs to prevent memory leaks

---

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `onFilesSelected` | `function` | Required | Callback when files pass validation. Receives array of File objects. |
| `maxFiles` | `number` | `10` | Maximum number of files allowed (including existing) |
| `maxSizePerFile` | `number` | `100 * 1024 * 1024` | Max file size in bytes (100MB default) |
| `acceptedTypes` | `array` | See defaults | Array of accepted MIME types or wildcards (e.g., `['image/*', 'application/pdf']`) |
| `existingFiles` | `array` | `[]` | Array of already uploaded files for display |
| `onRemoveFile` | `function` | `null` | Callback when removing an existing file. Receives index. |
| `selectedFiles` | `array` | `[]` | Currently selected files (for counting against maxFiles) |
| `onFileRemove` | `function` | `null` | Callback to remove selected file (alternative pattern) |

---

## Default Accepted File Types

```javascript
[
  'image/jpeg',
  'image/png',
  'image/gif',
  'image/webp',
  'application/pdf',
  'application/msword',                                          // .doc
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',  // .docx
  'application/vnd.ms-excel',                                   // .xls
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',  // .xlsx
  'application/zip',
  'application/x-rar-compressed',
  'text/plain',
]
```

---

## Usage Example

### Basic Usage
```jsx
import FileUploadZone from '../../components/workspace/FileUploadZone';

function SubmitWorkPage() {
  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFilesSelected = (files) => {
    // files is an array of File objects
    setSelectedFiles(Array.from(files));
    // Store in formData later for submission
  };

  return (
    <div className="p-6">
      <h2>Submit Your Work</h2>
      <FileUploadZone
        onFilesSelected={handleFilesSelected}
        maxFiles={10}
        maxSizePerFile={100 * 1024 * 1024}
      />
      
      {selectedFiles.length > 0 && (
        <button 
          onClick={() => submitWorkFiles(selectedFiles)}
          className="mt-6 px-4 py-2 bg-yellow-400 text-navy rounded font-semibold"
        >
          Submit Work
        </button>
      )}
    </div>
  );
}
```

### With Existing Files
```jsx
const existingFiles = [
  {
    id: '1',
    filename: 'previous-submission-v1.pdf',
    type: 'pdf',
    size: 2048000,
    url: 'https://cloudinary.com/...',
  }
];

function ReviseWorkPage() {
  const handleRemoveExisting = (index) => {
    // Handle removal of existing file
    console.log('Remove existing file at index:', index);
  };

  return (
    <FileUploadZone
      onFilesSelected={handleFilesSelected}
      existingFiles={existingFiles}
      onRemoveFile={handleRemoveExisting}
      maxFiles={10}
    />
  );
}
```

### Custom Accepted Types
```jsx
<FileUploadZone
  onFilesSelected={handleFilesSelected}
  acceptedTypes={['application/pdf', 'image/png', 'image/jpeg']}
  maxSizePerFile={50 * 1024 * 1024}  // 50MB
/>
```

---

## Component Behavior

### File Selection Flow
1. User drags files OR clicks to browse
2. FileUploadZone validates each file:
   - Total count check
   - Individual file size check
   - File type check
3. Invalid files show error toasts
4. Valid files:
   - Create preview objects
   - Generate thumbnails for images
   - Call `onFilesSelected` callback
   - Show success toast
5. Previews appear in grid below upload zone

### File Removal
- Click X button on preview card
- File removed from state
- Object URL cleaned up (memory leak prevention)
- Success toast shown

### Existing Files Section
- Appears if `existingFiles` prop is provided
- Shows separate "Already Uploaded" heading
- Each file has remove button if `onRemoveFile` provided
- Styling indicates read-only vs. removable

---

## State Management

### Internal State
```javascript
const [isDragging, setIsDragging] = useState(false);  // Drag-over state
const [previews, setPreviews] = useState([]);         // Selected file previews
```

### Data Structure
Each preview object:
```javascript
{
  id: number,              // Random temp ID
  file: File,              // Original File object
  name: string,            // Filename
  size: string,            // Formatted size (KB/MB)
  type: string,            // 'image'|'pdf'|'document'|'archive'|'file'
  objectUrl: string|null   // Blob URL for image previews
}
```

---

## Styling Details

### Upload Zone
- **Default**: Dashed gray border, dark background, semi-transparent
- **Hover**: Border color lightens, background slightly brighter
- **Dragging**: Bright blue border, blue-tinted background, slight scale increase

### Preview Cards
- **Grid**: 2 columns (mobile) → 3 columns (tablet) → 4 columns (desktop)
- **Card**: Dark background with gray border, rounded corners
- **Hover**: Border transitions to yellow, remove button appears
- **Icon Area**: 80px square with centered icon/thumbnail

### Icons (from lucide-react)
- **Images**: Thumbnail preview
- **PDFs**: `FileText` (red)
- **Documents**: `FileImage` (blue)
- **Archives**: `FileArchive` (yellow)
- **Generic**: `File` (gray)

---

## Error Handling

### Toast Notifications
- **File count exceeded**: `"Maximum X files allowed. You already have Y file(s)."`
- **File too large**: `"[filename] exceeds max size (X MB)"`
- **Invalid type**: `"[filename] is not an allowed file type. Allowed: [types]"`
- **Success**: `"N file(s) added successfully"`
- **Removal**: `"File removed"`

### Graceful Fallbacks
- Missing file size → Shows "Uploaded"
- Missing preview URL → Uses placeholder icon
- Invalid MIME type → Shows generic file icon

---

## Performance Considerations

### Memory Management
- Object URLs for image previews are revoked when:
  - File is removed
  - Component unmounts (should add cleanup in parent)
- Prevents memory leaks from accumulating blob URLs

### Validation Optimization
- Single pass validation loop
- Early returns for invalid files
- Toast shown per error (not batched)

---

## Accessibility

- Keyboard navigable (click to browse works with keyboard)
- Clear visual feedback for drag state
- Semantic HTML with proper labels
- Color contrast meets WCAG standards
- Icon labels via `title` attributes

---

## Integration Points

### For SubmitWork Page
```jsx
import FileUploadZone from '../../components/workspace/FileUploadZone';

// In form:
<FileUploadZone
  onFilesSelected={(files) => {
    files.forEach(f => formData.append('workFiles', f));
  }}
  maxFiles={process.env.REACT_APP_WORK_MAX_FILES || 10}
  maxSizePerFile={process.env.REACT_APP_WORK_MAX_FILE_SIZE_MB * 1024 * 1024 || 100MB}
/>
```

### For ReviewWork Page
```jsx
// Show existing submission files, allow company to review
<FileUploadZone
  existingFiles={currentSubmission.files.map(f => ({
    filename: f.originalName,
    type: getFileType(f.fileType),
    url: f.url,
    size: f.size,
  }))}
  onRemoveFile={null}  // Company cannot remove
/>
```

---

## Testing Checklist

- [ ] Drag single file → shown in preview
- [ ] Drag multiple files → all shown
- [ ] Drag file exceeding size → error toast, not added
- [ ] Drag unsupported filetype → error toast, not added
- [ ] Exceed maxFiles → error toast with count
- [ ] Click remove (X) → file disappears, tooltip shows
- [ ] Click upload zone → file browser opens
- [ ] Image file → thumbnail displays
- [ ] PDF file → red PDF icon displays
- [ ] Document file → blue document icon displays
- [ ] Archive file → yellow archive icon displays
- [ ] Responsive on mobile (2 cols) → correct layout
- [ ] Responsive on tablet (3 cols) → correct layout
- [ ] Responsive on desktop (4 cols) → correct layout
- [ ] Filename truncation at 30 chars → tooltip shows full name
- [ ] File size formatting → shows KB, MB appropriately
- [ ] Memory cleanup → no blob URL leaks

---

## Browser Compatibility

- Modern browsers (Chrome, Firefox, Safari, Edge)
- Uses HTML5 File API
- Uses FileReader for object URLs
- Drag-Drop API supported in all modern browsers

---

## Future Enhancements

1. **Upload Progress**: Add progress bar during upload
2. **Thumbnail Generation**: Generate thumbnails for PDFs using pdf.js
3. **Image Optimization**: Compress images before upload
4. **Paste Support**: Allow pasting images from clipboard
5. **Camera Capture**: Mobile camera integration
6. **Batch Download**: Download all files as ZIP
7. **Duplicate Detection**: Warn if duplicate filename uploaded
8. **Virus Scanning**: Integrate antivirus scanning API

---

## Dependencies

- `react` - Component framework
- `react-hot-toast` - Notifications
- `lucide-react` - Icons
- `tailwindcss` - Styling

---

## Author Notes

This component is designed to be:
- **Reusable**: Work in multiple contexts (submissions, reviews, etc.)
- **Accessible**: Keyboard navigable, clear feedback
- **Performant**: Efficient validation, proper cleanup
- **User-friendly**: Clear errors, visual feedback, mobile-friendly

Do not integrate into pages yet. This is a standalone component for testing and refinement.
