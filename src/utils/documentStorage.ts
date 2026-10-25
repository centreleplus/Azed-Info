// Service de Stockage Global Unifié pour tous les documents et chapitres (Admin ↔ Étudiant)
// Garantit la persistance absolue lors des changements de compte, déconnexions et rechargements.

export const STORAGE_KEY = 'zed_master_documents_store_v3';
export const CUSTOM_CHAPTERS_KEY = 'zed_custom_chapters';

const PROTECTED_STORAGE_KEYS = [
  STORAGE_KEY,
  'zed_global_documents_v2',
  'zed_admin_documents',
  'admin_documents',
  'zed_documents',
  'zed_deleted_document_ids',
  CUSTOM_CHAPTERS_KEY,
  'zed_chapter_configs',
  'azed_mock_db_store',
  'admin_material_title_history',
];

// Protection contre localStorage.clear() appelé lors de la déconnexion (changement de compte Admin -> Étudiant)
if (typeof window !== 'undefined' && typeof Storage !== 'undefined') {
  const win = window as any;
  if (!win.__zedStorageClearPatched) {
    win.__zedStorageClearPatched = true;
    const nativeClear = Storage.prototype.clear;
    Storage.prototype.clear = function (this: Storage) {
      if (this === window.localStorage) {
        const snapshot: Record<string, string> = {};
        for (const key of PROTECTED_STORAGE_KEYS) {
          try {
            const val = this.getItem(key);
            if (val !== null) {
              snapshot[key] = val;
            }
          } catch {
            // ignore
          }
        }
        nativeClear.call(this);
        for (const [key, val] of Object.entries(snapshot)) {
          try {
            this.setItem(key, val);
          } catch {
            // ignore
          }
        }
      } else {
        nativeClear.call(this);
      }
    };
  }
}

function getDeletedIdsSet(): Set<string> {
  if (typeof window === 'undefined') return new Set();
  try {
    const raw = localStorage.getItem('zed_deleted_document_ids');
    if (!raw) return new Set();
    const parsed = JSON.parse(raw);
    return new Set(Array.isArray(parsed) ? parsed.map(String) : []);
  } catch {
    return new Set();
  }
}

function addDeletedId(id: string | number): void {
  if (typeof window === 'undefined' || (!id && id !== 0)) return;
  try {
    const set = getDeletedIdsSet();
    set.add(String(id));
    localStorage.setItem('zed_deleted_document_ids', JSON.stringify(Array.from(set)));
  } catch {
    // ignore
  }
}

function removeDeletedId(id: string | number): void {
  if (typeof window === 'undefined' || (!id && id !== 0)) return;
  try {
    const set = getDeletedIdsSet();
    if (set.has(String(id))) {
      set.delete(String(id));
      localStorage.setItem('zed_deleted_document_ids', JSON.stringify(Array.from(set)));
    }
  } catch {
    // ignore
  }
}

/**
 * Récupère tous les documents depuis le store unifié (et fusionne les clés historiques si présentes)
 */
export const getGlobalDocuments = (): any[] => {
  if (typeof window === 'undefined') return [];
  const deletedIds = getDeletedIdsSet();
  const byId = new Map<string, any>();

  const keysToRead = [
    STORAGE_KEY,
    'zed_global_documents_v2',
    'zed_admin_documents',
    'admin_documents',
    'zed_documents',
  ];

  for (const key of keysToRead) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) continue;
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        for (const doc of parsed) {
          if (!doc || typeof doc !== 'object') continue;
          const id = String(doc.id ?? '');
          if (!id || deletedIds.has(id)) continue;
          if (!byId.has(id)) {
            byId.set(id, doc);
          }
        }
      }
    } catch (e) {
      console.error('[DOC-STORE] Erreur lecture storage:', e);
    }
  }

  // Vérifier également azed_mock_db_store au cas où des documents y ont été enregistrés
  try {
    const mockRaw = localStorage.getItem('azed_mock_db_store');
    if (mockRaw) {
      const mockParsed = JSON.parse(mockRaw);
      if (mockParsed && Array.isArray(mockParsed.documents)) {
        for (const doc of mockParsed.documents) {
          if (!doc || typeof doc !== 'object') continue;
          const id = String(doc.id ?? '');
          if (!id || deletedIds.has(id)) continue;
          if (!byId.has(id)) {
            byId.set(id, doc);
          }
        }
      }
    }
  } catch {
    // ignore
  }

  return Array.from(byId.values());
};

/**
 * Persiste une liste complète de documents dans toutes les clés synchronisées
 */
