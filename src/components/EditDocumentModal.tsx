import React, { useState, useEffect } from 'react';
import { normalizeBadge, OfficialBadge } from '../constants/badges';

export const ALL_TIERS: OfficialBadge[] = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'];
const GRADE_OPTIONS = ['Tous les niveaux', '1ère', '2ème', '3ème', '4ème'];
const STREAM_OPTIONS = [
  'Toutes les filières',
  "Sciences de l'Informatique",
  'Mathématiques',
  'Sciences Expérimentales',
  'Sciences Techniques',
  'Économie et Gestion',
  'Lettres',
  'Sport',
  'Tronc Commun'
];
const CATEGORY_OPTIONS = [
  { value: 'course', label: 'Fiches & cours' },
  { value: 'exercise', label: 'Devoirs & Exercices' },
  { value: 'exercise_corrected', label: 'Zone Correction' },
  { value: 'revision', label: 'Révision (Live Énoncé / Replay)' },
  { value: 'devoirs_exercices_fiches_cours', label: 'Hybride (Cours + Devoirs)' }
];
const TRIMESTER_OPTIONS = [
  { value: '1ere trimestre', label: '1er Trimestre' },
  { value: '2eme trimestre', label: '2ème Trimestre' },
  { value: '3eme trimestre', label: '3ème Trimestre' },
  { value: 'revision', label: 'Période Révision / Live' }
];

export interface EditDocumentModalProps {
  doc?: any;
  document?: any;
  isOpen?: boolean;
  onClose: () => void;
  onSave?: (updatedDoc: any) => void;
  onSaveSuccess?: (updatedDoc: any) => void;
}

