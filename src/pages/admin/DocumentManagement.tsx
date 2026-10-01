import React from 'react';
import { GestionDocuments } from '../../components/GestionDocuments';

export interface DocumentManagementProps {
  onNavigateToCreate?: () => void;
  onEditDocument?: (doc: any) => void;
}

export const DocumentManagement: React.FC<DocumentManagementProps> = (props) => {
  return <GestionDocuments {...props} />;
};

export default DocumentManagement;
