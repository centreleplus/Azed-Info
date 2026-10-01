import React, { useState, useEffect, useMemo } from 'react';
import { 
  BookOpen, 
  Search, 
  Filter, 
  Plus, 
  RefreshCw, 
  FileText, 
  FolderOpen,
  Sparkles,
  Layers,
  X,
  Save,
  CheckCircle,
  Edit
} from 'lucide-react';
import { ALL_SECTIONS_OPTIONS, GRADES_OPTIONS } from '../constants/academic';
import { PublicationDocument, TargetAudience } from '../types';
import { DocumentManagementCard } from './DocumentManagementCard';
import { UploadDocumentModal } from './UploadDocumentModal';
import { DynamicPagination } from './DynamicPagination';
import { BulkAccessHeaderButton } from './BulkAccessHeaderButton';
import { normalizePackName } from '../constants/packages';

interface GestionDocumentsProps {
  onNavigateToCreate?: () => void;
  onEditDocument?: (doc: any) => void;
}

export const GestionDocuments: React.FC<GestionDocumentsProps> = ({
  onNavigateToCreate,
  onEditDocument
}) => {
  const [documents, setDocuments] = useState<PublicationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Tous');
  const [selectedSection, setSelectedSection] = useState('Tous');
  const [selectedCategory, setSelectedCategory] = useState('Tous');
  const [selectedFormat, setSelectedFormat] = useState('Tous');
  const [selectedAccess, setSelectedAccess] = useState('Tous');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Edit modal state
  const [editingDoc, setEditingDoc] = useState<PublicationDocument | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [editCategory, setEditCategory] = useState('Fiches & cours');
  const [editGradeLevels, setEditGradeLevels] = useState<string[]>(['4ème']);
  const [editStreams, setEditStreams] = useState<string[]>(["Sciences de l'Informatique"]);
  const [editFileFormat, setEditFileFormat] = useState('pdf');
  const [editFileUrl, setEditFileUrl] = useState('');
  const [editSelectedBadges, setEditSelectedBadges] = useState<string[]>(["FREEMIUM", "ESSENTIEL"]);
  const [isSubmittingEdit, setIsSubmittingEdit] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error("Erreur de chargement des documents");
      const data = await res.json();
      
      const formattedDocs: PublicationDocument[] = (data || []).map((item: any) => {
        const gradeList = item.target?.gradeLevels && item.target.gradeLevels.length > 0
          ? item.target.gradeLevels
          : item.grade 
          ? (item.grade === "Tous" || item.grade === "Tous les niveaux" ? ["Tous les niveaux"] : item.grade.split(',').map((s: string) => s.trim()))
          : ["Tous les niveaux"];

        const streamList = item.target?.streams && item.target.streams.length > 0
          ? item.target.streams
          : item.section
          ? (item.section === "Tous" || item.section === "Toutes les filières" || item.section === "Toutes les sections" ? ["Toutes les filières"] : item.section.split(',').map((s: string) => s.trim()))
          : ["Toutes les filières"];

        const catRaw = (item.category || item.contentType || '').trim();
        const normCat = catRaw.toLowerCase();
        let catFormatted = catRaw || 'Fiches & cours';

        if (normCat === 'zone correction' || normCat === 'exercise_corrected' || normCat.includes('correction')) {
          catFormatted = 'Zone Correction';
        } else if (normCat === 'devoirs & exercices' || normCat === 'exercise' || normCat.includes('devoir') || normCat.includes('exercice') || normCat === 'devoirs_exercices_fiches_cours') {
          catFormatted = 'Devoirs & Exercices';
        } else if (normCat.includes('revision') || normCat.includes('examen') || normCat.includes('live')) {
          catFormatted = 'Révision (Live Énoncé / Replay)';
        } else if (normCat.includes('quiz')) {
          catFormatted = 'Quiz Interactifs';
        } else if (normCat === 'course' || normCat.includes('cours') || normCat.includes('fiche')) {
          catFormatted = 'Fiches & cours';
        }

        const fmtRaw = (item.fileFormat || item.fileType || 'pdf').toUpperCase();
        const trimRaw = item.trimester || item.trimestre || '1er Trimestre';
        let trimFormatted = trimRaw;
        if (trimRaw === '1ere trimestre' || trimRaw === '1') trimFormatted = '1er Trimestre';
        else if (trimRaw === '2eme trimestre' || trimRaw === '2') trimFormatted = '2ème Trimestre';
        else if (trimRaw === '3eme trimestre' || trimRaw === '3') trimFormatted = '3ème Trimestre';
        else if (trimRaw === 'revision') trimFormatted = 'Période Révision';

        const isPrem = typeof item.isPremium === 'boolean' ? item.isPremium : true;
        const accessFormatted = item.accessType || (isPrem ? 'Premium' : 'Gratuit');

        const fileNameStr = item.fileName || item.attachmentName || (item.fileUrl ? item.fileUrl.split('/').pop() : '') || `${item.title}.${fmtRaw.toLowerCase()}`;

        const sectionPath = item.metadata?.studentSectionPath || (
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

        return {
          id: item.id || `doc_${Math.random()}`,
          title: item.title || 'Document sans titre',
          chapterTitle: item.chapterTitle || item.chapter || item.module || 'Général',
          fileName: fileNameStr,
          fileUrl: item.fileUrl || item.videoUrl || '',
          fileFormat: fmtRaw,
          category: catFormatted,
          trimester: trimFormatted,
          accessType: accessFormatted,
          target: {
            gradeLevels: gradeList,
            streams: streamList,
            userCategories: item.target?.userCategories || item.targetTiers || []
          },
          metadata: {
            uploadedAt: item.metadata?.uploadedAt || item.createdAt || new Date().toISOString(),
            studentSectionPath: sectionPath,
            downloadsCount: item.metadata?.downloadsCount ?? item.downloadsCount ?? 0
          },
          isPremium: isPrem,
          duration: item.duration,
          textContent: item.textContent,
          solutionCode: item.solutionCode
        };
      });

      setDocuments(formattedDocs);
    } catch (err: any) {
      console.error(err);
      setFeedback({ message: "Impossible de charger les documents.", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();

    const handleRealtime = (e: any) => {
      const msg = e.detail;
      if (msg && (msg.type === "DOCUMENT_UPDATED" || msg.type === "COURSES_UPDATED" || msg.type === "DOCUMENT_CREATED" || msg.type === "DOCUMENT_DELETED")) {
        fetchDocuments();
      }
    };
    window.addEventListener("realtime-event", handleRealtime as any);

    let bc: BroadcastChannel | null = null;
    try {
      bc = new BroadcastChannel("azed_docs_sync");
      bc.onmessage = () => {
        fetchDocuments();
      };
    } catch (err) {}

    return () => {
      window.removeEventListener("realtime-event", handleRealtime as any);
      if (bc) bc.close();
    };
  }, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document ?")) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/courses/${id}`, {
        method: 'DELETE'
      });
      if (!res.ok) throw new Error("Erreur de suppression");
      
      setDocuments(prev => prev.filter(d => d.id !== id));
      setFeedback({ message: "Document supprimé avec succès.", type: 'success' });
      setTimeout(() => setFeedback(null), 3000);
    } catch (err: any) {
      console.error(err);
      setFeedback({ message: "Erreur lors de la suppression.", type: 'error' });
    }
  };

  const handleEdit = (doc: PublicationDocument) => {
    if (onEditDocument) {
      onEditDocument(doc);
      return;
    }
    const currentBadges = doc.target?.userCategories && doc.target.userCategories.length > 0
      ? doc.target.userCategories
      : (doc.isPremium ? ['PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS'] : ['FREEMIUM', 'ESSENTIEL']);
    
    const normalizedBadges = currentBadges.length > 0 ? currentBadges : ["FREEMIUM", "ESSENTIEL"];

    setEditTitle(doc.title);
    setEditCategory(doc.category);
    setEditGradeLevels(doc.target?.gradeLevels && doc.target.gradeLevels.length > 0 ? doc.target.gradeLevels : ['4ème']);
    setEditStreams(doc.target?.streams && doc.target.streams.length > 0 ? doc.target.streams : ["Sciences de l'Informatique"]);
    setEditFileFormat((doc.fileFormat || 'pdf').toLowerCase());
    setEditFileUrl(doc.fileUrl || '');
    setEditSelectedBadges(normalizedBadges);
    setEditingDoc(doc);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDoc) return;
    if (!editTitle.trim()) {
      alert("Veuillez renseigner un titre pour le document.");
      return;
    }

    setIsSubmittingEdit(true);
    try {
      const isPrem = !editSelectedBadges.includes("FREEMIUM");
      const payload = {
        title: editTitle.trim(),
        contentType: editCategory.toLowerCase().includes('cours') ? 'course' : editCategory.toLowerCase().includes('correction') ? 'exercise_corrected' : editCategory.toLowerCase().includes('devoir') ? 'exercise' : editCategory.toLowerCase().includes('quiz') ? 'quiz' : 'course',
        category: editCategory,
        grade: editGradeLevels.join(', '),
        section: editStreams.join(', '),
        fileType: editFileFormat,
        videoUrl: editFileUrl,
        isPremium: isPrem,
        allowedTiers: editSelectedBadges,
        targetTiers: editSelectedBadges,
        targetAudience: editSelectedBadges,
        target: {
          gradeLevels: editGradeLevels,
          streams: editStreams,
          userCategories: editSelectedBadges
        }
      };

      const res = await fetch(`/api/admin/documents/${editingDoc.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erreur de mise à jour");
      const data = await res.json();
      const updated = data.document || data.course;

      // Invalidation & mise à jour locale immédiate en temps réel sans F5
      setDocuments((prevDocs) =>
        prevDocs.map((d) =>
          d.id === editingDoc.id
            ? {
                ...d,
                title: editTitle.trim(),
                category: editCategory,
                fileFormat: editFileFormat.toUpperCase(),
                fileUrl: editFileUrl,
                target: {
                  gradeLevels: editGradeLevels,
                  streams: editStreams,
                  userCategories: editSelectedBadges
                },
                isPremium: isPrem,
                accessType: isPrem ? 'Premium' : 'Gratuit'
              }
            : d
        )
      );

      setEditingDoc(null);
      setFeedback({ message: "Document mis à jour avec succès et synchronisé globalement.", type: "success" });
      setTimeout(() => setFeedback(null), 3500);

      try {
        const bc = new BroadcastChannel("azed_docs_sync");
        bc.postMessage({ type: "DOC_UPDATED", id: editingDoc.id, doc: updated });
        bc.close();
      } catch (err) {}
    } catch (err: any) {
      console.error(err);
      setFeedback({ message: "Erreur lors de la modification du document.", type: "error" });
    } finally {
      setIsSubmittingEdit(false);
    }
  };

  const handleCreateClick = () => {
    if (onNavigateToCreate) {
      onNavigateToCreate();
    } else {
      window.location.hash = "#/admin/nouveau-doc";
    }
  };

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGrade, selectedSection, selectedCategory, selectedFormat, selectedAccess]);

  // Filtered documents
  const filteredDocuments = useMemo(() => {
    return documents.filter(doc => {
      // 1. Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesChapter = doc.chapterTitle.toLowerCase().includes(q);
        const matchesFile = doc.fileName.toLowerCase().includes(q);
        const matchesCategory = doc.category.toLowerCase().includes(q);
        if (!matchesTitle && !matchesChapter && !matchesFile && !matchesCategory) {
          return false;
        }
      }

      // 2. Grade filter
      if (selectedGrade !== 'Tous' && selectedGrade !== 'Tous les Niveaux') {
        const docGrades = doc.target.gradeLevels.map(g => g.toLowerCase());
        const targetG = selectedGrade.toLowerCase();
        const hasMatch = docGrades.some(g => g.includes('tous') || g === targetG || (targetG.includes('4') && g.includes('4')) || (targetG.includes('3') && g.includes('3')));
        if (!hasMatch) return false;
      }

      // 3. Section / Stream filter
      if (selectedSection !== 'Tous' && selectedSection !== 'Toutes les filières') {
        const docStreams = doc.target.streams.map(s => s.toLowerCase());
        const targetS = selectedSection.toLowerCase();
        const hasMatch = docStreams.some(s => s.includes('toutes') || s.includes('tous') || s === targetS || s.includes(targetS) || targetS.includes(s));
        if (!hasMatch) return false;
      }

      // 4. Category filter
      if (selectedCategory !== 'Tous') {
        if (!doc.category.toLowerCase().includes(selectedCategory.toLowerCase())) {
          return false;
        }
      }

      // 5. Format filter
      if (selectedFormat !== 'Tous') {
        if (doc.fileFormat.toLowerCase() !== selectedFormat.toLowerCase()) {
          return false;
        }
      }

      // 6. Access filter
      if (selectedAccess !== 'Tous' && selectedAccess !== 'ALL') {
        const normFilter = normalizePackName(selectedAccess);
        const tiers = Array.isArray((doc as any).targetTiers) ? (doc as any).targetTiers : (Array.isArray((doc as any).allowedTiers) ? (doc as any).allowedTiers : []);
        if (tiers.length > 0) {
          const has = tiers.some((t: string) => normalizePackName(t) === normFilter);
          if (!has) return false;
        } else {
          const isPrem = doc.accessType?.toLowerCase().includes('prem') || Boolean(doc.isPremium);
          if (normFilter === 'Freemium' && isPrem) return false;
          if (normFilter !== 'Freemium' && !isPrem) return false;
        }
      }

      return true;
    });
  }, [documents, searchQuery, selectedGrade, selectedSection, selectedCategory, selectedFormat, selectedAccess]);

  // Paginated documents (10 items per page)
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(start, start + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto p-4 sm:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl">
              <BookOpen size={22} />
            </div>
            <div>
              <h1 className="text-xl font-extrabold text-slate-900">
                Gestion des Documents & Ressources Pédagogiques
              </h1>
              <p className="text-xs text-slate-500 font-medium">
                Badges d'audience dynamiques, traçabilité des emplacements et horodatage de publication
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <BulkAccessHeaderButton refreshDocs={fetchDocuments} />
          <button
            onClick={fetchDocuments}
            disabled={loading}
            className="p-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors cursor-pointer border border-slate-200"
            title="Rafraîchir"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
          </button>
          <button
            onClick={handleCreateClick}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer"
          >
            <Plus size={16} />
            <span>Nouveau Document</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center justify-between ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback(null)} className="font-bold underline cursor-pointer">Fermer</button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2 lg:col-span-1">
            <Search size={14} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher titre, support..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Grade Selector */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Tous les Niveaux</option>
              {GRADES_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Section Selector */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Toutes les filières</option>
              {ALL_SECTIONS_OPTIONS.filter(s => s !== "Tous" && s !== "Toutes les filières").map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Category Selector */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Toutes catégories</option>
              <option value="Fiches & cours">📚 Fiches & cours</option>
              <option value="Devoirs & Exercices">📝 Devoirs & Exercices</option>
              <option value="Zone Correction">✅ Zone Correction</option>
              <option value="Révision">🎯 Révision & Examens</option>
              <option value="Quiz">⚡ Quiz Interactifs</option>
            </select>
          </div>

          {/* Access Selector */}
          <div>
            <select
              value={selectedAccess}
              onChange={(e) => setSelectedAccess(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="ALL">Tous les accès</option>
              <option value="Freemium">Freemium</option>
              <option value="Essentiel">Essentiel</option>
              <option value="Live +">Live +</option>
              <option value="Révision +">Révision +</option>
              <option value="Intégrale">Intégrale</option>
            </select>
          </div>
        </div>

        {/* Quick Branch Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter size={11} /> Filtre Rapide :
          </span>
          {["Tous", "Sciences de l'Informatique", "Mathématiques", "Sciences Expérimentales", "Économie & Gestion", "Lettres"].map((sec) => {
            const isSelected = selectedSection === sec;
            return (
              <button
                key={sec}
                type="button"
                onClick={() => setSelectedSection(sec)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-xs font-bold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Summary stats */}
      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
        <span>
          Affichage de <strong>{filteredDocuments.length}</strong> document(s) {documents.length !== filteredDocuments.length ? `sur ${documents.length} au total` : ''}
        </span>
        {(selectedGrade !== 'Tous' || selectedSection !== 'Tous' || selectedCategory !== 'Tous' || selectedAccess !== 'Tous' || searchQuery) && (
          <button
            onClick={() => {
              setSelectedGrade('Tous');
              setSelectedSection('Tous');
              setSelectedCategory('Tous');
              setSelectedFormat('Tous');
              setSelectedAccess('Tous');
              setSearchQuery('');
            }}
            className="text-blue-600 hover:underline font-bold cursor-pointer"
          >
            Réinitialiser tous les filtres
          </button>
        )}
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {loading ? (
          <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
            <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto" />
            <p className="text-xs text-slate-500 font-medium">Chargement des documents du programme...</p>
          </div>
        ) : filteredDocuments.length === 0 ? (
          <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
            <FolderOpen size={36} className="text-slate-300 mx-auto" />
            <h3 className="font-bold text-slate-800 text-sm">Aucun document ne correspond à vos filtres</h3>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Ajustez vos filtres de recherche ou publiez un nouveau document ciblant ces filières et niveaux.
            </p>
            <button
              onClick={handleCreateClick}
              className="mt-2 px-4 py-2 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 transition-colors inline-flex items-center gap-1.5"
            >
              <Plus size={14} />
              <span>Créer un document</span>
            </button>
          </div>
        ) : (
          paginatedDocuments.map(doc => (
            <DocumentManagementCard
              key={doc.id}
              doc={doc}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))
        )}
      </div>

      {/* Dynamic Pagination Controls */}
      {filteredDocuments.length > itemsPerPage && (
        <DynamicPagination
          totalItems={filteredDocuments.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Modal d'édition directe de document avec sauvegarde stricte */}
      {editingDoc && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                  <Edit size={18} />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-base">Modifier le Document</h3>
                  <p className="text-[11px] text-slate-500 font-medium">Synchronisation globale & temps réel sans rechargement</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingDoc(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              {/* Titre */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Titre du document *</label>
                <input
                  type="text"
                  required
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white font-medium text-slate-800"
                  placeholder="ex: Fiche Synthèse Python - Chapitre 1"
                />
              </div>

              {/* Catégorie & Format */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Catégorie *</label>
                  <select
                    value={editCategory}
                    onChange={(e) => setEditCategory(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="Fiches & cours">📚 Fiches & cours</option>
                    <option value="Devoirs & Exercices">📝 Devoirs & Exercices</option>
                    <option value="Zone Correction">✅ Zone Correction</option>
                    <option value="Révision (Live Énoncé / Replay)">🎯 Révision (Live Énoncé / Replay)</option>
                    <option value="Quiz Interactifs">⚡ Quiz Interactifs</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Format Fichier *</label>
                  <select
                    value={editFileFormat}
                    onChange={(e) => setEditFileFormat(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white font-bold text-slate-700 cursor-pointer"
                  >
                    <option value="pdf">📄 Document PDF (.pdf)</option>
                    <option value="mp4">🎬 Vidéo MP4 / YouTube (.mp4)</option>
                    <option value="png">🖼️ Image PNG (.png)</option>
                    <option value="jpg">🖼️ Image JPG (.jpg)</option>
                    <option value="txt">📑 Fichier Texte (.txt)</option>
                    <option value="py">🐍 Script Python (.py)</option>
                  </select>
                </div>
              </div>

              {/* URL du fichier ou support */}
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700">Lien du support / Fichier URL</label>
                <input
                  type="text"
                  value={editFileUrl}
                  onChange={(e) => setEditFileUrl(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-none focus:border-blue-500 bg-slate-50 focus:bg-white font-mono text-slate-800"
                  placeholder="https://... ou /uploads/..."
                />
              </div>

              {/* Filières cibles */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">Filières cibles</label>
                <div className="flex flex-wrap gap-1.5">
                  {["Sciences de l'Informatique", "Mathématiques", "Sciences Expérimentales", "Économie & Gestion", "Lettres"].map((str) => {
                    const isChecked = editStreams.includes(str) || editStreams.includes("Toutes les filières") || editStreams.includes("Tous");
                    return (
                      <button
                        type="button"
                        key={str}
                        onClick={() => {
                          if (isChecked) {
                            setEditStreams(editStreams.filter(s => s !== str && s !== "Toutes les filières" && s !== "Tous"));
                          } else {
                            setEditStreams([...editStreams.filter(s => s !== "Toutes les filières" && s !== "Tous"), str]);
                          }
                        }}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                          isChecked 
                            ? 'bg-blue-50 border-blue-300 text-blue-700 font-bold' 
                            : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                        }`}
                      >
                        {str}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Badges & Catégories autorisées (FREEMIUM et ESSENTIEL inclus par défaut) */}
              <div className="space-y-1.5 pt-2 border-t border-slate-100">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700">Badges & Formules autorisées</label>
                  <span className="text-[10px] text-emerald-600 font-bold">FREEMIUM + ESSENTIEL par défaut</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {[
                    { id: "FREEMIUM", label: "🌱 FREEMIUM (Gratuit)" },
                    { id: "ESSENTIEL", label: "📘 ESSENTIEL" },
                    { id: "PREMIUM", label: "⭐ PREMIUM" },
                    { id: "PREMIUM_PLUS", label: "🚀 PREMIUM PLUS" },
                    { id: "PREMIUM_PLUS_PLUS", label: "👑 PREMIUM ++" }
                  ].map((tier) => {
                    const isSelected = editSelectedBadges.includes(tier.id);
                    return (
                      <button
                        type="button"
                        key={tier.id}
                        onClick={() => {
                          if (isSelected) {
                            setEditSelectedBadges(editSelectedBadges.filter(b => b !== tier.id));
                          } else {
                            setEditSelectedBadges([...editSelectedBadges, tier.id]);
                          }
                        }}
                        className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-400 text-emerald-800 shadow-2xs'
                            : 'bg-slate-50 border-slate-200 text-slate-500 hover:bg-slate-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}{tier.label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Boutons d'action */}
              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingDoc(null)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEdit}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingEdit ? <RefreshCw size={14} className="animate-spin" /> : <Save size={14} />}
                  <span>Enregistrer les modifications</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Upload Modal fallback */}
      <UploadDocumentModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onUploadSuccess={() => fetchDocuments()}
      />
    </div>
  );
};

export default GestionDocuments;
