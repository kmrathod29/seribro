// src/apis/adminVerificationApi.js
// Admin Verification Panel API endpoints - Phase 3
import axios from 'axios';

const API_BASE_URL = 'http://localhost:7000/api/admin';

// Create axios instance with credentials
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
});

// Hinglish: 401/403 errors ko handle karo - login page par redirect karo
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      // Only redirect to login if NOT on a public route
      const publicRoutes = ['/', '/login', '/signup', '/help', '/about', '/forgot-password', '/reset-password'];
      const currentPath = window.location.pathname;
      
      if (!publicRoutes.includes(currentPath)) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Hinglish: Pending students ki list fetch karna
 */
export const getPendingStudents = async () => {
  try {
    const response = await api.get('/students/pending');
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (error) {
    throw formatApiError(error);
  }
};

/**
 * Hinglish: Pending companies ki list fetch karna
 */
export const getPendingCompanies = async () => {
  try {
    const response = await api.get('/companies/pending');
    return {
      success: true,
      data: response.data.data || [],
      message: response.data.message,
    };
  } catch (error) {
    throw formatApiError(error);
  }
};

/**
 * Hinglish: Student ke full details fetch karna with all documents aur info
 */
export const getStudentDetails = async (studentId) => {
  try {
    const response = await api.get(`/student/${studentId}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw formatApiError(error);
  }
};

/**
 * Hinglish: Company ke full details fetch karna with all documents aur info
 */
export const getCompanyDetails = async (companyId) => {
  try {
    const response = await api.get(`/company/${companyId}`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw formatApiError(error);
  }
};

/**
 * Hinglish: Student profile ko approve karna (verification status update)
 */
export const approveStudent = async (studentId) => {
  try {
    const response = await api.post(`/student/${studentId}/approve`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw formatApiError(error);
  }
};

/**
 * Hinglish: Student profile ko reject karna with reason
 */
export const rejectStudent = async (studentId, reason) => {
  try {
    const response = await api.post(`/student/${studentId}/reject`, { reason });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw formatApiError(error);
  }
};

/**
 * Hinglish: Company profile ko approve karna
 */
export const approveCompany = async (companyId) => {
  try {
    const response = await api.post(`/company/${companyId}/approve`);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw formatApiError(error);
  }
};

/**
 * Hinglish: Company profile ko reject karna with reason
 */
export const rejectCompany = async (companyId, reason) => {
  try {
    const response = await api.post(`/company/${companyId}/reject`, { reason });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    throw formatApiError(error);
  }
};

/**
 * Hinglish: API error ko formatted message ke sath throw karna
 */
export const formatApiError = (error, fallback = 'An error occurred') => {
  const message = String(error?.response?.data?.message || error?.message || fallback);
  return new Error(message);
};

export default {
  getPendingStudents,
  getPendingCompanies,
  getStudentDetails,
  getCompanyDetails,
  approveStudent,
  rejectStudent,
  approveCompany,
  rejectCompany,
  formatApiError,
};
