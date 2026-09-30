import { useEffect, useState } from 'react';
import { useRealtimeSync } from '../lib/useRealtimeSync';

export function canAccessContent(user: any, content: any): boolean {
  if (!user) return false;
  if (user.isBlocked || user.status === 'disabled' || user.status === 'Bloqué') return false;

  // 1. Verify academic level / grade and section / branch
  const userLevel = (user.academicLevel || user.grade || user.level || '').toLowerCase().trim();
  const userSection = (user.section || user.filiere || user.stream || '').toLowerCase().trim();

  const contentLevel = (content.academicLevel || content.grade || content.level || 'Tous').toLowerCase().trim();
  const contentSection = (content.section || content.filiere || content.field || 'Tous').toLowerCase().trim();

  const levelMatch =
    contentLevel.includes('tous') ||
    !userLevel ||
    contentLevel === userLevel ||
    (userLevel.includes('4') && contentLevel.includes('4')) ||
    (userLevel.includes('bac') && contentLevel.includes('4'));

  const sectionMatch =
    contentSection.includes('tous') ||
    contentSection.includes('toutes') ||
    !userSection ||
    contentSection === userSection ||
    contentSection.includes(userSection) ||
    userSection.includes(contentSection);

  if (!levelMatch || !sectionMatch) return false;

  // 2. Verify plan or specific license / activeLicenses
  const plan = String(user.plan || user.userCategory || user.subscriptionType || user.accountType || 'FREEMIUM').toUpperCase();
  if (plan.includes('PREMIUM') || plan.includes('ESSENTIEL') || plan.includes('ANNUEL')) return true;

  if (content.isPremium === false || content.accessStatus === 'FREEMIUM' || content.isFreemium === true) return true;

  const activeLicenses = user.activeLicenses || user.accessibleModules || user.packs || [];
  if (Array.isArray(activeLicenses)) {
    if (activeLicenses.includes('full_access') || activeLicenses.includes('freemium_access')) return true;
    const cat = String(content.category || content.contentType || content.moduleId || '').toLowerCase();
    if (cat && activeLicenses.some((lic: string) => String(lic).toLowerCase().includes(cat) || cat.includes(String(lic).toLowerCase()))) {
      return true;
    }
  }

  return false;
}

export const useUserAccess = (initialUser?: any) => {
  const [user, setUser] = useState<any>(() => {
    if (initialUser) return initialUser;
    try {
      const stored = localStorage.getItem('current_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  useEffect(() => {
    if (initialUser) {
      setUser(initialUser);
    }
  }, [initialUser]);

  useRealtimeSync((msg) => {
    if (
      msg.type === 'PROFILE_UPDATED_BY_ADMIN' ||
      msg.type === 'ACCOUNT_UPDATED' ||
      msg.type === 'USER_UPDATED' ||
      msg.type === 'ADMIN_REFRESH_USERS_LIST'
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

  const checkAccess = (content: any) => canAccessContent(user, content);

  return { user, canAccessContent: checkAccess, checkAccess };
};

export default useUserAccess;
