import React, { useMemo } from 'react';

export interface StudentOrder {
  id: string;
  studentId?: string;
  userId?: string;
  amount: number;
  total_amount?: number;
  date?: string;
  createdAt?: string;
  created_at?: string;
  productName?: string;
  packName?: string;
  pack_title?: string;
  status: string;
  paymentMethod?: string;
  payment_method?: string;
  receipt_id?: string;
  receiptUrl?: string;
  receipt_url?: string;
}

export interface StudentOrdersListProps {
  orders?: StudentOrder[];
}

export const StudentOrdersList: React.FC<StudentOrdersListProps> = ({ orders = [] }) => {
  // Filtrer les doublons : Conserver une seule entrée par transaction unique (déduplication ord_... et rcpt_...)
  const deduplicatedOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders.filter((order) => {
      // Clé unique basée sur l'utilisateur/élève, le montant et le timestamp (à la minute près) ou référence
      const rawDate = order.createdAt || order.created_at || order.date || '';
      let dateKey = '';
      try {
        if (rawDate) {
          dateKey = new Date(rawDate).toISOString().slice(0, 16);
        }
      } catch {
        dateKey = String(rawDate).slice(0, 16);
      }

      const stId = order.studentId || order.userId || '';
      const amt = order.amount ?? order.total_amount ?? 0;
      const title = order.productName || order.packName || order.pack_title || '';
      const receiptRef = order.receipt_id || '';

      // Si un receipt_id existe ou si on a une commande + reçu créés en même temps
      const uniqueKey = receiptRef 
        ? `rcpt_${stId}_${receiptRef}` 
        : `${stId}_${amt}_${title}_${dateKey}`;

      if (seen.has(uniqueKey)) {
        return false;
      }
      seen.add(uniqueKey);
      return true;
    });
  }, [orders]);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-left border-collapse text-xs">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50 text-slate-500 font-bold">
            <th className="p-3">Réf</th>
            <th className="p-3">Date</th>
            <th className="p-3">Produit / Pack</th>
            <th className="p-3">Montant</th>
            <th className="p-3">Statut</th>
          </tr>
        </thead>
        {/* Affichage propre avec déduplication */}
        <tbody className="divide-y divide-slate-100">
          {deduplicatedOrders.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-slate-400">
                Aucune commande trouvée
              </td>
            </tr>
          ) : (
            deduplicatedOrders.map((item) => (
              <tr key={item.id} className="border-b hover:bg-slate-50/60 transition-colors">
                <td className="p-3 font-mono text-slate-700 font-bold">{item.id}</td>
                <td className="p-3 text-slate-500">
                  {item.date || (item.createdAt ? new Date(item.createdAt).toLocaleDateString("fr-FR") : '-')}
                </td>
                <td className="p-3 font-bold text-slate-800">
                  {item.productName || item.packName || item.pack_title || 'Abonnement'}
                </td>
                <td className="p-3 font-bold text-emerald-600">
                  {item.amount ?? item.total_amount} DT
                </td>
                <td className="p-3">
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                    {item.status}
                  </span>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default StudentOrdersList;
