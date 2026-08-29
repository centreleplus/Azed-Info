/**
 * Fast Local Storage DB & Synchronous State Adapter
 * Handles reactive localStorage keys: "app_users_db", "app_current_user", "azed_mock_db_store"
 * Guarantees zero-network latency updates (<10ms) for Auth flow & Admin actions.
 */

import { StoredDb, getInitialDb, STORAGE_KEY } from "./clientApiFallback";

export const APP_USERS_KEY = "app_users_db";
export const APP_CURRENT_USER_KEY = "app_current_user";
export const CURRENT_USER_KEY = "current_user";
export const AUTH_TOKEN_KEY = "app_auth_token";

export function ensureSuperAdmin(usersList: any[]): any[] {
  if (!Array.isArray(usersList)) return getInitialDb().users;
  const hasSuperAdmin = usersList.some(
    (u) => (u.email || "").toLowerCase() === "centreleplus@gmail.com"
  );
  if (!hasSuperAdmin) {
    const superAdmin = {
      id: "usr_admin_center",
      email: "centreleplus@gmail.com",
      fullName: "Nabil Chaouch (Le Plus)",
      name: "Nabil Chaouch (Le Plus)",
      role: "admin",
      grade: "Tous",
      section: "Administration",
      status: "active",
      activeSessionId: null,
      avatarUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=200",
      createdAt: "2026-06-05T00:00:00Z",
      password: "admin123",
      phone: "21620123456",
      address: "Centre Le Plus, El Mourouj, Tunis",
      accountType: "premium",
      badgeLabel: "Super Admin",
      badge_label: "Super Admin",
      verified: true,
      activeDevicesCount: 1,
      maxAllowedDevices: 10
    };
    usersList.unshift(superAdmin);
  }
  return usersList;
}

export function saveUsersToStorage(users: any[]): void {
  const sanitizedList = ensureSuperAdmin(users);
  try {
    localStorage.setItem(APP_USERS_KEY, JSON.stringify(sanitizedList));
    
    // Also sync to azed_mock_db_store
    const rawMock = localStorage.getItem(STORAGE_KEY);
    let mockDb: StoredDb = rawMock ? JSON.parse(rawMock) : getInitialDb();
    mockDb.users = sanitizedList;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDb));

    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("app_users_updated", { detail: sanitizedList }));
      window.dispatchEvent(new CustomEvent("azed_db_updated", { detail: mockDb }));
    }
  } catch (e) {
    console.warn("Failed to save users to localStorage:", e);
  }
}

export function getStoredUsers(): any[] {
  try {
    const raw = localStorage.getItem(APP_USERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return ensureSuperAdmin(parsed);
      }
    }
  } catch (e) {
    console.warn("Failed to load app_users_db from localStorage:", e);
  }

  // Fallback to azed_mock_db_store or initial DB
  try {
    const rawMock = localStorage.getItem(STORAGE_KEY);
    if (rawMock) {
      const parsedMock: StoredDb = JSON.parse(rawMock);
      if (parsedMock.users && parsedMock.users.length > 0) {
        const users = ensureSuperAdmin(parsedMock.users);
        saveUsersToStorage(users);
        return users;
      }
    }
  } catch (e) {}

  const initial = getInitialDb().users;
  saveUsersToStorage(initial);
  return initial;
}

export function getCurrentUserFromStorage(): any | null {
  try {
    const raw = localStorage.getItem(APP_CURRENT_USER_KEY) || localStorage.getItem(CURRENT_USER_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
}

export function setCurrentUserInStorage(user: any | null): void {
  try {
    if (user) {
      const userWithoutPass = { ...user };
      delete userWithoutPass.password;
      const str = JSON.stringify(userWithoutPass);
      localStorage.setItem(APP_CURRENT_USER_KEY, str);
      localStorage.setItem(CURRENT_USER_KEY, str);
      localStorage.setItem(AUTH_TOKEN_KEY, `token_${user.id || "usr"}_${Date.now()}`);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("user_signed_in", { detail: userWithoutPass }));
      }
    } else {
      localStorage.removeItem(APP_CURRENT_USER_KEY);
      localStorage.removeItem(CURRENT_USER_KEY);
      localStorage.removeItem(AUTH_TOKEN_KEY);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("user_signed_out"));
      }
    }
  } catch (e) {
    console.warn("Failed to set current user in localStorage:", e);
  }
}

