import React, { useState, useEffect } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  CheckSquare, 
  Sparkles, 
  HelpCircle, 
  Calendar,
  Grid,
  Video,
  PlayCircle,
  ShoppingBag,
  User as UserIcon,
  ChevronDown
} from 'lucide-react';
import { 
  IconMediaItem, 
  getStoredMediaItems, 
  getMenuIconMediaItem, 
  getCollapsedSidebarMediaItem,
  getCollapsedSidebarImagesList,
  getRandomCollapsedSidebarImage
} from './mediaIconsStore';

export interface StudentSidebarProps {
  currentTab?: string;
  setCurrentTab?: (tab: string) => void;
  selectedTrimestre?: string;
  setSelectedTrimestre?: (trim: string) => void;
  revisionSubTab?: 'enonce' | 'correction';
  setRevisionSubTab?: (sub: 'enonce' | 'correction') => void;
  isPremiumUser?: boolean;
  onUpgradeClick?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const StudentSidebar: React.FC<StudentSidebarProps> = ({
  currentTab = 'cours',
  setCurrentTab,
  selectedTrimestre = '1ere trimestre',
  setSelectedTrimestre,
  revisionSubTab = 'enonce',
  setRevisionSubTab,
  isPremiumUser = false,
  onUpgradeClick,
  isCollapsed: propIsCollapsed,
  onToggleCollapse,
}) => {
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : internalCollapsed;

  const [mediaItems, setMediaItems] = useState<IconMediaItem[]>([]);
  const [expandedSection, setExpandedSection] = useState<string | null>('cours');
  const [selectedCollapsedImage, setSelectedCollapsedImage] = useState<string>(() => getRandomCollapsedSidebarImage());

  const reloadMedia = () => {
    const stored = getStoredMediaItems();
    setMediaItems(stored);
    if (!selectedCollapsedImage) {
      setSelectedCollapsedImage(getRandomCollapsedSidebarImage(stored));
    }
  };

  useEffect(() => {
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
  }, []);

  const handleToggle = () => {
    if (!isCollapsed) {
      // Au moment de fermer le menu, sélectionner une image aléatoire
      try {
        const storedList = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('azed_collapsed_images_list') || '[]') : [];
        if (Array.isArray(storedList) && storedList.length > 0) {
          const randomIndex = Math.floor(Math.random() * storedList.length);
          setSelectedCollapsedImage(storedList[randomIndex]);
        } else {
          setSelectedCollapsedImage(getRandomCollapsedSidebarImage(mediaItems));
        }
      } catch {
        setSelectedCollapsedImage(getRandomCollapsedSidebarImage(mediaItems));
      }
    }
    if (onToggleCollapse) {
      onToggleCollapse();
    } else {
      setInternalCollapsed(!internalCollapsed);
    }
  };

  // Récupération des icônes/GIF configurés dans l'admin
  const fichesIcon = getMenuIconMediaItem('fiches', mediaItems);
  const devoirsIcon = getMenuIconMediaItem('devoirs', mediaItems);
  const correctionsIcon = getMenuIconMediaItem('corrections', mediaItems);
  const revisionIcon = getMenuIconMediaItem('revision', mediaItems);
  const quizIcon = getMenuIconMediaItem('quiz', mediaItems);
  const collapsedVisual = getCollapsedSidebarMediaItem(mediaItems);

  const collapsedImageUrl = collapsedVisual?.url || 
    localStorage.getItem('azed_collapsed_img') || 
    'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif';

  // Helper pour afficher le visuel admin ou l'icône Lucide
  const renderItemVisual = (
    item: IconMediaItem | undefined, 
    DefaultIcon: React.ElementType, 
    defaultColorClass: string = 'text-emerald-600'
  ) => {
    if (item && item.visible && item.url) {
      return (
        <img
          src={item.url}
          alt={item.name}
          style={{ width: `${Math.min(item.size || 20, 24)}px`, height: `${Math.min(item.size || 20, 24)}px` }}
          className={`object-contain shrink-0 ${item.shape || 'rounded-md'}`}
        />
      );
    }
    return <DefaultIcon className={`w-4 h-4 shrink-0 ${defaultColorClass}`} />;
  };

  const handleNav = (tab: string, trim?: string) => {
    if (setCurrentTab) setCurrentTab(tab);
    if (trim && setSelectedTrimestre) setSelectedTrimestre(trim);
  };

