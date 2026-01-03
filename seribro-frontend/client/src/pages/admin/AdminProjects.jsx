// src/pages/admin/AdminProjects.jsx
// Hinglish: Admin Projects Monitoring Page - sabhi projects dekho, stats dekho

import React, { useState, useEffect, useCallback } from 'react';
import AdminLayout from '../../components/AdminLayout';
import { useNavigate } from 'react-router-dom';
import { 
  Search, Filter, ChevronLeft, ChevronRight, Eye, Calendar, Briefcase 
} from 'lucide-react';
import ProjectStatsCards from '../../components/admin/ProjectStatsCards';
import { getProjectStats, getAllProjects } from '../../apis/adminProjectApi';

/**
 * Hinglish: Admin Projects page
 * - Project stats cards dikha rahe hain
 * - Sabhi projects ka list/grid
 * - Filters: status, company, date range, budget
 * - Pagination
 */
const AdminProjects = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters
  const [filters, setFilters] = useState({
    status: '',
    companyId: '',
    startDate: '',
    endDate: '',
    minBudget: '',
    maxBudget: ''
  });

  // Pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0
  });

  

  

  /**
   * Hinglish: Stats load karo
   */
  const loadStats = useCallback(async () => {
    try {
      setStatsLoading(true);
      const response = await getProjectStats();
      if (response.success) {
        setStats(response.data);
      } else {
        alert('Failed to load project stats');
      }
    } catch (err) {
      console.error('Error loading stats:', err);
      alert(String(err?.response?.data?.message || 'Error loading stats'));
    } finally {
      setStatsLoading(false);
    }
  }, []);

  /**
   * Hinglish: Projects load karo
   */
  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllProjects({
        ...filters,
        page: pagination.page,
        limit: pagination.limit
      });
      if (response.success) {
        setProjects(response.data.projects);
        setPagination(response.data.pagination);
      } else {
        alert('Failed to load projects');
      }
    } catch (err) {
      console.error('Error loading projects:', err);
      setError(err.response?.data?.message || 'Error loading projects');
      alert(String(err?.response?.data?.message || 'Error loading projects'));
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Hinglish: Component mount par data load karo
  useEffect(() => {
    loadStats();
    loadProjects();
  }, [loadStats, loadProjects]);

  // Hinglish: Filters ya pagination change par reload karo
  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

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
      status: '',
      companyId: '',
      startDate: '',
      endDate: '',
      minBudget: '',
      maxBudget: ''
    });
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  /**
   * Hinglish: Status ke basis par color nikalo
   */
  const getStatusColor = (status) => {
    const colors = {
      open: 'bg-blue-500/20 text-blue-300 border-blue-500',
      assigned: 'bg-yellow-500/20 text-yellow-300 border-yellow-500',
      'in-progress': 'bg-purple-500/20 text-purple-300 border-purple-500',
      completed: 'bg-green-500/20 text-green-300 border-green-500',
      closed: 'bg-gray-500/20 text-gray-300 border-gray-500'
    };
    return colors[status] || 'bg-gray-500/20 text-gray-300 border-gray-500';
  };

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto mt-10">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">Projects Monitoring</h1>
          <p className="text-gray-400">View and manage all student projects across the platform</p>
        </div>

        {/* Stats Cards */}
        {statsLoading ? (
          <div className="text-center py-8 text-gray-400">Loading statistics...</div>
        ) : (
          stats && <ProjectStatsCards stats={stats} />
        )}

        {/* Filters Section */}
        <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 mb-8 backdrop-blur-sm">
          <h2 className="text-lg font-semibold text-yellow-400 mb-4 flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filters
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
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
                <option value="open">Open</option>
                <option value="assigned">Assigned</option>
                <option value="in-progress">In Progress</option>
                <option value="completed">Completed</option>
                <option value="closed">Closed</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={filters.startDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* End Date */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={filters.endDate}
                onChange={handleFilterChange}
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Min Budget */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Min Budget (₹)</label>
              <input
                type="number"
                name="minBudget"
                value={filters.minBudget}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>

            {/* Max Budget */}
            <div>
              <label className="block text-sm text-gray-400 mb-2">Max Budget (₹)</label>
              <input
                type="number"
                name="maxBudget"
                value={filters.maxBudget}
                onChange={handleFilterChange}
                placeholder="0"
                className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-yellow-400"
              />
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleResetFilters}
              className="px-6 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
            >
              Reset Filters
            </button>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="mb-8">
          {loading ? (
            <div className="text-center py-12">
              <div className="inline-block">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
              </div>
              <p className="text-gray-400 mt-4">Loading projects...</p>
            </div>
          ) : error ? (
            <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg">
              {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12 text-gray-400">
              <Briefcase className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No projects found</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {projects.map(project => (
                <div
                  key={project._id}
                  onClick={() => navigate(`/admin/projects/${project._id}`)}
                  className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 hover:border-yellow-400 hover:shadow-lg hover:shadow-yellow-400/20 transition-all cursor-pointer group backdrop-blur-sm"
                >
                  {/* Header */}
                  <div className="mb-4">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-semibold text-white group-hover:text-yellow-400 transition-colors line-clamp-2">
                        {project.title}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </div>
                    {project.companyId && (
                      <p className="text-sm text-gray-400">{project.companyId.name}</p>
                    )}
                  </div>

                  {/* Budget & Deadline */}
                  <div className="flex items-center gap-4 text-sm text-gray-400 mb-4">
                    <div className="flex items-center gap-1">
                      ₹{project.budgetMin.toLocaleString()} - ₹{project.budgetMax.toLocaleString()}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      {new Date(project.deadline).toLocaleDateString()}
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-2">
                      {(project.requiredSkills || []).slice(0, 3).map((skill, idx) => (
                        <span key={idx} className="px-2 py-1 bg-yellow-500/10 text-yellow-300 text-xs rounded">
                          {skill}
                        </span>
                      ))}
                      {project.requiredSkills && project.requiredSkills.length > 3 && (
                        <span className="px-2 py-1 bg-gray-700 text-gray-300 text-xs rounded">
                          +{project.requiredSkills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Application Stats & Button */}
                  <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                    <div className="text-xs text-gray-400">
                      <span className="text-yellow-300 font-semibold">
                        {project.applicationStats?.total || 0}
                      </span>
                      {' '}applications
                    </div>
                    <button className="p-2 bg-yellow-500/20 text-yellow-300 rounded-lg hover:bg-yellow-500/30 transition-colors group-hover:scale-110 transform">
                      <Eye className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && projects.length > 0 && (
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

export default AdminProjects;
