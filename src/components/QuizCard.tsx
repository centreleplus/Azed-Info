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
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between text-left">
      <div>
        {/* Badges d'en-tête réduits et essentiels */}
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-blue-50 text-blue-600 border border-blue-100">
            {quiz.badgeType || 'Rappel'}
          </span>
          <span className="px-2.5 py-1 text-xs font-bold rounded-md bg-indigo-50 text-indigo-700 uppercase">
            {quiz.category || (quiz.type === 'qcm' ? 'QCM INTERACTIF' : quiz.type === 'fllblanks' ? 'TEXTE À TROUS' : 'DÉFI PYTHON')}
          </span>
          {quiz.difficulty && (
            <span className="px-2 py-1 text-xs text-gray-500 font-medium">
              {quiz.difficulty}
            </span>
          )}
        </div>

        {/* Titre du Quiz */}
        <h3 className="text-xl font-bold text-emerald-800 mb-2 leading-snug">
          {quiz.title}
        </h3>

        {/* Note: La description textuelle et le détail des filières/niveaux ciblés sont délibérément masqués */}
      </div>

      {/* Pied de carte : Auteur, Nombre de questions et Bouton d'action */}
      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
          <div className="flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-[10px]">
              {authorInitials}
            </span>
            <span className="font-medium text-gray-700 truncate max-w-[170px]">
              {authorName}
            </span>
          </div>
          <span className="font-semibold text-gray-600">
            {questionsCount} question{questionsCount > 1 ? 's' : ''}
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={handleClick}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
          >
            <span>Passer l'évaluation</span>
            <span>›</span>
          </button>
          {isAdmin && onDelete && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(quiz.id);
              }}
              title="Supprimer ce quiz"
              className="p-2.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors cursor-pointer"
            >
              🗑️
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizCard;
