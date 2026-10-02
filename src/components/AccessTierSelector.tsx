import React from 'react';
import { SUBSCRIPTION_TIERS, SubscriptionTier, normalizeSubscriptionTier } from '../constants/packages';

interface AccessTierSelectorProps {
  selectedTiers?: (SubscriptionTier | string)[];
  onChange: (tiers: SubscriptionTier[]) => void;
  label?: string;
}

export const AccessTierSelector: React.FC<AccessTierSelectorProps> = ({
  selectedTiers = ['FREEMIUM', 'ESSENTIEL'],
  onChange,
  label = "Tarif / Audience visée (Cocher les catégories autorisées)"
}) => {
  const normalizedSelected = (Array.isArray(selectedTiers) ? selectedTiers : [selectedTiers]).map((t) =>
    normalizeSubscriptionTier(t)
  );

  const isSelected = (tier: SubscriptionTier) => {
    return normalizedSelected.includes(tier);
  };

  const handleToggle = (tier: SubscriptionTier) => {
    if (isSelected(tier)) {
      onChange(normalizedSelected.filter((t) => t !== tier));
    } else {
      onChange([...normalizedSelected, tier]);
    }
  };

  const TIER_COLORS: Record<SubscriptionTier, { badgeBg: string; text: string; border: string }> = {
    'FREEMIUM': { badgeBg: 'bg-gray-200', text: 'text-gray-800', border: 'border-gray-300' },
    'ESSENTIEL': { badgeBg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
    'LIVE +': { badgeBg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
    'RÉVISION +': { badgeBg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' },
    'INTÉGRALE': { badgeBg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' }
  };

  return (
    <div className="space-y-2 col-span-2 text-left">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const colors = TIER_COLORS[tier];
          const checked = isSelected(tier);

          return (
            <label
              key={tier}
              className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition-all select-none ${
                checked
                  ? `${colors.badgeBg} ${colors.border} border-2 shadow-xs`
                  : 'bg-white border-slate-200 opacity-70 hover:opacity-100'
              }`}
            >
              <input
                type="checkbox"
                checked={checked}
                onChange={() => handleToggle(tier)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className={`px-2 py-0.5 text-xs font-bold uppercase rounded-md ${colors.text}`}>
                {tier}
              </span>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AccessTierSelector;
