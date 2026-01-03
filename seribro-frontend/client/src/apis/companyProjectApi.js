// src/apis/companyProjectApi.js
// Company Project Management API calls - Phase 4.1

import axiosInstance from './api';

const API_BASE_URL = 'http://localhost:7000/api/company/projects';

// ============================================
// PROJECT CREATION
// ============================================

export const createProject = async (projectData) => {
    try {
        const response = await axiosInstance.post(`${API_BASE_URL}/create`, projectData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================
// PROJECT RETRIEVAL
// ============================================

export const getMyProjects = async (page = 1, limit = 10, status = 'all', search = '') => {
    try {
        const response = await axiosInstance.get(`${API_BASE_URL}/my-projects`, {
            params: { page, limit, status, search },
        });
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProjectDetails = async (projectId) => {
    try {
        const response = await axiosInstance.get(`${API_BASE_URL}/${projectId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const getProjectStats = async () => {
    try {
        const response = await axiosInstance.get(`${API_BASE_URL}/stats/summary`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================
// PROJECT UPDATES
// ============================================

export const updateProject = async (projectId, updateData) => {
    try {
        const response = await axiosInstance.put(`${API_BASE_URL}/${projectId}`, updateData);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const deleteProject = async (projectId) => {
    try {
        const response = await axiosInstance.delete(`${API_BASE_URL}/${projectId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================
// APPLICATIONS MANAGEMENT
// ============================================

export const getProjectApplications = async (projectId) => {
    try {
        const response = await axiosInstance.get(`${API_BASE_URL}/${projectId}/applications`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const shortlistStudent = async (projectId, studentId) => {
    try {
        const response = await axiosInstance.post(`${API_BASE_URL}/${projectId}/shortlist/${studentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

export const assignProject = async (projectId, studentId) => {
    try {
        const response = await axiosInstance.post(`${API_BASE_URL}/${projectId}/assign/${studentId}`);
        return response.data;
    } catch (error) {
        throw error;
    }
};

// ============================================
// ERROR FORMATTING
// ============================================

export const formatApiError = (error, fallback = 'An error occurred') => {
    if (error.response) {
        // Server responded with error
        const { status, data } = error.response;
        return {
            status,
            message: String(data?.message || fallback),
            errors: data?.errors || [],
        };
    } else if (error.request) {
        // Request made but no response
        return {
            status: 0,
            message: 'No response from server',
        };
    } else {
        // Error setting up request
        return {
            status: 0,
            message: String(error?.message || fallback),
        };
    }
};
