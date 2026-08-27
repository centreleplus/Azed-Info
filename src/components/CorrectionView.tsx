import { useState, useEffect } from "react";
import { 
  FileText, 
  Sparkles, 
  Play, 
  Video, 
  Terminal, 
  Copy, 
  Check, 
  ExternalLink, 
  BookOpen, 
  Filter, 
  X,
  Lock,
  CheckCircle,
  Image as ImageIcon
} from "lucide-react";
import { Language, translations } from "../lib/translations";
import usePagination from "../hooks/usePagination";
import PaginationControls from "./PaginationControls";

interface CourseItem {
  id: string;
  title: string;
  duration: string;
  grade: string;
  section?: string;
  module: string;
  isPremium: boolean;
  videoUrl?: string;
  attachmentName: string;
  contentType?: string;
  fileType?: string;
  textContent?: string;
  solutionCode?: string;
  trimestre?: string;
}

const normalizeTrimestre = (trim: string) => {
  if (!trim) return "";
  let t = trim.toLowerCase().trim();
  if (t.includes("1er") || t.includes("1ère")) {
    return "1ere trimestre";
  }
  if (t.includes("2eme") || t.includes("2ème")) {
    return "2eme trimestre";
  }
  if (t.includes("3eme") || t.includes("3ème")) {
    return "3eme trimestre";
  }
  if (t.includes("revision") || t.includes("révision") || t.includes("live") || t.includes("correction")) {
    return "revision";
  }
  return t;
};

const getTrimLabel = (trim: string) => {
  const norm = normalizeTrimestre(trim);
  if (norm === "1ere trimestre") return "1er Trimestre";
  if (norm === "2eme trimestre") return "2ème Trimestre";
  if (norm === "3eme trimestre") return "3ème Trimestre";
  if (norm === "revision") return "Live enregistré";
  return trim;
};

interface CorrectionViewProps {
  isPremiumUser: boolean;
  userGrade: string;
  userSection?: string;
  selectedTrimestre: string; // "3eme trimestre" or "revision"
  userRole?: string;
  currentLanguage?: Language;
  onGoToShop?: () => void;
}

