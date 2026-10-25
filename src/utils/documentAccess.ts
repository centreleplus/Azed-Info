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
import { filterDocuments, normalize, normalizeString } from "./documentFilter";
import {
  STORAGE_KEY,
  CUSTOM_CHAPTERS_KEY,
  getGlobalDocuments,
  saveGlobalDocument,
  deleteGlobalDocument,
  persistGlobalDocumentsList,
  getGlobalCustomChapters,
  saveGlobalCustomChapter
} from "./documentStorage";

export {
  USER_RANK,
  normalizeCanonicalGrade,
  normalizeCanonicalStream,
  normalizeCanonicalTrimester,
  normalizeCanonicalCategory,
  filterDocuments,
  normalize,
  normalizeString,
  STORAGE_KEY,
  CUSTOM_CHAPTERS_KEY,
  getGlobalDocuments,
  saveGlobalDocument,
  deleteGlobalDocument,
  persistGlobalDocumentsList,
  getGlobalCustomChapters,
  saveGlobalCustomChapter
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
  const levelsArr = Array.isArray(doc.levels) && doc.levels.length > 0
    ? doc.levels
    : Array.isArray(doc.target?.gradeLevels) && doc.target.gradeLevels.length > 0
    ? doc.target.gradeLevels
    : typeof doc.grade === "string" && doc.grade.includes(",")
    ? doc.grade.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const streamsArr = Array.isArray(doc.target?.streams) && doc.target.streams.length > 0
    ? doc.target.streams
    : Array.isArray(doc.filiere) && doc.filiere.length > 0
    ? doc.filiere
    : typeof doc.filiere === "string" && doc.filiere.includes(",")
    ? doc.filiere.split(",").map((s: string) => s.trim()).filter(Boolean)
    : typeof doc.section === "string" && doc.section.includes(",")
    ? doc.section.split(",").map((s: string) => s.trim()).filter(Boolean)
    : [];

  const rawGrade =
    levelsArr.length > 1
      ? levelsArr.join(", ")
      : levelsArr.length === 1
      ? levelsArr[0]
      : doc.grade || doc.level || doc.academicLevel || "ALL";
  const rawStream =
    streamsArr.length > 1
      ? streamsArr.join(", ")
      : streamsArr.length === 1
      ? streamsArr[0]
      : doc.stream || doc.section || doc.filiere || doc.field || "ALL";

  const grade = levelsArr.length > 1 ? levelsArr.join(", ") : normalizeCanonicalGrade(rawGrade);
  const stream = streamsArr.length > 1 ? streamsArr.join(", ") : normalizeCanonicalStream(rawStream, rawGrade);
  const minBadge = resolveCanonicalMinBadge(doc);
  const trimester = normalizeCanonicalTrimester(doc.trimester || doc.trimestre || doc.academicPeriod || "1er Trimestre");
  const category = normalizeCanonicalCategory(doc);

  return {
    ...doc,
    grade,
    levels: levelsArr.length > 0 ? levelsArr : [grade],
    stream,
    section: doc.section || stream,
    filiere: doc.filiere || stream,
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
    selectedTrimestre?: string;
    selectedPeriod?: string;
    activeCategory?: string;
    currentSection?: string;
    currentSubmenu?: string;
  }
): boolean {
  return filterDocuments(doc, user, options);
}

export function isDocumentAllowedForStudent(
  doc: any,
  user: any,
  options?: { selectedTrimester?: string; selectedTrimestre?: string; activeCategory?: string }
): boolean {
  return filterDocuments(doc, user, options);
}

/**
 * Nettoie et normalise un nom de fichier (remplace les espaces et caractères spéciaux/accentués par des tirets).
 */
export function sanitizeDocumentFileName(rawName: string, fallbackExt: string = "pdf"): string {
  if (!rawName || typeof rawName !== "string") {
    return `document-${Date.now()}.${fallbackExt}`;
  }
  const trimmed = rawName.trim();
  const lastDotIdx = trimmed.lastIndexOf(".");
  let baseName = lastDotIdx > 0 ? trimmed.substring(0, lastDotIdx) : trimmed;
  let ext = lastDotIdx > 0 ? trimmed.substring(lastDotIdx + 1).toLowerCase() : fallbackExt.toLowerCase();

  ext = ext.replace(/[^a-z0-9]/g, "") || fallbackExt.toLowerCase();
  baseName = baseName
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  if (!baseName) {
    baseName = `document-${Date.now()}`;
  }
  return `${baseName}.${ext}`;
}

