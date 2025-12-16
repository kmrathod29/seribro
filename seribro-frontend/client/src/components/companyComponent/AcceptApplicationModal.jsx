// src/components/companyComponent/AcceptApplicationModal.jsx
// Accept Application Modal - Phase 4.3

import React, { useState } from 'react';

const AcceptApplicationModal = ({ isOpen, onClose, onConfirm, loading = false, studentName = '', applicationData = {} }) => {
    const [confirmed, setConfirmed] = useState(false);

    const handleClose = () => {
        setConfirmed(false);
        onClose();
    };

    const handleConfirm = () => {
        if (confirmed) {
            onConfirm();
            handleClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                    <h2 className="text-xl font-bold text-white">Accept Application</h2>
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
                            You are accepting the application from:
                        </p>
                        <p className="text-lg font-semibold text-white mb-4">
                            {studentName || 'Unknown Student'}
                        </p>
                    </div>

                    {/* Important Notice */}
                    <div className="bg-orange-500/10 border border-orange-500/30 rounded p-4 mb-6">
                        <p className="text-sm text-orange-300 font-semibold mb-2">⚠️ Important Notice</p>
                        <p className="text-xs text-orange-200 leading-relaxed">
                            By accepting this application:
                        </p>
                        <ul className="text-xs text-orange-200 mt-2 space-y-1 ml-4">
                            <li>✓ This student will be assigned the project</li>
                            <li>✓ Project status will change to "Assigned"</li>
                            <li>✓ All other pending applications will be auto-rejected</li>
                            <li>✓ All students will be notified of the rejection</li>
                        </ul>
                    </div>

                    {/* Application Summary */}
                    {applicationData && (
                        <div className="bg-slate-700/50 rounded p-4 mb-6 text-sm">
                            <p className="text-gray-400 mb-3 font-semibold">Application Summary:</p>
                            <div className="space-y-2 text-gray-300">
                                <div className="flex justify-between">
                                    <span>Proposed Price:</span>
                                    <span className="font-semibold">₹{applicationData.proposedPrice}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Est. Timeline:</span>
                                    <span>{applicationData.estimatedTime}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Skill Match:</span>
                                    <span className="font-semibold">{applicationData.skillMatch}%</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Confirmation Checkbox */}
                    <div className="mb-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={confirmed}
                                onChange={(e) => setConfirmed(e.target.checked)}
                                disabled={loading}
                                className="w-4 h-4 rounded cursor-pointer"
                            />
                            <span className="text-sm text-gray-300">
                                I confirm accepting this application and auto-rejecting others
                            </span>
                        </label>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-3">
                        <button
                            onClick={handleClose}
                            disabled={loading}
                            className="w-full sm:flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleConfirm}
                            disabled={loading || !confirmed}
                            className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-semibold"
                        >
                            {loading ? 'Accepting...' : 'Accept Application'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AcceptApplicationModal;
