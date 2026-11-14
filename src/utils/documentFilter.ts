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

/**
 * Normalise toutes les variantes de trimestres / périodes (1er, 1ère, T1, Révision, Live Enregistré...)
 */
export function normalizePeriodKey(val: any): string {
  const t = normalize(val);
  if (
    !t ||
    t === "all" ||
    t === "global" ||
    t === "tout" ||
    t.includes("tous") ||
    t.includes("toutes") ||
    t.includes("annee") ||
    t.includes("annuel")
  ) {
    return "all";
  }
  if (
    t.includes("1er") ||
    t.includes("1ere") ||
    t.includes("premier") ||
    t === "t1" ||
    t === "1" ||
    /\btrimestre\s*1\b/.test(t) ||
    /\b1\s*trimestre\b/.test(t)
  ) {
    return "1er trimestre";
  }
  if (
    t.includes("2eme") ||
    t.includes("2nd") ||
    t.includes("2e") ||
    t.includes("deuxieme") ||
    t === "t2" ||
    t === "2" ||
    /\btrimestre\s*2\b/.test(t) ||
    /\b2\s*trimestre\b/.test(t)
  ) {
    return "2eme trimestre";
  }
  if (
    t.includes("3eme") ||
    t.includes("3e") ||
    t.includes("troisieme") ||
    t === "t3" ||
    t === "3" ||
    /\btrimestre\s*3\b/.test(t) ||
    /\b3\s*trimestre\b/.test(t)
  ) {
    return "3eme trimestre";
  }
  if (
    t.includes("revision") ||
    t.includes("live") ||
    t.includes("enregistre") ||
    t.includes("enonce") ||
    t.includes("replay") ||
    t.includes("examen") ||
    t.includes("concours") ||
    t.includes("synthese") ||
    t.includes("correction")
  ) {
    return "revision";
  }
  return t;
}

export const normalizeSubmenuKey = normalizePeriodKey;

