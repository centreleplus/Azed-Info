import React, { useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';

export const StudentProfileSync: React.FC = () => {
  const { user, refreshUserData } = useAuth();
  const userId = user?.id || user?.email;
  const isSyncingRef = useRef(false);

  useEffect(() => {
    const handleSync = async () => {
      if (user && user.role === 'student' && !isSyncingRef.current) {
        isSyncingRef.current = true;
        try {
          await refreshUserData();
        } finally {
          isSyncingRef.current = false;
        }
      }
    };

    window.addEventListener('hashchange', handleSync);

    return () => {
      window.removeEventListener('hashchange', handleSync);
    };
  }, [userId, user?.role, refreshUserData]);

  return null;
};

