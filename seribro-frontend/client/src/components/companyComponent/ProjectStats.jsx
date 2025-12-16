// src/components/companyComponent/ProjectStats.jsx
// Project statistics cards - Phase 4.1

import React from 'react';
import { Briefcase, TrendingUp, Clock, CheckCircle, XCircle } from 'lucide-react';

const ProjectStats = ({ stats = {}, loading = false }) => {
    const defaultStats = {
        total: 0,
        open: 0,
        assigned: 0,
        'in-progress': 0,
        completed: 0,
        cancelled: 0,
    };

    const displayStats = { ...defaultStats, ...stats };

    const statCards = [
        { label: 'Total Projects', value: displayStats.total, icon: Briefcase, color: 'text-blue-400' },
        { label: 'Open', value: displayStats.open, icon: TrendingUp, color: 'text-green-400' },
        { label: 'In Progress', value: displayStats['in-progress'], icon: Clock, color: 'text-purple-400' },
        { label: 'Completed', value: displayStats.completed, icon: CheckCircle, color: 'text-cyan-400' },
    ];

    return (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {statCards.map((stat) => {
                const Icon = stat.icon;
                return (
                    <div
                        key={stat.label}
                        className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-lg p-6 hover:border-gold/50 transition-all duration-300"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <Icon size={24} className={stat.color} />
                        </div>
                        <p className="text-gray-400 text-sm mb-2">{stat.label}</p>
                        <p className="text-2xl font-bold text-white">{loading ? '-' : stat.value}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default ProjectStats;
