import React from 'react';
import { AdminReportsManager } from './AdminReportsManager';
import { StatsReportsView } from './StatsReportsView';

export const ReportsAndStatsView: React.FC = () => {
  return <AdminReportsManager />;
};

export { AdminReportsManager, StatsReportsView };
export default ReportsAndStatsView;
