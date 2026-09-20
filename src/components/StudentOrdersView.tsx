import React, { useState, useEffect, useMemo } from "react";
import {
  ShoppingBag,
  Calendar,
  CreditCard,
  Eye,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  X,
  Search,
  FileText,
  RefreshCw,
  ExternalLink,
  Package,
  Layers
} from "lucide-react";
import { Order } from "../types";

export interface ConsolidatedOrder {
  id: string;
  order_ref: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  items: string[];
  amount: number;
  payment_method: string;
  receipt_url?: string;
  status: string;
  rejection_reason?: string;
  created_at: string;
  rawOrders: any[];
}

interface StudentOrdersViewProps {
  userId: string;
}

export default function StudentOrdersView({ userId }: StudentOrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<ConsolidatedOrder | null>(null);

  const fetchOrders = async () => {
    if (!userId) return;
    try {
      setLoading(true);
      const res = await fetch(`/api/orders/student/${userId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des commandes:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();

    // Listen to real-time order updates broadcasted from server
    const handleRealtimeEvent = (e: CustomEvent) => {
      if (e.detail?.type === "ORDER_UPDATED" || e.detail?.type === "NEW_NOTIFICATION") {
        fetchOrders();
      }
    };

    window.addEventListener("socket_event" as any, handleRealtimeEvent as any);
    window.addEventListener("refresh-notifications", fetchOrders);

    return () => {
      window.removeEventListener("socket_event" as any, handleRealtimeEvent as any);
      window.removeEventListener("refresh-notifications", fetchOrders);
    };
  }, [userId]);

  // Group raw orders / receipts by unique order reference or transaction key
  const consolidatedOrders = useMemo<ConsolidatedOrder[]>(() => {
    if (!orders || orders.length === 0) return [];

    const groupMap = new Map<string, {
      primaryId: string;
      orderRef: string;
      studentId: string;
      studentName?: string;
      studentEmail?: string;
      items: string[];
      totalAmount: number;
      hasExplicitTotal: boolean;
      individualAmounts: number[];
      date: string;
      paymentMethod: string;
      status: string;
      rejectionReason?: string;
      receiptUrl?: string;
      rawOrders: any[];
    }>();

    // Extract item titles from an order
    const extractItems = (ord: any): string[] => {
      const list: string[] = [];
      if (Array.isArray(ord.items) && ord.items.length > 0) {
        ord.items.forEach((it: any) => {
          const title = typeof it === "string" ? it : (it.title || it.product?.title || it.productName || it.name || it.pack_title);
          if (title && !list.includes(title)) list.push(title);
        });
      } else if (Array.isArray(ord.cart_items) && ord.cart_items.length > 0) {
        ord.cart_items.forEach((it: any) => {
          const title = typeof it === "string" ? it : (it.product?.title || it.title || it.productName || it.name || it.pack_title);
          if (title && !list.includes(title)) list.push(title);
        });
      } else if (Array.isArray(ord.cartItems) && ord.cartItems.length > 0) {
        ord.cartItems.forEach((it: any) => {
          const title = typeof it === "string" ? it : (it.product?.title || it.title || it.productName || it.name || it.pack_title);
          if (title && !list.includes(title)) list.push(title);
        });
      }

      if (list.length === 0) {
        const rawTitle = ord.pack_title || ord.productName || ord.packName || ord.title || ord.product_title || ord.pack || "";
        if (rawTitle) {
          // Handle comma-separated titles if they exist
          const splits = rawTitle.split(/,\s*|\s*\+\s*/).filter(Boolean);
          if (splits.length > 1) {
            splits.forEach((s: string) => {
              if (s && !list.includes(s.trim())) list.push(s.trim());
            });
          } else {
            list.push(rawTitle);
          }
        } else {
          list.push("Pack Abonnement");
        }
      }
      return list;
    };

    const getDateIso = (ord: any): string => {
      const raw = ord.created_at || ord.createdAt || ord.uploadedAt || ord.date;
      try {
        if (raw) return new Date(raw).toISOString();
      } catch {}
      return new Date().toISOString();
    };

    for (const order of orders) {
      const ordId = order.id || "";
      const rcptId = (order as any).receipt_id || (order as any).receiptId || "";
      const ordRef = (order as any).order_ref || (order as any).orderRef || (order as any).reference || "";
      const parentOrdId = (order as any).order_id || (order as any).orderId || "";
      const ordReceiptUrl = order.receipt_url || (order as any).receiptUrl || "";
      const orderDateIso = getDateIso(order);
      const rawAmt = Number(order.amount ?? (order as any).total_amount ?? (order as any).totalAmount ?? 0);
      const explicitTotal = Number((order as any).total_amount ?? (order as any).totalAmount ?? 0);

      // Find if this order matches an existing group
      let matchedKey: string | null = null;

      for (const [key, group] of groupMap.entries()) {
        const idMatch = (ordId && (group.primaryId === ordId || group.orderRef === ordId || group.rawOrders.some(r => r.id === ordId)));
        const rcptMatch = (rcptId && (group.primaryId === rcptId || group.orderRef === rcptId || group.rawOrders.some(r => r.id === rcptId || r.receipt_id === rcptId || r.receiptId === rcptId)));
        const ordRefMatch = (ordRef && (group.orderRef === ordRef || group.primaryId === ordRef || group.rawOrders.some(r => r.order_ref === ordRef || r.orderRef === ordRef)));
        const parentMatch = (parentOrdId && (group.primaryId === parentOrdId || group.orderRef === parentOrdId || group.rawOrders.some(r => r.id === parentOrdId || r.order_id === parentOrdId || r.orderId === parentOrdId)));

        const receiptUrlMatch = (ordReceiptUrl && ordReceiptUrl.length > 10 && group.receiptUrl === ordReceiptUrl);

        // Match by identical minute timestamp + matching order amount
        const timeMatch = (orderDateIso.slice(0, 16) === group.date.slice(0, 16) && Math.abs(rawAmt - group.totalAmount) < 0.01);

        if (idMatch || rcptMatch || ordRefMatch || parentMatch || receiptUrlMatch || timeMatch) {
          matchedKey = key;
          break;
        }
      }

      const itemTitles = extractItems(order);
      const payment = order.payment_method || (order as any).paymentMethod || "D17";
      const status = (order.status || "PENDING").toUpperCase();
      const rejectionReason = order.rejection_reason || (order as any).rejectionReason || "";
      const preferredDisplayId = ordRef || ordId || rcptId || `ord_${Math.random().toString(36).substring(2, 8)}`;

      if (matchedKey) {
        const group = groupMap.get(matchedKey)!;
        // Merge items cleanly
        itemTitles.forEach(t => {
          if (!group.items.includes(t)) {
            group.items.push(t);
          }
        });
        group.rawOrders.push(order);
        group.individualAmounts.push(rawAmt);

        // Consolidate total price correctly
        if (explicitTotal > 0) {
          group.totalAmount = explicitTotal;
          group.hasExplicitTotal = true;
        } else if (!group.hasExplicitTotal) {
          const allIdentical = group.individualAmounts.every(a => Math.abs(a - group.individualAmounts[0]) < 0.01);
          if (allIdentical) {
            group.totalAmount = group.individualAmounts[0];
          } else {
            group.totalAmount = group.individualAmounts.reduce((sum, a) => sum + a, 0);
          }
        }

        // Prefer cleaner non-rcpt ID for primary display if available
        if (group.primaryId.startsWith("rcpt_") && (ordId.startsWith("ord_") || ordId.startsWith("CMD-") || ordRef)) {
          group.primaryId = ordRef || ordId;
        }
        if (!group.orderRef && ordRef) group.orderRef = ordRef;
        if (!group.receiptUrl && ordReceiptUrl) group.receiptUrl = ordReceiptUrl;
        if (!group.rejectionReason && rejectionReason) group.rejectionReason = rejectionReason;
        if (status === "APPROVED" || status === "REJECTED") group.status = status;
      } else {
        const key = preferredDisplayId;
        groupMap.set(key, {
          primaryId: preferredDisplayId,
          orderRef: ordRef || preferredDisplayId,
          studentId: order.student_id || userId,
          studentName: order.student_name,
          studentEmail: order.student_email,
          items: [...itemTitles],
          totalAmount: explicitTotal > 0 ? explicitTotal : rawAmt,
          hasExplicitTotal: explicitTotal > 0,
          individualAmounts: [rawAmt],
          date: orderDateIso,
          paymentMethod: payment,
          status,
          rejectionReason,
          receiptUrl: ordReceiptUrl,
          rawOrders: [order]
        });
      }
    }

    const list: ConsolidatedOrder[] = Array.from(groupMap.values()).map(g => ({
      id: g.primaryId,
      order_ref: g.orderRef,
      student_id: g.studentId,
      student_name: g.studentName,
      student_email: g.studentEmail,
      items: g.items,
      amount: g.totalAmount,
      payment_method: g.paymentMethod,
      receipt_url: g.receiptUrl,
      status: g.status,
      rejection_reason: g.rejectionReason,
      created_at: g.date,
      rawOrders: g.rawOrders
    }));

    list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    return list;
  }, [orders, userId]);

  const filteredOrders = useMemo(() => {
    return consolidatedOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : order.status === statusFilter;
      
      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        q === ""
          ? true
          : order.id.toLowerCase().includes(q) ||
            order.order_ref.toLowerCase().includes(q) ||
            order.items.some(item => item.toLowerCase().includes(q)) ||
            order.payment_method.toLowerCase().includes(q) ||
            (order.rejection_reason && order.rejection_reason.toLowerCase().includes(q));

      return matchesStatus && matchesSearch;
    });
  }, [consolidatedOrders, statusFilter, searchQuery]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "APPROVED":
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-400 dark:border-emerald-800">
            <CheckCircle2 size={13} className="shrink-0" />
            Approuvée
          </span>
        );
      case "SUSPENDED_ADMIN":
      case "suspended_admin":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800">
            <Clock size={13} className="shrink-0" />
            En attente validation Admin
          </span>
        );
      case "REJECTED":
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-rose-50 text-rose-700 border border-rose-200 dark:bg-rose-950/40 dark:text-rose-400 dark:border-rose-800">
            <XCircle size={13} className="shrink-0" />
            Refusée
          </span>
        );
      case "PENDING":
      case "pending":
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-700 border border-amber-200 dark:bg-amber-950/40 dark:text-amber-400 dark:border-amber-800 animate-pulse">
            <Clock size={13} className="shrink-0" />
            En attente
          </span>
        );
    }
  };

  const pendingCount = consolidatedOrders.filter((o) => o.status === "PENDING" || o.status === "pending" || o.status === "SUSPENDED_ADMIN" || o.status === "suspended_admin").length;
  const approvedCount = consolidatedOrders.filter((o) => o.status === "APPROVED" || o.status === "approved").length;
  const rejectedCount = consolidatedOrders.filter((o) => o.status === "REJECTED" || o.status === "rejected").length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white dark:bg-gray-900 p-5 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold">
            <ShoppingBag size={20} />
          </div>
          <div>
            <h2 className="text-base font-bold text-gray-900 dark:text-white flex items-center gap-2">
              Mes Commandes & Abonnements
            </h2>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              Suivez l'historique et le statut de vos commandes consolidées en temps réel.
            </p>
          </div>
        </div>

        <button
          onClick={fetchOrders}
          className="px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-800 text-xs font-medium text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Rafraîchir"
        >
          <RefreshCw size={13} className={loading ? "animate-spin text-emerald-600" : ""} />
          <span>Actualiser</span>
        </button>
      </div>

      {/* Filters & Search Bar */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-3 bg-white dark:bg-gray-900 p-3.5 rounded-2xl border border-gray-200 dark:border-gray-800">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <button
            onClick={() => setStatusFilter("ALL")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap ${
              statusFilter === "ALL"
                ? "bg-[#0F1E36] text-white shadow-xs"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700"
            }`}
          >
            Toutes ({consolidatedOrders.length})
          </button>
          <button
            onClick={() => setStatusFilter("PENDING")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === "PENDING"
                ? "bg-amber-500 text-white shadow-xs"
                : "bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-800 hover:bg-amber-100"
            }`}
          >
            <Clock size={12} />
            En attente ({pendingCount})
          </button>
          <button
            onClick={() => setStatusFilter("APPROVED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === "APPROVED"
                ? "bg-emerald-600 text-white shadow-xs"
                : "bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100"
            }`}
          >
            <CheckCircle2 size={12} />
            Approuvées ({approvedCount})
          </button>
          <button
            onClick={() => setStatusFilter("REJECTED")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition-all whitespace-nowrap flex items-center gap-1.5 ${
              statusFilter === "REJECTED"
                ? "bg-rose-600 text-white shadow-xs"
                : "bg-rose-50 dark:bg-rose-950/30 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800 hover:bg-rose-100"
            }`}
          >
            <XCircle size={12} />
            Refusées ({rejectedCount})
          </button>
        </div>

        <div className="relative w-full md:w-64">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-500 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* Orders Table / List */}
      {loading ? (
        <div className="py-12 text-center bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800">
          <RefreshCw size={24} className="animate-spin text-emerald-600 mx-auto mb-2" />
          <p className="text-xs text-gray-500 dark:text-gray-400">Chargement de vos commandes...</p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="p-10 text-center bg-white dark:bg-gray-900 rounded-2xl border border-dashed border-gray-200 dark:border-gray-800">
          <FileText size={32} className="text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <h3 className="text-sm font-bold text-gray-800 dark:text-gray-200">
            {consolidatedOrders.length === 0 ? "Aucune commande trouvée" : "Aucun résultat pour ce filtre"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {consolidatedOrders.length === 0
              ? "Vous n'avez pas encore effectué de commande ou soumission de virement."
              : "Essayez de modifier votre filtre ou votre recherche."}
          </p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400 font-bold border-b border-gray-200 dark:border-gray-800 uppercase text-[10px] tracking-wider">
                  <th className="py-3.5 px-4">Réf. Commande</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4 min-w-[240px]">Pack / Produit</th>
                  <th className="py-3.5 px-4">Montant</th>
                  <th className="py-3.5 px-4">Mode de paiement</th>
                  <th className="py-3.5 px-4">Statut</th>
                  <th className="py-3.5 px-4 text-right">Preuve</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800 text-gray-700 dark:text-gray-300">
                {filteredOrders.map((order) => {
                  const dateStr = order.created_at
                    ? new Date(order.created_at).toLocaleDateString("fr-TN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                        hour: "2-digit",
                        minute: "2-digit"
                      })
                    : "—";

                  const isMultiItem = order.items.length > 1;

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      {/* RÉF. COMMANDE */}
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <span>{order.id}</span>
                        </div>
                      </td>

                      {/* DATE */}
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 whitespace-nowrap">
                        <div className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-gray-400 shrink-0" />
                          <span>{dateStr}</span>
                        </div>
                      </td>

                      {/* PACK / PRODUIT (CONSOLIDATED) */}
                      <td className="py-3.5 px-4">
                        {isMultiItem ? (
                          <div className="space-y-1.5 py-0.5">
                            <div className="flex items-center gap-2 flex-wrap">
                              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 font-extrabold text-[10px] border border-emerald-200 dark:border-emerald-800 shrink-0">
                                <Layers size={11} />
                                {order.items.length} articles
                              </span>
                              <span className="font-bold text-gray-900 dark:text-white text-xs">
                                {order.items.join(" + ")}
                              </span>
                            </div>
                            <ul className="text-[11px] text-gray-500 dark:text-gray-400 space-y-0.5 pl-1">
                              {order.items.map((itemTitle, idx) => (
                                <li key={idx} className="flex items-center gap-1.5 truncate max-w-md">
                                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                  <span className="truncate">{itemTitle}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 font-bold text-gray-900 dark:text-white max-w-sm truncate py-0.5">
                            <Package size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0" />
                            <span className="truncate">{order.items[0] || "Pack Abonnement"}</span>
                          </div>
                        )}
                      </td>

                      {/* MONTANT (SINGLE TOTAL PRICE) */}
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap text-sm">
                        {order.amount} DT
                      </td>

                      {/* MODE DE PAIEMENT */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-semibold text-[11px]">
                          <CreditCard size={12} className="text-gray-400" />
                          {order.payment_method}
                        </span>
                      </td>

                      {/* STATUT */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="space-y-1">
                          {getStatusBadge(order.status)}
                          {order.status === "REJECTED" && order.rejection_reason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 flex items-start gap-1 font-medium max-w-xs mt-0.5">
                              <AlertCircle size={10} className="shrink-0 mt-0.5" />
                              <span>Motif : {order.rejection_reason}</span>
                            </p>
                          )}
                        </div>
                      </td>

                      {/* PREUVE */}
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        {order.receipt_url && order.receipt_url.length > 5 ? (
                          <button
                            onClick={() => {
                              setSelectedReceiptUrl(order.receipt_url || null);
                              setSelectedOrderDetails(order);
                            }}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 hover:bg-emerald-100 font-bold text-[11px] inline-flex items-center gap-1 cursor-pointer transition-colors"
                          >
                            <Eye size={12} />
                            <span>Voir Reçu</span>
                          </button>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Aucune photo</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Lightbox / Modal for Reçu Preview */}
      {selectedReceiptUrl && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-200 dark:border-gray-800 relative animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/50">
              <div className="flex items-center gap-2">
                <FileText size={18} className="text-emerald-600 dark:text-emerald-400" />
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">
                  Preuve de Paiement - {selectedOrderDetails?.id}
                </h3>
              </div>
              <button
                onClick={() => {
                  setSelectedReceiptUrl(null);
                  setSelectedOrderDetails(null);
                }}
                className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:text-gray-900 dark:hover:text-white flex items-center justify-center cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-5 space-y-4">
              {selectedOrderDetails && (
                <div className="grid grid-cols-2 gap-3 p-3.5 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Articles commandés :</span>
                    <span className="font-bold text-gray-900 dark:text-white block mt-0.5">
                      {selectedOrderDetails.items.join(" + ")}
                    </span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px] font-medium">Montant Total & Mode :</span>
                    <span className="font-extrabold text-emerald-600 dark:text-emerald-400 block mt-0.5">
                      {selectedOrderDetails.amount} DT ({selectedOrderDetails.payment_method})
                    </span>
                  </div>
                </div>
              )}

              <div className="relative border border-gray-200 dark:border-gray-800 rounded-xl overflow-hidden bg-gray-900 max-h-[380px] flex items-center justify-center">
                {selectedReceiptUrl.endsWith(".pdf") ? (
                  <div className="p-8 text-center text-white space-y-3">
                    <FileText size={48} className="mx-auto text-emerald-400" />
                    <p className="text-xs">Document PDF téléchargé</p>
                    <a
                      href={selectedReceiptUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-600 text-white font-bold text-xs"
                    >
                      <ExternalLink size={14} />
                      Ouvrir le document PDF
                    </a>
                  </div>
                ) : (
                  <img
                    src={selectedReceiptUrl}
                    alt="Preuve de paiement"
                    className="max-h-[380px] w-auto object-contain mx-auto"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/40 flex justify-end">
              <button
                onClick={() => {
                  setSelectedReceiptUrl(null);
                  setSelectedOrderDetails(null);
                }}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-bold text-xs rounded-xl cursor-pointer hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

