// src/components/admin/ApplicationStatsCards.jsx
// Hinglish: Reusable application statistics cards component

import React from 'react';
import { FileText, Clock, Star, CheckCircle, XCircle } from 'lucide-react';

/**
 * Hinglish: Application stats cards dikha rahe hain
 * @param {Object} stats - Stats object with total, pending, shortlisted, accepted, rejected
 */
const ApplicationStatsCards = ({ stats = {} }) => {
  const statCards = [
    {
      label: 'Total Applications',
      value: stats.total || 0,
      icon: FileText,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-500'
    },
    {
      label: 'Pending',
      value: stats.byStatus?.pending || 0,
      icon: Clock,
      bgColor: 'bg-orange-500/20',
      textColor: 'text-orange-300',
      borderColor: 'border-orange-500'
    },
    {
      label: 'Shortlisted',
      value: stats.byStatus?.shortlisted || 0,
      icon: Star,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-500'
    },
    {
      label: 'Accepted',
      value: stats.byStatus?.accepted || 0,
      icon: CheckCircle,
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-300',
      borderColor: 'border-green-500'
    },
    {
      label: 'Rejected',
      value: stats.byStatus?.rejected || 0,
      icon: XCircle,
      bgColor: 'bg-red-500/20',
      textColor: 'text-red-300',
      borderColor: 'border-red-500'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`${card.bgColor} ${card.borderColor} border rounded-lg p-4 backdrop-blur-sm`}
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-medium text-gray-300">{card.label}</h3>
              <Icon className={`${card.textColor} w-5 h-5`} />
            </div>
            <p className={`${card.textColor} text-2xl font-bold`}>{card.value}</p>
          </div>
        );
      })}
    </div>
  );
};

export default ApplicationStatsCards;
