// src/apis/workspaceApi.js
// Workspace APIs - Phase 5.1

import axiosInstance from './api';

const BASE_URL = import.meta.env.VITE_API_BASE_URL ? `${import.meta.env.VITE_API_BASE_URL}/workspace` : 'http://localhost:7000/api/workspace';

const formatError = (error) => {
    const status = error?.response?.status || 0;
    const message =
        error?.response?.data?.message ||
        error?.message ||
        'Something went wrong';
    return { success: false, status, message, data: null };
};

export const getWorkspaceOverview = async (projectId) => {
    try {
        const res = await axiosInstance.get(`${BASE_URL}/projects/${projectId}`);
        return res.data;
    } catch (error) {
        return formatError(error);
    }
};

export const getMessages = async (projectId, page = 1, limit = 20) => {
    try {
        const res = await axiosInstance.get(
            `${BASE_URL}/projects/${projectId}/messages`,
            { params: { page, limit } }
        );
        return res.data;
    } catch (error) {
        return formatError(error);
    }
};

export const sendMessage = async (projectId, { text, files = [] }) => {
    try {
        const formData = new FormData();
        formData.append('message', text);
        files.slice(0, 3).forEach((file) => formData.append('attachments', file));

        const res = await axiosInstance.post(
            `${BASE_URL}/projects/${projectId}/messages`,
            formData,
            {
                headers: { 'Content-Type': 'multipart/form-data' },
                timeout: 60000,
                withCredentials: true,
            }
        );
        return res.data;
    } catch (error) {
        return formatError(error);
    }
};

export const markMessagesAsRead = async (projectId) => {
    try {
        const res = await axiosInstance.put(`${BASE_URL}/projects/${projectId}/messages/read`);
        return res.data;
    } catch (error) {
        return formatError(error);
    }
};

export default {
    getWorkspaceOverview,
    getMessages,
    sendMessage,
    markMessagesAsRead,
};

