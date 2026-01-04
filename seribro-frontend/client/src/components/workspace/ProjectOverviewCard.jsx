import React from 'react';

const ProjectOverviewCard = ({ project }) => {
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 md:p-6 shadow-lg space-y-3">
      <h3 className="text-lg font-semibold text-white">Project Overview</h3>
      <p className="text-gray-200 whitespace-pre-wrap">{project?.description}</p>
      <div className="flex flex-wrap gap-2">
        {project?.requiredSkills?.map((skill) => (
          <span key={skill} className="px-2 py-1 text-xs rounded-full bg-white/5 border border-white/10 text-gray-200">{skill}</span>
        ))}
      </div>
      <div className="text-sm text-gray-300">
        Budget: ₹{project?.budgetMin?.toLocaleString('en-IN')} - ₹{project?.budgetMax?.toLocaleString('en-IN')}
      </div>
      {project?.finalPrice ? (
        <div className="text-sm text-gray-300 mt-1">
          <span className="text-gray-400 text-sm mr-2">Final Price:</span>
          <span className="text-white font-semibold">₹{(project?.finalPrice || 0).toLocaleString('en-IN')}</span>
          <div className="text-xs text-gray-400">Base: ₹{(project?.basePrice || 0).toLocaleString('en-IN')} • Fee: ₹{(project?.platformFee || 0).toLocaleString('en-IN')}</div>
        </div>
      ) : null}
      <div className="text-sm text-gray-300">Deadline: {project?.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</div>
    </div>
  );
};

export default ProjectOverviewCard;
