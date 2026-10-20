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
import { isDocumentAllowedForStudent } from "../utils/documentAccess";

export interface DevoirItem extends ExerciseItem {
  id: string;
  title: string;
  type?: "Devoir de Contrôle" | "Devoir de Synthèse" | "Exercices d'Application" | string;
  trimester?: string;
  trimestre?: string;
  grade?: string;
  stream?: string;
  section?: string;
  minBadge?: string;
  requiredBadge?: string;
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

  const [downloadedCount, setDownloadedCount] = useState<number>(0);
  const [showDocModal, setShowDocModal] = useState<DevoirItem | null>(null);
  const [allDevoirs, setAllDevoirs] = useState<DevoirItem[]>(DEVOIRS_DATA);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshTrigger, setRefreshTrigger] = useState<number>(0);
  const activeControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const handleSync = () => setRefreshTrigger(prev => prev + 1);
    window.addEventListener("admin-content-updated", handleSync);
    window.addEventListener("document-updated", handleSync);
    return () => {
      window.removeEventListener("admin-content-updated", handleSync);
      window.removeEventListener("document-updated", handleSync);
    };
  }, []);

  // Memoized fetchDevoirs strictly depending on primitive student attributes
  const fetchDevoirs = useCallback(async (checkMounted: () => boolean = () => true) => {
    if (activeControllerRef.current) {
      activeControllerRef.current.abort();
    }
    const controller = new AbortController();
    activeControllerRef.current = controller;

    setLoading(true);
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

      const res = await fetch(
        `/api/student/devoirs?trimester=${encodeURIComponent(selectedTrimestre || "1er Trimestre")}&category=${encodeURIComponent("Devoirs & Exercices")}`,
        { signal: controller.signal, headers }
      );
      if (!res.ok) throw new Error("Failed to fetch devoirs");
      const data = await res.json();
      if (!checkMounted() || !Array.isArray(data)) return;

      // Filter strictly to devoirs/exercises contentType or category (excluding corrections)
      const uploadedDevoirs = data.filter((course) => {
        const ct = String(course.contentType || "").toLowerCase().trim();
        const cat = String(course.category || "").toLowerCase().trim();
        const rawTrim = String(course.trimestre || course.trimester || "").toLowerCase().trim();
        if (ct === "exercise_corrected" || cat.includes("correction")) return false;
        if (ct === "quiz" || cat.includes("quiz")) return false;

        return (
          ct === "exercise" ||
          ct === "devoirs_exercices_fiches_cours" ||
          cat.includes("devoir") ||
          cat.includes("exercice") ||
          (ct === "revision" && rawTrim !== "correction")
        );
      });

      const mappedDevoirs: DevoirItem[] = uploadedDevoirs.map((course) => {
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

        return {
          ...course,
          id: course.id,
          title: course.title,
          type,
          trimester: course.trimester || course.trimestre || "1er Trimestre",
          trimestre: course.trimestre || course.trimester || "1er Trimestre",
          grade: course.grade,
          stream: course.stream || course.section,
          section: course.section || course.stream,
          minBadge: course.minBadge || course.requiredBadge,
          requiredBadge: course.requiredBadge || course.minBadge,
          allowedBadges: course.allowedBadges,
          category: course.category || "Devoirs & Exercices",
          contentType: course.contentType,
          target: course.target,
          duration: course.duration || "",
          filename: course.attachmentName || "",
          color,
          description: course.textContent || "",
          volume: course.volume,
          fileType: course.fileType,
          fileUrl: course.videoUrl || course.fileUrl,
          solutionCode: course.solutionCode,
          textContent: course.textContent,
          isPremium: !!course.isPremium,
          targetAudience: course.targetAudience,
          targetTiers: course.targetTiers,
          allowedTiers: course.allowedTiers
        };
      });

      setAllDevoirs(mappedDevoirs);
    } catch (err: any) {
      if (err.name === "AbortError") return;
      if (checkMounted()) setAllDevoirs([]);
    } finally {
      if (checkMounted()) setLoading(false);
    }
  }, [userBadge, primitiveGrade, primitiveStream, selectedTrimestre, primitiveRole, userId, refreshTrigger]);

  useEffect(() => {
    let isMounted = true;
    fetchDevoirs(() => isMounted);
    return () => {
      isMounted = false;
      if (activeControllerRef.current) {
        activeControllerRef.current.abort();
      }
    };
  }, [fetchDevoirs]);

  // Filtrage multicritères strict (Badge + Niveau Scolaire + Filière/Section + Trimestre + Catégorie)
  const filteredDevoirs = useMemo(() => {
    return allDevoirs.filter((item) => {
      if (primitiveRole === "student") {
        if (!isDocumentAllowedForStudent(item, effectiveUser, {
          selectedTrimester: selectedTrimestre && selectedTrimestre !== "all" && selectedTrimestre !== "tous" ? selectedTrimestre : undefined,
          activeCategory: "Devoirs & Exercices"
        })) {
          return false;
        }
      }

      if (selectedTrimestre && selectedTrimestre !== "all" && selectedTrimestre !== "tous") {
        const itemTrim = item.trimester || item.trimestre || "1er Trimestre";
        if (itemTrim !== "Tous" && !itemTrim.toLowerCase().includes("tous") && itemTrim !== "ALL") {
          if (normalizeTrimestre(itemTrim) !== normalizeTrimestre(selectedTrimestre)) {
            return false;
          }
        }
      }
      return true;
    });
  }, [allDevoirs, primitiveRole, effectiveUser, selectedTrimestre]);

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
  } = usePagination({ data: filteredDevoirs, initialItemsPerPage: 6 });

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

      {loading ? (
        <div className="text-center py-12 space-y-3">
          <div className="inline-block w-8 h-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-xs text-gray-500 font-medium">Chargement des devoirs et exercices...</p>
        </div>
      ) : filteredDevoirs.length === 0 ? (
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

