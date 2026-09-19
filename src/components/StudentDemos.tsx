import React, { useState, useEffect, useMemo } from 'react';
import { 
  Play, Clock, Sparkles, Search, BookOpen, CheckCircle2, ArrowRight, 
  Video, Flame, Tag, Layers, RefreshCw, Film, ExternalLink,
  Check, Filter, ChevronRight, PlayCircle, X
} from 'lucide-react';
import { useRealtimeSync } from '../lib/useRealtimeSync';
import BackButton from './BackButton';

export interface DemoVideoItem {
  id: string;
  title: string;
  category: string;
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
  return (match && match[2] && match[2].length === 11) ? match[2] : trimmed;
};

export const getEmbedVideoUrl = (url: string): string => {
  if (!url) return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  const trimmed = url.trim();
  
  if (trimmed.includes('youtube.com/watch?v=')) {
    const match = trimmed.match(/[?&]v=([a-zA-Z0-9_-]+)/);
    if (match && match[1]) {
      return `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0`;
    }
    return trimmed.replace('watch?v=', 'embed/') + '?autoplay=1&rel=0';
  }
  
  if (trimmed.includes('youtu.be/')) {
    const id = trimmed.split('youtu.be/')[1]?.split('?')[0];
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }

  if (trimmed.includes('youtube.com/shorts/')) {
    const id = trimmed.split('youtube.com/shorts/')[1]?.split('?')[0];
    if (id) return `https://www.youtube.com/embed/${id}?autoplay=1&rel=0`;
  }
  
  if (trimmed.includes('vimeo.com/')) {
    const id = trimmed.split('vimeo.com/')[1]?.split('?')[0];
    if (id) return `https://player.vimeo.com/video/${id}?autoplay=1`;
  }

  if (trimmed.startsWith('http') && !trimmed.includes('embed')) {
    const ytId = extractYoutubeId(trimmed);
    if (ytId && ytId.length === 11) {
      return `https://www.youtube.com/embed/${ytId}?autoplay=1&rel=0`;
    }
  }

  return trimmed;
};

