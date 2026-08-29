import React from "react";
import { Users, ShieldCheck, Clock, DollarSign, Award, BookOpen } from "lucide-react";
import { User, PaymentReceipt } from "../../types";

interface StatsOverviewCardsProps {
  users: User[];
  receipts: PaymentReceipt[];
}

export const StatsOverviewCards: React.FC<StatsOverviewCardsProps> = ({ users, receipts }) => {
  const totalStudents = users.filter((u) => u.role === "student").length;
  const activePremium = users.filter(
    (u) => u.role === "student" && u.accountType === "premium" && u.status === "active"
  ).length;
  const pendingReceipts = receipts.filter((r) => r.status === "pending").length;
  const totalApprovedAmount = receipts
    .filter((r) => r.status === "approved")
    .reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0);

  const totalAgents = users.filter((u) => u.role === "agent").length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {/* Total Students Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
          <Users size={22} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Total Élèves</p>
          <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalStudents}</h3>
          <span className="text-[10px] font-semibold text-emerald-600">Inscrits sur la plateforme</span>
        </div>
      </div>

      {/* Active Premium Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
          <ShieldCheck size={22} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Abonnés Premium</p>
          <h3 className="text-2xl font-black text-slate-800 mt-0.5">{activePremium}</h3>
          <span className="text-[10px] font-semibold text-emerald-600">Comptes actifs validés</span>
        </div>
      </div>

      {/* Pending Receipts Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
          <Clock size={22} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Reçus en Attente</p>
          <h3 className="text-2xl font-black text-slate-800 mt-0.5">{pendingReceipts}</h3>
          <span className="text-[10px] font-semibold text-amber-600">Validation manuelle requise</span>
        </div>
      </div>

      {/* Total Approved Revenue Card */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4 transition-all hover:shadow-md">
        <div className="w-12 h-12 rounded-xl bg-violet-50 text-violet-600 flex items-center justify-center shrink-0">
          <DollarSign size={22} />
        </div>
        <div>
          <p className="text-xs font-bold text-slate-500 uppercase tracking-wider">Revenus Validés</p>
          <h3 className="text-2xl font-black text-slate-800 mt-0.5">{totalApprovedAmount} TND</h3>
          <span className="text-[10px] font-semibold text-violet-600">{totalAgents} Agents partenaires</span>
        </div>
      </div>
    </div>
  );
};
