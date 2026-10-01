import React from 'react';
import { ALL_PACKS, PackType } from '../constants/packages';
import { STUDENT_TIERS, StudentTier } from '../types/access';
import { UniversalBadge } from './UniversalBadge';

interface AccessTierSelectorProps {
  selectedTiers?: (StudentTier | string)[];
  onChange: (tiers: any[]) => void;
  label?: string;
}

export const AccessTierSelector: React.FC<AccessTierSelectorProps> = ({
  selectedTiers = ['FREEMIUM'],
  onChange,
  label = "Tarif / Audience visée (Cocher les catégories autorisées)"
}) => {
  const isSelected = (pack: string) => {
    return selectedTiers.some(t => {
      if (!t) return false;
      const lowerT = String(t).trim().toLowerCase();
      const lowerP = pack.toLowerCase();
      if (lowerT === lowerP) return true;
      if (pack === 'Freemium' && lowerT === 'freemium') return true;
      if (pack === 'Essentiel' && lowerT === 'essentiel') return true;
      if (pack === 'Live +' && (lowerT === 'live_plus' || lowerT === 'premium')) return true;
      if (pack === 'Révision +' && (lowerT === 'revision_plus' || lowerT === 'premium+')) return true;
      if (pack === 'Intégrale' && (lowerT === 'integrale' || lowerT === 'premium++')) return true;
      return false;
    });
  };

  const handleToggle = (pack: PackType) => {
    if (isSelected(pack)) {
      onChange(selectedTiers.filter(t => {
        const lowerT = String(t).trim().toLowerCase();
        const lowerP = pack.toLowerCase();
        if (lowerT === lowerP) return false;
        if (pack === 'Freemium' && lowerT === 'freemium') return false;
        if (pack === 'Essentiel' && lowerT === 'essentiel') return false;
        if (pack === 'Live +' && (lowerT === 'live_plus' || lowerT === 'premium')) return false;
        if (pack === 'Révision +' && (lowerT === 'revision_plus' || lowerT === 'premium+')) return false;
        if (pack === 'Intégrale' && (lowerT === 'integrale' || lowerT === 'premium++')) return false;
        return true;
      }));
    } else {
      onChange([...selectedTiers, pack]);
    }
  };

  return (
    <div className="space-y-2 col-span-2 text-left">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {ALL_PACKS.map((pack) => {
          const tier = STUDENT_TIERS[pack] || STUDENT_TIERS['Freemium'];
          const checked = isSelected(pack);

          return (
            <label
              key={pack}
              onClick={() => handleToggle(pack)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all select-none ${
                checked
                  ? `${tier.badgeBg} ${tier.badgeBorder} border-2 shadow-xs`
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => {}}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <UniversalBadge category={pack} size="sm" />
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AccessTierSelector;
