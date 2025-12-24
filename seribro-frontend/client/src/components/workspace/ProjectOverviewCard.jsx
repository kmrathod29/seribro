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
      <div className="text-sm text-gray-300">Deadline: {project?.deadline ? new Date(project.deadline).toLocaleDateString() : 'N/A'}</div>
    </div>
  );
};

export default ProjectOverviewCard;
