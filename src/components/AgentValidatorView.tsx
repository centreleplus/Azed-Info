import React, { useMemo, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';
import { canValidateSubscriptions } from '../utils/permissions';
import { validateStudentAccount } from '../context/SubscriptionContext';
import { isEligibleForRE } from '../utils/pricingDiscount';
import { 
  History, Coins, CheckCircle2, PauseCircle, Clock, 
  ExternalLink, ListFilter, Check, X, RefreshCw, Percent, 
  UserCheck, Sparkles, AlertCircle
} from 'lucide-react';
import { AgentActionButtons } from './AgentValidator';
import { PaginationControls } from './PaginationControls';
import usePagination from '../hooks/usePagination';

export interface SubscriptionRequest {
  id: string;
  userId?: string;
  studentId?: string;
  studentName?: string;
  userName?: string;
  userEmail?: string;
  studentEmail?: string;
  grade?: string;
  amount: number;
  paymentMethod?: string;
  receiptUrl?: string;
  status: 'PENDING' | 'APPROVED' | 'SUSPENDED_ADMIN' | 'REJECTED' | 'pending' | 'approved' | 'suspended_admin' | 'rejected' | string;
  planType?: 'FREEMIUM' | 'PREMIUM' | string;
  agentId?: string;
  handledBy?: string;
  handledByName?: string;
  uploadedAt?: string;
  createdAt?: string;
  rejectionReason?: string;
}

export const useAgentPendingRequests = (agentId: string, allRequests: SubscriptionRequest[] = []) => {
  return useMemo(() => {
    return allRequests.filter((request) => {
      // 1. Inclure les demandes 'PENDING' (En attente)
      const isPending = request.status === 'PENDING' || request.status === 'pending' || request.status === 'EN_ATTENTE';

      // 2. Afficher TOUTES les offres (Freemium et Premium)
      const isFreemiumOrPremium = 
        request.planType === 'FREEMIUM' || 
        request.planType === 'PREMIUM' || 
        request.amount >= 0;

      // 3. Afficher les demandes attribuées à cet agent OU les demandes globales ouvertes
      const isAssignedOrGlobal = !request.agentId || request.agentId === agentId;

      return isPending && isFreemiumOrPremium && isAssignedOrGlobal;
    });
  }, [allRequests, agentId]);
};

export const AgentValidatorView: React.FC = () => {
  const { user } = useAuth();
  const [requests, setRequests] = useState<SubscriptionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [filterType, setFilterType] = useState<'ALL' | 'FREEMIUM' | 'PREMIUM'>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('pending');
  const [feedback, setFeedback] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/receipts');
      if (res.ok) {
        const data = await res.json();
        setRequests(data || []);
      }
    } catch (e) {
      console.error('Error fetching subscription requests:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  const agentId = user?.id || 'usr_agent';
  const pendingRequests = useAgentPendingRequests(agentId, requests);

  // Filter based on selected category (Freemium vs Premium) and status
  const visibleRequests = useMemo(() => {
    return requests.filter((r) => {
      // Agents can see pending and suspended_admin requests, as well as requests they handled
      const isPendingOrSuspended = 
        r.status === 'pending' || 
        r.status === 'PENDING' || 
        r.status === 'suspended_admin' || 
        r.status === 'SUSPENDED_ADMIN';
      
      const isAssignedOrGlobal = !r.agentId || r.agentId === agentId;

      if (!isPendingOrSuspended && r.handledBy !== agentId && r.agentId !== agentId) {
        return false;
      }
      return isAssignedOrGlobal;
    });
  }, [requests, agentId]);

  const filteredRequests = useMemo(() => {
    return visibleRequests.filter((r) => {
      // Sub-filter by plan type (Freemium vs Premium)
      const isFreemium = r.planType === 'FREEMIUM' || r.amount === 0;
      if (filterType === 'FREEMIUM' && !isFreemium) return false;
      if (filterType === 'PREMIUM' && isFreemium) return false;

      // Status filter
      if (filterStatus === 'all') return true;
      const normStatus = (r.status || '').toLowerCase();
      return normStatus === filterStatus.toLowerCase();
    });
  }, [visibleRequests, filterType, filterStatus]);

  const {
    paginatedData,
    currentPage,
    totalPages,
    totalItems,
    startIndex,
    endIndex,
    itemsPerPage,
    goToPage,
    setItemsPerPage,
  } = usePagination({ data: filteredRequests, initialItemsPerPage: 10 });

  const handleValidateRequest = async (r: SubscriptionRequest) => {
    const studentId = r.userId || r.studentId || '';
    const isFreemium = r.planType === 'FREEMIUM' || r.amount === 0;
    const plan = isFreemium ? 'FREEMIUM' : 'PREMIUM';
    const amount = isFreemium ? 0 : r.amount;

    try {
      const res = await validateStudentAccount(
        r.id,
        studentId,
        plan,
        amount,
        agentId,
        user?.agentType === 'professeur' ? 0.20 : 0.10
      );

      if (res.success) {
        setFeedback({ 
          msg: `Demande de ${r.userName || r.studentName} validée avec succès ! ${isFreemium ? '(Offre Freemium, 0 DT commission)' : 'Compte Premium activé.'}`, 
          type: 'success' 
        });
        fetchRequests();
      }
    } catch (e: any) {
      setFeedback({ msg: e.message || 'Erreur lors de la validation.', type: 'error' });
    }
  };

  const handleSuspendRequest = async (receiptId: string) => {
    try {
      const res = await fetch('/api/admin/receipts/suspend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ receiptId, agentId, agentName: user?.fullName })
      });
      if (res.ok) {
        setFeedback({ msg: 'Demande mise en attente pour validation administrateur.', type: 'success' });
        fetchRequests();
      }
    } catch (e) {
      setFeedback({ msg: 'Erreur lors de la suspension.', type: 'error' });
    }
  };

  if (!canValidateSubscriptions(user?.role)) {
    return (
      <div className="p-8 text-center text-slate-400 text-xs">
        Accès réservé aux modérateurs & agents validateurs.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Toast Feedback */}
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold border transition-all ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-red-50 text-red-800 border-red-200'
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Header Block */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-xs">
        <div className="p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1 text-start">
            <span className="text-[9px] bg-violet-100 text-violet-700 font-extrabold uppercase px-2.5 py-1 rounded-md tracking-wider inline-block">
              MODÉRATEUR AGENT & VALIDATEUR
            </span>
            <h2 className="text-[#0F1E36] font-black text-lg tracking-tight">
              Toutes les souscriptions entrantes (Freemium & Premium)
            </h2>
            <p className="text-xs text-slate-500 max-w-2xl leading-relaxed">
              Consultez et validez instantanément les inscriptions gratuites Freemium (0 DT de commission) et les souscriptions Premium avec pièces jointes ou virements.
            </p>
          </div>

          <button
            onClick={fetchRequests}
            disabled={loading}
            className="px-3.5 py-2 bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            <span>Actualiser</span>
          </button>
        </div>

        {/* Plan Type Sub-Tabs */}
        <div className="flex gap-2 border-b border-slate-100 p-4 bg-white">
          <button
            onClick={() => setFilterType('ALL')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Toutes les inscriptions ({pendingRequests.length} en attente)
          </button>
          <button
            onClick={() => setFilterType('FREEMIUM')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === 'FREEMIUM'
                ? 'bg-emerald-700 text-white shadow-xs'
                : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
            }`}
          >
            Offres Freemium (Gratuit) ({pendingRequests.filter(r => r.planType === 'FREEMIUM' || r.amount === 0).length})
          </button>
          <button
            onClick={() => setFilterType('PREMIUM')}
            className={`px-3.5 py-2 text-xs font-bold rounded-xl transition-all cursor-pointer ${
              filterType === 'PREMIUM'
                ? 'bg-blue-700 text-white shadow-xs'
                : 'bg-blue-50 text-blue-700 hover:bg-blue-100'
            }`}
          >
            Offres Premium ({pendingRequests.filter(r => r.planType !== 'FREEMIUM' && r.amount > 0).length})
          </button>
        </div>

        {/* Status Filters */}
        <div className="px-6 py-3 border-b border-slate-100 bg-slate-50/50 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-1.5">
            <button
              onClick={() => setFilterStatus('pending')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterStatus === 'pending' ? 'bg-amber-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Clock size={12} />
              <span>En attente ({visibleRequests.filter(r => r.status === 'pending' || r.status === 'PENDING').length})</span>
            </button>

            <button
              onClick={() => setFilterStatus('suspended_admin')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterStatus === 'suspended_admin' ? 'bg-amber-500 text-white' : 'bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200'
              }`}
            >
              <PauseCircle size={12} />
              <span>Suspendues Admin ({visibleRequests.filter(r => r.status === 'suspended_admin' || r.status === 'SUSPENDED_ADMIN').length})</span>
            </button>

            <button
              onClick={() => setFilterStatus('approved')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterStatus === 'approved' ? 'bg-emerald-600 text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <Check size={12} />
              <span>Validées & Actives ({visibleRequests.filter(r => r.status === 'approved' || r.status === 'APPROVED').length})</span>
            </button>

            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5 cursor-pointer ${
                filterStatus === 'all' ? 'bg-[#0F1E36] text-white' : 'bg-white hover:bg-slate-100 text-slate-600 border border-slate-200'
              }`}
            >
              <ListFilter size={12} />
              <span>Toutes ({visibleRequests.length})</span>
            </button>
          </div>

          <div className="text-[11px] font-semibold text-slate-500">
            Affichage de <span className="text-[#0F1E36] font-bold">{filteredRequests.length} demande(s)</span>
          </div>
        </div>

        {/* Requests Table */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-left text-xs text-slate-700">
            <thead>
              <tr className="bg-[#F9FAFB] border-b border-slate-200 text-slate-400 font-bold">
                <th className="p-4 whitespace-nowrap">Lycéen / Candidat</th>
                <th className="p-4 whitespace-nowrap">Type d'Offre & Montant</th>
                <th className="p-4 whitespace-nowrap">Règlement / Mode</th>
                <th className="p-4 whitespace-nowrap">Preuve / Justificatif</th>
                <th className="p-4 whitespace-nowrap">Statut Compte</th>
                <th className="p-4 whitespace-nowrap text-right">Action Agent</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRequests.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-12 text-center text-slate-400 font-medium">
                    Aucune demande d'inscription dans cette catégorie.
                  </td>
                </tr>
              ) : (
                paginatedData.map((r) => {
                  const isFreemium = r.planType === 'FREEMIUM' || r.amount === 0;
                  const isApproved = r.status === 'approved' || r.status === 'APPROVED';
                  const isSuspended = r.status === 'suspended_admin' || r.status === 'SUSPENDED_ADMIN';
                  const isRejected = r.status === 'rejected' || r.status === 'REJECTED';

                  return (
                    <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#0F1E36] text-xs flex items-center gap-1.5">
                            {r.userName || r.studentName}
                            {isFreemium && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded">
                                Freemium
                              </span>
                            )}
                          </p>
                          <p className="text-[10px] text-slate-400 font-mono">{r.userEmail || r.studentEmail}</p>
                          <p className="text-[10px] text-slate-400">Date: {new Date(r.uploadedAt || r.createdAt || Date.now()).toLocaleString()}</p>
                        </div>
                      </td>

                      <td className="p-4">
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-black font-mono uppercase ${
                              isFreemium ? 'bg-slate-100 text-slate-600' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {isFreemium ? 'Offre Freemium' : 'Offre Premium'}
                            </span>
                            {!isFreemium && isEligibleForRE(r.grade, (r as any).section) && (
                              <span className="px-1.5 py-0.2 bg-red-100 text-red-700 font-extrabold text-[9px] rounded uppercase">
                                RE -20%
                              </span>
                            )}
                          </div>
                          <p className="text-[#0F1E36] font-black text-xs flex items-baseline gap-1">
                            {isFreemium ? '0 DT' : `${r.amount} DT`}{' '}
                            <span className="text-[10px] text-rose-500 font-semibold uppercase">
                              {isFreemium ? '(Gratuit)' : 'net'}
                            </span>
                          </p>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-bold font-mono bg-violet-50 border border-violet-100 text-violet-700 px-2 py-0.5 rounded text-[10px]">
                          {r.paymentMethod || (isFreemium ? 'Accès Gratuit' : 'D17')}
                        </span>
                      </td>

                      <td className="p-4">
                        {r.receiptUrl ? (
                          <a
                            href={r.receiptUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-emerald-600 font-bold hover:underline"
                          >
                            <ExternalLink size={12} />
                            <span>Voir le justificatif</span>
                          </a>
                        ) : isFreemium ? (
                          <span className="text-[10px] text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded font-semibold inline-flex items-center gap-1">
                            <Sparkles size={11} />
                            <span>Aucune preuve requise</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 italic text-[11px]">Paiement Direct</span>
                        )}
                      </td>

                      <td className="p-4 whitespace-nowrap">
                        {isApproved ? (
                          <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
                            ✅ Validé & Actif
                          </span>
                        ) : isSuspended ? (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded inline-flex items-center gap-1">
                            <Clock size={11} />
                            <span>En attente Admin</span>
                          </span>
                        ) : isRejected ? (
                          <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded">
                            ❌ Rejeté
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded animate-pulse">
                            ⏳ En attente validation
                          </span>
                        )}
                      </td>

                      <td className="p-4 text-right">
                        <AgentActionButtons
                          receipt={r as any}
                          onValidate={() => handleValidateRequest(r)}
                          onSuspend={() => handleSuspendRequest(r.id)}
                        />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalItems}
          startIndex={startIndex}
          endIndex={endIndex}
          itemsPerPage={itemsPerPage}
          onPageChange={goToPage}
          onItemsPerPageChange={setItemsPerPage}
        />
      </div>
    </div>
  );
};

export default AgentValidatorView;
