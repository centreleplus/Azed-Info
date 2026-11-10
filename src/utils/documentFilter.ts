import { getDeletedDocumentIds } from "./documentAccess";

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

export const compareFifoAscending = (a: any, b: any): number => {
  const getSafeTime = (item: any): number => {
    if (!item) return 0;
    const raw = item?.createdAt || item?.date || item?.timestamp || item?.uploadedAt || item?.metadata?.uploadedAt;
    if (raw) {
      const parsed = new Date(raw).getTime();
      if (!Number.isNaN(parsed) && parsed > 0) return parsed;
    }
    if (typeof item.id === "number") return item.id;
    if (typeof item.id === "string") {
      const parsedIdDate = new Date(item.id).getTime();
      if (!Number.isNaN(parsedIdDate) && parsedIdDate > 0) return parsedIdDate;
      const numMatch = item.id.match(/\d+/);
      if (numMatch) return parseInt(numMatch[0], 10);
    }
    return 0;
  };

  const timeA = getSafeTime(a);
  const timeB = getSafeTime(b);
  if (timeA !== timeB && timeA > 0 && timeB > 0) {
    return timeA - timeB; // Du premier uploadé au dernier (FIFO pur)
  }

  const idA = String(a?.id || a?._id || "");
  const idB = String(b?.id || b?._id || "");
  return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: "base" });
};

