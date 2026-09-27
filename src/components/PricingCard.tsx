import React from 'react';

export interface PricingCardProps {
  badgeText?: string;
  badgeColor?: string;
  title: string;
  description: string;
  features: string[];
  price: string;
  oldPrice?: string;
  discountBadge?: string;
  periodText?: string;
  buttonText?: string;
  buttonColor?: string;
  variant?: 'blue' | 'green' | 'pink' | 'orange';
  onSelect?: () => void;
}

const PASTEL_STYLES = {
  blue: "bg-blue-50/70 border-blue-200 hover:border-blue-300",
  green: "bg-emerald-50/70 border-emerald-200 hover:border-emerald-300",
  pink: "bg-rose-50/70 border-rose-200 hover:border-rose-300",
  orange: "bg-amber-50/70 border-amber-200 hover:border-amber-300",
};

export const PricingCard: React.FC<PricingCardProps> = ({
  badgeText,
  badgeColor,
  title,
  description,
  features,
  price,
  oldPrice,
  discountBadge,
  periodText = "TND / Annuel",
  buttonText = "Choisir",
  buttonColor = "bg-emerald-600 hover:bg-emerald-700",
  variant = "green",
  onSelect
}) => {
  return (
    <div 
      /* Uniquement la couleur pastel unie en fond, sans aucune image */
      className={`relative overflow-hidden rounded-3xl border shadow-sm transition-all duration-300 hover:shadow-md p-6 md:p-8 flex flex-col justify-between text-left ${PASTEL_STYLES[variant]}`}
    >
      <div>
        {/* Badge supérieur */}
        {badgeText && (
          <div className="mb-4">
            <span className={`inline-block px-3 py-1 text-xs font-bold tracking-wider rounded-full uppercase shadow-2xs ${badgeColor || 'bg-white/80 text-slate-700 border border-slate-200'}`}>
              {badgeText}
            </span>
          </div>
        )}

        {/* Titre et Description */}
        <h3 className="text-2xl font-extrabold text-slate-800 mb-2">{title}</h3>
        <p className="text-sm text-slate-600 leading-relaxed mb-6 font-medium">
          {description}
        </p>

        {/* Liste des fonctionnalités */}
        <ul className="space-y-3 mb-8">
          {features.map((feature, idx) => (
            <li key={idx} className="flex items-start gap-2.5 text-sm font-semibold text-slate-700">
              <span className="text-emerald-600 bg-white rounded-full p-0.5 text-xs shadow-2xs font-bold">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* Pied de carte : Prix et Bouton */}
      <div>
        <div className="flex items-baseline gap-3 mb-3">
          <span className="text-4xl font-black text-slate-900">{price}</span>
          {oldPrice && (
            <span className="text-lg text-slate-400 line-through font-semibold">{oldPrice}</span>
          )}
        </div>

        {discountBadge && (
          <div className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-6 shadow-2xs">
            {discountBadge}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-slate-200/80 mt-2">
          <span className="text-xs font-semibold text-slate-500 uppercase">{periodText}</span>
          <button 
            type="button"
            onClick={onSelect}
            className={`${buttonColor} text-white font-bold px-6 py-2.5 rounded-xl shadow-sm transition-all hover:scale-105 cursor-pointer active:scale-95`}
          >
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};

export const PackCard = PricingCard;
export default PricingCard;
