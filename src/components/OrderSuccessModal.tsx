import React from 'react';
import { Check } from 'lucide-react';

interface OrderSuccessModalProps {
  receiptToken: string;
  onReturnToShop: () => void;
}

export const OrderSuccessModal: React.FC<OrderSuccessModalProps> = ({
  receiptToken,
  onReturnToShop,
}) => {
  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-5">
      {/* ICÔNE DE SUCCÈS */}
      <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
        <Check className="w-6 h-6 stroke-[2.5]" />
      </div>

      {/* TITRE & NOUVEAU TEXTE DU PARAGRAPHE 1 */}
      <div className="space-y-2">
        <h3 className="text-lg font-black text-slate-800 flex items-center justify-center gap-2">
          <span>🎉</span> Demande Enregistrée !
        </h3>
        <p className="text-xs text-slate-500 font-medium leading-relaxed">
          Votre demande d'acquisition est sécurisée sous le jeton d'authentification unique :
        </p>
      </div>

      {/* JETON / CODE REÇU */}
      <div className="py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono font-bold text-slate-700 tracking-wider">
        {receiptToken || 'rcpt_ry576ct'}
      </div>

      {/* NOUVEAU TEXTE DU PARAGRAPHE 2 */}
      <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
        Une fois le versement physique validé par le service commercial, vos acquis s'activeront instantanément.
      </p>

      {/* BOUTON RETOUR */}
      <button
        type="button"
        onClick={onReturnToShop}
        className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        Retourner à la boutique
      </button>
    </div>
  );
};

export default OrderSuccessModal;
