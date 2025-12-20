import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CheckCircle, AlertCircle, Clock, Edit2, RefreshCw, TrendingUp } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import DocumentUpload from '../../components/studentComponent/DocumentUpload';
// ProfileCompletionBar not used in redesigned layout
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
            // Debug: log returned dashboard data (helps verify collegeId url/path)
            // Remove or guard this in production if noisy.
            console.log('DEBUG: dashboardData', data);
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

    // Prefer the uploaded College ID image. Backend sometimes provides `documents.collegeId.url` or `documents.collegeId.path`.
    // Fall back to any legacy/profile photo fields if present.
    const collegeIdUrl = dashboardData?.documents?.collegeId?.url || dashboardData?.documents?.collegeId?.path || basicInfo?.collegeIdUrl || basicInfo?.profilePhotoUrl || null;

    // status helpers removed (not used in this redesigned layout)

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            {/* Main Content */}
            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 mt-7">
                {/* Welcome & Hero Cards */}
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                            Welcome back, <span className="text-[#fb923c]">{basicInfo?.fullName || 'Student'}</span>
                        </h1>
                        <p className="text-[#94a3b8]">Complete your profile to start getting projects</p>
                    </div>
                    <button
                        onClick={loadDashboard}
                        disabled={loading}
                        className="p-3 rounded-lg bg-[#f59e0b]/20 hover:bg-[#f59e0b]/40 text-[#f59e0b] transition-colors duration-300 disabled:opacity-50"
                        title="Refresh dashboard"
                    >
                        <RefreshCw size={24} className={loading ? 'animate-spin' : ''} />
                    </button>
                </div>

                {/* Three hero cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Profile Completion */}
                    <div className="p-6 rounded-2xl" style={{ background: '#0f172a' }}>
                        <div className="flex items-start justify-between">
                            <div>
                                <h3 className="text-white text-lg font-medium">Profile Completion</h3>
                                <div className="flex items-center gap-4 mt-4">
                                    <div className="w-16 h-16 rounded-full bg-[#334155] flex items-center justify-center">
                                        <TrendingUp className="w-6 h-6 text-[#fb923c]" />
                                    </div>
                                    <div>
                                        <div className="text-3xl font-bold text-white">{profileCompletion}%</div>
                                        <p className="text-sm text-[#94a3b8]">{profileCompletion === 100 ? 'Profile Complete' : 'Incomplete'}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="w-1/3 flex items-center">
                                <div className="w-full bg-[#334155] rounded-full h-4 overflow-hidden">
                                    <div className="h-4 rounded-full" style={{ width: `${profileCompletion}%`, background: 'linear-gradient(90deg, #fb923c, #f97316)' }} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Verification */}
                    <div className="p-6 rounded-2xl" style={{ background: '#0f172a' }}>
                        <h3 className="text-white text-lg font-medium">Verification Status</h3>
                        <div className="flex items-center gap-4 mt-4">
                            <div className="w-16 h-16 rounded-full bg-[#334155] flex items-center justify-center">
                                {verificationStatus === 'verified' ? <CheckCircle className="w-6 h-6 text-[#10b981]" /> : verificationStatus === 'pending' ? <Clock className="w-6 h-6 text-[#fbbf24]" /> : <AlertCircle className="w-6 h-6 text-[#ef4444]" />}
                            </div>
                            <div>
                                <div className="text-2xl font-bold text-white capitalize">{verificationStatus}</div>
                                <p className="text-sm text-[#94a3b8] mt-1">{Array.isArray(alerts) && alerts.length > 0 ? alerts[0] : 'Verification details'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Card */}
                    <div className="p-6 rounded-2xl flex items-center justify-between" style={{ background: '#0f172a' }}>
                        <div>
                            <h3 className="text-white text-lg font-medium">Profile Actions</h3>
                            <p className="text-sm text-[#94a3b8] mt-2">Edit or complete your profile</p>
                        </div>
                        <div>
                            <button onClick={() => navigate('/student/profile')} className="inline-flex items-center gap-3 px-4 py-3 rounded-lg font-semibold" style={{ background: '#f59e0b', color: '#0f172a' }}>
                                <Edit2 size={18} />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>

                {/* Two-column info & photo */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <div className="p-6 rounded-xl" style={{ background: '#334155' }}>
                        <h3 className="text-white text-lg font-semibold mb-4">Student Information</h3>
                        <div className="grid grid-cols-1 gap-4 text-[#94a3b8]">
                            <div>
                                <p className="text-sm">Full Name</p>
                                <p className="text-white font-medium">{basicInfo?.fullName || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm">Email</p>
                                <p className="text-white font-medium">{basicInfo?.email || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm">Mobile</p>
                                <p className="text-white font-medium">{basicInfo?.phone || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm">City</p>
                                <p className="text-white font-medium">{basicInfo?.city || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm">College</p>
                                <p className="text-white font-medium">{basicInfo?.collegeName || 'Not provided'}</p>
                            </div>
                            <div>
                                <p className="text-sm">Degree</p>
                                <p className="text-white font-medium">{basicInfo?.degree || 'Not provided'}</p>
                            </div>
                        </div>
                    </div>

                    <div className="p-6 rounded-xl flex items-center justify-center" style={{ background: '#475569' }}>
                        <div className="text-center">
                                {/* <p className="text-sm text-[#94a3b8] mb-3">Your Profile Photo</p> */}
                                {collegeIdUrl ? (
                                    <img src={collegeIdUrl} alt="College ID" className="w-40 h-40 object-cover rounded-lg mx-auto border-2 border-[#0f172a]" />
                                ) : (
                                    <div className="w-40 h-40 rounded-lg mx-auto bg-[#0f172a] flex items-center justify-center">
                                        <span className="text-3xl font-bold text-white">{(basicInfo?.fullName || 'S').split(' ').map(n => n[0]).slice(0,2).join('').toUpperCase()}</span>
                                    </div>
                                )}
                                <p className="text-sm text-[#94a3b8] mt-3">Your College ID</p>
                                {/* Debug helpers to inspect Cloudinary URL */}
                                {collegeIdUrl ? (
                                    <div className="mt-2 text-sm">
                                        <a href={collegeIdUrl} target="_blank" rel="noopener noreferrer" className="text-gold underline">Open College ID (opens in new tab)</a>
                                        <div className="text-xs text-gray-400 mt-1 break-words">{collegeIdUrl}</div>
                                    </div>
                                ) : (
                                    <div className="mt-2 text-xs text-red-400">No College ID URL available from server</div>
                                )}

                                {/* Upload widget: allow student to upload/change college ID directly from dashboard */}
                                <div className="mt-4 w-full">
                                    <DocumentUpload
                                        type="collegeId"
                                        currentDocument={{ path: dashboardData?.documents?.collegeId?.url || dashboardData?.documents?.collegeId?.path || null, filename: 'College ID' }}
                                        onRefresh={loadDashboard}
                                    />
                                </div>
                            </div>
                    </div>
                </div>

                {/* Action Items or Stats */}
                {profileCompletion < 100 ? (
                    <div className="bg-white/5 rounded-2xl p-6 mb-8" style={{ background: '#334155' }}>
                        <h3 className="text-white text-lg font-semibold mb-4">Action Items</h3>
                        <div className="space-y-3 text-[#94a3b8]">
                            {(() => {
                                const missing = [];
                                if (!basicInfo?.fullName) missing.push('Add full name');
                                if (!basicInfo?.phone) missing.push('Add mobile number');
                                if ((totalProjects || 0) < 3) missing.push('Upload at least 3 projects');
                                if (!basicInfo?.resumeUploaded) missing.push('Upload resume (PDF)');
                                if (!basicInfo?.collegeIdUploaded) missing.push('Upload college ID for verification');
                                if (missing.length === 0) return <p className="text-[#94a3b8]">Complete remaining items to reach 100%.</p>;
                                return (
                                    <ul className="space-y-2">
                                        {missing.map((it, idx) => (
                                            <li key={idx} className="flex items-center justify-between">
                                                <div className="flex items-center gap-3">
                                                    <AlertCircle className="w-5 h-5 text-[#f59e0b]" />
                                                    <span className="text-white">{it}</span>
                                                </div>
                                                <button onClick={() => navigate('/student/profile')} className="text-sm font-semibold px-3 py-1 rounded bg-[#f59e0b] text-[#0f172a]">Go to Profile</button>
                                            </li>
                                        ))}
                                    </ul>
                                );
                            })()}
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                        <div className="p-6 rounded-xl" style={{ background: '#334155' }}>
                            <h4 className="text-white font-semibold">Applied Projects</h4>
                            <div className="text-3xl font-bold text-white mt-4">{dashboardData?.appliedProjects || 0}</div>
                        </div>
                        <div className="p-6 rounded-xl" style={{ background: '#334155' }}>
                            <h4 className="text-white font-semibold">Active Projects</h4>
                            <div className="text-3xl font-bold text-white mt-4">{dashboardData?.activeProjects || 0}</div>
                        </div>
                        <div className="p-6 rounded-xl flex items-center justify-between" style={{ background: '#334155' }}>
                            <div>
                                <h4 className="text-white font-semibold">Verification</h4>
                                <p className="text-[#94a3b8] mt-2">{verificationStatus}</p>
                            </div>
                            {verificationStatus !== 'verified' && (
                                <button onClick={() => navigate('/student/profile?tab=verification')} className="px-4 py-2 rounded-lg font-semibold" style={{ background: '#f59e0b', color: '#0f172a' }}>
                                    Submit for Verification
                                </button>
                            )}
                        </div>
                    </div>
                )}

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
                {/* <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6">
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
                </div> */}
            </main>

            <Footer />
        </div>
    );
};

export default Dashboard;
