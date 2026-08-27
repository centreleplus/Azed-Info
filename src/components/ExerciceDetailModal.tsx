import React, { useState } from "react";
import { X, Lock, BookOpen, Code, FileText, Clock, Image as ImageIcon } from "lucide-react";
import PythonCodeViewer from "./PythonCodeViewer";

export interface ExerciseItem {
  id: string;
  title: string;
  type?: string;
  trimestre?: string;
  grade?: string;
  duration?: string;
  filename?: string;
  attachmentName?: string;
  fileUrl?: string;
  videoUrl?: string;
  fileType?: "pdf" | "py" | "mp4" | "txt" | string;
  description?: string;
  textContent?: string;
  solutionCode?: string;
  volume?: string;
  questionsCount?: number;
  isPremium?: boolean;
}

interface ExerciceDetailModalProps {
  exercise: ExerciseItem;
  onClose: () => void;
  isPremiumUser?: boolean;
  userRole?: string;
  onGoToShop?: () => void;
}

export default function ExerciceDetailModal({
  exercise,
  onClose,
  isPremiumUser = false,
  userRole = "student",
  onGoToShop
}: ExerciceDetailModalProps) {
  const [showPythonViewer, setShowPythonViewer] = useState(false);

  const fileName = exercise.filename || exercise.attachmentName || "";
  const fileUrl = exercise.fileUrl || exercise.videoUrl || "";
  const fileType = exercise.fileType || "";

  const isPythonFile =
    fileName.toLowerCase().endsWith(".py") ||
    fileUrl.toLowerCase().endsWith(".py") ||
    fileType === "py";

  const isTxtFile =
    fileName.toLowerCase().endsWith(".txt") ||
    fileUrl.toLowerCase().endsWith(".txt") ||
    fileType === "txt";

  const isImageFile =
    fileName.toLowerCase().endsWith(".png") ||
    fileName.toLowerCase().endsWith(".jpg") ||
    fileName.toLowerCase().endsWith(".jpeg") ||
    fileUrl.toLowerCase().endsWith(".png") ||
    fileUrl.toLowerCase().endsWith(".jpg") ||
    fileUrl.toLowerCase().endsWith(".jpeg") ||
    ["png", "jpg", "jpeg"].includes(fileType.toLowerCase());

  const imageExt = ["png", "jpg", "jpeg"].find(ext => 
    fileName.toLowerCase().endsWith("." + ext) || 
    fileUrl.toLowerCase().endsWith("." + ext) || 
    fileType.toLowerCase() === ext
  ) || "png";

  const isPdfFile =
    fileName.toLowerCase().endsWith(".pdf") ||
    fileUrl.toLowerCase().endsWith(".pdf") ||
    fileType === "pdf" ||
    (!isPythonFile && !isTxtFile && !isImageFile && (fileName.length === 0 || fileName.toLowerCase().endsWith(".pdf")));

  const handleOpenResource = () => {
    if (isPythonFile || isTxtFile || isImageFile) {
      window.dispatchEvent(new CustomEvent("open-document-viewer", { detail: { ...exercise, fileType: isImageFile ? imageExt : isPythonFile ? "py" : "txt" } }));
      if (isPythonFile) {
        window.dispatchEvent(new CustomEvent("open-python-code-viewer", { detail: exercise }));
      } else if (isTxtFile) {
        window.dispatchEvent(new CustomEvent("open-txt-document-viewer", { detail: exercise }));
      }
      window.location.hash = `#/student/viewer/${exercise.id}`;
      onClose();
    } else {
      // Open PDF in a new window/tab via the API proxy route
      const targetPdfUrl = fileUrl && fileUrl.startsWith("/uploads/") 
        ? fileUrl 
        : `/api/courses/pdf/${exercise.id}`;
      window.open(targetPdfUrl, "_blank");
    }
  };

  if (showPythonViewer) {
    return (
      <PythonCodeViewer
        title={exercise.title}
        filename={fileName || "exercice.py"}
        code={exercise.solutionCode || exercise.textContent || ""}
        onClose={() => {
          setShowPythonViewer(false);
          onClose();
        }}
        isPremium={exercise.isPremium}
      />
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
      <div className="bg-white border text-left border-gray-200 rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-fade-in p-6 space-y-4">
        
        {/* Header */}
        <div className="flex justify-between items-start gap-2">
          <div>
            {exercise.type && (
              <span className="text-[9px] font-bold text-[#2563EB] bg-blue-50 px-2 py-0.5 rounded-full uppercase tracking-wider">
                {exercise.type}
              </span>
            )}
            <h3 className="text-sm font-extrabold text-[#0F1E36] mt-1">{exercise.title}</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer text-gray-400"
          >
            <X size={16} />
          </button>
        </div>

        {/* Premium Lock Guard */}
        {exercise.isPremium && !isPremiumUser && userRole === "student" ? (
          <div className="bg-amber-50 border border-amber-200 p-5 rounded-2xl text-center space-y-4 pt-6">
            <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mx-auto text-amber-500 animate-pulse">
              <Lock size={20} />
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                Ressource Pédagogique Premium ⭐
              </h4>
              <p className="text-[11px] text-gray-500 leading-relaxed">
                Ce contenu d'apprentissage complet avec correction et code source est exclusivement réservé aux abonnés Premium.
              </p>
            </div>
            <div className="pt-2 flex gap-2">
              <button
                onClick={onClose}
                className="flex-1 py-2 border border-gray-200 hover:bg-slate-50 rounded-xl text-[11px] font-bold text-gray-500 transition-colors cursor-pointer"
              >
                Fermer
              </button>
              <button
                onClick={() => {
                  onClose();
                  onGoToShop?.();
                }}
                className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[11px] font-bold cursor-pointer transition-all shadow-xs"
              >
                Devenir Premium
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Conditional Metadata Information - NO hardcoded values */}
            <div className="space-y-3 pt-2 text-[#4b5563]">
              {(exercise.trimestre || exercise.volume || exercise.questionsCount || exercise.duration) && (
                <div className="text-xs bg-slate-50 p-2.5 rounded-xl border border-gray-100 space-y-1.5 font-medium">
                  {exercise.trimestre && (
                    <p className="flex items-center gap-1.5">
                      <span>⏰</span>
                      <span className="font-bold text-[#0F1E36]">Trimestre :</span>
                      <span>{exercise.trimestre}</span>
                    </p>
                  )}
                  {(exercise.volume || (exercise.questionsCount !== undefined && exercise.questionsCount > 0)) && (
                    <p className="flex items-center gap-1.5">
                      <span>📊</span>
                      <span className="font-bold text-[#0F1E36]">Volume :</span>
                      <span>
                        {exercise.volume ? exercise.volume : `${exercise.questionsCount} Parties théoriques / pratiques`}
                      </span>
                    </p>
                  )}
                  {exercise.duration && (
                    <p className="flex items-center gap-1.5">
                      <Clock size={12} className="text-gray-500" />
                      <span className="font-bold text-[#0F1E36]">Durée estimée :</span>
                      <span>{exercise.duration}</span>
                    </p>
                  )}
                </div>
              )}

              {/* Description / Summary */}
              {exercise.description && (
                <div className="text-[11px] leading-relaxed text-gray-500 font-normal">
                  <span className="font-bold text-gray-800 text-xs block mb-1">Résumé pédagogique :</span>
                  <p>{exercise.description}</p>
                </div>
              )}

              {/* Filename if provided */}
              {fileName && (
                <div className="text-[10px] text-gray-400">
                  📁 Fichier associé : <span className="font-mono text-gray-600 font-bold">{fileName}</span>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 border-t border-gray-150 flex justify-end gap-2.5">
              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-gray-500 transition-colors cursor-pointer"
              >
                Retour
              </button>

              <button
                onClick={handleOpenResource}
                className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all transform active:scale-95 duration-100 shadow-sm"
              >
                {isImageFile ? (
                  <>
                    <ImageIcon size={14} />
                    <span>Afficher (.{imageExt})</span>
                  </>
                ) : isPythonFile ? (
                  <>
                    <Code size={14} />
                    <span>💻 Exécuter (.py)</span>
                  </>
                ) : isTxtFile ? (
                  <>
                    <FileText size={14} />
                    <span>📝 Lire (.txt)</span>
                  </>
                ) : isPdfFile ? (
                  <>
                    <BookOpen size={14} />
                    <span>📄 Consulter</span>
                  </>
                ) : (
                  <>
                    <FileText size={14} />
                    <span>📁 Consulter</span>
                  </>
                )}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
