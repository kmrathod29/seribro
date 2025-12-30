// src/components/workspace/SubmissionCard.jsx
// Sub-Phase 5.4.3: Submission History Display Card

import React, { useState } from 'react';
import {
  Download,
  FileText,
  FileImage,
  FileArchive,
  File,
  Link,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  ChevronDown,
  ChevronUp,
  AlertTriangle,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

/**
 * SubmissionCard Component
 * Displays individual submission with files, links, feedback, and review actions
 *
 * Props:
 * - submission: submission object with version, files, links, message, status, etc.
 * - isLatest: boolean - is this the latest submission
 * - canReview: boolean - user can review this submission
 * - userRole: 'student' | 'company' | 'admin'
 * - onApprove: function(submissionId, feedback) - approve callback
 * - onRequestRevision: function(submissionId, revisionReason) - request revision callback
 * - onReject: function(submissionId, rejectionReason) - reject callback
 * - maxRevisions: number - maximum revisions allowed
 * - currentRevisions: number - current revision count
 */
const SubmissionCard = ({
  submission,
  isLatest = false,
  canReview = false,
  userRole = 'student',
  onApprove = null,
  onRequestRevision = null,
  onReject = null,
  maxRevisions = 2,
  currentRevisions = 0,
}) => {
  const [expanded, setExpanded] = useState(isLatest);
  const [reviewFeedback, setReviewFeedback] = useState('');
  const [reviewAction, setReviewAction] = useState(null); // 'approve', 'revision', 'reject'
  const [processing, setProcessing] = useState(false);

  if (!submission) {
    return null;
  }

  // Get status color and icon
  const getStatusStyle = (status) => {
    const styles = {
      submitted: {
        bg: 'bg-blue-500/20',
        border: 'border-blue-500',
        badge: 'bg-blue-500/20 text-blue-300',
        icon: Clock,
        text: 'Under Review',
      },
      'under-review': {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500',
        badge: 'bg-yellow-500/20 text-yellow-300',
        icon: AlertCircle,
        text: 'Under Review',
      },
      'revision-requested': {
        bg: 'bg-yellow-500/20',
        border: 'border-yellow-500',
        badge: 'bg-yellow-500/20 text-yellow-300',
        icon: AlertTriangle,
        text: 'Revision Requested',
      },
      approved: {
        bg: 'bg-green-500/20',
        border: 'border-green-500',
        badge: 'bg-green-500/20 text-green-300',
        icon: CheckCircle,
        text: 'Approved',
      },
      rejected: {
        bg: 'bg-red-500/20',
        border: 'border-red-500',
        badge: 'bg-red-500/20 text-red-300',
        icon: XCircle,
        text: 'Rejected',
      },
    };
    return styles[status] || styles.submitted;
  };

  const statusStyle = getStatusStyle(submission.status);
  const StatusIcon = statusStyle.icon;

  // Format submission timestamp
  const submittedTime = submission.submittedAt
    ? formatDistanceToNow(new Date(submission.submittedAt), { addSuffix: true })
    : 'Recently submitted';

  // Handle approve action
  const handleApprove = async () => {
    if (!onApprove) return;
    setProcessing(true);
    try {
      await onApprove(submission._id, reviewFeedback);
      setReviewAction(null);
      setReviewFeedback('');
    } catch (err) {
      console.error('Approve error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Handle revision request
  const handleRequestRevision = async () => {
    if (!onRequestRevision || !reviewFeedback.trim()) {
      return;
    }
    setProcessing(true);
    try {
      await onRequestRevision(submission._id, reviewFeedback);
      setReviewAction(null);
      setReviewFeedback('');
    } catch (err) {
      console.error('Revision request error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Handle reject
  const handleReject = async () => {
    if (!onReject || !reviewFeedback.trim()) {
      return;
    }
    setProcessing(true);
    try {
      await onReject(submission._id, reviewFeedback);
      setReviewAction(null);
      setReviewFeedback('');
    } catch (err) {
      console.error('Reject error:', err);
    } finally {
      setProcessing(false);
    }
  };

  // Get file icon
  const getFileIcon = (fileType) => {
    if (fileType.includes('pdf')) return FileText;
    if (fileType.includes('image')) return FileImage;
    if (fileType.includes('zip') || fileType.includes('rar')) return FileArchive;
    return File;
  };

  // Format file size
  const formatFileSize = (bytes) => {
    if (!bytes) return 'Unknown';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div
      className={`border rounded-lg overflow-hidden transition-all duration-200 ${
        statusStyle.border
      } ${isLatest ? 'border-2 bg-gray-900/80' : 'bg-gray-800/50'}`}
    >
      {/* Header */}
      <div
        className={`${statusStyle.bg} p-4 cursor-pointer hover:opacity-90 transition-opacity`}
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 bg-gray-900 rounded text-sm font-semibold text-gray-300">
                v{submission.version}
              </span>
              {isLatest && (
                <span className="px-2 py-0.5 bg-blue-500 text-white text-xs font-semibold rounded">
                  Latest
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <StatusIcon className="w-5 h-5" />
              <div>
                <p className="font-semibold text-gray-200">{statusStyle.text}</p>
                <p className="text-xs text-gray-400">{submittedTime}</p>
              </div>
            </div>
          </div>
          <div className="text-gray-400">
            {expanded ? (
              <ChevronUp className="w-5 h-5" />
            ) : (
              <ChevronDown className="w-5 h-5" />
            )}
          </div>
        </div>
      </div>

      {/* Expanded Content */}
      {expanded && (
        <div className="p-6 space-y-6 border-t border-gray-700">
          {/* Files Section */}
          {submission.files && submission.files.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-200 mb-3">
                Files ({submission.files.length})
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {submission.files.map((file, idx) => {
                  const FileIcon = getFileIcon(file.fileType || file.type || '');
                  return (
                    <a
                      key={idx}
                      href={file.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-blue-400 hover:bg-gray-800 transition-colors group"
                    >
                      <FileIcon className="w-5 h-5 text-gray-400 group-hover:text-blue-400" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">
                          {file.originalName || file.filename || 'File'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatFileSize(file.size || 0)}
                        </p>
                      </div>
                      <Download className="w-4 h-4 text-gray-400 group-hover:text-blue-400 flex-shrink-0" />
                    </a>
                  );
                })}
              </div>
            </div>
          )}

          {/* Links Section */}
          {submission.links && submission.links.length > 0 && (
            <div>
              <h4 className="text-sm font-semibold text-gray-200 mb-3">
                External Links ({submission.links.length})
              </h4>
              <div className="space-y-2">
                {submission.links.map((link, idx) => (
                  <a
                    key={idx}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-blue-400 hover:bg-gray-800 transition-colors group"
                  >
                    <Link className="w-5 h-5 text-gray-400 group-hover:text-blue-400 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {link.description || link.url}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{link.url}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Message Section */}
          {submission.message && (
            <div>
              <h4 className="text-sm font-semibold text-gray-200 mb-2">
                Submission Message
              </h4>
              <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                <p className="text-sm text-gray-300 whitespace-pre-wrap">
                  {submission.message}
                </p>
              </div>
            </div>
          )}

          {/* Feedback Section */}
          {(submission.companyFeedback ||
            submission.revisionReason ||
            submission.rejectionReason) && (
            <div className="border-t border-gray-700 pt-6">
              {/* Company Feedback */}
              {submission.companyFeedback && (
                <div className="mb-4">
                  <h4 className="text-sm font-semibold text-gray-200 mb-2">
                    Company Feedback
                  </h4>
                  <div
                    className={`rounded-lg p-4 ${
                      submission.status === 'approved'
                        ? 'bg-green-500/10 border border-green-500/30'
                        : 'bg-yellow-500/10 border border-yellow-500/30'
                    }`}
                  >
                    <p className="text-sm text-gray-200">
                      {submission.companyFeedback}
                    </p>
                  </div>
                </div>
              )}

              {/* Revision Reason */}
              {submission.revisionReason && (
                <div className="mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <AlertTriangle className="w-4 h-4 text-yellow-400" />
                    <h4 className="text-sm font-semibold text-yellow-300">
                      Revision Requested
                    </h4>
                  </div>
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                    <p className="text-sm text-gray-200">
                      {submission.revisionReason}
                    </p>
                  </div>
                </div>
              )}

              {/* Rejection Reason */}
              {submission.rejectionReason && (
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <XCircle className="w-4 h-4 text-red-400" />
                    <h4 className="text-sm font-semibold text-red-300">
                      Rejection Reason
                    </h4>
                  </div>
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                    <p className="text-sm text-gray-200">
                      {submission.rejectionReason}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Review Actions */}
          {canReview && isLatest && userRole === 'company' && (
            <div className="border-t border-gray-700 pt-6">
              {!reviewAction ? (
                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    onClick={() => setReviewAction('approve')}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-green-500/20 text-green-300 border border-green-500 rounded-lg hover:bg-green-500/30 transition-colors disabled:opacity-50 font-semibold text-sm"
                  >
                    <CheckCircle className="w-4 h-4 inline mr-2" />
                    Approve Work
                  </button>
                  <button
                    onClick={() => setReviewAction('revision')}
                    disabled={processing}
                    className="flex-1 px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors disabled:opacity-50 font-semibold text-sm"
                  >
                    <AlertTriangle className="w-4 h-4 inline mr-2" />
                    Request Revision
                  </button>
                  <button
                    onClick={() => setReviewAction('reject')}
                    disabled={
                      processing ||
                      currentRevisions >= maxRevisions
                    }
                    title={
                      currentRevisions >= maxRevisions
                        ? 'Maximum revisions reached'
                        : 'Reject submission'
                    }
                    className="flex-1 px-4 py-2 bg-red-500/20 text-red-300 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors disabled:opacity-50 font-semibold text-sm"
                  >
                    <XCircle className="w-4 h-4 inline mr-2" />
                    Reject
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-200 mb-2">
                      {reviewAction === 'approve'
                        ? 'Feedback (optional)'
                        : reviewAction === 'revision'
                        ? 'Revision Instructions'
                        : 'Rejection Reason'}
                    </label>
                    <textarea
                      value={reviewFeedback}
                      onChange={(e) => setReviewFeedback(e.target.value)}
                      placeholder={
                        reviewAction === 'approve'
                          ? 'Add optional feedback for the student...'
                          : reviewAction === 'revision'
                          ? 'Describe what needs to be revised...'
                          : 'Explain why this submission is rejected...'
                      }
                      className="w-full p-3 bg-gray-900/50 border border-gray-700 rounded-lg text-gray-200 placeholder-gray-500 focus:outline-none focus:border-blue-400"
                      rows={4}
                    />
                    {(reviewAction === 'revision' || reviewAction === 'reject') && (
                      <p className="text-xs text-gray-500 mt-1">
                        Minimum 10 characters required
                      </p>
                    )}
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setReviewAction(null);
                        setReviewFeedback('');
                      }}
                      disabled={processing}
                      className="flex-1 px-4 py-2 bg-gray-700 text-gray-200 rounded-lg hover:bg-gray-600 transition-colors disabled:opacity-50 font-semibold text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={
                        reviewAction === 'approve'
                          ? handleApprove
                          : reviewAction === 'revision'
                          ? handleRequestRevision
                          : handleReject
                      }
                      disabled={
                        processing ||
                        ((reviewAction === 'revision' || reviewAction === 'reject') &&
                          reviewFeedback.trim().length < 10)
                      }
                      className={`flex-1 px-4 py-2 rounded-lg font-semibold text-sm transition-colors disabled:opacity-50 text-white ${
                        reviewAction === 'approve'
                          ? 'bg-green-600 hover:bg-green-700'
                          : reviewAction === 'revision'
                          ? 'bg-yellow-600 hover:bg-yellow-700'
                          : 'bg-red-600 hover:bg-red-700'
                      }`}
                    >
                      {processing ? 'Processing...' : 'Confirm'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SubmissionCard;
