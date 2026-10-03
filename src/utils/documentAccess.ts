import { StudentTier, STUDENT_TIERS } from "../types/access";
import { normalizePackName, normalizeSubscriptionTier, PackType, SubscriptionTier } from "../constants/packages";
import { isContentAccessibleToStudent, canStudentAccessContent } from "../types";
import { filterResourcesForStudent } from "./accessControl";
import { hasAccess, normalizeBadgeName, isUserAuthorized } from "../config/badges";

/**
 * Normalizes any tier string, plan name, or forfait label into a canonical PackType.
 */
export function normalizeTier(val: any): PackType {
  return normalizePackName(val);
}

/**
 * Returns the active enrolled tier for a given student user.
 */
export function getStudentActiveTier(user: any): SubscriptionTier {
  if (!user) return "FREEMIUM";

  if (user.activeBadge) return normalizeSubscriptionTier(normalizeBadgeName(user.activeBadge));
  if (user.badge) return normalizeSubscriptionTier(normalizeBadgeName(user.badge));
  if (user.subscriptionTier) return normalizeSubscriptionTier(normalizeBadgeName(user.subscriptionTier));

  if (Array.isArray(user.activePackages) && user.activePackages.length > 0) {
    return normalizeSubscriptionTier(normalizeBadgeName(user.activePackages[0]));
  }
  if (Array.isArray(user.packs) && user.packs.length > 0) {
    return normalizeSubscriptionTier(normalizeBadgeName(user.packs[0]));
  }

  const candidate = user.userCategory || user.tier || user.tierCategory || user.badgeLabel || user.status || user.subscriptionPlan || user.forfait;
  if (candidate) {
    return normalizeSubscriptionTier(normalizeBadgeName(candidate));
  }

  return "FREEMIUM";
}

/**
 * Returns human-readable label for a StudentTier (e.g. 'Live +')
 */
export function getStudentTierLabel(tier: string): string {
  const norm = normalizePackName(tier);
  return STUDENT_TIERS[norm]?.label || norm;
}

/**
 * Evaluates whether a student user has access to a document based on target audience configuration.
 */
export function isDocumentAllowedForStudent(doc: any, user: any): boolean {
  if (!doc) return false;

  // Non-students (Admin, Professeurs / Agents) always have full access
  if (user && (user.role === "admin" || user.role === "agent")) {
    return true;
  }

  const studentTier = getStudentActiveTier(user);

  // 1. Check Grade & Stream accessibility
  if (user && user.role === "student") {
    const studentGrade = user.grade || user.gradeLevel || "";
    const studentStream = user.section || user.stream || "";
    if (doc.target) {
      const accessible = canStudentAccessContent(doc.target, {
        gradeLevel: studentGrade,
        stream: studentStream,
        category: studentTier
      });
      if (!accessible) return false;
    } else {
      const accessible = isContentAccessibleToStudent(
        doc.target,
        { gradeLevel: studentGrade, stream: studentStream, category: studentTier },
        { grade: doc.grade, section: doc.section }
      );
      if (!accessible) return false;
    }
  }

  // 2. Hierarchical and multi-badge inclusion check on allowed badges
  const audienceList: any[] =
    Array.isArray(doc.allowedBadges) && doc.allowedBadges.length > 0
      ? doc.allowedBadges
      : Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
      ? doc.allowedTiers
      : Array.isArray(doc.accessTiers) && doc.accessTiers.length > 0
      ? doc.accessTiers
      : Array.isArray(doc.tiers) && doc.tiers.length > 0
      ? doc.tiers
      : Array.isArray(doc.targetTiers) && doc.targetTiers.length > 0
      ? doc.targetTiers
      : Array.isArray(doc.targetAudience) && doc.targetAudience.length > 0
      ? doc.targetAudience
      : Array.isArray(doc.target?.userCategories) && doc.target.userCategories.length > 0
      ? doc.target.userCategories
      : [doc.requiredBadge || 'Freemium'];

  const userBadge = normalizeBadgeName(studentTier);

  return isUserAuthorized(userBadge, audienceList);
}

/**
 * Checks student access using direct userTier and docAllowedTiers array.
 */
export const canStudentAccess = (userTier: string, docAllowedTiers: string[]): boolean => {
  return isUserAuthorized(userTier, docAllowedTiers);
};

export { canStudentViewDocument, filterContentByBadge, filterResourcesForStudent, getVisibleDocumentsForStudent } from "./accessControl";

/**
 * Filter an array of documents strictly against the student's active plan.
 * Omits all unauthorized documents completely.
 */
export function filterDocumentsForStudent<T>(docs: T[], user: any): T[] {
  if (!Array.isArray(docs)) return [];
  if (user && user.role !== "student") return docs;
  return docs.filter((doc) => isDocumentAllowedForStudent(doc, user));
}

export default isDocumentAllowedForStudent;
