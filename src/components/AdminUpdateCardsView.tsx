import React, { useState, useEffect } from 'react';
import { Save, RefreshCw, Layers, CheckCircle2, AlertCircle } from 'lucide-react';
import { HomeFeatureCard, INITIAL_HOME_CARDS } from '../types/homeCards';

export const AdminUpdateCardsView: React.FC = () => {
  const [cards, setCards] = useState<HomeFeatureCard[]>(INITIAL_HOME_CARDS);
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetch('/api/admin/home-cards')
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.cards) && data.cards.length > 0) {
          setCards(data.cards);
        }
      })
      .catch((err) => {
        console.warn('Failed to load home cards from server, using default:', err?.message || err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  const handleCardChange = (id: string, field: 'title' | 'description', value: string) => {
    setCards((prev) =>
      prev.map((card) => (card.id === id ? { ...card, [field]: value } : card))
    );
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/home-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cards }),
      });
      const data = await res.json();
      if (!res.ok || (data.success !== undefined && !data.success)) {
        throw new Error(data.message || 'Erreur lors de la mise à jour.');
      }
      setFeedback({
        type: 'success',
        message: 'Les cartes de la page d\'accueil ont été mises à jour avec succès !',
      });
      setTimeout(() => setFeedback(null), 5000);
    } catch (err: any) {
      setFeedback({
        type: 'error',
        message: err?.message || 'Erreur lors de la mise à jour.',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-white p-5 rounded-2xl border border-slate-200 shadow-xs gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-purple-50 text-purple-600 rounded-xl">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-black text-slate-800">Mise à jour : Cartes d'Accueil</h1>
            <p className="text-xs text-slate-500">
              Modifiez les titres et descriptions affichés aux élèves avec le tutoiement unifié.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSaveAll}
          disabled={isSaving || isLoading}
          className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
        >
          {isSaving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}</span>
        </button>
      </div>

      {/* Toast Feedback */}
      {feedback && (
        <div
          className={`p-4 rounded-xl border flex items-center gap-2.5 text-xs font-bold ${
            feedback.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {feedback.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          ) : (
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
          )}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Grille d'édition des cartes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {cards.map((card) => (
          <div
            key={card.id}
            className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-4 hover:border-purple-200 transition-colors"
          >
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-lg ${card.colorTheme || 'bg-slate-700'} text-white flex items-center justify-center font-bold text-xs shadow-xs`}
                >
                  #
                </span>
                <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider">
                  {card.title}
                </span>
              </div>
              <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                ID: {card.id}
              </span>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">Titre de la carte</label>
              <input
                type="text"
                value={card.title}
                onChange={(e) => handleCardChange(card.id, 'title', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Description (avec tutoiement)
              </label>
              <textarea
                rows={3}
                value={card.description}
                onChange={(e) => handleCardChange(card.id, 'description', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium text-slate-800 focus:bg-white focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 outline-hidden resize-none leading-relaxed"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AdminUpdateCardsView;
