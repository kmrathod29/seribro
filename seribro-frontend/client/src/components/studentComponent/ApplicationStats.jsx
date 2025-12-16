// src/components/studentComponent/ApplicationStats.jsx
// Application statistics cards - Phase 4.2

import React from 'react';
import { FileText, Clock, CheckCircle, XCircle } from 'lucide-react';

const ApplicationStats = ({ stats = {}, loading = false }) => {
    const statCards = [
        {
            label: 'Total Applications',
            value: stats.total || 0,
            icon: FileText,
            color: 'from-blue-500/20 to-blue-600/20',
            textColor: 'text-blue-300',
            iconColor: 'text-blue-400',
        },
        {
            label: 'Pending',
            value: stats.pending || 0,
            icon: Clock,
            color: 'from-amber-500/20 to-amber-600/20',
            textColor: 'text-amber-300',
            iconColor: 'text-amber-400',
        },
        {
            label: 'Shortlisted',
            value: stats.shortlisted || 0,
            icon: CheckCircle,
            color: 'from-green-500/20 to-green-600/20',
            textColor: 'text-green-300',
            iconColor: 'text-green-400',
        },
        {
            label: 'Accepted',
            value: stats.accepted || 0,
            icon: CheckCircle,
            color: 'from-emerald-500/20 to-emerald-600/20',
            textColor: 'text-emerald-300',
            iconColor: 'text-emerald-400',
        },
    ];

    if (loading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className="h-24 bg-white/5 border border-white/10 rounded-lg animate-pulse"
                    />
                ))}
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {statCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={index}
                        className={`bg-gradient-to-br ${stat.color} border border-white/10 rounded-lg p-4 hover:border-white/20 transition-colors`}
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-xs text-gray-400 mb-1">{stat.label}</p>
                                <p className={`text-2xl font-bold ${stat.textColor}`}>
                                    {stat.value}
                                </p>
                            </div>
                            <Icon className={`w-5 h-5 ${stat.iconColor}`} />
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default ApplicationStats;
