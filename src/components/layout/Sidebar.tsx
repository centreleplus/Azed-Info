import React, { useContext } from 'react';
import { UserContext } from '../AuthContext';
import { StudentSidebar, StudentSidebarProps } from '../StudentSidebar';

export interface LayoutSidebarProps extends StudentSidebarProps {
  currentUser?: any;
  logoUrl?: string;
  brandName?: string;
}

export const Sidebar: React.FC<LayoutSidebarProps> = (props) => {
  const context = useContext(UserContext);
  const contextUser = context?.user;
  const user = props.currentUser || contextUser;
  const activeBadge = user?.badge || props.activePack || "FREEMIUM";

  return (
    <StudentSidebar 
      {...props} 
      activePack={activeBadge}
      studentName={user?.fullName || props.studentName}
    />
  );
};

export default Sidebar;
