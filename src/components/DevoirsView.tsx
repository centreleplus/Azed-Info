import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { Language, translations } from "../lib/translations";
import { 
  FileText, 
  Download, 
  Sparkles, 
  CheckCircle, 
  BookOpen, 
  Code, 
  Clock, 
  ChevronRight,
  Info,
  ShieldCheck,
  X,
  Lock,
  ExternalLink
} from "lucide-react";
import ResourceCard from "./ResourceCard";
import DocumentViewerModal from "./DocumentViewerModal";
import { ExerciseItem } from "./ExerciceDetailModal";
import usePagination from "../hooks/usePagination";
import PaginationControls from "./PaginationControls";
import ChaptersTabsBar from "./ChaptersTabsBar";
import { isDocumentAllowedForStudent, getStudentSessionCache, clearStudentSessionCache, resolveSafePdfUrl, openOrDownloadPdfDocument, getStoredDocuments, getDeletedDocumentIds, mergeAndPersistDocuments, initializeGlobalDocuments, getGlobalDocuments, getGlobalCustomChapters } from "../utils/documentAccess";
import { filterDocuments, normalize } from "../utils/documentFilter";

export interface DevoirItem extends ExerciseItem {
  id: string;
  title: string;
  type?: "Devoir de Contrôle" | "Devoir de Synthèse" | "Exercices d'Application" | string;
  module?: string;
  chapter?: string;
  chapterTitle?: string;
  submenu?: string;
  subMenu?: string;
  trimester?: string;
  trimestre?: string;
  grade?: string;
  levels?: string[];
  filiere?: string | string[];
  stream?: string;
  section?: string;
  minBadge?: string;
  requiredBadge?: string;
  badges?: string[];
  allowedBadges?: string[];
  category?: string;
  contentType?: string;
  duration?: string;
  filename?: string;
  color?: string;
  description?: string;
  questionsCount?: number;
  volume?: string;
  fileType?: "pdf" | "py" | "mp4" | "txt" | string;
  fileUrl?: string;
  fileData?: string;
  blobUrl?: string;
  solutionCode?: string;
  textContent?: string;
  isPremium?: boolean;
  targetAudience?: string[];
  targetTiers?: any[];
  allowedTiers?: any[];
}

const DEVOIRS_DATA: DevoirItem[] = [];

const normalizeTrimestre = (trim?: string) => {
  if (!trim) return "";
  let t = trim.toLowerCase().trim();
  if (t.includes("1er") || t.includes("1ère") || t.includes("1ere") || t === "t1" || t === "1") {
    return "1ere trimestre";
  }
  if (t.includes("2eme") || t.includes("2ème") || t === "t2" || t === "2") {
    return "2eme trimestre";
  }
  if (t.includes("3eme") || t.includes("3ème") || t === "t3" || t === "3") {
    return "3eme trimestre";
  }
  if (t.includes("revision") || t.includes("révision") || t.includes("live") || t.includes("énoncé") || t.includes("enonce")) {
    return "revision";
  }
  return t;
};

interface DevoirsViewProps {
  isPremiumUser: boolean;
  userGrade: string;
  userSection?: string;
  selectedTrimestre: string;
  userRole?: string;
  currentLanguage?: Language;
  onGoToShop?: () => void;
  currentUser?: any;
  userPlan?: string;
}

