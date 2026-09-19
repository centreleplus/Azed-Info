import React from 'react';
import RegisterMultiStep from './RegisterMultiStep';
import { Language } from '../lib/translations';

export interface SignupProps {
  onSuccess?: () => void;
  onBackToLogin?: () => void;
  onBackToLanding?: () => void;
  currentLanguage?: Language;
}

export const Signup: React.FC<SignupProps> = ({
  onSuccess = () => {},
  onBackToLogin = () => {
    window.location.href = '/';
  },
  onBackToLanding = () => {
    window.location.href = '/';
  },
  currentLanguage = 'fr' as Language
}) => {
  return (
    <RegisterMultiStep
      onSuccess={onSuccess}
      onBackToLogin={onBackToLogin}
      onBackToLanding={onBackToLanding}
      currentLanguage={currentLanguage}
    />
  );
};

export default Signup;
