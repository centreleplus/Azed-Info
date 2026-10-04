export const BADGE_HIERARCHY: Record<string, number> = {
  'FREEMIUM': 1,
  'Freemium': 1,
  'freemium': 1,
  'ESSENTIEL': 2,
  'Essentiel': 2,
  'essentiel': 2,
  'RÉVISION -': 3,
  'Révision -': 3,
  'revision -': 3,
  'RÉVISION +': 4,
  'Révision +': 4,
  'REVISION +': 4,
  'REVISION+': 4,
  'révision +': 4,
  'revision +': 4,
  'LIVE +': 5,
  'Live +': 5,
  'LIVE+': 5,
  'live +': 5,
  'live+': 5,
  'INTÉGRALE': 6,
  'Intégrale': 6,
  'INTEGRALE': 6,
  'intégrale': 6,
  'integrale': 6
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
 * Normalise n'importe quelle chaîne de badge vers la nomenclature officielle en majuscules.
 */
export const normalizeBadge = (badge?: string | null): string => {
  if (!badge) return 'FREEMIUM';
  const clean = String(badge).trim();
  const upper = clean.toUpperCase();
  if (MAPPING_OLD_TO_NEW_BADGES[clean]) return MAPPING_OLD_TO_NEW_BADGES[clean];
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
 * Vérifie si un élève a le droit d'accéder à un contenu.
 */
export const canAccessQuiz = (userBadge: string, quizBadges: string[]): boolean => {
  if (!quizBadges || quizBadges.length === 0) return true;
  const normalizedQuizBadges = quizBadges.map(b => normalizeBadge(b));
  if (normalizedQuizBadges.includes('FREEMIUM') || normalizedQuizBadges.includes('GRATUIT')) return true;

  const normUserBadge = normalizeBadge(userBadge);
  if (normUserBadge === 'INTÉGRALE') return true;

  const userLevel = BADGE_HIERARCHY[normUserBadge] || 1;
  const minRequiredLevel = Math.min(
    ...normalizedQuizBadges.map(b => BADGE_HIERARCHY[b] || 99)
  );

  return userLevel >= minRequiredLevel;
};

export const checkAccessPermission = (userBadge: any, contentBadges: any): boolean => {
  const rawList = Array.isArray(contentBadges) ? contentBadges : [contentBadges];
  return canAccessQuiz(userBadge, rawList);
};

export const hasAccess = (userBadge: string = 'FREEMIUM', requiredBadge: string = 'FREEMIUM'): boolean => {
  return canAccessQuiz(userBadge, [requiredBadge]);
};

export const isUserAuthorized = checkAccessPermission;
