// frontend/src/components/studentComponent/PortfolioLinksForm.jsx
// Portfolio Links Form - Add GitHub, LinkedIn, Portfolio, and other links

import React, { useState, useEffect, useCallback } from 'react';
import { updatePortfolioLinks } from '../../apis/studentProfileApi';
import { Link, Github, Linkedin, Globe, AlertCircle, CheckCircle, Plus, X, ExternalLink } from 'lucide-react';

// Stable, memoized LinkCard to avoid remounts which can cause inputs to lose focus
const LinkCardInner = ({ icon, label, placeholder, value, name, error, hint, onChange }) => (
    <div className="space-y-2">
        <label htmlFor={name} className="flex items-center gap-2 text-white font-semibold">
            {icon && React.createElement(icon, { size: 18 })}
            {label}
        </label>
        <div className="relative">
            <input
                type="url"
                id={name}
                name={name}
                value={value || ''}
                onChange={onChange}
                autoComplete="off"
                className={`w-full px-4 py-3 bg-white/10 border ${
                    error ? 'border-red-500' : 'border-white/20'
                } rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all`}
                placeholder={placeholder}
            />
            {value && (
                <a
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="absolute right-3 top-3 text-gold hover:text-yellow-300 transition-colors"
                    title="Open link"
                >
                    <ExternalLink size={18} />
                </a>
            )}
        </div>
        {error && (
            <p className="text-red-400 text-sm flex items-center gap-1">
                <AlertCircle size={14} /> {error}
            </p>
        )}
        {hint && !error && (
            <p className="text-gray-400 text-sm">{hint}</p>
        )}
    </div>
);

const LinkCard = React.memo(LinkCardInner);

