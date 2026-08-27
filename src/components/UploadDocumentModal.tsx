import React, { useState } from 'react';
import { Upload, X, FileText, Video, Code, CheckCircle, AlertTriangle, Link as LinkIcon, Youtube, Eye, Image as ImageIcon } from 'lucide-react';
import { extractYouTubeId, getYouTubeEmbedUrl, getYouTubeThumbnailUrl } from '../lib/youtube';
import { AccessTierSelector } from './AccessTierSelector';
import { StudentTier } from '../types/access';
import { ALL_SECTIONS_OPTIONS } from '../constants/academic';

/* Options de la liste déroulante Format du Fichier */
export const fileFormatOptions = [
  { value: 'pdf', label: 'Document PDF (.pdf)', icon: '📄' },
  { value: 'mp4', label: 'Vidéo MP4 (.mp4)', icon: '🎬' },
  { value: 'png', label: 'Image PNG (.png)', icon: '🖼️' },
  { value: 'jpg', label: 'Image JPG / JPEG (.jpg, .jpeg)', icon: '🖼️' },
  { value: 'txt', label: 'Fichier Texte (.txt)', icon: '📑' },
  { value: 'py', label: 'Script Code Python (.py)', icon: '🐍' },
];

/* Attribut accept pour l'input file */
export const getAcceptAttribute = (selectedFormat: string) => {
  switch (selectedFormat) {
    case 'pdf': return '.pdf';
    case 'mp4': return '.mp4,video/mp4';
    case 'png': return '.png,image/png';
    case 'jpg': return '.jpg,.jpeg,image/jpeg';
    case 'txt': return '.txt';
    case 'py': return '.py';
    default: return '.pdf,.mp4,.png,.jpg,.jpeg,image/png,image/jpeg,.txt,.py';
  }
};

interface UploadDocumentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUploadSuccess?: (data: any) => void;
  gradesOptions?: string[];
}

