export type CategoryKey = "Freemium" | "Essentiel" | "Live +" | "Révision +" | "Intégrale";

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
  "Essentiel": {
    label: "Essentiel",
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-300"
  },
  "Live +": {
    label: "Live +",
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-300"
  },
  "Révision +": {
    label: "Révision +",
    bg: "bg-indigo-100",
    text: "text-indigo-900",
    border: "border-indigo-300"
  },
  "Intégrale": {
    label: "Intégrale",
    bg: "bg-purple-100",
    text: "text-purple-900",
    border: "border-purple-300"
  }
};

// Analyseur robuste des abonnements (Gère les textes anciens et libellés complets)
export const parseUserCategory = (rawInput?: string): CategoryKey => {
  if (!rawInput) return "Freemium";
  
  const val = rawInput.toString().trim().toLowerCase();

  // Test Intégrale
  if (
    val.includes("intégr") || 
    val.includes("integ") || 
    val.includes("350") ||
    val.includes("annuel") ||
    val.includes("plus plus") ||
    val.includes("++")
  ) {
    return "Intégrale";
  }

  // Test Révision +
  if (
    val.includes("révis") || 
    val.includes("revis") || 
    val.includes("140") ||
    val.includes("revision_plus") ||
    (val.includes("plus") && !val.includes("live"))
  ) {
    return "Révision +";
  }

  // Test Live +
  if (
    val.includes("live") || 
    val.includes("live_plus") || 
    val.includes("150") || 
    val.includes("trimestriel") || 
    val.includes("standard") ||
    val.includes("premium")
  ) {
    return "Live +";
  }

  // Test Essentiel
  if (val.includes("essentiel") || val.includes("120") || val.includes("pass")) {
    return "Essentiel";
  }

  return "Freemium";
};

// Options des forfaits épurées sans émojis pour le panneau d'administration
export const SUBSCRIPTION_OPTIONS = [
  { value: "Freemium", label: "Freemium" },
  { value: "Essentiel", label: "Essentiel" },
  { value: "Live +", label: "Live +" },
  { value: "Révision +", label: "Révision +" },
  { value: "Intégrale", label: "Intégrale" }
];
