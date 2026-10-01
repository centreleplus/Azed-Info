import React from 'react';
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
  return (
    <ProfileView
      currentUser={props.currentUser}
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
  );
};

export default StudentProfilePage;
