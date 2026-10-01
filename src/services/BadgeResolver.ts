// 1. Niveaux Scolaires Autorisés
export type AcademicLevel = "1ère" | "2ème" | "3ème" | "4ème";

// 2. Filières / Sections Autorisées
export type AcademicSection = 
  | "Sciences de l'Informatique"
  | "Mathématiques"
  | "Sciences Expérimentales"
  | "Sciences Techniques"
  | "Économie & Gestion"
  | "Lettres"
  | "Sport"
  | "Tronc Commun"; // Obligatoire si Level === "1ère"

// 3. Catégories d'Utilisateurs / Badges
export type UserCategory = 
  | "Freemium"
  | "Essentiel"
  | "Live +"
  | "Révision +"
  | "Intégrale";

// Structuration du profil Étudiant
export interface StudentProfile {
  id: string;
  fullName: string;
  email: string;
  level: AcademicLevel;
  section: AcademicSection;
  userCategory: UserCategory;
  badgeLabel: string;
  badgeStyle: {
    bg: string;
    text: string;
    border: string;
  };
}

export const BADGE_CONFIG: Record<UserCategory, { label: string; style: { bg: string; text: string; border: string } }> = {
  "Freemium": {
    label: "Freemium",
    style: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" }
  },
  "Essentiel": {
    label: "Essentiel",
    style: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  },
  "Live +": {
    label: "Live +",
    style: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
  },
  "Révision +": {
    label: "Révision +",
    style: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" }
  },
  "Intégrale": {
    label: "Intégrale",
    style: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" }
  }
};

// Fonction de correspondance Pack -> Catégorie
export const mapOfferToCategory = (packIdOrTitle: string): UserCategory => {
  const normalized = (packIdOrTitle || "").toLowerCase();
  if (normalized.includes("intégr") || normalized.includes("integ") || normalized.includes("350") || normalized.includes("annuel") || normalized.includes("plus plus") || normalized.includes("++")) {
    return "Intégrale";
  }
  if (normalized.includes("révis") || normalized.includes("revis") || normalized.includes("140") || (normalized.includes("plus") && !normalized.includes("live"))) {
    return "Révision +";
  }
  if (normalized.includes("live") || normalized.includes("live_plus") || normalized.includes("150") || normalized.includes("premium")) {
    return "Live +";
  }
  if (normalized.includes("essentiel") || normalized.includes("120") || normalized.includes("pass")) {
    return "Essentiel";
  }
  return "Freemium";
};

// Validation lors de l'inscription / Mise à jour profil
export function validateStudentRegistration<T extends { level?: string; section?: string; grade?: string; branche?: string }>(data: T): T {
  const currentLevel = data.level || data.grade || "";
  if (currentLevel.includes("1") || currentLevel.toLowerCase().includes("première") || currentLevel.toLowerCase().includes("premiere")) {
    if (data.section) data.section = "Tronc Commun";
    if (data.branche) data.branche = "Tronc Commun";
  }
  return data;
}

export default {
  BADGE_CONFIG,
  mapOfferToCategory,
  validateStudentRegistration
};
