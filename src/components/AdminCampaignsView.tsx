import React, { useState, useEffect } from 'react';
import { CampaignPack, getStoredCampaigns, saveCampaigns } from './campaignsStore';
import { AddEditOfferPage, OfferFormData } from './AddEditOfferPage';
import { Plus, Edit2, Trash2, Eye, EyeOff, Crown, Save, RefreshCw } from 'lucide-react';

export const AdminCampaignsView: React.FC = () => {
  const [packs, setPacks] = useState<CampaignPack[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedOffer, setSelectedOffer] = useState<CampaignPack | undefined>(undefined);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [lastPublished, setLastPublished] = useState<string | null>(null);

  useEffect(() => {
    const loaded = getStoredCampaigns();
    setPacks(loaded);

    // Initial check against server database
    fetch('/api/signup-offers')
      .then(res => res.ok ? res.json() : null)
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          // If server offers exist and have newer or equal length, load them
          const serverPacks: CampaignPack[] = data.map((o: any, idx: number) => ({
            id: o.id || `pack-${idx + 1}`,
            category: o.category || 'Premium',
            badgeLabel: o.badgeLabel || o.badge || 'PACK',
            badgeStyle: o.badgeStyle || (idx === 0 ? 'blue' : idx === 1 ? 'green' : idx === 2 ? 'purple' : 'amber'),
            title: o.title || `Formule ${idx + 1}`,
            description: o.description || '',
            originalPrice: Number(o.originalPrice || o.price || 150),
            finalPrice: Number(o.finalPrice || o.price || 120),
            period: o.period || 'TND / Annuel',
            isPopular: Boolean(o.isPopular),
            isHidden: !Boolean(o.isActive ?? true),
            autoAccessAllResources: Boolean(o.autoAccessAllResources || o.category === 'Essentiel'),
            iconUrl: o.iconUrl,
            features: Array.isArray(o.features) 
              ? o.features.map((f: any) => typeof f === 'string' ? f : f.text) 
              : []
          }));
          if (serverPacks.length >= 4) {
            setPacks(serverPacks);
            saveCampaigns(serverPacks);
          }
        }
      })
      .catch(err => {
        console.warn("Connexion initiale aux offres serveur:", err);
      });

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
    setHasUnsavedChanges(true);
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

  // 1. Action : Enregistrer tout dans la Base de Données
  const handleSaveAll = async (): Promise<boolean> => {
    setIsSaving(true);
    try {
      saveCampaigns(packs);
      const res = await fetch("/api/admin/signup-offers/save-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          packs,
          offers: packs.map(p => ({
            id: p.id,
            category: p.category,
            title: p.title,
            badgeLabel: p.badgeLabel,
            badgeStyle: p.badgeStyle,
            originalPrice: p.originalPrice,
            finalPrice: p.finalPrice,
            price: p.finalPrice,
            period: p.period,
            description: p.description,
            isPopular: p.isPopular,
            isActive: !p.isHidden,
            autoAccessAllResources: p.autoAccessAllResources,
            iconUrl: p.iconUrl,
            features: p.features.map(text => ({ text, included: true }))
          }))
        })
      });

      if (!res.ok) {
        throw new Error("Échec de la sauvegarde sur le serveur.");
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

  // 2. Action : Mettre à jour (Synchroniser vers la Landing Page)
  const handlePublishToLanding = async () => {
    if (hasUnsavedChanges) {
      const saveSuccess = await handleSaveAll();
      if (!saveSuccess) return;
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/admin/signup-offers/publish-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        throw new Error("Échec de la publication.");
      }

      try {
        await fetch("/api/admin/sync-student-subscriptions", { method: "POST" });
      } catch (e) {
        console.warn("Synchronisation secondaire des abonnements:", e);
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

  const getPastelCardStyle = (pack: CampaignPack, index: number) => {
    const isEssentiel = pack.category === 'Essentiel' || pack.autoAccessAllResources;
    if (isEssentiel) return "bg-amber-50/70 border-amber-200 hover:border-amber-300";
    if (pack.badgeStyle === 'blue' || index === 0) return "bg-blue-50/70 border-blue-200 hover:border-blue-300";
    if (pack.badgeStyle === 'green' || index === 1) return "bg-emerald-50/70 border-emerald-200 hover:border-emerald-300";
    if (pack.badgeStyle === 'purple' || index === 2) return "bg-rose-50/70 border-rose-200 hover:border-rose-300";
    return "bg-amber-50/70 border-amber-200 hover:border-amber-300";
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

      {/* Grille des 4 cartes d'offres (Pack Premium, Pack Premium Plus, Pack Premium Plus Plus, Pack Essentiel) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {packs.map((pack, idx) => {
          const isEssentiel = pack.category === 'Essentiel' || pack.autoAccessAllResources;
          const hasDiscount = pack.originalPrice > pack.finalPrice;
          const pastelClasses = getPastelCardStyle(pack, idx);

          return (
            <div 
              key={pack.id}
              className={`p-6 border rounded-3xl flex flex-col justify-between shadow-sm relative transition-all duration-300 hover:shadow-md ${pastelClasses} ${
                pack.isHidden ? 'opacity-50' : ''
              }`}
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 text-[9px] font-black rounded-lg uppercase bg-white/80 text-slate-700 border border-slate-200 shadow-2xs">
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

                <h3 className="text-lg font-black text-slate-800 flex items-center gap-1.5">
                  {isEssentiel && <Crown className="w-4 h-4 text-amber-500 shrink-0" />}
                  <span>{pack.title}</span>
                </h3>
                
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-2xl font-black text-slate-900">
                    {pack.finalPrice} DT
                  </span>
                  {hasDiscount && (
                    <span className="text-xs font-bold text-slate-400 line-through">
                      {pack.originalPrice} DT
                    </span>
                  )}
                  <span className="text-xs text-slate-500 font-semibold">{pack.period}</span>
                </div>

                <p className="text-xs text-slate-600 mt-2 leading-relaxed min-h-[44px]">
                  {pack.description}
                </p>

                {/* Liste des Avantages */}
                <div className="mt-4 space-y-1.5">
                  {pack.features.map((feat, fIdx) => (
                    <div key={fIdx} className="text-[11px] font-semibold text-slate-700 flex items-start gap-1.5">
                      <span className="text-emerald-600 bg-white rounded-full p-0.5 text-[10px] shadow-2xs font-bold shrink-0">✓</span>
                      <span className="leading-snug">{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-6 pt-3 border-t border-slate-200/80 flex items-center gap-1.5">
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
