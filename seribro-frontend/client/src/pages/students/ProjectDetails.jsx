// src/pages/students/ProjectDetails.jsx
// Project details page with profile completion check - Phase 4.2

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Loader, AlertCircle, MapPin, Briefcase, Clock, DollarSign, CheckCircle, X } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProfileIncompleteModal from "../../components/studentComponent/ProfileIncompleteModal";
import { getProjectDetails, applyToProject } from "../../apis/studentProjectApi";

const ProjectDetails = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // States
    const [project, setProject] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [profileCheck, setProfileCheck] = useState({
        showModal: false,
        currentCompletion: 0,
        verificationStatus: 'draft',
    });

    // Application form state
    const [showApplicationForm, setShowApplicationForm] = useState(false);
    const [formData, setFormData] = useState({
        coverLetter: '',
        proposedPrice: '',
        estimatedTime: '1 week',
    });
    const [formLoading, setFormLoading] = useState(false);
    const [formError, setFormError] = useState(null);

    // Fetch project details
    useEffect(() => {
        const loadProject = async () => {
            try {
                setLoading(true);
                setError(null);

                // Fetch project details (backend will check profile completion)
                const response = await getProjectDetails(id);

                if (response.requiresCompletion) {
                    // Backend returned 403 - profile incomplete or not verified
                    // Show modal blocking access
                    const completionPercentage = response.data?.currentCompletion || 0;
                    const verificationStatus = response.data?.verificationStatus || 'draft';
                    
                    setProfileCheck({
                        showModal: true,
                        currentCompletion: completionPercentage,
                        verificationStatus: verificationStatus,
                    });
                    setProject(null);
                } else if (response.success) {
                    // Profile is complete and verified - show project details
                    setProject(response.data.project);
                } else {
                    // Other error
                    setError(response.message || 'Failed to load project');
                }
            } catch (err) {
                setError('An error occurred');
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        loadProject();
    }, [id]);

    // Handle apply
    const handleApply = async (e) => {
        e.preventDefault();
        try {
            setFormLoading(true);
            setFormError(null);

            // Validate
            if (formData.coverLetter.trim().length < 50) {
                setFormError('Cover letter must be at least 50 characters');
                setFormLoading(false);
                return;
            }

            if (!formData.proposedPrice || parseFloat(formData.proposedPrice) <= 0) {
                setFormError('Please enter a valid price');
                setFormLoading(false);
                return;
            }

            const response = await applyToProject(id, formData);

            if (response.success) {
                // Reset form and show success
                setFormData({ coverLetter: '', proposedPrice: '', estimatedTime: '1 week' });
                setShowApplicationForm(false);
                
                // Show success toast and redirect
                alert('Application submitted successfully!');
                navigate('/student/my-applications');
            } else {
                setFormError(response.message);
            }
        } catch (err) {
            setFormError('Failed to submit application');
            console.error(err);
        } finally {
            setFormLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark flex items-center justify-center">
                <Loader className="w-12 h-12 text-amber-400 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark flex flex-col">
            <Navbar />

            {/* Profile Incomplete Modal */}
            {profileCheck.showModal && (
                <ProfileIncompleteModal
                    isOpen={profileCheck.showModal}
                    currentCompletion={profileCheck.currentCompletion}
                    verificationStatus={profileCheck.verificationStatus}
                />
            )}

            {!profileCheck.showModal && (
                <div className="flex-1 px-4 py-12">
                    <div className="max-w-4xl mx-auto">
                        {/* Error */}
                        {error && (
                            <div className="mb-6 flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Project Content */}
                        {project && (
                            <div className="space-y-6">
                                {/* Back Button */}
                                <button
                                    onClick={() => navigate('/student/browse-projects')}
                                    className="text-amber-400 hover:text-amber-300 flex items-center gap-2 text-sm font-medium"
                                >
                                    ← Back to Projects
                                </button>

                                {/* Header */}
                                <div className="bg-gradient-to-br from-slate-800/50 via-slate-800/30 to-slate-900/50 border border-white/10 rounded-xl p-6">
                                    <div className="flex items-start justify-between gap-4 mb-4">
                                        <div className="flex-1">
                                            <h1 className="text-3xl font-bold text-white mb-2">{project.title}</h1>
                                            <div className="flex flex-wrap items-center gap-4">
                                                {project.company && (
                                                    <div className="flex items-center gap-2">
                                                        {project.company.logo && (
                                                            <img
                                                                src={project.company.logo}
                                                                alt={project.company.name}
                                                                className="w-8 h-8 rounded-full object-cover"
                                                            />
                                                        )}
                                                        <div>
                                                            <span className="text-gray-300 font-semibold block">
                                                                {project.company.name}
                                                            </span>
                                                            <span className="text-xs text-gray-400 flex items-center gap-1">
                                                                <MapPin className="w-3 h-3" />
                                                                {project.company.city}
                                                            </span>
                                                        </div>
                                                        {project.company.isVerified && (
                                                            <span className="px-2 py-1 rounded text-xs font-semibold border bg-green-500/20 text-green-300 border-green-500/30">
                                                                ✔ Verified
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                <span className="px-3 py-1 rounded-full text-sm bg-green-500/20 text-green-300 border border-green-500/30">
                                                    {project.status}
                                                </span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Quick Info */}
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Category</div>
                                            <div className="text-sm font-semibold text-white">{project.category}</div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Budget Range</div>
                                            <div className="text-sm font-semibold text-amber-400">
                                                ₹{project.budgetMin?.toLocaleString('en-IN')} - ₹{project.budgetMax?.toLocaleString('en-IN')}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-xs text-gray-500 mb-1">Duration</div>
                                            <div className="text-sm font-semibold text-white">{project.projectDuration}</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                                    <h2 className="text-lg font-bold text-white mb-4">Project Description</h2>
                                    <p className="text-gray-300 whitespace-pre-wrap leading-relaxed">
                                        {project.description}
                                    </p>
                                </div>

                                {/* Skills & Timeline */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {/* Required Skills */}
                                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Required Skills</h2>
                                        <div className="space-y-2">
                                            {project.requiredSkills?.map((skill, idx) => (
                                                <div
                                                    key={idx}
                                                    className="flex items-center gap-2 p-2 rounded bg-white/5 border border-white/10"
                                                >
                                                    <CheckCircle className="w-4 h-4 text-amber-400" />
                                                    <span className="text-gray-300">{skill}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Timeline</h2>
                                        <div className="space-y-3">
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Deadline</div>
                                                <div className="text-lg font-semibold text-white">
                                                    {new Date(project.deadline).toLocaleDateString('en-IN', {
                                                        year: 'numeric',
                                                        month: 'long',
                                                        day: 'numeric',
                                                    })}
                                                </div>
                                            </div>
                                            <div>
                                                <div className="text-xs text-gray-500 mb-1">Project Duration</div>
                                                <div className="text-sm text-gray-300">{project.projectDuration}</div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Company Info */}
                                {project.company && (
                                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Company Information</h2>
                                        <div className="flex items-start gap-4 mb-4">
                                            {project.company.logo && (
                                                <img
                                                    src={project.company.logo}
                                                    alt={project.company.name}
                                                    className="w-16 h-16 rounded-full object-cover flex-shrink-0"
                                                />
                                            )}
                                            <div className="flex-1">
                                                <h3 className="text-xl font-bold text-gray-300 mb-1">{project.company.name}</h3>
                                                <p className="text-sm text-gray-400 flex items-center gap-2 mb-2">
                                                    <MapPin className="w-4 h-4 text-blue-400" />
                                                    {project.company.city}
                                                </p>
                                                {project.company.isVerified && (
                                                    <span className="inline-block px-3 py-1 rounded text-sm font-semibold border bg-green-500/20 text-green-300 border-green-500/30">
                                                        ✔ Verified Company
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Company Info - New Section */}
                                {project.company && (
                                    <div className="bg-slate-800/50 border border-white/10 rounded-xl p-6">
                                        <h2 className="text-lg font-bold text-white mb-4">Company Information</h2>
                                        <div className="flex items-center gap-4">
                                            {project.company.logo && (
                                                <img
                                                    src={project.company.logo}
                                                    alt={project.company.name}
                                                    className="w-12 h-12 rounded-full object-cover"
                                                />
                                            )}
                                            <div>
                                                <h3 className="text-xl font-semibold text-gray-300">{project.company.name}</h3>
                                                <p className="text-sm text-gray-400 flex items-center gap-1">
                                                    <MapPin className="w-4 h-4 text-blue-400" />
                                                    {project.company.city}
                                                </p>
                                            </div>
                                            {project.company.isVerified && (
                                                <span className="px-3 py-1 rounded text-xs font-semibold border bg-green-500/20 text-green-300 border-green-500/30">
                                                    Verified
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {/* Application Section */}
                                <div className="bg-gradient-to-r from-amber-500/10 to-yellow-400/10 border border-amber-500/30 rounded-xl p-6">
                                    {/* PART 7: Student-specific assignment messaging */}
                                    {project.isAssignedToYou ? (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                            <div>
                                                <h3 className="font-semibold text-white">Project Assigned to You</h3>
                                                <p className="text-sm text-gray-400">You have been selected and assigned to this project.</p>
                                            </div>
                                        </div>
                                    ) : project.isAssignedToOther ? (
                                        <div className="flex items-center gap-3">
                                            <X className="w-6 h-6 text-gray-400" />
                                            <div>
                                                <h3 className="font-semibold text-white">Project Assigned</h3>
                                                <p className="text-sm text-gray-400">This project has been assigned to another student.</p>
                                            </div>
                                        </div>
                                    ) : project.hasApplied ? (
                                        <div className="flex items-center gap-3">
                                            <CheckCircle className="w-6 h-6 text-green-400" />
                                            <div>
                                                <h3 className="font-semibold text-white">You've Applied</h3>
                                                <p className="text-sm text-gray-400">Status: {project.applicationStatus}</p>
                                            </div>
                                        </div>
                                    ) : (
                                        <>
                                            {!showApplicationForm ? (
                                                <button
                                                    onClick={() => setShowApplicationForm(true)}
                                                    className="w-full px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-slate-900 font-bold transition-all duration-200 transform hover:scale-105"
                                                >
                                                    Apply Now
                                                </button>
                                            ) : (
                                                <div className="space-y-4">
                                                    <form onSubmit={handleApply} className="space-y-4">
                                                        {/* Cover Letter */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Cover Letter ({formData.coverLetter.length}/1000)
                                                            </label>
                                                            <textarea
                                                                value={formData.coverLetter}
                                                                onChange={(e) =>
                                                                    setFormData({ ...formData, coverLetter: e.target.value.slice(0, 1000) })
                                                                }
                                                                placeholder="Tell the company why you're a good fit for this project..."
                                                                className="w-full p-3 rounded-lg bg-slate-700/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 resize-none"
                                                                rows="5"
                                                                minLength="50"
                                                            />
                                                            <p className="text-xs text-gray-500 mt-1">Minimum 50 characters required</p>
                                                        </div>

                                                        {/* Proposed Price */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Proposed Price (₹)
                                                            </label>
                                                            <input
                                                                type="number"
                                                                value={formData.proposedPrice}
                                                                onChange={(e) =>
                                                                    setFormData({ ...formData, proposedPrice: e.target.value })
                                                                }
                                                                placeholder="Enter your proposed price"
                                                                className="w-full p-3 rounded-lg bg-slate-700/50 border border-white/10 text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                                                                min="0"
                                                            />
                                                        </div>

                                                        {/* Estimated Time */}
                                                        <div>
                                                            <label className="block text-sm font-medium text-gray-300 mb-2">
                                                                Estimated Time to Complete
                                                            </label>
                                                            <select
                                                                value={formData.estimatedTime}
                                                                onChange={(e) =>
                                                                    setFormData({ ...formData, estimatedTime: e.target.value })
                                                                }
                                                                className="w-full p-3 rounded-lg bg-slate-700/50 border border-white/10 text-white focus:outline-none focus:border-amber-500/50"
                                                            >
                                                                <option value="1 week">1 week</option>
                                                                <option value="2 weeks">2 weeks</option>
                                                                <option value="3-4 weeks">3-4 weeks</option>
                                                                <option value="1-2 months">1-2 months</option>
                                                                <option value="2-3 months">2-3 months</option>
                                                            </select>
                                                        </div>

                                                        {/* Error */}
                                                        {formError && (
                                                            <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300 text-sm">
                                                                {formError}
                                                            </div>
                                                        )}

                                                        {/* Buttons */}
                                                        <div className="flex gap-2">
                                                            <button
                                                                type="submit"
                                                                disabled={formLoading}
                                                                className="flex-1 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 disabled:opacity-50 disabled:cursor-not-allowed text-slate-900 font-bold transition-all duration-200"
                                                            >
                                                                {formLoading ? 'Submitting...' : 'Submit Application'}
                                                            </button>
                                                            <button
                                                                type="button"
                                                                onClick={() => setShowApplicationForm(false)}
                                                                className="px-6 py-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-gray-300 font-medium transition-colors"
                                                            >
                                                                Cancel
                                                            </button>
                                                        </div>
                                                    </form>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            )}

            <Footer />
        </div>
    );
};

export default ProjectDetails;
