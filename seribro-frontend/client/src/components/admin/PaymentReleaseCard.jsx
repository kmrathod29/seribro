// src/components/admin/PaymentReleaseCard.jsx
// Admin payment release card component - Phase 5.4.8

import React, { useState } from 'react';
import { ExternalLink, ChevronDown, ChevronUp, Clock, AlertCircle, CheckCircle, DollarSign } from 'lucide-react';

/**
 * PaymentReleaseCard Component
 * Displays payment information for admin with quick action buttons and expandable history
 * Color-codes based on pending duration
 * 
 * @param {Object} payment - Payment data
 * @param {string} payment.companyLogo - Company logo URL
 * @param {string} payment.companyName - Company name
 * @param {string} payment.projectTitle - Project title
 * @param {string} payment.projectId - Project ID for navigation
 * @param {string} payment.studentName - Student name
 * @param {string} payment.studentId - Student ID
 * @param {number} payment.amount - Payment amount
 * @param {Date} payment.releaseReadySince - Date when payment became ready for release
 * @param {Array} payment.paymentHistory - Array of payment history entries
 * @param {Function} onRelease - Callback when release button is clicked
 * @param {Function} onViewProject - Callback when view project is clicked (optional)
 */
const PaymentReleaseCard = ({ 
  payment = {}, 
  onRelease = () => {},
  onViewProject = () => {}
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const {
    companyLogo = '',
    companyName = 'Unknown Company',
    projectTitle = 'Untitled Project',
    projectId = '',
    studentName = 'Unknown Student',
    studentId = '',
    amount = 0,
    releaseReadySince = new Date(),
    paymentHistory = []
  } = payment;

  // Calculate days pending
  const calculateDaysPending = () => {
    const now = new Date();
    const readyDate = new Date(releaseReadySince);
    const diffMs = now - readyDate;
    return Math.floor(diffMs / (1000 * 60 * 60 * 24));
  };

  const daysPending = calculateDaysPending();

  // Determine color coding based on pending duration
  const getPendingColorStyle = () => {
    if (daysPending < 1) {
      return {
        bg: 'bg-green-500/20',
        border: 'border-green-500/30',
        text: 'text-green-300',
        badge: 'bg-green-500/30 text-green-300'
      };
    } else if (daysPending <= 3) {
      return {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500/30',
        text: 'text-yellow-300',
        badge: 'bg-yellow-500/30 text-yellow-300'
      };
    } else {
      return {
        bg: 'bg-red-500/20',
        border: 'border-red-500/30',
        text: 'text-red-300',
        badge: 'bg-red-500/30 text-red-300'
      };
    }
  };

  const colorStyle = getPendingColorStyle();

  // Format currency
  const formatCurrency = (amount) => `₹${parseInt(amount).toLocaleString('en-IN')}`;

  // Format date
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Format time
  const formatDateTime = (date) => {
    const d = new Date(date);
    return d.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Get pending duration label
  const getPendingLabel = () => {
    if (daysPending === 0) return 'Less than 24 hours';
    if (daysPending === 1) return '1 day';
    return `${daysPending} days`;
  };

  return (
    <div className={`border rounded-lg backdrop-blur-sm transition-all duration-300 ${colorStyle.bg} ${colorStyle.border}`}>
      {/* Main Card Content */}
      <div className="p-6">
        {/* Header Row - Company Logo, Project, Student */}
        <div className="flex items-start gap-4 mb-4">
          {companyLogo && (
            <img
              src={companyLogo}
              alt={companyName}
              className="w-12 h-12 rounded-lg object-cover border border-gold/20"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          )}
          
          <div className="flex-1 min-w-0">
            <p className="text-xs text-gray-500 mb-1">Company</p>
            <p className="text-sm font-semibold text-white mb-3">{companyName}</p>
            
            <p className="text-xs text-gray-500 mb-1">Project</p>
            <p className="text-sm font-semibold text-white mb-3 line-clamp-1">{projectTitle}</p>
            
            <p className="text-xs text-gray-500 mb-1">Student</p>
            <p className="text-sm font-semibold text-white">{studentName}</p>
          </div>

          {/* Amount Display */}
          <div className="text-right">
            <div className="flex items-center justify-end gap-1 mb-2">
              <DollarSign className="w-5 h-5 text-gold" />
              <span className="text-3xl font-bold text-gold">{formatCurrency(amount)}</span>
            </div>
          </div>
        </div>

        {/* Pending Duration Section */}
        <div className={`px-3 py-2 rounded-lg mb-4 flex items-center gap-2 ${colorStyle.badge}`}>
          <Clock className="w-4 h-4" />
          <div className="flex-1">
            <p className="text-xs font-semibold">Ready for Release Since</p>
            <p className="text-xs opacity-90">
              {formatDate(releaseReadySince)} ({getPendingLabel()})
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
          {/* View Project Button */}
          <button
            onClick={() => onViewProject({ projectId, studentId })}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 border border-blue-500/30 rounded-lg transition-all duration-300 text-sm font-semibold"
          >
            <ExternalLink className="w-4 h-4" />
            View Project
          </button>

          {/* View Details Button */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center justify-center gap-2 px-3 py-2 bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 rounded-lg transition-all duration-300 text-sm font-semibold"
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            Details
          </button>

          {/* Release Payment Button */}
          <button
            onClick={() => onRelease(payment)}
            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 text-sm font-semibold border ${
              daysPending > 3
                ? 'bg-red-500/30 hover:bg-red-500/40 text-red-300 border-red-500/30'
                : 'bg-green-500/20 hover:bg-green-500/30 text-green-300 border-green-500/30'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            Release
          </button>
        </div>

        {/* Expandable Payment History */}
        {isExpanded && (
          <div className="border-t border-gray-700 pt-4 mt-4">
            <h4 className="text-sm font-semibold text-white mb-3">Payment History</h4>
            
            {paymentHistory && paymentHistory.length > 0 ? (
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {paymentHistory.map((entry, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-2 rounded bg-white/5 text-xs text-gray-400"
                  >
                    <div className="mt-1">
                      {entry.status === 'completed' && (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      )}
                      {entry.status === 'pending' && (
                        <Clock className="w-4 h-4 text-yellow-400" />
                      )}
                      {entry.status === 'failed' && (
                        <AlertCircle className="w-4 h-4 text-red-400" />
                      )}
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-gray-300">
                        {entry.status.charAt(0).toUpperCase() + entry.status.slice(1)}
                      </p>
                      <p className="text-gray-500">
                        {formatDateTime(entry.timestamp)}
                      </p>
                      {entry.notes && (
                        <p className="text-gray-600 mt-1">{entry.notes}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-500 italic">No payment history available</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentReleaseCard;
