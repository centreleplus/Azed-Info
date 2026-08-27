export interface HomeFeatureCard {
  id: string;
  title: string;
  description: string;
  iconName: string; // 'bookmark' | 'calendar' | 'book-open' | 'tv' | 'shopping-bag' | 'check-square' | 'award'
  colorTheme: string; // Classes Tailwind pour le fond/icône (ex: 'bg-sky-500')
}

export const INITIAL_HOME_CARDS: HomeFeatureCard[] = [
  {
    id: 'quiz',
    title: 'Quiz express & défis',
    description: 'Valide tes connaissances instantanément avec des exercices interactifs corrigés.',
    iconName: 'bookmark',
    colorTheme: 'bg-sky-500',
  },
  {
    id: 'lives',
    title: 'Lives interactifs',
    description: 'Pose tes questions en direct à tes profs et lève tes doutes immédiatement.',
    iconName: 'calendar',
    colorTheme: 'bg-emerald-500',
  },
  {
    id: 'videos',
    title: 'Vidéos capsules',
    description: 'Des vidéos courtes et percutantes pour comprendre 100% du cours en 10 minutes.',
    iconName: 'book-open',
    colorTheme: 'bg-pink-500',
  },
  {
    id: 'replays',
    title: 'Replays illimités',
    description: 'Un cours manqué ou mal compris ? Revois tous les enregistrements quand tu veux.',
    iconName: 'tv',
    colorTheme: 'bg-amber-500',
  },
  {
    id: 'shop',
    title: 'Boutique & Livres Officiels',
    description: 'Commande directement tes manuels scolaires, séries d\'exercices imprimées et carnets de révision rédigés par M. Nabil Chaouch.',
    iconName: 'shopping-bag',
    colorTheme: 'bg-purple-600',
  },
  {
    id: 'exercises',
    title: 'Diversité des exercices',
    description: 'Une large gamme d\'exercices pratiques, de devoirs et de défis interactifs pour tester tes compétences.',
    iconName: 'check-square',
    colorTheme: 'bg-amber-500',
  },
];
