import { SubscriptionTier, normalizeSubscriptionTier } from '../constants/packages';
import { UserProfile } from './UserService';

export const filterCoursesByActiveBadge = (courses: any[], studentBadge: string) => {
  if (!Array.isArray(courses) || !studentBadge) return [];
  const target = normalizeSubscriptionTier(studentBadge).toUpperCase().trim();

  return courses.filter((course) => {
    const allowed = Array.isArray(course.allowedTiers) && course.allowedTiers.length > 0
      ? course.allowedTiers
      : Array.isArray(course.accessTiers) && course.accessTiers.length > 0
      ? course.accessTiers
      : Array.isArray(course.tiers) && course.tiers.length > 0
      ? course.tiers
      : Array.isArray(course.targetTiers) && course.targetTiers.length > 0
      ? course.targetTiers
      : Array.isArray(course.target?.userCategories) && course.target.userCategories.length > 0
      ? course.target.userCategories
      : ['FREEMIUM'];

    return allowed.some((tier: string) => normalizeSubscriptionTier(tier).toUpperCase().trim() === target);
  });
};

// Filtrage strict et vérification de cohérence
export const getFilteredStudentContent = (
  allContent: any[],
  studentUser: UserProfile | any
): any[] => {
  if (!allContent || !Array.isArray(allContent) || !studentUser) return [];

  const activeBadge = normalizeSubscriptionTier(studentUser.badge || studentUser.subscriptionTier || studentUser.userCategory || 'FREEMIUM');
  return filterCoursesByActiveBadge(allContent, activeBadge);
};

export const getVisibleDocumentsForStudent = (
  documents: any[],
  studentBadgeOrUser: any
): any[] => {
  if (typeof studentBadgeOrUser === 'string') {
    return filterCoursesByActiveBadge(documents, studentBadgeOrUser);
  }
  return getFilteredStudentContent(documents, studentBadgeOrUser);
};

export default filterCoursesByActiveBadge;
