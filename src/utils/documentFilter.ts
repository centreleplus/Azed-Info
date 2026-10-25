import { getDeletedDocumentIds } from "./documentAccess";

/**
 * Normalisation universelle d'une chaîne :
 * - Conversion en chaîne de caractères
 * - Minuscules (.toLowerCase())
 * - Suppression des espaces superflus (.trim())
 * - Suppression des accents/diacritiques (.normalize("NFD").replace(/[\u0300-\u036f]/g, ""))
 */
export const normalize = (str: any): string =>
  str !== undefined && str !== null
    ? str
        .toString()
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    : "";

export const normalizeString = normalize;

export const BADGE_HIERARCHY_RANK: Record<string, number> = {
  FREEMIUM: 0,
  ESSENTIEL: 1,
  "LIVE+": 2,
  "REVISION+": 3,
  INTEGRAL: 4
};

export function normalizeBadgeKey(rawBadge: any): string {
  const clean = normalize(rawBadge);
  if (!clean || clean.includes("freemium") || clean.includes("gratuit") || clean === "free") {
    return "FREEMIUM";
  }
  if (clean.includes("integral")) {
    return "INTEGRAL";
  }
  if (clean.includes("revision") || clean.includes("premium plus") || clean.includes("premium+")) {
    return "REVISION+";
  }
  if (clean.includes("live") || clean === "premium") {
    return "LIVE+";
  }
  if (clean.includes("essentiel")) {
    return "ESSENTIEL";
  }
  return "FREEMIUM";
}

export function normalizeSubmenuKey(val: any): string {
  const t = normalize(val);
  if (!t || t === "all" || t === "global" || t === "tout" || t.includes("tous") || t.includes("toutes")) {
    return "all";
  }
  if (t.includes("1er") || t.includes("1ere") || t === "t1" || t === "1") {
    return "1er trimestre";
  }
  if (t.includes("2eme") || t.includes("2nd") || t === "t2" || t === "2") {
    return "2eme trimestre";
  }
  if (t.includes("3eme") || t === "t3" || t === "3") {
    return "3eme trimestre";
  }
  if (
    t.includes("revision") ||
    t.includes("live") ||
    t.includes("enonce") ||
    t.includes("replay") ||
    t.includes("examen") ||
    t.includes("correction")
  ) {
    return "revision";
  }
  return t;
}

