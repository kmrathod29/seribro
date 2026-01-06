// src/apis/adminApplicationApi.js
// Admin Application Monitoring API calls - Phase 2.1

import API from './api';
import { API_URL } from './config';

const API_BASE_URL = `${API_URL}/admin/applications`;

// ============================================
// APPLICATION STATS
// ============================================

/**
 * Hinglish: Applications ke statistics nikalo
 */
export const getApplicationStats = async () => {
  try {
    const response = await API.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ALL APPLICATIONS
// ============================================

/**
 * Hinglish: Sabhi applications nikalo filters ke saath
 */
export const getAllApplications = async (filters = {}) => {
  try {
    const {
      projectId,
      studentUserId,
      status,
      companyId,
      page = 1,
      limit = 20
    } = filters;

    const response = await API.get(`${API_BASE_URL}/all`, {
      params: {
        projectId,
        studentUserId,
        status,
        companyId,
        page,
        limit
      }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// APPLICATION DETAILS
// ============================================

/**
 * Hinglish: Single application ka full details - student profile ke saath
 */
export const getApplicationDetails = async (applicationId) => {
  try {
    const response = await API.get(`${API_BASE_URL}/${applicationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
