import React, { useState, useEffect } from 'react';
import { 
  Save, 
  RefreshCw, 
  RotateCcw, 
  CheckCircle2, 
  Plus, 
  Trash2, 
  Upload, 
  Image as ImageIcon,
  Sparkles,
  Layers,
  LayoutTemplate,
  Sliders,
  ExternalLink
} from 'lucide-react';
import { 
  IconMediaItem, 
  CATEGORY_OPTIONS, 
  SUBMENU_MAPPING, 
  getStoredMediaItems, 
  saveStoredMediaItems, 
  DEFAULT_MEDIA_ITEMS 
} from './mediaIconsStore';
import { AdminPaymentMethodsConfig } from './AdminPaymentMethodsConfig';

export type { IconMediaItem };

export const AdminIconManager: React.FC = () => {
  const [items, setItems] = useState<IconMediaItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  useEffect(() => {
    setItems(getStoredMediaItems());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setItems(e.detail);
      }
    };
    window.addEventListener('media-icons-updated', handleUpdate);
    window.addEventListener('azed_assets_updated', () => setItems(getStoredMediaItems()));
    window.addEventListener('storage', () => setItems(getStoredMediaItems()));
    return () => {
      window.removeEventListener('media-icons-updated', handleUpdate);
      window.removeEventListener('azed_assets_updated', () => {});
      window.removeEventListener('storage', () => {});
    };
  }, []);

  // Enregistrer toutes les configurations dans localStorage et synchroniser
  const handleSaveAll = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      saveStoredMediaItems(items);

      // Simuler une synchronisation fluide
      await new Promise((resolve) => setTimeout(resolve, 350));

      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
    } finally {
      setIsSaving(false);
    }
  };

  // Forcer la mise à jour / rafraîchissement du Dashboard Élève
  const handleUpdateStudentDashboard = async () => {
    setIsSyncing(true);
    saveStoredMediaItems(items);
    
    localStorage.setItem('azed_force_reload_student', Date.now().toString());
    window.dispatchEvent(new Event('storage'));
    window.dispatchEvent(new Event('azed_assets_updated'));
    window.dispatchEvent(new Event('azed_config_updated'));

    await new Promise((resolve) => setTimeout(resolve, 500));
    setIsSyncing(false);
  };

  // Ajouter une nouvelle carte de média / GIF
  const handleAddNewItem = () => {
    const defaultCat = CATEGORY_OPTIONS[0].label;
    const defaultPeriod = (SUBMENU_MAPPING[defaultCat] && SUBMENU_MAPPING[defaultCat][0]) || 'Global / Accueil';
    
    const newItem: IconMediaItem = {
      id: 'media_' + Date.now().toString(),
      name: 'Nouveau Visuel / GIF',
      category: defaultCat,
      period: defaultPeriod,
      url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3Z0ZWF4OHo4ZjlsM3RocmEzOHc5MGVwYTY3N2xsMnRpdHJ2bThydyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9cw/kL1yMSpA0b2S33K16C/giphy.gif',
      shape: 'rounded-xl',
      size: 48,
      visible: true,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveStoredMediaItems(updated);
  };

  // Ajouter spécifiquement un visuel pour le cycle aléatoire du menu réduit
  const handleAddCollapsedSidebarItem = () => {
    const defaultCat = '🔲 Image Menu Réduit (Sidebar Collapsed)';
    const defaultPeriod = (SUBMENU_MAPPING[defaultCat] && SUBMENU_MAPPING[defaultCat][0]) || 'Vertical Sidebar';
    
    const newItem: IconMediaItem = {
      id: 'media_col_' + Date.now().toString(),
      name: `Image Menu Réduit #${items.filter((i) => i.category.includes('Réduit') || i.category.includes('Collapsed')).length + 1}`,
      category: defaultCat,
      period: defaultPeriod,
      url: 'https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExOHJ4Z2d1eXp2eXJ2Z2Z2/3oKIPa2TdahY8LAAxy/giphy.gif',
      shape: 'rounded-xl',
      size: 80,
      visible: true,
    };

    const updated = [newItem, ...items];
    setItems(updated);
    saveStoredMediaItems(updated);
  };

  // Importer un fichier depuis l'ordinateur (converti en data URL avec optimisation si image standard)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const defaultCat = CATEGORY_OPTIONS[2]?.label || CATEGORY_OPTIONS[0].label;
    const defaultPeriod = (SUBMENU_MAPPING[defaultCat] && SUBMENU_MAPPING[defaultCat][0]) || 'Menu Principal';
    const isGif = file.type === 'image/gif' || file.name.toLowerCase().endsWith('.gif');

    const processAndAddItem = (dataUrl: string) => {
      const newItem: IconMediaItem = {
        id: 'media_' + Date.now().toString(),
        name: file.name.split('.')[0] || 'Image importée',
        category: defaultCat,
        period: defaultPeriod,
        url: dataUrl,
        shape: 'rounded-xl',
        size: isGif ? 80 : 48,
        visible: true,
      };
      const updated = [newItem, ...items];
      setItems(updated);
      saveStoredMediaItems(updated);
      if (e.target) e.target.value = '';
    };

    // Si c'est une image standard non-GIF de taille importante, on la compresse via Canvas
    if (!isGif && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const rawUrl = event.target?.result as string;
        const img = new Image();
        img.onload = () => {
          const maxDim = 600;
          let width = img.width;
          let height = img.height;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = Math.round((height * maxDim) / width);
              width = maxDim;
            } else {
              width = Math.round((width * maxDim) / height);
              height = maxDim;
            }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedUrl = canvas.toDataURL('image/webp', 0.85);
            processAndAddItem(optimizedUrl);
            return;
          }
          processAndAddItem(rawUrl);
        };
        img.onerror = () => processAndAddItem(rawUrl);
        img.src = rawUrl;
      };
      reader.onerror = () => {
        if (e.target) e.target.value = '';
      };
      reader.readAsDataURL(file);
    } else {
      // Pour les GIFs ou autres fichiers, lire directement
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          processAndAddItem(reader.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Changement de catégorie avec mise à jour automatique en cascade du sous-menu
  const handleCategoryChange = (id: string, newCategory: string) => {
    const availablePeriods = SUBMENU_MAPPING[newCategory] || ['Global'];
    const updated = items.map((item) =>
      item.id === id
        ? {
            ...item,
            category: newCategory,
            period: availablePeriods[0], // Sélectionne automatiquement le 1er sous-menu valide
          }
        : item
    );
    setItems(updated);
    saveStoredMediaItems(updated);
  };

  const updateItemField = (id: string, key: keyof IconMediaItem, value: any) => {
    const updated = items.map((item) => (item.id === id ? { ...item, [key]: value } : item));
    setItems(updated);
    saveStoredMediaItems(updated);
  };

  const removeItem = (id: string) => {
    const updated = items.filter((item) => item.id !== id);
    setItems(updated);
    saveStoredMediaItems(updated);
  };

  const handleReset = () => {
    if (window.confirm('Voulez-vous réinitialiser toutes les icônes et GIF aux valeurs par défaut ?')) {
      setItems(DEFAULT_MEDIA_ITEMS);
      saveStoredMediaItems(DEFAULT_MEDIA_ITEMS);
    }
  };

  // Filtrage des éléments pour la vue
  const collapsedCount = items.filter((item) => item.category.includes('Réduit') || item.category.includes('Collapsed')).length;

  const filteredItems = items.filter((item) => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'collapsed') return item.category.includes('Réduit') || item.category.includes('Collapsed');
    if (activeFilter === 'banners') return item.category.includes('Bannière');
    if (activeFilter === 'menus') return !item.category.includes('Bannière') && !item.category.includes('Réduit') && !item.category.includes('Collapsed');
    return true;
  });

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-left">
      
      {/* HEADER DE LA PAGE GESTION GIF & ICÔNES */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="p-2 bg-emerald-100 text-emerald-700 rounded-xl">
              <ImageIcon className="w-5 h-5" />
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              Gestion des GIF & Icônes (Admin ↔ Élève)
            </h1>
          </div>
          <p className="text-xs font-semibold text-slate-500 max-w-2xl">
            Configurez les visuels et GIF animés : <strong>Image Menu Réduit (Alternance Aléatoire)</strong>, Bannière d'accueil du dashboard et icônes des rubriques de cours.
          </p>
        </div>

        {/* GROUPE DE BOUTONS D'ACTION */}
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          
          {/* Bouton Réinitialiser */}
          <button 
            type="button"
            onClick={handleReset}
            className="px-3.5 py-2.5 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Rétablir les icônes par défaut"
          >
            <RotateCcw className="w-4 h-4" />
            <span className="hidden sm:inline">Réinitialiser</span>
          </button>

          {/* Bouton Ajouter Menu Réduit */}
          <button 
            type="button"
            onClick={handleAddCollapsedSidebarItem}
            className="px-4 py-2.5 text-xs font-black text-indigo-700 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
            title="Ajouter un visuel à la rotation du menu réduit"
          >
            <Sparkles className="w-4 h-4 text-indigo-600" />
            <span>+ Visuel Menu Réduit</span>
          </button>

          {/* Bouton Ajouter Général */}
          <button 
            type="button"
            onClick={handleAddNewItem}
            className="px-4 py-2.5 text-xs font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4 text-emerald-600" />
            <span>Ajouter une carte</span>
          </button>

          {/* Importer un visuel */}
          <label className="cursor-pointer px-4 py-2.5 text-xs font-black text-slate-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl shadow-xs transition-all flex items-center gap-1.5 select-none active:scale-95">
            <Upload className="w-4 h-4 text-emerald-700" />
            <span>Importer image/GIF</span>
            <input type="file" accept=".gif,.png,.jpg,.jpeg,.svg,.webp" onChange={handleFileUpload} className="hidden" />
          </label>

          {/* BOUTON ENREGISTRER TOUT */}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className={`px-5 py-2.5 text-xs font-black text-white rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer ${
              savedSuccess 
                ? 'bg-emerald-600 hover:bg-emerald-700' 
                : 'bg-emerald-600 hover:bg-emerald-700 active:scale-95'
            }`}
          >
            {savedSuccess ? (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Enregistré !</span>
              </>
            ) : (
              <>
                <Save className={`w-4 h-4 ${isSaving ? 'animate-spin' : ''}`} />
                <span>{isSaving ? 'Enregistrement...' : 'Enregistrer tout'}</span>
              </>
            )}
          </button>

          {/* BOUTON ACTUALISER DASHBOARD */}
          <button
            type="button"
            onClick={handleUpdateStudentDashboard}
            disabled={isSyncing}
            className="px-4 py-2.5 text-xs font-black text-white bg-indigo-600 hover:bg-indigo-700 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Sync...' : 'Actualiser Élève'}</span>
          </button>
        </div>
      </div>

      {/* BARRE DE FILTRAGE DES DESTINATIONS */}
      <div className="flex flex-wrap items-center gap-2 bg-white p-2.5 rounded-2xl border border-slate-200 shadow-xs">
        <button
          type="button"
          onClick={() => setActiveFilter('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Tous les visuels ({items.length})
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('collapsed')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'collapsed'
              ? 'bg-indigo-600 text-white shadow-xs'
              : 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>🔲 Menu Réduit ({collapsedCount})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('banners')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'banners'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>🖼️ Bannière Accueil</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('menus')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'menus'
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          <span>📑 Icônes Menus Navigation</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveFilter('payments')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5 ${
            activeFilter === 'payments'
              ? 'bg-emerald-600 text-white shadow-xs'
              : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
          }`}
        >
          <span>💳 Modes de Règlement</span>
        </button>
      </div>

      {/* SECTION MODES DE REGLEMENT */}
      {activeFilter === 'payments' && (
        <div className="pt-2">
          <AdminPaymentMethodsConfig />
        </div>
      )}

      {/* BANNER D'INFORMATION LORS DU FILTRAGE DU MENU RÉDUIT */}
      {activeFilter === 'collapsed' && (
        <div className="bg-indigo-50/80 border border-indigo-200 rounded-2xl p-4 flex items-start gap-3 text-left">
          <span className="p-2 bg-indigo-600 text-white rounded-xl shadow-xs mt-0.5">
            <Sparkles className="w-4 h-4" />
          </span>
          <div className="space-y-1">
            <h3 className="text-xs font-black text-indigo-950 uppercase tracking-wide">
              Dynamic Image Cycling (Alternance Aléatoire)
            </h3>
            <p className="text-xs font-medium text-indigo-800 leading-relaxed">
              Toutes les images et GIFs configurés ici avec le statut <strong>Visible</strong> sont automatiquement inclus dans la liste de rotation (<code className="bg-indigo-100 px-1 py-0.5 rounded text-[11px] font-mono">azed_collapsed_images_list</code>). À chaque fois qu'un élève réduit la barre latérale, une image est tirée au sort pour afficher un visuel dynamique aux dimensions exactes <code className="bg-indigo-100 px-1 py-0.5 rounded text-[11px] font-mono">314px × 1043.86px</code>.
            </p>
          </div>
        </div>
      )}

      {/* GRILLE DES CARTES D'ICÔNES & GIF */}
      {activeFilter !== 'payments' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map((item) => {
          // Extraction dynamique des sous-menus correspondant à la catégorie actuelle
          const currentAvailablePeriods = SUBMENU_MAPPING[item.category] || ['Global / Accueil'];

          const isBanner = item.category.includes('Bannière');
          const isSidebarCollapsed = item.category.includes('Réduit') || item.category.includes('Collapsed');

          return (
            <div 
              key={item.id} 
              className={`bg-white border rounded-2xl p-5 shadow-sm space-y-4 relative transition-all ${
                isBanner 
                  ? 'border-emerald-300 ring-2 ring-emerald-50' 
                  : isSidebarCollapsed 
                  ? 'border-indigo-300 ring-2 ring-indigo-50' 
                  : 'border-slate-200 hover:border-slate-300'
              }`}
            >
              
              {/* Entête Carte avec Badge de Destination */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex-1 min-w-0 pr-2">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => updateItemField(item.id, 'name', e.target.value)}
                    className="text-xs font-black text-slate-800 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-emerald-600 focus:outline-none w-full truncate"
                    placeholder="Nom du visuel"
                  />
                  <div className="flex items-center gap-1.5 mt-0.5">
                    {isBanner && (
                      <span className="text-[9px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                        Bannière Verte Accueil
                      </span>
                    )}
                    {isSidebarCollapsed && (
                      <span className="text-[9px] font-black px-2 py-0.5 bg-indigo-100 text-indigo-800 rounded-md">
                        Menu Réduit (Élève)
                      </span>
                    )}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => updateItemField(item.id, 'visible', !item.visible)}
                  className={`text-[10px] font-black px-2.5 py-1 rounded-lg transition-colors shrink-0 cursor-pointer ${
                    item.visible ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                  }`}
                >
                  {item.visible ? '✓ Visible' : '✗ Masqué'}
                </button>
              </div>

              {/* Zone Aperçu Dynamique */}
              <div className="h-36 bg-slate-100 rounded-xl flex items-center justify-center p-3 overflow-hidden border border-slate-200/80 relative group">
                <img
                  src={item.url}
                  alt={item.name}
                  style={{ 
                    maxWidth: isBanner ? '100%' : `${item.size * 1.5}px`, 
                    maxHeight: isBanner ? '100%' : `${item.size * 1.5}px` 
                  }}
                  className={`object-contain transition-all shadow-2xs ${item.shape}`}
                />
                <span className="absolute bottom-1.5 right-1.5 text-[9px] font-mono bg-black/60 text-white px-1.5 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
                  {item.size}px
                </span>
              </div>

              {/* Champ URL / Lien direct */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  LIEN IMAGE / GIF DIRECT
                </label>
                <input
                  type="text"
                  value={item.url}
                  onChange={(e) => updateItemField(item.id, 'url', e.target.value)}
                  className="w-full text-xs font-mono p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 focus:outline-none focus:border-emerald-600"
                  placeholder="https://..."
                />
              </div>

              {/* 1. Menu Déroulant Principal : Catégorie & Type Source */}
              <div className="space-y-1">
                <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                  CATÉGORIE & TYPE SOURCE
                </label>
                <div className="relative">
                  <select
                    value={item.category}
                    onChange={(e) => handleCategoryChange(item.id, e.target.value)}
                    className="w-full text-xs font-black p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 appearance-none focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                  >
                    {CATEGORY_OPTIONS.map((cat) => (
                      <option key={cat.id} value={cat.label} className="py-2 font-bold">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* 2. Menu Déroulant DYNAMIQUE : Période académique / Sous-menu */}
              <div className="space-y-1">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">
                    PÉRIODE ACADÉMIQUE / SOUS-MENU
                  </label>
                  <span className="text-[9px] font-black px-1.5 py-0.5 bg-emerald-100 text-emerald-700 rounded uppercase tracking-wider">
                    DYNAMIQUE
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={item.period}
                    onChange={(e) => updateItemField(item.id, 'period', e.target.value)}
                    className="w-full text-xs font-black p-2.5 bg-white border border-slate-300 rounded-xl text-slate-800 appearance-none focus:outline-none focus:border-emerald-600 cursor-pointer shadow-2xs"
                  >
                    {currentAvailablePeriods.map((sub, idx) => (
                      <option key={idx} value={sub} className="py-2 font-bold">
                        {sub}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>
              </div>

              {/* Forme et Taille */}
              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[10px] font-extrabold text-slate-400 uppercase mb-1">Forme des bordures</label>
                  <select
                    value={item.shape}
                    onChange={(e) => updateItemField(item.id, 'shape', e.target.value as any)}
                    className="w-full text-xs font-semibold p-2 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:border-emerald-600"
                  >
                    <option value="rounded-xl">Arrondi Doux</option>
                    <option value="rounded-full">Cercle Parfait</option>
                    <option value="rounded-lg">Carré Arrondi</option>
                    <option value="rounded-none">Carré Plat</option>
                  </select>
                </div>

                <div>
                  <div className="flex justify-between text-[10px] font-extrabold text-slate-400 uppercase mb-1">
                    <span>Taille</span>
                    <span>{item.size}px</span>
                  </div>
                  <input
                    type="range"
                    min="18"
                    max="160"
                    value={item.size}
                    onChange={(e) => updateItemField(item.id, 'size', Number(e.target.value))}
                    className="w-full accent-emerald-600 mt-2 cursor-pointer"
                  />
                </div>
              </div>

              {/* Bouton Supprimer */}
              <div className="pt-2 border-t border-slate-100 flex justify-between items-center">
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  {item.category.split(' ')[0]}
                </span>
                <button
                  type="button"
                  onClick={() => removeItem(item.id)}
                  className="text-xs font-black text-rose-600 hover:text-rose-700 cursor-pointer transition-colors flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
      )}
    </div>
  );
};

export default AdminIconManager;
