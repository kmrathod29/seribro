// src/pages/workspace/ReviewWork.jsx
// Sub-Phase 5.4.5: Work Review with Submission History, File Viewing, and Actions

import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import ImageModal from '../../components/workspace/ImageModal';
import PDFViewer from '../../components/workspace/PDFViewer';
import {
  ApproveModal,
  RevisionModal,
  RejectModal,
} from '../../components/workspace/ActionModals';
import {
  getSubmissionHistory,
  approveWork,
  requestRevision,
  rejectWork,
} from '../../apis/workSubmissionApi';
import {
  ArrowLeft,
  AlertCircle,
  Archive,
  FileText,
  FileImage,
  Download,
} from 'lucide-react';

const ReviewWork = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State management
  const [loading, setLoading] = useState(true);
  const [submissionHistory, setSubmissionHistory] = useState([]);
  const [projectInfo, setProjectInfo] = useState(null);
  const [error, setError] = useState(null);
  const [userRole, setUserRole] = useState('company');
  const [actionLoading, setActionLoading] = useState(false);

  // Action modals state
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [revisionModalOpen, setRevisionModalOpen] = useState(false);
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedSubmissionId, setSelectedSubmissionId] = useState(null);

  // File viewer state
  const [imageModalOpen, setImageModalOpen] = useState(false);
  const [imageUrl, setImageUrl] = useState('');
  const [imageTitle, setImageTitle] = useState('');
  const [pdfViewerOpen, setPdfViewerOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState('');
  const [pdfTitle, setPdfTitle] = useState('');

  // Fetch submission history on mount
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const res = await getSubmissionHistory(projectId);
        if (!res.success) {
          setError(res.message || 'Failed to load submission history');
          toast.error(res.message || 'Failed to load submission history');
        } else {
          setSubmissionHistory(res.data?.submissions || []);
          setProjectInfo(res.data?.project);
          setUserRole(res.data?.userRole || 'company');
        }
      } catch (err) {
        setError('Error loading submissions');
        toast.error('Error loading submissions');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    if (projectId) {
      fetchHistory();
    }
  }, [projectId]);

  // Refresh submission history
  const refreshSubmissions = async () => {
    try {
      const res = await getSubmissionHistory(projectId);
      if (res.success) {
        setSubmissionHistory(res.data?.submissions || []);
        setProjectInfo(res.data?.project);
      }
    } catch (err) {
      console.error('Refresh error:', err);
    }
  };

  // File viewer handlers
  const handleImageClick = (url, title) => {
    setImageUrl(url);
    setImageTitle(title);
    setImageModalOpen(true);
  };

  const handlePdfClick = (url, title) => {
    setPdfUrl(url);
    setPdfTitle(title);
    setPdfViewerOpen(true);
  };

  // Action handlers
  const handleApproveClick = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setApproveModalOpen(true);
  };

  const handleRevisionClick = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setRevisionModalOpen(true);
  };

  const handleRejectClick = (submissionId) => {
    setSelectedSubmissionId(submissionId);
    setRejectModalOpen(true);
  };

  // Confirm approve action
  const confirmApprove = async (feedback) => {
    if (!selectedSubmissionId) return;
    setActionLoading(true);

    try {
      const res = await approveWork(projectId, feedback || null);
      if (!res.success) {
        toast.error(res.message || 'Approval failed');
      } else {
        toast.success('Work approved successfully!');
        setApproveModalOpen(false);
        await refreshSubmissions();
        // Redirect after short delay
        setTimeout(() => {
          navigate(`/workspace/projects/${projectId}`);
        }, 1500);
      }
    } catch (err) {
      toast.error(err.message || 'Error approving work');
      console.error('Approve error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm revision request
  const confirmRevision = async (reason) => {
    if (!selectedSubmissionId || !reason.trim()) return;

    if (reason.trim().length < 10) {
      toast.error('Please provide feedback of at least 10 characters');
      return;
    }

    setActionLoading(true);

    try {
      const res = await requestRevision(projectId, reason);
      if (!res.success) {
        toast.error(res.message || 'Failed to request revision');
      } else {
        toast.success('Revision requested! Student will be notified.');
        setRevisionModalOpen(false);
        await refreshSubmissions();
      }
    } catch (err) {
      toast.error(err.message || 'Error requesting revision');
      console.error('Revision error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Confirm reject action
  const confirmReject = async (reason) => {
    if (!selectedSubmissionId || !reason.trim()) return;

    if (reason.trim().length < 20) {
      toast.error('Please provide a rejection reason of at least 20 characters');
      return;
    }

    if (
      !window.confirm(
        'Are you sure you want to reject this submission? This may trigger a dispute.'
      )
    ) {
      return;
    }

    setActionLoading(true);

    try {
      const res = await rejectWork(projectId, reason);
      if (!res.success) {
        toast.error(res.message || 'Rejection failed');
      } else {
        toast.success('Work rejected. Dispute may be initiated.');
        setRejectModalOpen(false);
        await refreshSubmissions();
      }
    } catch (err) {
      toast.error(err.message || 'Error rejecting work');
      console.error('Reject error:', err);
    } finally {
      setActionLoading(false);
    }
  };

  // Render file viewer section
  const renderFileViewer = (files) => {
    if (!files || files.length === 0) return null;

    return (
      <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-200 mb-4">
          📁 Files ({files.length})
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {files.map((file, idx) => {
            const isImage =
              file.fileType?.includes('image') ||
              file.type?.includes('image');
            const isPdf =
              file.fileType?.includes('pdf') || file.type?.includes('pdf');
            const fileName = file.originalName || file.filename || `File ${idx + 1}`;

            return (
              <div
                key={idx}
                className="bg-gray-900/50 border border-gray-700 rounded-lg p-4 hover:border-blue-400 transition-colors group"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3 flex-1 min-w-0">
                    {isImage ? (
                      <FileImage className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
                    ) : isPdf ? (
                      <FileText className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                    ) : (
                      <Download className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" />
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-200 truncate">
                        {fileName}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {file.size
                          ? Math.round(file.size / 1024) + ' KB'
                          : 'Unknown size'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isImage && (
                      <button
                        onClick={() => handleImageClick(file.url, fileName)}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500 rounded hover:bg-blue-500/30 transition-colors whitespace-nowrap"
                      >
                        View
                      </button>
                    )}
                    {isPdf && (
                      <button
                        onClick={() => handlePdfClick(file.url, fileName)}
                        className="px-3 py-1.5 text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500 rounded hover:bg-blue-500/30 transition-colors whitespace-nowrap"
                      >
                        View
                      </button>
                    )}
                    <a
                      href={file.url}
                      download={fileName}
                      className="px-3 py-1.5 text-xs font-semibold bg-gray-700 text-gray-200 rounded hover:bg-gray-600 transition-colors whitespace-nowrap"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Loading state - Skeleton loader
  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            {/* Header skeleton */}
            <div className="h-12 bg-gray-700/50 rounded-lg w-1/3"></div>

            {/* Info box skeleton */}
            <div className="h-20 bg-gray-700/50 rounded-lg"></div>

            {/* Cards skeleton */}
            {[1, 2].map((i) => (
              <div key={i} className="h-32 bg-gray-700/50 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && submissionHistory.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-5xl mx-auto">
          <button
            onClick={() => navigate(`/workspace/projects/${projectId}`)}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Workspace
          </button>
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-6 rounded-lg flex items-start gap-4">
            <AlertCircle className="w-6 h-6 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-lg mb-2">Error Loading Submissions</h3>
              <p className="mb-4">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-red-500/30 text-red-300 border border-red-500 rounded hover:bg-red-500/50 transition-colors font-semibold"
              >
                Retry
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const hasSubmissions = submissionHistory && submissionHistory.length > 0;
  const currentSubmission = hasSubmissions
    ? submissionHistory.sort((a, b) => b.version - a.version)[0]
    : null;
  const currentRevisionCount = submissionHistory.filter(
    (s) => s.status === 'revision-requested'
  ).length;
  const maxRevisions = projectInfo?.maxRevisionsAllowed || 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <button
          onClick={() => navigate(`/workspace/projects/${projectId}`)}
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-8 transition-colors font-semibold"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Workspace
        </button>

        {/* Title Section */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-yellow-400 mb-2">
            Review Submission
          </h1>
          {currentSubmission && (
            <p className="text-gray-400 text-lg">
              Version {currentSubmission.version} • {projectInfo?.title || 'Project'}
            </p>
          )}
        </div>

        {/* Current Submission Section */}
        {currentSubmission && (
          <div className="space-y-6 mb-12">
            {/* Current Submission Card */}
            <div className="border-2 border-yellow-400/50 bg-gray-900/80 rounded-lg overflow-hidden">
              <div className="bg-yellow-400/10 p-6 border-b border-yellow-400/30">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-yellow-400">
                      Current Submission - Version {currentSubmission.version}
                    </h2>
                    <p className="text-gray-400 mt-2">
                      Submitted{' '}
                      {currentSubmission.submittedAt
                        ? new Date(currentSubmission.submittedAt).toLocaleDateString()
                        : 'Recently'}{' '}
                      • Status:{' '}
                      <span className="font-semibold capitalize">
                        {currentSubmission.status?.replace('-', ' ')}
                      </span>
                    </p>
                  </div>
                  <span className="px-4 py-2 bg-yellow-500/20 text-yellow-300 border border-yellow-500 rounded-lg font-semibold">
                    Latest
                  </span>
                </div>
              </div>

              <div className="p-6 space-y-6">
                {/* Files Viewer */}
                {renderFileViewer(currentSubmission.files)}

                {/* Links Section */}
                {currentSubmission.links && currentSubmission.links.length > 0 && (
                  <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-4">
                      🔗 External Links ({currentSubmission.links.length})
                    </h3>
                    <div className="space-y-3">
                      {currentSubmission.links.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block p-3 bg-gray-900/50 border border-gray-700 rounded-lg hover:border-blue-400 hover:bg-gray-800/70 transition-colors group"
                        >
                          <p className="text-sm font-semibold text-blue-400 group-hover:text-blue-300 truncate">
                            {link.description || link.url}
                          </p>
                          <p className="text-xs text-gray-500 truncate mt-1">
                            {link.url}
                          </p>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {/* Message Section */}
                {currentSubmission.message && (
                  <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-6">
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">
                      💬 Submission Message
                    </h3>
                    <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
                      <p className="text-gray-300 whitespace-pre-wrap text-sm leading-relaxed">
                        {currentSubmission.message}
                      </p>
                    </div>
                  </div>
                )}

                {/* Feedback Section */}
                {(currentSubmission.companyFeedback ||
                  currentSubmission.revisionReason ||
                  currentSubmission.rejectionReason) && (
                  <div className="border-t border-gray-700 pt-6 space-y-4">
                    {currentSubmission.companyFeedback && (
                      <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
                        <p className="text-sm font-semibold text-green-300 mb-2">
                          ✅ Company Feedback
                        </p>
                        <p className="text-gray-200 text-sm">
                          {currentSubmission.companyFeedback}
                        </p>
                      </div>
                    )}
                    {currentSubmission.revisionReason && (
                      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                        <p className="text-sm font-semibold text-yellow-300 mb-2">
                          🔄 Revision Requested
                        </p>
                        <p className="text-gray-200 text-sm">
                          {currentSubmission.revisionReason}
                        </p>
                      </div>
                    )}
                    {currentSubmission.rejectionReason && (
                      <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-4">
                        <p className="text-sm font-semibold text-red-300 mb-2">
                          ❌ Rejection Reason
                        </p>
                        <p className="text-gray-200 text-sm">
                          {currentSubmission.rejectionReason}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Action Buttons */}
                {userRole === 'company' &&
                  (currentSubmission.status === 'submitted' ||
                    currentSubmission.status === 'under-review') && (
                    <div className="border-t border-gray-700 pt-6">
                      <h3 className="text-lg font-semibold text-gray-200 mb-4">
                        Review Actions
                      </h3>
                      <p className="text-sm text-gray-400 mb-4">
                        Revisions: {currentRevisionCount} of {maxRevisions}
                      </p>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                        <button
                          onClick={() =>
                            handleApproveClick(currentSubmission._id)
                          }
                          className="px-4 py-3 bg-green-500/20 text-green-300 border border-green-500 rounded-lg hover:bg-green-500/30 transition-colors font-semibold text-sm"
                        >
                          ✅ Approve Work
                        </button>
                        {currentRevisionCount < maxRevisions && (
                          <button
                            onClick={() =>
                              handleRevisionClick(currentSubmission._id)
                            }
                            className="px-4 py-3 bg-yellow-500/20 text-yellow-300 border border-yellow-500 rounded-lg hover:bg-yellow-500/30 transition-colors font-semibold text-sm"
                          >
                            🔄 Request Revision
                          </button>
                        )}
                        {currentRevisionCount >= maxRevisions && (
                          <button
                            onClick={() =>
                              handleRejectClick(currentSubmission._id)
                            }
                            className="px-4 py-3 bg-red-500/20 text-red-300 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors font-semibold text-sm"
                          >
                            ❌ Reject Work
                          </button>
                        )}
                        {currentRevisionCount < maxRevisions && (
                          <button
                            onClick={() =>
                              handleRejectClick(currentSubmission._id)
                            }
                            className="px-4 py-3 bg-red-500/20 text-red-300 border border-red-500 rounded-lg hover:bg-red-500/30 transition-colors font-semibold text-sm"
                          >
                            ❌ Reject Work
                          </button>
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          </div>
        )}

        {/* Revision Progress Info */}
        {userRole === 'company' && hasSubmissions && (
          <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mb-8">
            <p className="text-sm text-blue-300">
              <strong>📊 Revision Progress:</strong> {currentRevisionCount} of{' '}
              {maxRevisions} revisions requested.
              {currentRevisionCount >= maxRevisions && (
                <span className="block mt-2 text-yellow-300 font-semibold">
                  ⚠️ Maximum revisions reached. Next rejection may trigger a dispute.
                </span>
              )}
            </p>
          </div>
        )}

        {/* Previous Submissions Section */}
        {submissionHistory.length > 1 && (
          <div className="mt-12">
            <h2 className="text-2xl font-bold text-gray-200 mb-6">
              📜 Submission History ({submissionHistory.length - 1} previous)
            </h2>
            <div className="space-y-4">
              {submissionHistory
                .sort((a, b) => b.version - a.version)
                .slice(1)
                .map((submission) => (
                  <div
                    key={submission._id}
                    className="border border-gray-700 bg-gray-800/50 rounded-lg p-4 hover:border-gray-600 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-semibold text-gray-300">
                          Version {submission.version}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          {submission.submittedAt
                            ? new Date(submission.submittedAt).toLocaleDateString()
                            : 'Recently'}{' '}
                          • Status:{' '}
                          <span className="capitalize">
                            {submission.status?.replace('-', ' ')}
                          </span>
                        </p>
                      </div>
                      <span className="px-3 py-1 bg-gray-700 text-gray-300 text-xs rounded-full">
                        {submission.status?.replace('-', ' ')}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {!hasSubmissions && (
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-12 text-center">
            <Archive className="w-16 h-16 mx-auto mb-4 text-gray-500" />
            <h3 className="text-xl font-semibold text-gray-300 mb-2">
              No Submissions Yet
            </h3>
            <p className="text-gray-400">
              {userRole === 'company'
                ? 'The student has not submitted any work yet. Check back later.'
                : 'You have not submitted any work yet.'}
            </p>
          </div>
        )}
      </div>

      {/* Modals */}
      <ImageModal
        isOpen={imageModalOpen}
        imageUrl={imageUrl}
        imageTitle={imageTitle}
        onClose={() => setImageModalOpen(false)}
      />

      <PDFViewer
        isOpen={pdfViewerOpen}
        pdfUrl={pdfUrl}
        pdfTitle={pdfTitle}
        onClose={() => setPdfViewerOpen(false)}
      />

      <ApproveModal
        isOpen={approveModalOpen}
        onClose={() => setApproveModalOpen(false)}
        onConfirm={confirmApprove}
        loading={actionLoading}
      />

      <RevisionModal
        isOpen={revisionModalOpen}
        onClose={() => setRevisionModalOpen(false)}
        onConfirm={confirmRevision}
        loading={actionLoading}
      />

      <RejectModal
        isOpen={rejectModalOpen}
        onClose={() => setRejectModalOpen(false)}
        onConfirm={confirmReject}
        loading={actionLoading}
      />
    </div>
  );
};

export default ReviewWork;