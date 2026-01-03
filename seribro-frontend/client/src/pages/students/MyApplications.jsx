// src/pages/students/MyApplications.jsx
// My applications page - Phase 4.2

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 as Loader, AlertCircle, FileText, Clock, CheckCircle, XCircle, Trash2 } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ApplicationStats from '../../components/studentComponent/ApplicationStats';
import { getMyApplications, getApplicationStats, withdrawApplication } from '../../apis/studentProjectApi';

const MyApplications = () => {
    const navigate = useNavigate();

    // State
    const [applications, setApplications] = useState([]);
    const [stats, setStats] = useState({});
    const [loading, setLoading] = useState(true);
    const [statsLoading, setStatsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0 });

    // Filter
    const [activeTab, setActiveTab] = useState('all');

    // Withdraw confirmation
    const [withdrawConfirm, setWithdrawConfirm] = useState({
        show: false,
        applicationId: null,
    });

    const tabs = [
        { label: 'All', value: 'all' },
        { label: 'Pending', value: 'pending' },
        { label: 'Shortlisted', value: 'shortlisted' },
        { label: 'Approved', value: 'approved' }, // PART 7: Updated from 'accepted' to 'approved'
        { label: 'Accepted', value: 'accepted' }, // Keep for backward compatibility
        { label: 'Rejected', value: 'rejected' },
    ];

    // Fetch stats
    useEffect(() => {
        const loadStats = async () => {
            try {
                setStatsLoading(true);
                const response = await getApplicationStats();
                if (response.success) {
                    setStats(response.data);
                }
            } catch (err) {
                console.error('Failed to load stats:', err);
            } finally {
                setStatsLoading(false);
            }
        };

        loadStats();
    }, []);

    // Fetch applications
    useEffect(() => {
        const loadApplications = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await getMyApplications(1, activeTab);

                if (response.success) {
                    setApplications(response.data.applications || []);
                    setPagination(response.data.pagination || {});
                } else {
                    setError(response.message);
                }
            } catch (err) {
                setError('Failed to load applications');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadApplications();
    }, [activeTab]);

    // Handle withdraw
    const handleWithdraw = async (applicationId) => {
        try {
            const response = await withdrawApplication(applicationId);

            if (response.success) {
                // Refresh applications
                setApplications(applications.filter((app) => app._id !== applicationId));
                setWithdrawConfirm({ show: false, applicationId: null });
                alert('Application withdrawn successfully');
            } else {
                alert(response.message);
            }
        } catch (err) {
            alert('Failed to withdraw application');
            console.error(err);
        }
    };

    // Format date
    const formatDate = (date) => {
        return new Date(date).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
        });
    };

    // Get status color
    const getStatusColor = (status) => {
        switch (status) {
            case 'pending':
                return 'bg-orange-500/20 text-orange-300 border-orange-500/30';
            case 'shortlisted':
                return 'bg-blue-500/20 text-blue-300 border-blue-500/30';
            case 'accepted':
                return 'bg-green-500/20 text-green-300 border-green-500/30';
            case 'rejected':
                return 'bg-red-500/20 text-red-300 border-red-500/30';
            case 'withdrawn':
                return 'bg-gray-500/20 text-gray-300 border-gray-500/30';
            default:
                return 'bg-white/5 text-gray-300 border-white/10';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="px-4 mt-10 py-12 bg-gradient-to-r from-navy-dark to-navy-light">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-2">My Applications</h1>
                    <p className="text-gray-300">Track your project applications and status</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 py-12 max-w-6xl mx-auto w-full">
                {/* Stats Section */}
                <div className="mb-8">
                    <h2 className="text-xl font-bold text-white mb-4">Quick Stats</h2>
                    <ApplicationStats stats={stats} loading={statsLoading} />
                </div>

                {/* Filter Tabs */}
                <div className="mb-8">
                    <div className="flex gap-2 overflow-x-auto pb-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.value}
                                onClick={() => setActiveTab(tab.value)}
                                className={`px-4 py-2 rounded-lg whitespace-nowrap transition-colors ${
                                    activeTab === tab.value
                                        ? 'bg-amber-500 text-slate-900 font-semibold'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Error */}
                {error && (
                    <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                        <AlertCircle className="w-5 h-5 flex-shrink-0" />
                        <p>{error}</p>
                    </div>
                )}

                {/* Loading */}
                {loading && (
                    <div className="flex items-center justify-center py-12">
                        <Loader className="w-8 h-8 text-amber-400 animate-spin" />
                    </div>
                )}

                {/* Applications List */}
                {!loading && applications.length > 0 && (
                    <div className="space-y-4">
                        {applications.map((app) => (
                            <div
                                key={app._id}
                                className="bg-slate-800/50 border border-white/10 rounded-lg p-6 hover:border-white/20 transition-colors"
                            >
                                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 items-start">
                                    {/* Project Info */}
                                    <div className="md:col-span-2">
                                        <button
                                            onClick={() => navigate(`/student/projects/${app.project?._id}`)}
                                            className="group"
                                        >
                                            <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mb-2 text-left">
                                                {app.project?.title}
                                            </h3>
                                        </button>
                                        {app.company && (
                                            <div className="flex items-center gap-2 mb-2">
                                                {app.company.logoUrl && (
                                                    <img
                                                        src={app.company.logoUrl}
                                                        alt={app.company.companyName}
                                                        className="w-5 h-5 rounded-full object-cover"
                                                    />
                                                )}
                                                <span className="text-sm text-gray-400">{app.company.companyName}</span>
                                            </div>
                                        )}
                                        <div className="flex flex-wrap gap-2">
                                            <span className="px-2 py-1 rounded text-xs bg-white/5 text-gray-300 border border-white/10">
                                                {app.project?.category}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Details */}
                                    <div className="space-y-2">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Proposed Price</div>
                                            <div className="text-lg font-semibold text-amber-400">
                                                ₹{app.proposedPrice?.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Estimated Time</div>
                                            <div className="text-sm text-gray-300">{app.estimatedTime}</div>
                                        </div>
                                    </div>

                                    {/* Status & Actions */}
                                    <div className="space-y-2">
                                        <div className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)} text-center`}>
                                            {app.status?.charAt(0).toUpperCase() + app.status?.slice(1)}
                                        </div>
                                        <div className="text-xs text-gray-500">
                                            Applied: {formatDate(app.appliedAt)}
                                        </div>
                                        {['accepted', 'approved'].includes(app.status) && app.project?._id && (
                                            <button
                                                onClick={() => navigate(`/workspace/projects/${app.project._id}`)}
                                                className="w-full px-3 py-1 rounded text-xs bg-blue-600 hover:bg-blue-700 text-white border border-blue-500/50 font-medium transition-colors"
                                            >
                                                View Workspace →
                                            </button>
                                        )}
                                        {app.status === 'pending' && (
                                            <button
                                                onClick={() =>
                                                    setWithdrawConfirm({
                                                        show: true,
                                                        applicationId: app._id,
                                                    })
                                                }
                                                className="w-full px-3 py-1 rounded text-xs bg-red-500/20 hover:bg-red-500/30 text-red-300 border border-red-500/30 font-medium transition-colors"
                                            >
                                                Withdraw
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Empty State */}
                {!loading && applications.length === 0 && (
                    <div className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg mb-2">No applications yet</p>
                        <p className="text-gray-500 text-sm mb-6">
                            Browse projects and apply to get started
                        </p>
                        <button
                            onClick={() => navigate('/student/browse-projects')}
                            className="px-6 py-2 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 font-semibold transition-all duration-200"
                        >
                            Browse Projects
                        </button>
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button
                                key={i + 1}
                                className={`px-3 py-2 rounded transition-colors ${
                                    pagination.page === i + 1
                                        ? 'bg-amber-500 text-slate-900 font-semibold'
                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                }`}
                            >
                                {i + 1}
                            </button>
                        ))}
                    </div>
                )}
            </div>

            {/* Withdraw Confirmation Modal */}
            {withdrawConfirm.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
                    <div className="absolute inset-0 bg-black/60" onClick={() => setWithdrawConfirm({ show: false })} />
                    <div className="relative z-10 max-w-sm w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-xl border border-white/10 p-6">
                        <h2 className="text-xl font-bold text-white mb-2">Withdraw Application?</h2>
                        <p className="text-gray-400 mb-6">This action cannot be undone. You can apply again later.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setWithdrawConfirm({ show: false })}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleWithdraw(withdrawConfirm.applicationId)}
                                className="flex-1 px-4 py-2 rounded-lg bg-red-500 hover:bg-red-600 text-white font-medium transition-colors"
                            >
                                Withdraw
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default MyApplications;
