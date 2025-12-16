// src/pages/company/MyProjects.jsx
// Company's project management page - Phase 4.1

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Loader, AlertCircle, Search, Trash2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProjectCard from '../../components/companyComponent/ProjectCard';
import ProjectStats from '../../components/companyComponent/ProjectStats';
import { getMyProjects, getProjectStats, deleteProject, formatApiError } from '../../apis/companyProjectApi';

const MyProjects = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [deleteConfirm, setDeleteConfirm] = useState(null);

    useEffect(() => {
        loadProjects();
        loadStats();
    }, [activeTab, currentPage, searchTerm]);

    const loadProjects = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getMyProjects(currentPage, 10, activeTab === 'all' ? 'all' : activeTab, searchTerm);

            if (response.success) {
                setProjects(response.data.projects);
                setTotalPages(response.data.pagination.pages);
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

    const loadStats = async () => {
        try {
            const response = await getProjectStats();
            if (response.success) {
                setStats(response.data.stats);
            }
        } catch (err) {
            console.error('Failed to load stats:', err);
        }
    };

    const handleDeleteProject = async () => {
        if (!deleteConfirm) return;

        try {
            const response = await deleteProject(deleteConfirm);
            if (response.success) {
                setProjects(projects.filter((p) => p._id !== deleteConfirm));
                setDeleteConfirm(null);
                loadStats();
            }
        } catch (err) {
            const apiError = formatApiError(err);
            setError(apiError.message);
        }
    };

    const tabs = [
        { id: 'all', label: 'All Projects' },
        { id: 'open', label: 'Open' },
        { id: 'assigned', label: 'Assigned' },
        { id: 'in-progress', label: 'In Progress' },
        { id: 'completed', label: 'Completed' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 py-20">
                {/* Header */}
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">My Projects</h1>
                        <p className="text-gold">Manage and track your project postings</p>
                    </div>
                    <button
                        onClick={() => navigate('/company/post-project')}
                        className="flex items-center gap-2 px-6 py-3 bg-gold hover:bg-yellow-400 text-navy font-bold rounded-lg transition-all duration-300"
                    >
                        <Plus size={20} /> Post Project
                    </button>
                </div>

                {/* Stats */}
                <ProjectStats stats={stats} loading={loading} />

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex gap-3">
                        <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
                        <p className="text-red-200">{error}</p>
                    </div>
                )}

                {/* Search and Tabs */}
                <div className="mb-8">
                    <div className="mb-4">
                        <div className="relative">
                            <Search className="absolute left-3 top-3 text-gold" size={20} />
                            <input
                                type="text"
                                placeholder="Search projects..."
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full pl-10 pr-4 py-2 bg-navy/50 border border-gold/20 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                            />
                        </div>
                    </div>

                    {/* Tabs */}
                    <div className="flex flex-wrap gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => {
                                    setActiveTab(tab.id);
                                    setCurrentPage(1);
                                }}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                    activeTab === tab.id
                                        ? 'bg-gold text-navy'
                                        : 'bg-navy/50 text-gold border border-gold/20 hover:border-gold/50'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {loading && (
                    <div className="flex items-center justify-center py-20">
                        <div className="text-center">
                            <Loader className="animate-spin text-gold mx-auto mb-4" size={40} />
                            <p className="text-gray-300">Loading projects...</p>
                        </div>
                    </div>
                )}

                {/* Projects Grid */}
                {!loading && projects.length === 0 ? (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg mb-4">No projects found</p>
                        <button
                            onClick={() => navigate('/company/post-project')}
                            className="px-6 py-2 bg-gold hover:bg-yellow-400 text-navy font-bold rounded-lg transition-all duration-300"
                        >
                            Create Your First Project
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                        {projects.map((project) => (
                            <ProjectCard
                                key={project._id}
                                project={project}
                                onView={() => navigate(`/company/projects/${project._id}`)}
                                onEdit={() => navigate(`/company/projects/${project._id}/edit`)}
                                onDelete={() => setDeleteConfirm(project._id)}
                            />
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {!loading && totalPages > 1 && (
                    <div className="flex justify-center gap-2">
                        {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                            <button
                                key={page}
                                onClick={() => setCurrentPage(page)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 ${
                                    currentPage === page
                                        ? 'bg-gold text-navy'
                                        : 'bg-navy/50 text-gold border border-gold/20 hover:border-gold/50'
                                }`}
                            >
                                {page}
                            </button>
                        ))}
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
                                onClick={() => setDeleteConfirm(null)}
                                className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all duration-300"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleDeleteProject}
                                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-all duration-300"
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default MyProjects;
