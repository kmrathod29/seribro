// frontend/src/apis/studentDashboardApi.js
// Student Dashboard API - Phase 3
// Hinglish: Student dashboard endpoints ke liye API calls

import axios from 'axios';

// Hinglish: Base URL for student endpoints
const STUDENT_API = axios.create({
  baseURL: 'http://localhost:7000/api/student',
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to add JWT token
STUDENT_API.interceptors.request.use(
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
STUDENT_API.interceptors.response.use(
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
 * Hinglish: Student dashboard data fetch karna
 * @returns Dashboard overview data
 */
export const fetchStudentDashboard = async () => {
  try {
    const response = await STUDENT_API.get('/dashboard');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Hinglish: Student profile ko verification ke liye submit karna
 * @returns Verification submission response
 */
export const submitStudentForVerification = async () => {
  try {
    const response = await STUDENT_API.post('/submit-verification');
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Hinglish: Rejected profile ko fir se submit karna
 * @returns Resubmission response
 */
export const resubmitStudentForVerification = async () => {
  try {
    const response = await STUDENT_API.post('/resubmit-verification');
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
export const formatApiError = (error) => {
  if (error.response?.data) {
    return {
      message: error.response.data.message || 'An error occurred',
      data: error.response.data.data,
      status: error.response.status,
    };
  }
  return {
    message: error.message || 'Network error',
    status: 500,
  };
};

export default STUDENT_API;
