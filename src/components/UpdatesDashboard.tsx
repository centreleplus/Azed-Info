import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  RefreshCw, 
  Palette, 
  Sparkles, 
  Grid, 
  Heart, 
  Bell, 
  Clock, 
  BookOpen, 
  Terminal, 
  Save, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Sliders, 
  Type, 
  Image as ImageIcon, 
  Layout,
  ExternalLink,
  Loader2,
  AlertCircle,
  Laptop,
  Award,
  Shield,
  HelpCircle,
  User,
  Code,
  Undo,
  Phone,
  CreditCard,
  Building2,
  Send,
  Layers,
  Youtube
} from "lucide-react";
import { useSettings, SiteSettings } from "./SettingsContext";
import AdminUpdateCardsView from "./AdminUpdateCardsView";
import AdminHowItWorksManager from "./AdminHowItWorksManager";
import AdminPaymentMethodsConfig from "./AdminPaymentMethodsConfig";

// Font choices
const FONT_FAMILIES = [
  { id: "Inter", name: "Inter (Sans-serif)" },
  { id: "Poppins", name: "Poppins (Moderne)" },
  { id: "Roboto", name: "Roboto (Technique)" },
  { id: "Playfair Display", name: "Playfair (Élégant)" },
  { id: "JetBrains Mono", name: "JetBrains Mono (Console)" },
  { id: "Space Grotesk", name: "Space Grotesk (Tech)" },
  { id: "Outfit", name: "Outfit (Stylisé)" }
];

// Tailwind-style font sizes
const FONT_SIZES = [
  { id: "text-xs", name: "Très Petit (text-xs)" },
  { id: "text-sm", name: "Petit (text-sm)" },
  { id: "text-base", name: "Normal (text-base)" },
  { id: "text-lg", name: "Grand (text-lg)" },
  { id: "text-xl", name: "Très Grand (text-xl)" },
  { id: "text-2xl", name: "Titre 3 (text-2xl)" },
  { id: "text-3xl", name: "Titre 2 (text-3xl)" },
  { id: "text-4xl", name: "Titre 1 (text-4xl)" },
  { id: "text-5xl", name: "Display (text-5xl)" },
  { id: "text-6xl", name: "Géant (text-6xl)" }
];

const BORDER_RADII = [
  { id: "rounded-none", name: "Carré" },
  { id: "rounded-md", name: "Doux (md)" },
  { id: "rounded-lg", name: "Arrondi (lg)" },
  { id: "rounded-xl", name: "Moderne (xl)" },
  { id: "rounded-2xl", name: "Très Arrondi (2xl)" },
  { id: "rounded-3xl", name: "Style Bulle (3xl)" },
  { id: "rounded-full", name: "Pilule" }
];

const BORDER_WIDTHS = [
  { id: "border-0", name: "Aucune" },
  { id: "border", name: "Fine (1px)" },
  { id: "border-2", name: "Moyenne (2px)" },
  { id: "border-4", name: "Épaisse (4px)" }
];

// Visual icon choices
const CMS_ICONS = [
  { id: "Sparkles", icon: Sparkles, name: "Étincelles" },
  { id: "Grid", icon: Grid, name: "Grille" },
  { id: "Heart", icon: Heart, name: "Cœur" },
  { id: "Bell", icon: Bell, name: "Cloche" },
  { id: "Clock", icon: Clock, name: "Horloge" },
  { id: "BookOpen", icon: BookOpen, name: "Livre" },
  { id: "Terminal", icon: Terminal, name: "Console" },
  { id: "Palette", icon: Palette, name: "Palette" },
  { id: "Laptop", icon: Laptop, name: "Ordinateur" },
  { id: "Award", icon: Award, name: "Trophée" },
  { id: "Shield", icon: Shield, name: "Bouclier" },
  { id: "HelpCircle", icon: HelpCircle, name: "Aide" },
  { id: "User", icon: User, name: "Utilisateur" },
  { id: "Code", icon: Code, name: "Sintaxe / Code" }
];

// Structural Blueprint for Each CMS Editable Zone
export interface CMSBlockConfig {
  id: string;
  title: string;
  paragraph: string;
  linkUrl: string;
  linkText: string;
  icon: string;
  selected_icon?: string;
  fontFamily: string;
  fontSize: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  borderRadius: string;
  borderWidth: string;
  imageUrl: string;
  alignLeft: boolean; // Left/Center/Right alignment or image placement toggle
  orderWeight: number; // Order index
  ctaStyle?: "solid" | "outline" | "gradient";
  boxShadow?: "none" | "sm" | "md" | "xl";
  paddingSize?: "compact" | "normal" | "spacious";
  bgOpacity?: number;
}

// Global Site Configuration Wrapper
export interface UnifiedSiteConfiguration {
  landingPageConfig: {
    hero: CMSBlockConfig;
    features: CMSBlockConfig;
    testimonials: CMSBlockConfig;
    about: CMSBlockConfig;
    whyChooseUs: CMSBlockConfig;
    howItWorks: CMSBlockConfig;
    packs: CMSBlockConfig;
    footer: CMSBlockConfig;
  };
  studentDashboardConfig: {
    sidebar: CMSBlockConfig;
    welcomeBanner: CMSBlockConfig;
    newsSection: CMSBlockConfig;
    reminderPanel: CMSBlockConfig;
    courseCard: CMSBlockConfig; // Practical sample: "La Récursivité"
    correctionZone: CMSBlockConfig;
  };
}

