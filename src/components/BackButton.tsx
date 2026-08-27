import React from 'react';
import { CircleBackButton, CircleBackButtonProps } from './CircleBackButton';

export interface BackButtonProps extends CircleBackButtonProps {}

export const BackButton: React.FC<BackButtonProps> = (props) => {
  return <CircleBackButton {...props} />;
};

export { CircleBackButton };
export default BackButton;
