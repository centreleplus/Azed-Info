import React, { useState, useEffect } from 'react';
import { Trash2, AlertTriangle, Plus, RefreshCw, ShoppingBag, Store, Tag } from 'lucide-react';
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
      {/* En-tête de la section avec le bouton Tout supprimer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-base font-bold text-[#0F1E36]">
              Catalogue de la Boutique ({products.length})
            </h3>
            {products.length > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-emerald-100 text-emerald-800">
                {products.length} {products.length > 1 ? 'articles actifs' : 'article actif'}
              </span>
            )}
          </div>
          <p className="text-xs text-gray-400 mt-0.5">
            La grille tarifaire et les articles mis en vente dans l'espace boutique des lycéens.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {products.length > 0 && (
            <button
              onClick={() => {
                setConfirmationInput('');
                setIsConfirmOpen(true);
              }}
              className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-colors shadow-sm text-sm cursor-pointer active:scale-95"
              title="Supprimer l'intégralité du catalogue boutique"
            >
              <Trash2 className="w-4 h-4" />
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
          <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
            Aucun produit n'est proposé aux élèves. Utilisez le formulaire d'ajout pour créer vos packs d'abonnement ou supports d'étude.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[550px] overflow-y-auto pr-1">
          {products.map((p) => {
            const badgeLabel = getPromoBadgeLabel(p);
            return (
              <div
                key={p.id}
                className="p-3 border border-[#E5E7EB] rounded-xl bg-[#F9FAFB] flex flex-col justify-between hover:border-[#10B981] transition-all text-xs relative group"
              >
                {badgeLabel && (
                  <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                    {badgeLabel}
                  </span>
                )}
                <div className="space-y-2">
                  <img
                    src={p.image || "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400"}
                    alt={p.title}
                    className="w-full h-24 object-cover rounded-lg border border-gray-100"
                  />
                  <div className="text-left">
                    <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase">
                      <span>{p.category}</span>
                      <div className="flex items-center gap-1.5">
                        {p.oldPrice && p.oldPrice > p.price && (
                          <span className="line-through text-gray-400 font-normal">{p.oldPrice} TND</span>
                        )}
                        <span className="text-[#10B981] font-extrabold">{p.price} TND</span>
                      </div>
                    </div>
                    <h4 className="font-semibold text-gray-900 mt-1">{p.title}</h4>
                    <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDeleteSingleProduct(p.id)}
                  className="w-full mt-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-red-100"
                >
                  <Trash2 size={12} />
                  <span>Retirer</span>
                </button>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal de confirmation de sécurité (Double confirmation) */}
      {isConfirmOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl border border-gray-100 animate-in fade-in zoom-in duration-200">
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
              Êtes-vous certain de vouloir supprimer <strong>définitivement tous les {products.length} articles</strong> du catalogue ? Cette action est irréversible et retirera les packs/offres du tableau de bord des étudiants.
            </p>

            <div className="mb-5 p-3 bg-red-50/60 border border-red-200 rounded-lg">
              <label className="block text-xs font-semibold text-red-800 mb-1">
                Pour confirmer, veuillez saisir <span className="font-mono font-bold bg-white px-1.5 py-0.5 rounded border border-red-300">SUPPRIMER</span> :
              </label>
              <input
                type="text"
                value={confirmationInput}
                onChange={(e) => setConfirmationInput(e.target.value)}
                placeholder="SUPPRIMER"
                className="w-full px-3 py-1.5 bg-white border border-red-300 rounded text-xs font-mono font-bold text-red-900 focus:outline-none focus:ring-2 focus:ring-red-500/20"
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
                className="px-4 py-2 text-sm font-semibold text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center gap-2 cursor-pointer shadow-sm"
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
