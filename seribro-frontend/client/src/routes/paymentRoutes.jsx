// src/routes/paymentRoutes.jsx
// Payment & Rating Routes Configuration

import React from 'react';
import StudentPaymentPage from '@/pages/StudentPaymentPage';
import AdminPaymentPage from '@/pages/AdminPaymentPage';
import PaymentVerificationPage from '@/pages/PaymentVerificationPage';
import RatingPage from '@/pages/RatingPage';
import ProtectedRoute from '@/components/ProtectedRoute';

// Payment Routes Configuration
export const paymentRoutes = [
  {
    path: '/student/payments',
    element: (
      <ProtectedRoute requiredRole="student">
        <StudentPaymentPage />
      </ProtectedRoute>
    ),
    name: 'Student Payments',
    description: 'View earnings and payment history',
    breadcrumb: 'Payments'
  },
  {
    path: '/admin/payments',
    element: (
      <ProtectedRoute requiredRole="admin">
        <AdminPaymentPage />
      </ProtectedRoute>
    ),
    name: 'Admin Payments',
    description: 'Manage and release pending payments',
    breadcrumb: 'Payments'
  },
  {
    path: '/payments/verify',
    element: (
      <ProtectedRoute requiredRole="company">
        <PaymentVerificationPage />
      </ProtectedRoute>
    ),
    name: 'Verify Payment',
    description: 'Verify Razorpay payments',
    breadcrumb: 'Verify Payment'
  },
  {
    path: '/workspace/projects/:projectId/rating',
    element: (
      <ProtectedRoute requiredRole="student">
        <RatingPage />
      </ProtectedRoute>
    ),
    name: 'Rate Project',
    description: 'Rate and review project experience',
    breadcrumb: 'Rating'
  }
];

export default paymentRoutes;
