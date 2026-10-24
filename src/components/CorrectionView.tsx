import { useState, useEffect, useCallback, useMemo, useRef } from "react";
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
import ChaptersTabsBar from "./ChaptersTabsBar";
import { getYouTubeEmbedUrl } from "../lib/youtube";
import { getStudentSessionCache, clearStudentSessionCache, resolveSafePdfUrl, openOrDownloadPdfDocument, getStoredDocuments } from "../utils/documentAccess";
import { getMediaType } from "../lib/buttonUtils";
import { getActiveUserSynced } from "./AuthContext";

interface CourseItem {
  id: string;
  title: string;
  duration: string;
  grade: string;
  levels?: string[];
  filiere?: string | string[];
  section?: string;
  stream?: string;
  module: string;
  isPremium: boolean;
  targetAudience?: string[];
  targetTiers?: any[];
  allowedTiers?: any[];
  badges?: string[];
  allowedBadges?: string[];
  target?: {
    gradeLevels?: string[];
    streams?: string[];
    userCategories?: string[];
  };
  videoUrl?: string;
  fileUrl?: string;
  fileData?: string;
  blobUrl?: string;
  attachmentName: string;
  contentType?: string;
  category?: string;
  submenu?: string;
  subMenu?: string;
  fileType?: string;
  textContent?: string;
  solutionCode?: string;
  trimestre?: string;
  trimester?: string;
}

