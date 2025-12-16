// src/components/companyComponent/ApplicationCard.jsx
// Application Card Component - Phase 4.3

import React from 'react';
import { Link } from 'react-router-dom';

const ApplicationCard = ({
    application,
    onShortlist,
    onAccept,
    onReject,
    loading = false,
}) => {
    const getStatusBadgeClass = (status) => {
        const statusMap = {
            pending: 'bg-orange-500/20 border-orange-500 text-orange-300',
            shortlisted: 'bg-blue-500/20 border-blue-500 text-blue-300',
            accepted: 'bg-green-500/20 border-green-500 text-green-300',
            rejected: 'bg-red-500/20 border-red-500 text-red-300',
        };
        return statusMap[status] || 'bg-gray-500/20 border-gray-500 text-gray-300';
    };

    const getSkillMatchColor = (skillMatch) => {
        if (skillMatch >= 80) return 'text-green-400';
        if (skillMatch >= 60) return 'text-yellow-400';
        if (skillMatch >= 40) return 'text-orange-400';
        return 'text-red-400';
    };

    return (
        <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/70 transition-colors">
            {/* Header - Student Info & Status */}
            <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                    <h3 className="text-lg font-semibold text-white mb-1">
                        {application.studentName || 'Unknown Student'}
                    </h3>
                    <p className="text-sm text-gray-400">{application.studentEmail}</p>
                    <p className="text-xs text-gray-500 mt-1">
                        {application.studentCollege || 'College Not Specified'}
                    </p>
                </div>
                <div className={`border px-3 py-1 rounded text-sm font-medium ${getStatusBadgeClass(application.status)}`}>
                    {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                </div>
            </div>

            {/* Skills & Skill Match */}
            <div className="mb-4 pb-4 border-b border-slate-700">
                <div className="mb-2">
                    <p className="text-xs text-gray-500 mb-1">Skills Match</p>
                    <div className="flex items-center gap-2">
                        <div className="flex-1 bg-slate-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-orange-500 to-green-500 h-2 rounded-full"
                                style={{ width: `${application.skillMatch || 0}%` }}
                            ></div>
                        </div>
                        <span className={`text-sm font-semibold ${getSkillMatchColor(application.skillMatch || 0)}`}>
                            {application.skillMatch || 0}%
                        </span>
                    </div>
                </div>

                {/* Student Skills */}
                {application.studentSkills && application.studentSkills.length > 0 && (
                    <div className="mt-3">
                        <p className="text-xs text-gray-500 mb-2">Student Skills</p>
                        <div className="flex flex-wrap gap-2">
                            {application.studentSkills.slice(0, 4).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="inline-block bg-blue-500/20 border border-blue-500 text-blue-300 text-xs px-2 py-1 rounded"
                                >
                                    {skill}
                                </span>
                            ))}
                            {application.studentSkills.length > 4 && (
                                <span className="inline-block text-xs text-gray-400 px-2 py-1">
                                    +{application.studentSkills.length - 4} more
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Application Details */}
            <div className="mb-4 pb-4 border-b border-slate-700">
                <div className="grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500 text-xs">Applied Date</p>
                        <p className="text-white">
                            {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs">Proposed Price</p>
                        <p className="text-white font-semibold">₹{application.proposedPrice}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs">Est. Time</p>
                        <p className="text-white">{application.estimatedTime}</p>
                    </div>
                    <div>
                        <p className="text-gray-500 text-xs">Status Duration</p>
                        <p className="text-white text-xs">
                            {new Date(application.appliedAt).toLocaleDateString()}
                        </p>
                    </div>
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <Link
                    to={`/company/applications/${application._id}`}
                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-center"
                >
                    View Details
                </Link>

                {application.status === 'pending' && (
                    <>
                        <button
                            onClick={() => onShortlist(application._id)}
                            disabled={loading}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Shortlist"
                        >
                            ⭐
                        </button>
                        <button
                            onClick={() => onAccept(application._id)}
                            disabled={loading}
                            className="bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Accept"
                        >
                            ✅
                        </button>
                        <button
                            onClick={() => onReject(application._id)}
                            disabled={loading}
                            className="bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Reject"
                        >
                            ❌
                        </button>
                    </>
                )}

                {application.status === 'shortlisted' && (
                    <>
                        <button
                            onClick={() => onAccept(application._id)}
                            disabled={loading}
                            className="flex-1 bg-green-600 hover:bg-green-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Accept
                        </button>
                        <button
                            onClick={() => onReject(application._id)}
                            disabled={loading}
                            className="flex-1 bg-red-600 hover:bg-red-700 text-white text-sm py-2 px-3 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Reject
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

export default ApplicationCard;
