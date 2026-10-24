import React, { useState, useEffect, useMemo } from "react";
import { BookOpen, Plus, Upload, Edit, Trash2, Search, Filter } from "lucide-react";
import { CourseItem } from "../../types";
import { DocumentManagementCard } from "../DocumentManagementCard";
import { EditDocumentModal } from "../EditDocumentModal";
import { DynamicPagination } from "../DynamicPagination";
import { normalizePackName } from "../../constants/packages";
import { normalizeBadge } from "../../constants/badges";
import { normalizeUploadedDocumentMetadata, clearStudentSessionCache } from "../../utils/documentAccess";

const GRADES_OPTIONS = ["1ère", "2ème", "3ème", "4ème"];
const SECTIONS_OPTIONS = [
  "Sciences de l'Informatique",
  "Mathématiques",
  "Sciences Expérimentales",
  "Sciences Techniques",
  "Économie & Gestion",
  "Lettres",
  "Sport",
  "Tronc Commun"
];

export interface AdminDocsProps {
  courses: CourseItem[];
  setCourses?: React.Dispatch<React.SetStateAction<CourseItem[]>>;
  onRefresh?: () => void;
  onShowFeedback?: (msg: string, type: "success" | "error") => void;
  onNavigateToUpload?: () => void;
}

export const AdminDocs: React.FC<AdminDocsProps> = ({
  courses = [],
  setCourses,
  onRefresh,
  onShowFeedback,
  onNavigateToUpload
}) => {
  const [courseSearchText, setCourseSearchText] = useState("");
  const [courseFileTypeFilter, setCourseFileTypeFilter] = useState("Tous");
  const [courseGradeFilter, setCourseGradeFilter] = useState("Tous");
  const [coursePremiumFilter, setCoursePremiumFilter] = useState("ALL");
  const [courseHistoryPage, setCourseHistoryPage] = useState(1);
  const [editingDocModalItem, setEditingDocModalItem] = useState<any>(null);
  const [storedAdminDocs, setStoredAdminDocs] = useState<CourseItem[]>(() => {
    try {
      const raw = localStorage.getItem("zed_admin_documents");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (e) {}
    return [];
  });

  useEffect(() => {
    const syncFromStorageAndEvent = (e?: any) => {
      const createdDoc = e?.detail;
      try {
        const raw = localStorage.getItem("zed_admin_documents");
        const parsed = raw ? JSON.parse(raw) : [];
        const list = Array.isArray(parsed) ? parsed : [];
        if (createdDoc && createdDoc.id && !createdDoc.deleted) {
          const nextList = [
            createdDoc,
            ...list.filter((d: any) => String(d.id) !== String(createdDoc.id))
          ];
          setStoredAdminDocs(nextList);
          try {
            localStorage.setItem(
              "zed_admin_documents",
              JSON.stringify(nextList.map((d: any) => ({ ...d, fileData: undefined })))
            );
          } catch (err) {}
          if (setCourses) {
            setCourses((prev) => [
              createdDoc,
              ...prev.filter((c) => String(c.id) !== String(createdDoc.id))
            ]);
          }
          setCourseHistoryPage(1);
        } else {
          setStoredAdminDocs(list);
        }
      } catch (err) {
        if (createdDoc && createdDoc.id && !createdDoc.deleted) {
          setStoredAdminDocs((prev) => [
            createdDoc,
            ...prev.filter((d) => String(d.id) !== String(createdDoc.id))
          ]);
          if (setCourses) {
            setCourses((prev) => [
              createdDoc,
              ...prev.filter((c) => String(c.id) !== String(createdDoc.id))
            ]);
          }
          setCourseHistoryPage(1);
        }
      }
    };

    syncFromStorageAndEvent();
    if (onRefresh) onRefresh();

    window.addEventListener("admin-document-created", syncFromStorageAndEvent as any);
    window.addEventListener("document-updated", syncFromStorageAndEvent as any);
    window.addEventListener("admin-content-updated", syncFromStorageAndEvent as any);
    return () => {
      window.removeEventListener("admin-document-created", syncFromStorageAndEvent as any);
      window.removeEventListener("document-updated", syncFromStorageAndEvent as any);
      window.removeEventListener("admin-content-updated", syncFromStorageAndEvent as any);
    };
  }, []);

  const unifiedCourses = useMemo(() => {
    const map = new Map<string, CourseItem>();
    for (const doc of storedAdminDocs) {
      if (doc && doc.id) {
        map.set(String(doc.id), doc);
      }
    }
    for (const c of courses) {
      if (c && c.id) {
        map.set(String(c.id), { ...(map.get(String(c.id)) || {}), ...c });
      }
    }
    return Array.from(map.values()).sort((a: any, b: any) => {
      const tA = new Date(a.createdAt || a.metadata?.uploadedAt || 0).getTime();
      const tB = new Date(b.createdAt || b.metadata?.uploadedAt || 0).getTime();
      return tB - tA;
    });
  }, [storedAdminDocs, courses]);

  const filteredCourses = unifiedCourses.filter((c) => {
    // 1. Filter by file type
    if (courseFileTypeFilter !== "Tous") {
      const ft = (c.fileType || "").toLowerCase();
      if (courseFileTypeFilter === "jpg") {
        if (ft !== "jpg" && ft !== "jpeg") return false;
      } else if (ft !== courseFileTypeFilter.toLowerCase()) {
        return false;
      }
    }
    // 2. Filter by grade / level
    if (courseGradeFilter !== "Tous" && courseGradeFilter !== "Tous les Niveaux") {
      const docGrades = (c.target?.gradeLevels && c.target.gradeLevels.length > 0)
        ? c.target.gradeLevels.map((g: string) => g.toLowerCase())
        : [c.grade ? c.grade.toLowerCase() : ""];
      const targetG = courseGradeFilter.toLowerCase();
      const hasMatch = docGrades.some((g: string) => g.includes("tous") || g === targetG || (targetG.includes("4") && g.includes("4")) || (targetG.includes("3") && g.includes("3")));
      if (!hasMatch) return false;
    }
    // 3. Filter by access status
    if (coursePremiumFilter !== "ALL" && coursePremiumFilter !== "Tous") {
      const normFilter = normalizePackName(coursePremiumFilter);
      const tiers = Array.isArray(c.targetTiers) ? c.targetTiers : (Array.isArray(c.allowedTiers) ? c.allowedTiers : []);
      if (tiers.length > 0) {
        const matchesTier = tiers.some((t: string) => normalizePackName(t) === normFilter);
        if (!matchesTier) return false;
      } else {
        const isPrem = Boolean(c.isPremium);
        if (normFilter === "FREEMIUM" && isPrem) return false;
        if (normFilter !== "FREEMIUM" && !isPrem) return false;
      }
    }
    // 4. Text query filter
    if (courseSearchText) {
      const q = courseSearchText.toLowerCase();
      const matchTitle = (c.title || "").toLowerCase().includes(q);
      const matchModule = (c.module || "").toLowerCase().includes(q);
      const matchFile = (c.attachmentName || "").toLowerCase().includes(q);
      if (!matchTitle && !matchModule && !matchFile) return false;
    }
    return true;
  });

  const itemsPerPage = 10;
  const paginatedCourses = filteredCourses.slice((courseHistoryPage - 1) * itemsPerPage, courseHistoryPage * itemsPerPage);

  const handleDeleteCourse = async (courseId: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
    try {
      const res = await fetch(`/api/admin/documents/${courseId}`, {
        method: "DELETE"
      });
      if (res.ok || res.status === 404) {
        clearStudentSessionCache();
        setStoredAdminDocs((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
        for (const storageKey of ["zed_admin_documents", "admin_documents", "zed_documents"]) {
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list)) {
                localStorage.setItem(
                  storageKey,
                  JSON.stringify(list.filter((d: any) => String(d.id) !== String(courseId)))
                );
              }
            }
          } catch (e) {}
        }
        try {
          window.dispatchEvent(new CustomEvent("document-updated", { detail: { id: courseId, deleted: true } }));
          window.dispatchEvent(new CustomEvent("admin-content-updated", { detail: { id: courseId, deleted: true } }));
          const bc = new BroadcastChannel("azed_docs_sync");
          bc.postMessage({ type: "DOC_DELETED", id: courseId });
          bc.close();
        } catch (e) {}
        if (onShowFeedback) onShowFeedback("Document supprimé avec succès.", "success");
        if (setCourses) setCourses((prev) => prev.filter((c) => String(c.id) !== String(courseId)));
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Erreur lors de la suppression");
      }
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback(err.message || "Erreur de suppression", "error");
    }
  };

  const handleSaveEditedDocModal = async (updatedData: any) => {
    try {
      const normalizedData = normalizeUploadedDocumentMetadata(updatedData);
      const docId = normalizedData.id;
      const res = await fetch(`/api/admin/documents/${docId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(normalizedData)
      });
      if (res.ok) {
        clearStudentSessionCache();
        setStoredAdminDocs((prev) =>
          prev.map((d) => (String(d.id) === String(docId) ? { ...d, ...normalizedData } : d))
        );
        for (const storageKey of ["zed_admin_documents", "admin_documents", "zed_documents"]) {
          try {
            const raw = localStorage.getItem(storageKey);
            if (raw) {
              const list = JSON.parse(raw);
              if (Array.isArray(list)) {
                localStorage.setItem(
                  storageKey,
                  JSON.stringify(
                    list.map((d: any) =>
                      String(d.id) === String(docId) ? { ...d, ...normalizedData, fileData: undefined } : d
                    )
                  )
                );
              }
            }
          } catch (e) {}
        }
        try {
          window.dispatchEvent(new CustomEvent("document-updated", { detail: normalizedData }));
          window.dispatchEvent(new CustomEvent("admin-content-updated", { detail: normalizedData }));
          const bc = new BroadcastChannel("azed_docs_sync");
          bc.postMessage({ type: "DOC_UPDATED", id: docId, doc: normalizedData });
          bc.close();
        } catch (e) {}
        if (onShowFeedback) onShowFeedback("Document mis à jour avec succès !", "success");
        setEditingDocModalItem(null);
        if (onRefresh) onRefresh();
      } else {
        throw new Error("Erreur de mise à jour");
      }
    } catch (err: any) {
      if (onShowFeedback) onShowFeedback(err.message || "Erreur de mise à jour", "error");
    }
  };

  return (
    <div className="border border-[#E5E7EB] dark:border-slate-800 rounded-2xl p-5 bg-white dark:bg-slate-900 shadow-xs space-y-5 max-w-5xl mx-auto text-left">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 dark:border-slate-800 pb-3">
        <div className="text-left">
          <h3 className="font-extrabold text-[#0F1E36] dark:text-white text-sm flex items-center gap-2">
            <BookOpen className="text-blue-600" size={18} />
            <span>Gestion des Documents & Ressources Pédagogiques</span>
          </h3>
          <p className="text-[11px] text-gray-400">
            Visualisez les badges dynamiques (Niveau, Filière, Catégorie, Trimestre, Format, Accès) et les documents publiés.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-bold bg-[#0F1E36] text-white px-2.5 py-1 rounded-full self-start sm:self-auto uppercase tracking-wider">
            {filteredCourses.length !== unifiedCourses.length 
              ? `${filteredCourses.length} filtrés sur ${unifiedCourses.length}` 
              : `${unifiedCourses.length} documents`
            }
          </span>
          {onNavigateToUpload && (
            <button
              type="button"
              onClick={onNavigateToUpload}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
            >
              <Plus size={13} />
              <span>Nouveau Document</span>
            </button>
          )}
        </div>
      </div>

      {/* Rechercher et Filtres interactifs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-800/40 p-4 rounded-xl border border-gray-100 dark:border-slate-800 text-xs text-left">
        {/* Recherche textuelle */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">🔍 Recherche par titre</label>
          <input 
            type="text"
            placeholder="Saisir un mot-clé..."
            value={courseSearchText}
            onChange={(e) => setCourseSearchText(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-slate-950 dark:text-white focus:ring-1 focus:ring-[#10B981] focus:outline-hidden"
          />
        </div>

        {/* Type de Fichier */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">📁 Format</label>
          <select
            value={courseFileTypeFilter}
            onChange={(e) => setCourseFileTypeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-slate-950 dark:text-white focus:ring-1 focus:ring-[#10B981] focus:outline-hidden cursor-pointer"
          >
            <option value="Tous">Tous les formats</option>
            <option value="pdf">📄 Document PDF (.pdf)</option>
            <option value="mp4">🎥 Vidéo YouTube (.mp4)</option>
            <option value="png">🖼️ Image PNG (.png)</option>
            <option value="jpg">🖼️ Image JPG (.jpg, .jpeg)</option>
            <option value="webp">🖼️ Image WEBP (.webp)</option>
            <option value="py">🐍 Script Python (.py)</option>
            <option value="txt">📝 Exercice texte (.txt)</option>
          </select>
        </div>

        {/* Niveau Élève */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">🎓 Niveau Scolaire</label>
          <select
            value={courseGradeFilter}
            onChange={(e) => setCourseGradeFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-slate-950 dark:text-white focus:ring-1 focus:ring-[#10B981] focus:outline-hidden cursor-pointer"
          >
            <option value="Tous les Niveaux">Tous les Niveaux</option>
            {GRADES_OPTIONS.map((g) => (
              <option key={g} value={g}>{g}</option>
            ))}
          </select>
        </div>

        {/* Offre Premium vs Gratuit */}
        <div className="space-y-1">
          <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">💎 Statut d'Accès</label>
          <select
            value={coursePremiumFilter}
            onChange={(e) => setCoursePremiumFilter(e.target.value)}
            className="w-full px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-[#CBD5E1] dark:border-slate-700 rounded-lg text-slate-950 dark:text-white focus:ring-1 focus:ring-[#10B981] focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">Tous les accès</option>
            <option value="FREEMIUM">FREEMIUM</option>
            <option value="ESSENTIEL">ESSENTIEL</option>
            <option value="LIVE+">LIVE+</option>
            <option value="REVISION+">REVISION+</option>
            <option value="INTEGRAL">INTEGRAL</option>
          </select>
        </div>
      </div>
      
      <div className="space-y-4 max-h-[700px] overflow-y-auto pr-1">
        {filteredCourses.length === 0 ? (
          <div className="text-center p-8 bg-gray-50 dark:bg-slate-800/40 rounded-xl space-y-3 border border-dashed border-[#CBD5E1] dark:border-slate-700">
            <p className="text-gray-400 italic font-mono text-xs">
              Aucun document ne correspond aux filtres sélectionnés.
            </p>
            <button
              type="button"
              onClick={() => {
                setCourseFileTypeFilter("Tous");
                setCourseGradeFilter("Tous");
                setCoursePremiumFilter("Tous");
                setCourseSearchText("");
              }}
              className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-lg text-[10.5px] font-bold uppercase transition cursor-pointer"
            >
              Réinitialiser les filtres
            </button>
          </div>
        ) : (
          paginatedCourses.map((c) => {
            const gradeList = c.target?.gradeLevels && c.target.gradeLevels.length > 0
              ? c.target.gradeLevels
              : c.grade 
              ? (c.grade === "Tous" || c.grade === "Tous les niveaux" ? ["Tous les niveaux"] : c.grade.split(',').map((s: string) => s.trim()))
              : ["Tous les niveaux"];

            const streamList = c.target?.streams && c.target.streams.length > 0
              ? c.target.streams
              : c.section
              ? (c.section === "Tous" || c.section === "Toutes les filières" || c.section === "Toutes les sections" ? ["Toutes les filières"] : c.section.split(',').map((s: string) => s.trim()))
              : ["Toutes les filières"];

            const catRaw = (c.category || c.contentType || 'course').toLowerCase();
            let catFormatted = 'Fiches & cours';
            if (catRaw === 'exercise_corrected' || catRaw.includes('correction')) catFormatted = 'Zone Correction';
            else if (catRaw === 'exercise' || catRaw.includes('devoir') || catRaw.includes('exercice') || catRaw === 'devoirs_exercices_fiches_cours') catFormatted = 'Devoirs & Exercices';
            else if (catRaw === 'revision' || catRaw.includes('examen') || catRaw.includes('live')) catFormatted = 'Révision (Live Énoncé / Replay)';
            else if (catRaw === 'quiz') catFormatted = 'Quiz Interactifs';
            else if (catRaw === 'course' || catRaw.includes('cours') || catRaw.includes('fiche')) catFormatted = 'Fiches & cours';

            const fmtRaw = (c.fileFormat || c.fileType || 'pdf').toUpperCase();
            const trimRaw = c.trimester || c.trimestre || '1er Trimestre';
            let trimFormatted = trimRaw;
            if (trimRaw === '1ere trimestre' || trimRaw === '1') trimFormatted = '1er Trimestre';
            else if (trimRaw === '2eme trimestre' || trimRaw === '2') trimFormatted = '2ème Trimestre';
            else if (trimRaw === '3eme trimestre' || trimRaw === '3') trimFormatted = '3ème Trimestre';
            else if (trimRaw === 'revision') trimFormatted = 'Période Révision';

            const isPrem = typeof c.isPremium === 'boolean' ? c.isPremium : true;
            const accessFormatted = c.accessType || (isPrem ? 'Premium' : 'Gratuit');
            const fileNameStr = c.fileName || c.attachmentName || (c.videoUrl || c.fileUrl ? (c.videoUrl || c.fileUrl).split('/').pop() : '') || `${c.title}.${fmtRaw.toLowerCase()}`;

            const sectionPath = c.metadata?.studentSectionPath || (
              catFormatted.includes('cours') || catFormatted.includes('fiche')
                ? "Espace Élève ➔ Apprentissage & Révisions ➔ Fiches & cours"
                : catFormatted.includes('Correction')
                ? "Espace Élève ➔ Zone Correction"
                : catFormatted.includes('Devoirs')
                ? "Espace Élève ➔ Apprentissage & Révisions ➔ Devoirs & Exercices"
                : catFormatted.includes('Quiz')
                ? "Espace Élève ➔ Quiz Interactifs"
                : "Espace Élève ➔ Apprentissage & Révisions"
            );

            const docTiers: string[] = (Array.isArray(c.allowedTiers) && c.allowedTiers.length > 0)
              ? c.allowedTiers
              : (Array.isArray(c.accessTiers) && c.accessTiers.length > 0)
              ? c.accessTiers
              : (Array.isArray((c as any).tiers) && (c as any).tiers.length > 0)
              ? (c as any).tiers
              : (Array.isArray(c.targetTiers) && c.targetTiers.length > 0)
              ? c.targetTiers
              : (Array.isArray(c.target?.userCategories) && c.target.userCategories.length > 0)
              ? c.target.userCategories
              : ['FREEMIUM'];

            const publicationDoc = {
              id: c.id,
              title: c.title,
              chapterTitle: c.module || c.chapterTitle || 'Général',
              fileName: fileNameStr,
              fileUrl: c.fileUrl || c.videoUrl || '',
              fileFormat: fmtRaw,
              category: catFormatted,
              trimester: trimFormatted,
              accessType: accessFormatted,
              allowedTiers: docTiers,
              accessTiers: docTiers,
              tiers: docTiers,
              targetTiers: docTiers,
              target: {
                gradeLevels: gradeList,
                streams: streamList,
                userCategories: docTiers
              },
              metadata: {
                uploadedAt: c.metadata?.uploadedAt || c.createdAt || new Date().toISOString(),
                studentSectionPath: sectionPath,
                downloadsCount: c.metadata?.downloadsCount ?? (c as any).downloadsCount ?? 0
              }
            };

            return (
              <DocumentManagementCard
                key={c.id}
                doc={publicationDoc as any}
                onEdit={() => setEditingDocModalItem(c)}
                onDelete={() => handleDeleteCourse(c.id)}
              />
            );
          })
        )}
      </div>

      {filteredCourses.length > itemsPerPage && (
        <DynamicPagination
          totalItems={filteredCourses.length}
          itemsPerPage={itemsPerPage}
          currentPage={courseHistoryPage}
          onPageChange={setCourseHistoryPage}
        />
      )}

      {/* Modal d'édition globale du document */}
      {editingDocModalItem && (
        <EditDocumentModal
          doc={editingDocModalItem}
          isOpen={!!editingDocModalItem}
          onClose={() => setEditingDocModalItem(null)}
          onSave={handleSaveEditedDocModal}
        />
      )}
    </div>
  );
};

export default AdminDocs;
