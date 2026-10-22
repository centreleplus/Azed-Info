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
  window.dispatchEvent(new CustomEvent('zed_force_auth_refresh'));
  badgeChannel?.postMessage({ userId, newBadge: normalizedBadge });
};

// Fonction centrale de synchronisation globale (Badge + Groupe Gr.A-Gr.Z + Profil)
export const syncAndSaveUser = (updatedUser: Partial<UserProfile> & { id?: string; email?: string; _id?: string }) => {
  if (!updatedUser) return;
  const targetId = updatedUser.id || updatedUser._id || '';
  const targetEmail = (updatedUser.email || '').toLowerCase().trim();
  const hasBadgeUpdate = Boolean(
    updatedUser.badge || updatedUser.activeBadge || updatedUser.subscriptionTier || updatedUser.userCategory
  );
  const canonicalBadge = hasBadgeUpdate
    ? normalizeSubscriptionTier(
        updatedUser.activeBadge || updatedUser.badge || updatedUser.subscriptionTier || updatedUser.userCategory || 'FREEMIUM'
      )
    : undefined;

  const patchFields: Record<string, any> = { ...updatedUser };
  if (canonicalBadge) {
    patchFields.badge = canonicalBadge;
    patchFields.activeBadge = canonicalBadge;
    patchFields.subscriptionTier = canonicalBadge;
    patchFields.offer = canonicalBadge;
    patchFields.pack = canonicalBadge;
    patchFields.userCategory = canonicalBadge;
    patchFields.activePackages = [canonicalBadge];
    patchFields.packs = [canonicalBadge];
    patchFields.accountType = canonicalBadge === 'FREEMIUM' ? 'freemium' : 'premium';
  }
  if (updatedUser.groupe_etude !== undefined || updatedUser.studyGroup !== undefined) {
    const grp = updatedUser.groupe_etude ?? updatedUser.studyGroup ?? '';
    patchFields.groupe_etude = grp;
    patchFields.studyGroup = grp;
    patchFields.study_group = grp;
  }
  if (
    updatedUser.grade !== undefined ||
    updatedUser.level !== undefined ||
    updatedUser.academicLevel !== undefined ||
    updatedUser.niveau !== undefined
  ) {
    const rawGrade =
      updatedUser.grade ?? updatedUser.level ?? updatedUser.academicLevel ?? updatedUser.niveau ?? '4ème';
    const str = String(rawGrade).trim();
    const lower = str.toLowerCase();
    let canonicalGrade = '4ème';
    if (lower.startsWith('1') || lower.includes('1ère') || lower.includes('1ere')) canonicalGrade = '1ère';
    else if (lower.startsWith('2') || lower.includes('2ème') || lower.includes('2eme')) canonicalGrade = '2ème';
    else if (lower.startsWith('3') || lower.includes('3ème') || lower.includes('3eme')) canonicalGrade = '3ème';
    else if (lower.startsWith('4') || lower.includes('4ème') || lower.includes('4eme') || lower.includes('bac')) canonicalGrade = '4ème';
    patchFields.grade = canonicalGrade;
    patchFields.level = canonicalGrade;
    patchFields.academicLevel = canonicalGrade;
    patchFields.niveau = canonicalGrade;
  }
  if (
    updatedUser.section !== undefined ||
    updatedUser.stream !== undefined ||
    updatedUser.filiere !== undefined
  ) {
    const sec = updatedUser.section ?? updatedUser.stream ?? updatedUser.filiere ?? "Sciences de l'Informatique";
    patchFields.section = sec;
    patchFields.stream = sec;
    patchFields.filiere = sec;
  }

  // 1. Mise à jour dans zed_users
  try {
    const allUsers = JSON.parse(localStorage.getItem('zed_users') || '[]');
    if (Array.isArray(allUsers)) {
      const updatedUsers = allUsers.map((u: any) => {
        const matchId = targetId && (u.id === targetId || u._id === targetId);
        const matchEmail = targetEmail && u.email && u.email.toLowerCase().trim() === targetEmail;
        if (matchId || matchEmail) {
          return { ...u, ...patchFields };
        }
        return u;
      });
      localStorage.setItem('zed_users', JSON.stringify(updatedUsers));
    }
  } catch (e) {}

  // 2. Mise à jour de la session active si l'élève modifié est actuellement connecté
  try {
    const sessionKeys = ['zed_user_session', 'current_user', 'user_profile', 'user'];
    const activeSessionRaw =
      localStorage.getItem('zed_user_session') ||
      localStorage.getItem('current_user') ||
      localStorage.getItem('user_profile') ||
      localStorage.getItem('user');
    if (activeSessionRaw) {
      const activeUser = JSON.parse(activeSessionRaw);
      const matchId = targetId && (activeUser.id === targetId || activeUser._id === targetId);
      const matchEmail = targetEmail && activeUser.email && activeUser.email.toLowerCase().trim() === targetEmail;
      if (matchId || matchEmail) {
        const updatedSession = {
          ...activeUser,
          ...patchFields
        };
        const serialized = JSON.stringify(updatedSession);
        sessionKeys.forEach((k) => localStorage.setItem(k, serialized));
        if (canonicalBadge) {
          localStorage.setItem('zed_active_badge', canonicalBadge);
        }
      }
    }
  } catch (e) {}

  // 3. Diffusion temps réel vers tous les composants et onglets
  if (canonicalBadge && targetId) {
    updateStudentBadgeGlobally(targetId, canonicalBadge);
  }
  window.dispatchEvent(
    new CustomEvent(ZED_USER_DATA_SYNCED_EVENT, { detail: { id: targetId, userId: targetId, ...patchFields } })
  );
  window.dispatchEvent(new CustomEvent('zed_force_auth_refresh'));
  badgeChannel?.postMessage({ userId: targetId, ...patchFields });
};

export default updateStudentBadgeGlobally;

