import React from "react";
import PythonViewerPage from "./PythonViewerPage";

interface PythonCodeViewerProps {
  title: string;
  filename?: string;
  code: string;
  onClose: () => void;
  isPremium?: boolean;
}

export default function PythonCodeViewer({
  title,
  filename = "exercice.py",
  code,
  onClose,
  isPremium
}: PythonCodeViewerProps) {
  return (
    <div className="fixed inset-0 z-[100] bg-slate-50 overflow-y-auto">
      <PythonViewerPage
        exercise={{
          id: "preview-code",
          title,
          filename,
          solutionCode: code,
          fileType: "py",
          isPremium
        }}
        onBack={onClose}
      />
    </div>
  );
}
