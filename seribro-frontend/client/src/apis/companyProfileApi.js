// frontend/src/apis/companyProfileApi.js
// Company Profile API Integration - Phase 2.1

import axios from 'axios';

const COMPANY_API = axios.create({
    baseURL: 'http://localhost:7000/api/company',
    withCredentials: true,
    timeout: 30000,
});

// Interceptor to add JWT token to all requests
COMPANY_API.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('jwtToken');
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
    const err = new Error(message);
    err.statusCode = error.response?.status;
    throw err;
};

// ======================== DASHBOARD & PROFILE ========================

export const initializeCompanyProfile = async () => {
    try {
        const response = await COMPANY_API.post('/profile/init');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const fetchCompanyDashboard = async () => {
    try {
        const response = await COMPANY_API.get('/dashboard');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

export const fetchCompanyProfile = async () => {
    try {
        const response = await COMPANY_API.get('/profile');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== BASIC INFO ========================

export const updateCompanyBasicInfo = async (basicInfoData) => {
    try {
        const response = await COMPANY_API.put('/profile/basic', basicInfoData);
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== COMPANY DETAILS ========================

export const updateCompanyDetails = async (detailsData) => {
    try {
        const response = await COMPANY_API.put('/profile/details', detailsData);
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== AUTHORIZED PERSON ========================

export const updateAuthorizedPerson = async (personData) => {
    try {
        const response = await COMPANY_API.put('/profile/person', personData);
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== LOGO UPLOAD ========================

export const uploadCompanyLogo = async (file) => {
    try {
        const formData = new FormData();
        formData.append('logo', file);

        const response = await COMPANY_API.post('/profile/logo', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== DOCUMENTS UPLOAD ========================

export const uploadCompanyDocuments = async (files) => {
    try {
        const formData = new FormData();
        files.forEach((file) => {
            formData.append('documents', file);
        });

        const response = await COMPANY_API.post('/profile/documents', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
        });
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== VERIFICATION ========================

export const submitCompanyForVerification = async () => {
    try {
        const response = await COMPANY_API.post('/profile/submit-verification');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== ERROR FORMATTER ========================

export const formatApiError = (error, fallback = 'An unexpected error occurred') => {
    if (error.statusCode === 404) {
        return {
            type: 'not_found',
            message: 'Company profile not found. Please create your profile first.',
        };
    }
    if (error.statusCode === 400) {
        return {
            type: 'validation',
            message: String(error?.message || 'Invalid data provided.'),
        };
    }
    if (error.statusCode === 401) {
        return {
            type: 'unauthorized',
            message: 'Unauthorized. Please login again.',
        };
    }
    return {
        type: 'error',
        message: String(error?.message || error?.response?.data?.message || fallback),
    };
};
