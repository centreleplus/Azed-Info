import React, { createContext, useContext, useState, useEffect } from "react";
import { User as UserType } from "../types";
import { useRealtimeSync } from "../lib/useRealtimeSync";

interface AuthContextType {
  user: UserType | null;
  setUser: (user: UserType | null) => void;
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
  const [user, setUser] = useState<UserType | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("current_user");
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        console.warn("Failed to parse stored user from localStorage:", e);
      }
    }
  }, []);

  const handleSetUser = (u: UserType | null) => {
    setUser(u);
    if (u) {
      localStorage.setItem("current_user", JSON.stringify(u));
      if (u.activeSessionId) {
        localStorage.setItem("active_session_id", u.activeSessionId);
      }
    } else {
      localStorage.removeItem("current_user");
      localStorage.removeItem("session_token");
      localStorage.removeItem("active_session_id");
      try {
        sessionStorage.clear();
      } catch (e) {}
    }
  };

  useRealtimeSync((msg) => {
    if (
      msg.type === "ACCOUNT_UPDATED" ||
      msg.type === "USER_UPDATED" ||
      msg.type === "ADMIN_STUDENT_LIST_UPDATED"
    ) {
      const targetUser = msg.studentData || msg.payload || msg.user;
      if (targetUser && user && (targetUser.id === user.id || targetUser.email?.toLowerCase() === user.email?.toLowerCase())) {
        const mergedUser = { ...user, ...targetUser };
        handleSetUser(mergedUser);
      }
    }
  });

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}
