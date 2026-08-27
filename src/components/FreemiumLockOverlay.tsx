import React from "react";
import { Lock, Sparkles, CreditCard, CheckCircle2 } from "lucide-react";

interface FreemiumLockOverlayProps {
  sectionName: string; // "AI Assistant" | "QCM d'Évaluation" | "Bibliothèque E-Book"
  onGoToShop: () => void;
}

export default function FreemiumLockOverlay({
  sectionName,
  onGoToShop
}: FreemiumLockOverlayProps) {
  return (
    <div className="max-w-2xl mx-auto my-12 border border-red-200 rounded-3xl bg-red-50/10 p-8 sm:p-10 shadow-lg text-center space-y-6 relative overflow-hidden select-none">
      {/* Visual background details */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-red-150/20 rounded-full blur-2xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-150/10 rounded-full blur-2xl pointer-events-none" />

      {/* Modern lock visual badge icon pairing */}
      <div className="relative inline-flex items-center justify-center">
        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#E11D48] to-[#EF4444] shadow-md flex items-center justify-center text-white text-3xl animate-pulse">
          <Lock className="stroke-[2.5] w-7 h-7" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center shadow-xs">
          <Sparkles size={12} className="fill-current" />
        </div>
      </div>

      <div className="space-y-3">
        <span className="text-[10px] font-extrabold text-[#E11D48] uppercase tracking-widest bg-red-100/60 px-3 py-1 rounded-full border border-red-200/50 inline-block">
          Espace Exclusif Premium ⭐
        </span>
        <h2 className="text-[#0F1E36] font-extrabold text-xl tracking-tight leading-snug">
          La section "{sectionName}" est verrouillée
        </h2>
        <p className="text-xs text-gray-500 max-w-md mx-auto leading-relaxed font-semibold">
          Vous utilisez actuellement l'accès <strong>Freemium gratuit</strong>. Pour débloquer l'intégration Premium complète : l'ensemble des manuels scolaires interactifs, les QCM d'examens types du BAC tunisien, et tous les cours de M. Nabil Chaouch.
        </p>
      </div>

      <hr className="border-red-150/40 w-3/4 mx-auto" />

      {/* Brief Value proposition list */}
      <div className="bg-white border border-red-100 rounded-2xl p-5 max-w-md mx-auto space-y-3 text-left">
        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-wider text-center border-b border-gray-100 pb-1.5">
          Ce que comprend la formule Premium
        </p>
        <ul className="space-y-2 text-[11px] text-gray-600">
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold shrink-0">✓</span>
            <span><b>Accès illimité :</b> Bibliothèque E-books, QCM thématiques & Épreuves BAC</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold shrink-0">✓</span>
            <span><b>Boutique & Livres :</b> Manuels officiels et carnets pour réviser en toute autonomie</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-emerald-500 font-bold shrink-0">✓</span>
            <span><b>Validation simple :</b> Support physique ou paiement rapide par D17 / RIB</span>
          </li>
        </ul>
      </div>

      {/* Dynamic CTAs */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
        <button
          onClick={onGoToShop}
          className="w-full sm:w-auto px-6 py-3 bg-[#E11D48] hover:bg-rose-700 text-white rounded-xl text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-sm hover:shadow-md cursor-pointer flex items-center justify-center gap-2 transform active:scale-95"
          id={`unlock-btn-${sectionName}`}
        >
          <span>Débloquer mon statut Premium (120 DT)</span>
          <span>&rarr;</span>
        </button>
      </div>

      <p className="text-[10px] text-gray-400 font-mono">
        Règlement unique valable toute l'année scolaire en cours.
      </p>
    </div>
  );
}
