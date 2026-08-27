import React, { createContext, useContext, useState, useEffect } from "react";
import { User as UserType } from "../types";

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
    } else {
      localStorage.removeItem("current_user");
    }
  };

  return (
    <AuthContext.Provider value={{ user, setUser: handleSetUser }}>
      {children}
    </AuthContext.Provider>
  );
}
