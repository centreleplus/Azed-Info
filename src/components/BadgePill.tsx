import React from 'react';
import { normalizeSubscriptionTier, SubscriptionTier } from '../constants/packages';

export interface BadgePillProps {
  badge?: string | null;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const BadgePill: React.FC<BadgePillProps> = ({ 
  badge, 
  className = '',
  size = 'md'
}) => {
  const normalizedBadge: SubscriptionTier = normalizeSubscriptionTier(badge);
  
  // Couleurs et styles normalisés selon le pack
  const badgeStyles: Record<SubscriptionTier, string> = {
    'FREEMIUM': 'bg-gray-100 text-gray-700 border-gray-200',
    'ESSENTIEL': 'bg-blue-50 text-blue-700 border-blue-200',
    'LIVE +': 'bg-purple-50 text-purple-700 border-purple-200',
    'RÉVISION +': 'bg-amber-50 text-amber-700 border-amber-200',
    'INTÉGRALE': 'bg-emerald-50 text-emerald-700 border-emerald-200',
  };

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px]',
    md: 'px-2.5 py-1 text-xs',
    lg: 'px-3.5 py-1.5 text-sm'
  };

  return (
    <span 
      data-testid="badge-pill"
      className={`inline-flex items-center justify-center font-bold rounded-lg border shadow-2xs tracking-wide uppercase transition-all shrink-0 ${badgeStyles[normalizedBadge] || badgeStyles['FREEMIUM']} ${sizeClasses[size]} ${className}`}
    >
      {normalizedBadge}
    </span>
  );
};

export default BadgePill;
