export const BADGE_LEVELS: Record<string, number> = {
  'Freemium': 1,
  'FREEMIUM': 1,
  'freemium': 1,
  'Essentiel': 2,
  'ESSENTIEL': 2,
  'essentiel': 2,
  'Live +': 3,
  'LIVE +': 3,
  'LIVE+': 3,
  'live +': 3,
  'live+': 3,
  'live': 3,
  'Révision +': 4,
  'RÉVISION +': 4,
  'REVISION +': 4,
  'REVISION+': 4,
  'révision +': 4,
  'revision +': 4,
  'revision+': 4,
  'revision': 4,
  'Intégrale': 5,
  'INTÉGRALE': 5,
  'INTEGRALE': 5,
  'intégrale': 5,
  'integrale': 5,
  'integral': 5
};

export const BADGE_HIERARCHY = BADGE_LEVELS;

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
  const clean = String(badge).trim();
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

// Fonction de vérification universelle d'accès pour 1 badge requis
export const hasAccess = (userBadge: string = 'Freemium', requiredBadge: string = 'Freemium'): boolean => {
  const normalizedUserBadge = normalizeBadgeName(userBadge);
  const normalizedReqBadge = normalizeBadgeName(requiredBadge);

  const userLevel = BADGE_HIERARCHY[normalizedUserBadge] || 1;
  const requiredLevel = BADGE_HIERARCHY[normalizedReqBadge] || 1;

  return userLevel >= requiredLevel;
};

// Fonction de vérification multi-badges et hiérarchique
export const isUserAuthorized = (userBadge: any, documentBadges: any): boolean => {
  if (!documentBadges) return true;
  if (Array.isArray(documentBadges) && documentBadges.length === 0) return true;

  // Assurer que documentBadges est un tableau
  const badgeArray: string[] = (Array.isArray(documentBadges) ? documentBadges : [documentBadges])
    .map((b: any) => String(b || '').trim())
    .filter(Boolean);

  if (badgeArray.length === 0) return true;

  const rawUser = String(userBadge || 'Freemium').trim();
  const normUser = normalizeBadgeName(rawUser);

  // 1. Vérification par inclusion directe
  const hasDirectMatch = badgeArray.some(
    b => b.toLowerCase().trim() === rawUser.toLowerCase() ||
         normalizeBadgeName(b).toLowerCase() === normUser.toLowerCase()
  );
  if (hasDirectMatch) return true;

  // 2. Vérification par hiérarchie (si le badge de l'utilisateur est supérieur ou égal au niveau minimal du document)
  const userLevel = BADGE_HIERARCHY[normUser] || BADGE_HIERARCHY[rawUser.toLowerCase()] || 1;
  const minRequiredLevel = Math.min(
    ...badgeArray.map(b => BADGE_HIERARCHY[normalizeBadgeName(b)] || BADGE_HIERARCHY[b.toLowerCase()] || 1)
  );

  return userLevel >= minRequiredLevel;
};
