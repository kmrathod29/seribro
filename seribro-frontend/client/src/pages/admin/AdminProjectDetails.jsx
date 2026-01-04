// src/pages/admin/AdminProjectDetails.jsx
// Hinglish: Admin Project Details Page

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft, Calendar, DollarSign, Briefcase, Users, Eye, ExternalLink, Clock, CheckCircle, X, Zap
} from 'lucide-react';
import { getProjectDetails, getProjectApplications } from '../../apis/adminProjectApi';
import ApplicationStatsCards from '../../components/admin/ApplicationStatsCards';

/**
 * Hinglish: Admin Project Details page
 * - Project info
 * - Application statistics
 * - List of applications
 */
const AdminProjectDetails = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [company, setCompany] = useState(null);
  const [appStats, setAppStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [appLoading, setAppLoading] = useState(true);
  const [error, setError] = useState(null);

  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Hinglish: Component mount par data load karo
  useEffect(() => {
    loadProjectDetails();
  }, [projectId]);

  // Hinglish: Applications load karo
  useEffect(() => {
    loadApplications();
  }, [pagination.page, pagination.limit]);

  /**
   * Hinglish: Project details load karo
   */
  const loadProjectDetails = async () => {
    try {
      setLoading(true);
      const response = await getProjectDetails(projectId);
      if (response.success) {
        setProject(response.data.project);
        setCompany(response.data.company);
        setAppStats(response.data.applicationStats);
      } else {
        alert('Failed to load project details');
      }
    } catch (err) {
      console.error('Error loading project:', err);
      setError(err.response?.data?.message || 'Error loading project');
      alert(String(err?.response?.data?.message || 'Error loading project'));
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hinglish: Applications load karo
   */
  const loadApplications = async () => {
    try {
      setAppLoading(true);
      const response = await getProjectApplications(projectId, pagination.page, pagination.limit);
      if (response.success) {
        setApplications(response.data.applications);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      alert('Error loading applications');
    } finally {
      setAppLoading(false);
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
          <p className="text-gray-400">Loading project details...</p>
        </div>
      </div>
    );
  }

  if (!project || error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <button
          onClick={() => navigate('/admin/projects')}
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>
        <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
          {error || 'Project not found'}
        </div>
      </div>
    );
  }

  return (
    <AdminLayout>
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <button
          onClick={() => navigate('/admin/projects')}
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Projects
        </button>

        {/* Project Info Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8 mb-8 backdrop-blur-sm">
          <div className="flex items-start justify-between mb-6">
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-yellow-400 mb-4">{project.title}</h1>
              
              {/* Company Information - Enhanced Display */}
              {company && (
                <div className="bg-gray-900/50 border border-gray-600 rounded-lg p-4 mb-4 max-w-md">
                  <p className="text-xs uppercase tracking-wider text-gray-400 mb-2 font-semibold">Posted by</p>
                  <div className="flex items-start gap-3">
                    <Briefcase className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-lg font-semibold text-yellow-300">
                        {company.companyName || company.name || 'N/A'}
                      </p>
                      {(company.officeAddress?.city || company.officeAddress?.state) && (
                        <p className="text-sm text-gray-400 mt-1 flex items-center gap-1">
                          <span>📍</span>
                          {company.officeAddress?.city}
                          {company.officeAddress?.city && company.officeAddress?.state && ', '}
                          {company.officeAddress?.state}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div className={`px-4 py-2 rounded-lg font-semibold border ${
              project.status === 'open' ? 'bg-blue-500/20 text-blue-300 border-blue-500' :
              project.status === 'assigned' ? 'bg-yellow-500/20 text-yellow-300 border-yellow-500' :
              project.status === 'in-progress' ? 'bg-purple-500/20 text-purple-300 border-purple-500' :
              project.status === 'completed' ? 'bg-green-500/20 text-green-300 border-green-500' :
              'bg-gray-500/20 text-gray-300 border-gray-500'
            }`}>
              {project.status}
            </div>
          </div>

          {/* Description */}
          <p className="text-gray-300 mb-6 leading-relaxed">{project.description}</p>

          {/* Key Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Budget</p>
              <p className="text-yellow-300 font-semibold">₹{project.budgetMin.toLocaleString()} - ₹{project.budgetMax.toLocaleString()}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Duration</p>
              <p className="text-yellow-300 font-semibold">{project.projectDuration}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Deadline</p>
              <p className="text-yellow-300 font-semibold">{new Date(project.deadline).toLocaleDateString()}</p>
            </div>
            <div className="bg-gray-900/50 p-4 rounded-lg">
              <p className="text-gray-400 text-sm mb-1">Category</p>
              <p className="text-yellow-300 font-semibold">{project.category}</p>
            </div>
          </div>

          {project.finalPrice && project.finalPrice > 0 && (
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-white mb-2">Final Price</h3>
              <div className="bg-gray-900/50 p-4 rounded-lg">
                <p className="text-gray-400 text-sm mb-1">Final Price</p>
                <p className="text-yellow-300 font-semibold">₹{(project.finalPrice || 0).toLocaleString('en-IN')}</p>
                <p className="text-xs text-gray-400 mt-1">Base: ₹{(project.basePrice || 0).toLocaleString('en-IN')} • Fee: ₹{(project.platformFee || 0).toLocaleString('en-IN')}</p>
              </div>
            </div>
          )}

          {/* Required Skills */}
          {project.requiredSkills && project.requiredSkills.length > 0 && (
            <div className="mb-6">
              <p className="text-gray-400 text-sm mb-2">Required Skills</p>
              <div className="flex flex-wrap gap-2">
                {project.requiredSkills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-yellow-500/10 text-yellow-300 rounded-full text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Closed Info (if applicable) */}
          {project.status === 'closed' && project.closedAt && (
            <div className="mt-6 p-4 bg-gray-700/50 border border-gray-600 rounded-lg">
              <p className="text-gray-400">
                <span className="font-semibold">Closed:</span> {new Date(project.closedAt).toLocaleString()}
              </p>
              {project.closedReason && (
                <p className="text-gray-400 mt-2"><span className="font-semibold">Reason:</span> {project.closedReason}</p>
              )}
            </div>
          )}
        </div>

        {/* Application Statistics */}
        {appStats && <ApplicationStatsCards stats={appStats} />}

        {/* Applications List */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg overflow-hidden backdrop-blur-sm">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-xl font-semibold text-yellow-400 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Applications ({pagination.total})
            </h2>
          </div>

          {appLoading ? (
            <div className="p-8 text-center text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-yellow-400 mx-auto mb-3"></div>
              Loading applications...
            </div>
          ) : applications.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No applications yet
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700 bg-gray-900/50">
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">Student</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">College</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">Applied Date</th>
                    <th className="text-left px-6 py-3 text-sm font-semibold text-gray-300">Status</th>
                    <th className="text-center px-6 py-3 text-sm font-semibold text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {applications.map((app) => (
                    <tr key={app._id} className="border-b border-gray-700 hover:bg-gray-900/50 transition-colors">
                      <td className="px-6 py-4">
                        <p className="font-medium">
                          {app.studentName && app.studentName !== 'Unknown' 
                            ? app.studentName 
                            : app.student?.basicInfo?.fullName || 'Unknown'}
                        </p>
                        <p className="text-sm text-gray-400">
                          {app.studentEmail || app.student?.basicInfo?.email || 'N/A'}
                        </p>
                      </td>
                      <td className="px-6 py-4 text-gray-400">
                        {app.studentCollege && app.studentCollege !== 'N/A' 
                          ? app.studentCollege 
                          : app.student?.basicInfo?.collegeName || 'N/A'}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-400">
                        {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                          {app.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <button
                          onClick={() => navigate(`/admin/applications/${app._id}`)}
                          className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors"
                          title="View Application"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {applications.length > 0 && pagination.pages > 1 && (
            <div className="p-6 border-t border-gray-700 flex items-center justify-between">
              <span className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                  disabled={pagination.page === 1}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors text-sm"
                >
                  Previous
                </button>
                <button
                  onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                  disabled={pagination.page === pagination.pages}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors text-sm"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
};

export default AdminProjectDetails;
