import React, { useContext, useState, useEffect } from 'react';
import { UserContext, ZED_BADGE_EVENT, ZED_BADGE_SYNC_EVENT } from './AuthContext';
import { SubscriptionTier, normalizeSubscriptionTier } from '../constants/packages';
import { ZED_USER_DATA_SYNCED_EVENT } from '../services/UserService';

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
        setBadgeState(normalizeSubscriptionTier(newBadge));
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

  const badge: SubscriptionTier = normalizeSubscriptionTier(badgeState || contextUser?.badge || 'FREEMIUM');
  const normalized = badge.toUpperCase().trim();

  const badgeColor = 
    normalized === 'FREEMIUM' ? 'bg-gray-200 text-gray-800 border-gray-300' :
    normalized === 'ESSENTIEL' ? 'bg-blue-100 text-blue-800 border-blue-200' :
    normalized === 'LIVE +' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
    normalized === 'RÉVISION +' ? 'bg-purple-100 text-purple-800 border-purple-200' :
    'bg-amber-100 text-amber-800 border-amber-200';

  return (
    <div className="p-4 bg-white rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between gap-4">
      <h2 className="text-sm font-semibold text-slate-700">
        Abonnement : <span className="font-bold text-slate-900">{badge}</span>
      </h2>
      <span className={`px-3 py-1 text-xs font-black rounded-lg border uppercase tracking-wider ${badgeColor}`}>
        {badge}
      </span>
    </div>
  );
};

export default ProfileBanner;