const PortfolioLinksForm = ({ initialData, onUpdate }) => {
    const [linksData, setLinksData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [newOtherLink, setNewOtherLink] = useState({ name: '', url: '' });

    useEffect(() => {
        setLinksData(initialData || {});
    }, [initialData]);

    const validateURLs = () => {
        const newErrors = {};
        const urlRegex = /^https?:\/\/.+/;

        if (linksData.github && !urlRegex.test(linksData.github)) {
            newErrors.github = 'Invalid URL format. Must start with http:// or https://';
        }

        if (linksData.linkedin && !urlRegex.test(linksData.linkedin)) {
            newErrors.linkedin = 'Invalid URL format. Must start with http:// or https://';
        }

        if (linksData.portfolio && !urlRegex.test(linksData.portfolio)) {
            newErrors.portfolio = 'Invalid URL format. Must start with http:// or https://';
        }

        // Validate other links
        if (linksData.other && Array.isArray(linksData.other)) {
            linksData.other.forEach((link, idx) => {
                if (link.url && !urlRegex.test(link.url)) {
                    newErrors[`other_${idx}`] = 'Invalid URL format';
                }
            });
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleChange = useCallback((e) => {
        const { name, value } = e.target;
        setLinksData(prev => ({ ...prev, [name]: value }));
        // clear error for this field if present using functional update
        setErrors(prev => (prev && prev[name] ? { ...prev, [name]: '' } : prev));
    }, []);

    const handleOtherLinkChange = useCallback((e) => {
        const { name, value } = e.target;
        setNewOtherLink(prev => ({ ...prev, [name]: value }));
    }, []);

    const addOtherLink = () => {
        if (!newOtherLink.name.trim() || !newOtherLink.url.trim()) {
            setMessage('error:Please enter both name and URL for the link');
            return;
        }

        const urlRegex = /^https?:\/\/.+/;
        if (!urlRegex.test(newOtherLink.url)) {
            setMessage('error:Invalid URL format. Must start with http:// or https://');
            return;
        }

        const currentOther = linksData.other || [];
        const isDuplicate = currentOther.some(link => link.url === newOtherLink.url);

        if (isDuplicate) {
            setMessage('error:This URL already exists');
            return;
        }

        setLinksData(prev => ({
            ...prev,
            other: [...(prev.other || []), { ...newOtherLink }]
        }));

        setNewOtherLink({ name: '', url: '' });
        setMessage('success:Link added successfully!');
        setTimeout(() => setMessage(''), 2000);
    };

    const removeOtherLink = (index) => {
        setLinksData(prev => ({
            ...prev,
            other: (prev.other || []).filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateURLs()) {
            setMessage('error:Please fix all URL errors before submitting');
            return;
        }

        setLoading(true);
        setMessage('');

        try {
            const updatedLinks = await updatePortfolioLinks(linksData);
            onUpdate(updatedLinks);
            setMessage('success:Portfolio links updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.message || 'Failed to update portfolio links'}`);
        } finally {
            setLoading(false);
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Link className="text-gold" size={28} />
                <h3 className="text-2xl font-bold text-white">Portfolio & Social Links</h3>
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
                {/* Main Portfolio Links */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
                    <h4 className="text-lg font-semibold text-gold flex items-center gap-2">
                        <Globe size={20} />
                        Main Portfolio Links
                    </h4>

                    {/* GitHub */}
                    <LinkCard
                        icon={Github}
                        label="GitHub Profile"
                        name="github"
                        placeholder="https://github.com/username/"
                        value={linksData.github}
                        error={errors.github}
                        hint="Link to your GitHub Profile"
                        onChange={handleChange}
                    />

                    {/* LinkedIn */}
                    <LinkCard
                        icon={Linkedin}
                        label="LinkedIn Profile"
                        name="linkedin"
                        placeholder="https://www.linkedin.com/in/your-profile"
                        value={linksData.linkedin}
                        error={errors.linkedin}
                        hint="Your professional LinkedIn profile URL"
                        onChange={handleChange}
                    />

                    {/* Portfolio Website */}
                    <LinkCard
                        icon={Globe}
                        label="Portfolio Website"
                        name="portfolio"
                        placeholder="https://yourportfolio.com"
                        value={linksData.portfolio}
                        error={errors.portfolio}
                        hint="Your personal portfolio or blog website"
                        onChange={handleChange}
                    />
                </div>

                {/* Other Links Section */}
                <div className="bg-white/5 border border-white/10 rounded-lg p-6 space-y-6">
                    <h4 className="text-lg font-semibold text-gold flex items-center gap-2">
                        <Link size={20} />
                        Additional Links
                    </h4>

                    <p className="text-gray-300 text-sm">
                        Add other important links like Behance, Dribbble, Medium, YouTube channel, or any other portfolio links.
                    </p>

                    {/* Add New Link */}
                    <div className="space-y-3 p-4 bg-white/5 rounded-lg border border-white/10">
                        <h5 className="font-semibold text-white">Add New Link</h5>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <input
                                type="text"
                                name="name"
                                value={newOtherLink.name}
                                onChange={handleOtherLinkChange}
                                placeholder="Link name (e.g., Behance, Medium)"
                                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                            />
                            <input
                                type="url"
                                name="url"
                                value={newOtherLink.url}
                                onChange={handleOtherLinkChange}
                                placeholder="https://..."
                                className="px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent transition-all"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={addOtherLink}
                            className="w-full bg-gold hover:bg-yellow-400 text-navy font-semibold py-2 px-4 rounded-lg transition-all flex items-center justify-center gap-2"
                        >
                            <Plus size={18} /> Add Link
                        </button>
                    </div>

                    {/* List of Other Links */}
                    {linksData.other && linksData.other.length > 0 && (
                        <div className="space-y-3">
                            <h5 className="font-semibold text-white">Your Links ({linksData.other.length})</h5>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {linksData.other.map((link, idx) => (
                                    <div key={idx} className="flex items-center justify-between bg-white/10 p-3 rounded-lg border border-white/20 group hover:border-gold/50 transition-all">
                                        <div className="flex-1">
                                            <p className="font-semibold text-gold">{link.name}</p>
                                            <a
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-gray-300 text-sm hover:text-gold transition-colors truncate flex items-center gap-1"
                                            >
                                                {link.url}
                                                <ExternalLink size={12} />
                                            </a>
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeOtherLink(idx)}
                                            className="ml-3 text-red-400 hover:text-red-300 hover:bg-red-500/20 p-2 rounded transition-all opacity-0 group-hover:opacity-100"
                                            title="Remove link"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Submit Button */}
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
                            Save Portfolio Links
                        </>
                    )}
                </button>

                {/* Info Box */}
                <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                    <p className="text-blue-200 text-sm flex items-start gap-2">
                        <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                        <span>
                            All links must start with <code className="bg-white/10 px-2 py-1 rounded">http://</code> or <code className="bg-white/10 px-2 py-1 rounded">https://</code>. These links help companies learn more about your work and experience.
                        </span>
                    </p>
                </div>
            </form>
        </div>
    );
};

export default PortfolioLinksForm;
