import React from 'react';
import { BADGE_COLORS } from '../constants/packages';
import { isUserAuthorized } from '../constants/badges';

export const renderBadge = (badge: string) => {
  const normalizedBadge = (badge || 'FREEMIUM').toUpperCase().trim();

  switch (normalizedBadge) {
    case 'GRATUIT':
    case 'FREEMIUM':
      return <span key={badge} className="badge px-2 py-0.5 text-xs font-semibold rounded-md bg-green-100 text-green-800">FREEMIUM</span>;
    case 'PREMIUM':
    case 'ESSENTIEL':
      return <span key={badge} className="badge px-2 py-0.5 text-xs font-semibold rounded-md bg-blue-100 text-blue-800">ESSENTIEL</span>;
    case 'PREMIUM+':
    case 'LIVE +':
    case 'LIVE+':
      return <span key={badge} className="badge px-2 py-0.5 text-xs font-semibold rounded-md bg-purple-100 text-purple-800">LIVE +</span>;
    case 'RÉVISION +':
    case 'REVISION +':
    case 'REVISION+':
      return <span key={badge} className="badge px-2 py-0.5 text-xs font-semibold rounded-md bg-pink-100 text-pink-800">RÉVISION +</span>;
    case 'PREMIUM++':
    case 'INTÉGRALE':
    case 'INTEGRALE':
      return <span key={badge} className="badge px-2 py-0.5 text-xs font-semibold rounded-md bg-yellow-100 text-yellow-800">INTÉGRALE</span>;
    default:
      return <span key={badge} className="badge px-2 py-0.5 text-xs font-semibold rounded-md bg-gray-100 text-gray-800">{normalizedBadge}</span>;
  }
};

export interface QuizCardProps {
  quiz: any;
  onSelect?: (quiz: any) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
  userBadge?: string;
  onAccessDenied?: (quiz: any) => void;
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
  quiz, 
  onSelect,
  onDelete,
  isAdmin = false,
  userBadge,
  onAccessDenied
}) => {
  const authorName = quiz.creatorName || quiz.authorName || 'Nabil Chaouch (Le Plus)';
  const authorInitials = quiz.authorInitials || (authorName.trim().charAt(0).toUpperCase() || 'N');
  const questionsCount = quiz.questionsCount || (Array.isArray(quiz.questions) ? quiz.questions.length : 1);

  const rawBadges = quiz.allowedBadges || quiz.allowedTiers || quiz.targetTiers || [quiz.requiredBadge || (quiz.isPremium ? 'ESSENTIEL' : 'FREEMIUM')];
  const badgeList: string[] = Array.isArray(rawBadges) ? rawBadges : [rawBadges];
  const isAccessible = !userBadge || isUserAuthorized(userBadge, badgeList);

  const handleClick = () => {
    if (!isAccessible) {
      if (onAccessDenied) onAccessDenied(quiz);
      return;
    }
    if (onSelect) {
      onSelect(quiz);
    }
  };

  return (
    <div 
      className="quiz-card student-card-bg relative overflow-hidden rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all flex flex-col justify-between text-left bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: "url('/hexagon-pattern.jpg')"
      }}
    >
      {/* Overlay translucide à 30% d'opacité */}
      <div className="p-5 bg-white/30 backdrop-blur-[1px] dark:bg-slate-900/40 h-full flex flex-col justify-between">
        <div>
          {/* Badges d'en-tête */}
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <span className="text-xs px-2 py-0.5 rounded border border-gray-300 bg-white/80 text-gray-700 font-semibold">
              {quiz.badgeType || 'cc'}
            </span>
            <span className="text-xs px-2 py-0.5 rounded bg-purple-100/90 text-purple-700 font-bold uppercase">
              {quiz.category || (quiz.type === 'qcm' ? 'QCM INTERACTIF' : quiz.type === 'fllblanks' ? 'TEXTE À TROUS' : 'DÉFI PYTHON')}
            </span>
            {(() => {
              const badges: string[] = Array.isArray(quiz.allowedBadges) && quiz.allowedBadges.length > 0
                ? quiz.allowedBadges
                : Array.isArray(quiz.allowedTiers) && quiz.allowedTiers.length > 0
                ? quiz.allowedTiers
                : Array.isArray(quiz.targetTiers) && quiz.targetTiers.length > 0
                ? quiz.targetTiers
                : [quiz.requiredBadge || (quiz.isPremium ? 'ESSENTIEL' : 'FREEMIUM')];

              const uniqueBadges = Array.from(new Set(badges.map((b: string) => (b || '').trim()).filter(Boolean)));

              return uniqueBadges.map((badge: string) => renderBadge(badge));
            })()}
          </div>

          {/* Titre du Quiz */}
          <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-snug mb-4">
            {quiz.title}
          </h3>
        </div>

        {/* Pied de carte : Bouton d'action */}
        <div className="mt-4 pt-3 border-t border-gray-200/60">
          <div className="flex items-center gap-2">
            {isAccessible ? (
              <button 
                type="button"
                onClick={handleClick}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>►</span>
                <span>Passer l'évaluation</span>
              </button>
            ) : (
              <button 
                type="button"
                onClick={handleClick}
                className="w-full bg-amber-500 hover:bg-amber-600 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
              >
                <span>🔒</span>
                <span>Accès refusé</span>
              </button>
            )}
            {isAdmin && onDelete && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(quiz.id);
                }}
                title="Supprimer ce quiz"
                className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer shrink-0"
              >
                🗑️
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
