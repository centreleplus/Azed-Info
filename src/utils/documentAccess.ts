import { StudentTier, STUDENT_TIERS } from "../types/access";
import { normalizePackName, normalizeSubscriptionTier, PackType, SubscriptionTier } from "../constants/packages";
import {
  USER_RANK,
  normalizeCanonicalGrade,
  normalizeCanonicalStream,
  normalizeCanonicalTrimester,
  normalizeCanonicalCategory,
  isContentAccessibleToStudent,
  canStudentAccessContent
} from "../types";
import { filterResourcesForStudent } from "./accessControl";
import { hasAccess, normalizeBadgeName, isUserAuthorized } from "../config/badges";

export {
  USER_RANK,
  normalizeCanonicalGrade,
  normalizeCanonicalStream,
  normalizeCanonicalTrimester,
  normalizeCanonicalCategory
};

const RANK_TO_BADGE: SubscriptionTier[] = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'];

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
 * Resolves the canonical required minimum badge (minBadge) for any document or quiz.
 */
export function resolveCanonicalMinBadge(doc: any): SubscriptionTier {
  if (!doc) return "FREEMIUM";

  const explicitReq = doc.minBadge || doc.requiredBadge || doc.badge || doc.badgeType || doc.tier;
  if (explicitReq) {
    const normReq = normalizeBadgeName(String(explicitReq));
    const rank = USER_RANK[normReq] ?? 0;
    if (rank > 0) {
      return RANK_TO_BADGE[rank] || "FREEMIUM";
    }
  }

  const audienceList = (
    Array.isArray(doc.allowedBadges) && doc.allowedBadges.length > 0 ? doc.allowedBadges :
    Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0 ? doc.allowedTiers :
    Array.isArray(doc.accessTiers) && doc.accessTiers.length > 0 ? doc.accessTiers :
    Array.isArray(doc.tiers) && doc.tiers.length > 0 ? doc.tiers :
    Array.isArray(doc.targetTiers) && doc.targetTiers.length > 0 ? doc.targetTiers :
    Array.isArray(doc.categoriesAllowed) && doc.categoriesAllowed.length > 0 ? doc.categoriesAllowed :
    (doc.target && Array.isArray(doc.target.userCategories) && doc.target.userCategories.length > 0) ? doc.target.userCategories :
    null
  );

  if (audienceList && audienceList.length > 0) {
    const normList = audienceList.map((b: any) => normalizeBadgeName(String(b)));
    if (normList.includes("FREEMIUM") && !doc.isPremium) {
      return "FREEMIUM";
    }
    const ranks = normList.map((b: string) => USER_RANK[b] ?? 0);
    let minRank = Math.min(...ranks);
    if (doc.isPremium) {
      minRank = Math.max(1, minRank);
    }
    return RANK_TO_BADGE[minRank] || "FREEMIUM";
  }

  if (doc.isPremium) {
    return "ESSENTIEL";
  }

  return "FREEMIUM";
}

/**
 * Harmonizes any document/course/quiz object to expose canonical keys:
 * grade, stream, minBadge, trimester, category
 */
export function harmonizeDocument(doc: any): any {
  if (!doc) return doc;
  const rawGrade =
    Array.isArray(doc.target?.gradeLevels) && doc.target.gradeLevels.length === 1
      ? doc.target.gradeLevels[0]
      : doc.grade || doc.level || doc.academicLevel || "ALL";
  const rawStream =
    Array.isArray(doc.target?.streams) && doc.target.streams.length === 1
      ? doc.target.streams[0]
      : doc.stream || doc.section || doc.field || "ALL";
  const grade = normalizeCanonicalGrade(rawGrade);
  const stream = normalizeCanonicalStream(rawStream, rawGrade);
  const minBadge = resolveCanonicalMinBadge(doc);
  const trimester = normalizeCanonicalTrimester(doc.trimester || doc.trimestre || doc.academicPeriod || "1er Trimestre");
  const category = normalizeCanonicalCategory(doc);

  return {
    ...doc,
    grade,
    stream,
    section: doc.section || stream,
    minBadge,
    requiredBadge: minBadge,
    trimester,
    trimestre: doc.trimestre || trimester,
    category
  };
}

/**
 * Strict 5-Condition AND Filtering for Student Documents:
 * 1. Badge: USER_RANK[user.badge] >= USER_RANK[doc.minBadge]
 * 2. Grade: doc.grade === user.grade || doc.grade === "ALL"
 * 3. Stream: doc.stream === user.stream || doc.stream === "ALL"
 * 4. Trimester: doc.trimester === selectedTrimester (when provided)
 * 5. Category: doc.category === activeCategory (when provided)
 *
 * Absolute rule: Even INTEGRAL students must strictly match their own grade and stream.
 */
