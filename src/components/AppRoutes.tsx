import React from 'react';

/**
 * Utility function returning the default route path for a given user role.
 * - ADMIN -> /admin/frais-inscription (Section 1: Finances & Valideur -> Frais d'Inscription)
 * - AGENT -> /agent/validation-comptes
 * - STUDENT / default -> /student/courses
 */
export const getDefaultRouteForRole = (role?: string): string => {
  if (!role) return '/student/courses';
  const normalizedRole = role.toUpperCase();
  switch (normalizedRole) {
    case 'ADMIN':
      return '/admin/frais-inscription';
    case 'AGENT':
      return '/agent/validation-comptes';
    case 'STUDENT':
    default:
      return '/student/courses';
  }
};

/**
 * Helper to check if a route path or tab is valid for the given role.
 */
export const isValidRouteForRole = (role: string | undefined, currentPathOrTab: string): boolean => {
  if (!role) return false;
  const normalizedRole = role.toUpperCase();
  const path = currentPathOrTab.toLowerCase().replace('#/', '').replace('#', '');

  if (normalizedRole === 'ADMIN') {
    return path.startsWith('admin') || path === 'admin';
  }

  if (normalizedRole === 'AGENT') {
    return path.startsWith('agent') || path === 'agent';
  }

  if (normalizedRole === 'STUDENT') {
    return !path.startsWith('admin') && !path.startsWith('agent');
  }

  return false;
};
