import React from 'react';
import { PackOffer } from './PacksService';

export const PackCard: React.FC<{ pack: PackOffer; onSelect?: () => void }> = ({ pack, onSelect }) => {
  return (
    <div className={`relative overflow-hidden rounded-3xl border ${pack.borderColor} ${pack.bgColor} p-6 flex flex-col justify-between shadow-sm transition-all hover:shadow-md h-full text-left`}>
      <div>
        {/* Badge Superior */}
        {pack.badge && (
          <div className="mb-3">
            <span className="inline-block px-3 py-1 text-[10px] font-extrabold tracking-wider rounded-full bg-white/90 text-slate-700 border border-slate-200 uppercase shadow-2xs">
              {pack.badge}
            </span>
          </div>
        )}

        <h3 className="text-xl font-bold text-slate-800 mb-2">{pack.title}</h3>
        
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-3xl font-black text-slate-900">{pack.price}</span>
          {pack.oldPrice && (
            <span className="text-xs text-slate-400 line-through font-semibold">{pack.oldPrice}</span>
          )}
          <span className="text-xs text-slate-500 font-medium">/ {pack.period}</span>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium">
          {pack.description}
        </p>

        <ul className="space-y-2 mb-6">
          {pack.features.map((feat, idx) => (
            <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
              <span className="text-emerald-600 bg-white rounded-full p-0.5 text-[10px] shadow-2xs">✓</span>
              <span>{feat}</span>
            </li>
          ))}
        </ul>
      </div>

      <button 
        onClick={onSelect}
        className={`w-full py-2.5 rounded-xl text-white font-bold text-sm shadow-sm transition-all active:scale-95 cursor-pointer ${pack.buttonColor}`}
      >
        Choisir
      </button>
    </div>
  );
};

export default PackCard;
