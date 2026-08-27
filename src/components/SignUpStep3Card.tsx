import React from 'react';
import { CampaignPack } from './campaignsStore';

export interface SignUpStep3CardProps {
  pack: CampaignPack;
  onSelect: () => void;
}

export const SignUpStep3Card: React.FC<SignUpStep3CardProps> = ({
  pack,
  onSelect,
}) => {
  const hasDiscount = pack.originalPrice > pack.finalPrice;
  const discountPercent = hasDiscount
    ? Math.round(((pack.originalPrice - pack.finalPrice) / pack.originalPrice) * 100)
    : 0;
  const isEssentiel = pack.category === 'Essentiel' || pack.autoAccessAllResources;

  return (
    <div className={`p-6 bg-white border rounded-3xl flex flex-col justify-between shadow-sm relative text-left transition-all ${
      isEssentiel ? 'border-amber-400 bg-amber-50/10' : 'border-slate-200 hover:border-emerald-500'
    }`}>
      {pack.isPopular && (
        <span className="absolute -top-3 right-6 px-3 py-0.5 bg-amber-500 text-white font-black text-[9px] rounded-full uppercase tracking-wider shadow-sm">
          Populaire
        </span>
      )}

      <div className="space-y-4">
        {/* En-tête : Badge + Icône Agrandie 2,5x */}
        <div className="flex items-start justify-between gap-3">
          <span className={`px-3 py-1 text-[10px] font-black rounded-lg uppercase ${
            isEssentiel 
              ? 'bg-amber-100 text-amber-800 border border-amber-300' 
              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
          }`}>
            {pack.badgeLabel}
          </span>

          {/* Icône agrandie x2.5 (100px x 100px au lieu de 40px) */}
          {pack.iconUrl && (
            <div className="w-[100px] h-[100px] rounded-2xl bg-slate-50 border border-slate-200 p-2 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
              <img 
                src={pack.iconUrl} 
                alt="Logo Offre" 
                className="max-w-full max-h-full object-contain mx-auto my-auto" 
              />
            </div>
          )}
        </div>

        <div>
          <h3 className="font-black text-xl text-slate-900">{pack.title}</h3>
          <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[36px]">{pack.description}</p>
        </div>

        {/* Liste des Avantages */}
        {pack.features && pack.features.length > 0 && (
          <div className="pt-2 space-y-1.5">
            {pack.features.map((feat, idx) => (
              <div key={idx} className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <span className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
                  isEssentiel ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'
                }`}>
                  ✓
                </span>
                <span>{feat}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Zone Prix & Badge Rouge Vif sous les prix */}
      <div className="mt-8 pt-4 border-t border-slate-100 space-y-3">
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-slate-900">{pack.finalPrice} DT</span>
          {hasDiscount && (
            <span className="text-xs font-bold text-slate-400 line-through">
              {pack.originalPrice} DT
            </span>
          )}
        </div>

        {/* Badge de réduction Rouge Vif avec pourcentage et économie réalisée */}
        {hasDiscount && (
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-600 text-white rounded-lg shadow-sm">
            <span className="font-black text-xs tracking-wider">-{discountPercent}%</span>
            <span className="text-[10px] font-bold border-l border-red-400 pl-2">
              Économisez {pack.originalPrice - pack.finalPrice} DT
            </span>
          </div>
        )}

        <div className="flex items-center justify-between pt-2">
          <span className="text-[10px] font-semibold text-slate-400">{pack.period}</span>
          <button
            type="button"
            onClick={onSelect}
            className={`px-8 py-3 text-white font-black text-sm rounded-xl transition-all shadow-sm cursor-pointer active:scale-95 ${
              isEssentiel 
                ? 'bg-amber-600 hover:bg-amber-700' 
                : 'bg-emerald-600 hover:bg-emerald-700'
            }`}
          >
            Choisir
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpStep3Card;
