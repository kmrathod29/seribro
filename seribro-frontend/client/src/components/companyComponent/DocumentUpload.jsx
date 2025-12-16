// frontend/src/components/companyComponent/DocumentUpload.jsx
// Company Documents Upload Component

import React, { useState, useRef } from 'react';
import { uploadCompanyDocuments } from '../../apis/companyProfileApi';
import { FileText, Upload, X, AlertCircle, CheckCircle, Download, Eye, File } from 'lucide-react';

const DocumentUpload = ({ documents = [], onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;

        const fileArray = Array.from(files);

        // Validate files
        for (const file of fileArray) {
            const allowedTypes = [
                'application/pdf',
                'image/jpeg',
                'image/png',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
            ];
            
            if (!allowedTypes.includes(file.type)) {
                setMessage('error:Only PDF, DOC, DOCX, JPG, PNG files are allowed');
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                setMessage('error:Each file must be less than 10MB');
                return;
            }
        }

        setLoading(true);
        setMessage('');

        try {
            const updatedData = await uploadCompanyDocuments(fileArray);
            onUpdate(updatedData);
            setMessage(`success:${fileArray.length} document(s) uploaded successfully!`);
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.message || 'Failed to upload documents'}`);
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    const getFileIcon = (mimeType) => {
        if (mimeType?.includes('pdf')) return { icon: '📄', color: 'text-red-400', bg: 'bg-red-500/20' };
        if (mimeType?.includes('image')) return { icon: '🖼️', color: 'text-blue-400', bg: 'bg-blue-500/20' };
        if (mimeType?.includes('word')) return { icon: '📝', color: 'text-blue-400', bg: 'bg-blue-500/20' };
        return { icon: '📎', color: 'text-gray-400', bg: 'bg-gray-500/20' };
    };

    const getFileName = (url, index) => {
        if (!url) return `Document ${index + 1}`;
        const parts = url.split('/');
        const filename = parts[parts.length - 1];
        return decodeURIComponent(filename).substring(0, 40) + (filename.length > 40 ? '...' : '');
    };

    const formatFileSize = (bytes) => {
        if (!bytes) return 'Unknown size';
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <FileText className="text-gold" size={28} />
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">Company Documents</h3>
                    <p className="text-gray-400 text-sm mt-1">Upload verification documents (GST, Registration, ID proof)</p>
                </div>
            </div>

            {message && (
                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                    messageType === 'success' 
                        ? 'bg-green-500/20 border border-green-500 text-green-300'
                        : 'bg-red-500/20 border border-red-500 text-red-300'
                }`}>
                    {messageType === 'success' ? (
                        <CheckCircle size={20} />
                    ) : (
                        <AlertCircle size={20} />
                    )}
                    <span>{messageText}</span>
                </div>
            )}

            <div className="space-y-6">
                {/* Upload Area */}
                <div className="bg-white/5 border border-white/20 rounded-xl p-8">
                    <div
                        onClick={() => !loading && fileInputRef.current?.click()}
                        className={`border-2 border-dashed border-white/30 rounded-xl p-10 text-center cursor-pointer hover:border-gold hover:bg-white/5 transition-all duration-300 ${
                            loading ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                    >
                        <div className="flex flex-col items-center">
                            <div className="bg-gold/20 p-5 rounded-full mb-4">
                                <Upload className="text-gold" size={36} />
                            </div>
                            <p className="text-white font-semibold mb-2 text-lg">Click to upload documents</p>
                            <p className="text-gray-400 mb-1">or drag and drop multiple files</p>
                            <p className="text-gray-500 text-sm">PDF, DOC, DOCX, JPG, PNG • Max 10MB per file</p>
                        </div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            multiple
                            accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                            onChange={handleFileSelect}
                            disabled={loading}
                            className="hidden"
                        />
                    </div>

                    {loading && (
                        <div className="mt-6 bg-gold/10 border border-gold/30 rounded-lg p-4 flex items-center justify-center gap-3">
                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
                            <span className="text-gold font-semibold">Uploading documents...</span>
                        </div>
                    )}
                </div>

                {/* Documents List */}
                {documents && documents.length > 0 ? (
                    <div className="bg-white/5 border border-white/20 rounded-xl p-6">
                        <div className="flex items-center justify-between mb-5">
                            <h4 className="text-white font-semibold text-lg">
                                Uploaded Documents ({documents.length})
                            </h4>
                            <div className="bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-sm flex items-center gap-1">
                                <CheckCircle size={14} />
                                Ready for verification
                            </div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                            {documents.map((doc, index) => {
                                const fileInfo = getFileIcon(doc.type);
                                return (
                                    <div key={index} className="bg-white/10 border border-white/20 rounded-lg p-4 hover:border-gold/50 transition-all duration-300">
                                        <div className="flex items-start gap-3">
                                            <div className={`${fileInfo.bg} p-3 rounded-lg flex-shrink-0`}>
                                                <span className="text-2xl">{fileInfo.icon}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-white font-medium text-sm mb-1 truncate">
                                                    {getFileName(doc.url, index)}
                                                </p>
                                                <p className={`${fileInfo.color} text-xs mb-2`}>
                                                    {doc.type?.split('/')[1]?.toUpperCase() || 'Document'}
                                                </p>
                                                <a
                                                    href={doc.url}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1 bg-gold/20 hover:bg-gold/30 text-gold px-3 py-1.5 rounded text-xs font-semibold transition-all duration-300"
                                                >
                                                    <Eye size={14} />
                                                    View Document
                                                </a>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                ) : (
                    <div className="bg-white/5 border border-white/20 rounded-xl p-12 text-center">
                        <div className="bg-white/5 p-5 rounded-full inline-block mb-4">
                            <FileText className="text-gray-400" size={40} />
                        </div>
                        <p className="text-gray-400 text-lg font-medium mb-1">No documents uploaded yet</p>
                        <p className="text-gray-500 text-sm">Upload your company documents to complete verification</p>
                    </div>
                )}

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-5">
                    <div className="flex gap-3">
                        <AlertCircle className="text-blue-300 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <h5 className="text-blue-300 font-semibold mb-2 text-sm">Required Documents:</h5>
                            <ul className="text-gray-300 text-sm space-y-1">
                                <li>• GST Certificate or Company Registration Document</li>
                                <li>• ID Proof of Authorized Person (Aadhaar, PAN, etc.)</li>
                                <li>• Business Address Proof (optional but recommended)</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DocumentUpload;