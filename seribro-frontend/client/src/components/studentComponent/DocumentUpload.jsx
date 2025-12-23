// frontend/src/components/Profile/DocumentUpload.jsx
// Resume & College ID upload component with consistent UX and immediate previews

import React, { useState } from 'react';
import { uploadResume, uploadCollegeId } from '../../apis/studentProfileApi';
import { Upload, FileText, Image, CheckCircle, AlertCircle, X, File } from 'lucide-react';

const DocumentUpload = ({ type, currentDocument, onRefresh }) => {
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(null); // image preview for college ID
    const [uploadedDocument, setUploadedDocument] = useState(null); // latest uploaded doc from API (Cloudinary URL)

    const config = {
        resume: {
            title: 'Resume',
            description: 'PDF format only, max 5MB',
            endpoint: uploadResume,
            accept: '.pdf',
            icon: FileText,
            color: 'blue'
        },
        collegeId: {
            title: 'College ID',
            description: 'Only image files, max 5MB',
            endpoint: uploadCollegeId,
            accept: 'image/*',
            icon: Image,
            color: 'green'
        },
    };

    // Validation: Check if type is valid
    if (!config[type]) {
        return (
            <div className="bg-red-500/20 border border-red-500 rounded-lg p-4">
                <p className="text-red-300 flex items-center gap-2">
                    <AlertCircle size={18} />
                    Invalid document type: "{type}". Valid types are: resume, collegeId, certificates
                </p>
            </div>
        );
    }

    const { title, description, endpoint, accept, multiple, icon: Icon, color } = config[type];

    const colorClasses = {
        blue: 'border-blue-500 bg-blue-500/10',
        green: 'border-green-500 bg-green-500/10',
        purple: 'border-purple-500 bg-purple-500/10'
    };

    const handleFileChange = (e) => {
        const selectedFiles = e.target.files;
        
        if (!selectedFiles || selectedFiles.length === 0) {
            return;
        }

        // File size validation (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB in bytes
        let invalidSize = false;
        
        for (let i = 0; i < selectedFiles.length; i++) {
            if (selectedFiles[i].size > maxSize) {
                invalidSize = true;
                break;
            }
        }
        
        if (invalidSize) {
            setMessage('error:File size must be less than 5MB');
            return;
        }

        if (multiple) {
            setFile(selectedFiles);
        } else {
            setFile(selectedFiles[0]);
            
            // Create preview for single image file
            if (selectedFiles[0].type.startsWith('image/')) {
                const reader = new FileReader();
                reader.onloadend = () => {
                    setPreview(reader.result);
                };
                reader.readAsDataURL(selectedFiles[0]);
            } else {
                setPreview(null);
            }
        }
        setMessage('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!file || (multiple && file.length === 0)) {
            setMessage('error:Please select a file to upload');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            // Call API and capture the uploaded document payload (contains Cloudinary URL)
            const uploaded = await endpoint(file);

            // Normalise the document shape so UI doesn't care about `url` vs `path`
            if (uploaded) {
                const normalised = {
                    ...uploaded,
                    url: uploaded.path || uploaded.url || uploaded.secure_url || null,
                };
                setUploadedDocument(normalised);
            }

            setMessage('success:File uploaded successfully!');
            setFile(null);
            setPreview(null);
            if (onRefresh) onRefresh();
            
            // Reset file input
            const fileInput = document.getElementById(`file-upload-${type}`);
            if (fileInput) fileInput.value = '';
            
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to upload file';
            setMessage(`error:${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const clearFile = () => {
        setFile(null);
        setPreview(null);
        setMessage('');
        const fileInput = document.getElementById(`file-upload-${type}`);
        if (fileInput) fileInput.value = '';
    };

    const getFileName = () => {
        if (multiple && file) {
            return `${file.length} file(s) selected`;
        }
        return file ? file.name : '';
    };

    // Prefer the most recent upload response for preview; fall back to parent-provided document
    const effectiveCurrentDocument = uploadedDocument || currentDocument || null;

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    return (
        <div className="border-2 rounded-xl p-6 transition-all border-white/20 bg-white/5 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-3 rounded-lg bg-gradient-to-br from-white/10 to-white/5">
                    <Icon className="text-gold" size={24} />
                </div>
                <div>
                    <h4 className="text-lg font-bold text-white">{title}</h4>
                    <p className="text-sm text-gray-400">{description}</p>
                </div>
            </div>

            {/* Current / Just Uploaded Document Status - Only show if no file is being edited */}
            {!file && effectiveCurrentDocument && (effectiveCurrentDocument.path || effectiveCurrentDocument.url) && (
                <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-6">
                    <p className="text-sm text-gray-300 mb-3 font-medium">
                        {uploadedDocument ? '✓ Just uploaded' : '✓ Current Document'}
                    </p>
                    <a 
                        href={effectiveCurrentDocument.path || effectiveCurrentDocument.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-gold hover:text-yellow-400 text-sm flex items-center gap-2 break-all"
                    >
                        <CheckCircle size={16} className="flex-shrink-0" />
                        <span className="break-words">{effectiveCurrentDocument.filename || (type === 'resume' ? 'View Resume' : 'View Document')}</span>
                    </a>
                </div>
            )}

            {/* Message Display */}
            {message && (
                <div className={`mb-4 p-3 rounded-lg flex items-center gap-2 text-sm ${
                    messageType === 'success' 
                        ? 'bg-green-500/20 border border-green-500 text-green-300'
                        : 'bg-red-500/20 border border-red-500 text-red-300'
                }`}>
                    {messageType === 'success' ? (
                        <CheckCircle size={16} />
                    ) : (
                        <AlertCircle size={16} />
                    )}
                    {messageText}
                </div>
            )}

            {/* Upload Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
                {/* File Input */}
                <div>
                    <input
                        type="file"
                        id={`file-upload-${type}`}
                        accept={accept}
                        multiple={multiple}
                        onChange={handleFileChange}
                        className="hidden"
                    />
                    <label 
                        htmlFor={`file-upload-${type}`}
                        className="flex items-center justify-center gap-2 w-full px-4 py-3 bg-white/10 border-2 border-dashed border-white/30 rounded-lg text-white hover:bg-white/20 hover:border-gold cursor-pointer transition-all"
                    >
                        <Upload size={20} />
                        <span>{file ? 'Change File' : 'Choose File'}</span>
                    </label>
                </div>

                {/* Selected File Display */}
                {file && (
                    <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 flex-1 min-w-0">
                                <FileText size={18} className="text-gold flex-shrink-0" />
                                <span className="text-white text-sm truncate">{getFileName()}</span>
                            </div>
                            <button
                                type="button"
                                onClick={clearFile}
                                className="text-red-400 hover:text-red-300 p-1"
                            >
                                <X size={18} />
                            </button>
                        </div>
                        
                        {/* Image Preview */}
                        {preview && (
                            <div className="mt-3">
                                <img 
                                    src={preview} 
                                    alt="Preview" 
                                    className="w-full h-40 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>
                )}

                {/* Upload Button */}
                <button 
                    type="submit" 
                    disabled={loading || !file}
                    className="w-full bg-gradient-to-r from-gold to-yellow-400 hover:shadow-lg hover:shadow-gold/50 text-navy font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy"></div>
                            Uploading...
                        </>
                    ) : (
                        <>
                            <Upload size={20} />
                            Upload {title}
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default DocumentUpload;