// src/pages/company/CompanyApplications.jsx
// Company Applications Management Page - Phase 4.3

import React, { useState, useEffect, useCallback } from 'react';
import {
    getAllApplications,
    getApplicationStats,
    shortlistApplication,
    approveStudentForProject, // Phase 4.5
    rejectApplication,
    deleteApplication,
} from '../../apis/companyApplicationApi';
import { getMyProjects } from '../../apis/companyProjectApi';
import Navbar from '../../components/Navbar';
import ApplicationStatsCards from '../../components/companyComponent/ApplicationStatsCards';
import ApplicationCard from '../../components/companyComponent/ApplicationCard';
import AcceptApplicationModal from '../../components/companyComponent/AcceptApplicationModal';
import RejectApplicationModal from '../../components/companyComponent/RejectApplicationModal';
// Note: no routing used here; removed unused Link import

const CompanyApplications = () => {
    // State Management
    const [applications, setApplications] = useState([]);
    const [projects, setProjects] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    // Filters
    const [selectedProject, setSelectedProject] = useState('all');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [limit, setLimit] = useState(20);

    // Modals
    const [showAcceptModal, setShowAcceptModal] = useState(false);
    const [showRejectModal, setShowRejectModal] = useState(false);
    const [selectedApplication, setSelectedApplication] = useState(null);

    // NOTE: data-fetching effects are declared after the fetch helpers below

    const fetchApplications = useCallback(async () => {
        try {
            setError('');
            const response = await getAllApplications(currentPage, limit, selectedStatus, selectedProject);

            if (response.success) {
                let apps = response.data.applications || [];
                // If status filter is 'all', show everything returned by the backend
                // otherwise, the backend already filters by `status`.
                setApplications(apps);
                setTotalPages(response.data.pages || 1);
            } else {
                setError(response.message);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load applications');
        }
    }, [currentPage, limit, selectedStatus, selectedProject]);

    const fetchInitialData = useCallback(async () => {
        try {
            setLoading(true);
            setError('');

            const [projectsRes, statsRes] = await Promise.all([
                getMyProjects(1, 100),
                getApplicationStats(),
            ]);

            if (projectsRes.success) {
                setProjects(projectsRes.data.projects || []);
            }

            if (statsRes.success) {
                setStats(statsRes.data);
            }

            await fetchApplications();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    }, [fetchApplications]);

    const fetchStats = useCallback(async () => {
        try {
            const response = await getApplicationStats();
            if (response.success) {
                setStats(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch stats:', err);
        }
    }, []);

    // Initial Load
    useEffect(() => {
        fetchInitialData();
    }, [fetchInitialData]);

    // Fetch when filters change
    useEffect(() => {
        fetchApplications();
    }, [fetchApplications]);

    // Fetch Stats periodically
    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000); // Every 30 seconds
        return () => clearInterval(interval);
    }, [fetchStats]);

    // Action Handlers
    const handleViewApplication = (applicationId) => {
        // Set the selected application object so other components/modals can use it.
        const application = applications.find(app => app._id === applicationId);
        if (!application) {
            setError('Application not found. Please refresh the page.');
            return;
        }
        setSelectedApplication(application);
    };

    const handleShortlist = async (applicationId) => {
        try {
            setActionLoading(true);
            const response = await shortlistApplication(applicationId);

            if (response.success) {
                setSuccess('Application shortlisted successfully!');
                await fetchApplications();
                await fetchStats();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to shortlist application');
        } finally {
            setActionLoading(false);
        }
    };

    const handleAcceptClick = (applicationId) => {
        // Find the application object from the applications array
        const application = applications.find(app => app._id === applicationId);
        if (!application) {
            setError('Application not found. Please refresh the page.');
            return;
        }
        setSelectedApplication(application);
        setShowAcceptModal(true);
    };

    const handleAccept = async () => {
        try {
            setActionLoading(true);
            
            // Validate application ID
            if (!selectedApplication || !selectedApplication._id) {
                setError('Application ID missing. Please try again.');
                setShowAcceptModal(false);
                return;
            }

            // PART 6: Use approveStudentForProject instead of acceptApplication
            const response = await approveStudentForProject(selectedApplication._id);

            if (response.success) {
                setSuccess('Student approved! Project assigned. Other applications auto-rejected.');
                setShowAcceptModal(false);
                await fetchApplications();
                await fetchStats();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to accept application';
            setError(errorMessage);
            console.error('Accept application error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    const handleDeleteApplication = async (applicationId) => {
        if (!window.confirm('Are you sure you want to delete this application?')) return;
        try {
            setActionLoading(true);
            const response = await deleteApplication(applicationId);
            // Assuming response.success indicates deletion
            if (response && response.success) {
                // Remove from UI immediately
                setApplications(prev => prev.filter(a => a._id !== applicationId));
                // Refresh stats
                await fetchStats();
                setSuccess('Application removed successfully');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                setError(response.message || 'Failed to delete application');
            }
        } catch (err) {
            setError(err.response?.data?.message || err.message || 'Failed to delete application');
        } finally {
            setActionLoading(false);
        }
    };

    const handleRejectClick = (applicationId) => {
        // Find the application object from the applications array
        const application = applications.find(app => app._id === applicationId);
        if (!application) {
            setError('Application not found. Please refresh the page.');
            return;
        }
        setSelectedApplication(application);
        setShowRejectModal(true);
    };

    const handleReject = async (reason) => {
        try {
            setActionLoading(true);
            
            // Validate application ID
            if (!selectedApplication || !selectedApplication._id) {
                setError('Application ID missing. Please try again.');
                setShowRejectModal(false);
                return;
            }

            const response = await rejectApplication(selectedApplication._id, reason);

            if (response.success) {
                setSuccess('Application rejected successfully!');
                setShowRejectModal(false);
                await fetchApplications();
                await fetchStats();
                setTimeout(() => setSuccess(''), 3000);
            }
        } catch (err) {
            const errorMessage = err.response?.data?.message || err.message || 'Failed to reject application';
            setError(errorMessage);
            console.error('Reject application error:', err);
        } finally {
            setActionLoading(false);
        }
    };

    // Profile modal actions removed / handled elsewhere. Kept intentionally empty.

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800 p-6 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <p className="text-gray-400 mt-4">Loading applications...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-slate-900 to-slate-800">
            <Navbar />
            <div className="p-6">
            <div className="max-w-7xl mt-12 py-12 mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                        📋 Application Management
                    </h1>
                    <p className="text-gray-400">
                        Review, manage, and respond to student applications
                    </p>
                </div>

                {/* Stats Cards */}
                <ApplicationStatsCards stats={stats} />

                {/* Success/Error Messages */}
                {success && (
                    <div className="bg-green-500/20 border border-green-500 text-green-300 p-4 rounded-lg mb-6">
                        ✅ {success}
                    </div>
                )}
                {error && (
                    <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg mb-6">
                        ❌ {error}
                    </div>
                )}

                {/* Filters Section */}
                <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-4 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Project Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Filter by Project
                            </label>
                            <select
                                value={selectedProject}
                                onChange={(e) => {
                                    setSelectedProject(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">All Projects</option>
                                {projects.map((project) => (
                                    <option key={project._id} value={project._id}>
                                        {project.title}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Status Filter */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Filter by Status
                            </label>
                            <select
                                value={selectedStatus}
                                onChange={(e) => {
                                    setSelectedStatus(e.target.value);
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="shortlisted">Shortlisted</option>
                                <option value="accepted">Accepted</option>
                                <option value="rejected">Rejected</option>
                            </select>
                        </div>

                        {/* Items Per Page */}
                        <div>
                            <label className="block text-sm font-semibold text-white mb-2">
                                Items per Page
                            </label>
                            <select
                                value={limit}
                                onChange={(e) => {
                                    setLimit(parseInt(e.target.value));
                                    setCurrentPage(1);
                                }}
                                className="w-full bg-slate-700 border border-slate-600 rounded px-3 py-2 text-white focus:outline-none focus:border-blue-500"
                            >
                                <option value={10}>10 Items</option>
                                <option value={20}>20 Items</option>
                                <option value={50}>50 Items</option>
                                <option value={100}>100 Items</option>
                            </select>
                        </div>
                    </div>
                </div>

                {/* Applications List */}
                {applications.length > 0 ? (
                    <>
                        <div className="grid gap-4 mb-6">
                            {applications.map((application) => (
                                <ApplicationCard
                                    key={application._id}
                                    application={application}
                                    onView={handleViewApplication}
                                    onShortlist={handleShortlist}
                                    onAccept={handleAcceptClick}
                                    onReject={handleRejectClick}
                                    onDelete={handleDeleteApplication}
                                    loading={actionLoading}
                                />
                            ))}
                        </div>

                        {/* Pagination */}
                        {totalPages > 1 && (
                            <div className="flex items-center justify-between bg-slate-800/50 border border-slate-700 rounded-lg p-4">
                                <p className="text-gray-400 text-sm">
                                    Page {currentPage} of {totalPages}
                                </p>
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                                        disabled={currentPage === 1}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Previous
                                    </button>
                                    <button
                                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                                        disabled={currentPage === totalPages}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                    >
                                        Next
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-12 text-center">
                        <p className="text-gray-400 text-lg mb-2">📭 No applications found</p>
                        <p className="text-gray-500 text-sm">
                            Try adjusting your filters or check back later
                        </p>
                    </div>
                )}
            </div>
            </div>

            {/* Modals */}
            <AcceptApplicationModal
                isOpen={showAcceptModal}
                onClose={() => {
                    setShowAcceptModal(false);
                    setSelectedApplication(null);
                }}
                onConfirm={handleAccept}
                loading={actionLoading}
                studentName={selectedApplication?.studentName}
                applicationData={selectedApplication}
            />

            <RejectApplicationModal
                isOpen={showRejectModal}
                onClose={() => {
                    setShowRejectModal(false);
                    setSelectedApplication(null);
                }}
                onConfirm={handleReject}
                loading={actionLoading}
                studentName={selectedApplication?.studentName}
            />
        </div>
    );
};

export default CompanyApplications;
