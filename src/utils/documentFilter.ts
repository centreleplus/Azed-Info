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

// --- CLASSIFICATION STRICTE DES CATÉGORIES DE DOCUMENTS ---

export function isQuizCategory(doc: any): boolean {
  if (!doc) return false;
  const cat = normalize(doc.category);
  const ct = normalize(doc.contentType);
  const typ = normalize(doc.type);

  return (
    ct === "quiz" ||
    cat.includes("quiz") ||
    cat.includes("qcm") ||
    typ === "quiz" ||
    typ === "qcm" ||
    typ === "coding_challenge" ||
    typ === "fllblanks"
  );
}

export function isCorrectionCategory(doc: any): boolean {
  if (!doc) return false;
  const cat = normalize(doc.category);
  const ct = normalize(doc.contentType);
  const typ = normalize(doc.type);
  const title = normalize(doc.title);

  return (
    ct === "exercise_corrected" ||
    ct === "correction" ||
    cat.includes("correction") ||
    cat.includes("corrige") ||
    cat.includes("zone correction") ||
    cat.includes("solution") ||
    typ === "correction" ||
    typ === "exercise_corrected" ||
    title.startsWith("correction") ||
    title.startsWith("corrige") ||
    title.includes("correction de devoir")
  );
}

export function isRevisionCategory(doc: any): boolean {
  if (!doc) return false;
  const cat = normalize(doc.category);
  const ct = normalize(doc.contentType);
  const typ = normalize(doc.type);
  const sub = normalize(doc.submenu || doc.trimester || doc.trimestre);
  const title = normalize(doc.title);

  return (
    ct === "revision" ||
    cat.includes("revision") ||
    cat.includes("examen") ||
    cat.includes("synthese") ||
    cat.includes("bac") ||
    typ === "revision" ||
    sub === "revision" ||
    title.includes("revision") ||
    title.includes("examen national") ||
    title.includes("synthese")
  );
}

export function isDevoirCategory(doc: any): boolean {
  if (!doc) return false;
  // Les corrections sont strictement exclues des devoirs
  if (isCorrectionCategory(doc)) return false;

  const cat = normalize(doc.category);
  const ct = normalize(doc.contentType);
  const typ = normalize(doc.type);
  const title = normalize(doc.title);

  return (
    ct === "exercise" ||
    ct === "devoir" ||
    ct === "serie" ||
    cat.includes("devoir") ||
    cat.includes("exercice") ||
    cat.includes("exercise") ||
    cat.includes("serie") ||
    typ === "exercise" ||
    typ === "devoir" ||
    typ === "serie" ||
    title.startsWith("devoir") ||
    title.startsWith("serie") ||
    title.startsWith("exercice")
  );
}

export function isCourseCategory(doc: any): boolean {
  if (!doc) return false;
  // Exclusion stricte des autres types
  if (isQuizCategory(doc)) return false;
  if (isCorrectionCategory(doc)) return false;
  if (isDevoirCategory(doc)) return false;
  if (isRevisionCategory(doc)) return false;

  const cat = normalize(doc.category);
  const ct = normalize(doc.contentType);

  return (
    ct === "course" ||
    ct === "cours" ||
    ct === "fiche" ||
    cat.includes("cours") ||
    cat.includes("course") ||
    cat.includes("fiche") ||
    cat.includes("resume") ||
    cat === "" ||
    !cat
  );
}

/**
 * Routage strict par page / catégorie
 */
export function matchesDocumentCategory(
  doc: any,
  pageOrCategory?: string,
  selectedTrimestre?: string
): boolean {
  if (!doc) return false;
  if (isQuizCategory(doc)) return false;

  const key = normalize(pageOrCategory || "");
  const isRevisionTrimester = normalize(selectedTrimestre) === "revision";

  // Page Cours : uniquement "Cours", "Fiches", "Résumé" (exclusion stricte devoirs & corrections & révisions)
  if (key === "cours" || key === "courses" || key === "fiches" || key === "course") {
    return isCourseCategory(doc);
  }

  // Page Devoirs : uniquement "Devoir", "Exercice", "Série"
  if (key === "devoirs" || key === "exercices" || key === "exercise" || key === "devoir") {
    if (isRevisionTrimester) {
      return isRevisionCategory(doc) && !isCorrectionCategory(doc);
    }
    return isDevoirCategory(doc) && !isCorrectionCategory(doc) && !isRevisionCategory(doc);
  }

  // Page Corrections : uniquement "Correction", "Correction de devoir"
  if (key === "corrections" || key === "correction" || key === "zone correction" || key === "exercise_corrected") {
    if (isRevisionTrimester) {
      return isCorrectionCategory(doc);
    }
    return isCorrectionCategory(doc);
  }

  // Page Révision : uniquement "Révision", "Examen national", "Synthèse"
  if (key === "revision" || key === "revisions" || key === "examen" || key === "synthese") {
    return isRevisionCategory(doc);
  }

  return true;
}