/**
 * Magasin en mémoire et IndexedDB pour garantir que les fichiers PDF (Base64 / Blob URL)
 * restent toujours ouvrables même si localStorage atteint son quota de 5 Mo.
 */
const MEMORY_DOCUMENT_FILES = new Map<string, { fileData?: string; blobUrl?: string; fileUrl?: string }>();

const IDB_NAME = "azed_documents_files_db";
const IDB_STORE = "files";

function saveFileToIndexedDb(docId: string, fileData: string): void {
  if (typeof window === "undefined" || !window.indexedDB || !docId || !fileData) return;
  try {
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => {
      try {
        const db = req.result;
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).put(fileData, String(docId));
      } catch (e) {}
    };
  } catch (e) {}
}

function getFileFromIndexedDb(docId: string): Promise<string | null> {
  return new Promise((resolve) => {
    if (typeof window === "undefined" || !window.indexedDB || !docId) {
      resolve(null);
      return;
    }
    try {
      const req = window.indexedDB.open(IDB_NAME, 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if (!db.objectStoreNames.contains(IDB_STORE)) {
          db.createObjectStore(IDB_STORE);
        }
      };
      req.onsuccess = () => {
        try {
          const db = req.result;
          const tx = db.transaction(IDB_STORE, "readonly");
          const getReq = tx.objectStore(IDB_STORE).get(String(docId));
          getReq.onsuccess = () => resolve((getReq.result as string) || null);
          getReq.onerror = () => resolve(null);
        } catch (e) {
          resolve(null);
        }
      };
      req.onerror = () => resolve(null);
    } catch (e) {
      resolve(null);
    }
  });
}

function deleteFileFromIndexedDb(docId: string): void {
  if (typeof window === "undefined" || !window.indexedDB || !docId) return;
  try {
    const req = window.indexedDB.open(IDB_NAME, 1);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    req.onsuccess = () => {
      try {
        const db = req.result;
        const tx = db.transaction(IDB_STORE, "readwrite");
        tx.objectStore(IDB_STORE).delete(String(docId));
      } catch (e) {}
    };
  } catch (e) {}
}

const DELETED_DOCS_KEY = "zed_deleted_document_ids";

export function getDeletedDocumentIds(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = localStorage.getItem(DELETED_DOCS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return new Set(parsed.map((id) => String(id)));
      }
    }
  } catch (e) {}
  return new Set();
}

export function markDocumentDeleted(docId: string): void {
  if (typeof window === "undefined" || !docId) return;
  try {
    const set = getDeletedDocumentIds();
    set.add(String(docId));
    localStorage.setItem(DELETED_DOCS_KEY, JSON.stringify(Array.from(set)));
  } catch (e) {}
}

export function unmarkDocumentDeleted(docId: string): void {
  if (typeof window === "undefined" || !docId) return;
  try {
    const set = getDeletedDocumentIds();
    if (set.has(String(docId))) {
      set.delete(String(docId));
      localStorage.setItem(DELETED_DOCS_KEY, JSON.stringify(Array.from(set)));
    }
  } catch (e) {}
}

export function base64ToBlobUrl(dataUrl: string, defaultMime: string = "application/pdf"): string {
  if (!dataUrl || typeof dataUrl !== "string") return "";
  if (dataUrl.startsWith("blob:")) return dataUrl;
  if (!dataUrl.startsWith("data:")) return dataUrl;
  try {
    const parts = dataUrl.split(",");
    const header = parts[0] || "";
    const base64 = parts.length > 1 ? parts[1] : parts[0];
    const mimeMatch = header.match(/data:([^;]+);/);
    const mimeType = mimeMatch ? mimeMatch[1] : defaultMime;
    const binaryStr = window.atob(base64);
    const len = binaryStr.length;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < len; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }
    const blob = new Blob([bytes], { type: mimeType });
    return URL.createObjectURL(blob);
  } catch (e) {
    return dataUrl;
  }
}

/**
 * Normalise les métadonnées d'un document avant l'enregistrement (ID unique, createdAt, nom nettoyé, URL de secours).
 */
