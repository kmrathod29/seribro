import React, { useState } from 'react';
import { submitWork } from '../../apis/workSubmissionApi';

const WorkSubmissionForm = ({ projectId, onSuccess, currentRevision, maxRevisions }) => {
  const [files, setFiles] = useState([]);
  const [links, setLinks] = useState([{ url: '', description: '' }]);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleFiles = (e) => {
    const selected = Array.from(e.target.files || []);
    setFiles((prev) => [...prev, ...selected].slice(0, Number(process.env.REACT_APP_WORK_MAX_FILES || 10)));
  };

  const removeFile = (index) => setFiles((prev) => prev.filter((_, i) => i !== index));

  const handleLinkChange = (idx, key, value) => {
    setLinks((prev) => prev.map((l, i) => (i === idx ? { ...l, [key]: value } : l)));
  };

  const addLink = () => setLinks((prev) => [...prev, { url: '', description: '' }]);
  const removeLink = (idx) => setLinks((prev) => prev.filter((_, i) => i !== idx));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (files.length === 0 && (!links || links.every(l => !l.url))) return setError('Please add at least one file or link');

    const formData = new FormData();
    files.forEach((f) => formData.append('workFiles', f));
    formData.append('links', JSON.stringify(links.filter(l => l.url)));
    formData.append('message', message);

    setUploading(true);
    const res = await submitWork(projectId, formData);
    setUploading(false);

    if (!res.success) {
      setError(res.message || 'Submission failed');
    } else {
      onSuccess(res.data);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 bg-white/5 rounded">
      <h3 className="text-lg font-bold mb-3">Submit Work</h3>

      <div className="mb-3">
        <label className="block text-sm mb-1">Files (max 10)</label>
        <input type="file" multiple onChange={handleFiles} />
        <div className="mt-2">
          {files.map((f, idx) => (
            <div key={idx} className="flex items-center justify-between border p-2 rounded mb-1">
              <div>{f.name} <span className="text-xs text-gray-400">({Math.round(f.size/1024)} KB)</span></div>
              <button type="button" onClick={() => removeFile(idx)} className="text-red-400">Remove</button>
            </div>
          ))}
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-sm mb-1">External Links</label>
        {links.map((l, idx) => (
          <div key={idx} className="flex gap-2 mb-2">
            <input className="flex-1 p-2 rounded bg-white/5" value={l.url} onChange={(e) => handleLinkChange(idx, 'url', e.target.value)} placeholder="https://github.com/..." />
            <input className="w-48 p-2 rounded bg-white/5" value={l.description} onChange={(e) => handleLinkChange(idx, 'description', e.target.value)} placeholder="Description" />
            <button type="button" onClick={() => removeLink(idx)} className="text-red-400">X</button>
          </div>
        ))}
        <button type="button" onClick={addLink} className="mt-2 text-gold">Add link</button>
      </div>

      <div className="mb-3">
        <label className="block text-sm mb-1">Message (optional)</label>
        <textarea className="w-full p-2 rounded bg-white/5" value={message} onChange={(e) => setMessage(e.target.value)} maxLength={2000} rows={4}></textarea>
      </div>

      {error && <p className="text-red-400 mb-2">{error}</p>}

      <div>
        <button type="submit" disabled={uploading} className="px-4 py-2 bg-gold text-navy rounded font-semibold">{uploading ? 'Submitting...' : 'Submit Work'}</button>
      </div>
    </form>
  );
};

export default WorkSubmissionForm;
