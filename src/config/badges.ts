export const BADGE_HIERARCHY: Record<string, number> = {
  'FREEMIUM': 1,
  'Freemium': 1,
  'freemium': 1,
  'ESSENTIEL': 2,
  'Essentiel': 2,
  'essentiel': 2,
  'LIVE +': 3,
  'Live +': 3,
  'LIVE+': 3,
  'live +': 3,
  'live+': 3,
  'RÉVISION +': 4,
  'Révision +': 4,
  'REVISION +': 4,
  'REVISION+': 4,
  'révision +': 4,
  'revision +': 4,
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
 * @param {string} userBadge - Le badge/abonnement de l'élève connecté.
 * @param {string|Array} contentBadges - Le ou les badges configurés sur le contenu (Quiz/Doc).
 * @returns {boolean}
 */
export const checkAccessPermission = (userBadge: any, contentBadges: any): boolean => {
  const normUserBadge = normalizeBadge(userBadge);
  const userLevel = BADGE_HIERARCHY[normUserBadge] || 1;

  // L'offre Intégrale a accès à l'intégralité de la plateforme
  if (normUserBadge === 'INTÉGRALE') return true;

  // Conversion des badges du contenu en tableau normalisé
  let rawBadges = Array.isArray(contentBadges) ? contentBadges : [contentBadges];
  if (rawBadges.length === 0 || rawBadges.includes(undefined) || rawBadges.includes(null)) {
    rawBadges = ['FREEMIUM'];
  }
  const normalizedContentBadges = rawBadges.map(b => normalizeBadge(b));

  // 1. Accès direct si "FREEMIUM" ou "GRATUIT" est coché ou si le badge exact de l'élève figure dans la liste
  if (normalizedContentBadges.includes('FREEMIUM') || normalizedContentBadges.includes('GRATUIT')) return true;
  if (normalizedContentBadges.includes(normUserBadge)) return true;

  // 2. Accès par héritage (Si le niveau de l'élève est >= au niveau minimum requis du contenu)
  const minRequiredLevel = Math.min(
    ...normalizedContentBadges.map(b => BADGE_HIERARCHY[b] || 1)
  );

  return userLevel >= minRequiredLevel;
};

export const hasAccess = (userBadge: string = 'FREEMIUM', requiredBadge: string = 'FREEMIUM'): boolean => {
  return checkAccessPermission(userBadge, requiredBadge);
};

export const isUserAuthorized = checkAccessPermission;
