// src/components/companyComponent/RejectApplicationModal.jsx
// Reject Application Modal - Phase 4.3

import React, { useState } from 'react';

const RejectApplicationModal = ({ isOpen, onClose, onConfirm, loading = false, studentName = '' }) => {
    const [reason, setReason] = useState('');
    const [error, setError] = useState('');

    const handleClose = () => {
        setReason('');
        setError('');
        onClose();
    };

    const handleSubmit = () => {
        setError('');

        // Validation
        if (!reason.trim()) {
            setError('Rejection reason zaroori hai');
            return;
        }

        if (reason.length < 10) {
            setError('Rejection reason kam se kam 10 characters ka hona chahiye');
            return;
        }

        if (reason.length > 500) {
            setError('Rejection reason 500 characters se zyada nahi ho sakta');
            return;
        }

        onConfirm(reason);
        handleClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md">
                {/* Header */}
                <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Reject Application</h2>
                    <button
                        onClick={handleClose}
                        className="text-gray-400 hover:text-white transition-colors text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    <div className="mb-6">
                        <p className="text-gray-300 mb-2">
                            You are about to reject the application from:
                        </p>
                        <p className="text-lg font-semibold text-white">
                            {studentName || 'Unknown Student'}
                        </p>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 p-3 rounded mb-4 text-sm">
                            {error}
                        </div>
                    )}

                    {/* Rejection Reason Input */}
                    <div className="mb-6">
                        <label className="block text-sm font-semibold text-white mb-2">
                            Rejection Reason *
                        </label>
                        <p className="text-xs text-gray-400 mb-2">
                            Provide a constructive reason (10-500 characters)
                        </p>
                        <textarea
                            value={reason}
                            onChange={(e) => setReason(e.target.value)}
                            placeholder="e.g., Skills don't match project requirements, or We found more suitable candidates..."
                            className="w-full bg-slate-700 border border-slate-600 rounded p-3 text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 resize-none"
                            rows="4"
                            disabled={loading}
                        />
                        <p className="text-xs text-gray-400 mt-1">
                            {reason.length}/500 characters
                        </p>
                    </div>

                    {/* Info Message */}
                    <div className="bg-blue-500/10 border border-blue-500/30 p-3 rounded mb-6 text-xs text-blue-300">
                        💡 The student will receive a notification with this reason.
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={loading || !reason.trim()}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? 'Rejecting...' : 'Reject Application'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RejectApplicationModal;
