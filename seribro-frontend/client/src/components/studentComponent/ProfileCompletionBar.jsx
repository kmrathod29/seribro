// frontend/src/components/Profile/ProfileCompletionBar.jsx
import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react'; // Optional: Install lucide-react for icons

const ProfileCompletionBar = ({ percentage, status }) => {
    // Determine colors based on completion
    const isComplete = percentage === 100;
    
    // Color logic for the bar
    const getColorClass = () => {
        if (percentage < 50) return 'bg-red-500';
        if (percentage < 100) return 'bg-amber-500';
        return 'bg-emerald-500';
    };

    // Status Badge logic
    const getStatusBadgeStyle = () => {
        const normalizedStatus = status.toLowerCase();
        if (normalizedStatus === 'verified') return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        if (normalizedStatus === 'pending') return 'bg-amber-100 text-amber-700 border-amber-200';
        return 'bg-gray-100 text-gray-700 border-gray-200';
    };

    return (
        // Use wider max width so the inner card fills more of the available space on larger dashboards
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 w-full max-w-2xl">
            {/* Header Section */}
            <div className="flex justify-between items-end mb-2">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800">Profile Completion</h3>
                    <p className="text-sm text-gray-500">Complete your profile to get verified.</p>
                </div>
                <span className={`text-3xl font-bold ${isComplete ? 'text-emerald-600' : 'text-gray-700'}`}>
                    {percentage}%
                </span>
            </div>

            {/* Progress Bar Track */}
            {/* Slightly taller progress bar for better visual weight on wider layouts */}
            <div className="w-full bg-gray-100 rounded-full h-4 mb-6 overflow-hidden">
                {/* Progress Bar Fill */}
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out ${getColorClass()}`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>

            {/* Footer / Status Section */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                <span className="text-sm font-medium text-gray-600">Current Status:</span>
                
                <div className={`flex items-center gap-2 px-3 py-1 rounded-full border text-sm font-medium capitalize ${getStatusBadgeStyle()}`}>
                    {isComplete && status === 'Verified' ? <CheckCircle size={14} /> : <AlertCircle size={14} />}
                    {status}
                </div>
            </div>
        </div>
    );
};

export default ProfileCompletionBar;