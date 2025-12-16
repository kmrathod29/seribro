// src/components/admin/ProjectStatsCards.jsx
// Hinglish: Reusable project statistics cards component

import React from 'react';
import { FolderOpen, Zap, CheckCircle, ListChecks, Lock } from 'lucide-react';

/**
 * Hinglish: Project stats cards dikha rahe hain
 * @param {Object} stats - Stats object with total, open, assigned, completed, closed
 */
const ProjectStatsCards = ({ stats = {} }) => {
  const statCards = [
    {
      label: 'Total Projects',
      value: stats.total || 0,
      icon: FolderOpen,
      bgColor: 'bg-blue-500/20',
      textColor: 'text-blue-300',
      borderColor: 'border-blue-500'
    },
    {
      label: 'Open',
      value: stats.byStatus?.open || 0,
      icon: Zap,
      bgColor: 'bg-yellow-500/20',
      textColor: 'text-yellow-300',
      borderColor: 'border-yellow-500'
    },
    {
      label: 'Assigned',
      value: stats.byStatus?.assigned || 0,
      icon: CheckCircle,
      bgColor: 'bg-purple-500/20',
      textColor: 'text-purple-300',
      borderColor: 'border-purple-500'
    },
    {
      label: 'Completed',
      value: stats.byStatus?.completed || 0,
      icon: CheckCircle,
      bgColor: 'bg-green-500/20',
      textColor: 'text-green-300',
      borderColor: 'border-green-500'
    },
    {
      label: 'Closed',
      value: stats.byStatus?.closed || 0,
      icon: Lock,
      bgColor: 'bg-gray-500/20',
      textColor: 'text-gray-300',
      borderColor: 'border-gray-500'
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

export default ProjectStatsCards;
