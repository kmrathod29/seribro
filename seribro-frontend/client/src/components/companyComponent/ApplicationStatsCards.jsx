// src/components/companyComponent/ApplicationStatsCards.jsx
// Application Statistics Cards - Phase 4.3

import React from 'react';
import { Clipboard, Hourglass, Star, CheckCircle, XCircle, Sparkles } from 'lucide-react';

const ApplicationStatsCards = ({ stats = {} }) => {
    // Default stats
    const {
        total = 0,
        pending = 0,
        shortlisted = 0,
        accepted = 0,
        rejected = 0,
        newToday = 0,
    } = stats;

    // Stat cards configuration
    const statCards = [
        {
            label: 'Total Applications',
            value: total,
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500',
            textColor: 'text-blue-300',
            icon: Clipboard,
        },
        {
            label: 'Pending',
            value: pending,
            bgColor: 'bg-orange-500/10',
            borderColor: 'border-orange-500',
            textColor: 'text-orange-300',
            icon: Hourglass,
        },
        {
            label: 'Shortlisted',
            value: shortlisted,
            bgColor: 'bg-blue-500/10',
            borderColor: 'border-blue-500',
            textColor: 'text-blue-300',
            icon: Star,
        },
        {
            label: 'Accepted',
            value: accepted,
            bgColor: 'bg-green-500/10',
            borderColor: 'border-green-500',
            textColor: 'text-green-300',
            icon: CheckCircle,
        },
        {
            label: 'Rejected',
            value: rejected,
            bgColor: 'bg-red-500/10',
            borderColor: 'border-red-500',
            textColor: 'text-red-300',
            icon: XCircle,
        },
        {
            label: 'New Today',
            value: newToday,
            bgColor: 'bg-yellow-500/10',
            borderColor: 'border-yellow-500',
            textColor: 'text-yellow-300',
            icon: Sparkles,
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {statCards.map((card, index) => (
                <div
                    key={index}
                    className={`${card.bgColor} border ${card.borderColor} border-opacity-30 rounded-lg p-4 backdrop-blur-sm hover:shadow-lg transition-shadow`}
                >
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-sm text-gray-400 mb-2">{card.label}</p>
                            <p className={`text-3xl font-bold ${card.textColor}`}>{card.value}</p>
                        </div>
                        <span className="text-2xl">
                            {(() => {
                                const Icon = card.icon;
                                return Icon ? <Icon size={28} className={`inline-block ${card.textColor}`} /> : null;
                            })()}
                        </span>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default ApplicationStatsCards;
