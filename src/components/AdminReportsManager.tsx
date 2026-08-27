import React, { useState, useMemo } from 'react';
import * as XLSX from 'xlsx';
import { User, AuditLogItem } from '../types';
import { calculatePriceWithRE, isEligibleForRE } from '../utils/pricingDiscount';

// Structure des données du rapport
export interface SaleReportRow {
  id: string;
  date: string;
  nom: string;
  prenom: string;
  grade?: string;
  region: string;
  lycee: string;
  pack: string;
  section?: string;
  discountInfo?: string;
  hasRE?: boolean;
  validator: string;
  agent?: string; // rétro-compatibilité
  statut: 'Validé' | 'Suspendu';
  montant: number;
}

export interface AgentReportRow {
  id: string;
  nom: string;
  prenom: string;
  acceptes: number;
  suspendus: number;
  totalTraites: number;
  tauxAcceptation: number;
  chiffreAffaires: number;
}

export interface AdminReportsManagerProps {
  users?: User[];
  auditLogs?: AuditLogItem[];
  initialSalesData?: SaleReportRow[];
  initialAgentsData?: AgentReportRow[];
}

/**
 * Calcule dynamiquement le nom du validateur d'un compte ou d'une transaction.
 */
export const getValidatorName = (
  log?: Partial<AuditLogItem> | any,
  student?: any,
  usersList: User[] = []
): string => {
  if (student?.validatedByAdmin || log?.validatedByAdmin) {
    return student?.adminName || log?.adminName || 'Administrateur';
  }

  const rawAgentName =
    log?.validator ||
    log?.validatorName ||
    log?.agentName ||
    student?.handledByName ||
    student?.agentName ||
    student?.validatedByName;
  const rawAgentId =
    log?.validatorId ||
    log?.agentId ||
    student?.handledBy ||
    student?.agentId ||
    student?.validatedBy;

  if (rawAgentId) {
    const matchedUser = usersList.find((u) => u.id === rawAgentId);
    if (matchedUser) {
      if (matchedUser.role === 'admin') {
        return matchedUser.fullName ? `${matchedUser.fullName} (Admin)` : 'Administrateur';
      }
      if (matchedUser.role === 'agent') {
        return matchedUser.fullName || rawAgentName || 'Agent Référent';
      }
    }
    if (rawAgentId === 'usr_admin' || rawAgentId === 'admin') {
      if (rawAgentName && rawAgentName !== 'Agent Direction' && rawAgentName !== 'ADMIN' && rawAgentName !== 'admin') {
        return rawAgentName.includes('(Admin)') ? rawAgentName : `${rawAgentName} (Admin)`;
      }
      return 'Administrateur';
    }
  }

  if (rawAgentName) {
    if (
      rawAgentName.toLowerCase().includes('admin') ||
      rawAgentName.toLowerCase().includes('direction')
    ) {
      if (
        rawAgentName === 'Agent Direction' ||
        rawAgentName === 'ADMIN' ||
        rawAgentName === 'admin'
      ) {
        return 'Administrateur';
      }
      return rawAgentName;
    }
    return rawAgentName;
  }

  const status = log?.action || student?.account_status || student?.status;
  if (status === 'pending' || status === 'PENDING' || status === 'en_attente') {
    return 'En attente';
  }

  return 'Non attribué';
};

