import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { User as UserType, SubscriptionTier, UserProfile } from "../types";
import { normalizeSubscriptionTier } from "../constants/packages";
import { useRealtimeSync, broadcastLocalEvent } from "../lib/useRealtimeSync";

export const ZED_BADGE_EVENT = 'zed_badge_updated';
export const ZED_BADGE_SYNC_EVENT = 'zed_badge_sync_event';
const badgeChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('zed_badge_sync') : null;

export const getActiveUserSynced = (): any => {
  const sessionRaw = localStorage.getItem('zed_user_session') || localStorage.getItem('current_user') || localStorage.getItem('user_profile');
  if (!sessionRaw) return null;

  try {
    const sessionUser = JSON.parse(sessionRaw);
    const allUsers = JSON.parse(localStorage.getItem('zed_users') || '[]');

    if (Array.isArray(allUsers) && allUsers.length > 0) {
      // Master lookup in global zed_users list by id, _id, or email
      const masterUser = allUsers.find(
        (u: any) => (u.id && sessionUser.id && u.id === sessionUser.id) ||
                    (u._id && sessionUser._id && u._id === sessionUser._id) ||
                    (u.email && sessionUser.email && u.email.toLowerCase().trim() === sessionUser.email.toLowerCase().trim())
      );

      if (masterUser) {
        const canonicalBadge = normalizeSubscriptionTier(
          masterUser.badge || masterUser.pack || masterUser.subscriptionTier || masterUser.userCategory || (masterUser.activePackages && masterUser.activePackages[0]) || 'FREEMIUM'
        );

        // Fusion: La base globale zed_users est la SEULE autorité pour le badge/pack
        const syncedUser = {
          ...sessionUser,
          ...masterUser,
          id: sessionUser.id || masterUser.id,
          badge: canonicalBadge,
          pack: canonicalBadge,
          subscriptionTier: canonicalBadge,
          offer: canonicalBadge,
          userCategory: canonicalBadge,
          activePackages: [canonicalBadge],
          packs: [canonicalBadge],
          accountType: canonicalBadge === 'FREEMIUM' ? 'freemium' : 'premium',
          quizHistory: sessionUser.quizHistory || masterUser.quizHistory || [],
          progressHistory: sessionUser.progressHistory || masterUser.progressHistory || [],
          purchaseHistory: sessionUser.purchaseHistory || masterUser.purchaseHistory || []
        };

        const serialized = JSON.stringify(syncedUser);
        localStorage.setItem('zed_user_session', serialized);
        localStorage.setItem('current_user', serialized);
        localStorage.setItem('user_profile', serialized);
        return syncedUser;
      }
    }
    return sessionUser;
  } catch (e) {
    console.warn("Error in getActiveUserSynced:", e);
    return null;
  }
};

export const resyncCurrentUser = getActiveUserSynced;

export const handleAdminBadgeChange = (userId: string, newBadge: string) => {
  const canonicalBadge = normalizeSubscriptionTier(newBadge);

  // 1. Mettre à jour zed_users
  try {
    const allUsers = JSON.parse(localStorage.getItem('zed_users') || '[]');
    if (Array.isArray(allUsers)) {
      const updatedUsers = allUsers.map((u: any) => {
        if (u.id === userId || u._id === userId || u.email === userId) {
          return {
            ...u,
            badge: canonicalBadge,
            pack: canonicalBadge,
            subscriptionTier: canonicalBadge,
            offer: canonicalBadge,
            userCategory: canonicalBadge,
            activePackages: [canonicalBadge],
            packs: [canonicalBadge]
          };
        }
        return u;
      });
      localStorage.setItem('zed_users', JSON.stringify(updatedUsers));
    }
  } catch (e) {}

  // 2. Nettoyer et resynchroniser la session active
  getActiveUserSynced();

  // 3. Forcer un événement de rechargement du context React et événements globaux
  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('zed_force_auth_refresh'));
  window.dispatchEvent(new CustomEvent(ZED_BADGE_EVENT, { detail: { userId, newBadge: canonicalBadge } }));
  window.dispatchEvent(new CustomEvent(ZED_BADGE_SYNC_EVENT, { detail: { userId, badge: canonicalBadge } }));
  window.dispatchEvent(new CustomEvent('zed_user_data_synced', { detail: { userId, badge: canonicalBadge, subscriptionTier: canonicalBadge } }));
  badgeChannel?.postMessage({ userId, newBadge: canonicalBadge });
};

