// 5 Paliers officiels A-Zed Info EXCLUSIFS : FREEMIUM, ESSENTIEL, LIVE+, REVISION+, INTEGRAL
export const PLATFORM_BADGES = {
  FREEMIUM: 'FREEMIUM',
  ESSENTIEL: 'ESSENTIEL',
  LIVE_PLUS: 'LIVE+',
  REVISION_PLUS: 'REVISION+',
  INTEGRAL: 'INTEGRAL'
} as const;

export const OFFICIAL_BADGE_LEVELS = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'] as const;
export type OfficialBadge = typeof OFFICIAL_BADGE_LEVELS[number];

// Hiérarchie officielle d'accès dans A-Zed Info (1: FREEMIUM, 2: ESSENTIEL, 3: LIVE+, 4: REVISION+, 5: INTEGRAL)
export const BADGE_HIERARCHY: Record<string, number> = {
  'FREEMIUM': 1,
  'Freemium': 1,
  'freemium': 1,
  'ESSENTIEL': 2,
  'Essentiel': 2,
  'essentiel': 2,
  'LIVE+': 3,
  'Live+': 3,
  'live+': 3,
  'LIVE +': 3,
  'Live +': 3,
  'live +': 3,
  'REVISION+': 4,
  'Revision+': 4,
  'revision+': 4,
  'RÉVISION+': 4,
  'REVISION +': 4,
  'Révision +': 4,
  'révision +': 4,
  'revision +': 4,
  'INTEGRAL': 5,
  'Integral': 5,
  'integral': 5,
  'INTÉGRALE': 5,
  'Intégrale': 5,
  'INTEGRALE': 5,
  'intégrale': 5,
  'integrale': 5
};

export const MAPPING_OLD_TO_NEW_BADGES: Record<string, OfficialBadge> = {
  'Premium': 'ESSENTIEL',
  'Premium+': 'LIVE+',
  'Premium++': 'INTEGRAL',
  'PREMIUM': 'ESSENTIEL',
  'PREMIUM+': 'LIVE+',
  'PREMIUM++': 'INTEGRAL',
  'PREMIUM_PLUS': 'LIVE+',
  'PREMIUM_PLUS_PLUS': 'INTEGRAL',
  'STUDENT': 'FREEMIUM',
  'Student': 'FREEMIUM',
  'student': 'FREEMIUM',
  'Free': 'FREEMIUM',
  'free': 'FREEMIUM',
  'GRATUIT': 'FREEMIUM',
  'Gratuit': 'FREEMIUM',
  'Freemium': 'FREEMIUM',
  'freemium': 'FREEMIUM',
  'Essentiel': 'ESSENTIEL',
  'essentiel': 'ESSENTIEL',
  'Live +': 'LIVE+',
  'LIVE +': 'LIVE+',
  'Live+': 'LIVE+',
  'live+': 'LIVE+',
  'live +': 'LIVE+',
  'Révision +': 'REVISION+',
  'RÉVISION +': 'REVISION+',
  'REVISION +': 'REVISION+',
  'REVISION+': 'REVISION+',
  'Révision+': 'REVISION+',
  'révision +': 'REVISION+',
  'revision +': 'REVISION+',
  'Intégrale': 'INTEGRAL',
  'INTÉGRALE': 'INTEGRAL',
  'INTEGRALE': 'INTEGRAL',
  'Integrale': 'INTEGRAL',
  'intégrale': 'INTEGRAL',
  'integrale': 'INTEGRAL',
  'INTEGRAL': 'INTEGRAL',
  'Integral': 'INTEGRAL',
  'integral': 'INTEGRAL'
};

export const LEGACY_BADGE_MAP = MAPPING_OLD_TO_NEW_BADGES;

/**
 * Nettoie le badge utilisateur et le normalise strictement vers l'une des 5 valeurs exclusives:
 * 'FREEMIUM' | 'ESSENTIEL' | 'LIVE+' | 'REVISION+' | 'INTEGRAL'
 */
export const normalizeBadge = (badgeRaw?: string | null): OfficialBadge => {
  if (!badgeRaw) return 'FREEMIUM';
  let str = String(badgeRaw).replace(/^PACK\s+/i, '').trim();
  if (MAPPING_OLD_TO_NEW_BADGES[str]) return MAPPING_OLD_TO_NEW_BADGES[str];
  
  const upper = str.toUpperCase().replace(/\s*\+\s*/g, '+');
  if (upper === 'FREEMIUM' || upper === 'ESSENTIEL' || upper === 'LIVE+' || upper === 'REVISION+' || upper === 'INTEGRAL') {
    return upper as OfficialBadge;
  }
  if (MAPPING_OLD_TO_NEW_BADGES[upper]) return MAPPING_OLD_TO_NEW_BADGES[upper];

  if (upper.includes('INTEGR') || upper.includes('INTÉGR') || upper.includes('350') || upper.includes('++') || upper.includes('ANNUEL')) return 'INTEGRAL';
  if (upper.includes('REVIS') || upper.includes('RÉVIS') || upper.includes('140')) return 'REVISION+';
  if (upper.includes('LIVE') || upper.includes('150') || upper.includes('TRIMESTR')) return 'LIVE+';
  if (upper.includes('ESSENT') || upper.includes('120') || upper.includes('PREMIUM') || upper.includes('PASS')) return 'ESSENTIEL';
  return 'FREEMIUM';
};

export const normalizeBadgeStrict = normalizeBadge;
export const normalizeBadgeName = normalizeBadge;
export const resolveBadge = normalizeBadge;

/**
 * Logique de Contrôle d'Accès Dynamique basée sur le Badge
 */
export const hasAccessToContent = (userBadge: string, requiredBadgeLevel: string): boolean => {
  const levels: OfficialBadge[] = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'];
  const userClean = normalizeBadge(userBadge || 'FREEMIUM');
  const reqClean = normalizeBadge(requiredBadgeLevel || 'FREEMIUM');

  let userIndex = levels.indexOf(userClean);
  let requiredIndex = levels.indexOf(reqClean);

  if (userIndex === -1) userIndex = 0;
  if (requiredIndex === -1) requiredIndex = 0;
  
  return userIndex >= requiredIndex;
};

/**
 * Vérifie si le badge de l'élève donne accès au contenu (cours, devoirs, examens, fiches)
 */
export const canAccessQuiz = (userBadgeRaw?: string, quizAllowedBadges: string[] = []): boolean => {
  if (!quizAllowedBadges || quizAllowedBadges.length === 0) return true;
  const userBadge = normalizeBadge(userBadgeRaw);
  if (userBadge === 'INTEGRAL') return true;

  const normalizedAllowed = quizAllowedBadges.map(b => normalizeBadge(b));
  // Exact match or higher tier access
  return normalizedAllowed.some(reqBadge => {
    return hasAccessToContent(userBadge, reqBadge);
  });
};

export const checkAccessPermission = (userBadge: any, contentBadges: any): boolean => {
  const rawList = Array.isArray(contentBadges) ? contentBadges : [contentBadges];
  return canAccessQuiz(userBadge, rawList);
};

export const hasAccess = (userBadge: string = 'FREEMIUM', requiredBadge: string = 'FREEMIUM'): boolean => {
  return hasAccessToContent(userBadge, requiredBadge);
};

export const isUserAuthorized = checkAccessPermission;
