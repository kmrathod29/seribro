import axios from './api';

const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000') + '/api/payments';

export const createOrder = async (data) => {
  try {
    const res = await axios.post(`${BASE}/create-order`, data);
    return res.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const verifyPayment = async (payload) => {
  try {
    const res = await axios.post(`${BASE}/verify`, payload);
    return res.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const getPendingReleases = async (page = 1) => {
  try {
    const res = await axios.get(`${BASE}/admin/pending-releases?page=${page}`);
    return res.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const releasePayment = async (paymentId, data) => {
  try {
    const res = await axios.post(`${BASE}/admin/${paymentId}/release`, data);
    return res.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const refundPayment = async (paymentId, data) => {
  try {
    const res = await axios.post(`${BASE}/admin/${paymentId}/refund`, data);
    return res.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const getStudentEarnings = async () => {
  try {
    const res = await axios.get(`${BASE}/student/earnings`);
    return res.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export default { createOrder, verifyPayment, getPendingReleases, releasePayment, refundPayment, getStudentEarnings };