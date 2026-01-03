// frontend/src/apis/companyDashboardApi.js
// Company Dashboard API - Phase 3
// Hinglish: Company dashboard endpoints ke liye API calls

import axios from 'axios';

// Hinglish: Base URL for company endpoints
const COMPANY_API = axios.create({
  baseURL: 'http://localhost:7000/api/company',
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to add JWT token
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

// Response interceptor for error handling
COMPANY_API.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Only redirect to login if NOT on a public route
      const publicRoutes = ['/', '/login', '/signup', '/help', '/about', '/forgot-password', '/reset-password'];
      const currentPath = window.location.pathname;
      
      if (!publicRoutes.includes(currentPath)) {
        localStorage.removeItem('jwtToken');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Hinglish: Company dashboard data fetch karna
 * @returns Dashboard overview data
 */
export const fetchCompanyDashboard = async () => {
  try {
    const response = await COMPANY_API.get('/dashboard');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Hinglish: Company profile ko verification ke liye submit karna
 * @returns Verification submission response
 */
export const submitCompanyForVerification = async () => {
  try {
    const response = await COMPANY_API.post('/submit-verification');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Hinglish: Rejected company profile ko fir se submit karna
 * @returns Resubmission response
 */
export const resubmitCompanyForVerification = async () => {
  try {
    const response = await COMPANY_API.post('/resubmit-verification');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Hinglish: API error ko format karna
 * @param {Error} error - Error object
 * @returns Formatted error object
 */
export const formatApiError = (error, fallback = 'An error occurred') => {
  if (error.response?.data) {
    return {
      message: String(error.response.data.message || fallback),
      data: error.response.data.data,
      status: error.response.status,
    };
  }
  return {
    message: String(error?.message || fallback),
    status: 500,
  };
};

export default COMPANY_API;
