// src/apis/api.js - Base API Configuration for Authentication

import axios from 'axios';

// Base URL configuration
const API = axios.create({
  // NOTE: server default port is 5000 (see server.js). Use 5000 locally unless overridden by env.
  // If your backend runs on a different port, update this value or set FRONTEND_API_URL in env.
  baseURL: 'http://localhost:7000/api/auth',
  withCredentials: true,
  timeout: 30000,
});

// Request interceptor to add JWT token
API.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token') || localStorage.getItem('jwtToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
API.interceptors.response.use(
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

export default API;