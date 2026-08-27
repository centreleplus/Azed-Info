import React from 'react';
import CalendrierView from './CalendrierView';

export const CALENDAR_STATUS_STYLES = {
  en_cours: {
    label: "En cours",
    legendBadge: "bg-emerald-100 text-emerald-900 border-emerald-300 font-bold",
    legendDot: "bg-emerald-600",
    cardStyle: "bg-emerald-100 border-l-4 border-emerald-600 text-emerald-950 shadow-sm hover:bg-emerald-200"
  },
  prochainement: {
    label: "Prochainement",
    legendBadge: "bg-sky-100 text-sky-900 border-sky-300 font-bold",
    legendDot: "bg-sky-600",
    cardStyle: "bg-sky-100 border-l-4 border-sky-600 text-sky-950 shadow-sm hover:bg-sky-200"
  },
  termine: {
    label: "Terminé",
    legendBadge: "bg-rose-100 text-rose-900 border-rose-300 font-bold",
    legendDot: "bg-rose-600",
    cardStyle: "bg-rose-100 border-l-4 border-rose-600 text-rose-950 opacity-90 hover:bg-rose-200 shadow-sm"
  }
};

export interface StudentCalendarProps {
  isPremiumUser?: boolean;
  userId?: string;
  userRole?: string;
}

export const StudentCalendar: React.FC<StudentCalendarProps> = ({
  isPremiumUser = true,
  userId,
  userRole = 'student'
}) => {
  return (
    <CalendrierView 
      isPremiumUser={isPremiumUser} 
      userId={userId} 
      userRole={userRole} 
    />
  );
};

export default StudentCalendar;
