export const normalizeText = (text: string = ''): string => {
  return String(text || '')
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Enlève les accents (ex: 4ème -> 4eme)
    .trim();
};

export const BADGE_LEVELS: Record<string, number> = {
  'freemium': 1,
  'essentiel': 2,
  'live +': 3,
  'live+': 3,
  'live': 3,
  'revision +': 4,
  'revision+': 4,
  'revision': 4,
  'integrale': 5,
  'integral': 5,
  'premium': 3,
  'premium+': 4,
  'premium++': 5
};

export const canAccessDocument = (userBadge = 'Freemium', requiredBadge = 'Freemium'): boolean => {
  const normUser = normalizeText(userBadge);
  const normReq = normalizeText(requiredBadge);

  const userLevel = BADGE_LEVELS[normUser] || 1;
  const requiredLevel = BADGE_LEVELS[normReq] || 1;

  return userLevel >= requiredLevel;
};
