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
}

const DEVOIRS_DATA: DevoirItem[] = [
  // 1ère Année Devs
  {
    id: "d1",
    title: "Devoir de Contrôle N°1 - Algorithmes & Constantes",
    type: "Devoir de Contrôle",
    trimestre: "1ere trimestre",
    grade: "1ère Année",
    duration: "1 heure",
    filename: "Devoir_Controle_1_1ere_Annee.pdf",
    color: "emerald",
    description: "Structure générale d'un algorithme, affectations simples, constantes et variables.",
    fileType: "pdf"
  },
  {
    id: "d2",
    title: "Devoir de Synthèse N°1 - Structures Alternatives",
    type: "Devoir de Synthèse",
    trimestre: "1ere trimestre",
    grade: "1ère Année",
    duration: "2 heures",
    filename: "Devoir_Synthese_1_1ere_Annee.pdf",
    color: "indigo",
    description: "Sujet de synthèse couvrant les expressions logiques et structures alternatives simples.",
    fileType: "pdf",
    isPremium: true
  },
  {
    id: "d3",
    title: "Devoir de Contrôle N°2 - Structures Itératives simples",
    type: "Devoir de Contrôle",
    trimestre: "2eme trimestre",
    grade: "1ère Année",
    duration: "1 heure",
    filename: "Devoir_Controle_2_1ere_Annee.pdf",
    color: "emerald",
    description: "Exercices d'évaluation sur la boucle 'Pour' (for) et les applications de base.",
    fileType: "pdf"
  },
  {
    id: "d4",
    title: "Devoir de Synthèse N°2 - Boucles Répéter & Tant-Que",
    type: "Devoir de Synthèse",
    trimestre: "2eme trimestre",
    grade: "1ère Année",
    duration: "2 heures",
    filename: "Devoir_Synthese_2_1ere_Annee.pdf",
    color: "indigo",
    description: "Sujet exhaustif d'évaluation pratique sur l'implémentation des boucles et traitements répétés.",
    fileType: "pdf",
    isPremium: true
  },
  {
    id: "d5",
    title: "Exercices Dirigés de consolidation - Sous-Programmes",
    type: "Exercices d'Application",
    trimestre: "3eme trimestre",
    grade: "1ère Année",
    duration: "45 min",
    filename: "Exercices_Sous_Programmes_1ere.pdf",
    color: "amber",
    description: "Fiche d'exercice pour comprendre la modularité simple et l'appel de procédures.",
    fileType: "pdf"
  },
  {
    id: "d6",
    title: "Sujet d'entraînement Global - Révisions de Passage",
    type: "Exercices d'Application",
    trimestre: "revision",
    grade: "1ère Année",
    duration: "3 heures",
    filename: "Syllabus_Global_Revision_1ere.pdf",
    color: "violet",
    description: "Sujet type d'examen regroupant l'ensemble des concepts étudiés au cours de l'année.",
    fileType: "pdf"
  },

  // 3ème Année Devs
  {
    id: "d7",
    title: "Devoir de Contrôle N°1 - Enregistrements & Tableaux",
    type: "Devoir de Contrôle",
    trimestre: "1ere trimestre",
    grade: "3ème Année",
    duration: "1 heure",
    filename: "Devoir_Controle_1_3eme_Annee.pdf",
    color: "emerald",
    description: "Évaluation sur la manipulation de types personnalisés (Enregistrements) et structures de données.",
    fileType: "pdf"
  },
  {
    id: "d8",
    title: "Devoir de Synthèse N°1 - Tris Thermique et de Base",
    type: "Devoir de Synthèse",
    trimestre: "1ere trimestre",
    grade: "3ème Année",
    duration: "2 heures",
    filename: "Devoir_Synthese_1_3eme_Annee.pdf",
    color: "indigo",
    description: "Thèmes de tris par sélection, tri à bulles et tris par insertion sur les vecteurs.",
    fileType: "pdf"
  },
  {
    id: "d9",
    title: "Devoir de Contrôle N°2 - Algorithmes Arithmétiques",
    type: "Devoir de Contrôle",
    trimestre: "2eme trimestre",
    grade: "3ème Année",
    duration: "1 heure",
    filename: "Devoir_Controle_2_3eme_Annee.pdf",
    color: "emerald",
    description: "Suites récurrentes, critères de divisibilité en arithmétique informatique.",
    fileType: "pdf"
  },
  {
    id: "d10",
    title: "Devoir de Synthèse N°2 - Chaînes de Caractères complexes",
    type: "Devoir de Synthèse",
    trimestre: "2eme trimestre",
    grade: "3ème Année",
    duration: "2 heures",
    filename: "Devoir_Synthese_2_3eme_Annee.pdf",
    color: "indigo",
    description: "Problèmes de cryptage, anagrammes et manipulation complexes de chaînes de caractères.",
    fileType: "pdf"
  },
  {
    id: "d11",
    title: "Fiche d'exercice pratique : Fichiers Textes",
    type: "Exercices d'Application",
    trimestre: "3eme trimestre",
    grade: "3ème Année",
    duration: "1 heure",
    filename: "Fiche_Exercice_Fichiers_Textes.pdf",
    color: "amber",
    description: "Algorithmes de lecture, écriture et modification directe des fichiers texte en Python.",
    fileType: "pdf"
  },

  // 4ème Année / Bac Info Devs
  {
    id: "d12",
    title: "Devoir de Contrôle N°1 - Récursivité & Algorithmes d'Arithmétique",
    type: "Devoir de Contrôle",
    trimestre: "1ere trimestre",
    grade: "4ème Année (Bac Info)",
    duration: "1.5 heures",
    filename: "Devoir_Controle_1_Bac_Info_2026.pdf",
    color: "emerald",
    description: "Sujet rigoureux sur les fonctions de tri récursif, PGCD/PPCM récursifs et l'analyse de complexité.",
    fileType: "pdf"
  },
  {
    id: "d13",
    title: "Devoir de Synthèse N°1 - Analyse Récursive & Récurrence",
    type: "Devoir de Synthèse",
    trimestre: "1ere trimestre",
    grade: "4ème Année (Bac Info)",
    duration: "2 heures",
    filename: "Devoir_Synthese_1_Bac_Info_2026.pdf",
    color: "indigo",
    description: "Épreuve théorique complète de type Baccalauréat d'informatique théorique tunisien.",
    fileType: "pdf"
  },
  {
    id: "d14",
    title: "Devoir de Contrôle N°2 - Fichiers de Données & Enregistrements",
    type: "Devoir de Contrôle",
    trimestre: "2eme trimestre",
    grade: "4ème Année (Bac Info)",
    duration: "1.5 heures",
    filename: "Devoir_Controle_2_Bac_Info_2026.pdf",
    color: "emerald",
    description: "Algorithmes sur les fichiers typés, accès aléatoire et structuration d'enregistrements.",
    fileType: "pdf"
  },
  {
    id: "d15",
    title: "Devoir de Synthèse N°2 - Interfaçage de Bases de Données (SQL + Python)",
    type: "Devoir de Synthèse",
    trimestre: "2eme trimestre",
    grade: "4ème Année (Bac Info)",
    duration: "2 heures",
    filename: "Devoir_Synthese_2_Bac_Info_2026.pdf",
    color: "indigo",
    description: "Conception conceptuelle, écriture SQL et implémentation d'une interface graphique Tkinter/PyQt.",
    fileType: "pdf"
  },
  {
    id: "d16",
    title: "Sujet Pratique officiel : Algorithmes d'Approximation & Tri Rapide",
    type: "Exercices d'Application",
    trimestre: "3eme trimestre",
    grade: "4ème Année (Bac Info)",
    duration: "2 heures",
    filename: "Sujet_Approximation_TriRapide_Bac.pdf",
    color: "amber",
    description: "Fiche d'exercice pratique : Méthodes de tri avancées (Tri fusion, Tri rapide) et approximations numériques.",
    fileType: "pdf"
  },
  {
    id: "d17",
    title: "Session Principale Corrigée - Sujets Nationaux 2018-2025",
    type: "Exercices d'Application",
    trimestre: "revision",
    grade: "4ème Année (Bac Info)",
    duration: "3 heures",
    filename: "Sujets_Corriges_Bac_Informatique_A_Zed.pdf",
    color: "violet",
    description: "Recueil officiel des épreuves du Baccalauréat tunisien avec solutions types et barème d'évaluation de la direction.",
    fileType: "pdf"
  },
  // Example Python exercise resource
  {
    id: "d_py_1",
    title: "TP Pratique Python - Implémentation de la Récursivité",
    type: "Exercices d'Application",
    trimestre: "1ere trimestre",
    grade: "4ème Année (Bac Info)",
    duration: "1 heure",
    filename: "tp_recursivite.py",
    color: "emerald",
    description: "Code source Python contenant la résolution guidée et les tests des fonctions récursives (PGCD, Fibonacci, Factoriel).",
    fileType: "py",
    solutionCode: `# TP Pratique Python - Récursivité\n\ndef pgcd(a, b):\n    if b == 0:\n        return a\n    return pgcd(b, a % b)\n\ndef fibonacci(n):\n    if n <= 1:\n        return n\n    return fibonacci(n - 1) + fibonacci(n - 2)\n\nprint("PGCD(48, 18) =", pgcd(48, 18))\nprint("Fibonacci(7) =", fibonacci(7))`
  }
];

