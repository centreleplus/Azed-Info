import React, { useState } from "react";
import { Check, Ban, Eye, Clock, ShieldCheck, Search } from "lucide-react";
import { PaymentReceipt } from "../../types";

interface SubscriptionsPanelProps {
  receipts: PaymentReceipt[];
  onApproveReceipt: (id: string) => void;
  onRejectReceipt: (id: string) => void;
  onViewDocument: (receipt: PaymentReceipt) => void;
}

export const SubscriptionsPanel: React.FC<SubscriptionsPanelProps> = ({
  receipts,
  onApproveReceipt,
  onRejectReceipt,
  onViewDocument,
}) => {
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "approved" | "rejected">("pending");
  const [searchTerm, setSearchTerm] = useState("");

  const filteredReceipts = receipts.filter((r) => {
    const matchesStatus = filterStatus === "all" || r.status === filterStatus;
    const matchesSearch =
      r.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.userEmail.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.paymentMethod.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-black text-slate-800 flex items-center gap-2">
            <ShieldCheck className="text-emerald-600" size={20} />
            Gestion des Reçus & Souscriptions
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Validation manuelle instantanée des preuves de paiement (D17, RIB, Wafacash, Espèces)
          </p>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-extrabold shrink-0">
          <button
            onClick={() => setFilterStatus("pending")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === "pending"
                ? "bg-white text-amber-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            En Attente ({receipts.filter((r) => r.status === "pending").length})
          </button>
          <button
            onClick={() => setFilterStatus("approved")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === "approved"
                ? "bg-white text-emerald-700 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Validés ({receipts.filter((r) => r.status === "approved").length})
          </button>
          <button
            onClick={() => setFilterStatus("all")}
            className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
              filterStatus === "all"
                ? "bg-white text-slate-800 shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Tous ({receipts.length})
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative max-w-md">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
        <input
          type="text"
          placeholder="Rechercher un élève, email ou mode de paiement..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
        />
      </div>

      {/* Receipts List Table */}
      <div className="overflow-x-auto rounded-xl border border-slate-200">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50 text-slate-500 font-extrabold border-b border-slate-200">
            <tr>
              <th className="p-3.5">Élève</th>
              <th className="p-3.5">Classe</th>
              <th className="p-3.5">Méthode</th>
              <th className="p-3.5">Montant</th>
              <th className="p-3.5">Statut</th>
              <th className="p-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredReceipts.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-8 text-center text-slate-400 font-medium">
                  Aucun reçu ne correspond aux critères sélectionnés.
                </td>
              </tr>
            ) : (
              filteredReceipts.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="p-3.5">
                    <p className="font-extrabold text-slate-800">{r.userName}</p>
                    <p className="text-[11px] text-slate-400">{r.userEmail}</p>
                  </td>
                  <td className="p-3.5 font-bold text-slate-700">{r.grade}</td>
                  <td className="p-3.5">
                    <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-700 font-bold text-[11px]">
                      {r.paymentMethod}
                    </span>
                  </td>
                  <td className="p-3.5 font-black text-slate-900">{r.amount} TND</td>
                  <td className="p-3.5">
                    {r.status === "pending" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 font-bold text-[11px] border border-amber-200">
                        <Clock size={12} />
                        En attente
                      </span>
                    )}
                    {r.status === "approved" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-bold text-[11px] border border-emerald-200">
                        <Check size={12} />
                        Validé
                      </span>
                    )}
                    {r.status === "rejected" && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 font-bold text-[11px] border border-rose-200">
                        <Ban size={12} />
                        Rejeté
                      </span>
                    )}
                  </td>
                  <td className="p-3.5 text-right space-x-2">
                    <button
                      onClick={() => onViewDocument(r)}
                      className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold rounded-lg text-[11px] transition-colors cursor-pointer"
                    >
                      <Eye size={13} className="inline mr-1" />
                      Voir
                    </button>

                    {r.status === "pending" && (
                      <>
                        <button
                          onClick={() => onApproveReceipt(r.id)}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-lg text-[11px] transition-all shadow-2xs cursor-pointer"
                        >
                          <Check size={13} className="inline mr-1" />
                          Activer
                        </button>
                        <button
                          onClick={() => onRejectReceipt(r.id)}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 font-extrabold rounded-lg text-[11px] transition-colors cursor-pointer"
                        >
                          <Ban size={13} className="inline mr-1" />
                          Rejeter
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
