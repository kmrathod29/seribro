// frontend/src/pages/company/CompanyDashboard.jsx
// Company Dashboard Overview Page

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AlertCircle, Loader, CheckCircle, Clock, Edit2, TrendingUp, RefreshCw, ChevronRight, IndianRupee } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { fetchCompanyDashboard, formatApiError, initializeCompanyProfile } from '../../apis/companyProfileApi';

const CompanyDashboard = () => {
    const navigate = useNavigate();
    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadDashboard();
    }, []);

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchCompanyDashboard();
            setDashboardData(data);
        } catch (err) {
            // Try to initialize profile if it doesn't exist
            try {
                console.log('Initializing company profile...');
                await initializeCompanyProfile();
                // Retry fetching after initialization
                const data = await fetchCompanyDashboard();
                setDashboardData(data);
                setError(null);
            } catch (initErr) {
                const apiError = formatApiError(initErr);
                setError(apiError.message);
                console.error('Dashboard initialization error:', initErr);
            }
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader className="animate-spin text-gold mx-auto mb-4" size={40} />
                        <p className="text-white text-lg">Loading your dashboard...</p>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen px-4">
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-8 max-w-md text-center">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={40} />
                        <h2 className="text-white text-xl font-bold mb-2">Error Loading Dashboard</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={loadDashboard}
                            className="bg-gold hover:bg-yellow-400 text-navy font-semibold px-6 py-2 rounded-lg transition-all duration-300"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    const {
        profileCompletionPercentage = 0,
        profileComplete = false,
        verificationStatus = 'draft',
        companyName = 'Company',
        logoUrl = '',
        companyEmail = '',
        mobile = '',
    } = dashboardData || {};

    const getStatusColor = (status) => {
        if (status === 'approved') return 'bg-green-500/20 border-green-500 text-green-300';
        if (status === 'pending') return 'bg-amber-500/20 border-amber-500 text-amber-300';
        if (status === 'rejected') return 'bg-red-500/20 border-red-500 text-red-300';
        return 'bg-gray-500/20 border-gray-500 text-gray-300';
    };

    const getStatusText = (status) => {
        if (status === 'approved') return 'Verified';
        if (status === 'pending') return 'Pending Review';
        if (status === 'rejected') return 'Rejected';
        return 'Draft';
    };

    const getStatusIcon = (status) => {
        if (status === 'approved') return <CheckCircle size={20} />;
        if (status === 'pending') return <Clock size={20} />;
        return <AlertCircle size={20} />;
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-24
            ">
                {/* Header */}
                <div className="mb-12 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                            Welcome Back, <span className="text-gold">{companyName}</span>
                        </h1>
                        <p className="text-gray-300">Manage your company profile and track verification status</p>
                    </div>
                    <button
                        onClick={loadDashboard}
                        disabled={loading}
                        className="p-3 rounded-lg bg-gold/20 hover:bg-gold/40 text-gold transition-colors duration-300 disabled:opacity-50"
                        title="Refresh dashboard"
                    >
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid md:grid-cols-3 gap-6 mb-8">
                    {/* Profile Completion Card */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 hover:border-gold/50 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-white font-semibold text-lg">Profile Status</h3>
                            <TrendingUp className="text-gold" size={24} />
                        </div>
                        <div className="mb-4">
                            <div className="text-4xl font-bold text-gold mb-2">{profileCompletionPercentage}%</div>
                            <p className="text-gray-300">Profile Complete</p>
                        </div>
                        <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden">
                            <div 
                                className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full transition-all duration-1000"
                                style={{ width: `${profileCompletionPercentage}%` }}
                            ></div>
                        </div>
                    </div>

                    {/* Verification Status Card */}
                    <div className={`backdrop-blur-md border rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-300 ${getStatusColor(verificationStatus)}`}>
                        <div className="mb-3">{getStatusIcon(verificationStatus)}</div>
                        <h3 className="font-semibold text-lg mb-2">Verification Status</h3>
                        <p className="text-sm capitalize">{getStatusText(verificationStatus)}</p>
                    </div>

                    {/* Quick Action Card */}
                    <div className="bg-gradient-to-br from-gold/20 to-yellow-400/20 backdrop-blur-md border border-gold/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center hover:border-gold transition-all duration-300 cursor-pointer group"
                        onClick={() => navigate('/company/profile?tab=basic')}
                    >
                        <Edit2 className="text-gold mb-3 group-hover:scale-110 transition-transform duration-300" size={24} />
                        <h3 className="text-white font-semibold text-lg mb-2">Edit Profile</h3>
                        <p className="text-gray-300 text-sm">Update your company details</p>
                    </div>
                </div>

                {/* Payment & Workflow Management Section */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <button
                        onClick={() => navigate('/payments/verify')}
                        className="group bg-gradient-to-br from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left"
                    >
                        <div className="flex items-center gap-4">
                            <IndianRupee className="w-12 h-12 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                            <div>
                                <h3 className="font-bold text-xl mb-1">Verify Payment</h3>
                                <p className="text-blue-100 text-sm">Verify Razorpay payments and release funds</p>
                            </div>
                            <ChevronRight className="ml-auto w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                        </div>
                    </button>

                    <button
                        onClick={() => navigate('/workflow/payments')}
                        className="group bg-gradient-to-br from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white rounded-2xl p-8 shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 text-left"
                    >
                        <div className="flex items-center gap-4">
                            <TrendingUp className="w-12 h-12 flex-shrink-0 group-hover:rotate-12 transition-transform duration-300" />
                            <div>
                                <h3 className="font-bold text-xl mb-1">Payment Workflow</h3>
                                <p className="text-purple-100 text-sm">Learn about the complete payment process</p>
                            </div>
                            <ChevronRight className="ml-auto w-6 h-6 group-hover:translate-x-1 transition-transform duration-300 flex-shrink-0" />
                        </div>
                    </button>
                </div>

                {/* Company Information Section */}
                <div className="grid md:grid-cols-2 gap-8 mb-8">
                    {/* Company Info Card */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                        <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                            <span className="text-gold">📋</span>
                            Company Information
                        </h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Company Name</p>
                                <p className="text-white text-lg font-semibold">{companyName || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Email</p>
                                <p className="text-white break-all">{companyEmail || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-gray-400 text-sm mb-1">Mobile</p>
                                <p className="text-white">{mobile || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Logo Section */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                        <h3 className="text-white font-semibold text-xl mb-6 flex items-center gap-2">
                            <span className="text-gold">🎨</span>
                            Company Logo
                        </h3>
                        <div className="bg-white/10 border border-white/20 rounded-lg p-8 flex items-center justify-center min-h-64">
                            {logoUrl ? (
                                <div className="text-center">
                                    <img
                                        src={logoUrl}
                                        alt="Company Logo"
                                        className="max-h-40 max-w-full mx-auto rounded-lg object-contain"
                                    />
                                    <p className="text-gray-400 text-sm mt-4">Your company logo</p>
                                </div>
                            ) : (
                                <div className="text-center">
                                    <p className="text-gray-400">No logo uploaded yet</p>
                                    <button
                                        onClick={() => navigate('/company/profile?tab=logo')}
                                        className="mt-4 bg-gold/20 hover:bg-gold/30 text-gold font-semibold px-4 py-2 rounded-lg transition-all duration-300"
                                    >
                                        Upload Logo
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Quick Links Section */}
                <div className="grid md:grid-cols-5 gap-4">
                    <button
                        onClick={() => navigate('/company/profile?tab=basic')}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-6 text-center transition-all duration-300 group"
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">🏢</div>
                        <h4 className="text-white font-semibold">Basic Info</h4>
                    </button>

                    <button
                        onClick={() => navigate('/company/profile?tab=details')}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-6 text-center transition-all duration-300 group"
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📋</div>
                        <h4 className="text-white font-semibold">Details</h4>
                    </button>

                    <button
                        onClick={() => navigate('/company/profile?tab=person')}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-6 text-center transition-all duration-300 group"
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">👤</div>
                        <h4 className="text-white font-semibold">Auth. Person</h4>
                    </button>

                    <button
                        onClick={() => navigate('/company/profile?tab=verification')}
                        className="bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg p-6 text-center transition-all duration-300 group"
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">✓</div>
                        <h4 className="text-white font-semibold">Verify</h4>
                    </button>

                    {/* Phase 4.1: Post Project Button */}
                    <button
                        onClick={() => navigate('/company/post-project')}
                        className="bg-gradient-to-br from-gold/20 to-gold/10 hover:from-gold/30 hover:to-gold/20 border border-gold/50 rounded-lg p-6 text-center transition-all duration-300 group"
                    >
                        <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">📝</div>
                        <h4 className="text-gold font-semibold">Post Project</h4>
                    </button>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CompanyDashboard;
