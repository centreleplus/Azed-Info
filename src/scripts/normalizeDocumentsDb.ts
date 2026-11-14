import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

export const OFFICIAL_TAXONOMY_CATEGORIES = {
  COURS: "Fiches & cours",
  DEVOIRS: "Devoirs & Exercices",
  CORRECTION: "Zone Correction",
  REVISION: "Révision (Live Énoncé / Replay)",
  QUIZ: "Quiz Interactifs"
} as const;

const normalizeStr = (val: any): string =>
  val !== undefined && val !== null
    ? String(val)
        .toLowerCase()
        .trim()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
    : "";

function toCleanArray(source: any): string[] {
  if (!source) return [];
  const raw = Array.isArray(source) ? source : [source];
  return raw
    .flatMap((item) =>
      typeof item === "string" ? item.split(/[,;|]+/) : [String(item ?? "")]
    )
    .map((s) => s.trim())
    .filter(Boolean);
}

export function mapCategoryToOfficialLabel(doc: any): string {
  const ct = normalizeStr(doc?.contentType || doc?.type || "");
  const cat = normalizeStr(doc?.category || "");
  const trim = normalizeStr(doc?.trimestre || doc?.trimester || doc?.submenu || "");
  const combined = `${ct} ${cat}`;

  if (
    ct === "exercise_corrected" ||
    cat.includes("correction") ||
    cat.includes("corrige") ||
    cat.includes("solution") ||
    (ct === "revision" && trim === "correction")
  ) {
    return OFFICIAL_TAXONOMY_CATEGORIES.CORRECTION;
  }

  if (
    ct === "quiz" ||
    cat.includes("quiz") ||
    cat.includes("qcm") ||
    Array.isArray(doc?.questions)
  ) {
    return OFFICIAL_TAXONOMY_CATEGORIES.QUIZ;
  }

  if (
    ct === "revision" ||
    combined.includes("revision") ||
    combined.includes("examen") ||
    combined.includes("replay")
  ) {
    return OFFICIAL_TAXONOMY_CATEGORIES.REVISION;
  }

  if (
    ct === "exercise" ||
    ct === "devoirs_exercices_fiches_cours" ||
    combined.includes("devoir") ||
    combined.includes("exercice") ||
    combined.includes("serie")
  ) {
    return OFFICIAL_TAXONOMY_CATEGORIES.DEVOIRS;
  }

  return OFFICIAL_TAXONOMY_CATEGORIES.COURS;
}

export function mapTrimesterToOfficialLabel(doc: any): string {
  const rawTrim =
    doc?.trimester ||
    doc?.trimestre ||
    doc?.academicPeriod ||
    doc?.period ||
    doc?.submenu ||
    doc?.subMenu ||
    "";
  const t = normalizeStr(rawTrim);

  if (!t) {
    const cat = normalizeStr(doc?.category || doc?.contentType || "");
    if (cat.includes("revision") || cat.includes("live")) {
      return "Live Enregistré";
    }
    return "1er Trimestre";
  }

  if (
    t.includes("1er") ||
    t.includes("1ere") ||
    t.includes("premier") ||
    t === "t1" ||
    t === "1" ||
    /\btrimestre\s*1\b/.test(t)
  ) {
    return "1er Trimestre";
  }
  if (
    t.includes("2eme") ||
    t.includes("2nd") ||
    t.includes("2e") ||
    t.includes("deuxieme") ||
    t === "t2" ||
    t === "2" ||
    /\btrimestre\s*2\b/.test(t)
  ) {
    return "2ème Trimestre";
  }
  if (
    t.includes("3eme") ||
    t.includes("3e") ||
    t.includes("troisieme") ||
    t === "t3" ||
    t === "3" ||
    /\btrimestre\s*3\b/.test(t)
  ) {
    return "3ème Trimestre";
  }
  if (
    t.includes("revision") ||
    t.includes("live") ||
    t.includes("enonce") ||
    t.includes("enregistre") ||
    t.includes("replay") ||
    t.includes("correction")
  ) {
    return "Live Enregistré";
  }

  return "1er Trimestre";
}

