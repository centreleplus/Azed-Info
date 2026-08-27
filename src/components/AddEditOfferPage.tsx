import React, { useState } from 'react';
import { CampaignPack } from './campaignsStore';
import { compressImageFileToDataUrl } from '../utils/imageOptimizer';

export type OfferFormData = Partial<CampaignPack>;

export const AddEditOfferPage = ({
  initialData,
  onSave,
  onCancel,
}: {
  initialData?: CampaignPack;
  onSave: (data: Partial<CampaignPack>) => void;
  onCancel: () => void;
}) => {
  const [title, setTitle] = useState(initialData?.title || '');
  const [category, setCategory] = useState(initialData?.category || 'Freemium');
  const [badgeLabel, setBadgeLabel] = useState(initialData?.badgeLabel || 'OFFRE SPÉCIALE');
  const [description, setDescription] = useState(initialData?.description || '');
  const [originalPrice, setOriginalPrice] = useState(initialData?.originalPrice || 150);
  const [finalPrice, setFinalPrice] = useState(initialData?.finalPrice || 120);
  const [period, setPeriod] = useState(initialData?.period || 'TND / Trimestre');
  const [iconUrl, setIconUrl] = useState(initialData?.iconUrl || '');
  const [isPopular, setIsPopular] = useState(initialData?.isPopular || false);
  const [autoAccessAllResources, setAutoAccessAllResources] = useState(initialData?.autoAccessAllResources || false);
  const [features, setFeatures] = useState<string[]>(initialData?.features || []);
  const [newFeature, setNewFeature] = useState('');

  // Calcul du pourcentage de réduction
  const discountPercent =
    originalPrice > finalPrice && originalPrice > 0
      ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100)
      : 0;

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFileToDataUrl(file, 200, 200, 0.9);
        setIconUrl(compressed);
      } catch (err) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setIconUrl(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setFeatures(prev => [...prev, newFeature.trim()]);
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (index: number) => {
    setFeatures(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="max-w-4xl mx-auto p-6 md:p-8 bg-white border border-slate-200 rounded-3xl shadow-sm text-left space-y-6">
      <div className="flex items-center justify-between border-b border-slate-100 pb-4">
        <div>
          <button
            type="button"
            onClick={onCancel}
            className="text-xs font-bold text-slate-400 hover:text-slate-700 transition-colors mb-1 inline-flex items-center gap-1 cursor-pointer"
          >
            ← Retour à la liste des offres
          </button>
          <h2 className="text-xl font-black text-slate-800">
            {initialData ? "Édition de la Formule" : "Ajout d'une Formule"}
          </h2>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs font-extrabold text-slate-400 hover:text-slate-700 px-3 py-1.5 rounded-lg border border-slate-200"
        >
          Fermer
        </button>
      </div>

      {/* Zone Téléchargement Icône - Taille agrandie x2.5 */}
      <div className="p-6 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl flex flex-col items-center justify-center space-y-3">
        {iconUrl ? (
          <div className="relative group">
            {/* Conteneur d'affichage centré de l'icône */}
            <div className="w-24 h-24 rounded-xl border border-slate-200 bg-white p-2 shadow-sm flex items-center justify-center overflow-hidden">
              <img 
                src={iconUrl} 
                alt="Aperçu Icône" 
                className="max-w-full max-h-full object-contain mx-auto my-auto" 
              />
            </div>
            <button
              type="button"
              onClick={() => setIconUrl('')}
              className="absolute -top-2 -right-2 bg-red-600 hover:bg-red-700 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer"
              title="Supprimer l'icône"
            >
              ✕
            </button>
          </div>
        ) : (
          <div className="text-center space-y-2">
            <label className="cursor-pointer px-5 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl inline-block transition-all shadow-sm">
              Télécharger une icône (.png, .svg, .ico)
              <input type="file" accept="image/*" className="hidden" onChange={handleFileUpload} />
            </label>
            <p className="text-[10px] text-slate-400 font-bold">Format recommandé : SVG ou PNG transparent 128x128px.</p>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Catégorie du Pack *</label>
          <select 
            value={category} 
            onChange={(e) => setCategory(e.target.value)} 
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:border-emerald-500"
          >
            <option value="Freemium">Freemium</option>
            <option value="Premium Standard">Premium Standard</option>
            <option value="Python Premium">Python Premium</option>
            <option value="Annuel Intégral">Annuel Intégral</option>
            <option value="Essentiel">Essentiel</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Badge & Libellé Promotionnel *</label>
          <input 
            type="text" 
            value={badgeLabel} 
            onChange={(e) => setBadgeLabel(e.target.value)} 
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:border-emerald-500" 
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Titre de la Formule *</label>
        <input 
          type="text" 
          value={title} 
          onChange={(e) => setTitle(e.target.value)} 
          className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:border-emerald-500" 
          placeholder="Ex: Pack Pass Essentiel Illimité" 
        />
      </div>

      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1">Description Résumée *</label>
        <textarea 
          value={description} 
          onChange={(e) => setDescription(e.target.value)} 
          className="w-full p-3 border border-slate-200 rounded-xl text-xs font-semibold bg-slate-50 h-20 focus:outline-none focus:border-emerald-500" 
          placeholder="Expliquez brièvement ce qui est inclus..."
        />
      </div>

      {/* Tarification + Calculateur de Réduction */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Prix Initial (DT)</label>
          <input 
            type="number" 
            value={originalPrice} 
            onChange={(e) => setOriginalPrice(Number(e.target.value))} 
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:border-emerald-500" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Prix Final / Remisé (DT) *</label>
          <input 
            type="number" 
            value={finalPrice} 
            onChange={(e) => setFinalPrice(Number(e.target.value))} 
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:border-emerald-500 text-emerald-700" 
          />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1">Période d'abonnement</label>
          <input 
            type="text" 
            value={period} 
            onChange={(e) => setPeriod(e.target.value)} 
            className="w-full p-3 border border-slate-200 rounded-xl text-xs font-bold bg-slate-50 focus:outline-none focus:border-emerald-500" 
          />
        </div>
      </div>

      {/* Aperçu direct du badge de réduction dynamique */}
      {discountPercent > 0 && (
        <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-center gap-3 animate-fade-in">
          <span className="px-3 py-1 bg-red-600 text-white font-black text-xs rounded-lg animate-pulse">
            -{discountPercent}% SOLDE
          </span>
          <span className="text-xs font-bold text-red-700">
            Économie de {originalPrice - finalPrice} DT appliquée automatiquement.
          </span>
        </div>
      )}

      {/* Options de Configuration Avancée */}
      <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={isPopular}
            onChange={(e) => setIsPopular(e.target.checked)}
            className="w-4 h-4 accent-amber-500 rounded"
          />
          <span className="text-xs font-bold text-slate-700">Badge « Populaire »</span>
        </label>

        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="checkbox"
            checked={autoAccessAllResources || category === 'Essentiel'}
            onChange={(e) => setAutoAccessAllResources(e.target.checked)}
            className="w-4 h-4 accent-emerald-600 rounded"
          />
          <span className="text-xs font-extrabold text-emerald-800">⚡ Auto-Accès 100% Débloqué (Privilège Essentiel)</span>
        </label>
      </div>

      {/* Avantages et fonctionnalités incluses */}
      <div className="space-y-3 pt-2 border-t border-slate-100">
        <label className="block text-xs font-bold text-slate-700">Points forts & Fonctionnalités incluses</label>
        <div className="flex gap-2">
          <input
            type="text"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Ajouter un avantage (ex: Accès Sandbox illimité)"
            className="flex-1 p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-800 focus:outline-none"
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
          />
          <button
            type="button"
            onClick={handleAddFeature}
            className="px-5 py-3 bg-slate-800 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
          >
            Ajouter
          </button>
        </div>

        {features.length > 0 && (
          <div className="space-y-2 pt-2">
            {features.map((feat, idx) => (
              <div key={idx} className="flex items-center justify-between p-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700">
                <span className="flex items-center gap-1.5">
                  <span className="text-emerald-600 font-black">✓</span>
                  <span>{feat}</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleRemoveFeature(idx)}
                  className="text-rose-500 hover:text-rose-700 font-black text-xs px-2 py-1 cursor-pointer"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
        <button 
          type="button"
          onClick={onCancel} 
          className="px-5 py-2.5 border border-slate-300 hover:bg-slate-50 text-slate-600 font-bold text-xs rounded-xl cursor-pointer"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={() =>
            onSave({
              ...(initialData || {}),
              title,
              category,
              badgeLabel,
              description,
              originalPrice,
              finalPrice,
              period,
              iconUrl,
              isPopular,
              autoAccessAllResources: autoAccessAllResources || category === 'Essentiel',
              features,
            })
          }
          className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-black text-xs rounded-xl transition-all cursor-pointer shadow-sm active:scale-95"
        >
          Sauvegarder l'offre
        </button>
      </div>
    </div>
  );
};

export default AddEditOfferPage;
