import { useState, useEffect } from "react";
import { Play, Video, Lock, Sparkles, Download, ArrowRight, ShieldAlert, FileText, Terminal, Copy, Check, ExternalLink, Info, AlertTriangle, BookOpen, Image as ImageIcon } from "lucide-react";
import { Language, translations } from "../lib/translations";
import usePagination from "../hooks/usePagination";
import PaginationControls from "./PaginationControls";
import { useSettings } from "./SettingsContext";

interface CourseItem {
  id: string;
  title: string;
  duration: string;
  grade: string;
  module: string;
  isPremium: boolean;
  videoUrl: string;
  attachmentName: string;
  contentType?: string;
  fileType?: string;
  textContent?: string;
  solutionCode?: string;
  trimestre?: string;
}

const COURSES_DATA: CourseItem[] = [
  {
    id: "c1",
    title: "Introduction et Fondamentaux d'Algorithmique",
    duration: "45 min",
    grade: "1ère Année",
    module: "Bases Logiques",
    isPremium: false,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Fiche_Synthese_1ere_Annee.pdf",
    trimestre: "1ere trimestre"
  },
  {
    id: "c2",
    title: "Les Constantes, Variables et Types simples sous Python",
    duration: "55 min",
    grade: "1ère Année",
    module: "Bases Logiques",
    isPremium: false,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Cours_Structure_Variables.pdf",
    trimestre: "1ere trimestre"
  },
  {
    id: "c2_sub2",
    title: "Structures Conditionnelles Alternatives simples & booléens",
    duration: "50 min",
    grade: "1ère Année",
    module: "Conditions",
    isPremium: false,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Cours_Intermediaires_Conditions.pdf",
    trimestre: "2eme trimestre"
  },
  {
    id: "c2_sub3",
    title: "La Modularité & Appels de fonctions de base",
    duration: "1h 05min",
    grade: "1ère Année",
    module: "Structure globale",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Sujets_TP_Trimestre3_1ere.pdf",
    trimestre: "3eme trimestre"
  },
  {
    id: "c2_sub4",
    title: "Session de Révision globale - Enjeux et fiches d'arrêt",
    duration: "1h 45min",
    grade: "1ère Année",
    module: "Révision de Fin de cycle",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Fiches_Synthese_Annee_1ere.pdf",
    trimestre: "revision"
  },
  {
    id: "c3",
    title: "Maîtriser les Structures Alternatives et Itératives complexes",
    duration: "1h 10min",
    grade: "3ème Année",
    module: "Logique Conditionnelle",
    isPremium: false,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Exercices_Corriges_Iteratifs.pdf",
    trimestre: "1ere trimestre"
  },
  {
    id: "c3_sub2",
    title: "Enregistrements & Structures logiques complexes",
    duration: "1h 20min",
    grade: "3ème Année",
    module: "Structures complexes",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "TP_Enregistrements_Corriges.pdf",
    trimestre: "2eme trimestre"
  },
  {
    id: "c3_sub3",
    title: "Manipulation des Fichiers Textes en Python",
    duration: "1h 15min",
    grade: "3ème Année",
    module: "Fichiers de données",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Cours_Bac_Sujets_Fichiers.pdf",
    trimestre: "3eme trimestre"
  },
  {
    id: "c3_sub4",
    title: "Séminaire de révision - Synthèse Annuelle d'Informatique",
    duration: "2h 30min",
    grade: "3ème Année",
    module: "Syllabus Global",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Sujets_Passage_3eme.pdf",
    trimestre: "revision"
  },
  {
    id: "c4",
    title: "La Récursivité : Principes mathématiques et Fonctions Récurrentes",
    duration: "1h 25min",
    grade: "4ème Année (Bac Info)",
    module: "Algorithmes Avancés",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Fiche_Bac_Recursivite.pdf",
    trimestre: "1ere trimestre"
  },
  {
    id: "c5",
    title: "Bases de Données Relationnelles : Modèle Conceptuel et Requêtes SQL",
    duration: "1h 40min",
    grade: "4ème Année (Bac Info)",
    module: "Bases de Données",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "SQL_Memento_Bac_Pratique.pdf",
    trimestre: "2eme trimestre"
  },
  {
    id: "c6",
    title: "Les Algorithmes de Tris Compliqués : Tri par Sélection & Tri Bulle récursif",
    duration: "1h 15min",
    grade: "4ème Année (Bac Info)",
    module: "Algorithmes Avancés",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Tri_Visualisation_Etapes.pdf",
    trimestre: "1ere trimestre"
  },
  {
    id: "c6_sub3",
    title: "Les algorithmes d'approximation avancée (Recherche Dichotomique)",
    duration: "1h 10min",
    grade: "4ème Année (Bac Info)",
    module: "Recherches avancées",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Approximation_Synthese_Bac.pdf",
    trimestre: "3eme trimestre"
  },
  {
    id: "c6_sub4",
    title: "Session de Révision Intensive Bac Pratique & Théorique",
    duration: "3h 15min",
    grade: "4ème Année (Bac Info)",
    module: "Syllabus Global",
    isPremium: true,
    videoUrl: "",
    fileType: "pdf",
    attachmentName: "Annales_Bac_Corriges_Tunisie.pdf",
    trimestre: "revision"
  }
];

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
  if (t.includes("revision") || t.includes("révision")) {
    return "revision";
  }
  return t;
};

