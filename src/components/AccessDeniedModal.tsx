import React from 'react';
import { ShieldAlert } from 'lucide-react';

export interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuiz: any;
  userBadge: string;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({ isOpen, onClose, selectedQuiz, userBadge }) => {
  if (!isOpen || !selectedQuiz) return null;

  // Formatage des badges autorisés depuis la DB du quiz
  const allowedBadges = Array.isArray(selectedQuiz.allowedBadges) && selectedQuiz.allowedBadges.length > 0
    ? selectedQuiz.allowedBadges
    : ['FREEMIUM'];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-gray-100 text-center relative animate-fade-in">
        
        {/* Badge Icône Bouclier */}
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 shadow-inner">
          <ShieldAlert className="w-8 h-8"/>
        </div>

        {/* Tag Ressource Réservée */}
        <span className="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider mb-2">
          🔒 RESSOURCE RÉSERVÉE AUX ABONNÉS
        </span>

        <h3 className="text-xl font-extrabold text-slate-800 mb-1">
          Accès non autorisé pour ce contenu
        </h3>
        <p className="text-sm text-slate-500 mb-6">
          Ce quiz évaluant <strong>{selectedQuiz.title || selectedQuiz.code}</strong> nécessite un forfait spécifique.
        </p>

        {/* Box Récapitulative des Badges */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Votre offre actuelle :</span>
            <span className="bg-slate-200 text-slate-700 font-bold px-3 py-0.5 rounded-md text-xs uppercase">
              {userBadge || 'FREEMIUM'}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-2 flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Offres autorisées :</span>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {allowedBadges.map((badge: string, idx: number) => (
                <span 
                  key={idx} 
                  className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-md text-xs uppercase"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => window.location.hash = '#/shop'}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer"
          >
            Découvrir les Offres & Mettre à Niveau →
          </button>
          
          <button
            onClick={onClose}
            className="w-full py-3 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

export default AccessDeniedModal;
