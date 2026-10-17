export type AcademicLevel = "1ère" | "2ème" | "3ème" | "4ème";

export type AcademicSection = 
  | "Sciences de l'Informatique"
  | "Mathématiques"
  | "Sciences Expérimentales"
  | "Sciences Techniques"
  | "Économie & Gestion"
  | "Lettres"
  | "Sport"
  | "Tronc Commun";

import { normalizeBadge, OfficialBadge } from '../constants/badges';

export type UserCategory = OfficialBadge;

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
  "FREEMIUM": {
    label: "FREEMIUM",
    style: { bg: "bg-slate-100", text: "text-slate-700", border: "border-slate-300" }
  },
  "ESSENTIEL": {
    label: "ESSENTIEL",
    style: { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" }
  },
  "LIVE+": {
    label: "LIVE+",
    style: { bg: "bg-emerald-50", text: "text-emerald-700", border: "border-emerald-200" }
  },
  "REVISION+": {
    label: "REVISION+",
    style: { bg: "bg-indigo-50", text: "text-indigo-700", border: "border-indigo-200" }
  },
  "INTEGRAL": {
    label: "INTEGRAL",
    style: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" }
  }
};

export const mapOfferToCategory = (packIdOrTitle: string): UserCategory => {
  return normalizeBadge(packIdOrTitle);
};

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
