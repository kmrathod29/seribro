// src/pages/company/ProjectDetails.jsx
// Project details and management page - Phase 4.1

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, ArrowLeft, Edit2, Trash2, Users, Calendar, DollarSign } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getProjectDetails, deleteProject, formatApiError } from '../../apis/companyProjectApi';

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [deleteConfirm, setDeleteConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProjectDetails(id);

            if (response.success) {
                setProject(response.data.project);
            } else {
                setError(response.message);
            }
        } catch (err) {
            const apiError = formatApiError(err);
            setError(apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            const response = await deleteProject(id);

            if (response.success) {
                navigate('/company/projects');
            } else {
                setError(response.message);
            }
        } catch (err) {
            const apiError = formatApiError(err);
            setError(apiError.message);
        } finally {
            setDeleting(false);
            setDeleteConfirm(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader className="animate-spin text-gold mx-auto mb-4" size={40} />
                        <p className="text-gray-300">Loading project details...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="max-w-4xl mx-auto px-4 py-20">
                    <button
                        onClick={() => navigate('/company/projects')}
                        className="flex items-center gap-2 text-gold hover:text-yellow-400 mb-6"
                    >
                        <ArrowLeft size={20} /> Back to Projects
                    </button>
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-8 text-center">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
                        <p className="text-red-200 text-lg">{error}</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

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
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-20">
                {/* Back Button */}
                <button
                    onClick={() => navigate('/company/projects')}
                    className="flex items-center gap-2 text-gold hover:text-yellow-400 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Projects
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-xl p-8 mb-8">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-4xl font-bold text-white mb-2">{project.title}</h1>
                            <p className="text-gold text-lg">{project.category}</p>
                        </div>
                        <span className={`px-4 py-2 text-sm font-semibold rounded-full border ${statusColors[project.status]}`}>
                            {project.status.toUpperCase()}
                        </span>
                    </div>

                    <p className="text-gray-300 mb-6">{project.description}</p>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Budget</p>
                            <p className="text-white font-semibold">{formatBudget(project.budgetMin)} - {formatBudget(project.budgetMax)}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Duration</p>
                            <p className="text-white font-semibold">{project.projectDuration}</p>
                        </div>
                        <div className="bg-white/10 rounded-lg p-4">
                            <p className="text-gray-400 text-sm mb-1">Deadline</p>
                            <p className="text-white font-semibold">{formatDate(project.deadline)}</p>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        {project.status === 'open' && (
                            <button
                                onClick={() => navigate(`/company/projects/${id}/edit`)}
                                className="flex items-center gap-2 px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 rounded-lg transition-all"
                            >
                                <Edit2 size={18} /> Edit Project
                            </button>
                        )}
                        <button
                            onClick={() => setDeleteConfirm(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 rounded-lg transition-all"
                        >
                            <Trash2 size={18} /> Delete Project
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6 border-b border-gold/20">
                    <button
                        onClick={() => setActiveTab('overview')}
                        className={`px-6 py-3 font-semibold transition-all ${
                            activeTab === 'overview'
                                ? 'text-gold border-b-2 border-gold'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Overview
                    </button>
                    <button
                        onClick={() => setActiveTab('applications')}
                        className={`px-6 py-3 font-semibold transition-all ${
                            activeTab === 'applications'
                                ? 'text-gold border-b-2 border-gold'
                                : 'text-gray-400 hover:text-white'
                        }`}
                    >
                        Applications ({project.applicationsCount || 0})
                    </button>
                </div>

                {/* Content */}
                {activeTab === 'overview' && (
                    <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-xl p-8">
                        <div className="mb-8">
                            <h3 className="text-xl font-bold text-white mb-4">Required Skills</h3>
                            <div className="flex flex-wrap gap-2">
                                {project.requiredSkills.map((skill) => (
                                    <span key={skill} className="px-3 py-1 bg-gold/20 border border-gold text-gold rounded-full text-sm">
                                        {skill}
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div>
                            <h3 className="text-xl font-bold text-white mb-4">Project Information</h3>
                            <div className="space-y-3 text-gray-300">
                                <p>
                                    <span className="text-gold font-semibold">Created:</span> {formatDate(project.createdAt)}
                                </p>
                                <p>
                                    <span className="text-gold font-semibold">Last Updated:</span> {formatDate(project.updatedAt)}
                                </p>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'applications' && (
                    <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-xl p-8">
                        <p className="text-gray-300">
                            {project.applicationsCount > 0
                                ? `You have ${project.applicationsCount} application(s) for this project.`
                                : 'No applications yet. Keep waiting!'}
                        </p>
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirm && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-navy border border-gold rounded-lg p-6 max-w-sm w-full">
                        <h3 className="text-white font-bold text-lg mb-4">Delete Project?</h3>
                        <p className="text-gray-300 mb-6">
                            Are you sure you want to delete this project? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteConfirm(false)}
                                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDelete}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white font-semibold rounded-lg transition-all"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ProjectDetails;