function toNormalizedArray(source: any): string[] {
  if (!source) return [];
  if (Array.isArray(source)) {
    return source
      .flatMap((item) => (typeof item === "string" ? item.split(/[,;|]+/) : [String(item ?? "")]))
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
  page?: string;
  selectedTrimestre?: string;
  selectedTrimester?: string;
  selectedPeriod?: string;
  currentSubmenu?: string;
}

/**
 * Moteur de filtrage expert unifié (Catégorie/Zone, Période/Trimestre, Niveau, Filière)
 */
export function filterDocuments(doc: any, user: any, options?: DocumentFilterOptions): boolean {
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

  // --- 1. CORRESPONDANCE DES CATÉGORIES / ZONES D'AFFICHAGE ---
  const targetSectionRaw = options?.activeCategory || options?.page || options?.currentSection || "";
  const reqCatNorm = normalize(targetSectionRaw);
  const pageNorm = normalize(options?.page || "");
  const docCatNorm = normalize(doc.category || doc.contentType || doc.type || "");
  const docContentTypeNorm = normalize(doc.contentType || "");
  const docPathNorm = normalize(doc.metadata?.studentSectionPath || doc.studentSectionPath || doc.sectionPath || "");
  const docTrimNorm = normalize(doc.trimestre || doc.trimester || doc.submenu || doc.academicPeriod || "");
  const combinedDocCat = `${docCatNorm} ${docPathNorm}`.trim();

  const isQuizDoc =
    docCatNorm.includes("quiz") ||
    docCatNorm.includes("qcm") ||
    docContentTypeNorm === "quiz";
  const isQuizRequest = reqCatNorm.includes("quiz") || reqCatNorm.includes("qcm");

  if (reqCatNorm && !isQuizRequest && isQuizDoc) {
    return false;
  }

  if (reqCatNorm && !reqCatNorm.includes("all") && !reqCatNorm.includes("tous")) {
    let categoryMatched = false;

    const isDocCorrection =
      docCatNorm.includes("zone correction") ||
      docCatNorm.includes("correction") ||
      docCatNorm.includes("corrige") ||
      docCatNorm.includes("solution") ||
      docContentTypeNorm === "exercise_corrected" ||
      (docContentTypeNorm === "revision" && docTrimNorm === "correction");

    const isDocHybrid =
      docContentTypeNorm === "devoirs_exercices_fiches_cours" ||
      (docCatNorm.includes("devoir") && docCatNorm.includes("fiche"));

    if (reqCatNorm.includes("cours") || reqCatNorm.includes("fiche") || reqCatNorm.includes("resume")) {
      categoryMatched =
        (combinedDocCat.includes("fiches & cours") ||
          combinedDocCat.includes("fiches et cours") ||
          combinedDocCat.includes("cours") ||
          combinedDocCat.includes("course") ||
          combinedDocCat.includes("fiche") ||
          combinedDocCat.includes("resume") ||
          isDocHybrid) &&
        !isDocCorrection;
    } else if (
      reqCatNorm.includes("devoir") ||
      reqCatNorm.includes("exercice") ||
      reqCatNorm.includes("serie") ||
      reqCatNorm.includes("ds")
    ) {
      const allowRevisionEnonce = pageNorm.includes("revision") && docCatNorm.includes("revision") && !isDocCorrection;
      categoryMatched =
        (combinedDocCat.includes("devoirs & exercices") ||
          combinedDocCat.includes("devoirs et exercices") ||
          combinedDocCat.includes("devoir") ||
          combinedDocCat.includes("exercice") ||
          combinedDocCat.includes("exercise") ||
          combinedDocCat.includes("serie") ||
          combinedDocCat.includes("ds") ||
          isDocHybrid ||
          allowRevisionEnonce) &&
        !isDocCorrection;
    } else if (reqCatNorm.includes("correction") || reqCatNorm.includes("corrige") || reqCatNorm.includes("solution")) {
      categoryMatched = isDocCorrection;
    } else if (reqCatNorm.includes("revision") || reqCatNorm.includes("examen") || reqCatNorm.includes("bac")) {
      const docPeriodKey = normalizePeriodKey(docTrimNorm);
      categoryMatched =
        combinedDocCat.includes("revision") ||
        combinedDocCat.includes("examen") ||
        combinedDocCat.includes("bac") ||
        docPeriodKey === "revision";
    } else {
      categoryMatched = combinedDocCat.includes(reqCatNorm) || reqCatNorm.includes(docCatNorm);
    }

    if (!categoryMatched && docCatNorm !== "") {
      return false;
    }
  }

  // --- 2. FILTRAGE PAR PÉRIODE / TRIMESTRE (NORMALISÉ) ---
  const selectedPeriod =
    options?.selectedTrimestre ||
    options?.selectedTrimester ||
    options?.selectedPeriod ||
    options?.currentSubmenu ||
    "";
  const reqPeriodKey = normalizePeriodKey(selectedPeriod);

  if (selectedPeriod && reqPeriodKey !== "all") {
    const rawDocPeriod =
      doc.trimester ||
      doc.trimestre ||
      doc.period ||
      doc.academicPeriod ||
      doc.submenu ||
      "";
    if (rawDocPeriod) {
      const docPeriodKey = normalizePeriodKey(rawDocPeriod);
      const docPeriodNorm = normalize(rawDocPeriod);
      const reqPeriodNorm = normalize(selectedPeriod);

      if (
        docPeriodKey !== "all" &&
        docPeriodKey !== reqPeriodKey &&
        !docPeriodNorm.includes(reqPeriodNorm) &&
        !reqPeriodNorm.includes(docPeriodNorm)
      ) {
        return false;
      }
    }
  }

  const userRole = normalize(user?.role || "student");
  const isStaff = userRole === "admin" || userRole === "agent";
  if (isStaff || !user) return true;

  // --- 3. FILTRAGE NIVEAU ET FILIÈRE (MODE PERMISSIF & MULTI-CIBLAGE) ---
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
      if (
        !l ||
        l.includes("all") ||
        l.includes("tout") ||
        l.includes("tous") ||
        l.includes("toutes") ||
        l.includes("global")
      ) {
        return true;
      }
      if (l.includes(userLevel) || userLevel.includes(l)) {
        return true;
      }
      const docDigit = l.match(/[1234]/)?.[0] || (l.includes("bac") || l.includes("term") ? "4" : "");
      const userDigit = userLevel.match(/[1234]/)?.[0] || (userLevel.includes("bac") || userLevel.includes("term") ? "4" : "");
      return Boolean(docDigit && userDigit && docDigit === userDigit);
    });

  const userFiliere = normalize(
    user?.section || user?.stream || user?.filiere || user?.field || user?.specialite || ""
  );
  const isFirstYear = userLevel.includes("1") && !userLevel.includes("10");

  const filiereMatch =
    rawFilieres.length === 0 ||
    !userFiliere ||
    isFirstYear ||
    rawFilieres.some((f) => {
      const fl = normalize(f);
      if (
        !fl ||
        fl.includes("all") ||
        fl.includes("tout") ||
        fl.includes("tous") ||
        fl.includes("toutes") ||
        fl.includes("tronc") ||
        fl.includes("commun") ||
        fl.includes("global")
      ) {
        return true;
      }
      if (fl.includes(userFiliere) || userFiliere.includes(fl)) {
        return true;
      }
      const STREAM_KEYWORDS = ["info", "math", "exp", "svt", "tech", "eco", "gest", "lettr", "sport"];
      const userKeywords = STREAM_KEYWORDS.filter((kw) => userFiliere.includes(kw));
      return userKeywords.length > 0 && userKeywords.some((kw) => fl.includes(kw));
    });

  return levelMatch && filiereMatch;
}

