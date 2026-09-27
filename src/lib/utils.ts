// Core utility functions for A-Zed Info platform

/**
 * Helper to normalize grade/class strings across server and client components.
 * Standardizes variations like "4ème Année (Bac Info)", "4eme", "Bac" into "4éme",
 * "3ème Année" into "3ème", etc.
 */
export function normalizeGrade(gradeStr?: string): string {
  if (!gradeStr) return "Tous";
  const str = gradeStr.trim();
  if (
    str === "Tous" ||
    str === "ALL" ||
    str === "tous" ||
    str === "all" ||
    str.toLowerCase().includes("tous")
  ) {
    return "Tous";
  }

  // Match 4th year / Bac variations
  if (/4|bac/i.test(str)) {
    return "4éme";
  }
  if (/3/i.test(str)) {
    return "3ème";
  }
  if (/2/i.test(str)) {
    return "2ème";
  }
  if (/1/i.test(str)) {
    return "1ère";
  }
  return str;
}
