import React, { useState } from 'react';

interface EditModalProps {
  document: any;
  onClose: () => void;
  onSaveSuccess: (updatedDoc: any) => void;
}

export const EditDocumentModal: React.FC<EditModalProps> = ({ document: docItem, onClose, onSaveSuccess }) => {
  const [formData, setFormData] = useState({ 
    ...docItem,
    checkboxes: docItem?.checkboxes || {
      isFreemium: docItem?.isPremium === false || docItem?.accessStatus === 'FREEMIUM',
      isPremium: docItem?.isPremium === true || docItem?.accessStatus === 'PREMIUM',
      isEssentiel: true
    }
  });
  const [isSaving, setIsSaving] = useState(false);

  const handleCheckboxChange = (field: string, value: boolean) => {
    setFormData((prev: any) => ({
      ...prev,
      checkboxes: { ...(prev.checkboxes || {}), [field]: value }
    }));
  };

  const handleGlobalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);

    try {
      const docId = docItem._id || docItem.id;
      const response = await fetch(`/api/admin/gestion-docs/${docId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const result = await response.json();

      if (result.success || result.data) {
        // Validation globale répercutée
        onSaveSuccess(result.data || result.document || result.course);
        onClose();
      } else {
        alert("Erreur lors de la sauvegarde : " + (result.message || result.msg));
      }
    } catch (err) {
      console.error("Erreur serveur :", err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-4">
      <form onSubmit={handleGlobalSubmit} className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-xl max-w-lg w-full text-left space-y-4 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-700">
          <h3 className="font-extrabold text-lg text-slate-900 dark:text-white">Modifier le Document (Global)</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-600 font-bold text-lg">✕</button>
        </div>
        
        {/* Champ Titre */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Titre du document</label>
          <input 
            type="text" 
            value={formData.title || ''} 
            onChange={(e) => setFormData({...formData, title: e.target.value})} 
            className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 rounded-xl text-sm font-medium focus:ring-2 focus:ring-emerald-500"
            required
          />
        </div>

        {/* Catégorie & Tronc / Filière */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Catégorie</label>
            <input 
              type="text" 
              value={formData.category || formData.contentType || ''} 
              onChange={(e) => setFormData({...formData, category: e.target.value, contentType: e.target.value})} 
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 rounded-xl text-sm font-medium"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Trimestre</label>
            <input 
              type="text" 
              value={formData.trimestre || formData.trimester || ''} 
              onChange={(e) => setFormData({...formData, trimestre: e.target.value, trimester: e.target.value})} 
              className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white p-2.5 rounded-xl text-sm font-medium"
            />
          </div>
        </div>

        {/* Options de cases à cocher */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-2">Options d'accès & visibilité</label>
          <div className="flex flex-wrap gap-4 bg-slate-50 dark:bg-slate-900 p-3 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300">
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.checkboxes?.isFreemium || false} 
                onChange={(e) => handleCheckboxChange('isFreemium', e.target.checked)} 
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              Accès Freemium
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.checkboxes?.isPremium || false} 
                onChange={(e) => handleCheckboxChange('isPremium', e.target.checked)} 
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              Accès Premium
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input 
                type="checkbox" 
                checked={formData.checkboxes?.isEssentiel || false} 
                onChange={(e) => handleCheckboxChange('isEssentiel', e.target.checked)} 
                className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
              />
              Forfait Essentiel
            </label>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200 dark:border-slate-700">
          <button 
            type="button" 
            onClick={onClose}
            className="px-4 py-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-bold transition-all"
          >
            Annuler
          </button>
          <button 
            type="submit" 
            disabled={isSaving}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl font-bold text-xs shadow-md transition-all flex items-center gap-2"
          >
            {isSaving ? "Enregistrement..." : "Enregistrer globalement"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDocumentModal;
