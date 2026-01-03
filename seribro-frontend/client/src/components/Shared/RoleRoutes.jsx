import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';

// Small helper to decode JWT payload (no external deps)
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

function RoleRoute({ children, allowedRoles = [] }) {
  const [checking, setChecking] = useState(true);
  const [authorized, setAuthorized] = useState(false);
  const [unauthorizedReason, setUnauthorizedReason] = useState(null);

  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setUnauthorizedReason('no-token');
        setChecking(false);
        return;
      }

      const payload = decodeJwt(token);
      if (!payload) {
        setUnauthorizedReason('invalid-token');
        setChecking(false);
        return;
      }

      const role = payload.role;
      if (!allowedRoles || allowedRoles.length === 0) {
        setAuthorized(true);
      } else if (allowedRoles.includes(role)) {
        setAuthorized(true);
      } else {
        setUnauthorizedReason('role-mismatch');
      }
    } catch (err) {
      console.error('RoleRoute check failed', err);
      setUnauthorizedReason('error');
    } finally {
      setChecking(false);
    }
  }, [allowedRoles]);

  if (checking) {
    // Prevent redirect until we've checked localStorage
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="w-12 h-12 border-4 border-slate-600 border-t-amber-400 rounded-full animate-spin mx-auto" />
          <p className="text-sm text-gray-300">Checking authentication…</p>
        </div>
      </div>
    );
  }

  if (!authorized) {
    // Redirect to login when token missing/invalid
    return <Navigate to="/login" replace />;
  }

  return children;
}

export const AdminRoute = ({ children }) => (
  <RoleRoute allowedRoles={["admin"]}>{children}</RoleRoute>
);

export const StudentRoute = ({ children }) => (
  <RoleRoute allowedRoles={["student"]}>{children}</RoleRoute>
);

export const CompanyRoute = ({ children }) => (
  <RoleRoute allowedRoles={["company"]}>{children}</RoleRoute>
);

export default RoleRoute;
