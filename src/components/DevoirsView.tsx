import { useState, useEffect } from "react";
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
import { canStudentAccessContent } from "../types";

export interface DevoirItem extends ExerciseItem {
  id: string;
  title: string;
  type?: "Devoir de Contrôle" | "Devoir de Synthèse" | "Exercices d'Application" | string;
  trimestre?: string;
  grade?: string;
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
  const effectiveUser = currentUser || {
    role: userRole,
    grade: userGrade,
    section: userSection,
    subscriptionPlan: userPlan,
    accountType: isPremiumUser ? "premium" : "freemium"
  };
  const [downloadedCount, setDownloadedCount] = useState<number>(0);
  const [showDocModal, setShowDocModal] = useState<DevoirItem | null>(null);
  const [allDevoirs, setAllDevoirs] = useState<DevoirItem[]>(DEVOIRS_DATA);

  const normalizedGrade = userGrade.toLowerCase();

  // Dynamic syncing of uploaded devoirs items from server
  useEffect(() => {
    const studentPlan = effectiveUser?.subscriptionPlan || effectiveUser?.forfait || effectiveUser?.tierCategory || "";
    const headers: Record<string, string> = {
      "x-user-grade": userGrade || "",
      "x-user-section": userSection || "",
      "x-user-role": userRole || "student",
      "x-user-plan": studentPlan
    };

    const processCoursesData = (data: any[]) => {
      if (!Array.isArray(data)) return;

      // Filter to devoirs/exercises contentType or category
      const uploadedDevoirs = data.filter((course) => {
        const cat = (course.category || course.contentType || "").toLowerCase();
        return (
          cat.includes("devoir") ||
          cat.includes("exercice") ||
          course.contentType === "exercise" ||
          course.contentType === "devoirs_exercices_fiches_cours" ||
          (course.contentType === "revision" && (course.trimestre === "enonce" || course.trimestre === "revision" || !course.trimestre))
        );
      });

      // Map CourseItem to DevoirItem
      const mappedDevoirs: DevoirItem[] = uploadedDevoirs.map((course) => {
        const titleLower = course.title.toLowerCase();
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
          id: course.id,
          title: course.title,
          type,
          trimestre: course.trimestre || "",
          grade: course.grade,
          section: course.section,
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
    };

    // First try fetching dedicated /api/student/devoirs endpoint
    fetch(`/api/student/devoirs?trimester=${encodeURIComponent(selectedTrimestre)}&category=Devoirs+%26+Exercices`, { headers })
      .then((res) => {
        if (!res.ok) throw new Error("Fallback to courses");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          processCoursesData(data);
        } else {
          // If empty, also check full courses catalog
          fetch("/api/courses", { headers })
            .then((res) => res.json())
            .then(processCoursesData)
            .catch(() => {});
        }
      })
      .catch(() => {
        fetch("/api/courses", { headers })
          .then((res) => res.json())
          .then(processCoursesData)
          .catch((err) => console.warn("Fallback to offline static devoirs:", err));
      });
  }, [userGrade, userSection, userRole, selectedTrimestre, effectiveUser?.subscriptionPlan, effectiveUser?.forfait]);

  // Filter content based on user's grade, active trimester selection, and active plan
  const filteredDevoirs = allDevoirs.filter((item) => {
    // Access control: omit completely if student plan is not in target audience
    if (userRole === "student" && !isDocumentAllowedForStudent(item, effectiveUser)) {
      return false;
    }

    // 1. Grade & Stream academic filter (utilisant canStudentAccessContent pour cibles multiples)
    if (item.target) {
      const match = canStudentAccessContent(item.target, {
        gradeLevel: userGrade,
        stream: userSection || "Toutes les filières"
      });
      if (!match) return false;
    } else {
      const gradeMatch = 
        !item.grade ||
        item.grade === "Tous" ||
        item.grade.includes("Tous") ||
        item.grade.toLowerCase() === normalizedGrade ||
        (normalizedGrade.includes("bac") && item.grade.toLowerCase().includes("4ème")) ||
        (normalizedGrade.includes("4ème") && item.grade.toLowerCase().includes("bac")) ||
        item.grade.split(",").some((g: string) => {
          const gLower = g.trim().toLowerCase();
          return gLower === normalizedGrade || (normalizedGrade.includes("4ème") && gLower.includes("4"));
        });

      if (!gradeMatch) return false;
    }

    // 2. Trimester filter (using normalized comparison)
    if (!item.trimestre || item.trimestre === "Tous" || item.trimestre.includes("Tous")) return true; // Show items without trimester restrictions
    return normalizeTrimestre(item.trimestre) === normalizeTrimestre(selectedTrimestre);
  });

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
    switch (trim) {
      case "1ere trimestre": return t.trim1;
      case "2eme trimestre": return t.trim2;
      case "3eme trimestre": return t.trim3;
      case "revision": return "Énoncé live";
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

      {filteredDevoirs.length === 0 ? (
        <div className="text-center p-12 border border-dashed border-gray-200 rounded-3xl bg-slate-50/50 space-y-3">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-500">
            <BookOpen size={20} />
          </div>
          <h4 className="text-xs font-bold text-gray-800">{t.empty_devoirs_title}</h4>
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

