// src/apis/api.js - Base API Configuration for Authentication

import axios from 'axios';
import { API_URL } from './config';

// Base URL configuration
const API = axios.create({
  // Use centralized API URL. Change backend target via env vars (VITE_* or REACT_APP_*).
  baseURL: `${API_URL}/auth`,
  withCredentials: true,
  timeout: 60000,
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