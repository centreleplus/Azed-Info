import React, { useState, useEffect, useRef } from 'react';
import { 
  CreditCard, 
  Landmark, 
  Send, 
  Building2, 
  Upload, 
  Trash2, 
  Sliders, 
  Save, 
  CheckCircle2, 
  RotateCcw, 
  Sparkles, 
  Image as ImageIcon,
  HelpCircle,
  Eye
} from 'lucide-react';
import { 
  PaymentMethodsConfig, 
  PaymentMethodVisualConfig, 
  DEFAULT_PAYMENT_METHODS_CONFIG, 
  PAYMENT_BORDER_RADIUS_OPTIONS,
  PaymentBorderRadiusClass,
  ACCEPTED_PAYMENT_ICON_FORMATS
} from '../types/paymentMethods';
import { getStoredPaymentMethodsConfig, saveStoredPaymentMethodsConfig } from '../lib/paymentMethodsStore';
import { PaymentMethodIcon } from './PaymentMethodIcon';
import { useSettings } from './SettingsContext';
import { compressImageFileToDataUrl } from '../utils/imageOptimizer';

interface MethodItemDef {
  key: keyof PaymentMethodsConfig;
  name: string;
  defaultLabel: string;
  defaultIconDesc: string;
  badgeText: string;
  themeColor: string;
}

const METHODS_LIST: MethodItemDef[] = [
  {
    key: 'd17',
    name: 'D17 Poste Mobile',
    defaultLabel: 'D17 Poste Mobile',
    defaultIconDesc: 'Icône CreditCard (Bleu/Vert)',
    badgeText: 'Application Mobile',
    themeColor: 'emerald'
  },
  {
    key: 'rib',
    name: 'Virement RIB Bancaire',
    defaultLabel: 'Virement RIB',
    defaultIconDesc: 'Icône Landmark / Bank',
    badgeText: 'Banque BIAT / Virement',
    themeColor: 'indigo'
  },
  {
    key: 'wafacash',
    name: 'Wafacash / Mandat Express',
    defaultLabel: 'Wafacash Express',
    defaultIconDesc: 'Icône Send / Éclair',
    badgeText: 'Transfert Express',
    themeColor: 'amber'
  },
  {
    key: 'cash',
    name: 'Paiement Direct Espèces',
    defaultLabel: 'Paiement Direct Espèces',
    defaultIconDesc: 'Icône Building2 / Centre Le Plus',
    badgeText: 'Sur Place / Centre',
    themeColor: 'emerald'
  }
];

