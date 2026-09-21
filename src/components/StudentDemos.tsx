import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Clock, Sparkles, Search, BookOpen, 
  Video, Layers, RefreshCw, Film, 
  ChevronRight, X, Maximize2, GraduationCap, PlayCircle
} from 'lucide-react';
import { useRealtimeSync } from '../lib/useRealtimeSync';
import BackButton from './BackButton';

export interface DemoVideoItem {
  id: string;
  title: string;
  module?: string;
  category: string;
  level?: string;
  duration: string;
  description: string;
  videoUrl: string;
  youtubeId: string;
  thumbnailUrl?: string;
  isFeatured?: boolean;
  order?: number;
  tags: string[];
}

export const extractYoutubeId = (urlOrId: string): string => {
  if (!urlOrId) return 'dQw4w9WgXcQ';
  const trimmed = urlOrId.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.') && !trimmed.includes('?')) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : (trimmed.length === 11 ? trimmed : 'dQw4w9WgXcQ');
};

export const getEmbedVideoUrl = (urlOrId: string, autoplay = false): string => {
  if (!urlOrId) return `https://www.youtube.com/embed/dQw4w9WgXcQ?rel=0${autoplay ? '&autoplay=1' : ''}`;
  const ytId = extractYoutubeId(urlOrId);
  return `https://www.youtube.com/embed/${ytId}?rel=0${autoplay ? '&autoplay=1' : ''}`;
};

export const sampleDemos: DemoVideoItem[] = [
  {
    id: 'demo-1',
    title: 'Présentation de la Plateforme A-Zedinfo',
    youtubeId: 'dQw4w9WgXcQ',
    module: 'Présentation',
    category: 'Présentation',
    level: 'Toutes filières',
    duration: '05:20',
    description: 'Découvrez l\'ensemble des fonctionnalités interactives : cours vidéo, sandbox Python, QCM en temps réel et fiches résumées.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    isFeatured: true,
    order: 1,
    tags: ['Guide', 'Plateforme', 'Bac']
  },
  {
    id: 'demo-2',
    title: 'Extrait de Cours : Les Algorithmes de Tri en Python',
    youtubeId: 'kJQP7kiw5Fk',
    module: 'Algorithmique',
    category: 'Algorithmique',
    level: '4ème Bac Info',
    duration: '14:15',
    description: 'Apprenez les mécanismes des tris itératifs et récursifs en Python avec des explications claires et du code commenté.',
    videoUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk',
    thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    isFeatured: true,
    order: 2,
    tags: ['Python', 'Tri', 'Algorithmes']
  },
  {
    id: 'demo-3',
    title: 'Base de Données & SQL : Requêtes d\'Interrogation et Jointures',
    youtubeId: 'L_LUpnjgPso',
    module: 'Base de Données',
    category: 'Base de Données',
    level: '4ème Bac Info',
    duration: '12:30',
    description: 'Maîtrisez les requêtes SQL complexes, filtres conditionnels WHERE, jointures multiples et fonctions d\'agrégation.',
    videoUrl: 'https://www.youtube.com/embed/L_LUpnjgPso',
    thumbnailUrl: 'https://img.youtube.com/vi/L_LUpnjgPso/hqdefault.jpg',
    isFeatured: true,
    order: 3,
    tags: ['SQL', 'BDD', 'Requêtes']
  },
  {
    id: 'demo-4',
    title: 'Développement Web : JavaScript DOM & Validation de Formulaires',
    youtubeId: 'fJ9rUzIMcZQ',
    module: 'Développement Web',
    category: 'Développement Web',
    level: '3ème & 4ème Année',
    duration: '10:45',
    description: 'Comprendre la manipulation dynamique des éléments HTML, la gestion des événements et la validation par expressions régulières.',
    videoUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ',
    thumbnailUrl: 'https://img.youtube.com/vi/fJ9rUzIMcZQ/hqdefault.jpg',
    isFeatured: false,
    order: 4,
    tags: ['Web', 'JavaScript', 'DOM']
  },
  {
    id: 'demo-5',
    title: 'Méthodologie & Astuces pour l\'Épreuve Pratique du Bac Informatique',
    youtubeId: 'kJQP7kiw5Fk',
    module: 'Méthodologie',
    category: 'Méthodologie',
    level: 'Baccalauréat',
    duration: '09:20',
    description: 'Conseils clés pour la gestion du temps, l\'organisation des sous-programmes et la résolution rapide des erreurs d\'exécution.',
    videoUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk',
    thumbnailUrl: 'https://img.youtube.com/vi/kJQP7kiw5Fk/hqdefault.jpg',
    isFeatured: false,
    order: 5,
    tags: ['Méthodologie', 'Bac', 'Conseils']
  },
  {
    id: 'demo-6',
    title: 'Structures de Données Récursives & Piles en Python',
    youtubeId: 'dQw4w9WgXcQ',
    module: 'Algorithmique',
    category: 'Algorithmique',
    level: '4ème Bac Info',
    duration: '11:50',
    description: 'Comprendre la récursivité, les conditions d\'arrêt et l\'implémentation des piles et files pour les sujets de synthèse.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    thumbnailUrl: 'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg',
    isFeatured: false,
    order: 6,
    tags: ['Python', 'Récursivité', 'Piles']
  }
];