/**
 * Extrait un timestamp chronologique sûr pour le tri FIFO, en évitant strictement tout NaN
 * sur les identifiants alphabétiques ou courts non-ISO (ex: "c1", "d2").
 */
function getSafeChronologicalTimestamp(item: any): number {
  if (!item) return 0;

  const dateCandidates = [
    item.createdAt,
    item.date,
    item.timestamp,
    item.uploadedAt,
    item.metadata?.uploadedAt
  ];

  for (const raw of dateCandidates) {
    if (typeof raw === "number" && Number.isFinite(raw) && raw > 0) {
      return raw;
    }
    if (typeof raw === "string" && raw.trim()) {
      const trimmed = raw.trim();
      if (/^\d{10,13}$/.test(trimmed)) {
        const num = Number(trimmed);
        return trimmed.length === 10 ? num * 1000 : num;
      }
      const parsed = Date.parse(trimmed);
      if (!Number.isNaN(parsed) && parsed > 0) {
        return parsed;
      }
    }
  }

  // Fallback sur l'ID uniquement s'il s'agit d'un timestamp numérique ou ISO valide
  const rawId = item.id ?? item._id;
  if (typeof rawId === "number" && Number.isFinite(rawId) && rawId > 0) {
    return rawId;
  }
  if (typeof rawId === "string") {
    const trimmedId = rawId.trim();
    // Chaînes purement alphabétiques ou IDs courts non-ISO (ex: "c1", "d1") -> ignorer pour éviter NaN
    if (/^\d{10,13}$/.test(trimmedId)) {
      const num = Number(trimmedId);
      return trimmedId.length === 10 ? num * 1000 : num;
    }
    const embeddedEpoch = trimmedId.match(/(?:^|[_-])(\d{13})(?:$|[_-])/);
    if (embeddedEpoch) {
      return Number(embeddedEpoch[1]);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(trimmedId)) {
      const parsedIso = Date.parse(trimmedId);
      if (!Number.isNaN(parsedIso) && parsedIso > 0) {
        return parsedIso;
      }
    }
  }

  return 0;
}

/**
 * Algorithme de Tri FIFO Strict (First In, First Out) sans jamais produire de NaN
 */
export function compareFifoAscending(a: any, b: any): number {
  const timeA = getSafeChronologicalTimestamp(a);
  const timeB = getSafeChronologicalTimestamp(b);

  if (timeA !== timeB) {
    // Si un élément n'a pas de date (0) et l'autre oui, les éléments datés sont triés chronologiquement
    if (timeA > 0 && timeB > 0) {
      return timeA - timeB;
    }
    if (timeA === 0 && timeB > 0) return -1;
    if (timeB === 0 && timeA > 0) return 1;
  }

  const orderA = typeof a?.orderIndex === "number" ? a.orderIndex : typeof a?.insertionOrder === "number" ? a.insertionOrder : null;
  const orderB = typeof b?.orderIndex === "number" ? b.orderIndex : typeof b?.insertionOrder === "number" ? b.insertionOrder : null;
  if (orderA !== null && orderB !== null && orderA !== orderB) {
    return orderA - orderB;
  }

  const idA = String(a?.id || a?._id || "");
  const idB = String(b?.id || b?._id || "");
  return idA.localeCompare(idB, undefined, { numeric: true, sensitivity: "base" });
}

export default filterDocuments;
