export const PLATFORM_BADGES = {
  FREEMIUM: 'FREEMIUM',
  ESSENTIEL: 'ESSENTIEL',
  REVISION_PLUS: 'RÉVISION +',
  LIVE_PLUS: 'LIVE +',
  INTEGRALE: 'INTÉGRALE'
};

// Hiérarchie officielle d'accès dans A-Zed Info
export const BADGE_HIERARCHY: Record<string, number> = {
  'FREEMIUM': 1,
  'Freemium': 1,
  'freemium': 1,
  'ESSENTIEL': 2,
  'Essentiel': 2,
  'essentiel': 2,
  'RÉVISION +': 3,
  'Révision +': 3,
  'REVISION +': 3,
  'REVISION+': 3,
  'révision +': 3,
  'revision +': 3,
  'LIVE +': 4,
  'Live +': 4,
  'LIVE+': 4,
  'live +': 4,
  'live+': 4,
  'INTÉGRALE': 5,
  'Intégrale': 5,
  'INTEGRALE': 5,
  'intégrale': 5,
  'integrale': 5
};

export const MAPPING_OLD_TO_NEW_BADGES: Record<string, string> = {
  'Premium': 'ESSENTIEL',
  'Premium+': 'LIVE +',
  'Premium++': 'INTÉGRALE',
  'PREMIUM': 'ESSENTIEL',
  'PREMIUM+': 'LIVE +',
  'PREMIUM++': 'INTÉGRALE',
  'PREMIUM_PLUS': 'LIVE +',
  'PREMIUM_PLUS_PLUS': 'INTÉGRALE',
  'STUDENT': 'FREEMIUM',
  'Student': 'FREEMIUM',
  'student': 'FREEMIUM',
  'Free': 'FREEMIUM',
  'free': 'FREEMIUM',
  'GRATUIT': 'FREEMIUM',
  'Gratuit': 'FREEMIUM'
};

export const LEGACY_BADGE_MAP = MAPPING_OLD_TO_NEW_BADGES;

/**
 * Nettoie le badge utilisateur (retire "PACK " au besoin et normalise les anciens libellés)
 */
export const normalizeBadge = (badgeRaw?: string | null): string => {
  if (!badgeRaw) return 'FREEMIUM';
  let str = String(badgeRaw).replace(/^PACK\s+/i, '').trim();
  const upper = str.toUpperCase();
  if (MAPPING_OLD_TO_NEW_BADGES[str]) return MAPPING_OLD_TO_NEW_BADGES[str];
  if (MAPPING_OLD_TO_NEW_BADGES[upper]) return MAPPING_OLD_TO_NEW_BADGES[upper];
  if (upper.includes('INTÉGR') || upper.includes('INTEGR') || upper.includes('350') || upper.includes('++')) return 'INTÉGRALE';
  if (upper.includes('RÉVIS') || upper.includes('REVIS') || upper.includes('140')) return 'RÉVISION +';
  if (upper.includes('LIVE') || upper.includes('150')) return 'LIVE +';
  if (upper.includes('ESSENT') || upper.includes('120') || upper.includes('PREMIUM')) return 'ESSENTIEL';
  return upper === 'FREEMIUM' ? 'FREEMIUM' : upper;
};

export const normalizeBadgeName = normalizeBadge;
export const resolveBadge = normalizeBadge;

/**
 * Vérifie si le badge de l'élève donne accès au quiz
 */
export const canAccessQuiz = (userBadgeRaw?: string, quizAllowedBadges: string[] = []): boolean => {
  if (!quizAllowedBadges || quizAllowedBadges.length === 0) return true;
  const normalizedQuizBadges = quizAllowedBadges.map(b => normalizeBadge(b));
  if (normalizedQuizBadges.includes('FREEMIUM') || normalizedQuizBadges.includes('GRATUIT')) return true;

  const userBadge = normalizeBadge(userBadgeRaw);
  if (userBadge === 'INTÉGRALE') return true;

  const userLevel = BADGE_HIERARCHY[userBadge] || 1;

  // L'utilisateur a accès si son niveau est >= au niveau requis par au moins un badge du quiz
  return normalizedQuizBadges.some(reqBadge => {
    const cleanReq = reqBadge.trim().toUpperCase();
    const reqLevel = BADGE_HIERARCHY[cleanReq] || 99;
    return userLevel >= reqLevel;
  });
};

export const checkAccessPermission = (userBadge: any, contentBadges: any): boolean => {
  const rawList = Array.isArray(contentBadges) ? contentBadges : [contentBadges];
  return canAccessQuiz(userBadge, rawList);
};

export const hasAccess = (userBadge: string = 'FREEMIUM', requiredBadge: string = 'FREEMIUM'): boolean => {
  return canAccessQuiz(userBadge, [requiredBadge]);
};

export const isUserAuthorized = checkAccessPermission;
