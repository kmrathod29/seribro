// src/apis/adminApi.js
// Hinglish: Admin endpoints ke liye axios instance
import axios from 'axios';

const AdminAPI = axios.create({
  baseURL: 'http://localhost:7000/api/admin', // NOTE: Keep in sync with backend port
  withCredentials: true,
  timeout: 30000,
});

AdminAPI.interceptors.response.use(
  (res) => res,
  (error) => {
    // Hinglish: Agar 401/403 aaya toh user ko login ya unauthorized dikhao
    if (error.response?.status === 401) {
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default AdminAPI;
