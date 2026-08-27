import React from 'react';

interface StudentBadgeProps {
  packCategory?: 'Freemium' | 'Premium' | 'Premium+' | 'Premium++' | string;
  badgeLabel?: string;
  isGroupAssigned?: boolean;
}

export const StudentBadgeTag: React.FC<StudentBadgeProps> = ({ 
  packCategory = 'Freemium', 
  badgeLabel,
  isGroupAssigned = false 
}) => {
  // Styles selon la catégorie de l'offre
  const getBadgeStyle = () => {
    const normalized = (packCategory || '').toLowerCase();
    if (normalized.includes('premium++') || normalized.includes('plus plus') || normalized.includes('gold')) {
      return 'bg-purple-100 text-purple-700 border-purple-300';
    }
    if (normalized.includes('premium+') || normalized.includes('plus') || normalized.includes('star')) {
      return 'bg-indigo-100 text-indigo-700 border-indigo-300';
    }
    if (normalized.includes('premium') || normalized.includes('payant') || normalized.includes('annuel') || normalized.includes('trimestriel')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
    return 'bg-slate-100 text-slate-600 border-slate-200';
  };

  const displayText = badgeLabel || packCategory;

  return (
    <div className="flex items-center gap-1.5 mt-1 flex-wrap">
      {/* Badge du Pack / Offre de l'élève */}
      <span className={`px-2 py-0.5 text-[9px] font-black rounded-md border uppercase tracking-wider ${getBadgeStyle()}`}>
        {displayText}
      </span>

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
