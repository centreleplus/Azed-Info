import React from 'react';
import { CircleBackButton } from './CircleBackButton';
import { OfferPack } from '../types/offers';

export interface SignUpStep2Props {
  packs?: OfferPack[];
  onSelectType?: (type: 'freemium' | 'premium') => void;
  onRequestFreemium?: (pack?: OfferPack) => void;
  onGoToPremium?: () => void;
  onBack: () => void;
}

export const SignUpStep2: React.FC<SignUpStep2Props> = ({
  packs,
  onSelectType,
  onRequestFreemium,
  onGoToPremium,
  onBack,
}) => {
  const handleSelectFreemium = () => {
    if (onSelectType) {
      onSelectType('freemium');
    } else if (onRequestFreemium) {
      const freemiumPack = packs?.find(p => p.isActive && (p.category === 'FREEMIUM' || p.price === 0));
      onRequestFreemium(freemiumPack);
    }
  };

  const handleSelectPremium = () => {
    if (onSelectType) {
      onSelectType('premium');
    } else if (onGoToPremium) {
      onGoToPremium();
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6 text-center">
      {/* En-tête Unique avec Badge et Bouton Retour Encerclé */}
      <div className="flex justify-between items-center pb-2">
        <span className="px-3 py-1 bg-blue-900 text-white font-black text-[10px] rounded-full uppercase tracking-wider">
          Étape 2 sur 3
        </span>
        <CircleBackButton onClick={onBack} label="Retour" />
      </div>

      <div className="space-y-1">
        <h2 className="text-2xl font-black text-slate-800">Choisissez votre type d'accès</h2>
        <p className="text-xs font-semibold text-slate-400">
          Profitez de nos ressources gratuites ou débloquez l'intégration Premium complète.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 text-left">
        {/* Card Freemium */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <span className="px-2.5 py-1 bg-slate-100 text-slate-600 font-extrabold text-[9px] rounded-lg uppercase">
              Option Freemium
            </span>
            <h3 className="text-xl font-black text-slate-800">Accès Libre Limité</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Accédez aux notions fondamentales et testez le compilateur Python pour démarrer vos révisions sans frais.
            </p>
          </div>
          {/* Libellé pur sans flèche */}
          <button
            type="button"
            onClick={handleSelectFreemium}
            className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            Demander l'activation Freemium
          </button>
        </div>

        {/* Card Premium */}
        <div className="p-6 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm flex flex-col justify-between">
          <div className="space-y-3">
            <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 font-extrabold text-[9px] rounded-lg uppercase">
              Formules Payantes
            </span>
            <h3 className="text-xl font-black text-slate-800">Formules Premium</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Débloquez l'intégralité des ressources, des devoirs corrigés, des séances live et de la préparation aux épreuves du BAC.
            </p>
          </div>
          {/* Libellé pur sans flèche */}
          <button
            type="button"
            onClick={handleSelectPremium}
            className="w-full py-3.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl shadow-sm transition-all cursor-pointer active:scale-95"
          >
            Découvrir les offres Premium
          </button>
        </div>
      </div>

      {/* Pied de page : Retour avec flèche dans un cercle */}
      <div className="pt-6 flex justify-center">
        <CircleBackButton onClick={onBack} label="Revenir aux modifications du Profil" />
      </div>
    </div>
  );
};

export default SignUpStep2;
