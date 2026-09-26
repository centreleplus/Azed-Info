import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, AlertTriangle, BookOpen, Layers, ArrowLeft } from 'lucide-react';
import { BranchCheckboxGroup, LevelCheckboxGroup } from './BranchSelector';
import { AccessTierSelector } from './AccessTierSelector';
import { StudentTier, STUDENT_TIERS } from '../types/access';
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

  // Multi-selection state
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['4ème']);
  const [selectedStreams, setSelectedStreams] = useState<string[]>(["Sciences de l'Informatique"]);
  const [targetTiers, setTargetTiers] = useState<StudentTier[]>(['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS']);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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
        title: title.trim(),
        chapter: chapter.trim() || "Général",
        category,
        fileFormat,
        fileUrl: fileUrl.trim(),
        fileData,
        attachmentName: selectedFile?.name || "",
        target: {
          gradeLevels: gradesPayload,
          streams: streamsPayload
        },
        targetTiers,
        targetAudience: targetTiers.map(t => STUDENT_TIERS[t]?.label || t),
        isPremium: !targetTiers.includes('FREEMIUM')
      };

      console.log("📄 Envoi documentPayload /admin/nouveau-doc :", documentPayload);

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentPayload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de la publication du document");
      }

      const data = await res.json();
      setFeedback({ message: "Document publié avec succès pour toutes les filières et niveaux ciblés !", type: 'success' });

      if (onSuccess) {
        onSuccess(data.document || data);
      }

      // Reset form
      setTitle('');
      setFileUrl('');
      setSelectedFile(null);
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
          {onBack && (
            <button
              onClick={onBack}
              className="p-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors"
            >
              <ArrowLeft size={18} />
            </button>
          )}
          <div>
            <h1 className="text-xl font-extrabold text-slate-900">Publier un Nouveau Document</h1>
            <p className="text-xs text-slate-500">Ciblez précisément plusieurs niveaux et plusieurs filières en une seule publication</p>
          </div>
        </div>
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

        {/* FORFAITS AUTORISÉS */}
        <div className="pt-2">
          <AccessTierSelector
            selectedTiers={targetTiers}
            onChange={setTargetTiers}
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

        <div>
          <label className="block font-bold text-slate-700 mb-1.5">Téléversement de fichier (PDF, Image, Python)</label>
          <input
            type="file"
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="w-full text-xs text-slate-500 file:mr-4 file:py-2.5 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
          />
          {selectedFile && (
            <p className="mt-1 text-[11px] text-emerald-600 font-bold">
              ✓ Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} Ko)
            </p>
          )}
        </div>

        <div className="pt-4 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
          >
            <Upload size={16} />
            <span>{loading ? "Publication en cours..." : "Publier le document"}</span>
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewDocumentPage;
