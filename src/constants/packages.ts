import { normalizeBadge, OfficialBadge } from './badges';

export const ALL_PACKS = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'] as const;
export type PackType = typeof ALL_PACKS[number];

export const SUBSCRIPTION_TIERS = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

/**
 * Standardize any tier string into the unified 5 official badges:
 * 'FREEMIUM' | 'ESSENTIEL' | 'LIVE+' | 'REVISION+' | 'INTEGRAL'
 */
export function normalizeSubscriptionTier(val?: string | null): SubscriptionTier {
  return normalizeBadge(val);
}

export const normalizePackName = normalizeBadge;

// Hiérarchie de puissance d'accès
export const PACK_WEIGHTS: Record<string, number> = {
  'FREEMIUM': 1,
  'Freemium': 1,
  'ESSENTIEL': 2,
  'Essentiel': 2,
  'LIVE+': 3,
  'Live +': 3,
  'LIVE +': 3,
  'REVISION+': 4,
  'Révision +': 4,
  'REVISION +': 4,
  'INTEGRAL': 5,
  'Intégrale': 5,
  'INTEGRALE': 5
};

// Par défaut pour la création de contenu (Docs, Quiz, Todo)
export const DEFAULT_SELECTED_PACKS: SubscriptionTier[] = ['FREEMIUM', 'ESSENTIEL'];

export const PACK_COLORS: Record<string, { bg: string; text: string; border: string; badgeBg: string }> = {
  'FREEMIUM': {
    bg: 'bg-gray-100',
    text: 'text-gray-700',
    border: 'border-gray-200',
    badgeBg: 'bg-gray-100'
  },
  'ESSENTIEL': {
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
    badgeBg: 'bg-blue-50'
  },
  'LIVE+': {
    bg: 'bg-purple-50',
    text: 'text-purple-700',
    border: 'border-purple-200',
    badgeBg: 'bg-purple-50'
  },
  'REVISION+': {
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
    badgeBg: 'bg-amber-50'
  },
  'INTEGRAL': {
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
    badgeBg: 'bg-emerald-50'
  }
};

export const BADGE_COLORS: Record<string, string> = {
  'FREEMIUM': 'bg-gray-100 text-gray-700 border border-gray-200',
  'Freemium': 'bg-gray-100 text-gray-700 border border-gray-200',
  'ESSENTIEL': 'bg-blue-50 text-blue-700 border border-blue-200',
  'Essentiel': 'bg-blue-50 text-blue-700 border border-blue-200',
  'LIVE+': 'bg-purple-50 text-purple-700 border border-purple-200',
  'Live +': 'bg-purple-50 text-purple-700 border border-purple-200',
  'LIVE +': 'bg-purple-50 text-purple-700 border border-purple-200',
  'REVISION+': 'bg-amber-50 text-amber-700 border border-amber-200',
  'Révision +': 'bg-amber-50 text-amber-700 border border-amber-200',
  'REVISION +': 'bg-amber-50 text-amber-700 border border-amber-200',
  'INTEGRAL': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'Intégrale': 'bg-emerald-50 text-emerald-700 border border-emerald-200',
  'INTEGRALE': 'bg-emerald-50 text-emerald-700 border border-emerald-200'
};

/**
 * Calcule le forfait le plus élevé parmi une liste de forfaits.
 */
export function getHighestPack(packs?: (string | null | undefined)[]): SubscriptionTier {
  if (!packs || !Array.isArray(packs) || packs.length === 0) {
    return 'FREEMIUM';
  }

  let maxWeight = 0;
  let topPack: SubscriptionTier = 'FREEMIUM';

  for (const p of packs) {
    const norm = normalizeBadge(p);
    const weight = PACK_WEIGHTS[norm] || 1;
    if (weight > maxWeight) {
      maxWeight = weight;
      topPack = norm;
    }
  }

  return topPack;
}
