import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { AdvancedColorPicker } from "./AdvancedColorPicker";
import { 
  Sliders, 
  Palette, 
  Check, 
  Sparkles, 
  GraduationCap,
  Code2,
  BookOpen,
  ShieldCheck,
  Cpu,
  Zap,
  Award,
  Terminal,
  Video,
  Layers,
  Globe,
  CheckCircle2,
  Flame,
  Rocket,
  HelpCircle,
  Monitor,
  Tablet,
  Smartphone,
  Save, 
  CheckCircle, 
  ChevronDown, 
  ChevronUp, 
  Layout, 
  Loader2, 
  AlertCircle, 
  Undo,
  AlignLeft,
  AlignCenter,
  AlignRight,
  GripVertical,
  Maximize2,
  Eye,
  SlidersHorizontal,
  Box,
  Layers3,
  Sun
} from "lucide-react";

// Font pairings
export const FONT_FAMILIES = [
  { id: "Inter", name: "Inter (Sans-serif)" },
  { id: "Poppins", name: "Poppins (Moderne)" },
  { id: "Roboto", name: "Roboto (Technique)" },
  { id: "Playfair Display", name: "Playfair (Élégant)" },
  { id: "JetBrains Mono", name: "JetBrains Mono (Console)" },
  { id: "Space Grotesk", name: "Space Grotesk (Tech)" },
  { id: "Outfit", name: "Outfit (Stylisé)" },
  { id: "Montserrat", name: "Montserrat (Moderne)" },
  { id: "Lato", name: "Lato (Serein)" },
  { id: "Ubuntu", name: "Ubuntu (Humaniste)" }
];

export const FONT_SIZES = [
  { id: "text-xs", name: "Très Petit (text-xs)" },
  { id: "text-sm", name: "Petit (text-sm)" },
  { id: "text-base", name: "Normal (text-base)" },
  { id: "text-lg", name: "Grand (text-lg)" },
  { id: "text-xl", name: "Très Grand (text-xl)" },
  { id: "text-2xl", name: "Titre 3 (text-2xl)" },
  { id: "text-3xl", name: "Titre 2 (text-3xl)" },
  { id: "text-4xl", name: "Titre 1 (text-4xl)" }
];

export const BORDER_RADII = [
  { id: "rounded-none", name: "Carré (0px)" },
  { id: "rounded-md", name: "Doux (6px)" },
  { id: "rounded-lg", name: "Arrondi (8px)" },
  { id: "rounded-xl", name: "Moderne (12px)" },
  { id: "rounded-2xl", name: "Très Arrondi (16px)" },
  { id: "rounded-3xl", name: "Style Bulle (24px)" },
  { id: "rounded-full", name: "Pilule" }
];

export const BORDER_WIDTHS = [
  { id: "border-0", name: "Aucune (0px)" },
  { id: "border", name: "Fine (1px)" },
  { id: "border-2", name: "Moyenne (2px)" },
  { id: "border-4", name: "Épaisse (4px)" }
];

// ICON REGISTRY FOR PROFESSIONAL ICON SELECTOR
export const ICON_REGISTRY = [
  { id: "code", label: "Code & Dev", icon: Code2 },
  { id: "grad", label: "Éducation", icon: GraduationCap },
  { id: "cpu", label: "Informatique", icon: Cpu },
  { id: "sparkles", label: "Premium", icon: Sparkles },
  { id: "shield", label: "Sécurité", icon: ShieldCheck },
  { id: "zap", label: "Performance", icon: Zap },
  { id: "award", label: "Certificat", icon: Award },
  { id: "terminal", label: "Algorithme", icon: Terminal },
  { id: "video", label: "Live Stream", icon: Video },
  { id: "globe", label: "Réseaux", icon: Globe },
  { id: "rocket", label: "Lancement", icon: Rocket },
  { id: "layers", label: "Structure", icon: Layers },
  { id: "flame", label: "Tendance", icon: Flame },
  { id: "check", label: "Validation", icon: CheckCircle2 },
  { id: "help", label: "Support", icon: HelpCircle },
  { id: "book", label: "Savoir", icon: BookOpen }
];

