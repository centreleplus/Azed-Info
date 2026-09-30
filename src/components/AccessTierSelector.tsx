import React from 'react';
import { STUDENT_TIERS, StudentTier } from '../types/access';
import { UniversalBadge } from './UniversalBadge';

interface AccessTierSelectorProps {
  selectedTiers: StudentTier[];
  onChange: (tiers: StudentTier[]) => void;
  label?: string;
}

export const AccessTierSelector: React.FC<AccessTierSelectorProps> = ({
  selectedTiers = ['FREEMIUM', 'ESSENTIEL'],
  onChange,
  label = "Tarif / Audience visée (Cocher les catégories autorisées)"
}) => {
  const handleToggle = (tierId: StudentTier) => {
    if (selectedTiers.includes(tierId)) {
      onChange(selectedTiers.filter(t => t !== tierId));
    } else {
      onChange([...selectedTiers, tierId]);
    }
  };

  return (
    <div className="space-y-2 col-span-2">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {Object.values(STUDENT_TIERS).map((tier) => {
          const isChecked = selectedTiers.includes(tier.id);

          return (
            <label
              key={tier.id}
              onClick={() => handleToggle(tier.id)}
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all select-none ${
                isChecked
                  ? `${tier.badgeBg} ${tier.badgeBorder} border-2 shadow-xs`
                  : 'bg-white border-slate-200 opacity-60 hover:opacity-100'
              }`}
            >
              <input
                type="checkbox"
                checked={isChecked}
                onChange={() => {}}
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <UniversalBadge category={tier.label} size="sm" />
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AccessTierSelector;
