import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getCurrentSubmission, approveWork, requestRevision, rejectWork } from '../../apis/workSubmissionApi';

const ReviewWork = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [submission, setSubmission] = useState(null);
  const [error, setError] = useState(null);
  const [feedback, setFeedback] = useState('');

  const fetch = async () => {
    setLoading(true);
    const res = await getCurrentSubmission(projectId);
    if (!res.success) setError(res.message || 'Failed to load submission');
    else setSubmission(res.data.submission);
    setLoading(false);
  };

  useEffect(() => { fetch(); }, [projectId]);

  const handleApprove = async () => {
    const res = await approveWork(projectId, feedback);
    if (!res.success) {
      alert(res.message);
    } else {
      alert('Approved');
      navigate(`/workspace/projects/${projectId}`);
    }
  };

  const handleRequestRevision = async () => {
    if (!feedback || feedback.length < 10) return alert('Provide feedback of at least 10 chars');
    const res = await requestRevision(projectId, feedback);
    if (!res.success) alert(res.message);
    else {
      alert('Revision requested');
      navigate(`/workspace/projects/${projectId}`);
    }
  };

  const handleReject = async () => {
    if (!feedback || feedback.length < 20) return alert('Rejection reason must be at least 20 chars');
    const res = await rejectWork(projectId, feedback);
    if (!res.success) alert(res.message);
    else {
      alert('Rejected');
      navigate(`/workspace/projects/${projectId}`);
    }
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;
  if (!submission) return <div className="p-6">No current submission</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Review Submission (v{submission.version})</h2>

      <div className="mb-4">
        <h3 className="font-semibold">Message</h3>
        <p className="text-gray-300">{submission.message || 'No message'}</p>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Files</h3>
        <ul>
          {submission.files && submission.files.map((f, idx) => (
            <li key={idx}><a href={f.url} target="_blank" rel="noreferrer">{f.originalName || f.filename}</a></li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <h3 className="font-semibold">Links</h3>
        <ul>
          {submission.links && submission.links.map((l, idx) => (
            <li key={idx}><a href={l.url} target="_blank" rel="noreferrer">{l.description || l.url}</a></li>
          ))}
        </ul>
      </div>

      <div className="mb-4">
        <label className="block text-sm mb-1">Feedback (required for revision/reject)</label>
        <textarea className="w-full p-2 rounded bg-white/5" rows={4} value={feedback} onChange={(e) => setFeedback(e.target.value)} />
      </div>

      <div className="flex gap-3">
        <button onClick={handleApprove} className="px-4 py-2 bg-green-500 text-white rounded">Approve</button>
        <button onClick={handleRequestRevision} className="px-4 py-2 bg-yellow-500 text-navy rounded">Request Revision</button>
        <button onClick={handleReject} className="px-4 py-2 bg-red-600 text-white rounded">Reject</button>
      </div>
    </div>
  );
};

export default ReviewWork;