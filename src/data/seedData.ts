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

export const INITIAL_TEST_STUDENTS: StudentUser[] = [];

export default INITIAL_TEST_STUDENTS;
