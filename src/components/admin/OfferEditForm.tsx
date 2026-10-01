import React, { useState } from 'react';
import { PACK_CATEGORIES } from '../AddEditOfferPage';

// Liste stricte des catégories autorisées
export { PACK_CATEGORIES };

export interface OfferEditFormProps {
  initialData?: any;
  onSave?: (data: any) => void;
  onCancel?: () => void;
}

export const OfferEditForm: React.FC<OfferEditFormProps> = ({
  initialData,
  onSave,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    title: initialData?.title || '',
    packCategory: initialData?.packCategory || initialData?.category || 'essentiel',
    badgeText: initialData?.badgeText || initialData?.badgeLabel || '',
    description: initialData?.description || '',
    price: initialData?.price || initialData?.finalPrice || 0,
    oldPrice: initialData?.oldPrice || initialData?.originalPrice || 0,
    period: initialData?.period || 'Annuel',
    features: initialData?.features || []
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSave) {
      onSave(formData);
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm text-left">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col gap-2">
          <label htmlFor="packCategory" className="text-sm font-bold text-gray-700">
            Catégorie du Pack *
          </label>
          <select
            id="packCategory"
            name="packCategory"
            value={formData.packCategory}
            onChange={(e) => setFormData({ ...formData, packCategory: e.target.value })}
            className="w-full p-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 font-medium"
            required
          >
            <option value="" disabled>-- Sélectionner une catégorie --</option>
            {PACK_CATEGORIES.map((cat) => (
              <option key={cat.value} value={cat.value}>
                {cat.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="px-5 py-2 text-sm font-bold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 shadow-sm"
          >
            Enregistrer
          </button>
        </div>
      </form>
    </div>
  );
};

export default OfferEditForm;
