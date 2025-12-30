// src/components/workspace/WorkspaceStatusFlow.jsx
import React from 'react';
import { Check, ChevronRight } from 'lucide-react';

const steps = [
  { key: 'assigned', label: 'Assigned' },
  { key: 'in-progress', label: 'In Progress' },
  { key: 'submitted', label: 'Submitted' },
  { key: 'under-review', label: 'Under Review' },
  { key: 'revision-requested', label: 'Revision' },
  { key: 'approved', label: 'Approved' },
  { key: 'completed', label: 'Completed' },
];

const normalize = (s) => (s || '').toString().toLowerCase().replace(/\s+/g, '-');

const WorkspaceStatusFlow = ({ status = '', revisionCount = 0 }) => {
  const current = normalize(status);

  const indexOf = (key) => steps.findIndex((s) => s.key === key);
  const currentIndex = Math.max(0, steps.findIndex((s) => s.key === current));

  return (
    <div className="w-full">
      {/* Horizontal on md+, vertical on small screens */}
      <div className="hidden md:flex items-center gap-4 overflow-auto">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || step.key === 'completed' && current === 'completed';
          const isCurrent = idx === currentIndex;

          return (
            <div key={step.key} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border ${
                    isCompleted
                      ? 'bg-green-600 border-green-700 text-white'
                      : isCurrent
                      ? 'bg-blue-500/10 ring-2 ring-blue-400 text-white animate-pulse'
                      : 'bg-white/5 border-white/10 text-gray-300'
                  }`}
                >
                  {isCompleted ? <Check className="w-5 h-5" /> : <span className="text-xs font-semibold">{step.label.split(' ')[0].charAt(0)}</span>}
                </div>
                <div className="mt-2 text-xs text-center text-gray-300 max-w-[80px]">{step.label}</div>
              </div>

              {/* Connector except after last */}
              {idx < steps.length - 1 && (
                <div className="flex-1 h-0.5 mx-4 bg-white/10" aria-hidden="true" />
              )}
            </div>
          );
        })}

        {/* Show revision badge separately if revisionCount > 0 */}
        {revisionCount > 0 && (
          <div className="ml-4 flex items-center gap-2">
            <div className="px-2 py-1 bg-slate-700/60 border border-white/10 rounded-md text-sm text-white">Revisions: <span className="font-semibold">{revisionCount}</span></div>
          </div>
        )}
      </div>

      {/* Vertical layout for mobile */}
      <div className="md:hidden flex flex-col gap-3">
        {steps.map((step, idx) => {
          const isCompleted = idx < currentIndex || step.key === 'completed' && current === 'completed';
          const isCurrent = idx === currentIndex;
          return (
            <div key={step.key} className={`flex items-center gap-3 p-3 rounded-lg ${isCurrent ? 'bg-blue-500/6' : 'bg-white/3'}`}>
              <div className={`w-9 h-9 rounded-full flex items-center justify-center ${isCompleted ? 'bg-green-600 text-white' : isCurrent ? 'bg-blue-500 text-white animate-pulse' : 'bg-white/5 text-gray-300'}`}>
                {isCompleted ? <Check className="w-4 h-4" /> : <span className="text-xs font-semibold">{idx + 1}</span>}
              </div>
              <div className="flex-1">
                <div className="text-sm font-semibold text-white">{step.label}</div>
                <div className="text-xs text-gray-300">{isCurrent ? 'Current' : isCompleted ? 'Completed' : 'Pending'}</div>
              </div>
              {!isCompleted && <ChevronRight className="w-4 h-4 text-gray-400" />}
            </div>
          );
        })}

        {revisionCount > 0 && (
          <div className="p-2 px-3 rounded-md bg-slate-800/60 border border-white/10 text-sm text-gray-200">Revision requests: <span className="font-semibold text-amber-300">{revisionCount}</span></div>
        )}
      </div>
    </div>
  );
};

export default WorkspaceStatusFlow;
