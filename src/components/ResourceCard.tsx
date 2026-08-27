import React from "react";
import { Lock, FileText, Code, BookOpen, Video } from "lucide-react";
import { ExerciseItem } from "./ExerciceDetailModal";

interface ResourceCardProps {
  key?: string;
  item: ExerciseItem;
  onOpenDetails: (item: ExerciseItem) => void;
  onOpenResource: (item: ExerciseItem) => void;
  isPremiumUser?: boolean;
  userRole?: string;
  onGoToShop?: () => void;
}

export default function ResourceCard({
  item,
  onOpenDetails,
  onOpenResource,
  isPremiumUser = false,
  userRole = "student",
  onGoToShop
}: ResourceCardProps) {
  const fileName = item.filename || item.attachmentName || "";
  const fileUrl = item.fileUrl || item.videoUrl || "";
  const fileType = item.fileType || "";

  const isImageFile =
    fileName.toLowerCase().endsWith(".png") ||
    fileName.toLowerCase().endsWith(".jpg") ||
    fileName.toLowerCase().endsWith(".jpeg") ||
    fileUrl.toLowerCase().endsWith(".png") ||
    fileUrl.toLowerCase().endsWith(".jpg") ||
    fileUrl.toLowerCase().endsWith(".jpeg") ||
    ["png", "jpg", "jpeg"].includes(fileType.toLowerCase());

  const isPythonFile =
    fileName.toLowerCase().endsWith(".py") ||
    fileUrl.toLowerCase().endsWith(".py") ||
    fileType === "py";

  const isTxtFile =
    fileName.toLowerCase().endsWith(".txt") ||
    fileUrl.toLowerCase().endsWith(".txt") ||
    fileType === "txt";

  const isMp4File =
    fileName.toLowerCase().endsWith(".mp4") ||
    fileUrl.toLowerCase().endsWith(".mp4") ||
    fileType === "mp4" ||
    fileType === "video";

  const isPdfFile =
    fileName.toLowerCase().endsWith(".pdf") ||
    fileUrl.toLowerCase().endsWith(".pdf") ||
    fileType === "pdf" ||
    (!isPythonFile && !isTxtFile && !isMp4File && (fileName.length === 0 || fileName.toLowerCase().endsWith(".pdf")));

  return (
    <div
      className={`p-5 rounded-2xl border transition-all hover:shadow-sm duration-150 bg-white ${
        item.type === "Devoir de Synthèse"
          ? "border-indigo-100 hover:border-indigo-300"
          : item.type === "Devoir de Contrôle"
          ? "border-emerald-100 hover:border-emerald-300"
          : "border-amber-100 hover:border-amber-300"
      }`}
    >
      <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.type && (
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                item.type === "Devoir de Synthèse"
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-100"
                  : item.type === "Devoir de Contrôle"
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                  : "bg-amber-50 text-amber-700 border border-amber-100"
              }`}
            >
              {item.type}
            </span>
          )}

          {isPythonFile && (
            <span className="text-[9px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Code size={10} />
              <span>PYTHON (.py)</span>
            </span>
          )}

          {isTxtFile && (
            <span className="text-[9px] font-bold bg-blue-50 text-blue-700 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <FileText size={10} />
              <span>TEXTE (.txt)</span>
            </span>
          )}

          {isMp4File && (
            <span className="text-[9px] font-bold bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Video size={10} />
              <span>VIDÉO (.mp4)</span>
            </span>
          )}

          {item.isPremium && (
            <span className="text-[9px] font-black bg-amber-500 text-white px-2 py-0.5 rounded-full flex items-center gap-0.5 shadow-xs">
              <Lock size={8} />
              <span>PREMIUM</span>
            </span>
          )}
        </div>
      </div>

      <h3 className="font-bold text-gray-900 text-xs mt-2.5 line-clamp-2 leading-tight">
        {item.title}
      </h3>

      {item.description && (
        <p className="text-[11px] text-gray-500 mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}

      {/* Footer bar with metadata & action buttons */}
      <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
        <div className="text-[10px] text-gray-400">
          {(item.volume || (item.questionsCount !== undefined && item.questionsCount > 0)) ? (
            <span>
              <strong className="font-bold text-[#0F1E36]">
                {item.volume || `${item.questionsCount} parties`}
              </strong>
            </span>
          ) : (
            <span className="italic">Ressource A-Zed Info</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenDetails(item)}
            className="px-2.5 py-1 text-[10px] font-bold text-gray-600 hover:text-gray-950 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            Détails
          </button>

          {item.isPremium && !isPremiumUser && userRole === "student" ? (
            <button
              onClick={() => {
                if (onGoToShop) {
                  onGoToShop();
                } else {
                  alert("Abonnez-vous à la formule Premium pour accéder à cette ressource.");
                }
              }}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-[10px] font-bold flex items-center gap-1 cursor-pointer transition-all shadow-xs"
            >
              <Lock size={10} />
              <span>Débloquer</span>
            </button>
          ) : (
            <button
              onClick={() => {
                if (isImageFile || isPythonFile || isTxtFile || isMp4File) {
                  window.dispatchEvent(new CustomEvent("open-document-viewer", { detail: { ...item, fileType: isImageFile ? "png" : isMp4File ? "video" : isPythonFile ? "py" : "txt" } }));
                  window.location.hash = `#/student/viewer/${item.id}`;
                } else {
                  onOpenResource(item);
                }
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-bold text-white flex items-center gap-1 cursor-pointer transition-all transform active:scale-95 duration-100 ${
                isMp4File
                  ? "bg-purple-600 hover:bg-purple-700"
                  : isPythonFile
                  ? "bg-emerald-600 hover:bg-emerald-700"
                  : isTxtFile
                  ? "bg-blue-600 hover:bg-blue-700"
                  : item.type === "Devoir de Synthèse"
                  ? "bg-indigo-600 hover:bg-indigo-700"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {isMp4File ? (
                <>
                  <Video size={11} />
                  <span>Visionner (.mp4)</span>
                </>
              ) : isPythonFile ? (
                <>
                  <Code size={11} />
                  <span>Exécuter (.py)</span>
                </>
              ) : isTxtFile ? (
                <>
                  <FileText size={11} />
                  <span>Lire (.txt)</span>
                </>
              ) : isPdfFile ? (
                <>
                  <BookOpen size={11} />
                  <span>Consulter</span>
                </>
              ) : (
                <>
                  <FileText size={11} />
                  <span>Consulter</span>
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
