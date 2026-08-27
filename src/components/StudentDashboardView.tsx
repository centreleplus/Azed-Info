import React, { useState, useEffect } from 'react';
import { VisualAsset, DEFAULT_VISUAL_ASSETS } from './AdminGifManager';

export const StudentDashboardView: React.FC = () => {
  const [visualAssets, setVisualAssets] = useState<VisualAsset[]>([]);

  // Charger les assets et écouter la synchronisation
  const loadAssets = () => {
    try {
      const saved = localStorage.getItem('azed_visual_assets');
      if (saved) {
        setVisualAssets(JSON.parse(saved));
      } else {
        setVisualAssets(DEFAULT_VISUAL_ASSETS);
      }
    } catch {
      setVisualAssets(DEFAULT_VISUAL_ASSETS);
    }
  };

  useEffect(() => {
    loadAssets();
    window.addEventListener('azed_assets_updated', loadAssets);
    window.addEventListener('storage', loadAssets);
    return () => {
      window.removeEventListener('azed_assets_updated', loadAssets);
      window.removeEventListener('storage', loadAssets);
    };
  }, []);

  // Filtrer les visuels selon l'emplacement configuré par l'admin
  const bannerAssets = visualAssets.filter(a => a.placement === 'banner' && a.visible);
  const sidebarAssets = visualAssets.filter(a => a.placement === 'sidebar' && a.visible);

  return (
    <div className="p-6 bg-slate-50 min-h-screen grid grid-cols-1 lg:grid-cols-4 gap-6 text-left">
      
      {/* SECTION PRINCIPALE (3/4) */}
      <div className="lg:col-span-3 space-y-6">
        
        {/* BANNIÈRE D'ACCUEIL (Affiche dynamiquement les GIF/Icônes attribués à la bannière) */}
        {bannerAssets.length > 0 && (
          <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm space-y-4">
            <h2 className="text-xs font-black uppercase text-slate-400 tracking-wider">
              Nouveautés & Annonces
            </h2>
            <div className="flex flex-wrap items-center justify-around gap-4">
              {bannerAssets.map((asset) => (
                <div key={asset.id} className="flex flex-col items-center gap-2 p-2">
                  <img src={asset.url} alt={asset.title} className="h-24 object-contain rounded-xl" />
                  <span className="text-xs font-bold text-slate-700">{asset.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Calendrier & Cours Élève */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-2">
          <h3 className="font-extrabold text-sm text-slate-800">Mon Planning d'Apprentissage</h3>
          <p className="text-xs text-slate-500">
            Séances en direct, révisions et devoirs de la semaine.
          </p>
        </div>
      </div>

      {/* PANNEAU DU CÔTÉ / SIDEBAR (1/4) (Affiche les icônes configurées pour le côté) */}
      <div className="space-y-6">
        
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
          <h3 className="text-xs font-black text-slate-800 uppercase tracking-wider border-b pb-2">
            Ressources & Accès Rapides
          </h3>

          {sidebarAssets.length === 0 ? (
            <p className="text-xs text-slate-400 italic">Aucune icône attribuée au panneau latéral.</p>
          ) : (
            <div className="space-y-3">
              {sidebarAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl border border-slate-200/80 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <img src={asset.url} alt={asset.title} className="w-10 h-10 object-contain" />
                  <div>
                    <p className="text-xs font-extrabold text-slate-800">{asset.title}</p>
                    <p className="text-[10px] text-slate-500">{asset.category}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

    </div>
  );
};

export default StudentDashboardView;
