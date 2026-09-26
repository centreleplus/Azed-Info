import React, { createContext, useContext, useEffect, useState, useCallback, ReactNode } from 'react';
import {
  IconMediaItem,
  getStoredMediaItems,
  getCollapsedSidebarVisuals,
  getNextCollapsedSidebarImage,
  fetchMediaItemsFromBackend,
  saveMediaItemsToBackend,
  triggerActualiserEleve,
  applyCacheBusting,
  purgePwaCache,
  getMenuIconMediaItem,
  getBannerMediaItem
} from '../components/mediaIconsStore';

interface VisualContextType {
  mediaItems: IconMediaItem[];
  collapsedVisuals: IconMediaItem[];
  currentCollapsedImage: string;
  activeVisualIndex: number;
  isLoading: boolean;
  rotateCollapsedImage: () => void;
  saveVisuals: (items: IconMediaItem[]) => Promise<boolean>;
  actualiserEleve: (items?: IconMediaItem[]) => Promise<boolean>;
  refreshVisuals: () => Promise<void>;
  getMenuIcon: (target: 'fiches' | 'devoirs' | 'corrections' | 'revision' | 'quiz' | 'cours' | 'calendrier') => IconMediaItem | undefined;
  getBanner: () => IconMediaItem | undefined;
}

const VisualContext = createContext<VisualContextType | undefined>(undefined);

export const VisualProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [mediaItems, setMediaItems] = useState<IconMediaItem[]>(() => getStoredMediaItems());
  const [activeVisualIndex, setActiveVisualIndex] = useState<number>(-1);
  const [currentCollapsedImage, setCurrentCollapsedImage] = useState<string>(() => {
    const { url } = getNextCollapsedSidebarImage(-1);
    return url;
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const refreshVisuals = useCallback(async () => {
    setIsLoading(true);
    try {
      const items = await fetchMediaItemsFromBackend();
      if (items && items.length > 0) {
        setMediaItems(items);
        const { url, index } = getNextCollapsedSidebarImage(-1, items);
        setCurrentCollapsedImage(url);
        setActiveVisualIndex(index);
      }
    } catch (err) {
      console.warn('Erreur refreshVisuals Context:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const rotateCollapsedImage = useCallback(() => {
    const { url, index } = getNextCollapsedSidebarImage(activeVisualIndex, mediaItems);
    setActiveVisualIndex(index);
    setCurrentCollapsedImage(url);
  }, [activeVisualIndex, mediaItems]);

  const saveVisuals = useCallback(async (items: IconMediaItem[]) => {
    setIsLoading(true);
    try {
      const success = await saveMediaItemsToBackend(items);
      if (success) {
        setMediaItems(items);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const actualiserEleve = useCallback(async (items?: IconMediaItem[]) => {
    setIsLoading(true);
    try {
      const success = await triggerActualiserEleve(items || mediaItems);
      if (success && items) {
        setMediaItems(items);
      }
      return success;
    } finally {
      setIsLoading(false);
    }
  }, [mediaItems]);

  useEffect(() => {
    refreshVisuals();

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        setMediaItems(e.detail);
      } else {
        refreshVisuals();
      }
    };

    const handleRealtime = (e: any) => {
      if (e.detail?.type === 'ACTUALISER_ELEVE' || e.detail?.type === 'MEDIA_ICONS_UPDATED') {
        purgePwaCache().then(() => {
          if (Array.isArray(e.detail?.items)) {
            setMediaItems(e.detail.items);
          } else {
            refreshVisuals();
          }
        });
      }
    };

    window.addEventListener('media-icons-updated', handleUpdate);
    window.addEventListener('realtime-event', handleRealtime);
    window.addEventListener('ACTUALISER_ELEVE', refreshVisuals);

    return () => {
      window.removeEventListener('media-icons-updated', handleUpdate);
      window.removeEventListener('realtime-event', handleRealtime);
      window.removeEventListener('ACTUALISER_ELEVE', refreshVisuals);
    };
  }, [refreshVisuals]);

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

  return (
    <VisualContext.Provider
      value={{
        mediaItems,
        collapsedVisuals,
        currentCollapsedImage,
        activeVisualIndex,
        isLoading,
        rotateCollapsedImage,
        saveVisuals,
        actualiserEleve,
        refreshVisuals,
        getMenuIcon,
        getBanner,
      }}
    >
      {children}
    </VisualContext.Provider>
  );
};

export function useVisualContext(): VisualContextType {
  const context = useContext(VisualContext);
  if (!context) {
    throw new Error('useVisualContext must be used within a VisualProvider');
  }
  return context;
}

export default VisualContext;
