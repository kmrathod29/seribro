// frontend/src/components/companyComponent/LogoUpload.jsx
// Company Logo Upload Component

import React, { useState, useRef } from 'react';
import { uploadCompanyLogo } from '../../apis/companyProfileApi';
import { Image, Upload, X, AlertCircle, CheckCircle, Trash2 } from 'lucide-react';

const LogoUpload = ({ currentLogo, onUpdate }) => {
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [preview, setPreview] = useState(currentLogo || '');
    const fileInputRef = useRef(null);

    const handleFileSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setMessage('error:Please select a valid image file (PNG, JPG, GIF)');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setMessage('error:File size must be less than 5MB');
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreview(e.target?.result);
        };
        reader.readAsDataURL(file);

        // Upload file
        setLoading(true);
        setMessage('');

        try {
            const updatedData = await uploadCompanyLogo(file);
            onUpdate(updatedData);
            setMessage('success:Logo uploaded successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.message || 'Failed to upload logo'}`);
            setPreview(currentLogo || '');
        } finally {
            setLoading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemovePreview = () => {
        setPreview('');
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Image className="text-gold" size={28} />
                <h3 className="text-2xl font-bold text-white">Company Logo</h3>
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

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Upload Area */}
                <div className="space-y-4">
                    <div>
                        <label className="block text-white font-semibold mb-3 text-lg">Upload New Logo</label>
                        <div
                            onClick={() => !loading && fileInputRef.current?.click()}
                            className={`border-2 border-dashed border-white/30 rounded-xl p-10 text-center cursor-pointer hover:border-gold hover:bg-white/5 transition-all duration-300 ${
                                loading ? 'opacity-50 cursor-not-allowed' : ''
                            }`}
                        >
                            <div className="flex flex-col items-center">
                                <div className="bg-gold/20 p-4 rounded-full mb-4">
                                    <Upload className="text-gold" size={32} />
                                </div>
                                <p className="text-white font-semibold mb-2 text-lg">Click to upload</p>
                                <p className="text-gray-400 text-sm mb-1">or drag and drop</p>
                                <p className="text-gray-500 text-xs">PNG, JPG, GIF up to 5MB</p>
                            </div>
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                disabled={loading}
                                className="hidden"
                            />
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                        <h5 className="text-blue-300 font-semibold mb-2 text-sm">Logo Guidelines:</h5>
                        <ul className="text-gray-300 text-xs space-y-1">
                            <li>• Use square or transparent PNG for best results</li>
                            <li>• Recommended size: 500x500 pixels or higher</li>
                            <li>• Keep file size under 5MB</li>
                            <li>• Ensure logo is clear and professional</li>
                        </ul>
                    </div>
                </div>

                {/* Preview Area */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <label className="block text-white font-semibold text-lg">Logo Preview</label>
                        {preview && (
                            <button
                                onClick={handleRemovePreview}
                                className="text-red-400 hover:text-red-300 flex items-center gap-1 text-sm transition-colors"
                                disabled={loading}
                            >
                                <Trash2 size={16} />
                                Remove
                            </button>
                        )}
                    </div>
                    
                    <div className="bg-white/5 border border-white/20 rounded-xl p-8 flex items-center justify-center" style={{ minHeight: '350px' }}>
                        {preview ? (
                            <div className="text-center w-full">
                                <div className="bg-white/10 rounded-lg p-6 inline-block">
                                    <img
                                        src={preview}
                                        alt="Logo preview"
                                        className="max-h-48 max-w-full mx-auto rounded object-contain"
                                        style={{ maxWidth: '300px' }}
                                    />
                                </div>
                                <p className="text-gray-400 text-sm mt-4">Your company logo</p>
                                {currentLogo && preview === currentLogo && (
                                    <div className="mt-3 inline-flex items-center gap-2 bg-green-500/20 text-green-300 px-3 py-1 rounded-full text-xs">
                                        <CheckCircle size={14} />
                                        Current Logo
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center">
                                <div className="bg-white/5 p-6 rounded-full inline-block mb-4">
                                    <Image className="text-gray-400" size={48} />
                                </div>
                                <p className="text-gray-400 text-lg font-medium mb-1">No logo uploaded yet</p>
                                <p className="text-gray-500 text-sm">Upload a logo to see preview</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Loading indicator */}
            {loading && (
                <div className="mt-6 bg-gold/10 border border-gold/30 rounded-lg p-4 flex items-center justify-center gap-3">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gold"></div>
                    <span className="text-gold font-semibold">Uploading logo...</span>
                </div>
            )}
        </div>
    );
};

export default LogoUpload;