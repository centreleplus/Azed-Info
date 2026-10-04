import React, { useState, useEffect } from 'react';
import { canAccessQuiz, normalizeBadge } from '../constants/badges';
import { AccessDeniedModal } from './AccessDeniedModal';

export const QcmStudentDashboard = ({ currentUser, onSelectQuiz }: { currentUser: any; onSelectQuiz?: (quiz: any) => void }) => {
  const [selectedTrimester, setSelectedTrimester] = useState('ALL');
  const [selectedQuizForModal, setSelectedQuizForModal] = useState<any>(null);
  const [isDeniedModalOpen, setIsDeniedModalOpen] = useState(false);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userBadgeNormalized = normalizeBadge(currentUser?.activeBadge || currentUser?.badge || (currentUser as any)?.subscriptionBadge);

  // Charger tous les quiz (avec refetch automatique)
  const fetchQuizzes = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/quizzes?trimester=${selectedTrimester}`, {
        headers: {
          'x-user-role': currentUser?.role || 'student',
          'x-user-badge': userBadgeNormalized,
          'x-user-grade': currentUser?.grade || '',
          'x-user-section': currentUser?.section || ''
        }
      });
      const json = await res.json();
      setQuizzes(Array.isArray(json) ? json : (json.data || json.quizzes || []));
    } catch (err) {
      console.error("Erreur de chargement des quiz:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQuizzes();
    const interval = setInterval(fetchQuizzes, 30000);
    const onFocus = () => fetchQuizzes();
    window.addEventListener('focus', onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener('focus', onFocus);
    };
  }, [selectedTrimester, currentUser]);

  const handleOpenDeniedModal = (quiz: any) => {
    setSelectedQuizForModal(quiz);
    setIsDeniedModalOpen(true);
  };

  return (
    <div className="qcm-page-container flex flex-col gap-6 p-6">
      
      {/* Menu / Tabs des Trimestres */}
      <div className="flex flex-wrap gap-2 border-b pb-3">
        {['ALL', '1ER TRIMESTRE', '2ÈME TRIMESTRE', '3ÈME TRIMESTRE'].map(tri => (
          <button
            key={tri}
            onClick={() => setSelectedTrimester(tri)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition cursor-pointer ${
              selectedTrimester === tri 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {tri === 'ALL' ? '🌐 TOUS LES TRIMESTRES' : tri}
          </button>
        ))}
      </div>

      {/* Grille des Quiz */}
      {isLoading ? (
        <div className="p-8 text-center text-slate-400 font-semibold">Chargement des quiz interactifs...</div>
      ) : quizzes.length === 0 ? (
        <div className="p-8 text-center text-slate-400 font-semibold">Aucun quiz disponible pour ce trimestre.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quizzes.map((quiz: any) => {
            const rawBadges = quiz.allowedBadges || quiz.allowedTiers || quiz.targetTiers || [quiz.requiredBadge || (quiz.isPremium ? 'ESSENTIEL' : 'FREEMIUM')];
            const badgeList: string[] = Array.isArray(rawBadges) ? rawBadges : [rawBadges];
            const hasAccess = canAccessQuiz(userBadgeNormalized, badgeList);

            return (
              <div key={quiz.id || quiz._id} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm flex flex-col justify-between hover:shadow-md transition">
                <div>
                  {/* Badges du Quiz */}
                  <div className="flex flex-wrap gap-1.5 mb-3">
                    <span className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-purple-100 text-purple-700 uppercase">
                      {quiz.type === 'qcm' ? 'QCM INTERACTIF' : quiz.type === 'fllblanks' ? 'TEXTE À TROUS' : quiz.type === 'coding_challenge' ? 'DÉFI PYTHON' : (quiz.type || 'QCM INTERACTIF')}
                    </span>
                    {badgeList.map((badge: string, i: number) => (
                      <span key={i} className="text-xs font-bold px-2.5 py-0.5 rounded-md bg-blue-100 text-blue-800 uppercase">
                        {badge}
                      </span>
                    ))}
                  </div>

                  <h3 className="font-bold text-slate-800 text-lg mb-1">{quiz.title || quiz.code}</h3>
                  <p className="text-sm text-slate-500 mb-4">{quiz.chapterTitle || quiz.chapter || quiz.description || ''}</p>
                </div>

                {/* Action : Lancer ou Accès refusé */}
                <div className="mt-4">
                  {hasAccess ? (
                    <button
                      onClick={() => {
                        if (onSelectQuiz) {
                          onSelectQuiz(quiz);
                        } else {
                          window.location.href = `#/qcm/play/${quiz.id || quiz._id}`;
                        }
                      }}
                      className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                    >
                      ► Passer l'évaluation
                    </button>
                  ) : (
                    <button
                      onClick={() => handleOpenDeniedModal(quiz)}
                      className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-semibold flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
                    >
                      🔒 Accès refusé
                    </button>
                  )}
                </div>

              </div>
            );
          })}
        </div>
      )}

      {/* Modal d'Accès Refusé */}
      <AccessDeniedModal 
        isOpen={isDeniedModalOpen}
        onClose={() => setIsDeniedModalOpen(false)}
        selectedQuiz={selectedQuizForModal}
        userBadge={userBadgeNormalized}
      />
    </div>
  );
};

export default QcmStudentDashboard;