export function registerUserInStorage(payload: any): { success: boolean; token: string; user: any } {
  const users = getStoredUsers();
  const normalizedEmail = (payload.email || "").trim().toLowerCase();
  
  let existingIndex = users.findIndex(
    (u) => (u.email || "").trim().toLowerCase() === normalizedEmail
  );

  const isFreemium = payload.accountType === "freemium" || payload.isFreemium || payload.amount === 0;

  const newUser = {
    id: existingIndex !== -1 ? users[existingIndex].id : `usr_std_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
    email: normalizedEmail,
    fullName: (payload.fullName || payload.name || "Élève").trim(),
    name: (payload.fullName || payload.name || "Élève").trim(),
    phone: (payload.phone || "").trim(),
    password: payload.password || "student123",
    role: "student",
    grade: payload.grade || payload.level || "4ème Année",
    section: payload.section || "Sciences de l'Informatique",
    city: payload.city || payload.governorate || "Tunis",
    ville: payload.city || payload.governorate || "Tunis",
    highSchool: payload.highSchool || payload.school || "Lycée",
    etablissement: payload.highSchool || payload.school || "Lycée",
    status: isFreemium ? "active" : "pending",
    verified: isFreemium,
    accountType: isFreemium ? "freemium" : "premium",
    plan: isFreemium ? "FREEMIUM" : "PREMIUM",
    packs: payload.packTitle ? [payload.packTitle] : (payload.packs || []),
    createdAt: new Date().toISOString(),
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
  };

  if (existingIndex !== -1) {
    users[existingIndex] = { ...users[existingIndex], ...newUser };
  } else {
    users.push(newUser);
  }

  saveUsersToStorage(users);

  // If receipt provided or non-freemium, record receipt in azed_mock_db_store
  if (!isFreemium || payload.receiptUrl) {
    try {
      const rawMock = localStorage.getItem(STORAGE_KEY);
      let mockDb: StoredDb = rawMock ? JSON.parse(rawMock) : getInitialDb();
      if (!mockDb.receipts) mockDb.receipts = [];
      mockDb.receipts.unshift({
        id: `rec-${Date.now()}`,
        studentId: newUser.id,
        userId: newUser.id,
        studentName: newUser.fullName,
        email: newUser.email,
        phone: newUser.phone,
        grade: newUser.grade,
        section: newUser.section,
        city: newUser.city,
        highSchool: newUser.highSchool,
        packTitle: payload.packTitle || "Pack",
        targetPack: payload.packTitle || "Pack",
        amount: payload.amount || 0,
        paymentMethod: payload.paymentMethod || "D17",
        receiptUrl: payload.receiptUrl || "",
        status: "pending",
        createdAt: new Date().toISOString()
      });
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDb));
    } catch (e) {}
  }

  const userWithoutPass = { ...newUser };
  delete (userWithoutPass as any).password;
  const token = `token_${newUser.id}_${Date.now()}`;

  setCurrentUserInStorage(userWithoutPass);

  return {
    success: true,
    token,
    user: userWithoutPass
  };
}

export function updateUserStatusInStorage(userId: string, status?: string, verified?: boolean, subscriptionType?: string): any {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  const u = users[idx];
  if (status !== undefined) {
    u.status = status;
    if (status === "active") u.verified = true;
    if (status === "disabled") {
      u.verified = false;
      u.isBlocked = true;
    }
  }
  if (verified !== undefined) {
    u.verified = verified;
    if (verified && u.status === "pending") u.status = "active";
  }
  if (subscriptionType !== undefined) {
    u.subscriptionType = subscriptionType;
    u.accountType = subscriptionType === "freemium" ? "freemium" : "premium";
    u.plan = subscriptionType === "freemium" ? "FREEMIUM" : "PREMIUM";
  }

  users[idx] = u;
  saveUsersToStorage(users);

  const cu = getCurrentUserFromStorage();
  if (cu && cu.id === userId) {
    setCurrentUserInStorage({ ...cu, ...u });
  }

  return u;
}

export function updateUserSubscriptionInStorage(userId: string, subscriptionType: string): any {
  return updateUserStatusInStorage(userId, undefined, undefined, subscriptionType);
}

export function updateUserGroupInStorage(userId: string, group: string): any {
  const users = getStoredUsers();
  const idx = users.findIndex((u) => u.id === userId);
  if (idx === -1) return null;

  users[idx].study_group = group ? group : null;
  users[idx].groupe_etude = group ? group : "Non assigné";
  users[idx].studyGroup = group ? group : "Non assigné";

  saveUsersToStorage(users);

  const cu = getCurrentUserFromStorage();
  if (cu && cu.id === userId) {
    setCurrentUserInStorage({ ...cu, ...users[idx] });
  }

  return users[idx];
}

export function disableUserInStorage(userId: string): any {
  return updateUserStatusInStorage(userId, "disabled", false);
}

export function deleteUserInStorage(userId: string): boolean {
  let users = getStoredUsers();
  users = users.filter((u) => u.id !== userId);
  saveUsersToStorage(users);

  try {
    const rawMock = localStorage.getItem(STORAGE_KEY);
    if (rawMock) {
      let mockDb: StoredDb = JSON.parse(rawMock);
      if (mockDb.receipts) {
        mockDb.receipts = mockDb.receipts.filter((r) => r.userId !== userId && r.studentId !== userId);
      }
      mockDb.users = users;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDb));
    }
  } catch (e) {}

  return true;
}

export function approveReceiptInStorage(receiptId: string, studentId?: string): { receipt: any; user: any } | null {
  try {
    const rawMock = localStorage.getItem(STORAGE_KEY);
    let mockDb: StoredDb = rawMock ? JSON.parse(rawMock) : getInitialDb();
    if (!mockDb.receipts) mockDb.receipts = [];

    const rIdx = mockDb.receipts.findIndex((r) => r.id === receiptId);
    let matchedReceipt = null;
    if (rIdx !== -1) {
      mockDb.receipts[rIdx].status = "approved";
      mockDb.receipts[rIdx].approvedAt = new Date().toISOString();
      matchedReceipt = mockDb.receipts[rIdx];
    }

    const targetUserId = studentId || matchedReceipt?.userId || matchedReceipt?.studentId;
    let updatedUser = null;
    if (targetUserId) {
      updatedUser = updateUserStatusInStorage(targetUserId, "active", true, "premium");
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDb));
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("azed_db_updated", { detail: mockDb }));
    }

    return { receipt: matchedReceipt, user: updatedUser };
  } catch (e) {
    return null;
  }
}

export function rejectReceiptInStorage(receiptId: string): any {
  try {
    const rawMock = localStorage.getItem(STORAGE_KEY);
    let mockDb: StoredDb = rawMock ? JSON.parse(rawMock) : getInitialDb();
    if (!mockDb.receipts) mockDb.receipts = [];

    const rIdx = mockDb.receipts.findIndex((r) => r.id === receiptId);
    if (rIdx !== -1) {
      mockDb.receipts[rIdx].status = "rejected";
      mockDb.receipts[rIdx].rejectedAt = new Date().toISOString();
      localStorage.setItem(STORAGE_KEY, JSON.stringify(mockDb));
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("azed_db_updated", { detail: mockDb }));
      }
      return mockDb.receipts[rIdx];
    }
  } catch (e) {}
  return null;
}
