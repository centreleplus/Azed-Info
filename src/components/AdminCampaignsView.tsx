import React, { useState, useEffect } from 'react';
import { CampaignPack, getStoredCampaigns, saveCampaigns } from './campaignsStore';
import { PacksService, PackOffer, INITIAL_PACKS_DATA } from './PacksService';
import { AddEditOfferPage, OfferFormData } from './AddEditOfferPage';
import { Plus, Edit2, Trash2, Eye, EyeOff, Crown, Save, RefreshCw } from 'lucide-react';

const campaignToPackOffer = (p: CampaignPack): PackOffer => ({
  id: p.id,
  badge: p.badgeLabel || 'OFFRE',
  title: p.title,
  price: `${p.finalPrice} DT`,
  oldPrice: `${p.originalPrice} DT`,
  period: p.period || 'Annuel',
  description: p.description,
  features: p.features,
  bgColor: p.bgColor || (p.category === 'Essentiel' || p.id === 'pack-essentiel' ? 'bg-slate-50' : (p.id === 'pack-premium' ? 'bg-emerald-50/70' : (p.id === 'pack-revision' ? 'bg-rose-50/70' : 'bg-amber-50/70'))),
  borderColor: p.borderColor || (p.category === 'Essentiel' || p.id === 'pack-essentiel' ? 'border-slate-200' : (p.id === 'pack-premium' ? 'border-emerald-200' : (p.id === 'pack-revision' ? 'border-rose-200' : 'border-amber-200'))),
  buttonColor: p.buttonColor || 'bg-emerald-600 hover:bg-emerald-700',
  isPublished: !p.isHidden
});

const packOfferToCampaign = (p: PackOffer): CampaignPack => ({
  id: p.id,
  category: p.badge,
  badgeLabel: p.badge,
  badgeStyle: p.bgColor.includes('rose') ? 'purple' : (p.bgColor.includes('emerald') ? 'green' : (p.bgColor.includes('amber') ? 'amber' : 'blue')),
  title: p.title,
  description: p.description,
  originalPrice: Number(p.oldPrice.replace(/[^0-9]/g, '')) || Number(p.price.replace(/[^0-9]/g, '')) || 240,
  finalPrice: Number(p.price.replace(/[^0-9]/g, '')) || 120,
  period: p.period,
  isPopular: p.id === 'pack-premium',
  isHidden: !p.isPublished,
  autoAccessAllResources: p.id === 'pack-essentiel' || p.id === 'forfait-annuel',
  features: p.features,
  bgColor: p.bgColor,
  borderColor: p.borderColor,
  buttonColor: p.buttonColor
});

