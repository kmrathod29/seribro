import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import WorkSubmissionForm from '../../components/workspace/WorkSubmissionForm';
import { getCurrentSubmission } from '../../apis/workSubmissionApi';
import sendResponse from '../../apis/workSubmissionApi';

const SubmitWork = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentSubmission, setCurrentSubmission] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      const res = await getCurrentSubmission(projectId);
      if (!res.success) {
        setError(res.message || 'Could not fetch current submission');
      } else {
        setCurrentSubmission(res.data);
      }
      setLoading(false);
    };
    fetch();
  }, [projectId]);

  const handleSuccess = (data) => {
    // After submission, navigate back to workspace or show confirmation
    navigate(`/workspace/projects/${projectId}`);
  };

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold mb-4">Submit Work</h2>
      <WorkSubmissionForm projectId={projectId} onSuccess={handleSuccess} currentRevision={currentSubmission?.submission?.version} maxRevisions={currentSubmission?.maxRevisionsAllowed} />
    </div>
  );
};

export default SubmitWork;
