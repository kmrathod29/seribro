// frontend/src/pages/StudentProfile.jsx
// Hinglish: Student ki profile management page with improved UI

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AlertCircle, CheckCircle, Loader, ArrowRight } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProfileCompletionBar from '../../components/studentComponent/ProfileCompletionBar';
import BasicInfoForm from '../../components/studentComponent/BasicInfoForm';
import SkillsForm from '../../components/studentComponent/SkillsForm';
import PortfolioLinksForm from '../../components/studentComponent/PortfolioLinksForm';
import DocumentUpload from '../../components/studentComponent/DocumentUpload';
import ProjectForm from '../../components/studentComponent/ProjectForm';
import { fetchProfile, submitForVerification, formatApiError } from '../../apis/studentProfileApi';

const StudentProfile = () => {
    const [searchParams] = useSearchParams();
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState(searchParams.get('tab') || 'basic');
    const [submitLoading, setSubmitLoading] = useState(false);
    const [submitMessage, setSubmitMessage] = useState(null);
    const [projectFormState, setProjectFormState] = useState({ visible: false, project: null });
    

    useEffect(() => {
        loadProfile();
    }, []);

    const loadProfile = async () => {
        try {
            setLoading(true);
            setError(null);
            const data = await fetchProfile();
            setProfile(data);
        } catch (err) {
            const apiError = formatApiError(err);
            setError(apiError.message);
            console.error('Profile load error:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitVerification = async () => {
        try {
            setSubmitLoading(true);
            setSubmitMessage(null);
            await submitForVerification();
            setSubmitMessage({ type: 'success', text: 'Profile submitted for verification!' });
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
                        <p className="text-white text-lg">Loading your profile...</p>
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

    const { basicInfo, skills, techStack, projects = [], documents, profileStats, verification } = profile || {};
    const completion = profileStats?.profileCompletion || 0;

    const tabs = [
        { id: 'basic', label: 'Basic Info', icon: '👤' },
        { id: 'skills', label: 'Skills', icon: '🎯' },
        { id: 'links', label: 'Portfolio Links', icon: '🔗' },
        { id: 'projects', label: 'Projects', icon: '📁' },
        { id: 'documents', label: 'Documents', icon: '📄' },
        { id: 'verification', label: 'Verification', icon: '✓' },
    ];

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            <main className="max-w-6xl mt-12 mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
                        Profile <span className="text-gold">Management</span>
                    </h1>
                    <p className="text-gray-300">Complete your profile to start getting projects</p>
                </div>

                {/* Completion Bar */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 mb-8">
                    <ProfileCompletionBar 
                        percentage={completion} 
                        status={verification?.status || 'incomplete'}
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

                {/* Tab Content */}
                <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-8">
                    {/* Basic Info Tab */}
                    {activeTab === 'basic' && (
                        <BasicInfoForm 
                            initialData={basicInfo} 
                            onUpdate={(updated) => {
                                setProfile(prev => ({
                                    ...prev,
                                    basicInfo: { ...prev.basicInfo, ...updated }
                                }));
                                loadProfile(); // Refresh to get updated completion
                            }}
                        />
                    )}

                    {/* Skills Tab */}
                    {activeTab === 'skills' && (
                        <SkillsForm 
                            initialData={{...skills, techStack}}
                            onUpdate={(updated) => {
                                setProfile(prev => ({
                                    ...prev,
                                    skills: { ...prev.skills, ...updated },
                                    ...(updated.techStack && { techStack: updated.techStack })
                                }));
                                loadProfile(); // Refresh to get updated completion
                            }}
                        />
                    )}

                    {/* Portfolio Links Tab */}
                    {activeTab === 'links' && (
                        <PortfolioLinksForm 
                            initialData={profile?.links || {}}
                            onUpdate={(updated) => {
                                setProfile(prev => ({
                                    ...prev,
                                    links: { ...prev.links, ...updated }
                                }));
                                loadProfile(); // Refresh to get updated completion
                            }}
                        />
                    )}

                    {/* Projects Tab */}
                        {activeTab === 'projects' && (
                            projectFormState.visible ? (
                                <ProjectForm
                                    project={projectFormState.project}
                                    onBack={() => {
                                        setProjectFormState({ visible: false, project: null });
                                        loadProfile(); // Ensure project list is refreshed after returning
                                    }}
                                    onRefresh={loadProfile}
                                />
                            ) : (
                                <div>
                                    <div className="flex justify-between items-center mb-6">
                                        <h2 className="text-2xl font-bold text-white">Your Projects</h2>
                                        <button
                                            onClick={() => {
                                                setProjectFormState({ visible: true, project: null });
                                            }}
                                            className="bg-gold hover:bg-yellow-400 text-navy font-semibold px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2"
                                        >
                                            <span>+</span> Add Project
                                        </button>
                                    </div>

                                    {projects && projects.length > 0 ? (
                                        <div className="grid gap-4">
                                            {projects.map((project, idx) => (
                                                <div key={project._id || idx} className="bg-white/5 border border-white/10 rounded-lg p-4 hover:bg-white/10 transition-all duration-300">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                                                        <button
                                                            onClick={() => {
                                                                setProjectFormState({ visible: true, project: project });
                                                            }}
                                                            className="text-blue-400 hover:text-blue-300 text-sm font-semibold"
                                                        >
                                                            Edit
                                                        </button>
                                                    </div>
                                                    <p className="text-gray-300 text-sm mb-2">{project.description}</p>
                                                    {project.technologies && project.technologies.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 mb-2">
                                                            {project.technologies.map((tech, i) => (
                                                                <span key={i} className="text-xs bg-gold/20 text-gold px-2 py-1 rounded">
                                                                    {tech}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    )}
                                                    {project.link && (
                                                        <a href={project.link} target="_blank" rel="noopener noreferrer" className="text-gold hover:text-yellow-400 text-sm mt-2 inline-flex items-center gap-1">
                                                            View Project <ArrowRight size={14} />
                                                        </a>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p className="text-gray-300 text-center py-8">No projects added yet. Add your first project!</p>
                                    )}
                                </div>
                            )
                        )}

                    {/* Documents Tab */}
                    {activeTab === 'documents' && (
                        <div className="space-y-6">
                            <h2 className="text-2xl font-bold text-white mb-6">Upload Documents</h2>
                            
                            <DocumentUpload 
                                type="resume"
                                currentDocument={documents?.resume}
                                onRefresh={loadProfile}
                            />
                            
                            <DocumentUpload 
                                type="collegeId"
                                currentDocument={documents?.collegeId}
                                onRefresh={loadProfile}
                            />
                        </div>
                    )}

                    {/* Verification Tab */}
                    {activeTab === 'verification' && (
                        <div>
                            <h2 className="text-2xl font-bold text-white mb-6">Profile Verification</h2>
                            
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
                                    {submitMessage.text}
                                </div>
                            )}

                            <div className="bg-white/5 border border-white/10 rounded-lg p-6 mb-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Requirements Checklist</h3>
                                <div className="space-y-3">
                                    <div className="flex items-center gap-3">
                                        {completion >= 100 ? (
                                            <CheckCircle className="text-green-400" size={20} />
                                        ) : (
                                            <AlertCircle className="text-red-400" size={20} />
                                        )}
                                        <span className="text-gray-300">Profile 100% Complete ({completion}%)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {projects && projects.length >= 3 ? (
                                            <CheckCircle className="text-green-400" size={20} />
                                        ) : (
                                            <AlertCircle className="text-red-400" size={20} />
                                        )}
                                        <span className="text-gray-300">At least 3 projects ({projects?.length || 0}/3)</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {documents?.resume?.path ? (
                                            <CheckCircle className="text-green-400" size={20} />
                                        ) : (
                                            <AlertCircle className="text-red-400" size={20} />
                                        )}
                                        <span className="text-gray-300">Resume uploaded</span>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        {documents?.collegeId?.path ? (
                                            <CheckCircle className="text-green-400" size={20} />
                                        ) : (
                                            <AlertCircle className="text-red-400" size={20} />
                                        )}
                                        <span className="text-gray-300">College ID uploaded</span>
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={handleSubmitVerification}
                                disabled={
                                    submitLoading || 
                                    completion < 100 || 
                                    verification?.status === 'pending' ||
                                    verification?.status === 'verified'
                                }
                                className={`w-full font-semibold py-3 px-6 rounded-lg transition-all duration-300 ${
                                    completion < 100 || verification?.status === 'pending' || verification?.status === 'verified'
                                        ? 'bg-gray-500/30 text-gray-400 cursor-not-allowed'
                                        : 'bg-gradient-to-r from-primary to-gold hover:shadow-lg hover:shadow-gold/50 text-white'
                                }`}
                            >
                                {submitLoading ? 'Submitting...' : 'Submit for Verification'}
                            </button>

                            {verification?.status === 'pending' && (
                                <p className="text-yellow-400 text-center mt-4">Your profile is pending verification. Admin will review within 24 hours.</p>
                            )}
                            {verification?.status === 'verified' && (
                                <p className="text-green-400 text-center mt-4">✓ Your profile is verified! You can now apply for projects.</p>
                            )}
                        </div>
                    )}
                </div>
            </main>

            <Footer />
        </div>
    );
};

export default StudentProfile;