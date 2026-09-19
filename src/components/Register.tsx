import React from 'react';
import Signup, { SignupProps } from './Signup';

export interface RegisterProps extends SignupProps {}

export const Register: React.FC<RegisterProps> = (props) => {
  return <Signup {...props} />;
};

export default Register;
