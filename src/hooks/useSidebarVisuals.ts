import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  IconMediaItem,
  getStoredMediaItems,
  getCollapsedSidebarVisuals,
  getNextCollapsedSidebarImage,
  preloadCollapsedSidebarImages,
  fetchMediaItemsFromBackend,
  fetchReducedMenuVisualsFromBackend,
  applyCacheBusting,
  purgePwaCache,
  getMenuIconMediaItem,
  getBannerMediaItem
} from '../components/mediaIconsStore';

export interface UseSidebarVisualsResult {
  mediaItems: IconMediaItem[];
  collapsedVisuals: IconMediaItem[];
  currentCollapsedImage: string;
  activeVisualIndex: number;
  isCollapsed: boolean;
  setIsCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
  toggleCollapse: () => void;
  rotateVisual: () => void;
  refreshVisuals: () => Promise<void>;
  getMenuIcon: (target: 'fiches' | 'devoirs' | 'corrections' | 'revision' | 'quiz' | 'cours' | 'calendrier') => IconMediaItem | undefined;
  getBanner: () => IconMediaItem | undefined;
  isLoading: boolean;
}

export function useSidebarVisuals(initialCollapsed: boolean = false): UseSidebarVisualsResult {
  const [isCollapsed, setIsCollapsed] = useState(initialCollapsed);
  const [mediaItems, setMediaItems] = useState<IconMediaItem[]>(() => getStoredMediaItems());
  const [activeVisualIndex, setActiveVisualIndex] = useState<number>(-1);
  const [currentCollapsedImage, setCurrentCollapsedImage] = useState<string>(() => {
    const { url } = getNextCollapsedSidebarImage(-1);
    return url;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const isMountedRef = useRef(true);

  // Synchronise state with fresh backend items
  const updateLocalStateWithItems = useCallback((items: IconMediaItem[]) => {
    if (!items || !items.length) return;
    setMediaItems(items);
    preloadCollapsedSidebarImages(items);

    // If currently displaying an image, ensure cache-busted or rotated
    const collapsedList = items.filter(
      (i) =>
        i.visible &&
        i.url &&
        (i.category.includes('Réduit') || i.category.includes('Collapsed') || i.name.toLowerCase().includes('réduit'))
    );

    if (collapsedList.length > 0) {
      const match = collapsedList[activeVisualIndex >= 0 && activeVisualIndex < collapsedList.length ? activeVisualIndex : 0];
      if (match) {
        setCurrentCollapsedImage(applyCacheBusting(match.url, match.updatedAt));
      }
    }
  }, [activeVisualIndex]);

  // Refresh directly from Express API
  const refreshVisuals = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await fetchMediaItemsFromBackend();
      if (isMountedRef.current && items && items.length > 0) {
        updateLocalStateWithItems(items);
      }
    } catch (err) {
      console.warn('Erreur refreshVisuals hook:', err);
    } finally {
      if (isMountedRef.current) setIsLoading(false);
    }
  }, [updateLocalStateWithItems]);

  // Random cycling of collapsed sidebar visual
  const rotateVisual = useCallback(() => {
    const { url, index } = getNextCollapsedSidebarImage(activeVisualIndex, mediaItems);
    setActiveVisualIndex(index);
    setCurrentCollapsedImage(url);

    if (typeof localStorage !== 'undefined') {
      localStorage.setItem('activeSidebarVisualIndex', String(index));
      localStorage.setItem('azed_collapsed_img', url);
    }
  }, [activeVisualIndex, mediaItems]);

  const toggleCollapse = useCallback(() => {
    rotateVisual();
    setIsCollapsed((prev) => !prev);
  }, [rotateVisual]);

  // Lifecycle listeners for initial loading & real-time sync
  useEffect(() => {
    isMountedRef.current = true;

    // 1. Initial fetch from API
    refreshVisuals();

    // 2. Event listeners for instant updates
    const handleMediaUpdated = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        updateLocalStateWithItems(e.detail);
      } else {
        refreshVisuals();
      }
    };

    const handleActualiserEleve = () => {
      purgePwaCache().then(() => {
        refreshVisuals();
      });
    };

    const handleRealtime = (e: any) => {
      const type = e.detail?.type;
      if (type === 'ACTUALISER_ELEVE' || type === 'MEDIA_ICONS_UPDATED') {
        purgePwaCache().then(() => {
          if (Array.isArray(e.detail?.items)) {
            updateLocalStateWithItems(e.detail.items);
          } else {
            refreshVisuals();
          }
        });
      }
    };

    window.addEventListener('media-icons-updated', handleMediaUpdated);
    window.addEventListener('ACTUALISER_ELEVE', handleActualiserEleve);
    window.addEventListener('realtime-event', handleRealtime);
    window.addEventListener('azed_assets_updated', refreshVisuals);
    window.addEventListener('storage', refreshVisuals);

    // Periodic check (every 30s) or on window focus to ensure multi-device sync
    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        refreshVisuals();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      isMountedRef.current = false;
      window.removeEventListener('media-icons-updated', handleMediaUpdated);
      window.removeEventListener('ACTUALISER_ELEVE', handleActualiserEleve);
      window.removeEventListener('realtime-event', handleRealtime);
      window.removeEventListener('azed_assets_updated', refreshVisuals);
      window.removeEventListener('storage', refreshVisuals);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [refreshVisuals, updateLocalStateWithItems]);

  const collapsedVisuals = getCollapsedSidebarVisuals(mediaItems);

  const getMenuIcon = useCallback(
    (target: 'fiches' | 'devoirs' | 'corrections' | 'revision' | 'quiz' | 'cours' | 'calendrier') => {
      return getMenuIconMediaItem(target, mediaItems);
    },
    [mediaItems]
  );

  const getBanner = useCallback(() => {
    return getBannerMediaItem(mediaItems);
  }, [mediaItems]);

  return {
    mediaItems,
    collapsedVisuals,
    currentCollapsedImage,
    activeVisualIndex,
    isCollapsed,
    setIsCollapsed,
    toggleCollapse,
    rotateVisual,
    refreshVisuals,
    getMenuIcon,
    getBanner,
    isLoading,
  };
}

export default useSidebarVisuals;
