import React from 'react';
import { UnifiedBadge } from './BadgeConfig';

interface StudentBadgeProps {
  packCategory?: 'Freemium' | 'Essentiel' | 'Premium' | 'Premium+' | 'Premium++' | string;
  badgeLabel?: string;
  isGroupAssigned?: boolean;
}

export const StudentBadgeTag: React.FC<StudentBadgeProps> = ({ 
  packCategory = 'Freemium', 
  badgeLabel,
  isGroupAssigned = false 
}) => {
  return (
    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
      {/* Badge du Pack / Offre de l'élève */}
      <UnifiedBadge category={badgeLabel || packCategory || 'Freemium'} size="sm" />

      {/* Badge Statut Groupe */}
      <span className={`px-2 py-0.5 text-[9px] font-semibold rounded-md border ${
        isGroupAssigned 
          ? 'bg-blue-50 text-blue-600 border-blue-200' 
          : 'bg-amber-50 text-amber-600 border-amber-200'
      }`}>
        {isGroupAssigned ? 'Groupe Affecté' : 'Sans groupe'}
      </span>
    </div>
  );
};

export default StudentBadgeTag;

