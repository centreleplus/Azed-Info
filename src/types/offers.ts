import { ALL_PACKS, PackType } from '../constants/packages';

export type TierCategory = PackType;

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
  period: string;
  description: string;
  features: {
    text: string;
    included: boolean;
  }[];
  isPopular?: boolean;
  isActive: boolean;
  autoFullAccess?: boolean;
}

// Configuration par défaut des 5 packs autorisés
export const INITIAL_OFFERS: OfferPack[] = [
  {
    id: 'pack-freemium',
    category: 'Freemium',
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
    id: 'pack-essentiel',
    category: 'Essentiel',
    title: 'Pass Essentiel',
    badgeLabel: 'Essentiel',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-300',
    iconName: 'Star',
    price: 120,
    originalPrice: 150,
    finalPrice: 120,
    discountPercentage: 20,
    period: 'TND / An',
    description: 'Accès direct aux fiches, devoirs, exercices et corrigés détaillés.',
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
    id: 'pack-live-plus',
    category: 'Live +',
    title: 'Pack Live +',
    badgeLabel: 'Live +',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300',
    iconName: 'Zap',
    price: 150,
    originalPrice: 200,
    finalPrice: 150,
    discountPercentage: 25,
    period: 'Trimestre',
    description: 'Accès Essentiel + séances interactives Live en direct et replays.',
    features: [
      { text: 'Tout le contenu du Pass Essentiel', included: true },
      { text: 'Accès direct aux séances Live Zoom/Google Meet', included: true },
      { text: 'Corrigés vidéo & replays des séances Live', included: true },
      { text: 'Accès illimité à tous les quizs interactifs', included: true },
      { text: 'Séances de révisions finales de fin d\'année', included: false }
    ],
    isPopular: true,
    isActive: true
  },
  {
    id: 'pack-revision-plus',
    category: 'Révision +',
    title: 'Pack Révision +',
    badgeLabel: 'Révision +',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-300',
    iconName: 'Sparkles',
    price: 140,
    originalPrice: 180,
    finalPrice: 140,
    discountPercentage: 22,
    period: 'Session BAC',
    description: 'Programme intensif de révisions finales BAC avec annales et méthodologie.',
    features: [
      { text: 'Sujets d\'examens blancs et annales BAC', included: true },
      { text: 'Séances intensives de révision en direct', included: true },
      { text: 'Fiches de synthèse et astuces méthodologiques', included: true },
      { text: 'Accès au simulateur de code Python', included: true },
      { text: 'Assistance pédagogique personnalisée', included: true }
    ],
    isActive: true
  },
  {
    id: 'pack-integrale',
    category: 'Intégrale',
    title: 'Pack Intégrale Tout-en-Un',
    badgeLabel: 'Intégrale',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-300',
    iconName: 'Crown',
    price: 350,
    originalPrice: 450,
    finalPrice: 350,
    discountPercentage: 22,
    period: 'Annuel',
    description: 'Formule tout-en-un incluant 100% des cours, devoirs, lives, replays et révisions BAC.',
    features: [
      { text: 'Accès universel à l\'intégralité des ressources', included: true },
      { text: 'Toutes les séances Live de l\'année + replays', included: true },
      { text: 'Programme complet de révision intensive BAC', included: true },
      { text: 'Tous les devoirs, synthèses et quizs interactifs', included: true },
      { text: 'Support prioritaire auprès des enseignants', included: true }
    ],
    isActive: true,
    autoFullAccess: true
  }
];
