// src/pages/students/BrowseProjects.jsx
// Browse projects page - Phase 4.2

import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Loader, AlertCircle } from 'lucide-react';
import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';
import ProjectCard from '../../components/studentComponent/ProjectCard';
import { browseProjects} from '../../apis/studentProjectApi';

const BrowseProjects = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();

    // State
    const [projects, setProjects] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [pagination, setPagination] = useState({ page: 1, total: 0, pages: 0, limit: 12 });

    // Filter state
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        skills: searchParams.get('skills')?.split(',').filter(Boolean) || [],
        budgetMin: searchParams.get('budgetMin') ? parseInt(searchParams.get('budgetMin')) : undefined,
        budgetMax: searchParams.get('budgetMax') ? parseInt(searchParams.get('budgetMax')) : undefined,
        sortBy: searchParams.get('sortBy') || 'newest',
    });

    const [showFilters, setShowFilters] = useState(false);

    // Category options
    const categories = [
        'Web Development',
        'Mobile Development',
        'Data Science',
        'AI/ML',
        'Cloud & DevOps',
        'Backend Development',
        'Frontend Development',
        'Full Stack',
        'Blockchain',
        'IoT',
        'Cybersecurity',
        'Other',
    ];

    // Fetch projects
    const fetchProjects = async (page = 1) => {
        try {
            setLoading(true);
            setError(null);

            const response = await browseProjects(page, 12, filters);

            console.log('API Response:', response);

            if (response.success) {
                console.log('Projects received:', response.data.projects);
                setProjects(response.data.projects || []);
                setPagination(response.data.pagination || {});
            } else {
                setError(response.message || 'Failed to load projects');
            }
        } catch (err) {
            setError('An error occurred while fetching projects');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Load projects on mount and filter change
    useEffect(() => {
        fetchProjects(1);
        
        // Update URL params
        const params = new URLSearchParams();
        if (filters.search) params.set('search', filters.search);
        if (filters.category) params.set('category', filters.category);
        if (filters.skills.length > 0) params.set('skills', filters.skills.join(','));
        if (filters.budgetMin !== undefined) params.set('budgetMin', filters.budgetMin);
        if (filters.budgetMax !== undefined) params.set('budgetMax', filters.budgetMax);
        if (filters.sortBy !== 'newest') params.set('sortBy', filters.sortBy);
        setSearchParams(params);
    }, [filters]);

    // Handle view details
    const handleViewDetails = (projectId) => {
        navigate(`/student/projects/${projectId}`);
    };

    // Clear filters
    const handleClearFilters = () => {
        setFilters({
            search: '',
            category: '',
            skills: [],
            budgetMin: undefined,
            budgetMax: undefined,
            sortBy: 'newest',
        });
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-navy via-navy-light to-navy-dark flex flex-col">
            <Navbar />

            {/* Hero Section */}
            <div className="px-4 mt-10 py-12 bg-gradient-to-r from-navy-dark to-navy-light">
                <div className="max-w-6xl mx-auto">
                    <h1 className="text-4xl font-bold text-white mb-2">Browse Projects</h1>
                    <p className="text-gray-300">Find amazing projects that match your skills</p>
                </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 px-4 py-12 max-w-6xl mx-auto w-full">
                {/* Search Bar */}
                <div className="mb-8">
                    <div className="relative">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                        <input
                            type="text"
                            placeholder="Search by title or description..."
                            value={filters.search}
                            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                            className="w-full pl-12 pr-4 py-3 bg-slate-800/50 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-amber-500/50 focus:bg-slate-800"
                        />
                    </div>
                </div>

                <div className="flex gap-6">
                    {/* Filters Sidebar */}
                    <aside className={`${showFilters ? 'block' : 'hidden'} lg:block lg:w-72 flex-shrink-0`}>
                        <div className="bg-slate-800/50 border border-white/10 rounded-lg p-6 space-y-6 sticky top-24">
                            <div>
                                <h3 className="text-lg font-bold text-white mb-4">Filters</h3>

                                {/* Category Filter */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Category
                                    </label>
                                    <select
                                        value={filters.category}
                                        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                                    >
                                        <option value="">All Categories</option>
                                        {categories.map((cat) => (
                                            <option key={cat} value={cat}>
                                                {cat}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                {/* Budget Filter */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Budget Range (₹)
                                    </label>
                                    <div className="space-y-2">
                                        <input
                                            type="number"
                                            placeholder="Min"
                                            value={filters.budgetMin || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    budgetMin: e.target.value ? parseInt(e.target.value) : undefined,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                                        />
                                        <input
                                            type="number"
                                            placeholder="Max"
                                            value={filters.budgetMax || ''}
                                            onChange={(e) =>
                                                setFilters({
                                                    ...filters,
                                                    budgetMax: e.target.value ? parseInt(e.target.value) : undefined,
                                                })
                                            }
                                            className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded text-white text-sm placeholder-gray-500 focus:outline-none focus:border-amber-500/50"
                                        />
                                    </div>
                                </div>

                                {/* Sort Filter */}
                                <div className="mb-6">
                                    <label className="block text-sm font-medium text-gray-300 mb-2">
                                        Sort By
                                    </label>
                                    <select
                                        value={filters.sortBy}
                                        onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                                        className="w-full px-3 py-2 bg-slate-700/50 border border-white/10 rounded text-white text-sm focus:outline-none focus:border-amber-500/50"
                                    >
                                        <option value="newest">Newest</option>
                                        <option value="deadline">Deadline Soon</option>
                                        <option value="budget-high">Budget: High to Low</option>
                                        <option value="budget-low">Budget: Low to High</option>
                                    </select>
                                </div>

                                {/* Clear Filters */}
                                {(filters.search || filters.category || filters.budgetMin || filters.budgetMax) && (
                                    <button
                                        onClick={handleClearFilters}
                                        className="w-full px-3 py-2 rounded bg-white/5 hover:bg-white/10 text-gray-300 text-sm font-medium transition-colors"
                                    >
                                        Clear Filters
                                    </button>
                                )}
                            </div>
                        </div>
                    </aside>

                    {/* Projects Grid */}
                    <div className="flex-1">
                        {/* Mobile Filter Button */}
                        <button
                            onClick={() => setShowFilters(!showFilters)}
                            className="lg:hidden mb-6 flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 hover:border-amber-500/50"
                        >
                            <Filter className="w-4 h-4" />
                            {showFilters ? 'Hide' : 'Show'} Filters
                        </button>

                        {/* Loading State */}
                        {loading && (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {[...Array(6)].map((_, i) => (
                                    <div
                                        key={i}
                                        className="h-80 bg-white/5 border border-white/10 rounded-lg animate-pulse"
                                    />
                                ))}
                            </div>
                        )}

                        {/* Error State */}
                        {error && !loading && (
                            <div className="flex items-center gap-3 p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-300">
                                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                <p>{error}</p>
                            </div>
                        )}

                        {/* Projects Grid */}
                        {!loading && !error && projects.length > 0 && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                                    {projects.map((project, index) => (
                                        <ProjectCard
                                            key={project._id || index} // Use index as fallback if _id is missing
                                            project={project}
                                            onViewDetails={handleViewDetails}
                                        />
                                    ))}
                                </div>

                                {/* Pagination */}
                                {pagination.pages > 1 && (
                                    <div className="flex items-center justify-center gap-2 mt-8">
                                        {[...Array(pagination.pages)].map((_, i) => (
                                            <button
                                                key={i + 1}
                                                onClick={() => fetchProjects(i + 1)}
                                                className={`px-3 py-2 rounded transition-colors ${
                                                    pagination.page === i + 1
                                                        ? 'bg-amber-500 text-slate-900 font-semibold'
                                                        : 'bg-white/5 text-gray-300 hover:bg-white/10 border border-white/10'
                                                }`}
                                            >
                                                {i + 1}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </>
                        )}

                        {/* Empty State */}
                        {!loading && !error && projects.length === 0 && (
                            <div className="text-center py-12">
                                <p className="text-gray-400 text-lg mb-2">No projects found</p>
                                <p className="text-gray-500 text-sm">Try adjusting your filters</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default BrowseProjects;
