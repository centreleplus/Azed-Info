export type CategoryKey = "Freemium" | "Essentiel" | "Premium" | "Premium+" | "Premium++";

export interface BadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const BADGE_STYLES: Record<CategoryKey, BadgeStyle> = {
  "Freemium": {
    label: "Freemium",
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300"
  },
  "Premium": {
    label: "Premium",
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-300"
  },
  "Premium+": {
    label: "Premium+",
    bg: "bg-indigo-100",
    text: "text-indigo-900",
    border: "border-indigo-300"
  },
  "Premium++": {
    label: "Premium++",
    bg: "bg-purple-100",
    text: "text-purple-900",
    border: "border-purple-300"
  },
  "Essentiel": {
    label: "Essentiel",
    bg: "bg-amber-100",
    text: "text-amber-900",
    border: "border-amber-300"
  }
};

// Analyseur robuste des abonnements (Gère les textes anciens, minuscules, et libellés complets)
export const parseUserCategory = (rawInput?: string): CategoryKey => {
  if (!rawInput) return "Freemium";
  
  const val = rawInput.toString().trim().toLowerCase();

  // Test Premium++ (Forfait Intégral / 350 DT / Premium Plus Plus)
  if (
    val.includes("++") || 
    val.includes("plus plus") || 
    val.includes("intégral") || 
    val.includes("integral") ||
    val.includes("350") ||
    val.includes("forfait annuel")
  ) {
    return "Premium++";
  }

  // Test Premium+ (Pack Révision / 140 DT / Premium Plus)
  if (
    val.includes("+") || 
    val.includes("plus") || 
    val.includes("révision") || 
    val.includes("revision") || 
    val.includes("140")
  ) {
    return "Premium+";
  }

  // Test Essentiel (120 DT)
  if (val.includes("essentiel") || val.includes("120")) {
    return "Essentiel";
  }

  // Test Premium (150 DT)
  if (val.includes("premium") || val.includes("150") || val.includes("trimestriel") || val.includes("mensuel") || val.includes("annuel")) {
    return "Premium";
  }

  return "Freemium";
};

// Options des forfaits épurées sans émojis pour le panneau d'administration
export const SUBSCRIPTION_OPTIONS = [
  { value: "Freemium", label: "Freemium" },
  { value: "Essentiel", label: "Essentiel" },
  { value: "Premium", label: "Premium" },
  { value: "Premium+", label: "Premium+" },
  { value: "Premium++", label: "Premium++" }
];
