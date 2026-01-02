// src/pages/company/ApplicationDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { getApplicationDetails, approveStudentForProject, rejectApplication, shortlistApplication } from '../../apis/companyApplicationApi';

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);
  
  // Modal states
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [rejectError, setRejectError] = useState('');

  useEffect(() => {
    setLoading(true);
    getApplicationDetails(applicationId)
      .then(res => {
        if (res.success) setData(res.data);
        else setError(res.message || 'Failed to load application');
      })
      .catch(err => setError(err?.message || 'Failed to load application'))
      .finally(() => setLoading(false));
  }, [applicationId]);

  const handleApprove = async () => {
    try {
      setActionLoading(true);
      const response = await approveStudentForProject(applicationId);
      if (response.success) {
        toast.success('Student approved successfully! Payment process initiated.');
        setShowApproveModal(false);
        // Get projectId from the response or data
        const projectId = response.data?.project?._id || data?.project?._id;
        if (projectId) {
          setTimeout(() => navigate(`/payment/${projectId}`), 1000);
        } else {
          setTimeout(() => navigate(-1), 1000);
        }
      } else {
        toast.error(response.message || 'Failed to approve application');
        setError(response.message || 'Failed to approve application');
      }
    } catch (err) {
      const errorMsg = err.response?.data?.message || err.message || 'Failed to approve application';
      toast.error(errorMsg);
      setError(errorMsg);
      console.error('Approve error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShortlist = async () => {
    try {
      setActionLoading(true);
      const response = await shortlistApplication(applicationId);
      if (response.success) {
        toast.success('Application shortlisted successfully!');
        // Refresh the data
        const res = await getApplicationDetails(applicationId);
        if (res.success) setData(res.data);
      } else {
        toast.error(response.message || 'Failed to shortlist');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to shortlist');
    } finally {
      setActionLoading(false);
    }
  };

  const handleRejectSubmit = async () => {
    if (!rejectReason.trim()) {
      setRejectError('Please provide a rejection reason');
      return;
    }
    
    if (rejectReason.trim().length < 10) {
      setRejectError('Rejection reason must be at least 10 characters');
      return;
    }
    
    try {
      setActionLoading(true);
      const response = await rejectApplication(applicationId, rejectReason);
      if (response.success) {
        toast.success('Application rejected successfully');
        setShowRejectModal(false);
        setTimeout(() => navigate(-1), 1000);
      } else {
        toast.error(response.message || 'Failed to reject');
        setRejectError(response.message || 'Failed to reject application');
      }
    } catch (err) {
      toast.error(err.message || 'Failed to reject');
      setRejectError(err.message || 'Failed to reject application');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-slate-900">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-slate-300 mt-4 text-lg">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 border-2 border-red-500 rounded-xl p-8 max-w-md">
          <div className="text-red-400 text-6xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-red-400 mb-2">Error</h2>
          <p className="text-red-300">{error}</p>
          <button 
            onClick={() => navigate(-1)} 
            className="mt-6 bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg transition-colors"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const { student = {}, application = {}, project = {}, skillMatch = 0 } = data;

  const getStatusStyles = (status) => {
    const styles = {
      pending: 'bg-orange-500/20 text-orange-400 border-orange-500',
      shortlisted: 'bg-blue-500/20 text-blue-400 border-blue-500',
      accepted: 'bg-green-500/20 text-green-400 border-green-500',
      rejected: 'bg-red-500/20 text-red-400 border-red-500'
    };
    return styles[status] || styles.pending;
  };

  const getSkillMatchColor = (match) => {
    if (match >= 80) return 'text-green-400';
    if (match >= 60) return 'text-blue-400';
    if (match >= 40) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8 px-4">
      <div className="max-w-5xl mx-auto">
        {/* Back Button */}
        <button 
          onClick={() => navigate(-1)} 
          className="mb-6 flex items-center gap-2 text-blue-400 hover:text-blue-300 transition-colors group"
        >
          <span className="text-xl group-hover:-translate-x-1 transition-transform">←</span>
          <span className="font-medium">Back to Applications</span>
        </button>

        {/* Main Container */}
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-2xl shadow-2xl border border-slate-700/50 overflow-hidden">
          
          {/* Header Section with Student Info */}
          <div className="bg-gradient-to-r from-blue-600/20 to-purple-600/20 p-8 border-b border-slate-700/50">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
              {/* Profile Picture */}
              <div className="relative">
                {student.profilePicture ? (
                  <img 
                    src={student.profilePicture} 
                    alt={student.name} 
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-blue-500 shadow-lg shadow-blue-500/30" 
                  />
                ) : (
                  <div className="w-28 h-28 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-4xl font-bold text-white border-4 border-blue-500 shadow-lg shadow-blue-500/30">
                    {student.name ? student.name.charAt(0).toUpperCase() : '?'}
                  </div>
                )}
                {student.verified && (
                  <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-2 border-4 border-slate-800 shadow-lg">
                    <span className="text-white text-lg">✓</span>
                  </div>
                )}
              </div>

              {/* Student Info */}
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h1 className="text-3xl md:text-4xl font-bold text-white">
                    {student.name || 'Unknown Student'}
                  </h1>
                  <span className={`px-4 py-1 rounded-full text-sm font-semibold border ${getStatusStyles(application.status)}`}>
                    {application.status ? (application.status.charAt(0).toUpperCase() + application.status.slice(1)) : 'Pending'}
                  </span>
                </div>
                <div className="flex flex-col gap-1 text-slate-300">
                  {student.college && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🎓</span>
                      <span className="text-lg">{student.college}</span>
                    </div>
                  )}
                  {student.city && (
                    <div className="flex items-center gap-2">
                      <span className="text-lg">📍</span>
                      <span>{student.city}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Skill Match Badge */}
              <div className="text-center bg-slate-800/80 rounded-xl p-4 border border-slate-600 min-w-[120px]">
                <div className={`text-3xl font-bold ${getSkillMatchColor(skillMatch)}`}>
                  {skillMatch}%
                </div>
                <div className="text-slate-400 text-sm mt-1">Skill Match</div>
              </div>
            </div>
          </div>

          {/* Content Grid */}
          <div className="p-8 grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            {/* Left Column - Application Details */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Application Stats */}
              <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">📋</span>
                  Application Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">Applied Date</div>
                    <div className="text-white font-semibold">
                      {application.appliedAt ? new Date(application.appliedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'N/A'}
                    </div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">Proposed Price</div>
                    <div className="text-green-400 font-bold text-lg">₹{application.proposedPrice?.toLocaleString()}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">Timeline</div>
                    <div className="text-white font-semibold">{application.estimatedTime || 'Not specified'}</div>
                  </div>
                  <div className="bg-slate-800/50 rounded-lg p-4">
                    <div className="text-slate-400 text-sm mb-1">Status</div>
                    <div className="text-white font-semibold capitalize">{application.status || 'Pending'}</div>
                  </div>
                </div>
              </div>

              {/* Cover Letter */}
              <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">✉️</span>
                  Cover Letter / Proposal
                </h3>
                <div className="bg-slate-800/50 rounded-lg p-4">
                  <p className="text-slate-300 leading-relaxed whitespace-pre-line">
                    {application.coverLetter || 'No proposal provided.'}
                  </p>
                </div>
              </div>

              {/* Past Projects */}
              {student.projects && student.projects.length > 0 && (
                <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                  <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-2xl">💼</span>
                    Past Projects ({student.projects.length})
                  </h3>
                  <div className="space-y-3">
                    {student.projects.map((proj, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-4 hover:bg-slate-800/70 transition-colors border border-slate-600/30">
                        <div className="flex items-start gap-3">
                          <div className="bg-blue-500/20 rounded-lg p-2 mt-1">
                            <span className="text-blue-400 text-xl">🚀</span>
                          </div>
                          <div className="flex-1">
                            <h4 className="text-white font-semibold mb-1">{proj.title || 'Untitled Project'}</h4>
                            {proj.description && (
                              <p className="text-slate-400 text-sm line-clamp-2">{proj.description}</p>
                            )}
                            {proj.techStack && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {proj.techStack.map((tech, i) => (
                                  <span key={i} className="bg-slate-700 text-slate-300 text-xs px-2 py-1 rounded">
                                    {tech}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Project Info */}
              <div className="bg-gradient-to-br from-blue-600/10 to-purple-600/10 rounded-xl p-6 border border-blue-500/30">
                <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-2xl">🎯</span>
                  Project Information
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <span className="text-slate-400 min-w-[100px]">Title:</span>
                    <span className="text-white font-semibold">{project.title || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-slate-400 min-w-[100px]">Category:</span>
                    <span className="text-blue-400 font-medium">{project.category || 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-slate-400 min-w-[100px]">Budget:</span>
                    <span className="text-green-400 font-bold">₹{project.budgetMin?.toLocaleString()} - ₹{project.budgetMax?.toLocaleString()}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-slate-400 min-w-[100px]">Deadline:</span>
                    <span className="text-white">{project.deadline ? new Date(project.deadline).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }) : 'N/A'}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="text-slate-400 min-w-[100px]">Required Skills:</span>
                    <div className="flex flex-wrap gap-2">
                      {(project.requiredSkills || []).map((skill, idx) => (
                        <span key={idx} className="bg-blue-500/20 border border-blue-500/50 text-blue-300 text-sm px-3 py-1 rounded-full">
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column - Skills & Documents */}
            <div className="space-y-6">
              
              {/* Skills */}
              <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                  <span className="text-xl">⚡</span>
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {student.skills && student.skills.length > 0 ? (
                    student.skills.map((skill, idx) => (
                      <span 
                        key={idx} 
                        className="bg-blue-500/20 border border-blue-500 text-blue-300 text-sm px-3 py-1.5 rounded-lg font-medium hover:bg-blue-500/30 transition-colors"
                      >
                        {skill}
                      </span>
                    ))
                  ) : (
                    <span className="text-slate-400 text-sm italic">No skills specified</span>
                  )}
                </div>
              </div>

              {/* Resume */}
              {student.resume && (
                <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">📄</span>
                    Resume
                  </h3>
                  <a 
                    href={student.resume} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-3 rounded-lg transition-all font-semibold shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50"
                  >
                    <span className="text-xl">📥</span>
                    Download Resume
                  </a>
                </div>
              )}

              {/* Certificates */}
              {student.certificates && student.certificates.length > 0 && (
                <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">🏆</span>
                    Certificates ({student.certificates.length})
                  </h3>
                  <div className="space-y-2">
                    {student.certificates.map((cert, idx) => (
                      <a 
                        key={idx} 
                        href={cert} 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="flex items-center justify-between bg-slate-800/50 hover:bg-slate-800/70 border border-slate-600/50 px-4 py-3 rounded-lg transition-colors group"
                      >
                        <span className="text-green-400 font-medium">Certificate {idx + 1}</span>
                        <span className="text-slate-400 group-hover:text-white transition-colors">→</span>
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Ratings (if available) */}
              {student.ratings && student.ratings.length > 0 && (
                <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">⭐</span>
                    Ratings & Reviews
                  </h3>
                  <div className="space-y-3">
                    {student.ratings.map((review, idx) => (
                      <div key={idx} className="bg-slate-800/50 rounded-lg p-3 border border-slate-600/30">
                        <p className="text-slate-300 text-sm">{review}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Contact Info (if available) */}
              {(student.email || student.phone) && (
                <div className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                  <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                    <span className="text-xl">📞</span>
                    Contact
                  </h3>
                  <div className="space-y-2">
                    {student.email && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-blue-400">✉️</span>
                        <span className="text-sm break-all">{student.email}</span>
                      </div>
                    )}
                    {student.phone && (
                      <div className="flex items-center gap-2 text-slate-300">
                        <span className="text-green-400">📱</span>
                        <span className="text-sm">{student.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons Footer */}
          <div className="bg-slate-800/50 border-t border-slate-700/50 p-6">
            <div className="flex flex-wrap gap-3 justify-end">
              <button 
                onClick={() => navigate(-1)}
                disabled={actionLoading}
                className="px-6 py-3 bg-slate-700 hover:bg-slate-600 text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                Close
              </button>
              {application.status === 'pending' && (
                <>
                  <button 
                    onClick={handleShortlist}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {actionLoading ? '⏳' : '⭐'} {actionLoading ? 'Processing...' : 'Shortlist'}
                  </button>
                  <button 
                    onClick={() => setShowApproveModal(true)}
                    disabled={actionLoading}
                    className="px-6 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg font-semibold transition-colors shadow-lg shadow-green-500/30 disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                  >
                    {actionLoading ? '⏳' : '✅'} {actionLoading ? 'Processing...' : 'Accept Application'}
                  </button>
                </>
              )}
              {['pending', 'shortlisted'].includes(application.status) && (
                <button 
                  onClick={() => setShowRejectModal(true)}
                  disabled={actionLoading}
                  className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {actionLoading ? '⏳' : '❌'} {actionLoading ? 'Processing...' : 'Reject'}
                </button>
              )}
            </div>
          </div>

          {/* Approve Confirmation Modal */}
          {showApproveModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-green-500/50 rounded-xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">✅</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Approve Application?</h2>
                  <p className="text-slate-300 mb-4">
                    This action will assign the project to <strong>{data?.student?.name}</strong> and initiate the payment process.
                  </p>
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4 mb-4">
                    <p className="text-green-300 text-sm">
                      ⚠️ Once approved, all other applications will be automatically rejected and a payment record will be created.
                    </p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowApproveModal(false)}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleApprove}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 rounded-lg bg-green-600 hover:bg-green-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? '⏳ Processing...' : '✅ Approve'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Reject Confirmation Modal */}
          {showRejectModal && (
            <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 border border-red-500/50 rounded-xl max-w-md w-full p-8 shadow-2xl">
                <div className="text-center mb-6">
                  <div className="text-5xl mb-4">❌</div>
                  <h2 className="text-2xl font-bold text-white mb-2">Reject Application?</h2>
                  <p className="text-slate-300 mb-4">
                    Please provide a detailed rejection reason that will be sent to the student.
                  </p>
                </div>
                <textarea
                  value={rejectReason}
                  onChange={(e) => {
                    setRejectReason(e.target.value);
                    if (e.target.value.length >= 10) setRejectError('');
                  }}
                  placeholder="Enter a detailed reason for rejection (minimum 10 characters)..."
                  rows={4}
                  className="w-full px-4 py-3 rounded-lg bg-slate-700 border border-slate-600 text-white placeholder-slate-400 focus:outline-none focus:border-red-500 resize-none mb-2"
                  disabled={actionLoading}
                />
                {rejectError && (
                  <p className="text-red-400 text-sm mb-4">⚠️ {rejectError}</p>
                )}
                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      setShowRejectModal(false);
                      setRejectReason('');
                      setRejectError('');
                    }}
                    disabled={actionLoading}
                    className="flex-1 px-4 py-3 rounded-lg bg-slate-700 hover:bg-slate-600 text-white font-semibold transition-colors disabled:opacity-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    disabled={actionLoading || !rejectReason.trim()}
                    className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {actionLoading ? '⏳ Processing...' : '❌ Reject'}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;