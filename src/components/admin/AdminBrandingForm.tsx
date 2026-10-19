import React, { useState, useEffect } from "react";
import { ImagePickerInput } from "../ImagePickerInput";
import { AuthHeroImageConfig, DEFAULT_AUTH_HERO_CONFIG } from "../../types";
import AuthHeroBanner from "../AuthHeroBanner";
import { safeLocalStorageSetItem } from "../../utils/safeStorage";
import { compressImageFileToDataUrl } from "../../utils/imageOptimizer";
import { AppLogo } from "../Logo";
import { Check, X, Palette, Image, Sliders, Eye, Sparkles, Upload, RefreshCw, ShieldCheck, Users, Trash2, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

export function BrandingForm({
  logoUrl,
  logoText,
  primaryColor,
  secondaryColor,
  heroImageUrl,
  studentImageUrl,
  loginImageUrl,
  registerImageUrl,
  platformIcon,
  landingHeroTitle,
  landingHeroHighlight,
  landingHeroSubtext,
  overlayAlAdmisText,
  overlayAlAdmisBg,
  overlayAlAdmisTextColor,
  overlayKhaliaAlaynaText,
  overlayKhaliaAlaynaBg,
  overlayKhaliaAlaynaTextColor,
  overlayPlatformActiveHeader,
  overlayPlatformActiveSubtext,
  overlayPlatformActiveIcon,
  overlayPlatformActiveBg,
  overlayPlatformActiveTextColor,
  headingFont,
  bodyFont,
  teacherAvatar,
  authHeroImageConfig,
  onSave
}: {
  logoUrl: string;
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  heroImageUrl: string;
  studentImageUrl: string;
  loginImageUrl: string;
  registerImageUrl: string;
  platformIcon: string;
  landingHeroTitle: string;
  landingHeroHighlight: string;
  landingHeroSubtext: string;
  overlayAlAdmisText: string;
  overlayAlAdmisBg: string;
  overlayAlAdmisTextColor: string;
  overlayKhaliaAlaynaText: string;
  overlayKhaliaAlaynaBg: string;
  overlayKhaliaAlaynaTextColor: string;
  overlayPlatformActiveHeader: string;
  overlayPlatformActiveSubtext: string;
  overlayPlatformActiveIcon: string;
  overlayPlatformActiveBg: string;
  overlayPlatformActiveTextColor: string;
  headingFont: string;
  bodyFont: string;
  teacherAvatar?: string;
  authHeroImageConfig?: AuthHeroImageConfig | null;
  onSave: (config: any) => Promise<boolean>;
}) {
  const [formText, setFormText] = useState(logoText);
  const [formLogo, setFormLogo] = useState(logoUrl);
  const [formPrimary, setFormPrimary] = useState(primaryColor);
  const [formSecondary, setFormSecondary] = useState(secondaryColor);
  const [formHero, setFormHero] = useState(heroImageUrl);
  const [formStudent, setFormStudent] = useState(studentImageUrl);
  const [formLogin, setFormLogin] = useState(loginImageUrl || "");
  const [formRegister, setFormRegister] = useState(registerImageUrl || "");
  const [formIcon, setFormIcon] = useState(platformIcon);
  const [formHeadingFont, setFormHeadingFont] = useState(headingFont || "Inter");
  const [formBodyFont, setFormBodyFont] = useState(bodyFont || "Inter");
  const [authHeroConfig, setAuthHeroConfig] = useState<AuthHeroImageConfig>(() => {
    try {
      const saved = localStorage.getItem("auth_hero_image_config");
      if (saved) return { ...DEFAULT_AUTH_HERO_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return authHeroImageConfig || DEFAULT_AUTH_HERO_CONFIG;
  });
  const [formTeacherAvatar, setFormTeacherAvatar] = useState<string>(() => {
    if (teacherAvatar) return teacherAvatar;
    try {
      return localStorage.getItem("teacher_avatar") || "";
    } catch {
      return "";
    }
  });
  
  const [formHeroTitle, setFormHeroTitle] = useState(landingHeroTitle || "");
  const [formHeroHighlight, setFormHeroHighlight] = useState(landingHeroHighlight || "");
  const [formHeroSubtext, setFormHeroSubtext] = useState(landingHeroSubtext || "");
  const [formAlAdmisText, setFormAlAdmisText] = useState(overlayAlAdmisText || "");
  const [formAlAdmisBg, setFormAlAdmisBg] = useState(overlayAlAdmisBg || "");
  const [formAlAdmisTextColor, setFormAlAdmisTextColor] = useState(overlayAlAdmisTextColor || "");
  const [formKhaliaAlaynaText, setFormKhaliaAlaynaText] = useState(overlayKhaliaAlaynaText || "");
  const [formKhaliaAlaynaBg, setFormKhaliaAlaynaBg] = useState(overlayKhaliaAlaynaBg || "");
  const [formKhaliaAlaynaTextColor, setFormKhaliaAlaynaTextColor] = useState(overlayKhaliaAlaynaTextColor || "");
  const [formPlatformActiveHeader, setFormPlatformActiveHeader] = useState(overlayPlatformActiveHeader || "");
  const [formPlatformActiveSubtext, setFormPlatformActiveSubtext] = useState(overlayPlatformActiveSubtext || "");
  const [formPlatformActiveIcon, setFormPlatformActiveIcon] = useState(overlayPlatformActiveIcon || "");
  const [formPlatformActiveBg, setFormPlatformActiveBg] = useState(overlayPlatformActiveBg || "");
  const [formPlatformActiveTextColor, setFormPlatformActiveTextColor] = useState(overlayPlatformActiveTextColor || "");

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Sync state with props when props change
  useEffect(() => {
    setFormText(logoText);
    setFormLogo(logoUrl);
    setFormPrimary(primaryColor);
    setFormSecondary(secondaryColor);
    setFormHero(heroImageUrl);
    setFormStudent(studentImageUrl);
    setFormIcon(platformIcon);
    setFormHeadingFont(headingFont || "Inter");
    setFormBodyFont(bodyFont || "Inter");
    setFormHeroTitle(landingHeroTitle || "");
    setFormHeroHighlight(landingHeroHighlight || "");
    setFormHeroSubtext(landingHeroSubtext || "");
    setFormAlAdmisText(overlayAlAdmisText || "");
    setFormAlAdmisBg(overlayAlAdmisBg || "");
    setFormAlAdmisTextColor(overlayAlAdmisTextColor || "");
    setFormKhaliaAlaynaText(overlayKhaliaAlaynaText || "");
    setFormKhaliaAlaynaBg(overlayKhaliaAlaynaBg || "");
    setFormKhaliaAlaynaTextColor(overlayKhaliaAlaynaTextColor || "");
    setFormPlatformActiveHeader(overlayPlatformActiveHeader || "");
    setFormPlatformActiveSubtext(overlayPlatformActiveSubtext || "");
    setFormPlatformActiveIcon(overlayPlatformActiveIcon || "");
    setFormPlatformActiveBg(overlayPlatformActiveBg || "");
    setFormPlatformActiveTextColor(overlayPlatformActiveTextColor || "");
    if (teacherAvatar !== undefined) {
      setFormTeacherAvatar(teacherAvatar);
    }
  }, [
    logoUrl, logoText, primaryColor, secondaryColor, heroImageUrl, studentImageUrl, platformIcon,
    landingHeroTitle, landingHeroHighlight, landingHeroSubtext,
    overlayAlAdmisText, overlayAlAdmisBg, overlayAlAdmisTextColor,
    overlayKhaliaAlaynaText, overlayKhaliaAlaynaBg, overlayKhaliaAlaynaTextColor,
    overlayPlatformActiveHeader, overlayPlatformActiveSubtext, overlayPlatformActiveIcon,
    overlayPlatformActiveBg, overlayPlatformActiveTextColor, headingFont, bodyFont, teacherAvatar
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFileToDataUrl(file, 400, 400, 0.88);
      setter(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const ok = await onSave({
        logoText: formText,
        logoUrl: formLogo,
        primaryColor: formPrimary,
        secondaryColor: formSecondary,
        heroImageUrl: formHero,
        studentImageUrl: formStudent,
        loginImageUrl: formLogin,
        registerImageUrl: formRegister,
        platformIcon: formIcon,
        teacherAvatar: formTeacherAvatar,
        landingHeroTitle: formHeroTitle,
        landingHeroHighlight: formHeroHighlight,
        landingHeroSubtext: formHeroSubtext,
        overlayAlAdmisText: formAlAdmisText,
        overlayAlAdmisBg: formAlAdmisBg,
        overlayAlAdmisTextColor: formAlAdmisTextColor,
        overlayKhaliaAlaynaText: formKhaliaAlaynaText,
        overlayKhaliaAlaynaBg: formKhaliaAlaynaBg,
        overlayKhaliaAlaynaTextColor: formKhaliaAlaynaTextColor,
        overlayPlatformActiveHeader: formPlatformActiveHeader,
        overlayPlatformActiveSubtext: formPlatformActiveSubtext,
        overlayPlatformActiveIcon: formPlatformActiveIcon,
        overlayPlatformActiveBg: formPlatformActiveBg,
        overlayPlatformActiveTextColor: formPlatformActiveTextColor,
        headingFont: formHeadingFont,
        bodyFont: formBodyFont,
        authHeroImageConfig: authHeroConfig
      });
      if (ok) {
        safeLocalStorageSetItem("auth_hero_image_config", JSON.stringify(authHeroConfig));
        if (formTeacherAvatar) {
          safeLocalStorageSetItem("teacher_avatar", formTeacherAvatar);
        }
        setStatusMsg({ type: "success", text: "Modifications de branding enregistrées avec succès !" });
      } else {
        setStatusMsg({ type: "error", text: "Erreur lors de l'enregistrement." });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Erreur de communication avec le serveur." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          statusMsg.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Inputs */}
        <div className="space-y-6">
          
          {/* Brand Identity Section */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <div className="flex items-center justify-between">
              <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
                <span>🏷️ Identité & En-tête</span>
              </h3>
              <button
                type="button"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent("open-identity-modal"));
                }}
                className="px-3 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 border border-indigo-200 rounded-lg text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
              >
                <span>🏢</span> Modal Identité
              </button>
            </div>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Nom de la Plateforme (Texte)</label>
                <input
                  type="text"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="A-Zed Info"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Logo Officiel de l'Établissement</label>
                <div className="flex items-center gap-3">
                  {formLogo && (
                    <img src={formLogo} className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-xs shrink-0" alt="Logo preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormLogo)}
                      className="hidden"
                      id="branding-logo-file"
                    />
                    <label
                      htmlFor="branding-logo-file"
                      className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Upload size={13} />
                      Choisir une image
                    </label>
                    <p className="text-[10px] text-gray-400">Recommandé : PNG transparent carré ou paysage court (Max 2 Mo)</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-550 font-bold block">Ou spécifier une URL absolue :</span>
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Palettes Section */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎨 Thème & Nuanciers de Couleurs</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Couleur Primaire (Fonds, Titres)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formPrimary}
                    onChange={(e) => setFormPrimary(e.target.value)}
                    className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer shrink-0 p-0.5"
                  />
                  <input
                    type="text"
                    value={formPrimary}
                    onChange={(e) => setFormPrimary(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-250 rounded-xl text-xs font-mono font-bold uppercase"
                    placeholder="#0F1E36"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Couleur Secondaire (Accents, Réussite)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formSecondary}
                    onChange={(e) => setFormSecondary(e.target.value)}
                    className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer shrink-0 p-0.5"
                  />
                  <input
                    type="text"
                    value={formSecondary}
                    onChange={(e) => setFormSecondary(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-250 rounded-xl text-xs font-mono font-bold uppercase"
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-gray-500 font-bold block">Palettes Prédéfinies suggérées :</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Default Classique", primary: "#0F1E36", secondary: "#10B981" },
                  { name: "Minuit Royal", primary: "#1E1B4B", secondary: "#F59E0B" },
                  { name: "Océan Profond", primary: "#0C4A6E", secondary: "#38BDF8" },
                  { name: "Forêt Émeraude", primary: "#064E3B", secondary: "#34D399" },
                  { name: "Saphir & Rose", primary: "#0F172A", secondary: "#EC4899" }
                ].map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFormPrimary(p.primary);
                      setFormSecondary(p.secondary);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300" style={{ backgroundColor: p.primary }} />
                    <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300" style={{ backgroundColor: p.secondary }} />
                    <span className="text-gray-600 text-[9px] font-bold">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typography Customization Section */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>✍️ Styles de Typographie (Police de Caractères)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Polices des Titres (Headings)</label>
                <select
                  value={formHeadingFont}
                  onChange={(e) => setFormHeadingFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="Inter">Inter (Sans-serif Moderne)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech, Géométrique)</option>
                  <option value="Outfit">Outfit (Moderne, Arrondi)</option>
                  <option value="Playfair Display">Playfair Display (Élégant, Serif)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Moderne, Propre)</option>
                  <option value="Cinzel">Cinzel (Classique, Dramatique)</option>
                  <option value="Syne">Syne (Artistique, Expressif)</option>
                </select>
                <span className="text-[9px] text-gray-400 block font-medium">Applique la police aux titres (H1, H2, H3, etc.) de la plateforme.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Police du Corps (Body Text)</label>
                <select
                  value={formBodyFont}
                  onChange={(e) => setFormBodyFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="Inter">Inter (Sans-serif Neutre)</option>
                  <option value="JetBrains Mono">JetBrains Mono (Tech, Monospace)</option>
                  <option value="Roboto">Roboto (Polyvalent, Lisible)</option>
                  <option value="Lora">Lora (Littéraire, Sérif élégant)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Moderne & Net)</option>
                  <option value="Open Sans">Open Sans (Ultra lisible)</option>
                  <option value="Fira Code">Fira Code (Code, Monospace)</option>
                </select>
                <span className="text-[9px] text-gray-400 block font-medium">Applique la police aux paragraphes, listes, et textes d'information.</span>
              </div>
            </div>

            {/* Live Typography Preview */}
            <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-2 mt-2">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Aperçu direct de la typographie sélectionnée :</span>
              <div className="space-y-1 border-t border-dashed border-gray-100 pt-2">
                <h4 
                  style={{ fontFamily: formHeadingFont === 'Playfair Display' || formHeadingFont === 'Cinzel' ? `"${formHeadingFont}", serif` : `"${formHeadingFont}", sans-serif` }}
                  className="text-sm font-black text-gray-850"
                >
                  Voici un exemple de grand titre ({formHeadingFont})
                </h4>
                <p 
                  style={{ fontFamily: formBodyFont === 'Lora' ? `"${formBodyFont}", serif` : formBodyFont === 'JetBrains Mono' || formBodyFont === 'Fira Code' ? `"${formBodyFont}", monospace` : `"${formBodyFont}", sans-serif` }}
                  className="text-[11px] text-gray-500 leading-relaxed font-semibold"
                >
                  Ceci est un paragraphe de démonstration utilisant la police "{formBodyFont}". Il s'ajuste dynamiquement à la sélection de l'administrateur pour garantir la cohérence visuelle.
                </p>
              </div>
            </div>
          </div>

          {/* Landing Page Pictures */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🖼️ Illustrations de la Page d'Accueil</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Illustration Principale (Hero Banner)</label>
                <div className="flex items-center gap-3">
                  {formHero && (
                    <img src={formHero} className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Hero banner preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormHero)}
                      className="hidden"
                      id="branding-hero-file"
                    />
                    <label
                      htmlFor="branding-hero-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formHero}
                  onChange={(e) => setFormHero(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL de l'image de couverture"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Photo Section Élève (Témoignage/Portrait)</label>
                <div className="flex items-center gap-3">
                  {formStudent && (
                    <img src={formStudent} className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Student preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormStudent)}
                      className="hidden"
                      id="branding-student-file"
                    />
                    <label
                      htmlFor="branding-student-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formStudent}
                  onChange={(e) => setFormStudent(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL du portrait élève"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Photo de l'enseignant (Professeur Nabil Chaouch)</label>
                <div className="flex items-center gap-3">
                  {formTeacherAvatar ? (
                    <img src={formTeacherAvatar} className="w-16 h-16 object-cover rounded-full border border-gray-200 shadow-xs shrink-0" alt="Teacher preview" />
                  ) : (
                    <div className="w-16 h-16 rounded-full bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                      <Users size={26} />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormTeacherAvatar)}
                      className="hidden"
                      id="branding-teacher-avatar-file"
                    />
                    <div className="flex items-center gap-2">
                      <label
                        htmlFor="branding-teacher-avatar-file"
                        className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                      >
                        <Upload size={11} />
                        Choisir une image
                      </label>
                      {formTeacherAvatar && (
                        <button
                          type="button"
                          onClick={() => setFormTeacherAvatar("")}
                          className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition-all cursor-pointer inline-flex items-center gap-1"
                        >
                          <Trash2 size={11} />
                          Supprimer
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <input
                  type="text"
                  value={formTeacherAvatar}
                  onChange={(e) => setFormTeacherAvatar(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL ou Base64 de la photo de l'enseignant"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Photo de la page de Connexion (Login)</label>
                <div className="flex items-center gap-3">
                  {formLogin && (
                    <img src={formLogin} className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Login preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormLogin)}
                      className="hidden"
                      id="branding-login-file"
                    />
                    <label
                      htmlFor="branding-login-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formLogin}
                  onChange={(e) => setFormLogin(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL du visuel de connexion"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Photo de la page d'Inscription (Register)</label>
                <div className="flex items-center gap-3">
                  {formRegister && (
                    <img src={formRegister} className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Register preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormRegister)}
                      className="hidden"
                      id="branding-register-file"
                    />
                    <label
                      htmlFor="branding-register-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formRegister}
                  onChange={(e) => setFormRegister(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL du visuel d'inscription"
                />
              </div>

              {/* SECTION: Advanced Auth Hero Illustration Customizer */}
              <div className="space-y-5 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 p-5 rounded-2xl border border-indigo-150 shadow-xs mt-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-xs text-indigo-950 flex items-center gap-2 uppercase tracking-wide">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      <span>Personnalisation de l'Illustration d'Inscription & Connexion</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Ajustez la taille, la forme du cadre (rounded), la couleur de fond Hex et l'ajustement de l'image.
                    </p>
                  </div>
                </div>

                {/* 1. Taille, Hauteur, Échelle & Object Fit */}
                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                    1. Dimensions & Échelle (Taille & Scale)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Width */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-bold text-gray-700">Largeur du Cadre (%)</label>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {authHeroConfig.width || 85}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={100}
                        step={5}
                        value={authHeroConfig.width || 85}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, width: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-bold text-gray-700">Hauteur de l'Image (px)</label>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {authHeroConfig.height || 480}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={220}
                        max={700}
                        step={10}
                        value={authHeroConfig.height || 480}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, height: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Scale */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-bold text-gray-700">Échelle / Zoom (%)</label>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {authHeroConfig.scale || 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={150}
                        step={5}
                        value={authHeroConfig.scale || 100}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, scale: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Object Fit */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <label className="font-bold text-[11px] text-gray-700 block">Mode d'Ajustement</label>
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setAuthHeroConfig({ ...authHeroConfig, objectFit: "object-cover" })}
                          className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                            (authHeroConfig.objectFit || "object-cover") === "object-cover"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          Cover (Remplir)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthHeroConfig({ ...authHeroConfig, objectFit: "object-contain" })}
                          className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                            authHeroConfig.objectFit === "object-contain"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          Contain (Entier)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Sélection de la Forme (Bordures & Contours) */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                    2. Style de la Forme & Contours (Rounded & Borders)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "rounded-none", label: "Bords Droits", desc: "Rectangulaire" },
                      { id: "rounded-xl", label: "Arrondi XL", desc: "Standard (12px)" },
                      { id: "rounded-2xl", label: "Grand Arrondi", desc: "Marqué (16px)" },
                      { id: "rounded-3xl", label: "3XL Grand", desc: "Recommandé (24px)" },
                      { id: "rounded-[2.5rem]", label: "Style Carte Pill", desc: "Pill Card (40px)" },
                      { id: "rounded-full", label: "Forme Ellipse", desc: "Circulaire Intégral" }
                    ].map((shape) => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setAuthHeroConfig({ ...authHeroConfig, shapeClass: shape.id })}
                        className={`p-2 text-left rounded-xl border transition-all ${
                          (authHeroConfig.shapeClass || "rounded-3xl") === shape.id
                            ? "bg-indigo-100/80 border-indigo-600 text-indigo-950 font-black ring-2 ring-indigo-500/20 shadow-2xs"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                        }`}
                      >
                        <div className="text-[11px]">{shape.label}</div>
                        <div className="text-[9px] text-gray-400 font-medium">{shape.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Border width */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-bold text-gray-700">Épaisseur de Bordure (px)</label>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {authHeroConfig.borderWidth ?? 4}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={12}
                        step={1}
                        value={authHeroConfig.borderWidth ?? 4}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, borderWidth: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Border color */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <label className="font-bold text-[11px] text-gray-700 block">Couleur de Bordure</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={authHeroConfig.borderColor || "#FFFFFF"}
                          onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, borderColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={authHeroConfig.borderColor || "#FFFFFF"}
                          onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, borderColor: e.target.value })}
                          className="flex-1 px-2.5 py-1 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Couleur de fond du panneau latéral */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                    3. Couleur de Fond du Panneau Latéral (Container Background Color)
                  </span>

                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                    <input
                      type="color"
                      value={authHeroConfig.backgroundColor || "#133F85"}
                      onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 shadow-2xs shrink-0"
                    />
                    <div className="flex-1 space-y-0.5">
                      <label className="text-[11px] font-bold text-gray-700 block">Code Couleur Hexadécimal</label>
                      <input
                        type="text"
                        value={authHeroConfig.backgroundColor || "#133F85"}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, backgroundColor: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs font-mono font-black text-gray-800 uppercase"
                        placeholder="#133F85"
                      />
                    </div>
                  </div>

                  {/* Palette de couleurs rapide */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { name: "Bleu A-Zed", hex: "#133F85" },
                      { name: "Bleu Royal", hex: "#1D4ED8" },
                      { name: "Bleu Nuit", hex: "#0F1E36" },
                      { name: "Émeraude", hex: "#047857" },
                      { name: "Indigo", hex: "#4F46E5" },
                      { name: "Violet", hex: "#7C3AED" },
                      { name: "Anthracite", hex: "#111827" }
                    ].map((palette) => (
                      <button
                        key={palette.hex}
                        type="button"
                        onClick={() => setAuthHeroConfig({ ...authHeroConfig, backgroundColor: palette.hex })}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-bold text-gray-700 transition-all shadow-2xs"
                      >
                        <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: palette.hex }} />
                        <span>{palette.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Aperçu Réactif Interactif en Temps Réel */}
                <div className="space-y-2 pt-3 border-t border-indigo-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider">
                      👁️ Aperçu Temps Réel de l'Illustration
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">Live Admin</span>
                  </div>

                  <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-indigo-200 shadow-md">
                    <AuthHeroBanner
                      config={authHeroConfig}
                      imageUrl={formRegister || formLogin || studentImageUrl}
                      showDetails={true}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>✨ Icône de l'Application (Platform Icon)</span>
            </h3>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-600 block">Icône personnalisée</label>
              <div className="flex items-center gap-3">
                {formIcon && (
                  <img src={formIcon} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Icon preview" />
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setFormIcon)}
                    className="hidden"
                    id="branding-icon-file"
                  />
                  <label
                    htmlFor="branding-icon-file"
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                  >
                    <Upload size={11} />
                    Choisir l'icône
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                placeholder="URL de l'icône (ou base64)"
              />
            </div>
          </div>

          {/* Landing Page Content Customizer Section */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>📢 Textes & Couleurs de la Page d'Accueil</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Titre Principal du Hero</label>
                <input
                  type="text"
                  value={formHeroTitle}
                  onChange={(e) => setFormHeroTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="Ex: Prêt à dompter le Python ?"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Surlignement du Titre (Highlight)</label>
                <input
                  type="text"
                  value={formHeroHighlight}
                  onChange={(e) => setFormHeroHighlight(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="Ex: Rejoignez l'élite des lycéens"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Description du Hero (Paragraphe)</label>
                <textarea
                  value={formHeroSubtext}
                  onChange={(e) => setFormHeroSubtext(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none h-20"
                  placeholder="Texte de présentation de la plateforme..."
                />
              </div>
            </div>
          </div>

          {/* Floating Components and Overlays Customizer */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 Composants Flottants de l'Image Hero</span>
            </h3>

            <div className="space-y-6 divide-y divide-gray-100">
              
              {/* Overlay 1: Al Admis */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-extrabold text-pink-600 block">● Composant 1 : Al Admis (★)</span>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Texte affiché</label>
                    <input
                      type="text"
                      value={formAlAdmisText}
                      onChange={(e) => setFormAlAdmisText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs"
                      placeholder="Al Admis الـ"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Fond (CSS/Couleur)</label>
                      <input
                        type="text"
                        value={formAlAdmisBg}
                        onChange={(e) => setFormAlAdmisBg(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs font-mono"
                        placeholder="linear-gradient(...)"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Texte (Couleur)</label>
                      <input
                        type="color"
                        value={formAlAdmisTextColor.startsWith('#') ? formAlAdmisTextColor : '#ffffff'}
                        onChange={(e) => setFormAlAdmisTextColor(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay 2: خليها علينا */}
              <div className="space-y-3 pt-4">
                <span className="text-[11px] font-extrabold text-blue-600 block">● Composant 2 : خليها علينا 🎓</span>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Texte affiché</label>
                    <input
                      type="text"
                      value={formKhaliaAlaynaText}
                      onChange={(e) => setFormKhaliaAlaynaText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs"
                      placeholder="خليها علينا 🎓"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Fond (Couleur/Hex)</label>
                      <input
                        type="color"
                        value={formKhaliaAlaynaBg.startsWith('#') ? formKhaliaAlaynaBg : '#0047AB'}
                        onChange={(e) => setFormKhaliaAlaynaBg(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Texte (Couleur/Hex)</label>
                      <input
                        type="color"
                        value={formKhaliaAlaynaTextColor.startsWith('#') ? formKhaliaAlaynaTextColor : '#ffffff'}
                        onChange={(e) => setFormKhaliaAlaynaTextColor(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay 3: Platform Active */}
              <div className="space-y-3 pt-4">
                <span className="text-[11px] font-extrabold text-emerald-600 block">● Composant 3 : Platform Active 💻</span>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-gray-500">Titre</label>
                      <input
                        type="text"
                        value={formPlatformActiveHeader}
                        onChange={(e) => setFormPlatformActiveHeader(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs"
                        placeholder="Platform Active"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Émoticône</label>
                      <input
                        type="text"
                        value={formPlatformActiveIcon}
                        onChange={(e) => setFormPlatformActiveIcon(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs text-center"
                        placeholder="💻"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Sous-titre</label>
                    <input
                      type="text"
                      value={formPlatformActiveSubtext}
                      onChange={(e) => setFormPlatformActiveSubtext(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs"
                      placeholder="Interactive Dashboard"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Fond (Couleur/Hex)</label>
                      <input
                        type="color"
                        value={formPlatformActiveBg.startsWith('#') ? formPlatformActiveBg : '#ffffff'}
                        onChange={(e) => setFormPlatformActiveBg(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Texte (Couleur/Hex)</label>
                      <input
                        type="color"
                        value={formPlatformActiveTextColor.startsWith('#') ? formPlatformActiveTextColor : '#1e293b'}
                        onChange={(e) => setFormPlatformActiveTextColor(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Visual Mockup Preview */}
        <div className="space-y-6">
          <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl sticky top-6 space-y-4 text-left">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">👁️ Aperçu temps réel (Simulateur d'Écran)</span>
            
            {/* Header Simulator */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs space-y-2 text-xs">
              <span className="text-[8px] font-bold text-gray-400 block uppercase">Barre de Navigation</span>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <AppLogo className="w-7 h-7" src={formLogo} />
                  <span className="font-extrabold text-gray-800 text-[11px]">{formText || "Platform"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gray-100 block" />
                  <span className="w-6 h-3 rounded block" style={{ backgroundColor: formPrimary }} />
                </div>
              </div>
            </div>

            {/* Main Interactive Button Simulator */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3 text-xs">
              <span className="text-[8px] font-bold text-gray-400 block uppercase">Composants Interactifs</span>
              <div className="space-y-2">
                <button type="button" className="w-full py-2 text-white font-extrabold rounded-lg text-center transition-all shadow-xs" style={{ backgroundColor: formPrimary }}>
                  Bouton Principal (Primaire)
                </button>
                <button type="button" className="w-full py-2 text-white font-extrabold rounded-lg text-center transition-all shadow-xs" style={{ backgroundColor: formSecondary }}>
                  Bouton de Réussite (Secondaire)
                </button>
              </div>
            </div>

            {/* Landing Hero Simulator */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3 text-xs">
              <span className="text-[8px] font-bold text-gray-400 block uppercase">Maquette Landing Page</span>
              <div className="flex gap-3 items-center">
                <div className="flex-1 space-y-1">
                  <h4 className="font-extrabold text-gray-850 text-[10px] leading-tight" style={{ color: formPrimary }}>
                    {formHeroTitle || "Prêt à dompter le Python ?"}
                  </h4>
                  <p className="text-[8px] text-gray-550 leading-tight">
                    {formHeroSubtext || "Rejoignez l'élite des lycéens en Tunisie."}
                  </p>
                  <div className="w-12 h-3.5 rounded" style={{ backgroundColor: formSecondary }} />
                </div>
                <div className="w-16 h-12 rounded-lg overflow-hidden border shrink-0">
                  <img src={formHero || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500"} className="w-full h-full object-cover" alt="Hero portrait" />
                </div>
              </div>
            </div>

            {/* Float Components Simulator */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-2.5 text-xs text-left">
              <span className="text-[8px] font-bold text-gray-400 block uppercase">Composants Flottants</span>
              <div className="space-y-1.5">
                <div className="text-[9px] font-bold px-2.5 py-1 rounded-lg border inline-block" style={{ background: formAlAdmisBg || "linear-gradient(to right, #f43f5e, #ec4899)", color: formAlAdmisTextColor || "#ffffff", borderColor: formAlAdmisTextColor || "#f43f5e" }}>
                  <span>{formAlAdmisText || "Al Admis الـ"}</span> <span className="text-yellow-350">★</span>
                </div>
                <div className="text-[9px] font-bold px-2.5 py-1 rounded-lg border block" style={{ backgroundColor: formKhaliaAlaynaBg || "#0047AB", color: formKhaliaAlaynaTextColor || "#ffffff", borderColor: formKhaliaAlaynaTextColor ? `${formKhaliaAlaynaTextColor}33` : "rgba(59, 130, 246, 0.3)" }}>
                  <span>{formKhaliaAlaynaText || "خليها علينا 🎓"}</span>
                </div>
                <div className="text-[9px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5" style={{ backgroundColor: formPlatformActiveBg || "#ffffff", color: formPlatformActiveTextColor || "#1e293b", borderColor: formPlatformActiveTextColor ? `${formPlatformActiveTextColor}22` : "rgba(229, 231, 235, 1)" }}>
                  <span>{formPlatformActiveIcon || "💻"}</span>
                  <div>
                    <p className="font-extrabold text-[9px] leading-tight">{formPlatformActiveHeader || "Platform Active"}</p>
                    <p className="text-[7px] opacity-70 leading-none mt-0.5">{formPlatformActiveSubtext || "Interactive Dashboard"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="w-full py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                👁️ Aperçu plein écran (Landing Page)
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-[#0F1E36] hover:opacity-90 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: formPrimary }}
              >
                {isSaving ? "Enregistrement en cours..." : "💾 Enregistrer le design de la plateforme"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex flex-col justify-start overflow-y-auto"
          >
            {/* Modal Controls Header */}
            <div className="sticky top-0 z-50 bg-[#0F1E36] text-white border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">👁️</span>
                <div className="text-left">
                  <h3 className="font-extrabold text-sm tracking-tight">Aperçu interactif haute fidélité</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Simulateur de Page d'Accueil</p>
                </div>
              </div>

              {/* Specs & Device Switcher */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                <div className="hidden lg:flex items-center gap-3 px-3 py-1 border-r border-slate-800 text-[10px] font-bold text-slate-400">
                  <span>Police Titres : <span className="text-emerald-400 font-bold">{formHeadingFont}</span></span>
                  <span>•</span>
                  <span>Police Corps : <span className="text-emerald-400 font-bold">{formBodyFont}</span></span>
                  <span>•</span>
                  <span>Couleur Primaire : <span className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: formPrimary }}>{formPrimary}</span></span>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${previewMode === "desktop" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    🖥️ Bureau
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${previewMode === "mobile" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    📱 Mobile
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <X size={14} />
                Quitter l'aperçu
              </button>
            </div>

            {/* Modal Body / Landing Page Workspace */}
            <div className="flex-1 p-4 md:p-8 bg-slate-100/50 flex justify-center items-start min-h-[calc(100vh-80px)]">
              <div 
                className={`w-full bg-white transition-all duration-300 rounded-3xl shadow-2xl border border-slate-250/60 overflow-hidden ${
                  previewMode === "mobile" ? "max-w-md min-h-[750px] my-6" : "max-w-7xl"
                }`}
                style={{ 
                  fontFamily: formBodyFont === "Lora" ? '"Lora", serif' : formBodyFont === "JetBrains Mono" ? '"JetBrains Mono", monospace' : formBodyFont === "Fira Code" ? '"Fira Code", monospace' : `"${formBodyFont}", sans-serif`
                }}
              >
                {/* 1. Header simulator inside mockup */}
                <header className="bg-white border-b border-gray-100 shadow-xs px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <AppLogo className="w-12 h-12 shadow-md cursor-pointer" src={formLogo} />
                      <div className="text-left">
                        <h1 
                          className="text-sm font-black tracking-tight text-[#0047AB] leading-none" 
                          style={{ 
                            fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`,
                            color: formPrimary 
                          }}
                        >
                          {formText || "A-Zed Info"}
                        </h1>
                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider block mt-1">
                          Le spécialiste en informatique
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 text-xs font-bold text-gray-600">
                      <span className="hover:text-emerald-600 transition-colors cursor-pointer">À propos</span>
                      <span className="hover:text-emerald-600 transition-colors cursor-pointer">Fonctionnalités</span>
                      <span className="hover:text-emerald-600 transition-colors cursor-pointer">Nos qualités</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button" className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                        Connexion
                      </button>
                      <button type="button" className="px-3.5 py-1.5 text-xs font-bold text-white rounded-xl transition-all shadow-xs cursor-pointer" style={{ backgroundColor: formPrimary }}>
                        S'inscrire
                      </button>
                    </div>
                  </div>
                </header>

                {/* 2. Hero banner mockup inside mockup */}
                <section className="px-6 py-12 md:py-16 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
                  <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className={`grid grid-cols-1 ${previewMode === "mobile" ? "gap-8" : "md:grid-cols-12 gap-12"} items-center max-w-6xl mx-auto`}>
                    
                    {/* Left hero column info */}
                    <div className={`${previewMode === "mobile" ? "text-center" : "md:col-span-7"} space-y-6 text-left`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 inline-block">
                        ✨ Excellence Académique & Algorithmes
                      </span>

                      <h2 
                        className="text-2xl md:text-4xl font-black text-[#0047AB] leading-tight tracking-tight"
                        style={{ 
                          fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                        }}
                      >
                        {formHeroTitle || "Prêt à dompter le Python ?"} <span className="relative inline-block text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${formPrimary}, ${formSecondary})` }}>{formHeroHighlight || "Rejoignez l'élite"}</span>
                      </h2>

                      <p className="text-xs md:text-sm text-gray-550 leading-relaxed font-semibold">
                        {formHeroSubtext || "Rejoignez la plateforme leader en Tunisie pour exceller en informatique, algorithmique et matières scientifiques."}
                      </p>

                      <div className={`flex flex-wrap items-center gap-3 ${previewMode === "mobile" ? "justify-center" : "justify-start"}`}>
                        <button 
                          type="button" 
                          className="px-6 py-3 text-white font-extrabold rounded-xl text-xs transition-all shadow-md hover:scale-102 flex items-center gap-2 cursor-pointer"
                          style={{ 
                            backgroundColor: formPrimary, 
                            fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                          }}
                        >
                          <span>Découvrir les cours</span>
                          <ArrowRight size={14} />
                        </button>
                        <button 
                          type="button" 
                          className="px-6 py-3 bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 font-extrabold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                          style={{ 
                            fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                          }}
                        >
                          Espace Parent
                        </button>
                      </div>

                      {/* Trust indicators */}
                      <div className={`pt-4 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-450 font-semibold ${previewMode === "mobile" ? "justify-center" : "justify-start"}`}>
                        <span className="flex items-center gap-1">✅ +1,200 Élèves Admis</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">⭐ Note Globale 4.9/5</span>
                      </div>
                    </div>

                    {/* Right hero column visuals with student portrait overlays */}
                    <div className={`${previewMode === "mobile" ? "md:col-span-12" : "md:col-span-5"} flex justify-center`}>
                      <div className="relative w-full max-w-sm aspect-square bg-slate-50 border border-gray-150 rounded-3xl overflow-hidden p-6 shadow-xl flex items-center justify-center">
                        {/* Background Hero design */}
                        <div className="absolute inset-0 z-0">
                          <img 
                            src={formHero || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500"} 
                            className="w-full h-full object-cover opacity-85" 
                            alt="Background Hero" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent" />
                        </div>

                        {/* Interactive Float Overlays */}
                        <div className="absolute inset-0 z-10 p-5 pointer-events-none flex flex-col justify-between">
                          
                          {/* Al Admis Badge */}
                          <div className="self-start">
                            <span 
                              className="px-3.5 py-1.5 rounded-xl border font-bold text-[10px] shadow-lg inline-block transform -rotate-2"
                              style={{ 
                                background: formAlAdmisBg || "linear-gradient(to right, #f43f5e, #ec4899)", 
                                color: formAlAdmisTextColor || "#ffffff",
                                borderColor: formAlAdmisTextColor ? `${formAlAdmisTextColor}33` : "#f43f5e"
                              }}
                            >
                              <span>{formAlAdmisText || "Al Admis الـ"}</span> <span className="text-yellow-350">★</span>
                            </span>
                          </div>

                          {/* Middle Overlay - Student Portrait Container */}
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-200">
                              <img 
                                src={formStudent || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300"} 
                                className="w-full h-full object-cover" 
                                alt="Student portrait" 
                              />
                            </div>
                          </div>

                          {/* Bottom floating components */}
                          <div className="space-y-1.5 self-stretch mt-auto">
                            
                            {/* Khalia Alayna Dialect Banner */}
                            <div 
                              className="px-3.5 py-2 rounded-xl border font-extrabold text-[10px] shadow-lg text-center backdrop-blur-xs transform rotate-1"
                              style={{ 
                                backgroundColor: formKhaliaAlaynaBg || "#0047AB", 
                                color: formKhaliaAlaynaTextColor || "#ffffff",
                                borderColor: formKhaliaAlaynaTextColor ? `${formKhaliaAlaynaTextColor}33` : "rgba(255,255,255,0.15)"
                              }}
                            >
                              {formKhaliaAlaynaText || "خليها علينا 🎓"}
                            </div>

                            {/* Platform Active overlay */}
                            <div 
                              className="px-3 py-2 rounded-xl border text-[10px] shadow-xl flex items-center gap-2.5"
                              style={{ 
                                backgroundColor: formPlatformActiveBg || "#ffffff", 
                                color: formPlatformActiveTextColor || "#1e293b",
                                borderColor: formPlatformActiveTextColor ? `${formPlatformActiveTextColor}11` : "rgba(229, 231, 235, 1)"
                              }}
                            >
                              <span className="text-xs">{formPlatformActiveIcon || "💻"}</span>
                              <div className="text-left">
                                <p className="font-extrabold leading-none">{formPlatformActiveHeader || "Platform Active"}</p>
                                <p className="text-[8px] opacity-70 mt-0.5 leading-none">{formPlatformActiveSubtext || "Interactive Dashboard"}</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>

                {/* 3. Sample Course Offerings section mockup */}
                <section className="px-6 py-12 bg-slate-50 border-t border-gray-100">
                  <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 block">📚 Nos Programmes Phares</span>
                      <h3 
                        className="text-xl md:text-2xl font-black text-[#0047AB]" 
                        style={{ 
                          fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                        }}
                      >
                        Améliorez vos compétences informatiques
                      </h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        Explorez nos packages de cours d'algorithmique et programmation Python pensés pour votre réussite.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      {/* Card 1 */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: formPrimary }}>
                          💡
                        </div>
                        <div className="space-y-1.5">
                          <h4 
                            className="text-sm font-extrabold text-gray-800" 
                            style={{ 
                              fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                            }}
                          >
                            Python Fondamentaux (Bac Tunisien)
                          </h4>
                          <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                            Apprenez les bases solides : variables, boucles conditionnelles, et fonctions avec un compilateur Python interactif intégré.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-gray-600">
                          <span>⏱️ 12h de vidéos</span>
                          <span className="text-emerald-600" style={{ color: formSecondary }}>Gratuit / Premium</span>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: formSecondary }}>
                          🚀
                        </div>
                        <div className="space-y-1.5">
                          <h4 
                            className="text-sm font-extrabold text-gray-800" 
                            style={{ 
                              fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                            }}
                          >
                            Algorithmique Avancée & Structures
                          </h4>
                          <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                            Maîtrisez les structures de données, le tri, la recherche dichotomique et préparez brillamment vos examens d'informatique.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-gray-600">
                          <span>⏱️ 20h de vidéos</span>
                          <span className="text-emerald-600" style={{ color: formSecondary }}>Recommandé ⭐</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. Footer mockup */}
                <footer className="bg-[#0047AB] text-slate-300 py-8 px-6 text-center text-xs space-y-4" style={{ backgroundColor: formPrimary }}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-white text-[#0047AB] flex items-center justify-center font-bold text-xs" style={{ color: formPrimary }}>A</span>
                      <span 
                        className="font-bold text-[11px] text-white" 
                        style={{ 
                          fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                        }}
                      >
                        {formText || "A-Zed Info"}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-400">
                      © {new Date().getFullYear()} {formText || "A-Zed Info"}. Tous droits réservés.
                    </p>
                  </div>
                </footer>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}