export function renderBlockIcon(iconId?: string, className = "w-5 h-5") {
  if (!iconId) return <Sparkles className={className} />;
  const normalized = iconId.toLowerCase();
  const found = ICON_REGISTRY.find(item => item.id.toLowerCase() === normalized);
  if (found) {
    const IconComponent = found.icon;
    return <IconComponent className={className} />;
  }
  switch (iconId) {
    case "Sparkles": return <Sparkles className={className} />;
    case "Grid": return <Layers className={className} />;
    case "Heart": return <Flame className={className} />;
    case "Bell": return <Zap className={className} />;
    case "Clock": return <Award className={className} />;
    case "BookOpen": return <BookOpen className={className} />;
    case "Terminal": return <Terminal className={className} />;
    case "Palette": return <Sparkles className={className} />;
    default: return <Sparkles className={className} />;
  }
}

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
  alignLeft: boolean;
  orderWeight: number;
  ctaStyle?: "solid" | "outline" | "gradient";
  boxShadow?: "none" | "sm" | "md" | "xl";
  paddingSize?: "compact" | "normal" | "spacious";
  bgOpacity?: number; // 10, 25, 50, 100
}

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
    order?: string[];
  };
  studentDashboardConfig: {
    sidebar: CMSBlockConfig;
    welcomeBanner: CMSBlockConfig;
    newsSection: CMSBlockConfig;
    reminderPanel: CMSBlockConfig;
    courseCard: CMSBlockConfig;
    correctionZone: CMSBlockConfig;
  };
}

interface CmsManagerProps {
  onSaved?: () => void;
}

