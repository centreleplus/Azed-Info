export const ALL_PACKS = ['Freemium', 'Essentiel', 'Live +', 'Révision +', 'Intégrale'] as const;
export type PackType = typeof ALL_PACKS[number];

export const SUBSCRIPTION_TIERS = ['FREEMIUM', 'ESSENTIEL', 'LIVE +', 'RÉVISION +', 'INTÉGRALE'] as const;
export type SubscriptionTier = typeof SUBSCRIPTION_TIERS[number];

/**
 * Standardize any tier string into the unified SubscriptionTier enum:
 * 'FREEMIUM' | 'ESSENTIEL' | 'LIVE +' | 'RÉVISION +' | 'INTÉGRALE'
 */
export function normalizeSubscriptionTier(val?: string | null): SubscriptionTier {
  if (!val || typeof val !== 'string') return 'FREEMIUM';
  const clean = val.trim().toUpperCase();

  if (clean === 'FREEMIUM') return 'FREEMIUM';
  if (clean === 'ESSENTIEL') return 'ESSENTIEL';
  if (clean === 'LIVE +' || clean === 'LIVE+' || clean === 'LIVE_PLUS') return 'LIVE +';
  if (clean === 'RÉVISION +' || clean === 'REVISION +' || clean === 'REVISION+') return 'RÉVISION +' ;
  if (clean === 'INTÉGRALE' || clean === 'INTEGRALE') return 'INTÉGRALE';

  const lower = val.trim().toLowerCase();
  if (lower.includes('intégr') || lower.includes('integ') || lower.includes('350') || lower.includes('annuel') || lower.includes('++')) {
    return 'INTÉGRALE';
  }
  if (lower.includes('révis') || lower.includes('revis') || lower.includes('140') || (lower.includes('plus') && !lower.includes('live'))) {
    return 'RÉVISION +';
  }
  if (lower.includes('live') || lower.includes('150') || lower.includes('standard')) {
    return 'LIVE +';
  }
  if (lower.includes('essent') || lower.includes('120') || lower.includes('pass')) {
    return 'ESSENTIEL';
  }
  if (lower.includes('premium')) {
    if (lower.includes('++')) return 'INTÉGRALE';
    if (lower.includes('+')) return 'RÉVISION +';
    return 'LIVE +';
  }

  return 'FREEMIUM';
}

// Hiérarchie de puissance d'accès
export const PACK_WEIGHTS: Record<PackType, number> = {
  'Freemium': 1,
  'Essentiel': 2,
  'Live +': 3,
  'Révision +': 4,
  'Intégrale': 5
};

// Par défaut pour la création de contenu (Docs, Quiz, Todo)
export const DEFAULT_SELECTED_PACKS: PackType[] = ['Freemium', 'Essentiel'];

export const PACK_COLORS: Record<PackType, { bg: string; text: string; border: string; badgeBg: string }> = {
  'Freemium': {
    bg: 'bg-slate-100',
    text: 'text-slate-800',
    border: 'border-slate-300',
    badgeBg: 'bg-slate-50'
  },
  'Essentiel': {
    bg: 'bg-blue-100',
    text: 'text-blue-900',
    border: 'border-blue-300',
    badgeBg: 'bg-blue-50'
  },
  'Live +': {
    bg: 'bg-emerald-100',
    text: 'text-emerald-900',
    border: 'border-emerald-300',
    badgeBg: 'bg-emerald-50'
  },
  'Révision +': {
    bg: 'bg-indigo-100',
    text: 'text-indigo-900',
    border: 'border-indigo-300',
    badgeBg: 'bg-indigo-50'
  },
  'Intégrale': {
    bg: 'bg-purple-100',
    text: 'text-purple-900',
    border: 'border-purple-300',
    badgeBg: 'bg-purple-50'
  }
};

/**
 * Normalise n'importe quelle chaîne ou identifiant vers l'un des 5 forfaits autorisés.
 */
export function normalizePackName(val?: string | null): PackType {
  if (!val || typeof val !== 'string') return 'Freemium';
  const clean = val.trim().toLowerCase();

  if (clean.includes('intégr') || clean.includes('integ') || clean.includes('350') || clean.includes('annuel') || clean.includes('plus plus') || clean.includes('++')) {
    return 'Intégrale';
  }
  if (clean.includes('révis') || clean.includes('revis') || clean.includes('140') || clean.includes('revision_plus') || (clean.includes('plus') && !clean.includes('live'))) {
    return 'Révision +';
  }
  if (clean.includes('live') || clean.includes('live_plus') || clean.includes('150') || clean.includes('trimestre') || clean.includes('standard')) {
    return 'Live +';
  }
  if (clean.includes('essentiel') || clean.includes('120') || clean.includes('pass')) {
    return 'Essentiel';
  }
  if (clean.includes('premium')) {
    // Si mention premium générique
    if (clean.includes('++')) return 'Intégrale';
    if (clean.includes('+')) return 'Révision +';
    return 'Live +';
  }

  return 'Freemium';
}

/**
 * Calcule le forfait le plus élevé parmi une liste de forfaits.
 */
export function getHighestPack(packs?: (string | null | undefined)[]): PackType {
  if (!packs || !Array.isArray(packs) || packs.length === 0) {
    return 'Freemium';
  }

  let maxWeight = 0;
  let topPack: PackType = 'Freemium';

  for (const p of packs) {
    const norm = normalizePackName(p);
    const weight = PACK_WEIGHTS[norm] || 1;
    if (weight > maxWeight) {
      maxWeight = weight;
      topPack = norm;
    }
  }

  return topPack;
}
