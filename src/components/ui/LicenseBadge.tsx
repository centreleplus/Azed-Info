import React from 'react';
import { Crown, Sparkles, User, Zap, Star } from 'lucide-react';
import { StudentTier, STUDENT_TIERS } from '../../types/access';
import { normalizePackName, PackType } from '../../constants/packages';

interface LicenseBadgeProps {
  type?: 'freemium' | 'premium' | StudentTier | string;
  tier?: StudentTier | string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

export const LicenseBadge: React.FC<LicenseBadgeProps> = ({
  type = 'freemium',
  tier,
  size = 'md',
  showLabel = true,
}) => {
  const normPack: PackType = normalizePackName((tier || type) as string);
  const tierInfo = STUDENT_TIERS[normPack] || STUDENT_TIERS['Freemium'];

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
    switch (normPack) {
      case 'Freemium': return <User className={`${iconSizes[size]} shrink-0`} />;
      case 'Essentiel': return <Star className={`${iconSizes[size]} shrink-0 fill-blue-200`} />;
      case 'Live +': return <Zap className={`${iconSizes[size]} shrink-0 fill-emerald-200`} />;
      case 'Révision +': return <Sparkles className={`${iconSizes[size]} shrink-0 fill-indigo-200`} />;
      case 'Intégrale': return <Crown className={`${iconSizes[size]} shrink-0 fill-purple-200`} />;
      default: return <User className={`${iconSizes[size]} shrink-0`} />;
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

