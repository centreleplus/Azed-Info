import React from 'react';

export interface QuizCardProps {
  quiz: any;
  onSelect?: (quiz: any) => void;
  onDelete?: (id: string) => void;
  isAdmin?: boolean;
}

export const QuizCard: React.FC<QuizCardProps> = ({ 
  quiz, 
  onSelect,
  onDelete,
  isAdmin = false 
}) => {
  const authorName = quiz.creatorName || quiz.authorName || 'Nabil Chaouch (Le Plus)';
  const authorInitials = quiz.authorInitials || (authorName.trim().charAt(0).toUpperCase() || 'N');
  const questionsCount = quiz.questionsCount || (Array.isArray(quiz.questions) ? quiz.questions.length : 1);

  const handleClick = () => {
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
            {quiz.difficulty && (
              <span className="text-xs px-2 py-0.5 rounded bg-gray-100/80 text-gray-600 font-medium">
                {quiz.difficulty}
              </span>
            )}
          </div>

          {/* Titre du Quiz */}
          <h3 className="text-lg font-bold text-emerald-700 dark:text-emerald-400 leading-snug mb-4">
            {quiz.title}
          </h3>
        </div>

        {/* Pied de carte : Bouton d'action */}
        <div className="mt-4 pt-3 border-t border-gray-200/60">
          <div className="flex items-center gap-2">
            <button 
              type="button"
              onClick={handleClick}
              className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-medium py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
            >
              <span>►</span>
              <span>Passer l'évaluation</span>
            </button>
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
