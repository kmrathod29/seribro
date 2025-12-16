// src/components/companyComponent/ProjectForm.jsx
// Reusable project form component - Phase 4.1

import React, { useState } from 'react';
import { X } from 'lucide-react';

const ProjectForm = ({ onSubmit, loading = false, initialData = null }) => {
    const [formData, setFormData] = useState(
        initialData || {
            title: '',
            category: '',
            description: '',
            requiredSkills: [],
            budgetMin: '',
            budgetMax: '',
            projectDuration: '',
            deadline: '',
        }
    );

    const [errors, setErrors] = useState({});
    const [skillInput, setSkillInput] = useState('');

    const categories = [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'AI/ML',
        'Cloud & DevOps',
        'Backend Development',
        'Frontend Development',
        'Full Stack',
        'Blockchain',
        'IoT',
        'Cybersecurity',
        'Other',
    ];

    const durations = ['1 week', '2 weeks', '1 month', '2 months', '3 months', '6 months', '1 year'];

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        // Clear error for this field
        if (errors[name]) {
            setErrors({ ...errors, [name]: '' });
        }
    };

    const handleAddSkill = () => {
        if (skillInput.trim() && !formData.requiredSkills.includes(skillInput.trim())) {
            setFormData({
                ...formData,
                requiredSkills: [...formData.requiredSkills, skillInput.trim()],
            });
            setSkillInput('');
        }
    };

    const handleRemoveSkill = (skillToRemove) => {
        setFormData({
            ...formData,
            requiredSkills: formData.requiredSkills.filter((skill) => skill !== skillToRemove),
        });
    };

    const validateForm = () => {
        const newErrors = {};

        if (!formData.title.trim()) newErrors.title = 'Project title is required';
        if (formData.title.length < 5) newErrors.title = 'Title must be at least 5 characters';
        if (formData.title.length > 100) newErrors.title = 'Title cannot exceed 100 characters';

        if (!formData.description.trim()) newErrors.description = 'Description is required';
        if (formData.description.length < 20) newErrors.description = 'Description must be at least 20 characters';

        if (!formData.category) newErrors.category = 'Category is required';

        if (formData.requiredSkills.length === 0) newErrors.requiredSkills = 'At least one skill is required';

        if (!formData.budgetMin || isNaN(formData.budgetMin) || formData.budgetMin < 0)
            newErrors.budgetMin = 'Valid minimum budget is required';

        if (!formData.budgetMax || isNaN(formData.budgetMax) || formData.budgetMax < 0)
            newErrors.budgetMax = 'Valid maximum budget is required';

        if (parseFloat(formData.budgetMin) > parseFloat(formData.budgetMax))
            newErrors.budgetMax = 'Maximum budget must be greater than minimum';

        if (!formData.projectDuration) newErrors.projectDuration = 'Project duration is required';

        if (!formData.deadline) newErrors.deadline = 'Deadline is required';
        if (new Date(formData.deadline) <= new Date()) newErrors.deadline = 'Deadline must be in the future';

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (validateForm()) {
            onSubmit(formData);
        }
    };

    const getMinDate = () => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split('T')[0];
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Project Title</label>
                <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="Enter project title"
                    className={`w-full px-4 py-2 bg-navy/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all ${
                        errors.title ? 'border-red-500' : 'border-gray-600'
                    }`}
                />
                {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
            </div>

            {/* Category */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Category</label>
                <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-navy/50 border rounded-lg text-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all ${
                        errors.category ? 'border-red-500' : 'border-gray-600'
                    }`}
                >
                    <option value="">Select a category</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>
                            {cat}
                        </option>
                    ))}
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Description</label>
                <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    placeholder="Describe your project in detail"
                    rows={6}
                    className={`w-full px-4 py-2 bg-navy/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all resize-none ${
                        errors.description ? 'border-red-500' : 'border-gray-600'
                    }`}
                />
                <p className="text-gray-500 text-xs mt-1">{formData.description.length}/5000 characters</p>
                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Required Skills */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Required Skills</label>
                <div className="flex gap-2 mb-3">
                    <input
                        type="text"
                        value={skillInput}
                        onChange={(e) => setSkillInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                        placeholder="Add a skill and press Enter"
                        className="flex-1 px-4 py-2 bg-navy/50 border border-gray-600 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all"
                    />
                    <button
                        type="button"
                        onClick={handleAddSkill}
                        className="px-4 py-2 bg-gold hover:bg-yellow-400 text-navy font-semibold rounded-lg transition-all duration-300"
                    >
                        Add
                    </button>
                </div>

                <div className="flex flex-wrap gap-2">
                    {formData.requiredSkills.map((skill) => (
                        <span
                            key={skill}
                            className="inline-flex items-center gap-1 px-3 py-1 bg-gold/20 border border-gold text-gold rounded-full text-sm"
                        >
                            {skill}
                            <button
                                type="button"
                                onClick={() => handleRemoveSkill(skill)}
                                className="hover:text-gold/70"
                            >
                                <X size={14} />
                            </button>
                        </span>
                    ))}
                </div>
                {errors.requiredSkills && <p className="text-red-500 text-sm mt-2">{errors.requiredSkills}</p>}
            </div>

            {/* Budget */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Minimum Budget (₹)</label>
                    <input
                        type="number"
                        name="budgetMin"
                        value={formData.budgetMin}
                        onChange={handleInputChange}
                        placeholder="0"
                        className={`w-full px-4 py-2 bg-navy/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all ${
                            errors.budgetMin ? 'border-red-500' : 'border-gray-600'
                        }`}
                    />
                    {errors.budgetMin && <p className="text-red-500 text-sm mt-1">{errors.budgetMin}</p>}
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-300 mb-2">Maximum Budget (₹)</label>
                    <input
                        type="number"
                        name="budgetMax"
                        value={formData.budgetMax}
                        onChange={handleInputChange}
                        placeholder="0"
                        className={`w-full px-4 py-2 bg-navy/50 border rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all ${
                            errors.budgetMax ? 'border-red-500' : 'border-gray-600'
                        }`}
                    />
                    {errors.budgetMax && <p className="text-red-500 text-sm mt-1">{errors.budgetMax}</p>}
                </div>
            </div>

            {/* Project Duration */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Project Duration</label>
                <select
                    name="projectDuration"
                    value={formData.projectDuration}
                    onChange={handleInputChange}
                    className={`w-full px-4 py-2 bg-navy/50 border rounded-lg text-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all ${
                        errors.projectDuration ? 'border-red-500' : 'border-gray-600'
                    }`}
                >
                    <option value="">Select duration</option>
                    {durations.map((dur) => (
                        <option key={dur} value={dur}>
                            {dur}
                        </option>
                    ))}
                </select>
                {errors.projectDuration && <p className="text-red-500 text-sm mt-1">{errors.projectDuration}</p>}
            </div>

            {/* Deadline */}
            <div>
                <label className="block text-sm font-semibold text-gray-300 mb-2">Deadline</label>
                <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleInputChange}
                    min={getMinDate()}
                    className={`w-full px-4 py-2 bg-navy/50 border rounded-lg text-white focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/30 transition-all ${
                        errors.deadline ? 'border-red-500' : 'border-gray-600'
                    }`}
                />
                {errors.deadline && <p className="text-red-500 text-sm mt-1">{errors.deadline}</p>}
            </div>

            {/* Submit Button */}
            <button
                type="submit"
                disabled={loading}
                className="w-full px-6 py-3 bg-gold hover:bg-yellow-400 disabled:bg-gray-600 text-navy font-bold rounded-lg transition-all duration-300 disabled:cursor-not-allowed"
            >
                {loading ? 'Submitting...' : initialData ? 'Update Project' : 'Create Project'}
            </button>
        </form>
    );
};

export default ProjectForm;
