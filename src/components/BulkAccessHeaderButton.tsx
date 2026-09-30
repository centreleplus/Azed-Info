import React, { useState } from 'react';
import { Zap, CheckCircle, AlertCircle } from 'lucide-react';

interface BulkAccessHeaderButtonProps {
  refreshDocs?: () => void;
  onSuccess?: (msg: string) => void;
  className?: string;
}

export const BulkAccessHeaderButton: React.FC<BulkAccessHeaderButtonProps> = ({ refreshDocs, onSuccess, className = "" }) => {
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleApplyEssentielToAll = async () => {
    const confirmAction = window.confirm(
      "Voulez-vous vraiment rendre TOUS les documents existants accessibles aux élèves titulaires du badge 'Essentiel' ?"
    );

    if (!confirmAction) return;

    setLoading(true);
    setFeedback(null);
    try {
      const response = await fetch('/api/admin/documents/bulk-add-essentiel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      const data = await response.json();

      if (data.success) {
        setFeedback({ type: 'success', message: data.message });
        if (onSuccess) onSuccess(data.message);
        if (refreshDocs) refreshDocs(); // Recharge la liste à l'écran
      } else {
        setFeedback({ type: 'error', message: data.message || "Erreur lors de l'application" });
      }
    } catch (err) {
      setFeedback({ type: 'error', message: "Une erreur est survenue lors de la mise à jour globale." });
    } finally {
      setLoading(false);
      setTimeout(() => {
        setFeedback(null);
      }, 5000);
    }
  };

  return (
    <div className="inline-flex flex-col items-start gap-1">
      <button
        onClick={handleApplyEssentielToAll}
        disabled={loading}
        title="Appliquer l'accès ESSENTIEL à tous les documents de la base de données"
        className={`px-4 py-2.5 bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 disabled:opacity-50 disabled:pointer-events-none ${className}`}
      >
        <Zap size={15} className={loading ? "animate-pulse" : "fill-current"} />
        <span>{loading ? "Application en cours..." : "⚡ Accorder l'accès 'Essentiel' à TOUS les documents existants"}</span>
      </button>

      {feedback && (
        <div className={`text-[11px] font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-fade-in ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={12} /> : <AlertCircle size={12} />}
          <span>{feedback.message}</span>
        </div>
      )}
    </div>
  );
};

export default BulkAccessHeaderButton;
