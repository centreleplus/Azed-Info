import React from 'react';
import { SUBSCRIPTION_TIERS, SubscriptionTier } from '../constants/packages';
import { normalizeBadge, OfficialBadge } from '../constants/badges';

interface AccessTierSelectorProps {
  selectedTiers?: (SubscriptionTier | string)[];
  onChange: (tiers: SubscriptionTier[]) => void;
  label?: string;
}

export const AccessTierSelector: React.FC<AccessTierSelectorProps> = ({
  selectedTiers = ['FREEMIUM', 'ESSENTIEL'],
  onChange,
  label = "Badge d'Accès Requis (Cocher les catégories autorisées)"
}) => {
  const normalizedSelected: OfficialBadge[] = (Array.isArray(selectedTiers) ? selectedTiers : [selectedTiers]).map((t) =>
    normalizeBadge(t)
  );

  const isSelected = (tier: OfficialBadge) => {
    return normalizedSelected.includes(tier);
  };

  const handleToggle = (tier: OfficialBadge) => {
    if (isSelected(tier)) {
      const filtered = normalizedSelected.filter((t) => t !== tier);
      onChange(filtered.length > 0 ? (filtered as SubscriptionTier[]) : ['FREEMIUM']);
    } else {
      onChange([...normalizedSelected, tier] as SubscriptionTier[]);
    }
  };

  const TIER_COLORS: Record<OfficialBadge, { badgeBg: string; text: string; border: string }> = {
    'FREEMIUM': { badgeBg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
    'ESSENTIEL': { badgeBg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-300' },
    'LIVE+': { badgeBg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-300' },
    'REVISION+': { badgeBg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-300' },
    'INTEGRAL': { badgeBg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-300' }
  };

  return (
    <div className="space-y-2 col-span-2 text-left">
      <label className="block text-xs font-bold text-slate-700">{label}</label>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
        {SUBSCRIPTION_TIERS.map((tier) => {
          const colors = TIER_COLORS[tier as OfficialBadge] || TIER_COLORS['FREEMIUM'];
          const checked = isSelected(tier as OfficialBadge);

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
                onChange={() => handleToggle(tier as OfficialBadge)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300 cursor-pointer"
              />
              <span className={`px-2 py-0.5 text-xs font-black uppercase rounded-md ${colors.text}`}>
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
