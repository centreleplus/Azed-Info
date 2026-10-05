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
import { EditDocumentModal } from './EditDocumentModal';
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

        const explicitAllowedTiers = Array.isArray(item.allowedTiers) && item.allowedTiers.length > 0
          ? item.allowedTiers
          : Array.isArray(item.accessTiers) && item.accessTiers.length > 0
          ? item.accessTiers
          : Array.isArray(item.tiers) && item.tiers.length > 0
          ? item.tiers
          : Array.isArray(item.targetTiers) && item.targetTiers.length > 0
          ? item.targetTiers
          : Array.isArray(item.target?.userCategories) && item.target.userCategories.length > 0
          ? item.target.userCategories
          : (typeof item.allowedTiers === 'string' && item.allowedTiers ? [item.allowedTiers] : ['FREEMIUM']);

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
          allowedTiers: explicitAllowedTiers,
          accessTiers: explicitAllowedTiers,
          tiers: explicitAllowedTiers,
          targetTiers: explicitAllowedTiers,
          target: {
            gradeLevels: gradeList,
            streams: streamList,
            userCategories: explicitAllowedTiers
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
    try {
      localStorage.setItem('zed_editing_doc', JSON.stringify(doc));
    } catch (e) {}

    if (onEditDocument) {
      onEditDocument(doc);
    }
    
    // Redirect to #/admin/nouveau-doc?editMode=true&id=[id]
    window.location.hash = `#/admin/nouveau-doc?editMode=true&id=${doc.id}`;
    window.dispatchEvent(new CustomEvent('navigate-admin-tab', { detail: { tab: 'courses-upload', editMode: true, doc } }));
  };

  const handleSaveEditedDoc = (updatedDoc: any) => {
    const docTiers = Array.isArray(updatedDoc.allowedTiers) && updatedDoc.allowedTiers.length > 0
      ? updatedDoc.allowedTiers
      : ['FREEMIUM'];

    setDocuments((prevDocs) =>
      prevDocs.map((d) =>
        (d.id === updatedDoc.id || (d as any)._id === updatedDoc.id)
          ? {
              ...d,
              ...updatedDoc,
              title: updatedDoc.title || d.title,
              category: updatedDoc.category || d.category,
              allowedTiers: docTiers,
              accessTiers: docTiers,
              tiers: docTiers,
              targetTiers: docTiers,
              target: {
                ...(d.target || {}),
                userCategories: docTiers
              }
            }
          : d
      )
    );

    // Sync to localStorage
    try {
      const stored = JSON.parse(localStorage.getItem('zed_documents') || '[]');
      if (Array.isArray(stored)) {
        const updatedStored = stored.map((d: any) =>
          (d.id === updatedDoc.id || d._id === updatedDoc.id) ? { ...d, ...updatedDoc } : d
        );
        localStorage.setItem('zed_documents', JSON.stringify(updatedStored));
      }

      const storedAdmin = JSON.parse(localStorage.getItem('admin_documents') || '[]');
      if (Array.isArray(storedAdmin)) {
        const updatedAdmin = storedAdmin.map((d: any) =>
          (d.id === updatedDoc.id || d._id === updatedDoc.id) ? { ...d, ...updatedDoc } : d
        );
        localStorage.setItem('admin_documents', JSON.stringify(updatedAdmin));
      }

      const bc = new BroadcastChannel("azed_docs_sync");
      bc.postMessage({ type: "DOC_UPDATED", id: updatedDoc.id, doc: updatedDoc });
      bc.close();
    } catch (e) {}

    setEditingDoc(null);
    setFeedback({ message: "Document modifié avec succès !", type: 'success' });
    setTimeout(() => setFeedback(null), 3000);
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

      {/* Modal d'édition globale avec support multi-badges */}
      <EditDocumentModal
        doc={editingDoc}
        isOpen={!!editingDoc}
        onClose={() => setEditingDoc(null)}
        onSave={handleSaveEditedDoc}
      />

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