export const EditDocumentModal: React.FC<EditDocumentModalProps> = ({
  doc: docProp,
  document: documentProp,
  isOpen = true,
  onClose,
  onSave,
  onSaveSuccess
}) => {
  const doc = docProp || documentProp;
  const [selectedTiers, setSelectedTiers] = useState<OfficialBadge[]>([]);
  const [selectedGrades, setSelectedGrades] = useState<string[]>(['Tous les niveaux']);
  const [selectedStreams, setSelectedStreams] = useState<string[]>(['Toutes les filières']);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('course');
  const [trimester, setTrimester] = useState('1ere trimestre');
  const [isSaving, setIsSaving] = useState(false);

  // Hydrate modal form when doc changes
  useEffect(() => {
    if (doc) {
      setTitle(doc.title || '');
      const rawCat = String(doc.contentType || doc.category || 'course').toLowerCase();
      if (rawCat.includes('correction') || rawCat === 'exercise_corrected') setCategory('exercise_corrected');
      else if (rawCat === 'devoirs_exercices_fiches_cours') setCategory('devoirs_exercices_fiches_cours');
      else if (rawCat.includes('devoir') || rawCat.includes('exercice') || rawCat === 'exercise') setCategory('exercise');
      else if (rawCat.includes('revision') || rawCat.includes('révision')) setCategory('revision');
      else setCategory('course');

      const rawTrim = String(doc.trimestre || doc.trimester || '1ere trimestre').toLowerCase();
      if (rawTrim.includes('2')) setTrimester('2eme trimestre');
      else if (rawTrim.includes('3')) setTrimester('3eme trimestre');
      else if (rawTrim.includes('rev') || rawTrim.includes('live') || rawTrim.includes('correction')) setTrimester('revision');
      else setTrimester('1ere trimestre');

      const rawGrades = Array.isArray(doc.target?.gradeLevels) && doc.target.gradeLevels.length > 0
        ? doc.target.gradeLevels
        : doc.grade
        ? String(doc.grade).split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['Tous les niveaux'];
      setSelectedGrades(rawGrades.length > 0 ? rawGrades : ['Tous les niveaux']);

      const rawStreams = Array.isArray(doc.target?.streams) && doc.target.streams.length > 0
        ? doc.target.streams
        : doc.section
        ? String(doc.section).split(',').map((s: string) => s.trim()).filter(Boolean)
        : ['Toutes les filières'];
      setSelectedStreams(rawStreams.length > 0 ? rawStreams : ['Toutes les filières']);

      const existingTiers = Array.isArray(doc.allowedBadges) && doc.allowedBadges.length > 0
        ? doc.allowedBadges
        : Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
        ? doc.allowedTiers
        : Array.isArray(doc.accessTiers) && doc.accessTiers.length > 0
        ? doc.accessTiers
        : Array.isArray(doc.tiers) && doc.tiers.length > 0
        ? doc.tiers
        : Array.isArray(doc.targetTiers) && doc.targetTiers.length > 0
        ? doc.targetTiers
        : Array.isArray(doc.target?.userCategories) && doc.target.userCategories.length > 0
        ? doc.target.userCategories
        : ['FREEMIUM'];
      
      const normalized = Array.from(new Set(existingTiers.map((t: any) => normalizeBadge(t))));
      setSelectedTiers(normalized.length > 0 ? normalized : ['FREEMIUM']);
    }
  }, [doc]);

  const handleTierToggle = (tier: OfficialBadge) => {
    setSelectedTiers((prev) =>
      prev.includes(tier)
        ? prev.filter((t) => t !== tier)
        : [...prev, tier]
    );
  };

  const handleGradeToggle = (grade: string) => {
    if (grade === 'Tous les niveaux') {
      setSelectedGrades(['Tous les niveaux']);
      return;
    }
    setSelectedGrades((prev) => {
      const clean = prev.filter((g) => g !== 'Tous les niveaux' && g !== 'Tous');
      const next = clean.includes(grade) ? clean.filter((g) => g !== grade) : [...clean, grade];
      return next.length > 0 ? next : ['Tous les niveaux'];
    });
  };

  const handleStreamToggle = (stream: string) => {
    if (stream === 'Toutes les filières') {
      setSelectedStreams(['Toutes les filières']);
      return;
    }
    setSelectedStreams((prev) => {
      const clean = prev.filter((s) => s !== 'Toutes les filières' && s !== 'Toutes les sections' && s !== 'Tous');
      const next = clean.includes(stream) ? clean.filter((s) => s !== stream) : [...clean, stream];
      return next.length > 0 ? next : ['Toutes les filières'];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const finalTiers = selectedTiers.length > 0 ? selectedTiers : ['FREEMIUM'];
    const finalGrades = selectedGrades.length > 0 ? selectedGrades : ['Tous les niveaux'];
    const finalStreams = selectedStreams.length > 0 ? selectedStreams : ['Toutes les filières'];
    const catLabel = CATEGORY_OPTIONS.find((c) => c.value === category)?.label || category;
    const trimLabel = TRIMESTER_OPTIONS.find((t) => t.value === trimester)?.label || trimester;

    const updatedDocument = {
      ...doc,
      title: title.trim(),
      category: catLabel,
      contentType: category,
      trimestre: trimester,
      trimester: trimLabel,
      grade: finalGrades.join(', '),
      section: finalStreams.join(', '),
      allowedBadges: finalTiers,
      allowedTiers: finalTiers,
      accessTiers: finalTiers,
      tiers: finalTiers,
      targetTiers: finalTiers,
      targetAudience: finalTiers,
      target: {
        ...(doc.target || {}),
        gradeLevels: finalGrades,
        streams: finalStreams,
        userCategories: finalTiers
      },
      isPremium: !finalTiers.some(t => String(t).toUpperCase() === 'FREEMIUM')
    };

    setIsSaving(true);
    try {
      const docId = doc._id || doc.id;
      if (docId) {
        const res = await fetch(`/api/admin/courses/${docId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDocument)
        });
        if (res.ok) {
          const serverDoc = await res.json();
          Object.assign(updatedDocument, serverDoc);
        }
      }

      try {
        window.dispatchEvent(new CustomEvent('document-updated', { detail: updatedDocument }));
        window.dispatchEvent(new CustomEvent('admin-content-updated', { detail: updatedDocument }));
        window.dispatchEvent(new CustomEvent('realtime-event', { detail: { type: 'DOCUMENTS_UPDATED', doc: updatedDocument } }));
        const bc = new BroadcastChannel("azed_docs_sync");
        bc.postMessage({ type: "DOC_UPDATED", id: updatedDocument.id, doc: updatedDocument });
        bc.close();
      } catch (e) {}

    } catch (err) {
      console.error("Erreur serveur lors de la sauvegarde :", err);
    } finally {
      setIsSaving(false);
    }

    if (onSave) onSave(updatedDocument);
    if (onSaveSuccess) onSaveSuccess(updatedDocument);
    onClose();
  };

  if (!isOpen || !doc) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 overflow-y-auto">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-2xl text-left border border-gray-100 my-8 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Modifier le document (Filtrage Multicritères)</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 font-bold text-lg cursor-pointer"
          >
            ✕
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Title Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
              required
            />
          </div>

          {/* Category & Trimester */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {CATEGORY_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Sous-menu (Trimestre)</label>
              <select
                value={trimester}
                onChange={(e) => setTrimester(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                {TRIMESTER_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Niveau Scolaire */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Niveau Scolaire ciblé
            </label>
            <div className="flex flex-wrap gap-2">
              {GRADE_OPTIONS.map((grade) => {
                const isChecked = selectedGrades.includes(grade);
                return (
                  <button
                    key={grade}
                    type="button"
                    onClick={() => handleGradeToggle(grade)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      isChecked
                        ? 'border-blue-500 bg-blue-50 text-blue-900'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {grade}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Filière / Section */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Filière / Section ciblée
            </label>
            <div className="flex flex-wrap gap-2">
              {STREAM_OPTIONS.map((stream) => {
                const isChecked = selectedStreams.includes(stream);
                return (
                  <button
                    key={stream}
                    type="button"
                    onClick={() => handleStreamToggle(stream)}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      isChecked
                        ? 'border-indigo-500 bg-indigo-50 text-indigo-900'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {stream}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Multi-Badge Checkbox Group */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Tarif / Audience visée (Cocher les catégories autorisées)
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {ALL_TIERS.map((tier) => {
                const isChecked = selectedTiers.includes(tier);
                return (
                  <label
                    key={tier}
                    className={`flex items-center gap-2 p-2.5 rounded-lg border text-xs font-bold cursor-pointer transition-all ${
                      isChecked
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-xs'
                        : 'border-gray-200 bg-gray-50 text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleTierToggle(tier)}
                      className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 cursor-pointer"
                    />
                    <span>{tier}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-100 rounded-lg cursor-pointer transition"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm cursor-pointer transition disabled:opacity-50"
            >
              {isSaving ? "Enregistrement..." : "Enregistrer les modifications"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditDocumentModal;