  return (
    <aside 
      className={`bg-white border border-slate-200 rounded-2xl shadow-sm relative transition-all duration-300 select-none text-left shrink-0 ${
        isCollapsed 
          ? 'w-[314px] h-[1043.86px] min-h-[1043.86px] p-0 overflow-visible flex items-center justify-center' 
          : 'w-[314px] p-4 flex flex-col overflow-visible'
      }`}
    >
      {/* BOUTON FLÈCHE POUR RÉDUIRE / DÉPLIER LE MENU */}
      <button
        type="button"
        onClick={handleToggle}
        className="absolute -right-3 top-6 z-40 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-500 rounded-full p-1.5 shadow-md hover:bg-slate-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
        title={isCollapsed ? 'Déplier le menu latéral' : 'Réduire le menu latéral'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* ========================================================================= */}
      {/* ÉTAT 1 : MENU DÉPLIÉ AVEC ICÔNES DYNAMIQUES ADMIN                       */}
      {/* ========================================================================= */}
      {!isCollapsed ? (
        <div className="space-y-5 w-full">
          
          {/* Header profil élève */}
          <div className="pb-3 border-b border-slate-100 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">
                MENU ÉLÈVE
              </span>
              <span className="text-xs font-black text-slate-800">
                A-Zed Sciences
              </span>
            </div>
            <span className={`text-[10px] font-black px-2.5 py-0.5 rounded-full border ${
              isPremiumUser 
                ? 'bg-amber-50 text-amber-700 border-amber-200' 
                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
            }`}>
              {isPremiumUser ? '👑 Premium' : '⭐ Freemium'}
            </span>
          </div>

          {/* Section 1 : Apprentissage & Révisions */}
          <div className="space-y-1.5">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider px-1 block">
              APPRENTISSAGE & RÉVISIONS
            </span>

            {/* 1. Fiches & cours */}
            <div>
              <button
                type="button"
                onClick={() => {
                  handleNav('cours');
                  setExpandedSection(expandedSection === 'cours' ? null : 'cours');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentTab === 'cours'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderItemVisual(fichesIcon, Video, currentTab === 'cours' ? 'text-white' : 'text-emerald-600')}
                  <span className="truncate">Fiches & cours</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSection === 'cours' ? 'rotate-180' : ''}`} />
              </button>

              {/* Sous-menus trimestres cours */}
              {expandedSection === 'cours' && (
                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-emerald-500/40">
                  {['1ere trimestre', '2eme trimestre', '3eme trimestre'].map((tName, i) => (
                    <button
                      key={tName}
                      type="button"
                      onClick={() => handleNav('cours', tName)}
                      className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        currentTab === 'cours' && selectedTrimestre === tName
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      {`${i + 1}er Trimestre`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 2. Devoirs & Exercices */}
            <div>
              <button
                type="button"
                onClick={() => {
                  handleNav('devoirs');
                  setExpandedSection(expandedSection === 'devoirs' ? null : 'devoirs');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentTab === 'devoirs'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderItemVisual(devoirsIcon, BookOpen, currentTab === 'devoirs' ? 'text-white' : 'text-emerald-600')}
                  <span className="truncate">Devoirs & Exercices</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSection === 'devoirs' ? 'rotate-180' : ''}`} />
              </button>

              {expandedSection === 'devoirs' && (
                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-emerald-500/40">
                  {['1ere trimestre', '2eme trimestre', '3eme trimestre'].map((tName, i) => (
                    <button
                      key={tName}
                      type="button"
                      onClick={() => handleNav('devoirs', tName)}
                      className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        currentTab === 'devoirs' && selectedTrimestre === tName
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      {`${i + 1}er Trimestre`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Zone Correction */}
            <div>
              <button
                type="button"
                onClick={() => {
                  handleNav('corrections');
                  setExpandedSection(expandedSection === 'corrections' ? null : 'corrections');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentTab === 'corrections'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderItemVisual(correctionsIcon, FileText, currentTab === 'corrections' ? 'text-white' : 'text-emerald-600')}
                  <span className="truncate">Zone Correction</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSection === 'corrections' ? 'rotate-180' : ''}`} />
              </button>

              {expandedSection === 'corrections' && (
                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-emerald-500/40">
                  {['1ere trimestre', '2eme trimestre', '3eme trimestre'].map((tName, i) => (
                    <button
                      key={tName}
                      type="button"
                      onClick={() => handleNav('corrections', tName)}
                      className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                        currentTab === 'corrections' && selectedTrimestre === tName
                          ? 'bg-[#2563EB] text-white shadow-2xs'
                          : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                      }`}
                    >
                      {`${i + 1}er Trimestre`}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* 4. Révision */}
            <div>
              <button
                type="button"
                onClick={() => {
                  handleNav('revision');
                  if (setRevisionSubTab) setRevisionSubTab('enonce');
                  setExpandedSection(expandedSection === 'revision' ? null : 'revision');
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                  currentTab === 'revision'
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                    : 'text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200/60'
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {renderItemVisual(revisionIcon, Sparkles, currentTab === 'revision' ? 'text-white' : 'text-amber-500')}
                  <span className="truncate">Révision</span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${expandedSection === 'revision' ? 'rotate-180' : ''}`} />
              </button>

              {expandedSection === 'revision' && (
                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-amber-500/40">
                  <button
                    type="button"
                    onClick={() => {
                      handleNav('revision');
                      if (setRevisionSubTab) setRevisionSubTab('enonce');
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between ${
                      currentTab === 'revision' && revisionSubTab === 'enonce'
                        ? 'bg-[#2563EB] text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <span>Énoncé</span>
                    <span className="text-[8px] px-1 bg-amber-100 text-amber-800 rounded font-black">Live</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleNav('revision');
                      if (setRevisionSubTab) setRevisionSubTab('correction');
                    }}
                    className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between ${
                      currentTab === 'revision' && revisionSubTab === 'correction'
                        ? 'bg-[#2563EB] text-white shadow-2xs'
                        : 'text-slate-500 hover:text-slate-900 hover:bg-slate-100/70'
                    }`}
                  >
                    <span>Correction</span>
                    <span className="text-[8px] px-1 bg-emerald-100 text-emerald-800 rounded font-black">Corr</span>
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Section 2 : Entraînement & Outils */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider px-1 block">
              ENTRAÎNEMENT & OUTILS
            </span>

            {/* Quiz Interactifs */}
            <button
              type="button"
              onClick={() => handleNav('qcm')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentTab === 'qcm'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                {renderItemVisual(quizIcon, Grid, currentTab === 'qcm' ? 'text-white' : 'text-emerald-600')}
                <span className="truncate">Quiz Interactifs</span>
              </div>
            </button>

            {/* Calendrier & Live */}
            <button
              type="button"
              onClick={() => handleNav('calendrier')}
              className={`w-full flex items-center justify-between p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentTab === 'calendrier'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-700 hover:bg-slate-50 border border-transparent hover:border-slate-200/60'
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Calendar className={`w-4 h-4 ${currentTab === 'calendrier' ? 'text-white' : 'text-emerald-600'}`} />
                <span className="truncate">Calendrier & Live</span>
              </div>
            </button>
          </div>

          {/* Section 3 : Espace Personnel */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100">
            <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider px-1 block">
              ESPACE PERSONNEL
            </span>

            {/* Démo & Extraits */}
            <button
              type="button"
              onClick={() => handleNav('demos')}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentTab === 'demos'
                  ? 'bg-purple-600 text-white shadow-sm shadow-purple-600/20'
                  : 'text-slate-700 hover:bg-purple-50 hover:text-purple-700'
              }`}
            >
              <PlayCircle className="w-4 h-4 shrink-0" />
              <span>Démo & Extraits</span>
            </button>

            {/* Shop / Abonnements */}
            <button
              type="button"
              onClick={() => {
                if (onUpgradeClick) {
                  onUpgradeClick();
                } else {
                  handleNav('shop');
                }
              }}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentTab === 'shop'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <ShoppingBag className="w-4 h-4 shrink-0" />
              <span>Abonnements / Shop</span>
            </button>

            {/* Mon Espace Profil */}
            <button
              type="button"
              onClick={() => handleNav('profile')}
              className={`w-full flex items-center gap-2.5 p-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                currentTab === 'profile'
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-700 hover:bg-slate-50'
              }`}
            >
              <UserIcon className="w-4 h-4 shrink-0" />
              <span>Mon Espace Profil</span>
            </button>
          </div>
        </div>
      ) : (
        /* ========================================================================= */
        /* ÉTAT 2 : MENU RÉDUIT (IMAGE / GIF DYNAMIQUE CONFIGURÉ PAR L'ADMIN)       */
        /* ========================================================================= */
        <div 
          onClick={handleToggle}
          className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl cursor-pointer"
          title="Cliquez pour déplier le menu"
        >
          <img 
            src={selectedCollapsedImage || collapsedImageUrl} 
            alt="Visuel Menu Réduit" 
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      )}
    </aside>
  );
};

export default StudentSidebar;
