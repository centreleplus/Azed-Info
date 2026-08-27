import React, { useEffect } from "react";
import { useAuth } from "./AuthContext";
import { getDefaultRouteForRole } from "./AppRoutes";

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole?: "student" | "admin" | "agent" | string;
  allowedRoles?: ("student" | "admin" | "agent" | string)[];
  fallbackTab?: string;
  onUnauthorized?: (message: string) => void;
}

export function ProtectedRoute({ children, allowedRole, allowedRoles, fallbackTab, onUnauthorized }: ProtectedRouteProps) {
  const { user } = useAuth();
  const roles = allowedRoles || (allowedRole ? [allowedRole] : []);

  const isAllowed = !!(user && roles.map(r => r.toLowerCase()).includes(user.role.toLowerCase()));

  useEffect(() => {
    if (!isAllowed) {
      if (onUnauthorized) {
        onUnauthorized(`Accès Refusé : Vous n'avez pas l'autorisation d'accéder à cette section.`);
      }
      const targetFallback = user ? getDefaultRouteForRole(user.role) : (fallbackTab || "/student/courses");
      window.location.hash = `#${targetFallback}`;
    }
  }, [isAllowed, user, fallbackTab, onUnauthorized]);

  if (!isAllowed) {
    return null;
  }

  return <>{children}</>;
}
