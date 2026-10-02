import { SubscriptionTier } from '../types';
import { normalizeSubscriptionTier } from '../constants/packages';

export type { SubscriptionTier };

export const BADGE_RANKS: Record<string, number> = {
  'Freemium': 1,
  'FREEMIUM': 1,
  'Essentiel': 2,
  'ESSENTIEL': 2,
  'Live +': 3,
  'LIVE +': 3,
  'Révision +': 4,
  'RÉVISION +': 4,
  'Intégrale': 5,
  'INTÉGRALE': 5
};

export const hasAccessToResource = (userBadge: string, requiredBadge: string): boolean => {
  const normUser = normalizeSubscriptionTier(userBadge);
  const normReq = normalizeSubscriptionTier(requiredBadge);
  const userRank = BADGE_RANKS[normUser] || BADGE_RANKS[userBadge] || 1;
  const requiredRank = BADGE_RANKS[normReq] || BADGE_RANKS[requiredBadge] || 1;
  
  return userRank >= requiredRank;
};

export const BADGE_HIERARCHY = BADGE_RANKS;
export const hasAccess = hasAccessToResource;

/**
 * Strict exact-match content filtering based strictly on the student's active badge.
 * Evaluates the student's exact active badge against the document's allowedTiers array.
 */
export const filterResourcesForStudent = <T extends { 
  allowedTiers?: string[] | SubscriptionTier[]; 
  accessTiers?: string[] | SubscriptionTier[]; 
  tiers?: string[] | SubscriptionTier[]; 
  targetTiers?: string[] | SubscriptionTier[];
  target?: { userCategories?: string[] | SubscriptionTier[] };
}>(
  items: T[],
  studentBadge?: string | null
): T[] => {
  if (!items || !Array.isArray(items)) return [];

  const normalizedStudentBadge = normalizeSubscriptionTier(studentBadge).toUpperCase().trim();

  return items.filter((item) => {
    // Collect all possible tier keys for safety
    const itemTiers: (string | SubscriptionTier)[] = (Array.isArray(item.allowedTiers) && item.allowedTiers.length > 0)
      ? item.allowedTiers
      : (Array.isArray(item.accessTiers) && item.accessTiers.length > 0)
      ? item.accessTiers
      : (Array.isArray(item.tiers) && item.tiers.length > 0)
      ? item.tiers
      : (Array.isArray(item.targetTiers) && item.targetTiers.length > 0)
      ? item.targetTiers
      : (Array.isArray(item.target?.userCategories) && item.target.userCategories.length > 0)
      ? item.target.userCategories
      : ['FREEMIUM']; // Default fallback if unspecified

    // Strict inclusion check: must include student's active badge
    return itemTiers.some(
      (tier) => normalizeSubscriptionTier(tier).toUpperCase().trim() === normalizedStudentBadge
    );
  });
};

export const canStudentViewDocument = (studentPackage: string, documentAllowedTiers: string[]): boolean => {
  if (!documentAllowedTiers || !Array.isArray(documentAllowedTiers) || documentAllowedTiers.length === 0) {
    return normalizeSubscriptionTier(studentPackage) === 'FREEMIUM';
  }

  const normalizedStudentBadge = normalizeSubscriptionTier(studentPackage).toUpperCase().trim();
  return documentAllowedTiers.some(
    (tier) => normalizeSubscriptionTier(tier).toUpperCase().trim() === normalizedStudentBadge
  );
};

export const filterContentByBadge = filterResourcesForStudent;

/**
 * Strict file visibility filtering by multiple badges.
 * A document is visible IF AND ONLY IF the student's active badge is contained in the document's allowedTiers.
 */
export const getVisibleDocumentsForStudent = <T extends {
  allowedTiers?: string[] | SubscriptionTier[];
  accessTiers?: string[] | SubscriptionTier[];
  tiers?: string[] | SubscriptionTier[];
  targetTiers?: string[] | SubscriptionTier[];
  target?: { userCategories?: string[] | SubscriptionTier[] };
}>(
  documents: T[],
  studentBadge?: string | null
): T[] => {
  if (!documents || !Array.isArray(documents) || !studentBadge) return [];

  const normalizedStudentBadge = normalizeSubscriptionTier(studentBadge).toUpperCase().trim();

  return documents.filter((doc) => {
    const tiers = Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
      ? doc.allowedTiers
      : Array.isArray(doc.accessTiers) && doc.accessTiers.length > 0
      ? doc.accessTiers
      : Array.isArray(doc.tiers) && doc.tiers.length > 0
      ? doc.tiers
      : Array.isArray(doc.targetTiers) && doc.targetTiers.length > 0
      ? doc.targetTiers
      : Array.isArray(doc.target?.userCategories) && doc.target.userCategories.length > 0
      ? doc.target.userCategories
      : ['FREEMIUM'];

    return tiers.some(
      (tier) => normalizeSubscriptionTier(tier).toUpperCase().trim() === normalizedStudentBadge
    );
  });
};

export default filterResourcesForStudent;
