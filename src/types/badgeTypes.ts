import { normalizeBadge, OfficialBadge } from '../constants/badges';

export type UserCategory = OfficialBadge;

export interface BadgeStyleConfig {
  key: UserCategory;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

export const OFFICIAL_BADGES: Record<UserCategory, BadgeStyleConfig> = {
  'FREEMIUM': {
    key: "FREEMIUM",
    label: "FREEMIUM",
    bgClass: "bg-gray-100",
    textClass: "text-gray-700",
    borderClass: "border-gray-200"
  },
  'ESSENTIEL': {
    key: "ESSENTIEL",
    label: "ESSENTIEL",
    bgClass: "bg-blue-50",
    textClass: "text-blue-700",
    borderClass: "border-blue-200"
  },
  'LIVE+': {
    key: "LIVE+",
    label: "LIVE+",
    bgClass: "bg-purple-50",
    textClass: "text-purple-700",
    borderClass: "border-purple-200"
  },
  'REVISION+': {
    key: "REVISION+",
    label: "REVISION+",
    bgClass: "bg-amber-50",
    textClass: "text-amber-700",
    borderClass: "border-amber-200"
  },
  'INTEGRAL': {
    key: "INTEGRAL",
    label: "INTEGRAL",
    bgClass: "bg-emerald-50",
    textClass: "text-emerald-700",
    borderClass: "border-emerald-200"
  }
};

export const parseUserCategoryStrict = (category?: string): UserCategory => {
  return normalizeBadge(category);
};
