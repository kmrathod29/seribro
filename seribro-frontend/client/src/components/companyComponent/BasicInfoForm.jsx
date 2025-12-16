// frontend/src/components/companyComponent/BasicInfoForm.jsx
// Company Basic Information Form

import React, { useState, useEffect } from 'react';
import { updateCompanyBasicInfo } from '../../apis/companyProfileApi';
import { validateBasicCompanyInfo } from '../../utils/company/validateCompanyData';
import { Building2, Phone, Globe, AlertCircle, CheckCircle } from 'lucide-react';

const CompanyBasicInfoForm = ({ initialData, onUpdate }) => {
    const [formData, setFormData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});

    useEffect(() => {
        setFormData(initialData || {});
    }, [initialData]);

    const validateForm = () => {
        const validation = validateBasicCompanyInfo(formData);
        setErrors(validation.errors);
        return validation.isValid;
    };

    // Handler for root level fields (Name, Mobile, Website, etc.)
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    // Handler specifically for nested Address fields
    const handleAddressChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            officeAddress: {
                ...prev.officeAddress,
                [name]: value
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
            const updatedInfo = await updateCompanyBasicInfo(formData);
            onUpdate(updatedInfo);
            setMessage('success:Basic Information updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.message || 'Failed to update basic info'}`);
        } finally {
            setLoading(false);
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Building2 className="text-gold" size={28} />
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
                    <span>{messageText}</span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* --- PART 1 FIELDS --- */}
                
                {/* Company Name */}
                <div>
                    <label className="block text-white font-semibold mb-2">Company Name *</label>
                    <input
                        type="text"
                        name="companyName"
                        value={formData.companyName || ''}
                        onChange={handleChange}
                        placeholder="Enter company name"
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                            errors.companyName ? 'border-red-500' : 'border-white/20'
                        } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                    />
                    {errors.companyName && (
                        <p className="text-red-400 text-sm mt-1">{errors.companyName}</p>
                    )}
                </div>

                {/* Email (Read-only) */}
                <div>
                    <label className="block text-white font-semibold mb-2">Company Email</label>
                    <input
                        type="email"
                        value={formData.companyEmail || ''}
                        disabled
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-gray-400 placeholder-gray-500 cursor-not-allowed"
                    />
                    <p className="text-gray-400 text-sm mt-1">Email is auto-populated from your account</p>
                </div>

                {/* Mobile */}
                <div>
                    <label className="block text-white font-semibold mb-2">Mobile Number *</label>
                    <div className="flex items-center gap-2">
                        <Phone className="text-gold" size={20} />
                        <input
                            type="tel"
                            name="mobile"
                            value={formData.mobile || ''}
                            onChange={handleChange}
                            placeholder="10-digit mobile number"
                            className={`flex-1 px-4 py-3 rounded-lg bg-white/10 border ${
                                errors.mobile ? 'border-red-500' : 'border-white/20'
                            } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                        />
                    </div>
                    {errors.mobile && (
                        <p className="text-red-400 text-sm mt-1">{errors.mobile}</p>
                    )}
                </div>

                {/* Website */}
                <div>
                    <label className="block text-white font-semibold mb-2">Website</label>
                    <div className="flex items-center gap-2">
                        <Globe className="text-gold" size={20} />
                        <input
                            type="url"
                            name="website"
                            value={formData.website || ''}
                            onChange={handleChange}
                            placeholder="https://example.com"
                            className={`flex-1 px-4 py-3 rounded-lg bg-white/10 border ${
                                errors.website ? 'border-red-500' : 'border-white/20'
                            } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300`}
                        />
                    </div>
                    {errors.website && (
                        <p className="text-red-400 text-sm mt-1">{errors.website}</p>
                    )}
                </div>

                {/* --- PART 2 FIELDS (Integrated) --- */}

                <div className="space-y-4 border-t border-white/10 pt-6">
                    <h4 className="text-xl font-semibold text-white mb-4">Office Address</h4>
                    
                    {/* Address Line */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Street Address</label>
                        <input
                            type="text"
                            name="addressLine"
                            value={formData.officeAddress?.addressLine || ''}
                            onChange={handleAddressChange}
                            placeholder="Enter street address"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300"
                        />
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                        {/* City */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">City</label>
                            <input
                                type="text"
                                name="city"
                                value={formData.officeAddress?.city || ''}
                                onChange={handleAddressChange}
                                placeholder="City"
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300"
                            />
                        </div>

                        {/* State */}
                        <div>
                            <label className="block text-white text-sm font-medium mb-2">State</label>
                            <input
                                type="text"
                                name="state"
                                value={formData.officeAddress?.state || ''}
                                onChange={handleAddressChange}
                                placeholder="State"
                                className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300"
                            />
                        </div>
                    </div>

                    {/* Postal Code */}
                    <div>
                        <label className="block text-white text-sm font-medium mb-2">Postal Code</label>
                        <input
                            type="text"
                            name="postal"
                            value={formData.officeAddress?.postal || ''}
                            onChange={handleAddressChange}
                            placeholder="Enter postal code"
                            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300"
                        />
                    </div>
                </div>

                {/* About Section */}
                <div>
                    <label className="block text-white font-semibold mb-2">About Company</label>
                    <textarea
                        name="about"
                        value={formData.about || ''}
                        onChange={handleChange}
                        placeholder="Write about your company, services, and mission..."
                        maxLength={500}
                        rows={5}
                        className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300 resize-none"
                    />
                    <div className="flex justify-between items-center mt-2">
                        <p className="text-gray-400 text-sm">Describe your company in detail</p>
                        <p className="text-gray-400 text-sm">{formData.about?.length || 0}/500</p>
                    </div>
                </div>

                {/* GST Number */}
                <div>
                    <label className="block text-white font-semibold mb-2">
                        GST Number <span className="text-gray-400 text-sm font-normal">(Optional)</span>
                    </label>
                    <input
                        type="text"
                        name="gstNumber"
                        value={formData.gstNumber || ''}
                        onChange={handleChange}
                        placeholder="e.g., 27ABCPA1234H1Z0"
                        className={`w-full px-4 py-3 rounded-lg bg-white/10 border ${
                            errors.gstNumber ? 'border-red-500' : 'border-white/20'
                        } text-white placeholder-gray-400 focus:outline-none focus:border-gold focus:bg-white/20 transition-all duration-300 uppercase`}
                    />
                    {errors.gstNumber && (
                        <p className="text-red-400 text-sm mt-1 flex items-center gap-1">
                            <AlertCircle size={14} />
                            {errors.gstNumber}
                        </p>
                    )}
                    <p className="text-gray-400 text-xs mt-1">Enter valid GST number for verification</p>
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
                            Update Company Details
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CompanyBasicInfoForm;