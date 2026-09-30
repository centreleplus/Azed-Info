import React, { useState, useEffect, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Video, 
  Image as ImageIcon, 
  Code, 
  Trash2, 
  BookOpen, 
  Plus, 
  Edit,
  LayoutGrid,
  List,
  RefreshCw
} from 'lucide-react';
import { ALL_SECTIONS_OPTIONS, GRADES_OPTIONS } from '../constants/academic';
import { PublicationDocument } from '../types';
import { DocumentManagementCard } from './DocumentManagementCard';
import { UploadDocumentModal } from './UploadDocumentModal';
import { DynamicPagination } from './DynamicPagination';
import { BulkAccessHeaderButton } from './BulkAccessHeaderButton';

export const AdminDocumentManager: React.FC = () => {
  const [documents, setDocuments] = useState<PublicationDocument[]>([]);
  const [loading, setLoading] = useState(true);
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Tous');
  const [selectedSection, setSelectedSection] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Pagination state (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/courses');
      if (!res.ok) throw new Error("Erreur");
      const data = await res.json();

      const formatted: PublicationDocument[] = (data || []).map((item: any) => {
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

        const catRaw = (item.category || item.contentType || 'course').toLowerCase();
        let catFormatted = 'Fiches & cours';
        if (catRaw === 'exercise_corrected' || catRaw.includes('correction')) catFormatted = 'Zone Correction';
        else if (catRaw === 'exercise' || catRaw.includes('devoir') || catRaw.includes('exercice') || catRaw === 'devoirs_exercices_fiches_cours') catFormatted = 'Devoirs & Exercices';
        else if (catRaw === 'revision' || catRaw.includes('examen') || catRaw.includes('live')) catFormatted = 'Révision (Live Énoncé / Replay)';
        else if (catRaw === 'quiz') catFormatted = 'Quiz Interactifs';
        else if (catRaw === 'course' || catRaw.includes('cours') || catRaw.includes('fiche')) catFormatted = 'Fiches & cours';

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
          id: item.id || `doc-${Date.now()}`,
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

      setDocuments(formatted);
    } catch (err) {
      console.error("Failed to load documents:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
  }, []);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.category.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchGrade = selectedGrade === 'Tous' || selectedGrade === 'Tous les Niveaux' || 
        doc.target.gradeLevels.some(g => g.toLowerCase().includes('tous') || g.toLowerCase() === selectedGrade.toLowerCase() || (selectedGrade.includes('4') && g.includes('4')));
      
      const matchSection = selectedSection === 'Tous' || selectedSection === 'Toutes les filières' ||
        doc.target.streams.some(s => s.toLowerCase().includes('toutes') || s.toLowerCase() === selectedSection.toLowerCase() || s.toLowerCase().includes(selectedSection.toLowerCase()));
      
      const matchType = selectedType === 'Tous' || 
        doc.category.toLowerCase().includes(selectedType.toLowerCase());

      return matchSearch && matchGrade && matchSection && matchType;
    });
  }, [documents, searchQuery, selectedGrade, selectedSection, selectedType]);

  // Reset pagination on filter change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchQuery, selectedGrade, selectedSection, selectedType]);

  // Paginated documents slice
  const paginatedDocuments = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredDocuments.slice(start, start + itemsPerPage);
  }, [filteredDocuments, currentPage, itemsPerPage]);

  const handleDelete = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer définitivement ce document ?")) {
      try {
        await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
        setDocuments((prev) => prev.filter((d) => d.id !== id));
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleEdit = (doc: PublicationDocument) => {
    try {
      sessionStorage.setItem("edit_course_data", JSON.stringify({
        id: doc.id,
        title: doc.title,
        grade: doc.target.gradeLevels.join(", "),
        section: doc.target.streams.join(", "),
        module: doc.chapterTitle,
        isPremium: doc.isPremium,
        contentType: doc.category.toLowerCase().includes('cours') ? 'course' : 'exercise',
        fileType: doc.fileFormat.toLowerCase(),
        videoUrl: doc.fileUrl,
        attachmentName: doc.fileName
      }));
    } catch (e) {
      console.error(e);
    }
    window.location.hash = "#/admin/nouveau-doc";
  };

  return (
    <div className="space-y-6 text-left max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={24} />
            Gestionnaire des Documents & Ressources Pédagogiques
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Badges d'audience dynamiques, traçabilité des emplacements et horodatage de publication.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <BulkAccessHeaderButton refreshDocs={fetchDocuments} />
          <div className="flex items-center bg-slate-100 p-1 rounded-xl border border-slate-200">
            <button
              onClick={() => setViewMode('cards')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'cards' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vue Cartes Détaillées"
            >
              <LayoutGrid size={14} />
              <span className="hidden sm:inline">Cartes</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'table' ? 'bg-white text-blue-700 shadow-xs' : 'text-slate-500 hover:text-slate-800'
              }`}
              title="Vue Tableau Compact"
            >
              <List size={14} />
              <span className="hidden sm:inline">Tableau</span>
            </button>
          </div>
          <button
            onClick={() => {
              window.location.hash = "#/admin/nouveau-doc";
            }}
            className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
          >
            <Plus size={16} />
            Nouveau Document
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un document..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500 focus:bg-white transition-all text-slate-800"
            />
          </div>

          {/* Grade Selector */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Tous les Niveaux</option>
              {GRADES_OPTIONS.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          {/* Section / Branch Selector */}
          <div>
            <select
              value={selectedSection}
              onChange={(e) => setSelectedSection(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Toutes les filières</option>
              {ALL_SECTIONS_OPTIONS.filter(s => s !== "Tous" && s !== "Toutes les filières").map((sec) => (
                <option key={sec} value={sec}>{sec}</option>
              ))}
            </select>
          </div>

          {/* Content Type Selector */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Tous types de contenu</option>
              <option value="Fiches & cours">📚 Fiches & cours</option>
              <option value="Devoirs & Exercices">📝 Devoirs & Exercices</option>
              <option value="Zone Correction">✅ Zone Correction</option>
              <option value="Révision">🎯 Révision & Examens</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Branch Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter size={11} /> Filière :
          </span>
          {["Tous", "Sciences de l'Informatique", "Mathématiques", "Sciences Expérimentales", "Économie & Gestion", "Lettres"].map((sec) => {
            const isSelected = selectedSection === sec;
            return (
              <button
                key={sec}
                onClick={() => setSelectedSection(sec)}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-2xs font-bold' 
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Content Area: Cards View or Table View */}
      {loading ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center space-y-3">
          <RefreshCw size={24} className="animate-spin text-blue-600 mx-auto" />
          <p className="text-xs text-slate-500 font-medium">Chargement des documents du programme...</p>
        </div>
      ) : filteredDocuments.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center space-y-3">
          <p className="text-xs text-slate-400 font-medium">Aucun document trouvé pour les filtres sélectionnés.</p>
        </div>
      ) : viewMode === 'cards' ? (
        <div className="space-y-4">
          {paginatedDocuments.map((doc) => (
            <DocumentManagementCard
              key={doc.id}
              doc={doc}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      ) : (
        /* Table View */
        <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <th className="p-4">Titre & Format</th>
                  <th className="p-4">Niveau</th>
                  <th className="p-4">Filières</th>
                  <th className="p-4">Catégorie</th>
                  <th className="p-4">Mis en ligne le</th>
                  <th className="p-4 text-center">Accès</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginatedDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-bold">
                          {doc.fileFormat}
                        </span>
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td className="p-4">
                      {doc.target.gradeLevels.map((g, idx) => (
                        <span key={idx} className="mr-1 px-1.5 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold">
                          {g}
                        </span>
                      ))}
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1">
                        {doc.target.streams.map((s, idx) => (
                          <span key={idx} className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="p-4 font-medium text-slate-700">{doc.category}</td>
                    <td className="p-4 text-slate-400 font-mono text-[11px]">
                      {new Date(doc.metadata.uploadedAt).toLocaleString('fr-FR')}
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                        doc.accessType.toLowerCase().includes('prem')
                          ? 'bg-amber-100 text-amber-800 border border-amber-300'
                          : 'bg-green-100 text-green-800 border border-green-300'
                      }`}>
                        {doc.accessType}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleEdit(doc)}
                          className="px-2.5 py-1 text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors cursor-pointer flex items-center gap-1 text-xs font-semibold"
                          title="Modifier"
                        >
                          <Edit size={13} />
                          <span>Modifier</span>
                        </button>
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 border border-transparent hover:border-rose-200 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Dynamic Pagination Controls */}
      {filteredDocuments.length > itemsPerPage && (
        <DynamicPagination
          totalItems={filteredDocuments.length}
          itemsPerPage={itemsPerPage}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      )}

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={() => fetchDocuments()}
      />
    </div>
  );
};

export default AdminDocumentManager;
