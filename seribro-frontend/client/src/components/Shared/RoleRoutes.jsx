import React from 'react';
import { Navigate } from 'react-router-dom';
import { getLoggedInUser } from '../../utils/authUtils';

function RoleRoute({ children, allowedRoles = [] }) {
  try {
    const user = getLoggedInUser();
    // If no user found, redirect to login
    if (!user) return <Navigate to="/login" replace />;

    // If role not allowed, show an unauthorized placeholder
    if (!allowedRoles.includes(user.role)) {
      return (
        <div className="p-6">
          <h3 className="text-lg font-semibold">Unauthorized</h3>
          <p className="text-sm text-gray-600">You do not have permission to view this page.</p>
        </div>
      );
    }

    return children;
  } catch {
    // On parse/other errors, redirect to login
    return <Navigate to="/login" replace />;
  }
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
