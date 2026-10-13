import React, { useContext } from 'react';
import { UserContext } from '../../components/AuthContext';
import ProfileView from '../../components/ProfileView';

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
  const user = context?.user || props.currentUser;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-50 border border-slate-200 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700">
        <div>Statut du compte : <span className="font-extrabold text-blue-700 uppercase tracking-wide">{user?.badge || 'FREEMIUM'}</span></div>
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
