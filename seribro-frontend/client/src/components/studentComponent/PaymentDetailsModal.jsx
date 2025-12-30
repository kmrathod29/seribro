// src/components/studentComponent/PaymentDetailsModal.jsx
// Payment Details Modal - Phase 5.5

import React from 'react';
import { X, DollarSign, Building2, Calendar, CreditCard, CheckCircle, FileText } from 'lucide-react';

const PaymentDetailsModal = ({ payment, isOpen, onClose }) => {
  if (!isOpen || !payment) return null;

  const formatCurrency = (amount) => {
    if (amount === null || amount === undefined) return '₹0';
    return `₹${parseInt(amount).toLocaleString('en-IN')}`;
  };

  const formatFullDate = (date) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'text-yellow-400 bg-yellow-500/20 border-yellow-500/30',
      captured: 'text-blue-400 bg-blue-500/20 border-blue-500/30',
      ready_for_release: 'text-orange-400 bg-orange-500/20 border-orange-500/30',
      released: 'text-green-400 bg-green-500/20 border-green-500/30',
      refunded: 'text-red-400 bg-red-500/20 border-red-500/30',
      failed: 'text-red-400 bg-red-500/20 border-red-500/30'
    };
    return colors[status] || colors.pending;
  };

  const paymentData = payment.payment || payment;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-0">
        <div className="bg-white/10 backdrop-blur-lg border border-white/20 rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="sticky top-0 bg-white/5 border-b border-white/10 px-6 py-4 flex items-center justify-between">
            <h2 className="text-xl font-semibold text-white">Payment Details</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 space-y-6">
            {/* Status Section */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Payment Status</p>
                  <p className={`inline-block px-4 py-2 rounded-full text-sm font-medium border ${getStatusColor(paymentData.status)}`}>
                    {paymentData.status.replace(/_/g, ' ').charAt(0).toUpperCase() + paymentData.status.replace(/_/g, ' ').slice(1)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-400 mb-1">Transaction ID</p>
                  <p className="font-mono text-sm text-gray-300 break-all">{paymentData.razorpayPaymentId || paymentData.razorpayOrderId || 'N/A'}</p>
                </div>
              </div>
            </div>

            {/* Amount Section */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Gross Amount</p>
                <p className="text-2xl font-bold text-white">{formatCurrency(paymentData.amount)}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Platform Fee</p>
                <p className="text-2xl font-bold text-amber-300">{formatCurrency(paymentData.platformFee || 0)}</p>
              </div>
            </div>

            {/* Net Amount */}
            <div className="bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-2">Net Amount (After Fee)</p>
              <p className="text-3xl font-bold text-green-300">{formatCurrency(paymentData.netAmount || (paymentData.amount - (paymentData.platformFee || 0)))}</p>
            </div>

            {/* Project Details */}
            {paymentData.project && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-start gap-3 mb-4">
                  <FileText className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-1">Project</p>
                    <p className="font-semibold text-white break-words">{paymentData.project.title || 'Unknown Project'}</p>
                    <p className="text-xs text-gray-500 mt-1">{paymentData.project.description?.substring(0, 100)}...</p>
                  </div>
                </div>
              </div>
            )}

            {/* Company Details */}
            {paymentData.company && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <Building2 className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-gray-400 mb-2">Company Information</p>
                    <div className="space-y-1">
                      <p className="font-semibold text-white">{paymentData.company.companyName || 'Unknown Company'}</p>
                      {paymentData.company.companyEmail && (
                        <p className="text-sm text-gray-400">
                          <span className="text-gray-500">Email:</span> {paymentData.company.companyEmail}
                        </p>
                      )}
                      {paymentData.company.companyPhone && (
                        <p className="text-sm text-gray-400">
                          <span className="text-gray-500">Phone:</span> {paymentData.company.companyPhone}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Timeline */}
            <div className="bg-white/5 border border-white/10 rounded-lg p-4">
              <h4 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Payment Timeline
              </h4>
              <div className="space-y-3">
                {/* Created */}
                <div className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                    <div className="w-0.5 h-12 bg-white/10" />
                  </div>
                  <div className="pb-3">
                    <p className="text-sm font-medium text-white">Payment Initiated</p>
                    <p className="text-xs text-gray-500 mt-1">{formatFullDate(paymentData.createdAt)}</p>
                  </div>
                </div>

                {/* Captured */}
                {paymentData.capturedAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-blue-500 mt-1.5" />
                      <div className="w-0.5 h-12 bg-white/10" />
                    </div>
                    <div className="pb-3">
                      <p className="text-sm font-medium text-white">Payment Captured</p>
                      <p className="text-xs text-gray-500 mt-1">{formatFullDate(paymentData.capturedAt)}</p>
                    </div>
                  </div>
                )}

                {/* Released */}
                {paymentData.releasedAt && (
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-3 h-3 rounded-full bg-green-500 mt-1.5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-white">Payment Released</p>
                      <p className="text-xs text-gray-500 mt-1">{formatFullDate(paymentData.releasedAt)}</p>
                      {paymentData.releaseMethod && (
                        <p className="text-xs text-gray-600 mt-1">Method: {paymentData.releaseMethod.replace(/_/g, ' ')}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Payment Method & Additional Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2 flex items-center gap-2">
                  <CreditCard className="w-4 h-4" />
                  Payment Method
                </p>
                <p className="text-white font-medium">{paymentData.paymentMethod || 'Razorpay'}</p>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Currency</p>
                <p className="text-white font-medium">{paymentData.currency || 'INR'}</p>
              </div>
            </div>

            {/* Release Notes */}
            {paymentData.releaseNotes && (
              <div className="bg-white/5 border border-white/10 rounded-lg p-4">
                <p className="text-sm text-gray-400 mb-2">Release Notes</p>
                <p className="text-gray-300 text-sm">{paymentData.releaseNotes}</p>
              </div>
            )}

            {/* Refund Info */}
            {paymentData.refundedAt && (
              <div className="bg-red-500/20 border border-red-500/30 rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="p-2 bg-red-500/20 rounded-lg flex-shrink-0">
                    <X className="w-4 h-4 text-red-400" />
                  </div>
                  <div className="flex-1">
                    <p className="font-semibold text-red-300 mb-2">Refund Information</p>
                    <div className="space-y-1 text-sm">
                      <p className="text-red-400">Refund Amount: {formatCurrency(paymentData.refundAmount)}</p>
                      <p className="text-red-400">Refund Reason: {paymentData.refundReason}</p>
                      <p className="text-red-400 text-xs">Refunded at: {formatFullDate(paymentData.refundedAt)}</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="sticky bottom-0 bg-white/5 border-t border-white/10 px-6 py-4 flex justify-end">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-blue-500/20 text-blue-300 border border-blue-500/50 rounded-lg hover:bg-blue-500/30 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </>
  );
};

export default PaymentDetailsModal;
