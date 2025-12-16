// frontend/src/components/Profile/SkillsForm.jsx
// Hinglish: Skills aur Tech Stack ko update karne ka form with improved UI

import React, { useState, useEffect } from 'react';
import { updateSkills, updateTechStack } from '../../apis/studentProfileApi';
import { Target, Code, Wrench, AlertCircle, CheckCircle, Plus, X } from 'lucide-react';

const SkillsForm = ({ initialData, onUpdate }) => {
    const [skillsData, setSkillsData] = useState(initialData || {});
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState('');
    const [activeSection, setActiveSection] = useState('skills');

    // Individual skill inputs
    const [newSkill, setNewSkill] = useState({ technical: '', soft: '', languages: '', primarySkills: '', techStack: '' });

    useEffect(() => {
        setSkillsData(initialData || {});
    }, [initialData]);

    const addSkill = (field) => {
        if (!newSkill[field] || newSkill[field].trim() === '') return;
        
        const currentSkills = skillsData[field] || [];
        if (!currentSkills.includes(newSkill[field].trim())) {
            setSkillsData(prev => ({
                ...prev,
                [field]: [...currentSkills, newSkill[field].trim()]
            }));
        }
        setNewSkill(prev => ({ ...prev, [field]: '' }));
    };

    const removeSkill = (field, index) => {
        setSkillsData(prev => ({
            ...prev,
            [field]: (prev[field] || []).filter((_, i) => i !== index)
        }));
    };

    const handleSkillsSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const dataToSend = {
                technical: skillsData.technical || [],
                soft: skillsData.soft || [],
                languages: skillsData.languages || [],
                primarySkills: skillsData.primarySkills || [],
            };
            const updatedSkills = await updateSkills(dataToSend);
            onUpdate(updatedSkills);
            setMessage('success:Skills updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.response?.data?.message || err.message || 'Failed to update skills'}`);
        } finally {
            setLoading(false);
        }
    };

    const handleTechStackSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setMessage('');

        try {
            const dataToSend = {
                techStack: skillsData.techStack || [],
            };
            const updatedTechStack = await updateTechStack(dataToSend);
            onUpdate({ techStack: updatedTechStack });
            setMessage('success:Tech Stack updated successfully!');
            setTimeout(() => setMessage(''), 3000);
        } catch (err) {
            setMessage(`error:${err.response?.data?.message || err.message || 'Failed to update tech stack'}`);
        } finally {
            setLoading(false);
        }
    };

    const messageType = message.split(':')[0];
    const messageText = message.split(':')[1] || message;

    const SkillTag = ({ skill, onRemove }) => (
        <span className="inline-flex items-center gap-2 bg-gold/20 text-gold px-3 py-1 rounded-full text-sm border border-gold/30">
            {skill}
            <button
                type="button"
                onClick={onRemove}
                className="hover:text-red-400 transition-colors"
            >
                <X size={14} />
            </button>
        </span>
    );

    return (
        <div className="max-w-4xl mx-auto">
            <div className="flex items-center gap-3 mb-6">
                <Target className="text-gold" size={28} />
                <h3 className="text-2xl font-bold text-white">Skills & Tech Stack</h3>
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

            {/* Section Toggle */}
            <div className="flex gap-2 mb-6">
                <button
                    type="button"
                    onClick={() => setActiveSection('skills')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        activeSection === 'skills'
                            ? 'bg-gold text-navy'
                            : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                    Core Skills
                </button>
                <button
                    type="button"
                    onClick={() => setActiveSection('tech')}
                    className={`px-4 py-2 rounded-lg font-semibold transition-all ${
                        activeSection === 'tech'
                            ? 'bg-gold text-navy'
                            : 'bg-white/10 text-white hover:bg-white/20'
                    }`}
                >
                    Tech Stack
                </button>
            </div>

            {/* Core Skills Form */}
            {activeSection === 'skills' && (
                <form onSubmit={handleSkillsSubmit} className="space-y-6">
                    {/* Technical Skills */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-semibold">
                            <Code size={18} />
                            Technical Skills (Programming, Frameworks, etc.)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill.technical}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, technical: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('technical'))}
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                placeholder="e.g., JavaScript, Python, React, Node.js"
                            />
                            <button
                                type="button"
                                onClick={() => addSkill('technical')}
                                className="bg-gold hover:bg-yellow-400 text-navy px-4 rounded-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(skillsData.technical || []).map((skill, idx) => (
                                <SkillTag
                                    key={idx}
                                    skill={skill}
                                    onRemove={() => removeSkill('technical', idx)}
                                />
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm">Max 20 technical skills</p>
                    </div>

                    {/* Soft Skills */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-semibold">
                            <Target size={18} />
                            Soft Skills (Communication, Leadership, etc.)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill.soft}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, soft: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('soft'))}
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                placeholder="e.g., Communication, Leadership, Problem Solving"
                            />
                            <button
                                type="button"
                                onClick={() => addSkill('soft')}
                                className="bg-gold hover:bg-yellow-400 text-navy px-4 rounded-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(skillsData.soft || []).map((skill, idx) => (
                                <SkillTag
                                    key={idx}
                                    skill={skill}
                                    onRemove={() => removeSkill('soft', idx)}
                                />
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm">Max 10 soft skills</p>
                    </div>

                    {/* Languages */}
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-semibold">
                            <Code size={18} />
                            Languages Known
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill.languages}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, languages: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('languages'))}
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                placeholder="e.g., English, Hindi, Spanish"
                            />
                            <button
                                type="button"
                                onClick={() => addSkill('languages')}
                                className="bg-gold hover:bg-yellow-400 text-navy px-4 rounded-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(skillsData.languages || []).map((lang, idx) => (
                                <SkillTag
                                    key={idx}
                                    skill={lang}
                                    onRemove={() => removeSkill('languages', idx)}
                                />
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm">Max 10 languages</p>
                    </div>

                    {/* Primary Skills */}
                   {/* Primary Skills */}
