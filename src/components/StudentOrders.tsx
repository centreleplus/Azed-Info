import React, { useMemo } from 'react';
import { Package, Layers } from 'lucide-react';

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
  items?: string[];
  status: string;
  paymentMethod?: string;
  payment_method?: string;
  receipt_id?: string;
  receiptUrl?: string;
  receipt_url?: string;
  order_ref?: string;
  orderRef?: string;
}

export interface StudentOrdersListProps {
  orders?: StudentOrder[];
}

export const StudentOrdersList: React.FC<StudentOrdersListProps> = ({ orders = [] }) => {
  // Consolidate multi-item orders by order reference
  const consolidatedOrders = useMemo(() => {
    const groupMap = new Map<string, {
      id: string;
      orderRef: string;
      date: string;
      items: string[];
      totalAmount: number;
      hasExplicitTotal: boolean;
      individualAmounts: number[];
      status: string;
      rawOrders: any[];
    }>();

    const extractItems = (ord: any): string[] => {
      const list: string[] = [];
      if (Array.isArray(ord.items) && ord.items.length > 0) {
        ord.items.forEach((it: any) => {
          const title = typeof it === "string" ? it : (it.title || it.product?.title || it.productName || it.name || it.pack_title);
          if (title && !list.includes(title)) list.push(title);
        });
      }
      if (list.length === 0) {
        const rawTitle = ord.productName || ord.packName || ord.pack_title || '';
        if (rawTitle) {
          const splits = rawTitle.split(/,\s*|\s*\+\s*/).filter(Boolean);
          if (splits.length > 1) {
            splits.forEach((s: string) => { if (s && !list.includes(s.trim())) list.push(s.trim()); });
          } else {
            list.push(rawTitle);
          }
        } else {
          list.push('Pack Abonnement');
        }
      }
      return list;
    };

    for (const order of orders) {
      const ordId = order.id || '';
      const rcptId = order.receipt_id || '';
      const ordRef = order.order_ref || order.orderRef || '';
      const rawDate = order.createdAt || order.created_at || order.date || '';
      const rawAmt = Number(order.amount ?? order.total_amount ?? 0);
      const explicitTotal = Number(order.total_amount ?? 0);

      let matchedKey: string | null = null;
      for (const [key, group] of groupMap.entries()) {
        const idMatch = ordId && (group.id === ordId || group.orderRef === ordId || group.rawOrders.some(r => r.id === ordId));
        const rcptMatch = rcptId && (group.id === rcptId || group.orderRef === rcptId || group.rawOrders.some(r => r.id === rcptId || r.receipt_id === rcptId));
        const ordRefMatch = ordRef && (group.orderRef === ordRef || group.id === ordRef || group.rawOrders.some(r => r.order_ref === ordRef || r.orderRef === ordRef));
        
        if (idMatch || rcptMatch || ordRefMatch) {
          matchedKey = key;
          break;
        }
      }

      const itemTitles = extractItems(order);
      const preferredId = ordRef || ordId || rcptId || 'CMD';

      if (matchedKey) {
        const group = groupMap.get(matchedKey)!;
        itemTitles.forEach(t => {
          if (!group.items.includes(t)) group.items.push(t);
        });
        group.rawOrders.push(order);
        group.individualAmounts.push(rawAmt);

        if (explicitTotal > 0) {
          group.totalAmount = explicitTotal;
          group.hasExplicitTotal = true;
        } else if (!group.hasExplicitTotal) {
          const allSame = group.individualAmounts.every(a => Math.abs(a - group.individualAmounts[0]) < 0.01);
          group.totalAmount = allSame ? group.individualAmounts[0] : group.individualAmounts.reduce((s, a) => s + a, 0);
        }
      } else {
        groupMap.set(preferredId, {
          id: preferredId,
          orderRef: ordRef || preferredId,
          date: rawDate,
          items: [...itemTitles],
          totalAmount: explicitTotal > 0 ? explicitTotal : rawAmt,
          hasExplicitTotal: explicitTotal > 0,
          individualAmounts: [rawAmt],
          status: order.status,
          rawOrders: [order]
        });
      }
    }

    return Array.from(groupMap.values());
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
        <tbody className="divide-y divide-slate-100">
          {consolidatedOrders.length === 0 ? (
            <tr>
              <td colSpan={5} className="p-6 text-center text-slate-400">
                Aucune commande trouvée
              </td>
            </tr>
          ) : (
            consolidatedOrders.map((item) => {
              const isMultiItem = item.items.length > 1;
              return (
                <tr key={item.id} className="border-b hover:bg-slate-50/60 transition-colors">
                  <td className="p-3 font-mono text-slate-700 font-bold">{item.id}</td>
                  <td className="p-3 text-slate-500">
                    {item.date ? new Date(item.date).toLocaleDateString("fr-FR") : '-'}
                  </td>
                  <td className="p-3">
                    {isMultiItem ? (
                      <div className="space-y-1">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 font-bold text-[10px] border border-emerald-200">
                            {item.items.length} articles
                          </span>
                          <span className="font-bold text-slate-800">{item.items.join(" + ")}</span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1.5 font-bold text-slate-800">
                        <Package size={13} className="text-slate-400" />
                        <span>{item.items[0] || 'Abonnement'}</span>
                      </div>
                    )}
                  </td>
                  <td className="p-3 font-bold text-emerald-600 whitespace-nowrap">
                    {item.totalAmount} DT
                  </td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-700">
                      {item.status}
                    </span>
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

export default StudentOrdersList;

