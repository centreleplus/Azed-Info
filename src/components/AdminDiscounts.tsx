import React, { useState, useEffect } from 'react';
import { 
  Tag, 
  Percent, 
  Plus, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Calendar, 
  Users, 
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Calculator,
  Info,
  Check,
  X
} from 'lucide-react';
import { ALL_SECTIONS_OPTIONS } from '../constants/academic';
import { calculatePriceWithRE, calculateStudentPrice, isEligibleForRE } from '../utils/pricingDiscount';

export interface DiscountRule {
  id: string;
  code: string;
  label: string;
  discountPercent: number;
  targetSection: string; // 'Tous' or specific branch
  targetGrade: string;   // 'Tous' or specific grade
  validUntil: string;
  isActive: boolean;
  usageCount: number;
  isAutomatic?: boolean;
}

const DEFAULT_DISCOUNTS: DiscountRule[] = [
  {
    id: 'disc-re-1ere',
    code: 'REMISE_1ERE_20',
    label: 'Remise Exceptionnelle 20% - 1ère Année (Tronc Commun)',
    discountPercent: 20,
    targetSection: 'Tronc Commun',
    targetGrade: '1ère',
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 52,
    isAutomatic: true
  },
  {
    id: 'disc-re-2eme',
    code: 'REMISE_2EME_20',
    label: 'Remise Exceptionnelle 20% - 2ème Année (Toutes branches)',
    discountPercent: 20,
    targetSection: 'Tous',
    targetGrade: '2ème',
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 68,
    isAutomatic: true
  },
  {
    id: 'disc-re-3eme',
    code: 'REMISE_3EME_20',
    label: 'Remise Exceptionnelle 20% - 3ème Année (Hors Info)',
    discountPercent: 20,
    targetSection: 'Math, Sciences, Tech, Éco, Lettres',
    targetGrade: '3ème',
    validUntil: '2026-12-31',
    isActive: true,
    usageCount: 44,
    isAutomatic: true
  },
  {
    id: 'disc-rentree-globale',
    code: 'RENTREE_NATIONALE',
    label: 'Remise Globale Rentrée Spéciale',
    discountPercent: 10,
    targetSection: 'Tous',
    targetGrade: 'Tous',
    validUntil: '2026-09-15',
    isActive: false,
    usageCount: 135,
    isAutomatic: false
  }
];

