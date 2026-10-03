export type UserCategory = "Freemium" | "Essentiel" | "Live +" | "Révision +" | "Intégrale";

export interface BadgeStyleConfig {
  key: UserCategory;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const OFFICIAL_BADGES: Record<UserCategory, BadgeStyleConfig> = {
  Freemium: {
    key: "Freemium",
    label: "Freemium",
    bgClass: "bg-slate-100",
    textClass: "text-slate-800",
    borderClass: "border-slate-300"
  },
  Essentiel: {
    key: "Essentiel",
    label: "Essentiel",
    bgClass: "bg-blue-100",
    textClass: "text-blue-900",
    borderClass: "border-blue-300"
  },
  "Live +": {
    key: "Live +",
    label: "Live +",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-900",
    borderClass: "border-emerald-300"
  },
  "Révision +": {
    key: "Révision +",
    label: "Révision +",
    bgClass: "bg-indigo-100",
    textClass: "text-indigo-900",
    borderClass: "border-indigo-300"
  },
  "Intégrale": {
    key: "Intégrale",
    label: "Intégrale",
    bgClass: "bg-purple-100",
    textClass: "text-purple-900",
    borderClass: "border-purple-300"
  }
};

export const parseUserCategoryStrict = (category?: string): UserCategory => {
  if (!category || typeof category !== "string") return "Freemium";
  const trimmed = category.trim();

  if (trimmed === "Freemium" || trimmed.toLowerCase() === "freemium") return "Freemium";
  if (trimmed === "Essentiel" || trimmed.toLowerCase() === "essentiel") return "Essentiel";
  if (trimmed === "Live +" || trimmed.toLowerCase() === "live +" || trimmed.toLowerCase() === "live_plus" || trimmed.toLowerCase() === "live+") return "Live +";
  if (trimmed === "Révision +" || trimmed.toLowerCase() === "révision +" || trimmed.toLowerCase() === "revision +" || trimmed.toLowerCase() === "revision_plus" || trimmed.toLowerCase() === "revision+") return "Révision +";
  if (trimmed === "Intégrale" || trimmed.toLowerCase() === "intégrale" || trimmed.toLowerCase() === "integrale") return "Intégrale";

  const raw = trimmed.toLowerCase();
  if (raw.includes("essentiel") || raw.includes("120") || raw.includes("pass")) {
    return "Essentiel";
  }
  if (raw.includes("live") || raw.includes("live_plus") || raw.includes("150")) {
    return "Live +";
  }
  if (raw.includes("révis") || raw.includes("revis") || raw.includes("140") || raw.includes("revision_plus")) {
    return "Révision +";
  }
  if (raw.includes("intégr") || raw.includes("integ") || raw.includes("350") || raw.includes("plus plus") || raw.includes("++")) {
    return "Intégrale";
  }

  return "Freemium";
};
