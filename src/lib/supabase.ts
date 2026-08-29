import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { User, PaymentReceipt } from '../types';

// 1. ENVIRONMENT VARIABLES & CLIENT INITIALIZATION
const metaEnv = (import.meta as any).env || {};
const supabaseUrl = (metaEnv.VITE_SUPABASE_URL || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_URL) || '').trim();
const supabaseAnonKey = (metaEnv.VITE_SUPABASE_ANON_KEY || (typeof process !== 'undefined' && process.env?.VITE_SUPABASE_ANON_KEY) || '').trim();


export const isSupabaseConfigured = (): boolean => {
  return Boolean(
    supabaseUrl && 
    supabaseAnonKey && 
    supabaseUrl.startsWith('https://') && 
    !supabaseUrl.includes('YOUR_SUPABASE') &&
    supabaseAnonKey.length > 20
  );
};

export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  : null;

// 2. PRE-SEEDED LOCALSTORAGE MOCK DATABASE ENGINE
export const PRESEEDED_USERS: User[] = [
  {
    id: "usr-admin-leplus",
    email: "centreleplus@gmail.com",
    fullName: "M. Nabil Chaouch (Le Plus)",
    role: "admin",
    grade: "Direction General",
    section: "Administration A-zed",
    status: "active",
    activeSessionId: "session-admin-leplus",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=256&q=80",
    createdAt: new Date().toISOString(),
    password: "admin123",
    subscriptionExpiresAt: "2030-12-31T23:59:59.000Z",
    accountType: "premium",
    verified: true
  },
  {
    id: "usr-admin-zed",
    email: "admin@azed.info",
    fullName: "M. Nabil Chaouch",
    role: "admin",
    grade: "Direction",
    section: "Informatique",
    status: "active",
    activeSessionId: "session-admin-zed",
    avatarUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=256&q=80",
    createdAt: new Date().toISOString(),
    password: "admin123",
    subscriptionExpiresAt: "2030-12-31T23:59:59.000Z",
    accountType: "premium",
    verified: true
  },
  {
    id: "usr-agent-01",
    email: "agent.validation@azed.info",
    fullName: "Validateur A-zed",
    role: "agent",
    grade: "Secrétariat",
    section: "Finances & Reçus",
    status: "active",
    activeSessionId: null,
    avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=256&q=80",
    createdAt: new Date().toISOString(),
    password: "agent123",
    subscriptionExpiresAt: "2030-12-31T23:59:59.000Z",
    accountType: "premium",
    verified: true
  },
  {
    id: "usr-student-fedi",
    email: "fedi.freemium@azed.info",
    fullName: "Fedi Ben Ali",
    role: "student",
    grade: "4ème Année",
    section: "Sciences de l'Informatique",
    status: "active",
    activeSessionId: null,
    avatarUrl: "",
    createdAt: new Date().toISOString(),
    password: "student123",
    accountType: "freemium",
    tier: "FREEMIUM",
    badgeLabel: "Freemium",
    verified: true
  },
  {
    id: "usr-student-yasmine",
    email: "yasmine.premium@azed.info",
    fullName: "Yasmine Mansour",
    role: "student",
    grade: "4ème Année",
    section: "Sciences de l'Informatique",
    status: "active",
    activeSessionId: null,
    avatarUrl: "",
    createdAt: new Date().toISOString(),
    password: "student123",
    accountType: "premium",
    tier: "PREMIUM",
    badgeLabel: "Pack Trimestriel",
    subscriptionExpiresAt: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true
  },
  {
    id: "usr-student-mohamed",
    email: "med.bac2026@azed.info",
    fullName: "Mohamed Trabelsi",
    role: "student",
    grade: "4ème Année",
    section: "Sciences de l'Informatique",
    status: "active",
    activeSessionId: null,
    avatarUrl: "",
    createdAt: new Date().toISOString(),
    password: "student123",
    accountType: "premium",
    tier: "PREMIUM_PLUS_PLUS",
    badgeLabel: "Intégral BAC 2026",
    subscriptionExpiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
    verified: true
  }
];

export const initLocalStorageDatabase = (): User[] => {
  try {
    const rawUsers = localStorage.getItem("users");
    if (!rawUsers) {
      localStorage.setItem("users", JSON.stringify(PRESEEDED_USERS));
      return PRESEEDED_USERS;
    }
    const parsedUsers: User[] = JSON.parse(rawUsers);
    // Ensure critical admin accounts exist in local DB
    PRESEEDED_USERS.forEach((preUser) => {
      if (!parsedUsers.some((u) => u.email.toLowerCase() === preUser.email.toLowerCase())) {
        parsedUsers.push(preUser);
      }
    });
    localStorage.setItem("users", JSON.stringify(parsedUsers));
    return parsedUsers;
  } catch (err) {
    console.warn("LocalStorage unavailable, using static fallback:", err);
    return PRESEEDED_USERS;
  }
};

