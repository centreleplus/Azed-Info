export const ACADEMIC_LEVELS = [
  { value: '1ère', label: '1ère' },
  { value: '2ème', label: '2ème' },
  { value: '3ème', label: '3ème' },
  { value: '4ème', label: '4ème' }
];

// Fonction de nettoyage et normalisation automatique des niveaux
export const formatAcademicLevel = (levelInput: string): string => {
  if (!levelInput) return '';
  
  const cleaned = levelInput.trim();
  
  // Correction automatique des accents inversés "éme" -> "ème"
  if (/^1/i.test(cleaned) || /1(?:ère|ere|ére|er)?/i.test(cleaned)) return '1ère';
  if (/^2/i.test(cleaned) || /2(?:ème|eme|éme)?/i.test(cleaned)) return '2ème';
  if (/^3/i.test(cleaned) || /3(?:ème|eme|éme)?/i.test(cleaned)) return '3ème';
  if (/^4/i.test(cleaned) || /4(?:ème|eme|éme)?|bac/i.test(cleaned)) return '4ème';

  return cleaned;
};