function toNormalizedArray(source: any): string[] {
  if (!source) return [];
  if (Array.isArray(source)) {
    return source
      .flatMap((item) =>
        typeof item === "string" ? item.split(/[,;|]+/) : [String(item ?? "")]
      )
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof source === "string") {
    return source
      .split(/[,;|]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(source).trim()].filter(Boolean);
}

export interface DocumentFilterOptions {
  activeCategory?: string;
  currentSection?: string;
  selectedTrimestre?: string;
  selectedTrimester?: string;
  selectedPeriod?: string;
  currentSubmenu?: string;
}

/**
 * Algorithme centralisé de correspondance multi-critères souple avec journal de diagnostic console.
 */
export function filterDocuments(
  doc: any,
  user: any,
  options?: DocumentFilterOptions
): boolean {
  if (!doc) return false;

  const docId = String(doc.id || doc._id || "");
  if (
    doc.deleted ||
    doc.isPublished === false ||
    doc.isInternalAdminOnly ||
    (docId && getDeletedDocumentIds().has(docId))
  ) {
    console.log(
      `[DOC-FILTER] [DOC-FILTER-DEBUG] File: "${doc.title || doc.fileName || docId}" | Matched: false | Reason: DeletedOrUnpublished(true)`
    );
    return false;
  }

  const userRole = normalize(user?.role || "student");
  const isStaff = userRole === "admin" || userRole === "agent";

  // 1. Section / Catégorie (categoryMatch)
  let categoryMatch = true;
  const targetSectionRaw = options?.activeCategory || options?.currentSection || "";
  const reqCatNorm = normalize(targetSectionRaw);

  if (reqCatNorm && reqCatNorm !== "all" && reqCatNorm !== "tous" && reqCatNorm !== "tout" && !reqCatNorm.includes("toutes")) {
    const docCatNorm = normalize(doc.category);
    const docCtNorm = normalize(doc.contentType);
    const docSubNorm = normalize(doc.submenu || doc.subMenu || doc.trimestre || doc.trimester);
    const combinedDocCat = `${docCatNorm} ${docCtNorm}`.trim();

    const isCorrectionDoc =
      docCtNorm === "exercise_corrected" ||
      docCatNorm.includes("correction") ||
      docCatNorm.includes("corrige") ||
      docSubNorm === "correction";

    const isQuizDoc =
      docCtNorm === "quiz" ||
      docCatNorm.includes("quiz") ||
      docCatNorm.includes("qcm");

    const isHybridCourseExercise =
      docCtNorm === "devoirs_exercices_fiches_cours" ||
      ((docCatNorm.includes("fiche") || docCatNorm.includes("cours")) &&
        (docCatNorm.includes("devoir") || docCatNorm.includes("exercice")));

    const isDevoirDoc =
      docCtNorm === "exercise" ||
      docCatNorm.includes("devoir") ||
      docCatNorm.includes("exercice") ||
      isHybridCourseExercise ||
      (docCtNorm === "revision" && !isCorrectionDoc);

    const isCoursDoc =
      docCtNorm === "course" ||
      docCatNorm.includes("fiche") ||
      docCatNorm.includes("cours") ||
      isHybridCourseExercise ||
      (!docCatNorm && !docCtNorm);

    const isRevisionDoc =
      docCtNorm === "revision" ||
      docCatNorm.includes("revision") ||
      docCatNorm.includes("live") ||
      docCatNorm.includes("replay") ||
      docCatNorm.includes("examen");

    if (reqCatNorm.includes("correction")) {
      categoryMatch = isCorrectionDoc;
    } else if (reqCatNorm.includes("devoir") || reqCatNorm.includes("exercice") || reqCatNorm === "exercise") {
      categoryMatch = !isCorrectionDoc && !isQuizDoc && isDevoirDoc;
    } else if (reqCatNorm.includes("fiche") || reqCatNorm.includes("cours") || reqCatNorm === "course") {
      categoryMatch =
        !isCorrectionDoc &&
        !isQuizDoc &&
        (isCoursDoc || (!isDevoirDoc && isRevisionDoc));
    } else if (reqCatNorm.includes("revision")) {
      categoryMatch = isRevisionDoc || docSubNorm.includes("revision") || docSubNorm.includes("live");
    } else if (reqCatNorm.includes("quiz") || reqCatNorm.includes("qcm")) {
      categoryMatch = isQuizDoc;
    } else {
      categoryMatch =
        !combinedDocCat ||
        docCatNorm === reqCatNorm ||
        docCatNorm.includes(reqCatNorm) ||
        reqCatNorm.includes(docCatNorm) ||
        combinedDocCat.includes(reqCatNorm);
    }
  }

  // 2. Sous-menu / Trimestre (submenuMatch)
  let submenuMatch = true;
  const rawCurrentSubmenu =
    options?.currentSubmenu ||
    options?.selectedTrimestre ||
    options?.selectedTrimester ||
    options?.selectedPeriod ||
    "";
  const reqSubKey = normalizeSubmenuKey(rawCurrentSubmenu);

  if (reqSubKey && reqSubKey !== "all") {
    const rawDocSub =
      doc.submenu ||
      doc.subMenu ||
      doc.trimester ||
      doc.trimestre ||
      doc.academicPeriod ||
      "";
    const normDocSubRaw = normalize(rawDocSub);
    const docSubKey = normalizeSubmenuKey(rawDocSub);

    if (
      !normDocSubRaw ||
      docSubKey === "all" ||
      normDocSubRaw === "tout" ||
      normDocSubRaw.includes("tous") ||
      normDocSubRaw.includes("toutes")
    ) {
      submenuMatch = true;
    } else {
      submenuMatch =
        docSubKey === reqSubKey ||
        normDocSubRaw.includes(normalize(rawCurrentSubmenu)) ||
        normalize(rawCurrentSubmenu).includes(normDocSubRaw);
    }
  }

  // 3. Niveau Scolaire (levelMatch)
  let levelMatch = true;
  const rawLevels =
    Array.isArray(doc.levels) && doc.levels.length > 0
      ? toNormalizedArray(doc.levels)
      : Array.isArray(doc.target?.gradeLevels) && doc.target.gradeLevels.length > 0
      ? toNormalizedArray(doc.target.gradeLevels)
      : Array.isArray(doc.gradeLevels) && doc.gradeLevels.length > 0
      ? toNormalizedArray(doc.gradeLevels)
      : doc.grade
      ? toNormalizedArray(doc.grade)
      : doc.level
      ? toNormalizedArray(doc.level)
      : [];

  if (!isStaff && user) {
    const isAllLevels =
      rawLevels.length === 0 ||
      rawLevels.some((lvl) => {
        const l = normalize(lvl);
        return !l || l === "all" || l === "global" || l === "tout" || l.includes("tous") || l.includes("toutes");
      });

    const userLevel = normalize(user?.grade || user?.level || user?.gradeLevel || "");
    const isUserLevelEmpty =
      !userLevel || userLevel === "all" || userLevel === "tout" || userLevel.includes("tous");

    if (!isAllLevels && !isUserLevelEmpty) {
      levelMatch = rawLevels.some((lvl) => {
        const l = normalize(lvl);
        if (!l || l === "all" || l === "tout" || l.includes("tous") || l.includes("toutes")) return true;
        if (
          (l.includes("4") || l.includes("bac") || l.includes("term")) &&
          (userLevel.includes("4") || userLevel.includes("bac") || userLevel.includes("term"))
        ) {
          return true;
        }
        if (l.includes("3") && userLevel.includes("3")) return true;
        if (l.includes("2") && userLevel.includes("2")) return true;
        if (l.includes("1") && userLevel.includes("1")) return true;
        return l === userLevel || l.includes(userLevel) || userLevel.includes(l);
      });
    }
  }

  // 4. Filière / Section (filiereMatch)
  let filiereMatch = true;
  const rawFilieres =
    Array.isArray(doc.filieres) && doc.filieres.length > 0
      ? toNormalizedArray(doc.filieres)
      : doc.filiere && (!Array.isArray(doc.filiere) || doc.filiere.length > 0)
      ? toNormalizedArray(doc.filiere)
      : Array.isArray(doc.target?.streams) && doc.target.streams.length > 0
      ? toNormalizedArray(doc.target.streams)
      : Array.isArray(doc.streams) && doc.streams.length > 0
      ? toNormalizedArray(doc.streams)
      : doc.section
      ? toNormalizedArray(doc.section)
      : doc.stream
      ? toNormalizedArray(doc.stream)
      : [];

  if (!isStaff && user) {
    const isAllFilieres =
      rawFilieres.length === 0 ||
      rawFilieres.some((f) => {
        const fl = normalize(f);
        return !fl || fl === "all" || fl === "global" || fl === "tout" || fl.includes("tous") || fl.includes("toutes");
      });

    const userFiliere = normalize(
      user?.section || user?.stream || user?.filiere || user?.field || ""
    );
    const userLevel = normalize(user?.grade || user?.level || user?.gradeLevel || "");
    const isUserFiliereEmpty =
      !userFiliere ||
      userFiliere === "all" ||
      userFiliere === "tout" ||
      userFiliere.includes("tous") ||
      userFiliere.includes("toutes");

    if (!isAllFilieres && !isUserFiliereEmpty) {
      filiereMatch = rawFilieres.some((f) => {
        const fl = normalize(f);
        if (!fl || fl === "all" || fl === "tout" || fl.includes("tous") || fl.includes("toutes")) return true;
        if (
          (fl.includes("tronc") || fl.includes("commun")) &&
          (userFiliere.includes("tronc") || userFiliere.includes("commun") || userLevel.includes("1"))
        ) {
          return true;
        }
        if (userLevel.includes("1") && rawLevels.some((l) => normalize(l).includes("1"))) {
          return true;
        }
        if ((fl.includes("info") || fl === "sti") && (userFiliere.includes("info") || userFiliere === "sti")) {
          return true;
        }
        if (fl.includes("math") && userFiliere.includes("math")) return true;
        if ((fl.includes("exp") || fl === "svt") && (userFiliere.includes("exp") || userFiliere === "svt")) {
          return true;
        }
        if (fl.includes("tech") && userFiliere.includes("tech")) return true;
        if ((fl.includes("eco") || fl.includes("gest")) && (userFiliere.includes("eco") || userFiliere.includes("gest"))) {
          return true;
        }
        if (fl.includes("lettr") && userFiliere.includes("lettr")) return true;
        if (fl.includes("sport") && userFiliere.includes("sport")) return true;
        return fl === userFiliere || fl.includes(userFiliere) || userFiliere.includes(fl);
      });
    }
  }

  // 5. Badge / Formule (badgeMatch)
  let badgeMatch = true;
  if (!isStaff && user) {
    const rawUserBadge =
      user?.activeBadge ||
      user?.badge ||
      user?.statusBadge ||
      user?.subscriptionBadge ||
      user?.subscriptionPlan ||
      user?.forfait ||
      user?.tierCategory ||
      user?.userCategory ||
      (user?.isPremium || user?.accountType === "premium" ? "ESSENTIEL" : "FREEMIUM");

    const normUserBadge = normalizeBadgeKey(rawUserBadge);
    const userRank = BADGE_HIERARCHY_RANK[normUserBadge] ?? 0;

    const rawDocBadges: any[] =
      Array.isArray(doc.badges) && doc.badges.length > 0
        ? doc.badges
        : Array.isArray(doc.allowedBadges) && doc.allowedBadges.length > 0
        ? doc.allowedBadges
        : Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
        ? doc.allowedTiers
        : Array.isArray(doc.targetTiers) && doc.targetTiers.length > 0
        ? doc.targetTiers
        : Array.isArray(doc.accessTiers) && doc.accessTiers.length > 0
        ? doc.accessTiers
        : Array.isArray(doc.tiers) && doc.tiers.length > 0
        ? doc.tiers
        : Array.isArray(doc.target?.userCategories) && doc.target.userCategories.length > 0
        ? doc.target.userCategories
        : doc.minBadge || doc.requiredBadge || doc.badge || doc.badgeType
        ? [doc.minBadge || doc.requiredBadge || doc.badge || doc.badgeType]
        : [];

    const normDocBadges = rawDocBadges.map((b: any) => normalizeBadgeKey(b)).filter(Boolean);

    let requiredRank = 0;
    if (normDocBadges.length > 0) {
      if (normDocBadges.includes("FREEMIUM") && !doc.isPremium) {
        requiredRank = 0;
      } else {
        requiredRank = Math.min(...normDocBadges.map((b: string) => BADGE_HIERARCHY_RANK[b] ?? 0));
      }
    } else if (doc.isPremium) {
      requiredRank = 1;
    }

    const isBadgeIncluded =
      normDocBadges.length === 0 ||
      normDocBadges.includes(normUserBadge) ||
      (normDocBadges.includes("FREEMIUM") && !doc.isPremium);

    const hasRankPrivilege = userRank >= requiredRank;
    badgeMatch = hasRankPrivilege || isBadgeIncluded;
  }

  const isMatch = levelMatch && filiereMatch && badgeMatch && categoryMatch && submenuMatch;

  console.log(
    `[DOC-FILTER] [DOC-FILTER-DEBUG] File: "${doc.title || doc.fileName || docId}" | Matched: ${isMatch} | Reason: Level(${levelMatch}), Filiere(${filiereMatch}), Badge(${badgeMatch}), Category(${categoryMatch}), Submenu(${submenuMatch})`
  );

  return isMatch;
}

export default filterDocuments;
