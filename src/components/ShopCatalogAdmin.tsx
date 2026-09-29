import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, RefreshCw, Store, CheckCircle, ShieldCheck, Zap, Layers, Sparkles } from 'lucide-react';
import { Product, getPromoBadgeLabel } from '../types';

export interface ShopCatalogAdminProps {
  products?: Product[];
  onRefresh?: () => void;
  showFeedback?: (message: string, type?: 'success' | 'error') => void;
}

export const ShopCatalogAdmin: React.FC<ShopCatalogAdminProps> = ({
  products: initialProducts,
  onRefresh,
  showFeedback
}) => {
  const [products, setProducts] = useState<Product[]>(initialProducts || []);
  const [isConfirmOpen, setIsConfirmOpen] = useState<boolean>(false);
  const [isDeleting, setIsDeleting] = useState<boolean>(false);
  const [isSeeding, setIsSeeding] = useState<boolean>(false);
  const [confirmationInput, setConfirmationInput] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Synchronize when parent passes updated products
  useEffect(() => {
    if (initialProducts) {
      setProducts(initialProducts);
    }
  }, [initialProducts]);

  const loadProducts = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/shop/products');
      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      }
    } catch (err) {
      console.error("Erreur lors du chargement des produits:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!initialProducts) {
      loadProducts();
    }
  }, []);

  const handleSeedDefaultPacks = async () => {
    setIsSeeding(true);
    try {
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
      const response = await fetch('/api/admin/store/seed', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.products && Array.isArray(data.products)) {
          setProducts(data.products);
        } else {
          await loadProducts();
        }
        if (showFeedback) {
          showFeedback("Les 4 packs par défaut ont été réinitialisés et enregistrés avec succès ! ✨");
        } else {
          alert("Les 4 packs par défaut ont été réinitialisés avec succès !");
        }
        if (onRefresh) onRefresh();
      } else {
        const err = await response.json().catch(() => ({}));
        const msg = err.error || "Erreur lors du rechargement des packs.";
        if (showFeedback) showFeedback(msg, "error");
      }
    } catch (err) {
      console.error("Erreur réinitialisation packs:", err);
      if (showFeedback) showFeedback("Impossible de contacter le serveur.", "error");
    } finally {
      setIsSeeding(false);
    }
  };

  const handleClearAllProducts = async () => {
    setIsDeleting(true);
    try {
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token') || '';
      const response = await fetch('/api/shop/products/all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${adminToken}`
        }
      });

      if (response.ok) {
        setProducts([]);
        setIsConfirmOpen(false);
        setConfirmationInput('');
        if (showFeedback) {
          showFeedback("Tous les articles de la boutique ont été effacés avec succès ! 🗑️");
        } else {
          alert("Tous les articles de la boutique ont été effacés.");
        }
        if (onRefresh) onRefresh();
      } else {
        const errorData = await response.json().catch(() => ({}));
        const msg = errorData.error || "Une erreur est survenue lors de la suppression.";
        if (showFeedback) {
          showFeedback(msg, "error");
        } else {
          alert(msg);
        }
      }
    } catch (err) {
      console.error(err);
      if (showFeedback) {
        showFeedback("Impossible de contacter le serveur.", "error");
      } else {
        alert("Impossible de contacter le serveur.");
      }
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteSingleProduct = async (productId: string) => {
    if (!window.confirm("Voulez-vous vraiment retirer cet article du catalogue boutique ?")) return;
    try {
      const response = await fetch(`/api/admin/products/${productId}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        setProducts(prev => prev.filter(p => p.id !== productId));
        if (showFeedback) showFeedback("Produit retiré du catalogue.");
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      console.error("Erreur suppression produit:", err);
    }
  };

  return (
    <div className="space-y-4">
      {/* En-tête de la section avec boutons d'action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F1E36]">
              Catalogue de la Boutique ({products.length})
            </h3>
            {products.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800 flex items-center gap-1">
                <CheckCircle className="w-3 h-3 text-emerald-600" />
                {products.length} {products.length > 1 ? 'offres actives & publiques' : 'offre active'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            La grille tarifaire et les 4 formules d'abonnement disponibles pour tous les lycéens.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={handleSeedDefaultPacks}
            disabled={isSeeding}
            className="flex items-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-2xs text-xs cursor-pointer active:scale-95 disabled:opacity-50"
            title="Restaurer les 4 packs par défaut (Pack Essentiel, Pack Premium, Pack Révision, Forfait Annuel Intégral)"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSeeding ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{isSeeding ? 'Restauration...' : 'Restaurer les 4 packs'}</span>
          </button>

          {products.length > 0 && (
            <button
              onClick={() => {
                setConfirmationInput('');
                setIsConfirmOpen(true);
              }}
              className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 text-white font-semibold px-3 py-1.5 rounded-lg transition-colors shadow-xs text-xs cursor-pointer active:scale-95"
              title="Supprimer l'intégralité du catalogue boutique"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Tout supprimer
            </button>
          )}
        </div>
      </div>

      {/* Grille des produits */}
      {products.length === 0 ? (
        <div className="text-center py-12 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
          <Store className="w-12 h-12 mx-auto text-gray-300 mb-2" />
          <h4 className="font-bold text-gray-700 text-sm">Le catalogue boutique est actuellement vide</h4>
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto mb-4">
            Aucun produit n'est proposé aux élèves. Cliquez sur le bouton ci-dessous pour injecter immédiatement les 4 formules de référence.
          </p>
          <button
            type="button"
            onClick={handleSeedDefaultPacks}
            disabled={isSeeding}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Charger les 4 packs par défaut</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
          {products.map((p) => {
            const badgeLabel = getPromoBadgeLabel(p) || (p as any).badgeLabel;
            const originalPrice = (p as any).originalPrice || p.oldPrice;
            const features = (p as any).features || [];
            const billingPeriod = (p as any).billingPeriod || (p as any).period || "Annuel";
            const autoAccess = (p as any).autoAccessBadge;

            return (
              <div
                key={p.id}
                className="p-3.5 border border-[#E5E7EB] rounded-2xl bg-white flex flex-col justify-between hover:border-emerald-500 hover:shadow-md transition-all text-xs relative group"
              >
                <div className="flex items-center justify-between gap-1.5 mb-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {badgeLabel && (
                      <span className="bg-emerald-700 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider shadow-2xs">
                        {badgeLabel}
                      </span>
                    )}
                    {autoAccess && (
                      <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[9px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider flex items-center gap-1">
                        <Zap className="w-2.5 h-2.5 text-emerald-600" />
                        {autoAccess}
                      </span>
                    )}
                    {(p as any).discountText && (
                      <span className="bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-md uppercase">
                        {(p as any).discountText}
                      </span>
                    )}
                  </div>

                  <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Public
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="text-left">
                    <div className="flex justify-between items-baseline">
                      <h4 className="font-extrabold text-sm text-gray-900">{p.title}</h4>
                      <div className="flex items-baseline gap-1.5">
                        {originalPrice && originalPrice > p.price && (
                          <span className="line-through text-gray-400 font-normal text-xs">{originalPrice} DT</span>
                        )}
                        <span className="text-emerald-700 font-black text-sm">{p.price} DT</span>
                        <span className="text-[10px] text-gray-400">/{billingPeriod}</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-gray-600 mt-1 line-clamp-2 leading-relaxed">{p.description}</p>
                  </div>

                  {features.length > 0 && (
                    <div className="pt-2 border-t border-gray-100 space-y-1">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Inclus ({features.length}) :</span>
                      <ul className="space-y-0.5">
                        {features.slice(0, 3).map((f: string, i: number) => (
                          <li key={i} className="text-[10px] text-gray-600 flex items-center gap-1.5 truncate">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></span>
                            <span className="truncate">{f}</span>
                          </li>
                        ))}
                        {features.length > 3 && (
                          <li className="text-[9px] text-gray-400 font-semibold italic">
                            + {features.length - 3} autre(s) avantage(s)...
                          </li>
                        )}
                      </ul>
                    </div>
                  )}
                </div>

                <button
                  type="button"
                  onClick={() => handleDeleteSingleProduct(p.id)}
                  className="w-full mt-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-red-100"
                >
                  <Trash2 size={12} />
                  <span>Retirer du catalogue</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation de sécurité */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="p-2 bg-red-50 rounded-full">
                <AlertTriangle className="w-8 h-8 flex-shrink-0" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900">Effacer toute la boutique ?</h3>
                <span className="text-xs text-red-600 font-semibold">Action irréversible</span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-4 leading-relaxed">
              Êtes-vous certain de vouloir supprimer <strong>définitivement tous les {products.length} articles</strong> du catalogue ?
            </p>

            <div className="mb-5 p-3 bg-red-50/60 border border-red-200 rounded-xl">
              <label className="block text-xs font-semibold text-red-800 mb-1">
                Pour confirmer, veuillez saisir <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-red-300">SUPPRIMER</span> :
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3 py-1.5 bg-white border border-red-300 rounded-lg text-xs font-mono font-bold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
                autoFocus
              />
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsConfirmOpen(false);
                  setConfirmationInput('');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                disabled={isDeleting}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleClearAllProducts}
                disabled={isDeleting || confirmationInput.trim().toUpperCase() !== 'SUPPRIMER'}
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Trash2 className="w-4 h-4" />
                {isDeleting ? "Suppression..." : "Oui, tout supprimer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
export default ShopCatalogAdmin;
