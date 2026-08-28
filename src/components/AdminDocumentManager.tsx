import React, { useState, useMemo } from 'react';
import { 
  FileText, 
  Upload, 
  Search, 
  Filter, 
  Video, 
  Image as ImageIcon, 
  Code, 
  Trash2, 
  CheckCircle, 
  BookOpen, 
  Eye,
  Plus
} from 'lucide-react';
import { ALL_SECTIONS_OPTIONS } from '../constants/academic';
import { UploadDocumentModal } from './UploadDocumentModal';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface AdminDocument {
  id: string;
  title: string;
  grade: string;
  section: string;
  fileType: 'pdf' | 'mp4' | 'txt' | 'py' | 'png' | 'jpg';
  contentType: string;
  createdAt: string;
  size?: string;
  url?: string;
  videoUrl?: string;
  isPremium?: boolean;
}

const INITIAL_DOCUMENTS: AdminDocument[] = [
  {
    id: 'doc-1',
    title: 'Chapitre 1 : Algorithmique Avancée & Récursivité',
    grade: '4éme',
    section: "Sciences de l'Informatique",
    fileType: 'pdf',
    contentType: 'course',
    createdAt: '2026-08-20',
    size: '2.4 MB',
    isPremium: true
  },
  {
    id: 'doc-2',
    title: 'Devoir de Synthèse N°2 avec Correction Détaillée',
    grade: '4éme',
    section: 'Mathématiques',
    fileType: 'pdf',
    contentType: 'exercise',
    createdAt: '2026-08-18',
    size: '1.8 MB',
    isPremium: true
  },
  {
    id: 'doc-3',
    title: 'Économie Générale : Circuits et Agrégats Macroéconomiques',
    grade: '4éme',
    section: 'Économie & Gestion',
    fileType: 'pdf',
    contentType: 'course',
    createdAt: '2026-08-22',
    size: '3.1 MB',
    isPremium: false
  },
  {
    id: 'doc-4',
    title: 'Étude de Texte & Commentaire Composé - Baccalauréat',
    grade: '4éme',
    section: 'Lettres',
    fileType: 'pdf',
    contentType: 'course',
    createdAt: '2026-08-21',
    size: '1.2 MB',
    isPremium: false
  },
  {
    id: 'doc-5',
    title: 'Physiologie du Sport & Biomécanique Appliquée',
    grade: '4éme',
    section: 'Sport',
    fileType: 'pdf',
    contentType: 'course',
    createdAt: '2026-08-23',
    size: '4.5 MB',
    isPremium: false
  },
  {
    id: 'doc-6',
    title: 'TP Python - Analyse de Données & Programmation Orientée Objet',
    grade: '3ème',
    section: "Sciences de l'Informatique",
    fileType: 'py',
    contentType: 'exercise',
    createdAt: '2026-08-15',
    size: '45 KB',
    isPremium: true
  }
];

