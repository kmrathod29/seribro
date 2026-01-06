// src/apis/adminProjectApi.js
// Admin Project Monitoring API calls - Phase 2.1

import API from './api';
import { API_URL } from './config';

const API_BASE_URL = `${API_URL}/admin/projects`;

// ============================================
// PROJECT STATS
// ============================================

/**
 * Hinglish: Project ke statistics nikalo - total, by status, etc
 */
export const getProjectStats = async () => {
  try {
    const response = await API.get(`${API_BASE_URL}/stats`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// ALL PROJECTS
// ============================================

/**
 * Hinglish: Sabhi projects nikalo filters ke saath
 */
export const getAllProjects = async (filters = {}) => {
  try {
    const {
      status,
      companyId,
      startDate,
      endDate,
      minBudget,
      maxBudget,
      page = 1,
      limit = 20
    } = filters;

    const response = await API.get(`${API_BASE_URL}/all`, {
      params: {
        status,
        companyId,
        startDate,
        endDate,
        minBudget,
        maxBudget,
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
// PROJECT DETAILS
// ============================================

/**
 * Hinglish: Single project ka detailed view
 */
export const getProjectDetails = async (projectId) => {
  try {
    const response = await API.get(`${API_BASE_URL}/${projectId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// PROJECT APPLICATIONS
// ============================================

/**
 * Hinglish: Specific project ke sabhi applications
 */
export const getProjectApplications = async (projectId, page = 1, limit = 20) => {
  try {
    const response = await API.get(`${API_BASE_URL}/${projectId}/applications`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
