import React from "react";
import { Language } from "../lib/translations";

export const TunisianFlag = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5 rounded-full overflow-hidden border border-gray-150 shadow-xs shrink-0 select-none object-cover">
    <circle cx="256" cy="256" r="256" fill="#e20909" />
    <circle cx="256" cy="256" r="110" fill="#fff" />
    <circle cx="245" cy="256" r="65" fill="#e20909" />
    <circle cx="265" cy="256" r="53" fill="#fff" />
    <polygon points="280,240 286,252 299,254 289,263 292,276 280,269 268,276 271,263 261,254 274,252" fill="#e20909" />
  </svg>
);

export const FrenchFlag = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5 rounded-full overflow-hidden border border-gray-150 shadow-xs shrink-0 select-none object-cover">
    <rect width="170.7" height="512" fill="#002395" />
    <rect x="170.7" width="170.7" height="512" fill="#fff" />
    <rect x="341.4" width="170.7" height="512" fill="#ed2939" />
  </svg>
);

export const UsFlag = () => (
  <svg viewBox="0 0 512 512" className="w-5 h-5 rounded-full overflow-hidden border border-gray-150 shadow-xs shrink-0 select-none object-cover">
    <rect width="512" height="512" fill="#fff" />
    <path d="M0 0h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0zm0 78.8h512v39.4H0z" fill="#bd3d3a" />
    <rect width="204.8" height="275.8" fill="#192f5d" />
    <g fill="#fff">
      {/* Stars on the blue canton */}
      <circle cx="35" cy="40" r="5" />
      <circle cx="75" cy="40" r="5" />
      <circle cx="115" cy="40" r="5" />
      <circle cx="155" cy="40" r="5" />
      
      <circle cx="55" cy="80" r="5" />
      <circle cx="95" cy="80" r="5" />
      <circle cx="135" cy="80" r="5" />
      
      <circle cx="35" cy="120" r="5" />
      <circle cx="75" cy="120" r="5" />
      <circle cx="115" cy="120" r="5" />
      <circle cx="155" cy="120" r="5" />
      
      <circle cx="55" cy="160" r="5" />
      <circle cx="95" cy="160" r="5" />
      <circle cx="135" cy="160" r="5" />
      
      <circle cx="35" cy="200" r="5" />
      <circle cx="75" cy="200" r="5" />
      <circle cx="115" cy="200" r="5" />
      <circle cx="155" cy="200" r="5" />
      
      <circle cx="55" cy="240" r="5" />
      <circle cx="95" cy="240" r="5" />
      <circle cx="135" cy="240" r="5" />
    </g>
  </svg>
);

export function getLanguageFlag(code: Language) {
  switch (code) {
    case "ar":
      return <TunisianFlag />;
    case "fr":
      return <FrenchFlag />;
    case "en":
      return <UsFlag />;
    default:
      return null;
  }
}