export function normalizeUploadedDocumentMetadata(payload: any): any {
  if (!payload || typeof payload !== "object") return payload;
  const nowIso = new Date().toISOString();
  const docId = String(payload.id || payload._id || Date.now());
  const rawFormat = String(payload.fileFormat || payload.fileType || "pdf").toLowerCase().trim().replace(/^\./, "");
  const cleanAttachmentName = payload.attachmentName
    ? sanitizeDocumentFileName(payload.attachmentName, rawFormat || "pdf")
    : payload.fileName
    ? sanitizeDocumentFileName(payload.fileName, rawFormat || "pdf")
    : sanitizeDocumentFileName(payload.title || "document", rawFormat || "pdf");

  const rawTrim = String(payload.trimestre || payload.trimester || payload.submenu || "1er Trimestre").trim();
  const canonicalTrim =
    rawTrim.toLowerCase() === "correction" || rawTrim.toLowerCase() === "enonce" || rawTrim.toLowerCase() === "énoncé"
      ? "Live Enregistré"
      : normalizeCanonicalTrimester(rawTrim);

  const rawFileData = typeof payload.fileData === "string" && payload.fileData.trim() ? payload.fileData.trim() : "";
  const rawBlobUrl = typeof payload.blobUrl === "string" && payload.blobUrl.trim() ? payload.blobUrl.trim() : "";
  const rawFileUrl = typeof payload.fileUrl === "string" && payload.fileUrl.trim() ? payload.fileUrl.trim() : "";
  const rawVideoUrl = typeof payload.videoUrl === "string" && payload.videoUrl.trim() ? payload.videoUrl.trim() : "";
  const rawUrl = typeof payload.url === "string" && payload.url.trim() ? payload.url.trim() : "";

  // Si on a un fichier Base64 ou Blob, s'assurer qu'il est mémorisé pour ouverture directe
  let effectiveBlobUrl = rawBlobUrl;
  if (rawFileData && rawFileData.startsWith("data:") && typeof window !== "undefined") {
    const existingMem = MEMORY_DOCUMENT_FILES.get(docId);
    if (existingMem?.blobUrl) {
      effectiveBlobUrl = existingMem.blobUrl;
    } else {
      effectiveBlobUrl = base64ToBlobUrl(rawFileData, rawFormat === "pdf" ? "application/pdf" : undefined);
    }
    MEMORY_DOCUMENT_FILES.set(docId, {
      fileData: rawFileData,
      blobUrl: effectiveBlobUrl,
      fileUrl: rawFileUrl || effectiveBlobUrl
    });
    saveFileToIndexedDb(docId, rawFileData);
  } else if (rawBlobUrl) {
    MEMORY_DOCUMENT_FILES.set(docId, {
      ...(MEMORY_DOCUMENT_FILES.get(docId) || {}),
      blobUrl: rawBlobUrl,
      fileUrl: rawFileUrl || rawBlobUrl
    });
  }

  const isGenericApiPdfUrl = rawFileUrl.startsWith("/api/courses/pdf/");
  const resolvedFileUrl =
    (!isGenericApiPdfUrl && rawFileUrl) ||
    rawVideoUrl ||
    rawUrl ||
    rawFileData ||
    effectiveBlobUrl ||
    rawFileUrl ||
    (rawFormat === "pdf" ? `/api/courses/pdf/${docId}` : "");

  const levelsList = Array.isArray(payload.levels) && payload.levels.length > 0
    ? payload.levels
    : Array.isArray(payload.target?.gradeLevels) && payload.target.gradeLevels.length > 0
    ? payload.target.gradeLevels
    : payload.grade
    ? String(payload.grade).split(",").map((s: string) => s.trim()).filter(Boolean)
    : ["Tous les niveaux"];

  const streamsList = Array.isArray(payload.target?.streams) && payload.target.streams.length > 0
    ? payload.target.streams
    : payload.filiere
    ? String(payload.filiere).split(",").map((s: string) => s.trim()).filter(Boolean)
    : payload.section
    ? String(payload.section).split(",").map((s: string) => s.trim()).filter(Boolean)
    : ["Toutes les filières"];

  const badgesList = Array.isArray(payload.badges) && payload.badges.length > 0
    ? payload.badges
    : Array.isArray(payload.allowedBadges) && payload.allowedBadges.length > 0
    ? payload.allowedBadges
    : Array.isArray(payload.targetTiers) && payload.targetTiers.length > 0
    ? payload.targetTiers
    : Array.isArray(payload.allowedTiers) && payload.allowedTiers.length > 0
    ? payload.allowedTiers
    : ["FREEMIUM"];

  const resolvedModule = String(payload.module || payload.chapterTitle || payload.chapter || "Fichiers").trim();

  return {
    ...payload,
    id: docId,
    createdAt: payload.createdAt || nowIso,
    module: resolvedModule,
    chapterTitle: payload.chapterTitle || resolvedModule,
    chapter: payload.chapter || resolvedModule,
    attachmentName: cleanAttachmentName,
    fileName: cleanAttachmentName,
    submenu: payload.submenu || rawTrim,
    trimestre: rawTrim,
    trimester: payload.trimester ? String(payload.trimester).trim() : canonicalTrim,
    levels: levelsList,
    grade: payload.grade || levelsList.join(", "),
    filiere: payload.filiere || payload.section || streamsList.join(", "),
    section: payload.section || payload.filiere || streamsList.join(", "),
    badges: badgesList,
    allowedBadges: payload.allowedBadges || badgesList,
    allowedTiers: payload.allowedTiers || badgesList,
    targetTiers: payload.targetTiers || badgesList,
    fileUrl: resolvedFileUrl,
    blobUrl: effectiveBlobUrl || payload.blobUrl,
    fileData: rawFileData || payload.fileData
  };
}

