// src/apis/notificationApi.js
// Notification Management API calls - Phase 2.1

import API from './api';

import { API_URL } from './config';

const API_BASE_URL = `${API_URL}/notifications`;

// ============================================
// GET NOTIFICATIONS
// ============================================

/**
 * Hinglish: User ke sabhi notifications fetch karo
 */
export const getNotifications = async (page = 1, limit = 20) => {
  try {
    const response = await API.get(`${API_BASE_URL}`, {
      params: { page, limit }
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// UNREAD COUNT
// ============================================

/**
 * Hinglish: Unread notifications count
 */
export const getUnreadCount = async () => {
  try {
    const response = await API.get(`${API_BASE_URL}/unread/count`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// MARK AS READ
// ============================================

/**
 * Hinglish: Single notification ko read mark karo
 */
export const markAsRead = async (notificationId) => {
  try {
    const response = await API.put(`${API_BASE_URL}/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Hinglish: Sab notifications ko read mark karo
 */
export const markAllAsRead = async () => {
  try {
    const response = await API.put(`${API_BASE_URL}/read-all`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// ============================================
// DELETE NOTIFICATIONS
// ============================================

/**
 * Hinglish: Single notification delete karo
 */
export const deleteNotification = async (notificationId) => {
  try {
    const response = await API.delete(`${API_BASE_URL}/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * Hinglish: Read notifications delete karo
 */
export const deleteReadNotifications = async () => {
  try {
    const response = await API.delete(`${API_BASE_URL}/delete-read`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
