export type CategoryKey = "FREEMIUM" | "ESSENTIEL" | "LIVE+" | "REVISION+" | "INTEGRAL";

export interface BadgeStyle {
  label: string;
  bg: string;
  text: string;
  border: string;
}

export const BADGE_STYLES: Record<CategoryKey, BadgeStyle> = {
  "FREEMIUM": {
    label: "FREEMIUM",
    bg: "bg-slate-100",
    text: "text-slate-800",
    border: "border-slate-300"
  },
  "ESSENTIEL": {
    label: "ESSENTIEL",
    bg: "bg-blue-100",
    text: "text-blue-900",
    border: "border-blue-300"
  },
  "LIVE+": {
    label: "LIVE+",
    bg: "bg-emerald-100",
    text: "text-emerald-900",
    border: "border-emerald-300"
  },
  "REVISION+": {
    label: "REVISION+",
    bg: "bg-indigo-100",
    text: "text-indigo-900",
    border: "border-indigo-300"
  },
  "INTEGRAL": {
    label: "INTEGRAL",
    bg: "bg-purple-100",
    text: "text-purple-900",
    border: "border-purple-300"
  }
};

import { normalizeBadge, OfficialBadge } from '../constants/badges';

export const parseUserCategory = (rawInput?: string): CategoryKey => {
  return normalizeBadge(rawInput) as CategoryKey;
};

export const SUBSCRIPTION_OPTIONS = [
  { value: "FREEMIUM", label: "FREEMIUM" },
  { value: "ESSENTIEL", label: "ESSENTIEL" },
  { value: "LIVE+", label: "LIVE+" },
  { value: "REVISION+", label: "REVISION+" },
  { value: "INTEGRAL", label: "INTEGRAL" }
];
