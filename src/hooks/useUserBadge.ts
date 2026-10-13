import { useState, useEffect, useContext } from 'react';
import { UserContext, ZED_BADGE_EVENT, ZED_BADGE_SYNC_EVENT } from '../components/AuthContext';
import { ZED_USER_DATA_SYNCED_EVENT } from '../services/UserService';
import { normalizeSubscriptionTier, SubscriptionTier } from '../constants/packages';

export const useUserBadge = (): SubscriptionTier => {
  const auth = useContext(UserContext);
  const initialTier = normalizeSubscriptionTier(
    auth?.user?.activeBadge || 
    auth?.user?.badge || 
    auth?.user?.subscriptionTier || 
    (auth?.user?.activePackages && auth?.user?.activePackages[0]) || 
    'FREEMIUM'
  );

  const [badge, setBadge] = useState<SubscriptionTier>(initialTier);

  useEffect(() => {
    if (auth?.user) {
      const current = normalizeSubscriptionTier(
        auth.user.activeBadge || 
        auth.user.badge || 
        auth.user.subscriptionTier || 
        (auth.user.activePackages && auth.user.activePackages[0])
      );
      setBadge(current);
    }
  }, [auth?.user?.activeBadge, auth?.user?.badge, auth?.user?.subscriptionTier, auth?.user?.activePackages]);

  useEffect(() => {
    // 1. Fetch latest profile from DB / me endpoint on mount to guarantee fresh persistence
    const fetchLatest = async () => {
      try {
        const stored = localStorage.getItem('current_user') || localStorage.getItem('zed_user_session');
        const parsed = stored ? JSON.parse(stored) : null;
        if (!parsed?.id) return;

        const res = await fetch('/api/auth/me', {
          headers: {
            'x-user-id': parsed.id,
            'x-session-id': parsed.activeSessionId || ''
          }
        });
        if (res.ok) {
          const data = await res.json();
          const fresh = data.user || data;
          if (fresh) {
            const normalized = normalizeSubscriptionTier(
              fresh.activeBadge || fresh.badge || fresh.subscriptionTier || (fresh.activePackages && fresh.activePackages[0])
            );
            setBadge(normalized);
          }
        }
      } catch (e) {
        // Fallback silently if offline
      }
    };

    fetchLatest();

    // 2. Real-time event listeners for instant no-F5 synchronizations
    const handleSync = (e: any) => {
      const detail = e.detail;
      const raw = detail?.badge || detail?.newBadge || detail?.subscriptionTier;
      if (raw) {
        setBadge(normalizeSubscriptionTier(raw));
      }
    };

    window.addEventListener(ZED_BADGE_SYNC_EVENT as any, handleSync);
    window.addEventListener(ZED_USER_DATA_SYNCED_EVENT as any, handleSync);
    window.addEventListener(ZED_BADGE_EVENT as any, handleSync);

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'current_user' || e.key === 'zed_user_session' || e.key === 'user_profile') {
        try {
          const u = e.newValue ? JSON.parse(e.newValue) : null;
          if (u) {
            setBadge(normalizeSubscriptionTier(u.activeBadge || u.badge || u.subscriptionTier));
          }
        } catch (err) {}
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(ZED_BADGE_SYNC_EVENT as any, handleSync);
      window.removeEventListener(ZED_USER_DATA_SYNCED_EVENT as any, handleSync);
      window.removeEventListener(ZED_BADGE_EVENT as any, handleSync);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  return badge;
};

export default useUserBadge;
