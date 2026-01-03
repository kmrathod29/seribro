// src/pages/company/PostProject.jsx
// Post a new project page - Phase 4.1

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2 as Loader, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProjectForm from '../../components/companyComponent/ProjectForm';
import { createProject, formatApiError } from '../../apis/companyProjectApi';
import { fetchCompanyDashboard } from '../../apis/companyProfileApi';

const PostProject = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const handleSubmit = async (formData) => {
        try {
            setLoading(true);
            setError(null);

            // Try to create project directly - backend will validate profile completion
            // This is better than frontend validation because backend has the source of truth
            const response = await createProject(formData);

            if (response.success) {
                setSuccess(true);
                setTimeout(() => {
                    navigate('/company/projects');
                }, 1500);
            } else {
                setError(response.message || 'Failed to create project');
            }
        } catch (err) {
            const apiError = formatApiError(err);
            setError(apiError.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            <div className="max-w-2xl mx-auto px-4 py-20">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Post a New Project</h1>
                    <p className="text-gold text-lg">Fill out the form below to create your project posting</p>
                </div>

                {/* Error Alert */}
                {error && (
                    <div className="mb-6 p-4 bg-red-500/20 border border-red-500 rounded-lg flex gap-3">
                        <AlertCircle className="text-red-500 flex-shrink-0 mt-0.5" size={20} />
                        <div>
                            <p className="text-white font-semibold">Error</p>
                            <p className="text-red-200 text-sm mt-1">{error}</p>
                        </div>
                    </div>
                )}

                {/* Success Message */}
                {success && (
                    <div className="mb-6 p-4 bg-green-500/20 border border-green-500 rounded-lg">
                        <p className="text-green-400 font-semibold">Project created successfully! Redirecting...</p>
                    </div>
                )}

                {/* Form */}
                <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-xl p-8">
                    <ProjectForm onSubmit={handleSubmit} loading={loading} />
                </div>

                {/* Info Section */}
                <div className="mt-8 p-6 bg-navy/50 border border-gold/10 rounded-lg">
                    <h3 className="text-gold font-bold mb-3">Tips for a Great Project Posting:</h3>
                    <ul className="space-y-2 text-gray-300 text-sm">
                        <li>✓ Write clear, detailed descriptions of your project requirements</li>
                        <li>✓ Specify all required skills needed to complete the project</li>
                        <li>✓ Set realistic budgets and deadlines</li>
                        <li>✓ Add at least 3-5 required skills</li>
                        <li>✓ Be specific about project scope and deliverables</li>
                    </ul>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default PostProject;
