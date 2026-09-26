import React from 'react';
import { ChevronLeft, ChevronRight, BookOpen, FileText, CheckSquare, Sparkles, HelpCircle, Calendar } from 'lucide-react';
import { useSidebarVisuals } from '../hooks/useSidebarVisuals';
import { applyCacheBusting } from './mediaIconsStore';

export const StudentSidebarNavigation: React.FC = () => {
  const {
    isCollapsed,
    toggleCollapse,
    currentCollapsedImage,
    getMenuIcon,
  } = useSidebarVisuals(false);

  const fichesIcon = getMenuIcon('fiches');
  const devoirsIcon = getMenuIcon('devoirs');
  const correctionsIcon = getMenuIcon('corrections');
  const revisionIcon = getMenuIcon('revision');
  const quizIcon = getMenuIcon('quiz');

  return (
    <aside 
      className={`bg-white border border-slate-200/90 rounded-2xl p-4 shadow-sm transition-all duration-300 flex flex-col relative select-none overflow-visible ${
        isCollapsed ? 'w-[314px]' : 'w-[314px]'
      }`}
    >
      {/* BOUTON FLÈCHE POUR RÉDUIRE / AGRANDIR */}
      <button
        type="button"
        onClick={toggleCollapse}
        className="absolute -right-3 top-6 z-40 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 rounded-full p-1.5 shadow-md hover:bg-slate-50 flex items-center justify-center hover:scale-110 transition-all cursor-pointer"
        title={isCollapsed ? 'Déplier le menu' : 'Réduire le menu'}
      >
        {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
      </button>

      {/* OPTION A : MENU DÉPLIÉ / ÉTENDU */}
      {!isCollapsed ? (
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">MENU APPRENTI</span>
              <div className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full inline-block mt-0.5">
                Freemium
              </div>
            </div>
          </div>

          {/* LISTE DES MENUS DE NAVIGATION */}
          <div className="space-y-4">
            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">APPRENTISSAGE & RÉVISIONS</span>
              <div className="mt-2 space-y-1.5">
                <button type="button" className="w-full flex items-center justify-between p-2.5 rounded-xl bg-emerald-500 text-white font-extrabold text-xs shadow-sm cursor-pointer">
                  <div className="flex items-center gap-2">
                    {fichesIcon?.url ? (
                      <img src={applyCacheBusting(fichesIcon.url, fichesIcon.updatedAt)} alt="" className="w-4 h-4 object-contain rounded" />
                    ) : (
                      <BookOpen className="w-4 h-4" />
                    )}
                    <span>Fiches & cours</span>
                  </div>
                </button>

                <button type="button" className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-xs border border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {devoirsIcon?.url ? (
                      <img src={applyCacheBusting(devoirsIcon.url, devoirsIcon.updatedAt)} alt="" className="w-4 h-4 object-contain rounded" />
                    ) : (
                      <FileText className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>Devoirs & Exercices</span>
                  </div>
                </button>

                <button type="button" className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-xs border border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {correctionsIcon?.url ? (
                      <img src={applyCacheBusting(correctionsIcon.url, correctionsIcon.updatedAt)} alt="" className="w-4 h-4 object-contain rounded" />
                    ) : (
                      <CheckSquare className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>Zone Correction</span>
                  </div>
                </button>

                <button type="button" className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-xs border border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {revisionIcon?.url ? (
                      <img src={applyCacheBusting(revisionIcon.url, revisionIcon.updatedAt)} alt="" className="w-4 h-4 object-contain rounded" />
                    ) : (
                      <Sparkles className="w-4 h-4 text-amber-500" />
                    )}
                    <span>Révision</span>
                  </div>
                </button>
              </div>
            </div>

            <div>
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">ENTRAÎNEMENT & OUTILS</span>
              <div className="mt-2 space-y-1.5">
                <button type="button" className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-xs border border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    {quizIcon?.url ? (
                      <img src={applyCacheBusting(quizIcon.url, quizIcon.updatedAt)} alt="" className="w-4 h-4 object-contain rounded" />
                    ) : (
                      <HelpCircle className="w-4 h-4 text-emerald-600" />
                    )}
                    <span>Quiz Interactifs</span>
                  </div>
                </button>
                <button type="button" className="w-full flex items-center justify-between p-2.5 rounded-xl text-slate-700 hover:bg-slate-50 font-bold text-xs border border-slate-100 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-emerald-600" />
                    <span>Calendrier & Live</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* OPTION B : MENU RÉDUIT -> AFFICHAGE EN ALTERNANCE DE L'IMAGE ADMIN */
        <div 
          onClick={toggleCollapse}
          className="flex flex-col items-center justify-center h-full py-4 space-y-4 cursor-pointer"
        >
          <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center p-1 border border-emerald-200">
            <span className="text-xs font-black text-emerald-700">AZ</span>
          </div>

          {/* VISUEL / GIF PARAMÉTRÉ DANS L'ADMIN POUR LE MENU RÉDUIT */}
          <div className="w-full py-2 flex flex-col items-center justify-center">
            <div className="relative group p-1 bg-slate-50 border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
              <img
                src={currentCollapsedImage}
                alt="Visuel Promo Menu Réduit"
                className="w-14 h-auto max-h-64 object-cover rounded-xl transition-transform duration-300 group-hover:scale-105"
              />
            </div>
            <span className="text-[9px] font-extrabold text-slate-400 mt-2 text-center leading-tight">
              A-Zed
            </span>
          </div>
        </div>
      )}
    </aside>
  );
};

export default StudentSidebarNavigation;
