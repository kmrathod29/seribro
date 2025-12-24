import React from 'react';
import { User } from 'lucide-react';

const AssignedStudentCard = ({ student }) => {
  if (!student) return null;
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <User className="w-5 h-5 text-green-400" />
        <h4 className="text-white font-semibold">Assigned Student</h4>
      </div>
      <p className="text-white font-semibold">{student.name}</p>
      <p className="text-sm text-gray-300">{student.college}</p>
      <div className="flex flex-wrap gap-2 mt-3">
        {(student.skills || []).slice(0, 6).map((skill) => (
          <span key={skill} className="px-2 py-1 text-xs rounded bg-white/5 text-gray-200 border border-white/10">{skill}</span>
        ))}
      </div>
      {student.resumeUrl && (
        <a href={student.resumeUrl} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-amber-300 hover:text-amber-200">View Resume →</a>
      )}
    </div>
  );
};

export default AssignedStudentCard;