function normalizeGradeToken(raw: string): string {
  const clean = normalizeStr(raw).replace(/[^a-z0-9]/g, "");
  if (!clean || clean.includes("tous") || clean.includes("toutes") || clean === "all" || clean === "global") {
    return "ALL";
  }
  if (clean.includes("4") || clean.includes("bac") || clean.includes("terminale")) return "4ème";
  if (clean.includes("3")) return "3ème";
  if (clean.includes("2")) return "2ème";
  if (clean.includes("1")) return "1ère";
  return "ALL";
}

function normalizeStreamToken(raw: string, fallbackGradeText: string): string {
  const clean = normalizeStr(raw).replace(/[^a-z0-9]/g, "");
  if (
    !clean ||
    clean.includes("tous") ||
    clean.includes("toutes") ||
    clean === "all" ||
    clean === "global" ||
    clean.includes("tronc") ||
    clean.includes("commun")
  ) {
    const fb = normalizeStr(fallbackGradeText);
    if (!clean && fb.includes("info")) {
      return "Sciences de l'Informatique";
    }
    return "ALL";
  }
  if (clean.includes("info") || clean === "sti") return "Sciences de l'Informatique";
  if (clean.includes("math")) return "Mathématiques";
  if (clean.includes("exp") || clean === "svt") return "Sciences Expérimentales";
  if (clean.includes("tech")) return "Sciences Techniques";
  if (clean.includes("eco") || clean.includes("gest")) return "Économie & Gestion";
  if (clean.includes("lettr")) return "Lettres";
  if (clean.includes("sport")) return "Sport";
  return "ALL";
}

const ORPHAN_EMPTY_KEYS = [
  "level",
  "classe",
  "targetClasse",
  "niveau",
  "field",
  "specialite",
  "targetSpecialite",
  "subMenu",
  "period",
  "academicPeriod",
  "gradeLevels",
  "streams_legacy"
] as const;

export function normalizeDocumentRecord(doc: any): { doc: any; changed: boolean } {
  if (!doc || typeof doc !== "object") return { doc, changed: false };
  const beforeJson = JSON.stringify(doc);
  const next = { ...doc };

  // 1. Catégorie officielle
  next.category = mapCategoryToOfficialLabel(next);
  if (!next.contentType) {
    if (next.category === OFFICIAL_TAXONOMY_CATEGORIES.CORRECTION) next.contentType = "exercise_corrected";
    else if (next.category === OFFICIAL_TAXONOMY_CATEGORIES.DEVOIRS) next.contentType = "exercise";
    else if (next.category === OFFICIAL_TAXONOMY_CATEGORIES.REVISION) next.contentType = "revision";
    else if (next.category === OFFICIAL_TAXONOMY_CATEGORIES.QUIZ) next.contentType = "quiz";
    else next.contentType = "course";
  }

  // 2. Trimestre normalisé ("1er Trimestre", "2ème Trimestre", "3ème Trimestre" ou "Live Enregistré")
  const officialTrimester = mapTrimesterToOfficialLabel(next);
  next.trimester = officialTrimester;
  next.trimestre = officialTrimester;
  next.submenu = officialTrimester;

  // 3. Niveaux normalisés (multi-ciblage propre)
  const rawGradeCandidates = [
    ...toCleanArray(next.target?.gradeLevels),
    ...toCleanArray(next.levels),
    ...toCleanArray(next.gradeLevels),
    ...toCleanArray(next.grade),
    ...toCleanArray(next.level),
    ...toCleanArray(next.classe),
    ...toCleanArray(next.targetClasse),
    ...toCleanArray(next.niveau)
  ];
  const normGrades = Array.from(new Set(rawGradeCandidates.map(normalizeGradeToken)));
  const finalLevels =
    normGrades.length === 0 || normGrades.includes("ALL") ? ["ALL"] : normGrades;
  next.levels = finalLevels;
  next.grade = finalLevels.includes("ALL") ? "ALL" : finalLevels.join(", ");

  // 4. Filières normalisées (multi-ciblage propre)
  const rawStreamCandidates = [
    ...toCleanArray(next.target?.streams),
    ...toCleanArray(next.streams),
    ...toCleanArray(next.filieres),
    ...toCleanArray(next.section),
    ...toCleanArray(next.filiere),
    ...toCleanArray(next.stream),
    ...toCleanArray(next.field),
    ...toCleanArray(next.specialite),
    ...toCleanArray(next.targetSpecialite)
  ];
  const fallbackGradeText = rawGradeCandidates.join(" ");
  const normStreams = Array.from(
    new Set(
      (rawStreamCandidates.length > 0 ? rawStreamCandidates : [""]).map((s) =>
        normalizeStreamToken(s, fallbackGradeText)
      )
    )
  );
  const finalStreams =
    normStreams.length === 0 || normStreams.includes("ALL") ? ["ALL"] : normStreams;
  const joinedStreams = finalStreams.includes("ALL") ? "ALL" : finalStreams.join(", ");
  next.streams = finalStreams;
  next.filieres = finalStreams;
  next.section = joinedStreams;
  next.stream = joinedStreams;

  // 5. Synchroniser target.gradeLevels et target.streams
  const existingUserCategories = Array.isArray(next.target?.userCategories) && next.target.userCategories.length > 0
    ? next.target.userCategories
    : Array.isArray(next.allowedBadges) && next.allowedBadges.length > 0
    ? next.allowedBadges
    : Array.isArray(next.allowedTiers) && next.allowedTiers.length > 0
    ? next.allowedTiers
    : [next.isPremium ? "ESSENTIEL" : "FREEMIUM"];

  next.target = {
    gradeLevels: finalLevels,
    streams: finalStreams,
    userCategories: existingUserCategories
  };

  // 6. Nettoyage des propriétés vides ou orphelines pour éviter les faux rejets
  for (const orphanKey of ORPHAN_EMPTY_KEYS) {
    if (orphanKey in next) {
      delete next[orphanKey];
    }
  }
  if ("filiere" in next && (!next.filiere || String(next.filiere).trim() === "")) {
    delete next.filiere;
  }

  // 7. Champs de publication par défaut
  if (next.isPublished === undefined) next.isPublished = true;
  if (next.isInternalAdminOnly === undefined) next.isInternalAdminOnly = false;
  if (!next.createdAt && next.metadata?.uploadedAt) {
    next.createdAt = next.metadata.uploadedAt;
  }

  const changed = JSON.stringify(next) !== beforeJson;
  return { doc: next, changed };
}

