import React from 'react';
import { Check, X, ShieldCheck, Clock, ExternalLink } from 'lucide-react';
import { isEligibleForRE } from '../utils/pricingDiscount';

export interface ReceiptItem {
  id: string;
  studentId?: string;
  userId?: string;
  studentName?: string;
  userName?: string;
  userEmail?: string;
  amount: number;
  grade?: string;
  paymentMethod?: string;
  receiptUrl?: string;
  status: 'PENDING' | 'SUSPENDED_ADMIN' | 'APPROVED' | 'REJECTED' | 'pending' | 'suspended_admin' | 'approved' | 'rejected' | string;
  uploadedAt?: string;
  [key: string]: any;
}

export interface AdminFraisInscriptionProps {
  receipts: ReceiptItem[];
  onFinalApprove: (receiptId: string, studentId: string) => void;
  onFinalReject: (receiptId: string, studentId: string) => void;
}

export const AdminFraisInscription: React.FC<AdminFraisInscriptionProps> = ({
  receipts,
  onFinalApprove,
  onFinalReject,
}) => {

  const handleApprove = (receipt: ReceiptItem) => {
    const studentId = receipt.studentId || receipt.userId || "";
    // 1. Mettre à jour le statut du reçu
    onFinalApprove(receipt.id, studentId);
  };

  const handleReject = (receipt: ReceiptItem) => {
    const studentId = receipt.studentId || receipt.userId || "";
    // 1. Mettre à jour le statut du reçu
    onFinalReject(receipt.id, studentId);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-2xl border border-slate-100 shadow-sm">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-100 text-slate-500 font-bold bg-slate-50/50">
            <th className="p-4">Soumissionnaire</th>
            <th className="p-4">Forfait / Niveau</th>
            <th className="p-4">Option Transaction</th>
            <th className="p-4">Preuve justificative</th>
            <th className="p-4">Statut Validation</th>
            <th className="p-4 text-center">Actions (Admin)</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {receipts.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-8 text-center text-slate-400">
                Aucun relevé de paiement soumis actuellement. Les élèves apparaissent ici lorsqu'ils déposent leur preuve.
              </td>
            </tr>
          ) : (
            receipts.map((item) => {
              const name = item.studentName || item.userName || "Élève";
              const isApproved = item.status === 'APPROVED' || item.status === 'approved';
              const isRejected = item.status === 'REJECTED' || item.status === 'rejected';
              const isPending = item.status === 'PENDING' || item.status === 'pending' || item.status === 'SUSPENDED_ADMIN' || item.status === 'suspended_admin';

              return (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="p-4 font-bold text-slate-800">
                    <div>{name}</div>
                    {item.userEmail && <div className="text-[10px] text-slate-400 font-normal">{item.userEmail}</div>}
                  </td>
                  <td className="p-4">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-semibold">{item.grade || "Accès Bac"}</span>
                      {isEligibleForRE(item.grade, item.section) && (
                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 font-extrabold text-[9px] rounded uppercase">
                          RE -20%
                        </span>
                      )}
                    </div>
                    <div className="flex items-baseline gap-1 mt-0.5">
                      <span className="text-xs font-bold text-slate-900">{item.amount} DT</span>
                      <span className="text-[10px] text-rose-500 font-semibold uppercase">net</span>
                    </div>
                  </td>
                  <td className="p-4">
                    <span className="font-mono bg-violet-50 text-violet-700 border border-violet-100 rounded px-2 py-0.5 text-[10px] font-bold">
                      {item.paymentMethod || "RIB / D17 / Direct"}
                    </span>
                  </td>
                  <td className="p-4">
                    {item.receiptUrl ? (
                      <a
                        href={item.receiptUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 hover:underline cursor-pointer"
                      >
                        <ExternalLink size={12} />
                        <span>Consulter la preuve</span>
                      </a>
                    ) : (
                      <span className="text-slate-400 italic">Aucune preuve</span>
                    )}
                  </td>
                  <td className="p-4">
                    {isApproved && (
                      <span className="px-2.5 py-1 bg-emerald-100 text-emerald-700 font-bold rounded-lg inline-flex items-center gap-1">
                        ✓ Approuvé
                      </span>
                    )}
                    {isRejected && (
                      <span className="px-2.5 py-1 bg-rose-100 text-rose-700 font-bold rounded-lg inline-flex items-center gap-1">
                        ✕ Rejeté
                      </span>
                    )}
                    {isPending && (
                      <span className="px-2.5 py-1 bg-amber-100 text-amber-700 font-bold rounded-lg flex items-center gap-1 w-fit">
                        <Clock className="w-3 h-3" />
                        <span>{item.status === 'SUSPENDED_ADMIN' || item.status === 'suspended_admin' ? 'En attente Admin' : 'En attente'}</span>
                      </span>
                    )}
                  </td>

                  {/* COLONNE ACTIONS : RÉSERVÉE À L'ADMINISTRATION */}
                  <td className="p-4 text-center">
                    {isRejected ? (
                      <span className="text-[11px] text-rose-500 font-semibold italic block">
                        Rejeté / Annulé
                      </span>
                    ) : isApproved ? (
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-[11px] text-emerald-600 font-semibold">
                          Validé
                        </span>
                        <button
                          type="button"
                          onClick={() => handleReject(item)}
                          title="Droit de refus Administrateur : Rejeter et déduire la commission de l'agent"
                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-bold rounded-lg text-[11px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer"
                        >
                          <X className="w-3 h-3" />
                          Rejeter (Surpasser)
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center justify-center gap-2">
                        <button
                          type="button"
                          onClick={() => handleApprove(item)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Confirmer
                        </button>
                        <button
                          type="button"
                          onClick={() => handleReject(item)}
                          className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white font-bold rounded-xl text-xs flex items-center gap-1 transition-all shadow-sm active:scale-95 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                          Rejeter
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
};

export default AdminFraisInscription;
