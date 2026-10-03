import React, { useContext, useState, useEffect } from 'react';
import { UserContext, ZED_BADGE_EVENT, ZED_BADGE_SYNC_EVENT } from './AuthContext';
import { AcademicLevel, AcademicSection } from './BadgeResolver';
import { CategoryKey, parseUserCategory } from './BadgeMapper';
import { UnifiedBadge, SYSTEM_BADGES, UserCategory } from './BadgeConfig';
import { ZED_USER_DATA_SYNCED_EVENT } from '../services/UserService';
import { normalizeSubscriptionTier } from '../constants/packages';

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
  userCategory = "FREEMIUM"
}) => {
  const auth = useContext(UserContext);
  const [badgeState, setBadgeState] = useState<string>(() => {
    return (auth?.user?.activeBadge || auth?.user?.badge || userCategory || "FREEMIUM").toString();
  });

  useEffect(() => {
    if (auth?.user?.activeBadge || auth?.user?.badge) {
      setBadgeState(auth.user.activeBadge || auth.user.badge);
    }
  }, [auth?.user?.activeBadge, auth?.user?.badge]);

  useEffect(() => {
    const handleSync = (e: any) => {
      const newBadge = e.detail?.badge || e.detail?.newBadge || e.detail?.subscriptionTier;
      if (newBadge) {
        setBadgeState(normalizeSubscriptionTier(newBadge));
      }
    };

    window.addEventListener(ZED_USER_DATA_SYNCED_EVENT as any, handleSync);
    window.addEventListener(ZED_BADGE_EVENT as any, handleSync);
    window.addEventListener(ZED_BADGE_SYNC_EVENT as any, handleSync);

    return () => {
      window.removeEventListener(ZED_USER_DATA_SYNCED_EVENT as any, handleSync);
      window.removeEventListener(ZED_BADGE_EVENT as any, handleSync);
      window.removeEventListener(ZED_BADGE_SYNC_EVENT as any, handleSync);
    };
  }, []);

  const activeBadge = normalizeSubscriptionTier(badgeState || auth?.user?.badge || userCategory || "FREEMIUM").toUpperCase().trim();

  const badgeColor = 
    activeBadge === 'FREEMIUM' ? 'bg-gray-100 text-gray-800 border-gray-300' :
    activeBadge === 'ESSENTIEL' ? 'bg-blue-50 text-blue-800 border-blue-200' :
    activeBadge === 'LIVE +' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' :
    activeBadge === 'RÉVISION +' ? 'bg-purple-50 text-purple-800 border-purple-200' :
    'bg-amber-50 text-amber-800 border-amber-200';

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
            <span className={`px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider border shadow-2xs ${badgeColor}`}>
              {activeBadge}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            E-mail: <span className="text-slate-700">{email}</span> | Promotion: <span className="font-semibold text-slate-800">{level} {section && section !== "Tronc Commun" ? section : ""}</span>
          </p>
        </div>
      </div>

      {/* BANNIÈRE RÉCAPITULATIVE DE L'ABONNEMENT */}
      <div className={`px-4 py-2.5 rounded-xl border flex items-center gap-2 ${badgeColor}`}>
        <p className="text-xs font-black text-slate-900 tracking-wide">
          ABONNEMENT ACTIF : PACK {activeBadge.toUpperCase().startsWith('PACK') ? activeBadge.toUpperCase() : activeBadge.toUpperCase()}
        </p>
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