export const AdminCampaignsView: React.FC = () => {
  const [packs, setPacks] = useState<CampaignPack[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CampaignPack | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);

  useEffect(() => {
    // 1. Charger depuis le service de packs (VPS API + LocalStorage fallback)
    PacksService.getAdminPacks().then(data => {
      if (Array.isArray(data) && data.length > 0) {
        const loaded = data.map(packOfferToCampaign);
        setPacks(loaded);
        saveCampaigns(loaded);
      } else {
        const fallback = INITIAL_PACKS_DATA.map(packOfferToCampaign);
        setPacks(fallback);
        saveCampaigns(fallback);
      }
    });

    const handleUpdate = (e: any) => {
      if (e.detail && Array.isArray(e.detail)) {
        if (e.detail[0]?.price && typeof e.detail[0].price === 'string') {
          setPacks(e.detail.map(packOfferToCampaign));
        } else {
          setPacks(e.detail);
        }
      }
    };
    window.addEventListener('campaign-packs-updated', handleUpdate);
    window.addEventListener('packs-updated', handleUpdate);
    return () => {
      window.removeEventListener('campaign-packs-updated', handleUpdate);
      window.removeEventListener('packs-updated', handleUpdate);
    };
  }, []);

  const updateAndSave = (newPacks: CampaignPack[]) => {
    setPacks(newPacks);
    saveCampaigns(newPacks);
    setHasUnsavedChanges(true);
  };

  const handleToggleHide = (id: string) => {
    const updated = packs.map(p => p.id === id ? { ...p, isHidden: !p.isHidden } : p);
    updateAndSave(updated);
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Voulez-vous vraiment supprimer cette formule ?")) {
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
        finalPrice: Number(formData.finalPrice),
        bgColor: formData.bgColor || 'bg-slate-50',
        borderColor: formData.borderColor || 'border-slate-200',
        buttonColor: formData.buttonColor || 'bg-emerald-600 hover:bg-emerald-700'
      };
      updated = [...packs, newPack];
    }
    updateAndSave(updated);
    setIsEditing(false);
  };

  // 1. Action : Enregistrer tout dans la Base de Données (VPS + Local)
  const handleSaveAll = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      const packOffers = packs.map(campaignToPackOffer);
      saveCampaigns(packs);
      await PacksService.saveAllToDB(packOffers);

      // Notification additionnelle vers les endpoints serveur existants
      try {
        await fetch("/api/admin/signup-offers/save-all", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ packs: packOffers, offers: packOffers })
        });
      } catch (e) {
        console.warn("Sync secondaire serveur:", e);
      }

      setHasUnsavedChanges(false);
      alert("✅ Toutes les modifications ont été enregistrées dans la base de données !");
      return true;
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      alert("❌ Échec de l'enregistrement dans la base de données.");
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Action : Mettre à jour (Synchroniser vers la Landing Page & Inscription)
  const handlePublishToLanding = async () => {
    if (hasUnsavedChanges) {
      const saveSuccess = await handleSaveAll();
      if (!saveSuccess) return;
    }

    setIsPublishing(true);
    try {
      const packOffers = packs.map(campaignToPackOffer);
      await PacksService.publishToLanding(packOffers);

      try {
        await fetch("/api/admin/signup-offers/publish-landing", {
          method: "POST",
          headers: { "Content-Type": "application/json" }
        });
      } catch (e) {
        console.warn("Sync secondaire publication:", e);
      }

      const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      setLastPublished(now);
      setHasUnsavedChanges(false);
      alert("🚀 La page de destination a été mise à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la landing page:", error);
      alert("❌ Erreur lors de la mise à jour de la page de destination.");
    } finally {
      setIsPublishing(false);
    }
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
    <div className="p-4 md:p-6 space-y-6 bg-slate-50 min-h-screen text-left">
      {/* 1. BARRE D'ACTIONS SUPÉRIEURE (ACTION HEADER TOOLBAR) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
        {/* Zone de Gauche */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <div>
            <h2 className="text-xl font-bold text-slate-800">Gestion des Offres & Inscriptions</h2>
            <div className="mt-1 flex items-center gap-2">
              {hasUnsavedChanges ? (
                <span className="text-xs font-semibold text-amber-600 flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200">
                  <span>🟡</span> Modifications non enregistrées
                </span>
              ) : (
                <span className="text-xs font-semibold text-emerald-600 flex items-center gap-1.5 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                  <span>🟢</span> En ligne et à jour sur la Landing Page
                </span>
              )}
              {lastPublished && (
                <span className="text-[11px] text-slate-400 font-medium">
                  (Dernière synchro à {lastPublished})
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Zone de Droite (Boutons d'action) */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-end flex-wrap sm:flex-nowrap">
          {/* Bouton 1 : Enregistrer tout */}
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving || isPublishing}
            className="bg-blue-600 hover:bg-blue-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <Save className={`w-4 h-4 ${isSaving ? 'animate-bounce' : ''}`} />
            <span>{isSaving ? "Enregistrement..." : "Enregistrer tout"}</span>
          </button>

          {/* Bouton 2 : Mettre à jour */}
          <button
            type="button"
            onClick={handlePublishToLanding}
            disabled={isSaving || isPublishing}
            className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white font-bold px-5 py-2.5 rounded-xl text-sm shadow-sm transition-all flex items-center gap-2 disabled:opacity-50 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${isPublishing ? 'animate-spin' : ''}`} />
            <span>{isPublishing ? "Mise à jour..." : "Mettre à jour"}</span>
          </button>

          {/* Bouton secondaire Ajouter */}
          <button
            type="button"
            onClick={() => { setSelectedOffer(undefined); setIsEditing(true); }}
            className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 cursor-pointer ml-1"
          >
            <Plus size={14} />
            <span>+ Ajouter</span>
          </button>
        </div>
      </div>

      {/* Grille des 4 cartes d'offres (Pack Essentiel, Pack Premium, Pack Révision, Forfait Annuel Intégral) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {packs.map((pack) => {
          const isEssentiel = pack.id === 'pack-essentiel' || pack.category === 'Essentiel' || pack.autoAccessAllResources;
          const hasDiscount = pack.originalPrice > pack.finalPrice;
          const pastelBg = pack.bgColor || (isEssentiel ? 'bg-slate-50' : (pack.id === 'pack-premium' ? 'bg-emerald-50/70' : (pack.id === 'pack-revision' ? 'bg-rose-50/70' : 'bg-amber-50/70')));
          const pastelBorder = pack.borderColor || (isEssentiel ? 'border-slate-200' : (pack.id === 'pack-premium' ? 'border-emerald-200' : (pack.id === 'pack-revision' ? 'border-rose-200' : 'border-amber-200')));

          return (
            <div 
              key={pack.id}
              className={`p-6 border rounded-3xl flex flex-col justify-between shadow-sm relative transition-all duration-300 hover:shadow-md ${pastelBg} ${pastelBorder} ${
                pack.isHidden ? 'opacity-50' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-3 py-1 text-[10px] font-extrabold tracking-wider rounded-full uppercase bg-white/90 text-slate-700 border border-slate-200 shadow-2xs">
                    {pack.badgeLabel}
                  </span>

                  <div className="flex items-center gap-1.5">
                    {pack.autoAccessAllResources && (
                      <span className="px-2 py-0.5 bg-blue-100 text-blue-800 text-[9px] font-black rounded-md flex items-center gap-0.5">
                        ⚡ Auto-Accès
                      </span>
                    )}
                    {pack.iconUrl && (
                      <div className="w-8 h-8 rounded-lg bg-white border border-slate-200 p-0.5 flex items-center justify-center shrink-0 overflow-hidden shadow-2xs">
                        <img 
                          src={pack.iconUrl} 
                          alt="Logo" 
                          className="max-w-full max-h-full object-contain mx-auto my-auto" 
                        />
                      </div>
                    )}
                  </div>
                </div>

                <h3 className="text-xl font-bold text-slate-800 mb-1 flex items-center gap-1.5">
                  {isEssentiel && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                  <span>{pack.title}</span>
                </h3>
                
                <div className="flex items-baseline gap-2 mb-3 mt-2">
                  <span className="text-3xl font-black text-slate-900">
                    {pack.finalPrice} DT
                  </span>
                  {hasDiscount && (
                    <span className="text-xs text-slate-400 line-through font-semibold">
                      {pack.originalPrice} DT
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-medium">/ {pack.period}</span>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed mb-4 font-medium min-h-[44px]">
                  {pack.description}
                </p>

                {/* Liste des Avantages */}
                <ul className="space-y-2 mb-6">
                  {pack.features.map((feat, fIdx) => (
                    <li key={fIdx} className="flex items-start gap-2 text-xs font-semibold text-slate-700">
                      <span className="text-emerald-600 bg-white rounded-full p-0.5 text-[10px] shadow-2xs font-bold shrink-0">✓</span>
                      <span className="leading-snug">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="pt-3 border-t border-slate-200/80 flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => { setSelectedOffer(pack); setIsEditing(true); }}
                  className="flex-1 py-2 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  <Edit2 size={12} />
                  <span>Modifier</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleHide(pack.id)}
                  className="flex-1 py-2 bg-white/90 hover:bg-white text-slate-800 border border-slate-200 font-bold text-xs rounded-xl shadow-2xs transition-colors flex items-center justify-center gap-1 cursor-pointer"
                >
                  {pack.isHidden ? <Eye size={12} /> : <EyeOff size={12} />}
                  <span>{pack.isHidden ? 'Afficher' : 'Masquer'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleDelete(pack.id)}
                  className="py-2 px-2.5 bg-rose-50 text-rose-600 border border-rose-200 font-bold text-xs rounded-xl hover:bg-rose-100 transition-colors flex items-center justify-center cursor-pointer"
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
