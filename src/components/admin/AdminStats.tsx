import React from "react";
import { Users, ShieldCheck, Clock, BookOpen, DollarSign, Award, HelpCircle } from "lucide-react";
import { User, CourseItem, AuditLogItem } from "../../types";
import MetricCard from "../MetricCard";
import { AdminReportingView } from "../AdminReportingView";

export interface AdminStatsProps {
  users: User[];
  auditLogs?: AuditLogItem[];
  courses?: CourseItem[];
  quizzes?: any[];
  receipts?: any[];
  onNavigateTab?: (tab: string) => void;
}

export const AdminStats: React.FC<AdminStatsProps> = ({
  users = [],
  auditLogs = [],
  courses = [],
  quizzes = [],
  receipts = [],
  onNavigateTab
}) => {
  const studentsCount = users.filter((u) => u.role === "student" || !u.role).length;
  const activeStudentsCount = users.filter(
    (u) => (u.status === "active" || u.status === "actif" || u.verified === true) && !u.isBlocked && u.status !== "disabled" && u.status !== "blocked"
  ).length;
  const pendingCount = users.filter(
    (u) => u.status === "pending" || u.accountStatus === "HOLD" || (!u.verified && u.status !== "disabled" && u.status !== "blocked")
  ).length;
  const premiumCount = users.filter(
    (u) => {
      const b = (u.activeBadge || u.badge || u.subscriptionBadge || "").toUpperCase();
      return b && b !== "FREEMIUM";
    }
  ).length;

  return (
    <div className="space-y-6">
      {/* Top Metric Cards Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Total Étudiants"
          value={studentsCount}
          icon={<Users size={20} />}
          description="Inscrits sur la plateforme"
          color="blue"
          onClick={() => onNavigateTab && onNavigateTab("users")}
        />
        <MetricCard
          title="Comptes Actifs"
          value={activeStudentsCount}
          icon={<ShieldCheck size={20} />}
          description="Accès validé et actif"
          color="emerald"
          onClick={() => onNavigateTab && onNavigateTab("users")}
        />
        <MetricCard
          title="En Attente (Hold)"
          value={pendingCount}
          icon={<Clock size={20} />}
          description="Comptes à approuver"
          color="amber"
          onClick={() => onNavigateTab && onNavigateTab("users")}
        />
        <MetricCard
          title="Abonnés Premium"
          value={premiumCount}
          icon={<Award size={20} />}
          description="Essentiel, Live+, Révision+, Intégral"
          color="purple"
          onClick={() => onNavigateTab && onNavigateTab("users")}
        />
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white border border-gray-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Fiches & Cours</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">{courses.length}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Documents publiés</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950 text-blue-600">
            <BookOpen size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Quiz Interactifs</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">{quizzes.length}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Évaluations actives</p>
          </div>
          <div className="p-3 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600">
            <HelpCircle size={22} />
          </div>
        </div>

        <div className="bg-white border border-gray-100 dark:border-slate-800 rounded-2xl p-4 flex items-center justify-between shadow-xs">
          <div>
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Reçus de Paiement</p>
            <h4 className="text-xl font-black text-slate-800 dark:text-white mt-1">{receipts.length}</h4>
            <p className="text-[11px] text-gray-500 mt-0.5">Transactions enregistrées</p>
          </div>
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950 text-emerald-600">
            <DollarSign size={22} />
          </div>
        </div>
      </div>

      {/* Reporting & Export View */}
      <div className="bg-white border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-xs">
        <h3 className="text-sm font-bold text-slate-800 dark:text-white mb-4">Export & Analyse Détaillée</h3>
        <AdminReportingView users={users} auditLogs={auditLogs} />
      </div>
    </div>
  );
};

export default AdminStats;