export const UpdatesAdminView: React.FC = () => {
  const { settings, updateSettings, loading } = useSettings();
  const [formData, setFormData] = useState<SiteSettings>(settings);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    setFormData(settings);
  }, [settings]);

  const handleSave = async () => {
    await updateSettings(formData);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
    alert('✅ Les informations de contact et modes de règlement ont été mis à jour avec succès !');
  };

  return (
    <div className="space-y-8 p-6 max-w-5xl mx-auto bg-slate-50/50 rounded-2xl border border-slate-200/80">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
        <div>
          <h2 className="text-xl font-black text-slate-800">Gestion des Infos & Modes de Règlement</h2>
          <p className="text-xs text-slate-500 mt-0.5">Modifiez les coordonnées de contact et les données bancaires affichées aux élèves.</p>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
        >
          <Save size={16} />
          <span>{loading ? "Enregistrement..." : "Enregistrer les modifications"}</span>
        </button>
      </div>

      {saveSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold rounded-xl flex items-center gap-2">
          <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>✅ Les informations de contact et modes de règlement ont été mis à jour avec succès !</span>
        </div>
      )}

      {/* SECTION 1 : CONTACTS & INTRO */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-4 shadow-2xs">
        <h3 className="font-extrabold text-sm text-slate-800 uppercase tracking-wider text-emerald-600 flex items-center gap-2">
          <Phone className="w-4 h-4" /> 📞 Section Intro & Contacts (Footer)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
          <div>
            <label className="block text-slate-600 mb-1">Téléphone Principal</label>
            <input
              type="text"
              value={formData.contact.phone1}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone1: e.target.value } })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-mono font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Second Téléphone</label>
            <input
              type="text"
              value={formData.contact.phone2}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, phone2: e.target.value } })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden font-mono font-bold text-slate-800"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Adresse E-mail</label>
            <input
              type="email"
              value={formData.contact.email}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, email: e.target.value } })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Messenger</label>
            <input
              type="text"
              value={formData.contact.messenger}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, messenger: e.target.value } })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Institution</label>
            <input
              type="text"
              value={formData.contact.institution}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, institution: e.target.value } })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
          <div>
            <label className="block text-slate-600 mb-1">Auteur & Professeur</label>
            <input
              type="text"
              value={formData.contact.author}
              onChange={(e) => setFormData({ ...formData, contact: { ...formData.contact, author: e.target.value } })}
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2 : MODES DE PAIEMENT */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 space-y-6 shadow-2xs">
        <h3 className="font-extrabold text-sm uppercase tracking-wider text-indigo-600 flex items-center gap-2">
          <CreditCard className="w-4 h-4" /> 💳 Paramètres des Modes de Règlement (Inscription & Shop)
        </h3>

        {/* D17 */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">📱 D17 Poste Mobile</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">Numéro Mobile D17</label>
              <input
                type="text"
                placeholder="Numéro Mobile D17"
                value={formData.payments.d17.phone}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, d17: { ...formData.payments.d17, phone: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-emerald-600 font-bold focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">Notes D17</label>
              <input
                type="text"
                placeholder="Notes D17"
                value={formData.payments.d17.notes}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, d17: { ...formData.payments.d17, notes: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* RIB BANCAIRE */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">🏛️ Versement / Virement RIB</span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">Nom Banque</label>
              <input
                type="text"
                placeholder="Nom Banque"
                value={formData.payments.rib.bankName}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, rib: { ...formData.payments.rib, bankName: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">Numéro RIB</label>
              <input
                type="text"
                placeholder="Numéro RIB"
                value={formData.payments.rib.ribNumber}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, rib: { ...formData.payments.rib, ribNumber: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-mono text-red-600 font-bold focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">À l'ordre de</label>
              <input
                type="text"
                placeholder="À l'ordre de"
                value={formData.payments.rib.accountOrder}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, rib: { ...formData.payments.rib, accountOrder: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* WAFACASH */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">⚡ Wafacash / Mandat Express</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">Destinataire</label>
              <input
                type="text"
                placeholder="Destinataire Wafacash"
                value={formData.payments.wafacash.recipient}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, wafacash: { ...formData.payments.wafacash, recipient: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">Instructions</label>
              <input
                type="text"
                placeholder="Instructions Wafacash"
                value={formData.payments.wafacash.instructions}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, wafacash: { ...formData.payments.wafacash, instructions: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* CASH */}
        <div className="p-4 bg-slate-50 rounded-xl space-y-3 border border-slate-200">
          <span className="font-bold text-xs text-slate-800 flex items-center gap-2">🏢 Paiement Espèces / Sur Place</span>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">Lieu / Adresse</label>
              <input
                type="text"
                placeholder="Lieu"
                value={formData.payments.cash.location}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, cash: { ...formData.payments.cash, location: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl font-semibold focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-slate-500 text-[11px] mb-1">Horaires</label>
              <input
                type="text"
                placeholder="Horaires"
                value={formData.payments.cash.hours}
                onChange={(e) => setFormData({
                  ...formData,
                  payments: { ...formData.payments, cash: { ...formData.payments.cash, hours: e.target.value } }
                })}
                className="w-full p-2.5 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-indigo-500/20 focus:outline-hidden"
              />
            </div>
          </div>
        </div>

        {/* Personnalisation visuelle dynamique des icônes de paiement */}
        <div className="pt-4 border-t border-slate-200">
          <AdminPaymentMethodsConfig />
        </div>
      </div>
    </div>
  );
};

interface UpdatesDashboardProps {
  onConfigSaved?: () => void;
}

export default function UpdatesDashboard({ onConfigSaved }: UpdatesDashboardProps) {
  const [targetInterface, setTargetInterface] = useState<"landing" | "student" | "settings" | "homeCards" | "howItWorksVideos">("landing");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  // Single Global unified siteConfiguration
  const [siteConfiguration, setSiteConfiguration] = useState<UnifiedSiteConfiguration | null>(null);

  // Accordion active keys
  const [activeAccordion, setActiveAccordion] = useState<string>("hero");

  // Load configuration
  useEffect(() => {
    fetchCMSConfig();
  }, []);

  const fetchCMSConfig = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/config/updates");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();

      const landing = data.landingPageConfig || {};
      const student = data.studentDashboardConfig || {};

      // Ensure all standard CMS sections are fully populated with robust defaults
      const unified: UnifiedSiteConfiguration = {
        landingPageConfig: {
          hero: {
            id: "hero",
            title: landing.hero?.title || "Bienvenue sur A-Zed Info",
            paragraph: landing.hero?.paragraph || "Votre plateforme académique d'excellence pour maîtriser les sciences informatiques et la programmation en un temps record.",
            linkUrl: landing.hero?.linkUrl || "#cours",
            linkText: landing.hero?.linkText || "Démarrer le Syllabus",
            icon: landing.hero?.icon || "Sparkles",
            fontFamily: landing.hero?.fontFamily || "Inter",
            fontSize: landing.hero?.fontSize || "text-4xl",
            textColor: landing.hero?.textColor || "#0F1E36",
            backgroundColor: landing.hero?.backgroundColor || "#FFFFFF",
            borderColor: landing.hero?.borderColor || "#E5E7EB",
            borderRadius: landing.hero?.borderRadius || "rounded-2xl",
            borderWidth: landing.hero?.borderWidth || "border-0",
            imageUrl: landing.hero?.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
            alignLeft: landing.hero?.alignLeft !== undefined ? landing.hero.alignLeft : true,
            orderWeight: landing.hero?.orderWeight !== undefined ? landing.hero.orderWeight : 1
          },
          features: {
            id: "features",
            title: landing.features?.title || "Fonctionnalités Clés",
            paragraph: landing.features?.paragraph || "Des modules de cours vidéos exclusifs, un bac à sable Python interactif et des annonces en temps réel pour ne rien rater.",
            linkUrl: landing.features?.linkUrl || "#features",
            linkText: landing.features?.linkText || "Explorer les Atouts",
            icon: landing.features?.icon || "Grid",
            fontFamily: landing.features?.fontFamily || "Inter",
            fontSize: landing.features?.fontSize || "text-2xl",
            textColor: landing.features?.textColor || "#0F1E36",
            backgroundColor: landing.features?.backgroundColor || "#F9FAFB",
            borderColor: landing.features?.borderColor || "#E5E7EB",
            borderRadius: landing.features?.borderRadius || "rounded-xl",
            borderWidth: landing.features?.borderWidth || "border-0",
            imageUrl: landing.features?.imageUrl || "",
            alignLeft: landing.features?.alignLeft !== undefined ? landing.features.alignLeft : true,
            orderWeight: landing.features?.orderWeight !== undefined ? landing.features.orderWeight : 2
          },
          testimonials: {
            id: "testimonials",
            title: landing.testimonials?.title || "Témoignages de nos étudiants",
            paragraph: landing.testimonials?.paragraph || '"A-Zed Info a transformé ma façon de réviser. Les vidéos sont claires et le bac à sable est ultra-pratique pour s\'entraîner !" - Amine B.',
            linkUrl: landing.testimonials?.linkUrl || "",
            linkText: landing.testimonials?.linkText || "",
            icon: landing.testimonials?.icon || "Heart",
            fontFamily: landing.testimonials?.fontFamily || "Inter",
            fontSize: landing.testimonials?.fontSize || "text-xl",
            textColor: landing.testimonials?.textColor || "#10B981",
            backgroundColor: landing.testimonials?.backgroundColor || "#E6F4EA",
            borderColor: landing.testimonials?.borderColor || "#A7F3D0",
            borderRadius: landing.testimonials?.borderRadius || "rounded-2xl",
            borderWidth: landing.testimonials?.borderWidth || "border",
            imageUrl: landing.testimonials?.imageUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400",
            alignLeft: landing.testimonials?.alignLeft !== undefined ? landing.testimonials.alignLeft : true,
            orderWeight: landing.testimonials?.orderWeight !== undefined ? landing.testimonials.orderWeight : 3
          },
          about: {
            id: "about",
            title: landing.about?.title || "Qui sommes-nous ?",
            paragraph: landing.about?.paragraph || "A-Zed Info est la première plateforme dédiée à la préparation complète de l'épreuve pratique et théorique d'informatique au baccalauréat tunisien. Notre méthode d'enseignement moderne allie rigueur scientifique et approche pédagogique axée sur la pratique immersive.",
            linkUrl: landing.about?.linkUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ",
            linkText: landing.about?.linkText || "Voir la Vidéo",
            icon: landing.about?.icon || "Palette",
            fontFamily: landing.about?.fontFamily || "Inter",
            fontSize: landing.about?.fontSize || "text-2xl",
            textColor: landing.about?.textColor || "#0047AB",
            backgroundColor: landing.about?.backgroundColor || "#F8FAFC",
            borderColor: landing.about?.borderColor || "#E2E8F0",
            borderRadius: landing.about?.borderRadius || "rounded-2xl",
            borderWidth: landing.about?.borderWidth || "border-0",
            imageUrl: landing.about?.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
            alignLeft: landing.about?.alignLeft !== undefined ? landing.about.alignLeft : true,
            orderWeight: landing.about?.orderWeight !== undefined ? landing.about.orderWeight : 4
          },
          whyChooseUs: {
            id: "whyChooseUs",
            title: landing.whyChooseUs?.title || "Pourquoi nous choisir ?",
            paragraph: landing.whyChooseUs?.paragraph || "Des milliers de bacheliers nous font confiance chaque année pour exceller dans leurs épreuves d'informatique théorique et pratique.",
            linkUrl: landing.whyChooseUs?.linkUrl || "",
            linkText: landing.whyChooseUs?.linkText || "",
            icon: landing.whyChooseUs?.icon || "Sparkles",
            fontFamily: landing.whyChooseUs?.fontFamily || "Inter",
            fontSize: landing.whyChooseUs?.fontSize || "text-2xl",
            textColor: landing.whyChooseUs?.textColor || "#FFFFFF",
            backgroundColor: landing.whyChooseUs?.backgroundColor || "#0F1E36",
            borderColor: landing.whyChooseUs?.borderColor || "#1E293B",
            borderRadius: landing.whyChooseUs?.borderRadius || "rounded-2xl",
            borderWidth: landing.whyChooseUs?.borderWidth || "border-0",
            imageUrl: landing.whyChooseUs?.imageUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400",
            alignLeft: landing.whyChooseUs?.alignLeft !== undefined ? landing.whyChooseUs.alignLeft : true,
            orderWeight: landing.whyChooseUs?.orderWeight !== undefined ? landing.whyChooseUs.orderWeight : 5
          },
          howItWorks: {
            id: "howItWorks",
            title: landing.howItWorks?.title || "Comment ça marche ?",
            paragraph: landing.howItWorks?.paragraph || "Une méthode d'apprentissage interactive et structurée pour vous guider pas à pas vers la réussite à l'examen national.",
            linkUrl: landing.howItWorks?.linkUrl || "",
            linkText: landing.howItWorks?.linkText || "",
            icon: landing.howItWorks?.icon || "CheckCircle",
            fontFamily: landing.howItWorks?.fontFamily || "Inter",
            fontSize: landing.howItWorks?.fontSize || "text-2xl",
            textColor: landing.howItWorks?.textColor || "#0F1E36",
            backgroundColor: landing.howItWorks?.backgroundColor || "#F8FAFC",
            borderColor: landing.howItWorks?.borderColor || "#E5E7EB",
            borderRadius: landing.howItWorks?.borderRadius || "rounded-2xl",
            borderWidth: landing.howItWorks?.borderWidth || "border-0",
            imageUrl: landing.howItWorks?.imageUrl || "",
            alignLeft: landing.howItWorks?.alignLeft !== undefined ? landing.howItWorks.alignLeft : true,
            orderWeight: landing.howItWorks?.orderWeight !== undefined ? landing.howItWorks.orderWeight : 6
          },
          packs: {
            id: "packs",
            title: landing.packs?.title || "Packs d'accès académiques",
            paragraph: landing.packs?.paragraph || "Sélectionnez le forfait adapté à votre année d'études pour débloquer l'intégralité du syllabus officiel tunisien, lives de révision et exercices pratiques.",
            linkUrl: landing.packs?.linkUrl || "#tarifs",
            linkText: landing.packs?.linkText || "Comparer les forfaits",
            icon: landing.packs?.icon || "Award",
            fontFamily: landing.packs?.fontFamily || "Inter",
            fontSize: landing.packs?.fontSize || "text-3xl",
            textColor: landing.packs?.textColor || "#0F1E36",
            backgroundColor: landing.packs?.backgroundColor || "#FFFFFF",
            borderColor: landing.packs?.borderColor || "#E5E7EB",
            borderRadius: landing.packs?.borderRadius || "rounded-3xl",
            borderWidth: landing.packs?.borderWidth || "border-0",
            imageUrl: landing.packs?.imageUrl || "",
            alignLeft: landing.packs?.alignLeft !== undefined ? landing.packs.alignLeft : true,
            orderWeight: landing.packs?.orderWeight !== undefined ? landing.packs.orderWeight : 7
          },
          footer: {
            id: "footer",
            title: landing.footer?.title || "Centre Le Plus - A-Zed Info",
            paragraph: landing.footer?.paragraph || "La plateforme académique de référence de M. Nabil Chaouch pour l'excellence informatique en Tunisie.",
            linkUrl: landing.footer?.linkUrl || "https://www.facebook.com/centreleplus",
            linkText: landing.footer?.linkText || "Nous suivre sur Facebook",
            icon: landing.footer?.icon || "Shield",
            fontFamily: landing.footer?.fontFamily || "Inter",
            fontSize: landing.footer?.fontSize || "text-sm",
            textColor: landing.footer?.textColor || "#9CA3AF",
            backgroundColor: landing.footer?.backgroundColor || "#0B1526",
            borderColor: landing.footer?.borderColor || "#1F2937",
            borderRadius: landing.footer?.borderRadius || "rounded-none",
            borderWidth: landing.footer?.borderWidth || "border-0",
            imageUrl: landing.footer?.imageUrl || "",
            alignLeft: landing.footer?.alignLeft !== undefined ? landing.footer.alignLeft : true,
            orderWeight: landing.footer?.orderWeight !== undefined ? landing.footer.orderWeight : 8
          }
        },
        studentDashboardConfig: {
          sidebar: {
            id: "sidebar",
            title: student.sidebar?.title || "Navigation A-Zed",
            paragraph: student.sidebar?.paragraph || "Menu de contrôle et de suivi personnalisé de vos modules trimestriels.",
            linkUrl: student.sidebar?.linkUrl || "",
            linkText: student.sidebar?.linkText || "",
            icon: student.sidebar?.icon || "Sliders",
            fontFamily: student.sidebar?.fontFamily || "Inter",
            fontSize: student.sidebar?.fontSize || "text-xs",
            textColor: student.sidebar?.textColor || "#FFFFFF",
            backgroundColor: student.sidebar?.backgroundColor || "#0F1E36",
            borderColor: student.sidebar?.borderColor || "#1E293B",
            borderRadius: student.sidebar?.borderRadius || "rounded-none",
            borderWidth: student.sidebar?.borderWidth || "border-0",
            imageUrl: student.sidebar?.imageUrl || "",
            alignLeft: student.sidebar?.alignLeft !== undefined ? student.sidebar.alignLeft : true,
            orderWeight: student.sidebar?.orderWeight !== undefined ? student.sidebar.orderWeight : 1
          },
          welcomeBanner: {
            id: "welcomeBanner",
            title: student.welcomeBanner?.title || "Prêt pour votre réussite ?",
            paragraph: student.welcomeBanner?.paragraph || "Retrouvez vos cours trimestriels, vos devoirs et vos ressources premium personnalisées directement dans votre espace.",
            linkUrl: student.welcomeBanner?.linkUrl || "#cours",
            linkText: student.welcomeBanner?.linkText || "Rejoindre la classe live",
            icon: student.welcomeBanner?.icon || "Sparkles",
            fontFamily: student.welcomeBanner?.fontFamily || "Inter",
            fontSize: student.welcomeBanner?.fontSize || "text-2xl",
            textColor: student.welcomeBanner?.textColor || "#FFFFFF",
            backgroundColor: student.welcomeBanner?.backgroundColor || "#10B981",
            borderColor: student.welcomeBanner?.borderColor || "#059669",
            borderRadius: student.welcomeBanner?.borderRadius || "rounded-2xl",
            borderWidth: student.welcomeBanner?.borderWidth || "border-0",
            imageUrl: student.welcomeBanner?.imageUrl || "",
            alignLeft: student.welcomeBanner?.alignLeft !== undefined ? student.welcomeBanner.alignLeft : true,
            orderWeight: student.welcomeBanner?.orderWeight !== undefined ? student.welcomeBanner.orderWeight : 2
          },
          newsSection: {
            id: "newsSection",
            title: student.newsSection?.title || "Dernières Actualités",
            paragraph: student.newsSection?.paragraph || "Le calendrier du troisième trimestre a été mis à jour. N'oubliez pas de consulter le planning des examens blancs.",
            linkUrl: student.newsSection?.linkUrl || "#calendrier",
            linkText: student.newsSection?.linkText || "Voir le planning",
            icon: student.newsSection?.icon || "Bell",
            fontFamily: student.newsSection?.fontFamily || "Inter",
            fontSize: student.newsSection?.fontSize || "text-base",
            textColor: student.newsSection?.textColor || "#1F2937",
            backgroundColor: student.newsSection?.backgroundColor || "#F3F4F6",
            borderColor: student.newsSection?.borderColor || "#E5E7EB",
            borderRadius: student.newsSection?.borderRadius || "rounded-xl",
            borderWidth: student.newsSection?.borderWidth || "border-0",
            imageUrl: student.newsSection?.imageUrl || "",
            alignLeft: student.newsSection?.alignLeft !== undefined ? student.newsSection.alignLeft : true,
            orderWeight: student.newsSection?.orderWeight !== undefined ? student.newsSection.orderWeight : 3
          },
          reminderPanel: {
            id: "reminderPanel",
            title: student.reminderPanel?.title || "Rappel de Devoirs",
            paragraph: student.reminderPanel?.paragraph || "Rendez votre projet d'algorithmique avant dimanche soir pour obtenir la validation de votre agent académique.",
            linkUrl: student.reminderPanel?.linkUrl || "#devoirs",
            linkText: student.reminderPanel?.linkText || "Accéder aux Exercices",
            icon: student.reminderPanel?.icon || "Clock",
            fontFamily: student.reminderPanel?.fontFamily || "Inter",
            fontSize: student.reminderPanel?.fontSize || "text-sm",
            textColor: student.reminderPanel?.textColor || "#B45309",
            backgroundColor: student.reminderPanel?.backgroundColor || "#FEF3C7",
            borderColor: student.reminderPanel?.borderColor || "#FCD34D",
            borderRadius: student.reminderPanel?.borderRadius || "rounded-xl",
            borderWidth: student.reminderPanel?.borderWidth || "border",
            imageUrl: student.reminderPanel?.imageUrl || "",
            alignLeft: student.reminderPanel?.alignLeft !== undefined ? student.reminderPanel.alignLeft : true,
            orderWeight: student.reminderPanel?.orderWeight !== undefined ? student.reminderPanel.orderWeight : 4
          },
          courseCard: {
            id: "courseCard",
            title: student.courseCard?.title || "La Récursivité : Principes mathématiques et Fonctions Récurrentes",
            paragraph: student.courseCard?.paragraph || "Apprenez à maîtriser la pile d'exécution, la condition d'arrêt et le passage d'arguments récurrents en Python.",
            linkUrl: student.courseCard?.linkUrl || "#play",
            linkText: student.courseCard?.linkText || "Démarrer le Cours",
            icon: student.courseCard?.icon || "Terminal",
            fontFamily: student.courseCard?.fontFamily || "Poppins",
            fontSize: student.courseCard?.fontSize || "text-base",
            textColor: student.courseCard?.textColor || "#0F1E36",
            backgroundColor: student.courseCard?.backgroundColor || "#FFFFFF",
            borderColor: student.courseCard?.borderColor || "#E5E7EB",
            borderRadius: student.courseCard?.borderRadius || "rounded-2xl",
            borderWidth: student.courseCard?.borderWidth || "border",
            imageUrl: student.courseCard?.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800",
            alignLeft: student.courseCard?.alignLeft !== undefined ? student.courseCard.alignLeft : true,
            orderWeight: student.courseCard?.orderWeight !== undefined ? student.courseCard.orderWeight : 5
          },
          correctionZone: {
            id: "correctionZone",
            title: student.correctionZone?.title || "Zone de Correction Interactive",
            paragraph: student.correctionZone?.paragraph || "Consultez les rapports détaillés de correction automatique et les annotations pédagogiques déposées par les correcteurs.",
            linkUrl: student.correctionZone?.linkUrl || "#correction",
            linkText: student.correctionZone?.linkText || "Consulter le corrigé",
            icon: student.correctionZone?.icon || "Code",
            fontFamily: student.correctionZone?.fontFamily || "Inter",
            fontSize: student.correctionZone?.fontSize || "text-lg",
            textColor: student.correctionZone?.textColor || "#0F1E36",
            backgroundColor: student.correctionZone?.backgroundColor || "#FFFFFF",
            borderColor: student.correctionZone?.borderColor || "#E5E7EB",
            borderRadius: student.correctionZone?.borderRadius || "rounded-2xl",
            borderWidth: student.correctionZone?.borderWidth || "border-2",
            imageUrl: student.correctionZone?.imageUrl || "",
            alignLeft: student.correctionZone?.alignLeft !== undefined ? student.correctionZone.alignLeft : true,
            orderWeight: student.correctionZone?.orderWeight !== undefined ? student.correctionZone.orderWeight : 6
          }
        }
      };

      setSiteConfiguration(unified);
      
      // Determine default accordion to open based on selected tab
      setActiveAccordion(targetInterface === "landing" ? "hero" : "welcomeBanner");

    } catch (err) {
      console.error("Error fetching updates config:", err);
      setStatusMsg({ type: "error", text: "Impossible de charger la configuration unifiée du CMS." });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (
    sectionType: "landing" | "student",
    blockKey: string,
    field: keyof CMSBlockConfig,
    value: any
  ) => {
    if (!siteConfiguration) return;

    const updatedConfig = { ...siteConfiguration };
    if (sectionType === "landing") {
      const configObj = updatedConfig.landingPageConfig[blockKey as keyof typeof updatedConfig.landingPageConfig];
      if (configObj) {
        (configObj as any)[field] = value;
      }
    } else {
      const configObj = updatedConfig.studentDashboardConfig[blockKey as keyof typeof updatedConfig.studentDashboardConfig];
      if (configObj) {
        (configObj as any)[field] = value;
      }
    }

    setSiteConfiguration(updatedConfig);
  };

  // Convert uploaded image to DataURL base64 format for inline dynamic display
  const handleImageUpload = (
    sectionType: "landing" | "student",
    blockKey: string,
    file: File | null
  ) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      handleFieldChange(sectionType, blockKey, "imageUrl", base64);
    };
    reader.readAsDataURL(file);
  };

  const handleSaveAll = async () => {
    if (!siteConfiguration) return;
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const res = await fetch("/api/admin/config/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          landingPageConfig: siteConfiguration.landingPageConfig,
          studentDashboardConfig: siteConfiguration.studentDashboardConfig
        })
      });
      if (!res.ok) throw new Error("Erreur serveur");
      const data = await res.json();

      setStatusMsg({
        type: "success",
        text: "✨ Configuration CMS sauvegardée avec succès ! Les modifications s'appliquent instantanément en temps réel."
      });

      // Dispatch custom event to notify App.tsx which will automatically refresh states across pages
      window.dispatchEvent(new Event("updates_config_changed"));

      if (onConfigSaved) onConfigSaved();
    } catch (err) {
      console.error("Error saving CMS configuration:", err);
      setStatusMsg({ type: "error", text: "Erreur lors de la persistance de l'objet de configuration JSON." });
    } finally {
      setIsSaving(false);
    }
  };

  const renderIcon = (iconName: string, className = "w-4 h-4") => {
    const found = CMS_ICONS.find(i => i.id === iconName);
    if (!found) return <Sparkles className={className} />;
    const IconComp = found.icon;
    return <IconComp className={className} />;
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-2xl border border-slate-100">
        <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Initialisation du Moteur CMS No-Code...
        </p>
      </div>
    );
  }

  const currentBlocks = targetInterface === "landing" 
    ? siteConfiguration?.landingPageConfig 
    : siteConfiguration?.studentDashboardConfig;

  // Render list of editable blocks based on targets
  const editableBlockKeys = targetInterface === "landing" 
    ? [
        { key: "hero", label: "1. Section Héro (Première Impression)", desc: "Configurez l'accueil et le grand message d'accroche." },
        { key: "features", label: "2. Fonctionnalités Clés (Nos Atouts)", desc: "Affichez la grille de compétences enseignées." },
        { key: "testimonials", label: "3. Témoignages & Preuve Sociale", desc: "Configurez l'évaluation d'un bachelier certifié." },
        { key: "about", label: "4. Section À Propos & Qui Sommes-Nous", desc: "Vidéo institutionnelle et texte de présentation." },
        { key: "whyChooseUs", label: "5. Pourquoi Nous Choisir", desc: "Arguments académiques percutants." },
        { key: "howItWorks", label: "6. Comment ça marche", desc: "La méthodologie pas à pas." },
        { key: "packs", label: "7. Catalogue Forfaits & Packs Tarifs", desc: "Grille d'abonnement au Centre Le Plus." },
        { key: "footer", label: "8. Pied de Page (Footer & Contacts)", desc: "Informations légales et liens réseaux sociaux." }
      ]
    : [
        { key: "sidebar", label: "1. Sidebar (Menu Latéral Élève)", desc: "Customisez le titre et le style du rail de navigation." },
        { key: "welcomeBanner", label: "2. Bannière de Bienvenue Élève", desc: "Bannière dynamique de félicitations ou d'encouragement." },
        { key: "newsSection", label: "3. Section Actualités & Annonces", desc: "Dernière annonce institutionnelle de l'administration." },
        { key: "reminderPanel", label: "4. Rappel Devoirs & Échéances", desc: "Panneau d'alerte pour les rendus de travaux à faire." },
        { key: "courseCard", label: "5. Carte de Cours : La Récursivité", desc: "DÉMO PRATIQUE : Personnalisation visuelle totale d'un cours !" },
        { key: "correctionZone", label: "6. Zone de Correction Autonome", desc: "Module de retour d'exercices et d'algorithmes Python." }
      ];

  // Currently selected block for preview
  const previewBlock = currentBlocks ? (currentBlocks as any)[activeAccordion] as CMSBlockConfig : null;

  return (
    <div className="space-y-6 text-[#1F2937]">
      {/* CMS Header & Intro */}
      <div className="bg-[#0F1E36] text-white p-6 rounded-2xl relative overflow-hidden shadow-sm">
        <div className="absolute right-0 top-0 -mt-6 -mr-6 w-32 h-32 bg-blue-500/10 rounded-full blur-2xl" />
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold uppercase tracking-wider rounded-md border border-blue-500/30 flex items-center gap-1">
                <Palette size={10} /> Moteur CMS No-Code Temps Réel
              </span>
            </div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2 mt-1">
              <span>Studio d'Édition Visuel A-Zed Info</span>
            </h2>
            <p className="text-slate-300 text-xs max-w-2xl">
              Modifiez l'intégralité du contenu éditorial, de la typographie, des palettes de couleurs et de la mise en page en direct sans aucune ligne de code.
            </p>
          </div>
        </div>
      </div>

      {/* Save Status Toast */}
      <AnimatePresence>
        {statusMsg && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-center justify-between gap-3 border text-xs font-bold shadow-xs ${
              statusMsg.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              {statusMsg.type === "success" ? <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0" /> : <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />}
              <span>{statusMsg.text}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setStatusMsg(null)}
              className="text-slate-400 hover:text-slate-700 font-bold px-2 py-1 text-sm"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Target Interface Selector Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-50 p-2 rounded-2xl border border-slate-100">
        <div className="flex bg-slate-200/60 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => {
              setTargetInterface("landing");
              setActiveAccordion("hero");
            }}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              targetInterface === "landing" 
                ? "bg-white text-[#0F1E36] shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            Page d'accueil (Landing Page)
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetInterface("student");
              setActiveAccordion("welcomeBanner");
            }}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              targetInterface === "student" 
                ? "bg-white text-[#0F1E36] shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Espace Étudiant (Espace Élève)
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetInterface("homeCards");
            }}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              targetInterface === "homeCards" 
                ? "bg-white text-purple-700 shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Layers className="w-3.5 h-3.5 text-purple-600" />
            Cartes d'Accueil (Tutoiement)
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetInterface("howItWorksVideos");
            }}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              targetInterface === "howItWorksVideos" 
                ? "bg-white text-red-600 shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Youtube className="w-3.5 h-3.5 text-red-600" />
            Vidéos Démo (Comment ça marche)
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetInterface("settings");
            }}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-2 ${
              targetInterface === "settings" 
                ? "bg-white text-emerald-700 shadow-sm" 
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            <Phone className="w-3.5 h-3.5 text-emerald-600" />
            Contacts & Modes de Règlement
          </button>
        </div>

        <div className="text-[10px] text-slate-500 font-medium">
          Rendu dynamique lié : <span className="font-mono bg-blue-50 text-blue-700 px-1.5 py-0.5 rounded border border-blue-100">{targetInterface === "landing" ? "landingPageConfig" : targetInterface === "student" ? "studentDashboardConfig" : targetInterface === "homeCards" ? "homeCards (DB)" : targetInterface === "howItWorksVideos" ? "howItWorksSteps (API)" : "siteSettings"}</span>
        </div>
      </div>

      {targetInterface === "howItWorksVideos" ? (
        <AdminHowItWorksManager />
      ) : targetInterface === "homeCards" ? (
        <AdminUpdateCardsView />
      ) : targetInterface === "settings" ? (
        <UpdatesAdminView />
      ) : (
        <>
          {/* Split Screen Panel: Editor (Left) & Real-time Visualizer (Right) */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: CONTROL PANEL */}
        <div className="xl:col-span-7 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden">
            <div className="px-5 py-3.5 bg-slate-50/50 border-b border-slate-100 flex items-center justify-between">
              <span className="text-xs font-extrabold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-slate-500" />
                Blocs éditoriaux de la plateforme
              </span>
              <span className="text-[10px] text-slate-400 font-semibold uppercase">Accordéons No-Code</span>
            </div>

            <div className="divide-y divide-slate-150">
              {editableBlockKeys.map(({ key, label, desc }) => {
                const isOpen = activeAccordion === key;
                const config = currentBlocks ? (currentBlocks as any)[key] as CMSBlockConfig : null;

                if (!config) return null;

                return (
                  <div key={key} className={`transition-colors duration-150 ${isOpen ? "bg-slate-50/20" : "bg-white"}`}>
                    
                    {/* ACCORDION TRIGGER */}
                    <button
                      type="button"
                      onClick={() => setActiveAccordion(isOpen ? "" : key)}
                      className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-slate-50/45 transition-colors focus:outline-none"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`p-1.5 rounded-lg transition-colors ${
                          isOpen ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-600"
                        }`}>
                          {renderIcon(config.icon, "w-4 h-4")}
                        </span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wide flex items-center gap-1.5">
                            {label}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">{desc}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isOpen ? (
                          <ChevronUp className="w-4 h-4 text-slate-500" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-slate-500" />
                        )}
                      </div>
                    </button>

                    {/* ACCORDION CONTENT */}
                    <AnimatePresence initial={false}>
                      {isOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden border-t border-slate-100 bg-slate-50/30"
                        >
                          <div className="p-5 md:p-6 space-y-5">
                            
                            {/* SECTION A: TEXT CONTENT */}
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                                <Type className="w-3.5 h-3.5" /> Contenu & Textes
                              </h5>

                              <div className="grid grid-cols-1 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Titre du bloc</label>
                                  <input
                                    type="text"
                                    value={config.title}
                                    onChange={(e) => handleFieldChange(targetInterface, key, "title", e.target.value)}
                                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800 font-medium"
                                    placeholder="Entrez le titre principal"
                                  />
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Paragraphe / Description</label>
                                  <textarea
                                    rows={3}
                                    value={config.paragraph}
                                    onChange={(e) => handleFieldChange(targetInterface, key, "paragraph", e.target.value)}
                                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800"
                                    placeholder="Saisissez le texte descriptif du bloc..."
                                  />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Texte du Bouton d'Action</label>
                                    <input
                                      type="text"
                                      value={config.linkText}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "linkText", e.target.value)}
                                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 text-slate-800"
                                      placeholder="Ex: Démarrer"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Lien / URL d'Ancre du Bouton</label>
                                    <input
                                      type="text"
                                      value={config.linkUrl}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "linkUrl", e.target.value)}
                                      className="w-full p-2.5 text-xs bg-white border border-slate-200 text-slate-800 font-mono rounded-lg focus:ring-1 focus:ring-blue-500"
                                      placeholder="Ex: #cours ou https://..."
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* SECTION B: TYPOGRAPHY */}
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                                <Sliders className="w-3.5 h-3.5" /> Typographie Avancée
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Famille de police (Font Family)</label>
                                  <select
                                    value={config.fontFamily}
                                    onChange={(e) => handleFieldChange(targetInterface, key, "fontFamily", e.target.value)}
                                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                                  >
                                    {FONT_FAMILIES.map(font => (
                                      <option key={font.id} value={font.id}>{font.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Taille du titre (Font Size)</label>
                                  <select
                                    value={config.fontSize}
                                    onChange={(e) => handleFieldChange(targetInterface, key, "fontSize", e.target.value)}
                                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                                  >
                                    {FONT_SIZES.map(sz => (
                                      <option key={sz.id} value={sz.id}>{sz.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* SECTION C: DESIGN & COLORS */}
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                                <Palette className="w-3.5 h-3.5" /> Design, Bordures & Couleurs
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Couleur Texte</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={config.textColor}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "textColor", e.target.value)}
                                      className="w-8 h-8 rounded border p-0.5 cursor-pointer bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={config.textColor}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "textColor", e.target.value)}
                                      className="flex-1 p-1 text-[10px] bg-white border border-slate-200 rounded text-center font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Arrière-Plan (Bg)</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={config.backgroundColor}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "backgroundColor", e.target.value)}
                                      className="w-8 h-8 rounded border p-0.5 cursor-pointer bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={config.backgroundColor}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "backgroundColor", e.target.value)}
                                      className="flex-1 p-1 text-[10px] bg-white border border-slate-200 rounded text-center font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Couleur Bordure</label>
                                  <div className="flex gap-2">
                                    <input
                                      type="color"
                                      value={config.borderColor}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "borderColor", e.target.value)}
                                      className="w-8 h-8 rounded border p-0.5 cursor-pointer bg-white"
                                    />
                                    <input
                                      type="text"
                                      value={config.borderColor}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "borderColor", e.target.value)}
                                      className="flex-1 p-1 text-[10px] bg-white border border-slate-200 rounded text-center font-mono"
                                    />
                                  </div>
                                </div>
                              </div>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Rayon d'angle (Border Radius)</label>
                                  <select
                                    value={config.borderRadius}
                                    onChange={(e) => handleFieldChange(targetInterface, key, "borderRadius", e.target.value)}
                                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 font-medium"
                                  >
                                    {BORDER_RADII.map(radius => (
                                      <option key={radius.id} value={radius.id}>{radius.name}</option>
                                    ))}
                                  </select>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Épaisseur bordure (Border Width)</label>
                                  <select
                                    value={config.borderWidth}
                                    onChange={(e) => handleFieldChange(targetInterface, key, "borderWidth", e.target.value)}
                                    className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 font-mono"
                                  >
                                    {BORDER_WIDTHS.map(width => (
                                      <option key={width.id} value={width.id}>{width.name}</option>
                                    ))}
                                  </select>
                                </div>
                              </div>
                            </div>

                            {/* SECTION D: MEDIAS & ICONS */}
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                                <ImageIcon className="w-3.5 h-3.5" /> Médias & Sélecteur d'Icône
                              </h5>

                              <div className="space-y-3.5">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1.5">Sélecteur d'Icône Visuel</label>
                                  <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                                    {CMS_ICONS.map(ico => {
                                      const isSel = config.icon === ico.id;
                                      const IconComponent = ico.icon;
                                      return (
                                        <button
                                          key={ico.id}
                                          type="button"
                                          onClick={() => handleFieldChange(targetInterface, key, "icon", ico.id)}
                                          className={`p-2 rounded-lg border text-xs flex flex-col items-center justify-center gap-1.5 transition-all ${
                                            isSel 
                                              ? "bg-blue-50 border-blue-500 text-blue-700 shadow-xs" 
                                              : "bg-white border-slate-200 text-slate-500 hover:bg-slate-100"
                                          }`}
                                          title={ico.name}
                                        >
                                          <IconComponent className="w-4 h-4 shrink-0" />
                                          <span className="text-[8px] font-bold truncate max-w-full select-none">{ico.name}</span>
                                        </button>
                                      );
                                    })}
                                  </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-center">
                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Téléverser une image de fond / d'illustration</label>
                                    <div className="relative">
                                      <input
                                        type="file"
                                        accept="image/*"
                                        id={`upload-${key}`}
                                        className="hidden"
                                        onChange={(e) => handleImageUpload(targetInterface, key, e.target.files ? e.target.files[0] : null)}
                                      />
                                      <label
                                        htmlFor={`upload-${key}`}
                                        className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-dashed border-slate-300 rounded-xl text-xs font-bold text-slate-600 bg-white cursor-pointer hover:bg-slate-50 transition-all shadow-2xs"
                                      >
                                        <ImageIcon className="w-4 h-4" />
                                        <span>Remplacer l'illustration</span>
                                      </label>
                                    </div>
                                  </div>

                                  <div>
                                    <label className="text-[10px] font-bold text-slate-500 block mb-1">Lien d'image direct (URL)</label>
                                    <input
                                      type="text"
                                      value={config.imageUrl}
                                      onChange={(e) => handleFieldChange(targetInterface, key, "imageUrl", e.target.value)}
                                      className="w-full p-2.5 text-xs bg-white border border-slate-200 text-slate-800 font-mono rounded-lg focus:ring-1 focus:ring-blue-500"
                                      placeholder="https://images.unsplash.com/..."
                                    />
                                  </div>
                                </div>
                              </div>
                            </div>

                            {/* SECTION E: POSITION & ALIGNMENT */}
                            <div className="space-y-4">
                              <h5 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest border-b border-slate-100 pb-1 flex items-center gap-1">
                                <Layout className="w-3.5 h-3.5" /> Mise en page & Alignement
                              </h5>

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Alignement horizontal</label>
                                  <div className="flex bg-slate-200/50 p-1 rounded-lg border border-slate-200/60">
                                    <button
                                      type="button"
                                      onClick={() => handleFieldChange(targetInterface, key, "alignLeft", true)}
                                      className={`flex-1 py-1.5 px-3 text-[10px] font-bold rounded-md transition-all ${
                                        config.alignLeft 
                                          ? "bg-white text-[#0F1E36] shadow-2xs" 
                                          : "text-slate-400 hover:text-slate-600"
                                      }`}
                                    >
                                      Gauche / Standard
                                    </button>
                                    <button
                                      type="button"
                                      onClick={() => handleFieldChange(targetInterface, key, "alignLeft", false)}
                                      className={`flex-1 py-1.5 px-3 text-[10px] font-bold rounded-md transition-all ${
                                        !config.alignLeft 
                                          ? "bg-white text-[#0F1E36] shadow-2xs" 
                                          : "text-slate-400 hover:text-slate-600"
                                      }`}
                                    >
                                      Droite / Inversé
                                    </button>
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] font-bold text-slate-500 block mb-1">Index d'Ordre d'affichage (Priorité)</label>
                                  <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={config.orderWeight}
                                    onChange={(e) => handleFieldChange(targetInterface, key, "orderWeight", parseInt(e.target.value) || 1)}
                                    className="w-full p-2 text-xs bg-white border border-slate-200 text-slate-800 font-mono rounded-lg focus:ring-1 focus:ring-blue-500"
                                  />
                                </div>
                              </div>
                            </div>

                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: REAL-TIME INTERACTIVE STICKY PREVIEW */}
        <div className="xl:col-span-5 sticky top-6 space-y-4">
          <div className="bg-slate-900 text-white rounded-2xl border border-slate-800 shadow-lg overflow-hidden">
            
            {/* PREVIEW STATUS BAR */}
            <div className="px-5 py-3 bg-slate-950 flex items-center justify-between border-b border-slate-800 select-none">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-300">
                  Aperçu Visuel Instantané (CMS Preview)
                </span>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-900/50">
                Live
              </span>
            </div>

            {/* PREVIEW RENDERING BOX */}
            <div className="p-6 bg-slate-950/40 min-h-[320px] flex items-center justify-center">
              {previewBlock ? (
                <div 
                  className={`w-full transition-all duration-300 shadow-sm overflow-hidden flex flex-col justify-between ${previewBlock.borderRadius}`}
                  style={{
                    backgroundColor: previewBlock.backgroundColor,
                    color: previewBlock.textColor,
                    borderColor: previewBlock.borderColor,
                    borderWidth: previewBlock.borderWidth === "border-0" ? "0px" : previewBlock.borderWidth === "border-2" ? "2px" : previewBlock.borderWidth === "border-4" ? "4px" : "1px",
                    fontFamily: previewBlock.fontFamily === "Inter" ? '"Inter", sans-serif' : previewBlock.fontFamily === "Poppins" ? '"Poppins", sans-serif' : previewBlock.fontFamily === "Roboto" ? '"Roboto", sans-serif' : previewBlock.fontFamily === "Playfair Display" ? '"Playfair Display", serif' : '"JetBrains Mono", monospace'
                  }}
                >
                  <div className="p-6 space-y-4">
                    {/* Visual icon representation */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="p-2 rounded-xl bg-black/5 dark:bg-white/5 flex items-center justify-center text-current border border-current/10 shrink-0">
                          {renderIcon(previewBlock.icon, "w-5 h-5")}
                        </span>
                        <span className="text-[9px] font-extrabold uppercase tracking-widest opacity-60">
                          Zone d'Aperçu : {activeAccordion}
                        </span>
                      </div>
                      
                      <span className="text-[9px] font-mono opacity-50">
                        Order Weight: {previewBlock.orderWeight}
                      </span>
                    </div>

                    {/* Image handling */}
                    {previewBlock.imageUrl && (
                      <div className="rounded-xl overflow-hidden aspect-video border border-current/10 relative shadow-inner bg-black/10">
                        <img 
                          src={previewBlock.imageUrl} 
                          className="w-full h-full object-cover" 
                          alt="Illustration" 
                          referrerPolicy="no-referrer"
                        />
                      </div>
                    )}

                    {/* Text alignment and font size applied dynamically */}
                    <div 
                      className="space-y-2.5"
                      style={{ 
                        textAlign: previewBlock.alignLeft ? "left" : "right"
                      }}
                    >
                      <h3 className={`font-black tracking-tight leading-tight ${previewBlock.fontSize}`}>
                        {previewBlock.title || "Titre Vide"}
                      </h3>
                      <p className="text-xs opacity-85 leading-relaxed font-normal">
                        {previewBlock.paragraph || "Aucun texte de description n'a été saisi pour ce bloc."}
                      </p>
                    </div>

                    {/* Action buttons with custom link text */}
                    {previewBlock.linkText && (
                      <div className={`pt-2 flex ${previewBlock.alignLeft ? "justify-start" : "justify-end"}`}>
                        <div className="px-4 py-2 bg-[#2563EB] text-white font-bold text-xs rounded-lg shadow-sm flex items-center gap-1 cursor-not-allowed select-none">
                          <span>{previewBlock.linkText}</span>
                          <ExternalLink size={12} />
                        </div>
                      </div>
                    )}

                  </div>
                </div>
              ) : (
                <div className="text-slate-500 text-xs text-center">
                  Sélectionnez une section ci-contre pour charger son aperçu visuel interactif.
                </div>
              )}
            </div>

            {/* LIVE PREVIEW BANNER ABOUT COURSE CARD (SPEC 3 REQUIREMENT) */}
            <div className="p-4 bg-slate-900 border-t border-slate-850">
              <span className="text-[9px] font-extrabold text-[#EF4444] uppercase tracking-wider block mb-2 animate-pulse">
                📌 DÉMONSTRATION DU RENDU DYNAMIQUE ÉLÈVE :
              </span>
              <p className="text-[11px] text-slate-400 leading-normal mb-3">
                Lorsque vous modifiez l'accordion <strong className="text-slate-200 uppercase font-bold">"Carte de Cours : La Récursivité"</strong> dans l'Espace Élève, la carte s'actualise en temps réel ci-dessus et sur l'espace d'apprentissage avec les exactes polices de caractères, dimensions, couleurs de fond et de bordure sélectionnées.
              </p>
              <div className="flex justify-between items-center bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                <span className="text-[10px] font-mono text-slate-400">Target Selector ID :</span>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-900 px-2 py-0.5 rounded">
                  courseCard.La_Recursivite
                </span>
              </div>
            </div>

          </div>

          {/* QUICK RESET AND CONFIGURATION UTILITIES */}
          <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs">
            <div className="space-y-0.5">
              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest block">Restaurer les valeurs d'usine</span>
              <p className="text-[10px] text-slate-500">Réinitialiser les styles du CMS par défaut.</p>
            </div>
            <button
              type="button"
              onClick={fetchCMSConfig}
              className="text-xs font-bold text-slate-600 hover:text-slate-900 border border-slate-200 hover:bg-slate-50 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <Undo className="w-3.5 h-3.5" />
              Réinitialiser
            </button>
          </div>

        </div>

      </div>

      {/* FIXED FOOTER SAVE ACTION CONTAINER (SPEC 4 REQUIREMENT) */}
      <div className="p-4 md:p-5 bg-white border border-slate-200 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="text-left space-y-0.5">
          <span className="text-xs font-bold text-slate-700 block uppercase tracking-wide">
            Prêt pour le déploiement global ?
          </span>
          <p className="text-[11px] text-slate-400">
            En cliquant sur Enregistrer, l'état complet unifié <strong className="font-mono text-slate-600 font-bold bg-slate-100 px-1 py-0.5 rounded border border-slate-150">siteConfiguration</strong> sera envoyé à l'API de persistance sécurisée.
          </p>
        </div>
        
        <div className="flex items-center gap-3 w-full md:w-auto justify-end">
          <button
            type="button"
            disabled={isSaving}
            onClick={handleSaveAll}
            className="w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-xs hover:shadow-md transition-all flex items-center justify-center gap-2.5 cursor-pointer transform hover:-translate-y-0.5 active:translate-y-0"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Persistance en cours...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </button>
        </div>
      </div>
        </>
      )}

    </div>
  );
}