const DEFAULT_DEMO_VIDEOS: DemoVideoItem[] = [
  {
    id: 'demo_1',
    title: 'Présentation Complète de la Plateforme A-Zed Info',
    category: 'Présentation',
    duration: '05:40',
    description: 'Découvrez l\'ensemble des modules interactifs : cours vidéo, sandbox Python, QCM en temps réel et manuels d\'exercices corrigés.',
    videoUrl: 'https://www.youtube.com/embed/kJQP7kiw5Fk',
    youtubeId: 'kJQP7kiw5Fk',
    thumbnailUrl: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    order: 1,
    tags: ['Guide', 'Plateforme', 'Bac']
  },
  {
    id: 'demo_2',
    title: 'Extrait de Cours : Les Algorithmes de Tri en Python',
    category: 'Algorithmique',
    duration: '14:15',
    description: 'Apprenez les mécanismes des tris récursifs et itératifs avec les explications détaillées de M. Nabil Chaouch.',
    videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    youtubeId: 'dQw4w9WgXcQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    order: 2,
    tags: ['Python', 'Tri', 'Algorithmes', 'Bac']
  },
  {
    id: 'demo_3',
    title: 'Base de Données & SQL : Requêtes d\'Interrogation et Jointures',
    category: 'Base de Données',
    duration: '12:30',
    description: 'Maîtrisez les requêtes SQL complexes, SELECT avec jointures multiples et agrégats pour les épreuves théoriques et pratiques.',
    videoUrl: 'https://www.youtube.com/embed/L_LUpnjgPso',
    youtubeId: 'L_LUpnjgPso',
    thumbnailUrl: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600',
    isFeatured: true,
    order: 3,
    tags: ['SQL', 'BDD', 'Requêtes', 'Bac']
  },
  {
    id: 'demo_4',
    title: 'Développement Web : JavaScript DOM & Validation de Formulaires',
    category: 'Développement Web',
    duration: '10:45',
    description: 'Comprendre la manipulation dynamique du DOM, les expressions régulières et la validation interactive côté client.',
    videoUrl: 'https://www.youtube.com/embed/fJ9rUzIMcZQ',
    youtubeId: 'fJ9rUzIMcZQ',
    thumbnailUrl: 'https://images.unsplash.com/photo-1593720213428-28a5b9e94613?auto=format&fit=crop&q=80&w=600',
    isFeatured: false,
    order: 4,
    tags: ['Web', 'JavaScript', 'HTML/CSS', 'Bac']
  },
  {
    id: 'demo_5',
    title: 'Méthodologie & Astuces pour l\'Épreuve Pratique du Bac Informatique',
    category: 'Méthodologie',
    duration: '09:20',
    description: 'Guide méthodologique complet : gestion du temps, structuration des sous-programmes et pièges fréquents à éviter le jour de l\'examen.',
    videoUrl: 'https://www.youtube.com/embed/L_LUpnjgPso',
    youtubeId: 'L_LUpnjgPso',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&q=80&w=600',
    isFeatured: false,
    order: 5,
    tags: ['BAC', 'Conseils', 'Méthodologie']
  }
];

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
  const [videos, setVideos] = useState<DemoVideoItem[]>(DEFAULT_DEMO_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<DemoVideoItem>(DEFAULT_DEMO_VIDEOS[0]);
  const [activeTab, setActiveTab] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [viewMode, setViewMode] = useState<'grid' | 'grouped'>('grid');
  const [loading, setLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Gestion dynamique et universelle du bouton « Retour »
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      window.location.hash = "#/student/courses";
    }
  };

  // Fetch all published demo videos managed by admin
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
              : [item.category || 'Démo', 'Bac'];
            const uniqueTags: string[] = Array.from(new Set(rawTags.map((t: any) => String(t).trim()).filter(Boolean)));
            const ytId = extractYoutubeId(item.videoUrl || item.youtubeId || '');
            
            return {
              id: String(item.id || `demo_${idx + 1}`),
              title: item.title || `Démo ${idx + 1}`,
              category: item.category || 'Extrait Cours',
              duration: item.duration || '08:45',
              description: item.description || '',
              videoUrl: item.videoUrl || `https://www.youtube.com/embed/${ytId}`,
              youtubeId: ytId,
              thumbnailUrl: item.thumbnailUrl || (ytId && ytId !== 'dQw4w9WgXcQ' ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : undefined),
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
        }
      }
    } catch (err) {
      console.warn('Erreur lors du chargement des démos:', err);
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

  // Compute dynamic category list with counts
  const categoriesWithCounts = useMemo(() => {
    const counts: Record<string, number> = { 'Tous': videos.length };
    videos.forEach(v => {
      const cat = v.category || 'Général';
      counts[cat] = (counts[cat] || 0) + 1;
    });

    const uniqueCats = Array.from(new Set(videos.map(v => v.category || 'Général').filter(Boolean)));
    return {
      list: ['Tous', ...uniqueCats],
      counts
    };
  }, [videos]);

  // Filtered videos based on activeTab & searchQuery
  const filteredVideos = useMemo(() => {
    return videos.filter((video) => {
      const matchesCategory = activeTab === 'Tous' || video.category.toLowerCase() === activeTab.toLowerCase();
      const q = searchQuery.toLowerCase().trim();
      if (!q) return matchesCategory;

      const matchesSearch =
        video.title.toLowerCase().includes(q) ||
        video.description.toLowerCase().includes(q) ||
        video.category.toLowerCase().includes(q) ||
        video.tags.some(t => t.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [videos, activeTab, searchQuery]);

  // Grouped videos by category for educational module layout
  const groupedVideos = useMemo(() => {
    const map: Record<string, DemoVideoItem[]> = {};
    filteredVideos.forEach((video) => {
      const cat = video.category || 'Autres Modules';
      if (!map[cat]) map[cat] = [];
      map[cat].push(video);
    });
    return map;
  }, [filteredVideos]);

  const handleCtaClick = () => {
    if (onGoToShop) {
      onGoToShop();
    } else {
      const pricingEl = document.getElementById('pricing');
      if (pricingEl) {
        pricingEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const getCategoryBadgeColor = (category: string) => {
    const cat = category.toLowerCase();
    if (cat.includes('présentation')) {
      return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800';
    }
    if (cat.includes('algo') || cat.includes('python')) {
      return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-950/60 dark:text-emerald-300 dark:border-emerald-800';
    }
    if (cat.includes('donnée') || cat.includes('sql') || cat.includes('base')) {
      return 'bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-950/60 dark:text-indigo-300 dark:border-indigo-800';
    }
    if (cat.includes('web') || cat.includes('javascript') || cat.includes('html')) {
      return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-950/60 dark:text-amber-300 dark:border-amber-800';
    }
    if (cat.includes('bac') || cat.includes('épreuve')) {
      return 'bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-950/60 dark:text-rose-300 dark:border-rose-800';
    }
    if (cat.includes('méthodologie') || cat.includes('conseil')) {
      return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800';
    }
    return 'bg-slate-100 text-slate-800 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700';
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
    return getEmbedVideoUrl(selectedVideo.videoUrl || selectedVideo.youtubeId);
  }, [selectedVideo]);

  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-7 select-none text-left font-sans">
      
      {/* 0. BARRE DE NAVIGATION RETOUR & FIL D'ARIANE (BREADCRUMBS) */}
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
                <span className="text-purple-600 dark:text-purple-400 font-bold truncate max-w-[180px] sm:max-w-[320px]">
                  {selectedVideo.title}
                </span>
              </>
            )}
          </nav>
        </div>
      </div>

      {/* 1. HERO BANNER UNIFIÉE AVEC STATUT & ACTION */}
      <div className="w-full bg-white dark:bg-slate-900 border border-slate-200/90 dark:border-slate-800 rounded-3xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xs transition-colors">
        <div className="flex items-start sm:items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-purple-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-md shadow-purple-500/20">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Vidéos Démo & Extraits de Cours
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                <Sparkles className="w-3 h-3" />
                {videos.length} Extraits Disponibles
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl leading-relaxed">
              Explorez nos extraits vidéo officiels, visualisez la méthodologie des épreuves nationales et découvrez l'excellence pédagogique d'A-Zed Info.
            </p>
          </div>
        </div>

        {/* Boutons d'action rapides à droite */}
        <div className="flex items-center gap-2 sm:gap-3 self-end md:self-auto shrink-0">
          <button
            type="button"
            onClick={() => fetchDemos(true)}
            className="p-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 rounded-xl transition cursor-pointer"
            title="Rafraîchir les démonstrations"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </button>

          {onGoToCourse && (
            <button
              type="button"
              onClick={onGoToCourse}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <BookOpen className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>Voir les Cours</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleCtaClick}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold rounded-xl shadow-md hover:shadow-lg transition cursor-pointer"
          >
            <span>Débloquer Tout</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2. GRAND LECTEUR VIDÉO INTÉGRÉ (FEATURED MASTER PLAYER) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-sm p-4 sm:p-6 space-y-4 transition-colors">
        <div className="flex items-center justify-between pb-1 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-slate-200">
              Lecteur Principal & Streaming
            </span>
          </div>
        </div>

        {/* Iframe vidéo réactive */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 shadow-inner">
          <iframe
            key={selectedVideo.id + selectedVideo.videoUrl}
            src={activeEmbedUrl}
            title={selectedVideo.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
          />
        </div>

        {/* Détails de la vidéo en lecture */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 pt-3 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`px-2.5 py-0.5 text-[11px] font-black rounded-lg border ${getCategoryBadgeColor(selectedVideo.category)}`}>
                {getCategoryIcon(selectedVideo.category)} {selectedVideo.category}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-md">
                <Clock className="w-3 h-3" />
                {selectedVideo.duration}
              </span>
              {selectedVideo.isFeatured && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-700 bg-amber-100 dark:bg-amber-950/60 dark:text-amber-300 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                  <Sparkles className="w-3 h-3 text-amber-500 fill-amber-400" /> Vidéo Vedette
                </span>
              )}
            </div>

            <h2 className="text-base sm:text-xl font-black text-slate-900 dark:text-white leading-snug">
              {selectedVideo.title}
            </h2>

            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-4xl">
              {selectedVideo.description || "Aucune description détaillée renseignée pour cet extrait."}
            </p>
          </div>

          {/* Tags de la vidéo active */}
          <div className="flex items-center gap-1.5 flex-wrap shrink-0 md:max-w-xs">
            {selectedVideo.tags.map((tag, idx) => (
              <span 
                key={`selected-tag-${tag}-${idx}`} 
                className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[11px] font-semibold rounded-lg"
              >
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BARRE DE CONTRÔLE : CATÉGORIES, RECHERCHE & MODE D'AFFICHAGE */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-3xl border border-slate-200/90 dark:border-slate-800 shadow-xs space-y-3 transition-colors">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          
          {/* Onglets Filtres par Catégorie */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-2 lg:pb-0 scrollbar-none w-full lg:w-auto">
            {categoriesWithCounts.list.map((cat) => {
              const count = categoriesWithCounts.counts[cat] || 0;
              const isActive = activeTab.toLowerCase() === cat.toLowerCase();

              return (
                <button
                  key={`cat-pill-${cat}`}
                  type="button"
                  onClick={() => setActiveTab(cat)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-extrabold transition-all whitespace-nowrap cursor-pointer flex items-center gap-2 ${
                    isActive
                      ? 'bg-purple-600 text-white shadow-md shadow-purple-600/20'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  <span>{cat === 'Tous' ? '✨ Toutes les Démo' : `${getCategoryIcon(cat)} ${cat}`}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-black ${
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

          {/* Recherche & Bascule de vue */}
          <div className="flex items-center gap-2.5 w-full lg:w-auto shrink-0">
            <div className="relative flex-1 sm:w-64">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher par titre, module ou mot-clé..."
                className="w-full pl-9 pr-8 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500/30 focus:border-purple-500"
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

            {/* Toggle Affichage : Grille vs Modules groupés */}
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
                title="Affichage Groupé par Module"
              >
                <Layers className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Par Module</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* 4. CONTENU PRINCIPAL DES VIDÉOS OU EMPTY STATE */}
      {loading ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-16 text-center border border-slate-200/90 dark:border-slate-800 space-y-3">
          <div className="w-8 h-8 border-3 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400">
            Chargement des vidéos de démonstration publiées...
          </p>
        </div>
      ) : filteredVideos.length === 0 ? (
        /* EMPTY STATE RIGOUREUX CONFORME AUX SPÉCIFICATIONS */
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 sm:p-16 text-center border border-slate-200/90 dark:border-slate-800 space-y-4 shadow-xs">
          <div className="w-16 h-16 bg-purple-50 dark:bg-purple-950/50 text-purple-600 dark:text-purple-400 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
            <Video className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-base font-extrabold text-slate-800 dark:text-slate-200">
              Aucune vidéo de démonstration disponible pour le moment
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
              {searchQuery 
                ? `Aucun résultat ne correspond à votre recherche "${searchQuery}".`
                : activeTab !== 'Tous'
                  ? `Aucun extrait n'est actuellement publié dans la catégorie "${activeTab}".`
                  : "Les démonstrations vidéo seront prochainement mises en ligne par l'administrateur."}
            </p>
          </div>
          <div className="pt-2">
            <button
              type="button"
              onClick={() => {
                setActiveTab('Tous');
                setSearchQuery('');
              }}
              className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-extrabold rounded-xl shadow-md transition cursor-pointer inline-flex items-center gap-2"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Afficher toutes les vidéos</span>
            </button>
          </div>
        </div>
      ) : viewMode === 'grouped' && activeTab === 'Tous' ? (
        /* MODE GROUPÉ PAR CATÉGORIE / MODULE ÉDUCATIF */
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
                    {catVideos.length} vidéo{catVideos.length > 1 ? 's' : ''}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveTab(categoryName)}
                  className="text-xs font-bold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Filtrer ce module</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {catVideos.map((video) => renderVideoCard(video))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* MODE GRILLE RESPONSIVE UNIFIÉE */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => renderVideoCard(video))}
        </div>
      )}

      {/* 5. CALL TO ACTION BAS DE PAGE */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-center text-white space-y-4 shadow-xl border border-slate-800">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-extrabold uppercase tracking-wider">
          <Sparkles className="w-3.5 h-3.5" /> Pack Complet A-Zed Sciences
        </div>
        <h3 className="text-lg sm:text-2xl font-black">
          Envie d'accéder à l'intégralité des cours & exercices corrigés ?
        </h3>
        <p className="text-xs sm:text-sm text-slate-300 max-w-xl mx-auto leading-relaxed">
          Rejoignez les élèves du Bac Informatique et bénéficiez de vidéos complètes pas-à-pas, devoirs types examens, et assistance pédagogique personnalisée.
        </p>
        <div className="pt-2 flex items-center justify-center gap-3 flex-wrap">
          <button
            type="button"
            onClick={handleCtaClick}
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#00b87c] hover:bg-emerald-600 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Découvrir les Offres d'Abonnement</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );

  // Helper pour rendre chaque carte vidéo individuellement
  function renderVideoCard(video: DemoVideoItem) {
    const isSelected = selectedVideo.id === video.id;
    const ytId = video.youtubeId || extractYoutubeId(video.videoUrl);
    const thumbUrl = video.thumbnailUrl || (ytId && ytId !== 'dQw4w9WgXcQ' ? `https://img.youtube.com/vi/${ytId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600');

    return (
      <div
        key={`video-card-${video.id}`}
        className={`group bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-xs hover:shadow-md ${
          isSelected
            ? 'border-purple-600 ring-2 ring-purple-600/20 shadow-md scale-[1.01]'
            : 'border-slate-200/90 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div>
          {/* Miniature Vidéo avec Bouton Play Hover */}
          <div 
            onClick={() => {
              setSelectedVideo(video);
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            className="relative aspect-video bg-slate-950 overflow-hidden cursor-pointer"
          >
            <img
              src={thumbUrl}
              alt={video.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
              loading="lazy"
              onError={(e) => {
                // Fallback image si le lien YouTube échoue
                (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=600';
              }}
            />

            {/* Overlay Gradient et Bouton Play */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-slate-950/20 to-transparent flex items-center justify-center group-hover:bg-slate-950/30 transition-colors">
              <div
                className={`w-11 h-11 rounded-full flex items-center justify-center transition-all duration-300 group-hover:scale-110 shadow-lg ${
                  isSelected
                    ? 'bg-purple-600 text-white shadow-purple-600/40'
                    : 'bg-white/95 text-slate-900 group-hover:bg-purple-600 group-hover:text-white'
                }`}
              >
                <Play className="w-4 h-4 fill-current ml-0.5" />
              </div>
            </div>

            {/* Badge Catégorie haut gauche */}
            <span className={`absolute top-2 left-2 px-2 py-0.5 text-[10px] font-black uppercase tracking-wider rounded-md border backdrop-blur-xs ${getCategoryBadgeColor(video.category)}`}>
              {video.category}
            </span>

            {/* Durée bas droite */}
            <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-black/80 text-white text-[10px] font-bold rounded-md backdrop-blur-xs flex items-center gap-1 font-mono">
              <Clock className="w-2.5 h-2.5" />
              {video.duration}
            </span>

            {/* Badge Vedette */}
            {video.isFeatured && (
              <span className="absolute top-2 right-2 px-2 py-0.5 bg-amber-500/90 text-white text-[9px] font-extrabold rounded-md shadow-xs flex items-center gap-1 backdrop-blur-xs">
                <Sparkles className="w-2.5 h-2.5 fill-current" /> Vedette
              </span>
            )}
          </div>

          {/* Corps de Carte */}
          <div className="p-4 space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              {isSelected ? (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-purple-600 bg-purple-50 dark:bg-purple-950/60 px-2 py-0.5 rounded-md">
                  <Check className="w-3 h-3 stroke-[3]" /> En cours de lecture
                </span>
              ) : (
                <span className="text-[10px] font-bold text-slate-400">
                  Extrait vidéo
                </span>
              )}
            </div>

            <h4 
              onClick={() => {
                setSelectedVideo(video);
                window.scrollTo({ top: 120, behavior: 'smooth' });
              }}
              className="font-extrabold text-slate-900 dark:text-slate-100 text-xs sm:text-sm leading-snug line-clamp-2 hover:text-purple-600 transition-colors cursor-pointer"
            >
              {video.title}
            </h4>

            <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
              {video.description || "Découvrez cet extrait de cours préparé par les enseignants A-Zed."}
            </p>
          </div>
        </div>

        {/* Footer & Actions */}
        <div className="p-3 bg-slate-50 dark:bg-slate-850/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => {
              setSelectedVideo(video);
              window.scrollTo({ top: 120, behavior: 'smooth' });
            }}
            className={`w-full py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
              isSelected
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700 hover:border-purple-300'
            }`}
          >
            <Play className="w-3 h-3 fill-current" />
            <span>{isSelected ? 'En cours de lecture' : 'Lire cet extrait'}</span>
          </button>
        </div>
      </div>
    );
  }
};

export default StudentDemos;
