import { SubscriptionTier, normalizeSubscriptionTier } from '../constants/packages';
import { ZED_BADGE_EVENT } from '../components/AuthContext';

export const ZED_USER_DATA_SYNCED_EVENT = 'zed_user_data_synced';
export const ZED_BADGE_SYNC_EVENT = 'zed_badge_sync_event';
const badgeChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('zed_badge_sync') : null;

export interface UserProfile {
  id: string; // Identifiant unique absolu
  _id?: string;
  email: string;
  fullName?: string;
  nom?: string;
  prenom?: string;
  badge: SubscriptionTier | string;
  subscriptionTier?: string;
  offer?: string;
  pack?: string;
  filiere?: string;
  section?: string;
  niveau?: string;
  grade?: string;
  academicLevel?: string;
  role?: string;
  progressHistory?: any[];
  quizHistory?: any[];
  purchaseHistory?: any[];
  packs?: string[];
  activePackages?: string[];
  userCategory?: string;
  accountType?: 'freemium' | 'premium' | string;
  [key: string]: any;
}

export const updateStudentBadgeGlobally = (userId: string, newBadge: string) => {
  if (!userId || !newBadge) return;
  const normalizedBadge = normalizeSubscriptionTier(newBadge);

  // 1. Mise à jour de la liste centrale de tous les utilisateurs (Base / Storage)
  try {
    const allUsers = JSON.parse(localStorage.getItem('zed_users') || '[]');
    if (Array.isArray(allUsers)) {
      const updatedUsers = allUsers.map((u: any) => {
        if (u.id === userId || u._id === userId || u.email === userId) {
          return {
            ...u,
            badge: normalizedBadge,
            subscriptionTier: normalizedBadge,
            offer: normalizedBadge,
            pack: normalizedBadge,
            userCategory: normalizedBadge,
            activePackages: [normalizedBadge],
            packs: [normalizedBadge]
          };
        }
        return u;
      });
      localStorage.setItem('zed_users', JSON.stringify(updatedUsers));
    }
  } catch (e) {
    console.warn("Erreur mise à jour zed_users dans updateStudentBadgeGlobally:", e);
  }

  // 2. Vérification et synchronisation de la session de l'étudiant connecté
  try {
    const activeSessionRaw = localStorage.getItem('zed_user_session') || localStorage.getItem('current_user') || localStorage.getItem('user_profile');
    if (activeSessionRaw) {
      const activeUser = JSON.parse(activeSessionRaw);
      if (activeUser.id === userId || activeUser._id === userId || activeUser.email === userId) {
        const updatedSession = {
          ...activeUser,
          badge: normalizedBadge,
          subscriptionTier: normalizedBadge,
          offer: normalizedBadge,
          pack: normalizedBadge,
          userCategory: normalizedBadge,
          activePackages: [normalizedBadge],
          packs: [normalizedBadge],
          accountType: normalizedBadge === 'FREEMIUM' ? 'freemium' : 'premium'
        };

        const serialized = JSON.stringify(updatedSession);
        localStorage.setItem('zed_user_session', serialized);
        localStorage.setItem('current_user', serialized);
        localStorage.setItem('user_profile', serialized);
      }
    }
  } catch (e) {
    console.warn("Erreur mise à jour session active dans updateStudentBadgeGlobally:", e);
  }

  // 3. Émission des événements de synchronisation globale pour re-rendu React immédiat sans F5
  window.dispatchEvent(new CustomEvent(ZED_BADGE_SYNC_EVENT, { 
    detail: { userId, badge: normalizedBadge, newBadge: normalizedBadge } 
  }));
  window.dispatchEvent(new CustomEvent(ZED_USER_DATA_SYNCED_EVENT, { 
    detail: { id: userId, userId, badge: normalizedBadge, subscriptionTier: normalizedBadge } 
  }));
  window.dispatchEvent(new CustomEvent(ZED_BADGE_EVENT, { 
    detail: { userId, newBadge: normalizedBadge } 
  }));
  badgeChannel?.postMessage({ userId, newBadge: normalizedBadge });
};

// Fonction centrale de synchronisation globale
export const syncAndSaveUser = (updatedUser: Partial<UserProfile> & { id?: string; email?: string; _id?: string }) => {
  if (!updatedUser) return;
  const targetId = updatedUser.id || updatedUser._id || '';
  const targetEmail = (updatedUser.email || '').toLowerCase().trim();
  const canonicalBadge = normalizeSubscriptionTier(updatedUser.badge || updatedUser.subscriptionTier || 'FREEMIUM');

  if (targetId) {
    updateStudentBadgeGlobally(targetId, canonicalBadge);
  } else if (targetEmail) {
    // Find ID from zed_users
    try {
      const allUsers = JSON.parse(localStorage.getItem('zed_users') || '[]');
      const found = allUsers.find((u: any) => u.email && u.email.toLowerCase().trim() === targetEmail);
      if (found?.id) {
        updateStudentBadgeGlobally(found.id, canonicalBadge);
      }
    } catch (e) {}
  }
};

export default updateStudentBadgeGlobally;