export default function CorrectionView({
  isPremiumUser,
  userGrade,
  userSection = "Tous",
  selectedTrimestre,
  userRole = "student",
  currentLanguage = "fr",
  onGoToShop
}: CorrectionViewProps) {
  const t = translations[currentLanguage];
  const isStudent = userRole === "student";

  const [exercises, setExercises] = useState<CourseItem[]>([]);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(true);

  // Correction viewing states
  const [activePySolution, setActivePySolution] = useState<CourseItem | null>(null);
  const [localPyCode, setLocalPyCode] = useState<string>("");
  const [pyConsoleOutput, setPyConsoleOutput] = useState<string>("Prêt pour exécution...");
  const [isExecutingPy, setIsExecutingPy] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const [activeTxtSolution, setActiveTxtSolution] = useState<CourseItem | null>(null);
  const [activePdfDocument, setActivePdfDocument] = useState<CourseItem | null>(null);
  const [activeVideoSolution, setActiveVideoSolution] = useState<CourseItem | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState<boolean>(false);

  // Fetch courses from server and filter out exercises for the selected trimester
  useEffect(() => {
    setLoading(true);
    fetch("/api/courses", {
      headers: {
        "x-user-grade": userGrade,
        "x-user-section": userSection || "",
        "x-user-role": userRole
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter only items with contentType === "exercise" or specifically labeled
          // matching user grade, and selected trimestres (3eme trimestre or revision)
          const filtered = data.filter((item) => {
            // Check grade match
            const studentCriteria = userGrade.toLowerCase();
            const itemGrade = (item.grade || "Tous").toLowerCase();
            const gradeMatch =
              itemGrade === "tous" ||
              itemGrade === studentCriteria ||
              (studentCriteria.includes("bac") && itemGrade.includes("4ème")) ||
              (studentCriteria.includes("4ème") && itemGrade.includes("bac"));

            if (!gradeMatch) return false;

            // Check section match for students
            if (isStudent && item.section) {
              const studentSection = userSection.toLowerCase();
              const itemSection = item.section.toLowerCase();
              const sectionMatch =
                itemSection === "tous" ||
                itemSection === studentSection;
              if (!sectionMatch) return false;
            }

            // Trimestre match
            const itemTrim = item.trimestre || "1ere trimestre";
            if (normalizeTrimestre(itemTrim) !== normalizeTrimestre(selectedTrimestre)) return false;

            // Filter only items that are for Zone Correction
            const isZoneCorrection = 
              item.contentType === "exercise_corrected" ||
              (item.contentType === "revision" && (item.trimestre === "correction" || item.trimestre === "revision"));
            return isZoneCorrection;
          });
          setExercises(filtered);
        }
      })
      .catch((err) => console.error("Error loading corrections:", err))
      .finally(() => setLoading(false));
  }, [userGrade, userRole, selectedTrimestre]);

  // Extract unique modules (Séries / Chapitres) for filtering
  const uniqueModules = Array.from(
    new Set(exercises.map((item) => item.module || "Général"))
  );

  // Filter exercises by selected module
  const filteredExercises = selectedModule === "all"
    ? exercises
    : exercises.filter((ex) => (ex.module || "Général") === selectedModule);

  const {
    paginatedData: paginatedExercises,
    currentPage: exerciseCurrentPage,
    totalPages: exerciseTotalPages,
    totalItems: exerciseTotalItems,
    startIndex: exerciseStartIndex,
    endIndex: exerciseEndIndex,
    itemsPerPage: exerciseItemsPerPage,
    goToPage: exerciseGoToPage,
    setItemsPerPage: setExerciseItemsPerPage,
  } = usePagination({ data: filteredExercises, initialItemsPerPage: 6 });

  const handleExecutePy = async () => {
    setIsExecutingPy(true);
    setPyConsoleOutput("Exécution du script Python de correction sur le serveur sécurisé...");
    try {
      const response = await fetch("/api/piston/execute", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: localPyCode })
      });
      const data = await response.json();
      const stdout = data.run?.stdout || "";
      const stderr = data.run?.stderr || "";
      
      if (stderr) {
        setPyConsoleOutput(`[ERREUR EXÉCUTION]\n${stderr}`);
      } else {
        setPyConsoleOutput(stdout || "[Exécution terminée avec succès - Aucune sortie standard]");
      }
    } catch (err) {
      setPyConsoleOutput("Erreur de communication avec le compilateur sécurisé.");
    } finally {
      setIsExecutingPy(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleDownloadAttachment = (filename: string) => {
    alert(`📥 Téléchargement sécurisé de la correction PDF :\n${filename}\n(Certifié conforme et corrigé par M. Nabil Chaouch)`);
  };

  return (
    <div className="space-y-6 bg-white text-[#1F2937] text-left">
      {/* UNIFIED STUDENT HEADER BANNER */}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 flex items-center justify-between shadow-sm text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Visualisation des Corrections : <span className="text-emerald-600 font-extrabold">{getTrimLabel(selectedTrimestre)}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Corrections détaillées, codes sources Python et replays pour votre niveau académique.
            </p>
          </div>
        </div>
        {/* Badge statut compact à droite */}
        <div className="hidden sm:flex items-center">
          <span className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full">
            {exercises.length} CORRECTIONS TROUVÉES
          </span>
        </div>
      </div>

      {/* Chapter/Série Filtering Tabs */}
      <div className="flex flex-col gap-2">
        <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 flex items-center gap-1">
          <Filter size={11} />
          Filtrer par Série / Chapitre académique
        </label>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedModule("all")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedModule === "all"
                ? "bg-[#2563EB] text-white shadow-xs"
                : "bg-slate-50 border border-slate-200 text-gray-600 hover:bg-slate-100"
            }`}
          >
            Tous les chapitres ({exercises.length})
          </button>
          {uniqueModules.map((mod) => {
            const count = exercises.filter((ex) => (ex.module || "Général") === mod).length;
            return (
              <button
                key={mod}
                onClick={() => setSelectedModule(mod)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedModule === mod
                    ? "bg-[#2563EB] text-white shadow-xs"
                    : "bg-slate-50 border border-slate-200 text-gray-600 hover:bg-slate-100"
                }`}
              >
                {mod} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state or listing */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Chargement des exercices corrigés...</p>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-200 rounded-3xl bg-slate-50/50 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[#2563EB]">
            <BookOpen size={20} />
          </div>
          <h4 className="text-xs font-bold text-gray-800">{t.empty_corrections_title}</h4>
          <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
            {t.empty_corrections_desc}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {paginatedExercises.map((exercise) => {
            const isLocked = false;
            return (
              <div
                key={exercise.id}
                className="border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#2563EB]/40 hover:shadow-md transition-all duration-300 bg-white flex flex-col justify-between"
              >
                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-gray-400 mb-1 font-semibold">
                      <span className="uppercase text-[#2563EB] bg-[#2563EB]/5 px-2 py-0.5 rounded">
                        {exercise.module || "Série"}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 text-xs mt-2 line-clamp-2 leading-tight">
                      {exercise.title}
                    </h3>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    {isLocked ? (
                      <div className="flex items-center gap-1 text-rose-600 text-[10px] font-bold">
                        <Lock size={12} />
                        <span>Premium requis</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-emerald-600 text-[10px] font-bold">
                        <Sparkles size={12} />
                        <span>Disponible</span>
                      </div>
                    )}

                    {isLocked ? (
                      <button
                        onClick={onGoToShop}
                        className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all"
                      >
                        <Lock size={11} />
                        <span>Débloquer</span>
                      </button>
                    ) : (["png", "jpg", "jpeg"].includes((exercise.fileType || "").toLowerCase()) || (exercise.attachmentName && /\.(png|jpg|jpeg)$/i.test(exercise.attachmentName)) || (exercise.videoUrl && /\.(png|jpg|jpeg)$/i.test(exercise.videoUrl))) ? (
                      <button
                        onClick={() => {
                          const ext = (exercise.fileType || "").toLowerCase().match(/png|jpg|jpeg/)?.[0] || exercise.attachmentName?.split('.').pop()?.toLowerCase() || exercise.videoUrl?.split('.').pop()?.toLowerCase() || "png";
                          const detail = {
                            id: exercise.id,
                            title: exercise.title,
                            module: exercise.module || "Série",
                            category: "Correction",
                            filename: exercise.attachmentName || `correction.${ext}`,
                            fileType: ext,
                            fileUrl: exercise.videoUrl || exercise.fileUrl,
                            isPremium: exercise.isPremium
                          };
                          window.dispatchEvent(new CustomEvent("open-document-viewer", { detail }));
                          window.location.hash = `#/student/viewer/${exercise.id}`;
                        }}
                        className="px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <ImageIcon size={11} />
                        <span>Afficher (.{(exercise.fileType || "").toLowerCase().match(/png|jpg|jpeg/)?.[0] || exercise.attachmentName?.split('.').pop()?.toLowerCase() || exercise.videoUrl?.split('.').pop()?.toLowerCase() || "png"})</span>
                      </button>
                    ) : exercise.fileType === "py" ? (
                      <button
                        onClick={() => {
                          const detail = {
                            id: exercise.id,
                            title: exercise.title,
                            module: exercise.module || "Série",
                            category: "Correction",
                            filename: exercise.attachmentName || "correction.py",
                            fileType: "py",
                            textContent: exercise.solutionCode || exercise.textContent,
                            solutionCode: exercise.solutionCode || exercise.textContent,
                            isPremium: exercise.isPremium
                          };
                          window.dispatchEvent(new CustomEvent("open-document-viewer", { detail }));
                          window.location.hash = `#/student/viewer/${exercise.id}`;
                        }}
                        className="px-3 py-1.5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Terminal size={11} />
                        <span>Exécuter (.py)</span>
                      </button>
                    ) : exercise.fileType === "txt" ? (
                      <button
                        onClick={() => {
                          const detail = {
                            id: exercise.id,
                            title: exercise.title,
                            module: exercise.module || "Série",
                            category: "Correction",
                            filename: exercise.attachmentName || "correction.txt",
                            fileType: "txt",
                            textContent: exercise.textContent || exercise.solutionCode,
                            solutionCode: exercise.solutionCode || exercise.textContent,
                            isPremium: exercise.isPremium
                          };
                          window.dispatchEvent(new CustomEvent("open-document-viewer", { detail }));
                          window.location.hash = `#/student/viewer/${exercise.id}`;
                        }}
                        className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <FileText size={11} />
                        <span>Consulter</span>
                      </button>
                    ) : (exercise.fileType === "pdf" || (exercise.videoUrl && exercise.videoUrl.toLowerCase().endsWith(".pdf")) || (exercise.attachmentName && exercise.attachmentName.toLowerCase().endsWith(".pdf"))) ? (
                      <a
                        href={`/api/courses/pdf/${exercise.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <FileText size={11} />
                        <span>Consulter</span>
                      </a>
                    ) : (exercise.fileType === "mp4" || (exercise.videoUrl && !exercise.videoUrl.toLowerCase().endsWith(".pdf") && !exercise.videoUrl.toLowerCase().endsWith(".py") && !exercise.videoUrl.toLowerCase().endsWith(".txt"))) ? (
                      <button
                        onClick={() => {
                          setActiveVideoSolution(exercise);
                          setIsVideoPlaying(true);
                        }}
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <Video size={11} />
                        <span>Vidéo corrigée</span>
                      </button>
                    ) : (
                      <a
                        href={`/api/courses/pdf/${exercise.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                      >
                        <FileText size={11} />
                        <span>Consulter</span>
                      </a>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <PaginationControls
          currentPage={exerciseCurrentPage}
          totalPages={exerciseTotalPages}
          totalItems={exerciseTotalItems}
          startIndex={exerciseStartIndex}
          endIndex={exerciseEndIndex}
          itemsPerPage={exerciseItemsPerPage}
          onPageChange={exerciseGoToPage}
          onItemsPerPageChange={setExerciseItemsPerPage}
          pageSizeOptions={[6, 12, 24, 48]}
        />
      </>
      )}

      {/* Instructions panel */}
      <div className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/40 text-xs text-emerald-800 flex gap-2.5 w-full leading-relaxed font-medium">
        <Sparkles size={16} className="text-emerald-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Conseil de l'Espace A-Zed Info :</span>
          <p className="text-[11px] text-emerald-700 mt-0.5">
            Comparez attentivement votre proposition de solution avec la correction partagée par l'administration. Pour les exercices sur Python, utilisez le terminal d'exécution interactif en ligne pour simuler différents cas de tests.
          </p>
        </div>
      </div>

      {/* MODAL PYTHON RESOLUTION */}
      {activePySolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-violet-50 border-b border-violet-100 flex justify-between items-center text-left">
              <div>
                <span className="text-[9px] bg-violet-200 text-violet-800 font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                  🐍 SCRIPT PYTHON DE CORRECTION
                </span>
                <h3 className="text-[#0F1E36] font-bold text-xs mt-1">
                  {activePySolution.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePySolution(null)}
                className="text-gray-400 hover:text-gray-600 font-bold bg-white p-1 rounded-full border border-gray-200 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Code Content */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto">
              <div className="text-[11px] text-gray-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
                <p><strong>Chapitre/Série :</strong> {activePySolution.module}</p>
                <p className="mt-0.5">Modifiez ou lancez directement l'exécution sécurisée du script Python ci-dessous pour valider la correction.</p>
              </div>

              {/* Code Editor */}
              <div className="space-y-1">
                <div className="flex justify-between items-center bg-gray-900 text-gray-400 px-4 py-2 rounded-t-xl text-[10px] font-mono">
                  <span>correction.py</span>
                  <button
                    onClick={() => handleCopyCode(localPyCode)}
                    className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedCode ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                    <span>{copiedCode ? "Copié !" : "Copier le Code"}</span>
                  </button>
                </div>
                <textarea
                  value={localPyCode}
                  onChange={(e) => setLocalPyCode(e.target.value)}
                  className="w-full h-44 p-4 font-mono text-[11px] bg-gray-950 text-white border-x border-b border-gray-800 rounded-b-xl focus:outline-hidden leading-relaxed resize-none"
                  spellCheck="false"
                />
              </div>

              {/* Console Output */}
              <div className="rounded-xl overflow-hidden border border-slate-200">
                <div className="bg-[#0F1E36] px-4 py-1.5 text-[9px] font-mono text-gray-300 border-b border-gray-800 flex justify-between">
                  <span>Console / Sortie de test</span>
                  {isExecutingPy && <span className="text-violet-400 flex items-center gap-1 animate-pulse">⚙ Compilation...</span>}
                </div>
                <pre className="bg-slate-950 text-emerald-400 p-4 font-mono text-[10px] h-24 overflow-y-auto leading-normal whitespace-pre-wrap text-left">
                  {pyConsoleOutput}
                </pre>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 border-t border-gray-150 bg-slate-50 flex justify-between items-center">
              <a
                href="https://www.programiz.com/python-programming/online-compiler/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1 cursor-pointer"
              >
                <ExternalLink size={13} />
                <span>Ouvrir sur un compilateur externe</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setActivePySolution(null)}
                  className="px-4 py-2 border border-gray-200 hover:bg-slate-50 rounded-xl text-xs font-bold text-gray-500 cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  onClick={handleExecutePy}
                  disabled={isExecutingPy}
                  className="px-4 py-2 bg-violet-600 hover:bg-violet-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Play size={13} />
                  <span>Exécuter le script</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL TEXT RECONSTRUCTION */}
      {activeTxtSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl">
            {/* Header */}
            <div className="p-5 bg-blue-50 border-b border-blue-100 flex justify-between items-center text-left">
              <div>
                <span className="text-[9px] bg-blue-200 text-blue-800 font-extrabold uppercase px-2 py-0.5 rounded tracking-wider">
                  📝 EXPLICATIONS & SOLUTION DÉTAILLÉE
                </span>
                <h3 className="text-[#0F1E36] font-bold text-xs mt-1">
                  {activeTxtSolution.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveTxtSolution(null)}
                className="text-gray-400 hover:text-gray-600 font-bold bg-white p-1 rounded-full border border-gray-200 cursor-pointer text-xs"
              >
                ✕
              </button>
            </div>

            {/* Text details */}
            <div className="p-5 flex-1 overflow-y-auto text-left space-y-4">
              <div className="text-[11px] text-gray-500 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
                <p><strong>Série/Chapitre :</strong> {activeTxtSolution.module}</p>
              </div>

              <div className="bg-slate-950 text-slate-100 p-4 rounded-xl font-mono text-[11px] leading-relaxed whitespace-pre-wrap min-h-[150px] max-h-[300px] overflow-y-auto border border-slate-800">
                {activeTxtSolution.textContent || "Aucune explication textuelle disponible."}
              </div>
            </div>

            {/* Actions */}
            <div className="p-4 border-t border-gray-150 bg-slate-50 flex justify-end gap-2">
              <button
                onClick={() => setActiveTxtSolution(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold cursor-pointer"
              >
                Compris, merci
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL VIDEO PLAYER */}
      {activeVideoSolution && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs select-none">
          <div className="bg-white rounded-2xl border border-slate-200 w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl p-6 space-y-4">
            <div className="flex justify-between items-start gap-4 border-b border-gray-200 pb-3 text-left">
              <div>
                <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full uppercase tracking-wider">
                  🎥 Correction Vidéo Interactive
                </span>
                <h3 className="text-[#0F1E36] font-bold text-xs mt-1">{activeVideoSolution.title}</h3>
                <p className="text-[11px] text-gray-400 mt-0.5">Série/Chapitre : {activeVideoSolution.module}</p>
              </div>
              <button
                onClick={() => {
                  setActiveVideoSolution(null);
                  setIsVideoPlaying(false);
                }}
                className="p-1.5 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X size={16} className="text-gray-400" />
              </button>
            </div>

            <div className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-black">
              <video
                src={activeVideoSolution.videoUrl || "https://www.w3schools.com/html/mov_bbb.mp4"}
                className="w-full h-full object-cover"
                controls
                autoPlay={isVideoPlaying}
              />
              <div className="absolute top-3 left-3 text-[9px] bg-black/70 text-gray-300 p-1 rounded font-mono select-none pointer-events-none tracking-wide">
                🔒 PROPRIÉTÉ A-ZED INFO - REPRODUCTION ET ENREGISTREMENT INTERDITS
              </div>
            </div>

            <div className="pt-3 border-t border-gray-150 flex justify-end gap-2">
              <button
                onClick={() => {
                  setActiveVideoSolution(null);
                  setIsVideoPlaying(false);
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold cursor-pointer"
              >
                Fermer
              </button>
              {activeVideoSolution.attachmentName && (
                <a
                  href={`/api/courses/pdf/${activeVideoSolution.id}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => {
                    setActiveVideoSolution(null);
                    setIsVideoPlaying(false);
                  }}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <FileText size={13} />
                  <span>Ouvrir Support PDF</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
