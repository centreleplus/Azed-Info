import React from "react";
import { DocumentManagementCard, DocumentManagementCardProps } from "../DocumentManagementCard";

export const DocumentCard: React.FC<DocumentManagementCardProps> = (props) => {
  return <DocumentManagementCard {...props} />;
};

export default DocumentCard;
