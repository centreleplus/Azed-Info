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

  // Gestion des QCM / Quiz
  const targetSectionRaw = options?.activeCategory || options?.currentSection || "";
  const reqCatNorm = normalize(targetSectionRaw);
  const docCatNorm = normalize(doc.category);
  const docCtNorm = normalize(doc.contentType);
  const isQuizDoc =
    docCtNorm === "quiz" ||
    docCatNorm.includes("quiz") ||
    docCatNorm.includes("qcm");

  if (reqCatNorm.includes("quiz") || reqCatNorm.includes("qcm")) {
    if (!isQuizDoc) return false;
  } else if (isQuizDoc) {
    return false;
  }

  const userRole = normalize(user?.role || "student");
  const isStaff = userRole === "admin" || userRole === "agent";
  if (isStaff || !user) return true;

  // --- MODE PERMISSIF UNIVERSEL (ANTI-AFFICHAGE PARTIEL) ---
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

  // Si le document ne cible aucune restriction spécifique, on l'affiche par défaut
  if (rawLevels.length === 0 && rawFilieres.length === 0) {
    return true;
  }

  const userLevel = normalize(
    user?.grade || user?.level || user?.gradeLevel || user?.niveau || user?.classe || ""
  );

  const levelMatch =
    rawLevels.length === 0 ||
    !userLevel ||
    rawLevels.some((lvl) => {
      const l = normalize(lvl);
      return (
        !l ||
        l.includes("all") ||
        l.includes("tout") ||
        l.includes("tous") ||
        l.includes("toutes") ||
        (userLevel && (l.includes(userLevel) || userLevel.includes(l)))
      );
    });

  const userFiliere = normalize(
    user?.section || user?.stream || user?.filiere || user?.field || user?.specialite || ""
  );

  const filiereMatch =
    rawFilieres.length === 0 ||
    !userFiliere ||
    rawFilieres.some((f) => {
      const fl = normalize(f);
      return (
        !fl ||
        fl.includes("all") ||
        fl.includes("tout") ||
        fl.includes("tous") ||
        fl.includes("toutes") ||
        fl.includes("tronc") ||
        fl.includes("commun") ||
        (userFiliere && (fl.includes(userFiliere) || userFiliere.includes(fl)))
      );
    });

  return levelMatch && filiereMatch;
}

export default filterDocuments;
