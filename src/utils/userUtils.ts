export const getUserHighestPackage = (user: any): string => {
  if (!user) return 'FREEMIUM';

  const hierarchy: Record<string, number> = {
    'FREEMIUM': 1,
    'ESSENTIEL': 2,
    'PREMIUM': 3,
    'PREMIUM+': 4,
    'PREMIUM++': 5
  };

  const packages: string[] = Array.isArray(user.activePackages) && user.activePackages.length > 0
    ? user.activePackages
    : Array.isArray(user.packs) && user.packs.length > 0
    ? user.packs
    : [user.status || user.userCategory || user.subscriptionType || 'FREEMIUM'];

  let highest = 'FREEMIUM';
  let maxRank = 0;

  packages.forEach(pkg => {
    const clean = String(pkg).trim().toUpperCase();
    const rank = hierarchy[clean] || 1;
    if (rank > maxRank) {
      maxRank = rank;
      highest = clean;
    }
  });

  return highest;
};

export default getUserHighestPackage;
