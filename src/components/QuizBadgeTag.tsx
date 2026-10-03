import React from 'react';

export const BADGE_STYLES: Record<string, { bg: string; text: string; border: string }> = {
  'FREEMIUM': { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-300' },
  'ESSENTIEL': { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-300' },
  'LIVE +': { bg: 'bg-teal-100', text: 'text-teal-800', border: 'border-teal-300' },
  'RÉVISION +': { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-300' },
  'INTÉGRALE': { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-300' }
};

export const LEGACY_MAPPING: Record<string, string> = {
  'GRATUIT': 'FREEMIUM',
  'Gratuit': 'FREEMIUM',
  'gratuit': 'FREEMIUM',
  'FREE': 'FREEMIUM',
  'Free': 'FREEMIUM',
  'free': 'FREEMIUM',
  'STUDENT': 'FREEMIUM',
  'Student': 'FREEMIUM',
  'student': 'FREEMIUM',
  'PREMIUM': 'ESSENTIEL',
  'Premium': 'ESSENTIEL',
  'premium': 'ESSENTIEL',
  'PREMIUM+': 'LIVE +',
  'Premium+': 'LIVE +',
  'premium+': 'LIVE +',
  'PREMIUM_PLUS': 'LIVE +',
  'PREMIUM++': 'INTÉGRALE',
  'Premium++': 'INTÉGRALE',
  'premium++': 'INTÉGRALE',
  'PREMIUM_PLUS_PLUS': 'INTÉGRALE',
  'REVISION +': 'RÉVISION +',
  'REVISION+': 'RÉVISION +',
  'INTEGRALE': 'INTÉGRALE'
};

export interface QuizBadgeTagProps {
  badges?: any;
  className?: string;
}

export const QuizBadgeTag: React.FC<QuizBadgeTagProps> = ({ badges, className = "" }) => {
  // Convertir en tableau si c'est une chaîne unique ou null
  const rawList = Array.isArray(badges) ? badges : [badges];
  const flattened = rawList.flat().filter(Boolean);
  const badgeList = flattened.length > 0 ? flattened : ['FREEMIUM'];

  // Élimination des doublons après normalisation
  const uniqueBadges = Array.from(
    new Set(
      badgeList.map((badgeItem: any) => {
        const str = String(badgeItem || '').trim();
        return LEGACY_MAPPING[str] || LEGACY_MAPPING[str.toUpperCase()] || str.toUpperCase() || 'FREEMIUM';
      })
    )
  );

  return (
    <div className={`flex flex-wrap gap-1 items-center ${className}`}>
      {uniqueBadges.map((cleanBadge, index) => {
        const style = BADGE_STYLES[cleanBadge] || BADGE_STYLES['FREEMIUM'];

        return (
          <span
            key={index}
            className={`px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide border ${style.bg} ${style.text} ${style.border} shadow-2xs`}
          >
            {cleanBadge}
          </span>
        );
      })}
    </div>
  );
};

export default QuizBadgeTag;
