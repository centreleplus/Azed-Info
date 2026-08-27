import React from 'react';
import { CheckCircle2, PauseCircle, Clock, AlertCircle } from 'lucide-react';

export interface Receipt {
  id: string;
  studentName?: string;
  userName?: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED_ADMIN' | 'REJECTED' | 'pending' | 'approved' | 'suspended_admin' | 'rejected' | string;
  [key: string]: any;
}

export const AgentActionButtons: React.FC<{
  receipt: Receipt;
  onValidate: (id: string) => void;
  onSuspend: (id: string) => void;
}> = ({ receipt, onValidate, onSuspend }) => {

  // Action : Valider la commande
  const handleValidate = () => {
    onValidate(receipt.id);
  };

  // Action : Suspendre (Mise en attente Admin)
  const handleSuspend = () => {
    onSuspend(receipt.id);
  };

  const isSuspended =
    receipt.status === 'SUSPENDED_ADMIN' ||
    receipt.status === 'suspended_admin';
  const isApproved =
    receipt.status === 'APPROVED' ||
    receipt.status === 'approved';
  const isRejected =
    receipt.status === 'REJECTED' ||
    receipt.status === 'rejected';

  if (isSuspended) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold">
        <Clock className="w-3.5 h-3.5" />
        <span>En attente validation Admin</span>
      </div>
    );
  }

  if (isApproved) {
    return (
      <span className="text-gray-400 italic text-[11px]">Validé & activé</span>
    );
  }

  if (isRejected) {
    return (
      <span className="text-gray-400 italic text-[11px]">Rejeté / Clôturé</span>
    );
  }

  return (
    <div className="flex items-center justify-end gap-2">
      {/* BOUTON VALIDER */}
      <button
        type="button"
        onClick={handleValidate}
        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <CheckCircle2 className="w-4 h-4" />
        <span>Valider</span>
      </button>

      {/* BOUTON SUSPENDRE (Remplaçant du Rejeter/Supprimer) */}
      <button
        type="button"
        onClick={handleSuspend}
        title="Mettre en attente de confirmation par l'administrateur"
        className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-extrabold text-xs flex items-center gap-1.5 transition-all shadow-sm active:scale-95 cursor-pointer"
      >
        <PauseCircle className="w-4 h-4" />
        <span>Suspendre</span>
      </button>
    </div>
  );
};

export default AgentActionButtons;
