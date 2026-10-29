import React, { createContext, useContext, useState, useEffect, useCallback, useRef, ReactNode } from "react";
import { User as UserType, SubscriptionTier, UserProfile } from "../types";
import { normalizeSubscriptionTier } from "../constants/packages";
import { useRealtimeSync, broadcastLocalEvent } from "../lib/useRealtimeSync";
import { performGlobalLogout } from "../utils/authLogout";

export const ZED_BADGE_EVENT = 'zed_badge_updated';
export const ZED_BADGE_SYNC_EVENT = 'zed_badge_sync_event';
const badgeChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('zed_badge_sync') : null;

export const generateUniqueSessionId = (): string => {
  return 'sess_' + Date.now() + Math.random().toString(36).substring(2);
};

export const getLocalDeviceSessionToken = (fallbackUser?: any): string => {
  try {
    const fromSession =
      sessionStorage.getItem('active_session_token') ||
      sessionStorage.getItem('active_session_id');
    if (fromSession) return fromSession;

    const fromLocal =
      localStorage.getItem('active_session_token') ||
      localStorage.getItem('active_session_id') ||
      fallbackUser?.activeSessionId ||
      fallbackUser?.sessionId ||
      '';
    if (fromLocal) {
      sessionStorage.setItem('active_session_token', fromLocal);
      sessionStorage.setItem('active_session_id', fromLocal);
      return fromLocal;
    }
  } catch (e) {}
  return fallbackUser?.activeSessionId || fallbackUser?.sessionId || '';
};

export const registerActiveSessionToken = (user: any, explicitSessionId?: string): string => {
  const sessionId =
    explicitSessionId ||
    user?.activeSessionId ||
    user?.sessionId ||
    generateUniqueSessionId();

  try {
    sessionStorage.setItem('active_session_token', sessionId);
    sessionStorage.setItem('active_session_id', sessionId);
    localStorage.setItem('active_session_token', sessionId);
    localStorage.setItem('active_session_id', sessionId);

    const userId = user?.id || user?._id || '';
    const userEmail = (user?.email || '').toLowerCase().trim();

    // Update global session registry per account in localStorage
    const mapRaw = localStorage.getItem('zed_active_sessions_map');
    const sessionMap = mapRaw ? JSON.parse(mapRaw) : {};
    if (userId) sessionMap[userId] = sessionId;
    if (userEmail) sessionMap[userEmail] = sessionId;
    localStorage.setItem('zed_active_sessions_map', JSON.stringify(sessionMap));

    // Also persist sessionId inside the stored user profile in zed_users
    const rawUsers = localStorage.getItem('zed_users');
    const allUsers = rawUsers ? JSON.parse(rawUsers) : [];
    if (Array.isArray(allUsers)) {
      let found = false;
      const updatedUsers = allUsers.map((u: any) => {
        const matchId = userId && (u.id === userId || u._id === userId);
        const matchEmail = userEmail && u.email && u.email.toLowerCase().trim() === userEmail;
        if (matchId || matchEmail) {
          found = true;
          return {
            ...u,
            activeSessionId: sessionId,
            sessionId
          };
        }
        return u;
      });
      if (!found && (userId || userEmail)) {
        updatedUsers.push({
          ...user,
          activeSessionId: sessionId,
          sessionId
        });
      }
      localStorage.setItem('zed_users', JSON.stringify(updatedUsers));
    }
  } catch (e) {
    console.warn('Error registering active session token:', e);
  }

  return sessionId;
};

