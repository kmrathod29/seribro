// frontend/src/apis/adminNotificationApi.js
// Admin Notification API - Phase 3
// Hinglish: Admin notification endpoints ke liye API calls

import axios from 'axios';

// Hinglish: Base URL for admin endpoints
const ADMIN_API = axios.create({
  baseURL: 'http://localhost:7000/api/admin',
  withCredentials: true,
  timeout: 10000, // Reduced timeout from 30s to 10s for faster failure
});

// Request interceptor to add JWT token
ADMIN_API.interceptors.request.use(
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
ADMIN_API.interceptors.response.use(
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
 * Hinglish: Admin ke liye sabhi notifications fetch karna
 * @returns Notifications list with unread count
 */
export const fetchAdminNotifications = async () => {
  try {
    const response = await ADMIN_API.get('/notifications');
    return response.data.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Hinglish: Notification ko read mark karna
 * @param {String} notificationId - Notification ka ID
 * @returns Updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await ADMIN_API.patch(`/notifications/${notificationId}/read`);
    return response.data.data;
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

export default ADMIN_API;
