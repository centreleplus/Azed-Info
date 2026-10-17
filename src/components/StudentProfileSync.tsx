import React, { useEffect } from 'react';
import { useAuth } from './AuthContext';

export const StudentProfileSync: React.FC = () => {
  const { user, setUser, refreshUserData } = useAuth();

  useEffect(() => {
    const handleSync = async () => {
      if (user && user.role === 'student') {
        await refreshUserData();
      }
    };

    window.addEventListener('hashchange', handleSync);
    // Initial sync
    handleSync();

    return () => {
      window.removeEventListener('hashchange', handleSync);
    };
  }, [user, refreshUserData]);

  return null;
};
