export interface AcademicBranch {
  id: string;
  label: string;
  shortLabel?: string;
}

// Constante unique à utiliser sur l'ensemble du projet
export const ACADEMIC_BRANCHES: AcademicBranch[] = [
  { id: 'info', label: "Sciences de l'Informatique", shortLabel: "Info" },
  { id: 'math', label: 'Mathématiques', shortLabel: "Math" },
  { id: 'sc_exp', label: 'Sciences Expérimentales', shortLabel: "Sciences Exp" },
  { id: 'sc_tech', label: 'Sciences Techniques', shortLabel: "Technique" },
  { id: 'eco', label: 'Économie & Gestion', shortLabel: "Éco-Gestion" },
  { id: 'lettres', label: 'Lettres', shortLabel: "Lettres" },
  { id: 'sport', label: 'Sport', shortLabel: "Sport" },
];

export const ACADEMIC_BRANCH_LABELS = ACADEMIC_BRANCHES.map(b => b.label);

export const ALL_SECTIONS_OPTIONS = [
  "Sciences de l'Informatique",
  "Mathématiques",
  "Sciences Expérimentales",
  "Sciences Techniques",
  "Économie & Gestion",
  "Lettres",
  "Sport",
  "Tronc Commun"
];

// Helper to normalize and check branch matching
export const matchesBranch = (branch1?: string, branch2?: string): boolean => {
  if (!branch1 || !branch2) return false;
  if (branch1 === 'Tous' || branch2 === 'Tous' || branch1 === 'ALL' || branch2 === 'ALL') return true;
  const b1 = branch1.toLowerCase().replace(/&/g, 'et').replace(/[^a-z0-9]/g, '');
  const b2 = branch2.toLowerCase().replace(/&/g, 'et').replace(/[^a-z0-9]/g, '');
  return b1 === b2 || b1.includes(b2) || b2.includes(b1);
};