// --- TRI STRICT FIFO CHRONOLOGIQUE (CROISSANT : DU PREMIER AU DERNIER UPLOADÉ) ---

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
    return timeA - timeB; // Du premier uploadé au dernier uploadé (FIFO pur)
  }

  const idA = String(a?.id || a?._id || "");
  const idB = String(b?.id || b?._id || "");
  if (idA && idB) {
    const cmp = idA.localeCompare(idB, undefined, { numeric: true, sensitivity: "base" });
    if (cmp !== 0) return cmp;
  }
  return String(a?.title || "").localeCompare(String(b?.title || ""), undefined, { numeric: true, sensitivity: "base" });
};

export interface DocumentFilterOptions {
  activeCategory?: string;
  currentSection?: string;
  selectedTrimestre?: string;
  selectedTrimester?: string;
  selectedPeriod?: string;
  currentSubmenu?: string;
  page?: "cours" | "devoirs" | "corrections" | "revision" | string;
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

  // --- 1. FILTRAGE LARGE DES CATÉGORIES PAR PAGE (MAPPAGE SOUPLE) ---
  const targetSectionRaw = options?.activeCategory || options?.currentSection || options?.currentSubmenu || options?.page || "";
  const reqCatNorm = normalize(targetSectionRaw);
  const docCatNorm = normalize(doc.category || doc.type || doc.section_type || doc.contentType || "");

  // Si une catégorie de page est demandée, on vérifie si le document y correspond par inclusion large
  if (reqCatNorm && !reqCatNorm.includes("all") && !reqCatNorm.includes("tous")) {
    let categoryMatched = false;

    if (reqCatNorm.includes("cours") || reqCatNorm.includes("fiche") || reqCatNorm.includes("resume") || reqCatNorm.includes("synthese")) {
      categoryMatched = docCatNorm.includes("cours") || docCatNorm.includes("fiche") || docCatNorm.includes("resume") || docCatNorm.includes("synthese") || docCatNorm.includes("chapitre") || docCatNorm.includes("module");
    } else if (reqCatNorm.includes("devoir") || reqCatNorm.includes("exercice") || reqCatNorm.includes("serie") || reqCatNorm.includes("ds")) {
      categoryMatched = docCatNorm.includes("devoir") || docCatNorm.includes("exercice") || docCatNorm.includes("serie") || docCatNorm.includes("ds") || docCatNorm.includes("controle");
    } else if (reqCatNorm.includes("correction") || reqCatNorm.includes("corrige") || reqCatNorm.includes("solution")) {
      categoryMatched = docCatNorm.includes("correction") || docCatNorm.includes("corrige") || docCatNorm.includes("solution");
    } else if (reqCatNorm.includes("revision") || reqCatNorm.includes("examen") || reqCatNorm.includes("bac") || reqCatNorm.includes("concours")) {
      categoryMatched = docCatNorm.includes("revision") || docCatNorm.includes("examen") || docCatNorm.includes("bac") || docCatNorm.includes("concours") || docCatNorm.includes("epreuve");
    } else {
      // Par défaut si la catégorie ne correspond à aucun filtre strict de page, on autorise ou on fait un match large
      categoryMatched = docCatNorm.includes(reqCatNorm) || reqCatNorm.includes(docCatNorm);
    }

    // Si la catégorie ne correspond pas à la page active, on exclut le document
    if (!categoryMatched && docCatNorm !== "") {
      // Exception de secours : si le document n'a pas de catégorie claire, on le laisse passer sur la page Cours par défaut
      if (!(reqCatNorm.includes("cours") && !docCatNorm)) {
        return false;
      }
    }
  }

  const userRole = normalize(user?.role || "student");
  const isStaff = userRole === "admin" || userRole === "agent";
  if (isStaff || !user) return true;

  // --- 2. FILTRAGE NIVEAU ET FILIÈRE (MODE PERMISSIF) ---
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