export default function CmsManager({ onSaved }: CmsManagerProps) {
  const [targetTab, setTargetTab] = useState<"landing" | "student">("landing");
  const [siteConfig, setSiteConfig] = useState<UnifiedSiteConfiguration | null>(null);
  const [activeBlockKey, setActiveBlockKey] = useState<string>("hero");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [alert, setAlert] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Viewport display mode state for live preview (Desktop, Tablet, Mobile)
  const [viewMode, setViewMode] = useState<"desktop" | "tablet" | "mobile">("desktop");
  
  // Accordion state for Step 3: Style, Boutons & Espacements
  const [isStyleAccordionOpen, setIsStyleAccordionOpen] = useState(true);

  // Auto-save session preservation every 30 seconds
  const autoSaveRef = useRef<UnifiedSiteConfiguration | null>(null);
  autoSaveRef.current = siteConfig;

  useEffect(() => {
    const interval = setInterval(async () => {
      if (!autoSaveRef.current) return;
      try {
        const res = await fetch("/api/admin/config/updates", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(autoSaveRef.current)
        });
        if (res.ok) {
          window.dispatchEvent(new Event("updates_config_changed"));
          setAlert({ type: "success", text: "Sauvegarde automatique effectuée (modifications sécurisées)." });
          setTimeout(() => setAlert(null), 3000);
        }
      } catch (err) {
        console.error("[CMS Auto-Save] Error running auto-save:", err);
      }
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  // Drag and drop state for block sorting
  const [draggedKey, setDraggedKey] = useState<string | null>(null);

  useEffect(() => {
    fetchConfig();
  }, []);

  const fetchConfig = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/config/updates");
      if (!res.ok) throw new Error("Erreur de chargement");
      const data = await res.json();
      setSiteConfig(data);
      
      // Select appropriate default block based on active tab
      setActiveBlockKey(targetTab === "landing" ? "hero" : "welcomeBanner");
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", text: "Impossible de charger la configuration CMS." });
    } finally {
      setLoading(false);
    }
  };

  const handleValueChange = (
    section: "landing" | "student",
    blockKey: string,
    field: keyof CMSBlockConfig,
    value: any
  ) => {
    if (!siteConfig) return;
    const next = JSON.parse(JSON.stringify(siteConfig));
    if (section === "landing") {
      const block = next.landingPageConfig[blockKey as keyof typeof next.landingPageConfig];
      if (block) (block as any)[field] = value;
    } else {
      const block = next.studentDashboardConfig[blockKey as keyof typeof next.studentDashboardConfig];
      if (block) (block as any)[field] = value;
    }
    setSiteConfig(next);
  };

  const handleFileUpload = (
    section: "landing" | "student",
    blockKey: string,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      handleValueChange(section, blockKey, "imageUrl", reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const saveConfiguration = async () => {
    if (!siteConfig) return;
    setSaving(true);
    setAlert(null);
    try {
      const res = await fetch("/api/admin/config/updates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(siteConfig)
      });
      if (!res.ok) throw new Error("Erreur serveur");
      
      setAlert({
        type: "success",
        text: "✨ Configuration CMS enregistrée avec succès ! Les modifications s'appliquent instantanément."
      });
      
      window.dispatchEvent(new Event("updates_config_changed"));
      if (onSaved) onSaved();
    } catch (err) {
      console.error(err);
      setAlert({ type: "error", text: "Échec de l'enregistrement de la configuration." });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-24 space-y-4 bg-white rounded-2xl border border-slate-100">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
        <p className="text-xs font-bold text-slate-500 uppercase tracking-widest animate-pulse">
          Chargement du Studio Visual CMS...
        </p>
      </div>
    );
  }

  const currentGroup = targetTab === "landing" 
    ? siteConfig?.landingPageConfig 
    : siteConfig?.studentDashboardConfig;

  const currentBlock = currentGroup ? (currentGroup as any)[activeBlockKey] as CMSBlockConfig : null;

  const defaultLandingOrder = ["hero", "features", "testimonials", "about", "whyChooseUs", "howItWorks"];
  const currentLandingOrder = (siteConfig?.landingPageConfig as any)?.order || defaultLandingOrder;
  const currentLandingOrderUnique = Array.from(new Set([...currentLandingOrder, ...defaultLandingOrder]));

  const landingBlocksMap: Record<string, { key: string; label: string; desc: string }> = {
    hero: { key: "hero", label: "Héros Principal", desc: "Titre d'accueil et accroche" },
    features: { key: "features", label: "Fonctionnalités", desc: "Grille d'atouts de formation" },
    testimonials: { key: "testimonials", label: "Témoignages", desc: "Avis des anciens élèves" },
    about: { key: "about", label: "À Propos", desc: "Vidéo et texte fondateur" },
    whyChooseUs: { key: "whyChooseUs", label: "Pourquoi Nous Choisir", desc: "Points forts" },
    howItWorks: { key: "howItWorks", label: "Comment ça marche", desc: "Méthode pas-à-pas" }
  };

  const landingBlocks = currentLandingOrderUnique.map((k: string) => landingBlocksMap[k]).filter(Boolean);

  const studentBlocks = [
    { key: "welcomeBanner", label: "Bannière de Bienvenue", desc: "Bannière supérieure d'accueil" },
    { key: "newsSection", label: "Annonces", desc: "Section actualités défilante" },
    { key: "reminderPanel", label: "Rappels", desc: "Boîte de rappels des devoirs" },
    { key: "courseCard", label: "Carte Récursivité (Démo)", desc: "Style dynamique du cours" }
  ];

  const activeBlocksList = targetTab === "landing" ? landingBlocks : studentBlocks;

  const handleDragStart = (e: React.DragEvent, key: string) => {
    setDraggedKey(key);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, targetKey: string) => {
    e.preventDefault();
    if (!draggedKey || draggedKey === targetKey) return;

    const order = [...currentLandingOrderUnique];
    const draggedIdx = order.indexOf(draggedKey);
    const targetIdx = order.indexOf(targetKey);
    if (draggedIdx === -1 || targetIdx === -1) return;

    order.splice(draggedIdx, 1);
    order.splice(targetIdx, 0, draggedKey);

    if (siteConfig) {
      setSiteConfig({
        ...siteConfig,
        landingPageConfig: {
          ...siteConfig.landingPageConfig,
          order: order
        }
      });
    }
  };

  const handleDragEnd = () => {
    setDraggedKey(null);
  };

  // Helper values for current block styling options
  const selectedIconId = currentBlock?.selected_icon || currentBlock?.icon || "sparkles";
  const currentCtaStyle = currentBlock?.ctaStyle || "solid";
  const currentBoxShadow = currentBlock?.boxShadow || "md";
  const currentPaddingSize = currentBlock?.paddingSize || "normal";
  const currentBgOpacity = currentBlock?.bgOpacity !== undefined ? currentBlock?.bgOpacity : 100;

  // Map shadow to tailwind classes
  const shadowClass = currentBoxShadow === "none" 
    ? "shadow-none" 
    : currentBoxShadow === "sm" 
      ? "shadow-xs" 
      : currentBoxShadow === "xl" 
        ? "shadow-2xl" 
        : "shadow-md";

  // Map padding to tailwind classes
  const paddingClass = currentPaddingSize === "compact" 
    ? "py-4 px-4" 
    : currentPaddingSize === "spacious" 
      ? "py-10 px-6" 
      : "py-7 px-5";

  // Map bg opacity
  const opacityValue = currentBgOpacity / 100;

  // Build dynamic inline style object for current element live preview
  const previewCardStyle: React.CSSProperties = currentBlock ? {
    color: currentBlock.textColor || "#0f172a",
    backgroundColor: currentBlock.backgroundColor || "#ffffff",
    borderColor: currentBlock.borderColor || "#e2e8f0",
    fontFamily: currentBlock.fontFamily || "Inter, sans-serif",
    borderWidth: currentBlock.borderWidth === "border-0" ? "0px" : currentBlock.borderWidth === "border-2" ? "2px" : currentBlock.borderWidth === "border-4" ? "4px" : "1px",
    borderRadius: currentBlock.borderRadius === "rounded-none" ? "0px" : currentBlock.borderRadius === "rounded-md" ? "6px" : currentBlock.borderRadius === "rounded-lg" ? "8px" : currentBlock.borderRadius === "rounded-xl" ? "12px" : currentBlock.borderRadius === "rounded-2xl" ? "16px" : currentBlock.borderRadius === "rounded-3xl" ? "24px" : "9999px",
  } : {};

  return (
    <div className="space-y-6 text-[#1F2937]">
      {/* Alert Messaging */}
      <AnimatePresence>
        {alert && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className={`p-4 rounded-xl flex items-center justify-between gap-3 border text-xs font-semibold shadow-xs ${
              alert.type === "success" 
                ? "bg-emerald-50 text-emerald-800 border-emerald-200" 
                : "bg-red-50 text-red-800 border-red-200"
            }`}
          >
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{alert.text}</span>
            </div>
            <button 
              type="button" 
              onClick={() => setAlert(null)}
              className="text-slate-400 hover:text-slate-700 font-bold px-1.5 cursor-pointer"
            >
              ✕
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Selector Tabs & Status Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-2.5 rounded-2xl border border-slate-800 text-white shadow-sm">
        <div className="flex bg-slate-800/80 p-1 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => {
              setTargetTab("landing");
              setActiveBlockKey("hero");
            }}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              targetTab === "landing" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <Layout className="w-3.5 h-3.5" />
            Page d'accueil (Landing Page)
          </button>
          <button
            type="button"
            onClick={() => {
              setTargetTab("student");
              setActiveBlockKey("welcomeBanner");
            }}
            className={`py-2 px-4 text-xs font-bold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              targetTab === "student" ? "bg-emerald-600 text-white shadow-xs" : "text-slate-400 hover:text-white"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            Espace Élève (Student Dashboard)
          </button>
        </div>
        <div className="flex items-center gap-3 px-3 py-1">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping shrink-0" />
          <span className="text-[10px] text-slate-300 font-mono font-bold uppercase tracking-wider">
            STUDIO CMS VISUEL • APERÇU TEMPS RÉEL
          </span>
        </div>
      </div>

      {/* MAIN 12-COLUMN LAYOUT: EDITING CONTROL FORM (6-7 COLS) & STICKY LIVE PREVIEW (5-6 COLS) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* LEFT COLUMN: BLOCK LIST & FORM EDITING CONTROLS (6 COLS) */}
        <div className="lg:col-span-6 space-y-5">
          
          {/* AVAILABLE BLOCKS SELECTION DRAWER */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Box className="w-4 h-4 text-emerald-600" />
                Blocs Disponibles
              </span>
              <span className="text-[10px] text-slate-400 font-medium">
                {targetTab === "landing" ? "Glissez pour réorganiser l'ordre" : "Sélectionnez un composant"}
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-56 overflow-y-auto">
              {activeBlocksList.map((blk) => {
                const isActive = activeBlockKey === blk.key;
                const isDraggingThis = draggedKey === blk.key;
                return (
                  <div
                    key={blk.key}
                    draggable={targetTab === "landing"}
                    onDragStart={(e) => handleDragStart(e, blk.key)}
                    onDragOver={(e) => handleDragOver(e, blk.key)}
                    onDragEnd={handleDragEnd}
                    className={`flex items-center gap-2 p-3 transition-all ${
                      isActive ? "bg-emerald-50/70 border-l-4 border-emerald-600 font-bold" : "hover:bg-slate-50"
                    } ${isDraggingThis ? "opacity-30 bg-slate-100" : ""} ${
                      targetTab === "landing" ? "cursor-grab active:cursor-grabbing" : ""
                    }`}
                  >
                    {targetTab === "landing" && (
                      <div className="text-slate-400 hover:text-slate-600 cursor-grab shrink-0 p-1">
                        <GripVertical className="w-4 h-4" />
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => setActiveBlockKey(blk.key)}
                      className="flex-1 text-left flex flex-col cursor-pointer"
                    >
                      <span className="text-xs font-bold text-slate-800 tracking-tight flex items-center gap-1.5">
                        {blk.label}
                        {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                      </span>
                      <span className="text-[10px] text-slate-400 mt-0.5">
                        {blk.desc}
                      </span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* EDITING FORM FOR CURRENT BLOCK */}
          {currentBlock && (
            <div className="bg-white rounded-2xl border border-slate-200 p-5 space-y-6 shadow-xs">
              
              {/* SECTION 1: TEXTS & CONTENT */}
              <div>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-3 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <span className="text-emerald-600">✍️</span> TEXTES & CONTENUS DU BLOC
                </span>

                <div className="space-y-4">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Titre Principal
                    </label>
                    <input
                      type="text"
                      value={currentBlock.title || ""}
                      onChange={(e) => handleValueChange(targetTab, activeBlockKey, "title", e.target.value)}
                      placeholder="Saisissez le titre..."
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 font-semibold outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                      Paragraphe Descriptif
                    </label>
                    <textarea
                      rows={3}
                      value={currentBlock.paragraph || ""}
                      onChange={(e) => handleValueChange(targetTab, activeBlockKey, "paragraph", e.target.value)}
                      placeholder="Saisissez la description du bloc..."
                      className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 text-slate-900 outline-none transition-all shadow-2xs"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Texte du Bouton CTA
                      </label>
                      <input
                        type="text"
                        value={currentBlock.linkText || ""}
                        onChange={(e) => handleValueChange(targetTab, activeBlockKey, "linkText", e.target.value)}
                        placeholder="Ex: S'inscrire"
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800 outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">
                        Lien de Redirection
                      </label>
                      <input
                        type="text"
                        value={currentBlock.linkUrl || ""}
                        onChange={(e) => handleValueChange(targetTab, activeBlockKey, "linkUrl", e.target.value)}
                        placeholder="Ex: /#cours ou https://..."
                        className="w-full p-2.5 text-xs bg-white border border-slate-200 text-slate-800 font-mono rounded-xl focus:ring-2 focus:ring-emerald-500 outline-none"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* STEP 2: PROFESSIONAL ICON SELECTOR (DYNAMIC LUCIDE GRID) */}
              <div>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-2 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-emerald-600" />
                  SÉLECTEUR D'ICÔNES PROFESSIONNELLES (LUCIDE REACT)
                </span>
                <p className="text-[11px] text-slate-500 mb-2.5">
                  Choisissez une icône vectorielle thématique adaptée aux domaines de l'informatique, des études et du baccalauréat.
                </p>

                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  {ICON_REGISTRY.map(({ id, label, icon: IconComponent }) => {
                    const isSelected = selectedIconId.toLowerCase() === id.toLowerCase();
                    return (
                      <button
                        key={id}
                        type="button"
                        onClick={() => {
                          handleValueChange(targetTab, activeBlockKey, "selected_icon", id);
                          handleValueChange(targetTab, activeBlockKey, "icon", id);
                        }}
                        className={`flex flex-col items-center justify-center p-2.5 rounded-lg border transition cursor-pointer ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                            : "bg-white text-slate-600 border-slate-200 hover:border-emerald-400 hover:bg-emerald-50"
                        }`}
                        title={label}
                      >
                        <IconComponent className="w-5 h-5 mb-1 shrink-0" />
                        <span className="text-[10px] font-medium truncate w-full text-center">{label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* SECTION 3: COLOR PICKERS WITH PRESETS AND INTERACTIVE WHEEL */}
              <div>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-3 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <Palette className="w-4 h-4 text-emerald-600" />
                  DESIGN, BORDURES & COULEURS
                </span>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-white border border-slate-200 rounded-2xl shadow-2xs">
                  <AdvancedColorPicker
                    label="Couleur Texte"
                    value={currentBlock.textColor || '#0F172A'}
                    onChange={(color) => handleValueChange(targetTab, activeBlockKey, 'textColor', color)}
                  />
                  <AdvancedColorPicker
                    label="Arrière-Plan (Bg)"
                    value={currentBlock.backgroundColor || '#10B981'}
                    onChange={(color) => handleValueChange(targetTab, activeBlockKey, 'backgroundColor', color)}
                  />
                  <AdvancedColorPicker
                    label="Couleur Bordure"
                    value={currentBlock.borderColor || '#E2E8F0'}
                    onChange={(color) => handleValueChange(targetTab, activeBlockKey, 'borderColor', color)}
                  />
                </div>
              </div>

              {/* SECTION 4: STRUCTURE, FONTS & BORDERS */}
              <div>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-3 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  <SlidersHorizontal className="w-4 h-4 text-emerald-600" />
                  POLICES, BORDURES & ALIGNEMENT
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Famille de Police</label>
                    <select
                      value={currentBlock.fontFamily || "Inter"}
                      onChange={(e) => handleValueChange(targetTab, activeBlockKey, "fontFamily", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                    >
                      {FONT_FAMILIES.map(font => (
                        <option key={font.id} value={font.id}>{font.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Taille du Titre</label>
                    <select
                      value={currentBlock.fontSize || "text-xl"}
                      onChange={(e) => handleValueChange(targetTab, activeBlockKey, "fontSize", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono cursor-pointer"
                    >
                      {FONT_SIZES.map(sz => (
                        <option key={sz.id} value={sz.id}>{sz.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Arrondi des Coins</label>
                    <select
                      value={currentBlock.borderRadius || "rounded-xl"}
                      onChange={(e) => handleValueChange(targetTab, activeBlockKey, "borderRadius", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-medium cursor-pointer"
                    >
                      {BORDER_RADII.map(radius => (
                        <option key={radius.id} value={radius.id}>{radius.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1">Épaisseur Bordure</label>
                    <select
                      value={currentBlock.borderWidth || "border"}
                      onChange={(e) => handleValueChange(targetTab, activeBlockKey, "borderWidth", e.target.value)}
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono cursor-pointer"
                    >
                      {BORDER_WIDTHS.map(width => (
                        <option key={width.id} value={width.id}>{width.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mt-3 flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                  <span className="text-[11px] font-bold text-slate-700">Alignement du Contenu</span>
                  <div className="flex gap-1 bg-white p-1 rounded-lg border border-slate-200">
                    <button
                      type="button"
                      onClick={() => handleValueChange(targetTab, activeBlockKey, "alignLeft", true)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        currentBlock.alignLeft ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <AlignLeft className="w-3.5 h-3.5" />
                      Gauche
                    </button>
                    <button
                      type="button"
                      onClick={() => handleValueChange(targetTab, activeBlockKey, "alignLeft", false)}
                      className={`px-3 py-1.5 text-[10px] font-bold rounded-md transition-all flex items-center gap-1 cursor-pointer ${
                        !currentBlock.alignLeft ? "bg-emerald-600 text-white" : "text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <AlignCenter className="w-3.5 h-3.5" />
                      Centré
                    </button>
                  </div>
                </div>
              </div>

              {/* STEP 3: ADVANCED EDITING OPTIONS (STYLE, BOUTONS & ESPACEMENTS ACCORDION) */}
              <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-50/50">
                <button
                  type="button"
                  onClick={() => setIsStyleAccordionOpen(!isStyleAccordionOpen)}
                  className="w-full p-3.5 bg-slate-100/80 hover:bg-slate-100 flex items-center justify-between font-black text-xs text-slate-800 tracking-wide cursor-pointer transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-base">🎨</span> STYLE, BOUTONS & ESPACEMENTS AVANCÉS
                  </span>
                  {isStyleAccordionOpen ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
                </button>

                <AnimatePresence>
                  {isStyleAccordionOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="p-4 space-y-4 bg-white border-t border-slate-200"
                    >
                      {/* STYLE DU BOUTON CTA */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                          Style du Bouton CTA
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => handleValueChange(targetTab, activeBlockKey, "ctaStyle", "solid")}
                            className={`py-2 px-3 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                              currentCtaStyle === "solid"
                                ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Solide (Plein)
                          </button>
                          <button
                            type="button"
                            onClick={() => handleValueChange(targetTab, activeBlockKey, "ctaStyle", "outline")}
                            className={`py-2 px-3 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                              currentCtaStyle === "outline"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-600 font-extrabold"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Contour
                          </button>
                          <button
                            type="button"
                            onClick={() => handleValueChange(targetTab, activeBlockKey, "ctaStyle", "gradient")}
                            className={`py-2 px-3 text-[11px] font-bold rounded-lg border text-center transition cursor-pointer ${
                              currentCtaStyle === "gradient"
                                ? "bg-gradient-to-r from-emerald-600 to-blue-600 text-white border-transparent shadow-xs"
                                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                            }`}
                          >
                            Dégradé
                          </button>
                        </div>
                      </div>

                      {/* EFFET D'OMBRE DES CARTES (BOX SHADOW) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                          Effet d'Ombre de Carte (Box Shadow)
                        </label>
                        <div className="grid grid-cols-4 gap-2">
                          {[
                            { id: "none", label: "Aucune" },
                            { id: "sm", label: "Discrète" },
                            { id: "md", label: "Moyenne" },
                            { id: "xl", label: "Prononcée" }
                          ].map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleValueChange(targetTab, activeBlockKey, "boxShadow", item.id)}
                              className={`py-2 px-2 text-[10px] font-bold rounded-lg border text-center transition cursor-pointer ${
                                currentBoxShadow === item.id
                                  ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* MARGE INTERNE DE SECTION (PADDING) */}
                      <div>
                        <label className="text-[10px] font-bold text-slate-600 uppercase block mb-1.5">
                          Marge Interne (Padding Section)
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: "compact", label: "Compact (py-6)" },
                            { id: "normal", label: "Normal (py-12)" },
                            { id: "spacious", label: "Aéré (py-20)" }
                          ].map(item => (
                            <button
                              key={item.id}
                              type="button"
                              onClick={() => handleValueChange(targetTab, activeBlockKey, "paddingSize", item.id)}
                              className={`py-2 px-2 text-[10px] font-bold rounded-lg border text-center transition cursor-pointer ${
                                currentPaddingSize === item.id
                                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* OPACITÉ DE L'IMAGE DE FOND */}
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className="text-[10px] font-bold text-slate-600 uppercase">
                            Opacité de l'Image de Fond
                          </label>
                          <span className="text-[11px] font-mono font-bold text-emerald-600">
                            {currentBgOpacity}%
                          </span>
                        </div>
                        <div className="grid grid-cols-4 gap-2">
                          {[10, 25, 50, 100].map(val => (
                            <button
                              key={val}
                              type="button"
                              onClick={() => handleValueChange(targetTab, activeBlockKey, "bgOpacity", val)}
                              className={`py-1.5 text-[10px] font-bold rounded-lg border text-center transition cursor-pointer ${
                                currentBgOpacity === val
                                  ? "bg-emerald-600 text-white border-emerald-600"
                                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                              }`}
                            >
                              {val}%
                            </button>
                          ))}
                        </div>
                      </div>

                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* SECTION 5: IMAGE URL & UPLOAD */}
              <div>
                <span className="text-[11px] font-black text-slate-900 uppercase tracking-wider block mb-3 border-b border-slate-200 pb-1.5 flex items-center gap-1.5">
                  🖼️ IMAGE & VISUEL DE FOND
                </span>

                <div className="space-y-2.5">
                  <input
                    type="text"
                    value={currentBlock.imageUrl || ""}
                    onChange={(e) => handleValueChange(targetTab, activeBlockKey, "imageUrl", e.target.value)}
                    placeholder="Lien d'image (HTTPS / Unsplash / PNG)..."
                    className="w-full p-2.5 text-xs bg-white border border-slate-200 rounded-xl focus:ring-1 focus:ring-emerald-500 font-mono text-slate-700 outline-none"
                  />
                  
                  <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-600">Téléverser une image locale</span>
                    <label className="px-3.5 py-1.5 bg-white border border-slate-200 hover:bg-slate-100 text-slate-800 text-[11px] font-extrabold rounded-lg cursor-pointer transition-all shadow-2xs">
                      Parcourir...
                      <input
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={(e) => handleFileUpload(targetTab, activeBlockKey, e)}
                      />
                    </label>
                  </div>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* RIGHT COLUMN: STICKY LIVE PREVIEW WITH VIEWPORT TOGGLES (6 COLS) */}
        <div className="lg:col-span-6 space-y-4 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] flex flex-col">
          
          {/* STEP 1: SCREEN VIEWPORT SWITCHER HEADER */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-3 text-white shadow-md flex flex-wrap items-center justify-between gap-3 shrink-0">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-emerald-400 animate-pulse" />
              <span className="text-xs font-black uppercase tracking-wide">
                Aperçu Réactif
              </span>
            </div>

            {/* Viewport Toggles */}
            <div className="flex bg-slate-800 p-1 rounded-xl gap-1 border border-slate-700">
              <button
                type="button"
                onClick={() => setViewMode("desktop")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "desktop" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-400 hover:text-white"
                }`}
                title="Mode Écran Large (Desktop 1080p)"
              >
                <Monitor className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Desktop</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("tablet")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "tablet" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-400 hover:text-white"
                }`}
                title="Mode Tablette (640px)"
              >
                <Tablet className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Tablette</span>
              </button>
              <button
                type="button"
                onClick={() => setViewMode("mobile")}
                className={`px-3 py-1.5 text-[10px] font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  viewMode === "mobile" ? "bg-emerald-600 text-white shadow-2xs" : "text-slate-400 hover:text-white"
                }`}
                title="Mode Smartphone Mobile (380px)"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Mobile</span>
              </button>
            </div>
          </div>

          {/* REALISTIC DEVICE FRAME & SCROLLABLE LIVE PREVIEW CANVAS */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex-1 flex flex-col min-h-0">
            
            {/* Device Bar Header */}
            <div className="bg-slate-950 px-4 py-2 border-b border-slate-800 flex items-center justify-between text-[10px] font-mono text-slate-400 shrink-0">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-yellow-500/80 inline-block" />
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80 inline-block" />
                <span className="ml-2 font-bold text-slate-300">
                  {viewMode === "desktop" ? "🖥️ Desktop 1080p" : viewMode === "tablet" ? "📑 Tablette 768px" : "📱 Mobile 375px"}
                </span>
              </div>
              <span className="text-slate-500 hidden sm:inline">https://azed.info/live-preview</span>
            </div>

            {/* Scrollable Preview Canvas Container */}
            <div className="p-4 overflow-y-auto max-h-[calc(100vh-14rem)] flex-1 space-y-4 bg-slate-950/60 custom-scrollbar">
              
              {currentBlock ? (
                <div 
                  className={`transition-all duration-300 ${
                    viewMode === "desktop" 
                      ? "w-full" 
                      : viewMode === "tablet" 
                        ? "max-w-[640px] mx-auto" 
                        : "max-w-[380px] mx-auto"
                  }`}
                >
                  <div 
                    className={`relative overflow-hidden transition-all duration-300 ${paddingClass} ${shadowClass}`}
                    style={previewCardStyle}
                  >
                    {/* Background Image with Opacity */}
                    {currentBlock.imageUrl && (
                      <div className="absolute inset-0 pointer-events-none overflow-hidden">
                        <img 
                          src={currentBlock.imageUrl} 
                          alt="Background" 
                          className="w-full h-full object-cover"
                          style={{ opacity: opacityValue }}
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-0 bg-slate-950/20" />
                      </div>
                    )}

                    <div className={`relative z-10 ${currentBlock.alignLeft ? "text-left" : "text-center"}`}>
                      
                      {/* ICON DISPLAY */}
                      <div className={`mb-3 inline-flex items-center justify-center p-3 rounded-2xl ${
                        currentCtaStyle === "gradient" ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-800"
                      }`}>
                        {renderBlockIcon(selectedIconId, "w-6 h-6")}
                      </div>

                      {/* TITLE */}
                      <h3 
                        className={`font-black tracking-tight mb-2.5 leading-tight ${currentBlock.fontSize || "text-xl"}`}
                        style={{ fontFamily: currentBlock.fontFamily || "Inter, sans-serif" }}
                      >
                        {currentBlock.title || "Titre du bloc"}
                      </h3>

                      {/* PARAGRAPH */}
                      <p className="text-xs opacity-90 leading-relaxed max-w-xl mb-4 font-normal">
                        {currentBlock.paragraph || "Description détaillée du bloc sélectionné..."}
                      </p>

                      {/* CTA BUTTON */}
                      {currentBlock.linkText && (
                        <div className={currentBlock.alignLeft ? "text-left" : "text-center"}>
                          <span className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs ${
                            currentCtaStyle === "gradient"
                              ? "bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-600 text-white shadow-md border-0"
                              : currentCtaStyle === "outline"
                                ? "border-2 border-current bg-transparent font-black"
                                : "bg-emerald-600 text-white shadow-sm"
                          }`}>
                            {currentBlock.linkText}
                          </span>
                        </div>
                      )}

                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-16 text-center text-slate-500 text-xs font-medium">
                  Aucun bloc sélectionné.
                </div>
              )}

            </div>

            {/* SAVE / CANCEL BUTTONS AT FOOTER OF PREVIEW COLUMN */}
            <div className="p-3 bg-slate-950 border-t border-slate-800 flex items-center gap-2 shrink-0">
              <button
                type="button"
                disabled={saving}
                onClick={saveConfiguration}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] disabled:opacity-50 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                {saving ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sauvegarde...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4" />
                    <span>Enregistrer Tout</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={fetchConfig}
                className="px-4 py-3 text-xs font-bold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Annuler les modifications"
              >
                <Undo className="w-4 h-4" />
                <span className="hidden sm:inline">Annuler</span>
              </button>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
