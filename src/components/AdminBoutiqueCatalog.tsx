import React, { useState, useEffect } from 'react';
import { 
  Store, Plus, RefreshCw, Save, Trash2, Copy, Sparkles, 
  Tag, Image as ImageIcon, DollarSign, Percent, ShieldCheck, 
  AlertCircle, CheckCircle, Search, Layers, Zap, ExternalLink
} from 'lucide-react';
import { BoutiqueCardEditor } from './BoutiqueCardEditor';

export interface StoreItem {
  id: string;
  title: string;
  currentPrice: number;
  originalPrice: number;
  discountPercentage?: string;
  badgeType: string;
  showBadge: boolean;
  category: string;
  description: string;
  imageUrl: string;
}

export interface AdminBoutiqueCatalogProps {
  onSuccessToast?: (msg: string) => void;
}

const QUICK_IMAGE_PRESETS = [
  { name: "Gold Premium", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80" },
  { name: "Scolaire PDF", url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=600&q=80" },
  { name: "Classes Vidéo", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=600&q=80" },
  { name: "Révision Bac", url: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?auto=format&fit=crop&w=600&q=80" },
];

const PRESET_BADGES = [
  "SOLDE",
  "PROMO",
  "ESSENTIEL",
  "PREMIUM",
  "PREMIUM PLUS",
  "OFFRE SPÉCIALE",
  "BEST-SELLER",
  "NOUVEAU"
];

const CATEGORIES = [
  "Abonnement",
  "Full Access",
  "Pack PDF",
  "Cours Video",
  "Hardware",
  "Révision",
  "Intégral"
];

export const AdminBoutiqueCatalog: React.FC<AdminBoutiqueCatalogProps> = ({ onSuccessToast }) => {
  const [products, setProducts] = useState<StoreItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('all');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; msg: string } | null>(null);
  const [editingProductIds, setEditingProductIds] = useState<Set<string>>(new Set());

  // Basculer l'état d'édition individuel d'une carte produit
  const handleEditProduct = (id: string) => {
    setEditingProductIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  // Charger les articles de la boutique depuis l'API
  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/admin/boutique/products?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const data = await res.json();
      
      let rawList: any[] = [];
      if (data && data.success && Array.isArray(data.products)) {
        rawList = data.products;
      } else if (Array.isArray(data)) {
        rawList = data;
      } else if (data && Array.isArray(data.products)) {
        rawList = data.products;
      }

      const formatted: StoreItem[] = rawList.map((item: any, idx: number) => {
        const curPrice = Number(item.currentPrice !== undefined ? item.currentPrice : (item.price !== undefined ? item.price : 0));
        const origPrice = Number(item.originalPrice !== undefined ? item.originalPrice : (item.oldPrice !== undefined ? item.oldPrice : curPrice));
        let discount = item.discountPercentage || item.discountText || '';
        if (!discount && origPrice > 0 && curPrice < origPrice) {
          discount = `-${Math.round(((origPrice - curPrice) / origPrice) * 100)}%`;
        }

        return {
          id: String(item.id || `prod_${idx + 1}`),
          title: item.title || `Offre ${idx + 1}`,
          currentPrice: curPrice,
          originalPrice: origPrice,
          discountPercentage: discount,
          badgeType: item.badgeType || item.badgeLabel || item.promoBadge || 'SOLDE',
          showBadge: item.showBadge !== undefined ? Boolean(item.showBadge) : (item.showPromoBadge !== undefined ? Boolean(item.showPromoBadge) : true),
          category: item.category || 'Abonnement',
          description: item.description || '',
          imageUrl: item.imageUrl || item.image || 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600'
        };
      });

      setProducts(formatted);
    } catch (err) {
      console.error("Erreur de chargement de la boutique:", err);
      setNotification({ type: 'error', msg: 'Erreur lors du chargement des articles de la boutique.' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // Mettre à jour localement un champ d'un produit
  const handleProductChange = (id: string, field: keyof StoreItem, value: any) => {
    setProducts((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const updated = { ...item, [field]: value };
          // Recalcul automatique du % de réduction si les prix changent
          if (field === 'currentPrice' || field === 'originalPrice') {
            const current = field === 'currentPrice' ? Number(value) : item.currentPrice;
            const original = field === 'originalPrice' ? Number(value) : item.originalPrice;
            if (original > 0 && current < original) {
              const discount = Math.round(((original - current) / original) * 100);
              updated.discountPercentage = `-${discount}%`;
            } else {
              updated.discountPercentage = '';
            }
          }
          return updated;
        }
        return item;
      })
    );
  };

  // ACTION : SAUVEGARDER TOUTES LES MODIFICATIONS GLOBALEMENT
  const handleSaveAllGlobal = async () => {
    setIsSaving(true);
    setNotification(null);

    try {
      const response = await fetch('/api/admin/boutique/save-all', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          products,
          updatedAt: new Date().toISOString(),
        }),
      });

      const data = await response.json();

      if (data.success) {
        const msg = 'Toutes les modifications de la boutique ont été enregistrées globalement avec succès !';
        setNotification({
          type: 'success',
          msg,
        });
        if (onSuccessToast) onSuccessToast(msg);

        // Diffuser sur les BroadcastChannels pour que tous les onglets étudiants se rafraîchissent instantanément
        if (typeof BroadcastChannel !== 'undefined') {
          try {
            const bc1 = new BroadcastChannel('azed_boutique_sync');
            bc1.postMessage({ type: 'BOUTIQUE_SAVED', count: products.length, timestamp: Date.now() });
            bc1.close();

            const bc2 = new BroadcastChannel('azed_store_sync');
            bc2.postMessage({ type: 'BOUTIQUE_SAVED', count: products.length, timestamp: Date.now() });
            bc2.close();
          } catch (e) {
            console.warn("BroadcastChannel notice:", e);
          }
        }

        // Événement local
        window.dispatchEvent(new CustomEvent('azed_boutique_saved', { detail: { count: products.length } }));
      } else {
        setNotification({ type: 'error', msg: data.message || 'Erreur de sauvegarde.' });
      }
    } catch (error) {
      setNotification({ type: 'error', msg: "Erreur réseau/serveur lors de l'enregistrement." });
    } finally {
      setIsSaving(false);
    }
  };

  // Ajouter un nouveau produit vierge en tête de liste
  const handleAddNewProduct = () => {
    const newId = `prod_${Date.now()}`;
    const newProduct: StoreItem = {
      id: newId,
      title: "Nouvelle Offre d'Étude",
      currentPrice: 99,
      originalPrice: 150,
      discountPercentage: "-34%",
      badgeType: "SOLDE",
      showBadge: true,
      category: "Abonnement",
      description: "Description de la formule d'étude et des contenus inclus pour l'élève...",
      imageUrl: QUICK_IMAGE_PRESETS[0].url
    };

    setProducts([newProduct, ...products]);
    setNotification({
      type: 'success',
      msg: 'Nouvel article ajouté ! Pensez à cliquer sur "Enregistrer tout" pour persister les changements.'
    });
  };

  // Dupliquer un produit
  const handleDuplicateProduct = (item: StoreItem) => {
    const duplicated: StoreItem = {
      ...item,
      id: `prod_${Date.now()}`,
      title: `${item.title} (Copie)`,
    };
    setProducts([duplicated, ...products]);
    setNotification({
      type: 'success',
      msg: `Produit "${item.title}" dupliqué avec succès !`
    });
  };

  // Supprimer localement un produit de la liste
  const handleDeleteProduct = (id: string, title: string) => {
    if (window.confirm(`Voulez-vous retirer "${title}" du catalogue ? (Sauvegarde globale requise ensuite)`)) {
      setProducts(products.filter(p => p.id !== id));
      setNotification({
        type: 'success',
        msg: `Article retiré de la liste. Cliquez sur "Enregistrer tout" pour valider la suppression définitive.`
      });
    }
  };

  // Restaurer les 4 packs par défaut
  const handleSeedDefaultPacks = async () => {
    if (!window.confirm("Restaurer les 4 packs par défaut de la plateforme ? Cela réinitialisera le catalogue.")) {
      return;
    }
    setIsSeeding(true);
    try {
      const res = await fetch('/api/admin/store/seed', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        await loadProducts();
        setNotification({
          type: 'success',
          msg: 'Les 4 packs de référence ont été restaurés et enregistrés avec succès !'
        });
      } else {
        setNotification({ type: 'error', msg: data.message || 'Échec de la restauration des packs.' });
      }
    } catch (err) {
      setNotification({ type: 'error', msg: 'Erreur réseau lors de la réinitialisation.' });
    } finally {
      setIsSeeding(false);
    }
  };

  // Filtrer les produits pour l'affichage
  const filteredProducts = products.filter(p => {
    const matchesSearch = searchTerm === '' || 
      p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      p.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.category.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCategory = selectedCategoryFilter === 'all' || p.category === selectedCategoryFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto space-y-6 text-left">
      {/* En-tête de la Boutique avec le Bouton Enregistrer Tout */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-slate-200 shadow-sm">
        <div>
          <div className="flex items-center gap-3 flex-wrap">
            <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shadow-xs">
              <Store className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Catalogue de la Boutique</h1>
            <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full border border-emerald-200">
              {products.length} {products.length > 1 ? 'articles' : 'article'}
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Éditez directement les prix, badges et titres puis sauvegardez l'ensemble du catalogue en un clic.
          </p>
        </div>

        {/* Actions Globales */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={handleAddNewProduct}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95"
            title="Ajouter une nouvelle offre"
          >
            <Plus className="w-4 h-4 text-slate-600" />
            <span>Ajouter une offre</span>
          </button>

          <button
            type="button"
            onClick={handleSeedDefaultPacks}
            disabled={isSeeding}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold text-xs rounded-xl transition-all cursor-pointer shadow-2xs active:scale-95 disabled:opacity-50"
            title="Restaurer les 4 packs de base (Essentiel, Premium, Révision, Forfait Annuel)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin' : ''}`} />
            <span>{isSeeding ? 'Restauration...' : 'Restaurer packs'}</span>
          </button>

          <button
            type="button"
            onClick={handleSaveAllGlobal}
            disabled={isSaving}
            className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
          >
            <span className="text-sm">💾</span>
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer tout'}</span>
          </button>
        </div>
      </div>

      {/* Message de Notification */}
      {notification && (
        <div className={`p-4 rounded-2xl text-xs font-bold flex items-center justify-between gap-3 shadow-sm ${
          notification.type === 'success' 
            ? 'bg-emerald-50 text-emerald-900 border border-emerald-200' 
            : 'bg-rose-50 text-rose-900 border border-rose-200'
        }`}>
          <div className="flex items-center gap-2">
            {notification.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <span>{notification.msg}</span>
          </div>
          <button 
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 text-sm font-black px-1.5 cursor-pointer"
          >
            ✕
          </button>
        </div>
      )}

      {/* Barre d'outils / Recherche & Filtre */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par titre ou mot-clé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-emerald-500 font-medium"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">Catégorie :</span>
          <select
            value={selectedCategoryFilter}
            onChange={(e) => setSelectedCategoryFilter(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 font-bold text-slate-700 focus:bg-white focus:outline-emerald-500"
          >
            <option value="all">Toutes les catégories</option>
            {CATEGORIES.map(cat => (
              <option key={cat} value={cat}>{cat}</option>
            ))}
          </select>

          <button
            type="button"
            onClick={loadProducts}
            className="p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
            title="Recharger le catalogue"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* État de chargement */}
      {isLoading ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-slate-200">
          <div className="w-8 h-8 border-3 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-xs font-bold text-slate-500">Chargement des cartes du catalogue boutique...</p>
        </div>
      ) : filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-white border-2 border-dashed border-slate-200 rounded-3xl p-6">
          <Store className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-slate-800">Aucun produit ne correspond à votre recherche</h3>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto mb-4">
            {products.length === 0 
              ? "Le catalogue boutique est actuellement vide. Vous pouvez charger les 4 formules d'études de base ou créer une nouvelle offre."
              : "Essayez de modifier votre terme de recherche ou le filtre de catégorie."}
          </p>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleAddNewProduct}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all"
            >
              Ajouter une offre
            </button>
            {products.length === 0 && (
              <button
                type="button"
                onClick={handleSeedDefaultPacks}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
              >
                Restaurer les 4 packs
              </button>
            )}
          </div>
        </div>
      ) : (
        /* Grille des cartes de produits dynamiques et éditables */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((item, index) => {
            const isEditing = editingProductIds.has(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white border-2 rounded-3xl p-5 shadow-xs transition-all flex flex-col justify-between space-y-4 relative group ${
                  isEditing 
                    ? 'border-amber-400 shadow-md ring-2 ring-amber-400/20' 
                    : 'border-slate-200 hover:border-emerald-400 hover:shadow-md'
                }`}
              >
                {/* Header de la carte : Index + Badge Visuel + Actions */}
                <div className="flex items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-[11px] font-black flex items-center justify-center">
                      #{index + 1}
                    </span>
                    {isEditing && (
                      <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                        Mode Édition
                      </span>
                    )}
                    {item.showBadge && item.badgeType && (
                      <span className="bg-rose-600 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-2xs">
                        {item.badgeType}
                      </span>
                    )}
                    {item.discountPercentage && (
                      <span className="bg-emerald-100 text-emerald-800 border border-emerald-200 text-[10px] font-black px-2 py-0.5 rounded-md">
                        {item.discountPercentage}
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleDuplicateProduct(item)}
                      className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                      title="Dupliquer cet article"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteProduct(item.id, item.title)}
                      className="p-1.5 text-rose-400 hover:text-rose-700 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                      title="Supprimer cet article"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {isEditing ? (
                  /* Formulaire d'édition locale */
                  <div className="space-y-4">
                    {/* Éditeur d'Image Hybride (Upload direct de fichier ou URL) */}
                    <BoutiqueCardEditor
                      product={item}
                      onChange={(field, val) => handleProductChange(item.id, field as any, val)}
                    />

                    {/* Champ Titre */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center justify-between">
                        <span>Titre de l'Offre *</span>
                        <span className="text-[9px] text-slate-400 font-normal">Édition directe</span>
                      </label>
                      <input
                        type="text"
                        value={item.title}
                        onChange={(e) => handleProductChange(item.id, 'title', e.target.value)}
                        placeholder="Ex: Pack Essentiel"
                        className="w-full text-xs font-black text-slate-900 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-emerald-500"
                      />
                    </div>

                    {/* Section Tarifaire : Prix Promo + Prix Barré + % Réduction */}
                    <div className="grid grid-cols-3 gap-2 bg-emerald-50/50 p-3 rounded-2xl border border-emerald-100">
                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-emerald-900 uppercase tracking-wider flex items-center gap-0.5">
                          <DollarSign className="w-2.5 h-2.5 text-emerald-600" />
                          <span>Prix Promo *</span>
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={item.currentPrice}
                            onChange={(e) => handleProductChange(item.id, 'currentPrice', e.target.value)}
                            className="w-full text-xs font-extrabold text-emerald-700 bg-white border border-emerald-200 rounded-lg px-2 py-1.5 text-left focus:outline-emerald-500"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-emerald-600 pointer-events-none">DT</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-slate-500 uppercase tracking-wider">
                          Prix Barré
                        </label>
                        <div className="relative">
                          <input
                            type="number"
                            min="0"
                            value={item.originalPrice}
                            onChange={(e) => handleProductChange(item.id, 'originalPrice', e.target.value)}
                            className="w-full text-xs font-medium text-slate-600 line-through bg-white border border-slate-200 rounded-lg px-2 py-1.5 text-left focus:outline-emerald-500"
                          />
                          <span className="absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold text-slate-400 pointer-events-none">DT</span>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-black text-rose-700 uppercase tracking-wider flex items-center gap-0.5">
                          <Percent className="w-2.5 h-2.5 text-rose-600" />
                          <span>Réduction</span>
                        </label>
                        <input
                          type="text"
                          value={item.discountPercentage || ''}
                          onChange={(e) => handleProductChange(item.id, 'discountPercentage', e.target.value)}
                          placeholder="-50%"
                          className="w-full text-xs font-black text-rose-700 bg-white border border-rose-200 rounded-lg px-2 py-1.5 focus:outline-rose-500"
                        />
                      </div>
                    </div>

                    {/* Section Badge Promo & Marketing */}
                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-200 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[10px] font-black text-slate-700 uppercase tracking-wider flex items-center gap-1.5 cursor-pointer">
                          <input
                            type="checkbox"
                            checked={item.showBadge}
                            onChange={(e) => handleProductChange(item.id, 'showBadge', e.target.checked)}
                            className="rounded text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5 cursor-pointer"
                          />
                          <span>Afficher le badge</span>
                        </label>
                        <span className="text-[9px] font-bold text-slate-400 uppercase">Marketing</span>
                      </div>

                      {item.showBadge && (
                        <div className="space-y-1 pt-1">
                          <label className="text-[9px] font-bold text-slate-500 uppercase">Libellé du badge</label>
                          <input
                            type="text"
                            value={item.badgeType}
                            onChange={(e) => handleProductChange(item.id, 'badgeType', e.target.value)}
                            placeholder="Ex: SOLDE, -50%, PROMO..."
                            list={`badge-suggestions-${item.id}`}
                            className="w-full text-xs font-bold text-slate-800 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 focus:outline-emerald-500"
                          />
                          <datalist id={`badge-suggestions-${item.id}`}>
                            {PRESET_BADGES.map(badge => (
                              <option key={badge} value={badge} />
                            ))}
                          </datalist>
                        </div>
                      )}
                    </div>

                    {/* Catégorie */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <span>Catégorie</span>
                      </label>
                      <select
                        value={item.category}
                        onChange={(e) => handleProductChange(item.id, 'category', e.target.value)}
                        className="w-full text-xs font-bold text-slate-700 bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 focus:bg-white focus:outline-emerald-500"
                      >
                        {CATEGORIES.map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                    </div>

                    {/* Description */}
                    <div className="space-y-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase tracking-wider">
                        Description de la formule
                      </label>
                      <textarea
                        rows={2}
                        value={item.description}
                        onChange={(e) => handleProductChange(item.id, 'description', e.target.value)}
                        placeholder="Détails des ressources incluses pour l'élève..."
                        className="w-full text-xs text-slate-600 bg-slate-50 border border-slate-200 rounded-xl p-2.5 focus:bg-white focus:outline-emerald-500 resize-none font-medium"
                      />
                    </div>
                  </div>
                ) : (
                  /* Affichage aperçu standard de l'article */
                  <div className="space-y-3">
                    <div className="relative rounded-2xl overflow-hidden h-36 border border-slate-100 bg-slate-100">
                      <img
                        src={item.imageUrl || "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600"}
                        alt={item.title}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=600";
                        }}
                      />
                      <span className="absolute bottom-2 left-2 bg-[#0F1E36] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {item.category}
                      </span>
                    </div>

                    <div className="space-y-1.5 text-left">
                      <div className="flex items-start justify-between gap-2">
                        <h4 className="font-extrabold text-slate-900 text-sm leading-tight line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="flex items-center gap-1.5 shrink-0">
                          {item.originalPrice > item.currentPrice && (
                            <span className="line-through text-slate-400 font-semibold text-xs">
                              {item.originalPrice} DT
                            </span>
                          )}
                          <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg px-2.5 py-1 font-black text-xs">
                            {item.currentPrice} DT
                          </span>
                        </div>
                      </div>

                      <p className="text-[11px] text-slate-500 font-medium line-clamp-2 leading-relaxed">
                        {item.description || "Aucune description renseignée."}
                      </p>
                    </div>
                  </div>
                )}

                {/* Bouton d'action sur chaque carte d'offre boutique */}
                <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => handleEditProduct(item.id)}
                    className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center"
                  >
                    {isEditing ? "✓ Valider l'édition" : "✏️ Modifier"}
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteProduct(item.id, item.title)}
                    className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                  >
                    Retirer
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Barre d'action sticky en bas pour un confort maximal de sauvegarde */}
      {products.length > 0 && (
        <div className="sticky bottom-4 z-20 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold">
              {products.length} {products.length > 1 ? 'articles prêts' : 'article prêt'} pour la sauvegarde globale
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAllGlobal}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <span>💾</span>
              <span>{isSaving ? 'Enregistrement en cours...' : 'Enregistrer tout'}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBoutiqueCatalog;
