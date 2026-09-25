import { StudentTier, STUDENT_TIERS } from "../types/access";
import { isContentAccessibleToStudent, canStudentAccessContent, TargetAudience } from "../types";

/**
 * Normalizes any tier string, plan name, or forfait label into a canonical StudentTier.
 */
export function normalizeTier(val: any): StudentTier | null {
  if (!val || typeof val !== "string") return null;
  const clean = val.trim().toUpperCase().replace(/[\s\-_]/g, "");
  if (!clean) return null;

  if (clean.includes("ESSENTIEL") || clean.includes("ILLIMITE")) {
    return "ESSENTIEL";
  }
  if (
    clean.includes("PREMIUMPLUSPLUS") ||
    clean.includes("PREMIUM++") ||
    clean === "ANNUEL" ||
    clean.includes("PACKANNUEL")
  ) {
    return "PREMIUM_PLUS_PLUS";
  }
  if (
    clean.includes("PREMIUMPLUS") ||
    clean.includes("PREMIUM+") ||
    clean === "PYTHON" ||
    clean.includes("PACKPREMIUM+")
  ) {
    return "PREMIUM_PLUS";
  }
  if (
    clean === "PREMIUM" ||
    clean.includes("PACKPREMIUM") ||
    clean === "TRIMESTRIEL" ||
    clean === "MENSUEL"
  ) {
    return "PREMIUM";
  }
  if (
    clean.includes("FREEMIUM") ||
    clean.includes("GRATUIT") ||
    clean === "FREE" ||
    clean.includes("OPTIONGRATUIT")
  ) {
    return "FREEMIUM";
  }

  return null;
}

/**
 * Returns the active enrolled tier for a given student user, checking:
 * user.subscriptionPlan, user.forfait, user.tierCategory, user.tier, user.accountType, etc.
 */
export function getStudentActiveTier(user: any): StudentTier {
  if (!user) return "FREEMIUM";

  // 1. Explicit user.subscriptionPlan or user.forfait (as requested in specifications)
  if (user.subscriptionPlan) {
    const matched = normalizeTier(user.subscriptionPlan);
    if (matched) return matched;
  }
  if (user.forfait) {
    const matched = normalizeTier(user.forfait);
    if (matched) return matched;
  }

  // 2. Profile tier category / tier fields
  if (user.tierCategory) {
    const matched = normalizeTier(user.tierCategory);
    if (matched) return matched;
  }
  if (user.tier) {
    const matched = normalizeTier(user.tier);
    if (matched) return matched;
  }

  // 3. Badges and labels
  if (user.tierBadge) {
    const matched = normalizeTier(user.tierBadge);
    if (matched) return matched;
  }
  if (user.badgeLabel || user.badge_label) {
    const matched = normalizeTier(user.badgeLabel || user.badge_label);
    if (matched) return matched;
  }

  // 4. Subscription type check
  if (user.subscriptionType) {
    if (user.subscriptionType === "annuel") return "PREMIUM_PLUS_PLUS";
    if (user.subscriptionType === "trimestriel" || user.subscriptionType === "mensuel") return "PREMIUM";
    if (user.subscriptionType === "freemium") return "FREEMIUM";
  }

  // 5. Account type fallback
  if (user.accountType === "premium") {
    return "PREMIUM";
  }

  return "FREEMIUM";
}

/**
 * Returns human-readable label for a StudentTier (e.g. 'Premium+')
 */
export function getStudentTierLabel(tier: StudentTier): string {
  return STUDENT_TIERS[tier]?.label || tier;
}

/**
 * Evaluates whether a student user has access to a document based on target audience configuration.
 *
 * Rules:
 * - Admin and Agent / Professor roles have full visibility.
 * - Students with "ESSENTIEL" have unlimited access to all educational resources.
 * - If the document has a target audience list (targetAudience, targetTiers, or allowedTiers),
 *   the student's enrolled plan must be explicitly included.
 * - Otherwise fallback to isPremium check (non-freemium access).
 */
export function isDocumentAllowedForStudent(doc: any, user: any): boolean {
  if (!doc) return false;

  // Non-students (Admin, Professeurs / Agents) always have full access
  if (user && (user.role === "admin" || user.role === "agent")) {
    return true;
  }

  // Check Grade & Stream & Category accessibility via TargetAudience
  if (user && user.role === "student") {
    const studentGrade = user.grade || user.gradeLevel || "";
    const studentStream = user.section || user.stream || "";
    const studentTierStr = getStudentActiveTier(user);
    if (doc.target) {
      const accessible = canStudentAccessContent(doc.target, {
        gradeLevel: studentGrade,
        stream: studentStream,
        category: studentTierStr
      });
      if (!accessible) return false;
    } else {
      const accessible = isContentAccessibleToStudent(
        doc.target,
        { gradeLevel: studentGrade, stream: studentStream, category: studentTierStr },
        { grade: doc.grade, section: doc.section }
      );
      if (!accessible) return false;
    }
  }

  // For students, check enrolled active plan
  const studentTier = getStudentActiveTier(user);

  // Essentiel plan gives unlimited universal access
  if (studentTier === "ESSENTIEL") {
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
    const rawAudienceLower = new Set<string>();

    audienceList.forEach((item) => {
      if (typeof item === "string") {
        const norm = normalizeTier(item);
        if (norm) normalizedAudience.add(norm);
        rawAudienceLower.add(item.trim().toLowerCase());
      }
    });

    // 1. Direct tier match (e.g. 'PREMIUM' in ['PREMIUM', 'PREMIUM_PLUS'])
    if (normalizedAudience.has(studentTier)) {
      return true;
    }

    // 2. Raw string match against user.subscriptionPlan or user.forfait
    if (user?.subscriptionPlan) {
      const planStr = String(user.subscriptionPlan).trim().toLowerCase();
      if (rawAudienceLower.has(planStr)) return true;
    }
    if (user?.forfait) {
      const forfaitStr = String(user.forfait).trim().toLowerCase();
      if (rawAudienceLower.has(forfaitStr)) return true;
    }

    // Not included in target audience -> strictly block
    return false;
  }

  // Legacy documents without explicit targetAudience array:
  if (doc.isPremium) {
    return studentTier !== "FREEMIUM";
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
