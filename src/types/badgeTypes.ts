export type UserCategory = "Freemium" | "Premium" | "Premium+" | "Premium++" | "Essentiel";

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
  Premium: {
    key: "Premium",
    label: "Premium",
    bgClass: "bg-emerald-100",
    textClass: "text-emerald-900",
    borderClass: "border-emerald-300"
  },
  "Premium+": {
    key: "Premium+",
    label: "Premium+",
    bgClass: "bg-indigo-100",
    textClass: "text-indigo-900",
    borderClass: "border-indigo-300"
  },
  "Premium++": {
    key: "Premium++",
    label: "Premium++",
    bgClass: "bg-purple-100",
    textClass: "text-purple-900",
    borderClass: "border-purple-300"
  },
  Essentiel: {
    key: "Essentiel",
    label: "Essentiel",
    bgClass: "bg-amber-100",
    textClass: "text-amber-900",
    borderClass: "border-amber-300"
  }
};

export const parseUserCategoryStrict = (category?: string): UserCategory => {
  const raw = (category || "").toString().trim().toLowerCase();
  if (raw.includes("++") || raw.includes("plus plus") || raw.includes("350") || raw.includes("intégral") || raw.includes("integral")) {
    return "Premium++";
  }
  if (raw.includes("+") || raw.includes("plus") || raw.includes("140") || raw.includes("révision") || raw.includes("revision")) {
    return "Premium+";
  }
  if (raw.includes("essentiel") || raw.includes("120")) {
    return "Essentiel";
  }
  if (raw.includes("premium") || raw.includes("150") || raw.includes("mensuel") || raw.includes("trimestriel") || raw.includes("annuel")) {
    return "Premium";
  }
  return "Freemium";
};
