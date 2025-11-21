// frontend/src/components/Profile/BasicInfoForm.jsx
// Hinglish: Student ki basic details ko update karne ka form with improved UI

import React, { useState, useEffect } from 'react';
import { updateBasicInfo } from '../../apis/studentProfileApi';
import { User, Phone, GraduationCap, Calendar, BookOpen, FileText, AlertCircle, CheckCircle, MapPin, Zap, Lock, Code } from 'lucide-react';

const BasicInfoForm = ({ initialData, onUpdate }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initialData || {});
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.fullName || formData.fullName.trim().length < 3) {
            newErrors.fullName = 'Full name must be at least 3 characters';
        }
        
        if (formData.email && !/^$|^\S+@\S+\.\S+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }
        
        if (!formData.phone || !/^[0-9]{10}$/.test(formData.phone)) {
            newErrors.phone = 'Phone must be 10 digits';
        }
        
        if (!formData.collegeName || formData.collegeName.trim().length < 3) {
            newErrors.collegeName = 'College name is required';
        }
        
        if (!formData.degree) {
            newErrors.degree = 'Please select a degree';
        }
        
        if (!formData.graduationYear || formData.graduationYear < 2020 || formData.graduationYear > 2035) {
            newErrors.graduationYear = 'Enter valid graduation year (2020-2035)';
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error for this field when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!validateForm()) {
            setMessage('Please fix all errors before submitting');
            return;
        }
        
        setLoading(true);
        setMessage('');

        try {
            const updatedInfo = await updateBasicInfo(formData);
            onUpdate(updatedInfo);
            setMessage('success:Basic Info updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.response?.data?.message || err.message || 'Failed to update basic info'}`);
        } finally {
            setLoading(false);
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <User className="text-gold" size={28} />
                <h3 className="text-2xl font-bold text-white">Basic Information</h3>
            </div>

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

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Full Name */}
                <div className="space-y-2">
                    <label htmlFor="fullName" className="flex items-center gap-2 text-white font-semibold">
                        <User size={18} />
                        Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        id="fullName"
                        name="fullName"
                        value={formData.fullName || ''}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        placeholder="Enter your full name"
                    />
                    {errors.fullName && (
                        <p className="text-red-400 text-sm flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.fullName}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div className="space-y-2">
                    <label htmlFor="email" className="flex items-center gap-2 text-white font-semibold">
                        <Zap size={18} />
                        Email <span className="text-gray-400">(Optional)</span>
                    </label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email || ''}
                        onChange={handleChange}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        placeholder="your.email@example.com"
                    />
                    {errors.email && (
                        <p className="text-red-400 text-sm flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.email}
                        </p>
                    )}
                </div>

                {/* Phone */}
                <div className="space-y-2">
                    <label htmlFor="phone" className="flex items-center gap-2 text-white font-semibold">
                        <Phone size={18} />
                        Phone Number <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        value={formData.phone || ''}
                        onChange={handleChange}
                        required
                        maxLength={10}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        placeholder="10 digit mobile number"
                    />
                    {errors.phone && (
                        <p className="text-red-400 text-sm flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.phone}
                        </p>
                    )}
                </div>

                {/* College Name */}
                <div className="space-y-2">
                    <label htmlFor="collegeName" className="flex items-center gap-2 text-white font-semibold">
                        <GraduationCap size={18} />
                        College Name <span className="text-red-400">*</span>
                    </label>
                    <input
                        type="text"
                        id="collegeName"
                        name="collegeName"
                        value={formData.collegeName || ''}
                        onChange={handleChange}
                        required
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        placeholder="Enter your college name"
                    />
                    {errors.collegeName && (
                        <p className="text-red-400 text-sm flex items-center gap-1">
                            <AlertCircle size={14} /> {errors.collegeName}
                        </p>
                    )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Graduation Year */}
                    <div className="space-y-2">
                        <label htmlFor="graduationYear" className="flex items-center gap-2 text-white font-semibold">
                            <Calendar size={18} />
                            Graduation Year <span className="text-red-400">*</span>
                        </label>
                        <input
                            type="number"
                            id="graduationYear"
                            name="graduationYear"
                            value={formData.graduationYear || ''}
                            onChange={handleChange}
                            required
                            min="2020"
                            max="2035"
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                            placeholder="2025"
                        />
                        {errors.graduationYear && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.graduationYear}
                            </p>
                        )}
                    </div>

                    {/* Degree */}
                    <div className="space-y-2">
                        <label htmlFor="degree" className="flex items-center gap-2 text-white font-semibold">
                            <BookOpen size={18} />
                            Degree <span className="text-red-400">*</span>
                        </label>
                        <select
                            id="degree"
                            name="degree"
                            value={formData.degree || ''}
                            onChange={handleChange}
                            required
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        >
                            <option value="" className="bg-navy">Select Degree</option>
                            <option value="B.Tech" className="bg-navy">B.Tech</option>
                            <option value="M.Tech" className="bg-navy">M.Tech</option>
                            <option value="BCA" className="bg-navy">BCA</option>
                            <option value="MCA" className="bg-navy">MCA</option>
                            <option value="B.Sc" className="bg-navy">B.Sc</option>
                            <option value="M.Sc" className="bg-navy">M.Sc</option>
                            <option value="Diploma" className="bg-navy">Diploma</option>
                            <option value="Other" className="bg-navy">Other</option>
                        </select>
                        {errors.degree && (
                            <p className="text-red-400 text-sm flex items-center gap-1">
                                <AlertCircle size={14} /> {errors.degree}
                            </p>
                        )}
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Branch */}
                    <div className="space-y-2">
                        <label htmlFor="branch" className="flex items-center gap-2 text-white font-semibold">
                            <Code size={18} />
                            Branch <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="branch"
                            name="branch"
                            value={formData.branch || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                            placeholder="e.g., Computer Science, Electronics"
                        />
                    </div>

                    {/* Current Year */}
                    <div className="space-y-2">
                        <label htmlFor="currentYear" className="flex items-center gap-2 text-white font-semibold">
                            <Zap size={18} />
                            Current Year <span className="text-gray-400">(Optional)</span>
                        </label>
                        <select
                            id="currentYear"
                            name="currentYear"
                            value={formData.currentYear || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        >
                            <option value="" className="bg-navy">Select Current Year</option>
                            <option value="1st Year" className="bg-navy">1st Year</option>
                            <option value="2nd Year" className="bg-navy">2nd Year</option>
                            <option value="3rd Year" className="bg-navy">3rd Year</option>
                            <option value="4th Year" className="bg-navy">4th Year</option>
                            <option value="Passout" className="bg-navy">Passout</option>
                        </select>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Semester */}
                    <div className="space-y-2">
                        <label htmlFor="semester" className="flex items-center gap-2 text-white font-semibold">
                            <BookOpen size={18} />
                            Semester <span className="text-gray-400">(Optional)</span>
                        </label>
                        <select
                            id="semester"
                            name="semester"
                            value={formData.semester || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                        >
                            <option value="" className="bg-navy">Select Semester</option>
                            <option value="1" className="bg-navy">1st Semester</option>
                            <option value="2" className="bg-navy">2nd Semester</option>
                            <option value="3" className="bg-navy">3rd Semester</option>
                            <option value="4" className="bg-navy">4th Semester</option>
                            <option value="5" className="bg-navy">5th Semester</option>
                            <option value="6" className="bg-navy">6th Semester</option>
                            <option value="7" className="bg-navy">7th Semester</option>
                            <option value="8" className="bg-navy">8th Semester</option>
                        </select>
                    </div>

                    {/* Location */}
                    <div className="space-y-2">
                        <label htmlFor="location" className="flex items-center gap-2 text-white font-semibold">
                            <MapPin size={18} />
                            Location/City <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="location"
                            name="location"
                            value={formData.location || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                            placeholder="e.g., Delhi, Mumbai, Bangalore"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Student ID */}
                    <div className="space-y-2">
                        <label htmlFor="studentId" className="flex items-center gap-2 text-white font-semibold">
                            <Lock size={18} />
                            Student ID <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="studentId"
                            name="studentId"
                            value={formData.studentId || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                            placeholder="e.g., STU123456"
                        />
                    </div>

                    {/* Roll Number */}
                    <div className="space-y-2">
                        <label htmlFor="rollNumber" className="flex items-center gap-2 text-white font-semibold">
                            <Lock size={18} />
                            Roll Number <span className="text-gray-400">(Optional)</span>
                        </label>
                        <input
                            type="text"
                            id="rollNumber"
                            name="rollNumber"
                            value={formData.rollNumber || ''}
                            onChange={handleChange}
                            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                            placeholder="e.g., 001"
                        />
                    </div>
                </div>

                {/* Bio */}
                <div className="space-y-2">
                    <label htmlFor="bio" className="flex items-center gap-2 text-white font-semibold">
                        <FileText size={18} />
                        Bio (Optional, Max 500 chars)
                    </label>
                    <textarea
                        id="bio"
                        name="bio"
                        value={formData.bio || ''}
                        onChange={handleChange}
                        maxLength={500}
                        rows={4}
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all resize-none"
                        placeholder="Tell us about yourself, your interests, and goals..."
                    />
                    <p className="text-gray-400 text-sm text-right">
                        {formData.bio?.length || 0}/500 characters
                    </p>
                </div>

                <button 
                    type="submit" 
                    disabled={loading} 
                    className="w-full bg-gradient-to-r from-gold to-yellow-400 hover:shadow-lg hover:shadow-gold/50 text-navy font-bold py-3 px-6 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy"></div>
                            Updating...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={20} />
                            Save Basic Info
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default BasicInfoForm;