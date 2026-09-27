import { 
  BookOpen,      // Fiches & cours
  FileText,      // Devoirs & Exercices
  CheckCircle2,  // Zone Correction
  RotateCcw,     // Révision
  HelpCircle,    // Quiz Interactifs
  Calendar,      // Calendrier & Live
  FolderDown,    // Démo & Extraits
  User,          // Profil & Formules
  ShoppingBag    // Mes Commandes & Abonnements
} from 'lucide-react';

export const STUDENT_MENU_ITEMS = [
  {
    id: 'fiches',
    label: 'Fiches & cours',
    icon: BookOpen,
    children: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre']
  },
  {
    id: 'devoirs',
    label: 'Devoirs & Exercices',
    icon: FileText,
    children: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre', 'Énoncé Live']
  },
  {
    id: 'correction',
    label: 'Zone Correction',
    icon: CheckCircle2,
    children: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre']
  },
  {
    id: 'revision',
    label: 'Révision',
    icon: RotateCcw,
    children: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre']
  },
  {
    id: 'quiz',
    label: 'Quiz Interactifs',
    icon: HelpCircle,
    children: ['1er Trimestre', '2ème Trimestre', '3ème Trimestre']
  },
  {
    id: 'calendar',
    label: 'Calendrier & Live',
    icon: Calendar
  },
  {
    id: 'demo',
    label: 'Démo & Extraits',
    icon: FolderDown
  }
];
