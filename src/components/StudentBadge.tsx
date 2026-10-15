import React, { useContext, useState, useEffect } from 'react';
import { UserContext, ZED_BADGE_EVENT, ZED_BADGE_SYNC_EVENT } from './AuthContext';
import { AcademicLevel, AcademicSection } from './BadgeResolver';
import { CategoryKey, parseUserCategory } from './BadgeMapper';
import { UnifiedBadge, SYSTEM_BADGES, UserCategory } from './BadgeConfig';
import { ZED_USER_DATA_SYNCED_EVENT } from '../services/UserService';
import { normalizeSubscriptionTier } from '../constants/packages';
import { normalizeBadge } from '../constants/badges';
import { StudentBadgeView } from './StudentBadgeView';

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

  const activeBadge = normalizeBadge(badgeState || auth?.user?.badge || userCategory || "FREEMIUM");

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
            <StudentBadgeView badge={activeBadge} />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            E-mail: <span className="text-slate-700">{email}</span> | Promotion: <span className="font-semibold text-slate-800">{level} {section && section !== "Tronc Commun" ? section : ""}</span>
          </p>
        </div>
      </div>

      {/* BANNIÈRE RÉCAPITULATIVE DE L'ABONNEMENT */}
      <div className="px-4 py-2.5 rounded-xl border flex items-center gap-2 bg-slate-50 border-slate-200 shadow-xs">
        <span className="text-xs font-black text-slate-900 tracking-wide">
          ABONNEMENT ACTIF :
        </span>
        <StudentBadgeView badge={activeBadge} />
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
