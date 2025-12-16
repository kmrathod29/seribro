// src/components/companyComponent/StudentProfileModal.jsx
// Student Profile Modal - Phase 4.3

import React, { useState, useEffect } from 'react';
import { getApplicationDetails } from '../../apis/companyApplicationApi';

const StudentProfileModal = ({ applicationId, isOpen, onClose, onAction }) => {
    const [application, setApplication] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && applicationId) {
            fetchApplicationDetails();
        }
    }, [isOpen, applicationId]);

    const fetchApplicationDetails = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getApplicationDetails(applicationId);
            if (response.success) {
                setApplication(response.data);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load application details');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-800 border border-slate-700 rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-slate-800 border-b border-slate-700 p-6 flex items-center justify-between">
                    <h2 className="text-2xl font-bold text-white">Student Profile</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-white transition-colors text-2xl"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="p-6">
                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
                            <p className="text-gray-400 mt-4">Loading profile...</p>
                        </div>
                    ) : error ? (
                        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded">
                            {error}
                        </div>
                    ) : application ? (
                        <>
                            {/* Student Header */}
                            <div className="mb-6 pb-6 border-b border-slate-700">
                                <div className="flex items-start gap-4">
                                    {application.studentPhoto && (
                                        <img
                                            src={application.studentPhoto}
                                            alt={application.studentName}
                                            className="w-16 h-16 rounded-lg object-cover"
                                        />
                                    )}
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-white mb-1">
                                            {application.studentName || 'Unknown Student'}
                                        </h3>
                                        <p className="text-blue-400">{application.studentEmail || ''}</p>
                                        <p className="text-gray-400 text-sm mt-1">
                                            {application.studentCollege || ''}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Skills Section */}
                            <div className="mb-6">
                                <h4 className="text-lg font-semibold text-white mb-3">Skills</h4>
                                <div className="flex flex-wrap gap-2">
                                    {application.studentSkills && application.studentSkills.length > 0 ? (
                                        application.studentSkills.map((skill, idx) => (
                                            <span
                                                key={idx}
                                                className="bg-blue-500/20 border border-blue-500 text-blue-300 text-sm px-3 py-1 rounded"
                                            >
                                                {skill}
                                            </span>
                                        ))
                                    ) : (
                                        <p className="text-gray-400 text-sm">No skills specified</p>
                                    )}
                                </div>
                            </div>

                            {/* Application Details */}
                            <div className="mb-6 pb-6 border-b border-slate-700">
                                <h4 className="text-lg font-semibold text-white mb-3">Application Details</h4>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Applied Date:</span>
                                        <span className="text-white">
                                            {new Date(application.appliedAt).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Proposed Price:</span>
                                        <span className="text-white font-semibold">
                                            ₹{application.proposedPrice}
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Est. Timeline:</span>
                                        <span className="text-white">{application.estimatedTime}</span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Skill Match:</span>
                                        <span className="text-white font-semibold">
                                            {application.skillMatch || 0}%
                                        </span>
                                    </div>
                                    <div className="flex justify-between">
                                        <span className="text-gray-400">Status:</span>
                                        <span className={`font-semibold px-2 py-1 rounded text-xs ${
                                            application.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                                            application.status === 'shortlisted' ? 'bg-blue-500/20 text-blue-300' :
                                            application.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                                            'bg-red-500/20 text-red-300'
                                        }`}>
                                            {application.status ? (application.status.charAt(0).toUpperCase() + application.status.slice(1)) : 'Unknown'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Cover Letter */}
                            <div className="mb-6 pb-6 border-b border-slate-700">
                                <h4 className="text-lg font-semibold text-white mb-3">Cover Letter</h4>
                                <p className="text-gray-300 leading-relaxed">
                                    {application.coverLetter}
                                </p>
                            </div>

                            {/* Resume */}
                            {application.studentResume && (
                                <div className="mb-6">
                                    <h4 className="text-lg font-semibold text-white mb-3">Resume</h4>
                                    <a
                                        href={application.studentResume}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors"
                                    >
                                        📄 Download Resume
                                    </a>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex gap-2 pt-4 border-t border-slate-700">
                                <button
                                    onClick={onClose}
                                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 px-4 rounded transition-colors"
                                >
                                    Close
                                </button>
                                {application.status === 'pending' && (
                                    <>
                                        <button
                                            onClick={() => onAction('shortlist')}
                                            className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white py-2 px-4 rounded transition-colors"
                                        >
                                            Shortlist
                                        </button>
                                        <button
                                            onClick={() => onAction('accept')}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => onAction('reject')}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                                {application.status === 'shortlisted' && (
                                    <>
                                        <button
                                            onClick={() => onAction('accept')}
                                            className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded transition-colors"
                                        >
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => onAction('reject')}
                                            className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded transition-colors"
                                        >
                                            Reject
                                        </button>
                                    </>
                                )}
                            </div>
                        </>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default StudentProfileModal;
