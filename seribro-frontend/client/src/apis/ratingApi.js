import axios from './api';
const BASE = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:7000') + '/api/ratings';

export const rateStudent = async (projectId, body) => {
  try { const res = await axios.post(`${BASE}/projects/${projectId}/rate-student`, body); return res.data; } catch (err) { return { success:false, message: err?.response?.data?.message || err.message }; }
};

export const rateCompany = async (projectId, body) => {
  try { const res = await axios.post(`${BASE}/projects/${projectId}/rate-company`, body); return res.data; } catch (err) { return { success:false, message: err?.response?.data?.message || err.message }; }
};

export const getProjectRating = async (projectId) => {
  try { const res = await axios.get(`${BASE}/projects/${projectId}`); return res.data; } catch (err) { return { success:false, message: err?.response?.data?.message || err.message }; }
};

export default { rateStudent, rateCompany, getProjectRating };
