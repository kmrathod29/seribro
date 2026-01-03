// frontend/src/pages/company/CompanyProfile.jsx
// Company Profile Management Page

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader2 as Loader, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import CompanyProfileCompletionBar from '../../components/companyComponent/ProfileCompletionBar';
import CompanyBasicInfoForm from '../../components/companyComponent/BasicInfoForm';
import CompanyDetailsForm from '../../components/companyComponent/DetailsForm';
import AuthorizedPersonForm from '../../components/companyComponent/AuthorizedPersonForm';
import LogoUpload from '../../components/companyComponent/LogoUpload';
import DocumentUpload from '../../components/companyComponent/DocumentUpload';
import PaymentSection from '../../components/companyComponent/PaymentSection';
import { fetchCompanyProfile, submitCompanyForVerification, formatApiError, initializeCompanyProfile } from '../../apis/companyProfileApi';

const CompanyProfile = () => {
    const [searchParams] = useSearchParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'basic');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchCompanyProfile();
            setProfile(data.profile || data);
        } catch (err) {
            // Try to initialize profile if it doesn't exist
            try {
                console.log('Initializing company profile...');
                await initializeCompanyProfile();
                // Retry fetching after initialization
                const data = await fetchCompanyProfile();
                setProfile(data.profile || data);
                setError(null);
            } catch (initErr) {
                const apiError = formatApiError(initErr);
                setError(apiError.message);
                console.error('Profile initialization error:', initErr);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitVerification = async () => {
        try {
            setSubmitLoading(true);
            setSubmitMessage(null);
            await submitCompanyForVerification();
            setSubmitMessage({ type: 'success', text: 'Company profile submitted for verification!' });
            await loadProfile();
        } catch (err) {
            const apiError = formatApiError(err);
            setSubmitMessage({ type: 'error', text: apiError.message });
        } finally {
            setSubmitLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="flex items-center justify-center min-h-screen">
                    <div className="text-center">
                        <Loader className="animate-spin text-gold mx-auto mb-4" size={40} />
                        <p className="text-white text-lg">Loading your company profile...</p>
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
                        <h2 className="text-white text-xl font-bold mb-2">Error Loading Profile</h2>
                        <p className="text-gray-300 mb-6">{error}</p>
                        <button
                            onClick={loadProfile}
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
        companyName = 'Company Profile',
        profileCompletionPercentage = 0,
        profileComplete = false,
        verificationStatus = 'draft',
        logoUrl,
        documents = [],
        authorizedPerson = {},
        officeAddress = {},
        payments = {}
    } = profile || {};

    const completedProjects = payments?.completedProjects || 0;

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: '🏢' },
        { id: 'details', label: 'Company Details', icon: '📋' },
        { id: 'person', label: 'Authorized Person', icon: '👤' },
        { id: 'logo', label: 'Logo', icon: '🎨' },
        { id: 'payments', label: 'Payment & Ratings', icon: '💳' },
        { id: 'documents', label: 'Documents', icon: '📄' },
        { id: 'verification', label: 'Verification', icon: '✓' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Company <span className="text-gold">Profile</span>
                    </h1>
                    <p className="text-gray-300">Manage and complete your company profile</p>
                </div>

                {/* Completion Bar */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
                    <CompanyProfileCompletionBar 
                        percentage={profileCompletionPercentage || 0}
                        status={verificationStatus || 'draft'}
                    />
                </div>

                {/* Tab Navigation */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-xl mb-8 overflow-hidden">
                    <div className="flex flex-wrap gap-2 p-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`px-4 py-2 rounded-lg font-semibold transition-all duration-300 flex items-center gap-2 ${
                                    activeTab === tab.id
                                        ? 'bg-gold text-navy'
                                        : 'bg-white/10 text-white hover:bg-white/20'
                                }`}
                            >
                                <span>{tab.icon}</span>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8 mb-8">
                    {activeTab === 'basic' && (
                        <CompanyBasicInfoForm 
                            initialData={profile}
                            onUpdate={(data) => setProfile(data.profile || data)}
                        />
                    )}

                    {activeTab === 'details' && (
                        <CompanyDetailsForm 
                            initialData={profile}
                            onUpdate={(data) => setProfile(data.profile || data)}
                        />
                    )}

                    {activeTab === 'person' && (
                        <AuthorizedPersonForm 
                            initialData={authorizedPerson}
                            onUpdate={(data) => setProfile(data.profile || data)}
                        />
                    )}

                    {activeTab === 'logo' && (
                        <LogoUpload 
                            currentLogo={logoUrl}
                            onUpdate={(data) => setProfile(data.profile || data)}
                        />
                    )}

                    {activeTab === 'payments' && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Payment History & Ratings</h2>
                            <PaymentSection completedProjects={completedProjects} />
                        </div>
                    )}

                    {activeTab === 'documents' && (
                        <DocumentUpload 
                            documents={documents}
                            onUpdate={(data) => setProfile(data.profile || data)}
                        />
                    )}

                    {activeTab === 'verification' && (
                        <div className="max-w-4xl mx-auto">
                            <div className="flex items-center gap-3 mb-6">
                                <CheckCircle className="text-gold" size={28} />
                                <h3 className="text-2xl font-bold text-white">Profile Verification</h3>
                            </div>

                            {submitMessage && (
                                <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                                    submitMessage.type === 'success' 
                                        ? 'bg-green-500/20 border border-green-500 text-green-300'
                                        : 'bg-red-500/20 border border-red-500 text-red-300'
                                }`}>
                                    {submitMessage.type === 'success' ? (
                                        <CheckCircle size={20} />
                                    ) : (
                                        <AlertCircle size={20} />
                                    )}
                                    <span>{submitMessage.text}</span>
                                </div>
                            )}

                            <div className="bg-white/10 border border-white/20 rounded-lg p-8 space-y-6">
                                {/* Status Card */}
                                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                                    <div className="flex justify-between items-center mb-4">
                                        <h4 className="text-white font-semibold text-lg">Current Status</h4>
                                        <span className={`px-4 py-2 rounded-full font-semibold capitalize ${
                                            verificationStatus === 'approved' ? 'bg-green-500/20 text-green-300' :
                                            verificationStatus === 'pending' ? 'bg-amber-500/20 text-amber-300' :
                                            verificationStatus === 'rejected' ? 'bg-red-500/20 text-red-300' :
                                            'bg-gray-500/20 text-gray-300'
                                        }`}>
                                            {verificationStatus || 'draft'}
                                        </span>
                                    </div>
                                    <p className="text-gray-300">
                                        {verificationStatus === 'approved' && 'Your company profile has been verified. You can now post job openings.'}
                                        {verificationStatus === 'pending' && 'Your profile is pending review. Our team will verify it soon.'}
                                        {verificationStatus === 'rejected' && 'Your profile was rejected. Please update and resubmit.'}
                                        {verificationStatus === 'draft' && 'Your profile is not yet submitted for verification.'}
                                    </p>
                                </div>

                                {/* Completion Status */}
                                <div className="bg-white/5 rounded-lg p-6 border border-white/10">
                                    <h4 className="text-white font-semibold text-lg mb-3">Profile Completion</h4>
                                    <div className="w-full bg-white/10 rounded-full h-4 mb-3 overflow-hidden">
                                        <div 
                                            className="h-full bg-gradient-to-r from-gold to-yellow-400 rounded-full transition-all duration-1000"
                                            style={{ width: `${profileCompletionPercentage || 0}%` }}
                                        ></div>
                                    </div>
                                    <p className="text-white">{profileCompletionPercentage || 0}% Complete</p>
                                </div>

                                {/* Submit Button */}
                                {profileComplete && verificationStatus === 'draft' && (
                                    <button
                                        onClick={handleSubmitVerification}
                                        disabled={submitLoading}
                                        className="w-full bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-navy font-bold py-3 rounded-lg transition-all duration-300 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        {submitLoading ? 'Submitting...' : (
                                            <>
                                                Submit for Verification
                                                <ArrowRight size={20} />
                                            </>
                                        )}
                                    </button>
                                )}

                                {!profileComplete && (
                                    <div className="bg-amber-500/20 border border-amber-500 rounded-lg p-4 flex items-center gap-3">
                                        <AlertCircle className="text-amber-300" size={20} />
                                        <p className="text-amber-200">Please complete all profile sections before submitting for verification.</p>
                                    </div>
                                )}

                                {profileComplete && verificationStatus !== 'draft' && (
                                    <div className="bg-blue-500/20 border border-blue-500 rounded-lg p-4 flex items-center gap-3">
                                        <CheckCircle className="text-blue-300" size={20} />
                                        <p className="text-blue-200">Your profile has already been submitted for verification.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default CompanyProfile;
