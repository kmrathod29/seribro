import React from 'react';
import { Building2 } from 'lucide-react';

const CompanyInfoCard = ({ company }) => {
  if (!company) return null;
  return (
    <div className="bg-slate-800/60 border border-white/10 rounded-xl p-4 shadow-md">
      <div className="flex items-center gap-3 mb-3">
        <Building2 className="w-5 h-5 text-blue-400" />
        <h4 className="text-white font-semibold">Company Info</h4>
      </div>
      <p className="text-white font-semibold">{company.companyName}</p>
      <p className="text-sm text-gray-300">{company.industryType}</p>
      <p className="text-sm text-gray-400 mt-2">{company.about}</p>
    </div>
  );
};

export default CompanyInfoCard;
