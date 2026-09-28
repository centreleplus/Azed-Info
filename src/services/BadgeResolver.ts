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
  | "Premium"
  | "Premium+"
  | "Premium++";

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
    label: "ESSENTIEL",
    style: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  },
  "Premium": {
    label: "PREMIUM",
    style: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
  },
  "Premium+": {
    label: "PREMIUM+",
    style: { bg: "bg-rose-50", text: "text-rose-700", border: "border-rose-200" }
  },
  "Premium++": {
    label: "PREMIUM++",
    style: { bg: "bg-amber-50", text: "text-amber-700", border: "border-amber-200" }
  }
};

// Fonction de correspondance Pack -> Catégorie
export const mapOfferToCategory = (packIdOrTitle: string): UserCategory => {
  const normalized = (packIdOrTitle || "").toLowerCase();
  if (normalized.includes("essentiel")) return "Essentiel";
  if (normalized.includes("plus plus") || normalized.includes("intégral") || normalized.includes("integral") || normalized.includes("350")) return "Premium++";
  if (normalized.includes("plus") || normalized.includes("révision") || normalized.includes("revision") || normalized.includes("140")) return "Premium+";
  if (normalized.includes("premium")) return "Premium";
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
