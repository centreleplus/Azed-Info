import React, { useState, useMemo } from 'react';
import { 
  BarChart3, 
  Download, 
  Search, 
  Filter, 
  TrendingUp, 
  Users, 
  CreditCard,
  FileSpreadsheet
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { ALL_SECTIONS_OPTIONS } from '../constants/academic';
import { User, AuditLogItem } from '../types';
import { AdminReportsManager } from './AdminReportsManager';

export interface AdminReportsProps {
  users?: User[];
  auditLogs?: AuditLogItem[];
}

export const AdminReports: React.FC<AdminReportsProps> = ({
  users = [],
  auditLogs = []
}) => {
  const [selectedBranch, setSelectedBranch] = useState('Tous');

  return (
    <div className="space-y-6 text-left">
      {/* Branch Selector Quick Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs flex items-center gap-2 overflow-x-auto">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Filter size={11} /> Filière :
        </span>
        {ALL_SECTIONS_OPTIONS.map((sec) => {
          const isSelected = selectedBranch === sec;
          return (
            <button
              key={sec}
              onClick={() => setSelectedBranch(sec)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                isSelected
                  ? 'bg-emerald-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {sec}
            </button>
          );
        })}
      </div>

      {/* Main Reports Manager */}
      <AdminReportsManager users={users} auditLogs={auditLogs} />
    </div>
  );
};

export default AdminReports;