export const DEFAULT_DEMO_VIDEOS = sampleDemos;

interface StudentDemosProps {
  onGoToShop?: () => void;
  onGoToCourse?: () => void;
  onBack?: () => void;
  isPremiumUser?: boolean;
}

export const StudentDemos: React.FC<StudentDemosProps> = ({ 
  onGoToShop, 
  onGoToCourse,
  onBack,
  isPremiumUser = false 
}) => {
  const [videos, setVideos] = useState<DemoVideoItem[]>(sampleDemos);
  const [selectedVideo, setSelectedVideo] = useState<DemoVideoItem>(sampleDemos[0]);
  const [activeTab, setActiveTab] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grid');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [modalVideo, setModalVideo] = useState<DemoVideoItem | null>(null);

  // Gestion dynamique du bouton retour
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = "#/student/courses";
    }
  };

  // Fetch all published demo videos managed by admin, with fallback to sampleDemos
  const fetchDemos = async (isSilent = false) => {
    try {
      if (!isSilent) setLoading(true);
      else setIsRefreshing(true);

      const res = await fetch('/api/demos');
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const formatted: DemoVideoItem[] = data.map((item: any, idx: number) => {
            const rawTags: string[] = Array.isArray(item.tags) && item.tags.length > 0 
              ? item.tags 
              : [item.category || item.module || 'Démo', 'Bac'];
            const uniqueTags: string[] = Array.from(new Set(rawTags.map((t: any) => String(t).trim()).filter(Boolean)));
            const ytId = extractYoutubeId(item.youtubeId || item.videoUrl || '');
            
            return {
              id: String(item.id || `demo_${idx + 1}`),
              title: item.title || `Extrait Démo ${idx + 1}`,
              module: item.module || item.category || 'Général',
              category: item.category || item.module || 'Général',
              level: item.level || item.grade || (item.section ? `${item.section}` : '4ème Bac Info'),
              duration: item.duration || '08:30',
              description: item.description || '',
              videoUrl: item.videoUrl || `https://www.youtube.com/embed/${ytId}`,
              youtubeId: ytId,
              thumbnailUrl: item.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined),
              isFeatured: Boolean(item.featured ?? item.isFeatured),
              order: typeof item.order === 'number' ? item.order : (item.displayOrder || idx + 1),
              tags: uniqueTags
            };
          });

          // Sort by featured first, then by order
          formatted.sort((a, b) => {
            if (a.isFeatured && !b.isFeatured) return -1;
            if (!a.isFeatured && b.isFeatured) return 1;
            return (a.order || 0) - (b.order || 0);
          });

          setVideos(formatted);
          setSelectedVideo((prev) => {
            const found = formatted.find(v => v.id === prev.id);
            return found || formatted[0];
          });
        } else {
          // If backend returns empty list, keep rich sampleDemos
          setVideos(sampleDemos);
          setSelectedVideo(sampleDemos[0]);
        }
      } else {
        // Fallback to sampleDemos on non-ok response
        setVideos(sampleDemos);
      }
    } catch (err) {
      console.warn('Chargement démos fallback:', err);
      setVideos(sampleDemos);
    } finally {
      setLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchDemos();
  }, []);

  // Listen for real-time admin updates to demo videos
  useRealtimeSync((msg) => {
    if (
      msg.type === 'DEMO_CREATED' || 
      msg.type === 'DEMO_UPDATED' || 
      msg.type === 'DEMO_DELETED' ||
      msg.type === 'DEMOS_UPDATED' ||
      msg.type === 'REFRESH_DEMOS'
    ) {
      fetchDemos(true);
    }
  });

  useEffect(() => {
    const handleDemosUpdate = () => {
      fetchDemos(true);
    };
    window.addEventListener('demos-updated', handleDemosUpdate);
    window.addEventListener('storage', handleDemosUpdate);
    return () => {
      window.removeEventListener('demos-updated', handleDemosUpdate);
      window.removeEventListener('storage', handleDemosUpdate);
    };
  }, []);

  // Compute dynamic category / module list with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Tous': videos.length };
    videos.forEach(v => {
      const cat = v.module || v.category || 'Général';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const uniqueCats = Array.from(new Set(videos.map(v => v.module || v.category || 'Général').filter(Boolean)));
    return {
      list: ['Tous', ...uniqueCats],
      counts
    };
  }, [videos]);

  // Filtered videos based on activeTab & searchQuery
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const videoCat = (video.module || video.category || '').toLowerCase();
      const matchesCategory = activeTab === 'Tous' || videoCat === activeTab.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        video.title.toLowerCase().includes(q) ||
        (video.description && video.description.toLowerCase().includes(q)) ||
        (video.module && video.module.toLowerCase().includes(q)) ||
        (video.category && video.category.toLowerCase().includes(q)) ||
        (video.level && video.level.toLowerCase().includes(q)) ||
        video.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [videos, activeTab, searchQuery]);

  // Grouped videos by module/category
  const groupedVideos = useMemo(() => {
    const map: Record<string, DemoVideoItem[]> = {};
    filteredVideos.forEach((video) => {
      const cat = video.module || video.category || 'Autres Modules';
      if (!map[cat]) map[cat] = [];
      map[cat].push(video);
    });
    return map;
  }, [filteredVideos]);

  const getCategoryBadgeColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('présentation')) {
      return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/50 dark:text-blue-300 dark:border-blue-800';
    }
    if (cat.includes('algo') || cat.includes('python')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/50 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (cat.includes('donnée') || cat.includes('sql') || cat.includes('base')) {
      return 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/50 dark:text-indigo-300 dark:border-indigo-800';
    }
    if (cat.includes('web') || cat.includes('javascript') || cat.includes('html')) {
      return 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/50 dark:text-amber-300 dark:border-amber-800';
    }
    if (cat.includes('bac') || cat.includes('épreuve')) {
      return 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/50 dark:text-rose-300 dark:border-rose-800';
    }
    if (cat.includes('méthodologie') || cat.includes('conseil')) {
      return 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/50 dark:text-purple-300 dark:border-purple-800';
    }
    return 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
  };

  const getCategoryIcon = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('algo') || cat.includes('python')) return '🐍';
    if (cat.includes('donnée') || cat.includes('sql')) return '🗄️';
    if (cat.includes('web') || cat.includes('javascript')) return '🌐';
    if (cat.includes('bac')) return '🎓';
    if (cat.includes('méthodologie')) return '💡';
    if (cat.includes('présentation')) return '✨';
    return '🎬';
  };

  const activeEmbedUrl = useMemo(() => {
    return getEmbedVideoUrl(selectedVideo.youtubeId || selectedVideo.videoUrl);
  }, [selectedVideo]);

  const handleSelectAndScroll = (video: DemoVideoItem) => {
    setSelectedVideo(video);
    const playerEl = document.getElementById('main-video-player-container');
    if (playerEl) {
      playerEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6 select-none text-left font-sans">
      
      {/* 0. BARRE DE NAVIGATION RETOUR & FIL D'ARIANE */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-2xl p-3.5 sm:px-5 shadow-xs flex flex-wrap items-center justify-between gap-3 transition-colors">
        <div className="flex items-center gap-3.5 min-w-0">
          <BackButton onClick={handleBack} label="Retour" />
          <div className="h-5 w-px bg-slate-200 dark:bg-slate-700 hidden sm:block shrink-0" />
          <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium flex-wrap">
            <button
              type="button"
              onClick={() => { window.location.hash = "#/student/dashboard"; }}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer"
            >
              Espace Élève
            </button>
            <ChevronRight size={12} className="text-slate-400 shrink-0" />
            <button
              type="button"
              onClick={() => { setActiveTab('Tous'); setSearchQuery(''); }}
              className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors cursor-pointer font-semibold text-slate-700 dark:text-slate-200"
            >
              Démo & Extraits
            </button>
            {selectedVideo && (
              <>
                <ChevronRight size={12} className="text-slate-400 shrink-0" />
                <span className="text-emerald-600 dark:text-emerald-400 font-bold truncate max-w-[180px] sm:max-w-[320px]">
                  {selectedVideo.title}
                </span>
              </>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => fetchDemos(true)}
            className="p-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
            title="Rafraîchir les démonstrations"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* 1. LECTEUR VIDÉO PRINCIPAL YOUTUBE EMBEDDED */}
      <div 
        id="main-video-player-container"
        className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4 transition-colors"
      >
        <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Lecteur Vidéo YouTube & Extrait Interactif
            </span>
          </div>
          
          <button
            type="button"
            onClick={() => setModalVideo(selectedVideo)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-emerald-600 dark:text-slate-400 dark:hover:text-emerald-400 cursor-pointer transition"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Plein écran</span>
          </button>
        </div>

        {/* Embedded YouTube Player */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
          <iframe
            key={`main-yt-${selectedVideo.id}-${selectedVideo.youtubeId}`}
            src={activeEmbedUrl}
            title={selectedVideo.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Informations & Métadonnées de la vidéo en lecture */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-1 text-xs font-extrabold rounded-lg border ${getCategoryBadgeColor(selectedVideo.module || selectedVideo.category)}`}>
                {getCategoryIcon(selectedVideo.module || selectedVideo.category)} {selectedVideo.module || selectedVideo.category}
              </span>
              
              <span className="inline-flex items-center gap-1 text-xs font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
                {selectedVideo.level || '4ème Bac Info'}
              </span>

              <span className="flex items-center gap-1 text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700">
                <Clock className="w-3.5 h-3.5" />
                {selectedVideo.duration}
              </span>
            </div>

            <h2 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug">
              {selectedVideo.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
              {selectedVideo.description || "Visionnez cet extrait pédagogique proposé par l'équipe A-Zed pour découvrir la qualité de nos cours."}
            </p>
          </div>

          {/* Tags */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0 md:max-w-xs">
            {selectedVideo.tags.map((tag, idx) => (
              <span 
                key={`tag-${tag}-${idx}`} 
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-medium rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 2. BARRE DE FILTRES : MODULES, RECHERCHE & AFFICHAGE */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Filtres par Module / Catégorie */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none w-full lg:w-auto">
            {categoriesWithCounts.list.map((cat) => {
              const count = categoriesWithCounts.counts[cat] || 0;
              const isActive = activeTab.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={`cat-${cat}`}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat === 'Tous' ? '✨ Toutes les Démo' : `${getCategoryIcon(cat)} ${cat}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-black ${
                    isActive 
                      ? 'bg-white/25 text-white' 
                      : 'bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Barre de Recherche et sélecteur Grille/Module */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher une démo..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/30 focus:border-emerald-500"
              />
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              {searchQuery && (
                <button 
                  type="button" 
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Toggle Affichage */}
            <div className="inline-flex bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Affichage en Grille"
              >
                <Film className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Grille</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grouped')}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                  viewMode === 'grouped'
                    ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
                }`}
                title="Affichage par Module"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Par Module</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 3. GRILLE RESPONSIVE DES VIDÉOS YOUTUBE (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6) */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200/90 dark:border-slate-800 space-y-3">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Chargement des extraits vidéo...
          </p>
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 sm:p-16 text-center border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              Aucun extrait vidéo ne correspond à votre recherche
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Essayez de réinitialiser vos filtres ou effectuez une recherche avec d'autres mots-clés.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setActiveTab('Tous');
              setSearchQuery('');
            }}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Réinitialiser les filtres</span>
          </button>
        </div>
      ) : viewMode === 'grouped' && activeTab === 'Tous' ? (
        <div className="space-y-8">
          {(Object.entries(groupedVideos) as [string, DemoVideoItem[]][]).map(([categoryName, catVideos]) => (
            <div key={`group-${categoryName}`} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2.5">
                  <span className="text-lg">{getCategoryIcon(categoryName)}</span>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    {categoryName}
                  </h3>
                  <span className="text-xs font-bold px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 rounded-full">
                    {catVideos.length} extrait{catVideos.length > 1 ? 's' : ''}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab(categoryName)}
                  className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Filtrer ce module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {catVideos.map((video) => renderVideoCard(video))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => renderVideoCard(video))}
        </div>
      )}

      {/* 4. MODAL PLAYER POPUP EN PLEIN ÉCRAN */}
      {modalVideo && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200">
          <div className="relative w-full max-w-5xl bg-slate-900 rounded-3xl overflow-hidden shadow-2xl border border-slate-700 flex flex-col max-h-[92vh]">
            
            {/* Header Modal */}
            <div className="p-4 bg-slate-850 border-b border-slate-800 flex items-center justify-between gap-3 text-white">
              <div className="flex items-center gap-2 min-w-0">
                <span className={`px-2.5 py-0.5 text-xs font-bold rounded-lg border ${getCategoryBadgeColor(modalVideo.module || modalVideo.category)}`}>
                  {modalVideo.module || modalVideo.category}
                </span>
                <h3 className="text-sm sm:text-base font-extrabold truncate">
                  {modalVideo.title}
                </h3>
              </div>

              <button
                type="button"
                onClick={() => setModalVideo(null)}
                className="p-2 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Video Iframe */}
            <div className="relative aspect-video w-full bg-black">
              <iframe
                src={getEmbedVideoUrl(modalVideo.youtubeId || modalVideo.videoUrl, true)}
                title={modalVideo.title}
                className="w-full h-full border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>

            {/* Footer Modal */}
            <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <span>Niveau : <strong className="text-white">{modalVideo.level || '4ème Bac Info'}</strong></span>
                <span>•</span>
                <span>Durée : <strong className="text-white">{modalVideo.duration}</strong></span>
              </div>

              <button
                type="button"
                onClick={() => {
                  setSelectedVideo(modalVideo);
                  setModalVideo(null);
                  handleSelectAndScroll(modalVideo);
                }}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition cursor-pointer"
              >
                Ouvrir dans le lecteur principal
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );

  // Helper pour rendre chaque carte vidéo de la grille
  function renderVideoCard(video: DemoVideoItem) {
    const isSelected = selectedVideo.id === video.id;
    const ytId = video.youtubeId || extractYoutubeId(video.videoUrl);
    const thumbUrl = video.thumbnailUrl || (ytId ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600');
    const moduleName = video.module || video.category || 'Général';
    const levelName = video.level || '4ème Bac Info';

    return (
      <div
        key={`video-card-${video.id}`}
        className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
          isSelected
            ? 'border-emerald-600 ring-2 ring-emerald-600/20 shadow-md'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div>
          {/* Miniature Vidéo avec Bouton Play Hover */}
          <div 
            onClick={() => handleSelectAndScroll(video)}
            className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
          >
            <img
              src={thumbUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              loading="lazy"
              onError={(e) => {
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
              }}
            />

            {/* Overlay Gradient et Bouton Play */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex items-center justify-center group-hover:bg-slate-950/30 transition-colors">
              <div
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg ${
                  isSelected
                    ? 'bg-emerald-600 text-white shadow-emerald-600/40'
                    : 'bg-white/95 text-slate-900 group-hover:bg-emerald-600 group-hover:text-white'
                }`}
              >
                <Play className="w-5 h-5 fill-current ml-0.5" />
              </div>
            </div>

            {/* Badge Module / Catégorie haut gauche */}
            <span className={`absolute top-2.5 left-2.5 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border backdrop-blur-xs ${getCategoryBadgeColor(moduleName)}`}>
              {moduleName}
            </span>

            {/* Badge Niveau */}
            <span className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-black/75 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold rounded-md backdrop-blur-xs">
              {levelName}
            </span>

            {/* Durée bas droite */}
            <span className="absolute bottom-2.5 right-2.5 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded-md backdrop-blur-xs flex items-center gap-1 font-mono">
              <Clock className="w-2.5 h-2.5" />
              {video.duration}
            </span>
          </div>

          {/* Corps de Carte */}
          <div className="p-4 space-y-2">
            <div className="flex items-center justify-between gap-2 text-xs">
              <span className="font-bold text-emerald-600 dark:text-emerald-400">
                {moduleName}
              </span>
              <span className="text-slate-400 text-[11px] font-medium">
                {levelName}
              </span>
            </div>

            <h4 
              onClick={() => handleSelectAndScroll(video)}
              className="font-extrabold text-slate-900 dark:text-slate-100 text-sm leading-snug line-clamp-2 hover:text-emerald-600 transition-colors cursor-pointer"
            >
              {video.title}
            </h4>

            <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {video.description || "Découvrez cet extrait de cours préparé par les enseignants A-Zed."}
            </p>
          </div>
        </div>

        {/* Action Directe : Regarder l'extrait */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 flex items-center gap-2">
          <button
            type="button"
            onClick={() => handleSelectAndScroll(video)}
            className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-emerald-300 hover:text-emerald-600'
            }`}
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>{isSelected ? 'En cours de lecture' : "Regarder l'extrait"}</span>
          </button>

          <button
            type="button"
            onClick={() => setModalVideo(video)}
            className="p-2 bg-white dark:bg-slate-800 text-slate-500 hover:text-emerald-600 border border-slate-200/80 dark:border-slate-700 rounded-xl transition cursor-pointer"
            title="Agrandir la vidéo"
          >
            <Maximize2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  }
};

export default StudentDemos;
