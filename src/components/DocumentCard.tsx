import React from "react";
import { FileText, Eye, Edit, Trash2, ExternalLink } from "lucide-react";
import { getGlobalActionButtonText } from "../lib/buttonUtils";
import { PublicationDocument } from "../types";
import { DocumentManagementCard } from "./DocumentManagementCard";

export interface DocumentCardItem {
  id: string;
  title: string;
  module?: string;
  type?: string;
  fileType?: string;
  format?: string;
  filename?: string;
  description?: string;
  isPremium?: boolean;
  [key: string]: any;
}

export interface DocumentCardProps {
  item?: DocumentCardItem;
  doc?: PublicationDocument;
  onOpen?: (item: DocumentCardItem) => void;
  onEdit?: (doc: PublicationDocument) => void;
  onDelete?: (id: string) => void;
  className?: string;
}

export const DocumentCard: React.FC<DocumentCardProps> = (props) => {
  // If doc is passed (Document management mode from /admin/gestion-docs)
  if (props.doc) {
    return (
      <DocumentManagementCard
        doc={props.doc}
        onEdit={props.onEdit}
        onDelete={props.onDelete}
      />
    );
  }

  // Student document card mode
  const { item, onOpen, className = "" } = props;
  if (!item) return null;

  const handleOpenDocument = () => {
    if (onOpen) onOpen(item);
  };

  const fileType = item.fileType || item.format || (item.filename?.split(".").pop()) || "pdf";

  return (
    <div className={`bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${className}`}>
      <div>
        <div className="flex justify-between items-center text-xs text-gray-400 mb-2">
          <span className="font-semibold text-gray-500 uppercase tracking-widest text-[10px]">
            {item.module || item.type || "Document"}
          </span>
          {item.isPremium && (
            <span className="text-[9px] font-semibold text-red-600 bg-red-50 px-2 py-0.5 rounded">
              Premium
            </span>
          )}
        </div>
        <h3 className="font-bold text-slate-800 text-sm leading-snug">{item.title}</h3>
        {item.description && (
          <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
        <span className="text-[11px] font-mono text-slate-400">
          {item.filename || `${fileType.toUpperCase()}`}
        </span>
        <button
          onClick={handleOpenDocument}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center gap-2 transition-all shadow-sm cursor-pointer"
        >
          <FileText className="w-3.5 h-3.5" />
          <span>{getGlobalActionButtonText(fileType)}</span>
        </button>
      </div>
    </div>
  );
};

export { DocumentManagementCard };
export const ExerciseCard = DocumentCard;
export const HomeworkCard = DocumentCard;
export const ContentRenderer = DocumentCard;

export default DocumentCard;
