export type SubscriptionTier = 'FREEMIUM' | 'ESSENTIEL' | 'LIVE+' | 'REVISION+' | 'INTEGRAL';

export type StudentTier = 
  | 'FREEMIUM' 
  | 'ESSENTIEL' 
  | 'LIVE+' 
  | 'REVISION+' 
  | 'INTEGRAL'
  | SubscriptionTier
  | string;

export interface TierConfig {
  id: string;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconName?: string;
  description: string;
}

export const AUTHORIZED_TIERS: SubscriptionTier[] = [
  'FREEMIUM',
  'ESSENTIEL',
  'LIVE+',
  'REVISION+',
  'INTEGRAL'
];

export const STUDENT_TIERS: Record<string, TierConfig> = {
  'FREEMIUM': {
    id: 'FREEMIUM',
    label: 'FREEMIUM',
    badgeBg: 'bg-gray-100',
    badgeText: 'text-gray-700',
    badgeBorder: 'border-gray-200',
    description: 'Accès limité (Démos, extraits de cours, fiches, exercices et quizs)'
  },
  'ESSENTIEL': {
    id: 'ESSENTIEL',
    label: 'ESSENTIEL',
    badgeBg: 'bg-blue-50',
    badgeText: 'text-blue-700',
    badgeBorder: 'border-blue-200',
    description: 'Pass Essentiel : Accès direct aux séries, fiches, devoirs et quizs 100% corrigés'
  },
  'LIVE+': {
    id: 'LIVE+',
    label: 'LIVE+',
    badgeBg: 'bg-purple-50',
    badgeText: 'text-purple-700',
    badgeBorder: 'border-purple-200',
    description: 'Pack Live+ : Cours interactifs en direct + Replays illimités + Corrigés'
  },
  'REVISION+': {
    id: 'REVISION+',
    label: 'REVISION+',
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    badgeBorder: 'border-amber-200',
    description: 'Pack Révision+ : Révisions intensives BAC, Lives & conseils ciblés'
  },
  'INTEGRAL': {
    id: 'INTEGRAL',
    label: 'INTEGRAL',
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    badgeBorder: 'border-emerald-200',
    description: 'Formule Intégrale Tout-en-Un : 100% des ressources, Lives et révisions BAC'
  },
  // Aliases
  'Freemium': { id: 'FREEMIUM', label: 'FREEMIUM', badgeBg: 'bg-gray-100', badgeText: 'text-gray-700', badgeBorder: 'border-gray-200', description: 'Accès limité' },
  'Essentiel': { id: 'ESSENTIEL', label: 'ESSENTIEL', badgeBg: 'bg-blue-50', badgeText: 'text-blue-700', badgeBorder: 'border-blue-200', description: 'Pass Essentiel' },
  'Live +': { id: 'LIVE+', label: 'LIVE+', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700', badgeBorder: 'border-purple-200', description: 'Pack Live+' },
  'LIVE +': { id: 'LIVE+', label: 'LIVE+', badgeBg: 'bg-purple-50', badgeText: 'text-purple-700', badgeBorder: 'border-purple-200', description: 'Pack Live+' },
  'Révision +': { id: 'REVISION+', label: 'REVISION+', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200', description: 'Pack Révision+' },
  'RÉVISION +': { id: 'REVISION+', label: 'REVISION+', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', badgeBorder: 'border-amber-200', description: 'Pack Révision+' },
  'Intégrale': { id: 'INTEGRAL', label: 'INTEGRAL', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200', description: 'Formule Intégrale' },
  'INTÉGRALE': { id: 'INTEGRAL', label: 'INTEGRAL', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', badgeBorder: 'border-emerald-200', description: 'Formule Intégrale' }
};
