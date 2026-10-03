import React, { useState, useContext, useEffect } from 'react';
import { UserContext, ZED_BADGE_EVENT, ZED_BADGE_SYNC_EVENT } from './AuthContext';
import { ZED_USER_DATA_SYNCED_EVENT } from '../services/UserService';
import { 
  ChevronLeft, 
  ChevronRight, 
  BookOpen, 
  FileText, 
  CheckCircle2, 
  RotateCcw, 
  HelpCircle, 
  Calendar,
  FolderDown,
  ShoppingBag,
  User,
  ChevronDown
} from 'lucide-react';
import { 
  IconMediaItem, 
  applyCacheBusting 
} from './mediaIconsStore';
import { useSidebarVisuals } from '../hooks/useSidebarVisuals';
import { UniversalBadge } from './UniversalBadge';
import { normalizePackName } from '../constants/packages';

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
  activePack?: string;
  userCategory?: string;
  studentName?: string;
}

const ALLOWED_BADGES = ['Freemium', 'Essentiel', 'Live +', 'Révision +', 'Intégrale'];

const extractBadge = (u: any, fallbackProp1?: string, fallbackProp2?: string) => {
  if (u) {
    if (ALLOWED_BADGES.includes(u.activePackage)) return u.activePackage;
    if (ALLOWED_BADGES.includes(u.badge)) return u.badge;
    if (ALLOWED_BADGES.includes(u.statusBadge)) return u.statusBadge;
    if (ALLOWED_BADGES.includes(u.subscriptionTier)) return u.subscriptionTier;
    if (ALLOWED_BADGES.includes(u.userCategory)) return u.userCategory;
    if (ALLOWED_BADGES.includes(u.status)) return u.status;
    if (u.activePackages && ALLOWED_BADGES.includes(u.activePackages[0])) return u.activePackages[0];
  }
  if (fallbackProp1 && ALLOWED_BADGES.includes(fallbackProp1)) return fallbackProp1;
  if (fallbackProp2 && ALLOWED_BADGES.includes(fallbackProp2)) return fallbackProp2;
  return 'Freemium';
};

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
  activePack,
  userCategory,
  studentName
}) => {
  const auth = useContext(UserContext);
  const user = auth?.user;
  const [localBadge, setLocalBadge] = useState<string>(() => extractBadge(user, activePack, userCategory));

  useEffect(() => {
    const extracted = extractBadge(user, activePack, userCategory);
    if (extracted) {
      setLocalBadge(extracted);
    }
  }, [user, activePack, userCategory]);

  useEffect(() => {
    const handleSync = (e: any) => {
      const newBadge = e.detail?.badge || e.detail?.newBadge || e.detail?.subscriptionTier;
      if (newBadge) {
        setLocalBadge(newBadge);
      }
    };
    window.addEventListener(ZED_USER_DATA_SYNCED_EVENT as any, handleSync);
    window.addEventListener(ZED_BADGE_EVENT as any, handleSync);
    window.addEventListener(ZED_BADGE_SYNC_EVENT as any, handleSync);
    return () => {
      window.removeEventListener(ZED_USER_DATA_SYNCED_EVENT as any, handleSync);
      window.removeEventListener(ZED_BADGE_EVENT as any, handleSync);
      window.removeEventListener(ZED_BADGE_SYNC_EVENT as any, handleSync);
    };
  }, []);

  const {
    mediaItems,
    currentCollapsedImage,
    isCollapsed: hookCollapsed,
    toggleCollapse: hookToggleCollapse,
    getMenuIcon,
  } = useSidebarVisuals(propIsCollapsed ?? false);

  const isCollapsed = propIsCollapsed !== undefined ? propIsCollapsed : hookCollapsed;
  const [expandedSection, setExpandedSection] = useState<string | null>('cours');

  const handleToggle = () => {
    if (onToggleCollapse) {
      hookToggleCollapse();
      onToggleCollapse();
    } else {
      hookToggleCollapse();
    }
  };

  // Récupération des icônes/GIF configurés dynamiquement avec synchro backend
  const fichesIcon = getMenuIcon('fiches');
  const devoirsIcon = getMenuIcon('devoirs');
  const correctionsIcon = getMenuIcon('corrections');
  const revisionIcon = getMenuIcon('revision');
  const quizIcon = getMenuIcon('quiz');

  // Helper pour afficher le visuel admin ou l'icône Lucide
  const renderItemVisual = (
    item: IconMediaItem | undefined, 
    DefaultIcon: React.ElementType, 
    defaultColorClass: string = 'text-emerald-600'
  ) => {
    if (item && item.visible && item.url) {
      const srcUrl = applyCacheBusting(item.url, item.updatedAt);
      return (
        <img
          src={srcUrl}
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
                {studentName || "A-Zed Sciences"}
              </span>
            </div>
            {(() => {
              const currentBadge = (user?.activeBadge || localBadge || user?.badge || activePack || userCategory || 'FREEMIUM').toUpperCase().trim();
              const badgeStyle = 
                currentBadge === 'FREEMIUM' ? 'bg-gray-200 text-gray-800 border-gray-300' :
                currentBadge === 'ESSENTIEL' ? 'bg-blue-100 text-blue-800 border-blue-200' :
                currentBadge === 'LIVE +' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
                currentBadge === 'RÉVISION +' ? 'bg-purple-100 text-purple-800 border-purple-200' :
                'bg-amber-100 text-amber-800 border-amber-200';

              return (
                <div className={`badge-pill px-2.5 py-1 text-xs font-bold rounded-md uppercase tracking-wider border shadow-2xs ${badgeStyle}`}>
                  {localBadge || user?.badge || activePack || 'FREEMIUM'}
                </div>
              );
            })()}
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
                  {renderItemVisual(fichesIcon, BookOpen, currentTab === 'cours' ? 'text-white' : 'text-emerald-600')}
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
                      {i === 0 ? "1er Trimestre" : i === 1 ? "2ème Trimestre" : "3ème Trimestre"}
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
                  {renderItemVisual(devoirsIcon, FileText, currentTab === 'devoirs' ? 'text-white' : 'text-emerald-600')}
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
                      {i === 0 ? "1er Trimestre" : i === 1 ? "2ème Trimestre" : "3ème Trimestre"}
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
                  {renderItemVisual(correctionsIcon, CheckCircle2, currentTab === 'corrections' ? 'text-white' : 'text-emerald-600')}
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
                      {i === 0 ? "1er Trimestre" : i === 1 ? "2ème Trimestre" : "3ème Trimestre"}
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
                  {renderItemVisual(revisionIcon, RotateCcw, currentTab === 'revision' ? 'text-white' : 'text-amber-500')}
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
                {renderItemVisual(quizIcon, HelpCircle, currentTab === 'qcm' ? 'text-white' : 'text-emerald-600')}
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
                  ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/20'
                  : 'text-slate-700 hover:bg-emerald-50 hover:text-emerald-700'
              }`}
            >
              <FolderDown className="w-4 h-4 shrink-0" />
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
              <User className="w-4 h-4 shrink-0" />
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
            src={currentCollapsedImage || 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif'} 
            alt="Visuel Menu Réduit" 
            className="w-full h-full object-cover rounded-2xl"
          />
        </div>
      )}
    </aside>
  );
};

export default StudentSidebar;
