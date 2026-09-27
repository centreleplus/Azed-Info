export const formatTrimester = (trimester: string): string => {
  if (!trimester) return '';
  return trimester
    .replace(/1ère/gi, '1er')
    .replace(/1ÈRE/g, '1ER');
};

export const formatGradeLevel = (level: string): string => {
  if (!level) return '';
  if (level === '1er' || level === '1ère' || level === '1ere' || level === '1ère Année' || level === '1ere Annee') return '1ère';
  return level;
};
