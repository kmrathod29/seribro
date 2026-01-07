// src/components/companyComponent/ProjectCard.jsx
// Project card component - Phase 4.1

import React from 'react';
import { Calendar, IndianRupee, Users, Briefcase, Trash2, Edit2, Eye } from 'lucide-react';

const ProjectCard = ({ project, onView, onEdit, onDelete }) => {
    const formatDate = (date) => new Date(date).toLocaleDateString('en-IN');
    const formatBudget = (amount) => `₹${parseInt(amount).toLocaleString('en-IN')}`;

    const statusColors = {
        open: 'bg-green-500/20 text-green-400 border-green-500/30',
        assigned: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
        'in-progress': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
        completed: 'bg-gray-500/20 text-gray-400 border-gray-500/30',
        cancelled: 'bg-red-500/20 text-red-400 border-red-500/30',
    };

    return (
        <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-lg p-6 hover:border-gold/50 transition-all duration-300 hover:shadow-lg hover:shadow-gold/10">
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">{project.title}</h3>
                    <p className="text-sm text-gold">{project.category}</p>
                </div>
                <span className={`px-3 py-1 text-xs font-semibold rounded-full border ${statusColors[project.status]}`}>
                    {project.status.toUpperCase()}
                </span>
            </div>

            {/* Description */}
            <p className="text-gray-300 text-sm mb-4 line-clamp-2">{project.description}</p>

            {/* Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 py-4 border-y border-gray-700">
                <div className="flex items-center gap-2">
                    <IndianRupee size={16} className="text-gold" />
                    <div className="text-sm">
                        <p className="text-gray-500 text-xs">Budget</p>
                        <p className="text-white font-semibold">{formatBudget(project.budgetMin)} - {formatBudget(project.budgetMax)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gold" />
                    <div className="text-sm">
                        <p className="text-gray-500 text-xs">Deadline</p>
                        <p className="text-white font-semibold">{formatDate(project.deadline)}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Briefcase size={16} className="text-gold" />
                    <div className="text-sm">
                        <p className="text-gray-500 text-xs">Duration</p>
                        <p className="text-white font-semibold">{project.projectDuration}</p>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    <Users size={16} className="text-gold" />
                    <div className="text-sm">
                        <p className="text-gray-500 text-xs">Applications</p>
                        <p className="text-white font-semibold">{project.applicationsCount || 0}</p>
                    </div>
                </div>
            </div>

            {/* Skills */}
            <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Required Skills</p>
                <div className="flex flex-wrap gap-1">
                    {project.requiredSkills.slice(0, 3).map((skill) => (
                        <span key={skill} className="px-2 py-1 bg-gold/10 text-gold text-xs rounded-full border border-gold/20">
                            {skill}
                        </span>
                    ))}
                    {project.requiredSkills.length > 3 && (
                        <span className="px-2 py-1 bg-gold/10 text-gold text-xs rounded-full border border-gold/20">
                            +{project.requiredSkills.length - 3}
                        </span>
                    )}
                </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
                <button
                    onClick={() => onView()}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all duration-300 text-sm font-semibold"
                >
                    <Eye size={16} /> View
                </button>
                {project.status === 'open' && (
                    <button
                        onClick={() => onEdit()}
                        className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 rounded-lg transition-all duration-300 text-sm font-semibold"
                    >
                        <Edit2 size={16} /> Edit
                    </button>
                )}
                <button
                    onClick={() => onDelete()}
                    className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all duration-300 text-sm font-semibold"
                >
                    <Trash2 size={16} /> Delete
                </button>
            </div>
        </div>
    );
};

export default ProjectCard;