const getTrimLabel = (trim?: string) => {
  if (!trim) return "Tous les trimestres";
  const norm = normalizeTrimestre(trim);
  if (norm === "1ere trimestre") return "1er Trimestre";
  if (norm === "2eme trimestre") return "2ème Trimestre";
  if (norm === "3eme trimestre") return "3ème Trimestre";
  if (norm === "revision") return "Révision & Live";
  return trim;
};

interface CoursViewProps {
  isPremiumUser: boolean;
  userGrade: string;
  userSection?: string;
  userRole?: string;
  selectedTrimestre?: string;
  currentLanguage?: Language;
  studentUpdatesConfig?: any;
  onGoToShop?: () => void;
}

export default function CoursView({ isPremiumUser, userGrade, userSection, userRole = "student", selectedTrimestre, currentLanguage = "fr", studentUpdatesConfig, onGoToShop }: CoursViewProps) {
  const { settings } = useSettings();
  const t = translations[currentLanguage];
  const isStudent = userRole === "student";
  const [allCourses, setAllCourses] = useState<CourseItem[]>(COURSES_DATA);

  const [activePySolution, setActivePySolution] = useState<CourseItem | null>(null);
  const [activeTxtSolution, setActiveTxtSolution] = useState<CourseItem | null>(null);
  const [activePdfDocument, setActivePdfDocument] = useState<CourseItem | null>(null);
  const [localPyCode, setLocalPyCode] = useState<string>("");
  const [pyConsoleOutput, setPyConsoleOutput] = useState<string>("Prêt pour exécution...");
  const [isExecutingPy, setIsExecutingPy] = useState<boolean>(false);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showUpgradeModal, setShowUpgradeModal] = useState<boolean>(false);
  const [targetCourseTitle, setTargetCourseTitle] = useState<string>("");

  const handleExecuteActivePy = async () => {
    setIsExecutingPy(true);
    setPyConsoleOutput("Exécution du script Python sur notre serveur sécurisé...");
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
        setPyConsoleOutput(`[ERREUR PYTHON]\n${stderr}`);
      } else {
        setPyConsoleOutput(stdout || "[Aucune sortie renvoyée (vide) - exécution terminée avec succès]");
      }
    } catch (err) {
      setPyConsoleOutput("Erreur lors du traitement ou de la connexion avec le compilateur sécurisé.");
    } finally {
      setIsExecutingPy(false);
    }
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Dynamic syncing of uploaded course items from server
  useEffect(() => {
    fetch("/api/courses", {
      headers: {
        "x-user-grade": userGrade,
        "x-user-section": userSection || "",
        "x-user-role": userRole
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          // Merge static initial courses with uploaded dynamic ones, making sure we don't duplicate
          const merged = [...COURSES_DATA];
          data.forEach((srvCourse) => {
            if (!merged.some((m) => m.id === srvCourse.id)) {
              merged.push(srvCourse);
            }
          });
          setAllCourses(merged);
        }
      })
      .catch((err) => console.warn("Fallback to offline syllabus static courses:", err));
  }, [userGrade, userSection, userRole]);

  // Filter based strictly on user grade for students to guarantee strict academic isolation
  const filteredCourses = allCourses.filter((course) => {
    if (isStudent) {
      // Normalize comparison to prevent subtle spelling bugs
      const studentCriteria = userGrade.toLowerCase();
      const courseCriteria = course.grade.toLowerCase();
      const gradeMatch =
        courseCriteria === "tous" ||
        courseCriteria === studentCriteria ||
        (studentCriteria.includes("bac") && courseCriteria.includes("4ème")) ||
        (studentCriteria.includes("4ème") && courseCriteria.includes("bac"));

      if (!gradeMatch) return false;

      // Section check for students
      if (userSection && course.section) {
        const studentSec = userSection.trim().toLowerCase();
        const courseSec = course.section.trim().toLowerCase();
        const sectionMatch =
          courseSec === "tous" ||
          courseSec === studentSec ||
          courseSec.split(",").some((s) => s.trim().toLowerCase() === studentSec);

        if (!sectionMatch) return false;
      }

      // Content Type check: Fiches & Cours contains 'course' and the hybrid type
      const typeMatch =
        !course.contentType ||
        course.contentType === "course" ||
        course.contentType === "devoirs_exercices_fiches_cours";
      if (!typeMatch) return false;

      // Filter by trimester if specified
      if (selectedTrimestre) {
        const courseTrim = course.trimestre || "1ere trimestre";
        return normalizeTrimestre(courseTrim) === normalizeTrimestre(selectedTrimestre);
      }
    }
    return true; // Admin can view all content
  });

  const {
    paginatedData: paginatedCourses,
    currentPage: courseCurrentPage,
    totalPages: courseTotalPages,
    totalItems: courseTotalItems,
    startIndex: courseStartIndex,
    endIndex: courseEndIndex,
    itemsPerPage: courseItemsPerPage,
    goToPage: courseGoToPage,
    setItemsPerPage: setCourseItemsPerPage,
  } = usePagination({ data: filteredCourses, initialItemsPerPage: 6 });

  const handleDownloadAttachment = (filename: string) => {
    alert(`📥 Téléchargement sécurisé du support PDF : ${filename}\n(Certifié conforme au programme officiel d'informatique)`);
  };

  return (
    <div className="space-y-6 bg-white text-[#1F2937]">
      {/* UNIFIED STUDENT HEADER BANNER */}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 flex items-center justify-between shadow-sm text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              {studentUpdatesConfig?.welcomeBanner?.title && currentLanguage === "fr" ? (
                studentUpdatesConfig.welcomeBanner.title
              ) : (
                <>
                  Visualisation des Cours : <span className="text-emerald-600 font-extrabold">{getTrimLabel(selectedTrimestre)}</span>
                </>
              )}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {studentUpdatesConfig?.welcomeBanner?.paragraph && currentLanguage === "fr"
                ? studentUpdatesConfig.welcomeBanner.paragraph
                : "Accédez aux supports de cours, fiches récapitulatives et ressources académiques."}
            </p>
          </div>
        </div>
        {/* Badge statut compact à droite */}
        <div className="hidden sm:flex items-center">
          <span className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full">
            {filteredCourses.length} COURS DISPONIBLES
          </span>
        </div>
      </div>

      {/* COURSES LIST DISPLAY MATRIX */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredCourses.length === 0 ? (
          <div className="col-span-full border border-dashed border-[#E5E7EB] rounded-2xl p-10 text-center bg-[#F9FAFB]">
            <ShieldAlert size={40} className="text-gray-400 mx-auto mb-3" />
            <h4 className="font-semibold text-[#0F1E36] text-sm mb-1">{t.empty_courses_title}</h4>
            <p className="text-xs text-gray-500">{t.empty_courses_desc.replace("{{level}}", userGrade)}</p>
          </div>
        ) : (
          paginatedCourses.map((course) => {
            const isLocked = course.isPremium && !isPremiumUser;

            // Determine course file type dynamically
            const getFileType = (c: CourseItem) => {
              if (c.fileType) return c.fileType.toLowerCase();
              const name = (c.attachmentName || "").toLowerCase();
              const url = (c.videoUrl || "").toLowerCase();
              if (name.endsWith(".png") || url.endsWith(".png")) return "png";
              if (name.endsWith(".jpg") || url.endsWith(".jpg")) return "jpg";
              if (name.endsWith(".jpeg") || url.endsWith(".jpeg")) return "jpeg";
              if (name.endsWith(".py") || url.endsWith(".py")) return "py";
              if (name.endsWith(".txt") || url.endsWith(".txt")) return "txt";
              if (name.endsWith(".pdf") || url.endsWith(".pdf")) return "pdf";
              if (name.endsWith(".mp4") || url.endsWith(".mp4")) return "mp4";
              if (c.videoUrl) return "mp4";
              if (c.attachmentName) return "pdf";
              return "mp4";
            };
            const fileType = getFileType(course);

            // Dynamic CMS configuration for the Recursivité course card
            const isRecursivite = course.title.toLowerCase().includes("récursivité");
            const hasCustomCardConfig = isRecursivite && studentUpdatesConfig?.courseCard;
            const config = hasCustomCardConfig ? studentUpdatesConfig.courseCard : null;

            const cardStyle = config ? {
              color: config.textColor,
              backgroundColor: config.backgroundColor,
              borderColor: config.borderColor,
              borderWidth: config.borderWidth === "border-0" ? "0px" : config.borderWidth === "border-2" ? "2px" : config.borderWidth === "border-4" ? "4px" : "1px",
              fontFamily: config.fontFamily === "Inter" ? '"Inter", sans-serif' : config.fontFamily === "Poppins" ? '"Poppins", sans-serif' : config.fontFamily === "Roboto" ? '"Roboto", sans-serif' : config.fontFamily === "Playfair Display" ? '"Playfair Display", serif' : '"JetBrains Mono", monospace'
            } : {};

            return (
              <div
                key={course.id}
                className={`border rounded-2xl overflow-hidden hover:border-slate-350 dark:hover:border-slate-500 transition-all duration-300 bg-white dark:bg-slate-800 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 group`}
                style={cardStyle}
              >
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-400 mb-1">
                      <span className="font-semibold text-gray-500 uppercase tracking-widest text-[10px]">{course.module}</span>
                    </div>

                    {config?.imageUrl && (
                      <div className="mb-3 rounded-lg overflow-hidden h-28 border border-slate-100 bg-slate-50">
                        <img src={config.imageUrl} className="w-full h-full object-cover" alt="Syllabus" referrerPolicy="no-referrer" />
                      </div>
                    )}

                    <h3 
                      className={`font-semibold leading-snug transition-colors text-slate-800 dark:text-white ${config ? config.fontSize : "text-base"}`}
                      style={{ textAlign: config?.alignLeft === false ? "right" : config?.alignLeft === true ? "left" : undefined }}
                    >
                      {config ? config.title : course.title}
                    </h3>
                    
                    {config?.paragraph && (
                      <p className="text-xs opacity-80 mt-1" style={{ textAlign: config.alignLeft === false ? "right" : "left" }}>
                        {config.paragraph}
                      </p>
                    )}
                    
                    <div className="pt-2 flex flex-wrap gap-1.5">
                      {course.isPremium && (
                        <span className="text-[9px] font-semibold text-[#EF4444] bg-[#EF4444]/5 px-2 py-0.5 rounded">
                          Premium
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs" style={{ borderColor: config?.borderColor }}>
                    {isLocked ? (
                      <div className="flex items-center gap-1 text-[#EF4444] font-medium">
                        <Lock size={12} />
                        <span>Accès Premium Requis</span>
                      </div>
                    ) : (
                      <div className="text-[#10B981] font-medium flex items-center gap-1">
                        <Sparkles size={12} />
                        <span>Disponible</span>
                      </div>
                    )}

                    {isLocked ? (
                      <button
                        onClick={() => {
                          if (onGoToShop) {
                            onGoToShop();
                          } else {
                            setTargetCourseTitle(course.title);
                            setShowUpgradeModal(true);
                          }
                        }}
                        className="px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-[#E31B23] hover:bg-red-700 text-white cursor-pointer text-xs animate-pulse"
                      >
                        <Lock size={12} />
                        <span>Débloquer</span>
                      </button>
                    ) : ["png", "jpg", "jpeg"].includes(fileType) ? (
                      <button
                        onClick={() => {
                          const detail = {
                            id: course.id,
                            title: course.title,
                            module: course.module || "Général",
                            category: "Fiches & Cours",
                            filename: course.attachmentName || `cours.${fileType}`,
                            fileType: fileType,
                            fileUrl: course.videoUrl,
                            isPremium: course.isPremium
                          };
                          window.dispatchEvent(new CustomEvent("open-document-viewer", { detail }));
                          window.location.hash = `#/student/viewer/${course.id}`;
                        }}
                        className="px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-purple-600 text-white hover:bg-purple-700 cursor-pointer text-xs"
                      >
                        <ImageIcon size={12} />
                        <span>Afficher (.{fileType})</span>
                      </button>
                    ) : fileType === "py" ? (
                      <button
                        onClick={() => {
                          const detail = {
                            id: course.id,
                            title: course.title,
                            module: course.module || "Général",
                            category: "Fiches & Cours",
                            filename: course.attachmentName || "cours.py",
                            fileType: "py",
                            textContent: course.solutionCode || course.textContent,
                            solutionCode: course.solutionCode || course.textContent,
                            isPremium: course.isPremium
                          };
                          window.dispatchEvent(new CustomEvent("open-document-viewer", { detail }));
                          window.location.hash = `#/student/viewer/${course.id}`;
                        }}
                        className="px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-violet-600 text-white hover:bg-violet-700 cursor-pointer text-xs"
                      >
                        <Terminal size={12} />
                        <span>Exécuter (.py)</span>
                      </button>
                    ) : fileType === "txt" ? (
                      <button
                        onClick={() => {
                          const detail = {
                            id: course.id,
                            title: course.title,
                            module: course.module || "Général",
                            category: "Fiches & Cours",
                            filename: course.attachmentName || "cours.txt",
                            fileType: "txt",
                            textContent: course.textContent || course.solutionCode,
                            solutionCode: course.solutionCode || course.textContent,
                            isPremium: course.isPremium
                          };
                          window.dispatchEvent(new CustomEvent("open-document-viewer", { detail }));
                          window.location.hash = `#/student/viewer/${course.id}`;
                        }}
                        className="px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-blue-600 text-white hover:bg-blue-700 cursor-pointer text-xs"
                      >
                        <FileText size={12} />
                        <span>Lire (.txt)</span>
                      </button>
                    ) : fileType === "pdf" ? (
                      <a
                        href={`/api/courses/pdf/${course.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer text-xs"
                      >
                        <FileText size={12} />
                        <span>Consulter</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          if (course.isPremium && !isPremiumUser) {
                            alert("⚠️ Ce cours vidéo Premium est verrouillé. Veuillez régulariser votre accès annuel de 120 DT auprès du directeur pédagogique M. Nabil Chaouch.");
                            return;
                          }
                          const detail = {
                            id: course.id,
                            title: course.title,
                            module: course.module || "Général",
                            category: "Fiches & Cours",
                            filename: course.attachmentName || "video.mp4",
                            fileType: "mp4",
                            fileUrl: course.videoUrl,
                            videoUrl: course.videoUrl,
                            isPremium: course.isPremium
                          };
                          window.dispatchEvent(new CustomEvent("open-document-viewer", { detail }));
                          window.location.hash = `#/student/viewer/${course.id}`;
                        }}
                        className="px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-[#10B981] text-white hover:bg-[#0da673] cursor-pointer text-xs"
                      >
                        <Video size={12} />
                        <span>Visionner (.mp4)</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <PaginationControls
        currentPage={courseCurrentPage}
        totalPages={courseTotalPages}
        totalItems={courseTotalItems}
        startIndex={courseStartIndex}
        endIndex={courseEndIndex}
        itemsPerPage={courseItemsPerPage}
        onPageChange={courseGoToPage}
        onItemsPerPageChange={setCourseItemsPerPage}
        pageSizeOptions={[6, 12, 24, 48]}
      />

      {/* OVERLAY POUR EXÉCUTION PY CORRESPONDANTE */}
      {activePySolution && (
        <div id="py-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-2xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-violet-50 border-b border-violet-100 flex justify-between items-center text-left">
              <div>
                <span className="text-[9px] bg-violet-250 text-violet-800 font-extrabold uppercase px-2.5 py-1 rounded tracking-wider">
                  🧪 EXÉCUTION PYTHON & BIBLIOTHÈQUES (.py)
                </span>
                <h3 className="text-[#0F1E36] font-black text-sm tracking-tight mt-1 leading-snug">
                  {activePySolution.title}
                </h3>
              </div>
              <button
                onClick={() => setActivePySolution(null)}
                className="text-gray-400 hover:text-gray-600 font-bold bg-white p-1 rounded-full border border-gray-200 shadow-3xs cursor-pointer text-xs transition-all w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-left">
              <div className="text-[11px] text-gray-550 leading-relaxed bg-slate-50 p-3 rounded-lg border border-slate-150">
                <p><strong>Module:</strong> {activePySolution.module}</p>
                <p className="mt-1">Modifiez le code ci-dessous si nécessaire, puis lancez l'exécution sécurisée. Ce compilateur supporte la syntaxe standard Python et l'import de ses bibliothèques.</p>
              </div>

              {/* Code Box */}
              <div className="space-y-1">
                <div className="flex justify-between items-center bg-gray-900 text-gray-400 px-4 py-2 rounded-t-xl text-[10px] font-mono whitespace-nowrap overflow-x-auto gap-2">
                  <span>🐍 solution.py</span>
                  <div className="flex gap-3 shrink-0">
                    <button
                      onClick={() => handleCopyCode(localPyCode)}
                      className="hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      {copiedCode ? <Check size={11} className="text-emerald-400" /> : <Copy size={11} />}
                      <span>{copiedCode ? "Copié !" : "Copier le Code"}</span>
                    </button>
                    <a
                      href="https://www.programiz.com/python-programming/online-compiler/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="hover:text-white text-violet-400 flex items-center gap-1 cursor-pointer transition-colors"
                    >
                      <ExternalLink size={11} />
                      <span>Compilateur en ligne (avec Librairies)</span>
                    </a>
                  </div>
                </div>
                <textarea
                  value={localPyCode}
                  onChange={(e) => setLocalPyCode(e.target.value)}
                  className="w-full h-44 p-4 font-mono text-[11px] bg-gray-950 text-white border-x border-b border-gray-800 rounded-b-xl focus:outline-hidden leading-relaxed resize-none"
                  spellCheck="false"
                />
              </div>

              {/* Console log feedback */}
              <div className="rounded-xl overflow-hidden border border-[#E5E7EB]">
                <div className="bg-[#0F1E36] px-4 py-1.5 text-[9px] font-mono text-gray-300 border-b border-gray-800 flex justify-between">
                  <span>Console d'Exécution / Terminal</span>
                  {isExecutingPy && <span className="text-violet-400 flex items-center gap-1 animate-pulse">⚙ Compilation en cours...</span>}
                </div>
                <pre className="bg-[#09111e] text-emerald-400 p-4 font-mono text-[10px] h-24 overflow-y-auto leading-normal whitespace-pre-wrap text-left">
                  {pyConsoleOutput}
                </pre>
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-col sm:flex-row gap-3 justify-between items-center text-xs">
              <a
                href="https://www.programiz.com/python-programming/online-compiler/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] font-bold text-violet-700 hover:text-violet-800 flex items-center gap-1 tracking-tight"
              >
                <ExternalLink size={13} />
                <span>Ouvrir dans l'Éditeur / Compilateur Python en ligne (avec Bibliothèques)</span>
              </a>

              <div className="flex gap-2">
                <button
                  onClick={() => setActivePySolution(null)}
                  className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-155 border border-gray-250 bg-white rounded-lg cursor-pointer transition-colors"
                >
                  Fermer
                </button>
                <button
                  onClick={handleExecuteActivePy}
                  disabled={isExecutingPy}
                  className="px-5 py-2 text-xs font-bold bg-violet-600 hover:bg-violet-700 text-white rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                >
                  {isExecutingPy ? (
                    <>
                      <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Exécution...</span>
                    </>
                  ) : (
                    <>
                      <Play size={10} className="fill-current" />
                      <span>Exécuter la Solution</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* OVERLAY POUR LIRE TXT CORRESPONDANT */}
      {activeTxtSolution && (
        <div id="txt-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity overflow-y-auto">
          <div className="bg-white rounded-2xl border border-[#E5E7EB] w-full max-w-xl max-h-[95vh] flex flex-col overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="p-5 bg-blue-50 border-b border-blue-100 flex justify-between items-center text-left">
              <div>
                <span className="text-[9px] bg-blue-150 text-blue-800 font-extrabold uppercase px-2.5 py-1 rounded tracking-wider">
                  📖 COMPTE-RENDU & EXPLICATION SOLUTION (.txt)
                </span>
                <h3 className="text-[#0F1E36] font-black text-sm tracking-tight mt-1 leading-snug">
                  {activeTxtSolution.title}
                </h3>
              </div>
              <button
                onClick={() => setActiveTxtSolution(null)}
                className="text-gray-400 hover:text-gray-600 font-bold bg-white p-1 rounded-full border border-gray-200 shadow-3xs cursor-pointer text-xs transition-all w-6 h-6 flex items-center justify-center"
              >
                ✕
              </button>
            </div>

            {/* Modal content */}
            <div className="p-5 space-y-4 flex-1 overflow-y-auto text-left">
              <div className="text-[11px] text-gray-550 leading-relaxed bg-slate-50 p-2 text-center rounded border border-slate-150">
                <strong>Module:</strong> {activeTxtSolution.module}
              </div>

              <div className="p-4 bg-gray-50 rounded-xl border border-gray-150 whitespace-pre-wrap font-mono text-xs text-gray-800 leading-relaxed max-h-64 overflow-y-auto select-all">
                {activeTxtSolution.textContent || "Aucun contenu d'explication textuelle n'est rédigé."}
              </div>
            </div>

            {/* Modal actions */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2 text-xs">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(activeTxtSolution.textContent || "");
                  alert("Texte copié dans le presse-papiers avec succès !");
                }}
                className="px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-155 border border-gray-250 bg-white rounded-lg cursor-pointer transition-colors"
              >
                Copier le Texte
              </button>
              <button
                onClick={() => setActiveTxtSolution(null)}
                className="px-5 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white rounded-lg cursor-pointer transition-colors"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE DEBLOCAGE DE L'OFFRE PREMIUM */}
      {showUpgradeModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-opacity">
          <div className="bg-white rounded-3xl border border-[#E5E7EB] w-full max-w-lg overflow-hidden shadow-2xl animate-in fade-in zoom-in-95 duration-150 text-left">
            <div className="p-6 bg-red-50 border-b border-red-100 flex justify-between items-center">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[#E11D48]/15 flex items-center justify-center text-[#E11D48] shrink-0">
                  <Lock size={20} />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-[#E11D48] uppercase tracking-wider block">Option Freemium Active 🖥️</span>
                  <h3 className="text-[#0F1E36] font-extrabold text-sm tracking-tight mt-0.5">Débloquer : {targetCourseTitle || "Contenu Premium"}</h3>
                </div>
              </div>
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="text-gray-400 hover:text-gray-650 bg-white p-1 rounded-full border border-gray-200 cursor-pointer text-xs w-6 h-6 flex items-center justify-center shadow-3xs"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <p className="text-xs text-gray-600 leading-relaxed">
                Vous utilisez actuellement la version <strong>Freemium gratuite</strong> d'A-Zed Info. Pour débloquer l'accès complet et illimité à l'intégralité de nos chapitres officiels, fiches de révision BAC, codes sources Python, et webinaires Zoom en direct :
              </p>

              <div className="bg-slate-50 border border-slate-150 rounded-2xl p-4 space-y-2.5">
                <div className="flex justify-between items-center border-b border-slate-200/50 pb-2 text-xs">
                  <span className="font-bold text-[#0F1E36]">Formule Premium Annuelle / Toutes Options</span>
                  <span className="font-mono font-black text-emerald-650 text-right">120 DT / Académique</span>
                </div>
                <ul className="space-y-1.5 text-[11px] text-gray-500">
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Accès illimité à tous les cours vidéos & fiches PDF de révision</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Accès aux travaux pratiques d'évaluation et solutions d'examens BAC</span>
                  </li>
                  <li className="flex items-start gap-1.5">
                    <span className="text-emerald-500 font-bold">✓</span>
                    <span>Compilateur Python & IA Coach en autonomie complète</span>
                  </li>
                </ul>
              </div>

              <div className="border border-[#10B981]/20 bg-[#10B981]/5 rounded-2xl p-4 space-y-2 text-xs">
                <h4 className="font-bold text-[#0F1E36] flex items-center gap-1">
                  <span>🚀 Comment procéder à l'activation ?</span>
                </h4>
                <p className="text-[11px] text-gray-600 leading-normal">
                  Effectuez un transfert de <strong>120 DT</strong> par virement bancaire sur notre <strong>RIB {settings.payments.rib.bankName} ({settings.payments.rib.ribNumber})</strong> ou par transfert postal rapide par <strong>D17 (Mobile: {settings.payments.d17.phone})</strong>.
                </p>
                <p className="text-[11px] text-gray-600 leading-normal font-semibold">
                  Une fois le transfert effectué, déposez la capture d'écran de votre reçu directement depuis l'onglet "Mon Espace Profil" &rarr; "Justifier l'Acquisition" pour une validation instantanée !
                </p>
              </div>
            </div>

            <div className="p-4 border-t border-gray-100 bg-gray-50 flex flex-wrap justify-end gap-2 text-xs">
              <button
                onClick={() => setShowUpgradeModal(false)}
                className="px-4 py-2 font-medium text-gray-700 bg-white border border-gray-250 hover:bg-gray-50 rounded-xl cursor-pointer"
              >
                Repasser plus tard
              </button>
              {onGoToShop && (
                <button
                  onClick={() => {
                    setShowUpgradeModal(false);
                    onGoToShop();
                  }}
                  className="px-5 py-2 font-bold bg-amber-500 hover:bg-amber-600 text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
                >
                  <span>S'abonner sur le Shop (120 DT)</span>
                  <span>🚀</span>
                </button>
              )}
              <button
                onClick={() => {
                  setShowUpgradeModal(false);
                  alert("Pour charger votre reçu de paiement, veuillez vous diriger vers l'onglet 'Mon Espace Profil' !");
                }}
                className="px-5 py-2 font-black bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-xs cursor-pointer inline-flex items-center gap-1.5"
              >
                <span>Téléverser mon reçu</span>
                <span>&rarr;</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
