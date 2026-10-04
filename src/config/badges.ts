export const PLATFORM_BADGES = {
  FREEMIUM: 'FREEMIUM',
  ESSENTIEL: 'ESSENTIEL',
  REVISION_PLUS: 'RÉVISION +',
  LIVE_PLUS: 'LIVE +',
  INTEGRALE: 'INTÉGRALE'
};

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

export const BADGE_LEVELS = BADGE_HIERARCHY;

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
  'Gratuit': 'FREEMIUM',
  'RÉVISION -': 'RÉVISION +',
  'Révision -': 'RÉVISION +',
  'revision -': 'RÉVISION +',
  'REVISION -': 'RÉVISION +'
};

export const LEGACY_BADGE_MAP = MAPPING_OLD_TO_NEW_BADGES;

/**
 * Normalise n'importe quelle chaîne de badge vers la nomenclature officielle en majuscules.
 */
export const normalizeBadge = (badge?: string | null): string => {
  if (!badge) return 'FREEMIUM';
  const clean = String(badge).replace(/^PACK\s+/i, '').trim();
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
 * Vérifie si le badge de l'élève lui donne accès au quiz
 */
export const checkQuizAccess = (userBadge: string = 'FREEMIUM', quizAllowedBadges: string[] = []): boolean => {
  if (!quizAllowedBadges || quizAllowedBadges.length === 0) return true;
  const cleanUserBadge = String(userBadge).replace(/^PACK\s+/i, '').trim().toUpperCase();
  const normUser = normalizeBadge(cleanUserBadge);

  const normalizedQuizBadges = quizAllowedBadges.map(b => normalizeBadge(b));
  if (normalizedQuizBadges.includes('FREEMIUM') || normalizedQuizBadges.includes('GRATUIT')) return true;
  if (normUser === 'INTÉGRALE') return true;

  const userLevel = BADGE_HIERARCHY[normUser] || 1;
  return normalizedQuizBadges.some(requiredBadge => {
    const cleanRequired = normalizeBadge(requiredBadge);
    const requiredLevel = BADGE_HIERARCHY[cleanRequired] || 99;
    return userLevel >= requiredLevel;
  });
};

export const canAccessQuiz = checkQuizAccess;

export const checkAccessPermission = (userBadge: any, contentBadges: any): boolean => {
  const rawList = Array.isArray(contentBadges) ? contentBadges : [contentBadges];
  return checkQuizAccess(userBadge, rawList);
};

export const hasAccess = (userBadge: string = 'FREEMIUM', requiredBadge: string = 'FREEMIUM'): boolean => {
  return checkQuizAccess(userBadge, [requiredBadge]);
};

export const isUserAuthorized = checkAccessPermission;
