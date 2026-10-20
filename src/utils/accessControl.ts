import { SubscriptionTier, USER_RANK } from '../types';
import { normalizeSubscriptionTier } from '../constants/packages';
import { hasAccessToContent, normalizeBadge } from '../constants/badges';

export type { SubscriptionTier };
export { hasAccessToContent, USER_RANK };

export const BADGE_RANKS: Record<string, number> = {
  'Freemium': 0,
  'FREEMIUM': 0,
  'Essentiel': 1,
  'ESSENTIEL': 1,
  'Live +': 2,
  'LIVE +': 2,
  'LIVE+': 2,
  'Révision +': 3,
  'RÉVISION +': 3,
  'REVISION+': 3,
  'Intégrale': 4,
  'INTÉGRALE': 4,
  'INTEGRAL': 4
};

export const hasAccessToResource = (userBadge: string, requiredBadge: string): boolean => {
  const userNorm = normalizeBadge(userBadge || 'FREEMIUM');
  const reqNorm = normalizeBadge(requiredBadge || 'FREEMIUM');
  return (USER_RANK[userNorm] ?? 0) >= (USER_RANK[reqNorm] ?? 0);
};

export const BADGE_HIERARCHY = BADGE_RANKS;
export const hasAccess = hasAccessToResource;

function extractMinRank(item: any): number {
  if (!item) return 0;
  const explicit = item.minBadge || item.requiredBadge || item.badge || item.badgeType || item.tier;
  if (explicit) {
    const rank = USER_RANK[normalizeBadge(String(explicit))] ?? 0;
    if (rank > 0) return rank;
  }
  const itemTiers: any[] = (Array.isArray(item.allowedBadges) && item.allowedBadges.length > 0)
    ? item.allowedBadges
    : (Array.isArray(item.allowedTiers) && item.allowedTiers.length > 0)
    ? item.allowedTiers
    : (Array.isArray(item.accessTiers) && item.accessTiers.length > 0)
    ? item.accessTiers
    : (Array.isArray(item.tiers) && item.tiers.length > 0)
    ? item.tiers
    : (Array.isArray(item.targetTiers) && item.targetTiers.length > 0)
    ? item.targetTiers
    : (Array.isArray(item.target?.userCategories) && item.target.userCategories.length > 0)
    ? item.target.userCategories
    : [];

  if (itemTiers.length > 0) {
    const norms = itemTiers.map((t) => normalizeBadge(String(t)));
    if (norms.includes('FREEMIUM') && !item.isPremium) return 0;
    const minRank = Math.min(...norms.map((n) => USER_RANK[n] ?? 0));
    return item.isPremium ? Math.max(1, minRank) : minRank;
  }
  return item.isPremium ? 1 : 0;
}

export const filterResourcesForStudent = <T extends Record<string, any>>(
  items: T[],
  studentBadge?: string | null
): T[] => {
  if (!items || !Array.isArray(items)) return [];
  const userRank = USER_RANK[normalizeBadge(studentBadge || 'FREEMIUM')] ?? 0;
  return items.filter((item) => userRank >= extractMinRank(item));
};

export const canStudentViewDocument = (studentPackage: string, documentAllowedTiers: string[]): boolean => {
  const userRank = USER_RANK[normalizeBadge(studentPackage || 'FREEMIUM')] ?? 0;
  if (!documentAllowedTiers || !Array.isArray(documentAllowedTiers) || documentAllowedTiers.length === 0) {
    return userRank >= 0;
  }
  const norms = documentAllowedTiers.map((t) => normalizeBadge(String(t)));
  if (norms.includes('FREEMIUM')) return true;
  const minRank = Math.min(...norms.map((n) => USER_RANK[n] ?? 0));
  return userRank >= minRank;
};

export const filterContentByBadge = filterResourcesForStudent;

export const getVisibleDocumentsForStudent = <T extends Record<string, any>>(
  documents: T[],
  studentBadge?: string | null
): T[] => {
  return filterResourcesForStudent(documents, studentBadge);
};

export default filterResourcesForStudent;