export function doesDocumentMatchStudentCriteria(
  doc: any,
  user: any,
  options?: {
    selectedTrimester?: string;
    activeCategory?: string;
  }
): boolean {
  if (!doc) return false;
  if (doc.isPublished === false) return false;

  // Non-students (Admin, Professeurs / Agents) have staff access
  if (user && (user.role === "admin" || user.role === "agent")) {
    return true;
  }

  if (doc.isInternalAdminOnly) return false;

  // 1. Condition de Badge: USER_RANK[user.badge] >= USER_RANK[doc.minBadge]
  const userBadge = normalizeBadgeName(getStudentActiveTier(user));
  const docMinBadge = resolveCanonicalMinBadge(doc);
  const userRank = USER_RANK[userBadge] ?? 0;
  const docRank = USER_RANK[docMinBadge] ?? 0;
  if (userRank < docRank) {
    return false;
  }

  // 2. Condition de Niveau Scolaire: doc.grade === user.grade || doc.grade === "ALL" (obligatoire même pour INTEGRAL)
  const userGrade = normalizeCanonicalGrade(user?.grade || user?.gradeLevel || user?.level || "");
  const rawDocGrades: string[] =
    Array.isArray(doc.target?.gradeLevels) && doc.target.gradeLevels.length > 0
      ? doc.target.gradeLevels
      : doc.grade
      ? String(doc.grade).split(",").map((s: string) => s.trim()).filter(Boolean)
      : ["ALL"];
  const docGrades = rawDocGrades.map((g: string) => normalizeCanonicalGrade(g));
  const matchGrade = docGrades.includes("ALL") || (userGrade !== "ALL" && docGrades.includes(userGrade));
  if (!matchGrade) {
    return false;
  }

  // 3. Condition de Filière: doc.stream === user.stream || doc.stream === "ALL" (obligatoire même pour INTEGRAL)
  const userStream = normalizeCanonicalStream(user?.stream || user?.section || user?.field || "", userGrade);
  const rawDocStreamSource = doc.stream || doc.section || doc.field || "";
  const rawDocStreams: string[] =
    Array.isArray(doc.target?.streams) && doc.target.streams.length > 0
      ? doc.target.streams
      : rawDocStreamSource
      ? String(rawDocStreamSource).split(",").map((s: string) => s.trim()).filter(Boolean)
      : [];
  const docStreams =
    rawDocStreams.length > 0
      ? rawDocStreams.map((s: string) => normalizeCanonicalStream(s, rawDocGrades.join(" ")))
      : [normalizeCanonicalStream("", rawDocGrades.join(" "))];
  const matchStream =
    docStreams.includes("ALL") ||
    (userStream !== "ALL" && docStreams.includes(userStream)) ||
    (userGrade === "1ère" && docGrades.includes("1ère"));
  if (!matchStream) {
    return false;
  }

  // 4. Condition de Trimestre: doc.trimester === selectedTrimester
  if (options?.selectedTrimester) {
    const reqTrim = normalizeCanonicalTrimester(options.selectedTrimester);
    if (reqTrim !== "ALL") {
      const docTrim = normalizeCanonicalTrimester(doc.trimester || doc.trimestre || doc.academicPeriod || "1er Trimestre");
      if (docTrim !== "ALL" && docTrim !== reqTrim) {
        return false;
      }
    }
  }

  // 5. Condition de Catégorie: doc.category === activeCategory
  if (options?.activeCategory) {
    const reqCat = normalizeCanonicalCategory(options.activeCategory);
    if (reqCat !== "ALL") {
      const docCat = normalizeCanonicalCategory(doc);
      if (docCat !== reqCat) {
        return false;
      }
    }
  }

  return true;
}

export function isDocumentAllowedForStudent(
  doc: any,
  user: any,
  options?: { selectedTrimester?: string; activeCategory?: string }
): boolean {
  return doesDocumentMatchStudentCriteria(doc, user, options);
}

/**
 * Checks student access using direct userTier and docAllowedTiers array.
 */
export const canStudentAccess = (userTier: string, docAllowedTiers: string[]): boolean => {
  return isUserAuthorized(userTier, docAllowedTiers);
};

export { canStudentViewDocument, filterContentByBadge, filterResourcesForStudent, getVisibleDocumentsForStudent } from "./accessControl";

/**
 * Filter an array of documents strictly against the student's active plan and profile.
 * Omits all unauthorized documents completely.
 */
export function filterDocumentsForStudent<T>(docs: T[], user: any, options?: { selectedTrimester?: string; activeCategory?: string }): T[] {
  if (!Array.isArray(docs)) return [];
  if (user && (user.role === "admin" || user.role === "agent")) return docs;
  return docs.filter((doc) => doesDocumentMatchStudentCriteria(doc, user, options));
}

export default isDocumentAllowedForStudent;
