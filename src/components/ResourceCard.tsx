import React from "react";
import { Lock, FileText, Code, BookOpen, Video, Image as ImageIcon } from "lucide-react";
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
  const fileName = item.filename || item.attachmentName || item.title || "";
  const fileUrl = item.fileUrl || item.url || item.pdfUrl || item.downloadUrl || item.videoUrl || "";
  const rawFileType = (item.fileType || "").toLowerCase();

  // Extract clean file extension with strict PDF override if title/filename/url contains 'pdf'
  const isPdf =
    rawFileType === "pdf" ||
    fileName.toLowerCase().endsWith(".pdf") ||
    fileUrl.toLowerCase().endsWith(".pdf") ||
    (item.pdfUrl && item.pdfUrl.length > 0) ||
    item.title?.toLowerCase().includes("pdf") ||
    item.filename?.toLowerCase().includes("pdf") ||
    item.attachmentName?.toLowerCase().includes("pdf");

  const getCleanExt = (): string => {
    if (isPdf) return "pdf";
    if (rawFileType && rawFileType !== "course" && rawFileType !== "exercise") return rawFileType;
    const path = fileName || fileUrl;
    if (path.includes("youtube") || fileUrl.includes("youtube")) return "youtube";
    const clean = path.split('?')[0].split('#')[0];
    const parts = clean.split('.');
    if (parts.length > 1) {
      return parts.pop()!.toLowerCase();
    }
    return "txt";
  };

  const ext = getCleanExt();

  const isImage = ["png", "jpg", "jpeg", "webp"].includes(ext);
  const isPython = ext === "py";
  const isTxt = ext === "txt" && !isPdf;
  const isVideo = ext === "mp4" || ext === "youtube" || fileUrl.includes("youtube");

  const handleOpenViewer = () => {
    const docId = item.id || item._id;
    if (docId) {
      window.dispatchEvent(new CustomEvent("open-document-viewer", { 
        detail: { 
          ...item, 
          fileType: ext 
        } 
      }));
      window.location.hash = `#/student/viewer/${docId}`;
      return;
    }
    if (onOpenResource) {
      onOpenResource(item);
    } else {
      alert("Le fichier est temporairement indisponible.");
    }
  };

  const handleAction = () => {
    if (isPdf) {
      // OUVERTURE EXTERNE DIRECTE DANS UN NOUVEL ONGLET NATIVE BROWSER VIEWER
      const targetPdfUrl = fileUrl || item.pdfUrl || item.url || (item.id ? `/api/courses/pdf/${item.id}` : "");
      if (targetPdfUrl) {
        window.open(targetPdfUrl, '_blank', 'noopener,noreferrer');
      } else {
        console.error("URL du fichier PDF non disponible");
      }
    } else {
      // VISUALISATION INTERNE PROTÉGÉE POUR LES AUTRES FORMATS
      handleOpenViewer();
    }
  };

  return (
    <div
      className={`resource-card student-card-bg rounded-2xl border transition-all hover:shadow-md duration-200 overflow-hidden relative ${
        item.type === "Devoir de Synthèse"
          ? "border-indigo-200 hover:border-indigo-400"
          : item.type === "Devoir de Contrôle"
          ? "border-emerald-200 hover:border-emerald-400"
          : "border-amber-200 hover:border-amber-400"
      }`}
      style={{
        backgroundImage: "url('/hexagon-pattern.jpg')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat"
      }}
    >
      <div className="p-5 bg-white/30 backdrop-blur-[1px] dark:bg-slate-900/40 h-full w-full flex flex-col justify-between">
        <div>
          <div className="flex justify-between items-start gap-2">
        <div className="flex items-center gap-1.5 flex-wrap">
          {item.type && (
            <span
              className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                item.type === "Devoir de Synthèse"
                  ? "bg-indigo-100/90 text-indigo-800 border border-indigo-200"
                  : item.type === "Devoir de Contrôle"
                  ? "bg-emerald-100/90 text-emerald-800 border border-emerald-200"
                  : "bg-amber-100/90 text-amber-800 border border-amber-200"
              }`}
            >
              {item.type}
            </span>
          )}

          {isPython && (
            <span className="text-[9px] font-bold bg-emerald-100/90 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Code size={10} />
              <span>PYTHON (.py)</span>
            </span>
          )}

          {isTxt && (
            <span className="text-[9px] font-bold bg-blue-100/90 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <FileText size={10} />
              <span>TEXTE (.txt)</span>
            </span>
          )}

          {isVideo && (
            <span className="text-[9px] font-bold bg-purple-100/90 text-purple-800 border border-purple-200 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Video size={10} />
              <span>VIDÉO ({ext.toUpperCase()})</span>
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

      <h3 className="font-bold text-gray-900 dark:text-white text-xs mt-2.5 line-clamp-2 leading-tight">
        {item.title}
      </h3>

      {item.description && (
        <p className="text-[11px] text-gray-700 dark:text-gray-200 font-medium mt-1 line-clamp-2 leading-relaxed">
          {item.description}
        </p>
      )}
        </div>

      {/* Footer bar with metadata & action buttons */}
      <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between gap-2">
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
          ) : isPdf ? (
            <button
              onClick={handleAction}
              className="bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            >
              <BookOpen size={11} />
              <span>Consulter</span>
            </button>
          ) : (
            <button
              onClick={handleAction}
              className="bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold px-3.5 py-1.5 rounded-xl transition flex items-center gap-1 cursor-pointer shadow-xs active:scale-95"
            >
              {isVideo ? (
                <Video size={11} />
              ) : isPython ? (
                <Code size={11} />
              ) : isImage ? (
                <ImageIcon size={11} />
              ) : (
                <FileText size={11} />
              )}
              <span>Afficher (.{ext})</span>
            </button>
          )}
        </div>
      </div>
    </div>
    </div>
  );
}
