import React from 'react';
import { UserCategory, OFFICIAL_BADGES, parseUserCategoryStrict } from '../types/badgeTypes';
import { UniversalBadge } from './UniversalBadge';

export type { UserCategory };

export interface BadgeTheme {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const SYSTEM_BADGES: Record<UserCategory, BadgeTheme> = {
  "FREEMIUM": {
    label: "FREEMIUM",
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300"
  },
  "ESSENTIEL": {
    label: "ESSENTIEL",
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-300"
  },
  "LIVE+": {
    label: "LIVE+",
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-300"
  },
  "REVISION+": {
    label: "REVISION+",
    bg: "bg-indigo-100",
    text: "text-indigo-900",
    border: "border-indigo-300"
  },
  "INTEGRAL": {
    label: "INTEGRAL",
    bg: "bg-purple-100",
    text: "text-purple-900",
    border: "border-purple-300"
  }
};

export interface UnifiedBadgeProps {
  category?: string;
  showIcon?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const UnifiedBadge: React.FC<UnifiedBadgeProps> = ({ 
  category, 
  size = 'md',
  className = ''
}) => {
  return <UniversalBadge category={category} size={size} className={className} />;
};

export { UniversalBadge };
export default UnifiedBadge;