export const persistGlobalDocumentsList = (docs: any[]): any[] => {
  if (typeof window === 'undefined') return docs;
  const deletedIds = getDeletedIdsSet();
  const seen = new Set<string>();
  const cleanDocs: any[] = [];

  for (const doc of docs) {
    if (!doc || typeof doc !== 'object') continue;
    const id = String(doc.id ?? '');
    if (!id || deletedIds.has(id) || seen.has(id)) continue;
    seen.add(id);
    cleanDocs.push(doc);
  }

  const serialized = JSON.stringify(cleanDocs);
  const syncKeys = [
    STORAGE_KEY,
    'zed_global_documents_v2',
    'zed_admin_documents',
    'admin_documents',
    'zed_documents',
  ];

  for (const key of syncKeys) {
    try {
      localStorage.setItem(key, serialized);
    } catch {
      // Fallback allégé si quota dépassé (sans dupliquer les gros base64 dans chaque clé secondaire)
      try {
        const lightDocs = cleanDocs.map((d) => {
          const copy = { ...d };
          if (typeof copy.fileData === 'string' && copy.fileData.length > 150000) {
            delete copy.fileData;
          }
          if (typeof copy.fileUrl === 'string' && copy.fileUrl.startsWith('data:') && copy.fileUrl.length > 150000) {
            copy.fileUrl = `#idb-doc-${copy.id}`;
          }
          if (typeof copy.url === 'string' && copy.url.startsWith('data:') && copy.url.length > 150000) {
            copy.url = `#idb-doc-${copy.id}`;
          }
          return copy;
        });
        localStorage.setItem(key, JSON.stringify(lightDocs));
      } catch {
        // ignore
      }
    }
  }

  // Synchroniser également azed_mock_db_store.documents pour que le fallback API renvoie toujours la même liste
  try {
    const mockRaw = localStorage.getItem('azed_mock_db_store');
    if (mockRaw) {
      const mockParsed = JSON.parse(mockRaw);
      if (mockParsed && typeof mockParsed === 'object') {
        mockParsed.documents = cleanDocs.map((d) => {
          const copy = { ...d };
          if (typeof copy.fileData === 'string' && copy.fileData.length > 150000) {
            delete copy.fileData;
          }
          return copy;
        });
        localStorage.setItem('azed_mock_db_store', JSON.stringify(mockParsed));
      }
    }
  } catch {
    // ignore
  }

  return cleanDocs;
};

/**
 * Ajoute ou met à jour un document dans le store global unifié et notifie toutes les vues
 */
export const saveGlobalDocument = (newDoc: any): any[] => {
  if (!newDoc || typeof newDoc !== 'object') return getGlobalDocuments();
  const docId = String(newDoc.id || `doc_${Date.now()}`);
  removeDeletedId(docId);

  const docs = getGlobalDocuments();
  const enrichedDoc = {
    ...newDoc,
    id: docId,
    createdAt: newDoc.createdAt || newDoc.date || new Date().toISOString(),
    status: newDoc.status || 'Actif',
  };

  const existingIndex = docs.findIndex((d: any) => String(d.id) === docId);
  let updatedDocs: any[];
  if (existingIndex >= 0) {
    updatedDocs = [...docs];
    updatedDocs[existingIndex] = { ...updatedDocs[existingIndex], ...enrichedDoc };
  } else {
    updatedDocs = [enrichedDoc, ...docs];
  }

  persistGlobalDocumentsList(updatedDocs);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('zed-documents-updated'));
    window.dispatchEvent(new CustomEvent('documents-updated', { detail: updatedDocs }));
  }

  return updatedDocs;
};

/**
 * Supprime définitivement un document du store global unifié et notifie toutes les vues
 */
export const deleteGlobalDocument = (id: string | number): any[] => {
  const targetId = String(id);
  addDeletedId(targetId);

  const currentDocs = getGlobalDocuments();
  const docs = currentDocs.filter((d: any) => String(d.id) !== targetId);
  persistGlobalDocumentsList(docs);

  if (typeof window !== 'undefined') {
    window.dispatchEvent(new Event('zed-documents-updated'));
    window.dispatchEvent(new CustomEvent('documents-updated', { detail: docs }));
  }

  return docs;
};

/**
 * Récupère la liste des chapitres personnalisés créés par l'administrateur
 */
export const getGlobalCustomChapters = (): string[] => {
  if (typeof window === 'undefined') return [];
  const chapters = new Set<string>();
  try {
    const raw = localStorage.getItem(CUSTOM_CHAPTERS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        parsed.forEach((c) => {
          if (typeof c === 'string' && c.trim()) chapters.add(c.trim());
        });
      }
    }
  } catch {
    // ignore
  }

  // Extraire aussi les chapitres présents sur les documents du store global
  try {
    const docs = getGlobalDocuments();
    docs.forEach((d: any) => {
      const ch = d?.chapter || d?.chapitre || d?.module;
      if (typeof ch === 'string' && ch.trim()) {
        chapters.add(ch.trim());
      }
    });
  } catch {
    // ignore
  }

  return Array.from(chapters);
};

/**
 * Enregistre un nouveau chapitre personnalisé dans le store global
 */
export const saveGlobalCustomChapter = (chapterName: string): string[] => {
  if (typeof window === 'undefined' || !chapterName || !chapterName.trim()) {
    return getGlobalCustomChapters();
  }
  const clean = chapterName.trim();
  const current = getGlobalCustomChapters();
  if (!current.some((c) => c.toLowerCase() === clean.toLowerCase())) {
    current.push(clean);
  }
  try {
    localStorage.setItem(CUSTOM_CHAPTERS_KEY, JSON.stringify(current));
    window.dispatchEvent(new Event('zed-documents-updated'));
  } catch {
    // ignore
  }
  return current;
};
