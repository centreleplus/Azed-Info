import React, { useEffect, useState } from "react";
import { ShieldCheck, FileText, Code, BookOpen, Lock, Video, Image as ImageIcon, Sparkles, ArrowRight, ShieldAlert, ChevronRight } from "lucide-react";
import { extractYouTubeId, getYouTubeEmbedUrl } from "../lib/youtube";
import { ExerciseItem } from "./ExerciceDetailModal";
import BackButton from "./BackButton";
import { isDocumentAllowedForStudent, getStudentActiveTier } from "../utils/documentAccess";

export interface StudentViewerProps {
  exercise?: ExerciseItem | null;
  resourceId?: string;
  onBack?: () => void;
  isPremiumUser?: boolean;
  currentUser?: any;
  userPlan?: string;
  onRedirectToOffers?: () => void;
}

export type DocumentViewerProps = StudentViewerProps;

const getFileExtension = (filename: string = '') => {
  if (!filename) return '';
  const clean = filename.split('?')[0].split('#')[0];
  return clean.slice(((clean.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

export const StudentViewer: React.FC<StudentViewerProps> = ({
  exercise: initialExercise,
  resourceId,
  onBack,
  isPremiumUser = false,
  currentUser,
  userPlan,
  onRedirectToOffers
}) => {
  const [exercise, setExercise] = useState<ExerciseItem | null>(initialExercise || null);
  const [loading, setLoading] = useState<boolean>(!initialExercise && !!resourceId);
  const [redirectCountdown, setRedirectCountdown] = useState<number>(5);

  const effectiveUser = currentUser || (() => {
    try {
      const stored = localStorage.getItem("current_user") || sessionStorage.getItem("current_user");
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })() || {
    role: "student",
    subscriptionPlan: userPlan,
    accountType: isPremiumUser ? "premium" : "freemium"
  };

  // Gestion dynamique et universelle du bouton « Retour »
  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (typeof window !== "undefined" && window.history.length > 1) {
      window.history.back();
    } else {
      // Redirection de secours
      window.location.hash = "#/student/courses";
    }
  };

  const handleGoToOffers = () => {
    if (onRedirectToOffers) {
      onRedirectToOffers();
    } else {
      window.location.hash = "#/student/offers";
    }
  };

  // Fetch document content if resourceId was provided without exercise object
  useEffect(() => {
    if (!initialExercise && resourceId) {
      setLoading(true);
      fetch(`/api/courses/code/${resourceId}`)
        .then((res) => {
          if (!res.ok) throw new Error("Impossible de charger le document");
          return res.json();
        })
        .then((data) => {
          const fn = data.filename || data.attachmentName || `${resourceId}.txt`;
          const url = data.fileUrl || data.videoUrl || data.imageUrl || "";
          const ft = (data.fileType || "").toLowerCase();

          const fnExt = getFileExtension(fn);
          const urlExt = getFileExtension(url);
          const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(fnExt) || ['png', 'jpg', 'jpeg', 'webp'].includes(urlExt) || ['png', 'jpg', 'jpeg', 'webp'].includes(ft);
          const imgExt = ['png', 'jpg', 'jpeg', 'webp'].find(e => e === fnExt || e === urlExt || e === ft) || "png";

          setExercise({
            id: data.id || resourceId,
            title: data.title || "Document Pédagogique",
            filename: fn,
            textContent: data.code || data.content || data.textContent || "",
            solutionCode: data.code,
            videoUrl: url,
            fileUrl: url,
            isPremium: data.isPremium,
            targetAudience: data.targetAudience,
            targetTiers: data.targetTiers,
            allowedTiers: data.allowedTiers,
            fileType: data.fileType || (isImg ? imgExt : fn.endsWith(".mp4") ? "mp4" : fn.endsWith(".py") ? "py" : "txt")
          });
        })
        .catch(() => {
          // Fallback template
          const ext = getFileExtension(resourceId);
          const isImg = ['png', 'jpg', 'jpeg', 'webp'].includes(ext);
          const isPy = ext === "py" || resourceId.includes("py");
          const isVideo = ext === "mp4" || resourceId.includes("mp4");
          setExercise({
            id: resourceId,
            title: "Support Pédagogique d'Apprentissage",
            filename: isImg ? `image_document.${ext || 'png'}` : isVideo ? "cours_video.mp4" : isPy ? "solution_exercice.py" : "fiche_de_cours.txt",
            fileUrl: (resourceId.startsWith("/uploads/") || resourceId.startsWith("http")) ? resourceId : "",
            textContent: isPy 
              ? `# =========================================================\n# PLATEFORME A-ZED INFO - CODE SOURCE OFFICIEL (.py)\n# =========================================================\n\ndef solution_exercice():\n    """\n    Algorithme de résolution d'exercice A-Zed Info\n    """\n    print("Initialisation du traitement...")\n    data = [10, 20, 30, 40, 50]\n    res = [x * 2 for x in data if x > 15]\n    return res\n\nif __name__ == "__main__":\n    resultat = solution_exercice()\n    print("Résultat calculé :", resultat)\n`
              : `=========================================================\nPLATEFORME A-ZED INFO - FICHE PEDAGOGIQUE (.txt)\n=========================================================\n\n1. OBJECTIFS DU MODULE :\n- Assimiler les principes fondamentaux de l'algorithmique.\n- Maîtriser la structuration et la logique de programmation.\n- Appliquer les méthodes de résolution sur des cas pratiques.\n\n2. RAPPELS PÉDAGOGIQUES ET MÉTHODOLOGIE :\n- Lisez attentivement l'énoncé de chaque problème.\n- Identifiez la nature des variables d'entrée et de sortie.\n- Décomposez les traitements complexes en sous-problèmes.\n\n=========================================================\nDocument officiel protégé - A-Zed Info © Tout droit réservé.\n=========================================================`,
            fileType: isImg ? (ext || "png") : isVideo ? "mp4" : isPy ? "py" : "txt"
          });
        })
        .finally(() => setLoading(false));
    }
  }, [initialExercise, resourceId]);

  // Keyboard anti-copy protection (Ctrl+C, Ctrl+U, Ctrl+S, Ctrl+A, Ctrl+P, F12)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlOrCmd = e.ctrlKey || e.metaKey;
      const key = e.key.toLowerCase();

      if (
        (isCtrlOrCmd && ['c', 'u', 's', 'a', 'p', 'x'].includes(key)) ||
        e.key === 'F12' ||
        (isCtrlOrCmd && e.shiftKey && ['i', 'j', 'c'].includes(key))
      ) {
        e.preventDefault();
        e.stopPropagation();
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    return () => window.removeEventListener('keydown', handleKeyDown, true);
  }, []);

  const activeEx = exercise || initialExercise;
  const isAllowed = !activeEx || isDocumentAllowedForStudent(activeEx, effectiveUser);

  useEffect(() => {
    if (!loading && activeEx && !isAllowed) {
      const timer = setInterval(() => {
        setRedirectCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(timer);
            handleGoToOffers();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [loading, activeEx, isAllowed]);

  const fileName = activeEx?.filename || activeEx?.attachmentName || activeEx?.title || "document.txt";
  const title = activeEx?.title || "Document d'Apprentissage";
  const moduleName = activeEx?.module || activeEx?.type || "Général";
  const fileType = (activeEx?.fileType || "").toLowerCase();
  const fileUrl = activeEx?.fileUrl || activeEx?.videoUrl || activeEx?.pdfUrl || (resourceId && (resourceId.startsWith("/uploads/") || resourceId.startsWith("http")) ? resourceId : "");

  const nameExt = getFileExtension(fileName);
  const urlExt = getFileExtension(fileUrl);

  const isImage = ['png', 'jpg', 'jpeg', 'webp'].includes(nameExt) || ['png', 'jpg', 'jpeg', 'webp'].includes(urlExt) || ['png', 'jpg', 'jpeg', 'webp'].includes(fileType);
  const imageExt = (['png', 'jpg', 'jpeg', 'webp'].find(e => e === nameExt || e === urlExt || e === fileType) || 'png').toUpperCase();

  const isVideo = !isImage && (fileType === "video" || fileType === "mp4" || ['mp4', 'webm', 'mov'].includes(nameExt) || ['mp4', 'webm', 'mov'].includes(urlExt));
  const isPython = !isImage && !isVideo && (fileType === "py" || nameExt === "py" || urlExt === "py");

  const rawText = activeEx?.solutionCode || activeEx?.textContent || activeEx?.description || `Contenu du document en cours de chargement...`;

  const requiredAudiences = (activeEx?.targetAudience && activeEx.targetAudience.length > 0)
    ? activeEx.targetAudience
    : (activeEx?.targetTiers && activeEx.targetTiers.length > 0)
    ? activeEx.targetTiers
    : (activeEx?.allowedTiers && activeEx.allowedTiers.length > 0)
    ? activeEx.allowedTiers
    : (activeEx?.isPremium ? ["Premium", "Premium+", "Premium++"] : ["Tous les forfaits"]);

  const studentTier = getStudentActiveTier(effectiveUser);

  return (
    <div 
      className="w-full relative z-0 text-slate-800 select-none font-sans py-2"
      onContextMenu={(e) => e.preventDefault()}
      onCopy={(e) => e.preventDefault()}
      onCut={(e) => e.preventDefault()}
      style={{
        userSelect: 'none',
        WebkitUserSelect: 'none',
        MozUserSelect: 'none',
        msUserSelect: 'none',
      }}
    >
      {/* Subheader Toolbar & Mode Lecture Seule Banner with Safe Stacking Context */}
      <header className="bg-white border border-slate-200 rounded-2xl p-4 sm:px-6 shadow-xs relative z-10 flex flex-wrap items-center justify-between gap-4 mb-4">
        <div className="flex items-center gap-4 min-w-0">
          <BackButton onClick={handleBack} label="Retour" />

          <div className="h-6 w-px bg-slate-200 hidden sm:block shrink-0" />

          <div className="min-w-0">
            {/* Breadcrumb Navigation */}
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-1.5 text-[11px] sm:text-xs text-slate-500 mb-1.5 flex-wrap font-medium">
              <button
                type="button"
                onClick={() => { window.location.hash = "#/student/dashboard"; }}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                Espace Élève
              </button>
              <ChevronRight size={12} className="text-slate-400 shrink-0" />
              <button
                type="button"
                onClick={handleBack}
                className="hover:text-emerald-600 transition-colors cursor-pointer"
              >
                {isVideo ? "Démo & Extraits" : moduleName ? `Cours : ${moduleName}` : "Supports de Cours"}
              </button>
              <ChevronRight size={12} className="text-slate-400 shrink-0" />
              <span className="text-slate-800 font-bold truncate max-w-[180px] sm:max-w-[320px]">
                {title}
              </span>
            </nav>

            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1 text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                isImage
                  ? "bg-purple-50 text-purple-700 border border-purple-200"
                  : isVideo
                  ? "bg-indigo-50 text-indigo-700 border border-indigo-200"
                  : isPython 
                  ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  : "bg-blue-50 text-blue-700 border border-blue-200"
              }`}>
                {isImage ? <ImageIcon size={11} /> : isVideo ? <Video size={11} /> : isPython ? <Code size={11} /> : <FileText size={11} />}
                <span>{isImage ? `IMAGE (.${imageExt})` : isVideo ? "VIDÉO (.MP4)" : isPython ? "CODE PYTHON (.PY)" : "DOCUMENT (.TXT)"}</span>
              </span>

              {moduleName && (
                <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-600 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded-full truncate">
                  <BookOpen size={10} />
                  <span>Module : {moduleName}</span>
                </span>
              )}

              {activeEx?.isPremium && (
                <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  <Lock size={10} />
                  <span>PREMIUM</span>
                </span>
              )}
            </div>

            <h1 className="text-base sm:text-lg font-bold text-slate-900 mt-1 line-clamp-1">
              {title}
            </h1>
          </div>
        </div>

        {/* Protected Read-Only Badge */}
        <div className="flex items-center gap-2 text-amber-800 bg-amber-50 px-3.5 py-1.5 rounded-full border border-amber-200 text-xs font-semibold shrink-0">
          <ShieldCheck className="w-4 h-4 text-amber-600 shrink-0"/>
          <span>Mode Lecture Seule Protégé</span>
        </div>
      </header>

      {/* Main Container - Natural Page Scroll without Height Restrictions */}
      <main className="w-full max-w-5xl mx-auto">
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-xs p-12 text-center text-slate-500 space-y-3">
            <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-sm font-semibold">Chargement du document...</p>
          </div>
        ) : !isAllowed ? (
          /* ACCÈS RESTREINT - UPGRADE PROMPT BANNER & DIRECT URL PROTECTION */
          <div className="bg-white border-2 border-amber-300 rounded-3xl shadow-xl overflow-hidden p-8 sm:p-12 text-center max-w-2xl mx-auto my-6 space-y-6">
            <div className="w-20 h-20 bg-gradient-to-tr from-amber-100 to-amber-200 text-amber-700 rounded-3xl flex items-center justify-center mx-auto shadow-inner border border-amber-300">
              <ShieldAlert className="w-10 h-10 stroke-[2.2]" />
            </div>

            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-100/80 text-amber-900 rounded-full text-[11px] font-black uppercase tracking-wider">
                <Lock className="w-3 h-3" />
                <span>Ressource Réservée aux Abonnés</span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight">
                Accès non autorisé pour ce contenu
              </h2>
              <p className="text-sm text-slate-600 max-w-lg mx-auto leading-relaxed">
                Ce document pédagogique (<span className="font-bold text-slate-800">{title}</span>) nécessite un forfait spécifique.
              </p>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs space-y-2 max-w-md mx-auto text-left">
              <div className="flex justify-between items-center py-1 border-b border-slate-200/60">
                <span className="text-slate-500 font-semibold">Votre offre actuelle :</span>
                <span className="font-black px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-800 uppercase tracking-wider text-[10px]">
                  {studentTier}
                </span>
              </div>
              <div className="flex justify-between items-center py-1">
                <span className="text-slate-500 font-semibold">Offres autorisées :</span>
                <div className="flex flex-wrap gap-1 justify-end">
                  {requiredAudiences.map((aud) => (
                    <span key={aud} className="font-black px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 text-[10px]">
                      {aud}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={handleGoToOffers}
                className="w-full sm:w-auto px-6 py-3.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white rounded-xl text-xs font-black shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-emerald-200" />
                <span>Découvrir les Offres & Mettre à Niveau</span>
                <ArrowRight className="w-4 h-4" />
              </button>
              
              <button
                type="button"
                onClick={handleBack}
                className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Retourner aux documents
              </button>
            </div>

            <p className="text-[11px] text-slate-400 font-medium">
              Redirection automatique vers les offres dans <span className="font-black text-slate-700">{redirectCountdown}s</span>...
            </p>
          </div>
        ) : (
          <div 
            className="bg-white border border-slate-200 rounded-2xl shadow-xs overflow-hidden select-none"
            onContextMenu={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
            style={{
              userSelect: 'none',
              WebkitUserSelect: 'none',
              MozUserSelect: 'none',
              msUserSelect: 'none',
            }}
          >
            {/* Document Meta Subheader */}
            <div className="bg-slate-100/80 border-b border-slate-200 px-6 py-3 flex items-center justify-between text-xs font-mono text-slate-600">
              <span className="font-bold flex items-center gap-2 text-slate-800">
                <span className={`w-2.5 h-2.5 rounded-full ${isImage ? "bg-purple-500" : isVideo ? "bg-indigo-500" : isPython ? "bg-emerald-500" : "bg-blue-500"}`} />
                {fileName}
              </span>
              <span className="text-[11px] text-slate-400">
                A-Zed Info © Support d'apprentissage officiel
              </span>
            </div>

            {/* Document Body: Direct Image Tag, Video, Python, or Text */}
            {isImage ? (
              <div className="w-full flex items-center justify-center p-4 sm:p-8 bg-slate-100/50 min-h-[50vh]">
                {fileUrl ? (
                  <img
                    src={fileUrl}
                    alt={title || "Aperçu Image"}
                    className="max-w-full max-h-[75vh] object-contain rounded-lg shadow-md border border-slate-200"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <div className="p-8 text-center text-slate-500">
                    <ImageIcon className="w-12 h-12 text-slate-300 mx-auto mb-2" />
                    <p className="font-bold text-sm">Image non disponible</p>
                  </div>
                )}
              </div>
            ) : isVideo ? (
              <div className="w-full max-w-4xl mx-auto aspect-video bg-black rounded-2xl overflow-hidden shadow-lg border border-slate-800 flex items-center justify-center my-6">
                <iframe
                  src={getYouTubeEmbedUrl(fileUrl)}
                  title={title}
                  className="w-full aspect-video rounded-lg shadow-md border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  allowFullScreen
                />
              </div>
            ) : isPython ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm overflow-x-auto m-4">
                <pre className="font-mono text-xs text-slate-800 leading-relaxed">
                  <code>
                    {rawText}
                  </code>
                </pre>
              </div>
            ) : (
              <article className="p-6 sm:p-10 font-sans bg-white text-slate-800 text-sm sm:text-base leading-relaxed whitespace-pre-wrap break-words border-b border-slate-100">
                {rawText}
              </article>
            )}

            {/* Footer Notice */}
            <div className="bg-slate-50 p-4 text-center text-xs text-slate-500 font-medium border-t border-slate-100">
              A-Zed Info — Document à usage exclusivement pédagogique. Reproduction et diffusion strictement interdites.
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export const DocumentViewerPage = StudentViewer;
export const DocumentViewer = StudentViewer;
export default StudentViewer;
