export interface IconMediaItem {
  id: string;
  name: string;
  category: string;
  period: string;
  url: string;
  shape: 'rounded-xl' | 'rounded-full' | 'rounded-none' | 'rounded-lg';
  size: number;
  visible: boolean;
  updatedAt?: string | number;
}

export type MediaItem = IconMediaItem;

// 1. Liste des catégories principales avec emojis et intitulés exacts
export const CATEGORY_OPTIONS = [
  { id: 'banner_accueil', label: '🖼️ Bannière GIF Accueil' },
  { id: 'sidebar_collapsed', label: '🔲 Image Menu Réduit (Sidebar Collapsed)' },
  { id: 'fiches_cours', label: '📚 Fiches & cours' },
  { id: 'devoirs_exercices', label: '📝 Devoirs & Exercices' },
  { id: 'zone_correction', label: '✅ Zone Correction' },
  { id: 'revision_live', label: '🎯 Révision' },
  { id: 'quiz_interactifs', label: '⚡ Quiz Interactifs' },
  { id: 'badge_promo', label: '🏆 Badge Promotionnel' },
];

// 2. Mapping dynamique exact entre Catégorie -> Sous-menus disponibles
export const SUBMENU_MAPPING: Record<string, string[]> = {
  '🖼️ Bannière GIF Accueil': ['Global / Accueil', 'En-tête Dashboard', 'En-tête Section'],
  '🔲 Image Menu Réduit (Sidebar Collapsed)': ['Vertical Sidebar', 'Global / Accueil', 'Publicité & Promo'],
  '📚 Fiches & cours': ['Menu Principal', '1er Trimestre', '2ème Trimestre', '3ème Trimestre'],
  '📝 Devoirs & Exercices': ['Menu Principal', '1er Trimestre', '2ème Trimestre', '3ème Trimestre', 'Énoncé live'],
  '✅ Zone Correction': ['Menu Principal', '1er Trimestre', '2ème Trimestre', '3ème Trimestre', 'Live Enregistré'],
  '🎯 Révision': ['Menu Principal', 'Énoncé', 'Correction'],
  '🎯 Révision (Live Énoncé / Replay)': ['Menu Principal', 'Énoncé', 'Correction'],
  '⚡ Quiz Interactifs': ['Menu Principal', '1er Trimestre', '2ème Trimestre', '3ème Trimestre'],
  '🏆 Badge Promotionnel': ['Global / Accueil', 'Badges Spéciaux'],
};

const STORAGE_KEY = 'azed_media_icons_data_v3';

// In-memory cache for ultra-fast and quota-safe sync across components
let inMemoryItemsCache: IconMediaItem[] = [];

/**
 * Cache-Busting Utility:
 * Adds a version/timestamp parameter to image URLs to force browsers and PWAs
 * to download updated assets instead of relying on stale cache.
 */
export function applyCacheBusting(url: string, updatedAt?: string | number): string {
  if (!url) return '';
  // Data URLs, Blobs and SVGs inline should not have query parameters appended
  if (url.startsWith('data:') || url.startsWith('blob:') || url.startsWith('javascript:')) {
    return url;
  }
  const v = updatedAt || Date.now();
  const separator = url.includes('?') ? '&' : '?';
  return `${url}${separator}v=${v}`;
}

// ============================================================================
// INDEXEDDB ENGINE POUR STOCKAGE DE GROSSES IMAGES & GIFS (PAS DE LIMITE 5MB)
// ============================================================================
const IDB_NAME = 'azed_media_store_db';
const IDB_STORE = 'media_items_store';
const IDB_KEY = 'current_media_items';

function openMediaDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      return reject(new Error('IndexedDB non disponible'));
    }
    const request = window.indexedDB.open(IDB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(IDB_STORE)) {
        db.createObjectStore(IDB_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function saveMediaItemsToIDB(items: IconMediaItem[]): Promise<void> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readwrite');
      const store = tx.objectStore(IDB_STORE);
      const req = store.put(items, IDB_KEY);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch (err) {
    console.warn('Sauvegarde IndexedDB non critique:', err);
  }
}

export async function loadMediaItemsFromIDB(): Promise<IconMediaItem[] | null> {
  try {
    const db = await openMediaDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(IDB_STORE, 'readonly');
      const store = tx.objectStore(IDB_STORE);
      const req = store.get(IDB_KEY);
      req.onsuccess = () => {
        const val = req.result;
        if (Array.isArray(val) && val.length > 0) {
          resolve(val);
        } else {
          resolve(null);
        }
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export const DEFAULT_MEDIA_ITEMS: IconMediaItem[] = [
  {
    id: 'banner_1',
    name: 'Bannière GIF Accueil',
    category: '🖼️ Bannière GIF Accueil',
    period: 'Global / Accueil',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0ZWF4OHo4ZjlsM3RocmEzOHc5MGVwYTY3N2xsMnRpdHJ2bThydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/kL1yMSpA0b2S33K16C/giphy.gif',
    shape: 'rounded-xl',
    size: 110,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'sidebar_col_1',
    name: 'Image Menu Réduit #1 (Sciences & Espace)',
    category: '🔲 Image Menu Réduit (Sidebar Collapsed)',
    period: 'Vertical Sidebar',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif',
    shape: 'rounded-xl',
    size: 80,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'sidebar_col_2',
    name: 'Image Menu Réduit #2 (Animation A-Zed)',
    category: '🔲 Image Menu Réduit (Sidebar Collapsed)',
    period: 'Vertical Sidebar',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0ZWF4OHo4ZjlsM3RocmEzOHc5MGVwYTY3N2xsMnRpdHJ2bThydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/kL1yMSpA0b2S33K16C/giphy.gif',
    shape: 'rounded-xl',
    size: 80,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'sidebar_col_3',
    name: 'Image Menu Réduit #3 (Réflexion & Focus)',
    category: '🔲 Image Menu Réduit (Sidebar Collapsed)',
    period: 'Vertical Sidebar',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDJ5MnY2ZzF5cnF6c2RseXJ2M3Z5Y2c1ZWV3b2psOWJzNGVveSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif',
    shape: 'rounded-xl',
    size: 80,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'sidebar_col_4',
    name: 'Image Menu Réduit #4 (Technologie & Futur)',
    category: '🔲 Image Menu Réduit (Sidebar Collapsed)',
    period: 'Vertical Sidebar',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExaWVmYm45bmthbmV4eGFiYXo3ZXZqam9rNXJ3ZXNidWtxM28zNzAybSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l3vR1U3pD8W34w132/giphy.gif',
    shape: 'rounded-xl',
    size: 80,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'sidebar_col_5',
    name: 'Image Menu Réduit #5 (Créativité & Innovation)',
    category: '🔲 Image Menu Réduit (Sidebar Collapsed)',
    period: 'Vertical Sidebar',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExMzRkbnB3dHNrbnNtbDR5MWh5Znd2cGpmaWF4cHFxOHg1d25xbGN5ZiZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/l0HlHFRbmaZtBRhXG/giphy.gif',
    shape: 'rounded-xl',
    size: 80,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'fiches_1',
    name: 'Icône Fiches & cours',
    category: '📚 Fiches & cours',
    period: 'Menu Principal',
    url: 'https://cdn-icons-png.flaticon.com/512/3389/3389081.png',
    shape: 'rounded-lg',
    size: 24,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'devoirs_1',
    name: 'Icône Devoirs & Exercices',
    category: '📝 Devoirs & Exercices',
    period: 'Menu Principal',
    url: 'https://cdn-icons-png.flaticon.com/512/2997/2997295.png',
    shape: 'rounded-lg',
    size: 24,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'correction_1',
    name: 'Icône Zone Correction',
    category: '✅ Zone Correction',
    period: 'Menu Principal',
    url: 'https://cdn-icons-png.flaticon.com/512/7518/7518748.png',
    shape: 'rounded-lg',
    size: 24,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'revision_1',
    name: 'Icône Révision',
    category: '🎯 Révision',
    period: 'Menu Principal',
    url: 'https://cdn-icons-png.flaticon.com/512/3081/3081559.png',
    shape: 'rounded-lg',
    size: 24,
    visible: true,
    updatedAt: 1718000000000,
  },
  {
    id: 'quiz_1',
    name: 'Icône Quiz Interactifs',
    category: '⚡ Quiz Interactifs',
    period: 'Menu Principal',
    url: 'https://cdn-icons-png.flaticon.com/512/3081/3081415.png',
    shape: 'rounded-lg',
    size: 24,
    visible: true,
    updatedAt: 1718000000000,
  },
];

/**
 * Purge PWA Service Worker Cache upon ACTUALISER_ELEVE event
 */
export async function purgePwaCache(): Promise<void> {
  if (typeof window !== 'undefined' && 'caches' in window) {
    try {
      const cacheNames = await caches.keys();
      await Promise.all(cacheNames.map((name) => caches.delete(name)));
    } catch (err) {
      console.warn('Purge du cache Service Worker ignorée:', err);
    }
  }
}

/**
 * Fetch media items directly from backend database API
 */
export async function fetchMediaItemsFromBackend(): Promise<IconMediaItem[]> {
  try {
    const res = await fetch(`/api/media-icons?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        inMemoryItemsCache = data;
        saveMediaItemsToIDB(data).catch(() => {});
        saveStoredMediaItemsLocally(data, false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('media-icons-updated', { detail: data }));
          window.dispatchEvent(new Event('azed_assets_updated'));
        }
        return data;
      }
    }
  } catch (err) {
    console.warn('Erreur lors de la récupération API des médias:', err);
  }
  return getStoredMediaItems();
}

/**
 * Fetch reduced menu visuals specifically from public endpoint
 */
export async function fetchReducedMenuVisualsFromBackend(): Promise<IconMediaItem[]> {
  try {
    const res = await fetch(`/api/media-icons/menu-reduced?t=${Date.now()}`, {
      headers: { 'Cache-Control': 'no-cache', Pragma: 'no-cache' }
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.success && Array.isArray(data.visuals) && data.visuals.length > 0) {
        return data.visuals;
      }
    }
  } catch (err) {
    console.warn('Erreur récupération /api/media-icons/menu-reduced:', err);
  }
  return getCollapsedSidebarVisuals();
}

/**
 * Save media items to backend database (VPS / Server-side persistence)
 */
export async function saveMediaItemsToBackend(items: IconMediaItem[]): Promise<boolean> {
  const timestamp = Date.now();
  const stampedItems = items.map((it) => ({
    ...it,
    updatedAt: it.updatedAt || timestamp,
  }));

  // Update local memory and local storage first
  saveStoredMediaItemsLocally(stampedItems, true);

  try {
    const res = await fetch('/api/admin/media-icons', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: stampedItems }),
    });

    if (res.ok) {
      const result = await res.json();
      if (result.items && Array.isArray(result.items)) {
        inMemoryItemsCache = result.items;
      }
      return true;
    }
  } catch (err) {
    console.error('Erreur de sauvegarde serveur /api/admin/media-icons:', err);
  }
  return false;
}

/**
 * Trigger "Actualiser Élève" to force immediate real-time sync & purge caches across all devices
 */
export async function triggerActualiserEleve(items?: IconMediaItem[]): Promise<boolean> {
  const targetItems = items || getStoredMediaItems();
  const timestamp = Date.now();
  const stampedItems = targetItems.map((it) => ({
    ...it,
    updatedAt: timestamp,
  }));

  saveStoredMediaItemsLocally(stampedItems, true);
  await purgePwaCache();

  try {
    const res = await fetch('/api/admin/media-icons/actualiser-eleve', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: stampedItems }),
    });

    if (res.ok) {
      return true;
    }
  } catch (err) {
    console.warn('Erreur synchronisation /api/admin/media-icons/actualiser-eleve:', err);
  }
  return false;
}

// Initialisation globale au chargement dans le navigateur
if (typeof window !== 'undefined') {
  // 1. Charger depuis IDB
  loadMediaItemsFromIDB().then((idbItems) => {
    if (idbItems && idbItems.length > 0) {
      inMemoryItemsCache = idbItems;
      window.dispatchEvent(new CustomEvent('media-icons-updated', { detail: idbItems }));
    }
  }).catch(() => {});

  // 2. Charger directement depuis l'API backend serveur
  fetchMediaItemsFromBackend().catch(() => {});

  // 3. Écouteur global pour l'invalidation de cache et événements temps réel
  window.addEventListener('ACTUALISER_ELEVE', () => {
    purgePwaCache().then(() => {
      fetchMediaItemsFromBackend();
    });
  });

  window.addEventListener('realtime-event', (e: any) => {
    if (e.detail?.type === 'ACTUALISER_ELEVE' || e.detail?.type === 'MEDIA_ICONS_UPDATED') {
      purgePwaCache().then(() => {
        if (Array.isArray(e.detail.items)) {
          inMemoryItemsCache = e.detail.items;
          saveMediaItemsToIDB(e.detail.items).catch(() => {});
          saveStoredMediaItemsLocally(e.detail.items, false);
          window.dispatchEvent(new CustomEvent('media-icons-updated', { detail: e.detail.items }));
          window.dispatchEvent(new Event('azed_assets_updated'));
        } else {
          fetchMediaItemsFromBackend();
        }
      });
    }
  });
}

export function getStoredMediaItems(): IconMediaItem[] {
  // 1. Priorité au cache mémoire actif
  if (inMemoryItemsCache && inMemoryItemsCache.length > 0) {
    return inMemoryItemsCache;
  }

  // 2. Lecture localStorage sécurisée
  try {
    const raw = typeof localStorage !== 'undefined' ? localStorage.getItem(STORAGE_KEY) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        inMemoryItemsCache = parsed;
        return parsed;
      }
    }
  } catch (err) {
    console.warn('Lecture localStorage media items:', err);
  }

  inMemoryItemsCache = DEFAULT_MEDIA_ITEMS;
  return DEFAULT_MEDIA_ITEMS;
}

function saveStoredMediaItemsLocally(items: IconMediaItem[], notify: boolean = true) {
  // 1. Mettre à jour le cache mémoire immédiatement
  inMemoryItemsCache = [...items];

  // 2. Sauvegarde asynchrone dans IndexedDB
  saveMediaItemsToIDB(items).catch(() => {});

  // 3. Sauvegarde sécurisée dans localStorage
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (quotaErr) {
      console.warn('localStorage quota atteint pour la liste complète. Version allégée...');
      try {
        const lightweightItems = items.map((item) => {
          if (item.url && item.url.startsWith('data:') && item.url.length > 100000) {
            const defaultItem = DEFAULT_MEDIA_ITEMS.find((d) => d.category === item.category);
            return {
              ...item,
              url: defaultItem ? defaultItem.url : item.url.slice(0, 1000) + '...',
            };
          }
          return item;
        });
        localStorage.setItem(STORAGE_KEY, JSON.stringify(lightweightItems));
      } catch {
        // Ignorer
      }
    }

    // Sauvegarde de la liste multi-images pour le menu réduit avec cache-busting
    try {
      const collapsedList = items
        .filter((i) => i.visible && (i.category.includes('Réduit') || i.category.includes('Collapsed') || i.name.toLowerCase().includes('réduit')) && i.url)
        .map((i) => applyCacheBusting(i.url, i.updatedAt));
      if (collapsedList.length > 0) {
        localStorage.setItem('azed_collapsed_images_list', JSON.stringify(collapsedList));
      }
    } catch {
      // Ignorer l'erreur de quota
    }

    try {
      const collapsed = items.find(
        (i) => i.visible && (i.category.includes('Réduit') || i.category.includes('Collapsed') || i.name.toLowerCase().includes('réduit'))
      );
      if (collapsed && collapsed.url) {
        const urlBust = applyCacheBusting(collapsed.url, collapsed.updatedAt);
        if (!collapsed.url.startsWith('data:') || collapsed.url.length < 300000) {
          localStorage.setItem('azed_collapsed_img', urlBust);
        }
      }
    } catch {
      // Ignorer
    }
  }

  if (notify && typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('media-icons-updated', { detail: items }));
    window.dispatchEvent(new Event('azed_assets_updated'));
    window.dispatchEvent(new Event('azed_config_updated'));
    window.dispatchEvent(new Event('storage'));
  }
}

export function saveStoredMediaItems(items: IconMediaItem[]) {
  saveStoredMediaItemsLocally(items, true);
  // Persistance asynchrone côté backend
  saveMediaItemsToBackend(items).catch(() => {});
}

// Helpers for quick lookup by category key
export function getBannerMediaItem(items?: IconMediaItem[]): IconMediaItem | undefined {
  const list = items || getStoredMediaItems();
  return list.find((i) => i.visible && (i.category.includes('Bannière') || i.name.toLowerCase().includes('bannière')));
}

export function getCollapsedSidebarMediaItem(items?: IconMediaItem[]): IconMediaItem | undefined {
  const list = items || getStoredMediaItems();
  const found = list.find((i) => i.visible && (i.category.includes('Réduit') || i.category.includes('Collapsed') || i.name.toLowerCase().includes('réduit')));
  if (found) return found;
  
  const local = typeof localStorage !== 'undefined' ? localStorage.getItem('azed_collapsed_img') : null;
  if (local) {
    return {
      id: 'local_collapsed',
      name: 'Image Menu Réduit',
      category: '🔲 Image Menu Réduit (Sidebar Collapsed)',
      period: 'Vertical Sidebar',
      url: local,
      shape: 'rounded-xl',
      size: 80,
      visible: true
    };
  }
  return undefined;
}

/**
 * Filtre strictement les visuels appartenant à la catégorie "Menu Réduit"
 */
export function getCollapsedSidebarVisuals(items?: IconMediaItem[]): IconMediaItem[] {
  const list = items || getStoredMediaItems();
  return list.filter(
    (i) =>
      i.visible &&
      !!i.url &&
      (i.category === '🔲 Image Menu Réduit (Sidebar Collapsed)' ||
        i.category.toLowerCase().includes('réduit') ||
        i.category.toLowerCase().includes('reduced') ||
        i.category.toLowerCase().includes('collapsed') ||
        i.name.toLowerCase().includes('réduit'))
  );
}

/**
 * Algorithme de tirage aléatoire sans répétition consécutive
 */
export const getRandomNextIndex = (currentIndex: number, totalLength: number): number => {
  if (totalLength <= 1) return 0;
  let nextIndex: number;
  do {
    nextIndex = Math.floor(Math.random() * totalLength);
  } while (nextIndex === currentIndex);
  return nextIndex;
};

/**
 * Récupère l'ensemble des URLs d'images/GIF actives pour le menu latéral réduit avec cache-busting
 */
export function getCollapsedSidebarImagesList(items?: IconMediaItem[]): string[] {
  const visuals = getCollapsedSidebarVisuals(items);
  if (visuals.length > 0) {
    return visuals.map((v) => applyCacheBusting(v.url, v.updatedAt));
  }

  // Fallback depuis le localStorage azed_collapsed_images_list
  if (typeof localStorage !== 'undefined') {
    try {
      const storedRaw = localStorage.getItem('azed_collapsed_images_list');
      if (storedRaw) {
        const parsed = JSON.parse(storedRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          return parsed;
        }
      }
      const single = localStorage.getItem('azed_collapsed_img');
      if (single) return [single];
    } catch {
      // ignore
    }
  }

  // Liste par défaut (5 visuels configurés)
  return DEFAULT_MEDIA_ITEMS
    .filter((i) => i.category.includes('Réduit') || i.category.includes('Collapsed'))
    .map((i) => applyCacheBusting(i.url, i.updatedAt));
}

/**
 * Tire la prochaine image aléatoire en évitant les répétitions consécutives
 */
export function getNextCollapsedSidebarImage(
  currentIndexOrUrl: number | string = -1,
  items?: IconMediaItem[]
): { url: string; index: number; visual?: IconMediaItem } {
  const visuals = getCollapsedSidebarVisuals(items);
  let imageList: string[] = [];

  if (visuals.length > 0) {
    imageList = visuals.map((v) => applyCacheBusting(v.url, v.updatedAt));
  } else {
    imageList = getCollapsedSidebarImagesList(items);
  }

  if (imageList.length === 0) {
    const fallback = 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif';
    return { url: fallback, index: 0 };
  }

  if (imageList.length === 1) {
    return { url: imageList[0], index: 0, visual: visuals[0] };
  }

  let currIdx = -1;
  if (typeof currentIndexOrUrl === 'number') {
    currIdx = currentIndexOrUrl;
  } else if (typeof currentIndexOrUrl === 'string' && currentIndexOrUrl) {
    currIdx = imageList.indexOf(currentIndexOrUrl);
  }

  const nextIdx = getRandomNextIndex(currIdx, imageList.length);
  return {
    url: imageList[nextIdx],
    index: nextIdx,
    visual: visuals[nextIdx],
  };
}

/**
 * Tire une image aléatoire sans répétition consécutive par rapport au dernier visuel affiché
 */
export function getRandomCollapsedSidebarImage(items?: IconMediaItem[], previousUrlOrIndex?: string | number): string {
  const { url } = getNextCollapsedSidebarImage(previousUrlOrIndex ?? -1, items);
  return url;
}

/**
 * Précharge les images du menu réduit dans le cache du navigateur pour une transition fluide
 */
export function preloadCollapsedSidebarImages(items?: IconMediaItem[]) {
  if (typeof window === 'undefined') return;
  const urls = getCollapsedSidebarImagesList(items);
  urls.forEach((src) => {
    if (src && !src.startsWith('data:')) {
      const img = new Image();
      img.src = src;
    }
  });
}

export function getMenuIconMediaItem(target: 'fiches' | 'devoirs' | 'corrections' | 'revision' | 'quiz' | 'cours' | 'calendrier', items?: IconMediaItem[]): IconMediaItem | undefined {
  const list = items || getStoredMediaItems();
  
  switch (target) {
    case 'fiches':
    case 'cours':
      return list.find((i) => i.visible && (i.category.includes('Fiches') || i.category.includes('cours')));
    case 'devoirs':
      return list.find((i) => i.visible && (i.category.includes('Devoirs') || i.category.includes('Exercices')));
    case 'corrections':
      return list.find((i) => i.visible && (i.category.includes('Correction') || i.category.includes('Zone Correction')));
    case 'revision':
      return list.find((i) => i.visible && i.category.includes('Révision'));
    case 'quiz':
      return list.find((i) => i.visible && (i.category.includes('Quiz') || i.category.includes('qcm')));
    default:
      return undefined;
  }
}
