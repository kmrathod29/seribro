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

export const getPendingReleases = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    queryParams.append('page', params.page || 1);
    queryParams.append('limit', params.limit || 20);
    
    if (params.dateRange) queryParams.append('dateRange', params.dateRange);
    if (params.searchQuery) queryParams.append('search', params.searchQuery);
    if (params.sortBy) queryParams.append('sortBy', params.sortBy);
    
    const res = await axios.get(`${BASE}/admin/pending-releases?${queryParams.toString()}`);
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

export const getPaymentDetails = async (paymentId) => {
  try {
    const res = await axios.get(`${BASE}/${paymentId}`);
    return res.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export const bulkReleasePayments = async (paymentIds, data) => {
  try {
    const res = await axios.post(`${BASE}/admin/bulk-release`, {
      paymentIds,
      ...data
    });
    return res.data;
  } catch (err) {
    return { success: false, message: err?.response?.data?.message || err.message };
  }
};

export default { 
  createOrder, 
  verifyPayment, 
  getPendingReleases, 
  releasePayment, 
  refundPayment, 
  getStudentEarnings,
  getPaymentDetails,
  bulkReleasePayments
};