const normalizeTrimestre = (trim?: string) => {
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
}

export default function DevoirsView({ 
  isPremiumUser, 
  userGrade, 
  userSection = "Tous",
  selectedTrimestre, 
  userRole = "student", 
  currentLanguage = "fr", 
  onGoToShop 
}: DevoirsViewProps) {
  const t = translations[currentLanguage];
  const [downloadedCount, setDownloadedCount] = useState<number>(0);
  const [showDocModal, setShowDocModal] = useState<DevoirItem | null>(null);
  const [allDevoirs, setAllDevoirs] = useState<DevoirItem[]>(DEVOIRS_DATA);

  const normalizedGrade = userGrade.toLowerCase();

  // Dynamic syncing of uploaded devoirs items from server
  useEffect(() => {
    fetch("/api/courses", {
      headers: {
        "x-user-grade": userGrade,
        "x-user-section": userSection || "",
        "x-user-role": userRole || "student"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          // Filter to devoirs/exercises contentType
          const uploadedDevoirs = data.filter((course) => {
            return (
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
              duration: course.duration || "",
              filename: course.attachmentName || "",
              color,
              description: course.textContent || "",
              volume: course.volume,
              fileType: course.fileType,
              fileUrl: course.videoUrl,
              solutionCode: course.solutionCode,
              textContent: course.textContent,
              isPremium: !!course.isPremium
            };
          });

          // Merge static devoirs with dynamic devoirs
          const merged = [...DEVOIRS_DATA];
          mappedDevoirs.forEach((item) => {
            if (!merged.some((m) => m.id === item.id)) {
              merged.push(item);
            }
          });
          setAllDevoirs(merged);
        }
      })
      .catch((err) => console.warn("Fallback to offline static devoirs:", err));
  }, [userGrade, userSection, userRole]);

  // Filter content based on user's grade and active trimester selection
  const filteredDevoirs = allDevoirs.filter((item) => {
    // 1. Grade academic filter
    const gradeMatch = 
      !item.grade ||
      item.grade === "Tous" ||
      item.grade.toLowerCase() === normalizedGrade ||
      (normalizedGrade.includes("bac") && item.grade.toLowerCase().includes("4ème")) ||
      (normalizedGrade.includes("4ème") && item.grade.toLowerCase().includes("bac"));

    if (!gradeMatch) return false;

    // 2. Trimester filter (using normalized comparison)
    if (!item.trimestre) return true; // Show items without trimester restrictions
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
            Pour tirer le meilleur parti de ces épreuves, résolvez-les en temps réel sans utiliser d'aide externe. Soumettez vos questions ou difficultés à votre agent d'apprentissage M. Nabil Chaouch lors des séances de soutien du dimanche ou via l'espace d'entraide.
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