export const AdminReportsManager: React.FC<AdminReportsManagerProps> = ({
  users = [],
  auditLogs = [],
  initialSalesData,
  initialAgentsData,
}) => {
  const [activeTab, setActiveTab] = useState<'sales' | 'agents'>('sales');
  const [searchTerm, setSearchTerm] = useState('');

  // Construction dynamique des données de ventes à partir du Journal d'Audit et de Lycées & Comptes
  const salesData: SaleReportRow[] = useMemo(() => {
    if (initialSalesData && initialSalesData.length > 0) {
      return initialSalesData.map((row) => {
        const val = row.validator || row.agent || getValidatorName(undefined, row, users);
        return {
          ...row,
          validator: val,
          agent: val,
        };
      });
    }

    if (!auditLogs || auditLogs.length === 0) {
      return [];
    }

    return auditLogs.map((log, index) => {
      // Recherche de l'élève correspondant dans "Lycées & Comptes"
      const student = users.find(
        (u) =>
          (u.email && log.studentEmail && u.email.toLowerCase() === log.studentEmail.toLowerCase()) ||
          (u.fullName && log.studentName && u.fullName.toLowerCase() === log.studentName.toLowerCase()) ||
          u.id === log.receiptId
      );

      // Extraction propre Nom / Prénom
      const fullName = student?.fullName || log.studentName || 'Élève';
      const nameParts = fullName.trim().split(' ');
      const prenom = nameParts.length > 1 ? nameParts[0] : '';
      const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

      // Extraction Région, Lycée & Section
      const region = student?.city || (student as any)?.region || 'Non spécifiée';
      const lycee = student?.highSchool || (student as any)?.lycee || 'Non spécifié';
      const studentSection = student?.section || student?.branche || (student as any)?.branch || (log as any)?.section || '';
      const studentGrade = student?.grade || student?.level || (student as any)?.niveau || (log as any)?.grade || '';

      // Détermination du Pack
      let packName = 'Option Gratuit';
      if (student?.badgeLabel || student?.badge_label) {
        packName = student.badgeLabel || student.badge_label || '';
      } else if (student?.packs && student.packs.length > 0) {
        packName = student.packs.join(', ');
      } else if (student?.accountType === 'premium') {
        const sub = student.subscriptionType || 'annuel';
        packName = `Forfait ${sub.charAt(0).toUpperCase() + sub.slice(1)}`;
      } else if (log.amount && log.amount > 0) {
        packName = 'Pack Pass Essentiel';
      }

      // Formatage de la date
      let dateFormatted = '';
      if (log.timestamp) {
        if (log.timestamp.includes('T')) {
          dateFormatted = log.timestamp.split('T')[0];
        } else if (log.timestamp.includes(' ')) {
          dateFormatted = log.timestamp.split(' ')[0];
        } else {
          dateFormatted = log.timestamp;
        }
      } else {
        dateFormatted = new Date().toISOString().split('T')[0];
      }

      // Statut & Montant direct enregistré
      const isApproved =
        log.action === 'approved' ||
        log.action === 'Validé' ||
        log.action === 'active' ||
        log.action === 'APPROVED';
      const statut: 'Validé' | 'Suspendu' = isApproved ? 'Validé' : 'Suspendu';
      
      const rawAmount = Number(log.amount) || (student?.amount ? Number(student.amount) : 0);
      const isRE = isEligibleForRE(studentGrade, studentSection);
      
      // Utilisation directe du montant net enregistré dans la transaction
      const montant = rawAmount > 0 ? rawAmount : (isRE ? 96 : 120);

      // Détermination dynamique du Validateur
      const validatorName = getValidatorName(log, student, users);

      return {
        id: log.receiptId || log.id || `TX-${index + 1}`,
        date: dateFormatted,
        nom,
        prenom,
        grade: studentGrade,
        region,
        lycee,
        pack: packName,
        section: studentSection || 'Tronc Commun',
        discountInfo: isRE ? '-20% Remise Exceptionnelle (Prix RE)' : 'Standard',
        hasRE: isRE,
        validator: validatorName,
        agent: validatorName,
        statut,
        montant,
      };
    });
  }, [auditLogs, users, initialSalesData]);

  // Construction dynamique des données de performance des agents
  const agentsData: AgentReportRow[] = useMemo(() => {
    if (initialAgentsData && initialAgentsData.length > 0) {
      return initialAgentsData;
    }

    // Récupérer la liste des agents depuis les utilisateurs (rôle agent) et depuis les logs d'audit
    const agentUsers = users.filter((u) => u.role === 'agent');
    const agentMap = new Map<string, { id: string; fullName: string }>();

    agentUsers.forEach((ag) => {
      agentMap.set(ag.id, { id: ag.id, fullName: ag.fullName });
    });

    auditLogs.forEach((log) => {
      if (log.agentId && !agentMap.has(log.agentId)) {
        agentMap.set(log.agentId, { id: log.agentId, fullName: log.agentName || 'Agent' });
      } else if (log.agentName && !Array.from(agentMap.values()).some((a) => a.fullName === log.agentName)) {
        agentMap.set(log.agentName, { id: `AGT-${agentMap.size + 1}`, fullName: log.agentName });
      }
    });

    if (agentMap.size === 0) {
      return [];
    }

    return Array.from(agentMap.values()).map((agentInfo, idx) => {
      const agentLogs = auditLogs.filter(
        (l) => l.agentId === agentInfo.id || (l.agentName && l.agentName === agentInfo.fullName)
      );

      const acceptes = agentLogs.filter(
        (l) => l.action === 'approved' || l.action === 'Validé' || l.action === 'APPROVED'
      ).length;
      const suspendus = agentLogs.filter(
        (l) =>
          l.action === 'rejected' ||
          l.action === 'suspended_admin' ||
          l.action === 'Suspendu' ||
          l.action === 'REJECTED'
      ).length;
      const totalTraites = acceptes + suspendus;
      const tauxAcceptation = totalTraites > 0 ? Math.round((acceptes / totalTraites) * 100) : 0;
      const chiffreAffaires = agentLogs
        .filter((l) => l.action === 'approved' || l.action === 'Validé' || l.action === 'APPROVED')
        .reduce((sum, l) => sum + (Number(l.amount) || 0), 0);

      const nameParts = agentInfo.fullName.trim().split(' ');
      const prenom = nameParts.length > 1 ? nameParts[0] : '';
      const nom = nameParts.length > 1 ? nameParts.slice(1).join(' ') : nameParts[0];

      return {
        id: `AGT-${String(idx + 1).padStart(3, '0')}`,
        nom,
        prenom,
        acceptes,
        suspendus,
        totalTraites,
        tauxAcceptation,
        chiffreAffaires,
      };
    });
  }, [auditLogs, users, initialAgentsData]);

  // Calculs totaux
  const totalCA = salesData.reduce((acc, s) => acc + (s.statut === 'Validé' ? s.montant : 0), 0);
  const totalElevesValides = salesData.filter((s) => s.statut === 'Validé').length;
  const totalElevesSuspendus = salesData.filter((s) => s.statut === 'Suspendu').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportExcel = (e: React.MouseEvent) => {
    e.preventDefault();
    try {
      let exportRows: any[] = [];
      let fileName = '';

      if (activeTab === 'sales') {
        fileName = 'Etat_Ventes_Eleves_A_Zed_Info_2026.xlsx';
        exportRows = salesData.map((row) => ({
          'Code Transaction / Élève': row.id,
          'Date': row.date,
          'Nom': row.nom,
          'Prénom': row.prenom,
          'Section / Filière': row.section || 'Générale',
          'Région': row.region,
          'Lycée': row.lycee,
          'Pack Choisi': row.pack,
          'Remise': row.discountInfo || 'Standard',
          'Validateur': row.validator || row.agent || 'Non attribué',
          'Statut': row.statut,
          'Montant Net (DT)': row.montant,
        }));
      } else {
        fileName = 'Etat_Performance_Agents_A_Zed_Info_2026.xlsx';
        exportRows = agentsData.map((agent) => ({
          'Code Agent': agent.id,
          'Nom': agent.nom,
          'Prénom': agent.prenom,
          'Élèves Acceptés': agent.acceptes,
          'Élèves Suspendus': agent.suspendus,
          'Total Traités': agent.totalTraites,
          'Taux Acceptation (%)': agent.tauxAcceptation,
          'CA Généré (DT)': agent.chiffreAffaires,
        }));
      }

      const worksheet = XLSX.utils.json_to_sheet(exportRows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(
        workbook,
        worksheet,
        activeTab === 'sales' ? 'Ventes & Élèves' : 'Performance Agents'
      );
      XLSX.writeFile(workbook, fileName);
    } catch {
      // Fallback CSV
      let csv = 'data:text/csv;charset=utf-8,';
      if (activeTab === 'sales') {
        csv += 'Code Eleve,Date,Nom,Prenom,Region,Lycee,Pack,Validateur,Statut,Montant (DT)\n';
        salesData.forEach((r) => {
          csv += `"${r.id}","${r.date}","${r.nom}","${r.prenom}","${r.region}","${r.lycee}","${r.pack}","${r.validator || r.agent || 'Non attribué'}","${r.statut}",${r.montant}\n`;
        });
      } else {
        csv += 'Code Agent,Nom,Prenom,Acceptes,Suspendus,Total,Taux (%),CA (DT)\n';
        agentsData.forEach((a) => {
          csv += `"${a.id}","${a.nom}","${a.prenom}",${a.acceptes},${a.suspendus},${a.totalTraites},${a.tauxAcceptation},${a.chiffreAffaires}\n`;
        });
      }
      const uri = encodeURI(csv);
      const link = document.createElement('a');
      link.href = uri;
      link.download = `Rapport_${activeTab}_2026.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const filteredSalesData = salesData.filter((item) =>
    `${item.nom} ${item.prenom} ${item.region} ${item.lycee} ${item.pack} ${item.validator || item.agent}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 bg-slate-50 min-h-screen space-y-6 text-left print:p-0 print:bg-white print:m-0">
      {/* Styles d'impression dédiés pour masquer barres latérales et contrôles */}
      <style>{`
        @media print {
          aside, nav, header, .print\\:hidden {
            display: none !important;
          }
          body, html, #root {
            background: #ffffff !important;
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-full-width {
            width: 100% !important;
            max-width: 100% !important;
            box-shadow: none !important;
            border: 1px solid #cbd5e1 !important;
          }
          table {
            width: 100% !important;
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
          th, td {
            padding: 6px 8px !important;
            font-size: 10px !important;
          }
        }
      `}</style>

      {/* Entête + Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-4 bg-white p-5 rounded-2xl shadow-sm border border-slate-200 print:border-none print:shadow-none print:p-0 print:mb-4">
        <div>
          <h1 className="text-xl font-black text-slate-800 uppercase tracking-wide">
            États & Rapports d'Administration
          </h1>
          <p className="text-xs font-semibold text-slate-500 mt-0.5">
            Consultation, édition et impression des états Excel des Ventes et des Agents (Données en direct).
          </p>
        </div>

        <div className="flex items-center gap-3 print:hidden">
          <button
            type="button"
            onClick={handleExportExcel}
            className="px-4 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <span>Exporter sur Excel (.xlsx)</span>
          </button>

          <button
            type="button"
            onClick={handlePrint}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
            </svg>
            <span>Imprimer le Rapport</span>
          </button>
        </div>
      </div>

      {/* Selecteur d'onglets (Navigation entre rapports) */}
      <div className="flex items-center gap-3 print:hidden">
        <button
          type="button"
          onClick={() => setActiveTab('sales')}
          className={`px-5 py-3 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 border cursor-pointer ${
            activeTab === 'sales'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span>1. État des Ventes & Élèves ({salesData.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('agents')}
          className={`px-5 py-3 rounded-xl font-extrabold text-xs transition-all flex items-center gap-2 border cursor-pointer ${
            activeTab === 'agents'
              ? 'bg-emerald-600 text-white border-emerald-600 shadow-md'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
          }`}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
          </svg>
          <span>2. État des Agents & Validations ({agentsData.length})</span>
        </button>
      </div>

      {/* Cartes Résumé Synthétique */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 print:grid-cols-3">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Chiffre d'Affaires Total</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{totalCA} DT</p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Élèves Validés / Suspendus</p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            <span className="text-emerald-600">{totalElevesValides} Validés</span>
            <span className="text-slate-400 font-normal text-sm mx-1.5">/</span>
            <span className="text-rose-600">{totalElevesSuspendus} Suspendus</span>
          </p>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm print:border-slate-300">
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-wider">Panier Moyen / Élève</p>
          <p className="text-2xl font-black text-slate-800 mt-1">
            {totalElevesValides > 0 ? Math.round(totalCA / totalElevesValides) : 0} DT
          </p>
        </div>
      </div>

      {/* TABLEAU 1 : ÉTAT DES VENTES & ÉLÈVES */}
      {activeTab === 'sales' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 print:p-0 print:border-none print:shadow-none print-full-width">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-3 print:pb-2">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Rapport Synthétique des Ventes et Élèves Inscrits
            </h2>
            <input
              type="text"
              placeholder="Filtrer par nom, lycée, région, validateur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="px-3 py-1.5 text-xs border border-slate-200 rounded-lg w-full sm:w-64 focus:outline-none focus:border-emerald-600 print:hidden"
            />
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-700 text-white font-extrabold uppercase">
                  <th className="p-3 border border-emerald-800">Date</th>
                  <th className="p-3 border border-emerald-800">Nom & Prénom</th>
                  <th className="p-3 border border-emerald-800">Section / Filière</th>
                  <th className="p-3 border border-emerald-800">Région</th>
                  <th className="p-3 border border-emerald-800">Lycée</th>
                  <th className="p-3 border border-emerald-800">Pack Choisi</th>
                  <th className="p-3 border border-emerald-800">VALIDATEUR</th>
                  <th className="p-3 border border-emerald-800 text-center">Statut</th>
                  <th className="p-3 border border-emerald-800 text-right">Montant</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                {salesData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-medium italic">
                      Aucune donnée disponible dans le rapport
                    </td>
                  </tr>
                ) : filteredSalesData.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="p-8 text-center text-slate-400 font-medium italic">
                      Aucun résultat correspondant au filtre de recherche.
                    </td>
                  </tr>
                ) : (
                  filteredSalesData.map((row) => {
                    const isRE = row.hasRE || (row.discountInfo && row.discountInfo.includes('Remise Exceptionnelle')) || isEligibleForRE(row.grade || '', row.section || '');

                    return (
                      <tr key={row.id} className="hover:bg-slate-50 transition-colors">
                        <td className="p-3 border border-slate-200 text-slate-500">{row.date}</td>
                        <td className="p-3 border border-slate-200 font-bold text-slate-900">
                          {row.nom} {row.prenom}
                        </td>
                        <td className="p-3 border border-slate-200">
                          <div className="flex flex-col gap-0.5">
                            <span className="font-bold text-slate-800">{row.section || 'Générale'}</span>
                            {isRE && (
                              <span className="inline-block w-fit px-1.5 py-0.2 bg-red-100 text-red-700 font-black text-[9px] rounded uppercase">
                                -20% Prix RE
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="p-3 border border-slate-200">{row.region}</td>
                        <td className="p-3 border border-slate-200">{row.lycee}</td>
                        <td className="p-3 border border-slate-200">
                          <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                            {row.pack}
                          </span>
                        </td>
                        <td className="p-3 border border-slate-200 text-slate-600 font-semibold">
                          {row.validator || row.agent || 'Non attribué'}
                        </td>
                        <td className="p-3 border border-slate-200 text-center">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${
                              row.statut === 'Validé'
                                ? 'bg-emerald-100 text-emerald-800'
                                : 'bg-rose-100 text-rose-800'
                            }`}
                          >
                            {row.statut}
                          </span>
                        </td>
                        <td className="p-3 border border-slate-200 text-right font-black text-emerald-700">
                          {row.montant} DT
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td colSpan={8} className="p-3 border border-slate-300 text-right uppercase">
                    Total Général :
                  </td>
                  <td className="p-3 border border-slate-300 text-right text-emerald-700 text-sm">
                    {totalCA} DT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* TABLEAU 2 : ÉTAT DES AGENTS */}
      {activeTab === 'agents' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden space-y-4 p-5 print:p-0 print:border-none print:shadow-none print-full-width">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3 print:pb-2">
            <h2 className="text-sm font-black text-slate-800 uppercase tracking-wide">
              Rapport de Performance des Agents de Validation
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-emerald-700 text-white font-extrabold uppercase">
                  <th className="p-3 border border-emerald-800">Code Agent</th>
                  <th className="p-3 border border-emerald-800">Nom & Prénom Agent</th>
                  <th className="p-3 border border-emerald-800 text-center">Élèves Acceptés</th>
                  <th className="p-3 border border-emerald-800 text-center">Élèves Suspendus</th>
                  <th className="p-3 border border-emerald-800 text-center">Total Traités</th>
                  <th className="p-3 border border-emerald-800 text-center">Taux d'Acceptation</th>
                  <th className="p-3 border border-emerald-800 text-right">CA Généré</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 font-semibold text-slate-700">
                {agentsData.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 font-medium italic">
                      Aucun agent ou validation enregistrée dans le journal.
                    </td>
                  </tr>
                ) : (
                  agentsData.map((agent) => (
                    <tr key={agent.id} className="hover:bg-slate-50 transition-colors">
                      <td className="p-3 border border-slate-200 font-mono text-slate-500">{agent.id}</td>
                      <td className="p-3 border border-slate-200 font-bold text-slate-900">
                        {agent.nom} {agent.prenom}
                      </td>
                      <td className="p-3 border border-slate-200 text-center text-emerald-700 font-extrabold">
                        {agent.acceptes}
                      </td>
                      <td className="p-3 border border-slate-200 text-center text-rose-600 font-extrabold">
                        {agent.suspendus}
                      </td>
                      <td className="p-3 border border-slate-200 text-center font-bold">
                        {agent.totalTraites}
                      </td>
                      <td className="p-3 border border-slate-200 text-center">
                        <span className="bg-slate-100 text-slate-800 px-2 py-0.5 rounded font-bold">
                          {agent.tauxAcceptation}%
                        </span>
                      </td>
                      <td className="p-3 border border-slate-200 text-right font-black text-emerald-700">
                        {agent.chiffreAffaires} DT
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              <tfoot>
                <tr className="bg-slate-100 font-black text-slate-900">
                  <td colSpan={2} className="p-3 border border-slate-300 text-right uppercase">
                    Total Général :
                  </td>
                  <td className="p-3 border border-slate-300 text-center text-emerald-700">
                    {agentsData.reduce((acc, a) => acc + a.acceptes, 0)}
                  </td>
                  <td className="p-3 border border-slate-300 text-center text-rose-600">
                    {agentsData.reduce((acc, a) => acc + a.suspendus, 0)}
                  </td>
                  <td className="p-3 border border-slate-300 text-center">
                    {agentsData.reduce((acc, a) => acc + a.totalTraites, 0)}
                  </td>
                  <td className="p-3 border border-slate-300 text-center">-</td>
                  <td className="p-3 border border-slate-300 text-right text-emerald-700 text-sm">
                    {agentsData.reduce((acc, a) => acc + a.chiffreAffaires, 0)} DT
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminReportsManager;
