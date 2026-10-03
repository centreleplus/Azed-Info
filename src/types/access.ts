export type SubscriptionTier = 'FREEMIUM' | 'ESSENTIEL' | 'LIVE +' | 'RÉVISION +' | 'INTÉGRALE';

export type StudentTier = 
  | 'Freemium' 
  | 'Essentiel' 
  | 'Live +' 
  | 'Révision +' 
  | 'Intégrale'
  | SubscriptionTier;

export interface TierConfig {
  id: string;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconName?: string;
  description: string;
}

export const AUTHORIZED_TIERS: ('Freemium' | 'Essentiel' | 'Live +' | 'Révision +' | 'Intégrale')[] = [
  'Freemium',
  'Essentiel',
  'Live +',
  'Révision +',
  'Intégrale'
];

export const STUDENT_TIERS: Record<string, TierConfig> = {
  'Freemium': {
    id: 'Freemium',
    label: 'Freemium',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    description: 'Accès limité (Démos, extraits de cours, fiches, exercices et quizs)'
  },
  'Essentiel': {
    id: 'Essentiel',
    label: 'Essentiel',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-300',
    description: 'Pass Essentiel : Accès direct aux séries, fiches, devoirs et quizs 100% corrigés'
  },
  'Live +': {
    id: 'Live +',
    label: 'Live +',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300',
    description: 'Pack Live + : Cours interactifs en direct + Replays illimités + Corrigés'
  },
  'Révision +': {
    id: 'Révision +',
    label: 'Révision +',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-300',
    description: 'Pack Révision + : Révisions intensives BAC, Lives & conseils ciblés'
  },
  'Intégrale': {
    id: 'Intégrale',
    label: 'Intégrale',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-300',
    description: 'Formule Intégrale Tout-en-Un : 100% des ressources, Lives et révisions BAC'
  },
  // Aliases de compatibilité ascendante
  'FREEMIUM': {
    id: 'Freemium',
    label: 'Freemium',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-800',
    badgeBorder: 'border-slate-300',
    description: 'Accès limité'
  },
  'ESSENTIEL': {
    id: 'Essentiel',
    label: 'Essentiel',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-900',
    badgeBorder: 'border-blue-300',
    description: 'Pass Essentiel'
  },
  'PREMIUM': {
    id: 'Live +',
    label: 'Live +',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-900',
    badgeBorder: 'border-emerald-300',
    description: 'Pack Live +'
  },
  'PREMIUM_PLUS': {
    id: 'Révision +',
    label: 'Révision +',
    badgeBg: 'bg-indigo-100',
    badgeText: 'text-indigo-900',
    badgeBorder: 'border-indigo-300',
    description: 'Pack Révision +'
  },
  'PREMIUM_PLUS_PLUS': {
    id: 'Intégrale',
    label: 'Intégrale',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-900',
    badgeBorder: 'border-purple-300',
    description: 'Formule Intégrale'
  }
};