export const GLOBAL_DOCUMENTS_STORAGE_KEY = "zed_global_documents_v2";
export const DOCUMENT_STORAGE_KEYS = [
  STORAGE_KEY,
  GLOBAL_DOCUMENTS_STORAGE_KEY,
  "zed_admin_documents",
  "admin_documents",
  "zed_documents"
] as const;

function writeDocumentListToLocalStorage(list: any[]): void {
  if (typeof window === "undefined") return;
  for (const key of DOCUMENT_STORAGE_KEYS) {
    try {
      localStorage.setItem(key, JSON.stringify(list));
    } catch (quotaErr) {
      try {
        const safeList = list.map((d) => {
          const dFileUrl = d.fileUrl && !d.fileUrl.startsWith("data:") ? d.fileUrl : (d.blobUrl || `/api/courses/pdf/${d.id}`);
          return {
            ...d,
            fileUrl: dFileUrl,
            fileData: undefined
          };
        });
        localStorage.setItem(key, JSON.stringify(safeList));
      } catch (e) {}
    }
  }
}

/**
 * Récupère la liste unifiée des documents stockés localement (avec restauration mémoire des fichiers)
 * en excluant strictement tout document supprimé explicitement par l'administrateur.
 */
export function getStoredDocuments(): any[] {
  if (typeof window === "undefined") return [];
  const deletedIds = getDeletedDocumentIds();
  const map = new Map<string, any>();

  for (const key of DOCUMENT_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          for (const item of parsed) {
            if (item && (item.id || item._id) && !item.deleted) {
              const id = String(item.id || item._id);
              if (deletedIds.has(id)) continue;
              const existing = map.get(id) || {};
              const mem = MEMORY_DOCUMENT_FILES.get(id);
              const fileData = item.fileData || existing.fileData || mem?.fileData;
              const blobUrl = item.blobUrl || existing.blobUrl || mem?.blobUrl;
              const fileUrl =
                (item.fileUrl && !item.fileUrl.startsWith("/api/courses/pdf/") ? item.fileUrl : "") ||
                (existing.fileUrl && !existing.fileUrl.startsWith("/api/courses/pdf/") ? existing.fileUrl : "") ||
                mem?.fileUrl ||
                blobUrl ||
                item.fileUrl ||
                existing.fileUrl ||
                item.videoUrl ||
                "";

              map.set(id, {
                ...existing,
                ...item,
                id,
                fileData,
                blobUrl,
                fileUrl
              });
            }
          }
        }
      }
    } catch (e) {}
  }

  // Inclure également les documents stockés dans azed_mock_db_store.courses s'ils existent
  try {
    const rawMock = localStorage.getItem("azed_mock_db_store");
    if (rawMock) {
      const parsedMock = JSON.parse(rawMock);
      if (parsedMock && Array.isArray(parsedMock.courses)) {
        for (const item of parsedMock.courses) {
          if (item && (item.id || item._id) && !item.deleted) {
            const id = String(item.id || item._id);
            if (deletedIds.has(id)) continue;
            const existing = map.get(id) || {};
            const mem = MEMORY_DOCUMENT_FILES.get(id);
            map.set(id, {
              ...item,
              ...existing,
              id,
              fileData: existing.fileData || item.fileData || mem?.fileData,
              blobUrl: existing.blobUrl || item.blobUrl || mem?.blobUrl,
              fileUrl: existing.fileUrl || item.fileUrl || mem?.fileUrl || mem?.blobUrl || item.videoUrl || ""
            });
          }
        }
      }
    }
  } catch (e) {}

  return Array.from(map.values()).sort((a, b) => {
    const tA = new Date(a.createdAt || a.metadata?.uploadedAt || 0).getTime();
    const tB = new Date(b.createdAt || b.metadata?.uploadedAt || 0).getTime();
    return tB - tA;
  });
}

