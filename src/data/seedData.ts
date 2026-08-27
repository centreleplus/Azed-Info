export interface StudentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  city: string;
  schoolName: string;
  level: string; // ex: 4ème, 3ème
  section: string; // ex: Sciences de l'Informatique
  packCategory: 'Freemium' | 'Premium' | 'Premium+' | 'Premium++';
  badgeLabel: string;
  groupName: string; // 'Groupe A', 'Groupe B', 'Non assigné'
  status: 'Actif' | 'En attente' | 'Inactif';
  createdAt: string;
}

export const INITIAL_TEST_STUDENTS: StudentUser[] = [
  {
    id: 'std-1',
    firstName: 'Fedi',
    lastName: 'Ben Amor',
    email: 'fedi.freemium@azed.info',
    phone: '21698123456',
    city: 'Tunis',
    schoolName: 'Lycée Pilote Tunis',
    level: '4ème',
    section: "Sciences de l'Informatique",
    packCategory: 'Freemium',
    badgeLabel: 'Option Gratuit',
    groupName: 'Non assigné',
    status: 'Actif',
    createdAt: '2026-08-10'
  },
  {
    id: 'std-2',
    firstName: 'Yasmine',
    lastName: 'Mansour',
    email: 'yasmine.premium@azed.info',
    phone: '21697234567',
    city: 'Sousse',
    schoolName: 'Lycée Garçons Sousse',
    level: '3ème',
    section: "Sciences de l'Informatique",
    packCategory: 'Premium',
    badgeLabel: 'Pack Premium',
    groupName: 'Groupe A',
    status: 'Actif',
    createdAt: '2026-08-11'
  },
  {
    id: 'std-3',
    firstName: 'Amine',
    lastName: 'Shraib',
    email: 'amine.premiumplus@azed.info',
    phone: '21695345678',
    city: 'Sousse',
    schoolName: 'Lycée Pilote Sousse',
    level: '4ème',
    section: "Sciences de l'Informatique",
    packCategory: 'Premium+',
    badgeLabel: 'Pack Premium+',
    groupName: 'Groupe B',
    status: 'Actif',
    createdAt: '2026-08-12'
  },
  {
    id: 'std-4',
    firstName: 'Salma',
    lastName: 'Rebik',
    email: 'salma.premiumplusplus@azed.info',
    phone: '21692456789',
    city: 'Sfax',
    schoolName: 'Lycée de Filles Sfax',
    level: '3ème',
    section: "Sciences de l'Informatique",
    packCategory: 'Premium++',
    badgeLabel: 'Pack Premium++',
    groupName: 'Groupe A',
    status: 'Actif',
    createdAt: '2026-08-14'
  },
  {
    id: 'std-5',
    firstName: 'Khalil',
    lastName: 'Ben Romdhane',
    email: 'khalil.pending@azed.info',
    phone: '21696567890',
    city: 'Sfax',
    schoolName: 'Lycée Pilote Sfax',
    level: '4ème',
    section: "Sciences de l'Informatique",
    packCategory: 'Freemium',
    badgeLabel: 'Option Gratuit',
    groupName: 'Non assigné',
    status: 'En attente',
    createdAt: '2026-08-15'
  }
];

export default INITIAL_TEST_STUDENTS;