export const AdminDiscounts: React.FC = () => {
  const [discounts, setDiscounts] = useState<DiscountRule[]>(() => {
    try {
      const saved = localStorage.getItem('az_admin_discounts');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {
      // fallback
    }
    return DEFAULT_DISCOUNTS;
  });

  useEffect(() => {
    try {
      localStorage.setItem('az_admin_discounts', JSON.stringify(discounts));
    } catch {
      // ignore
    }
  }, [discounts]);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [label, setLabel] = useState('');
  const [discountPercent, setDiscountPercent] = useState(20);
  const [targetSection, setTargetSection] = useState('Tous');
  const [targetGrade, setTargetGrade] = useState('Tous');
  const [validUntil, setValidUntil] = useState('2026-12-31');

  // Simulator State
  const [simBasePrice, setSimBasePrice] = useState<number>(120);
  const [simGrade, setSimGrade] = useState<string>('3ème Année');
  const [simSection, setSimSection] = useState<string>('Mathématiques');

  const simResult = calculatePriceWithRE(simBasePrice, simGrade, simSection);

  const handleOpenNew = () => {
    setEditingId(null);
    setCode('');
    setLabel('');
    setDiscountPercent(20);
    setTargetSection('Tous');
    setTargetGrade('Tous');
    setValidUntil('2026-12-31');
    setIsModalOpen(true);
  };

  const handleEdit = (rule: DiscountRule) => {
    setEditingId(rule.id);
    setCode(rule.code);
    setLabel(rule.label);
    setDiscountPercent(rule.discountPercent);
    setTargetSection(rule.targetSection);
    setTargetGrade(rule.targetGrade);
    setValidUntil(rule.validUntil);
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim() || !label.trim()) return;

    if (editingId) {
      setDiscounts((prev) =>
        prev.map((d) =>
          d.id === editingId
            ? {
                ...d,
                code: code.trim().toUpperCase(),
                label: label.trim(),
                discountPercent: Number(discountPercent),
                targetSection,
                targetGrade,
                validUntil
              }
            : d
        )
      );
    } else {
      const newRule: DiscountRule = {
        id: `disc-${Date.now()}`,
        code: code.trim().toUpperCase(),
        label: label.trim(),
        discountPercent: Number(discountPercent),
        targetSection,
        targetGrade,
        validUntil,
        isActive: true,
        usageCount: 0
      };
      setDiscounts((prev) => [newRule, ...prev]);
    }
    setIsModalOpen(false);
  };

  const toggleActive = (id: string) => {
    setDiscounts((prev) =>
      prev.map((d) => (d.id === id ? { ...d, isActive: !d.isActive } : d))
    );
  };

  const handleDelete = (id: string) => {
    if (window.confirm("Supprimer cette règle de remise ?")) {
      setDiscounts((prev) => prev.filter((d) => d.id !== id));
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl font-black text-slate-900 flex items-center gap-2">
            <Tag className="text-emerald-600" size={24} />
            Remises Exceptionnelles (-20%) & Codes Promotionnels
          </h1>
          <p className="text-xs text-slate-500 font-medium mt-1">
            Gestion de la Remise Exceptionnelle (Prix RE = Prix Final × 0.80) pour les classes et filières éligibles.
          </p>
        </div>
        <button
          onClick={handleOpenNew}
          className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all flex items-center gap-2 cursor-pointer self-start sm:self-auto shrink-0"
        >
          <Plus size={16} />
          Créer une Remise
        </button>
      </div>

      {/* Exceptional 20% Discount Banner with Exact Rules */}
      <div className="p-5 bg-linear-to-r from-emerald-950 via-slate-900 to-emerald-900 text-white rounded-2xl border border-emerald-500/30 shadow-md">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 bg-emerald-500/20 text-emerald-300 rounded-xl shrink-0 mt-0.5 border border-emerald-400/30">
            <Sparkles size={22} />
          </div>
          <div className="flex-1 space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <h2 className="text-sm font-black uppercase tracking-wide text-white">
                Règle de Calcul Active : Remise Exceptionnelle (-20%)
              </h2>
              <span className="px-2.5 py-0.5 bg-emerald-500 text-slate-950 font-black text-[10px] rounded-full uppercase font-mono">
                Prix RE = Prix Final × 0.80
              </span>
            </div>

            <p className="text-xs text-emerald-100/90 leading-relaxed">
              La réduction de <strong>-20%</strong> s'applique directement sur la valeur saisie dans le champ <strong>Prix Final / Remisé (DT)</strong> de l'offre (Exemple : Si Prix Final = 120 DT &rarr; <strong>Prix RE = 120 × 0.80 = 96 DT</strong>).
            </p>

            {/* Eligible classes list */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-start gap-2">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-black">1ère Année</strong>
                  <span className="text-[11px] text-emerald-200">Tronc Commun (toutes options)</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-start gap-2">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-black">2ème Année</strong>
                  <span className="text-[11px] text-emerald-200">Toutes les branches</span>
                </div>
              </div>

              <div className="bg-white/10 rounded-xl p-2.5 border border-white/10 flex items-start gap-2">
                <Check size={16} className="text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-white block font-black">3ème Année</strong>
                  <span className="text-[11px] text-emerald-200">Toutes les branches <u>SAUF</u> Informatique</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Simulator Calculator Tool for Admin */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <div className="flex items-center gap-2 text-slate-800 font-bold text-xs uppercase tracking-wider pb-2 border-b border-slate-100">
          <Calculator size={16} className="text-emerald-600" />
          <span>Simulateur de Tarification & Remise Exceptionnelle (Prix RE)</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Prix Final de l'Offre (DT)</label>
            <input
              type="number"
              min="0"
              value={simBasePrice}
              onChange={(e) => setSimBasePrice(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-black text-slate-800 focus:border-emerald-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Classe / Niveau</label>
            <select
              value={simGrade}
              onChange={(e) => setSimGrade(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="1ère Année">1ère Année (Tronc Commun - Éligible RE)</option>
              <option value="2ème Année">2ème Année (Toutes branches - Éligible RE)</option>
              <option value="3ème Année">3ème Année (Toutes branches sauf Info)</option>
              <option value="4ème Année">4ème Année / Baccalauréat (Standard)</option>
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Section / Filière</label>
            <select
              value={simSection}
              onChange={(e) => setSimSection(e.target.value)}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 focus:border-emerald-500 outline-none cursor-pointer"
            >
              <option value="Mathématiques">Mathématiques</option>
              <option value="Sciences Expérimentales">Sciences Expérimentales</option>
              <option value="Sciences Techniques">Sciences Techniques</option>
              <option value="Économie & Gestion">Économie & Gestion</option>
              <option value="Lettres">Lettres</option>
              <option value="Sport">Sport</option>
              <option value="Sciences de l'Informatique">Sciences de l'Informatique (Exclue en 3ème)</option>
              <option value="Tronc Commun">Tronc Commun</option>
            </select>
          </div>
        </div>

        {/* Calculation Result Display */}
        <div className="mt-3 p-4 bg-slate-50 rounded-xl border border-slate-200/80 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <span className="text-slate-500 font-medium">Prix Catalogue / Saisi :</span>
            <span className={`font-bold ${simResult.hasRE ? 'line-through text-slate-400' : 'text-slate-800'}`}>
              {simResult.prixOriginal} DT
            </span>
            {simResult.hasRE ? (
              <span className="px-2.5 py-0.5 bg-red-600 text-white font-black text-[10px] rounded-md uppercase tracking-wider">
                -20% Remise Exceptionnelle
              </span>
            ) : (
              <span className="px-2.5 py-0.5 bg-slate-200 text-slate-700 font-bold text-[10px] rounded-md uppercase">
                Tarif Plein (Non éligible RE)
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-600 font-bold">Prix RE Net à Payer :</span>
            <span className="text-xl font-black text-emerald-600 bg-white px-3.5 py-1.5 rounded-xl border border-emerald-200 shadow-2xs font-mono">
              {simResult.prixRE} DT
            </span>
            {simResult.hasRE && (
              <span className="text-[11px] text-emerald-700 font-bold bg-emerald-100 px-2.5 py-1 rounded-lg">
                Économie : {simResult.montantEconomise} DT ({simResult.prixOriginal} × 0.80 = {simResult.prixRE} DT)
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Discount Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {discounts.map((disc) => (
          <div
            key={disc.id}
            className={`p-5 rounded-2xl border transition-all ${
              disc.isActive
                ? 'bg-white border-slate-200 shadow-2xs hover:shadow-sm'
                : 'bg-slate-50/70 border-slate-200 opacity-60'
            }`}
          >
            <div className="flex items-start justify-between gap-2 mb-3">
              <div>
                <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono font-black text-xs rounded-lg inline-block">
                  {disc.code}
                </span>
                <h3 className="font-bold text-slate-800 text-sm mt-2">{disc.label}</h3>
              </div>
              <span className="text-xl font-black text-emerald-600 shrink-0">
                -{disc.discountPercent}%
              </span>
            </div>

            <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Filière ciblée :</span>
                <span className="font-semibold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded text-[11px] border border-indigo-100">
                  {disc.targetSection}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Niveau académique :</span>
                <span className="font-semibold text-slate-700">{disc.targetGrade}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Expire le :</span>
                <span className="font-mono text-slate-700">{disc.validUntil}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-400 font-medium">Type :</span>
                <span className="font-bold text-slate-700">
                  {disc.isAutomatic ? 'Automatique (Remise Exceptionnelle)' : 'Code Promotionnel'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 mt-3 border-t border-slate-100">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => toggleActive(disc.id)}
                  className={`px-3 py-1.5 rounded-lg text-[11px] font-bold cursor-pointer transition-all ${
                    disc.isActive
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                >
                  {disc.isActive ? 'Désactiver' : 'Activer'}
                </button>
                <button
                  onClick={() => handleEdit(disc)}
                  className="p-1.5 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                  title="Modifier"
                >
                  <Edit3 size={15} />
                </button>
              </div>
              <button
                onClick={() => handleDelete(disc.id)}
                className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Supprimer"
              >
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Dialog */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl border border-slate-200 space-y-4">
            <h2 className="text-lg font-black text-slate-900">
              {editingId ? 'Modifier la Remise' : 'Nouvelle Règle de Remise'}
            </h2>
            <form onSubmit={handleSave} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Code Promo / Identifiant *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase())}
                  placeholder="EXEMPLE20"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-mono uppercase font-bold text-slate-800"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Libellé descriptif *</label>
                <input
                  type="text"
                  required
                  value={label}
                  onChange={(e) => setLabel(e.target.value)}
                  placeholder="Ex: Remise Exceptionnelle 2ème Année"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Pourcentage (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="100"
                    required
                    value={discountPercent}
                    onChange={(e) => setDiscountPercent(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Date d'Expiration</label>
                  <input
                    type="date"
                    required
                    value={validUntil}
                    onChange={(e) => setValidUntil(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-medium text-slate-800"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Filière / Section Ciblée</label>
                <select
                  value={targetSection}
                  onChange={(e) => setTargetSection(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Tous">Toutes les filières (Remise Globale)</option>
                  {ALL_SECTIONS_OPTIONS.filter((s) => s !== 'Tous').map((sec) => (
                    <option key={sec} value={sec}>{sec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Niveau Académique Ciblé</label>
                <select
                  value={targetGrade}
                  onChange={(e) => setTargetGrade(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-800 cursor-pointer"
                >
                  <option value="Tous">Tous les niveaux</option>
                  <option value="1ère">1ère Année</option>
                  <option value="2ème">2ème Année</option>
                  <option value="3ème">3ème Année</option>
                  <option value="4éme">4ème Année (Bac)</option>
                </select>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold cursor-pointer"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDiscounts;