export interface UserContextType {
  user: (UserType & Partial<UserProfile>) | null;
  setUser: (user: any) => void;
  updateUserBadge: (newBadge: SubscriptionTier | string) => void;
  updateStudentBadge: (userId: string, newBadge: SubscriptionTier | string) => void;
  refreshUserData: () => Promise<void>;
  refreshUserSession: () => void;
  logout: () => void;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);
export const AuthContext = UserContext;

export function useAuth(): UserContextType {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export const useUserContext = useAuth;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<(UserType & Partial<UserProfile>) | null>(() => {
    try {
      const resynced = getActiveUserSynced();
      if (resynced) {
        return normalizeUser(resynced);
      }
      const saved = localStorage.getItem("zed_user_session") || localStorage.getItem("current_user") || localStorage.getItem("user_profile");
      if (saved) {
        return normalizeUser(JSON.parse(saved));
      }
    } catch (e) {}
    return null;
  });

  function normalizeUser(u: any): (UserType & Partial<UserProfile>) | null {
    if (!u) return null;
    const badge = normalizeSubscriptionTier(
      u.badge || u.pack || u.subscriptionTier || u.subscriptionPackage || (u.activePackages && u.activePackages[0]) || u.tier || u.tierCategory || u.userCategory || u.subscriptionType || u.accountType
    );
    return {
      ...u,
      badge,
      pack: badge,
      subscriptionTier: badge,
      offer: badge,
      activePackages: [badge],
      packs: [badge],
      userCategory: badge,
      accountType: badge === 'FREEMIUM' ? ('freemium' as const) : ('premium' as const),
      quizHistory: u.quizHistory || [],
      completedQuizzes: u.completedQuizzes || [],
      purchaseHistory: u.purchaseHistory || u.purchases || []
    };
  }

  const refreshUserSession = () => {
    try {
      const resynced = getActiveUserSynced();
      if (resynced) {
        setUser(normalizeUser(resynced));
        return;
      }
      const saved = localStorage.getItem("zed_user_session") || localStorage.getItem("current_user") || localStorage.getItem("user_profile");
      if (saved) {
        const parsed = JSON.parse(saved);
        setUser(normalizeUser(parsed));
      }
    } catch (e) {
      console.warn("Failed to refresh user session:", e);
    }
  };

  const handleSetUser = (u: any) => {
    if (typeof u === "function") {
      setUser((prev) => {
        const nextVal = u(prev);
        const normalized = normalizeUser(nextVal);
        if (normalized) {
          const serialized = JSON.stringify(normalized);
          localStorage.setItem("current_user", serialized);
          localStorage.setItem("user_profile", serialized);
          localStorage.setItem("zed_user_session", serialized);
          if (normalized.activeSessionId) {
            localStorage.setItem("active_session_id", normalized.activeSessionId);
          }
        } else {
          localStorage.removeItem("current_user");
          localStorage.removeItem("user_profile");
          localStorage.removeItem("zed_user_session");
          localStorage.removeItem("session_token");
          localStorage.removeItem("active_session_id");
          try {
            sessionStorage.clear();
          } catch (e) {}
        }
        return normalized;
      });
      return;
    }
    const normalized = normalizeUser(u);
    setUser(normalized);
    if (normalized) {
      const serialized = JSON.stringify(normalized);
      localStorage.setItem("current_user", serialized);
      localStorage.setItem("user_profile", serialized);
      localStorage.setItem("zed_user_session", serialized);
      if (normalized.activeSessionId) {
        localStorage.setItem("active_session_id", normalized.activeSessionId);
      }
    } else {
      localStorage.removeItem("current_user");
      localStorage.removeItem("user_profile");
      localStorage.removeItem("zed_user_session");
      localStorage.removeItem("session_token");
      localStorage.removeItem("active_session_id");
      try {
        sessionStorage.clear();
      } catch (e) {}
    }
  };

  const updateStudentBadge = (userId: string, newBadge: SubscriptionTier | string) => {
    handleAdminBadgeChange(userId, newBadge);
    refreshUserSession();
  };

  const updateUserBadge = (newBadge: SubscriptionTier | string) => {
    if (user?.id) {
      updateStudentBadge(user.id, newBadge);
    } else {
      const canonicalBadge = normalizeSubscriptionTier(newBadge);
      handleSetUser((prev: any) => (prev ? { ...prev, badge: canonicalBadge, subscriptionTier: canonicalBadge } : null));
    }
  };

  const refreshUserData = async () => {
    try {
      const activeUser = user || (localStorage.getItem("current_user") ? JSON.parse(localStorage.getItem("current_user")!) : null);
      if (!activeUser?.id && !activeUser?.email) return;

      const headers: Record<string, string> = {
        "x-user-id": activeUser.id || "",
        "x-session-id": activeUser.activeSessionId || localStorage.getItem("active_session_id") || ""
      };

      const res = await fetch("/api/auth/me", { headers });
      if (res.ok) {
        const data = await res.json();
        const freshUser = data.user || data;
        if (freshUser) {
          handleSetUser({ ...activeUser, ...freshUser });
        }
      }
    } catch (e) {
      console.warn("Failed to refresh user data:", e);
    }
  };

  const logout = () => {
    localStorage.removeItem("current_user");
    localStorage.removeItem("user_profile");
    localStorage.removeItem("zed_user_session");
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("session_token");
    localStorage.removeItem("active_session_id");
    setUser(null);
    try {
      sessionStorage.clear();
    } catch (e) {}
    window.location.href = "/#/login";
  };

  useEffect(() => {
    refreshUserSession();
    refreshUserData();

    const handleLocalUpdate = (e: Event) => {
      refreshUserSession();
      refreshUserData();
    };
    window.addEventListener(ZED_BADGE_EVENT, handleLocalUpdate);
    window.addEventListener(ZED_BADGE_SYNC_EVENT, handleLocalUpdate);
    window.addEventListener('zed_user_data_synced', handleLocalUpdate);
    window.addEventListener('zed_force_auth_refresh', handleLocalUpdate);

    if (badgeChannel) {
      badgeChannel.onmessage = () => {
        refreshUserSession();
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'zed_user_session' || e.key === 'current_user' || e.key === 'user_profile' || e.key === 'zed_users') {
        refreshUserSession();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener(ZED_BADGE_EVENT, handleLocalUpdate);
      window.removeEventListener(ZED_BADGE_SYNC_EVENT, handleLocalUpdate);
      window.removeEventListener('zed_user_data_synced', handleLocalUpdate);
      window.removeEventListener('zed_force_auth_refresh', handleLocalUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, []);

  useRealtimeSync((msg) => {
    if (
      msg.type === "ACCOUNT_UPDATED" ||
      msg.type === "USER_UPDATED" ||
      msg.type === "ADMIN_STUDENT_LIST_UPDATED"
    ) {
      const targetUser = msg.studentData || msg.payload || msg.user;
      if (targetUser && user && (targetUser.id === user.id || targetUser.email?.toLowerCase() === user.email?.toLowerCase())) {
        const newBadge = msg.newBadge || targetUser.badge || targetUser.subscriptionTier || (targetUser.activePackages && targetUser.activePackages[0]);
        const canonical = normalizeSubscriptionTier(newBadge || user.badge);
        const mergedUser = {
          ...user,
          ...targetUser,
          badge: canonical,
          subscriptionTier: canonical,
          activePackages: [canonical],
          packs: [canonical]
        };
        handleSetUser(mergedUser);
      }
    }
  });

  return (
    <UserContext.Provider value={{ 
      user, 
      setUser: handleSetUser, 
      updateUserBadge, 
      updateStudentBadge, 
      refreshUserData, 
      refreshUserSession,
      logout 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export const UserProvider = AuthProvider;

export default AuthProvider;
