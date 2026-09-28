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
  const isEssentiel = pack.id === 'pack-essentiel' || pack.category === 'Essentiel' || pack.autoAccessAllResources;

  // Exact pastel styling from pack configuration or category fallback
  const pastelStyle = pack.bgColor && pack.borderColor
    ? `${pack.bgColor} ${pack.borderColor} hover:border-slate-300`
    : (isEssentiel
        ? 'bg-slate-50 border-slate-200 hover:border-slate-300'
        : (pack.id === 'pack-premium' || pack.category === 'Premium'
            ? 'bg-emerald-50/70 border-emerald-200 hover:border-emerald-300'
            : (pack.id === 'pack-revision' || pack.category === 'Révision'
                ? 'bg-rose-50/70 border-rose-200 hover:border-rose-300'
                : 'bg-amber-50/70 border-amber-200 hover:border-amber-300')));

  return (
    <div 
      className={`relative overflow-hidden rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-md text-left p-6 flex flex-col justify-between ${pastelStyle}`}
    >
      <div className="h-full flex flex-col justify-between">
        {pack.isPopular && (
          <span className="absolute top-3 right-6 px-3 py-0.5 bg-amber-500 text-white font-black text-[9px] rounded-full uppercase tracking-wider shadow-sm z-10">
            Recommandé
          </span>
        )}

        <div className="space-y-4">
          {/* En-tête : Badge */}
          <div className="flex items-start justify-between gap-3">
            <span className="inline-block px-3 py-1 text-[10px] font-extrabold tracking-wider rounded-full bg-white/90 text-slate-700 border border-slate-200 uppercase shadow-2xs">
              {pack.badgeLabel || 'PREMIUM'}
            </span>

            {pack.iconUrl && (
              <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                <img 
                  src={pack.iconUrl} 
                  alt="Logo Offre" 
                  className="max-w-full max-h-full object-contain mx-auto my-auto" 
                />
              </div>
            )}
          </div>

          <div>
            <h3 className="font-bold text-xl text-slate-800 mb-1">{pack.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed font-medium min-h-[36px]">{pack.description}</p>
          </div>

          {/* Liste des Avantages */}
          {pack.features && pack.features.length > 0 && (
            <ul className="space-y-2 mb-4 pt-1">
              {pack.features.map((feat, idx) => (
                <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                  <span className="text-emerald-600 bg-white rounded-full p-0.5 text-[10px] shadow-2xs shrink-0 font-bold">✓</span>
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Zone Prix & Bouton */}
        <div className="mt-6 pt-4 border-t border-slate-200/60 space-y-3">
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{pack.finalPrice} DT</span>
            {hasDiscount && (
              <span className="text-xs text-slate-400 line-through font-semibold">
                {pack.originalPrice} DT
              </span>
            )}
            <span className="text-xs text-slate-500 font-medium">/ {pack.period}</span>
          </div>

          {hasDiscount && (
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 bg-red-600 text-white rounded-full text-[10px] font-bold shadow-2xs">
              <span>-{discountPercent}%</span>
              <span className="border-l border-red-400 pl-1.5">
                Économisez {pack.originalPrice - pack.finalPrice} DT
              </span>
            </div>
          )}

          <button
            type="button"
            onClick={onSelect}
            className={`w-full py-2.5 rounded-xl text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer mt-2 ${pack.buttonColor || 'bg-emerald-600 hover:bg-emerald-700'}`}
          >
            Choisir
          </button>
        </div>
      </div>
    </div>
  );
};

export default SignUpStep3Card;
