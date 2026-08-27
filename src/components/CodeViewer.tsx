import React from "react";
import { DocumentViewer } from "./DocumentViewer";
import { ExerciseItem } from "./ExerciceDetailModal";

export interface CodeViewerProps {
  documentCode?: string;
  code?: string;
  title?: string;
  filename?: string;
  onBack?: () => void;
  onClose?: () => void;
  exercise?: ExerciseItem | null;
  isPremium?: boolean;
}

export const CodeViewer: React.FC<CodeViewerProps> = ({
  documentCode,
  code,
  title = "Code Source Python",
  filename = "exercice.py",
  onBack,
  onClose,
  exercise,
  isPremium
}) => {
  const content = documentCode || code || exercise?.solutionCode || exercise?.textContent || "";
  const handleBack = onBack || onClose;

  if (exercise || (!onClose && onBack)) {
    return (
      <DocumentViewer
        exercise={
          exercise || {
            id: "code-view",
            title,
            filename,
            solutionCode: content,
            fileType: "py",
            isPremium
          }
        }
        onBack={handleBack}
      />
    );
  }

  return (
    <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto">
      <pre className="font-mono text-xs text-slate-800 leading-relaxed">
        <code>
          {content}
        </code>
      </pre>
    </div>
  );
};

export default CodeViewer;
