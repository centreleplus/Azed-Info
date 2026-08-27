import React from 'react';
import { Crown, Sparkles, User, Zap, Star } from 'lucide-react';
import { StudentTier, STUDENT_TIERS } from '../../types/access';

interface LicenseBadgeProps {
  type?: 'freemium' | 'premium' | StudentTier;
  tier?: StudentTier;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const LicenseBadge: React.FC<LicenseBadgeProps> = ({
  type = 'freemium',
  tier,
  size = 'md',
  showLabel = true,
}) => {
  // Determine effective tier
  let effectiveTier: StudentTier = 'FREEMIUM';
  if (tier) {
    effectiveTier = tier;
  } else if (typeof type === 'string') {
    const upper = type.toUpperCase();
    if (upper === 'FREEMIUM') effectiveTier = 'FREEMIUM';
    else if (upper === 'PREMIUM') effectiveTier = 'PREMIUM';
    else if (upper === 'PREMIUM_PLUS' || upper === 'PREMIUM+') effectiveTier = 'PREMIUM_PLUS';
    else if (upper === 'PREMIUM_PLUS_PLUS' || upper === 'PREMIUM++') effectiveTier = 'PREMIUM_PLUS_PLUS';
    else effectiveTier = 'FREEMIUM';
  }

  const tierInfo = STUDENT_TIERS[effectiveTier] || STUDENT_TIERS.FREEMIUM;

  // Tailles ajustables
  const sizeClasses = {
    sm: 'text-[10px] px-2 py-0.5 gap-1',
    md: 'text-xs px-2.5 py-1 gap-1.5',
    lg: 'text-sm px-3.5 py-1.5 gap-2',
  };

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-3.5 h-3.5',
    lg: 'w-4 h-4',
  };

  const renderIcon = () => {
    switch (tierInfo.iconName) {
      case 'User': return <User className={`${iconSizes[size]} shrink-0`} />;
      case 'Zap': return <Zap className={`${iconSizes[size]} shrink-0 fill-emerald-200`} />;
      case 'Star': return <Star className={`${iconSizes[size]} shrink-0 fill-blue-200`} />;
      case 'Crown': return <Crown className={`${iconSizes[size]} shrink-0 fill-purple-200`} />;
      default: return <Sparkles className={`${iconSizes[size]} shrink-0`} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center font-extrabold rounded-full border transition-all ${
        sizeClasses[size]
      } ${tierInfo.badgeBg} ${tierInfo.badgeText} ${tierInfo.badgeBorder} shadow-2xs`}
    >
      {renderIcon()}
      {showLabel && (
        <span className="tracking-wide">
          {tierInfo.label}
        </span>
      )}
    </span>
  );
};

export default LicenseBadge;

