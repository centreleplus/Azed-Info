import React, { useState, useEffect } from 'react';
import { CampaignPack, getStoredCampaigns, saveCampaigns } from './campaignsStore';
import { AddEditOfferPage, OfferFormData } from './AddEditOfferPage';
import { Plus, Edit2, Trash2, Eye, EyeOff, Crown } from 'lucide-react';

export const AdminCampaignsView: React.FC = () => {
  const [packs, setPacks] = useState<CampaignPack[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CampaignPack | undefined>(undefined);

  useEffect(() => {
    setPacks(getStoredCampaigns());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setPacks(e.detail);
      }
    };
    window.addEventListener('campaign-packs-updated', handleUpdate);
    return () => window.removeEventListener('campaign-packs-updated', handleUpdate);
  }, []);

  const updateAndSave = (newPacks: CampaignPack[]) => {
    setPacks(newPacks);
    saveCampaigns(newPacks);
  };

  const handleToggleHide = (id: string) => {
    const updated = packs.map(p => p.id === id ? { ...p, isHidden: !p.isHidden } : p);
    updateAndSave(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette offre de la campagne ?")) {
      const updated = packs.filter(p => p.id !== id);
      updateAndSave(updated);
    }
  };

  const handleSaveOffer = (formData: OfferFormData | any) => {
    let updated: CampaignPack[];
    if (selectedOffer && selectedOffer.id) {
      updated = packs.map(p => p.id === selectedOffer.id ? { 
        ...p, 
        ...formData,
        originalPrice: Number(formData.originalPrice) || Number(formData.finalPrice),
        finalPrice: Number(formData.finalPrice)
      } : p);
    } else {
      const newPack: CampaignPack = { 
        ...formData, 
        id: 'pack-' + Date.now(),
        originalPrice: Number(formData.originalPrice) || Number(formData.finalPrice),
        finalPrice: Number(formData.finalPrice)
      };
      updated = [...packs, newPack];
    }
    updateAndSave(updated);
    setIsEditing(false);
  };

  if (isEditing) {
    return (
      <AddEditOfferPage
        initialData={selectedOffer}
        onSave={handleSaveOffer}
        onCancel={() => setIsEditing(false)}
      />
    );
  }

  return (
    <div className="p-6 space-y-6 bg-slate-50 min-h-screen text-left">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 bg-emerald-100 text-emerald-800 text-[10px] font-black rounded-md uppercase tracking-wider">
              Campagnes 2026 / 2027
            </span>
            <span className="text-xs text-slate-400 font-bold">
              {packs.length} formule(s) synchronisée(s)
            </span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 mt-1">
            Gestion des Formules du Sign-Up
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Toute modification (prix, masquage, icônes, fonctionnalités) est automatiquement synchronisée avec l'Étape 3 des élèves.
          </p>
        </div>

        <button
          type="button"
          onClick={() => { setSelectedOffer(undefined); setIsEditing(true); }}
          className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-2xl shadow-sm transition-all flex items-center gap-2 cursor-pointer active:scale-95"
        >
          <Plus size={15} />
          <span>+ Ajouter une Offre</span>
        </button>
      </div>

      {/* Grille de gestion d'offres de l'Admin */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {packs.map((pack) => {
          const isEssentiel = pack.category === 'Essentiel' || pack.autoAccessAllResources;
          const hasDiscount = pack.originalPrice > pack.finalPrice;

          return (
            <div 
              key={pack.id}
              className={`p-5 bg-white border rounded-3xl flex flex-col justify-between shadow-sm relative transition-all ${
                pack.isHidden ? 'opacity-50 bg-slate-100 border-slate-300' : isEssentiel ? 'border-amber-400 bg-amber-50/10 hover:border-amber-500' : 'border-slate-200 hover:border-emerald-500'
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-1 text-[9px] font-black rounded-lg uppercase ${
                    isEssentiel 
                      ? 'bg-amber-100 text-amber-800 border border-amber-300' 
                      : pack.badgeStyle === 'purple'
                        ? 'bg-purple-100 text-purple-800 border border-purple-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}>
                    {pack.badgeLabel}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {pack.autoAccessAllResources && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black rounded-md flex items-center gap-0.5">
                        ⚡ Auto-Accès
                      </span>
                    )}
                    {pack.iconUrl && (
                      <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0 overflow-hidden">
                        <img 
                          src={pack.iconUrl} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain mx-auto my-auto" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-base font-black text-slate-800 flex items-center gap-1.5">
                  {isEssentiel && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                  <span>{pack.title}</span>
                </h3>
                
                <div className="flex items-baseline gap-2 mt-2">
                  <span className={`text-2xl font-black ${isEssentiel ? 'text-amber-600' : 'text-emerald-600'}`}>
                    {pack.finalPrice} DT
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-bold text-slate-400 line-through">
                      {pack.originalPrice} DT
                    </span>
                  )}
                  <span className="text-xs text-slate-400 font-semibold">{pack.period}</span>
                </div>

                <p className="text-xs text-slate-500 mt-2 leading-relaxed min-h-[44px]">
                  {pack.description}
                </p>

                {/* Liste des Avantages */}
                <div className="mt-3 space-y-1">
                  {pack.features.map((feat, idx) => (
                    <div key={idx} className="text-[11px] font-medium text-slate-600 flex items-start gap-1.5">
                      <span className={`${isEssentiel ? 'text-amber-500' : 'text-emerald-500'} font-bold shrink-0`}>✓</span>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-100 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setSelectedOffer(pack); setIsEditing(true); }}
                  className="flex-1 py-1.5 bg-emerald-50 text-emerald-700 font-bold text-xs rounded-lg hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Modifier</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleHide(pack.id)}
                  className="flex-1 py-1.5 bg-amber-50 text-amber-700 font-bold text-xs rounded-lg hover:bg-amber-100 transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {pack.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{pack.isHidden ? 'Afficher' : 'Masquer'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pack.id)}
                  className="py-1.5 px-2 bg-rose-50 text-rose-600 font-bold text-xs rounded-lg hover:bg-rose-100 transition-colors flex items-center justify-center cursor-pointer"
                  title="Supprimer cette formule"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AdminCampaignsView;
