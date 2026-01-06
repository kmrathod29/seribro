// src/apis/workSubmissionApi.js
import axiosInstance from './api';
import { API_URL } from './config';

const BASE_URL = `${API_URL}/workspace`;

const formatError = (error) => {
  const status = error?.response?.status || 0;
  const message = error?.response?.data?.message || error?.message || 'Something went wrong';
  return { success: false, status, message, data: null };
};

export const startWork = async (projectId) => {
  try {
    const res = await axiosInstance.post(`${BASE_URL}/projects/${projectId}/start-work`);
    return res.data;
  } catch (error) {
    return formatError(error);
  }
};

export const submitWork = async (projectId, formData, config = {}) => {
  try {
    const res = await axiosInstance.post(`${BASE_URL}/projects/${projectId}/submit-work`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
      timeout: Number(import.meta.env.VITE_UPLOAD_TIMEOUT_MS || 120000),
      ...config,
    });
    return res.data;
  } catch (error) {
    return formatError(error);
  }
};

export const getSubmissionHistory = async (projectId) => {
  try {
    const res = await axiosInstance.get(`${BASE_URL}/projects/${projectId}/submissions`);
    return res.data;
  } catch (error) {
    return formatError(error);
  }
};

export const getCurrentSubmission = async (projectId) => {
  try {
    const res = await axiosInstance.get(`${BASE_URL}/projects/${projectId}/submissions/current`);
    return res.data;
  } catch (error) {
    return formatError(error);
  }
};

export const approveWork = async (projectId, feedback) => {
  try {
    const res = await axiosInstance.post(`${BASE_URL}/projects/${projectId}/approve`, { feedback });
    return res.data;
  } catch (error) {
    return formatError(error);
  }
};

export const requestRevision = async (projectId, reason) => {
  try {
    const res = await axiosInstance.post(`${BASE_URL}/projects/${projectId}/request-revision`, { reason });
    return res.data;
  } catch (error) {
    return formatError(error);
  }
};

export const rejectWork = async (projectId, reason) => {
  try {
    const res = await axiosInstance.post(`${BASE_URL}/projects/${projectId}/reject`, { reason });
    return res.data;
  } catch (error) {
    return formatError(error);
  }
};

export default { startWork, submitWork, getSubmissionHistory, getCurrentSubmission, approveWork, requestRevision, rejectWork };
