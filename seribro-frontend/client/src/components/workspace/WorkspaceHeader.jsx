// src/components/workspace/WorkspaceHeader.jsx
import React from 'react';
import { ArrowLeft, Clock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const statusColors = {
  assigned: 'bg-blue-500/15 text-blue-300 border-blue-500/30',
  'in-progress': 'bg-green-500/15 text-green-300 border-green-500/30',
  submitted: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
  'under-review': 'bg-yellow-500/15 text-yellow-300 border-yellow-500/30',
  completed: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30',
};

const WorkspaceHeader = ({ project, daysRemaining, onlineUsers = new Set(), currentUserId, student, company }) => {
  const navigate = useNavigate();
  const badge = statusColors[project?.status] || 'bg-white/10 text-white border-white/20';

  // Determine the other user (not current user)
  let otherUserId = null;
  let otherUserName = null;

  if (student && company) {
    // Determine which is the other party
    if (student._id?.toString() === currentUserId?.toString()) {
      // Current user is student, show company
      otherUserId = company.user;
      otherUserName = company.companyName;
    } else {
      // Current user is company, show student
      otherUserId = student.user;
      otherUserName = student.fname;
    }
  }

  const isOtherUserOnline = otherUserId && onlineUsers && onlineUsers.has(otherUserId);

  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 md:p-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-lg">
      <div className="flex items-start gap-3">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-lg bg-white/5 hover:bg-white/10 text-gray-200 transition-colors"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-2xl md:text-3xl font-bold text-white">{project?.title}</h1>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${badge}`}>
              {project?.status}
            </span>
          </div>
          <div className="mt-2 flex items-center gap-2 text-sm text-gray-300">
            <Clock className="w-4 h-4 text-amber-400" />
            {daysRemaining != null ? (
              <span>{daysRemaining >= 0 ? `${daysRemaining} days remaining` : 'Deadline passed'}</span>
            ) : (
              <span>Deadline not set</span>
            )}
          </div>
        </div>
      </div>

      {/* Online Status Indicator */}
      {otherUserName && (
        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-700/40">
          <div className={`w-2.5 h-2.5 rounded-full ${isOtherUserOnline ? 'bg-green-500' : 'bg-gray-500'}`} />
          <span className="text-sm font-medium text-gray-200">
            {otherUserName} {isOtherUserOnline ? '· Online' : '· Offline'}
          </span>
        </div>
      )}
    </div>
  );
};

export default WorkspaceHeader;

