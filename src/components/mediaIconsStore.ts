export interface IconMediaItem {
  id: string;
  name: string;
  category: string;
  period: string;
  url: string;
  shape: 'rounded-xl' | 'rounded-full' | 'rounded-none' | 'rounded-lg';
  size: number;
  visible: boolean;
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

// Initialisation asynchrone pour recharger les médias riches stockés dans IndexedDB
if (typeof window !== 'undefined') {
  loadMediaItemsFromIDB().then((idbItems) => {
    if (idbItems && idbItems.length > 0) {
      inMemoryItemsCache = idbItems;
      window.dispatchEvent(new CustomEvent('media-icons-updated', { detail: idbItems }));
      window.dispatchEvent(new Event('azed_assets_updated'));
    }
  }).catch(() => {});
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
  },
];

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

export function saveStoredMediaItems(items: IconMediaItem[]) {
  // 1. Toujours mettre à jour le cache mémoire immédiatement
  inMemoryItemsCache = [...items];

  // 2. Sauvegarde asynchrone dans IndexedDB (idéal pour les gros GIF / images sans limite de quota)
  saveMediaItemsToIDB(items).catch(() => {});

  // 3. Sauvegarde sécurisée dans localStorage avec gestion stricte des dépassements de quota
  if (typeof localStorage !== 'undefined') {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (quotaErr) {
      console.warn('localStorage quota atteint pour la liste complète. Sauvegarde d\'une version allégée...');
      try {
        // En cas de dépassement de quota, on allège la version localStorage (sans écraser la mémoire ou IndexedDB)
        const lightweightItems = items.map((item) => {
          if (item.url && item.url.startsWith('data:') && item.url.length > 100000) {
            // Remplacer les data-url géants par le fallback par défaut dans le localStorage
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
        // Ignorer silencieusement si même la version allégée ne rentre pas
      }
    }

    // Sauvegarde de la liste multi-images pour le menu réduit (Dynamic Image Cycling)
    try {
      const collapsedList = items
        .filter((i) => i.visible && (i.category.includes('Réduit') || i.category.includes('Collapsed') || i.name.toLowerCase().includes('réduit')) && i.url)
        .map((i) => i.url);
      if (collapsedList.length > 0) {
        localStorage.setItem('azed_collapsed_images_list', JSON.stringify(collapsedList));
      }
    } catch {
      // Ignorer l'erreur de quota
    }

    // Sauvegarde sécurisée des clés individuelles de rétro-compatibilité
    try {
      const collapsed = items.find(
        (i) => i.visible && (i.category.includes('Réduit') || i.category.includes('Collapsed') || i.name.toLowerCase().includes('réduit'))
      );
      if (collapsed && collapsed.url) {
        // Ne stocker dans localStorage que si ce n'est pas un payload base64 gigantesque
        if (!collapsed.url.startsWith('data:') || collapsed.url.length < 300000) {
          localStorage.setItem('azed_collapsed_img', collapsed.url);
        }
      }
    } catch {
      // Ignorer l'erreur de quota pour la clé secondaire
    }

    try {
      const banner = items.find(
        (i) => i.visible && (i.category.includes('Bannière') || i.name.toLowerCase().includes('bannière'))
      );
      if (banner && banner.url) {
        if (!banner.url.startsWith('data:') || banner.url.length < 300000) {
          localStorage.setItem('azed_banner_img', banner.url);
        }
      }
    } catch {
      // Ignorer l'erreur de quota pour la clé secondaire
    }
  }

  // 4. Diffusion des événements en direct vers tous les composants
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent('media-icons-updated', { detail: items }));
    window.dispatchEvent(new Event('azed_assets_updated'));
    window.dispatchEvent(new Event('azed_config_updated'));
    window.dispatchEvent(new Event('storage'));
  }
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
  
  // Fallback to localStorage string if present
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
 * Récupère l'ensemble des URLs d'images/GIF actives pour le menu latéral réduit
 */
export function getCollapsedSidebarImagesList(items?: IconMediaItem[]): string[] {
  const list = items || getStoredMediaItems();
  const filtered = list
    .filter((i) => i.visible && (i.category.includes('Réduit') || i.category.includes('Collapsed') || i.name.toLowerCase().includes('réduit')) && i.url)
    .map((i) => i.url);

  if (filtered.length > 0) {
    return filtered;
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

  // Défaut
  return [
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0ZWF4OHo4ZjlsM3RocmEzOHc5MGVwYTY3N2xsMnRpdHJ2bThydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/kL1yMSpA0b2S33K16C/giphy.gif',
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExZDJ5MnY2ZzF5cnF6c2RseXJ2M3Z5Y2c1ZWV3b2psOWJzNGVveSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/26ufdipQqU2lhNA4g/giphy.gif'
  ];
}

/**
 * Tire une image aléatoire parmi toutes les images de menu réduit configurées
 */
export function getRandomCollapsedSidebarImage(items?: IconMediaItem[]): string {
  const images = getCollapsedSidebarImagesList(items);
  if (images.length === 0) {
    return 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif';
  }
  const randomIndex = Math.floor(Math.random() * images.length);
  return images[randomIndex];
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
