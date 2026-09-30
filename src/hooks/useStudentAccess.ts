import { useEffect, useState } from 'react';
import { useRealtimeSync } from '../lib/useRealtimeSync';

export const useStudentAccess = (initialUser: any) => {
  const [user, setUser] = useState(initialUser);

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  useRealtimeSync((msg) => {
    if (
      msg.type === 'PROFILE_UPDATED_BY_ADMIN' ||
      msg.type === 'ACCOUNT_UPDATED' ||
      msg.type === 'USER_UPDATED'
    ) {
      const updated = msg.userProfile || msg.studentData || msg.user || msg.payload;
      if (updated && user && (updated.id === user.id || updated._id === user._id || updated.email?.toLowerCase() === user.email?.toLowerCase())) {
        const merged = { ...user, ...updated };
        setUser(merged);
        try {
          localStorage.setItem('current_user', JSON.stringify(merged));
        } catch (e) {}
      }
    }
  });

  // Fonction utilitaire de vérification de déblocage de fichier
  const canDownloadDocument = (doc: any) => {
    if (!user) return false;
    if (user.isBlocked || user.status === 'disabled' || user.status === 'Bloqué') return false;
    if (doc.accessStatus === 'FREEMIUM' || doc.isPremium === false) return true;

    const userCategory = String(user.userCategory || user.subscriptionType || user.accountType || 'FREEMIUM').toUpperCase();
    if (userCategory.includes('ESSENTIEL') || userCategory.includes('PREMIUM') || userCategory.includes('ANNUEL')) {
      return true;
    }

    const activePacks = user.activePackages || user.packs || [];
    if (Array.isArray(activePacks) && activePacks.some((p: string) => p.toUpperCase() === String(doc.accessStatus).toUpperCase())) {
      return true;
    }

    return false;
  };

  return { user, canDownloadDocument };
};

export default useStudentAccess;
