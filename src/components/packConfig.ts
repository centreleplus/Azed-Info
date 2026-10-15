import { ALL_PACKS, PackType } from '../constants/packages';

export interface PackOffer {
  id: string;
  category: PackType;
  badgeLabel: string;
  title: string;
  description: string;
  originalPrice?: number;
  finalPrice: number;
  period: string;
  isPopular?: boolean;
  isActive: boolean;
  autoFullAccess: boolean;
}

export const DEFAULT_OFFERS: PackOffer[] = [
  {
    id: 'pack-freemium',
    category: 'FREEMIUM',
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
    id: 'pack-essentiel',
    category: 'ESSENTIEL',
    badgeLabel: 'ESSENTIEL',
    title: 'Pass Essentiel Illimité',
    description: 'Accès complet aux devoirs, exercices, résumés de cours et quizs interactifs corrigés.',
    originalPrice: 150,
    finalPrice: 120,
    period: 'TND / An',
    isPopular: false,
    isActive: true,
    autoFullAccess: false
  },
  {
    id: 'pack-live-plus',
    category: 'LIVE+',
    badgeLabel: 'LIVE+',
    title: 'Formule Live + Interactive',
    description: 'Tous les avantages Essentiel + séances interactives Live en direct avec le professeur et replays vidéo.',
    originalPrice: 200,
    finalPrice: 150,
    period: 'Trimestre',
    isPopular: true,
    isActive: true,
    autoFullAccess: false
  },
  {
    id: 'pack-revision-plus',
    category: 'REVISION+',
    badgeLabel: 'REVISION+',
    title: 'Formule Révision + Intensive',
    description: 'Programme intensif de révisions ciblées, annales d\'examens corrigées et séances de méthodologie.',
    originalPrice: 180,
    finalPrice: 140,
    period: 'Session',
    isPopular: false,
    isActive: true,
    autoFullAccess: false
  },
  {
    id: 'pack-integrale',
    category: 'INTEGRAL',
    badgeLabel: 'INTEGRAL',
    title: 'Formule Intégrale Tout-en-Un',
    description: 'Accès total à 100% des cours, devoirs, examens blancs, séances Live et révisions BAC.',
    originalPrice: 450,
    finalPrice: 350,
    period: 'Annuel',
    isPopular: false,
    isActive: true,
    autoFullAccess: true
  }
];

/**
 * Helper de vérification automatique des droits d'accès
 */
export const checkStudentAccess = (studentPackCategory: string): boolean => {
  const norm = studentPackCategory?.trim().toLowerCase() || '';
  if (norm.includes('intégr') || norm.includes('essentiel')) {
    return true;
  }
  return false;
};
