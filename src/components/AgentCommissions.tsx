import React, { useMemo } from 'react';

export interface CommissionTransaction {
  id: string;
  receiptId?: string;
  studentName: string;
  packName?: string;
  amount: number;
  rate?: string | number;
  commission: number;
  date: string;
  status?: 'GAINED' | 'DEDUCTED' | 'PENDING' | 'paid' | string;
  type?: 'VALIDATION' | 'ANNULATION' | 'COMMISSION' | 'DEDUCTION' | string;
}

export interface AgentCommissionHistoryProps {
  transactions?: CommissionTransaction[];
}

export const AgentCommissionHistory: React.FC<AgentCommissionHistoryProps> = ({
  transactions = [],
}) => {
  // Déduplication stricte par ID unique de commande/reçu (Map)
  const uniqueHistory = useMemo(() => {
    const map = new Map<string, CommissionTransaction>();

    transactions.forEach((tx) => {
      // Identifiant unique du reçu (ex: rcpt_88mtx90 ou tx.id)
      const key = tx.receiptId || tx.id;

      // Si le reçu existe déjà, on privilégie l'état le plus récent (ANNULATION / DEDUCTED > GAIN)
      if (!map.has(key) || tx.type === 'ANNULATION' || tx.type === 'DEDUCTION' || tx.status === 'DEDUCTED' || tx.status === 'rejected') {
        map.set(key, tx);
      }
    });

    return Array.from(map.values());
  }, [transactions]);

  return (
    <div className="bg-white rounded-2xl border border-slate-100 p-6 space-y-4">
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-base font-black text-slate-800">
            Historique de vos validations et gains
          </h3>
          <p className="text-xs text-slate-400 font-medium">
            Retrouvez les détails de chaque souscription validée par vos soins.
          </p>
        </div>
        <span className="px-2.5 py-1 bg-slate-900 text-white font-extrabold text-[10px] rounded-lg tracking-wider">
          RÔLE : ASSISTANT (10%)
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-slate-100 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              <th className="p-3">Étudiant</th>
              <th className="p-3">Forfait Souscrit</th>
              <th className="p-3">Montant Versé</th>
              <th className="p-3">Taux Appliqué</th>
              <th className="p-3">Commission Gagnée</th>
              <th className="p-3">Date</th>
              <th className="p-3 text-center">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {uniqueHistory.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-8 text-center text-slate-400 italic font-medium">
                  Aucun historique d'inscriptions ou de commissions enregistré.
                </td>
              </tr>
            ) : (
              uniqueHistory.map((item) => {
                const isDeducted = item.commission < 0 || item.status === 'DEDUCTED' || item.status === 'rejected' || item.type === 'ANNULATION' || item.type === 'DEDUCTION';
                const formattedComm = Math.abs(item.commission).toFixed(2);
                const displayRate = typeof item.rate === 'number' ? `% ${item.rate}%` : (item.rate || '% 10%');

                return (
                  <tr key={item.receiptId || item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-3 font-bold text-slate-800">
                      {item.studentName}
                      {isDeducted && (
                        <span className="ml-2 px-1.5 py-0.5 bg-rose-100 text-rose-600 font-extrabold text-[9px] rounded">
                          Annulation
                        </span>
                      )}
                    </td>
                    <td className="p-3 font-semibold text-slate-500 uppercase text-[10px]">
                      {item.packName || 'FORFAIT TRIMESTRIEL'}
                    </td>
                    <td className="p-3 font-bold text-slate-700">{item.amount} DT</td>
                    <td className="p-3 text-slate-400 font-bold">{displayRate}</td>
                    <td className={`p-3 font-black ${isDeducted ? 'text-rose-600' : 'text-emerald-600'}`}>
                      {isDeducted ? `-${formattedComm}` : `+${formattedComm}`} DT
                    </td>
                    <td className="p-3 text-slate-400 font-medium">{item.date}</td>
                    <td className="p-3 text-center">
                      {isDeducted ? (
                        <span className="px-2 py-0.5 bg-rose-50 text-rose-600 font-bold text-[10px] rounded-md border border-rose-100">
                          Déduite
                        </span>
                      ) : item.status === 'paid' ? (
                        <span className="px-2 py-0.5 bg-blue-50 text-blue-600 font-bold text-[10px] rounded-md border border-blue-100">
                          Payée
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-600 font-bold text-[10px] rounded-md border border-amber-100">
                          En attente
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AgentCommissionHistory;
