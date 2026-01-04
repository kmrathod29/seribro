// src/components/payment/PaymentSummary.jsx
// Payment breakdown summary component - Phase 5.4.8

import React from 'react';
import { IndianRupee, Receipt, CheckCircle, Clock, AlertCircle } from 'lucide-react';

/**
 * PaymentSummary Component
 * Displays payment breakdown with base amount, platform fee, and total
 * 
 * @param {Object} payment - Payment data object
 * @param {string} payment.projectName - Name of the project
 * @param {string} payment.studentName - Name of the student
 * @param {number} payment.baseAmount - Base payment amount
 * @param {number} payment.platformFeePercentage - Platform fee percentage (default 5-10%)
 * @param {string} payment.status - Payment status (pending, completed, released, failed)
 * @param {Date} payment.timestamp - Payment timestamp
 * @param {string} payment.paymentId - Payment transaction ID (optional)
 */
const PaymentSummary = ({ payment = {}, baseAmount: propBaseAmount, platformFee: propPlatformFee, totalAmount: propTotalAmount, platformFeePercentage: propPlatformFeePercentage }) => {
  const paymentObj = payment || {};
  const projectName = paymentObj.projectName || 'N/A';
  const studentName = paymentObj.studentName || 'N/A';

  // Prefer direct props if provided, otherwise fall back to payment object
  const baseAmount = Number(propBaseAmount ?? paymentObj.baseAmount ?? 0);
  // Platform fee percentage (explicit prop or from payment object, default 5)
  const platformFeePercentage = Number(propPlatformFeePercentage ?? paymentObj.platformFeePercentage ?? 5);
  // Prefer explicit platformFee if provided; otherwise compute from percentage
  const platformFee = Number(propPlatformFee ?? paymentObj.platformFee ?? Math.round((baseAmount * platformFeePercentage) / 100));
  const totalAmount = Number(propTotalAmount ?? paymentObj.totalAmount ?? (baseAmount + platformFee));

  const status = paymentObj.status || 'pending';
  const timestamp = paymentObj.timestamp || new Date();
  const paymentId = paymentObj.paymentId || '';

  // Format currency with Indian locale
  const formatCurrency = (amount) => `₹${parseInt(amount).toLocaleString('en-IN')}`;

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Status badge styling
  const getStatusStyles = () => {
    const statusStyles = {
      pending: {
        bg: 'bg-yellow-500/20',
        text: 'text-yellow-300',
        border: 'border-yellow-500/30',
        icon: Clock
      },
      completed: {
        bg: 'bg-blue-500/20',
        text: 'text-blue-300',
        border: 'border-blue-500/30',
        icon: IndianRupee
      },
      released: {
        bg: 'bg-green-500/20',
        text: 'text-green-300',
        border: 'border-green-500/30',
        icon: CheckCircle
      },
      failed: {
        bg: 'bg-red-500/20',
        text: 'text-red-300',
        border: 'border-red-500/30',
        icon: AlertCircle
      }
    };
    return statusStyles[status] || statusStyles.pending;
  };

  const statusStyle = getStatusStyles();
  const StatusIcon = statusStyle.icon;

  return (
    <div className="bg-gradient-to-br from-navy/50 to-navy/30 border border-gold/20 rounded-lg p-6 backdrop-blur-sm">
      {/* Header with Project and Student Info */}
      <div className="mb-6 pb-4 border-b border-gray-700">
        <h2 className="text-lg font-bold text-white mb-3">Payment Summary</h2>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-500 mb-1">Project</p>
            <p className="text-sm font-semibold text-white">{projectName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-1">Student</p>
            <p className="text-sm font-semibold text-white">{studentName}</p>
          </div>
        </div>
      </div>

      {/* Payment Breakdown */}
      <div className="space-y-3 mb-6 py-4 border-b border-gray-700">
        {/* Base Amount */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <IndianRupee className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">Base Amount</span>
          </div>
          <span className="text-sm font-semibold text-white">{formatCurrency(baseAmount)}</span>
        </div>

        {/* Platform Fee */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Receipt className="w-4 h-4 text-gray-500" />
            <span className="text-sm text-gray-400">
              Platform Fee ({platformFeePercentage}%)
            </span>
          </div>
          <span className="text-sm font-semibold text-gold">{formatCurrency(platformFee)}</span>
        </div>

        {/* Divider */}
        <div className="h-px bg-gray-700 my-2"></div>

        {/* Total Amount */}
        <div className="flex justify-between items-center pt-2">
          <span className="text-base font-bold text-white">Total Amount</span>
          <span className="text-lg font-bold text-gold">{formatCurrency(totalAmount)}</span>
        </div>
      </div>

      {/* Footer Status and Timestamp */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 ${statusStyle.bg} ${statusStyle.border} ${statusStyle.text}`}>
            <StatusIcon className="w-3 h-3" />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </div>
        </div>
        
        <div className="text-right">
          <p className="text-xs text-gray-500">
            {formatDate(timestamp)}
          </p>
          {paymentId && (
            <p className="text-xs text-gray-600 mt-1">
              ID: {paymentId.substring(0, 8)}...
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentSummary;