export default function DevoirsView({ 
  isPremiumUser, 
  userGrade, 
  userSection = "Tous",
  selectedTrimestre, 
  userRole = "student", 
  currentLanguage = "fr", 
  onGoToShop,
  currentUser,
  userPlan
}: DevoirsViewProps) {
  const t = translations[currentLanguage];

  // Extract primitive user fields to prevent object-reference re-render loops
  const userId = String(currentUser?.id || currentUser?._id || "");
  const userBadge = String(
    userPlan ||
    currentUser?.activeBadge ||
    currentUser?.badge ||
    currentUser?.subscriptionBadge ||
    currentUser?.subscriptionPlan ||
    currentUser?.forfait ||
    currentUser?.tierCategory ||
    (isPremiumUser ? "ESSENTIEL" : "FREEMIUM")
  );
  const primitiveGrade = String(userGrade || currentUser?.grade || currentUser?.level || "");
  const primitiveStream = String(userSection || currentUser?.stream || currentUser?.section || "");
  const primitiveRole = String(userRole || currentUser?.role || "student");

  const effectiveUser = useMemo(() => ({
    id: userId,
    role: primitiveRole,
    grade: primitiveGrade,
    stream: primitiveStream,
    section: primitiveStream,
    badge: userBadge,
    activeBadge: userBadge,
    subscriptionPlan: userBadge,
    accountType: isPremiumUser ? "premium" : "freemium"
  }), [userId, primitiveRole, primitiveGrade, primitiveStream, userBadge, isPremiumUser]);

  const sessionKey = `${userId}|${userBadge}|${primitiveGrade}|${primitiveStream}`;
  const sessionCache = getStudentSessionCache(sessionKey);

  const [downloadedCount, setDownloadedCount] = useState<number>(0);
  const [showDocModal, setShowDocModal] = useState<DevoirItem | null>(null);
  const [allDevoirs, setAllDevoirs] = useState<DevoirItem[]>(() => sessionCache.devoirs || DEVOIRS_DATA);
  const [loading, setLoading] = useState<boolean>(() => sessionCache.devoirs === null);
  const activeControllerRef = useRef<AbortController | null>(null);
  const cachedDevoirsRef = useRef<DevoirItem[] | null>(sessionCache.devoirs);

  // Memoized fetchDevoirs strictly executed once per active session (récupère tous les trimestres en une seule fois)
  const fetchDevoirs = useCallback(async (checkMounted: () => boolean = () => true) => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    if (!cachedDevoirsRef.current) {
      setLoading(true);
    }
    try {
      const headers: Record<string, string> = {
        "x-user-id": userId,
        "x-user-grade": primitiveGrade,
        "x-user-section": primitiveStream,
        "x-user-stream": primitiveStream,
        "x-user-role": primitiveRole,
        "x-user-badge": userBadge,
        "x-user-plan": userBadge
      };

      const [devoirsRes, coursesRes, adminDocsRes] = await Promise.allSettled([
        fetch(
          `/api/student/devoirs?category=${encodeURIComponent("Devoirs & Exercices")}`,
          { signal: controller.signal, headers }
        ).then((r) => (r.ok ? r.json() : [])),
        fetch(`/api/courses`, { signal: controller.signal, headers }).then((r) => (r.ok ? r.json() : [])),
        fetch(`/api/admin/documents`, { signal: controller.signal }).then((r) => (r.ok ? r.json() : []))
      ]);
      if (!checkMounted()) return;

      const dList = devoirsRes.status === "fulfilled" && Array.isArray(devoirsRes.value) ? devoirsRes.value : [];
      const cList = coursesRes.status === "fulfilled"
        ? (Array.isArray(coursesRes.value?.files) ? coursesRes.value.files : Array.isArray(coursesRes.value) ? coursesRes.value : [])
        : [];
      const aList = adminDocsRes.status === "fulfilled"
        ? (Array.isArray(adminDocsRes.value?.documents) ? adminDocsRes.value.documents : Array.isArray(adminDocsRes.value) ? adminDocsRes.value : [])
        : [];

      const globalDocs = getGlobalDocuments();
      const mergedRaw = initializeGlobalDocuments([...globalDocs, ...aList, ...cList, ...dList]);
      const deletedIds = getDeletedDocumentIds();

      // Filter to devoirs/exercises contentType or category (excluding corrections)
      const uploadedDevoirs = mergedRaw.filter((course: any) => {
        if (!course || !course.id || deletedIds.has(String(course.id))) return false;
        const ct = normalize(course.contentType || "");
        const cat = normalize(course.category || "");
        const rawTrim = normalize(course.trimestre || course.trimester || course.submenu || course.subMenu || "");
        if (ct === "exercise_corrected" || cat.includes("correction")) return false;
        if (ct === "quiz" || cat.includes("quiz") || cat.includes("qcm")) return false;

        return (
          ct === "exercise" ||
          ct === "devoirs_exercices_fiches_cours" ||
          cat.includes("devoir") ||
          cat.includes("exercice") ||
          (ct === "revision" && rawTrim !== "correction")
        );
      });

      const mappedDevoirs: DevoirItem[] = uploadedDevoirs.map((course: any) => {
        const titleLower = (course.title || "").toLowerCase();
        let type: "Devoir de Contrôle" | "Devoir de Synthèse" | "Exercices d'Application" = "Exercices d'Application";
        let color = "amber";

        if (titleLower.includes("contrôle") || titleLower.includes("controle")) {
          type = "Devoir de Contrôle";
          color = "emerald";
        } else if (titleLower.includes("synthèse") || titleLower.includes("synthese")) {
          type = "Devoir de Synthèse";
          color = "indigo";
        }

        const resolvedModule = String(course.module || course.chapterTitle || course.chapter || "Fichiers").trim();

        return {
          ...course,
          id: course.id,
          title: course.title,
          type,
          module: resolvedModule,
          chapter: course.chapter || resolvedModule,
          chapterTitle: course.chapterTitle || resolvedModule,
          submenu: course.submenu || course.subMenu || course.trimestre || course.trimester || "1er Trimestre",
          trimester: course.trimester || course.trimestre || course.submenu || "1er Trimestre",
          trimestre: course.trimestre || course.trimester || course.submenu || "1er Trimestre",
          grade: course.grade,
          levels: course.levels,
          filiere: course.filiere || course.section || course.stream,
          stream: course.stream || course.section || course.filiere,
          section: course.section || course.stream || course.filiere,
          minBadge: course.minBadge || course.requiredBadge,
          requiredBadge: course.requiredBadge || course.minBadge,
          badges: course.badges || course.allowedBadges,
          allowedBadges: course.allowedBadges || course.badges,
          category: course.category || "Devoirs & Exercices",
          contentType: course.contentType,
          target: course.target,
          duration: course.duration || "",
          filename: course.attachmentName || course.fileName || "",
          color,
          description: course.textContent || "",
          volume: course.volume,
          fileType: course.fileType,
          fileUrl: resolveSafePdfUrl(course) || course.videoUrl || course.fileUrl,
          fileData: course.fileData,
          blobUrl: course.blobUrl,
          solutionCode: course.solutionCode,
          textContent: course.textContent,
          isPremium: !!course.isPremium,
          targetAudience: course.targetAudience,
          targetTiers: course.targetTiers,
          allowedTiers: course.allowedTiers
        };
      });

      const currentCache = getStudentSessionCache(`${userId}|${userBadge}|${primitiveGrade}|${primitiveStream}`);
      currentCache.devoirs = mappedDevoirs;
      cachedDevoirsRef.current = mappedDevoirs;
      setAllDevoirs(mappedDevoirs);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      if (checkMounted()) {
        const localFallback = getStoredDocuments() as DevoirItem[];
        if (localFallback.length > 0) {
          setAllDevoirs(localFallback);
        } else if (!cachedDevoirsRef.current) {
          setAllDevoirs([]);
        } else {
          setAllDevoirs(cachedDevoirsRef.current);
        }
      }
    } finally {
      if (checkMounted()) setLoading(false);
    }
  }, [userBadge, primitiveGrade, primitiveStream, primitiveRole, userId]);

  // Chargement au montage et synchronisation en temps réel lors d'un ajout/modification de document
  useEffect(() => {
    let isMounted = true;
    if (cachedDevoirsRef.current !== null) {
      setAllDevoirs(cachedDevoirsRef.current);
      setLoading(false);
    } else {
      fetchDevoirs(() => isMounted);
    }

    const handleDocSync = () => {
      if (!isMounted) return;
      clearStudentSessionCache();
      cachedDevoirsRef.current = null;
      fetchDevoirs(() => isMounted);
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

  // Filtrage multicritères souple et normalisé (Badge + Niveau Scolaire + Filière/Section + Trimestre + Catégorie)
  const filteredDevoirs = useMemo(() => {
    return allDevoirs.filter((item) =>
      filterDocuments(item, effectiveUser, {
        selectedTrimestre: selectedTrimestre && selectedTrimestre !== "all" && selectedTrimestre !== "tous" ? selectedTrimestre : undefined,
        activeCategory: "Devoirs & Exercices"
      })
    );
  }, [allDevoirs, effectiveUser, selectedTrimestre]);

  // Filtres de chapitres interactifs (Tous les chapitres, Fichiers, Rappels + chapitres dynamiques)
  const [activeChapter, setActiveChapter] = useState<string>("ALL");

  const getItemChapterLabel = useCallback((item: DevoirItem): string => {
    const rawCh = String(item.module || item.chapterTitle || item.chapter || "").trim();
    const normCh = normalize(rawCh);
    const normTitle = normalize(item.title || "");
    const normSub = normalize(item.submenu || item.trimester || item.trimestre || "");
    const normCt = normalize(item.contentType || "");

    if (
      normCh === "rappels" ||
      normCh.includes("rappel") ||
      normTitle.includes("rappel") ||
      normCt === "revision" ||
      normSub === "revision"
    ) {
      return rawCh && normCh !== "general" ? rawCh : "Rappels";
    }
    if (!rawCh || normCh === "general" || normCh === "fichiers") {
      return "Fichiers";
    }
    return rawCh;
  }, []);

  const matchesDevoirChapter = useCallback(
    (item: DevoirItem, chapter: string): boolean => {
      if (chapter === "ALL" || chapter === "all") return true;
      const itemCh = getItemChapterLabel(item);
      const normChapter = normalize(chapter);
      const normItemCh = normalize(itemCh);
      const normRawModule = normalize(item.module || item.chapterTitle || item.chapter || "");

      if (normItemCh === normChapter || normRawModule === normChapter) return true;
      if (normChapter === "fichiers") {
        // L'onglet "Fichiers" regroupe tous les fichiers de devoirs / exercices
        return true;
      }
      if (normChapter === "rappels") {
        return (
          normItemCh.includes("rappel") ||
          normRawModule.includes("rappel") ||
          normalize(item.title || "").includes("rappel") ||
          normalize(item.contentType || "") === "revision" ||
          normalize(item.submenu || item.trimester || "").includes("revision")
        );
      }
      return false;
    },
    [getItemChapterLabel]
  );

  const availableChapters = useMemo(() => {
    const dynamicSet = new Set<string>(["Fichiers", "Rappels"]);
    for (const item of filteredDevoirs) {
      const ch = getItemChapterLabel(item);
      if (ch) dynamicSet.add(ch);
      const rawMod = String(item.module || item.chapterTitle || item.chapter || "").trim();
      if (rawMod && normalize(rawMod) !== "general") {
        dynamicSet.add(rawMod);
      }
    }
    const customChapters = getGlobalCustomChapters();
    for (const customCh of customChapters) {
      if (customCh && normalize(customCh) !== "general") {
        dynamicSet.add(customCh.trim());
      }
    }
    return ["ALL", ...Array.from(dynamicSet)].filter((ch) =>
      ch === "ALL"
        ? filteredDevoirs.length > 0
        : filteredDevoirs.some((item) => matchesDevoirChapter(item, ch))
    );
  }, [filteredDevoirs, getItemChapterLabel, matchesDevoirChapter]);

  const devoirsFilteredByChapter = useMemo(() => {
    if (activeChapter === "ALL") return filteredDevoirs;
    return filteredDevoirs.filter((item) => matchesDevoirChapter(item, activeChapter));
  }, [filteredDevoirs, activeChapter, matchesDevoirChapter]);

  const {
    paginatedData: paginatedDevoirs,
    currentPage: devoirCurrentPage,
    totalPages: devoirTotalPages,
    totalItems: devoirTotalItems,
    startIndex: devoirStartIndex,
    endIndex: devoirEndIndex,
    itemsPerPage: devoirItemsPerPage,
    goToPage: devoirGoToPage,
    setItemsPerPage: setDevoirItemsPerPage,
  } = usePagination({ data: devoirsFilteredByChapter, initialItemsPerPage: 6 });

  const handleTabChange = (chapter: string) => {
    setActiveChapter(chapter);
    devoirGoToPage(1);
  };

  const handleOpenResourceDirect = (item: DevoirItem) => {
    const fileName = item.filename || item.attachmentName || "";
    const fileUrl = item.fileUrl || "";
    const fileType = item.fileType || "";

    const isPython = fileName.toLowerCase().endsWith(".py") || fileUrl.toLowerCase().endsWith(".py") || fileType === "py";
    const isTxt = fileName.toLowerCase().endsWith(".txt") || fileUrl.toLowerCase().endsWith(".txt") || fileType === "txt";
    const isImg = ["png", "jpg", "jpeg"].includes(fileType.toLowerCase()) ||
      fileName.toLowerCase().endsWith(".png") || fileName.toLowerCase().endsWith(".jpg") || fileName.toLowerCase().endsWith(".jpeg") ||
      fileUrl.toLowerCase().endsWith(".png") || fileUrl.toLowerCase().endsWith(".jpg") || fileUrl.toLowerCase().endsWith(".jpeg");

    const imgExt = ["png", "jpg", "jpeg"].find(e => fileName.toLowerCase().endsWith("." + e) || fileUrl.toLowerCase().endsWith("." + e) || fileType.toLowerCase() === e) || "png";

    if (isPython || isTxt || isImg) {
      window.dispatchEvent(new CustomEvent("open-document-viewer", { detail: { ...item, fileType: isImg ? imgExt : isPython ? "py" : "txt" } }));
      if (isPython) {
        window.dispatchEvent(new CustomEvent("open-python-code-viewer", { detail: item }));
      } else if (isTxt) {
        window.dispatchEvent(new CustomEvent("open-txt-document-viewer", { detail: item }));
      }
      window.location.hash = `#/student/viewer/${item.id}`;
    } else {
      setShowDocModal(item);
    }
  };

  const getTrimLabel = (trim?: string) => {
    if (!trim) return "";
    const norm = normalizeTrimestre(trim);
    switch (norm) {
      case "1ere trimestre": return t.trim1;
      case "2eme trimestre": return t.trim2;
      case "3eme trimestre": return t.trim3;
      case "revision": return "Live Enregistré";
      default: return trim;
    }
  };

  return (
    <div className="space-y-6 bg-white text-[#1F2937] text-left">
      {/* UNIFIED STUDENT HEADER BANNER */}
      <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-5 mb-6 flex items-center justify-between shadow-sm text-left">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center text-amber-600 shrink-0">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2">
              Visualisation des Devoirs : <span className="text-emerald-600 font-extrabold">{getTrimLabel(selectedTrimestre)}</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Fiches corrigées et examens de contrôle pour votre niveau académique.
            </p>
          </div>
        </div>
        {/* Badge statut compact à droite */}
        <div className="hidden sm:flex items-center">
          <span className="bg-emerald-600 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1.5 rounded-full">
            {filteredDevoirs.length} SUJETS TROUVÉS
          </span>
        </div>
      </div>

      {/* Chapter Filtering Tabs (Tous les chapitres, Fichiers, Rappels & chapitres dynamiques) */}
      <ChaptersTabsBar
        availableChapters={availableChapters}
        activeChapter={activeChapter}
        handleTabChange={handleTabChange}
        getChapterCount={(chapter) =>
          chapter === "ALL"
            ? filteredDevoirs.length
            : filteredDevoirs.filter((item) => matchesDevoirChapter(item, chapter)).length
        }
      />

      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Chargement des devoirs et exercices...</p>
        </div>
      ) : devoirsFilteredByChapter.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-200 rounded-3xl bg-slate-50/50 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-500">
            <BookOpen size={20} />
          </div>
          <h4 className="text-xs font-bold text-gray-800">Aucun document disponible pour votre filière et ce trimestre</h4>
          <p className="text-[11px] text-gray-400 max-w-sm mx-auto leading-relaxed">
            {t.empty_devoirs_desc}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {paginatedDevoirs.map((item) => (
              <ResourceCard
                key={item.id}
                item={item}
                onOpenDetails={(i) => setShowDocModal(i as DevoirItem)}
                onOpenResource={(i) => handleOpenResourceDirect(i as DevoirItem)}
                isPremiumUser={isPremiumUser}
                userRole={userRole}
                onGoToShop={onGoToShop}
              />
            ))}
          </div>

          <PaginationControls
            currentPage={devoirCurrentPage}
            totalPages={devoirTotalPages}
            totalItems={devoirTotalItems}
            startIndex={devoirStartIndex}
            endIndex={devoirEndIndex}
            itemsPerPage={devoirItemsPerPage}
            onPageChange={devoirGoToPage}
            onItemsPerPageChange={setDevoirItemsPerPage}
            pageSizeOptions={[6, 12, 24, 48]}
          />
        </>
      )}

      {/* Detail info card */}
      <div className="p-4 rounded-xl border border-blue-100 bg-blue-50/40 text-xs text-blue-800 flex gap-2 w-full text-left font-medium leading-relaxed">
        <Info size={16} className="text-blue-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold">Instructions pédagogiques importantes :</span>
          <p className="text-[11px] text-blue-700 mt-0.5">
            Pour tirer le meilleur parti de ces épreuves, résolvez-les en temps réel sans utiliser d'aide externe. Soumettez vos questions ou difficultés à votre agent d'apprentissage Professeur Nabil Chaouch lors des séances de soutien du dimanche ou via l'espace d'entraide.
          </p>
        </div>
      </div>

      {/* Document Viewer / Exercice Detail Modal */}
      {showDocModal && (
        <DocumentViewerModal
          document={showDocModal}
          onClose={() => setShowDocModal(null)}
          isPremiumUser={isPremiumUser}
          userRole={userRole}
          onGoToShop={onGoToShop}
        />
      )}

    </div>
  );
}

