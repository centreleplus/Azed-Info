import React, { useState, useEffect, useMemo } from "react";
import { Language, translations } from "../lib/translations";
import { 
  Check, 
  X, 
  ExternalLink, 
  ShieldCheck, 
  AlertCircle, 
  Filter, 
  Clock, 
  RefreshCw,
  LogOut,
  CheckCircle2,
  PauseCircle,
  ListFilter,
  History,
  Users,
  TrendingUp,
  Coins,
  Award,
  Percent,
  Wallet
} from "lucide-react";
import { User, PaymentReceipt, AuditLogItem, Commission, CommissionWithdrawal } from "../types";
import { isEligibleForRE } from "../utils/pricingDiscount";
import usePagination from "../hooks/usePagination";
import PaginationControls from "./PaginationControls";
import { AgentActionButtons } from "./AgentValidator";

interface AgentConsoleProps {
  currentUser: User;
  onSignout: () => void;
  currentLanguage?: Language;
}

export default function AgentConsole({ currentUser, onSignout, currentLanguage = "fr" }: AgentConsoleProps) {
  const t = translations[currentLanguage];
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [filterStatus, setFilterStatus] = useState<"all" | "pending" | "suspended_admin" | "approved" | "rejected">("pending");
  const [auditFilter, setAuditFilter] = useState<"all" | "mine">("all");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  // Agent Subtab Navigation
  const [activeTab, setActiveTab] = useState<"receipts" | "commissions">("receipts");
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<CommissionWithdrawal[]>([]);
  const [withdrawalAmount, setWithdrawalAmount] = useState<string>("");
  const [withdrawalLoading, setWithdrawalLoading] = useState<boolean>(false);

  const fetchWithdrawals = () => {
    if (!currentUser?.id || currentUser.id === "undefined") return;
    fetch(`/api/commissions/withdrawals/agent/${currentUser.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Impossible de charger les retraits.");
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setWithdrawals(data);
      })
      .catch((err) => {
        if (err.message?.includes("Failed to fetch") || err.message?.includes("Unexpected token") || err.name === "AbortError" || err.message?.includes("is not valid JSON")) return;
        console.error("Erreur de chargement des retraits :", err);
      });
  };

  const fetchCommissions = () => {
    if (!currentUser?.id || currentUser.id === "undefined") return;
    fetch(`/api/commissions/agent/${currentUser.id}`)
      .then(async (res) => {
        if (!res.ok) throw new Error("Impossible de charger les commissions.");
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setCommissions(data);
      })
      .catch((err) => {
        if (err.message?.includes("Failed to fetch") || err.message?.includes("Unexpected token") || err.name === "AbortError" || err.message?.includes("is not valid JSON")) return;
        console.error("Erreur de chargement des commissions :", err);
      });
  };

  // State-based confirmation dialog to bypass iframe blockers
  const [confirmAction, setConfirmAction] = useState<{
    id: string;
    type: "approve" | "suspend" | "reject";
    userName: string;
    amount: number;
    paymentMethod: string;
  } | null>(null);

  const fetchReceipts = () => {
    setLoading(true);
    fetch("/api/admin/receipts")
      .then((res) => {
        if (!res.ok) throw new Error("Impossible d'obtenir les reçus.");
        return res.json();
      })
      .then((data) => {
        setReceipts(data || []);
      })
      .catch((err) => {
        setFeedback({ msg: "Impossible de charger les fiches de transactions financières de la direction.", type: "error" });
      })
      .finally(() => setLoading(false));
  };

  const fetchAuditLogs = () => {
    fetch("/api/admin/audit-logs")
      .then((res) => {
        if (!res.ok) throw new Error("Impossible de charger l'historique d'audit.");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) {
          // Absolute strict isolation: each agent can only fetch and keep their own actions in state
          const personalLogs = data.filter((log: any) => log.agentId === currentUser.id);
          setAuditLogs(personalLogs);
        } else {
          setAuditLogs([]);
        }
      })
      .catch((err) => {
        console.error("Erreur de chargement d'audit:", err);
      });
  };

  useEffect(() => {
    fetchReceipts();
    fetchAuditLogs();
    fetchCommissions();
    fetchWithdrawals();

    // Auto-sync real-time updates from Admin actions
    const interval = setInterval(() => {
      fetchCommissions();
      fetchWithdrawals();
    }, 3000);

    return () => clearInterval(interval);
  }, [currentUser.id]);

  const triggerFeedback = (msg: string, type: "success" | "error" = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 5000);
  };

  const handleRequestWithdrawal = (amountVal: string) => {
    const amount = parseFloat(amountVal);
    if (isNaN(amount) || amount <= 0) {
      triggerFeedback("Veuillez saisir un montant valide.", "error");
      return;
    }

    if (amount < 500) {
      triggerFeedback("Le montant minimum requis pour une demande d'avance/retrait est de 500 TND.", "error");
      return;
    }

    // Recalculate remaining commission based on active state
    const activeComms = commissions.filter(c => c.status !== "rejected" && c.type !== "DEDUCTION");
    const totalAccum = Math.max(0, activeComms.reduce((sum, c) => sum + c.earnedCommission, 0));
    const activeWiths = withdrawals.filter(w => w.status !== "rejected");
    const totalWithdrawn = activeWiths.reduce((sum, w) => sum + w.amount, 0);
    const remainingComm = Math.max(0, totalAccum - totalWithdrawn);

    if (amount > remainingComm) {
      triggerFeedback(`Le montant demandé (${amount.toFixed(2)} TND) dépasse votre commission cumulée restante (${remainingComm.toFixed(2)} TND).`, "error");
      return;
    }

    setWithdrawalLoading(true);
    fetch("/api/commissions/withdrawals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        agentId: currentUser.id,
        amount
      })
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.msg || "Erreur de soumission"); });
        }
        return res.json();
      })
      .then((data) => {
        triggerFeedback("Votre demande d'avance/retrait a été soumise avec succès !", "success");
        setWithdrawalAmount("");
        fetchWithdrawals();
        fetchCommissions();
      })
      .catch((err) => {
        triggerFeedback(err.message || "Erreur de connexion lors du retrait.", "error");
      })
      .finally(() => {
        setWithdrawalLoading(false);
      });
  };

  const handleApprove = (receiptId: string) => {
    fetch("/api/admin/receipts/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        receiptId, 
        agentId: currentUser.id, 
        agentName: currentUser.fullName 
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not approve");
        return res.json();
      })
      .then(() => {
        triggerFeedback("Fiche d'abonnement & Panier validés avec succès ! L'étudiant dispose maintenant de son accès complet.", "success");
        fetchReceipts();
        fetchAuditLogs();
        fetchCommissions();
      })
      .catch((err) => {
        triggerFeedback("Erreur lors de l'approbation du reçu.", "error");
      });
  };

  const handleReject = (receiptId: string) => {
    fetch("/api/admin/receipts/reject", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        receiptId, 
        agentId: currentUser.id, 
        agentName: currentUser.fullName 
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not reject");
        return res.json();
      })
      .then(() => {
        triggerFeedback("Preuve de paiement ou panier rejeté. Le lycéen a reçu une notification explicative.", "success");
        fetchReceipts();
        fetchAuditLogs();
      })
      .catch((err) => {
        triggerFeedback("Erreur lors du rejet du reçu.", "error");
      });
  };

  const handleSuspend = (receiptId: string) => {
    fetch("/api/admin/receipts/suspend", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        receiptId, 
        agentId: currentUser.id, 
        agentName: currentUser.fullName 
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not suspend");
        return res.json();
      })
      .then(() => {
        triggerFeedback("Fiche mise en attente de confirmation Administrateur avec succès. La commande reste active.", "success");
        fetchReceipts();
        fetchAuditLogs();
      })
      .catch((err) => {
        triggerFeedback("Erreur lors de la suspension du reçu.", "error");
      });
  };

  const [filterPlanType, setFilterPlanType] = useState<"ALL" | "FREEMIUM" | "PREMIUM">("ALL");

  const visibleReceipts = receipts.filter((r) => {
    // Agents can see all pending and suspended_admin requests (Freemium & Premium), as well as requests they handled
    const isPendingOrSuspended = r.status === "pending" || r.status === "PENDING" || r.status === "suspended_admin" || r.status === "SUSPENDED_ADMIN";
    const isAssignedOrGlobal = !r.agentId || r.agentId === currentUser.id;
    if (!isPendingOrSuspended && r.handledBy !== currentUser.id && r.agentId !== currentUser.id) {
      return false;
    }
    return isAssignedOrGlobal;
  });

  const filtered = visibleReceipts.filter((r) => {
    // Plan Type Sub-filter (Freemium vs Premium)
    const isFreemium = (r as any).planType === "FREEMIUM" || r.amount === 0;
    if (filterPlanType === "FREEMIUM" && !isFreemium) return false;
    if (filterPlanType === "PREMIUM" && isFreemium) return false;

    if (filterStatus === "all") return true;
    const normStatus = (r.status || "").toLowerCase();
    return normStatus === filterStatus.toLowerCase();
  });

  const {
    paginatedData: paginatedReceipts,
    currentPage: receiptCurrentPage,
    totalPages: receiptTotalPages,
    totalItems: receiptTotalItems,
    startIndex: receiptStartIndex,
    endIndex: receiptEndIndex,
    itemsPerPage: receiptItemsPerPage,
    goToPage: receiptGoToPage,
    setItemsPerPage: setReceiptItemsPerPage,
  } = usePagination({ data: filtered, initialItemsPerPage: 10 });

  // Dédupliquer les ajustements/annulations ou entrées enregistrées plusieurs fois
  const uniqueCommissions = useMemo(() => {
    const seenTx = new Set<string>();
    return commissions.filter((c) => {
      // Clé d'unicité basée sur le reçu (ou nom étudiant) + le type/statut d'opération (Gain ou Annulation) + montant
      const rRef = c.receiptId || c.studentName || c.id || '';
      const txKey = `${rRef}_${c.type || c.status || ''}_${c.earnedCommission}`;
      if (seenTx.has(txKey)) {
        return false;
      }
      seenTx.add(txKey);
      return true;
    });
  }, [commissions]);

  const activeCommissions = uniqueCommissions.filter(c => c.status !== "rejected" && c.type !== "DEDUCTION");
  const totalAccumulated = Math.max(0, activeCommissions.reduce((sum, c) => sum + c.earnedCommission, 0));
  const totalInscriptions = activeCommissions.length;

  // Avances en attente de validation admin
  const pendingWithdrawals = withdrawals
    .filter(w => w.status === "pending" || w.status === "EN_ATTENTE")
    .reduce((sum, w) => sum + w.amount, 0);

  // Avances déjà approuvées / réglées par l'admin
  const approvedWithdrawals = withdrawals
    .filter(w => w.status === "approved" || w.status === "paid" || w.status === "APPROUVE" || w.status === "PAYE")
    .reduce((sum, w) => sum + w.amount, 0);

  // Total avances réservées ou déduites (En attente + Approuvées)
  const totalWithdrawnAmount = pendingWithdrawals + approvedWithdrawals;
  const remainingCommission = Math.max(0, totalAccumulated - totalWithdrawnAmount);

  return (
    <div className="space-y-6">
      
      {/* Feedbacks Alerts Toast */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${
          feedback.type === "success" 
            ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
            : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Main Container Wrapper */}
      <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
        
        {/* Header Block with quick stats and refresh button */}
        <div className="p-6 bg-slate-50 border-b border-[#E5E7EB] flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1 text-start">
            <span className="text-[9px] bg-violet-150 text-violet-700 font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider inline-block">
              {currentLanguage === "ar" ? "مدقق حصري (وكيل)" : currentLanguage === "en" ? "EXCLUSIVE VALIDATOR (AGENT)" : "VÉRIFICATEUR EXCLUSIF (AGENT)"}
            </span>
            <h2 className="text-[#0F1E36] font-black text-lg tracking-tight">
              {t.agent_dashboard_title}
            </h2>
            <p className="text-xs text-gray-500 max-w-xl leading-relaxed">
              {currentLanguage === "ar" ? "راجع التحويلات البنكية والإيصالات المقدمة من التلاميذ لتأكيد اشتراكاتهم بصفة فورية." : currentLanguage === "en" ? "Review bank transfers, D17 top-ups, and receipts submitted by students to validate their lifetime subscriptions." : "Consultez les virements bancaires RIB, recharges D17, et preuves de versement soumises par les lycéens tunisiens afin d'approuver ou rejeter instantanément leurs souscriptions à vie."}
            </p>
          </div>

          <button 
            onClick={() => {
              if (activeTab === "receipts") fetchReceipts();
              else fetchCommissions();
            }}
            disabled={loading}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-700 border border-[#E5E7EB] rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw size={13} className={loading ? "animate-spin" : ""} />
            <span>{currentLanguage === "ar" ? "تحديث" : currentLanguage === "en" ? "Refresh" : "Actualiser"}</span>
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#E5E7EB] bg-slate-50/50">
          <button
            onClick={() => setActiveTab("receipts")}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "receipts"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <History size={14} />
            <span>{t.pending_receipts} ({visibleReceipts.length})</span>
          </button>
          <button
            onClick={() => setActiveTab("commissions")}
            className={`flex-1 py-3 px-4 text-xs font-bold transition-all border-b-2 flex items-center justify-center gap-2 cursor-pointer ${
              activeTab === "commissions"
                ? "border-blue-600 text-blue-600 bg-white"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            }`}
          >
            <Coins size={14} className="text-[#10B981]" />
            <span>{t.commissions_tab} ({uniqueCommissions.length})</span>
          </button>
        </div>

        {activeTab === "receipts" && (
          <>
            {/* Plan Type Sub-Tabs (Freemium vs Premium vs All) */}
            <div className="flex gap-2 border-b border-slate-150 p-4 bg-slate-50/70">
              <button
                onClick={() => setFilterPlanType("ALL")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  filterPlanType === "ALL"
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-white text-slate-600 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                Toutes les inscriptions ({visibleReceipts.length})
              </button>
              <button
                onClick={() => setFilterPlanType("FREEMIUM")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  filterPlanType === "FREEMIUM"
                    ? "bg-emerald-700 text-white shadow-xs"
                    : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200"
                }`}
              >
                Comptes Freemium (Gratuit) ({visibleReceipts.filter(r => (r as any).planType === "FREEMIUM" || r.amount === 0).length})
              </button>
              <button
                onClick={() => setFilterPlanType("PREMIUM")}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-xl transition-all cursor-pointer ${
                  filterPlanType === "PREMIUM"
                    ? "bg-blue-700 text-white shadow-xs"
                    : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200"
                }`}
              >
                Comptes Premium ({visibleReceipts.filter(r => (r as any).planType !== "FREEMIUM" && r.amount > 0).length})
              </button>
            </div>

            {/* Filters and Counter Bar */}
            <div className="px-6 py-4 border-b border-[#E6E8EB] bg-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex flex-wrap gap-1.5">
                <button
                  onClick={() => setFilterStatus("pending")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === "pending" ? "bg-amber-600 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <Clock size={12} />
                  <span>En attente ({visibleReceipts.filter(r => r.status === "pending" || r.status === "PENDING").length})</span>
                </button>

                <button
                  onClick={() => setFilterStatus("suspended_admin")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === "suspended_admin" ? "bg-amber-500 text-white" : "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                  }`}
                >
                  <PauseCircle size={12} />
                  <span>Suspendues Admin ({visibleReceipts.filter(r => r.status === "suspended_admin" || r.status === "SUSPENDED_ADMIN").length})</span>
                </button>

                <button
                  onClick={() => setFilterStatus("approved")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === "approved" ? "bg-emerald-600 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <Check size={12} />
                  <span>Approuvées ({visibleReceipts.filter(r => r.status === "approved" || r.status === "APPROVED").length})</span>
                </button>

                <button
                  onClick={() => setFilterStatus("rejected")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === "rejected" ? "bg-red-600 text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <X size={12} />
                  <span>Rejetées ({visibleReceipts.filter(r => r.status === "rejected" || r.status === "REJECTED").length})</span>
                </button>

                <button
                  onClick={() => setFilterStatus("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                    filterStatus === "all" ? "bg-[#0F1E36] text-white" : "bg-gray-50 hover:bg-gray-100 text-gray-600 border border-gray-200"
                  }`}
                >
                  <ListFilter size={12} />
                  <span>Tous mes reçus ({visibleReceipts.length})</span>
                </button>
              </div>

              <div className="text-[11px] font-semibold text-gray-500">
                Affichage de <span className="text-[#0F1E36] font-bold">{filtered.length} fiches</span>
              </div>
            </div>

            {/* Content Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-[#1F2937]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-400 font-bold">
                    <th className="p-4 whitespace-nowrap">Lycéen / Éléve</th>
                    <th className="p-4 whitespace-nowrap">Niveau & Forfait</th>
                    <th className="p-4 whitespace-nowrap">Méthode Règlement</th>
                    <th className="p-4 whitespace-nowrap">Image Preuve</th>
                    <th className="p-4 whitespace-nowrap">Statut Validation</th>
                    <th className="p-4 whitespace-nowrap text-right">Actions Manuelles</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {filtered.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-400 font-medium">
                        Aucun reçu financier dans cette catégorie.
                      </td>
                    </tr>
                  ) : (
                    paginatedReceipts.map((r) => (
                      <tr key={r.id} className="hover:bg-gray-50/60 transition-colors">
                        <td className="p-4">
                          <div className="space-y-0.5">
                            <p className="font-bold text-[#0F1E36] text-xs flex items-center gap-1.5">
                              {r.userName}
                              {((r as any).planType === "FREEMIUM" || r.amount === 0) && (
                                <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                                  Freemium
                                </span>
                              )}
                            </p>
                            <p className="text-[10px] text-gray-400 font-mono">{r.userEmail}</p>
                            <p className="text-[10px] text-gray-400">Date d'envoi: {new Date(r.uploadedAt).toLocaleString()}</p>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="font-semibold text-gray-800 text-xs">{r.grade || "Lycéen"}</span>
                            {isEligibleForRE(r.grade, (r as any).section) && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-red-100 text-red-700 rounded">
                                RE -20%
                              </span>
                            )}
                          </div>
                          <p className="text-[#0F1E36] font-black text-xs mt-0.5">
                            {r.amount} DT <span className="text-[10px] text-gray-400 font-medium">
                              {((r as any).planType === "FREEMIUM" || r.amount === 0) ? "(Gratuit)" : "net"}
                            </span>
                          </p>
                        </td>
                        <td className="p-4">
                          <span className="font-bold font-mono bg-violet-50 border border-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px]">
                            {r.paymentMethod || (((r as any).planType === "FREEMIUM" || r.amount === 0) ? "Gratuit" : "D17")}
                          </span>
                        </td>
                        <td className="p-4">
                          {r.receiptUrl ? (
                            <a 
                              href={r.receiptUrl} 
                              target="_blank" 
                              rel="noopener noreferrer" 
                              className="inline-flex items-center gap-1.5 text-[#10B981] font-bold hover:underline"
                            >
                              <ExternalLink size={12} />
                              <span>Ouvrir la preuve</span>
                            </a>
                          ) : ((r as any).planType === "FREEMIUM" || r.amount === 0) ? (
                            <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                              <span>Aucune preuve requise</span>
                            </span>
                          ) : (
                            <span className="text-gray-400 italic text-[11px]">Paiement Direct</span>
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          {r.status === "approved" || r.status === "APPROVED" ? (
                            <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded">
                              ✅ Validé & Activé
                            </span>
                          ) : r.status === "suspended_admin" || r.status === "SUSPENDED_ADMIN" ? (
                            <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded inline-flex items-center gap-1">
                              <Clock size={11} />
                              <span>En attente confirmation Admin</span>
                            </span>
                          ) : r.status === "rejected" || r.status === "REJECTED" ? (
                            <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                              ❌ Rejeté / Non conforme
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-yellow-700 bg-yellow-50 border border-yellow-200 px-2.5 py-1 rounded animate-pulse">
                              ⏳ Attente d'Examen
                            </span>
                          )}
                        </td>
                        <td className="p-4 text-right">
                          <AgentActionButtons
                            receipt={r}
                            onValidate={() => setConfirmAction({
                              id: r.id,
                              type: "approve",
                              userName: r.userName,
                              amount: r.amount,
                              paymentMethod: r.paymentMethod
                            })}
                            onSuspend={() => setConfirmAction({
                              id: r.id,
                              type: "suspend",
                              userName: r.userName,
                              amount: r.amount,
                              paymentMethod: r.paymentMethod
                            })}
                          />
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={receiptCurrentPage}
              totalPages={receiptTotalPages}
              totalItems={receiptTotalItems}
              startIndex={receiptStartIndex}
              endIndex={receiptEndIndex}
              itemsPerPage={receiptItemsPerPage}
              onPageChange={receiptGoToPage}
              onItemsPerPageChange={setReceiptItemsPerPage}
            />
          </>
        )}

        {activeTab === "commissions" && (
          <div className="p-6 space-y-6 text-left">
            {/* Stats Cards Section */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Total Accumulé */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Total Accumulé</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Coins size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black text-[#0F1E36]">{totalAccumulated.toFixed(2)} <span className="text-xs font-bold text-gray-400">TND</span></p>
                <p className="text-[10px] text-gray-400 font-semibold">{totalInscriptions} inscription(s) validée(s)</p>
              </div>

              {/* Card 2: En Attente */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">En Attente</span>
                  <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                    <Clock size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black text-amber-600">{pendingWithdrawals.toFixed(2)} <span className="text-xs font-bold text-amber-400">TND</span></p>
                <p className="text-[10px] text-gray-400 font-semibold">Demandes d'avances en cours</p>
              </div>

              {/* Card 3: Déjà Réglé */}
              <div className="p-5 rounded-2xl border border-gray-200 bg-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-gray-500 font-bold uppercase tracking-wider">Déjà Réglé</span>
                  <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
                    <CheckCircle2 size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black text-blue-600">{approvedWithdrawals.toFixed(2)} <span className="text-xs font-bold text-blue-400">TND</span></p>
                <p className="text-[10px] text-gray-400 font-semibold">Avances & retraits approuvés</p>
              </div>

              {/* Card 4: Solde Disponible Actuel */}
              <div className="p-5 rounded-2xl border border-emerald-200 bg-emerald-50/40 shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] text-emerald-800 font-bold uppercase tracking-wider">Solde Disponible Actuel</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center">
                    <Wallet size={16} />
                  </div>
                </div>
                <p className="text-2xl font-black text-emerald-700">{remainingCommission.toFixed(2)} <span className="text-xs font-bold text-emerald-500">TND</span></p>
                <p className="text-[10px] text-emerald-600 font-semibold">Montant net restant à demander</p>
              </div>
            </div>

            {/* NEW: Solde de Commission Disponible Banner & Action Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Form to Request Advance/Withdrawal */}
              <div className="lg:col-span-1 border border-gray-200 rounded-2xl p-6 bg-white shadow-xs space-y-4">
                <div className="space-y-1">
                  <h3 className="font-extrabold text-[#0F1E36] text-sm flex items-center gap-1.5">
                    <Coins size={16} className="text-emerald-500" />
                    <span>Demander une Avance / Retrait</span>
                  </h3>
                  <p className="text-[11px] text-gray-400">
                    Saisissez le montant en dinars tunisiens (TND). Le montant doit être d'au moins 500 TND et inférieur ou égal à votre solde restant.
                  </p>
                </div>

                {/* Available Balance Card */}
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-150 space-y-1">
                  <span className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Solde Disponible Actuel</span>
                  <div className="text-2xl font-black text-[#0F1E36]">
                    {remainingCommission.toFixed(2)} <span className="text-xs font-bold text-gray-400">TND</span>
                  </div>
                  <p className="text-[9px] text-gray-400">Dernière mise à jour en temps réel</p>
                </div>

                <form 
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleRequestWithdrawal(withdrawalAmount);
                  }}
                  className="space-y-3"
                >
                  <div className="space-y-1 text-xs">
                    <label className="block font-bold text-gray-550 uppercase">Montant Souhaité (TND)</label>
                    <div className="relative">
                      <input 
                        type="number"
                        min="500"
                        step="0.01"
                        required
                        placeholder="Ex: 550"
                        value={withdrawalAmount}
                        onChange={(e) => setWithdrawalAmount(e.target.value)}
                        className="w-full text-xs p-2.5 pr-10 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36] font-mono font-bold"
                      />
                      <span className="absolute right-3 top-2.5 text-xs text-gray-400 font-bold">DT</span>
                    </div>
                    {withdrawalAmount && parseFloat(withdrawalAmount) < 500 && (
                      <span className="text-[10px] text-rose-600 font-semibold block mt-1">⚠️ Le montant doit être supérieur ou égal à 500 TND</span>
                    )}
                  </div>

                  <button
                    type="submit"
                    disabled={withdrawalLoading || !withdrawalAmount || parseFloat(withdrawalAmount) < 500 || parseFloat(withdrawalAmount) > remainingCommission}
                    className="w-full py-2.5 px-5 bg-[#0F1E36] hover:bg-[#1A3154] disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold rounded-lg cursor-pointer text-center text-xs uppercase tracking-wider transition-all"
                  >
                    {withdrawalLoading ? "Envoi en cours..." : "Envoyer la Demande"}
                  </button>
                </form>
              </div>

              {/* Personal Withdrawal Requests History */}
              <div className="lg:col-span-2 border border-gray-200 rounded-2xl p-6 bg-white shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                  <div>
                    <h3 className="font-extrabold text-[#0F1E36] text-sm flex items-center gap-1.5">
                      <History size={16} className="text-violet-500" />
                      <span>Historique de vos Demandes de Retrait</span>
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">Suivez l'état d'avancement de vos demandes d'avances sur commissions.</p>
                  </div>
                </div>

                <div className="overflow-x-auto border border-gray-150 rounded-xl bg-white">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-[#F9FAFB] border-b border-gray-200 text-gray-500 font-bold text-[10px] uppercase">
                        <th className="p-3">Montant Demandé</th>
                        <th className="p-3">Date & Heure</th>
                        <th className="p-3 text-center">Statut</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-150">
                      {withdrawals.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="p-6 text-center text-gray-450 italic font-medium">
                            Aucune demande d'avance/retrait soumise pour le moment.
                          </td>
                        </tr>
                      ) : (
                        withdrawals.map((w) => (
                          <tr key={w.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-black text-slate-800">
                              {w.amount.toFixed(2)} TND
                            </td>
                            <td className="p-3 font-mono text-gray-500 text-[11px]">
                              {w.requestDate}
                            </td>
                            <td className="p-3 text-center">
                              {(() => {
                                const isApproved = w.status === "approved" || w.status === "paid" || w.status === "APPROUVE" || w.status === "PAYE";
                                const isRejected = w.status === "rejected" || w.status === "REJETE";
                                return (
                                  <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full border ${
                                    isApproved
                                      ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                      : isRejected
                                      ? "bg-rose-50 text-rose-700 border-rose-200"
                                      : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                  }`}>
                                    {isApproved ? "Approuvé" : isRejected ? "Refusé" : "En attente"}
                                  </span>
                                );
                              })()}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Commissions History Table */}
            <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-xs">
              <div className="p-4 border-b border-gray-200 bg-slate-50 flex justify-between items-center">
                <div>
                  <h3 className="font-extrabold text-[#0F1E36] text-sm">Historique de vos validations et gains</h3>
                  <p className="text-[10px] text-gray-400 mt-0.5">Retrouvez les détails de chaque souscription validée par vos soins et de votre commission associée.</p>
                </div>
                <span className="text-[10px] font-extrabold px-2.5 py-1 rounded bg-[#0F1E36] text-white uppercase tracking-wider">
                  Rôle : {currentUser.agentType === "professeur" ? "Professeur (20%)" : "Assistant (10%)"}
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-[#F9FAFB] border-b border-gray-200 text-gray-500 font-bold uppercase text-[10px]">
                      <th className="p-3">Étudiant</th>
                      <th className="p-3">Forfait souscrit</th>
                      <th className="p-3">Montant versé</th>
                      <th className="p-3">Taux Appliqué</th>
                      <th className="p-3">Commission Gagnée</th>
                      <th className="p-3">Date de Validation</th>
                      <th className="p-3 text-center">Statut</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-150">
                    {uniqueCommissions.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="p-8 text-center text-gray-400 italic font-medium">
                          Aucun historique d'inscriptions ou de commissions enregistré pour l'instant. Validez un reçu étudiant pour commencer à accumuler des commissions !
                        </td>
                      </tr>
                    ) : (
                      uniqueCommissions.map((c) => {
                        const isDeduction = c.type === "DEDUCTION" || c.status === "rejected" || c.earnedCommission < 0;
                        const displayAmt = Math.abs(c.earnedCommission).toFixed(2);

                        return (
                          <tr
                            key={c.id}
                            className={`transition-colors ${
                              isDeduction ? "bg-rose-50/30 hover:bg-rose-50/60" : "hover:bg-slate-50/50"
                            }`}
                          >
                            <td className="p-3">
                              <div className="font-bold text-gray-900 flex items-center gap-1.5">
                                {c.studentName}
                                {isDeduction && (
                                  <span className="text-[9px] px-1.5 py-0.5 bg-rose-100 text-rose-700 font-extrabold rounded">
                                    Annulation
                                  </span>
                                )}
                              </div>
                              <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                                {c.description ? c.description : c.studentEmail}
                              </div>
                            </td>
                            <td className="p-3">
                              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold font-mono uppercase ${
                                c.subType === "freemium" ? "bg-slate-100 text-slate-600" : "bg-blue-50 text-blue-700"
                              }`}>
                                {c.subType === "freemium" ? "Freemium (Gratuit)" :
                                 c.subType === "mensuel" ? "Forfait Mensuel" : 
                                 c.subType === "trimestriel" ? "Forfait Trimestriel" : 
                                 c.subType === "annuel" ? "Forfait Annuel" : (c.subType || "Pack Révision")}
                              </span>
                            </td>
                            <td className="p-3 font-semibold text-gray-800">{c.amount} DT</td>
                            <td className="p-3 text-gray-500 font-bold">
                              <span className="inline-flex items-center gap-0.5 text-xs bg-slate-50 border border-slate-200 px-1.5 py-0.5 rounded-md font-mono">
                                <Percent size={10} className="text-gray-400" />
                                {c.rate}%
                              </span>
                            </td>
                            <td className={`p-3 font-black ${isDeduction ? "text-rose-600" : "text-emerald-600"}`}>
                              {isDeduction ? "-" : "+"}
                              {displayAmt} DT
                            </td>
                            <td className="p-3 text-gray-500">
                              {new Date(c.validationDate).toLocaleDateString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                            </td>
                            <td className="p-3 text-center">
                              <span className={`inline-block px-2.5 py-0.5 text-[10px] font-bold rounded-full ${
                                isDeduction
                                  ? "bg-rose-50 text-rose-700 border border-rose-200"
                                  : c.status === "paid" 
                                  ? "bg-blue-50 text-blue-700 border border-blue-200" 
                                  : "bg-amber-50 text-amber-700 border border-amber-200"
                              }`}>
                                {isDeduction ? "Déduite" : c.status === "paid" ? "Payée" : "En attente"}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>



      {/* State-Based Confirmation Drawer/Modal */}
      {confirmAction && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-xl border border-gray-150 space-y-4">
            <h3 className="text-sm font-extrabold text-[#0F1E36] flex items-center gap-1.5">
              {confirmAction.type === "approve" ? "✅ Confirmation de Validation" : confirmAction.type === "suspend" ? "⏳ Mise en attente Administrateur" : "❌ Confirmation de Rejet"}
            </h3>
            
            <p className="text-xs text-gray-600 leading-relaxed font-semibold">
              {confirmAction.type === "approve" ? (
                <>
                  Voulez-vous vraiment <b className="text-emerald-700">valider et activer</b> la transaction de <b>{confirmAction.userName}</b> d'un montant de <b>{confirmAction.amount} DT</b> ({confirmAction.paymentMethod}) ?
                </>
              ) : confirmAction.type === "suspend" ? (
                <>
                  Voulez-vous <b className="text-amber-700">suspendre</b> la transaction de <b>{confirmAction.userName}</b> d'un montant de <b>{confirmAction.amount} DT</b> ({confirmAction.paymentMethod}) et la transmettre en attente de confirmation par l'<b>Administrateur</b> ? La commande restera active.
                </>
              ) : (
                <>
                  Voulez-vous vraiment <b className="text-rose-700">rejeter la soumission</b> de <b>{confirmAction.userName}</b> d'un montant de <b>{confirmAction.amount} DT</b> ({confirmAction.paymentMethod}) ?
                </>
              )}
            </p>

            <div className="flex justify-end gap-2 pt-1">
              <button
                onClick={() => setConfirmAction(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold cursor-pointer"
              >
                Annuler
              </button>
              
              <button
                onClick={() => {
                  if (confirmAction.type === "approve") {
                    handleApprove(confirmAction.id);
                  } else if (confirmAction.type === "suspend") {
                    handleSuspend(confirmAction.id);
                  } else {
                    handleReject(confirmAction.id);
                  }
                  setConfirmAction(null);
                }}
                className={`px-3.5 py-1.5 text-white rounded-lg text-xs font-bold cursor-pointer transition-all ${
                  confirmAction.type === "approve" 
                    ? "bg-emerald-600 hover:bg-emerald-700 shadow-sm" 
                    : confirmAction.type === "suspend"
                    ? "bg-amber-500 hover:bg-amber-600 shadow-sm"
                    : "bg-red-600 hover:bg-red-750 shadow-sm"
                }`}
              >
                {confirmAction.type === "approve" ? "Confirmer la validation" : confirmAction.type === "suspend" ? "Confirmer la suspension" : "Confirmer le rejet"}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
