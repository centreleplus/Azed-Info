import { useState, useEffect, useContext, useMemo, useCallback, useRef } from "react";
import { Play, Video, Lock, Sparkles, Download, ArrowRight, ShieldAlert, FileText, Terminal, Copy, Check, ExternalLink, Info, AlertTriangle, BookOpen, Image as ImageIcon, Layers } from "lucide-react";
import { Language, translations } from "../lib/translations";
import usePagination from "../hooks/usePagination";
import PaginationControls from "./PaginationControls";
import ChaptersTabsBar from "./ChaptersTabsBar";
import { useSettings } from "./SettingsContext";
import { getStudentSessionCache, clearStudentSessionCache, resolveSafePdfUrl, openOrDownloadPdfDocument, getStoredDocuments, getDeletedDocumentIds, mergeAndPersistDocuments, getGlobalDocuments, getGlobalCustomChapters } from "../utils/documentAccess";
import { filterDocuments as centralFilterDocuments, normalize, normalizeBadgeKey, BADGE_HIERARCHY_RANK } from "../utils/documentFilter";
import { UserContext, getActiveUserSynced } from "./AuthContext";

interface CourseItem {
  id: string;
  title: string;
  duration: string;
  grade: string;
  levels?: string[];
  filiere?: string | string[];
  stream?: string;
  section?: string;
  minBadge?: string;
  requiredBadge?: string;
  badges?: string[];
  allowedBadges?: string[];
  trimester?: string;
  submenu?: string;
  subMenu?: string;
  category?: string;
  module: string;
  isPremium: boolean;
  targetAudience?: string[];
  targetTiers?: any[];
  allowedTiers?: any[];
  target?: {
    gradeLevels?: string[];
    streams?: string[];
    userCategories?: string[];
  };
  videoUrl: string;
  fileUrl?: string;
  fileData?: string;
  blobUrl?: string;
  attachmentName: string;
  contentType?: string;
  fileType?: string;
  textContent?: string;
  solutionCode?: string;
  trimestre?: string;
}

const COURSES_DATA: CourseItem[] = [];