// 3. AUTHENTICATION SERVICES (SUPABASE + LOCALSTORAGE FALLBACK)
export interface AuthResponse {
  user: User | null;
  sessionToken: string | null;
  error: Error | null;
}

export const signUpUser = async (payload: {
  email: string;
  password?: string;
  fullName: string;
  phone?: string;
  grade?: string;
  section?: string;
  city?: string;
  highSchool?: string;
  accountType?: "freemium" | "premium";
  tier?: any;
  tierBadge?: string;
  amount?: number;
  paymentMethod?: string;
  receiptUrl?: string;
}): Promise<AuthResponse> => {
  const localUsers = initLocalStorageDatabase();
  const emailClean = payload.email.trim().toLowerCase();

  // 1. Try Supabase Auth if configured
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email: emailClean,
        password: payload.password || "student123",
        options: {
          data: {
            full_name: payload.fullName,
            phone: payload.phone,
            grade: payload.grade,
            section: payload.section
          }
        }
      });

      if (!error && data.user) {
        const newUser: User = {
          id: data.user.id,
          email: emailClean,
          fullName: payload.fullName,
          role: "student",
          grade: payload.grade || "4ème Année",
          section: payload.section || "Sciences de l'Informatique",
          status: payload.accountType === "freemium" ? "active" : "pending",
          activeSessionId: data.session?.access_token || null,
          avatarUrl: "",
          createdAt: new Date().toISOString(),
          password: payload.password,
          accountType: payload.accountType || "freemium",
          tier: payload.tier || "FREEMIUM",
          badgeLabel: payload.tierBadge || "Freemium",
          city: payload.city,
          highSchool: payload.highSchool,
          phone: payload.phone,
          verified: payload.accountType === "freemium"
        };

        // Sync profile into Supabase 'profiles' or 'users' table if it exists
        try {
          await supabase.from("profiles").upsert({
            id: newUser.id,
            email: newUser.email,
            full_name: newUser.fullName,
            role: newUser.role,
            grade: newUser.grade,
            section: newUser.section,
            account_type: newUser.accountType,
            status: newUser.status,
            created_at: newUser.createdAt
          });
        } catch (e) {
          console.log("Supabase table 'profiles' write optional:", e);
        }

        // Also save to local storage as fallback
        const existingIdx = localUsers.findIndex((u) => u.email.toLowerCase() === emailClean);
        if (existingIdx >= 0) {
          localUsers[existingIdx] = newUser;
        } else {
          localUsers.push(newUser);
        }
        localStorage.setItem("users", JSON.stringify(localUsers));

        return {
          user: newUser,
          sessionToken: data.session?.access_token || "sb_session_" + data.user.id,
          error: null
        };
      }
    } catch (sbErr) {
      console.warn("Supabase auth signup failed, falling back to local DB:", sbErr);
    }
  }

  // 2. Fallback to LocalStorage Auth Engine
  const existingUser = localUsers.find((u) => u.email.toLowerCase() === emailClean);
  if (existingUser) {
    return {
      user: null,
      sessionToken: null,
      error: new Error("Un compte existe déjà avec cette adresse email.")
    };
  }

  const newLocalUser: User = {
    id: "usr-" + Date.now() + "-" + Math.random().toString(36).substring(2, 6),
    email: emailClean,
    fullName: payload.fullName.trim(),
    role: "student",
    grade: payload.grade || "4ème Année",
    section: payload.section || "Sciences de l'Informatique",
    status: payload.accountType === "freemium" ? "active" : "pending",
    activeSessionId: "local_session_" + Date.now(),
    avatarUrl: "",
    createdAt: new Date().toISOString(),
    password: payload.password,
    accountType: payload.accountType || "freemium",
    tier: payload.tier || "FREEMIUM",
    badgeLabel: payload.tierBadge || "Freemium",
    city: payload.city,
    highSchool: payload.highSchool,
    phone: payload.phone,
    verified: payload.accountType === "freemium"
  };

  localUsers.push(newLocalUser);
  localStorage.setItem("users", JSON.stringify(localUsers));

  return {
    user: newLocalUser,
    sessionToken: newLocalUser.activeSessionId,
    error: null
  };
};

