import React, { useEffect, useState } from 'react';
import { UniversalBadge } from './UniversalBadge';
import { Check, Zap, ShoppingCart, ArrowRight, ShieldCheck, Sparkles } from 'lucide-react';
import { StoreProduct } from '../data/storeSeedData';

export interface StudentStoreViewProps {
  onSelectProduct?: (product: StoreProduct) => void;
}

export const StudentStoreView: React.FC<StudentStoreViewProps> = ({ onSelectProduct }) => {
  const [products, setProducts] = useState<StoreProduct[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`/api/store/products?t=${Date.now()}`);
        if (res.ok) {
          const data = await res.json();
          if (data.products && Array.isArray(data.products)) {
            setProducts(data.products);
          } else if (Array.isArray(data)) {
            setProducts(data);
          } else {
            setProducts([]);
          }
        } else {
          setProducts([]);
        }
      } catch (err) {
        console.error("Erreur lors de la récupération des offres boutique :", err);
        setProducts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();

    // Synchronisation en direct via BroadcastChannel
    let bc1: BroadcastChannel | null = null;
    let bc2: BroadcastChannel | null = null;
    if (typeof BroadcastChannel !== 'undefined') {
      try {
        bc1 = new BroadcastChannel('azed_boutique_sync');
        bc1.onmessage = () => fetchProducts();
        bc2 = new BroadcastChannel('azed_store_sync');
        bc2.onmessage = () => fetchProducts();
      } catch (e) {}
    }

    const handleLocalSync = () => fetchProducts();
    window.addEventListener('azed_boutique_saved', handleLocalSync);

    return () => {
      if (bc1) bc1.close();
      if (bc2) bc2.close();
      window.removeEventListener('azed_boutique_saved', handleLocalSync);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8">
      {/* Header boutique */}
      <div className="text-center max-w-3xl mx-auto mb-12">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 rounded-full text-emerald-700 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider mb-3">
          <Sparkles className="w-3.5 h-3.5" />
          Offres d'abonnement & Révision
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tight">
          Catalogue & Formules d'Étude
        </h2>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-400 mt-2">
          Choisissez l'offre adaptée à votre rythme d'apprentissage pour exceller tout au long de l'année scolaire et aux examens nationaux.
        </p>
      </div>

      {/* Grille des offres boutique */}
      {products.length === 0 ? (
        <div className="p-12 text-center text-slate-400 font-bold bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 max-w-xl mx-auto shadow-xs">
          Aucune formule d'abonnement n'est actuellement publiée dans la boutique.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((pack) => {
          const isSpecial = pack.badgeLabel === "OFFRE SPÉCIALE" || pack.id === "forfait-annuel-integral";
          const isRevision = pack.badgeLabel === "PREMIUM PLUS" || pack.id === "pack-revision";

          return (
            <div
              key={pack.id}
              className={`relative rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 hover:shadow-xl ${
                isSpecial
                  ? "bg-linear-to-b from-emerald-900 to-slate-900 text-white shadow-lg border-2 border-emerald-500/50"
                  : isRevision
                  ? "bg-white dark:bg-slate-800 border-2 border-amber-400/40 shadow-sm"
                  : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-xs"
              }`}
            >
              {/* Badges en haut */}
              <div className="flex items-center justify-between gap-2 mb-4">
                <UniversalBadge category={pack.badgeLabel} size="sm" />
                {pack.autoAccessBadge && (
                  <span className="px-2.5 py-1 bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 font-extrabold text-[10px] rounded-full uppercase tracking-wider border border-emerald-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3" />
                    {pack.autoAccessBadge}
                  </span>
                )}
                {pack.discountText && (
                  <span className="px-2 py-0.5 bg-rose-600 text-white font-black text-[10px] rounded-full uppercase">
                    {pack.discountText}
                  </span>
                )}
              </div>

              {/* Titre & Description */}
              <div className="space-y-2 mb-6">
                <h3 className={`text-xl font-black ${isSpecial ? "text-white" : "text-slate-900 dark:text-white"}`}>
                  {pack.title}
                </h3>
                <p className={`text-xs leading-relaxed ${isSpecial ? "text-emerald-100/80" : "text-slate-500 dark:text-slate-400"}`}>
                  {pack.description}
                </p>
              </div>

              {/* Tarifs */}
              <div className="mb-6 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800">
                <div className="flex items-baseline gap-2">
                  <span className={`text-3xl font-black ${isSpecial ? "text-emerald-400" : "text-emerald-600 dark:text-emerald-400"}`}>
                    {pack.price} DT
                  </span>
                  {pack.originalPrice && pack.originalPrice > pack.price && (
                    <span className="text-sm line-through text-slate-400 font-semibold">
                      {pack.originalPrice} DT
                    </span>
                  )}
                  <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-auto">
                    / {pack.billingPeriod}
                  </span>
                </div>
              </div>

              {/* Liste des caractéristiques incluses */}
              <div className="space-y-3 mb-8 flex-1">
                <span className={`text-[11px] font-bold uppercase tracking-wider block ${isSpecial ? "text-emerald-300" : "text-slate-400"}`}>
                  Ce qui est inclus :
                </span>
                <ul className="space-y-2.5">
                  {pack.features && pack.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs">
                      <div className={`mt-0.5 p-0.5 rounded-full ${isSpecial ? "bg-emerald-500/20 text-emerald-400" : "bg-emerald-100 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400"}`}>
                        <Check className="w-3.5 h-3.5" />
                      </div>
                      <span className={isSpecial ? "text-slate-200" : "text-slate-700 dark:text-slate-300"}>
                        {feat}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Bouton d'action / Commande */}
              <button
                type="button"
                onClick={() => onSelectProduct ? onSelectProduct(pack) : alert(`Vous avez sélectionné le ${pack.title}`)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 shadow-sm ${
                  isSpecial
                    ? "bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black shadow-emerald-900/40"
                    : "bg-slate-900 hover:bg-slate-800 text-white dark:bg-emerald-600 dark:hover:bg-emerald-500"
                }`}
              >
                <ShoppingCart className="w-4 h-4" />
                <span>Sélectionner l'offre</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
        </div>
      )}

      {/* Garantie / Info réassurance */}
      <div className="mt-12 p-6 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <ShieldCheck className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
          <p className="text-xs text-slate-700 dark:text-slate-300">
            <strong>Activation immédiate :</strong> Accédez sans délai à l'ensemble de vos ressources pédagogiques et séances interactives dès la validation.
          </p>
        </div>
      </div>
    </div>
  );
};

export default StudentStoreView;
