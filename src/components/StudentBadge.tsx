import React from 'react';
import { AcademicLevel, AcademicSection } from './BadgeResolver';
import { CategoryKey, parseUserCategory } from './BadgeMapper';
import { UnifiedBadge, SYSTEM_BADGES, UserCategory } from './BadgeConfig';

interface StudentProfileHeaderProps {
  fullName: string;
  email: string;
  level: AcademicLevel | string;
  section: AcademicSection | string;
  userCategory?: CategoryKey | string;
  avatarUrl?: string;
}

export const StudentProfileHeader: React.FC<StudentProfileHeaderProps> = ({
  fullName,
  email,
  level,
  section,
  userCategory = "Freemium"
}) => {
  const categoryKey = parseUserCategory(userCategory) as UserCategory;
  const badge = SYSTEM_BADGES[categoryKey] || SYSTEM_BADGES["Freemium"];

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-xs gap-4 text-left">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-700 shrink-0">
          {(fullName || "E").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900">{fullName}</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase">
              STUDENT
            </span>
            {/* BADGE DYNAMIQUE DE L'ÉLÈVE */}
            <UnifiedBadge category={userCategory} size="md" />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            E-mail: <span className="text-slate-700">{email}</span> | Promotion: <span className="font-semibold text-slate-800">{level} {section && section !== "Tronc Commun" ? section : ""}</span>
          </p>
        </div>
      </div>

      {/* BANNIÈRE RÉCAPITULATIVE DE L'ABONNEMENT */}
      <div className={`px-4 py-2 rounded-xl border ${badge.bg} ${badge.border} flex items-center gap-2`}>
        <span className="text-xs font-bold text-slate-600">ABONNEMENT ACTIF :</span>
        <span className={`text-xs font-black ${badge.text}`}>
          PACK {badge.label.toUpperCase()}
        </span>
      </div>
    </div>
  );
};

export const StudentBadge: React.FC<{
  userCategory?: CategoryKey | string;
  size?: 'sm' | 'md' | 'lg';
  showLabelPrefix?: boolean;
  showIcon?: boolean;
}> = ({
  userCategory = "Freemium",
  size = 'sm',
  showIcon = true
}) => {
  return (
    <UnifiedBadge 
      category={userCategory} 
      size={size} 
      showIcon={showIcon} 
    />
  );
};

export default StudentBadge;
