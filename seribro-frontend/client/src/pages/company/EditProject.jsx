// src/pages/company/EditProject.jsx
// Edit Project Page - Phase 3 Improvement

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import { getProjectDetails, updateProject, formatApiError } from '../../apis/companyProjectApi';
<<<<<<< HEAD
import { ArrowLeft, Loader2 as Loader, AlertCircle } from 'lucide-react';
=======
import { ArrowLeft, Loader, AlertCircle } from 'lucide-react';
>>>>>>> c60feea9278ac643f4ee64b68ef91a22103c1bed

const EditProject = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [submitting, setSubmitting] = useState(false);
    const [project, setProject] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        category: '',
        requiredSkills: [],
        budgetMin: '',
        budgetMax: '',
        projectDuration: '',
        deadline: '',
    });
    const [skillInput, setSkillInput] = useState('');
    const [formErrors, setFormErrors] = useState({});

    useEffect(() => {
        loadProject();
    }, [id]);

    const loadProject = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await getProjectDetails(id);
            if (response.success) {
                const proj = response.data.project;
                setProject(proj);
                
                // Format deadline for input (YYYY-MM-DD)
                const deadline = new Date(proj.deadline).toISOString().split('T')[0];
                
                setFormData({
                    title: proj.title || '',
                    description: proj.description || '',
                    category: proj.category || '',
                    requiredSkills: Array.isArray(proj.requiredSkills) ? proj.requiredSkills : [],
                    budgetMin: proj.budgetMin || '',
                    budgetMax: proj.budgetMax || '',
                    projectDuration: proj.projectDuration || '',
                    deadline: deadline || '',
                });
            } else {
                setError(response.message || 'Failed to load project');
            }
        } catch (err) {
            const apiError = formatApiError(err);
            setError(apiError.message);
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        // Clear error for this field
        if (formErrors[name]) {
            setFormErrors(prev => ({
                ...prev,
                [name]: ''
            }));
        }
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
            setFormData(prev => ({
                ...prev,
                requiredSkills: [...prev.requiredSkills, skillInput.trim()]
            }));
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skill) => {
        setFormData(prev => ({
            ...prev,
            requiredSkills: prev.requiredSkills.filter(s => s !== skill)
        }));
    };

    const validateForm = () => {
        const errors = {};
        
        if (!formData.title.trim()) {
            errors.title = 'Project title is required';
        }
        
        if (!formData.description.trim()) {
            errors.description = 'Project description is required';
        }
        
        if (!formData.category) {
            errors.category = 'Category is required';
        }
        
        if (formData.requiredSkills.length === 0) {
            errors.requiredSkills = 'At least one skill is required';
        }
        
        if (!formData.budgetMin) {
            errors.budgetMin = 'Minimum budget is required';
        }
        
        if (!formData.budgetMax) {
            errors.budgetMax = 'Maximum budget is required';
        }
        
        if (parseFloat(formData.budgetMin) > parseFloat(formData.budgetMax)) {
            errors.budgetMin = 'Minimum budget cannot be greater than maximum budget';
        }
        
        if (!formData.projectDuration) {
            errors.projectDuration = 'Project duration is required';
        }
        
        if (!formData.deadline) {
            errors.deadline = 'Deadline is required';
        }
        
        const deadlineDate = new Date(formData.deadline);
        if (deadlineDate <= new Date()) {
            errors.deadline = 'Deadline must be in the future';
        }
        
        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the errors in the form');
            return;
        }
        
        setSubmitting(true);
        try {
            const response = await updateProject(id, {
                title: formData.title,
                description: formData.description,
                category: formData.category,
                requiredSkills: formData.requiredSkills,
                budgetMin: parseFloat(formData.budgetMin),
                budgetMax: parseFloat(formData.budgetMax),
                projectDuration: formData.projectDuration,
                deadline: formData.deadline,
            });

            if (response.success) {
                toast.success('Project updated successfully!');
                navigate(`/company/projects/${id}`);
            } else {
                toast.error(response.message || 'Failed to update project');
                setError(response.message || 'Update failed');
            }
        } catch (err) {
            const apiError = formatApiError(err);
            toast.error(apiError.message || 'Error updating project');
            setError(apiError.message);
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="flex justify-center items-center h-[60vh]">
                    <div className="text-center">
                        <Loader className="animate-spin text-gold mx-auto mb-4" size={40} />
                        <p className="text-gray-300 text-lg">Loading project details...</p>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (error && !project) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-20">
                    <div className="bg-red-500/10 border border-red-500 rounded-lg p-6 flex gap-4">
                        <AlertCircle className="text-red-400 flex-shrink-0" size={24} />
                        <div className="flex-1">
                            <h3 className="text-red-400 font-bold mb-2">Error Loading Project</h3>
                            <p className="text-red-300 mb-4">{error}</p>
                            <button
                                onClick={() => navigate('/company/projects')}
                                className="text-red-400 hover:text-red-300 underline"
                            >
                                Back to Projects
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    if (!project) {
        return null;
    }

    if (project.status !== 'open') {
        return (
            <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
                <Navbar />
                <div className="max-w-2xl mx-auto px-4 py-20">
                    <div className="bg-amber-500/10 border border-amber-500 rounded-lg p-6 flex gap-4">
                        <AlertCircle className="text-amber-400 flex-shrink-0" size={24} />
                        <div className="flex-1">
                            <h3 className="text-amber-400 font-bold mb-2">Cannot Edit Project</h3>
                            <p className="text-amber-300 mb-4">
                                Only projects with "open" status can be edited. This project is currently <strong>{project.status}</strong>.
                            </p>
                            <button
                                onClick={() => navigate(`/company/projects/${id}`)}
                                className="text-amber-400 hover:text-amber-300 underline"
                            >
                                Back to Project Details
                            </button>
                        </div>
                    </div>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark">
            <Navbar />

            <div className="max-w-4xl mx-auto px-4 py-20">
                {/* Back Button */}
                <button
                    onClick={() => navigate(`/company/projects/${id}`)}
                    className="flex items-center gap-2 text-gold hover:text-yellow-400 mb-6 transition-colors"
                >
                    <ArrowLeft size={20} /> Back to Project Details
                </button>

                {/* Header */}
                <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-xl p-8 mb-8">
                    <h1 className="text-4xl font-bold text-white mb-2">Edit Project</h1>
                    <p className="text-gray-300">Update your project details. Only open projects can be edited.</p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-xl p-8 space-y-6">
                    
                    {/* Title */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Project Title *</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none transition ${
                                formErrors.title ? 'border-red-500' : 'border-gold/20 focus:border-gold'
                            }`}
                            placeholder="Enter project title"
                        />
                        {formErrors.title && <p className="text-red-400 text-sm mt-1">{formErrors.title}</p>}
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Project Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={5}
                            className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none transition resize-none ${
                                formErrors.description ? 'border-red-500' : 'border-gold/20 focus:border-gold'
                            }`}
                            placeholder="Describe your project in detail"
                        />
                        {formErrors.description && <p className="text-red-400 text-sm mt-1">{formErrors.description}</p>}
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Category *</label>
                        <select
                            name="category"
                            value={formData.category}
                            onChange={handleInputChange}
                            className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white focus:outline-none transition ${
                                formErrors.category ? 'border-red-500' : 'border-gold/20 focus:border-gold'
                            }`}
                        >
                            <option value="">Select a category</option>
                            <option value="Web Development">Web Development</option>
                            <option value="Mobile App">Mobile App</option>
                            <option value="Data Science">Data Science</option>
                            <option value="Machine Learning">Machine Learning</option>
                            <option value="Cloud Computing">Cloud Computing</option>
                            <option value="DevOps">DevOps</option>
                            <option value="UI/UX Design">UI/UX Design</option>
                            <option value="Other">Other</option>
                        </select>
                        {formErrors.category && <p className="text-red-400 text-sm mt-1">{formErrors.category}</p>}
                    </div>

                    {/* Skills */}
                    <div>
                        <label className="block text-white font-semibold mb-2">Required Skills *</label>
                        <div className="flex gap-2 mb-3">
                            <input
                                type="text"
                                value={skillInput}
                                onChange={(e) => setSkillInput(e.target.value)}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                className="flex-1 px-4 py-2 rounded-lg bg-white/10 border border-gold/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold transition"
                                placeholder="Add a skill and press Enter or click Add"
                            />
                            <button
                                type="button"
                                onClick={handleAddSkill}
                                className="px-4 py-2 bg-gold/20 hover:bg-gold/30 text-gold border border-gold/30 rounded-lg transition"
                            >
                                Add Skill
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {formData.requiredSkills.map((skill) => (
                                <span
                                    key={skill}
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-gold/20 border border-gold text-gold rounded-full text-sm"
                                >
                                    {skill}
                                    <button
                                        type="button"
                                        onClick={() => handleRemoveSkill(skill)}
                                        className="hover:text-red-300 transition"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                        {formErrors.requiredSkills && <p className="text-red-400 text-sm">{formErrors.requiredSkills}</p>}
                    </div>

                    {/* Budget */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white font-semibold mb-2">Minimum Budget (₹) *</label>
                            <input
                                type="number"
                                name="budgetMin"
                                value={formData.budgetMin}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none transition ${
                                    formErrors.budgetMin ? 'border-red-500' : 'border-gold/20 focus:border-gold'
                                }`}
                                placeholder="0"
                                min="0"
                            />
                            {formErrors.budgetMin && <p className="text-red-400 text-sm mt-1">{formErrors.budgetMin}</p>}
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">Maximum Budget (₹) *</label>
                            <input
                                type="number"
                                name="budgetMax"
                                value={formData.budgetMax}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white placeholder-gray-400 focus:outline-none transition ${
                                    formErrors.budgetMax ? 'border-red-500' : 'border-gold/20 focus:border-gold'
                                }`}
                                placeholder="0"
                                min="0"
                            />
                            {formErrors.budgetMax && <p className="text-red-400 text-sm mt-1">{formErrors.budgetMax}</p>}
                        </div>
                    </div>

                    {/* Duration and Deadline */}
                    <div className="grid md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-white font-semibold mb-2">Project Duration *</label>
                            <select
                                name="projectDuration"
                                value={formData.projectDuration}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white focus:outline-none transition ${
                                    formErrors.projectDuration ? 'border-red-500' : 'border-gold/20 focus:border-gold'
                                }`}
                            >
                                <option value="">Select duration</option>
                                <option value="1-2 weeks">1-2 weeks</option>
                                <option value="2-4 weeks">2-4 weeks</option>
                                <option value="1-3 months">1-3 months</option>
                                <option value="3-6 months">3-6 months</option>
                                <option value="6+ months">6+ months</option>
                            </select>
                            {formErrors.projectDuration && <p className="text-red-400 text-sm mt-1">{formErrors.projectDuration}</p>}
                        </div>
                        <div>
                            <label className="block text-white font-semibold mb-2">Deadline *</label>
                            <input
                                type="date"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleInputChange}
                                className={`w-full px-4 py-3 rounded-lg bg-white/10 border text-white focus:outline-none transition ${
                                    formErrors.deadline ? 'border-red-500' : 'border-gold/20 focus:border-gold'
                                }`}
                            />
                            {formErrors.deadline && <p className="text-red-400 text-sm mt-1">{formErrors.deadline}</p>}
                        </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-3 pt-6">
                        <button
                            type="button"
                            onClick={() => navigate(`/company/projects/${id}`)}
                            className="flex-1 px-6 py-3 bg-gray-600 hover:bg-gray-700 text-white font-semibold rounded-lg transition-all"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="flex-1 px-6 py-3 bg-gold hover:bg-yellow-500 text-navy font-semibold rounded-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {submitting && <Loader size={20} className="animate-spin" />}
                            {submitting ? 'Updating...' : 'Update Project'}
                        </button>
                    </div>
                </form>
            </div>

            <Footer />
        </div>
    );
};

export default EditProject;
