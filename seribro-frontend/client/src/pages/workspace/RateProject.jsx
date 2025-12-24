import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ratingApi from '../../apis/ratingApi';
import { toast } from 'react-toastify';
import workspaceApi from '../../apis/workspaceApi';

const StarInput = ({value, onChange}) => {
  return (
    <div className="flex gap-1">
      {[1,2,3,4,5].map(n => (
        <button key={n} type="button" onClick={() => onChange(n)} className={`text-2xl ${n <= value ? 'text-amber-400' : 'text-gray-400'}`}>★</button>
      ))}
    </div>
  );
};

const RateProject = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [project, setProject] = useState(null);
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [userRole, setUserRole] = useState(null);

  useEffect(() => {
    (async () => {
      const res = await workspaceApi.getWorkspaceOverview(projectId);
      if (res.success) {
        setProject(res.data.project);
        setUserRole(res.data.workspace?.role);
      }
    })();
  }, [projectId]);

  const handleSubmit = async () => {
    if (userRole === 'company') {
      const res = await ratingApi.rateStudent(projectId, { rating, review });
      if (res.success) { toast.success('Rating submitted'); navigate(`/workspace/projects/${projectId}`); }
      else toast.error(res.message || 'Failed to submit');
    } else if (userRole === 'student') {
      const res = await ratingApi.rateCompany(projectId, { rating, review });
      if (res.success) { toast.success('Rating submitted'); navigate(`/workspace/projects/${projectId}`); }
      else toast.error(res.message || 'Failed to submit');
    } else {
      toast.error('Unauthorized to rate');
    }
  };

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Rate Project</h2>
      <div className="bg-slate-800/60 border border-white/10 rounded p-6">
        <div className="mb-3">{project?.title}</div>
        <div className="mb-3"><StarInput value={rating} onChange={setRating} /></div>
        <textarea value={review} onChange={(e) => setReview(e.target.value)} placeholder="Write a short review (optional)" className="w-full p-3 rounded bg-slate-900 text-white" rows={5}></textarea>
        <div className="mt-3 flex gap-2">
          <button onClick={handleSubmit} className="px-4 py-2 bg-amber-400 text-navy rounded">Submit Rating</button>
          <button onClick={() => navigate(-1)} className="px-4 py-2 bg-white/10 text-white rounded">Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default RateProject;