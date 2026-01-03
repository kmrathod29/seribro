// src/pages/admin/AdminApplicationDetails.jsx
// Hinglish: Admin Application Details Page - Full Student Profile

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Mail, Phone, MapPin, BookOpen, Code, FileText, Award, Github, ExternalLink
} from 'lucide-react';
import { getApplicationDetails } from '../../apis/adminApplicationApi';

/**
 * Hinglish: Admin Application Details page
 * - Full student profile with ALL projects array
 * - Application details
 * - Company info
 * - Project info
 */
const AdminApplicationDetails = () => {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [project, setProject] = useState(null);
  const [company, setCompany] = useState(null);
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Hinglish: Component mount par data load karo
  useEffect(() => {
    loadApplicationDetails();
  }, [applicationId]);

  /**
   * Hinglish: Application aur student profile load karo
   */
  const loadApplicationDetails = async () => {
    try {
      setLoading(true);
      const response = await getApplicationDetails(applicationId);
      if (response.success) {
        setApplication(response.data.application);
        setProject(response.data.project);
        setCompany(response.data.company);
        setStudent(response.data.studentProfile);
      } else {
        alert('Failed to load application details');
      }
    } catch (err) {
      console.error('Error loading application:', err);
      setError(err.response?.data?.message || 'Error loading application');
      alert(String(err?.response?.data?.message || 'Error loading application'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hinglish: Status ke basis par color nikalo
   */
  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-orange-500/20 text-orange-300 border-orange-500',
      shortlisted: 'bg-blue-500/20 text-blue-300 border-blue-500',
      accepted: 'bg-green-500/20 text-green-300 border-green-500',
      rejected: 'bg-red-500/20 text-red-300 border-red-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading application details...</p>
        </div>
      </div>
    );
  }

  if (!application || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <button
          onClick={() => navigate('/admin/applications')}
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Applications
        </button>
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
          {error || 'Application not found'}
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/applications')}
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Applications
        </button>

        {/* Application Header */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-6 backdrop-blur-sm">
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-3xl font-bold text-yellow-400 mb-2">Application Review</h1>
              <p className="text-gray-400">Applied on {new Date(application.createdAt).toLocaleDateString()}</p>
            </div>
            <span className={`px-4 py-2 rounded-lg font-semibold border ${getStatusColor(application.status)}`}>
              {application.status}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          {/* Student Profile Section */}
          <div className="lg:col-span-2">
            <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm mb-6">
              <h2 className="text-2xl font-semibold text-yellow-400 mb-6 flex items-center gap-2">
                <BookOpen className="w-6 h-6" />
                Student Profile
              </h2>

              {/* Basic Info */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4">Personal Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Name</p>
                    <p className="text-white font-semibold">{student?.name || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Mail className="w-4 h-4" />
                      Email
                    </p>
                    <p className="text-white font-semibold break-all">{student?.email || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <Phone className="w-4 h-4" />
                      Phone
                    </p>
                    <p className="text-white font-semibold">{student?.phone || 'N/A'}</p>
                  </div>
                  <div className="p-4 bg-gray-900/50 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      College
                    </p>
                    <p className="text-white font-semibold">{student?.college || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Education */}
              <div className="mb-6 p-4 bg-gray-900/50 rounded-lg">
                <h3 className="text-sm text-gray-400 mb-2">Education</h3>
                <div className="flex gap-4">
                  <div>
                    <p className="text-gray-400 text-xs">Course</p>
                    <p className="text-white font-semibold">{student?.course || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Year</p>
                    <p className="text-white font-semibold">{student?.year || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-400 text-xs">Semester</p>
                    <p className="text-white font-semibold">{student?.semester || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Skills */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Code className="w-5 h-5" />
                  Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {student?.skills && student.skills.length > 0 ? (
                    student.skills.map((skill, idx) => (
                      <span key={idx} className="px-4 py-2 bg-yellow-500/10 text-yellow-300 rounded-full text-sm">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-400">No skills listed</p>
                  )}
                </div>
              </div>

              {/* Student Projects - IMPORTANT */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5" />
                  Student Projects ({student?.projects?.length || 0})
                </h3>
                {student?.projects && student.projects.length > 0 ? (
                  <div className="grid grid-cols-1 gap-4">
                    {student.projects.map((proj, idx) => (
                      <div key={idx} className="p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
                        <div className="flex items-start justify-between mb-2">
                          <h4 className="text-white font-semibold">{proj.title || 'Untitled'}</h4>
                        </div>
                        <p className="text-gray-400 text-sm mb-3">{proj.description || 'No description'}</p>
                        
                        {/* Tech Stack */}
                        {proj.techStack && proj.techStack.length > 0 && (
                          <div className="mb-3">
                            <p className="text-xs text-gray-500 mb-2">Tech Stack:</p>
                            <div className="flex flex-wrap gap-2">
                              {proj.techStack.map((tech, tidx) => (
                                <span key={tidx} className="px-2 py-1 bg-blue-500/10 text-blue-300 text-xs rounded">
                                  {tech}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Links */}
                        <div className="flex gap-3">
                          {proj.githubLink && (
                            <a
                              href={proj.githubLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center gap-1 text-sm text-yellow-300 hover:text-yellow-200"
                            >
                              <Github className="w-4 h-4" />
                              GitHub
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        {/* Screenshot */}
                        {proj.screenshot && (
                          <div className="mt-3">
                            <img
                              src={proj.screenshot}
                              alt="Project screenshot"
                              className="w-full h-32 object-cover rounded-lg"
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No projects listed</p>
                )}
              </div>

              {/* Resume & Certificates */}
              <div className="flex gap-4">
                {student?.resume && (
                  <a
                    href={student.resume}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors"
                  >
                    <FileText className="w-4 h-4" />
                    Download Resume
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
                {student?.certificatesUrl && (
                  <a
                    href={student.certificatesUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 text-blue-300 rounded-lg hover:bg-blue-500/30 transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    View Certificates
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            </div>

            {/* Application Details */}
            {application.coverLetter && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Cover Letter</h3>
                <p className="text-gray-300 leading-relaxed">{application.coverLetter}</p>
              </div>
            )}
          </div>

          {/* Sidebar - Project & Company Info */}
          <div className="lg:col-span-1">
            {/* Project Info */}
            {project && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm mb-6">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Project</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-xs text-gray-400">Title</p>
                    <p className="text-white font-semibold break-words">{project.title}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Budget</p>
                    <p className="text-yellow-300 font-semibold">₹{project.budgetMin?.toLocaleString()} - ₹{project.budgetMax?.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Deadline</p>
                    <p className="text-white">{new Date(project.deadline).toLocaleDateString()}</p>
                  </div>
                  <button
                    onClick={() => navigate(`/admin/projects/${project._id}`)}
                    className="w-full mt-4 px-4 py-2 bg-yellow-500 hover:bg-yellow-600 text-black font-semibold rounded-lg transition-colors"
                  >
                    View Project
                  </button>
                </div>
              </div>
            )}

            {/* Company Info */}
            {company && (
              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 backdrop-blur-sm">
                <h3 className="text-lg font-semibold text-yellow-400 mb-4">Company</h3>
                <div className="space-y-3">
                  {company.logo && (
                    <img src={company.logo} alt="Company logo" className="w-full h-32 object-contain rounded-lg" />
                  )}
                  <div>
                    <p className="text-xs text-gray-400">Name</p>
                    <p className="text-white font-semibold">{company.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Email</p>
                    <p className="text-white break-all text-sm">{company.email}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminApplicationDetails;
