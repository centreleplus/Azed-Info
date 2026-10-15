import React from 'react';
import { normalizeBadge, OfficialBadge } from '../constants/badges';

export interface StudentBadgeViewProps {
  badge?: string | null;
  className?: string;
}

export const StudentBadgeView: React.FC<StudentBadgeViewProps> = ({ badge, className = '' }) => {
  const currentBadge: OfficialBadge = normalizeBadge(badge || 'FREEMIUM');

  const badgeStyles: Record<OfficialBadge, string> = {
    'FREEMIUM': 'bg-gray-100 text-gray-700 border-gray-200',
    'ESSENTIEL': 'bg-blue-50 text-blue-700 border-blue-200',
    'LIVE+': 'bg-purple-50 text-purple-700 border-purple-200',
    'REVISION+': 'bg-amber-50 text-amber-700 border-amber-200',
    'INTEGRAL': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  return (
    <span className={`px-3 py-1 text-xs font-extrabold rounded-xl border shadow-sm inline-flex items-center justify-center tracking-wider select-none ${badgeStyles[currentBadge]} ${className}`}>
      {currentBadge}
    </span>
  );
};

export default StudentBadgeView;
