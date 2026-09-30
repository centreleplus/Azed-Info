import React from 'react';
import GestionDocuments from './GestionDocuments';
import { BulkAccessHeaderButton } from './BulkAccessHeaderButton';

export { BulkAccessHeaderButton };

export const GestionDocsAdmin: React.FC<any> = (props) => {
  return <GestionDocuments {...props} />;
};

export default GestionDocsAdmin;
