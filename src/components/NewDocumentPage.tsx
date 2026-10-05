import React, { useState, useEffect } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, BookOpen, Layers, ArrowLeft, RefreshCw, X, Link, File } from 'lucide-react';
import { BranchCheckboxGroup, LevelCheckboxGroup } from './BranchSelector';
import { AccessTierSelector } from './AccessTierSelector';
import { SubscriptionTier, SUBSCRIPTION_TIERS, normalizeSubscriptionTier } from '../constants/packages';
import { fileFormatOptions, categoryOptions } from './CreateDocumentModal';

interface NewDocumentPageProps {
  onSuccess?: (newDoc: any) => void;
  onBack?: () => void;
}

export const NewDocumentPage: React.FC<NewDocumentPageProps> = ({
  onSuccess,
  onBack
}) => {
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('Chapitre 1 : Introduction & Généralités');
  const [category, setCategory] = useState('course');
  const [fileFormat, setFileFormat] = useState('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [existingFile, setExistingFile] = useState<{ name?: string; url?: string } | null>(null);

  // Multi-selection state: FREEMIUM selected by default
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['4ème']);
  const [selectedStreams, setSelectedStreams] = useState<string[]>(["Sciences de l'Informatique"]);
  const [selectedTiers, setSelectedTiers] = useState<SubscriptionTier[]>(['FREEMIUM', 'ESSENTIEL']);

  // Edit Mode state
  const [isEditMode, setIsEditMode] = useState(false);
  const [editingDocId, setEditingDocId] = useState<string | null>(null);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  // Hydrate on mount if editing document is set
  useEffect(() => {
    try {
      const savedEditDoc = localStorage.getItem('zed_editing_doc');
      let doc = savedEditDoc ? JSON.parse(savedEditDoc) : null;

      // Check URL query parameters for fallback
      if (!doc && typeof window !== 'undefined') {
        const hash = window.location.hash || '';
        const search = window.location.search || '';
        const params = new URLSearchParams(search || (hash.includes('?') ? hash.split('?')[1] : ''));
        const docId = params.get('id');
        if (params.get('editMode') === 'true' || params.get('edit') === 'true' || docId) {
          const stored = JSON.parse(localStorage.getItem('admin_documents') || localStorage.getItem('zed_documents') || '[]');
          doc = stored.find((d: any) => d.id === docId || d._id === docId);
        }
      }

      if (doc) {
        setIsEditMode(true);
        setEditingDocId(doc.id || doc._id || null);
        setTitle(doc.title || '');
        setChapter(doc.chapter || doc.chapterTitle || doc.module || 'Chapitre 1 : Introduction & Généralités');
        setCategory(doc.category || doc.contentType || 'course');
        setFileFormat(doc.fileFormat || doc.fileType || 'pdf');
        setFileUrl(doc.fileUrl || doc.supportUrl || doc.videoUrl || '');

        const existingTiers = Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
          ? doc.allowedTiers.map((t: string) => normalizeSubscriptionTier(t))
          : Array.isArray(doc.accessTiers) && doc.accessTiers.length > 0
          ? doc.accessTiers.map((t: string) => normalizeSubscriptionTier(t))
          : Array.isArray(doc.targetTiers) && doc.targetTiers.length > 0
          ? doc.targetTiers.map((t: string) => normalizeSubscriptionTier(t))
          : ['FREEMIUM'];
        setSelectedTiers(existingTiers as SubscriptionTier[]);

        const grades = doc.target?.gradeLevels || (doc.grade ? (doc.grade === 'Tous' ? ['Tous les niveaux'] : [doc.grade]) : ['4ème']);
        setSelectedGrades(grades);

        const streams = doc.target?.streams || doc.sections || (doc.section ? (doc.section === 'Tous' ? ['Toutes les filières'] : [doc.section]) : ["Sciences de l'Informatique"]);
        setSelectedStreams(streams);

        setExistingFile({
          name: doc.fileName || doc.attachmentName || doc.title,
          url: doc.fileUrl || doc.supportUrl || doc.videoUrl
        });
      }
    } catch (e) {
      console.warn("Failed to parse zed_editing_doc:", e);
    }
  }, []);

  const handleCancelEdit = () => {
    try {
      localStorage.removeItem('zed_editing_doc');
    } catch (e) {}
    setIsEditMode(false);
    setEditingDocId(null);
    setTitle('');
    setChapter('Chapitre 1 : Introduction & Généralités');
    setCategory('course');
    setFileFormat('pdf');
    setFileUrl('');
    setSelectedFile(null);
    setExistingFile(null);
    setSelectedGrades(['4ème']);
    setSelectedStreams(["Sciences de l'Informatique"]);
    setSelectedTiers(['FREEMIUM']);
    setFeedback(null);

    if (onBack) {
      onBack();
    } else {
      window.location.hash = 'admin/gestion-docs';
    }
  };

  const handleLevelChange = (selected: string[]) => {
    if (selected.includes("Tous") || selected.includes("Tous les niveaux") || selected.includes("ALL")) {
      setSelectedGrades(["Tous les niveaux"]);
    } else if (selected.length === 0) {
      setSelectedGrades(["Tous les niveaux"]);
    } else {
      setSelectedGrades(selected);
    }
  };

  const handleBranchChange = (selected: string[]) => {
    if (selected.includes("Tous") || selected.includes("Toutes les filières") || selected.includes("Toutes les sections") || selected.includes("ALL")) {
      setSelectedStreams(["Toutes les filières"]);
    } else if (selected.length === 0) {
      setSelectedStreams(["Toutes les filières"]);
    } else {
      setSelectedStreams(selected);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ message: "Veuillez indiquer un titre pour le document.", type: 'error' });
      return;
    }

    // GUARANTEE at least one badge is passed
    const tiersToSave = (Array.isArray(selectedTiers) && selectedTiers.length > 0) ? selectedTiers : ['FREEMIUM'];

    setLoading(true);
    setFeedback(null);

    try {
      let fileData = "";
      if (selectedFile) {
        fileData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve((ev.target?.result as string) || "");
          reader.readAsDataURL(selectedFile);
        });
      }

      const gradesPayload = selectedGrades.includes("Tous les niveaux") || selectedGrades.includes("Tous")
        ? ["Tous les niveaux"]
        : selectedGrades;

      const streamsPayload = selectedStreams.includes("Toutes les filières") || selectedStreams.includes("Toutes les sections") || selectedStreams.includes("Tous")
        ? ["Toutes les filières"]
        : selectedStreams;

      const documentPayload = {
        ...(editingDocId ? { id: editingDocId, _id: editingDocId } : {}),
        title: title.trim(),
        chapter: chapter.trim() || "Général",
        module: chapter.trim() || "Général",
        chapterTitle: chapter.trim() || "Général",
        category,
        contentType: category,
        fileFormat,
        fileType: fileFormat,
        fileUrl: fileUrl.trim() || existingFile?.url || "",
        supportUrl: fileUrl.trim() || existingFile?.url || "",
        videoUrl: fileUrl.trim() || existingFile?.url || "",
        fileData: fileData || undefined,
        attachmentName: selectedFile?.name || existingFile?.name || "",
        target: {
          gradeLevels: gradesPayload,
          streams: streamsPayload,
          userCategories: tiersToSave
        },
        allowedTiers: tiersToSave, // Send EXACT selected array
        accessTiers: tiersToSave,
        tiers: tiersToSave,
        targetTiers: tiersToSave,
        targetAudience: tiersToSave,
        sections: streamsPayload,
        section: streamsPayload[0] || "Toutes les filières",
        academicLevel: gradesPayload[0] || "4ème",
        grade: gradesPayload[0] || "4ème",
        level: gradesPayload[0] || "4ème",
        isPremium: !tiersToSave.some(t => String(t).toUpperCase() === 'FREEMIUM'),
        sourceModule: 'GESTION_DOCUMENTS'
      };

      console.log("📄 Envoi documentPayload :", documentPayload);

      let res: Response;
      if (isEditMode && editingDocId) {
        res = await fetch(`/api/documents/${editingDocId}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(documentPayload)
        });
        if (!res.ok) {
          // Fallback to POST with id
          res = await fetch("/api/documents", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(documentPayload)
          });
        }
      } else {
        res = await fetch("/api/documents", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(documentPayload)
        });
      }

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de l'enregistrement du document");
      }

      const data = await res.json();
      const savedDoc = data.document || data.course || data;

      // Enforce local storage state persistence for AI Studio preview
      try {
        const storedAdmin = JSON.parse(localStorage.getItem("admin_documents") || "[]");
        const storedZed = JSON.parse(localStorage.getItem("zed_documents") || "[]");

        if (isEditMode && editingDocId) {
          const updatedAdmin = storedAdmin.map((d: any) => (d.id === editingDocId || d._id === editingDocId) ? { ...d, ...documentPayload, ...savedDoc } : d);
          const updatedZed = storedZed.map((d: any) => (d.id === editingDocId || d._id === editingDocId) ? { ...d, ...documentPayload, ...savedDoc } : d);
          localStorage.setItem("admin_documents", JSON.stringify(updatedAdmin));
          localStorage.setItem("zed_documents", JSON.stringify(updatedZed));
        } else {
          localStorage.setItem("admin_documents", JSON.stringify([savedDoc, ...storedAdmin]));
          localStorage.setItem("zed_documents", JSON.stringify([savedDoc, ...storedZed]));
        }
        localStorage.removeItem('zed_editing_doc');
      } catch (e) {}

      setFeedback({ 
        message: isEditMode 
          ? "Document mis à jour avec succès et synchronisé !" 
          : "Document publié avec succès pour toutes les filières et niveaux ciblés !", 
        type: 'success' 
      });

      if (onSuccess) {
        onSuccess(savedDoc);
      }

      // If in edit mode, redirect back to document management after brief delay
      if (isEditMode) {
        setTimeout(() => {
          if (onBack) {
            onBack();
          } else {
            window.location.hash = 'admin/gestion-docs';
          }
        }, 1200);
      } else {
        // Reset form for fresh publication
        setTitle('');
        setFileUrl('');
        setSelectedFile(null);
      }
    } catch (err: any) {
      setFeedback({ message: err.message || "Erreur de connexion", type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-200 pb-4">
        <div className="flex items-center gap-3">
          {(onBack || isEditMode) && (
            <button
              onClick={isEditMode ? handleCancelEdit : onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors cursor-pointer"
              title="Retour"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-slate-900">
                {isEditMode ? "Modifier le Document" : "Publier un Nouveau Document"}
              </h1>
              {isEditMode && (
                <span className="px-2.5 py-0.5 text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300 rounded-md">
                  Mode Édition
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500">
              {isEditMode 
                ? "Ajustez les informations, forfaits autorisés et fichiers du document existant." 
                : "Ciblez précisément plusieurs niveaux et plusieurs filières en une seule publication."}
            </p>
          </div>
        </div>

        {isEditMode && (
          <button
            type="button"
            onClick={handleCancelEdit}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-lg transition cursor-pointer"
          >
            <X size={14} />
            <span>Annuler la modification</span>
          </button>
        )}
      </div>

      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-semibold flex items-center gap-2.5 ${
          feedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
        }`}>
          {feedback.type === 'success' ? <CheckCircle size={18} /> : <AlertTriangle size={18} />}
          <span>{feedback.message}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs space-y-5 text-xs">
        <div>
          <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-2">
            <FileText size={15} className="text-blue-600" />
            <span>Titre de la ressource *</span>
          </label>
          <input
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Ex : Devoir de Synthèse N°2 avec Correction Algorithmique"
            className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-slate-800 font-medium"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-2">
              <BookOpen size={15} className="text-amber-500" />
              <span>Chapitre / Module</span>
            </label>
            <input
              type="text"
              value={chapter}
              onChange={(e) => setChapter(e.target.value)}
              placeholder="Ex : Chapitre 2 : Les Structures de Données"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none text-slate-800 font-medium"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5 flex items-center gap-2">
              <Layers size={15} className="text-indigo-500" />
              <span>Catégorie de Contenu</span>
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
            >
              {categoryOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        </div>

        {/* NIVEAU SCOLAIRE */}
        <div className="pt-2">
          <LevelCheckboxGroup
            value={selectedGrades}
            onChange={handleLevelChange}
            idPrefix="new-doc-level"
          />
        </div>

        {/* FILIÈRE / NIVEAU D'ÉTUDES */}
        <div className="pt-2">
          <BranchCheckboxGroup
            value={selectedStreams}
            onChange={handleBranchChange}
            idPrefix="new-doc-branch"
          />
        </div>

        {/* FORFAITS AUTORISÉS (MULTI-BADGES COCHABLES) */}
        <div className="pt-2">
          <AccessTierSelector
            selectedTiers={selectedTiers}
            onChange={setSelectedTiers}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Format du Fichier</label>
            <select
              value={fileFormat}
              onChange={(e) => setFileFormat(e.target.value)}
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
            >
              {fileFormatOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.icon} {opt.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block font-bold text-slate-700 mb-1.5">Lien Externe / Vidéo</label>
            <input
              type="text"
              value={fileUrl}
              onChange={(e) => setFileUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800 focus:bg-white outline-none"
            />
          </div>
        </div>

        {/* FICHIER EXISTANT EN MODE ÉDITION */}
        {isEditMode && existingFile?.name && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <File size={16} className="text-blue-600" />
              <div>
                <p className="text-xs font-bold text-blue-900">Fichier actuel : {existingFile.name}</p>
                {existingFile.url && (
                  <a href={existingFile.url} target="_blank" rel="noopener noreferrer" className="text-[11px] text-blue-600 underline flex items-center gap-1 mt-0.5">
                    <Link size={10} /> Voir le fichier support
                  </a>
                )}
              </div>
            </div>
            <span className="text-[10px] font-semibold text-blue-700 bg-blue-100 px-2 py-0.5 rounded">Conserver ou remplacer ci-dessous</span>
          </div>
        )}

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">
            {isEditMode ? "Remplacer le fichier (Optionnel : PDF, Image, Python)" : "Téléversement de fichier (PDF, Image, Python)"}
          </label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {selectedFile && (
            <p className="mt-1 text-[11px] text-emerald-600 font-bold">
              ✓ Nouveau fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} Ko)
            </p>
          )}
        </div>

        <div className="pt-4 flex items-center justify-end gap-3">
          {isEditMode && (
            <button
              type="button"
              onClick={handleCancelEdit}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition cursor-pointer"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            {isEditMode ? <RefreshCw size={16} className={loading ? "animate-spin" : ""} /> : <Upload size={16} />}
            <span>{loading ? "Enregistrement en cours..." : (isEditMode ? "Mettre à jour le document" : "Publier le document")}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDocumentPage;