export const AdminPaymentMethodsConfig: React.FC = () => {
  const { settings, updateSettings } = useSettings();
  const [config, setConfig] = useState<PaymentMethodsConfig>(getStoredPaymentMethodsConfig);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [activeTab, setActiveTab] = useState<keyof PaymentMethodsConfig>('d17');
  const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  useEffect(() => {
    setConfig(getStoredPaymentMethodsConfig());

    const handleUpdate = (e: any) => {
      if (e.detail) {
        setConfig(e.detail);
      }
    };
    window.addEventListener('payment_methods_config_updated', handleUpdate);
    return () => window.removeEventListener('payment_methods_config_updated', handleUpdate);
  }, []);

  const handleUpdateItem = (
    methodKey: keyof PaymentMethodsConfig, 
    changes: Partial<PaymentMethodVisualConfig>
  ) => {
    setConfig((prev) => ({
      ...prev,
      [methodKey]: {
        ...prev[methodKey],
        ...changes
      }
    }));
  };

  const handleFileUpload = async (
    methodKey: keyof PaymentMethodsConfig, 
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert("⚠️ Le fichier est trop volumineux. Veuillez choisir une image de moins de 5 Mo.");
      return;
    }

    try {
      // Optimize & compress icon into clean data URL (max 160x160) to prevent localStorage quota exhaustion
      const optimizedDataUrl = await compressImageFileToDataUrl(file, 160, 160, 0.9);
      handleUpdateItem(methodKey, { customIconUrl: optimizedDataUrl });
    } catch (err) {
      console.warn("Erreur d'optimisation d'image, lecture directe:", err);
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = reader.result as string;
        handleUpdateItem(methodKey, { customIconUrl: dataUrl });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveIcon = (methodKey: keyof PaymentMethodsConfig) => {
    handleUpdateItem(methodKey, { customIconUrl: '' });
    if (fileInputRefs.current[methodKey]) {
      fileInputRefs.current[methodKey]!.value = '';
    }
  };

  const handleSaveAll = async () => {
    setIsSaving(true);
    setSavedSuccess(false);

    try {
      // 1. Save to dedicated payment_methods_config in localStorage & broadcast & server sync
      saveStoredPaymentMethodsConfig(config);

      await new Promise((res) => setTimeout(res, 250));
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 3000);
    } catch (err) {
      console.error('Erreur de sauvegarde des icônes de paiement:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleResetDefaults = () => {
    if (window.confirm("Voulez-vous vraiment réinitialiser les icônes et styles par défaut de tous les modes de paiement ?")) {
      setConfig({ ...DEFAULT_PAYMENT_METHODS_CONFIG });
      saveStoredPaymentMethodsConfig({ ...DEFAULT_PAYMENT_METHODS_CONFIG });
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 2500);
    }
  };

  const currentMethodDef = METHODS_LIST.find((m) => m.key === activeTab) || METHODS_LIST[0];
  const currentMethodConfig = config[activeTab] || DEFAULT_PAYMENT_METHODS_CONFIG[activeTab];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-xl">
              <Sparkles className="w-5 h-5" />
            </span>
            <h2 className="text-lg font-black text-slate-800">
              Personnalisation Visuelle des Modes de Règlement
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1 leading-relaxed">
            Configurez les icônes (upload .gif, .png, .svg, .jpeg, .jpg, .ico), réglez leur taille (16-64px) et leur arrondi de bordure pour chaque mode de paiement (Inscription & Shop / Panier).
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 w-full md:w-auto">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="px-3.5 py-2 text-xs font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition flex items-center gap-1.5 cursor-pointer"
            title="Restaurer les valeurs d'origine"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Réinitialiser</span>
          </button>
          
          <button
            type="button"
            onClick={handleSaveAll}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-extrabold text-xs rounded-xl shadow-xs transition flex items-center gap-2 cursor-pointer"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'Enregistrement...' : 'Enregistrer les Icônes'}</span>
          </button>
        </div>
      </div>

      {savedSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>✅ Vos configurations d'icônes de paiement (taille, fichiers et bordures) ont été enregistrées avec succès sous la clé <code>payment_methods_config</code> !</span>
        </div>
      )}

      {/* Tabs for each payment method */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {METHODS_LIST.map((m) => {
          const itemConf = config[m.key];
          const hasCustom = Boolean(itemConf?.customIconUrl);
          const isActive = activeTab === m.key;

          return (
            <button
              key={m.key}
              type="button"
              onClick={() => setActiveTab(m.key)}
              className={`p-3.5 rounded-2xl border text-left transition flex flex-col justify-between cursor-pointer ${
                isActive
                  ? 'bg-indigo-50/80 border-indigo-500 shadow-sm ring-2 ring-indigo-500/20'
                  : 'bg-white border-slate-200 hover:bg-slate-50'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center overflow-hidden border border-slate-200">
                  <PaymentMethodIcon
                    methodId={m.key}
                    config={itemConf}
                    fallbackIconSize={20}
                    fallbackIconClassName="text-slate-700"
                  />
                </div>
                {hasCustom ? (
                  <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-700">
                    Personnalisé
                  </span>
                ) : (
                  <span className="text-[9px] font-bold text-slate-400 uppercase px-1.5 py-0.5 rounded bg-slate-100">
                    Défaut
                  </span>
                )}
              </div>
              <div>
                <h4 className="text-xs font-extrabold text-slate-800 line-clamp-1">{m.name}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{m.badgeText}</p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Active Method Editor Card */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-6">
        <div className="flex items-center justify-between border-b border-slate-150 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-100/70 text-indigo-700 flex items-center justify-center shrink-0">
              <PaymentMethodIcon
                methodId={activeTab}
                config={currentMethodConfig}
                fallbackIconSize={22}
                fallbackIconClassName="text-indigo-700"
              />
            </div>
            <div>
              <h3 className="text-sm font-black text-slate-800">
                Mode : {currentMethodDef.name}
              </h3>
              <p className="text-[11px] text-slate-400">
                Fallback d'origine : {currentMethodDef.defaultIconDesc}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono bg-slate-100 text-slate-600 px-2.5 py-1 rounded-lg border border-slate-200">
              Clé : <strong className="text-indigo-600 font-bold">{activeTab}</strong>
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* LEFT COLUMN: Controls & Upload */}
          <div className="space-y-5">
            {/* Label Override */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Libellé du mode de paiement
              </label>
              <input
                type="text"
                value={currentMethodConfig.label || ''}
                placeholder={currentMethodDef.defaultLabel}
                onChange={(e) => handleUpdateItem(activeTab, { label: e.target.value })}
                className="w-full p-2.5 text-xs bg-slate-50 border border-slate-200 rounded-xl font-semibold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
              />
            </div>

            {/* Upload Section */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Icône personnalisée (.gif, .jpeg, .png, .jpg, .ico, .svg)
              </label>
              
              <div className="p-4 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl hover:border-indigo-400 transition text-center space-y-3">
                <input
                  type="file"
                  id={`file-upload-${activeTab}`}
                  accept={ACCEPTED_PAYMENT_ICON_FORMATS}
                  ref={(el) => (fileInputRefs.current[activeTab] = el)}
                  onChange={(e) => handleFileUpload(activeTab, e)}
                  className="hidden"
                />

                <div className="flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-2 shadow-2xs">
                    <ImageIcon className="w-6 h-6" />
                  </div>
                  <label
                    htmlFor={`file-upload-${activeTab}`}
                    className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs cursor-pointer transition flex items-center gap-1.5"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Choisir un fichier...</span>
                  </label>
                  <p className="text-[10px] text-slate-400 mt-2">
                    Formats acceptés : <strong>GIF animé, PNG, SVG, JPG, JPEG, ICO</strong> (Max 5 Mo)
                  </p>
                </div>

                {currentMethodConfig.customIconUrl && (
                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Fichier chargé
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveIcon(activeTab)}
                      className="text-[11px] font-bold text-rose-600 hover:text-rose-700 flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      <span>Supprimer & Revenir au fallback</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Or Direct URL Input */}
              <div className="pt-1">
                <label className="block text-[11px] font-semibold text-slate-500 mb-1">
                  Ou URL directe de l'image :
                </label>
                <input
                  type="text"
                  value={currentMethodConfig.customIconUrl || ''}
                  placeholder="https://... ou data:image/png;base64,..."
                  onChange={(e) => handleUpdateItem(activeTab, { customIconUrl: e.target.value })}
                  className="w-full p-2 text-xs bg-slate-50 border border-slate-200 rounded-xl font-mono text-slate-700 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 focus:outline-hidden"
                />
              </div>
            </div>

            {/* Size Slider (px) */}
            <div className="space-y-2 p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Taille de l'icône (Largeur / Hauteur)</span>
                </label>
                <span className="text-xs font-mono font-black text-indigo-700 bg-white px-2.5 py-0.5 rounded-lg border border-slate-200">
                  {currentMethodConfig.size || 24} px
                </span>
              </div>
              
              <div className="flex items-center gap-3">
                <span className="text-[10px] text-slate-400 font-mono">16px</span>
                <input
                  type="range"
                  min="16"
                  max="64"
                  step="2"
                  value={currentMethodConfig.size || 24}
                  onChange={(e) => handleUpdateItem(activeTab, { size: Number(e.target.value) })}
                  className="flex-1 accent-indigo-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 font-mono">64px</span>
              </div>
            </div>

            {/* Border Radius Style Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-bold text-slate-700">
                Rayon de bordure (Border Radius)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {PAYMENT_BORDER_RADIUS_OPTIONS.map((opt) => {
                  const isSel = (currentMethodConfig.borderRadiusClass || 'rounded-md') === opt.id;
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleUpdateItem(activeTab, { borderRadiusClass: opt.id })}
                      className={`p-2.5 border text-left text-xs font-bold rounded-xl transition flex items-center justify-between cursor-pointer ${
                        isSel
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-xs'
                          : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <span>{opt.label.split(' ')[0]}</span>
                      <span className={`w-5 h-5 border-2 ${isSel ? 'border-white bg-white/20' : 'border-slate-400 bg-white'} ${opt.previewClass} shrink-0`}></span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Live Interactive Previews */}
          <div className="space-y-5 flex flex-col justify-between">
            <div className="space-y-4">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-700 uppercase tracking-wider">
                <Eye className="w-4 h-4 text-indigo-600" />
                <span>Aperçu en direct (Simulation Frontend)</span>
              </div>

              {/* Simulation 1: Inscription Multi-Step Card */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Page d'Inscription (Radio Card) :
                </span>
                <div className="p-4 bg-emerald-50/50 border-2 border-[#10B981] rounded-2xl flex items-start gap-3.5 shadow-sm ring-2 ring-[#10B981]/20">
                  <div className="w-12 h-12 rounded-xl bg-[#10B981] text-white flex items-center justify-center shrink-0 overflow-hidden">
                    <PaymentMethodIcon
                      methodId={activeTab}
                      config={currentMethodConfig}
                      fallbackIconSize={22}
                      fallbackIconClassName="text-white"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-black text-sm text-[#0A2540]">
                        {currentMethodConfig.label || currentMethodDef.defaultLabel}
                      </h4>
                      <span className="text-[9px] bg-[#10B981] text-white font-black px-2 py-0.5 rounded-full uppercase">
                        Choisi
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 mt-0.5">
                      Aperçu de la carte de sélection sur l'étape 4 de l'inscription.
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulation 2: Shop / Panier Card */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Page Panier / Shop (/panier) :
                </span>
                <div className="p-4 bg-white border border-slate-200 rounded-2xl flex items-start gap-3 shadow-2xs">
                  <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center shrink-0 overflow-hidden">
                    <PaymentMethodIcon
                      methodId={activeTab}
                      config={currentMethodConfig}
                      fallbackIconSize={20}
                      fallbackIconClassName="text-[#0A2540]"
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#0A2540]">
                        {currentMethodConfig.label || currentMethodDef.defaultLabel}
                      </h4>
                      <span className="text-[9px] bg-[#10B981] text-white font-black px-1.5 py-0.5 rounded uppercase">
                        Actif
                      </span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Règlement sécurisé officiel A-Zed Info
                    </p>
                  </div>
                </div>
              </div>

              {/* Simulation 3: Reusable Selector Pill */}
              <div className="space-y-1.5">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Sélecteur Simplifié (Pill / Modal) :
                </span>
                <div className="p-3 bg-slate-900 text-white rounded-xl flex items-center gap-3">
                  <div className="p-2 bg-slate-800 rounded-lg flex items-center justify-center shrink-0 overflow-hidden">
                    <PaymentMethodIcon
                      methodId={activeTab}
                      config={currentMethodConfig}
                      fallbackIconSize={18}
                      fallbackIconClassName="text-emerald-400"
                    />
                  </div>
                  <div className="text-xs">
                    <div className="font-bold text-white">
                      {currentMethodConfig.label || currentMethodDef.defaultLabel}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">
                      Taille: {currentMethodConfig.size || 24}px | Bordure: {currentMethodConfig.borderRadiusClass || 'rounded-md'}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick action bar */}
            <div className="p-3.5 bg-indigo-50/70 border border-indigo-150 rounded-xl flex items-center justify-between gap-3">
              <span className="text-[11px] text-indigo-900 font-semibold">
                Sauvegarder immédiatement les modifications ?
              </span>
              <button
                type="button"
                onClick={handleSaveAll}
                disabled={isSaving}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-lg shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Enregistrer</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Global Summary Table */}
      <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs space-y-3">
        <h4 className="text-xs font-black text-slate-800 uppercase tracking-wider">
          Synthèse des 4 Modes de Règlement
        </h4>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-slate-400 text-[10px] uppercase">
                <th className="py-2.5 px-3">Mode</th>
                <th className="py-2.5 px-3">Icône Rendu</th>
                <th className="py-2.5 px-3">Statut Source</th>
                <th className="py-2.5 px-3">Taille</th>
                <th className="py-2.5 px-3">Rayon de bordure</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {METHODS_LIST.map((m) => {
                const item = config[m.key];
                const isCustom = Boolean(item?.customIconUrl);

                return (
                  <tr key={m.key} className="hover:bg-slate-50">
                    <td className="py-3 px-3 font-bold text-slate-800">
                      {m.name}
                    </td>
                    <td className="py-3 px-3">
                      <div className="p-1.5 bg-slate-100 rounded-lg inline-flex items-center justify-center overflow-hidden border border-slate-200">
                        <PaymentMethodIcon
                          methodId={m.key}
                          config={item}
                          fallbackIconSize={20}
                          fallbackIconClassName="text-slate-700"
                        />
                      </div>
                    </td>
                    <td className="py-3 px-3">
                      {isCustom ? (
                        <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-extrabold text-[10px] rounded-full">
                          Fichier Personnalisé
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-slate-100 text-slate-600 font-bold text-[10px] rounded-full">
                          Icône Système SVG
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono font-bold text-indigo-600">
                      {item?.size || 24}px
                    </td>
                    <td className="py-3 px-3 font-mono text-slate-600 text-[11px]">
                      {item?.borderRadiusClass || 'rounded-md'}
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        type="button"
                        onClick={() => setActiveTab(m.key)}
                        className="text-indigo-600 hover:text-indigo-800 font-extrabold text-xs cursor-pointer hover:underline"
                      >
                        Modifier
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AdminPaymentMethodsConfig;
