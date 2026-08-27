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
  ExternalLink
} from "lucide-react";
import { Order } from "../types";

interface StudentOrdersViewProps {
  userId: string;
}

export default function StudentOrdersView({ userId }: StudentOrdersViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "PENDING" | "APPROVED" | "REJECTED">("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState<string | null>(null);
  const [selectedOrderDetails, setSelectedOrderDetails] = useState<Order | null>(null);

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

  // Filtrer les doublons générés par la création simultanée d'un ord_... et rcpt_...
  const deduplicatedOrders = useMemo(() => {
    const seen = new Set<string>();
    return orders.filter((order) => {
      let dateKey = "";
      try {
        if (order.created_at) {
          dateKey = new Date(order.created_at).toISOString().slice(0, 16);
        }
      } catch {
        dateKey = String(order.created_at || "").slice(0, 16);
      }

      const uniqueKey = order.receipt_id 
        ? `rcpt_${order.user_id}_${order.receipt_id}`
        : `${order.user_id || ""}_${order.total_amount}_${order.pack_title}_${dateKey}`;

      if (seen.has(uniqueKey)) {
        return false;
      }
      seen.add(uniqueKey);
      return true;
    });
  }, [orders]);

  const filteredOrders = useMemo(() => {
    return deduplicatedOrders.filter((order) => {
      const matchesStatus =
        statusFilter === "ALL" ? true : order.status === statusFilter;
      const matchesSearch =
        searchQuery.trim() === ""
          ? true
          : order.pack_title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
            order.payment_method.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesStatus && matchesSearch;
    });
  }, [deduplicatedOrders, statusFilter, searchQuery]);

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

  const pendingCount = deduplicatedOrders.filter((o) => o.status === "PENDING" || o.status === "pending" || o.status === "SUSPENDED_ADMIN" || o.status === "suspended_admin").length;
  const approvedCount = deduplicatedOrders.filter((o) => o.status === "APPROVED" || o.status === "approved").length;
  const rejectedCount = deduplicatedOrders.filter((o) => o.status === "REJECTED" || o.status === "rejected").length;

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
              Suivez l'historique et le statut de vos demandes de paiement en temps réel.
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
            Toutes ({orders.length})
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
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:outline-none focus:border-emerald-5-[#10B981] text-gray-900 dark:text-white"
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
            {orders.length === 0 ? "Aucune commande trouvée" : "Aucun résultat pour ce filtre"}
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 max-w-sm mx-auto">
            {orders.length === 0
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
                  <th className="py-3.5 px-4">Pack / Produit</th>
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

                  return (
                    <tr
                      key={order.id}
                      className="hover:bg-gray-50/70 dark:hover:bg-gray-800/40 transition-colors"
                    >
                      <td className="py-3.5 px-4 font-mono font-bold text-gray-900 dark:text-white">
                        {order.id}
                      </td>
                      <td className="py-3.5 px-4 text-gray-500 dark:text-gray-400 flex items-center gap-1.5 whitespace-nowrap">
                        <Calendar size={13} className="text-gray-400" />
                        <span>{dateStr}</span>
                      </td>
                      <td className="py-3.5 px-4 font-bold text-gray-900 dark:text-white max-w-xs truncate">
                        {order.pack_title}
                      </td>
                      <td className="py-3.5 px-4 font-black text-emerald-600 dark:text-emerald-400 whitespace-nowrap">
                        {order.amount} DT
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-medium text-[11px]">
                          <CreditCard size={12} className="text-gray-400" />
                          {order.payment_method}
                        </span>
                      </td>
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
                <div className="grid grid-cols-2 gap-3 p-3 bg-gray-50 dark:bg-gray-800/60 rounded-xl text-xs">
                  <div>
                    <span className="text-gray-400 block text-[10px]">Pack :</span>
                    <span className="font-bold text-gray-900 dark:text-white">{selectedOrderDetails.pack_title}</span>
                  </div>
                  <div>
                    <span className="text-gray-400 block text-[10px]">Montant & Mode :</span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
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
