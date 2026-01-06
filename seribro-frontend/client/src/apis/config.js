// Centralized API and Socket config for the frontend ✅
// Env var precedence (searches multiple common names for compatibility):
// 1) Vite: VITE_API_URL (full URL or '/api') or VITE_API_BASE_URL (host)
// 2) Vite: VITE_SOCKET_URL or VITE_BACKEND_URL
// 3) CRA-style provided by Vercel or other systems: process.env.REACT_APP_BACKEND_URL / process.env.REACT_APP_API_URL / process.env.REACT_APP_SOCKET_URL
// 4) Fallback to http://localhost:7000
//
// Use `API_BASE_URL` for the backend host (no trailing slash),
// `API_URL` for the API root (including `/api`), and
// `SOCKET_BASE_URL` for socket connections.
// To change the target backend, update your environment variables (VITE_* or REACT_APP_*), not the source code.

const _rawApi = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_API_URL;
const API_BASE_URL = _rawApi ? _rawApi.replace(/\/$/, '') : 'http://localhost:7000';
// API_URL is the base + /api (avoid double slashes)
const API_URL = API_BASE_URL.endsWith('/api') ? API_BASE_URL : `${API_BASE_URL}/api`;

const SOCKET_BASE_URL = import.meta.env.VITE_SOCKET_URL || import.meta.env.VITE_BACKEND_URL || import.meta.env.VITE_API_BASE_URL || import.meta.env.REACT_APP_SOCKET_URL || import.meta.env.REACT_APP_BACKEND_URL || import.meta.env.REACT_APP_API_URL || 'http://localhost:7000';

// Public client-side keys
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_OAUTH_CLIENT_ID || import.meta.env.VITE_GOOGLE_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID || import.meta.env.REACT_APP_GOOGLE_CLIENT_ID || '';
const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID || import.meta.env.REACT_APP_RAZORPAY_KEY_ID || '';

export { API_BASE_URL, API_URL, SOCKET_BASE_URL, GOOGLE_CLIENT_ID, RAZORPAY_KEY_ID };

