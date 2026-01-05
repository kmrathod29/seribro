// Centralized API base resolver for frontend
// Resolves in this priority:
// 1. VITE_API_URL (recommended for production, can be '/api')
// 2. VITE_API_BASE_URL (e.g., http://localhost:7000)
// 3. Fallback to http://localhost:7000/api for dev

const API_BASE = (() => {
  const apiUrl = import.meta.env.VITE_API_URL;
  const apiBase = import.meta.env.VITE_API_BASE_URL;

  if (apiUrl) return apiUrl.replace(/\/$/, '');

  if (apiBase) {
    const trimmed = apiBase.replace(/\/$/, '');
    // If user provided base like http://host:port, append /api
    return trimmed.endsWith('/api') ? trimmed : `${trimmed}/api`;
  }

  return 'http://localhost:7000/api';
})();

export default API_BASE;
