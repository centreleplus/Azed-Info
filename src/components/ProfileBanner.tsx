import React, { useContext, useState, useEffect } from 'react';
import { UserContext, ZED_BADGE_EVENT, ZED_BADGE_SYNC_EVENT } from './AuthContext';
import { ZED_USER_DATA_SYNCED_EVENT } from '../services/UserService';
import { normalizeBadge, OfficialBadge } from '../constants/badges';
import { StudentBadgeView } from './StudentBadgeView';

export const ProfileBanner: React.FC = () => {
  const context = useContext(UserContext);
  const contextUser = context?.user;
  const [badgeState, setBadgeState] = useState<string>(() => {
    return contextUser?.badge || 'FREEMIUM';
  });

  useEffect(() => {
    if (contextUser?.badge) {
      setBadgeState(contextUser.badge);
    }
  }, [contextUser?.badge]);

  useEffect(() => {
    const handleSync = (e: any) => {
      const newBadge = e.detail?.badge || e.detail?.newBadge || e.detail?.subscriptionTier;
      if (newBadge) {
        setBadgeState(normalizeBadge(newBadge));
      }
    };

    window.addEventListener(ZED_USER_DATA_SYNCED_EVENT as any, handleSync);
    window.addEventListener(ZED_BADGE_EVENT as any, handleSync);
    window.addEventListener(ZED_BADGE_SYNC_EVENT as any, handleSync);
    window.addEventListener('zed_force_auth_refresh' as any, handleSync);

    return () => {
      window.removeEventListener(ZED_USER_DATA_SYNCED_EVENT as any, handleSync);
      window.removeEventListener(ZED_BADGE_EVENT as any, handleSync);
      window.removeEventListener(ZED_BADGE_SYNC_EVENT as any, handleSync);
      window.removeEventListener('zed_force_auth_refresh' as any, handleSync);
    };
  }, []);

  const badge: OfficialBadge = normalizeBadge(badgeState || contextUser?.badge || 'FREEMIUM');

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
      <div className="space-y-0.5 text-left">
        <p className="text-xs font-black text-slate-800 uppercase tracking-wide">
          ABONNEMENT ACTIF : PACK {badge}
        </p>
      </div>
      <StudentBadgeView badge={badge} />
    </div>
  );
};

export default ProfileBanner;
