import React, { useState, useEffect } from 'react';

export const ALL_TIERS = ['FREEMIUM', 'ESSENTIEL', 'LIVE +', 'RÉVISION +', 'INTÉGRALE'];

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
  const [selectedTiers, setSelectedTiers] = useState<string[]>([]);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Hydrate modal form when doc changes
  useEffect(() => {
    if (doc) {
      setTitle(doc.title || '');
      setCategory(doc.category || doc.contentType || '');
      
      // Ensure allowedTiers is parsed as an array
      const existingTiers = Array.isArray(doc.allowedTiers) && doc.allowedTiers.length > 0
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
      
      setSelectedTiers(existingTiers);
    }
  }, [doc]);

  // Handle checking / unchecking multiple badges
  const handleTierToggle = (tier: string) => {
    setSelectedTiers((prev) =>
      prev.includes(tier)
        ? prev.filter((t) => t !== tier) // Uncheck
        : [...prev, tier]               // Check / Add
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Prevent submitting with 0 badges
    const finalTiers = selectedTiers.length > 0 ? selectedTiers : ['FREEMIUM'];

    const updatedDocument = {
      ...doc,
      title: title.trim(),
      category: category.trim(),
      allowedTiers: finalTiers,
      accessTiers: finalTiers, // Backward compatibility
      tiers: finalTiers,
      targetTiers: finalTiers,
      targetAudience: finalTiers,
      target: {
        ...(doc.target || {}),
        userCategories: finalTiers
      },
      isPremium: !finalTiers.some(t => String(t).toUpperCase() === 'FREEMIUM')
    };

    setIsSaving(true);
    try {
      const docId = doc._id || doc.id;
      if (docId) {
        await fetch(`/api/admin/gestion-docs/${docId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updatedDocument)
        }).catch(() => {});
      }

      // Sync to localStorage
      try {
        const storedZed = JSON.parse(localStorage.getItem('zed_documents') || '[]');
        if (Array.isArray(storedZed)) {
          const updatedStored = storedZed.map((d: any) =>
            (d.id === updatedDocument.id || d._id === updatedDocument.id) ? updatedDocument : d
          );
          localStorage.setItem('zed_documents', JSON.stringify(updatedStored));
        }

        const storedAdmin = JSON.parse(localStorage.getItem('admin_documents') || '[]');
        if (Array.isArray(storedAdmin)) {
          const updatedAdmin = storedAdmin.map((d: any) =>
            (d.id === updatedDocument.id || d._id === updatedDocument.id) ? updatedDocument : d
          );
          localStorage.setItem('admin_documents', JSON.stringify(updatedAdmin));
        }
      } catch (err) {}

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl text-left border border-gray-100">
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 mb-4">
          <h2 className="text-xl font-bold text-gray-800">Modifier le document</h2>
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

          {/* Category Input */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Catégorie</label>
            <input
              type="text"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full rounded-lg border border-gray-300 p-2.5 text-sm focus:ring-2 focus:ring-emerald-500 focus:outline-none"
            />
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