export const AdminDocumentManager: React.FC = () => {
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('Tous');
  const [selectedSection, setSelectedSection] = useState('Tous');
  const [selectedType, setSelectedType] = useState('Tous');

  // Reactive localStorage sync for documents
  const [documents, setDocuments] = useLocalStorage<AdminDocument[]>('AZED_DOCUMENTS_STORE', INITIAL_DOCUMENTS);

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      const matchSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        doc.section.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchGrade = selectedGrade === 'Tous' || doc.grade === selectedGrade;
      const matchSection = selectedSection === 'Tous' || doc.section === selectedSection;
      const matchType = selectedType === 'Tous' || doc.contentType === selectedType;

      return matchSearch && matchGrade && matchSection && matchType;
    });
  }, [documents, searchQuery, selectedGrade, selectedSection, selectedType]);

  const handleDocumentAdded = (newDoc: any) => {
    if (!newDoc) return;
    const item: AdminDocument = {
      id: newDoc.id || `doc-${Date.now()}`,
      title: newDoc.title || 'Document sans titre',
      grade: newDoc.grade || selectedGrade || 'Tous',
      section: newDoc.section || selectedSection || 'Tous',
      fileType: newDoc.fileType || 'pdf',
      contentType: newDoc.contentType || 'course',
      createdAt: new Date().toISOString().split('T')[0],
      size: newDoc.size || '1.0 MB',
      isPremium: newDoc.isPremium || false
    };
    setDocuments((prev) => [item, ...prev]);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) {
      setDocuments((prev) => prev.filter((d) => d.id !== id));
    }
  };

  const renderFormatBadge = (fileType: string) => {
    switch (fileType) {
      case 'mp4':
        return <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 text-[10px] font-bold flex items-center gap-1"><Video size={10} /> MP4</span>;
      case 'py':
        return <span className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold flex items-center gap-1"><Code size={10} /> Python</span>;
      case 'png':
      case 'jpg':
        return <span className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-200 text-[10px] font-bold flex items-center gap-1"><ImageIcon size={10} /> Image</span>;
      default:
        return <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-200 text-[10px] font-bold flex items-center gap-1"><FileText size={10} /> PDF</span>;
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <BookOpen className="text-blue-600" size={24} />
            Gestionnaire des Documents & Ressources Pédagogiques
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Publication, filtrage et ciblage par filière académique (Info, Math, Sciences Exp, Technique, Éco & Gestion, Lettres, Sport).
          </p>
        </div>
        <button
          onClick={() => setIsUploadOpen(true)}
          className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          Nouveau Document
        </button>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-xs">
          {/* Search */}
          <div className="relative">
            <Search size={15} className="absolute left-3 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher un document ou cours..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium outline-none focus:border-blue-500 focus:bg-white transition-all"
            />
          </div>

          {/* Grade Selector */}
          <div>
            <select
              value={selectedGrade}
              onChange={(e) => setSelectedGrade(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-blue-500 cursor-pointer"
            >
              <option value="Tous">Tous les niveaux</option>
              <option value="1ère">1ère Année</option>
              <option value="2ème">2ème Année</option>
              <option value="3ème">3ème Année</option>
              <option value="4éme">4ème Année (Bac)</option>
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
              {ALL_SECTIONS_OPTIONS.filter(s => s !== "Tous").map((sec) => (
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
              <option value="course">📚 Cours & Fiches</option>
              <option value="exercise">📝 Devoirs & Exercices</option>
              <option value="revision">🎯 Révisions & Examens</option>
            </select>
          </div>
        </div>

        {/* Quick Filter Branch Badges */}
        <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-slate-100 pb-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
            <Filter size={11} /> Filière :
          </span>
          {ALL_SECTIONS_OPTIONS.map((sec) => {
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

      {/* Documents List */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-left text-xs border-collapse min-w-[650px]">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <th className="p-4">Titre & Format</th>
                <th className="p-4">Niveau</th>
                <th className="p-4">Filière Académique</th>
                <th className="p-4">Catégorie</th>
                <th className="p-4">Date d'Ajout</th>
                <th className="p-4 text-center">Accès</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDocuments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400 font-medium">
                    Aucun document trouvé pour les filtres sélectionnés.
                  </td>
                </tr>
              ) : (
                filteredDocuments.map((doc) => (
                  <tr key={doc.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-semibold text-slate-800">
                      <div className="flex items-center gap-2.5">
                        {renderFormatBadge(doc.fileType)}
                        <span>{doc.title}</span>
                      </div>
                    </td>
                    <td className="p-4 font-bold text-slate-700">{doc.grade}</td>
                    <td className="p-4">
                      <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100">
                        {doc.section}
                      </span>
                    </td>
                    <td className="p-4 text-slate-600 capitalize">
                      {doc.contentType === 'course' ? '📚 Cours' : doc.contentType === 'exercise' ? '📝 Exercice' : '🎯 Révision'}
                    </td>
                    <td className="p-4 text-slate-400 font-mono">{doc.createdAt}</td>
                    <td className="p-4 text-center">
                      {doc.isPremium ? (
                        <span className="px-2 py-0.5 bg-amber-50 text-amber-700 border border-amber-200 rounded font-bold text-[10px]">
                          ⭐ Premium
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded font-bold text-[10px]">
                          Gratuit
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleDelete(doc.id)}
                          className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Upload Modal */}
      <UploadDocumentModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onUploadSuccess={handleDocumentAdded}
      />
    </div>
  );
};

export default AdminDocumentManager;