export const verifyLocalSessionIntegrity = (currentUser: any): boolean => {
  if (!currentUser) return true;
  try {
    const localToken =
      sessionStorage.getItem('active_session_token') ||
      sessionStorage.getItem('active_session_id');
    if (!localToken) return true;

    const userId = currentUser.id || currentUser._id || '';
    const userEmail = (currentUser.email || '').toLowerCase().trim();

    // 1. Check global active sessions map for this account
    const mapRaw = localStorage.getItem('zed_active_sessions_map');
    if (mapRaw) {
      const sessionMap = JSON.parse(mapRaw);
      const globalTokenById = userId ? sessionMap[userId] : undefined;
      const globalTokenByEmail = userEmail ? sessionMap[userEmail] : undefined;
      const globalToken = globalTokenById || globalTokenByEmail;
      if (globalToken && globalToken !== localToken) {
        return false;
      }
    }

    // 2. Check zed_users global profile store for this account
    const rawUsers = localStorage.getItem('zed_users');
    if (rawUsers) {
      const allUsers = JSON.parse(rawUsers);
      if (Array.isArray(allUsers)) {
        const matched = allUsers.find(
          (u: any) =>
            (userId && (u.id === userId || u._id === userId)) ||
            (userEmail && u.email && u.email.toLowerCase().trim() === userEmail)
        );
        const masterSessionId = matched?.activeSessionId || matched?.sessionId;
        if (masterSessionId && masterSessionId !== localToken) {
          return false;
        }
      }
    }
  } catch (e) {}
  return true;
};

