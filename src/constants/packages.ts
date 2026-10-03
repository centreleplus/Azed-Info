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
  const clean = val.trim();

  if (clean === 'Freemium' || clean.toUpperCase() === 'FREEMIUM') return 'FREEMIUM';
  if (clean === 'Essentiel' || clean.toUpperCase() === 'ESSENTIEL') return 'ESSENTIEL';
  if (clean === 'Live +' || clean.toUpperCase() === 'LIVE +' || clean.toUpperCase() === 'LIVE+') return 'LIVE +';
  if (clean === 'Révision +' || clean.toUpperCase() === 'RÉVISION +' || clean.toUpperCase() === 'REVISION +' || clean.toUpperCase() === 'REVISION+') return 'RÉVISION +';
  if (clean === 'Intégrale' || clean.toUpperCase() === 'INTÉGRALE' || clean.toUpperCase() === 'INTEGRALE') return 'INTÉGRALE';

  const lower = clean.toLowerCase();
  if (lower.includes('essent') || lower.includes('120') || lower.includes('pass')) {
    return 'ESSENTIEL';
  }
  if (lower.includes('live') || lower.includes('150')) {
    return 'LIVE +';
  }
  if (lower.includes('révis') || lower.includes('revis') || lower.includes('140') || (lower.includes('plus') && !lower.includes('live') && !lower.includes('++'))) {
    return 'RÉVISION +';
  }
  if (lower.includes('intégr') || lower.includes('integ') || lower.includes('350') || lower.includes('++')) {
    return 'INTÉGRALE';
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

export const BADGE_COLORS: Record<string, string> = {
  'Freemium': 'bg-gray-100 text-gray-700 border border-gray-300',
  'FREEMIUM': 'bg-gray-100 text-gray-700 border border-gray-300',
  'Essentiel': 'bg-blue-100 text-blue-700 border border-blue-300',
  'ESSENTIEL': 'bg-blue-100 text-blue-700 border border-blue-300',
  'Live +': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
  'LIVE +': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
  'LIVE+': 'bg-emerald-100 text-emerald-700 border border-emerald-300',
  'Révision +': 'bg-purple-100 text-purple-700 border border-purple-300',
  'RÉVISION +': 'bg-purple-100 text-purple-700 border border-purple-300',
  'REVISION +': 'bg-purple-100 text-purple-700 border border-purple-300',
  'Intégrale': 'bg-amber-100 text-amber-700 border border-amber-300',
  'INTÉGRALE': 'bg-amber-100 text-amber-700 border border-amber-300',
  'INTEGRALE': 'bg-amber-100 text-amber-700 border border-amber-300'
};

/**
 * Normalise n'importe quelle chaîne ou identifiant vers l'un des 5 forfaits autorisés.
 */
export function normalizePackName(val?: string | null): PackType {
  if (!val || typeof val !== 'string') return 'Freemium';
  const clean = val.trim();

  if (clean === 'Freemium' || clean.toLowerCase() === 'freemium') return 'Freemium';
  if (clean === 'Essentiel' || clean.toLowerCase() === 'essentiel') return 'Essentiel';
  if (clean === 'Live +' || clean.toLowerCase() === 'live +' || clean.toLowerCase() === 'live+') return 'Live +';
  if (clean === 'Révision +' || clean.toLowerCase() === 'révision +' || clean.toLowerCase() === 'revision +' || clean.toLowerCase() === 'revision+') return 'Révision +';
  if (clean === 'Intégrale' || clean.toLowerCase() === 'intégrale' || clean.toLowerCase() === 'integrale') return 'Intégrale';

  const lower = clean.toLowerCase();
  if (lower.includes('essent') || lower.includes('120') || lower.includes('pass')) {
    return 'Essentiel';
  }
  if (lower.includes('live') || lower.includes('150')) {
    return 'Live +';
  }
  if (lower.includes('révis') || lower.includes('revis') || lower.includes('140') || (lower.includes('plus') && !lower.includes('live') && !lower.includes('++'))) {
    return 'Révision +';
  }
  if (lower.includes('intégr') || lower.includes('integ') || lower.includes('350') || lower.includes('++')) {
    return 'Intégrale';
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