<div className="space-y-3">
    <label className="flex-items-center gap-2 text-white font-semibold">
        <Target size={18} />
        Primary Skills (Your top specializations)
    </label>

    <div className="flex gap-2">
        <select
            value={newSkill.primarySkills}
            onChange={(e) => {
                const value = e.target.value;
                setNewSkill(prev => ({ ...prev, primarySkills: value }));
            }}
            className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold"
        >
            <option value="" className="text-black">Select Primary Skill</option>

            {/* Backend Enum VALUES */}
            <option value="Web Development" className="text-black">Web Development</option>
            <option value="App Development" className="text-black">App Development</option>
            <option value="UI/UX Design" className="text-black">UI/UX Design</option>
            <option value="Data Science" className="text-black">Data Science</option>
            <option value="Cloud Computing" className="text-black">Cloud Computing</option>
            <option value="Cyber Security" className="text-black">Cyber Security</option>
            <option value="Machine Learning" className="text-black">Machine Learning</option>
            <option value="Blockchain" className="text-black">Blockchain</option>
            <option value="DevOps" className="text-black">DevOps</option>
            <option value="Game Development" className="text-black">Game Development</option>

            {/* Custom Skill Input Option */}
            <option value="Other" className="text-black">Other (Custom Skill)</option>
        </select>

        <button
            type="button"
            onClick={() => {
                if (!newSkill.primarySkills) return;

                // If "Other", add custom value
                if (newSkill.primarySkills === "Other") {
                    if (!newSkill.customPrimarySkill?.trim()) return;
                    addSkill("primarySkills", newSkill.customPrimarySkill.trim());
                    setNewSkill(prev => ({ ...prev, customPrimarySkill: "", primarySkills: "" }));
                    return;
                }

                // Add normal enum skill
                addSkill("primarySkills", newSkill.primarySkills);
                setNewSkill(prev => ({ ...prev, primarySkills: "" }));
            }}
            className="bg-gold hover:bg-yellow-400 text-navy px-4 rounded-lg transition-all flex items-center gap-2"
        >
            <Plus size={18} /> Add
        </button>
    </div>

    {/* Custom input field */}
    {newSkill.primarySkills === "Other" && (
        <input
            type="text"
            value={newSkill.customPrimarySkill || ""}
            onChange={(e) =>
                setNewSkill(prev => ({ ...prev, customPrimarySkill: e.target.value }))
            }
            placeholder="Enter your custom skill (e.g., Graphic Designing)"
            className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold mt-2"
        />
    )}

    {/* List of added skills */}
    <div className="flex flex-wrap gap-2 mt-2">
        {(skillsData.primarySkills || []).map((skill, idx) => (
            <SkillTag
                key={idx}
                skill={skill}
                onRemove={() => removeSkill("primarySkills", idx)}
            />
        ))}
    </div>

    <p className="text-gray-400 text-sm">
        Allowed: Enum skills + Custom skills (only when selecting "Other")
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
                                Save All Skills
                            </>
                        )}
                    </button>
                </form>
            )}

            {/* Tech Stack Form */}
            {activeSection === 'tech' && (
                <form onSubmit={handleTechStackSubmit} className="space-y-6">
                    <div className="space-y-3">
                        <label className="flex items-center gap-2 text-white font-semibold">
                            <Wrench size={18} />
                            Tech Stack (Tools & Technologies)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={newSkill.techStack}
                                onChange={(e) => setNewSkill(prev => ({ ...prev, techStack: e.target.value }))}
                                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill('techStack'))}
                                className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-gold focus:border-transparent"
                                placeholder="e.g., Node.js, MongoDB, Docker, AWS"
                            />
                            <button
                                type="button"
                                onClick={() => addSkill('techStack')}
                                className="bg-gold hover:bg-yellow-400 text-navy px-4 rounded-lg transition-all flex items-center gap-2"
                            >
                                <Plus size={18} /> Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                            {(skillsData.techStack || []).map((tech, idx) => (
                                <SkillTag
                                    key={idx}
                                    skill={tech}
                                    onRemove={() => removeSkill('techStack', idx)}
                                />
                            ))}
                        </div>
                        <p className="text-gray-400 text-sm">
                            💡 Add frameworks, libraries, databases, cloud platforms, and development tools
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
                                Save Tech Stack
                            </>
                        )}
                    </button>
                </form>
            )}
        </div>
    );
};

export default SkillsForm;