export const getActiveUserSynced = (): any => {
  const sessionRaw =
    localStorage.getItem('zed_user_session') ||
    localStorage.getItem('current_user') ||
    localStorage.getItem('user_profile') ||
    localStorage.getItem('user');
  if (!sessionRaw) return null;

  try {
    const sessionUser = JSON.parse(sessionRaw);
    const localTabToken =
      typeof sessionStorage !== 'undefined'
        ? sessionStorage.getItem('active_session_token') || sessionStorage.getItem('active_session_id')
        : null;
    const preservedSessionId =
      localTabToken ||
      sessionUser.activeSessionId ||
      sessionUser.sessionId ||
      localStorage.getItem('active_session_token') ||
      localStorage.getItem('active_session_id');

    const allUsers = JSON.parse(localStorage.getItem('zed_users') || '[]');

    if (Array.isArray(allUsers) && allUsers.length > 0) {
      // Master lookup in global zed_users list by id, _id, or email
      const masterUser = allUsers.find(
        (u: any) =>
          (u.id && sessionUser.id && u.id === sessionUser.id) ||
          (u._id && sessionUser._id && u._id === sessionUser._id) ||
          (u.email &&
            sessionUser.email &&
            u.email.toLowerCase().trim() === sessionUser.email.toLowerCase().trim())
      );

      if (masterUser) {
        const masterSessionId = masterUser.activeSessionId || masterUser.sessionId;
        if (localTabToken && masterSessionId && masterSessionId !== localTabToken) {
          if (typeof window !== 'undefined') {
            window.dispatchEvent(
              new CustomEvent('zed_concurrent_session_invalidated', {
                detail: { message: 'Votre session a été ouverte sur un autre appareil.' }
              })
            );
          }
          return sessionUser;
        }

        const isAgent = String(masterUser.role || sessionUser.role || '').toLowerCase() === 'agent';
        if (isAgent) {
          const syncedAgent = {
            ...sessionUser,
            ...masterUser,
            id: sessionUser.id || masterUser.id,
            activeSessionId: preservedSessionId || masterSessionId,
            sessionId: preservedSessionId || masterSessionId
          };
          const serializedAgent = JSON.stringify(syncedAgent);
          localStorage.setItem('zed_user_session', serializedAgent);
          localStorage.setItem('current_user', serializedAgent);
          localStorage.setItem('user_profile', serializedAgent);
          localStorage.setItem('user', serializedAgent);
          return syncedAgent;
        }

        const canonicalBadge = normalizeSubscriptionTier(
          masterUser.activeBadge ||
            masterUser.badge ||
            masterUser.pack ||
            masterUser.subscriptionTier ||
            masterUser.userCategory ||
            masterUser.subscriptionType ||
            (masterUser.activePackages && masterUser.activePackages[0]) ||
            (masterUser.packs && masterUser.packs[0]) ||
            'FREEMIUM'
        );

        // Fusion: La base globale zed_users est la SEULE autorité pour le badge/pack
        const syncedUser = {
          ...sessionUser,
          ...masterUser,
          id: sessionUser.id || masterUser.id,
          activeSessionId: preservedSessionId || masterSessionId,
          sessionId: preservedSessionId || masterSessionId,
          badge: canonicalBadge,
          activeBadge: canonicalBadge,
          statusBadge: canonicalBadge,
          subscriptionBadge: canonicalBadge,
          pack: canonicalBadge,
          subscriptionTier: canonicalBadge,
          subscriptionType: canonicalBadge,
          offer: canonicalBadge,
          userCategory: canonicalBadge,
          badgeLabel: canonicalBadge,
          tier: canonicalBadge,
          tierCategory: canonicalBadge,
          tierBadge: canonicalBadge,
          activePackages: [canonicalBadge],
          packs: [canonicalBadge],
          accountType: canonicalBadge === 'FREEMIUM' ? 'freemium' : 'premium',
          isPremium: canonicalBadge !== 'FREEMIUM',
          plan: canonicalBadge === 'FREEMIUM' ? 'FREEMIUM' : 'PREMIUM',
          quizHistory: sessionUser.quizHistory || masterUser.quizHistory || [],
          progressHistory: sessionUser.progressHistory || masterUser.progressHistory || [],
          purchaseHistory: sessionUser.purchaseHistory || masterUser.purchaseHistory || []
        };

        const serialized = JSON.stringify(syncedUser);
        localStorage.setItem('zed_user_session', serialized);
        localStorage.setItem('current_user', serialized);
        localStorage.setItem('user_profile', serialized);
        localStorage.setItem('user', serialized);
        localStorage.setItem('zed_active_badge', canonicalBadge);
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

export const handleAdminBadgeChange = (userId: string, newBadge: string, userEmail?: string) => {
  const canonicalBadge = normalizeSubscriptionTier(newBadge);
  const targetEmail = (userEmail || '').toLowerCase().trim();

  const badgeFields = {
    badge: canonicalBadge,
    activeBadge: canonicalBadge,
    statusBadge: canonicalBadge,
    subscriptionBadge: canonicalBadge,
    pack: canonicalBadge,
    subscriptionTier: canonicalBadge,
    subscriptionType: canonicalBadge,
    offer: canonicalBadge,
    userCategory: canonicalBadge,
    badgeLabel: canonicalBadge,
    tier: canonicalBadge,
    tierCategory: canonicalBadge,
    tierBadge: canonicalBadge,
    activePackages: [canonicalBadge],
    packs: [canonicalBadge],
    accountType: canonicalBadge === 'FREEMIUM' ? 'freemium' : 'premium',
    isPremium: canonicalBadge !== 'FREEMIUM',
    plan: canonicalBadge === 'FREEMIUM' ? 'FREEMIUM' : 'PREMIUM'
  };

  // 1. Mettre à jour zed_users avec upsert
  try {
    const rawList = localStorage.getItem('zed_users');
    const allUsers = rawList ? JSON.parse(rawList) : [];
    if (Array.isArray(allUsers)) {
      let found = false;
      const updatedUsers = allUsers.map((u: any) => {
        const matchId = u.id === userId || u._id === userId || u.email === userId;
        const matchEmail = targetEmail && u.email && u.email.toLowerCase().trim() === targetEmail;
        if (matchId || matchEmail) {
          found = true;
          return {
            ...u,
            ...badgeFields
          };
        }
        return u;
      });
      if (!found) {
        updatedUsers.push({
          id: userId,
          ...(targetEmail ? { email: targetEmail } : {}),
          ...badgeFields
        });
      }
      localStorage.setItem('zed_users', JSON.stringify(updatedUsers));
    }
  } catch (e) {}

  // 2. Nettoyer et resynchroniser la session active
  getActiveUserSynced();

  // 3. Forcer un événement de rechargement du context React et événements globaux (0ms délai)
  const eventPayload = {
    id: userId,
    userId,
    email: targetEmail || undefined,
    badge: canonicalBadge,
    newBadge: canonicalBadge,
    activeBadge: canonicalBadge,
    subscriptionTier: canonicalBadge,
    subscriptionType: canonicalBadge,
    userCategory: canonicalBadge
  };

  window.dispatchEvent(new Event('storage'));
  window.dispatchEvent(new CustomEvent('user-badge-updated', { detail: eventPayload }));
  window.dispatchEvent(new CustomEvent('zed_force_auth_refresh', { detail: eventPayload }));
  window.dispatchEvent(new CustomEvent(ZED_BADGE_EVENT, { detail: eventPayload }));
  window.dispatchEvent(new CustomEvent(ZED_BADGE_SYNC_EVENT, { detail: eventPayload }));
  window.dispatchEvent(new CustomEvent('zed_user_data_synced', { detail: eventPayload }));
  badgeChannel?.postMessage(eventPayload);
  broadcastLocalEvent({ type: 'USER_UPDATED', payload: eventPayload, ...eventPayload });
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
      const saved =
        localStorage.getItem("zed_user_session") ||
        localStorage.getItem("current_user") ||
        localStorage.getItem("user_profile") ||
        localStorage.getItem("user");
      if (saved) {
        return normalizeUser(JSON.parse(saved));
      }
    } catch (e) {}
    return null;
  });

  function normalizeUser(u: any): (UserType & Partial<UserProfile>) | null {
    if (!u) return null;
    if (String(u.role || '').toLowerCase() === 'agent') {
      return {
        ...u,
        quizHistory: u.quizHistory || [],
        completedQuizzes: u.completedQuizzes || [],
        purchaseHistory: u.purchaseHistory || u.purchases || []
      };
    }
    const badge = normalizeSubscriptionTier(
      u.activeBadge ||
        u.badge ||
        u.pack ||
        u.subscriptionTier ||
        u.subscriptionPackage ||
        u.userCategory ||
        u.subscriptionType ||
        (u.activePackages && u.activePackages[0]) ||
        (u.packs && u.packs[0]) ||
        u.tier ||
        u.tierCategory ||
        u.badgeLabel ||
        u.accountType
    );
    return {
      ...u,
      badge,
      activeBadge: badge,
      statusBadge: badge,
      subscriptionBadge: badge,
      pack: badge,
      subscriptionTier: badge,
      subscriptionType: badge,
      offer: badge,
      userCategory: badge,
      badgeLabel: badge,
      tier: badge,
      tierCategory: badge,
      tierBadge: badge,
      activePackages: [badge],
      packs: [badge],
      accountType: badge === 'FREEMIUM' ? ('freemium' as const) : ('premium' as const),
      isPremium: badge !== 'FREEMIUM',
      plan: badge === 'FREEMIUM' ? 'FREEMIUM' : 'PREMIUM',
      quizHistory: u.quizHistory || [],
      completedQuizzes: u.completedQuizzes || [],
      purchaseHistory: u.purchaseHistory || u.purchases || []
    };
  }

  const refreshUserSession = useCallback(() => {
    try {
      const resynced = getActiveUserSynced();
      if (resynced) {
        const nextUser = normalizeUser(resynced);
        setUser((prev) => (JSON.stringify(prev) === JSON.stringify(nextUser) ? prev : nextUser));
        return;
      }
      const saved =
        localStorage.getItem("zed_user_session") ||
        localStorage.getItem("current_user") ||
        localStorage.getItem("user_profile") ||
        localStorage.getItem("user");
      if (saved) {
        const parsed = JSON.parse(saved);
        const nextUser = normalizeUser(parsed);
        setUser((prev) => (JSON.stringify(prev) === JSON.stringify(nextUser) ? prev : nextUser));
      }
    } catch (e) {
      console.warn("Failed to refresh user session:", e);
    }
  }, []);

  const handleSetUser = useCallback((u: any) => {
    if (typeof u === "function") {
      setUser((prev) => {
        const nextVal = u(prev);
        const normalized = normalizeUser(nextVal);
        if (normalized) {
          const serialized = JSON.stringify(normalized);
          localStorage.setItem("user", serialized);
          localStorage.setItem("current_user", serialized);
          localStorage.setItem("user_profile", serialized);
          localStorage.setItem("zed_user_session", serialized);
          if (normalized.activeBadge || normalized.badge) {
            localStorage.setItem("zed_active_badge", normalized.activeBadge || normalized.badge);
          }
          if (normalized.activeSessionId || (normalized as any).sessionId) {
            const sid = normalized.activeSessionId || (normalized as any).sessionId;
            localStorage.setItem("active_session_id", sid);
            localStorage.setItem("active_session_token", sid);
            try {
              if (!sessionStorage.getItem("active_session_token")) {
                sessionStorage.setItem("active_session_token", sid);
                sessionStorage.setItem("active_session_id", sid);
              }
            } catch (e) {}
          }
        } else {
          localStorage.removeItem("user");
          localStorage.removeItem("current_user");
          localStorage.removeItem("user_profile");
          localStorage.removeItem("zed_user_session");
          localStorage.removeItem("zed_active_badge");
          localStorage.removeItem("session_token");
          localStorage.removeItem("active_session_id");
          localStorage.removeItem("active_session_token");
          try {
            sessionStorage.clear();
          } catch (e) {}
        }
        return JSON.stringify(prev) === JSON.stringify(normalized) ? prev : normalized;
      });
      return;
    }
    const normalized = normalizeUser(u);
    setUser((prev) => (JSON.stringify(prev) === JSON.stringify(normalized) ? prev : normalized));
    if (normalized) {
      const serialized = JSON.stringify(normalized);
      localStorage.setItem("user", serialized);
      localStorage.setItem("current_user", serialized);
      localStorage.setItem("user_profile", serialized);
      localStorage.setItem("zed_user_session", serialized);
      if (normalized.activeBadge || normalized.badge) {
        localStorage.setItem("zed_active_badge", normalized.activeBadge || normalized.badge);
      }
      if (normalized.activeSessionId || (normalized as any).sessionId) {
        const sid = normalized.activeSessionId || (normalized as any).sessionId;
        localStorage.setItem("active_session_id", sid);
        localStorage.setItem("active_session_token", sid);
        try {
          if (!sessionStorage.getItem("active_session_token")) {
            sessionStorage.setItem("active_session_token", sid);
            sessionStorage.setItem("active_session_id", sid);
          }
        } catch (e) {}
      }
    } else {
      localStorage.removeItem("user");
      localStorage.removeItem("current_user");
      localStorage.removeItem("user_profile");
      localStorage.removeItem("zed_user_session");
      localStorage.removeItem("zed_active_badge");
      localStorage.removeItem("session_token");
      localStorage.removeItem("active_session_id");
      localStorage.removeItem("active_session_token");
      try {
        sessionStorage.clear();
      } catch (e) {}
    }
  }, []);

  const updateStudentBadge = useCallback((userId: string, newBadge: SubscriptionTier | string) => {
    handleAdminBadgeChange(userId, newBadge);
    refreshUserSession();
  }, [refreshUserSession]);

  const updateUserBadge = useCallback((newBadge: SubscriptionTier | string) => {
    if (user?.id) {
      updateStudentBadge(user.id, newBadge);
    } else {
      const canonicalBadge = normalizeSubscriptionTier(newBadge);
      handleSetUser((prev: any) => (prev ? { ...prev, badge: canonicalBadge, activeBadge: canonicalBadge, subscriptionTier: canonicalBadge } : null));
    }
  }, [user?.id, updateStudentBadge, handleSetUser]);

  const refreshUserData = useCallback(async () => {
    try {
      const savedUserStr = localStorage.getItem("user") || localStorage.getItem("current_user") || localStorage.getItem("zed_user_session") || localStorage.getItem("user_profile");
      const activeUser = savedUserStr ? JSON.parse(savedUserStr) : null;
      if (!activeUser?.id && !activeUser?.email) return;

      const userId = activeUser.id || (activeUser as any)._id || activeUser.email;
      const localSessToken = getLocalDeviceSessionToken(activeUser);
      const headers: Record<string, string> = {
        "x-user-id": userId,
        "x-session-id": localSessToken
      };

      const res = await fetch("/api/auth/me", { headers });
      if (res.status === 401) {
        const errData = await res.json().catch(() => ({}));
        if (errData.reason === "CONCURRENT_LOGIN" || errData.error === "CONCURRENT_LOGIN") {
          window.dispatchEvent(
            new CustomEvent("zed_concurrent_session_invalidated", {
              detail: { message: errData.msg || "Votre session a été ouverte sur un autre appareil." }
            })
          );
        }
        return;
      }

      if (res.ok) {
        const data = await res.json();
        const freshUser = data.user || data;
        if (freshUser && freshUser.id) {
          if (localSessToken && freshUser.activeSessionId && freshUser.activeSessionId !== localSessToken) {
            window.dispatchEvent(
              new CustomEvent("zed_concurrent_session_invalidated", {
                detail: { message: "Votre session a été ouverte sur un autre appareil." }
              })
            );
            return;
          }

          const isAgent = String(freshUser.role || activeUser.role || '').toLowerCase() === 'agent';
          if (isAgent) {
            handleSetUser({ ...activeUser, ...freshUser, activeSessionId: localSessToken || freshUser.activeSessionId });
            return;
          }

          const canonicalBadge = normalizeSubscriptionTier(
            freshUser.activeBadge ||
              freshUser.badge ||
              freshUser.statusBadge ||
              freshUser.userCategory ||
              freshUser.subscriptionType ||
              (freshUser.activePackages && freshUser.activePackages[0]) ||
              (freshUser.packs && freshUser.packs[0]) ||
              "FREEMIUM"
          );

          const updatedUser = {
            ...activeUser,
            ...freshUser,
            activeSessionId: localSessToken || freshUser.activeSessionId,
            sessionId: localSessToken || freshUser.activeSessionId,
            badge: canonicalBadge,
            activeBadge: canonicalBadge,
            statusBadge: canonicalBadge,
            subscriptionBadge: canonicalBadge,
            userCategory: canonicalBadge,
            subscriptionTier: canonicalBadge,
            subscriptionType: canonicalBadge,
            offer: canonicalBadge,
            pack: canonicalBadge,
            badgeLabel: canonicalBadge,
            tier: canonicalBadge,
            tierCategory: canonicalBadge,
            tierBadge: canonicalBadge,
            activePackages: [canonicalBadge],
            packs: [canonicalBadge],
            accountType: canonicalBadge === 'FREEMIUM' ? 'freemium' : 'premium',
            isPremium: canonicalBadge !== 'FREEMIUM',
            plan: canonicalBadge === 'FREEMIUM' ? 'FREEMIUM' : 'PREMIUM'
          };

          handleSetUser(updatedUser);

          // Mise à jour de zed_users dans le stockage local avec upsert pour éviter toute réversion
          try {
            const rawList = localStorage.getItem('zed_users');
            const allUsers = rawList ? JSON.parse(rawList) : [];
            if (Array.isArray(allUsers)) {
              let found = false;
              const updatedUsers = allUsers.map((u: any) => {
                if (u.id === updatedUser.id || (updatedUser.email && u.email === updatedUser.email)) {
                  found = true;
                  return { ...u, ...updatedUser };
                }
                return u;
              });
              if (!found) {
                updatedUsers.push(updatedUser);
              }
              localStorage.setItem('zed_users', JSON.stringify(updatedUsers));
            }
          } catch (e) {}
        }
      }
    } catch (e) {
      console.warn("Failed to refresh user data:", e);
    }
  }, [handleSetUser]);

  const logout = useCallback(() => {
    setUser(null);
    performGlobalLogout();
  }, []);

  const hasInitializedAuthRef = useRef(false);

  const applyImmediateBadgePayload = useCallback((payload: any) => {
    if (!payload) {
      refreshUserSession();
      return;
    }
    const incomingBadge = payload.newBadge || payload.badge || payload.activeBadge || payload.subscriptionTier || payload.userCategory;
    const targetId = payload.userId || payload.id || payload._id;
    const targetEmail = (payload.email || '').toLowerCase().trim();

    if (incomingBadge && (targetId || targetEmail)) {
      const canonical = normalizeSubscriptionTier(incomingBadge);
      handleSetUser((prev: any) => {
        if (!prev) return prev;
        const matchId = targetId && (prev.id === targetId || prev._id === targetId || prev.email === targetId);
        const matchEmail = targetEmail && prev.email && prev.email.toLowerCase().trim() === targetEmail;
        if (!matchId && !matchEmail) return prev;
        return {
          ...prev,
          badge: canonical,
          activeBadge: canonical,
          statusBadge: canonical,
          subscriptionBadge: canonical,
          pack: canonical,
          subscriptionTier: canonical,
          subscriptionType: canonical,
          offer: canonical,
          userCategory: canonical,
          badgeLabel: canonical,
          tier: canonical,
          tierCategory: canonical,
          tierBadge: canonical,
          activePackages: [canonical],
          packs: [canonical],
          accountType: canonical === 'FREEMIUM' ? 'freemium' : 'premium',
          isPremium: canonical !== 'FREEMIUM',
          plan: canonical === 'FREEMIUM' ? 'FREEMIUM' : 'PREMIUM'
        };
      });
    }
    refreshUserSession();
  }, [handleSetUser, refreshUserSession]);

  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  useEffect(() => {
    if (!hasInitializedAuthRef.current) {
      hasInitializedAuthRef.current = true;
      refreshUserSession();
      refreshUserData();
    }

    const handleLocalUpdate = (e: Event) => {
      const customEvt = e as CustomEvent;
      applyImmediateBadgePayload(customEvt?.detail);
    };
    window.addEventListener('user-badge-updated', handleLocalUpdate);
    window.addEventListener(ZED_BADGE_EVENT, handleLocalUpdate);
    window.addEventListener(ZED_BADGE_SYNC_EVENT, handleLocalUpdate);
    window.addEventListener('zed_user_data_synced', handleLocalUpdate);
    window.addEventListener('zed_force_auth_refresh', handleLocalUpdate);

    if (badgeChannel) {
      badgeChannel.onmessage = (event) => {
        applyImmediateBadgePayload(event?.data);
      };
    }

    const handleStorage = (e: StorageEvent) => {
      if (
        e.key === 'active_session_token' ||
        e.key === 'active_session_id' ||
        e.key === 'zed_active_sessions_map' ||
        e.key === 'zed_users' ||
        e.key === 'zed_user_session' ||
        e.key === 'current_user' ||
        e.key === 'user_profile' ||
        e.key === 'user'
      ) {
        const localToken =
          sessionStorage.getItem('active_session_token') ||
          sessionStorage.getItem('active_session_id');
        if (localToken && userRef.current && !verifyLocalSessionIntegrity(userRef.current)) {
          window.dispatchEvent(
            new CustomEvent('zed_concurrent_session_invalidated', {
              detail: { message: 'Votre session a été ouverte sur un autre appareil.' }
            })
          );
          return;
        }
      }
      if (e.key === 'zed_user_session' || e.key === 'current_user' || e.key === 'user_profile' || e.key === 'user' || e.key === 'zed_users' || e.key === 'zed_active_badge') {
        refreshUserSession();
      }
    };
    window.addEventListener('storage', handleStorage);

    return () => {
      window.removeEventListener('user-badge-updated', handleLocalUpdate);
      window.removeEventListener(ZED_BADGE_EVENT, handleLocalUpdate);
      window.removeEventListener(ZED_BADGE_SYNC_EVENT, handleLocalUpdate);
      window.removeEventListener('zed_user_data_synced', handleLocalUpdate);
      window.removeEventListener('zed_force_auth_refresh', handleLocalUpdate);
      window.removeEventListener('storage', handleStorage);
    };
  }, [refreshUserSession, refreshUserData, applyImmediateBadgePayload]);

  useRealtimeSync((msg) => {
    if (
      msg.type === "ACCOUNT_UPDATED" ||
      msg.type === "USER_UPDATED" ||
      msg.type === "ADMIN_STUDENT_LIST_UPDATED"
    ) {
      if (msg.payload) {
        applyImmediateBadgePayload(msg.payload);
      }
      refreshUserData();
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
