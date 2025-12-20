// frontend/src/components/companyComponent/AuthorizedPersonForm.jsx
// Authorized Person Information Form

import React, { useState, useEffect } from 'react';
import { updateAuthorizedPerson } from '../../apis/companyProfileApi';
// import { validateAuthorizedPersonData } from '../../utils/company/validateCompanyData';
import { Users, Mail, Briefcase, Linkedin, AlertCircle, CheckCircle } from 'lucide-react';

const AuthorizedPersonForm = ({ initialData, onUpdate }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initialData || {});
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.name || formData.name.trim().length < 3) {
            newErrors.name = 'Name is required (min 3 characters)';
        }
        
        if (!formData.designation || formData.designation.trim().length < 2) {
            newErrors.designation = 'Designation is required';
        }
        
        if (!formData.email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (formData.linkedIn && formData.linkedIn.trim() !== '') {
            if (!/^(https?:\/\/)?(www\.)?linkedin\.com\/(in|company)\/[a-zA-Z0-9-]+\/?$/.test(formData.linkedIn)) {
                newErrors.linkedIn = 'Please enter a valid LinkedIn profile URL';
            }
        }
        
        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
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
            const updatedInfo = await updateAuthorizedPerson(formData);
            onUpdate(updatedInfo);
            setMessage('success:Authorized Person information updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.message || 'Failed to update authorized person'}`);
        } finally {
            setLoading(false);
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Users className="text-gold" size={28} />
                <div className="flex-1">
                    <h3 className="text-2xl font-bold text-white">Authorized Person</h3>
                    <p className="text-gray-400 text-sm mt-1">Details of the person authorized to manage this account</p>
                </div>
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
                    <span>{messageText}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Name */}
                <div>
                    <label className="block text-white font-semibold mb-2">
                        Full Name <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="bg-gold/20 p-3 rounded-lg">
                            <Users className="text-gold" size={20} />
                        </div>
                        <input
                            type="text"
                            name="name"
                            value={formData.name || ''}
                            onChange={handleChange}
                            placeholder="Enter full name of authorized person"
                            className={`flex-1 px-4 py-3 rounded-lg bg-white/10 border ${
                                errors.name ? 'border-red-500' : 'border-white/20'
                            } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                        />
                    </div>
                    {errors.name && (
                        <p className="text-red-400 text-sm mt-2 flex items-center gap-1 ml-14">
                            <AlertCircle size={14} />
                            {errors.name}
                        </p>
                    )}
                </div>

                {/* Designation */}
                <div>
                    <label className="block text-white font-semibold mb-2">
                        Designation <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="bg-gold/20 p-3 rounded-lg">
                            <Briefcase className="text-gold" size={20} />
                        </div>
                        <input
                            type="text"
                            name="designation"
                            value={formData.designation || ''}
                            onChange={handleChange}
                            placeholder="e.g., CEO, Manager, HR Head, Founder"
                            className={`flex-1 px-4 py-3 rounded-lg bg-white/10 border ${
                                errors.designation ? 'border-red-500' : 'border-white/20'
                            } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                        />
                    </div>
                    {errors.designation && (
                        <p className="text-red-400 text-sm mt-2 flex items-center gap-1 ml-14">
                            <AlertCircle size={14} />
                            {errors.designation}
                        </p>
                    )}
                </div>

                {/* Email */}
                <div>
                    <label className="block text-white font-semibold mb-2">
                        Official Email <span className="text-red-400">*</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="bg-gold/20 p-3 rounded-lg">
                            <Mail className="text-gold" size={20} />
                        </div>
                        <input
                            type="email"
                            name="email"
                            value={formData.email || ''}
                            onChange={handleChange}
                            placeholder="authorized.person@company.com"
                            className={`flex-1 px-4 py-3 rounded-lg bg-white/10 border ${
                                errors.email ? 'border-red-500' : 'border-white/20'
                            } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-red-400 text-sm mt-2 flex items-center gap-1 ml-14">
                            <AlertCircle size={14} />
                            {errors.email}
                        </p>
                    )}
                    <p className="text-gray-400 text-xs mt-2 ml-14">This should be the official work email of the authorized person</p>
                </div>

                {/* LinkedIn */}
                <div>
                    <label className="block text-white font-semibold mb-2">
                        LinkedIn Profile <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                    </label>
                    <div className="flex items-center gap-3">
                        <div className="bg-blue-500/20 p-3 rounded-lg">
                            <Linkedin className="text-blue-400" size={20} />
                        </div>
                        <input
                            type="url"
                            name="linkedIn"
                            value={formData.linkedIn || ''}
                            onChange={handleChange}
                            placeholder="https://linkedin.com/in/username"
                            className={`flex-1 px-4 py-3 rounded-lg bg-white/10 border ${
                                errors.linkedIn ? 'border-red-500' : 'border-white/20'
                            } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                        />
                    </div>
                    {errors.linkedIn && (
                        <p className="text-red-400 text-sm mt-2 flex items-center gap-1 ml-14">
                            <AlertCircle size={14} />
                            {errors.linkedIn}
                        </p>
                    )}
                    <p className="text-gray-400 text-xs mt-2 ml-14">Adding LinkedIn profile helps build trust with students</p>
                </div>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4 flex gap-3">
                    <AlertCircle className="text-blue-300 flex-shrink-0 mt-0.5" size={20} />
                    <div>
                        <p className="text-blue-300 text-sm font-semibold mb-1">Why we need this?</p>
                        <p className="text-gray-300 text-xs">
                            This information helps students verify the authenticity of your company and feel confident when applying for projects. The authorized person will be the primary contact for verification purposes.
                        </p>
                    </div>
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-navy font-bold py-4 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                    {loading ? (
                        <>
                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-navy"></div>
                            Updating...
                        </>
                    ) : (
                        <>
                            <CheckCircle size={20} />
                            Update Authorized Person
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default AuthorizedPersonForm;