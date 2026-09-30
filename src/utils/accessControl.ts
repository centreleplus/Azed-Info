export type UserRole = {
  activePackages?: string[];
  packs?: string[];
  status?: string;
  academicLevel?: string;
  grade?: string;
  section?: string;
  isBlocked?: boolean;
};

export type ContentMetadata = {
  requiredPackage?: 'FREEMIUM' | 'ESSENTIEL' | 'PREMIUM' | 'PREMIUM+' | 'PREMIUM++' | string;
  level?: string;
  grade?: string;
  section?: string;
};

const PACKAGE_LEVELS: Record<string, number> = {
  'FREEMIUM': 1,
  'ESSENTIEL': 2,
  'PREMIUM': 3,
  'PREMIUM+': 4,
  'PREMIUM++': 5
};

export const canUserAccessContent = (user: UserRole, content: ContentMetadata): boolean => {
  if (!user) return false;
  const isBlocked = user.isBlocked || user.status === 'disabled' || user.status === 'Bloqué';
  if (isBlocked) return false;

  const userLevel = user.academicLevel || user.grade || '';
  const userSection = user.section || '';

  const contentLevel = content.level || content.grade || 'Tous';
  const contentSection = content.section || 'Toutes';

  // 1. Contrôle du Niveau Scolaire et de la Section
  if (contentLevel && contentLevel !== 'Tous' && contentLevel !== 'Tous les niveaux') {
    const uL = String(userLevel).toLowerCase();
    const cL = String(contentLevel).toLowerCase();
    const levelMatch = cL.includes('tous') || uL.includes(cL) || cL.includes(uL) || (uL.includes('4') && cL.includes('4'));
    if (!levelMatch) return false;
  }

  if (contentSection && contentSection !== 'Toutes' && contentSection !== 'Toutes les filières' && contentSection !== 'Tous') {
    const uF = String(userSection).toLowerCase();
    const cF = String(contentSection).toLowerCase();
    const fieldMatch = cF.includes('tous') || cF.includes('toutes') || uF.includes(cF) || cF.includes(uF);
    if (!fieldMatch) return false;
  }

  // 2. Calcul du Poids Max du Forfait Utilisateur
  const userPackages = user.activePackages || user.packs || ['FREEMIUM'];
  const userMaxWeight = Math.max(
    ...userPackages.map(pkg => PACKAGE_LEVELS[String(pkg).toUpperCase()] || 1)
  );

  const reqPkg = String(content.requiredPackage || 'FREEMIUM').toUpperCase();
  const requiredWeight = PACKAGE_LEVELS[reqPkg] || 1;

  // 3. Accès autorisé si la puissance du forfait est suffisante
  return userMaxWeight >= requiredWeight;
};

export default canUserAccessContent;
