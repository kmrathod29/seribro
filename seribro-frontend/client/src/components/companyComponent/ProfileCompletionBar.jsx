// frontend/src/components/companyComponent/ProfileCompletionBar.jsx
// Company Profile Completion Indicator

import React from 'react';
import { CheckCircle, AlertCircle, Clock } from 'lucide-react';

const CompanyProfileCompletionBar = ({ percentage, status }) => {
    const isComplete = percentage === 100;
    const normalizedStatus = (status || 'draft').toLowerCase();
    
    const getColorClass = () => {
        if (percentage < 50) return 'from-red-500 to-red-600';
        if (percentage < 100) return 'from-amber-500 to-amber-600';
        return 'from-emerald-500 to-emerald-600';
    };

    const getStatusBadgeStyle = () => {
        if (normalizedStatus === 'approved') return 'bg-emerald-500/20 text-emerald-300 border-emerald-500';
        if (normalizedStatus === 'pending') return 'bg-amber-500/20 text-amber-300 border-amber-500';
        if (normalizedStatus === 'rejected') return 'bg-red-500/20 text-red-300 border-red-500';
        return 'bg-gray-500/20 text-gray-300 border-gray-500';
    };

    const getStatusText = () => {
        if (normalizedStatus === 'approved') return 'Verified';
        if (normalizedStatus === 'pending') return 'Pending Review';
        if (normalizedStatus === 'rejected') return 'Rejected';
        return 'Draft';
    };

    const getStatusIcon = () => {
        if (normalizedStatus === 'approved') return <CheckCircle size={16} />;
        if (normalizedStatus === 'pending') return <Clock size={16} />;
        return <AlertCircle size={16} />;
    };

    return (
        <div className="w-full">
            {/* Header Section */}
            <div className="flex justify-between items-center mb-4">
                <div>
                    <h3 className="text-xl font-bold text-white">Profile Completion</h3>
                    <p className="text-sm text-gray-300 mt-1">Complete your profile to get verified</p>
                </div>
                <span className={`text-3xl font-bold ${isComplete ? 'text-gold' : 'text-white'}`}>
                    {percentage}%
                </span>
            </div>

            {/* Progress Bar Track */}
            <div className="w-full bg-white/10 rounded-full h-4 mb-6 overflow-hidden">
                {/* Progress Bar Fill */}
                <div 
                    className={`h-full rounded-full transition-all duration-1000 ease-out bg-gradient-to-r ${getColorClass()}`}
                    style={{ width: `${percentage}%` }}
                    role="progressbar"
                    aria-valuenow={percentage}
                    aria-valuemin="0"
                    aria-valuemax="100"
                ></div>
            </div>

            {/* Footer / Status Section */}
            <div className="flex items-center justify-between pt-4 border-t border-white/20">
                <span className="text-sm font-semibold text-white">Verification Status:</span>
                
                <div className={`flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold capitalize ${getStatusBadgeStyle()}`}>
                    {getStatusIcon()}
                    {getStatusText()}
                </div>
            </div>
        </div>
    );
};

export default CompanyProfileCompletionBar;