import React from 'react';
import { LoginPage, LoginPageProps } from './LoginPage';

export interface LoginProps extends LoginPageProps {}

export const Login: React.FC<LoginProps> = (props) => {
  return <LoginPage {...props} />;
};

export default Login;
