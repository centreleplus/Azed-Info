import React, { createContext, useContext, useState, useEffect } from "react";
import { User as UserType } from "../types";
import { supabase, getCurrentSessionUser } from "../lib/supabase";

interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserType | null>(() => {
    try {
      const stored = localStorage.getItem("current_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Initial session check
    const initSession = async () => {
      try {
        const sessionUser = await getCurrentSessionUser();
        if (sessionUser) {
          setUser(sessionUser);
          localStorage.setItem("current_user", JSON.stringify(sessionUser));
        }
      } catch (err) {
        console.warn("Auth initialization error:", err);
      } finally {
        setLoading(false);
      }
    };

    initSession();

    // 2. Supabase Auth state listener if configured
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (event === "SIGNED_IN" && session?.user) {
          const sessionUser = await getCurrentSessionUser();
          if (sessionUser) {
            setUser(sessionUser);
            localStorage.setItem("current_user", JSON.stringify(sessionUser));
          }
        } else if (event === "SIGNED_OUT") {
          setUser(null);
          localStorage.removeItem("current_user");
          localStorage.removeItem("session_token");
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, []);

  const handleSetUser = (u: UserType | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("current_user", JSON.stringify(u));
    } else {
      localStorage.removeItem("current_user");
      localStorage.removeItem("session_token");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

