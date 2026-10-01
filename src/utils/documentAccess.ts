import { StudentTier, STUDENT_TIERS } from "../types/access";
import { normalizePackName, getHighestPack, PackType } from "../constants/packages";
import { isContentAccessibleToStudent, canStudentAccessContent, TargetAudience } from "../types";

/**
 * Normalizes any tier string, plan name, or forfait label into a canonical PackType.
 */
export function normalizeTier(val: any): PackType {
  return normalizePackName(val);
}

/**
 * Returns the active enrolled tier for a given student user, checking:
 * user.activePackages, user.packs, user.status, user.subscriptionPlan, user.forfait, user.tierCategory, user.tier, user.accountType, etc.
 */
export function getStudentActiveTier(user: any): PackType {
  if (!user) return "Freemium";

  if (Array.isArray(user.activePackages) && user.activePackages.length > 0) {
    return getHighestPack(user.activePackages);
  }
  if (Array.isArray(user.packs) && user.packs.length > 0) {
    return getHighestPack(user.packs);
  }

  const candidate = user.userCategory || user.status || user.tier || user.tierCategory || user.badgeLabel || user.subscriptionPlan || user.forfait;
  if (candidate) {
    return normalizePackName(candidate);
  }

  if (user.accountType === "premium") {
    return "Live +";
  }

  return "Freemium";
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

  // Check Grade & Stream & Category accessibility via TargetAudience
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

  // Essentiel and Intégrale give full access
  if (studentTier === "Essentiel" || studentTier === "Intégrale") {
    return true;
  }

  // Extract declared audience list
  const audienceList: any[] =
    Array.isArray(doc.targetAudience) && doc.targetAudience.length > 0
      ? doc.targetAudience
      : Array.isArray(doc.targetTiers) && doc.targetTiers.length > 0
      ? doc.targetTiers
      : Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
      ? doc.allowedTiers
      : [];

  // If document has explicit target audience list, strictly enforce membership
  if (audienceList.length > 0) {
    const normalizedAudience = new Set<string>();

    audienceList.forEach((item) => {
      if (typeof item === "string") {
        normalizedAudience.add(normalizePackName(item));
      }
    });

    if (normalizedAudience.has(studentTier)) {
      return true;
    }

    return false;
  }

  // Fallback for documents without explicit target audience
  if (doc.isPremium) {
    return studentTier !== "Freemium";
  }

  return true;
}

/**
 * Filter an array of documents strictly against the student's active plan.
 * Omits all unauthorized documents completely.
 */
export function filterDocumentsForStudent<T>(docs: T[], user: any): T[] {
  if (!Array.isArray(docs)) return [];
  if (user && user.role !== "student") return docs;
  return docs.filter((doc) => isDocumentAllowedForStudent(doc, user));
}
