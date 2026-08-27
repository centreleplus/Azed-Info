export type StudentTier = 'FREEMIUM' | 'PREMIUM' | 'PREMIUM_PLUS' | 'PREMIUM_PLUS_PLUS' | 'ESSENTIEL';

export interface TierConfig {
  id: StudentTier;
  label: string;
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  iconName: string;
  description: string;
}

export const STUDENT_TIERS: Record<StudentTier, TierConfig> = {
  FREEMIUM: {
    id: 'FREEMIUM',
    label: 'Freemium',
    badgeBg: 'bg-slate-100',
    badgeText: 'text-slate-700',
    badgeBorder: 'border-slate-300',
    iconName: 'User',
    description: 'Accès limité (Démos, extraits de cours, fiches, exercices et quizs)'
  },
  PREMIUM: {
    id: 'PREMIUM',
    label: 'Premium',
    badgeBg: 'bg-emerald-100',
    badgeText: 'text-emerald-800',
    badgeBorder: 'border-emerald-300',
    iconName: 'Zap',
    description: 'Accès complet aux cours, fiches, devoirs, corrigés + sélection de quizs'
  },
  PREMIUM_PLUS: {
    id: 'PREMIUM_PLUS',
    label: 'Premium+',
    badgeBg: 'bg-blue-100',
    badgeText: 'text-blue-800',
    badgeBorder: 'border-blue-300',
    iconName: 'Star',
    description: 'Accès Premium + Séances Live + Corrigés Live + Tous les quizs'
  },
  PREMIUM_PLUS_PLUS: {
    id: 'PREMIUM_PLUS_PLUS',
    label: 'Premium++',
    badgeBg: 'bg-purple-100',
    badgeText: 'text-purple-800',
    badgeBorder: 'border-purple-300',
    iconName: 'Crown',
    description: 'Accès Premium+ + Révisions finales + Corrigés Bacs + Lives & conseils'
  },
  ESSENTIEL: {
    id: 'ESSENTIEL',
    label: 'Essentiel',
    badgeBg: 'bg-amber-100',
    badgeText: 'text-amber-800',
    badgeBorder: 'border-amber-300',
    iconName: 'ShieldCheck',
    description: 'Pass Essentiel Illimité : Accès automatique et direct à 100% des ressources sans attente'
  }
};
