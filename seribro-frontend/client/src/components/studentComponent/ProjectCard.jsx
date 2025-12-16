// src/components/studentComponent/ProjectCard.jsx
// Project card for browse projects page - Phase 4.2

import React, { useEffect } from 'react';
import { Briefcase, MapPin, Clock, TrendingUp } from 'lucide-react';

const ProjectCard = ({ project, onViewDetails }) => {
    const { title, category, budgetMin, budgetMax, deadline, requiredSkills, company, skillMatch, assignedStudent } = project;

    // Debug: Log project data to check if company is present
    useEffect(() => {
        console.log('ProjectCard received project:', {
            title,
            company,
            budgetMin,
            budgetMax,
        });
    }, [project]);

    // Format budget
    const formatBudget = (amount) => {
        if (amount === null || amount === undefined) {
            return 'N/A'; // Default value if budget is missing
        }
        return '₹' + amount.toLocaleString('en-IN');
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            month: 'short',
            day: 'numeric',
        });
    };

    // Get skill match color
    const getMatchColor = () => {
        if (skillMatch >= 70) return 'bg-green-500/20 text-green-300 border-green-500/30';
        if (skillMatch >= 40) return 'bg-amber-500/20 text-amber-300 border-amber-500/30';
        return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
    };

    return (
        <div className="group h-full bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 border border-white/10 rounded-xl overflow-hidden hover:border-amber-500/30 transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/10 flex flex-col">
            {/* Header with Title */}
            <div className="p-4 border-b border-white/5">
                <div className="flex items-start justify-between gap-2 mb-3">
                    <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors truncate flex-1">
                        {title}
                    </h3>
                    <div className="flex items-center gap-2">
                        {/* PART 7: Show "Project Assigned" badge if assigned */}
                        {assignedStudent && (
                            <div className="px-2 py-1 rounded text-xs font-semibold border whitespace-nowrap bg-gray-500/20 text-gray-300 border-gray-500/30">
                                Project Assigned
                            </div>
                        )}
                        {skillMatch >= 40 && !assignedStudent && (
                            <div className={`px-2 py-1 rounded text-xs font-semibold border whitespace-nowrap ${getMatchColor()}`}>
                                {skillMatch}% Match
                            </div>
                        )}
                    </div>
                </div>

                {/* Company Info - Prominently Displayed */}
                {company ? (
                    <div className="flex items-center gap-2 mb-3 p-2 bg-white/5 rounded border border-white/10">
                        {company.logo && (
                            <img
                                src={company.logo}
                                alt={company.name}
                                className="w-6 h-6 rounded-full object-cover flex-shrink-0"
                            />
                        )}
                        <div className="flex-1 min-w-0">
                            <span className="text-xs font-semibold text-amber-300 truncate block">by {company.name}</span>
                            <span className="text-xs text-gray-400 flex items-center gap-1 truncate">
                                <MapPin className="w-3 h-3 text-blue-400 flex-shrink-0" />
                                <span className="truncate">{company.city}</span>
                            </span>
                        </div>
                        {company.isVerified && (
                            <span className="px-1.5 py-0.5 rounded text-xs font-semibold border bg-green-500/20 text-green-300 border-green-500/30 whitespace-nowrap flex-shrink-0">
                                ✔
                            </span>
                        )}
                    </div>
                ) : null}

                {/* Category */}
                <div className="flex items-center gap-2">
                    <Briefcase className="w-3 h-3 text-amber-400" />
                    <span className="text-xs text-gray-400">{category}</span>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-4 space-y-3">
                {/* Budget */}
                <div>
                    <div className="text-xs text-gray-500 mb-1">Budget Range</div>
                    <div className="text-sm font-semibold text-amber-400">
                        {formatBudget(budgetMin)} - {formatBudget(budgetMax)}
                    </div>
                </div>

                {/* Deadline */}
                <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-blue-400" />
                    <span>Deadline: {formatDate(deadline)}</span>
                </div>

                {/* Skills Preview */}
                {requiredSkills && requiredSkills.length > 0 && (
                    <div>
                        <div className="text-xs text-gray-500 mb-2">Required Skills</div>
                        <div className="flex flex-wrap gap-1">
                            {requiredSkills.slice(0, 3).map((skill, idx) => (
                                <span
                                    key={idx}
                                    className="px-2 py-1 rounded text-xs bg-white/5 text-gray-300 border border-white/10"
                                >
                                    {skill}
                                </span>
                            ))}
                            {requiredSkills.length > 3 && (
                                <span className="px-2 py-1 rounded text-xs bg-white/5 text-gray-400 border border-white/10">
                                    +{requiredSkills.length - 3}
                                </span>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Button */}
            <div className="p-4 border-t border-white/5">
                <button
                    onClick={() => onViewDetails(project._id)}
                    className="w-full px-4 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 font-semibold text-sm transition-all duration-200 transform group-hover:scale-105"
                >
                    View Details
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