/**
 * Initialise et synchronise la clé globale 'zed_global_documents_v2' en combinant
 * les documents par défaut et les ajouts de l'administrateur sans perte au changement de compte.
 */
export function initializeGlobalDocuments(defaultDocs: any[] = []): any[] {
  if (typeof window === "undefined") return defaultDocs;
  const merged = mergeAndPersistDocuments(defaultDocs);
  return merged;
}

/**
 * Fusionne sans perte les documents provenant du serveur avec ceux déjà stockés localement,
 * sans jamais écraser les données de fichiers (fileData/blobUrl) ni réintroduire un document supprimé.
 */
export function mergeAndPersistDocuments(serverDocs: any[]): any[] {
  if (typeof window === "undefined") return Array.isArray(serverDocs) ? serverDocs : [];
  const deletedIds = getDeletedDocumentIds();
  const localDocs = getStoredDocuments();
  const map = new Map<string, any>();

  for (const item of Array.isArray(serverDocs) ? serverDocs : []) {
    if (item && (item.id !== undefined || item._id !== undefined) && !item.deleted) {
      const id = String(item.id ?? item._id);
      if (deletedIds.has(id)) continue;
      const mem = MEMORY_DOCUMENT_FILES.get(id);
      map.set(id, {
        ...item,
        id,
        fileData: item.fileData || mem?.fileData,
        blobUrl: item.blobUrl || mem?.blobUrl,
        fileUrl: item.fileUrl || mem?.fileUrl || mem?.blobUrl || item.videoUrl || ""
      });
    }
  }

  for (const local of localDocs) {
    if (local && local.id !== undefined && !local.deleted) {
      const id = String(local.id);
      if (deletedIds.has(id)) continue;
      const existing = map.get(id) || {};
      const mem = MEMORY_DOCUMENT_FILES.get(id);
      const fileData = local.fileData || existing.fileData || mem?.fileData;
      const blobUrl = local.blobUrl || existing.blobUrl || mem?.blobUrl;
      const fileUrl =
        (local.fileUrl && !local.fileUrl.startsWith("/api/courses/pdf/") ? local.fileUrl : "") ||
        (existing.fileUrl && !existing.fileUrl.startsWith("/api/courses/pdf/") ? existing.fileUrl : "") ||
        mem?.fileUrl ||
        blobUrl ||
        local.fileUrl ||
        existing.fileUrl ||
        local.videoUrl ||
        existing.videoUrl ||
        "";

      map.set(id, {
        ...existing,
        ...local,
        id,
        fileData,
        blobUrl,
        fileUrl
      });
    }
  }

  const mergedList = Array.from(map.values()).sort((a, b) => {
    const tA = new Date(a.createdAt || a.metadata?.uploadedAt || 0).getTime();
    const tB = new Date(b.createdAt || b.metadata?.uploadedAt || 0).getTime();
    return tB - tA;
  });

  writeDocumentListToLocalStorage(mergedList);
  return mergedList;
}

/**
 * Enregistre ou met à jour un document dans le stockage centralisé (localStorage + mémoire + IndexedDB)
 * et déclenche les événements de synchronisation temps réel.
 */
