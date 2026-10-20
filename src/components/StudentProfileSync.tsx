import React, { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export const StudentProfileSync: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const userId = user?.id || user?.email || "";
  const userRole = user?.role || "";
  const hasSyncedRef = useRef<string>("");

  useEffect(() => {
    if (!userId || userRole !== 'student') return;
    if (hasSyncedRef.current === userId) return;
    hasSyncedRef.current = userId;

    refreshUserData();
  }, [userId, userRole, refreshUserData]);

  return null;
};

