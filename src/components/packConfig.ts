export interface PackOffer {
  id: string;
  category: 'Freemium' | 'Premium' | 'Premium+' | 'Premium++' | 'Essentiel';
  badgeLabel: string;
  title: string;
  description: string;
  originalPrice?: number;
  finalPrice: number;
  period: string;
  isPopular?: boolean;
  isActive: boolean;
  autoFullAccess: boolean; // Privilège automatique sans intervention admin
}

export const DEFAULT_OFFERS: PackOffer[] = [
  {
    id: 'pack-freemium',
    category: 'Freemium',
    badgeLabel: 'FREEMIUM',
    title: 'Accès Freemium Découverte',
    description: 'Accès restreint aux extraits de cours, fiches sélectionnées et démonstrations pour tester la plateforme.',
    originalPrice: 0,
    finalPrice: 0,
    period: 'Gratuit',
    isPopular: false,
    isActive: true,
    autoFullAccess: false
  },
  {
    id: 'pack-premium',
    category: 'Premium',
    badgeLabel: 'PACK PREMIUM',
    title: 'Formule Premium Standard',
    description: 'Accès complet à tous les cours, devoirs, exercices et corrigés détaillés + sélection de quizs.',
    originalPrice: 150,
    finalPrice: 120,
    period: 'Trimestre',
    isPopular: false,
    isActive: true,
    autoFullAccess: false
  },
  {
    id: 'pack-premium-plus',
    category: 'Premium+',
    badgeLabel: 'PACK PREMIUM+',
    title: 'Formule Premium+ Live',
    description: 'Tous les avantages Premium + accès direct aux séances Live, replays et ensemble des quizs interactifs.',
    originalPrice: 220,
    finalPrice: 180,
    period: 'Trimestre',
    isPopular: false,
    isActive: true,
    autoFullAccess: false
  },
  {
    id: 'pack-premium-plus-plus',
    category: 'Premium++',
    badgeLabel: 'PACK PREMIUM++',
    title: 'Formule Premium++ Excellence BAC',
    description: 'Tous les droits Premium+ + révisions finales intensives, annales BAC corrigées et coaching.',
    originalPrice: 350,
    finalPrice: 290,
    period: 'Année',
    isPopular: false,
    isActive: true,
    autoFullAccess: true
  },
  {
    id: 'pack-essentiel',
    category: 'Essentiel',
    badgeLabel: 'PACK ESSENTIEL',
    title: 'Pass Essentiel Illimité',
    description: 'Accès automatique et direct à l’intégralité des ressources (devoirs, exercices, corrigés, quiz) et services (lives, support BAC) sans attente d’affectation.',
    originalPrice: 350,
    finalPrice: 190,
    period: 'TND / An',
    isPopular: true,
    isActive: true,
    autoFullAccess: true
  }
];

/**
 * Helper de vérification automatique des droits d'accès
 */
export const checkStudentAccess = (studentPackCategory: string): boolean => {
  if (
    studentPackCategory === 'Essentiel' || 
    studentPackCategory === 'ESSENTIEL' || 
    studentPackCategory === 'Premium++' || 
    studentPackCategory === 'PREMIUM_PLUS_PLUS'
  ) {
    return true; // Accès automatique débloqué à 100%
  }
  return false;
};