export function saveDocument(docInput: any, isEdit: boolean = false): any[] {
  if (!docInput || typeof window === "undefined") return getStoredDocuments();
  const normalized = normalizeUploadedDocumentMetadata(docInput);
  const docId = String(normalized.id);
  unmarkDocumentDeleted(docId);

  if (normalized.fileData && typeof normalized.fileData === "string" && normalized.fileData.startsWith("data:")) {
    const blobUrl = normalized.blobUrl || base64ToBlobUrl(normalized.fileData);
    MEMORY_DOCUMENT_FILES.set(docId, {
      fileData: normalized.fileData,
      blobUrl,
      fileUrl: normalized.fileUrl || blobUrl
    });
    saveFileToIndexedDb(docId, normalized.fileData);
  }

  const currentList = getStoredDocuments();
  const exists = currentList.some((d) => String(d.id) === docId);
  const updatedList = (isEdit || exists)
    ? currentList.map((d) => {
        if (String(d.id) !== docId) return d;
        return {
          ...d,
          ...normalized,
          fileData: normalized.fileData || d.fileData,
          blobUrl: normalized.blobUrl || d.blobUrl,
          fileUrl: normalized.fileUrl || d.fileUrl
        };
      })
    : [normalized, ...currentList.filter((d) => String(d.id) !== docId)];

  writeDocumentListToLocalStorage(updatedList);

  // Synchroniser aussi azed_mock_db_store.courses si présent
  try {
    const rawMock = localStorage.getItem("azed_mock_db_store");
    if (rawMock) {
      const parsedMock = JSON.parse(rawMock);
      if (parsedMock && Array.isArray(parsedMock.courses)) {
        const LightDoc = {
          ...normalized,
          fileUrl: normalized.fileUrl && !normalized.fileUrl.startsWith("data:") ? normalized.fileUrl : (normalized.blobUrl || `/api/courses/pdf/${docId}`),
          fileData: normalized.fileData && normalized.fileData.length < 500000 ? normalized.fileData : undefined
        };
        const idx = parsedMock.courses.findIndex((c: any) => String(c.id) === docId);
        if (idx !== -1) {
          parsedMock.courses[idx] = { ...parsedMock.courses[idx], ...LightDoc };
        } else {
          parsedMock.courses.unshift(LightDoc);
        }
        localStorage.setItem("azed_mock_db_store", JSON.stringify(parsedMock));
      }
    }
  } catch (e) {}

  clearStudentSessionCache();
  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event("zed-documents-updated"));
      window.dispatchEvent(new CustomEvent("documents-updated", { detail: updatedList }));
    } catch (e) {}
  }
  return updatedList;
}

/**
 * Supprime définitivement un document de toutes les clés de stockage local, mémoire et IndexedDB
 * uniquement suite à l'action explicite de l'administrateur.
 */
export function deleteStoredDocument(docId: string): any[] {
  const targetId = String(docId);
  markDocumentDeleted(targetId);
  MEMORY_DOCUMENT_FILES.delete(targetId);
  deleteFileFromIndexedDb(targetId);

  for (const key of DOCUMENT_STORAGE_KEYS) {
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const list = JSON.parse(raw);
        if (Array.isArray(list)) {
          localStorage.setItem(
            key,
            JSON.stringify(list.filter((d: any) => String(d.id || d._id) !== targetId))
          );
        }
      }
    } catch (e) {}
  }

  try {
    const rawMock = localStorage.getItem("azed_mock_db_store");
    if (rawMock) {
      const parsedMock = JSON.parse(rawMock);
      if (parsedMock && Array.isArray(parsedMock.courses)) {
        parsedMock.courses = parsedMock.courses.filter((c: any) => String(c.id || c._id) !== targetId);
        localStorage.setItem("azed_mock_db_store", JSON.stringify(parsedMock));
      }
    }
  } catch (e) {}

  clearStudentSessionCache();

  if (typeof window !== "undefined") {
    try {
      window.dispatchEvent(new Event("zed-documents-updated"));
      window.dispatchEvent(new CustomEvent("document-updated", { detail: { id: targetId, deleted: true } }));
      window.dispatchEvent(new CustomEvent("documents-updated", { detail: { id: targetId, deleted: true } }));
      window.dispatchEvent(new CustomEvent("admin-content-updated", { detail: { type: "course_deleted", id: targetId } }));
      window.dispatchEvent(new CustomEvent("realtime-event", { detail: { type: "DOCUMENT_DELETED", id: targetId } }));
      const bc = new BroadcastChannel("azed_docs_sync");
      bc.postMessage({ type: "DOCUMENT_DELETED", id: targetId });
      bc.close();
    } catch (e) {}
  }

  return getStoredDocuments();
}

/**
 * Résout de manière sécurisée l'URL ou la source de données d'un fichier PDF.
 */
