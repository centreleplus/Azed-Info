import React from 'react';
import { ShieldAlert, ArrowRight, X } from 'lucide-react';

interface AccessDeniedModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedQuiz: any;
  userBadge: string;
}

export const AccessDeniedModal: React.FC<AccessDeniedModalProps> = ({
  isOpen,
  onClose,
  selectedQuiz,
  userBadge
}) => {
  if (!isOpen || !selectedQuiz) return null;

  const rawBadges = selectedQuiz.allowedBadges || selectedQuiz.allowedTiers || selectedQuiz.targetTiers || [selectedQuiz.requiredBadge || 'FREEMIUM'];
  const allowedBadges: string[] = Array.from(new Set((Array.isArray(rawBadges) ? rawBadges : [rawBadges]).map((b: string) => String(b || '').trim()).filter(Boolean)));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 text-center relative overflow-hidden">
        
        {/* Bouton Fermer (Croix top-right) */}
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition p-1 cursor-pointer"
          title="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icône Bouclier */}
        <div className="mx-auto w-16 h-16 bg-amber-100 rounded-2xl flex items-center justify-center text-amber-600 mb-4 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        {/* Tag d'Avertissement */}
        <span className="inline-block bg-amber-50 text-amber-700 text-xs font-bold px-3.5 py-1 rounded-full uppercase tracking-wider mb-3">
          🔒 RESSOURCE RÉSERVÉE AUX ABONNÉS
        </span>

        <h3 className="text-xl sm:text-2xl font-extrabold text-slate-800 mb-2">
          Accès non autorisé pour ce contenu
        </h3>
        <p className="text-sm text-slate-500 mb-6 leading-relaxed">
          Le quiz <strong className="text-slate-700">{selectedQuiz.title || selectedQuiz.code}</strong> nécessite un forfait spécifique.
        </p>

        {/* Bloc Récapitulatif : Offre Actuelle vs Offres Autorisées */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 mb-6 text-left space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Votre offre actuelle :</span>
            <span className="bg-slate-200 text-slate-700 font-bold px-3 py-1 rounded-md text-xs uppercase">
              {userBadge || 'FREEMIUM'}
            </span>
          </div>

          <div className="border-t border-slate-200 pt-3 flex items-center justify-between text-sm">
            <span className="text-slate-500 font-medium">Offres autorisées :</span>
            <div className="flex flex-wrap gap-1.5 justify-end">
              {allowedBadges.map((badge, idx) => (
                <span 
                  key={idx} 
                  className="bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-md text-xs uppercase"
                >
                  {badge}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Boutons d'Action */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <button
            onClick={() => {
              onClose();
              window.location.href = '#/shop';
            }}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold rounded-xl shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
          >
            Découvrir les Offres & Mettre à Niveau
            <ArrowRight className="w-4 h-4" />
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
