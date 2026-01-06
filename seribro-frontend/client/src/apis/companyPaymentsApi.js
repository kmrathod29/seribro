// frontend/src/apis/companyPaymentsApi.js
// Company Payments API Integration

import axios from 'axios';

import { API_URL } from './config';

const COMPANY_API = axios.create({
    baseURL: `${API_URL}/company`,
    withCredentials: true,
    timeout: 30000,
});

// Interceptor to add JWT token to all requests
COMPANY_API.interceptors.request.use(
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

// ======================== PAYMENTS ========================

/**
 * @desc    Get company payment history and statistics
 * @returns {Object} { summary, recentPayments, stats }
 */
export const getCompanyPayments = async () => {
    try {
        const response = await COMPANY_API.get('/payments');
        return handleResponse(response);
    } catch (error) {
        return handleError(error);
    }
};

// ======================== RATINGS ========================

/**
 * @desc    Get all ratings received by company
 * @returns {Array} Array of rating objects
 */
export const getCompanyRatings = async () => {
    try {
        const response = await COMPANY_API.get('/ratings');
        return handleResponse(response);
    } catch (error) {
        console.error('getCompanyRatings error:', error);
        return [];
    }
};

/**
 * @desc    Get rating summary (average, count, distribution)
 * @returns {Object} { averageRating, totalRatings, ratingDistribution }
 */
export const getCompanyRatingsSummary = async () => {
    try {
        const response = await COMPANY_API.get('/ratings/summary');
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
    getCompanyPayments,
    getCompanyRatings,
    getCompanyRatingsSummary,
};
