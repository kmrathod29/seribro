// src/components/studentComponent/ProfileIncompleteModal.jsx
// Modal blocking project details access until profile complete - Phase 4.2

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, ArrowLeft } from 'lucide-react';

const ProfileIncompleteModal = ({
    isOpen,
    onClose,
    currentCompletion = 0,
    verificationStatus = 'draft',
}) => {
    const navigate = useNavigate();

    if (!isOpen) return null;

    const handleCompleteProfile = () => {
        navigate('/student/profile');
    };

    const handleGoBack = () => {
        navigate(-1);
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop - cannot be dismissed by clicking */}
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

            {/* Modal Content */}
            <div className="relative z-10 w-full max-w-md mx-4 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-white/10 shadow-2xl p-8">
                {/* Icon */}
                <div className="flex justify-center mb-6">
                    <div className="relative">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-xl" />
                        <AlertCircle className="relative w-16 h-16 text-red-400" />
                    </div>
                </div>

                {/* Title */}
                <h2 className="text-2xl font-bold text-center text-white mb-2">
                    Complete Your Profile First
                </h2>

                {/* Description */}
                <p className="text-center text-gray-300 mb-6">
                    You must complete your profile to 100% and get admin approval before viewing project details and applying to projects.
                </p>

                {/* Current Status */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6">
                    {/* Completion Percentage */}
                    <div className="mb-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-300">
                                Profile Completion
                            </span>
                            <span className="text-sm font-bold text-amber-400">
                                {currentCompletion}%
                            </span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <div
                                className="bg-gradient-to-r from-amber-500 to-amber-400 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${currentCompletion}%` }}
                            />
                        </div>
                    </div>

                    {/* Verification Status */}
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-400">Verification Status</span>
                        <span
                            className={`text-xs font-semibold px-3 py-1 rounded-full ${
                                verificationStatus === 'approved'
                                    ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                                    : verificationStatus === 'pending'
                                    ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                                    : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                            }`}
                        >
                            {verificationStatus === 'approved'
                                ? '✓ Approved'
                                : verificationStatus === 'pending'
                                ? 'Pending'
                                : 'Not Submitted'}
                        </span>
                    </div>
                </div>

                {/* Requirements List */}
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-300 mb-3">Requirements:</h3>
                    <ul className="space-y-2">
                        <li className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                                currentCompletion === 100 ? 'bg-green-400' : 'bg-gray-500'
                            }`} />
                            <span className="text-sm text-gray-400">
                                Complete your profile to 100%
                            </span>
                        </li>
                        <li className="flex items-start gap-2">
                            <div className={`w-1.5 h-1.5 rounded-full mt-1.5 ${
                                verificationStatus === 'approved' ? 'bg-green-400' : 'bg-gray-500'
                            }`} />
                            <span className="text-sm text-gray-400">
                                Get admin approval for your profile
                            </span>
                        </li>
                    </ul>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3">
                    <button
                        onClick={handleGoBack}
                        className="flex items-center justify-center gap-2 flex-1 px-4 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/20 text-gray-300 font-medium transition-colors duration-200"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Go Back
                    </button>
                    <button
                        onClick={handleCompleteProfile}
                        className="flex-1 px-4 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 font-semibold transition-all duration-200 transform hover:scale-105"
                    >
                        Complete Profile
                    </button>
                </div>

                {/* Info Text */}
                <p className="text-center text-xs text-gray-500 mt-6">
                    This modal will close once your profile is 100% complete and admin verified.
                </p>
            </div>
        </div>
    );
};

export default ProfileIncompleteModal;
