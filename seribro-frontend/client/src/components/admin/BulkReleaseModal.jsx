// src/components/admin/BulkReleaseModal.jsx
// Confirmation modal for bulk releasing payments

import React, { useState } from 'react';
import { X, AlertTriangle, DollarSign, CheckCircle } from 'lucide-react';

const BulkReleaseModal = ({ paymentCount, totalAmount, isLoading, onConfirm, onClose }) => {
  const [method, setMethod] = useState('manual_transfer');
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    if (isLoading) return;
    onConfirm({ method, notes });
  };

  const formatCurrency = (amount) => `₹${parseInt(amount).toLocaleString('en-IN')}`;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-slate-800 border border-white/10 rounded-lg max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-slate-800 border-b border-white/10 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Bulk Release Payments</h2>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Bulk Summary */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-4 uppercase tracking-wider">
              Release Summary
            </h3>
            <div className="bg-slate-700/50 border border-white/5 rounded-lg p-4 space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-blue-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Payments to Release</p>
                  <p className="text-2xl font-bold text-white">{paymentCount}</p>
                </div>
              </div>

              <div className="border-t border-white/10 pt-4 flex items-center gap-3">
                <DollarSign className="w-5 h-5 text-green-400 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-gray-400 text-sm">Total Amount</p>
                  <p className="text-2xl font-bold text-green-400">
                    {formatCurrency(totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Warning */}
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-red-300 font-semibold text-sm">Bulk action - cannot be undone</p>
              <p className="text-red-400 text-xs mt-1">
                All {paymentCount} payment{paymentCount > 1 ? 's' : ''} will be released simultaneously. Any failures will be noted for your review.
              </p>
            </div>
          </div>

          {/* Release Method */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-3">
              Release Method
            </label>
            <div className="space-y-2">
              <label className="flex items-center gap-3 p-3 bg-slate-700/30 border border-white/5 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input
                  type="radio"
                  name="method"
                  value="razorpay_payout"
                  checked={method === 'razorpay_payout'}
                  onChange={(e) => setMethod(e.target.value)}
                  disabled={isLoading}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <div>
                  <p className="text-white font-medium">Razorpay Payout</p>
                  <p className="text-gray-400 text-xs">Automatic batch transfer via Razorpay</p>
                </div>
              </label>

              <label className="flex items-center gap-3 p-3 bg-slate-700/30 border border-white/5 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors">
                <input
                  type="radio"
                  name="method"
                  value="manual_transfer"
                  checked={method === 'manual_transfer'}
                  onChange={(e) => setMethod(e.target.value)}
                  disabled={isLoading}
                  className="w-4 h-4 accent-blue-500 cursor-pointer"
                />
                <div>
                  <p className="text-white font-medium">Manual Transfer</p>
                  <p className="text-gray-400 text-xs">Mark all as released for manual admin transfer</p>
                </div>
              </label>
            </div>
          </div>

          {/* Optional Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-300 mb-2">
              Optional Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              disabled={isLoading}
              placeholder="Add notes about this bulk release (applied to all payments)..."
              className="w-full bg-slate-700 border border-white/10 text-white rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500 placeholder:text-gray-500"
              rows="3"
            />
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-slate-800 border-t border-white/10 px-6 py-4 flex gap-3 justify-end">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 text-white rounded font-medium transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={isLoading}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded font-medium transition-colors flex items-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="inline-block animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Processing...
              </>
            ) : (
              `Release ${paymentCount} Payments`
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BulkReleaseModal;
