// src/components/workspace/FileUploadZone.jsx
// Sub-Phase 5.4.2: Reusable Drag-Drop File Upload Component

import React, { useState, useRef } from 'react';
import toast from 'react-hot-toast';
import {
  FileText,
  FileImage,
  FileArchive,
  File,
  X,
  Upload,
} from 'lucide-react';

/**
 * FileUploadZone Component
 * Reusable drag-drop file upload with validation and preview
 *
 * Props:
 * - onFilesSelected: callback function (files) when files are valid
 * - maxFiles: maximum number of files allowed (default 10)
 * - maxSizePerFile: max file size in bytes (default 100MB)
 * - acceptedTypes: array of MIME types or extensions (e.g., ['image/*', 'application/pdf'])
 * - existingFiles: array of already uploaded files (for display)
 * - onRemoveFile: callback when removing an existing file
 * - selectedFiles: currently selected files (optional)
 * - onFileRemove: callback to remove selected file
 */
const FileUploadZone = ({
  onFilesSelected,
  maxFiles = 10,
  maxSizePerFile = 100 * 1024 * 1024, // 100MB default
  acceptedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/zip',
    'application/x-rar-compressed',
    'text/plain',
  ],
  existingFiles = [],
  onRemoveFile = null,
  selectedFiles = [],
  onFileRemove = null,
}) => {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [previews, setPreviews] = useState([]);

  // Format file size to human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  // Get file extension
  const getFileExtension = (filename) => {
    return filename.split('.').pop().toLowerCase();
  };

  // Get icon based on file type
  const getFileIcon = (file) => {
    const type = file.type;
    const ext = getFileExtension(file.name);

    if (type.startsWith('image/')) {
      return 'image';
    } else if (type === 'application/pdf') {
      return 'pdf';
    } else if (
      type === 'application/msword' ||
      type ===
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ) {
      return 'document';
    } else if (
      type === 'application/zip' ||
      type === 'application/x-rar-compressed'
    ) {
      return 'archive';
    }
    return 'file';
  };

  // Truncate filename to max length
  const truncateFilename = (filename, maxLength = 30) => {
    if (filename.length <= maxLength) return filename;
    const ext = filename.split('.').pop();
    const name = filename.slice(0, filename.lastIndexOf('.'));
    const truncated = name.slice(0, maxLength - ext.length - 3) + '...';
    return truncated + '.' + ext;
  };

  // Validate files
  const validateFiles = (files) => {
    const fileArray = Array.from(files);
    const errors = [];
    const validFiles = [];

    // Check total count
    const totalFiles = selectedFiles.length + existingFiles.length + fileArray.length;
    if (totalFiles > maxFiles) {
      toast.error(
        `Maximum ${maxFiles} files allowed. You already have ${selectedFiles.length + existingFiles.length} file(s).`
      );
      return [];
    }

    // Validate each file
    fileArray.forEach((file) => {
      // Check file size
      if (file.size > maxSizePerFile) {
        errors.push(
          `"${file.name}" exceeds max size (${formatFileSize(maxSizePerFile)})`
        );
        return;
      }

      // Check file type
      const isValidType = acceptedTypes.some(
        (type) =>
          type === file.type ||
          (type.includes('*') &&
            file.type.startsWith(type.replace('/*', '')))
      );

      if (!isValidType) {
        errors.push(
          `"${file.name}" is not an allowed file type. Allowed: ${acceptedTypes.join(', ')}`
        );
        return;
      }

      validFiles.push(file);
    });

    // Show errors
    if (errors.length > 0) {
      errors.forEach((error) => toast.error(error));
    }

    return validFiles;
  };

  // Handle file selection from input or drag-drop
  const handleFiles = (files) => {
    const validFiles = validateFiles(files);

    if (validFiles.length > 0) {
      // Create preview data for each file
      const newPreviews = validFiles.map((file) => {
        const preview = {
          id: Math.random(), // temporary id
          file,
          name: file.name,
          size: formatFileSize(file.size),
          type: getFileIcon(file),
          objectUrl: null,
        };

        // Create object URL for image previews
        if (preview.type === 'image') {
          preview.objectUrl = URL.createObjectURL(file);
        }

        return preview;
      });

      setPreviews((prev) => [...prev, ...newPreviews]);
      onFilesSelected && onFilesSelected(validFiles);
      toast.success(`${validFiles.length} file(s) added successfully`);
    }
  };

  // Handle file input change
  const handleFileInput = (e) => {
    handleFiles(e.target.files);
    // Reset input so same file can be selected again
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle drag events
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = e.dataTransfer.files;
    handleFiles(droppedFiles);
  };

  // Remove file from preview
  const removeFile = (id) => {
    setPreviews((prev) => {
      const toRemove = prev.find((p) => p.id === id);
      // Clean up object URL
      if (toRemove?.objectUrl) {
        URL.revokeObjectURL(toRemove.objectUrl);
      }
      return prev.filter((p) => p.id !== id);
    });
    toast.success('File removed');
  };

  // Click to browse
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full">
      {/* Upload Zone */}
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleBrowseClick}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center cursor-pointer
          transition-all duration-200 ease-in-out
          ${
            isDragging
              ? 'border-blue-500 bg-blue-50/10 scale-105'
              : 'border-gray-400 bg-gray-900/30 hover:border-blue-400 hover:bg-blue-50/5'
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          onChange={handleFileInput}
          accept={acceptedTypes.join(',')}
          className="hidden"
        />

        <Upload className="w-10 h-10 mx-auto mb-3 text-gray-400" />
        <h3 className="text-lg font-semibold text-gray-200 mb-1">
          Drag & Drop files here
        </h3>
        <p className="text-sm text-gray-400 mb-3">
          or click to browse from your computer
        </p>
        <p className="text-xs text-gray-500">
          Max {maxFiles} files • {formatFileSize(maxSizePerFile)} per file
        </p>
      </div>

      {/* File Input Instructions */}
      <p className="text-xs text-gray-500 mt-3">
        <strong>Accepted formats:</strong> Images (JPG, PNG, GIF), PDF, Documents (DOC, DOCX), Archives (ZIP, RAR)
      </p>

      {/* Preview Grid */}
      {previews.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Selected Files ({previews.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {previews.map((preview) => (
              <div
                key={preview.id}
                className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 relative group hover:border-yellow-400 transition-colors"
              >
                {/* Remove Button */}
                <button
                  onClick={() => removeFile(preview.id)}
                  className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Remove file"
                >
                  <X className="w-4 h-4" />
                </button>

                {/* File Preview/Icon */}
                <div className="mb-2 h-20 flex items-center justify-center bg-gray-900/50 rounded">
                  {preview.type === 'image' && preview.objectUrl ? (
                    <img
                      src={preview.objectUrl}
                      alt={preview.name}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : preview.type === 'pdf' ? (
                    <FileText className="w-10 h-10 text-red-400" />
                  ) : preview.type === 'document' ? (
                    <FileImage className="w-10 h-10 text-blue-400" />
                  ) : preview.type === 'archive' ? (
                    <FileArchive className="w-10 h-10 text-yellow-400" />
                  ) : (
                    <File className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <p
                  className="text-xs font-medium text-gray-300 truncate"
                  title={preview.name}
                >
                  {truncateFilename(preview.name)}
                </p>
                <p className="text-xs text-gray-500">{preview.size}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Existing Files Display */}
      {existingFiles.length > 0 && (
        <div className="mt-6">
          <h4 className="text-sm font-semibold text-gray-300 mb-3">
            Already Uploaded ({existingFiles.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {existingFiles.map((file, idx) => (
              <div
                key={idx}
                className="bg-gray-800/50 border border-gray-600 rounded-lg p-3 relative group"
              >
                {/* Remove Button */}
                {onRemoveFile && (
                  <button
                    onClick={() => onRemoveFile(idx)}
                    className="absolute top-1 right-1 bg-red-500/80 hover:bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Remove file"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}

                {/* File Preview/Icon */}
                <div className="mb-2 h-20 flex items-center justify-center bg-gray-900/50 rounded">
                  {file.type === 'image' && file.objectUrl ? (
                    <img
                      src={file.objectUrl || file.url}
                      alt={file.name || file.filename}
                      className="max-w-full max-h-full object-contain rounded"
                    />
                  ) : file.type === 'pdf' ? (
                    <FileText className="w-10 h-10 text-red-400" />
                  ) : file.type === 'document' ? (
                    <FileImage className="w-10 h-10 text-blue-400" />
                  ) : file.type === 'archive' ? (
                    <FileArchive className="w-10 h-10 text-yellow-400" />
                  ) : (
                    <File className="w-10 h-10 text-gray-400" />
                  )}
                </div>

                {/* File Info */}
                <p
                  className="text-xs font-medium text-gray-300 truncate"
                  title={file.name || file.filename}
                >
                  {truncateFilename(file.name || file.filename)}
                </p>
                <p className="text-xs text-gray-500">
                  {file.size ? formatFileSize(file.size) : 'Uploaded'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUploadZone;
