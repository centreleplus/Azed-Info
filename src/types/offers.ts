export type TierCategory = 'FREEMIUM' | 'PREMIUM' | 'PREMIUM_PLUS' | 'PREMIUM_PLUS_PLUS' | 'ESSENTIEL';

export interface OfferPack {
  id: string;
  category: TierCategory;
  title: string;
  badgeLabel: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconName: string;
  price: number;
  originalPrice?: number;
  finalPrice?: number;
  discountPercentage?: number;
  period: string; // ex: 'Trimestre', 'Année'
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  isPopular?: boolean;
  isActive: boolean;
  autoFullAccess?: boolean;
}

// Configuration par défaut des 4 packs
export const INITIAL_OFFERS: OfferPack[] = [
  {
    id: 'pack-freemium',
    category: 'FREEMIUM',
    title: 'Accès Freemium',
    badgeLabel: 'Freemium',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    iconName: 'User',
    price: 0,
    originalPrice: 0,
    finalPrice: 0,
    period: 'Gratuit à vie',
    description: 'Accès de base accordé automatiquement à tout nouvel élève inscrit.',
    features: [
      { text: 'Extraits & démos de cours', included: true },
      { text: 'Sélection de fiches & exercices de démonstration', included: true },
      { text: 'Accès limité aux quizs d\'entraînement', included: true },
      { text: 'Devoirs & corrigés complets', included: false },
      { text: 'Séances Live & Replays', included: false },
      { text: 'Révisions finales & Conseils Bac', included: false }
    ],
    isActive: true
  },
  {
    id: 'pack-premium',
    category: 'PREMIUM',
    title: 'Pack Premium',
    badgeLabel: 'Premium',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    iconName: 'Zap',
    price: 120,
    originalPrice: 150,
    finalPrice: 120,
    discountPercentage: 20,
    period: 'Trimestre',
    description: 'Accès complet aux ressources académiques et leurs corrigés.',
    features: [
      { text: 'Tous les cours, fiches & exercices complets', included: true },
      { text: 'Devoirs & corrigés détaillés', included: true },
      { text: 'Accès aux quizs d\'évaluation', included: true },
      { text: 'Séances Live interactives', included: false },
      { text: 'Révisions finales BAC', included: false }
    ],
    isActive: true
  },
  {
    id: 'pack-premium-plus',
    category: 'PREMIUM_PLUS',
    title: 'Pack Premium+',
    badgeLabel: 'Premium+',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    iconName: 'Star',
    price: 180,
    originalPrice: 220,
    finalPrice: 180,
    discountPercentage: 18,
    period: 'Trimestre',
    description: 'Accès Premium enrichi avec accompagnement en directs interactifs.',
    features: [
      { text: 'Tout le contenu du Pack Premium', included: true },
      { text: 'Accès direct aux séances Live Zoom/Google Meet', included: true },
      { text: 'Corrigés vidéo & replays des séances Live', included: true },
      { text: 'Accès illimité à tous les quizs interactifs', included: true },
      { text: 'Séances de révisions finales de fin d\'année', included: false }
    ],
    isPopular: true,
    isActive: true
  },
  {
    id: 'pack-premium-plus-plus',
    category: 'PREMIUM_PLUS_PLUS',
    title: 'Pack Premium++',
    badgeLabel: 'Premium++',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    iconName: 'Crown',
    price: 290,
    originalPrice: 350,
    finalPrice: 290,
    discountPercentage: 17,
    period: 'Année',
    description: 'L\'expérience ultime : préparation complète au BAC et coaching personnalisé.',
    features: [
      { text: 'Tout le contenu du Pack Premium+', included: true },
      { text: 'Séances de révisions finales intensives', included: true },
      { text: 'Corrigés complets des épreuves du BAC', included: true },
      { text: 'Séances de conseils pédagogiques & accompagnement psychologique', included: true }
    ],
    isActive: true,
    autoFullAccess: true
  },
  {
    id: 'pack-essentiel',
    category: 'ESSENTIEL',
    title: 'Pass Essentiel Illimité',
    badgeLabel: 'PACK ESSENTIEL',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    iconName: 'ShieldCheck',
    price: 190,
    originalPrice: 350,
    finalPrice: 190,
    discountPercentage: 45,
    period: 'TND / An',
    description: 'Accès automatique et direct à l’intégralité des ressources (devoirs, exercices, corrigés, quiz) et services (lives, support BAC) sans attente d’affectation.',
    features: [
      { text: 'Accès 100% automatique et immédiat sans validation', included: true },
      { text: 'Tous les devoirs, exercices et corrigés détaillés', included: true },
      { text: 'Toutes les séances Live et replays vidéo', included: true },
      { text: 'Quizs interactifs illimités & Révisions BAC', included: true }
    ],
    isPopular: true,
    isActive: true,
    autoFullAccess: true
  }
];
