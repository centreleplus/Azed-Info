import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { User, AuditLogItem } from '../types';
import { getValidatorName } from './AdminReportsManager';

export interface SaleRecord {
  studentName: string;
  formula: string;
  amount: number;
  date: string;
  validator: string;
  agent?: string;
}

export interface AgentPerformance {
  agentName: string;
  accepted: number;
  suspended: number;
  total: number;
}

export interface StatsReportsViewProps {
  users?: User[];
  auditLogs?: AuditLogItem[];
  initialSalesData?: SaleRecord[];
  initialAgentsData?: AgentPerformance[];
}

export const StatsReportsView: React.FC<StatsReportsViewProps> = ({
  users = [],
  auditLogs = [],
  initialSalesData,
  initialAgentsData,
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'agents'>('sales');

  // Base de données dynamique - Ventes & Élèves
  const salesData: SaleRecord[] = useMemo(() => {
    if (initialSalesData && initialSalesData.length > 0) {
      return initialSalesData;
    }
    if (!auditLogs || auditLogs.length === 0) {
      return [];
    }

    return auditLogs.map((log) => {
      const student = users.find(
        (u) =>
          (u.email && log.studentEmail && u.email.toLowerCase() === log.studentEmail.toLowerCase()) ||
          (u.fullName && log.studentName && u.fullName.toLowerCase() === log.studentName.toLowerCase()) ||
          u.id === log.receiptId
      );

      let formula = 'Option Gratuit';
      if (student?.badgeLabel || student?.badge_label) {
        formula = student.badgeLabel || student.badge_label || '';
      } else if (student?.packs && student.packs.length > 0) {
        formula = student.packs.join(', ');
      } else if (student?.accountType === 'premium') {
        const sub = student.subscriptionType || 'annuel';
        formula = `Forfait ${sub.charAt(0).toUpperCase() + sub.slice(1)}`;
      } else if (log.amount && log.amount > 0) {
        formula = 'Pack Pass Essentiel';
      }

      let dateFormatted = '';
      if (log.timestamp) {
        dateFormatted = log.timestamp.includes('T') ? log.timestamp.split('T')[0] : log.timestamp.split(' ')[0];
      } else {
        dateFormatted = new Date().toISOString().split('T')[0];
      }

      const val = getValidatorName(log, student, users);
      return {
        studentName: student?.fullName || log.studentName || 'Élève',
        formula,
        amount: Number(log.amount) || 0,
        date: dateFormatted,
        validator: val,
        agent: val,
      };
    });
  }, [auditLogs, users, initialSalesData]);

  // Base de données dynamique - Agents & Validation
  const agentsData: AgentPerformance[] = useMemo(() => {
    if (initialAgentsData && initialAgentsData.length > 0) {
      return initialAgentsData;
    }

    const agentUsers = users.filter((u) => u.role === 'agent');
    const agentNames = new Set<string>();

    agentUsers.forEach((ag) => {
      if (ag.fullName) agentNames.add(ag.fullName);
    });

    auditLogs.forEach((log) => {
      if (log.agentName) agentNames.add(log.agentName);
    });

    if (agentNames.size === 0) {
      return [];
    }

    return Array.from(agentNames).map((name) => {
      const agentLogs = auditLogs.filter((l) => l.agentName === name);
      const accepted = agentLogs.filter(
        (l) => l.action === 'approved' || l.action === 'Validé' || l.action === 'APPROVED'
      ).length;
      const suspended = agentLogs.filter(
        (l) =>
          l.action === 'rejected' ||
          l.action === 'suspended_admin' ||
          l.action === 'Suspendu' ||
          l.action === 'REJECTED'
      ).length;

      return {
        agentName: name,
        accepted,
        suspended,
        total: accepted + suspended,
      };
    });
  }, [auditLogs, users, initialAgentsData]);

  // Calculs statistiques
  const totalRevenue = salesData.reduce((acc, curr) => acc + curr.amount, 0);
  const maxAgentTotal = Math.max(1, ...agentsData.map((a) => a.total));

  // Export Excel basique (XLSX / CSV)
  const handleExportExcel = () => {
    try {
      let exportData: any[] = [];
      let fileName = '';

      if (activeTab === 'sales') {
        fileName = 'Rapport_Ventes_Et_Eleves_2026.xlsx';
        exportData = salesData.map((row) => ({
          'Élève': row.studentName,
          'Formule': row.formula,
          'Montant (DT)': row.amount,
          'Date': row.date,
          'Validateur': row.validator || row.agent || 'Non attribué',
        }));
      } else {
        fileName = 'Rapport_Agents_Validation_2026.xlsx';
        exportData = agentsData.map((row) => ({
          'Validateur / Agent': row.agentName,
          'Élèves Acceptés': row.accepted,
          'Élèves Suspendus': row.suspended,
          'Total Traités': row.total,
        }));
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Rapport');
      XLSX.writeFile(workbook, fileName);
    } catch {
      // Fallback CSV
      let csvContent = 'data:text/csv;charset=utf-8,';
      if (activeTab === 'sales') {
        csvContent += 'Eleve,Formule,Montant (DT),Date,Validateur\n';
        salesData.forEach((row) => {
          csvContent += `"${row.studentName}","${row.formula}",${row.amount},"${row.date}","${row.validator || row.agent || 'Non attribué'}"\n`;
        });
      } else {
        csvContent += 'Validateur,Eleves Acceptes,Eleves Suspendus,Total Traites\n';
        agentsData.forEach((row) => {
          csvContent += `"${row.agentName}",${row.accepted},${row.suspended},${row.total}\n`;
        });
      }
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `Rapport_${activeTab}_2026.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-left">
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h1 className="text-2xl font-black text-slate-800 flex items-center gap-2">
            <span>📊</span> Édition des États & Rapports Statistiques
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Visualisation graphique des performances commerciales et administratives.
          </p>
        </div>

        {/* Bouton d'export Excel uniquement */}
        <button
          type="button"
          onClick={handleExportExcel}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
          </svg>
          <span>Exporter sur Excel (.xlsx)</span>
        </button>
      </div>

      {/* Selecteur d'onglets */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>📈</span>
          <span>État des Ventes & Élèves ({salesData.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agents')}
          className={`px-5 py-2.5 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer ${
            activeTab === 'agents'
              ? 'bg-emerald-600 text-white shadow-sm'
              : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-100'
          }`}
        >
          <span>🎬</span>
          <span>État des Agents & Validation ({agentsData.length})</span>
        </button>
      </div>

      {/* ONGLET 1 : GRAPHIQUE DES VENTES & ÉLÈVES */}
      {activeTab === 'sales' && (
        <div className="space-y-6">
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chiffre d'Affaires Total</span>
              <p className="text-2xl font-black text-emerald-600 mt-1">{totalRevenue} DT</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Inscriptions Enregistrées</span>
              <p className="text-2xl font-black text-slate-800 mt-1">{salesData.length} Élèves</p>
            </div>
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
              <span className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Panier Moyen</span>
              <p className="text-2xl font-black text-blue-900 mt-1">{salesData.length > 0 ? Math.round(totalRevenue / salesData.length) : 0} DT</p>
            </div>
          </div>

          {/* Graphique à barres horizontales pour les ventes */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Répartition des Inscriptions & Montants par Élève
            </h3>
            
            <div className="space-y-4 pt-2">
              {salesData.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium italic">
                  Aucune transaction enregistrée pour le moment.
                </div>
              ) : (
                salesData.map((sale, index) => {
                  const percentage = Math.min(100, Math.round((sale.amount / (Math.max(...salesData.map(s => s.amount)) || 350)) * 100));
                  return (
                    <div key={index} className="space-y-1">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-700">
                        <span>{sale.studentName} <span className="text-slate-400 font-medium">({sale.formula})</span></span>
                        <span className="text-emerald-600 font-black">{sale.amount} DT</span>
                      </div>
                      <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden flex">
                        <div
                          style={{ width: `${percentage}%` }}
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                        ></div>
                      </div>
                      <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
                        <span>Date : {sale.date}</span>
                        <span>Validateur : {sale.validator || sale.agent || 'Non attribué'}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ONGLET 2 : GRAPHIQUE COMPARAISON DES AGENTS */}
      {activeTab === 'agents' && (
        <div className="space-y-6">
          {/* Graphique comparatif par agent */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm space-y-6">
            <h3 className="text-xs font-black text-slate-700 uppercase tracking-wider">
              Performance & Volume de Traitement par Agent
            </h3>

            <div className="space-y-6">
              {agentsData.length === 0 ? (
                <div className="p-8 text-center text-slate-400 font-medium italic">
                  Aucun agent ou validation enregistrée.
                </div>
              ) : (
                agentsData.map((agent, index) => {
                  const acceptedPct = (agent.accepted / maxAgentTotal) * 100;
                  const suspendedPct = (agent.suspended / maxAgentTotal) * 100;

                  return (
                    <div key={index} className="space-y-2">
                      <div className="flex justify-between items-center text-xs font-bold text-slate-800">
                        <span>{agent.agentName}</span>
                        <span className="text-slate-500 font-extrabold">Total Traités : {agent.total}</span>
                      </div>

                      {/* Barre de répartition empilée */}
                      <div className="w-full h-4 bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                        <div
                          style={{ width: `${acceptedPct}%` }}
                          className="bg-emerald-500 h-full rounded-l-full transition-all duration-500"
                          title={`Acceptés: ${agent.accepted}`}
                        ></div>
                        <div
                          style={{ width: `${suspendedPct}%` }}
                          className="bg-rose-500 h-full rounded-r-full transition-all duration-500"
                          title={`Suspendus: ${agent.suspended}`}
                        ></div>
                      </div>

                      {/* Légende individuelle */}
                      <div className="flex items-center gap-4 text-[10px] font-extrabold text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                          Élèves Acceptés ({agent.accepted})
                        </span>
                        <span className="flex items-center gap-1">
                          <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                          Élèves Suspendus / Inactifs ({agent.suspended})
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatsReportsView;
