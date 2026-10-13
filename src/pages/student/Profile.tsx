import React, { useContext } from 'react';
import { UserContext } from '../../components/AuthContext';
import ProfileView from '../../components/ProfileView';
import { BadgePill } from '../../components/BadgePill';
import { useUserBadge } from '../../hooks/useUserBadge';

export interface StudentProfilePageProps {
  currentUser: any;
  setCurrentUser: any;
  onAdminActionRefetch?: () => void;
  allUsersList?: any[];
  scrollTopPosition?: any;
  onScrollTopPositionChange?: any;
  scrollTopIcon?: any;
  onScrollTopIconChange?: any;
  hideScrollTopOnMobile?: boolean;
  onHideScrollTopOnMobileChange?: any;
}

export const StudentProfilePage: React.FC<StudentProfilePageProps> = (props) => {
  const context = useContext(UserContext);
  const syncedBadge = useUserBadge();
  const user = context?.user || props.currentUser;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700">
        <div className="flex items-center gap-2">
          <span>Statut du compte :</span>
          <BadgePill badge={syncedBadge || user?.badge || 'FREEMIUM'} />
        </div>
      </div>
      <ProfileView
        currentUser={user || props.currentUser}
        setCurrentUser={props.setCurrentUser}
        onAdminActionRefetch={props.onAdminActionRefetch || (() => {})}
        allUsersList={props.allUsersList || []}
        scrollTopPosition={props.scrollTopPosition || 'bottom-right'}
        onScrollTopPositionChange={props.onScrollTopPositionChange || (() => {})}
        scrollTopIcon={props.scrollTopIcon || 'arrow'}
        onScrollTopIconChange={props.onScrollTopIconChange || (() => {})}
        hideScrollTopOnMobile={props.hideScrollTopOnMobile ?? false}
        onHideScrollTopOnMobileChange={props.onHideScrollTopOnMobileChange || (() => {})}
      />
    </div>
  );
};

export default StudentProfilePage;
