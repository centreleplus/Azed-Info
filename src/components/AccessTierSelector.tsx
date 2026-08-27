import React from 'react';
import { User, Zap, Star, Crown } from 'lucide-react';
import { STUDENT_TIERS, StudentTier } from '../types/access';

interface AccessTierSelectorProps {
  selectedTiers: StudentTier[];
  onChange: (tiers: StudentTier[]) => void;
  label?: string;
}

export const AccessTierSelector: React.FC<AccessTierSelectorProps> = ({
  selectedTiers = ['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS'],
  onChange,
  label = "Tarif / Audience visée (Cocher les catégories autorisées)"
}) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'User': return <User className="w-3.5 h-3.5" />;
      case 'Zap': return <Zap className="w-3.5 h-3.5" />;
      case 'Star': return <Star className="w-3.5 h-3.5" />;
      case 'Crown': return <Crown className="w-3.5 h-3.5" />;
      default: return null;
    }
  };

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
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
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
                onChange={() => {}} // géré par le parent
                className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-slate-300"
              />
              <div className={`px-2 py-0.5 rounded-lg flex items-center gap-1 font-extrabold text-xs ${tier.badgeBg} ${tier.badgeText}`}>
                {getIcon(tier.iconName)}
                <span>{tier.label}</span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
};

export default AccessTierSelector;
