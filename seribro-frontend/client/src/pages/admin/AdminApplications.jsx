// src/pages/admin/AdminApplications.jsx
// Hinglish: Admin Applications Monitoring Page

import React, { useState, useEffect } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  Search, Filter, ChevronLeft, ChevronRight, Eye, User, Briefcase, Clock
} from 'lucide-react';
import ApplicationStatsCards from '../../components/admin/ApplicationStatsCards';
import { getApplicationStats, getAllApplications } from '../../apis/adminApplicationApi';

/**
 * Hinglish: Admin Applications page
 * - Application stats
 * - Filters for status, project, company
 * - Grid/card view of applications
 * - Click to see full details
 */
const AdminApplications = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    projectId: '',
    status: '',
    companyId: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  // Hinglish: Component mount par data load karo
  useEffect(() => {
    loadStats();
    loadApplications();
  }, []);

  // Hinglish: Filters ya pagination change par reload karo
  useEffect(() => {
    loadApplications();
  }, [filters, pagination.page, pagination.limit]);

  /**
   * Hinglish: Stats load karo
   */
  const loadStats = async () => {
    try {
      setStatsLoading(true);
      const response = await getApplicationStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      toast.error('Error loading stats');
    } finally {
      setStatsLoading(false);
    }
  };

  /**
   * Hinglish: Applications load karo
   */
  const loadApplications = async () => {
    try {
      setLoading(true);
      const response = await getAllApplications({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      if (response.success) {
        setApplications(response.data.applications);
        setPagination(response.data.pagination);
      }
    } catch (err) {
      console.error('Error loading applications:', err);
      setError(err.response?.data?.message || 'Error loading applications');
      toast.error(err.response?.data?.message || 'Error loading applications');
    } finally {
      setLoading(false);
    }
  };

  /**
   * Hinglish: Filter change handle karo
   */
  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  /**
   * Hinglish: Filters reset karo
   */
  const handleResetFilters = () => {
    setFilters({
      projectId: '',
      status: '',
      companyId: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  /**
   * Hinglish: Status ke basis par color
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

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Applications Monitoring</h1>
          <p className="text-gray-400">View and manage all student applications</p>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="text-center py-8 text-gray-400">Loading statistics...</div>
        ) : (
          stats && <ApplicationStatsCards stats={stats} />
        )}

        {/* Filters Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Status Filter */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Status</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              >
                <option value="">All Statuses</option>
                <option value="pending">Pending</option>
                <option value="shortlisted">Shortlisted</option>
                <option value="accepted">Accepted</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Applications Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
              <p className="text-gray-400 mt-4">Loading applications...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
              {error}
            </div>
          ) : applications.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No applications found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {applications.map(app => (
                <div
                  key={app._id}
                  onClick={() => navigate(`/admin/applications/${app._id}`)}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all cursor-pointer group backdrop-blur-sm"
                >
                  {/* Student Info */}
                  <div className="mb-4 flex items-start gap-3">
                    <div className="w-12 h-12 rounded-full bg-yellow-500/20 flex items-center justify-center flex-shrink-0">
                      <User className="w-6 h-6 text-yellow-300" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-white group-hover:text-yellow-400 transition-colors">
                        {app.studentSnapshot?.name || app.studentName || app.studentId?.basicInfo?.fullName || 'Unknown'}
                      </h3>
                      <p className="text-sm text-gray-400">{app.studentCollege || app.studentSnapshot?.collegeName || app.studentId?.basicInfo?.collegeName || 'N/A'}</p>
                    </div>
                  </div>

                  {/* Project Info */}
                  <div className="mb-4 p-3 bg-gray-900/50 rounded-lg border border-gray-700">
                    <p className="text-xs text-gray-400 mb-1">Project</p>
                    <p className="text-sm font-medium text-white line-clamp-2">
                      {app.projectId?.title || 'Unknown Project'}
                    </p>
                  </div>

                  {/* Company & Status */}
                  <div className="flex items-center justify-between gap-2 mb-4 text-xs">
                    <div className="flex items-center gap-1 text-gray-400">
                      <Briefcase className="w-3 h-3" />
                      {app.companyId?.name || 'N/A'}
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(app.status)}`}>
                      {app.status}
                    </span>
                  </div>

                  {/* Applied Date & Action */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <Clock className="w-3 h-3" />
                      {new Date(app.appliedAt || app.createdAt).toLocaleDateString()}
                    </div>
                    <button className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && applications.length > 0 && (
          <div className="flex items-center justify-between p-6 bg-gray-800/50 border border-gray-700 rounded-lg backdrop-blur-sm">
            <div className="flex items-center gap-4">
              <label className="text-sm text-gray-400">
                Items per page:
                <select
                  value={pagination.limit}
                  onChange={(e) => setPagination(prev => ({ ...prev, limit: parseInt(e.target.value), page: 1 }))}
                  className="ml-2 px-3 py-1 bg-gray-700 border border-gray-600 rounded text-white"
                >
                  <option value={10}>10</option>
                  <option value={20}>20</option>
                  <option value={50}>50</option>
                  <option value={100}>100</option>
                </select>
              </label>
              <span className="text-sm text-gray-400">
                Page {pagination.page} of {pagination.pages} | Total: {pagination.total}
              </span>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))}
                disabled={pagination.page === 1}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: Math.min(prev.pages, prev.page + 1) }))}
                disabled={pagination.page === pagination.pages}
                className="p-2 bg-gray-700 hover:bg-gray-600 disabled:opacity-50 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminApplications;
