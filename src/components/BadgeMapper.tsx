import React from 'react';
import { 
  CategoryKey, 
  BadgeStyle, 
  BADGE_STYLES, 
  parseUserCategory, 
  SUBSCRIPTION_OPTIONS 
} from '../services/BadgeMapper';
import { UnifiedBadge } from './BadgeConfig';

export type { CategoryKey, BadgeStyle };
export { BADGE_STYLES, parseUserCategory, SUBSCRIPTION_OPTIONS };

// Composant Select mis à jour pour le formulaire Admin
export const SubscriptionSelect: React.FC<{ value: string; onChange: (val: string) => void }> = ({ value, onChange }) => {
  const currentCategory = parseUserCategory(value);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
        TYPE D'ABONNEMENT (FORFAIT)
      </label>
      <select
        value={currentCategory}
        onChange={(e) => onChange(e.target.value)}
        className="w-full h-10 px-3 rounded-xl border border-slate-200 bg-white text-xs font-semibold text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
      >
        {SUBSCRIPTION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
};

// Rendu Dynamique du Badge dans la Liste Admin
export const AdminUserRowBadge: React.FC<{ offerType?: string; size?: 'sm' | 'md' }> = ({ offerType, size = 'sm' }) => {
  return <UnifiedBadge category={offerType} size={size} />;
};

export default {
  BADGE_STYLES,
  parseUserCategory,
  SUBSCRIPTION_OPTIONS,
  SubscriptionSelect,
  AdminUserRowBadge
};