const normalizeTrimestre = (trim?: string) => {
  if (!trim) return "";
  const t = normalize(trim);
  if (!t || t === "all" || t === "global" || t.includes("tous") || t.includes("toutes")) return "all";
  if (t.includes("1er") || t.includes("1ere") || t === "t1" || t === "1") {
    return "1ere trimestre";
  }
  if (t.includes("2eme") || t.includes("2nd") || t === "t2" || t === "2") {
    return "2eme trimestre";
  }
  if (t.includes("3eme") || t === "t3" || t === "3") {
    return "3eme trimestre";
  }
  if (t.includes("revision") || t.includes("live") || t.includes("enonce") || t.includes("replay")) {
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
  if (norm === "revision") return "Live Enregistré";
  return trim;
};

export function filterDocuments(
  file: any,
  user: any,
  options?: { selectedTrimestre?: string; activeCategory?: string }
): boolean {
  return centralFilterDocuments(file, user, {
    ...options,
    activeCategory: options?.activeCategory || "Fiches & cours"
  });
}

interface CoursViewProps {
  isPremiumUser: boolean;
  userGrade: string;
  userSection?: string;
  userRole?: string;
  selectedTrimestre?: string;
  currentLanguage?: Language;
  studentUpdatesConfig?: any;
  onGoToShop?: () => void;
  currentUser?: any;
  userPlan?: string;
}

export default function CoursView({ isPremiumUser, userGrade, userSection, userRole = "student", selectedTrimestre, currentLanguage = "fr", studentUpdatesConfig, onGoToShop, currentUser, userPlan }: CoursViewProps) {
  const { settings } = useSettings();
  const auth = useContext(UserContext);
  const syncedUser = useMemo(() => getActiveUserSynced(), [currentUser, auth?.user, userGrade, userSection, userPlan]);
  const liveUser = auth?.user || currentUser || syncedUser;
  const t = translations[currentLanguage];
  const isStudent = userRole === "student";

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Extract primitive user fields to prevent object-reference re-render glitches
  const userId = String(liveUser?.id || liveUser?._id || syncedUser?.id || "");
  const userBadge = String(
    userPlan ||
    syncedUser?.activeBadge ||
    syncedUser?.badge ||
    liveUser?.activeBadge ||
    liveUser?.badge ||
    liveUser?.subscriptionBadge ||
    liveUser?.subscriptionPlan ||
    liveUser?.forfait ||
    liveUser?.tierCategory ||
    (isPremiumUser ? "ESSENTIEL" : "FREEMIUM")
  );
  const primitiveGrade = String(userGrade || liveUser?.grade || liveUser?.level || syncedUser?.grade || syncedUser?.level || "");
  const primitiveStream = String(userSection || liveUser?.stream || liveUser?.section || syncedUser?.section || syncedUser?.stream || "");
  const primitiveRole = String(userRole || liveUser?.role || syncedUser?.role || "student");

  const effectiveUser = useMemo(() => ({
    id: userId,
    role: primitiveRole,
    grade: primitiveGrade,
    stream: primitiveStream,
    section: primitiveStream,
    badge: userBadge,
    activeBadge: userBadge,
    subscriptionPlan: userBadge,
    isPremium: isPremiumUser || normalizeBadgeKey(userBadge) !== "FREEMIUM",
    accountType: isPremiumUser || normalizeBadgeKey(userBadge) !== "FREEMIUM" ? "premium" : "freemium"
  }), [userId, primitiveRole, primitiveGrade, primitiveStream, userBadge, isPremiumUser]);

  const sessionKey = `${userId}|${userBadge}|${primitiveGrade}|${primitiveStream}`;
  const sessionCache = getStudentSessionCache(sessionKey);

  const [allCourses, setAllCourses] = useState<CourseItem[]>(() => sessionCache.courses || COURSES_DATA);
  const [loading, setLoading] = useState<boolean>(() => sessionCache.courses === null);
  const [error, setError] = useState<string | null>(null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const cachedCoursesRef = useRef<CourseItem[] | null>(sessionCache.courses);

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

  // Memoized fetchCourses strictly executed once per active session
  const fetchCourses = useCallback(async (checkMounted: () => boolean = () => true) => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    if (!cachedCoursesRef.current) {
      setLoading(true);
    }
    setError(null);
    try {
      const [coursesRes, adminDocsRes] = await Promise.allSettled([
        fetch("/api/courses", {
          signal: controller.signal,
          headers: {
            "x-user-id": userId,
            "x-user-grade": primitiveGrade,
            "x-user-section": primitiveStream,
            "x-user-stream": primitiveStream,
            "x-user-role": primitiveRole,
            "x-user-badge": userBadge,
            "x-user-plan": userBadge
          }
        }).then((r) => (r.ok ? r.json() : [])),
        fetch("/api/admin/documents", { signal: controller.signal }).then((r) => (r.ok ? r.json() : []))
      ]);

      const rawCourseData = coursesRes.status === "fulfilled" ? coursesRes.value : [];
      const filesList = Array.isArray(rawCourseData)
        ? rawCourseData
        : Array.isArray(rawCourseData?.files)
        ? rawCourseData.files
        : [];

      const rawAdminData = adminDocsRes.status === "fulfilled" ? adminDocsRes.value : [];
      const adminList = Array.isArray(rawAdminData?.documents)
        ? rawAdminData.documents
        : Array.isArray(rawAdminData)
        ? rawAdminData
        : [];

      const globalDocs = getGlobalDocuments();
      const mergedRaw = mergeAndPersistDocuments([...globalDocs, ...adminList, ...filesList]);
      const deletedIds = getDeletedDocumentIds();
      const finalCourses: CourseItem[] = mergedRaw
        .filter((item: any) => item && item.id && !deletedIds.has(String(item.id)))
        .map((item: any) => {
          const resolvedUrl =
            item.videoUrl ||
            item.fileUrl ||
            item.blobUrl ||
            item.fileData ||
            "";
          return {
            ...item,
            videoUrl: resolvedUrl,
            fileUrl: item.fileUrl || resolvedUrl,
            fileData: item.fileData || "",
            blobUrl: item.blobUrl || ""
          } as CourseItem;
        });
      if (checkMounted()) {
        const currentCache = getStudentSessionCache(`${userId}|${userBadge}|${primitiveGrade}|${primitiveStream}`);
        currentCache.courses = finalCourses;
        cachedCoursesRef.current = finalCourses;
        setAllCourses(finalCourses);
      }
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Erreur lors de la récupération des cours:", err);
      if (checkMounted()) {
        const localFallback = getStoredDocuments() as CourseItem[];
        if (localFallback.length > 0) {
          setAllCourses(localFallback);
        } else if (!cachedCoursesRef.current) {
          setError(err?.message || "Impossible de charger les cours.");
          setAllCourses([]);
        } else {
          setAllCourses(cachedCoursesRef.current);
        }
      }
    } finally {
      if (checkMounted()) setLoading(false);
    }
  }, [userBadge, primitiveGrade, primitiveStream, primitiveRole, userId]);

  // Chargement au montage et synchronisation en temps réel lors d'un ajout/modification de document
  useEffect(() => {
    let isMounted = true;
    if (cachedCoursesRef.current !== null && cachedCoursesRef.current.length > 0) {
      setAllCourses(cachedCoursesRef.current);
      setLoading(false);
    } else {
      fetchCourses(() => isMounted);
    }

    const handleDocSync = () => {
      if (!isMounted) return;
      clearStudentSessionCache();
      cachedCoursesRef.current = null;
      fetchCourses(() => isMounted);
    };

    window.addEventListener("zed-documents-updated", handleDocSync);
    window.addEventListener("document-updated", handleDocSync);
    window.addEventListener("documents-updated", handleDocSync);
    window.addEventListener("admin-document-created", handleDocSync);
    window.addEventListener("admin-content-updated", handleDocSync);
    window.addEventListener("realtime-event", handleDocSync);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("azed_docs_sync");
      bc.onmessage = () => handleDocSync();
    } catch (e) {}

    return () => {
      isMounted = false;
      window.removeEventListener("zed-documents-updated", handleDocSync);
      window.removeEventListener("document-updated", handleDocSync);
      window.removeEventListener("documents-updated", handleDocSync);
      window.removeEventListener("admin-document-created", handleDocSync);
      window.removeEventListener("admin-content-updated", handleDocSync);
      window.removeEventListener("realtime-event", handleDocSync);
      if (bc) {
        try { bc.close(); } catch (e) {}
      }
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Filtrage multicritères souple et exhaustif via filterDocuments(course, effectiveUser)
  const filteredCourses = useMemo(() => {
    return allCourses.filter((course) =>
      filterDocuments(course, effectiveUser, {
        selectedTrimestre,
        activeCategory: "Fiches & cours"
      })
    );
  }, [allCourses, selectedTrimestre, isStudent, effectiveUser]);

  // Chapter Tabs & Independent Pagination per Chapter
  const [activeChapter, setActiveChapter] = useState<string>("ALL");

  const matchesCourseChapter = useCallback((c: CourseItem, chapter: string): boolean => {
    if (chapter === "ALL" || chapter === "all") return true;
    const normActive = normalize(chapter);
    const rawCh = (c.module || (c as any).chapterTitle || (c as any).chapter || "").trim();
    const normMod = normalize(rawCh);
    const normTitle = normalize(c.title || "");

    if (normActive === "rappels" || normActive === "rappel") {
      return (
        normMod.includes("rappel") ||
        normTitle.includes("rappel") ||
        normalize(c.contentType || "") === "revision"
      );
    }
    return Boolean(normMod) && normMod === normActive;
  }, []);

  const availableChapters = useMemo(() => {
    const seenNormalized = new Set<string>(["rappels"]);
    const uniqueChapters: string[] = ["Rappels"];

    const addChapterIfUnique = (raw: string) => {
      const cleaned = String(raw || "").trim().replace(/\s+/g, " ");
      const normCh = normalize(cleaned);
      if (!cleaned || normCh === "general" || normCh === "fichiers" || normCh === "fichier") {
        return;
      }
      const canonicalKey = normCh === "rappel" || normCh === "rappels" ? "rappels" : normCh;
      if (!seenNormalized.has(canonicalKey)) {
        seenNormalized.add(canonicalKey);
        uniqueChapters.push(cleaned);
      }
    };

    filteredCourses.forEach((c) => {
      const ch = (c.module || (c as any).chapterTitle || (c as any).chapter || "").trim();
      addChapterIfUnique(ch);
    });
    const customChapters = getGlobalCustomChapters();
    customChapters.forEach((ch) => {
      addChapterIfUnique(ch);
    });
    return ["ALL", ...uniqueChapters].filter(
      (ch) => ch === "ALL" ? filteredCourses.length > 0 : filteredCourses.some((c) => matchesCourseChapter(c, ch))
    );
  }, [filteredCourses, matchesCourseChapter]);

  const coursesFilteredByChapter = useMemo(() => {
    if (activeChapter === "ALL") return filteredCourses;
    return filteredCourses.filter((c) => matchesCourseChapter(c, activeChapter));
  }, [filteredCourses, activeChapter, matchesCourseChapter]);

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
  } = usePagination({ data: coursesFilteredByChapter, initialItemsPerPage: 6 });

  const handleTabChange = (chapter: string) => {
    setActiveChapter(chapter);
    courseGoToPage(1);
  };

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

      {/* Chapter Filtering Tabs with Red Scroll Indicator */}
      <ChaptersTabsBar
        availableChapters={availableChapters}
        activeChapter={activeChapter}
        handleTabChange={handleTabChange}
        getChapterCount={(chapter) =>
          chapter === "ALL"
            ? filteredCourses.length
            : filteredCourses.filter((c) => matchesCourseChapter(c, chapter)).length
        }
      />

      {/* COURSES LIST DISPLAY MATRIX */}
      {loading ? (
        <div className="text-center py-16 space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-slate-500 font-medium">Chargement des cours et documents...</p>
        </div>
      ) : error ? (
        <div className="border border-dashed border-rose-200 rounded-2xl p-10 text-center bg-rose-50/50 space-y-3">
          <p className="text-xs font-bold text-rose-600">{error}</p>
          <button onClick={() => fetchCourses(() => true)} className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl">Réessayer</button>
        </div>
      ) : (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {coursesFilteredByChapter.length === 0 ? (
          <div className="col-span-full border border-dashed border-[#E5E7EB] rounded-2xl p-10 text-center bg-[#F9FAFB]">
            <ShieldAlert size={40} className="text-gray-400 mx-auto mb-3" />
            <h4 className="font-semibold text-[#0F1E36] text-sm mb-1">Aucun document disponible pour votre filière et ce trimestre</h4>
            <p className="text-xs text-gray-500">Aucun document ou cours n'a été publié pour ce niveau, cette filière et ce trimestre.</p>
          </div>
        ) : (
          paginatedCourses.map((course) => {
            const isLocked = false;

            // Determine course file type dynamically
            const getFileType = (c: CourseItem) => {
              if (c.fileType) return c.fileType.toLowerCase();
              const name = (c.attachmentName || "").toLowerCase();
              const url = (c.videoUrl || "").toLowerCase();
              if (name.endsWith(".png") || url.endsWith(".png")) return "png";
              if (name.endsWith(".jpg") || url.endsWith(".jpg")) return "jpg";
              if (name.endsWith(".jpeg") || url.endsWith(".jpeg")) return "jpeg";
              if (name.endsWith(".webp") || url.endsWith(".webp")) return "webp";
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
                className={`course-card student-card-bg border rounded-2xl overflow-hidden hover:border-slate-350 dark:hover:border-slate-500 transition-all duration-300 relative group`}
                style={{
                  ...cardStyle,
                  backgroundImage: "url('/hexagon-pattern.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat"
                }}
              >
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4 bg-white/30 backdrop-blur-[1px] dark:bg-slate-900/40 h-full">
                  <div>
                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                      <span className="font-bold text-gray-800 dark:text-gray-200 uppercase tracking-widest text-[10px]">{course.module}</span>
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
                    ) : ["png", "jpg", "jpeg", "webp"].includes(fileType) ? (
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
                        href={resolveSafePdfUrl(course) || `/api/courses/pdf/${course.id}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(e) => openOrDownloadPdfDocument(course, e)}
                        className="px-3.5 py-1.5 rounded-lg font-bold flex items-center gap-1 bg-emerald-600 text-white hover:bg-emerald-700 cursor-pointer text-xs"
                      >
                        <FileText size={12} />
                        <span>Consulter</span>
                      </a>
                    ) : (
                      <button
                        onClick={() => {
                          if (course.isPremium && !isPremiumUser) {
                            alert("⚠️ Ce cours vidéo Premium est verrouillé. Veuillez régulariser votre accès annuel de 120 DT auprès du directeur pédagogique Professeur Nabil Chaouch.");
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
      )}

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
