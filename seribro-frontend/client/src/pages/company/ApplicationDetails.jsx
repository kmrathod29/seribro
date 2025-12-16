// src/pages/company/ApplicationDetails.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getApplicationDetails } from '../../apis/companyApplicationApi';

const ApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  if (loading) return <div className="flex justify-center items-center h-64">Loading...</div>;
  if (error) return <div className="text-red-500 text-center py-8">{error}</div>;
  if (!data) return null;

  const { student = {}, application = {}, project = {}, skillMatch = 0 } = data;

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8">
      <button onClick={() => navigate(-1)} className="mb-4 text-blue-500 hover:underline">← Back to Applications</button>
      <div className="bg-slate-800 rounded-lg shadow-lg p-4 md:p-8">
        {/* Student Header */}
        <div className="flex flex-col md:flex-row items-center gap-6 mb-6 pb-6 border-b border-slate-700">
          {student.profilePicture && (
            <img src={student.profilePicture} alt={student.name} className="w-24 h-24 rounded-lg object-cover border-2 border-blue-500" />
          )}
          <div className="flex-1 w-full">
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold text-white">{student.name || 'Unknown Student'}</h2>
              {student.verified && (
                <span className="ml-2 px-2 py-1 bg-green-600 text-white text-xs rounded">Verified</span>
              )}
            </div>
            <div className="text-blue-400">{student.college || ''}</div>
            <div className="text-gray-400 text-sm">{student.city || ''}</div>
          </div>
        </div>

        {/* Skills */}
        <div className="mb-6">
          <h4 className="text-lg font-semibold text-white mb-3">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {student.skills && student.skills.length > 0 ? (
              student.skills.map((skill, idx) => (
                <span key={idx} className="bg-blue-500/20 border border-blue-500 text-blue-300 text-sm px-3 py-1 rounded">{skill}</span>
              ))
            ) : (
              <span className="text-gray-400 text-sm">No skills specified</span>
            )}
          </div>
        </div>

        {/* Application Details */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-3">Application Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-400">Applied Date:</span>
              <span className="text-white">{application.appliedAt ? new Date(application.appliedAt).toLocaleDateString() : ''}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Proposed Price:</span>
              <span className="text-white font-semibold">₹{application.proposedPrice}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Est. Timeline:</span>
              <span className="text-white">{application.estimatedTime}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Skill Match:</span>
              <span className="text-white font-semibold">{skillMatch || 0}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Status:</span>
              <span className={`font-semibold px-2 py-1 rounded text-xs ${
                application.status === 'pending' ? 'bg-orange-500/20 text-orange-300' :
                application.status === 'shortlisted' ? 'bg-blue-500/20 text-blue-300' :
                application.status === 'accepted' ? 'bg-green-500/20 text-green-300' :
                'bg-red-500/20 text-red-300'
              }`}>
                {application.status ? (application.status.charAt(0).toUpperCase() + application.status.slice(1)) : 'Unknown'}
              </span>
            </div>
          </div>
        </div>

        {/* Cover Letter / Proposal */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-3">Cover Letter / Proposal</h4>
          <p className="text-gray-300 leading-relaxed">{application.coverLetter || 'No proposal provided.'}</p>
        </div>

        {/* Resume */}
        {student.resume && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Resume</h4>
            <a href={student.resume} target="_blank" rel="noopener noreferrer" className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded transition-colors">📄 Download Resume</a>
          </div>
        )}

        {/* Certificates */}
        {student.certificates && student.certificates.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Certificates</h4>
            <div className="flex flex-wrap gap-2">
              {student.certificates.map((cert, idx) => (
                <a key={idx} href={cert} target="_blank" rel="noopener noreferrer" className="bg-green-500/20 border border-green-500 text-green-300 text-sm px-3 py-1 rounded">Certificate {idx + 1}</a>
              ))}
            </div>
          </div>
        )}

        {/* Past Projects */}
        {student.projects && student.projects.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Past Projects</h4>
            <ul className="list-disc pl-5 text-gray-300">
              {student.projects.map((proj, idx) => (
                <li key={idx}>{proj.title || 'Untitled Project'}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Ratings/Reviews (if available) */}
        {student.ratings && student.ratings.length > 0 && (
          <div className="mb-6">
            <h4 className="text-lg font-semibold text-white mb-3">Ratings & Reviews</h4>
            <ul className="list-disc pl-5 text-gray-300">
              {student.ratings.map((review, idx) => (
                <li key={idx}>{review}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Project Info */}
        <div className="mb-6 pb-6 border-b border-slate-700">
          <h4 className="text-lg font-semibold text-white mb-3">Project Info</h4>
          <div className="space-y-2 text-sm">
            <div><span className="text-gray-400">Title:</span> <span className="text-white">{project.title}</span></div>
            <div><span className="text-gray-400">Category:</span> <span className="text-white">{project.category}</span></div>
            <div><span className="text-gray-400">Required Skills:</span> <span className="text-white">{(project.requiredSkills || []).join(', ')}</span></div>
            <div><span className="text-gray-400">Budget:</span> <span className="text-white">₹{project.budgetMin} - ₹{project.budgetMax}</span></div>
            <div><span className="text-gray-400">Deadline:</span> <span className="text-white">{project.deadline ? new Date(project.deadline).toLocaleDateString() : ''}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApplicationDetails;
