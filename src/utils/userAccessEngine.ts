export type PackageTier = 'FREEMIUM' | 'ESSENTIEL' | 'PREMIUM' | 'PREMIUM+' | 'PREMIUM++';

export interface UserAccessData {
  _id?: string;
  id?: string;
  activePackages?: string[];
  packs?: string[];
  expirationDate?: string | Date;
  subscriptionExpiresAt?: string | Date;
  isBlocked?: boolean;
  status?: string;
}

export interface CalculatedAccessState {
  mainStatus: PackageTier;
  etatAccesText: string;     // ex: "★ PREMIUM ACTIF" ou "★ ESSENTIEL ACTIF"
  etatAccesColor: string;    // Classes CSS de couleur
  daysRemaining: number;
}

const TIER_HIERARCHY: Record<string, number> = {
  'FREEMIUM': 1,
  'ESSENTIEL': 2,
  'PREMIUM': 3,
  'PREMIUM+': 4,
  'PREMIUM++': 5
};

/**
 * Recalcule dynamiquement le Statut et l'État Accès à partir des packs actifs
 */
export function calculateUserAccessState(user: UserAccessData): CalculatedAccessState {
  const isBlocked = user.isBlocked || user.status === 'disabled' || user.status === 'Bloqué';
  if (isBlocked) {
    return {
      mainStatus: 'FREEMIUM',
      etatAccesText: '⛔ ACCÈS BLOQUÉ',
      etatAccesColor: 'bg-red-100 text-red-700 border-red-300',
      daysRemaining: 0
    };
  }

  const userPacks = user.activePackages || user.packs || ['FREEMIUM'];

  // Trouver le pack ayant la plus haute priorité
  let highestTier: PackageTier = 'FREEMIUM';
  let maxWeight = 0;

  userPacks.forEach((pkg) => {
    const cleanPkg = String(pkg || '').toUpperCase();
    for (const tierKey of Object.keys(TIER_HIERARCHY)) {
      if (cleanPkg.includes(tierKey) && TIER_HIERARCHY[tierKey] > maxWeight) {
        maxWeight = TIER_HIERARCHY[tierKey];
        highestTier = tierKey as PackageTier;
      }
    }
  });

  // Calcul des jours restants
  const now = new Date();
  const expDateRaw = user.expirationDate || user.subscriptionExpiresAt;
  const exp = expDateRaw ? new Date(expDateRaw) : new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  const diffTime = exp.getTime() - now.getTime();
  const daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));

  return {
    mainStatus: highestTier,
    etatAccesText: highestTier === 'FREEMIUM' ? 'FREEMIUM (Illimité)' : `★ ${highestTier} ACTIF`,
    etatAccesColor: highestTier === 'FREEMIUM' ? 'text-gray-600 bg-gray-100' : 'text-amber-700 bg-amber-50 border-amber-200',
    daysRemaining
  };
}

export default calculateUserAccessState;
