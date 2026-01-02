// src/components/workspace/ActionModals.jsx
// Sub-Phase 5.4.5: Action Confirmation Modals

import React, { useState } from 'react';
import { X, AlertTriangle } from 'lucide-react';

/**
 * ApproveModal - Modal for approving work with optional feedback
 */
export const ApproveModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(feedback);
    setFeedback('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-green-600/50 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-green-600/30 bg-green-600/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">✅</span>
            <h3 className="text-lg font-bold text-green-400">Approve Work</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-200 disabled:opacity-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
            <p className="text-sm text-green-300 font-medium">
              ✓ This action will approve the submission and initiate the payment release process.
            </p>
          </div>

          <p className="text-gray-300">
            Are you sure you want to approve this submission? This action will move the project to "Completed" status.
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Feedback (Optional)
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Add optional feedback for the student..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-green-400"
              rows={4}
              disabled={loading}
            />
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Processing...
              </>
            ) : (
              <>✅ Approve</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * RevisionModal - Modal for requesting revision with required feedback
 */
export const RevisionModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [feedback, setFeedback] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(feedback);
    setFeedback('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const isValid = feedback.trim().length >= 10;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-yellow-600/50 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-yellow-600/30 bg-yellow-600/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">🔄</span>
            <h3 className="text-lg font-bold text-yellow-400">Request Revision</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-200 disabled:opacity-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
            <p className="text-sm text-yellow-300 font-medium">
              ⚠️ The student will have <strong>remaining revisions</strong> to address your feedback. Provide clear, actionable instructions.
            </p>
          </div>

          <p className="text-gray-300">
            Provide detailed feedback on what needs to be revised.
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Revision Instructions <span className="text-red-400">*</span>
            </label>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Describe what needs to be revised and why. Be as specific as possible..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-yellow-400"
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Minimum 10 characters required ({feedback.length}/10)
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !isValid}
            className="flex-1 px-4 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50 transition-colors font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Processing...
              </>
            ) : (
              <>🔄 Request Revision</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * RejectModal - Modal for rejecting work with required reason
 */
export const RejectModal = ({ isOpen, onClose, onConfirm, loading }) => {
  const [reason, setReason] = useState('');

  if (!isOpen) {
    return null;
  }

  const handleConfirm = () => {
    onConfirm(reason);
    setReason('');
  };

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget && !loading) {
      onClose();
    }
  };

  const isValid = reason.trim().length >= 20;

  return (
    <div
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4"
      onClick={handleBackdropClick}
    >
      <div className="bg-gray-900 border border-red-600/50 rounded-lg shadow-xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-red-600/30 bg-red-600/10">
          <div className="flex items-center gap-3">
            <span className="text-3xl">❌</span>
            <h3 className="text-lg font-bold text-red-400">Reject Work</h3>
          </div>
          <button
            onClick={onClose}
            disabled={loading}
            className="text-gray-400 hover:text-gray-200 disabled:opacity-50 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-sm text-red-300 font-medium">
              ⚠️ <strong>Warning:</strong> Rejecting this submission will mark the project as disputed and cannot be easily undone. Provide a clear, detailed reason.
            </p>
          </div>

          <p className="text-gray-300">
            Provide a detailed reason for rejecting this submission. This will be visible to the student.
          </p>

          <div>
            <label className="block text-sm font-semibold text-gray-200 mb-2">
              Rejection Reason <span className="text-red-400">*</span>
            </label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Explain why this submission is rejected and what was expected..."
              className="w-full p-3 bg-gray-800 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-red-400"
              rows={4}
              disabled={loading}
            />
            <p className="text-xs text-gray-500 mt-2">
              Minimum 20 characters required ({reason.length}/20)
            </p>
          </div>
        </div>

        <div className="flex gap-3 p-6 border-t border-gray-700">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 disabled:opacity-50 transition-colors font-semibold"
          >
            Cancel
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading || !isValid}
            className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors font-bold flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="inline-block animate-spin">⏳</span>
                Processing...
              </>
            ) : (
              <>❌ Reject</>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