export function normalizeDocumentsDatabase(db: any): number {
  if (!db || typeof db !== "object") return 0;
  let updatedCount = 0;

  if (Array.isArray(db.courses)) {
    const legacyBaseMs = Date.parse("2025-01-01T00:00:00.000Z");
    db.courses = db.courses.map((item: any, idx: number) => {
      const { doc, changed } = normalizeDocumentRecord(item);
      let finalChanged = changed;
      if (!doc.createdAt) {
        const fallbackIso = new Date(legacyBaseMs + idx * 1000).toISOString();
        doc.createdAt = fallbackIso;
        doc.created_at = fallbackIso;
        if (!doc.metadata || typeof doc.metadata !== "object") {
          doc.metadata = {};
        }
        if (!doc.metadata.uploadedAt) {
          doc.metadata.uploadedAt = fallbackIso;
        }
        finalChanged = true;
      }
      if (finalChanged) updatedCount++;
      return doc;
    });
  }

  return updatedCount;
}

// Exécution directe en tant que script CLI de migration BDD (npx tsx src/scripts/normalizeDocumentsDb.ts)
const isDirectExecution =
  typeof process !== "undefined" &&
  Array.isArray(process.argv) &&
  process.argv[1] &&
  path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isDirectExecution) {
  const targetDbPath = process.env.DATA_PATH
    ? process.env.DATA_PATH.endsWith(".json")
      ? process.env.DATA_PATH
      : path.join(process.env.DATA_PATH, "db_sandbox.json")
    : path.resolve(process.cwd(), "db_sandbox.json");

  if (!fs.existsSync(targetDbPath)) {
    console.error(`❌ Fichier BDD introuvable : ${targetDbPath}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(targetDbPath, "utf-8");
  const parsed = JSON.parse(raw);
  const count = normalizeDocumentsDatabase(parsed);

  if (count > 0) {
    fs.writeFileSync(targetDbPath, JSON.stringify(parsed, null, 2), "utf-8");
    console.log(`✅ Migration BDD terminée : ${count} document(s) normalisé(s) dans ${targetDbPath}`);
  } else {
    console.log(`✅ BDD déjà conforme à la taxonomie officielle (${targetDbPath})`);
  }
}