export const signInUser = async (email: string, password?: string): Promise<AuthResponse> => {
  const localUsers = initLocalStorageDatabase();
  const emailClean = email.trim().toLowerCase();

  // 1. Try Supabase Auth if configured
  if (supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailClean,
        password: password || ""
      });

      if (!error && data.user) {
        // Try to fetch custom profile from 'profiles' or 'users'
        let userProfile: User | null = null;
        try {
          const { data: profile } = await supabase
            .from("profiles")
            .select("*")
            .eq("id", data.user.id)
            .single();
          if (profile) {
            userProfile = {
              id: profile.id,
              email: profile.email || data.user.email || emailClean,
              fullName: profile.full_name || profile.fullName || data.user.user_metadata?.full_name || emailClean.split('@')[0],
              role: profile.role || "student",
              grade: profile.grade || "4ème Année",
              section: profile.section || "Sciences de l'Informatique",
              status: profile.status || "active",
              activeSessionId: data.session?.access_token || null,
              avatarUrl: profile.avatar_url || "",
              createdAt: profile.created_at || new Date().toISOString(),
              accountType: profile.account_type || "premium"
            };
          }
        } catch (pErr) {
          console.log("No custom Supabase profile row found, constructing fallback user profile.");
        }

        if (!userProfile) {
          // Check if user exists in local DB to retain fields
          const matchedLocal = localUsers.find((u) => u.email.toLowerCase() === emailClean);
          userProfile = matchedLocal || {
            id: data.user.id,
            email: emailClean,
            fullName: data.user.user_metadata?.full_name || (emailClean.includes('leplus') || emailClean.includes('admin') ? "M. Nabil Chaouch" : emailClean.split('@')[0]),
            role: emailClean.includes('leplus') || emailClean.includes('admin') ? "admin" : emailClean.includes('agent') ? "agent" : "student",
            grade: "4ème Année",
            section: "Sciences de l'Informatique",
            status: "active",
            activeSessionId: data.session?.access_token || null,
            avatarUrl: "",
            createdAt: new Date().toISOString(),
            accountType: "premium"
          };
        }

        return {
          user: userProfile,
          sessionToken: data.session?.access_token || "sb_token_" + data.user.id,
          error: null
        };
      }
    } catch (sbAuthErr) {
      console.warn("Supabase auth login failed, checking local database:", sbAuthErr);
    }
  }

  // 2. Fallback to LocalStorage Auth Engine
  const matched = localUsers.find((u) => u.email.toLowerCase() === emailClean);
  if (!matched) {
    return {
      user: null,
      sessionToken: null,
      error: new Error("Identifiants invalides. Veuillez vérifier votre adresse e-mail.")
    };
  }

  if (password && matched.password && matched.password !== password) {
    return {
      user: null,
      sessionToken: null,
      error: new Error("Mot de passe incorrect. Veuillez réessayer.")
    };
  }

  const updatedUser: User = {
    ...matched,
    activeSessionId: "session_" + Date.now() + "_" + Math.random().toString(36).substring(2, 6)
  };

  // Sync back active session ID
  const idx = localUsers.findIndex((u) => u.id === updatedUser.id);
  if (idx >= 0) {
    localUsers[idx] = updatedUser;
    localStorage.setItem("users", JSON.stringify(localUsers));
  }

  return {
    user: updatedUser,
    sessionToken: updatedUser.activeSessionId,
    error: null
  };
};

export const signOutUser = async (): Promise<void> => {
  if (supabase) {
    try {
      await supabase.auth.signOut();
    } catch (e) {
      console.warn("Supabase signout failed silently:", e);
    }
  }
  localStorage.removeItem("current_user");
  localStorage.removeItem("session_token");
};

export const getCurrentSessionUser = async (): Promise<User | null> => {
  // Check Supabase session first if available
  if (supabase) {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const localUsers = initLocalStorageDatabase();
        const sbUser = data.session.user;
        const matchedLocal = localUsers.find(
          (u) => u.email.toLowerCase() === (sbUser.email || '').toLowerCase()
        );
        if (matchedLocal) return matchedLocal;

        return {
          id: sbUser.id,
          email: sbUser.email || "",
          fullName: sbUser.user_metadata?.full_name || sbUser.email?.split('@')[0] || "Utilisateur",
          role: sbUser.email?.includes('admin') || sbUser.email?.includes('leplus') ? "admin" : "student",
          grade: "4ème Année",
          section: "Sciences de l'Informatique",
          status: "active",
          activeSessionId: data.session.access_token,
          avatarUrl: "",
          createdAt: new Date().toISOString()
        };
      }
    } catch (e) {
      console.warn("Failed reading Supabase session, reading local storage:", e);
    }
  }

  // Fallback to reading localStorage
  try {
    const raw = localStorage.getItem("current_user");
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return null;
};

