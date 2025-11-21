// frontend/src/components/Profile/ProjectModal.jsx
// Hinglish: Project add/update/delete karne ka modal with improved UI

import React, { useState, useEffect } from 'react';
import { addProject, updateProject, deleteProject } from '../../apis/studentProfileApi';
import { X, Plus, Trash2, Link as LinkIcon, Code, FileText, CheckCircle, AlertCircle } from 'lucide-react';

const ProjectModal = ({ project, onClose, isNew, onRefresh }) => {
    const [formData, setFormData] = useState(project || {
        title: '',
        link: '',
        technologies: [],
        description: '',
        isLive: false
    });
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [newTech, setNewTech] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(project || {
            title: '',
            link: '',
            technologies: [],
            description: '',
            isLive: false
        });
    }, [project]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.title || formData.title.trim().length < 3) {
            newErrors.title = 'Title must be at least 3 characters';
        }
        
        if (formData.link && !/^https?:\/\/.+/.test(formData.link)) {
            newErrors.link = 'Link must be a valid URL (http:// or https://)';
        }
        
        if (!formData.description || formData.description.trim().length < 20) {
            newErrors.description = 'Description must be at least 20 characters';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
        
        // Clear error for this field
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const addTechnology = () => {
        if (!newTech.trim()) return;
        
        if (!formData.technologies.includes(newTech.trim())) {
            setFormData(prev => ({
                ...prev,
                technologies: [...(prev.technologies || []), newTech.trim()]
            }));
        }
        setNewTech('');
    };

    const removeTechnology = (index) => {
        setFormData(prev => ({
            ...prev,
            technologies: (prev.technologies || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setMessage('error:Please fix all errors before submitting');
            return;
        }
        
        setLoading(true);
        setMessage('');

        try {
            if (isNew) {
                await addProject(formData);
                setMessage('success:Project added successfully!');
            } else {
                await updateProject(project._id, formData);
                setMessage('success:Project updated successfully!');
            }
            if (onRefresh) onRefresh();
            setTimeout(onClose, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to save project';
            setMessage(`error:${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this project?')) return;

        setLoading(true);
        setMessage('');
        try {
            await deleteProject(project._id);
            setMessage('success:Project deleted successfully!');
            if (onRefresh) onRefresh();
            setTimeout(onClose, 1500);
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to delete project';
            setMessage(`error:${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    return (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-gradient-to-br from-navy via-navy-light to-navy-dark border-2 border-gold/30 rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-navy/95 backdrop-blur-md border-b border-gold/20 p-6 flex items-center justify-between">
                    <h3 className="text-2xl font-bold text-white flex items-center gap-2">
                        {isNew ? <Plus className="text-gold" size={24} /> : <FileText className="text-gold" size={24} />}
                        {isNew ? 'Add New Project' : 'Edit Project'}
                    </h3>
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="text-gray-400 hover:text-white transition-colors"
                    >
                        <X size={24} />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6">
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                            messageType === 'success' 
                                ? 'bg-green-500/20 border border-green-500 text-green-300'
                                : 'bg-red-500/20 border border-red-500 text-red-300'
                        }`}>
                            {messageType === 'success' ? (
                                <CheckCircle size={20} />
                            ) : (
                                <AlertCircle size={20} />
                            )}
                            {messageText}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {/* Title */}
                        <div className="space-y-2">
                            <label htmlFor="title" className="flex items-center gap-2 text-white font-semibold">
                                <FileText size={18} />
                                Project Title <span className="text-red-400">*</span>
                            </label>
                            <input 
                                type="text" 
                                id="title"
                                name="title" 
                                value={formData.title || ''} 
                                onChange={handleChange} 
                                required
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                                placeholder="E-commerce Website"
                            />
                            {errors.title && (
                                <p className="text-red-400 text-sm flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.title}
                                </p>
                            )}
                        </div>

                        {/* Link */}
                        <div className="space-y-2">
                            <label htmlFor="link" className="flex items-center gap-2 text-white font-semibold">
                                <LinkIcon size={18} />
                                Project Link (Optional)
                            </label>
                            <input 
                                type="url" 
                                id="link"
                                name="link" 
                                value={formData.link || ''} 
                                onChange={handleChange}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                                placeholder="https://github.com/username/project"
                            />
                            {errors.link && (
                                <p className="text-red-400 text-sm flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.link}
                                </p>
                            )}
                        </div>

                        {/* Technologies */}
                        <div className="space-y-2">
                            <label className="flex items-center gap-2 text-white font-semibold">
                                <Code size={18} />
                                Technologies Used
                            </label>
                            <div className="flex gap-2">
                                <input 
                                    type="text" 
                                    value={newTech}
                                    onChange={(e) => setNewTech(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTechnology())}
                                    className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                                    placeholder="e.g., React, Node.js"
                                />
                                <button
                                    type="button"
                                    onClick={addTechnology}
                                    className="bg-gold hover:bg-yellow-400 text-navy px-4 rounded-lg transition-all flex items-center gap-2"
                                >
                                    <Plus size={18} /> Add
                                </button>
                            </div>
                            
                            {/* Technology Tags */}
                            <div className="flex flex-wrap gap-2 mt-2">
                                {(formData.technologies || []).map((tech, idx) => (
                                    <span key={idx} className="inline-flex items-center gap-2 bg-gold/20 text-gold px-3 py-1 rounded-full text-sm border border-gold/30">
                                        {tech}
                                        <button
                                            type="button"
                                            onClick={() => removeTechnology(idx)}
                                            className="hover:text-red-400 transition-colors"
                                        >
                                            <X size={14} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div className="space-y-2">
                            <label htmlFor="description" className="flex items-center gap-2 text-white font-semibold">
                                <FileText size={18} />
                                Description <span className="text-red-400">*</span>
                            </label>
                            <textarea 
                                id="description"
                                name="description" 
                                value={formData.description || ''} 
                                onChange={handleChange} 
                                required
                                rows={4}
                                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all resize-none"
                                placeholder="Describe your project, its features, and your role..."
                            />
                            {errors.description && (
                                <p className="text-red-400 text-sm flex items-center gap-1">
                                    <AlertCircle size={14} /> {errors.description}
                                </p>
                            )}
                        </div>

                        {/* Is Live Checkbox */}
                        <div className="flex items-center gap-3 bg-white/5 p-3 rounded-lg">
                            <input 
                                type="checkbox" 
                                id="isLive" 
                                name="isLive" 
                                checked={formData.isLive || false} 
                                onChange={handleChange}
                                className="w-5 h-5 rounded border-gold/30 text-gold focus:ring-gold focus:ring-2"
                            />
                            <label htmlFor="isLive" className="text-white font-semibold cursor-pointer">
                                Project is Live & Deployed
                            </label>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-4">
                            <button 
                                type="submit" 
                                disabled={loading}
                                className="flex-1 bg-gradient-to-r from-gold to-yellow-400 hover:shadow-lg hover:shadow-gold/50 text-navy font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy"></div>
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <CheckCircle size={20} />
                                        {isNew ? 'Add Project' : 'Update Project'}
                                    </>
                                )}
                            </button>

                            {!isNew && (
                                <button 
                                    type="button" 
                                    onClick={handleDelete} 
                                    disabled={loading}
                                    className="bg-red-500 hover:bg-red-600 text-white font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    <Trash2 size={20} />
                                    Delete
                                </button>
                            )}
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProjectModal;