import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';

// Helper to decode JWT payload without extra libs
const decodeJwt = (token) => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const decoded = decodeURIComponent(
      atob(payload)
        .split('')
        .map(function (c) {
          return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join('')
    );
    return JSON.parse(decoded);
  } catch (err) {
    console.error('Failed to decode JWT', err);
    return null;
  }
};

const GoogleSuccess = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const token = searchParams.get('token');
    if (!token) {
      // No token — go to login
      navigate('/login', { replace: true });
      return;
    }

    // Persist token in localStorage under the canonical key 'token'
    try {
      localStorage.setItem('token', token);
      // notify other parts of the app in the same window
  try { window.dispatchEvent(new Event('authChanged')); } catch { void 0; }
    } catch (err) {
      console.error('Failed to store token in localStorage', err);
    }

    // Optionally extract role and redirect to role-specific dashboard
    const payload = decodeJwt(token);
    const role = payload?.role || null;

    if (role === 'student') navigate('/student/dashboard', { replace: true });
    else if (role === 'company') navigate('/company/dashboard', { replace: true });
    else if (role === 'admin') navigate('/admin/dashboard', { replace: true });
    else navigate('/dashboard', { replace: true });
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h2 className="text-lg font-semibold">Signing you in…</h2>
        <p className="text-sm text-gray-600 mt-2">Finalizing authentication and redirecting to your dashboard.</p>
      </div>
    </div>
  );
};

export default GoogleSuccess;