export const UploadDocumentModal: React.FC<UploadDocumentModalProps> = ({
  isOpen,
  onClose,
  onUploadSuccess,
  gradesOptions = ["1ère", "2ème", "3ème", "4ème (Bac)"]
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [grade, setGrade] = useState('Tous');
  const [section, setSection] = useState('Tous');
  const [fileType, setFileType] = useState<'pdf' | 'mp4' | 'txt' | 'py' | 'png' | 'jpg'>('pdf');
  const [videoSourceType, setVideoSourceType] = useState<'youtube' | 'local'>('youtube');
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [contentType, setContentType] = useState('course');
  const [targetTiers, setTargetTiers] = useState<StudentTier[]>(['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS']);
  const [uploading, setUploading] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  if (!isOpen) return null;

  const detectedYouTubeId = extractYouTubeId(youtubeUrl);
  const youtubeEmbedUrl = detectedYouTubeId ? getYouTubeEmbedUrl(detectedYouTubeId) : null;
  const isYouTubeUrlInvalid = youtubeUrl.trim().length > 0 && !detectedYouTubeId;

  // Validation du type de fichier au moment de la sélection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedExtensions = ['pdf', 'txt', 'py', 'mp4', 'png', 'jpg', 'jpeg'];
    const isAllowedMime = ['video/mp4', 'image/png', 'image/jpeg'].includes(file.type);
    const fileExtension = file.name.split('.').pop()?.toLowerCase() || '';

    if (!allowedExtensions.includes(fileExtension) && !isAllowedMime) {
      const msg = "Format non supporté. Veuillez sélectionner un fichier PDF, PNG, JPG/JPEG, TXT, PY ou MP4.";
      alert(msg);
      setFeedback({ message: msg, type: 'error' });
      return;
    }

    const maxMb = (fileExtension === 'mp4' || file.type === 'video/mp4') ? 100 : 10;
    if (file.size > maxMb * 1024 * 1024) {
      const msg = `Le fichier est trop volumineux. Limite : ${maxMb} Mo pour ce format.`;
      alert(msg);
      setFeedback({ message: msg, type: 'error' });
      return;
    }

    setSelectedFile(file);
    setFeedback(null);

    if (fileExtension === 'mp4' || file.type === 'video/mp4') {
      setFileType('mp4');
      setVideoSourceType('local');
    } else if (fileExtension === 'png' || file.type === 'image/png') {
      setFileType('png');
    } else if (fileExtension === 'jpg' || fileExtension === 'jpeg' || file.type === 'image/jpeg') {
      setFileType('jpg');
    } else if (fileExtension === 'py') setFileType('py');
    else if (fileExtension === 'txt') setFileType('txt');
    else if (fileExtension === 'pdf') setFileType('pdf');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      alert("Veuillez remplir le titre de la ressource.");
      return;
    }

    if (fileType === 'mp4' && videoSourceType === 'youtube') {
      if (!youtubeUrl.trim()) {
        alert("Veuillez saisir le lien de la vidéo YouTube.");
        return;
      }
      if (!detectedYouTubeId) {
        alert("Le lien YouTube saisi est invalide. Format attendu : https://www.youtube.com/watch?v=... ou https://youtu.be/...");
        return;
      }
    }

    setUploading(true);
    try {
      let fileData = "";
      if (selectedFile && (fileType !== 'mp4' || videoSourceType === 'local')) {
        fileData = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = (ev) => resolve((ev.target?.result as string) || "");
          reader.readAsDataURL(selectedFile);
        });
      }

      const isPremiumVal = !targetTiers.includes('FREEMIUM') || targetTiers.includes('PREMIUM') || targetTiers.includes('PREMIUM_PLUS') || targetTiers.includes('PREMIUM_PLUS_PLUS');

      const payload = {
        title: title.trim(),
        grade,
        section,
        isPremium: isPremiumVal && !targetTiers.includes('FREEMIUM'),
        targetTiers,
        allowedTiers: targetTiers,
        fileType,
        contentType,
        videoUrl: fileType === 'mp4' && videoSourceType === 'youtube' ? youtubeUrl.trim() : "",
        attachmentName: selectedFile?.name || "",
        fileData
      };

      const res = await fetch("/api/admin/courses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erreur lors de la sauvegarde du document");
      const data = await res.json();
      
      setFeedback({ message: "Document publié avec succès !", type: 'success' });
      if (onUploadSuccess) onUploadSuccess(data);
      setTimeout(() => {
        onClose();
      }, 1000);
    } catch (err: any) {
      setFeedback({ message: err.message || "Erreur de connexion serveur", type: 'error' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[120] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl border border-slate-200 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
              <Upload className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-sm">Téléverser un Nouveau Document</h3>
              <p className="text-[11px] text-slate-400">Ressources PDF, Vidéos YouTube / MP4, Python & Fiches Texte</p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 p-1.5 rounded-xl hover:bg-slate-100 transition-colors">
            <X className="w-4 h-4" />
          </button>
        </div>

        {feedback && (
          <div className={`p-3 rounded-xl text-xs font-semibold flex items-center gap-2 ${
            feedback.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
          }`}>
            {feedback.type === 'success' ? <CheckCircle size={16} /> : <AlertTriangle size={16} />}
            <span>{feedback.message}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 mb-1">Titre de la ressource *</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex : Cours Vidéo Chapitre 1 - Algorithmique et Récursivité"
              className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-medium text-slate-800"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Format de Ressource</label>
              <select
                value={fileType}
                onChange={(e) => setFileType(e.target.value as any)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
              >
                {fileFormatOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.icon} {opt.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Niveau Académique</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
              >
                <option value="Tous">Tous les niveaux</option>
                {gradesOptions.map((g) => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Branche / Section</label>
              <select
                value={section}
                onChange={(e) => setSection(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
              >
                <option value="Tous">Toutes les filières</option>
                {ALL_SECTIONS_OPTIONS.filter(s => s !== "Tous").map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Type de Contenu</label>
              <select
                value={contentType}
                onChange={(e) => setContentType(e.target.value)}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 cursor-pointer"
              >
                <option value="course">📚 Cours / Support</option>
                <option value="exercise">📝 Devoir / Exercice</option>
                <option value="revision">🎯 Révision Live/Replay</option>
              </select>
            </div>
          </div>

          {/* DYNAMIC FIELD TOGGLE: VIDEO (YOUTUBE / LOCAL) vs FILE DROPZONE */}
          {fileType === 'mp4' ? (
            <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-150">
              <div className="flex items-center justify-between">
                <label className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                  <Video size={15} className="text-purple-600" />
                  <span>Source de la Vidéo</span>
                </label>
                <div className="flex bg-white p-0.5 rounded-lg border border-purple-200 text-[10px] font-bold">
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('youtube')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      videoSourceType === 'youtube'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Lien YouTube
                  </button>
                  <button
                    type="button"
                    onClick={() => setVideoSourceType('local')}
                    className={`px-3 py-1 rounded-md transition-all cursor-pointer ${
                      videoSourceType === 'local'
                        ? 'bg-purple-600 text-white shadow-2xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    Fichier MP4 Local
                  </button>
                </div>
              </div>

              {videoSourceType === 'youtube' ? (
                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="url"
                      value={youtubeUrl}
                      onChange={(e) => setYoutubeUrl(e.target.value)}
                      placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                      className={`w-full text-xs pl-9 pr-9 py-2.5 bg-white border rounded-xl outline-none font-mono transition-all ${
                        detectedYouTubeId
                          ? 'border-emerald-500 ring-2 ring-emerald-500/20'
                          : isYouTubeUrlInvalid
                          ? 'border-rose-500 ring-2 ring-rose-500/20'
                          : 'border-slate-200 focus:border-purple-500'
                      }`}
                    />
                    <Youtube size={16} className="absolute left-3 top-3 text-slate-400" />
                    {detectedYouTubeId && (
                      <CheckCircle size={16} className="absolute right-3 top-3 text-emerald-500" />
                    )}
                    {isYouTubeUrlInvalid && (
                      <AlertTriangle size={16} className="absolute right-3 top-3 text-rose-500" />
                    )}
                  </div>

                  {/* Real-time YouTube Validation Feedback & Live Preview */}
                  {detectedYouTubeId ? (
                    <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-2">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle size={13} />
                          <span>Vidéo YouTube Validée (ID: {detectedYouTubeId})</span>
                        </span>
                        <span className="text-[10px] text-slate-400">Intégration youtube-nocookie</span>
                      </div>
                      <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-200">
                        {youtubeEmbedUrl && (
                          <iframe
                            src={youtubeEmbedUrl}
                            title="Aperçu vidéo YouTube"
                            className="w-full h-full border-0"
                            allowFullScreen
                          />
                        )}
                      </div>
                    </div>
                  ) : isYouTubeUrlInvalid ? (
                    <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1">
                      <AlertTriangle size={13} />
                      <span>URL YouTube invalide. Exemples valides : youtube.com/watch?v=... ou youtu.be/...</span>
                    </p>
                  ) : (
                    <p className="text-[10px] text-slate-500">
                      Collez le lien complet de la vidéo YouTube. La vidéo sera intégrée sans publicité externe dans le lecteur sécurisé.
                    </p>
                  )}
                </div>
              ) : (
                <div className="border-2 border-dashed border-purple-200 rounded-xl p-4 text-center bg-white">
                  <input
                    type="file"
                    accept=".mp4,video/mp4"
                    onChange={handleFileChange}
                    className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-purple-50 file:text-purple-700 hover:file:bg-purple-100 cursor-pointer"
                  />
                  <p className="text-[11px] font-semibold text-slate-500 mt-2">Fichier vidéo MP4 local (Jusqu'à 100 Mo)</p>
                </div>
              )}
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 mb-1">Sélectionner un Fichier Document</label>
              <div className="border-2 border-dashed border-slate-200 hover:border-slate-300 rounded-xl p-4 text-center bg-slate-50/50">
                <input
                  type="file"
                  accept={getAcceptAttribute(fileType)}
                  onChange={handleFileChange}
                  className="w-full text-xs text-slate-600 file:mr-3 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 cursor-pointer"
                />
                <p className="text-[11px] font-semibold text-slate-500 mt-2">
                  Formats autorisés : PDF (.pdf), Images (.png, .jpg, .jpeg), Code Python (.py), Texte (.txt)
                </p>
                <p className="text-[10px] text-slate-400 mt-0.5">Limite de taille : 10 Mo</p>
              </div>
            </div>
          )}

          {selectedFile && fileType !== 'mp4' && (
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 bg-blue-50/60 border border-blue-100 rounded-xl">
                <div className="flex items-center gap-2 min-w-0">
                  {fileType === 'png' || fileType === 'jpg' || selectedFile.type.startsWith('image/') ? (
                    <ImageIcon className="w-4 h-4 text-purple-600 shrink-0" />
                  ) : selectedFile.name.endsWith('.py') ? (
                    <Code className="w-4 h-4 text-emerald-600 shrink-0" />
                  ) : (
                    <FileText className="w-4 h-4 text-blue-600 shrink-0" />
                  )}
                  <span className="font-semibold text-slate-800 truncate text-xs">{selectedFile.name}</span>
                </div>
                <span className="text-[10px] font-extrabold bg-blue-100 text-blue-800 px-2.5 py-1 rounded-lg shrink-0">
                  {(selectedFile.size / (1024 * 1024)).toFixed(1)} MB
                </span>
              </div>

              {/* Real-time Image Preview */}
              {(fileType === 'png' || fileType === 'jpg' || selectedFile.type.startsWith('image/')) && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                  <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aperçu de l'image sélectionnée</p>
                  <div className="max-h-48 overflow-hidden flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1">
                    <img
                      src={URL.createObjectURL(selectedFile)}
                      alt="Aperçu document"
                      className="max-h-44 object-contain rounded-md"
                    />
                  </div>
                </div>
              )}
            </div>
          )}

          <AccessTierSelector
            selectedTiers={targetTiers}
            onChange={(updatedTiers) => setTargetTiers(updatedTiers)}
            label="Tarif / Audience visée (Cocher les catégories autorisées)"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 transition-colors cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={uploading}
              className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold disabled:opacity-50 transition-colors shadow-xs cursor-pointer"
            >
              {uploading ? "Publication..." : "Enregistrer le Document"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UploadDocumentModal;
