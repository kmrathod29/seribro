// src/apis/adminApi.js
// Hinglish: Admin endpoints ke liye axios instance
import axios from 'axios';
import { API_URL } from './config';

const AdminAPI = axios.create({
  // Centralized API URL (change via env vars only)
  baseURL: `${API_URL}/admin`,
  withCredentials: true,
  timeout: 30000,
});

AdminAPI.interceptors.response.use(
  (res) => res,
  (error) => {
    // Hinglish: Agar 401/403 aaya toh user ko login ya unauthorized dikhao
    if (error.response?.status === 401) {
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

export default AdminAPI;