export function resolveSafePdfUrl(doc: any): string {
  if (!doc) return "";
  const docId = String(doc.id || doc._id || "");
  const mem = docId ? MEMORY_DOCUMENT_FILES.get(docId) : undefined;

  if (mem?.blobUrl) return mem.blobUrl;
  if (typeof doc.blobUrl === "string" && doc.blobUrl.startsWith("blob:")) {
    return doc.blobUrl;
  }

  const candidates = [doc.fileUrl, doc.url, doc.path, doc.supportUrl, doc.videoUrl, mem?.fileUrl];
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0 && !c.startsWith("data:") && !c.startsWith("/api/courses/pdf/")) {
      return c.trim();
    }
  }
  const dataSource =
    (typeof doc.fileData === "string" && doc.fileData.startsWith("data:") && doc.fileData) ||
    (typeof mem?.fileData === "string" && mem.fileData.startsWith("data:") && mem.fileData) ||
    (typeof doc.fileUrl === "string" && doc.fileUrl.startsWith("data:") && doc.fileUrl) ||
    (typeof doc.videoUrl === "string" && doc.videoUrl.startsWith("data:") && doc.videoUrl) ||
    "";
  if (dataSource) {
    const blobUrl = base64ToBlobUrl(dataSource);
    if (docId && blobUrl.startsWith("blob:")) {
      MEMORY_DOCUMENT_FILES.set(docId, { ...(mem || {}), fileData: dataSource, blobUrl });
    }
    return blobUrl;
  }
  for (const c of candidates) {
    if (typeof c === "string" && c.trim().length > 0) {
      return c.trim();
    }
  }
  if (docId) {
    return `/api/courses/pdf/${encodeURIComponent(docId)}`;
  }
  return "";
}

/**
 * Ouvre ou télécharge un document PDF/fichier de manière résiliente
 * (supporte Blob URL, Base64 DataURL converti en Blob URL, IndexedDB et routes serveur).
 */
