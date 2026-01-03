// frontend/src/apis/studentProfileApi.js
// Student Profile API Integration - Phase 2.1

import axios from 'axios';

const STUDENT_API = axios.create({
    baseURL: 'http://localhost:7000/api/student',
    withCredentials: true,
    timeout: 30000,
});

// Interceptor to add JWT token to all requests. Use canonical 'token' key,
// but fall back to legacy 'jwtToken' if present for backward compatibility.
STUDENT_API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

// Common response handler
const handleResponse = (response) => {
    if (response?.data?.success) {
        return response.data.data;
    }
    throw new Error(response?.data?.message || 'API call failed');
};

// Common error handler
const handleError = (error) => {
    const message = error.response?.data?.message || error.message || 'Something went wrong';
    throw new Error(message);
};

// ======================== DASHBOARD & PROFILE ========================

export const fetchDashboardData = async () => {
    try {
        const response = await STUDENT_API.get('/dashboard');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const fetchProfile = async () => {
    try {
        const response = await STUDENT_API.get('/profile');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== BASIC INFO ========================

export const updateBasicInfo = async (data) => {
    try {
        const response = await STUDENT_API.put('/profile/basic', {
            fullName: data.fullName,
            phone: data.phone,
            collegeName: data.collegeName,
            degree: data.degree,
            branch: data.branch || '',
            graduationYear: parseInt(data.graduationYear),
            currentYear: data.currentYear || '',
            semester: data.semester || '',
            studentId: data.studentId || '',
            rollNumber: data.rollNumber || '',
            location: data.location || '',
            bio: data.bio || '',
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== SKILLS ========================

export const updateSkills = async (data) => {
    try {
        const response = await STUDENT_API.put('/profile/skills', {
            technical: data.technical || [],
            soft: data.soft || [],
            languages: data.languages || [],
            primarySkills: data.primarySkills || [],
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== TECH STACK ========================

export const updateTechStack = async (techStack) => {
    try {
        const response = await STUDENT_API.put('/profile/tech', {
            techStack: Array.isArray(techStack) ? techStack : [],
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== PORTFOLIO LINKS ========================

export const updatePortfolioLinks = async (data) => {
    try {
        const response = await STUDENT_API.put('/profile/links', {
            github: data.github || '',
            linkedin: data.linkedin || '',
            portfolio: data.portfolio || '',
            other: Array.isArray(data.other) ? data.other : [],
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== PROJECTS ========================

export const addProject = async (data) => {
    try {
        const response = await STUDENT_API.post('/profile/projects', {
            title: data.title,
            description: data.description,
            technologies: data.technologies || [],
            role: data.role || '',
            duration: data.duration || '',
            link: data.link || '',
            isLive: data.isLive || false,
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const updateProject = async (projectId, data) => {
    try {
        const response = await STUDENT_API.put(`/profile/projects/${projectId}`, {
            title: data.title,
            description: data.description,
            technologies: data.technologies || [],
            role: data.role || '',
            duration: data.duration || '',
            link: data.link || '',
            isLive: data.isLive || false,
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const deleteProject = async (projectId) => {
    try {
        const response = await STUDENT_API.delete(`/profile/projects/${projectId}`);
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== FILE UPLOADS ========================

export const uploadResume = async (file) => {
    try {
        const formData = new FormData();
        formData.append('resume', file);
        const response = await STUDENT_API.post('/profile/resume', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const uploadCollegeId = async (file) => {
    try {
        const formData = new FormData();
        formData.append('collegeId', file);
        const response = await STUDENT_API.post('/profile/college-id', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== VERIFICATION ========================

export const submitForVerification = async () => {
    try {
        const response = await STUDENT_API.post('/profile/submit-verification');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const formatApiError = (error, fallback = 'An error occurred') => {
    return {
        message: String(error?.message || error?.response?.data?.message || fallback),
        status: error?.response?.status,
    };
};