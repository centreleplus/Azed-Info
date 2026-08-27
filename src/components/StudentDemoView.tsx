import React from 'react';
import { StudentDemos } from './StudentDemos';

interface StudentDemoViewProps {
  onGoToShop?: () => void;
  onGoToCourse?: () => void;
  isPremiumUser?: boolean;
}

export const StudentDemoView: React.FC<StudentDemoViewProps> = (props) => {
  return <StudentDemos {...props} />;
};

export default StudentDemoView;
