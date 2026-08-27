import React from 'react';
import CalendrierView from './CalendrierView';

export interface AdminCalendarProps {
  isPremiumUser?: boolean;
  userId?: string;
  userRole?: string;
}

export const AdminCalendar: React.FC<AdminCalendarProps> = ({
  isPremiumUser = true,
  userId,
  userRole = 'admin'
}) => {
  return (
    <CalendrierView 
      isPremiumUser={isPremiumUser} 
      userId={userId} 
      userRole={userRole} 
    />
  );
};

export default AdminCalendar;
