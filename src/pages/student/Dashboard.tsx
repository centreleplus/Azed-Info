import React from 'react';
import { StudentDashboard, StudentDashboardProps } from '../../components/StudentDashboard';

export const StudentDashboardPage: React.FC<StudentDashboardProps> = (props) => {
  return <StudentDashboard {...props} />;
};

export default StudentDashboardPage;
