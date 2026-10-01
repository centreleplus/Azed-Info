import React, { useState, useEffect } from 'react';
import { AccessTierSelector } from '../../components/AccessTierSelector';
import { StudentTier } from '../../types/access';
import { HelpCircle, Check, Trash2, Plus, Sparkles } from 'lucide-react';
import { DeleteAllConfirmModal } from '../../components/admin/DeleteAllConfirmModal';

export interface AdminQuizProps {
  onSuccess?: (quiz: any) => void;
}

export const AdminQuiz: React.FC<AdminQuizProps> = ({ onSuccess }) => {
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('');
  const [grade, setGrade] = useState('4ème');
  const [section, setSection] = useState("Sciences de l'Informatique");
  const [difficulty, setDifficulty] = useState<'Debutant' | 'Intermediaire' | 'Avance'>('Intermediaire');
  const [score, setScore] = useState(20);
  const [trimester, setTrimester] = useState('1er trimestre');
  // Freemium et Essentiel cochés par défaut
  const [allowedTiers, setAllowedTiers] = useState<StudentTier[]>(['Freemium', 'Essentiel']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  
  // Quizzes list & Delete all modal
  const [quizList, setQuizList] = useState<any[]>([]);
  const [isDeleteAllQuizModalOpen, setIsDeleteAllQuizModalOpen] = useState(false);

  const fetchQuizzes = async () => {
    try {
      const res = await fetch('/api/quizzes', {
        headers: { 'x-user-role': 'admin' }
      });
      if (res.ok) {
        const data = await res.json();
        setQuizList(Array.isArray(data) ? data : []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const handleDeleteAllQuizzes = async () => {
    try {
      const response = await fetch('/api/admin/quiz/delete-all', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        setQuizList([]);
        setMessage("Tous les quiz ont été supprimés avec succès de la base de données.");
        setTimeout(() => setMessage(null), 5000);
      } else {
        throw new Error("Erreur lors de la suppression globale des quiz.");
      }
    } catch (error: any) {
      console.error('Erreur suppression globale quiz:', error);
      setMessage(error.message || "Erreur lors de la suppression des quiz.");
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setMessage("Veuillez saisir un titre pour le quiz.");
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const payload = {
        title: title.trim(),
        chapterTitle: chapter.trim() || "Général",
        chapter: chapter.trim() || "Général",
        grade,
        section,
        difficulty,
        score,
        trimestre: trimester,
        allowedTiers,
        targetTiers: allowedTiers,
        isPremium: !allowedTiers.includes('Freemium'),
        questions: [
          {
            id: 'q1',
            text: 'Question exemple',
            options: ['Option A', 'Option B', 'Option C', 'Option D'],
            correctAnswerIndex: 0,
            explanation: 'Explication pédagogique.'
          }
        ]
      };

      const res = await fetch('/api/quizzes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const created = await res.json();
        setMessage("Quiz créé avec succès ! 🎉");
        setTitle('');
        setChapter('');
        setAllowedTiers(['Freemium', 'Essentiel']);
        fetchQuizzes();
        if (onSuccess) onSuccess(created);
      } else {
        setMessage("Erreur lors de la création du quiz.");
      }
    } catch (e: any) {
      setMessage(e.message || "Erreur de connexion.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto p-4 sm:p-6 text-left">
      {/* JSX En-tête de la page Quiz */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-slate-100 rounded-2xl p-5 bg-white text-left shadow-xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-gray-800 flex items-center gap-2">
            <HelpCircle className="text-[#10B981]" size={22} />
            <span>Historique & Gestion des Quiz</span>
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
            Consultez, prévisualisez, modifiez ou supprimez les quiz interactifs.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* 🔴 Bouton Tout Supprimer Quiz */}
          <button
            type="button"
            onClick={() => setIsDeleteAllQuizModalOpen(true)}
            disabled={quizList.length === 0}
            className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-semibold rounded-xl shadow-md transition-all text-xs sm:text-sm cursor-pointer active:scale-95"
            title="Supprimer tous les quiz de la base de données"
          >
            <Trash2 className="w-4 h-4" />
            <span>Tout supprimer ({quizList.length})</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="border border-slate-100 rounded-2xl p-6 bg-white space-y-5 shadow-xs">
        {message && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs font-bold">
            {message}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1">Titre du Quiz *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="ex: Devoir : Algorithmes récursifs"
              className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Chapitre</label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="ex: Chapitre 1: Récursivité"
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            <div>
              <label className="text-xs font-bold text-slate-700 block mb-1">Trimestre</label>
              <select
                value={trimester}
                onChange={(e) => setTrimester(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-emerald-500 outline-none bg-white"
              >
                <option value="1er trimestre">1er trimestre</option>
                <option value="2eme trimestre">2eme trimestre</option>
                <option value="3eme trimestre">3eme trimestre</option>
                <option value="révision">révision</option>
              </select>
            </div>
          </div>

          {/* Access Tiers : Freemium, Essentiel, Live +, Révision +, Intégrale */}
          <AccessTierSelector
            selectedTiers={allowedTiers}
            onChange={(tiers) => setAllowedTiers(tiers)}
            label="Catégories d'accès autorisées pour ce Quiz (Freemium et Essentiel cochés par défaut)"
          />

          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer"
            >
              <Check size={14} />
              <span>{loading ? "Création en cours..." : "Enregistrer et publier le Quiz"}</span>
            </button>
          </div>
        </div>
      </form>

      {/* 🔴 Modal de Confirmation pour Suppression Globale Quiz */}
      <DeleteAllConfirmModal
        isOpen={isDeleteAllQuizModalOpen}
        title="Suppression Totale des Quiz"
        itemCount={quizList.length}
        itemTypeLabel="quiz"
        confirmWord="SUPPRIMER"
        onClose={() => setIsDeleteAllQuizModalOpen(false)}
        onConfirm={handleDeleteAllQuizzes}
      />
    </div>
  );
};

export default AdminQuiz;
