export const BADGE_LEVELS: Record<string, number> = {
  'Freemium': 1,
  'FREEMIUM': 1,
  'Essentiel': 2,
  'ESSENTIEL': 2,
  'Live +': 3,
  'LIVE +': 3,
  'LIVE+': 3,
  'Révision +': 4,
  'RÉVISION +': 4,
  'REVISION +': 4,
  'REVISION+': 4,
  'Intégrale': 5,
  'INTÉGRALE': 5,
  'INTEGRALE': 5
};

export const MAPPING_OLD_TO_NEW_BADGES: Record<string, string> = {
  'Premium': 'Essentiel',
  'Premium+': 'Live +',
  'Premium++': 'Intégrale',
  'PREMIUM': 'Essentiel',
  'PREMIUM+': 'Live +',
  'PREMIUM++': 'Intégrale',
  'PREMIUM_PLUS': 'Live +',
  'PREMIUM_PLUS_PLUS': 'Intégrale',
  'STUDENT': 'Freemium',
  'Student': 'Freemium',
  'Free': 'Freemium',
  'free': 'Freemium'
};

/**
 * Normalise un badge vers le barème officiel :
 * 'Freemium' | 'Essentiel' | 'Live +' | 'Révision +' | 'Intégrale'
 */
export const normalizeBadgeName = (badge?: string | null): string => {
  if (!badge) return 'Freemium';
  const clean = badge.trim();
  if (MAPPING_OLD_TO_NEW_BADGES[clean]) {
    return MAPPING_OLD_TO_NEW_BADGES[clean];
  }
  const upper = clean.toUpperCase();
  if (MAPPING_OLD_TO_NEW_BADGES[upper]) {
    return MAPPING_OLD_TO_NEW_BADGES[upper];
  }
  if (upper.includes('INTÉGR') || upper.includes('INTEGR') || upper.includes('350') || upper.includes('++')) return 'Intégrale';
  if (upper.includes('RÉVIS') || upper.includes('REVIS') || upper.includes('140')) return 'Révision +';
  if (upper.includes('LIVE') || upper.includes('150')) return 'Live +';
  if (upper.includes('ESSENT') || upper.includes('120') || upper.includes('PREMIUM')) return 'Essentiel';
  return clean === 'FREEMIUM' ? 'Freemium' : clean;
};

// Fonction de vérification universelle d'accès
export const hasAccess = (userBadge: string = 'Freemium', requiredBadge: string = 'Freemium'): boolean => {
  const normalizedUserBadge = normalizeBadgeName(userBadge);
  const normalizedReqBadge = normalizeBadgeName(requiredBadge);

  const userLevel = BADGE_LEVELS[normalizedUserBadge] || 1;
  const requiredLevel = BADGE_LEVELS[normalizedReqBadge] || 1;

  return userLevel >= requiredLevel;
};
