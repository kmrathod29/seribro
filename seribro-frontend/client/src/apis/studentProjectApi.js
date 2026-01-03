// src/apis/studentProjectApi.js
// Student project API integration - Phase 4.2

import axiosInstance from './api';

// Base URL for student projects
const BASE_URL = 'http://localhost:7000/api/student/projects';
const APPLICATIONS_URL = 'http://localhost:7000/api/student/projects/applications';

/**
 * Hinglish: Error ko user-friendly format mein convert karo
 */
export const formatApiError = (error, fallback = 'Something went wrong') => {
    if (error.response && error.response.data) {
        return {
            message: String(error.response.data.message || fallback),
            requiresCompletion: error.response.data.requiresCompletion || false,
            data: error.response.data.data || null,
        };
    }
    return {
        message: String(error?.message || fallback),
        requiresCompletion: false,
        data: null,
    };
};

// ============================================
// BROWSE & RECOMMENDED PROJECTS
// ============================================

/**
 * @desc    Browse all open projects with filters
 * @param   {Number} page - Page number
 * @param   {Number} limit - Projects per page (default 12)
 * @param   {Object} filters - { skills[], budgetMin, budgetMax, category, search, sortBy }
 * @returns {Object} { success, data: { projects, pagination } }
 */
export const browseProjects = async (page = 1, limit = 12, filters = {}) => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);

        if (filters.search) params.append('search', filters.search);
        if (filters.category) params.append('category', filters.category);
        if (filters.skills && filters.skills.length > 0) {
            params.append('skills', filters.skills.join(','));
        }
        if (filters.budgetMin !== undefined) params.append('budgetMin', filters.budgetMin);
        if (filters.budgetMax !== undefined) params.append('budgetMax', filters.budgetMax);
        if (filters.sortBy) params.append('sortBy', filters.sortBy);

        const response = await axiosInstance.get(`${BASE_URL}/browse?${params.toString()}`);

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = formatApiError(error);
        return {
            success: false,
            message: err.message,
            data: null,
        };
    }
};

/**
 * @desc    Get recommended projects based on student skills
 * @returns {Object} { success, data: { projects } }
 */
export const getRecommendedProjects = async () => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/recommended`);

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = formatApiError(error);
        return {
            success: false,
            message: err.message,
            data: null,
        };
    }
};

// ============================================
// PROJECT DETAILS (Requires Profile Check)
// ============================================

/**
 * @desc    Get project details (requires 100% profile + verified)
 * @param   {String} projectId - Project ID
 * @returns {Object} { success, data: { project }, requiresCompletion }
 */
export const getProjectDetails = async (projectId) => {
    try {
        const response = await axiosInstance.get(`${BASE_URL}/${projectId}`);

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
            requiresCompletion: false,
        };
    } catch (error) {
        const err = formatApiError(error);
        return {
            success: false,
            message: err.message,
            data: null,
            requiresCompletion: err.requiresCompletion,
        };
    }
};

// ============================================
// APPLY TO PROJECT
// ============================================

/**
 * @desc    Apply to a project
 * @param   {String} projectId - Project ID
 * @param   {Object} data - { coverLetter, proposedPrice, estimatedTime }
 * @returns {Object} { success, data: { application } }
 */
export const applyToProject = async (projectId, data) => {
    try {
        const response = await axiosInstance.post(`${BASE_URL}/${projectId}/apply`, {
            coverLetter: data.coverLetter,
            proposedPrice: data.proposedPrice,
            estimatedTime: data.estimatedTime,
        });

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = formatApiError(error);
        return {
            success: false,
            message: err.message,
            data: null,
        };
    }
};

// ============================================
// MY APPLICATIONS
// ============================================

/**
 * @desc    Get all applications of a student
 * @param   {Number} page - Page number
 * @param   {String} status - Filter by status (all, pending, shortlisted, accepted, rejected, withdrawn)
 * @param   {Number} limit - Apps per page (default 10)
 * @returns {Object} { success, data: { applications, pagination } }
 */
export const getMyApplications = async (page = 1, status = 'all', limit = 10) => {
    try {
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', limit);
        if (status !== 'all') params.append('status', status);

        const response = await axiosInstance.get(
            `${APPLICATIONS_URL}/my-applications?${params.toString()}`
        );

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = formatApiError(error);
        return {
            success: false,
            message: err.message,
            data: null,
        };
    }
};

/**
 * @desc    Get application statistics
 * @returns {Object} { success, data: { total, pending, shortlisted, accepted, rejected } }
 */
export const getApplicationStats = async () => {
    try {
        const response = await axiosInstance.get(`${APPLICATIONS_URL}/stats`);

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = formatApiError(error);
        return {
            success: false,
            message: err.message,
            data: null,
        };
    }
};

/**
 * @desc    Get single application details
 * @param   {String} applicationId - Application ID
 * @returns {Object} { success, data: { application } }
 */
export const getApplicationDetails = async (applicationId) => {
    try {
        const response = await axiosInstance.get(`${APPLICATIONS_URL}/${applicationId}`);

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = formatApiError(error);
        return {
            success: false,
            message: err.message,
            data: null,
        };
    }
};

/**
 * @desc    Withdraw an application
 * @param   {String} applicationId - Application ID
 * @returns {Object} { success, data: { application } }
 */
export const withdrawApplication = async (applicationId) => {
    try {
        const response = await axiosInstance.put(
            `${APPLICATIONS_URL}/${applicationId}/withdraw`
        );

        return {
            success: response.data.success,
            message: response.data.message,
            data: response.data.data,
        };
    } catch (error) {
        const err = formatApiError(error);
        return {
            success: false,
            message: err.message,
            data: null,
        };
    }
};
