export const BADGE_LEVELS: Record<string, number> = {
  'Freemium': 1,
  'FREEMIUM': 1,
  'Essentiel': 2,
  'ESSENTIEL': 2,
  'Live +': 3,
  'LIVE +': 3,
  'Révision +': 4,
  'RÉVISION +': 4,
  'Intégrale': 5,
  'INTÉGRALE': 5,
  'Premium': 3,
  'Premium+': 4,
  'Premium++': 5
};

export const canAccessDocument = (userBadge = 'Freemium', requiredBadge = 'Freemium'): boolean => {
  const normUser = String(userBadge || 'Freemium').trim();
  const normReq = String(requiredBadge || 'Freemium').trim();

  const userLevel = BADGE_LEVELS[normUser] || BADGE_LEVELS[normUser.toUpperCase()] || 1;
  const requiredLevel = BADGE_LEVELS[normReq] || BADGE_LEVELS[normReq.toUpperCase()] || 1;

  return userLevel >= requiredLevel;
};
