// src/apis/companyApplicationApi.js
// Company Application Management API calls - Phase 4.3

import axiosInstance from './api';
import { API_URL } from './config';

const API_BASE_URL = `${API_URL}/company/applications`;

// ============================================
// PROJECT APPLICATIONS
// ============================================

/**
 * Hinglish: Project ke applications fetch karo
 */
export const getProjectApplications = async (projectId, status = 'all', page = 1, limit = 20) => {
    const response = await axiosInstance.get(
        `${API_BASE_URL}/projects/${projectId}/applications`,
        {
            params: { status, page, limit },
        }
    );
    return response.data;
};

// ============================================
// ALL COMPANY APPLICATIONS
// ============================================

/**
 * Hinglish: Company ke sabhi applications fetch karo
 */
export const getAllApplications = async (page = 1, limit = 20, status = 'all', projectId = 'all') => {
    const response = await axiosInstance.get(`${API_BASE_URL}/all`, {
        params: { page, limit, status, projectId },
    });
    return response.data;
};

// ============================================
// SINGLE APPLICATION DETAILS
// ============================================

/**
 * Hinglish: Single application ki details fetch karo
 */
export const getApplicationDetails = async (applicationId) => {
    const response = await axiosInstance.get(`${API_BASE_URL}/${applicationId}`);
    return response.data;
};

// ============================================
// APPLICATION ACTIONS
// ============================================

/**
 * Hinglish: Application ko shortlist karo
 */
export const shortlistApplication = async (applicationId) => {
    const response = await axiosInstance.post(
        `${API_BASE_URL}/${applicationId}/shortlist`
    );
    return response.data;
};

/**
 * PART 6: Phase 4.5 - Approve student for project (assigns project, rejects others)
 * Hinglish: Application ko approve karo - project assign ho jayega
 */
export const approveStudentForProject = async (applicationId) => {
    const response = await axiosInstance.post(
        `${API_BASE_URL}/${applicationId}/approve`
    );
    return response.data;
};

/**
 * Hinglish: Application ko accept karo (Legacy - backward compatibility)
 */
export const acceptApplication = async (applicationId) => {
    const response = await axiosInstance.post(
        `${API_BASE_URL}/${applicationId}/accept`
    );
    return response.data;
};

/**
 * Hinglish: Application ko reject karo
 */
export const rejectApplication = async (applicationId, rejectionReason) => {
    const response = await axiosInstance.post(
        `${API_BASE_URL}/${applicationId}/reject`,
        { rejectionReason }
    );
    return response.data;
};

/**
 * Hinglish: Bulk applications reject karo
 */
export const bulkRejectApplications = async (applicationIds, rejectionReason) => {
    const response = await axiosInstance.post(
        `${API_BASE_URL}/bulk-reject`,
        { applicationIds, rejectionReason }
    );
    return response.data;
};

// ============================================
// STATISTICS
// ============================================

/**
 * Hinglish: Applications ka stats fetch karo
 */
export const getApplicationStats = async () => {
    const response = await axiosInstance.get(`${API_BASE_URL}/stats`);
    return response.data;
};

/**
 * Hinglish: Delete an application (only by company owner/admin)
 */
export const deleteApplication = async (applicationId) => {
    const response = await axiosInstance.delete(`${API_BASE_URL}/${applicationId}`);
    return response.data;
};