// 4. DUAL DATA ADAPTER FOR USERS & RECEIPTS
export const fetchUsersDual = async (): Promise<User[]> => {
  const localUsers = initLocalStorageDatabase();
  if (supabase) {
    try {
      const { data, error } = await supabase.from("profiles").select("*");
      if (!error && data && data.length > 0) {
        const mappedUsers: User[] = data.map((p: any) => ({
          id: p.id,
          email: p.email,
          fullName: p.full_name || p.fullName || p.email,
          role: p.role || "student",
          grade: p.grade || "4ème Année",
          section: p.section || "Sciences de l'Informatique",
          status: p.status || "active",
          activeSessionId: null,
          avatarUrl: p.avatar_url || "",
          createdAt: p.created_at || new Date().toISOString(),
          accountType: p.account_type || "premium",
          verified: p.verified !== undefined ? p.verified : true
        }));

        // Merge local admin accounts to guarantee admin access never breaks
        PRESEEDED_USERS.forEach((admin) => {
          if (!mappedUsers.some((u) => u.email.toLowerCase() === admin.email.toLowerCase())) {
            mappedUsers.unshift(admin);
          }
        });
        return mappedUsers;
      }
    } catch (e) {
      console.warn("Supabase profiles query failed, returning local storage users:", e);
    }
  }
  return localUsers;
};

export const saveUserDual = async (user: User): Promise<boolean> => {
  const localUsers = initLocalStorageDatabase();
  const idx = localUsers.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
  if (idx >= 0) {
    localUsers[idx] = { ...localUsers[idx], ...user };
  } else {
    localUsers.push(user);
  }
  localStorage.setItem("users", JSON.stringify(localUsers));

  if (supabase) {
    try {
      await supabase.from("profiles").upsert({
        id: user.id,
        email: user.email,
        full_name: user.fullName,
        role: user.role,
        grade: user.grade,
        section: user.section,
        status: user.status,
        account_type: user.accountType
      });
    } catch (e) {
      console.warn("Failed saving user to Supabase profile table:", e);
    }
  }
  return true;
};

export const deleteUserDual = async (userId: string): Promise<boolean> => {
  const localUsers = initLocalStorageDatabase();
  const filtered = localUsers.filter((u) => u.id !== userId);
  localStorage.setItem("users", JSON.stringify(filtered));

  if (supabase) {
    try {
      await supabase.from("profiles").delete().eq("id", userId);
    } catch (e) {
      console.warn("Failed deleting user from Supabase profiles:", e);
    }
  }
  return true;
};

export const fetchReceiptsDual = async (): Promise<PaymentReceipt[]> => {
  try {
    const raw = localStorage.getItem("receipts");
    const localReceipts: PaymentReceipt[] = raw ? JSON.parse(raw) : [];

    if (supabase) {
      try {
        const { data, error } = await supabase.from("receipts").select("*");
        if (!error && data && data.length > 0) {
          return data.map((r: any) => ({
            id: r.id,
            userId: r.user_id || r.userId,
            userName: r.user_name || r.userName,
            userEmail: r.user_email || r.userEmail,
            grade: r.grade || "4ème Année",
            amount: Number(r.amount) || 0,
            paymentMethod: r.payment_method || r.paymentMethod || "D17",
            receiptUrl: r.receipt_url || r.receiptUrl || "",
            status: r.status || "pending",
            uploadedAt: r.uploaded_at || r.uploadedAt || new Date().toISOString()
          }));
        }
      } catch (e) {
        console.warn("Supabase receipts query failed, fallback to local storage:", e);
      }
    }
    return localReceipts;
  } catch (err) {
    return [];
  }
};

export const saveReceiptDual = async (receipt: PaymentReceipt): Promise<boolean> => {
  try {
    const raw = localStorage.getItem("receipts");
    const receipts: PaymentReceipt[] = raw ? JSON.parse(raw) : [];
    receipts.unshift(receipt);
    localStorage.setItem("receipts", JSON.stringify(receipts));

    if (supabase) {
      try {
        await supabase.from("receipts").insert({
          id: receipt.id,
          user_id: receipt.userId,
          user_name: receipt.userName,
          user_email: receipt.userEmail,
          grade: receipt.grade,
          amount: receipt.amount,
          payment_method: receipt.paymentMethod,
          receipt_url: receipt.receiptUrl,
          status: receipt.status,
          uploaded_at: receipt.uploadedAt
        });
      } catch (e) {
        console.warn("Failed inserting receipt to Supabase:", e);
      }
    }
    return true;
  } catch (err) {
    return false;
  }
};
