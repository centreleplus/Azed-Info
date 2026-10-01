import React from 'react';
import { UniversalBadge } from '../UniversalBadge';
import { getHighestPack } from '../../constants/packages';
import { StudentSidebar, StudentSidebarProps } from '../StudentSidebar';

export interface LayoutSidebarProps extends StudentSidebarProps {
  currentUser?: any;
  logoUrl?: string;
  brandName?: string;
}

export const Sidebar: React.FC<LayoutSidebarProps> = (props) => {
  const { currentUser, logoUrl, brandName = "A-Zed Sciences", ...rest } = props;
  const activePack = currentUser 
    ? getHighestPack(currentUser.activePackages || [currentUser.status, currentUser.userCategory, currentUser.tier, currentUser.badgeLabel])
    : props.activePack || "Freemium";

  return (
    <StudentSidebar 
      {...rest} 
      activePack={activePack}
      studentName={currentUser?.fullName || props.studentName}
    />
  );
};

export default Sidebar;
