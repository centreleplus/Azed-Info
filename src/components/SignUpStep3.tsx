import React from 'react';
import { SignUpStep3Grid } from './SignUpStep3Grid';
import { CampaignPack, getStoredCampaigns } from './campaignsStore';

export interface SignUpStep3Props {
  packs?: CampaignPack[] | any[];
  onSelectPack: (p: CampaignPack | any) => void;
  onBack: () => void;
  grade?: string;
  section?: string;
}

export const SignUpStep3: React.FC<SignUpStep3Props> = ({ 
  onSelectPack, 
  onBack,
  grade,
  section
}) => {
  return <SignUpStep3Grid onSelectPack={onSelectPack} onBack={onBack} grade={grade} section={section} />;
};

export { SignUpStep3Grid };
export default SignUpStep3;
