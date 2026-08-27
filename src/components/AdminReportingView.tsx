import React from 'react';
import { User, AuditLogItem } from '../types';
import { AdminReportsManager, SaleReportRow, AgentReportRow } from './AdminReportsManager';
import { StatsReportsView } from './StatsReportsView';

export interface SalesReportRow {
  lastName: string;
  firstName: string;
  city?: string;
  schoolName?: string;
  packCategory: string;
  amount: number;
  status: string;
  [key: string]: any;
}

export interface AgentsReportRow {
  lastName: string;
  firstName: string;
  acceptedCount: number;
  suspendedCount: number;
  [key: string]: any;
}

export interface AdminReportingViewProps {
  users?: User[];
  auditLogs?: AuditLogItem[];
  agentsData?: AgentsReportRow[];
  salesData?: SalesReportRow[];
}

export const AdminReportingView: React.FC<AdminReportingViewProps> = ({
  users = [],
  auditLogs = [],
  agentsData,
  salesData
}) => {
  return (
    <AdminReportsManager
      users={users}
      auditLogs={auditLogs}
      initialSalesData={salesData as any}
      initialAgentsData={agentsData as any}
    />
  );
};

export { AdminReportsManager, StatsReportsView };
export type { SaleReportRow as SalesReport, AgentReportRow as AgentReport };
export default AdminReportingView;

