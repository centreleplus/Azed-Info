import React, { useState } from 'react';
import { Upload, Save, RefreshCw, Eye, EyeOff, LayoutTemplate, Sidebar, PanelLeftClose } from 'lucide-react';

export interface VisualAsset {
  id: string;
  title: string;
  url: string;
  category: string;
  placement: 'banner' | 'sidebar' | 'collapsed_menu';
  visible: boolean;
  size?: number;
}

export const DEFAULT_ASSETS: VisualAsset[] = [
  {
    id: 'collapsed_promo_1',
    title: 'Visuel Promo Menu Réduit',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif',
    category: 'Publicité & Visuel Menu Réduit',
    placement: 'collapsed_menu',
    visible: true,
  },
  {
    id: '1',
    title: 'Icône Révision Live',
    url: 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png',
    category: 'Révision (Live Énoncé / Replay)',
    placement: 'sidebar',
    visible: true,
  },
  {
    id: '2',
    title: 'Icône Quiz Interactif',
    url: 'https://cdn-icons-png.flaticon.com/512/2991/2991106.png',
    category: 'Quiz Interactifs',
    placement: 'sidebar',
    visible: true,
  },
  {
    id: '3',
    title: 'Bannière GIF Accueil',
    url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif',
    category: 'Bannière GIF Accueil',
    placement: 'banner',
    visible: true,
  },
];

export const DEFAULT_VISUAL_ASSETS = DEFAULT_ASSETS;

export const AdminGifManager: React.FC = () => {
  const [assets, setAssets] = useState<VisualAsset[]>(() => {
    try {
      const saved = localStorage.getItem('azed_visual_assets');
      return saved ? JSON.parse(saved) : DEFAULT_ASSETS;
    } catch {
      return DEFAULT_ASSETS;
    }
  });

  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);

  const handlePlacementChange = (id: string, placement: 'banner' | 'sidebar' | 'collapsed_menu') => {
    setAssets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, placement } : item))
    );
  };

  const handleUrlChange = (id: string, newUrl: string) => {
    setAssets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, url: newUrl } : item))
    );
  };

  const toggleVisibility = (id: string) => {
    setAssets((prev) =>
      prev.map((item) => (item.id === id ? { ...item, visible: !item.visible } : item))
    );
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newUrl = reader.result as string;
        const newAsset: VisualAsset = {
          id: Date.now().toString(),
          title: file.name.split('.')[0] || 'Nouveau visuel',
          url: newUrl,
          category: 'Visuels & Médias',
          placement: 'collapsed_menu',
          visible: true,
        };
        const updated = [...assets, newAsset];
        setAssets(updated);
        try {
          localStorage.setItem('azed_visual_assets', JSON.stringify(updated));
          window.dispatchEvent(new Event('azed_assets_updated'));
        } catch (err) {
          console.error(err);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveAll = () => {
    setIsSaving(true);
    localStorage.setItem('azed_visual_assets', JSON.stringify(assets));
    window.dispatchEvent(new Event('azed_assets_updated'));
    setTimeout(() => setIsSaving(false), 400);
  };

  const handleSyncStudentDashboard = () => {
    setIsSyncing(true);
    handleSaveAll();
    window.dispatchEvent(new Event('storage'));
    setTimeout(() => {
      setIsSyncing(false);
      alert('Dashboard Étudiant actualisé avec succès !');
    }, 500);
  };

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6 text-left">
      
      {/* Barre d'outils haut */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black text-slate-800">Gestion des GIF & Icônes</h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Même logique dynamique que le formulaire « Nouveau document ».
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleSaveAll}
            className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer tout'}</span>
          </button>

          <button
            type="button"
            onClick={handleSyncStudentDashboard}
            className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>Actualiser Dashboard Élève</span>
          </button>

          <label className="cursor-pointer px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-sm flex items-center gap-2 select-none active:scale-95">
            <Upload className="w-4 h-4" />
            <span>Importer un visuel</span>
            <input type="file" accept=".gif,.png,.jpg,.jpeg,.svg,.ico" onChange={handleFileUpload} className="hidden" />
          </label>
        </div>
      </div>

      {/* Cartes d'icônes/GIFs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {assets.map((asset) => (
          <div key={asset.id} className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            
            <div className="flex items-center justify-between gap-2">
              <span className="font-extrabold text-sm text-slate-800 truncate">{asset.title}</span>
              <button
                type="button"
                onClick={() => toggleVisibility(asset.id)}
                className={`px-3 py-1 rounded-full text-[10px] font-black uppercase flex items-center gap-1 shrink-0 cursor-pointer ${
                  asset.visible ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-400'
                }`}
              >
                {asset.visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                <span>{asset.visible ? 'Visible' : 'Masqué'}</span>
              </button>
            </div>

            <div className="h-32 bg-slate-50 border border-dashed border-slate-200 rounded-xl flex items-center justify-center p-2 overflow-hidden">
              <img src={asset.url} alt={asset.title} className="max-h-24 object-contain" />
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-black uppercase text-slate-400">URL / Lien du Visuel (GIF/PNG)</label>
              <input
                type="text"
                value={asset.url}
                onChange={(e) => handleUrlChange(asset.id, e.target.value)}
                className="w-full text-xs p-2 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[10px] font-black uppercase text-slate-400 tracking-wider">
                Emplacement Dashboard Élève
              </label>
              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => handlePlacementChange(asset.id, 'banner')}
                  className={`p-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    asset.placement === 'banner'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <LayoutTemplate className="w-3 h-3" />
                  <span>Bannière</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlacementChange(asset.id, 'sidebar')}
                  className={`p-2 rounded-xl text-[10px] font-extrabold flex items-center justify-center gap-1 border transition-all cursor-pointer ${
                    asset.placement === 'sidebar'
                      ? 'bg-emerald-500 border-emerald-500 text-white shadow-xs'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <Sidebar className="w-3 h-3" />
                  <span>Menu Int.</span>
                </button>

                <button
                  type="button"
                  onClick={() => handlePlacementChange(asset.id, 'collapsed_menu')}
                  className={`p-2 rounded-xl text-[10px] font-extrabold flex flex-col items-center justify-center gap-1 border transition-all cursor-pointer ${
                    asset.placement === 'collapsed_menu'
                      ? 'bg-indigo-600 border-indigo-600 text-white shadow-sm'
                      : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                  }`}
                >
                  <PanelLeftClose className="w-3 h-3" />
                  <span>Menu Réduit</span>
                </button>
              </div>
            </div>

          </div>
        ))}
      </div>

    </div>
  );
};

export default AdminGifManager;
