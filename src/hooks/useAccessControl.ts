import { StudentTier } from '../types/access';

export const checkStudentAccess = (
  userTier: StudentTier,
  requiredTiers: StudentTier[]
): boolean => {
  if (!requiredTiers || requiredTiers.length === 0) return true;
  return requiredTiers.includes(userTier);
};
