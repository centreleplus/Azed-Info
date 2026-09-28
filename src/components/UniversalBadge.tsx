import React from 'react';
import { UserCategory, OFFICIAL_BADGES, parseUserCategoryStrict } from '../types/badgeTypes';

export interface UniversalBadgeProps {
  category?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UniversalBadge: React.FC<UniversalBadgeProps> = ({ 
  category = "Freemium", 
  size = 'md',
  className = ''
}) => {
  const normalizedKey: UserCategory = parseUserCategoryStrict(category);
  const badge = OFFICIAL_BADGES[normalizedKey] || OFFICIAL_BADGES.Freemium;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-3 py-1 text-xs',
    lg: 'px-4 py-1.5 text-sm'
  };

  return (
    <span
      className={`inline-flex items-center justify-center font-bold rounded-lg border ${badge.bgClass} ${badge.textClass} ${badge.borderClass} ${sizeClasses[size]} shadow-2xs tracking-wide uppercase transition-all shrink-0 ${className}`}
    >
      {badge.label}
    </span>
  );
};

export default UniversalBadge;
