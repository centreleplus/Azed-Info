import React, { useState, useEffect } from 'react';
import { 
  IconMediaItem, 
  getStoredMediaItems, 
  getBannerMediaItem,
  getMenuIconMediaItem 
} from './mediaIconsStore';
import { BookOpen, FileText, CheckSquare, Sparkles, Grid, ArrowRight } from 'lucide-react';

export interface StudentDashboardProps {
  mediaItems?: IconMediaItem[];
  onNavigateToCourse?: (matiereName: string) => void;
  onNavigateToTab?: (tab: string, trim?: string) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ 
  mediaItems: propMediaItems,
  onNavigateToCourse,
  onNavigateToTab
}) => {
  const [mediaItems, setMediaItems] = useState<IconMediaItem[]>(propMediaItems || []);
  const [selectedCategory, setSelectedCategory] = useState('📚 Fiches & cours');
  const [selectedPeriod, setSelectedPeriod] = useState('1er Trimestre');

  const reloadMedia = () => {
    setMediaItems(getStoredMediaItems());
  };

  useEffect(() => {
    if (propMediaItems && propMediaItems.length > 0) {
      setMediaItems(propMediaItems);
      return;
    }

    reloadMedia();

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setMediaItems(e.detail);
      } else {
        reloadMedia();
      }
    };

    window.addEventListener('media-icons-updated', handleUpdate);
    window.addEventListener('azed_assets_updated', reloadMedia);
    window.addEventListener('azed_config_updated', reloadMedia);
    window.addEventListener('storage', reloadMedia);

    return () => {
      window.removeEventListener('media-icons-updated', handleUpdate);
      window.removeEventListener('azed_assets_updated', reloadMedia);
      window.removeEventListener('azed_config_updated', reloadMedia);
      window.removeEventListener('storage', reloadMedia);
    };
  }, [propMediaItems]);

  const categories = [
    { key: 'fiches', label: '📚 Fiches & cours', tab: 'cours', defaultIcon: BookOpen },
    { key: 'devoirs', label: '📝 Devoirs & Exercices', tab: 'devoirs', defaultIcon: BookOpen },
    { key: 'corrections', label: '✅ Zone Correction', tab: 'corrections', defaultIcon: FileText },
    { key: 'revision', label: '🎯 Révision', tab: 'revision', defaultIcon: Sparkles },
    { key: 'quiz', label: '⚡ Quiz Interactifs', tab: 'qcm', defaultIcon: Grid },
  ];

  const periods = ['1er Trimestre', '2ème Trimestre', '3ème Trimestre', 'Énoncé Live'];

  // 1. Récupération de la Bannière GIF Accueil configurée par l'Admin
  const bannerItem = getBannerMediaItem(mediaItems);
  const bannerUrl = (bannerItem && bannerItem.visible && bannerItem.url) 
    ? bannerItem.url 
    : (localStorage.getItem('azed_banner_img') || "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0ZWF4OHo4ZjlsM3RocmEzOHc5MGVwYTY3N2xsMnRpdHJ2bThydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/kL1yMSpA0b2S33K16C/giphy.gif");

  return (
    <div className="p-4 sm:p-6 bg-slate-50 min-h-screen space-y-6 text-left">
      
      {/* 1. BANNIÈRE DYNAMIQUE AVEC GIF D'ACCUEIL CONFIGURÉ PAR L'ADMIN */}
      <div className="relative overflow-hidden bg-gradient-to-r from-emerald-600 via-teal-700 to-emerald-800 rounded-3xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row items-center justify-between gap-6">
        
        {/* Contenu textuel */}
        <div className="space-y-3 z-10 max-w-xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-wider">
            <span className="w-2 h-2 rounded-full bg-emerald-300 animate-ping" />
            <span>ESPACE ÉLÈVE PERSONNALISÉ</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
            Prêt pour votre réussite ?
          </h1>

          <p className="text-xs sm:text-sm text-emerald-100 font-medium leading-relaxed max-w-lg">
            Retrouvez vos cours trimestriels, vos devoirs interactifs et vos ressources d'excellence synchronisées en direct.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => {
                if (onNavigateToTab) onNavigateToTab('cours');
              }}
              className="px-4 py-2 bg-white text-emerald-800 hover:bg-emerald-50 rounded-xl text-xs font-black shadow-sm transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            >
              <span>Accéder aux cours</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Visuel GIF Dynamique Admin */}
        <div className="w-full sm:w-56 h-36 relative z-10 shrink-0 flex items-center justify-center bg-white/10 backdrop-blur-xs rounded-2xl p-2 border border-white/20">
          <img
            src={bannerUrl}
            alt={bannerItem?.name || "Bannière GIF Accueil"}
            className={`w-full h-full object-contain max-h-32 ${bannerItem?.shape || 'rounded-xl'}`}
            style={{
              maxHeight: bannerItem?.size ? `${Math.min(bannerItem.size * 1.5, 140)}px` : '130px'
            }}
          />
        </div>
      </div>
      
      {/* 2. BARRE DE SÉLECTION DES TRIMESTRES / PÉRIODES */}
      <div className="bg-white border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 shadow-xs">
        <div className="flex flex-wrap items-center gap-2">
          {periods.map((period) => (
            <button
              key={period}
              type="button"
              onClick={() => setSelectedPeriod(period)}
              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                selectedPeriod === period
                  ? 'bg-slate-900 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {period}
            </button>
          ))}
        </div>

        <span className="text-[11px] font-bold text-slate-400 px-2">
          {mediaItems.filter(i => i.visible).length} visuels actifs
        </span>
      </div>

      {/* 3. GRILLE DES RUBRIQUES AVEC ICÔNES DYNAMIQUES */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => {
          const matchedItem = mediaItems.find(
            (item) => item.visible && item.category.includes(cat.label.replace(/^[^\s]+\s/, ''))
          ) || getMenuIconMediaItem(cat.key as any, mediaItems);

          const isSelected = selectedCategory === cat.label;
          const DefaultIcon = cat.defaultIcon;

          return (
            <div
              key={cat.key}
              onClick={() => {
                setSelectedCategory(cat.label);
                if (onNavigateToTab) onNavigateToTab(cat.tab);
                if (onNavigateToCourse) onNavigateToCourse(cat.label);
              }}
              className={`p-4 rounded-2xl border-2 transition-all cursor-pointer flex items-center gap-4 ${
                isSelected
                  ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              {/* Affichage visuel dynamique ou fallback */}
              <div className="w-14 h-14 bg-slate-100 rounded-xl flex items-center justify-center p-2 shrink-0 overflow-hidden border border-slate-200/80">
                {matchedItem && matchedItem.visible && matchedItem.url ? (
                  <img
                    src={matchedItem.url}
                    alt={matchedItem.name}
                    style={{ 
                      width: `${Math.min(matchedItem.size, 52)}px`, 
                      height: `${Math.min(matchedItem.size, 52)}px` 
                    }}
                    className={`object-contain ${matchedItem.shape || 'rounded-lg'}`}
                  />
                ) : (
                  <DefaultIcon className="w-6 h-6 text-emerald-600" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                <h3 className="text-xs font-black text-slate-800 truncate">{cat.label}</h3>
                <p className="text-[10px] text-slate-400 font-bold mt-0.5">{selectedPeriod}</p>
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StudentDashboard;
