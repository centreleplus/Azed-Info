import React, { useState } from 'react';
import { AccessTierSelector } from '../../components/AccessTierSelector';
import { StudentTier } from '../../types/access';
import { HelpCircle, Check, Plus, Sparkles } from 'lucide-react';

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
  // FREEMIUM coché par défaut
  const [allowedTiers, setAllowedTiers] = useState<StudentTier[]>(['FREEMIUM']);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

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
        allowedBadges: allowedTiers,
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
      <div className="border border-slate-100 rounded-2xl p-5 bg-white text-left shadow-xs">
        <h3 className="font-extrabold text-[#0F1E36] text-base flex items-center gap-2">
          <HelpCircle className="text-[#10B981]" size={18} />
          <span>Générateur & Concepteur de Quiz Interactifs</span>
        </h3>
        <p className="text-xs text-gray-500 mt-1">
          Configurez l'accès élève pour le quiz avec les forfaits autorisés (Freemium, Essentiel, Live +, Révision +, Intégrale).
        </p>
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
    </div>
  );
};

export default AdminQuiz;