export function openOrDownloadPdfDocument(doc: any, e?: { preventDefault?: () => void; stopPropagation?: () => void }): void {
  if (!doc) return;
  if (e?.preventDefault) e.preventDefault();
  if (e?.stopPropagation) e.stopPropagation();

  const docId = String(doc.id || doc._id || "");
  const mem = docId ? MEMORY_DOCUMENT_FILES.get(docId) : undefined;

  const openTargetUrl = (urlToOpen: string) => {
    if (!urlToOpen) return;
    const newWin = window.open(urlToOpen, "_blank", "noopener,noreferrer");
    if (!newWin && urlToOpen.startsWith("blob:")) {
      const link = document.createElement("a");
      link.href = urlToOpen;
      link.download = sanitizeDocumentFileName(doc.attachmentName || doc.fileName || doc.title || "document.pdf", "pdf");
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  try {
    // 1. Si une URL serveur réelle (/uploads/...) ou externe (http...) existe, l'utiliser en priorité
    const directServerUrl = [doc.fileUrl, doc.videoUrl, doc.url, doc.supportUrl].find(
      (u) => typeof u === "string" && (u.startsWith("/uploads/") || u.startsWith("http://") || u.startsWith("https://"))
    );
    if (directServerUrl) {
      openTargetUrl(directServerUrl);
      return;
    }

    // 2. Si une Blob URL existe déjà en mémoire ou sur le document
    const existingBlob = (typeof doc.blobUrl === "string" && doc.blobUrl.startsWith("blob:") && doc.blobUrl) || mem?.blobUrl;
    if (existingBlob) {
      openTargetUrl(existingBlob);
      return;
    }

    // 3. Si une chaîne Base64 data: est disponible dans le document, en mémoire ou dans localStorage
    let rawDataUrl =
      (typeof doc.fileData === "string" && doc.fileData.startsWith("data:") ? doc.fileData : "") ||
      (typeof mem?.fileData === "string" && mem.fileData.startsWith("data:") ? mem.fileData : "") ||
      (typeof doc.fileUrl === "string" && doc.fileUrl.startsWith("data:") ? doc.fileUrl : "") ||
      (typeof doc.videoUrl === "string" && doc.videoUrl.startsWith("data:") ? doc.videoUrl : "") ||
      (typeof doc.url === "string" && doc.url.startsWith("data:") ? doc.url : "");

    if (!rawDataUrl && docId) {
      const storedDoc = getStoredDocuments().find((d) => String(d.id) === docId);
      if (storedDoc) {
        if (storedDoc.fileUrl && (storedDoc.fileUrl.startsWith("/uploads/") || storedDoc.fileUrl.startsWith("http"))) {
          openTargetUrl(storedDoc.fileUrl);
          return;
        }
        rawDataUrl =
          (typeof storedDoc.fileData === "string" && storedDoc.fileData.startsWith("data:") ? storedDoc.fileData : "") ||
          (typeof storedDoc.fileUrl === "string" && storedDoc.fileUrl.startsWith("data:") ? storedDoc.fileUrl : "");
      }
    }

    if (rawDataUrl) {
      const blobUrl = base64ToBlobUrl(rawDataUrl);
      if (docId && blobUrl.startsWith("blob:")) {
        MEMORY_DOCUMENT_FILES.set(docId, { fileData: rawDataUrl, blobUrl });
      }
      openTargetUrl(blobUrl);
      return;
    }

    // 4. Vérifier dans IndexedDB si le fichier Base64 y a été sauvegardé
    if (docId) {
      getFileFromIndexedDb(docId).then((idbData) => {
        if (idbData && idbData.startsWith("data:")) {
          const blobUrl = base64ToBlobUrl(idbData);
          MEMORY_DOCUMENT_FILES.set(docId, { fileData: idbData, blobUrl });
          openTargetUrl(blobUrl);
        } else {
          const fallback = resolveSafePdfUrl(doc);
          if (fallback) openTargetUrl(fallback);
        }
      });
      return;
    }

    const targetUrl = resolveSafePdfUrl(doc);
    if (targetUrl) {
      openTargetUrl(targetUrl);
    }
  } catch (err) {
    console.error("Erreur lors de l'ouverture du PDF, tentative de secours :", err);
    const fallbackUrl = resolveSafePdfUrl(doc);
    if (fallbackUrl) {
      openTargetUrl(fallbackUrl);
    }
  }
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

export interface StudentSessionCacheStore {
  sessionKey: string;
  corrections: any[] | null;
  courses: any[] | null;
  devoirs: any[] | null;
  quizzes: any[] | null;
  quizTips: any[] | null;
  quizPerformance: any | null;
}

const SESSION_DOCUMENT_CACHE: StudentSessionCacheStore = {
  sessionKey: "",
  corrections: null,
  courses: null,
  devoirs: null,
  quizzes: null,
  quizTips: null,
  quizPerformance: null
};

export function getStudentSessionCache(sessionKey: string): StudentSessionCacheStore {
  if (SESSION_DOCUMENT_CACHE.sessionKey !== sessionKey) {
    SESSION_DOCUMENT_CACHE.sessionKey = sessionKey;
    SESSION_DOCUMENT_CACHE.corrections = null;
    SESSION_DOCUMENT_CACHE.courses = null;
    SESSION_DOCUMENT_CACHE.devoirs = null;
    SESSION_DOCUMENT_CACHE.quizzes = null;
    SESSION_DOCUMENT_CACHE.quizTips = null;
    SESSION_DOCUMENT_CACHE.quizPerformance = null;
  }
  return SESSION_DOCUMENT_CACHE;
}

export function clearStudentSessionCache(): void {
  SESSION_DOCUMENT_CACHE.sessionKey = "";
  SESSION_DOCUMENT_CACHE.corrections = null;
  SESSION_DOCUMENT_CACHE.courses = null;
  SESSION_DOCUMENT_CACHE.devoirs = null;
  SESSION_DOCUMENT_CACHE.quizzes = null;
  SESSION_DOCUMENT_CACHE.quizTips = null;
  SESSION_DOCUMENT_CACHE.quizPerformance = null;
}

// Invalidation automatique du cache de session dès qu'un document est ajouté ou modifié par l'administrateur
if (typeof window !== "undefined") {
  const invalidateOnSync = () => {
    clearStudentSessionCache();
  };
  window.addEventListener("zed-documents-updated", invalidateOnSync);
  window.addEventListener("document-updated", invalidateOnSync);
  window.addEventListener("admin-content-updated", invalidateOnSync);
  window.addEventListener("realtime-event", invalidateOnSync);
  try {
    const bc = new BroadcastChannel("azed_docs_sync");
    bc.onmessage = () => {
      clearStudentSessionCache();
    };
  } catch (e) {}
}

export default isDocumentAllowedForStudent;