const stripAccents = (str: string = ""): string =>
  String(str || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

const normalizeBadgeKey = (rawBadge: any): string => {
  const clean = stripAccents(String(rawBadge || ""));
  if (!clean || clean.includes("freemium") || clean.includes("gratuit") || clean === "free") return "FREEMIUM";
  if (clean.includes("integral")) return "INTEGRAL";
  if (clean.includes("revision") || clean.includes("premium plus") || clean.includes("premium+")) return "REVISION+";
  if (clean.includes("live") || clean === "premium") return "LIVE+";
  if (clean.includes("essentiel")) return "ESSENTIEL";
  return "FREEMIUM";
};

const BADGE_HIERARCHY_RANK: Record<string, number> = {
  FREEMIUM: 0,
  ESSENTIEL: 1,
  "LIVE+": 2,
  "REVISION+": 3,
  INTEGRAL: 4
};

const normalizeTrimestre = (trim?: string) => {
  if (!trim) return "";
  const t = stripAccents(trim);
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
  if (t.includes("revision") || t.includes("live") || t.includes("correction") || t.includes("enonce") || t.includes("replay")) {
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

export function filterDocuments(
  file: any,
  user: any,
  options?: { selectedTrimestre?: string; activeCategory?: string }
): boolean {
  if (!file || file.isInternalAdminOnly || file.isPublished === false || file.deleted) {
    return false;
  }

  // 1. Correspondance de la Catégorie Correction (normalisation .toLowerCase().trim())
  const ct = String(file.contentType || "").toLowerCase().trim();
  const catLower = String(file.category || "").toLowerCase().trim();
  const rawSub = String(file.submenu || file.subMenu || file.trimestre || file.trimester || "").toLowerCase().trim();
  const isCorrectionDoc =
    ct === "exercise_corrected" ||
    catLower.includes("correction") ||
    catLower.includes("corrig") ||
    rawSub === "correction";

  if (!isCorrectionDoc) {
    return false;
  }

  // 2. Correspondance du Sous-menu / Trimestre (normalisation .toLowerCase().trim())
  if (options?.selectedTrimestre) {
    const reqTrimNorm = normalizeTrimestre(options.selectedTrimestre);
    if (reqTrimNorm && reqTrimNorm !== "all") {
      const docTrimNorm = normalizeTrimestre(rawSub);
      if (docTrimNorm && docTrimNorm !== "all" && docTrimNorm !== reqTrimNorm) {
        return false;
      }
    }
  }

  const userRole = String(user?.role || "student").toLowerCase().trim();
  const isStaff = userRole === "admin" || userRole === "agent";

  if (!isStaff && user) {
    // 3. Assouplissement du Filtrage par Niveau (levels / gradeLevels / grade)
    const rawLevelsSource =
      Array.isArray(file.levels) && file.levels.length > 0
        ? file.levels
        : Array.isArray(file.target?.gradeLevels) && file.target.gradeLevels.length > 0
        ? file.target.gradeLevels
        : Array.isArray(file.gradeLevels) && file.gradeLevels.length > 0
        ? file.gradeLevels
        : file.grade
        ? Array.isArray(file.grade)
          ? file.grade
          : String(file.grade).split(",").map((s: string) => s.trim()).filter(Boolean)
        : file.level
        ? [String(file.level).trim()]
        : [];

    const isAllLevels =
      rawLevelsSource.length === 0 ||
      rawLevelsSource.some((lvl: any) => {
        const l = stripAccents(String(lvl || ""));
        return !l || l === "all" || l === "global" || l.includes("tous") || l.includes("toutes");
      });

    const userGradeClean = stripAccents(user?.grade || user?.level || user?.gradeLevel || "");
    const isUserGradeEmpty =
      !userGradeClean || userGradeClean === "all" || userGradeClean.includes("tous");

    if (!isAllLevels && !isUserGradeEmpty) {
      const levelMatched = rawLevelsSource.some((lvl: any) => {
        const l = stripAccents(String(lvl || ""));
        if (!l || l === "all" || l.includes("tous") || l.includes("toutes")) return true;
        if ((l.includes("4") || l.includes("bac") || l.includes("term")) && (userGradeClean.includes("4") || userGradeClean.includes("bac") || userGradeClean.includes("term"))) return true;
        if (l.includes("3") && userGradeClean.includes("3")) return true;
        if (l.includes("2") && userGradeClean.includes("2")) return true;
        if (l.includes("1") && userGradeClean.includes("1")) return true;
        return l === userGradeClean || l.includes(userGradeClean) || userGradeClean.includes(l);
      });
      if (!levelMatched) return false;
    }

    // 4. Assouplissement du Filtrage par Filière (filiere / streams / section)
    const rawFiliereSource =
      Array.isArray(file.filiere) && file.filiere.length > 0
        ? file.filiere
        : typeof file.filiere === "string" && file.filiere.trim()
        ? file.filiere.split(",").map((s: string) => s.trim()).filter(Boolean)
        : Array.isArray(file.target?.streams) && file.target.streams.length > 0
        ? file.target.streams
        : Array.isArray(file.streams) && file.streams.length > 0
        ? file.streams
        : file.section
        ? Array.isArray(file.section)
          ? file.section
          : String(file.section).split(",").map((s: string) => s.trim()).filter(Boolean)
        : file.stream
        ? [String(file.stream).trim()]
        : [];

    const isAllFilieres =
      rawFiliereSource.length === 0 ||
      rawFiliereSource.some((f: any) => {
        const fl = stripAccents(String(f || ""));
        return !fl || fl === "all" || fl === "global" || fl.includes("tous") || fl.includes("toutes");
      });

    const userFiliereClean = stripAccents(
      user?.section || user?.stream || user?.filiere || user?.field || ""
    );
    const isUserFiliereEmpty =
      !userFiliereClean || userFiliereClean === "all" || userFiliereClean.includes("tous") || userFiliereClean.includes("toutes");

    if (!isAllFilieres && !isUserFiliereEmpty) {
      const filiereMatched = rawFiliereSource.some((f: any) => {
        const fl = stripAccents(String(f || ""));
        if (!fl || fl === "all" || fl.includes("tous") || fl.includes("toutes")) return true;
        if ((fl.includes("tronc") || fl.includes("commun")) && (userFiliereClean.includes("tronc") || userFiliereClean.includes("commun") || userGradeClean.includes("1"))) return true;
        if (userGradeClean.includes("1") && rawLevelsSource.some((l: any) => stripAccents(String(l)).includes("1"))) return true;
        if ((fl.includes("info") || fl === "sti") && (userFiliereClean.includes("info") || userFiliereClean === "sti")) return true;
        if (fl.includes("math") && userFiliereClean.includes("math")) return true;
        if ((fl.includes("exp") || fl === "svt") && (userFiliereClean.includes("exp") || userFiliereClean === "svt")) return true;
        if (fl.includes("tech") && userFiliereClean.includes("tech")) return true;
        if ((fl.includes("eco") || fl.includes("gest")) && (userFiliereClean.includes("eco") || userFiliereClean.includes("gest"))) return true;
        if (fl.includes("lettr") && userFiliereClean.includes("lettr")) return true;
        if (fl.includes("sport") && userFiliereClean.includes("sport")) return true;
        return fl === userFiliereClean || fl.includes(userFiliereClean) || userFiliereClean.includes(fl);
      });
      if (!filiereMatched) return false;
    }

    // 5. Validation Hiérarchique des Badges (Privilèges)
    const rawUserBadge =
      user?.activeBadge ||
      user?.badge ||
      user?.statusBadge ||
      user?.subscriptionBadge ||
      user?.subscriptionPlan ||
      user?.forfait ||
      user?.tierCategory ||
      user?.userCategory ||
      (user?.isPremium || user?.accountType === "premium" ? "ESSENTIEL" : "FREEMIUM");

    const normUserBadge = normalizeBadgeKey(rawUserBadge);
    const userRank = BADGE_HIERARCHY_RANK[normUserBadge] ?? 0;

    const rawDocBadges: any[] =
      Array.isArray(file.badges) && file.badges.length > 0
        ? file.badges
        : Array.isArray(file.allowedBadges) && file.allowedBadges.length > 0
        ? file.allowedBadges
        : Array.isArray(file.allowedTiers) && file.allowedTiers.length > 0
        ? file.allowedTiers
        : Array.isArray(file.targetTiers) && file.targetTiers.length > 0
        ? file.targetTiers
        : Array.isArray(file.accessTiers) && file.accessTiers.length > 0
        ? file.accessTiers
        : Array.isArray(file.tiers) && file.tiers.length > 0
        ? file.tiers
        : Array.isArray(file.target?.userCategories) && file.target.userCategories.length > 0
        ? file.target.userCategories
        : file.minBadge || file.requiredBadge || file.badge || file.badgeType
        ? [file.minBadge || file.requiredBadge || file.badge || file.badgeType]
        : [];

    const normDocBadges = rawDocBadges
      .map((b: any) => normalizeBadgeKey(b))
      .filter(Boolean);

    let requiredRank = 0;
    if (normDocBadges.length > 0) {
      if (normDocBadges.includes("FREEMIUM") && !file.isPremium) {
        requiredRank = 0;
      } else {
        requiredRank = Math.min(...normDocBadges.map((b: string) => BADGE_HIERARCHY_RANK[b] ?? 0));
      }
    } else if (file.isPremium) {
      requiredRank = 1;
    }

    const isBadgeIncluded =
      normDocBadges.length === 0 ||
      normDocBadges.includes(normUserBadge) ||
      (normDocBadges.includes("FREEMIUM") && !file.isPremium);

    const hasRankPrivilege = userRank >= requiredRank;
    if (!hasRankPrivilege && !isBadgeIncluded) {
      return false;
    }
  }

  return true;
}

interface CorrectionViewProps {
  isPremiumUser: boolean;
  userGrade: string;
  userSection?: string;
  selectedTrimestre: string; // "3eme trimestre" or "revision"
  userRole?: string;
  currentLanguage?: Language;
  onGoToShop?: () => void;
  currentUser?: any;
  userPlan?: string;
}

export default function CorrectionView({
  isPremiumUser,
  userGrade,
  userSection = "Tous",
  selectedTrimestre,
  userRole = "student",
  currentLanguage = "fr",
  onGoToShop,
  currentUser,
  userPlan
}: CorrectionViewProps) {
  const t = translations[currentLanguage];
  const isStudent = userRole === "student";
  const syncedUser = useMemo(() => getActiveUserSynced(), [currentUser, userGrade, userSection, userPlan]);
  const liveUser = currentUser || syncedUser;

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

  // Mémorisation de effectiveUser uniquement sur des valeurs primitives (jamais l'objet user entier)
  const effectiveUser = useMemo(() => {
    return {
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
    };
  }, [userId, primitiveRole, primitiveGrade, primitiveStream, userBadge, isPremiumUser]);

  const sessionKey = `${userId}|${userBadge}|${primitiveGrade}|${primitiveStream}`;
  const sessionCache = getStudentSessionCache(sessionKey);

  const [allExercises, setAllExercises] = useState<CourseItem[]>(() => sessionCache.corrections || []);
  const [selectedModule, setSelectedModule] = useState<string>("all");
  const [loading, setLoading] = useState<boolean>(() => sessionCache.corrections === null);

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

  const [error, setError] = useState<string | null>(null);

  const activeControllerRef = useRef<AbortController | null>(null);
  const cachedExercisesRef = useRef<CourseItem[] | null>(sessionCache.corrections);

  // 1. Mémorisation de fetchCorrections (récupère toutes les corrections autorisées en une seule fois pour la session)
  const fetchCorrections = useCallback(async (checkMounted: () => boolean = () => true) => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    if (!cachedExercisesRef.current) {
      setLoading(true);
    }
    setError(null);

    // Timeout de secours 4 secondes max
    const timeoutId = setTimeout(() => {
      if (!controller.signal.aborted) {
        controller.abort();
        if (checkMounted()) {
          setLoading(false);
          if (!cachedExercisesRef.current) {
            const localFallback = getStoredDocuments().filter((doc: any) =>
              filterDocuments(doc, effectiveUser, { activeCategory: "Zone Correction" })
            ) as CourseItem[];
            setAllExercises(localFallback);
          }
        }
      }
    }, 4000);

    try {
      const [corrRes, adminDocsRes] = await Promise.allSettled([
        fetch(`/api/corrections`, {
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
        fetch(`/api/admin/documents`, { signal: controller.signal }).then((r) => (r.ok ? r.json() : []))
      ]);
      clearTimeout(timeoutId);

      const corrList =
        corrRes.status === "fulfilled" && Array.isArray(corrRes.value)
          ? corrRes.value
          : [];
      const adminList =
        adminDocsRes.status === "fulfilled"
          ? Array.isArray(adminDocsRes.value?.documents)
            ? adminDocsRes.value.documents
            : Array.isArray(adminDocsRes.value)
            ? adminDocsRes.value
            : []
          : [];
      const localStored = getStoredDocuments();

      const mergedMap = new Map<string, any>();
      for (const item of [...adminList, ...corrList, ...localStored]) {
        if (item && item.id) {
          const key = String(item.id);
          const existing = mergedMap.get(key) || {};
          const resolvedUrl =
            item.videoUrl ||
            item.fileUrl ||
            item.blobUrl ||
            item.fileData ||
            existing.videoUrl ||
            existing.fileUrl ||
            existing.blobUrl ||
            existing.fileData ||
            "";
          mergedMap.set(key, {
            ...existing,
            ...item,
            videoUrl: resolvedUrl,
            fileUrl: item.fileUrl || resolvedUrl,
            fileData: item.fileData || existing.fileData || "",
            blobUrl: item.blobUrl || existing.blobUrl || ""
          });
        }
      }

      if (checkMounted()) {
        const rawList = Array.from(mergedMap.values());
        const strictList = rawList.filter((doc: any) =>
          filterDocuments(
            doc,
            {
              id: userId,
              role: primitiveRole,
              badge: userBadge,
              activeBadge: userBadge,
              grade: primitiveGrade,
              stream: primitiveStream,
              section: primitiveStream
            },
            {
              activeCategory: "Zone Correction"
            }
          )
        );

        const currentCache = getStudentSessionCache(`${userId}|${userBadge}|${primitiveGrade}|${primitiveStream}`);
        currentCache.corrections = strictList;
        cachedExercisesRef.current = strictList;
        setAllExercises(strictList);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      if (err.name === 'AbortError') return;
      console.error("Error loading corrections:", err);
      if (checkMounted()) {
        const localFallback = getStoredDocuments().filter((doc: any) =>
          filterDocuments(doc, effectiveUser, { activeCategory: "Zone Correction" })
        ) as CourseItem[];
        if (localFallback.length > 0) {
          setAllExercises(localFallback);
        } else if (!cachedExercisesRef.current) {
          setError("Aucune correction disponible ou délai dépassé.");
          setAllExercises([]);
        } else {
          setAllExercises(cachedExercisesRef.current);
        }
      }
    } finally {
      clearTimeout(timeoutId);
      if (checkMounted()) {
        setLoading(false);
      }
    }
  }, [userBadge, primitiveGrade, primitiveStream, primitiveRole, userId, effectiveUser]);

  // 2. Chargement au montage et synchronisation en temps réel lors d'un ajout/modification de document
  useEffect(() => {
    let isMounted = true;
    if (cachedExercisesRef.current !== null && cachedExercisesRef.current.length > 0) {
      setAllExercises(cachedExercisesRef.current);
      setLoading(false);
    } else {
      fetchCorrections(() => isMounted);
    }

    const handleDocSync = () => {
      if (!isMounted) return;
      clearStudentSessionCache();
      cachedExercisesRef.current = null;
      fetchCorrections(() => isMounted);
    };

    window.addEventListener("document-updated", handleDocSync);
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
      window.removeEventListener("document-updated", handleDocSync);
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

  // 3. Filtrage instantané 100% en mémoire locale par trimestre sélectionné (zéro appel réseau au changement d'onglet)
  const exercises = useMemo(() => {
    return allExercises.filter((doc: any) =>
      filterDocuments(doc, effectiveUser, {
        selectedTrimestre: selectedTrimestre || "1er Trimestre",
        activeCategory: "Zone Correction"
      })
    );
  }, [allExercises, effectiveUser, selectedTrimestre]);

  // Extract unique modules (Séries / Chapitres) for filtering
  const uniqueModules = useMemo(() => {
    return Array.from(new Set(exercises.map((item) => item.module || "Général")));
  }, [exercises]);

  // Filter exercises by selected module
  const filteredExercises = useMemo(() => {
    return selectedModule === "all"
      ? exercises
      : exercises.filter((ex) => (ex.module || "Général") === selectedModule);
  }, [exercises, selectedModule]);

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
    alert(`📥 Téléchargement sécurisé de la correction PDF :\n${filename}\n(Certifié conforme et corrigé par Professeur Nabil Chaouch)`);
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

      {/* Chapter/Série Filtering Tabs with Red Scroll Indicator */}
      <ChaptersTabsBar
        availableChapters={["ALL", ...uniqueModules]}
        activeChapter={selectedModule === "all" ? "ALL" : selectedModule}
        handleTabChange={(mod) => {
          setSelectedModule(mod === "ALL" ? "all" : mod);
          exerciseGoToPage(1);
        }}
        getChapterCount={(chapter) =>
          chapter === "ALL" || chapter === "all"
            ? exercises.length
            : exercises.filter((ex) => (ex.module || "Général") === chapter).length
        }
      />

      {/* Loading state or listing */}
      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-[#2563EB] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Chargement des exercices corrigés...</p>
        </div>
      ) : error ? (
        <div className="text-center p-12 border border-dashed border-rose-200 rounded-3xl bg-rose-50/50 space-y-3">
          <p className="text-xs font-bold text-rose-600">{error}</p>
          <button onClick={() => fetchCorrections(() => true)} className="px-4 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl hover:bg-blue-700 transition">Réessayer</button>
        </div>
      ) : filteredExercises.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-200 rounded-3xl bg-slate-50/50 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-blue-50 text-[#2563EB]">
            <BookOpen size={20} />
          </div>
          <h4 className="text-xs font-bold text-gray-800">Aucun document disponible pour votre filière et ce trimestre</h4>
          <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
            Aucune correction disponible pour vos critères académiques (niveau, filière, badge et trimestre sélectionnés).
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
                className="correction-card student-card-bg border border-[#E5E7EB] rounded-2xl overflow-hidden hover:border-[#2563EB]/40 hover:shadow-md transition-all duration-300 relative"
                style={{
                  backgroundImage: "url('/hexagon-pattern.jpg')",
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  backgroundRepeat: "no-repeat"
                }}
              >
                <div className="p-5 bg-white/30 backdrop-blur-[1px] dark:bg-slate-900/40 h-full flex flex-col justify-between space-y-4">
                  <div>
                    <div className="flex justify-between items-center text-[10px] text-gray-500 mb-1 font-semibold">
                      <span className="uppercase text-[#2563EB] bg-blue-100/90 font-bold px-2 py-0.5 rounded">
                        {exercise.module || "Série"}
                      </span>
                    </div>

                    <h3 className="font-bold text-gray-900 dark:text-white text-xs mt-2 line-clamp-2 leading-tight">
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
                    ) : (() => {
                      const { isVideo, isCode } = getMediaType(exercise);

                      // 1. Détection Vidéo Prioritaire (YouTube link/ID, .mp4, webm)
                      if (isVideo) {
                        return (
                          <button
                            onClick={() => {
                              setActiveVideoSolution(exercise);
                              setIsVideoPlaying(true);
                            }}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            <Video size={13} />
                            <span>Vidéo corrigée</span>
                          </button>
                        );
                      }

                      // 2. Détection Code / Python (.py)
                      if (isCode || exercise.fileType === "py") {
                        return (
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
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white font-bold text-[11px] rounded-xl transition-all shadow-xs cursor-pointer"
                          >
                            <Terminal size={12} />
                            <span>Exécuter (.py)</span>
                          </button>
                        );
                      }

                      // 3. Détection Image (.png, .jpg, .jpeg, .webp)
                      if (["png", "jpg", "jpeg", "webp"].includes((exercise.fileType || "").toLowerCase()) || (exercise.attachmentName && /\.(png|jpg|jpeg|webp)$/i.test(exercise.attachmentName))) {
                        const ext = (exercise.fileType || "").toLowerCase().match(/png|jpg|jpeg|webp/)?.[0] || exercise.attachmentName?.split('.').pop()?.toLowerCase() || "png";
                        return (
                          <button
                            onClick={() => {
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
                            <span>Afficher (.${ext})</span>
                          </button>
                        );
                      }

                      // 4. Détection Texte (.txt)
                      if (exercise.fileType === "txt" || (exercise.attachmentName && exercise.attachmentName.toLowerCase().endsWith(".txt"))) {
                        return (
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
                        );
                      }

                      // 5. Par défaut : PDF / Document
                      return (
                        <a
                          href={resolveSafePdfUrl(exercise) || `/api/courses/pdf/${exercise.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          onClick={(e) => openOrDownloadPdfDocument(exercise, e)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold flex items-center gap-1 transition-all cursor-pointer"
                        >
                          <FileText size={11} />
                          <span>Consulter</span>
                        </a>
                      );
                    })()}
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
              <iframe
                src={getYouTubeEmbedUrl(activeVideoSolution.videoUrl)}
                className="w-full aspect-video rounded-lg shadow-md border-0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
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
