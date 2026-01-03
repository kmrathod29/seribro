// src/pages/workspace/SubmitWork.jsx
// Sub-Phase 5.4.6: Enhanced Work Submission UX

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import FileUploadZone from '../../components/workspace/FileUploadZone';
import { getCurrentSubmission, submitWork } from '../../apis/workSubmissionApi';
import { ArrowLeft, CheckCircle, AlertCircle, X } from 'lucide-react';

const ACCEPTED_TYPES = [
  'image/*',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/zip',
  'application/x-rar-compressed',
];

const SubmitWork = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();

  // State
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  // Form state
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [links, setLinks] = useState([{ url: '', description: '' }]);
  const [message, setMessage] = useState('');
  const [whatChanged, setWhatChanged] = useState('');
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [linkErrors, setLinkErrors] = useState({});

  // Fetch current submission
  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        const res = await getCurrentSubmission(projectId);
        if (!res.success) {
          const errorMsg = String(res?.message || 'Could not fetch submission status');
          setError(errorMsg);
          alert(errorMsg);
        } else {
          setCurrentSubmission(res.data);
        }
      } catch (err) {
        setError('Error fetching submission');
        alert('Error fetching submission');
      } finally {
        setLoading(false);
      }
    };

    if (projectId) fetchSubmission();
  }, [projectId]);

  // File handlers
  const handleFilesSelected = useCallback((files) => {
    setSelectedFiles(Array.from(files).slice(0, 10));
  }, []);

  const handleRemoveFile = useCallback((index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    alert('File removed');
  }, []);

  // Links
  const handleLinkChange = (idx, key, value) => {
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [key]: value } : l)));
  };

  const addLink = () => {
    if (links.length >= 5) return;
    setLinks((prev) => [...prev, { url: '', description: '' }]);
  };

  const removeLink = (idx) => setLinks((prev) => prev.filter((_, i) => i !== idx));

  const validateUrl = (value) => {
    if (!value || !value.trim()) return false;
    try {
      const u = new URL(value.trim());
      return u.protocol === 'http:' || u.protocol === 'https:';
    } catch (err) {
      return false;
    }
  };

  const handleLinkBlur = (idx) => {
    const url = links[idx]?.url || '';
    if (!url.trim()) {
      setLinkErrors((p) => ({ ...p, [idx]: null }));
      return;
    }
    const ok = validateUrl(url);
    setLinkErrors((p) => ({ ...p, [idx]: ok ? null : 'Invalid URL' }));
    if (!ok) alert('Please enter a valid URL (include https://)');
  };

  // Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (selectedFiles.length === 0 && !links.some((l) => l.url?.trim())) {
      alert('Please add at least one file or external link');
      return;
    }
    if (message.trim().length === 0) {
      alert('Please add a message with your submission');
      return;
    }

    const isResubmission = currentSubmission?.status === 'revision-requested' || currentSubmission?.status === 'revision_requested';
    if (isResubmission && whatChanged.trim().length === 0) {
      alert('Please explain what changed in this resubmission');
      return;
    }

    // Validate links
    for (let i = 0; i < links.length; i++) {
      const url = links[i]?.url?.trim();
      if (url && !validateUrl(url)) {
        alert(`Invalid URL: ${url}`);
        return;
      }
    }

    setSubmitting(true);
    setUploadProgress(0);

    try {
      const formData = new FormData();
      selectedFiles.forEach((f) => formData.append('workFiles', f));
      formData.append('links', JSON.stringify(links.filter((l) => l.url?.trim())));
      formData.append('message', message.trim());
      if (whatChanged.trim()) formData.append('whatChanged', whatChanged.trim());

      const res = await submitWork(projectId, formData, {
        onUploadProgress: (evt) => {
          try {
            const total = evt.total || evt.lengthComputable && evt.total;
            const percent = total ? Math.round((evt.loaded * 100) / total) : 0;
            setUploadProgress(percent);
          } catch (e) {
            // ignore
          }
        },
      });

      if (!res.success) {
        const errorMsg = String(res?.message || 'Submission failed');
        alert(errorMsg);
        setError(errorMsg);
      } else {
        alert('Work submitted successfully!');
        setSuccessModalOpen(true);
        setTimeout(() => {
          setSuccessModalOpen(false);
          navigate(`/workspace/projects/${projectId}`);
        }, 3000);
      }
    } catch (err) {
      console.error('Submission error:', err);
      const errorMsg = String(err?.message || 'Error submitting work');
      alert(errorMsg);
      setError(errorMsg);
    } finally {
      setSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center p-12">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading submission...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => navigate(`/workspace/projects/${projectId}`)}
            className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Workspace
          </button>
          <div className="bg-red-500/20 border border-red-500 text-red-300 p-4 rounded-lg flex items-start gap-3">
            <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
            <div>
              <h3 className="font-semibold">Error</h3>
              <p>{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const isResubmission = currentSubmission?.status === 'revision-requested' || currentSubmission?.status === 'revision_requested';

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white p-6">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate(`/workspace/projects/${projectId}`)}
          className="flex items-center gap-2 text-yellow-400 hover:text-yellow-300 mb-6 transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Workspace
        </button>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-yellow-400 mb-2">{isResubmission ? 'Resubmit Work' : 'Submit Your Work'}</h1>
          {isResubmission && (
            <p className="text-gray-400">Company requested revisions — please address the feedback below and re-submit.</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Revision Feedback */}
          {isResubmission && (
            <div className="bg-yellow-500/10 border border-yellow-500 rounded-lg p-4">
              <p className="font-semibold text-yellow-300 mb-2">Company Feedback</p>
              <p className="text-gray-200 text-sm">{currentSubmission?.revisionReason || currentSubmission?.companyFeedback || 'Please update the submission as requested.'}</p>
            </div>
          )}

          {/* Files */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Upload Work Files</h2>
            <p className="text-gray-400 text-sm mb-6">Upload your project files, code, designs, or any deliverables. Max 10 files, 100MB each.</p>
            <FileUploadZone onFilesSelected={handleFilesSelected} maxFiles={10} maxSizePerFile={100 * 1024 * 1024} acceptedTypes={ACCEPTED_TYPES} />

            {selectedFiles.length > 0 && (
              <div className="mt-4">
                <h4 className="text-sm text-gray-300 mb-2">Preview</h4>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {selectedFiles.map((f, idx) => (
                    <div key={idx} className="bg-gray-900/50 border border-gray-700 rounded-lg p-3 flex items-center justify-between">
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-gray-200 truncate">{f.name}</p>
                        <p className="text-xs text-gray-500 mt-1">{Math.round(f.size / 1024)} KB</p>
                      </div>
                      <button type="button" onClick={() => handleRemoveFile(idx)} className="ml-3 text-red-400"><X className="w-4 h-4" /></button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {uploadProgress > 0 && (
              <div className="mt-4">
                <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-yellow-400 h-2" style={{ width: `${uploadProgress}%` }} />
                </div>
                <p className="text-xs text-gray-400 mt-1">Uploading: {uploadProgress}%</p>
              </div>
            )}
          </div>

          {/* Links */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">External Links (Optional)</h2>
            <p className="text-gray-400 text-sm mb-6">Add links to GitHub repos, Drive, live demos, etc. Max 5 links.</p>

            <div className="space-y-4">
              {links.map((link, idx) => (
                <div key={idx} className="flex gap-3">
                  <div className="flex-1 flex flex-col gap-2">
                    <input type="url" placeholder="https://github.com/... or https://demo.com" value={link.url} onChange={(e) => handleLinkChange(idx, 'url', e.target.value)} onBlur={() => handleLinkBlur(idx)} className={`w-full px-4 py-2 bg-gray-900/50 border rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none ${linkErrors[idx] ? 'border-red-500' : 'border-gray-700'}`} />
                    {linkErrors[idx] && <p className="text-xs text-red-400">{linkErrors[idx]}</p>}
                    <input type="text" placeholder="Link description (optional)" value={link.description} onChange={(e) => handleLinkChange(idx, 'description', e.target.value)} className="w-full px-4 py-2 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none" />
                  </div>
                  <div className="flex flex-col gap-2">
                    <button type="button" onClick={() => removeLink(idx)} className="text-red-400 hover:text-red-300 px-3 py-2 h-fit"><X className="w-4 h-4" /></button>
                    <p className="text-xs text-gray-500">{idx + 1} / 5</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center gap-4">
              <button type="button" onClick={addLink} disabled={links.length >= 5} className={`text-sm font-semibold ${links.length >= 5 ? 'text-gray-500 cursor-not-allowed' : 'text-yellow-400 hover:text-yellow-300'}`}>+ Add Another Link</button>
              <p className="text-xs text-gray-500">Max 5 links</p>
            </div>
          </div>

          {/* Message */}
          <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-8">
            <h2 className="text-xl font-semibold text-yellow-400 mb-4">Submission Message</h2>
            <p className="text-gray-400 text-sm mb-4">Describe what you've completed, any challenges faced, testing done, and how it meets the requirements.</p>
            <textarea value={message} onChange={(e) => setMessage(e.target.value)} placeholder="Describe what you've completed, any challenges faced, testing done, and how it meets the requirements..." rows={5} maxLength={2000} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none resize-none" />
            <div className="flex items-center justify-between mt-2">
              <p className={`text-xs ${message.length > 1900 ? 'text-red-400' : message.length > 1800 ? 'text-yellow-400' : 'text-gray-500'}`}>{message.length} / 2000 characters</p>
              {message.length === 0 && <p className="text-xs text-red-400">Message is required</p>}
            </div>

            {isResubmission && (
              <div className="mt-6">
                <label className="block text-sm font-semibold text-yellow-400 mb-2">What changed? (required)</label>
                <textarea value={whatChanged} onChange={(e) => setWhatChanged(e.target.value)} placeholder="Explain what you changed to address the company's feedback" rows={4} maxLength={2000} className="w-full px-4 py-3 bg-gray-900/50 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:border-yellow-400 focus:outline-none resize-none" />
                <p className="text-xs text-gray-500 mt-1">{whatChanged.length} / 2000</p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <button type="submit" disabled={
              submitting ||
              message.trim().length === 0 ||
              (selectedFiles.length === 0 && !links.some((l) => l.url?.trim())) ||
              (isResubmission && whatChanged.trim().length === 0) ||
              Object.values(linkErrors).some(Boolean)
            } className={`flex-1 py-3 px-6 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors ${submitting || message.trim().length === 0 ? 'bg-gray-600 text-gray-400 cursor-not-allowed' : 'bg-yellow-400 text-navy hover:bg-yellow-500'}`}>
              {submitting ? (<><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-navy"></div>Submitting...</>) : (<><CheckCircle className="w-5 h-5"/> Submit Work</>)}
            </button>
            <button type="button" onClick={() => navigate(`/workspace/projects/${projectId}`)} className="py-3 px-6 bg-gray-700 hover:bg-gray-600 rounded-lg font-semibold transition-colors">Cancel</button>
          </div>

          {/* Summary */}
          <div className="bg-gray-900/50 border border-gray-700 rounded-lg p-4">
            <p className="text-sm text-gray-400"><strong>Files:</strong> {selectedFiles.length} file(s) • <strong className="ml-4">Links:</strong> {links.filter((l) => l.url?.trim()).length} link(s) • <strong className="ml-4">Message:</strong> {message.length} characters</p>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {successModalOpen && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-lg p-8 max-w-md w-full text-center">
            <h3 className="text-2xl font-bold text-green-300 mb-4">Work submitted successfully!</h3>
            <p className="text-gray-300 mb-6">Company will review shortly. Redirecting to workspace...</p>
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-green-300 mr-3" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubmitWork;
