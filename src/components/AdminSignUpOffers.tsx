import React, { useState, useEffect } from "react";
import { Sparkles, Plus, Trash2, Edit2, Check, X, Eye, EyeOff, RefreshCw, DollarSign, Tag, Layers, Award, AlertCircle, User, Zap, Star, Crown, Lock, Save, CheckCircle } from "lucide-react";
import { OfferPack, TierCategory, INITIAL_OFFERS } from "../types/offers";
import { STUDENT_TIERS } from "../types/access";
import { normalizePackName } from "../constants/packages";

export default function AdminSignUpOffers() {
  const [offers, setOffers] = useState<OfferPack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(true);
  const [lastPublished, setLastPublished] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<"all" | TierCategory>("all");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingCardIds, setEditingCardIds] = useState<Set<string>>(new Set());

  const handleEditProduct = (id: string) => {
    setEditingCardIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const updateOfferField = (id: string, field: keyof OfferPack, value: any) => {
    setOffers((prevOffers) =>
      prevOffers.map((o) => {
        if (o.id !== id) return o;
        const updated = { ...o, [field]: value };
        if (field === 'originalPrice' || field === 'finalPrice') {
          const orig = field === 'originalPrice' ? Number(value) : (updated.originalPrice || 0);
          const fin = field === 'finalPrice' ? Number(value) : (updated.finalPrice || updated.price || 0);
          updated.discountPercentage = orig > fin ? Math.round(((orig - fin) / orig) * 100) : 0;
          if (field === 'finalPrice') updated.price = fin;
        }
        return updated;
      })
    );
    setHasUnsavedChanges(true);
  };

  // Form state for OfferPack
  const [formData, setFormData] = useState<OfferPack>({
    id: "pack-custom",
    category: "PREMIUM",
    title: "Pack Personnalisé",
    badgeLabel: "Premium",
    badgeBg: "bg-emerald-100",
    badgeText: "text-emerald-800",
    badgeBorder: "border-emerald-300",
    iconName: "Zap",
    price: 120,
    originalPrice: 150,
    finalPrice: 120,
    discountPercentage: 20,
    period: "DT / Trimestre",
    description: "Description du pack d'accès pour les élèves.",
    features: [
      { text: "Tous les cours, fiches & exercices complets", included: true },
      { text: "Devoirs & corrigés détaillés", included: true },
      { text: "Séances Live interactives", included: false }
    ],
    isPopular: false,
    isActive: true
  });

  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/signup-offers");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          // Normalize if old schema
          const normalized: OfferPack[] = data.map((o: any) => {
            const finalP = o.finalPrice !== undefined ? Number(o.finalPrice) : (o.price !== undefined ? Number(o.price) : 0);
            const origP = o.originalPrice !== undefined ? Number(o.originalPrice) : finalP;
            const discountP = (origP && origP > finalP) ? Math.round(((origP - finalP) / origP) * 100) : 0;

            if (o.category && o.badgeLabel) {
              return {
                ...o,
                price: finalP,
                finalPrice: finalP,
                originalPrice: origP,
                discountPercentage: discountP
              } as OfferPack;
            }
            // Map legacy
            const isFree = finalP === 0;
            const category: TierCategory = isFree ? "Freemium" : (o.category ? normalizePackName(o.category) : "Essentiel");
            const tierInfo = STUDENT_TIERS[category] || STUDENT_TIERS.Essentiel;
            return {
              id: o.id || `pack-${Date.now()}`,
              category,
              title: o.title || "Offre",
              badgeLabel: o.badge || tierInfo.label,
              badgeBg: tierInfo.badgeBg,
              badgeText: tierInfo.badgeText,
              badgeBorder: tierInfo.badgeBorder,
              iconName: tierInfo.iconName,
              price: finalP,
              finalPrice: finalP,
              originalPrice: origP,
              discountPercentage: discountP,
              period: o.period || (isFree ? "Gratuit" : "DT / Trimestre"),
              description: o.description || "",
              features: Array.isArray(o.features) ? o.features.map((f: any) => ({
                text: typeof f === "string" ? f : f.text,
                included: typeof f === "string" ? true : (f.included !== undefined ? f.included : !f.isLocked)
              })) : [],
              isPopular: Boolean(o.isBest || o.isPopular),
              isActive: o.isActive !== undefined ? Boolean(o.isActive) : true
            };
          });
          setOffers(normalized);
        } else {
          setOffers(INITIAL_OFFERS);
        }
      } else {
        setOffers(INITIAL_OFFERS);
      }
    } catch (err) {
      console.error("Erreur chargement offres sign-up:", err);
      setOffers(INITIAL_OFFERS);
    } finally {
      setIsLoading(false);
    }
  };

  // 1. Action : Enregistrer tout dans la Base de Données
  const handleSaveAll = async () => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/admin/signup-offers/save-all", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ offers })
      });

      if (!res.ok) {
        throw new Error("Échec de la sauvegarde");
      }

      setHasUnsavedChanges(false);
      setMessage({ type: "success", text: "✅ Toutes les modifications ont été enregistrées dans la base de données !" });
      alert("✅ Toutes les modifications ont été enregistrées dans la base de données !");
    } catch (error) {
      console.error("Erreur lors de l'enregistrement:", error);
      setMessage({ type: "error", text: "❌ Échec de l'enregistrement dans la base de données." });
      alert("❌ Échec de l'enregistrement dans la base de données.");
    } finally {
      setIsSaving(false);
    }
  };

  // 2. Action : Mettre à jour (Synchroniser vers la Landing Page)
  const handlePublishToLanding = async () => {
    if (hasUnsavedChanges) {
      await handleSaveAll();
    }

    setIsPublishing(true);
    try {
      const res = await fetch("/api/admin/signup-offers/publish-landing", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });

      if (!res.ok) {
        throw new Error("Erreur de publication sur le serveur.");
      }

      try {
        await fetch("/api/admin/sync-student-subscriptions", { method: "POST" });
      } catch (e) {
        console.warn("Synchronisation secondaire:", e);
      }

      const now = new Date().toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
      setLastPublished(now);
      setHasUnsavedChanges(false);
      setMessage({ type: "success", text: "🚀 La page de destination a été mise à jour avec succès !" });
      alert("🚀 La page de destination a été mise à jour avec succès !");
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la landing page:", error);
      setMessage({ type: "error", text: "❌ Erreur lors de la mise à jour de la page de destination." });
      alert("❌ Erreur lors de la mise à jour de la page de destination.");
    } finally {
      setIsPublishing(false);
    }
  };

  const handleCategorySelect = (cat: TierCategory) => {
    const tierInfo = STUDENT_TIERS[cat] || STUDENT_TIERS.Freemium;
    const finalPrice = cat === "Freemium" ? 0 : (cat === "Essentiel" ? 120 : (cat === "Live +" ? 150 : (cat === "Révision +" ? 140 : 350)));
    const origPrice = cat === "Freemium" ? 0 : (cat === "Essentiel" ? 150 : (cat === "Live +" ? 200 : (cat === "Révision +" ? 180 : 450)));
    const discPercent = origPrice > finalPrice ? Math.round(((origPrice - finalPrice) / origPrice) * 100) : 0;

    setFormData(prev => ({
      ...prev,
      category: cat,
      badgeLabel: tierInfo.label,
      badgeBg: tierInfo.badgeBg,
      badgeText: tierInfo.badgeText,
      badgeBorder: tierInfo.badgeBorder,
      iconName: tierInfo.iconName || 'Star',
      price: finalPrice,
      finalPrice: finalPrice,
      originalPrice: origPrice,
      discountPercentage: discPercent,
      period: cat === "Freemium" ? "Gratuit à vie" : (cat === "Intégrale" ? "Annuel" : (cat === "Révision +" ? "Session BAC" : "Trimestre"))
    }));
  };

  const handleAddFeature = () => {
    setFormData({
      ...formData,
      features: [...formData.features, { text: "", included: true }]
    });
  };

  const handleFeatureChange = (index: number, text: string, included: boolean) => {
    const updated = [...formData.features];
    updated[index] = { text, included };
    setFormData({ ...formData, features: updated });
  };

  const handleRemoveFeature = (index: number) => {
    const updated = formData.features.filter((_, i) => i !== index);
    setFormData({ ...formData, features: updated });
  };

  const handleEdit = (pack: OfferPack) => {
    setEditingId(pack.id);
    setFormData({ ...pack });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingId(null);
    setFormData({
      id: `pack-${Date.now()}`,
      category: "PREMIUM",
      title: "Nouveau Pack",
      badgeLabel: "Premium",
      badgeBg: "bg-emerald-100",
      badgeText: "text-emerald-800",
      badgeBorder: "border-emerald-300",
      iconName: "Zap",
      price: 120,
      period: "DT / Trimestre",
      description: "Description de la formule.",
      features: [
        { text: "Accès aux cours et résumés", included: true },
        { text: "Séances Live", included: false }
      ],
      isPopular: false,
      isActive: true
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = {
        ...formData,
        price: Number(formData.price) || 0
      };

      let url = "/api/admin/signup-offers";
      let method = "POST";

      if (editingId) {
        url = `/api/admin/signup-offers/${editingId}`;
        method = "PUT";
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) throw new Error("Erreur lors de l'enregistrement de l'offre");

      setMessage({
        type: "success",
        text: editingId ? "Offre mise à jour avec succès !" : "Offre créée avec succès !"
      });

      handleCancelEdit();
      fetchOffers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur de connexion" });
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer définitivement cette offre du Sign-Up ?")) return;

    try {
      const res = await fetch(`/api/admin/signup-offers/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Erreur lors de la suppression");

      setMessage({ type: "success", text: "Offre supprimée avec succès." });
      fetchOffers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur réseau" });
    }
  };

  const handleToggleActive = async (pack: OfferPack) => {
    try {
      const res = await fetch(`/api/admin/signup-offers/${pack.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...pack, isActive: !pack.isActive })
      });
      if (!res.ok) throw new Error("Erreur lors du changement de visibilité");

      fetchOffers();
    } catch (err: any) {
      setMessage({ type: "error", text: err.message || "Erreur réseau" });
    }
  };

  const filteredOffers = offers.filter(o => {
    if (filterCategory === "all") return true;
    return o.category === filterCategory;
  });

  const renderIcon = (iconName: string) => {
    switch (iconName) {
      case "User": return <User size={16} />;
      case "Zap": return <Zap size={16} />;
      case "Star": return <Star size={16} />;
      case "Crown": return <Crown size={16} />;
      default: return <Sparkles size={16} />;
    }
  };

  return (
    <div className="space-y-6">
      {/* BARRE D'ACTIONS ADMIN (ACTION HEADER TOOLBAR) */}
      <div className="bg-white border border-slate-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
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

        {/* Zone de Droite (Boutons) */}
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
        </div>
      </div>

      {message && (
        <div className={`p-4 rounded-xl text-xs font-bold flex items-center justify-between ${message.type === "success" ? "bg-emerald-50 border border-emerald-200 text-emerald-800" : "bg-rose-50 border border-rose-200 text-rose-800"}`}>
          <div className="flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{message.text}</span>
          </div>
          <button onClick={() => setMessage(null)} className="text-xs opacity-70 hover:opacity-100 cursor-pointer">✕</button>
        </div>
      )}

      {/* Grid: Form Column + Listings Column */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form Column */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-[#E5E7EB] shadow-xs space-y-6 self-start">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4">
            <div className="flex items-center gap-2">
              <Layers size={18} className="text-emerald-600" />
              <h3 className="font-extrabold text-sm text-[#0F1E36]">
                {editingId ? "Modifier l'Offre du Pack" : "Créer / Configurer un Pack"}
              </h3>
            </div>
            {editingId && (
              <span className="text-[10px] bg-amber-100 text-amber-800 font-bold px-2 py-0.5 rounded-full uppercase">
                En Modification
              </span>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 text-xs">
            {/* Category Tier Selection */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-extrabold text-[#0F1E36] uppercase tracking-wider">
                1. Catégorie d'accès (Tier) *
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {(["Freemium", "Essentiel", "Live +", "Révision +", "Intégrale"] as TierCategory[]).map(cat => {
                  const info = STUDENT_TIERS[cat] || STUDENT_TIERS.Freemium;
                  const isSelected = formData.category === cat;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => handleCategorySelect(cat)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                        isSelected
                          ? `${info.badgeBg} ${info.badgeText} ${info.badgeBorder} border-2 font-bold ring-2 ring-emerald-500/20`
                          : "border-gray-200 hover:bg-gray-50 text-gray-700"
                      }`}
                    >
                      {renderIcon(info.iconName)}
                      <div>
                        <div className="text-xs font-extrabold">{info.label}</div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Informations de l'offre */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-extrabold text-[#0F1E36] uppercase tracking-wider">
                2. Titre & Badge
              </label>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Titre de la Formule *</label>
                <input
                  type="text"
                  required
                  placeholder="ex: Pass Essentiel, Pack Live +..."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full p-2.5 border border-gray-250 rounded-xl font-semibold bg-gray-50/50 focus:bg-white outline-hidden focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Libellé Badge</label>
                  <input
                    type="text"
                    placeholder="ex: Essentiel, Freemium"
                    value={formData.badgeLabel}
                    onChange={(e) => setFormData({ ...formData, badgeLabel: e.target.value })}
                    className="w-full p-2.5 border border-gray-250 rounded-xl font-semibold bg-gray-50/50 focus:bg-white outline-hidden focus:border-emerald-500"
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 mb-1">Icône</label>
                  <select
                    value={formData.iconName}
                    onChange={(e) => setFormData({ ...formData, iconName: e.target.value })}
                    className="w-full p-2.5 border border-gray-250 rounded-xl font-semibold bg-gray-50/50 focus:bg-white outline-hidden focus:border-emerald-500"
                  >
                    <option value="User">⚪ User (Freemium)</option>
                    <option value="Star">🔵 Star (Essentiel)</option>
                    <option value="Zap">🟢 Zap (Live +)</option>
                    <option value="Sparkles">🟣 Sparkles (Révision +)</option>
                    <option value="Crown">👑 Crown (Intégrale)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="ex: Accès complet aux ressources académiques..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full p-2.5 border border-gray-250 rounded-xl font-semibold bg-gray-50/50 focus:bg-white outline-hidden focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Tarification & Réduction */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <label className="block text-[11px] font-extrabold text-[#0F1E36] uppercase tracking-wider">
                3. Tarification & Réduction
              </label>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1">Tarif Initial (DT)</label>
                  <input
                    type="number"
                    placeholder="ex: 150"
                    value={formData.originalPrice !== undefined ? formData.originalPrice : ''}
                    onChange={(e) => {
                      const orig = Number(e.target.value) || 0;
                      const finalP = formData.finalPrice !== undefined ? formData.finalPrice : formData.price;
                      const disc = orig > finalP ? Math.round(((orig - finalP) / orig) * 100) : 0;
                      setFormData({ ...formData, originalPrice: orig, discountPercentage: disc });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-hidden focus:border-emerald-500 bg-gray-50/50 focus:bg-white font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-[9px] font-bold text-slate-500 mb-1">Tarif Final / Réduit (DT) *</label>
                  <input
                    type="number"
                    required
                    placeholder="ex: 120"
                    value={formData.finalPrice !== undefined ? formData.finalPrice : formData.price}
                    onChange={(e) => {
                      const finalP = Number(e.target.value) || 0;
                      const orig = formData.originalPrice !== undefined ? formData.originalPrice : finalP;
                      const disc = orig > finalP ? Math.round(((orig - finalP) / orig) * 100) : 0;
                      setFormData({ ...formData, finalPrice: finalP, price: finalP, discountPercentage: disc });
                    }}
                    className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl outline-hidden focus:border-emerald-500 bg-gray-50/50 focus:bg-white font-bold text-emerald-700"
                  />
                </div>
              </div>

              {/* Affichage automatique de la remise calculée */}
              {formData.originalPrice !== undefined && formData.finalPrice !== undefined && formData.originalPrice > formData.finalPrice && formData.finalPrice > 0 && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs">
                  <span className="font-bold text-emerald-800">
                    Remise : {formData.originalPrice - formData.finalPrice} DT
                  </span>
                  <span className="px-2 py-0.5 bg-emerald-600 text-white font-black text-[10px] rounded-full">
                    -{Math.round(((formData.originalPrice - formData.finalPrice) / formData.originalPrice) * 100)}% PROMO
                  </span>
                </div>
              )}

              <div>
                <label className="block text-[10px] font-bold text-gray-500 mb-1">Périodicité</label>
                <input
                  type="text"
                  required
                  placeholder="ex: DT / Trimestre, DT / Année, Gratuit à vie"
                  value={formData.period}
                  onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                  className="w-full p-2.5 border border-gray-250 rounded-xl font-semibold bg-gray-50/50 focus:bg-white outline-hidden"
                />
              </div>
            </div>

            {/* Fonctionnalités */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center justify-between">
                <label className="block text-[11px] font-extrabold text-[#0F1E36] uppercase tracking-wider">
                  4. Fonctionnalités incluses ou verrouillées
                </label>
                <button
                  type="button"
                  onClick={handleAddFeature}
                  className="px-2.5 py-1 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[10px] rounded-lg flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <Plus size={12} />
                  <span>Ajouter une ligne</span>
                </button>
              </div>

              <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                {formData.features.map((feat, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-gray-50 p-2 rounded-xl border border-gray-200">
                    <button
                      type="button"
                      onClick={() => handleFeatureChange(idx, feat.text, !feat.included)}
                      title={feat.included ? "Inclus (Coche ✔️)" : "Verrouillé (Croix ❌)"}
                      className={`p-1.5 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        feat.included ? "bg-emerald-50 border-emerald-200 text-emerald-600" : "bg-rose-50 border-rose-200 text-rose-600"
                      }`}
                    >
                      {feat.included ? <Check size={13} /> : <X size={13} />}
                    </button>
                    <input
                      type="text"
                      placeholder="ex: Tous les cours, fiches & exercices"
                      value={feat.text}
                      onChange={(e) => handleFeatureChange(idx, e.target.value, feat.included)}
                      className="flex-1 text-xs bg-transparent border-none focus:ring-0 font-semibold p-0 text-[#0F1E36] outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveFeature(idx)}
                      className="p-1 text-gray-400 hover:text-rose-600 rounded-lg cursor-pointer transition-colors"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Options */}
            <div className="space-y-3 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-4 pt-1">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs">
                  <input
                    type="checkbox"
                    checked={formData.isActive}
                    onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                    className="rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Pack Actif (Visible sur l'inscription)</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-xs text-amber-600">
                  <input
                    type="checkbox"
                    checked={Boolean(formData.isPopular)}
                    onChange={(e) => setFormData({ ...formData, isPopular: e.target.checked })}
                    className="rounded border-gray-300 text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span>Badge "Populaire"</span>
                </label>
              </div>
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <button
                type="submit"
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl uppercase tracking-wider text-xs shadow-sm transition-all cursor-pointer"
              >
                {editingId ? "Enregistrer les modifications" : "Créer / Sauvegarder"}
              </button>
              {editingId && (
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl text-xs transition-colors cursor-pointer"
                >
                  Annuler
                </button>
              )}
            </div>
          </form>
        </div>

        {/* Listings Column */}
        <div className="lg:col-span-7 space-y-6">
          {/* Filter Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white p-4 rounded-2xl border border-[#E5E7EB] shadow-xs">
            <div className="flex flex-wrap items-center gap-2">
              <button
                onClick={() => setFilterCategory("all")}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  filterCategory === "all" ? "bg-[#0F1E36] text-white shadow-xs" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                Tous ({offers.length})
              </button>
              {(["Freemium", "Essentiel", "Live +", "Révision +", "Intégrale"] as TierCategory[]).map(cat => {
                const info = STUDENT_TIERS[cat] || STUDENT_TIERS.Freemium;
                return (
                  <button
                    key={cat}
                    onClick={() => setFilterCategory(cat)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                      filterCategory === cat ? `${info.badgeBg} ${info.badgeText} border ${info.badgeBorder} shadow-xs` : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {info.label} ({offers.filter(o => o.category === cat).length})
                  </button>
                );
              })}
            </div>
          </div>

          {/* Cards List */}
          <div className="space-y-4">
            {filteredOffers.length === 0 ? (
              <div className="bg-white p-12 rounded-2xl border border-dashed border-gray-300 text-center text-gray-400 font-semibold">
                Aucune offre trouvée pour cette catégorie.
              </div>
            ) : (
              filteredOffers.map((pack) => {
                const isEditingThisPack = editingCardIds.has(pack.id);

                return (
                  <div
                    key={pack.id}
                    className={`bg-white rounded-2xl border-2 transition-all p-5 flex flex-col justify-between gap-4 shadow-xs hover:shadow-md relative ${
                      isEditingThisPack
                        ? "border-amber-400 ring-2 ring-amber-400/20 shadow-md"
                        : !pack.isActive
                        ? "border-gray-200 opacity-60 bg-gray-50"
                        : pack.isPopular
                        ? "border-amber-400 bg-amber-50/10"
                        : "border-[#E5E7EB]"
                    }`}
                  >
                    {/* Header Badges */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100 pb-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-xl border flex items-center gap-1.5 ${pack.badgeBg} ${pack.badgeText} ${pack.badgeBorder}`}>
                          {renderIcon(pack.iconName)}
                          <span>{pack.badgeLabel}</span>
                        </span>

                        {isEditingThisPack && (
                          <span className="bg-amber-100 text-amber-800 text-[9px] font-extrabold px-2 py-0.5 rounded-full border border-amber-300">
                            Mode Édition Locale
                          </span>
                        )}

                        {pack.isPopular && (
                          <span className="bg-amber-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                            ⭐ Populaire
                          </span>
                        )}

                        {pack.originalPrice !== undefined && pack.finalPrice !== undefined && pack.originalPrice > pack.finalPrice && (
                          <span className="px-2 py-0.5 bg-rose-500 text-white font-black text-[9px] rounded-full">
                            -{Math.round(((pack.originalPrice - pack.finalPrice) / pack.originalPrice) * 100)}% PROMO
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleToggleActive(pack)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold flex items-center gap-1 transition-colors cursor-pointer ${
                            pack.isActive
                              ? "bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200"
                          }`}
                          title={pack.isActive ? "Masquer ce pack" : "Activer ce pack"}
                        >
                          {pack.isActive ? <EyeOff size={12} /> : <Eye size={12} />}
                          <span>{pack.isActive ? "Actif" : "Masqué"}</span>
                        </button>
                      </div>
                    </div>

                    {isEditingThisPack ? (
                      /* Formulaire d'édition locale in-place sur la carte */
                      <div className="space-y-3 bg-amber-50/30 p-3 rounded-xl border border-amber-200">
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600">Titre de l'offre</label>
                          <input
                            type="text"
                            value={pack.title}
                            onChange={(e) => updateOfferField(pack.id, 'title', e.target.value)}
                            className="w-full px-2.5 py-1.5 text-xs font-bold border border-gray-300 rounded-lg bg-white"
                          />
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600">Prix Final (DT)</label>
                            <input
                              type="number"
                              value={pack.finalPrice !== undefined ? pack.finalPrice : pack.price}
                              onChange={(e) => updateOfferField(pack.id, 'finalPrice', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 text-xs font-bold border border-gray-300 rounded-lg bg-white text-emerald-700"
                            />
                          </div>

                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-gray-600">Prix Barré (DT)</label>
                            <input
                              type="number"
                              value={pack.originalPrice !== undefined ? pack.originalPrice : ''}
                              onChange={(e) => updateOfferField(pack.id, 'originalPrice', Number(e.target.value))}
                              className="w-full px-2.5 py-1.5 text-xs font-bold border border-gray-300 rounded-lg bg-white text-gray-500"
                              placeholder="ex: 150"
                            />
                          </div>

                          <div className="space-y-1 col-span-2 sm:col-span-1">
                            <label className="text-[10px] font-bold text-gray-600">Libellé Badge</label>
                            <input
                              type="text"
                              value={pack.badgeLabel}
                              onChange={(e) => updateOfferField(pack.id, 'badgeLabel', e.target.value)}
                              className="w-full px-2.5 py-1.5 text-xs font-bold border border-gray-300 rounded-lg bg-white"
                            />
                          </div>
                        </div>

                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-gray-600">Description</label>
                          <textarea
                            rows={2}
                            value={pack.description}
                            onChange={(e) => updateOfferField(pack.id, 'description', e.target.value)}
                            className="w-full px-2.5 py-1 text-xs border border-gray-300 rounded-lg bg-white"
                          />
                        </div>
                      </div>
                    ) : (
                      /* Détails normaux de l'offre */
                      <div className="space-y-2">
                        <div className="flex items-baseline justify-between gap-4">
                          <h4 className="font-black text-base text-[#0F1E36]">{pack.title}</h4>
                          <div className="flex items-baseline gap-1.5 shrink-0">
                            <span className="font-extrabold text-lg text-emerald-600">
                              {pack.finalPrice !== undefined ? pack.finalPrice : pack.price} DT
                            </span>
                            {pack.originalPrice !== undefined && pack.finalPrice !== undefined && pack.originalPrice > pack.finalPrice && (
                              <span className="text-xs font-bold text-gray-400 line-through">
                                {pack.originalPrice} DT
                              </span>
                            )}
                            <span className="text-xs font-bold text-gray-600">/ {pack.period}</span>
                          </div>
                        </div>

                        <p className="text-xs text-gray-500 leading-relaxed">{pack.description}</p>

                        {/* Features list pills */}
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {pack.features.map((feat, i) => (
                            <span
                              key={i}
                              className={`text-[10px] font-bold px-2 py-1 rounded-lg flex items-center gap-1 ${
                                !feat.included ? "bg-rose-50 text-rose-700 border border-rose-100 line-through opacity-70" : "bg-gray-100 text-gray-700 border border-gray-200"
                              }`}
                            >
                              {!feat.included ? <X size={10} className="text-rose-500" /> : <Check size={10} className="text-emerald-500" />}
                              <span>{feat.text}</span>
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Bouton d'action sur chaque carte d'offre boutique */}
                    <div className="flex items-center gap-2 mt-4 pt-3 border-t border-slate-100">
                      <button
                        type="button"
                        onClick={() => handleEditProduct(pack.id)}
                        className="flex-1 py-2 bg-amber-500 hover:bg-amber-600 text-white font-bold text-xs rounded-xl shadow-xs transition-all cursor-pointer text-center"
                      >
                        {isEditingThisPack ? "✓ Valider l'édition" : "✏️ Modifier"}
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(pack.id)}
                        className="py-2 px-3 bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Retirer
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Barre d'action sticky en bas pour un confort maximal de sauvegarde globale */}
      {offers.length > 0 && (
        <div className="sticky bottom-4 z-20 bg-slate-900/90 backdrop-blur-md text-white p-4 rounded-2xl shadow-xl flex items-center justify-between gap-4 border border-slate-800 mt-6">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-xs font-bold">
              {offers.length} formules prêtes pour la synchronisation globale
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSaveAll}
              disabled={isSaving}
              className="flex items-center gap-2 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all cursor-pointer disabled:opacity-50 active:scale-95"
            >
              <span>💾</span>
              <span>{isSaving ? "Enregistrement en cours..." : "Enregistrer tout"}</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export const AdminOffresSignup = AdminSignUpOffers;
