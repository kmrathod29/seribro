// frontend/src/components/companyComponent/DetailsForm.jsx
// Company Details Form (Industry, Size, Address, etc.)

import React, { useState, useEffect } from 'react';
import { updateCompanyDetails } from '../../apis/companyProfileApi';
import { validateGSTNumber } from '../../utils/company/validateGSTNumber';
import { validateCompanyData } from '../../utils/company/validateCompanyData';
import { MapPin, Building, Briefcase, AlertCircle, CheckCircle } from 'lucide-react';

const CompanyDetailsForm = ({ initialData, onUpdate }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    const industries = [
        'Information Technology',
        'Finance',
        'Healthcare',
        'E-commerce',
        'Manufacturing',
        'Retail',
        'Education',
        'Entertainment',
        'Logistics',
        'Automotive',
        'Other',
    ];

    const companySizes = [
        'Startup (1-10)',
        'Small (10-50)',
        'Medium (50-250)',
        'Large (250-1000)',
        'Enterprise (1000+)',
    ];

    useEffect(() => {
        setFormData(initialData || {
            officeAddress: {
                addressLine: '',
                city: 'Bhavnagar',
                state: 'Gujarat',
                postal: '',
            }
        });
    }, [initialData]);

    const validateForm = () => {
        const newErrors = {};
        
        if (!formData.industryType) {
            newErrors.industryType = 'Please select an industry type';
        }
        
        if (!formData.companySize) {
            newErrors.companySize = 'Please select company size';
        }

        if (formData.gstNumber && formData.gstNumber.trim().length > 0) {
            const gstValidation = validateGSTNumber(formData.gstNumber);
            if (!gstValidation.isValid) {
                newErrors.gstNumber = gstValidation.message;
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

    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            officeAddress: {
                ...prev.officeAddress,
                [name]: value,
            }
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
            const updatedInfo = await updateCompanyDetails(formData);
            onUpdate(updatedInfo);
            setMessage('success:Company Details updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.message || 'Failed to update details'}`);
        } finally {
            setLoading(false);
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Briefcase className="text-gold" size={28} />
                <h3 className="text-2xl font-bold text-white">Company Details</h3>
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
                {/* Industry Type */}
                <div>
                    <label className="block text-white font-semibold mb-2">Industry Type *</label>
                    <select
                        name="industryType"
                        value={formData.industryType || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                            errors.industryType ? 'border-red-500' : 'border-white/20'
                        } text-white focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                    >
                        <option value="">Select Industry Type</option>
                        {industries.map((industry) => (
                            <option key={industry} value={industry}>
                                {industry}
                            </option>
                        ))}
                    </select>
                    {errors.industryType && (
                        <p className="text-red-400 text-sm mt-1">{errors.industryType}</p>
                    )}
                </div>

                {/* Company Size */}
                <div>
                    <label className="block text-white font-semibold mb-2">Company Size *</label>
                    <select
                        name="companySize"
                        value={formData.companySize || ''}
                        onChange={handleChange}
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                            errors.companySize ? 'border-red-500' : 'border-white/20'
                        } text-white focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                    >
                        <option value="">Select Company Size</option>
                        {companySizes.map((size) => (
                            <option key={size} value={size}>
                                {size}
                            </option>
                        ))}
                    </select>
                    {errors.companySize && (
                        <p className="text-red-400 text-sm mt-1">{errors.companySize}</p>
                    )}
                </div>

                {/* Address Section */}
                <div className="bg-white/10 border border-white/20 rounded-lg p-6 space-y-4">
                    <h4 className="text-white font-semibold flex items-center gap-2">
                        <MapPin size={20} className="text-gold" />
                        Office Address
                    </h4>

                    {/* Address Line */}
                    <input
                        type="text"
                        name="addressLine"
                        value={formData.officeAddress?.addressLine || ''}
                        onChange={handleAddressChange}
                        placeholder="Street Address"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300"
                    />

                    {/* City */}
                    <input
                        type="text"
                        name="city"
                        value={formData.officeAddress?.city || ''}
                        onChange={handleAddressChange}
                        placeholder="City"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300"
                    />

                    {/* State */}
                    <input
                        type="text"
                        name="state"
                        value={formData.officeAddress?.state || ''}
                        onChange={handleAddressChange}
                        placeholder="State"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300"
                    />

                    {/* Postal Code */}
                    <input
                        type="text"
                        name="postal"
                        value={formData.officeAddress?.postal || ''}
                        onChange={handleAddressChange}
                        placeholder="Postal Code"
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300"
                    />
                </div>

                {/* About Section */}
                <div>
                    <label className="block text-white font-semibold mb-2">About Company</label>
                    <textarea
                        name="about"
                        value={formData.about || ''}
                        onChange={handleChange}
                        placeholder="Write about your company (max 500 characters)"
                        maxLength={500}
                        rows={4}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300 resize-none"
                    />
                    <p className="text-gray-400 text-sm mt-1">{formData.about?.length || 0}/500 characters</p>
                </div>

                {/* GST Number */}
                <div>
                    <label className="block text-white font-semibold mb-2">GST Number</label>
                    <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber || ''}
                        onChange={handleChange}
                        placeholder="e.g., 27ABCPA1234H1Z0"
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                            errors.gstNumber ? 'border-red-500' : 'border-white/20'
                        } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                    />
                    {errors.gstNumber && (
                        <p className="text-red-400 text-sm mt-1">{errors.gstNumber}</p>
                    )}
                </div>

                {/* Submit Button */}
                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-gold to-yellow-400 hover:from-yellow-400 hover:to-gold text-navy font-bold py-3 rounded-lg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? 'Updating...' : 'Update Company Details'}
                </button>
            </form>
        </div>
    );
};

export default CompanyDetailsForm;
