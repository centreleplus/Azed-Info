import React from "react";
import { FileText, Eye, Edit, Trash2, ExternalLink } from "lucide-react";
import { getGlobalActionButtonText } from "../lib/buttonUtils";
import { PublicationDocument } from "../types";
import { DocumentManagementCard, getCategoryStyle, getCategoryDisplayName } from "./DocumentManagementCard";

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
    <div 
      className={`student-card-bg rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden relative ${className}`}
      style={{
        backgroundImage: "url('/hexagon-pattern.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="p-5 bg-white/30 backdrop-blur-[1px] dark:bg-slate-900/40 h-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-center text-xs text-gray-500 mb-2">
            <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest text-[10px]">
              {item.module || item.type || "Document"}
            </span>
            {item.isPremium && (
              <span className="text-[9px] font-bold text-red-700 bg-red-100/90 px-2 py-0.5 rounded">
                Premium
              </span>
            )}
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white text-sm leading-snug">{item.title}</h3>
          {item.description && (
            <p className="text-xs text-slate-700 dark:text-slate-200 font-medium mt-2 line-clamp-2 leading-relaxed">
              {item.description}
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-slate-200/60 mt-4 flex items-center justify-between">
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
    </div>
  );
};

export { DocumentManagementCard, getCategoryStyle, getCategoryDisplayName };
export const ExerciseCard = DocumentCard;
export const HomeworkCard = DocumentCard;
export const ContentRenderer = DocumentCard;

export default DocumentCard;
