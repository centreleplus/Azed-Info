import React, { useState } from 'react';
import { Upload, X, FileText, CheckCircle, AlertTriangle, BookOpen, Layers, Link as LinkIcon, Video } from 'lucide-react';
import { BranchCheckboxGroup, LevelCheckboxGroup } from './BranchSelector';
import { AccessTierSelector } from './AccessTierSelector';
import { StudentTier, STUDENT_TIERS } from '../types/access';
import { extractYouTubeId, getYouTubeEmbedUrl } from '../lib/youtube';

export const fileFormatOptions = [
  { value: 'pdf', label: 'Document PDF (.pdf)', icon: '📄' },
  { value: 'mp4', label: 'Vidéo YouTube / MP4', icon: '🎬' },
  { value: 'png', label: 'Image PNG (.png)', icon: '🖼️' },
  { value: 'jpg', label: 'Image JPG / JPEG (.jpg, .jpeg)', icon: '🖼️' },
  { value: 'txt', label: 'Fichier Texte (.txt)', icon: '📑' },
  { value: 'py', label: 'Script Code Python (.py)', icon: '🐍' },
];

export const categoryOptions = [
  { value: 'course', label: '📚 Fiches & cours' },
  { value: 'exercise', label: '📝 Devoirs & Exercices' },
  { value: 'exercise_corrected', label: '✅ Zone Correction' },
  { value: 'revision', label: '🎯 Révision (Live Énoncé / Replay)' },
  { value: 'quiz', label: '⚡ Quiz Interactifs' }
];

interface CreateDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (createdDoc: any) => void;
}

export const CreateDocumentModal: React.FC<CreateDocumentModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  const [title, setTitle] = useState('');
  const [chapter, setChapter] = useState('Chapitre 1 : Introduction & Généralités');
  const [category, setCategory] = useState('course');
  const [fileFormat, setFileFormat] = useState('pdf');
  const [fileUrl, setFileUrl] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // State for multiple target selection
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['4ème']);
  const [selectedStreams, setSelectedStreams] = useState<string[]>(["Sciences de l'Informatique"]);
  const [targetTiers, setTargetTiers] = useState<StudentTier[]>(['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS']);

  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

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

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (ext === 'pdf') setFileFormat('pdf');
    else if (ext === 'mp4') setFileFormat('mp4');
    else if (ext === 'png') setFileFormat('png');
    else if (ext === 'jpg' || ext === 'jpeg') setFileFormat('jpg');
    else if (ext === 'py') setFileFormat('py');
    else if (ext === 'txt') setFileFormat('txt');

    setSelectedFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setFeedback({ message: "Veuillez indiquer un titre pour le document.", type: 'error' });
      return;
    }

    setUploading(true);
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

      // Structure target object with string arrays
      const gradesPayload = selectedGrades.includes("Tous les niveaux") || selectedGrades.includes("Tous")
        ? ["Tous les niveaux"]
        : selectedGrades;

      const streamsPayload = selectedStreams.includes("Toutes les filières") || selectedStreams.includes("Toutes les sections") || selectedStreams.includes("Tous")
        ? ["Toutes les filières"]
        : selectedStreams;

      const documentPayload = {
        title: title.trim(),
        chapter: chapter.trim() || "Général",
        category, // ex: Fiches & cours, Devoirs & Exercices
        fileFormat, // ex: .pdf
        fileUrl: fileUrl.trim(),
        fileData,
        attachmentName: selectedFile?.name || "",
        target: {
          gradeLevels: gradesPayload, // ex: ["4ème", "3ème"]
          streams: streamsPayload     // ex: ["Sciences de l'Informatique", "Mathématiques"]
        },
        targetTiers,
        targetAudience: targetTiers.map(t => STUDENT_TIERS[t]?.label || t),
        isPremium: !targetTiers.includes('FREEMIUM')
      };

      console.log("Submitting document payload:", documentPayload);

      const res = await fetch("/api/documents", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(documentPayload)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || "Erreur lors de l'enregistrement du document");
      }

      const responseData = await res.json();
      setFeedback({ message: "Document créé et publié avec succès !", type: 'success' });
      
      if (onSuccess) {
        onSuccess(responseData.document || responseData);
      }

      setTimeout(() => {
        onClose();
      }, 900);
    } catch (err: any) {
      console.error("Erreur soumission document:", err);
      setFeedback({ message: err.message || "Erreur de connexion serveur", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 dark:border-gray-800 space-y-5 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-gray-800 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 dark:text-white text-sm">Publier un Nouveau Document</h3>
              <p className="text-[11px] text-slate-400">Diffusion multi-niveaux et multi-filières ciblée</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-gray-800 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800' : 'bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
          }`}>
            {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
              <FileText size={14} className="text-blue-600" />
              <span>Titre du document *</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Fiche TD N°1 - Arbres Binaires et Récursivité"
              className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-slate-800 dark:text-white"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <BookOpen size={14} className="text-amber-500" />
                <span>Chapitre / Module</span>
              </label>
              <input
                type="text"
                value={chapter}
                onChange={(e) => setChapter(e.target.value)}
                placeholder="Ex : Chapitre 1 : Algorithmique"
                className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl focus:bg-white dark:focus:bg-gray-900 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 outline-none font-medium text-slate-800 dark:text-white"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1.5">
                <Layers size={14} className="text-indigo-500" />
                <span>Catégorie</span>
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-semibold text-slate-800 dark:text-white cursor-pointer"
              >
                {categoryOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Grade Levels Selection */}
          <div>
            <LevelCheckboxGroup
              value={selectedGrades}
              onChange={handleLevelChange}
              idPrefix="modal-doc-level"
            />
          </div>

          {/* Target Streams Selection */}
          <div>
            <BranchCheckboxGroup
              value={selectedStreams}
              onChange={handleBranchChange}
              idPrefix="modal-doc-branch"
            />
          </div>

          {/* Access Tier Selector */}
          <div>
            <AccessTierSelector
              selectedTiers={targetTiers}
              onChange={setTargetTiers}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Format du Fichier</label>
              <select
                value={fileFormat}
                onChange={(e) => setFileFormat(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-semibold text-slate-800 dark:text-white cursor-pointer"
              >
                {fileFormatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Lien Web / Vidéo Externe</label>
              <input
                type="text"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 bg-slate-50 dark:bg-gray-800 border border-slate-200 dark:border-gray-700 rounded-xl font-medium text-slate-800 dark:text-white focus:bg-white outline-none"
              />
            </div>
          </div>

          {/* File Upload Dropzone */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">Téléverser un fichier local (PDF, Image, Python, etc.)</label>
            <input
              type="file"
              onChange={handleFileChange}
              className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
            />
            {selectedFile && (
              <p className="mt-1 text-[11px] text-emerald-600 font-bold">
                ✓ Fichier sélectionné : {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} Ko)
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-gray-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-gray-800 rounded-xl transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 active:scale-95 rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <Upload size={14} />
              <span>{uploading ? "Publication en cours..." : "Publier le document"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateDocumentModal;