function toNormalizedArray(source: any): string[] {
  if (!source) return [];
  if (Array.isArray(source)) {
    return source
      .flatMap((item) =>
        typeof item === "string" ? item.split(/[,;|/]+/) : [String(item ?? "")]
      )
      .map((s) => s.trim())
      .filter(Boolean);
  }
  if (typeof source === "string") {
    return source
      .split(/[,;|/]+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [String(source).trim()].filter(Boolean);
}

// --- 1. CORRESPONDANCE PAR CHEMIN ET CATÉGORIE ADMINISTRATIVE ---
export function matchesAdminCategoryOrPath(doc: any, requestedPage: string): boolean {
  const page = normalize(requestedPage);
  if (!page || page === "all" || page === "tous" || page === "global") {
    return true;
  }

  const catRaw = doc.category || doc.contentType || doc.type || "";
  const catNorm = normalize(catRaw);
  const pathRaw = doc.metadata?.studentSectionPath || doc.studentSectionPath || doc.sectionPath || "";
  const pathNorm = normalize(pathRaw);
  const titleNorm = normalize(doc.title || "");
  const combined = `${catNorm} ${pathNorm} ${titleNorm}`;

  // Exclure systématiquement les quiz des flux de documents PDF
  if (combined.includes("quiz") || combined.includes("qcm")) {
    return false;
  }

  // Page Cours : Accepte si le document contient FICHES & COURS, COURS, FICHE, ou si le chemin contient Apprentissage & Révisions → Fiches & cours
  if (page.includes("cours") || page.includes("fiche")) {
    const isExplicitCourse =
      combined.includes("fiches & cours") ||
      combined.includes("fiches et cours") ||
      combined.includes("cours") ||
      combined.includes("fiche") ||
      pathNorm.includes("fiches & cours") ||
      pathNorm.includes("fiches et cours") ||
      (pathNorm.includes("apprentissage & revisions") &&
        !combined.includes("devoir") &&
        !combined.includes("exercice") &&
        !combined.includes("correction"));

    const isExcluded =
      combined.includes("correction") ||
      combined.includes("corrige") ||
      combined.includes("zone correction") ||
      combined.includes("solution") ||
      combined.includes("devoir") ||
      combined.includes("exercice") ||
      combined.includes("serie") ||
      combined.includes("revision");

    if (isExplicitCourse && !isExcluded) return true;
    if (!catNorm && !pathNorm && !isExcluded) return true; // secours pour documents sans catégorie
    return false;
  }

  // Page Devoirs : Accepte si la catégorie ou le chemin contient DEVOIR, EXERCICE, SERIE, DS
  if (page.includes("devoir") || page.includes("exercice") || page.includes("serie")) {
    const isDevoir =
      combined.includes("devoir") ||
      combined.includes("exercice") ||
      combined.includes("exercise") ||
      combined.includes("serie") ||
      combined.includes("ds") ||
      combined.includes("controle") ||
      pathNorm.includes("devoirs & exercices") ||
      pathNorm.includes("devoirs et exercices");

    const isCorrection =
      combined.includes("correction") ||
      combined.includes("corrige") ||
      combined.includes("zone correction") ||
      combined.includes("solution");

    return isDevoir && !isCorrection;
  }

  // Page Corrections : Accepte si la catégorie ou le chemin contient CORRECTION, CORRIGE, SOLUTION
  if (page.includes("correction") || page.includes("corrige")) {
    return (
      combined.includes("correction") ||
      combined.includes("corrige") ||
      combined.includes("solution") ||
      combined.includes("zone correction") ||
      pathNorm.includes("zone correction")
    );
  }

  // Page Révision : Accepte si la catégorie ou le chemin contient REVISION, EXAMEN, BAC
  if (page.includes("revision") || page.includes("examen") || page.includes("bac")) {
    return (
      combined.includes("revision") ||
      combined.includes("examen") ||
      combined.includes("bac") ||
      combined.includes("concours") ||
      combined.includes("synthese") ||
      pathNorm.includes("revision") ||
      normalize(doc.submenu || doc.trimester || doc.trimestre) === "revision"
    );
  }

  return true;
}

export interface DocumentFilterOptions {
  activeCategory?: string;
  currentSection?: string;
  selectedTrimestre?: string;
  selectedTrimester?: string;
  selectedPeriod?: string;
  currentSubmenu?: string;
  page?: string;
}

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
    return false;
  }

  // --- 1. CORRESPONDANCE PAR CHEMIN ET CATÉGORIE ADMINISTRATIVE ---
  const targetPage =
    options?.page ||
    options?.activeCategory ||
    options?.currentSection ||
    "";

  if (targetPage && !matchesAdminCategoryOrPath(doc, targetPage)) {
    return false;
  }

  const userRole = normalize(user?.role || "student");
  const isStaff = userRole === "admin" || userRole === "agent";
  if (isStaff || !user) return true;

  // --- 2. VALIDATION SOUPLE DU CIBLAGE MULTI-NIVEAUX ET FILIÈRE ---
  const rawLevels = Array.from(
    new Set([
      ...toNormalizedArray(doc.target?.gradeLevels),
      ...toNormalizedArray(doc.levels),
      ...toNormalizedArray(doc.gradeLevels),
      ...toNormalizedArray(doc.grade),
      ...toNormalizedArray(doc.level),
      ...toNormalizedArray(doc.classe),
      ...toNormalizedArray(doc.targetClasse),
      ...toNormalizedArray(doc.niveau)
    ])
  );

  const rawFilieres = Array.from(
    new Set([
      ...toNormalizedArray(doc.target?.streams),
      ...toNormalizedArray(doc.filieres),
      ...toNormalizedArray(doc.streams),
      ...toNormalizedArray(doc.section),
      ...toNormalizedArray(doc.filiere),
      ...toNormalizedArray(doc.stream),
      ...toNormalizedArray(doc.field),
      ...toNormalizedArray(doc.specialite),
      ...toNormalizedArray(doc.targetSpecialite)
    ])
  );

  const userLevel = normalize(
    user?.grade || user?.level || user?.gradeLevel || user?.niveau || user?.classe || ""
  );

  // Un document ciblant plusieurs niveaux (ex: 3ème/4ème) doit s'afficher si l'élève correspond à l'un de ces niveaux
  const levelMatch =
    rawLevels.length === 0 ||
    !userLevel ||
    rawLevels.some((lvl) => {
      const l = normalize(lvl);
      if (!l || l.includes("all") || l.includes("tout") || l.includes("tous") || l.includes("toutes")) {
        return true;
      }
      if (l.includes(userLevel) || userLevel.includes(l)) {
        return true;
      }
      const docDigit = l.match(/[1234]/)?.[0];
      const userDigit = userLevel.match(/[1234]/)?.[0] || (userLevel.includes("bac") ? "4" : "");
      if (docDigit && userDigit && docDigit === userDigit) {
        return true;
      }
      return false;
    });

  const userFiliere = normalize(
    user?.section || user?.stream || user?.filiere || user?.field || user?.specialite || ""
  );

  // Validation de la filière
  const filiereMatch =
    rawFilieres.length === 0 ||
    !userFiliere ||
    rawFilieres.some((f) => {
      const fl = normalize(f);
      if (
        !fl ||
        fl.includes("all") ||
        fl.includes("tout") ||
        fl.includes("tous") ||
        fl.includes("toutes") ||
        fl.includes("tronc") ||
        fl.includes("commun")
      ) {
        return true;
      }
      if (fl.includes(userFiliere) || userFiliere.includes(fl)) {
        return true;
      }
      const STREAM_KEYWORDS = ["info", "math", "exp", "svt", "tech", "eco", "gest", "lettr", "sport"];
      const userKeywords = STREAM_KEYWORDS.filter((kw) => userFiliere.includes(kw));
      if (userKeywords.length > 0 && userKeywords.some((kw) => fl.includes(kw))) {
        return true;
      }
      return false;
    });

  // --- 3. VALIDATION DU PACK / AUDIENCE ---
  const docPacks = Array.from(
    new Set([
      ...toNormalizedArray(doc.allowedTiers),
      ...toNormalizedArray(doc.accessTiers),
      ...toNormalizedArray(doc.tiers),
      ...toNormalizedArray(doc.targetTiers),
      ...toNormalizedArray(doc.target?.userCategories),
      ...toNormalizedArray(doc.allowedBadges)
    ])
  ).map((p) => normalizeBadgeKey(p));

  const isPublicDoc =
    doc.isPremium === false ||
    normalize(doc.accessType) === "gratuit" ||
    docPacks.length === 0 ||
    docPacks.includes("FREEMIUM");

  const studentBadge = normalizeBadgeKey(
    user?.badge || user?.activeBadge || user?.subscriptionPlan || (user?.isPremium ? "INTEGRAL" : "FREEMIUM")
  );
  const studentRank = BADGE_HIERARCHY_RANK[studentBadge] ?? 0;

  const packMatch =
    isPublicDoc ||
    docPacks.includes(studentBadge) ||
    (studentRank >= 1 && docPacks.some((p) => studentRank >= (BADGE_HIERARCHY_RANK[p] ?? 1))) ||
    Boolean(user?.isPremium) ||
    studentBadge === "INTEGRAL" ||
    studentBadge === "FREEMIUM"; // Permet aux freemiums de voir les ressources avec verrou visuel

  return levelMatch && filiereMatch && packMatch;
}

export default filterDocuments;
