import React, { useState, useEffect } from 'react';
import { Play, Clock, Sparkles, Search, BookOpen, CheckCircle2, ArrowRight, Video, Flame, Star, Tag } from 'lucide-react';

export interface DemoVideo {
  id: string;
  title: string;
  category: 'Présentation' | 'Extraits Cours' | 'BAC' | 'Méthodologie' | string;
  duration: string;
  description: string;
  youtubeId: string;
  tags: string[];
}

export const extractYoutubeId = (urlOrId: string): string => {
  if (!urlOrId) return 'dQw4w9WgXcQ';
  const trimmed = urlOrId.trim();
  if (trimmed.length === 11 && !trimmed.includes('/') && !trimmed.includes('.')) {
    return trimmed;
  }
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/)([^#&?]*).*/;
  const match = trimmed.match(regExp);
  return (match && match[2] && match[2].length === 11) ? match[2] : trimmed;
};

const DEFAULT_DEMO_VIDEOS: DemoVideo[] = [
  {
    id: '1',
    title: 'Présentation Complète de la Plateforme A-Zed Info',
    category: 'Présentation',
    duration: '05:20',
    description: 'Découvrez l\'ensemble des modules interactifs : cours vidéo, sandbox Python, QCM en temps réel et exercices corrigés.',
    youtubeId: 'dQw4w9WgXcQ',
    tags: ['Guide', 'Plateforme']
  },
  {
    id: '2',
    title: 'Extrait de Cours : Les Algorithmes de Tri en Python',
    category: 'Extraits Cours',
    duration: '12:45',
    description: 'Apprenez les mécanismes des tris avancés avec les explications détaillées de M. Nabil Chaouch.',
    youtubeId: 'dQw4w9WgXcQ',
    tags: ['Python', 'Tri', 'Algorithmes']
  },
  {
    id: '3',
    title: 'Méthodologie & Astuces pour l\'Épreuve Pratique du Bac',
    category: 'Méthodologie',
    duration: '08:15',
    description: 'Guide méthodologique pour ne plus perdre de temps lors de la rédaction de vos programmes aux examens nationaux.',
    youtubeId: 'dQw4w9WgXcQ',
    tags: ['BAC', 'Conseils']
  },
  {
    id: '4',
    title: 'Démo Live : Sandbox Python & Résolution Interactive de TD',
    category: 'BAC',
    duration: '15:30',
    description: 'Exécution du code Python et manipulation de structures de données en temps réel sans aucune installation requise.',
    youtubeId: 'dQw4w9WgXcQ',
    tags: ['Live', 'Sandbox']
  }
];

const CATEGORIES = ['Tous', 'Présentation', 'Extraits Cours', 'BAC', 'Méthodologie'];

interface StudentDemosProps {
  onGoToShop?: () => void;
  isPremiumUser?: boolean;
}

export const StudentDemos: React.FC<StudentDemosProps> = ({ onGoToShop, isPremiumUser = false }) => {
  const [videos, setVideos] = useState<DemoVideo[]>(DEFAULT_DEMO_VIDEOS);
  const [selectedVideo, setSelectedVideo] = useState<DemoVideo>(DEFAULT_DEMO_VIDEOS[0]);
  const [activeTab, setActiveTab] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Fetch dynamic demos from backend if available, fallback to DEFAULT_DEMO_VIDEOS
  useEffect(() => {
    const fetchApiDemos = async () => {
      try {
        const res = await fetch('/api/demos');
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            const formatted: DemoVideo[] = data.map((item: any, idx: number) => {
              const rawTags: string[] = Array.isArray(item.tags) && item.tags.length > 0 
                ? item.tags 
                : [item.category || 'Démo', 'Bac'];
              const uniqueTags: string[] = Array.from(new Set(rawTags.map((t: any) => String(t).trim()).filter(Boolean)));
              return {
                id: String(item.id || idx + 1),
                title: item.title || `Démo ${idx + 1}`,
                category: item.category || 'Extraits Cours',
                duration: item.duration || '08:45',
                description: item.description || '',
                youtubeId: extractYoutubeId(item.videoUrl || item.youtubeId || 'dQw4w9WgXcQ'),
                tags: uniqueTags
              };
            });
            setVideos(formatted);
            setSelectedVideo(formatted[0]);
          }
        }
      } catch (err) {
        // En cas d'erreur réseau, les DEFAULT_DEMO_VIDEOS sont conservées
      }
    };
    fetchApiDemos();
  }, []);

  const dynamicCategories = ['Tous', ...Array.from(new Set(videos.map(v => v.category).filter(Boolean)))];
  const activeCategoriesList = dynamicCategories.length > 1 ? dynamicCategories : CATEGORIES;

  const filteredVideos = videos.filter((video) => {
    const matchesCategory = activeTab === 'Tous' || video.category === activeTab;
    const matchesSearch =
      video.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      video.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

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
    switch (category) {
      case 'Présentation':
        return 'bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300';
      case 'Extraits Cours':
        return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300';
      case 'BAC':
        return 'bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300';
      case 'Méthodologie':
        return 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300';
      default:
        return 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300';
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 select-none">
      
      {/* 1. HERO BANNER UNIFIÉE */}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 flex items-center justify-between shadow-sm text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <Video className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Vidéos Démo & Extraits de Cours
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Explorez nos extraits vidéo originaux, maîtrisez la méthodologie des épreuves et découvrez A-Zed Info.
            </p>
          </div>
        </div>
        {/* Badge statut compact à droite */}
        <div className="hidden sm:flex items-center gap-3">
          <button
            type="button"
            onClick={handleCtaClick}
            className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
          >
            <BookOpen className="w-3.5 h-3.5 text-amber-600" />
            <span>Débloquer Tout</span>
          </button>
          <span className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full">
            ACCÈS DÉMO GRATUIT
          </span>
        </div>
      </div>

      {/* 2. GRAND LECTEUR À LA UNE (FEATURED PLAYER) */}
      <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-lg p-4 sm:p-6 space-y-4 transition-colors">
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-slate-800 shadow-inner">
          <iframe
            key={selectedVideo.id + selectedVideo.youtubeId}
            src={`https://www.youtube.com/embed/${extractYoutubeId(selectedVideo.youtubeId)}?autoplay=0`}
            title={selectedVideo.title}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[11px] font-black rounded-lg ${getCategoryBadgeColor(selectedVideo.category)}`}>
                {selectedVideo.category}
              </span>
              <span className="flex items-center gap-1 text-[11px] font-bold text-slate-400">
                <Clock className="w-3 h-3" />
                {selectedVideo.duration}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                <Flame className="w-3 h-3" /> Vidéo active
              </span>
            </div>
            <h2 className="text-lg sm:text-xl font-black text-slate-850 dark:text-white">
              {selectedVideo.title}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed max-w-4xl">
              {selectedVideo.description}
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {selectedVideo.tags.map((tag, idx) => (
              <span key={`selected-tag-${tag}-${idx}`} className="px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-bold rounded-lg">
                #{tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* 3. BARRE DE RECHERCHE ET FILTRES */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-slate-900 p-3 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        
        {/* Onglets Filtres */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-2 sm:pb-0 scrollbar-none">
          {activeCategoriesList.map((cat, idx) => (
            <button
              key={`cat-filter-${cat}-${idx}`}
              type="button"
              onClick={() => setActiveTab(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer ${
                activeTab === cat
                  ? 'bg-[#1A2B6D] text-white shadow-md'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Barre de Recherche */}
        <div className="relative w-full sm:w-64">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher une démo..."
            className="w-full pl-9 pr-4 py-2 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#00b87c]/30 focus:border-[#00b87c]"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* 4. GRILLE DES VIDÉOS SECONDAIRES */}
      {filteredVideos.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl p-12 text-center border border-slate-200 dark:border-slate-800 space-y-3">
          <Video className="w-10 h-10 text-slate-300 dark:text-slate-600 mx-auto" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Aucune vidéo ne correspond à votre recherche</h4>
          <p className="text-xs text-slate-400">Essayez un autre mot-clé ou réinitialisez le filtre de catégorie.</p>
          <button
            type="button"
            onClick={() => { setActiveTab('Tous'); setSearchQuery(''); }}
            className="px-4 py-1.5 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-xs font-bold rounded-lg hover:bg-slate-200 transition-colors"
          >
            Réinitialiser les filtres
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredVideos.map((video) => {
            const isSelected = selectedVideo.id === video.id;
            const ytId = extractYoutubeId(video.youtubeId);

            return (
              <div
                key={video.id}
                onClick={() => {
                  setSelectedVideo(video);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`group cursor-pointer bg-white dark:bg-slate-900 rounded-2xl border transition-all duration-300 overflow-hidden flex flex-col justify-between ${
                  isSelected
                    ? 'border-[#00b87c] ring-2 ring-[#00b87c]/20 shadow-lg scale-[1.01]'
                    : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-md'
                }`}
              >
                {/* Miniature avec Overlay Play */}
                <div className="relative aspect-video bg-slate-900 overflow-hidden">
                  <img
                    src={`https://img.youtube.com/vi/${ytId}/mqdefault.jpg`}
                    alt={video.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                    loading="lazy"
                    onError={(e) => {
                      // Fallback si l'image YouTube n'est pas trouvée
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                  <div className="absolute inset-0 bg-slate-950/30 group-hover:bg-slate-950/10 transition-colors flex items-center justify-center">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center transition-transform group-hover:scale-110 shadow-lg ${
                        isSelected
                          ? 'bg-[#00b87c] text-white'
                          : 'bg-white/90 text-slate-800 group-hover:bg-[#00b87c] group-hover:text-white'
                      }`}
                    >
                      <Play className="w-4 h-4 fill-current ml-0.5" />
                    </div>
                  </div>

                  {/* Badge Durée */}
                  <span className="absolute bottom-2 right-2 px-2 py-0.5 bg-slate-950/80 text-white text-[10px] font-bold rounded-md backdrop-blur-sm">
                    {video.duration}
                  </span>
                </div>

                {/* Informations Médias */}
                <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md ${getCategoryBadgeColor(video.category)}`}>
                        {video.category}
                      </span>
                      {isSelected && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-[#00b87c]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> En lecture
                        </span>
                      )}
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-800 dark:text-slate-100 line-clamp-2 group-hover:text-[#1A2B6D] dark:group-hover:text-emerald-400 transition-colors">
                      {video.title}
                    </h3>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                      {video.description}
                    </p>
                  </div>

                  {/* Tags */}
                  <div className="flex items-center gap-1.5 pt-2 border-t border-slate-100 dark:border-slate-800 flex-wrap">
                    {video.tags.map((tag, idx) => (
                      <span key={`video-${video.id}-tag-${tag}-${idx}`} className="px-2 py-0.5 bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 text-[10px] font-medium rounded-md">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 5. CALL TO ACTION BAS DE PAGE */}
      <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 text-center text-white space-y-4 shadow-xl">
        <h3 className="text-lg sm:text-xl font-black">Vous voulez aller plus loin avec A-Zed Info ?</h3>
        <p className="text-xs text-slate-400 max-w-xl mx-auto">
          Débloquez l'accès complet à nos séries d'exercices corrigés, cours en direct, épreuves nationales et compilateur Python illimité.
        </p>
        <div>
          <button
            type="button"
            onClick={handleCtaClick}
            className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#00b87c] hover:bg-emerald-600 text-white font-bold text-xs rounded-xl shadow-lg transition-all cursor-pointer hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>Voir les Formules & Tarifs</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

    </div>
  );
};

export default StudentDemos;
