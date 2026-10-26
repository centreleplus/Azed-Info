import React, { useRef, useState, useEffect } from 'react';

export interface ChaptersTabsBarProps {
  availableChapters: string[];
  activeChapter: string;
  handleTabChange: (chapter: string) => void;
  itemsList?: any[];
  getChapterCount?: (chapter: string) => number;
}

const EMPTY_ITEMS_LIST: any[] = [];

export const ChaptersTabsBar: React.FC<ChaptersTabsBarProps> = ({
  availableChapters,
  activeChapter,
  handleTabChange,
  itemsList = EMPTY_ITEMS_LIST,
  getChapterCount,
}) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showScrollHint, setShowScrollHint] = useState<boolean>(true);

  // Fonction pour faire défiler automatiquement d'un cran vers la droite au clic sur la flèche rouge
  const scrollRight = () => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollBy({ left: 240, behavior: 'smooth' });
    }
  };

  const checkScrollState = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, clientWidth, scrollWidth } = scrollContainerRef.current;
      // Masquer la flèche si on arrive tout à fait à droite ou si le contenu ne dépasse pas
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth - 10;
      const isScrollable = scrollWidth > clientWidth + 5;
      const nextHint = isScrollable && !isAtEnd;
      setShowScrollHint(prev => (prev === nextHint ? prev : nextHint));
    }
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget;
    const isAtEnd = target.scrollLeft + target.clientWidth >= target.scrollWidth - 10;
    const isScrollable = target.scrollWidth > target.clientWidth + 5;
    const nextHint = isScrollable && !isAtEnd;
    setShowScrollHint(prev => (prev === nextHint ? prev : nextHint));
  };

  const chaptersWithCounts = React.useMemo(() => {
    const seen = new Set<string>();
    return availableChapters
      .filter((chapter) => {
        const norm = String(chapter || '')
          .trim()
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '');
        if (!norm || norm === 'fichiers' || norm === 'fichier') {
          return false;
        }
        const key =
          norm === 'all' || norm === 'tous' || norm === 'tous les chapitres'
            ? 'ALL'
            : norm;
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      })
      .map((chapter) => {
        const norm = String(chapter || '').trim().toLowerCase();
        const isAll = norm === 'all' || norm === 'tous' || norm === 'tous les chapitres';
        const normalizedChapter = isAll ? 'ALL' : chapter;
        let count = 0;
        if (getChapterCount) {
          count = getChapterCount(normalizedChapter);
        } else {
          count = isAll
            ? itemsList.length
            : itemsList.filter((item: any) => {
                const ch = item.chapter || item.subject || item.module || item.chapterTitle || 'Général';
                return String(ch).trim() === normalizedChapter;
              }).length;
        }
        return { chapter: normalizedChapter, count };
      })
      .filter((entry) => entry.count > 0);
  }, [availableChapters, getChapterCount, itemsList]);

  useEffect(() => {
    const isAllActive = activeChapter === 'ALL' || activeChapter === 'all' || activeChapter === 'Tous';
    if (!isAllActive && chaptersWithCounts.length > 0) {
      const activeStillVisible = chaptersWithCounts.some((entry) => entry.chapter === activeChapter);
      if (!activeStillVisible) {
        const fallbackTab = chaptersWithCounts.find(
          (entry) => entry.chapter === 'ALL' || entry.chapter === 'all' || entry.chapter === 'Tous'
        );
        handleTabChange(fallbackTab ? fallbackTab.chapter : chaptersWithCounts[0].chapter);
      }
    }
  }, [activeChapter, chaptersWithCounts, handleTabChange]);

  useEffect(() => {
    checkScrollState();
    const observer = new ResizeObserver(() => {
      requestAnimationFrame(checkScrollState);
    });
    if (scrollContainerRef.current) {
      observer.observe(scrollContainerRef.current);
    }
    
    // Petit délai pour mesurer le DOM après rendu
    const timer = setTimeout(checkScrollState, 150);
    return () => {
      observer.disconnect();
      clearTimeout(timer);
    };
  }, [chaptersWithCounts.length, itemsList.length]);

  if (chaptersWithCounts.length === 0) {
    return null;
  }

  return (
    <div className="relative flex items-center mb-6 border-b border-gray-100">
      {/* Conteneur défilant des onglets */}
      <div
        ref={scrollContainerRef}
        onScroll={handleScroll}
        className="flex items-center gap-2 overflow-x-auto py-2 pr-12 scrollbar-none w-full scroll-smooth text-left"
      >
        {chaptersWithCounts.map(({ chapter, count }) => {
          const isActive =
            activeChapter === chapter ||
            (activeChapter === 'ALL' && (chapter === 'ALL' || chapter === 'Tous')) ||
            (activeChapter === 'all' && (chapter === 'ALL' || chapter === 'all'));

          return (
            <button
              key={chapter}
              onClick={() => handleTabChange(chapter)}
              className={`px-4 py-2 text-sm font-semibold rounded-xl whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer shrink-0 ${
                isActive
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <span>{chapter === 'ALL' || chapter === 'all' ? 'Tous les chapitres' : chapter}</span>
              <span
                className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                  isActive ? 'bg-emerald-700 text-white' : 'bg-gray-200 text-gray-700'
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Bouton Indicateur Rouge de Défilement (>> ou >) */}
      {showScrollHint && (
        <button
          onClick={scrollRight}
          type="button"
          title="Faire défiler pour voir plus d'onglets"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-9 h-9 bg-red-600 hover:bg-red-700 text-white font-black text-lg rounded-full flex items-center justify-center shadow-lg transition-transform active:scale-95 cursor-pointer animate-pulse"
        >
          ➔
        </button>
      )}
    </div>
  );
};

export default ChaptersTabsBar;
