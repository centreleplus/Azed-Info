import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthContext';
import { useRealtimeSync } from '../lib/useRealtimeSync';
import { 
  IconMediaItem, 
  getStoredMediaItems, 
  getBannerMediaItem,
  getMenuIconMediaItem 
} from './mediaIconsStore';
import { BookOpen, FileText, CheckSquare, Sparkles, Grid, ArrowRight, Video } from 'lucide-react';
import { BADGE_COLORS } from '../constants/packages';

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
  const { user, setUser } = useAuth();
  const [mediaItems, setMediaItems] = useState<IconMediaItem[]>(propMediaItems || []);
  const [selectedCategory, setSelectedCategory] = useState('📚 Fiches & cours');
  const [selectedPeriod, setSelectedPeriod] = useState('1er Trimestre');

  useEffect(() => {
    const fetchStudentProfile = async () => {
      try {
        const activeUser = user || (localStorage.getItem("current_user") ? JSON.parse(localStorage.getItem("current_user")!) : null);
        if (!activeUser?.id && !activeUser?.email) return;
        const res = await fetch("/api/auth/me", {
          headers: {
            "x-user-id": activeUser.id || "",
            "x-session-id": activeUser.activeSessionId || localStorage.getItem("active_session_id") || ""
          }
        });
        if (res.ok) {
          const data = await res.json();
          if (data && data.user && setUser) {
            setUser((prev: any) => ({ ...prev, ...data.user }));
          }
        }
      } catch (err) {
        console.error("Erreur de rafraîchissement du profil élève", err);
      }
    };
    fetchStudentProfile();
  }, []);

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
    { key: 'demos', label: '🎬 Démo & Extraits', tab: 'demos', defaultIcon: Video },
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
                if (onNavigateToTab) {
                  onNavigateToTab(cat.tab, selectedPeriod);
                } else if (cat.tab === 'demos') {
                  window.location.hash = '#/student/demos';
                } else if (onNavigateToCourse) {
                  onNavigateToCourse(cat.label);
                }
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

      {/* 4. BIBLIOTHÈQUE STRICTEMENT FILTRÉE DE L'ESPACE ÉLÈVE (GESTION DOCUMENTS) */}
      <StudentDocumentLibrary />
    </div>
  );
};

export const StudentDocumentLibrary: React.FC = () => {
  const { user } = useAuth();
  const [validatedDocs, setValidatedDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const loadDocs = useCallback(() => {
    const activeBadge = user?.activeBadge || user?.badge || (user as any)?.statusBadge || user?.userCategory || user?.status || 'Freemium';
    fetch('/api/student/documents', {
      credentials: 'include',
      headers: {
        'x-user-badge': activeBadge,
        'x-user-active-badge': activeBadge,
        'x-user-grade': user?.grade || user?.level || '',
        'x-user-section': user?.section || ''
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (data && data.success && Array.isArray(data.documents)) {
          const cleanDocs = data.documents.filter(
            (doc: any) => doc.sourceModule === 'GESTION_DOCUMENTS' && !doc.isInternalAdminOnly
          );
          setValidatedDocs(cleanDocs);
        } else if (Array.isArray(data)) {
          const cleanDocs = data.filter(
            (doc: any) => doc.sourceModule === 'GESTION_DOCUMENTS' && !doc.isInternalAdminOnly
          );
          setValidatedDocs(cleanDocs);
        }
      })
      .catch((err) => {
        console.error("Erreur de récupération des documents élèves :", err);
      })
      .finally(() => setLoading(false));
  }, [user?.activeBadge, user?.badge, user?.grade, user?.section]);

  useEffect(() => {
    loadDocs();
  }, [loadDocs, user?.activeBadge]);

  useRealtimeSync((msg) => {
    if (
      msg.type === "DOCUMENT_UPDATED_GLOBAL" ||
      msg.type === "DOCUMENT_UPDATED" ||
      msg.type === "COURSES_UPDATED" ||
      msg.type === "COURSE_CREATED" ||
      msg.type === "COURSE_DELETED"
    ) {
      loadDocs();
    }
  });

  if (loading) {
    return (
      <div className="p-8 text-center text-slate-500 font-bold bg-white rounded-2xl border border-slate-200">
        Chargement de vos documents...
      </div>
    );
  }

  return (
    <div className="space-y-4 pt-4 border-t border-slate-200">
      <div className="flex items-center justify-between">
        <h3 className="font-extrabold text-sm text-slate-800 flex items-center gap-2">
          <span>📚 Ressources & Documents Validés</span>
          <span className="text-[10px] px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-full font-bold">
            Gestion Documents
          </span>
        </h3>
        <span className="text-xs text-slate-400 font-bold">
          {validatedDocs.length} document(s)
        </span>
      </div>

      <div className="student-docs-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {validatedDocs.length === 0 ? (
          <div className="col-span-full p-8 text-center text-slate-500 font-bold bg-white rounded-2xl border border-dashed border-slate-300">
            Aucun document disponible dans votre espace pour le moment.
          </div>
        ) : (
          validatedDocs.map((doc) => (
            <div 
              key={doc._id || doc.id} 
              className="doc-card bg-white rounded-2xl border border-slate-200 p-4 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between space-y-3"
            >
              <div className="space-y-1.5">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span className="badge text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                    {doc.category || 'Fiches & cours'}
                  </span>
                  <div className="flex flex-wrap gap-1 items-center">
                    {(() => {
                      const badges: string[] = Array.isArray(doc.allowedBadges) && doc.allowedBadges.length > 0
                        ? doc.allowedBadges
                        : Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
                        ? doc.allowedTiers
                        : [doc.requiredBadge || doc.badgeType || 'Freemium'];

                      return badges.map((badge: string) => {
                        const norm = (badge || '').trim();
                        return (
                          <span
                            key={badge}
                            className={`badge text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-md ${
                              BADGE_COLORS[norm] || 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {badge}
                          </span>
                        );
                      });
                    })()}
                  </div>
                </div>
                <h4 className="font-bold text-slate-900 text-sm line-clamp-2 leading-snug">
                  {doc.title}
                </h4>
                {doc.subMenu && (
                  <p className="text-[11px] text-slate-500 line-clamp-1 font-medium">
                    📂 {doc.subMenu}
                  </p>
                )}
              </div>

              {doc.fileUrl ? (
                <a 
                  href={doc.fileUrl} 
                  target="_blank" 
                  rel="noreferrer"
                  className="mt-2 w-full py-2 bg-slate-900 hover:bg-emerald-600 text-white rounded-xl text-xs font-bold text-center transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span>Télécharger / Consulter</span>
                  <ArrowRight size={13} />
                </a>
              ) : (
                <div className="mt-2 w-full py-2 bg-slate-100 text-slate-400 rounded-xl text-xs font-bold text-center">
                  Consulter
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default StudentDashboard;
