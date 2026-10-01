const PACKAGE_RANK: Record<string, number> = {
  'FREEMIUM': 1,
  'ESSENTIEL': 2,
  'PREMIUM': 3,
  'PREMIUM+': 4,
  'PREMIUM++': 5
};

export const getEffectiveStatus = (user: any): string => {
  if (!user) return 'FREEMIUM';
  const packages = Array.isArray(user.activePackages) && user.activePackages.length > 0
    ? user.activePackages
    : Array.isArray(user.packs) && user.packs.length > 0
    ? user.packs
    : [user.status || user.statusBadge || user.userCategory || 'FREEMIUM'];

  let highest = 'FREEMIUM';
  let maxRank = 0;

  packages.forEach((pkg: string) => {
    const clean = String(pkg || '').trim().toUpperCase();
    const rank = PACKAGE_RANK[clean] || 1;
    if (rank > maxRank) {
      maxRank = rank;
      highest = clean;
    }
  });

  return highest;
};

export const canAccessDocument = (user: any, document: { requiredPackage?: string; level?: string; grade?: string; section?: string; field?: string }): boolean => {
  if (!user) return false;
  const isBlocked = user.isBlocked || user.status === 'disabled' || user.status === 'Bloqué';
  if (isBlocked) return false;

  const uLevel = user.academicLevel || user.grade || user.level || '';
  const uSection = user.section || user.field || '';

  const dLevel = document.level || document.grade || 'Tous';
  const dSection = document.section || document.field || 'Toutes';

  // 1. Level and section filter
  if (dLevel && dLevel !== 'Tous' && dLevel !== 'Tous les niveaux' && uLevel) {
    const l1 = String(uLevel).toLowerCase();
    const l2 = String(dLevel).toLowerCase();
    if (!l2.includes('tous') && !l1.includes(l2) && !l2.includes(l1) && !(l1.includes('4') && l2.includes('4'))) {
      return false;
    }
  }

  if (dSection && dSection !== 'Toutes' && dSection !== 'Toutes les filières' && dSection !== 'Tous' && uSection) {
    const s1 = String(uSection).toLowerCase();
    const s2 = String(dSection).toLowerCase();
    if (!s2.includes('tous') && !s2.includes('toutes') && !s1.includes(s2) && !s2.includes(s1)) {
      return false;
    }
  }

  const userPackage = getEffectiveStatus(user);
  const userWeight = PACKAGE_RANK[userPackage] || 1;
  const reqPkg = String(document.requiredPackage || 'FREEMIUM').toUpperCase();
  const requiredWeight = PACKAGE_RANK[reqPkg] || 1;

  return userWeight >= requiredWeight;
};

export const canStudentViewDocument = (studentPackage: string, documentAllowedTiers: string[]): boolean => {
  if (!documentAllowedTiers || documentAllowedTiers.length === 0) return false;

  const formattedStudentPackage = (studentPackage || 'FREEMIUM').trim().toUpperCase();
  const formattedTiers = documentAllowedTiers.map(t => (t || '').trim().toUpperCase());

  // Accès si l'étudiant a la formule 'INTÉGRALE' OU si sa formule fait partie des badges cochés
  if (formattedStudentPackage === 'INTÉGRALE' || formattedStudentPackage === 'INTEGRALE') return true;
  
  return formattedTiers.includes(formattedStudentPackage);
};

export default canAccessDocument;
