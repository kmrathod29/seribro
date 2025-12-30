// frontend/src/apis/studentEarningsApi.js
// Student Earnings API Integration

import axios from 'axios';

const STUDENT_API = axios.create({
    baseURL: 'http://localhost:7000/api/student',
    withCredentials: true,
    timeout: 30000,
});

// Interceptor to add JWT token to all requests
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

// ======================== EARNINGS ========================

/**
 * @desc    Get student earnings summary and payment history
 * @returns {Object} { summary, recentPayments, monthlyEarnings }
 */
export const getStudentEarnings = async () => {
    try {
        const response = await STUDENT_API.get('/earnings');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== RATINGS ========================

/**
 * @desc    Get all ratings received by student
 * @returns {Array} Array of rating objects
 */
export const getStudentRatings = async () => {
    try {
        const response = await STUDENT_API.get('/ratings');
        return handleResponse(response);
    } catch (error) {
        console.error('getStudentRatings error:', error);
        return [];
    }
};

/**
 * @desc    Get rating summary (average, count, distribution)
 * @returns {Object} { averageRating, totalRatings, ratingDistribution }
 */
export const getStudentRatingsSummary = async () => {
    try {
        const response = await STUDENT_API.get('/ratings/summary');
        return handleResponse(response);
    } catch (error) {
        return {
            averageRating: 0,
            totalRatings: 0,
            ratingDistribution: { five: 0, four: 0, three: 0, two: 0, one: 0 }
        };
    }
};

export default {
    getStudentEarnings,
    getStudentRatings,
    getStudentRatingsSummary,
};
