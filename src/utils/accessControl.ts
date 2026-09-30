export type PackageTier = 'FREEMIUM' | 'ESSENTIEL' | 'PREMIUM' | 'PREMIUM+' | 'PREMIUM++';

// Hiérarchie de puissance des forfaits (Hardcoded)
const PACKAGE_WEIGHTS: Record<PackageTier, number> = {
  'FREEMIUM': 1,
  'ESSENTIEL': 2,
  'PREMIUM': 3,
  'PREMIUM+': 4,
  'PREMIUM++': 5
};

export interface UserPermissions {
  activePackages: PackageTier[]; // ex: ['FREEMIUM', 'PREMIUM']
  level: string;                 // ex: '4ème'
  field: string;                 // ex: 'Mathématiques'
  isBlocked: boolean;
}

/**
 * Vérification unifiée de déblocage de contenu
 */
export const checkContentAccess = (user: UserPermissions, content: { requiredAccess: PackageTier; level: string; field?: string }): boolean => {
  if (!user) return false;
  // 1. Compte bloqué
  if (user.isBlocked) return false;

  // 2. Niveau Scolaire et Filière (tolerant checks)
  if (content.level && content.level !== 'Tous' && content.level !== 'Tous les niveaux') {
    const uL = String(user.level || '').toLowerCase();
    const cL = String(content.level || '').toLowerCase();
    const levelMatch = cL.includes('tous') || uL.includes(cL) || cL.includes(uL) || (uL.includes('4') && cL.includes('4'));
    if (!levelMatch) return false;
  }

  if (content.field && content.field !== 'Toutes' && content.field !== 'Toutes les filières' && content.field !== 'Tous') {
    const uF = String(user.field || '').toLowerCase();
    const cF = String(content.field || '').toLowerCase();
    const fieldMatch = cF.includes('tous') || cF.includes('toutes') || uF.includes(cF) || cF.includes(uF);
    if (!fieldMatch) return false;
  }

  // 3. Gratuit pour tous
  if (!content.requiredAccess || content.requiredAccess === 'FREEMIUM') return true;

  // 4. Test du forfait actif supérieur ou égal au forfait requis
  const pkgs = Array.isArray(user.activePackages) && user.activePackages.length > 0 ? user.activePackages : ['FREEMIUM'];
  const userHighestWeight = Math.max(
    ...pkgs.map(pkg => PACKAGE_WEIGHTS[pkg as PackageTier] || 1)
  );
  
  const requiredWeight = PACKAGE_WEIGHTS[content.requiredAccess] || 1;

  return userHighestWeight >= requiredWeight;
};

export default checkContentAccess;
