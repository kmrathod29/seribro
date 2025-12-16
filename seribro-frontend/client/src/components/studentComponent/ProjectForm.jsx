// frontend/src/components/studentComponent/ProjectForm.jsx
// Hinglish: Project add/update/delete karne ka form as a full page component
import React, { useState, useEffect } from 'react';
import { addProject, updateProject, deleteProject } from '../../apis/studentProfileApi';
import { X, Plus, Trash2, Link as LinkIcon, Code, FileText, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react';

// The component now receives project, onBack, and onRefresh props
const ProjectForm = ({ project, onBack, onRefresh }) => {
    const isNew = !project || !project._id;
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
        // Reset form data if the project prop changes (e.g., switching from add to edit)
        setFormData(project || {
            title: '',
            link: '',
            technologies: [],
            description: '',
            isLive: false
        });
        setMessage('');
        setErrors({});
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
        
        const techToAdd = newTech.trim();
        if (!(formData.technologies || []).map(t => t.toLowerCase()).includes(techToAdd.toLowerCase())) {
            setFormData(prev => ({
                ...prev,
                technologies: [...(prev.technologies || []), techToAdd]
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
            setTimeout(onBack, 1500); // Go back after successful save
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
            setTimeout(onBack, 1500); // Go back after successful delete
        } catch (err) {
            const errorMsg = err.response?.data?.message || err.message || 'Failed to delete project';
            setMessage(`error:${errorMsg}`);
        } finally {
            setLoading(false);
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    // Full-page form structure, maintaining the dark theme and styles
    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/20 pb-4">
                <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                    <button onClick={onBack} className="text-gold hover:text-yellow-400 transition-colors">
                        <ArrowLeft size={24} />
                    </button>
                    {isNew ? 'Add New Project' : 'Edit Project'}
                </h2>
            </div>

            {/* Message Alert */}
            {message && (
                <div className={`p-4 rounded-lg flex items-center gap-3 ${
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

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
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
                            className="bg-gold hover:bg-yellow-400 text-navy px-4 rounded-lg transition-all flex items-center gap-2 font-semibold"
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
                        rows={6}
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
    );
};

export default ProjectForm;
