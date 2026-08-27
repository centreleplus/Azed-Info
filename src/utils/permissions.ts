/**
 * Contrôle d'accès et permissions pour les validations et actions plateforme
 */

export const canValidateSubscriptions = (userRole?: string | null): boolean => {
  if (!userRole) return false;
  const role = userRole.toUpperCase();
  return role === 'ADMIN' || role === 'AGENT';
};

export default canValidateSubscriptions;
