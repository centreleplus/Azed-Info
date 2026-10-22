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
  const [levelState, setLevelState] = useState<string>(() => {
    return (auth?.user?.grade || auth?.user?.level || (auth?.user as any)?.academicLevel || (auth?.user as any)?.niveau || level || "4ème").toString();
  });
  const [sectionState, setSectionState] = useState<string>(() => {
    return (auth?.user?.section || (auth?.user as any)?.stream || (auth?.user as any)?.filiere || section || "").toString();
  });
  const [nameState, setNameState] = useState<string>(() => {
    return (auth?.user?.fullName || (auth?.user as any)?.name || fullName || "").toString();
  });

  useEffect(() => {
    if (auth?.user?.activeBadge || auth?.user?.badge) {
      setBadgeState(auth.user.activeBadge || auth.user.badge);
    }
    const nextLevel = auth?.user?.grade || auth?.user?.level || (auth?.user as any)?.academicLevel || (auth?.user as any)?.niveau || level;
    if (nextLevel) setLevelState(String(nextLevel));
    const nextSection = auth?.user?.section || (auth?.user as any)?.stream || (auth?.user as any)?.filiere || section;
    if (nextSection !== undefined) setSectionState(String(nextSection));
    const nextName = auth?.user?.fullName || (auth?.user as any)?.name || fullName;
    if (nextName) setNameState(String(nextName));
  }, [
    auth?.user?.activeBadge,
    auth?.user?.badge,
    auth?.user?.grade,
    auth?.user?.level,
    (auth?.user as any)?.academicLevel,
    (auth?.user as any)?.niveau,
    auth?.user?.section,
    (auth?.user as any)?.stream,
    (auth?.user as any)?.filiere,
    auth?.user?.fullName,
    level,
    section,
    fullName
  ]);

  useEffect(() => {
    const handleSync = (e: any) => {
      const detail = e.detail;
      if (!detail) return;
      const newBadge = detail.badge || detail.newBadge || detail.subscriptionTier;
      if (newBadge) {
        setBadgeState(normalizeSubscriptionTier(newBadge));
      }
      const newLevel = detail.grade || detail.level || detail.academicLevel || detail.niveau;
      if (newLevel) {
        setLevelState(String(newLevel));
      }
      const newSection = detail.section || detail.stream || detail.filiere;
      if (newSection) {
        setSectionState(String(newSection));
      }
      const newName = detail.fullName || detail.name;
      if (newName) {
        setNameState(String(newName));
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
  const activeLevel = levelState || level || "4ème";
  const activeSection = sectionState || section || "";
  const activeName = nameState || fullName || "Élève";

  return (
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between p-6 bg-white rounded-2xl border border-slate-100 shadow-xs gap-4 text-left">
      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-xl font-bold text-slate-700 shrink-0">
          {(activeName || "E").charAt(0).toUpperCase()}
        </div>
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <h2 className="text-xl font-bold text-slate-900">{activeName}</h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-500 border border-slate-200 uppercase">
              STUDENT
            </span>
            {/* BADGE DYNAMIQUE DE L'ÉLÈVE */}
            <StudentBadgeView badge={activeBadge} />
          </div>
          <p className="text-xs text-slate-500 mt-1 font-medium">
            E-mail: <span className="text-slate-700">{email}</span> | Promotion: <span className="font-semibold text-slate-800">{activeLevel} {activeSection && activeSection !== "Tronc Commun" ? activeSection : ""}</span>
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
