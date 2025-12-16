import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, ArrowRight, Edit2, FileText, Award, RefreshCw } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProfileCompletionBar from '../../components/studentComponent/ProfileCompletionBar';
import { fetchDashboardData, formatApiError } from '../../apis/studentProfileApi';

const Dashboard = () => {
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
            const data = await fetchDashboardData();
            setDashboardData(data);
        } catch (err) {
            const apiError = formatApiError(err);
            setError(apiError.message);
            console.error('Dashboard load error:', err);
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
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gold mx-auto mb-4"></div>
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
                <div className="flex items-center justify-center min-h-screen">
                    <div className="bg-red-500/20 border border-red-500 rounded-lg p-6 max-w-md text-center">
                        <AlertCircle className="text-red-500 mx-auto mb-4" size={32} />
                        <h2 className="text-white text-xl font-bold mb-2">Error Loading Dashboard</h2>
                        <p className="text-gray-300 mb-4">{error}</p>
                        <button
                            onClick={loadDashboard}
                            className="bg-gold hover:bg-gold-dark text-navy font-semibold px-6 py-2 rounded-lg transition-all duration-300"
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
        profileCompletion = 0,
        verificationStatus = 'incomplete',
        totalProjects = 0,
        alerts = [],
        basicInfo = {}
    } = dashboardData || {};

    const getStatusIcon = (status) => {
        switch(status) {
            case 'verified':
                return <CheckCircle className="text-green-400" size={20} />;
            case 'pending':
                return <Clock className="text-yellow-400" size={20} />;
            default:
                return <AlertCircle className="text-red-400" size={20} />;
        }
    };

    const getStatusColor = (status) => {
        switch(status) {
            case 'verified':
                return 'bg-green-500/20 border-green-500 text-green-400';
            case 'pending':
                return 'bg-yellow-500/20 border-yellow-500 text-yellow-400';
            default:
                return 'bg-red-500/20 border-red-500 text-red-400';
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-7">
                {/* Welcome Section */}
                <div className="mb-8 animate-fade-in flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                            Welcome back, <span className="text-gold">{basicInfo?.fullName || 'Student'}!</span>
                        </h1>
                        <p className="text-gray-300">Complete your profile to start getting projects</p>
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

                {/* Profile Completion Card */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8 hover:bg-white/20 transition-all duration-300">
                    <div className="flex items-start justify-between mb-6">
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-2">Profile Completion</h2>
                            <p className="text-gray-300">Complete your profile to unlock all features</p>
                        </div>
                        <div className={`flex items-center gap-2 px-4 py-2 rounded-full border ${getStatusColor(verificationStatus)}`}>
                            {getStatusIcon(verificationStatus)}
                            <span className="font-semibold capitalize">{verificationStatus}</span>
                        </div>
                    </div>

                    <ProfileCompletionBar 
                        percentage={profileCompletion} 
                        status={verificationStatus}
                    />

                    <div className="mt-6 flex flex-col sm:flex-row gap-4">
                        <button
                            onClick={() => navigate('/student/profile')}
                            className="flex-1 bg-gradient-to-r from-primary to-gold hover:shadow-lg hover:shadow-gold/50 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 flex items-center justify-center gap-2 group"
                        >
                            <Edit2 size={18} />
                            Complete Profile
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                        
                        {profileCompletion === 100 && verificationStatus === 'incomplete' && (
                            <button
                                onClick={() => navigate('/student/profile?tab=verification')}
                                className="flex-1 bg-gold/20 hover:bg-gold/30 border-2 border-gold text-gold font-semibold py-3 px-6 rounded-xl transition-all duration-300"
                            >
                                Submit for Verification
                            </button>
                        )}
                    </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Completion Stat */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-300 font-semibold">Completion</h3>
                            <FileText className="text-primary" size={24} />
                        </div>
                        <p className="text-4xl font-bold text-white">{profileCompletion}%</p>
                        <p className="text-gray-400 text-sm mt-2">Profile completion rate</p>
                    </div>

                    {/* Projects Stat */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-300 font-semibold">Projects</h3>
                            <Award className="text-gold" size={24} />
                        </div>
                        <p className="text-4xl font-bold text-white">{totalProjects}</p>
                        <p className="text-gray-400 text-sm mt-2">Min 3 required for verification</p>
                    </div>

                    {/* Status Stat */}
                    <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl p-6 hover:bg-white/20 transition-all duration-300">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-gray-300 font-semibold">Status</h3>
                            {getStatusIcon(verificationStatus)}
                        </div>
                        <p className="text-2xl font-bold text-white capitalize">{verificationStatus}</p>
                        <p className="text-gray-400 text-sm mt-2">Verification status</p>
                    </div>
                </div>

                {/* Alerts Section */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                    <h2 className="text-2xl font-bold text-white mb-6">Action Items</h2>
                    
                    {alerts && alerts.length > 0 ? (
                        <ul className="space-y-3">
                            {alerts.map((alert, idx) => (
                                <li key={idx} className="flex items-start gap-4 bg-white/5 p-4 rounded-lg border border-white/10 hover:border-gold/50 transition-all duration-300">
                                    <AlertCircle className="text-gold flex-shrink-0 mt-1" size={20} />
                                    <span className="text-gray-300 leading-relaxed">{alert}</span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <div className="bg-green-500/20 border border-green-500 rounded-lg p-6 text-center">
                            <CheckCircle className="text-green-400 mx-auto mb-3" size={32} />
                            <p className="text-green-400 font-semibold">All good! Your profile is in excellent standing.</p>
                        </div>
                    )}
                </div>

                {/* Quick Info */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-white mb-4">Profile Information</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                            <p className="text-gray-400">Email</p>
                            <p className="text-white font-semibold">{basicInfo?.email || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Phone</p>
                            <p className="text-white font-semibold">{basicInfo?.phone || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">College</p>
                            <p className="text-white font-semibold">{basicInfo?.collegeName || 'N/A'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400">Degree</p>
                            <p className="text-white font-semibold">{basicInfo?.degree || 'N/A'}</p>
                        </div>
                    </div>
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
