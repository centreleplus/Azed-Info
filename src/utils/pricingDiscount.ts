/**
 * Formule Universelle et Règles d'Éligibilité : Remise Exceptionnelle (RE - 20%)
 * 
 * Règles d'éligibilité :
 * - Classes éligibles (20% de remise) :
 *   1. 1ère Année (Tronc Commun).
 *   2. 2ème Année (Toutes matières / filières).
 *   3. 3ème Année (Toutes matières / filières SAUF la section Informatique / Sciences de l'Informatique).
 * - Classes non éligibles (0% RE) :
 *   - 3ème Année Informatique / Sciences de l'Informatique.
 *   - 4ème Année / BAC (Toutes sections).
 * 
 * Nouvelle Formule Universelle de Calcul du Prix RE :
 * La remise de 20% s'applique directement sur le Prix Final (le prix affiché/remisé du pack choisi),
 * et non sur le prix d'origine non remisé.
 * 
 * Formule :
 * Prix RE = Prix Final * 0.8
 * Exemples :
 * - Prix Final 120 DT -> Prix RE = 120 * 0.8 = 96 DT
 * - Prix Final 290 DT -> Prix RE = 290 * 0.8 = 232 DT
 */

export interface StudentProfile {
  year?: '1ere' | '2eme' | '3eme' | '4eme' | string;
  grade?: string;
  level?: string;
  section?: string; // ex: 'Informatique', 'Economie', 'Sciences', etc.
  branch?: string;
}

export interface REPriceResult {
  prixOriginal: number;
  prixRE: number;
  montantEconomise: number;
  hasRE: boolean;
  discountPercent: number;
  discountLabel: string;
}

export interface StudentPriceCalculation {
  basePrice: number;
  discountPercent: number;
  discountAmount: number;
  finalPrice: number;
  hasDiscount: boolean;
  discountLabel: string;
}

export interface DiscountInfo {
  isEligible: boolean;
  originalPrice: number;
  discountedPrice: number;
  savedAmount: number;
  discountPercentage: number;
  discountLabel?: string;
}

/**
 * Normalise et extrait la classe et la section quel que soit le format de saisie.
 */
function parseGradeAndBranch(argA?: any, argB?: any): { grade: string; branch: string } {
  if (argA && typeof argA === 'object') {
    const grade = String(argA.year || argA.grade || argA.level || argA.class || '').trim();
    const branch = String(argA.section || argA.branch || argA.filiere || '').trim();
    return { grade, branch };
  }

  const strA = (argA || '').toString().trim();
  const strB = (argB || '').toString().trim();
  const lowA = strA.toLowerCase();
  const lowB = strB.toLowerCase();

  const isGradePattern = (s: string) =>
    s.includes('1') ||
    s.includes('2') ||
    s.includes('3') ||
    s.includes('4') ||
    s.includes('premi') ||
    s.includes('deux') ||
    s.includes('trois') ||
    s.includes('bac') ||
    s.includes('année') ||
    s.includes('annee');

  if (isGradePattern(lowA) && !isGradePattern(lowB)) {
    return { grade: strA, branch: strB };
  }
  if (isGradePattern(lowB) && !isGradePattern(lowA)) {
    return { grade: strB, branch: strA };
  }
  return { grade: strA, branch: strB };
}

/**
 * Vérifie si l'étudiant est éligible à la Remise Exceptionnelle (20%)
 */
export const isEligibleForRE = (
  profileOrGrade?: StudentProfile | string, 
  maybeSection?: string
): boolean => {
  const { grade, branch } = parseGradeAndBranch(profileOrGrade, maybeSection);
  const normalizedGrade = grade.toLowerCase().trim();
  const normalizedBranch = branch.toLowerCase().trim();

  // Classes NON ÉLIGIBLES (0% RE) :
  // 4ème Année / BAC (Toutes sections)
  const is4thYearOrBac = 
    normalizedGrade.includes('4') || 
    normalizedGrade.includes('quatr') || 
    normalizedGrade.includes('bac') || 
    normalizedGrade.includes('terminal');

  if (is4thYearOrBac) {
    return false;
  }

  // Détection filière Informatique / Sciences de l'Informatique
  const isInfo = 
    normalizedBranch.includes('informatique') || 
    normalizedBranch.includes('info') ||
    normalizedGrade.includes('informatique') ||
    normalizedGrade.includes('info');

  // 1er Année (Tronc Commun) -> Éligible 20%
  const is1stYear = 
    normalizedGrade.includes('1') || 
    normalizedGrade.includes('première') || 
    normalizedGrade.includes('premiere') ||
    normalizedGrade.includes('1ere') ||
    normalizedGrade.includes('1er') ||
    normalizedGrade.includes('1ère');

  if (is1stYear) {
    return true;
  }

  // 2ème Année (Toutes matières / filières) -> Éligible 20%
  const is2ndYear = 
    normalizedGrade.includes('2') || 
    normalizedGrade.includes('deuxième') || 
    normalizedGrade.includes('deuxieme') ||
    normalizedGrade.includes('2eme') ||
    normalizedGrade.includes('2ème');

  if (is2ndYear) {
    return true;
  }

  // 3ème Année (Toutes matières / filières SAUF Informatique)
  const is3rdYear = 
    normalizedGrade.includes('3') || 
    normalizedGrade.includes('troisième') || 
    normalizedGrade.includes('troisieme') ||
    normalizedGrade.includes('3eme') ||
    normalizedGrade.includes('3ème');

  if (is3rdYear) {
    // 3ème Année Informatique -> NON ÉLIGIBLE
    if (isInfo) return false;
    // 3ème Année autres filières -> ÉLIGIBLE 20%
    return true;
  }

  return false;
};

// Alias de rétro-compatibilité
export const isEligibleFor20Discount = isEligibleForRE;

/**
 * Calcule le prix final exact à payer et à afficher dans les tableaux de bord
 * 
 * Formule Universelle :
 * Prix RE = Prix Final * 0.8
 */
export const calculateFinalPrice = (
  packFinalPrice: number, 
  profileOrGrade?: StudentProfile | string, 
  maybeSection?: string
): number => {
  const price = Number(packFinalPrice) || 0;
  if (price <= 0) return 0;

  if (isEligibleForRE(profileOrGrade, maybeSection)) {
    // Application exacte de la formule : Prix RE = Prix Final * 0.8
    return Math.round(price * 0.8);
  }
  return price;
};

/**
 * Formule exacte de calcul de la Remise Exceptionnelle (-20%)
 * Prix RE = Prix Final * 0.80
 */
export const calculatePriceWithRE = (
  prixFinal: number, // Valeur de "Prix Final / Remisé (DT)"
  profileOrGrade?: StudentProfile | string, 
  maybeSection?: string
): REPriceResult => {
  const price = Number(prixFinal) || 0;
  const isEligibleRE = isEligibleForRE(profileOrGrade, maybeSection);

  if (isEligibleRE && price > 0) {
    // Application stricte de la formule : Prix RE = Prix Final * 0.8
    const prixRE = Math.round(price * 0.80);
    return {
      prixOriginal: price,
      prixRE: prixRE,
      montantEconomise: price - prixRE,
      hasRE: true,
      discountPercent: 20,
      discountLabel: 'Remise Exceptionnelle -20%'
    };
  }

  return {
    prixOriginal: price,
    prixRE: price,
    montantEconomise: 0,
    hasRE: false,
    discountPercent: 0,
    discountLabel: ''
  };
};

/**
 * Logique de calcul universelle pour les composants
 */
export const calculateStudentPrice = (
  basePrice: number, 
  branchOrGrade?: string | StudentProfile, 
  gradeOrBranch?: string
): StudentPriceCalculation => {
  const price = Number(basePrice) || 0;
  const reResult = calculatePriceWithRE(price, branchOrGrade, gradeOrBranch);

  return {
    basePrice: reResult.prixOriginal,
    discountPercent: reResult.discountPercent,
    discountAmount: reResult.montantEconomise,
    finalPrice: reResult.prixRE,
    hasDiscount: reResult.hasRE,
    discountLabel: reResult.discountLabel
  };
};

/**
 * Renvoie directement le prix final après remise éventuelle
 */
export const calculateDiscountedAmount = (
  basePrice: number, 
  gradeOrLevel?: string | StudentProfile, 
  branchOrSection?: string
): number => {
  return calculateFinalPrice(basePrice, gradeOrLevel, branchOrSection);
};

/**
 * Renvoie un objet détaillé de réduction pour l'affichage dans les cartes
 */
export const getDiscountDetails = (
  basePrice: number, 
  gradeOrLevel?: string | StudentProfile, 
  branchOrSection?: string
): DiscountInfo => {
  const res = calculatePriceWithRE(basePrice, gradeOrLevel, branchOrSection);
  return {
    isEligible: res.hasRE,
    originalPrice: res.prixOriginal,
    discountedPrice: res.prixRE,
    savedAmount: res.montantEconomise,
    discountPercentage: res.discountPercent,
    discountLabel: res.discountLabel
  };
};

/**
 * Grille officielle des tarifs par forfait (Plein tarif vs Remise -20%)
 * - Pack ESSENTIEL : 120 DT (Plein tarif) / 96 DT (avec remise -20%)
 * - Pack LIVE+ : 150 DT (Plein tarif) / 120 DT (avec remise -20%)
 * - Pack REVISION+ : 140 DT (Plein tarif) / 112 DT (avec remise -20%)
 * - Pack INTEGRAL : 350 DT (Plein tarif) / 280 DT (avec remise -20%)
 * - FREEMIUM : 0 DT
 */
export const OFFICIAL_PACK_TARIFFS: Record<string, { fullPrice: number; discounted20Price: number }> = {
  'FREEMIUM': { fullPrice: 0, discounted20Price: 0 },
  'ESSENTIEL': { fullPrice: 120, discounted20Price: 96 },
  'LIVE+': { fullPrice: 150, discounted20Price: 120 },
  'REVISION+': { fullPrice: 140, discounted20Price: 112 },
  'INTEGRAL': { fullPrice: 350, discounted20Price: 280 },
};

export function normalizePackKeyForPricing(rawPack?: string | null): 'FREEMIUM' | 'ESSENTIEL' | 'LIVE+' | 'REVISION+' | 'INTEGRAL' {
  if (!rawPack) return 'FREEMIUM';
  const upper = String(rawPack).replace(/^PACK\s+/i, '').trim().toUpperCase().replace(/\s*\+\s*/g, '+');
  if (upper === 'FREEMIUM' || upper === 'ESSENTIEL' || upper === 'LIVE+' || upper === 'REVISION+' || upper === 'INTEGRAL') {
    return upper;
  }
  if (upper.includes('INTEGR') || upper.includes('INTÉGR') || upper.includes('350') || upper.includes('280') || upper.includes('++') || upper.includes('ANNUEL')) {
    return 'INTEGRAL';
  }
  if (upper.includes('REVIS') || upper.includes('RÉVIS') || upper.includes('140') || upper.includes('112')) {
    return 'REVISION+';
  }
  if (upper.includes('LIVE') || upper.includes('150') || upper.includes('TRIMESTR')) {
    return 'LIVE+';
  }
  if (upper.includes('ESSENT') || upper.includes('120') || upper.includes('96') || upper.includes('PREMIUM') || upper.includes('PASS')) {
    return 'ESSENTIEL';
  }
  return 'FREEMIUM';
}

export interface TransactionPriceResolution {
  pack: 'FREEMIUM' | 'ESSENTIEL' | 'LIVE+' | 'REVISION+' | 'INTEGRAL';
  fullPrice: number;
  discountedPrice: number;
  hasDiscount20: boolean;
  amount: number;
}

/**
 * Calcule dynamiquement le forfait et le montant exact d'une inscription/vente
 * selon le forfait choisi, l'éligibilité à la remise -20% (ou code promo),
 * et le montant éventuellement enregistré dans `/cours`, `#/admin/users` ou `#/admin/frais-inscription`.
 */
export function resolveTransactionPackAndAmount(params: {
  rawPack?: string | null;
  grade?: string | null;
  section?: string | null;
  hasDiscount20?: boolean;
  recordedAmount?: number | string | null;
}): TransactionPriceResolution {
  const recorded = Number(params.recordedAmount) || 0;
  let pack = normalizePackKeyForPricing(params.rawPack);

  // Si aucun pack explicite n'a été trouvé mais qu'un montant payé valide existe, déduire le forfait correspondant
  if (pack === 'FREEMIUM' && recorded > 0 && (!params.rawPack || String(params.rawPack).toLowerCase() === 'active' || String(params.rawPack).toLowerCase() === 'pending')) {
    if (recorded === 350 || recorded === 280) pack = 'INTEGRAL';
    else if (recorded === 150) pack = 'LIVE+';
    else if (recorded === 140 || recorded === 112) pack = 'REVISION+';
    else if (recorded === 120 || recorded === 96) pack = 'ESSENTIEL';
  }

  const tariff = OFFICIAL_PACK_TARIFFS[pack] || OFFICIAL_PACK_TARIFFS['FREEMIUM'];
  if (pack === 'FREEMIUM') {
    return {
      pack: 'FREEMIUM',
      fullPrice: 0,
      discountedPrice: 0,
      hasDiscount20: false,
      amount: 0,
    };
  }

  const eligibleRE = isEligibleForRE(params.grade || '', params.section || '');
  const matchesDiscounted20 = recorded > 0 && recorded === tariff.discounted20Price;
  const matchesFull = recorded > 0 && recorded === tariff.fullPrice;

  const hasDiscount20 = Boolean(
    params.hasDiscount20 ||
    eligibleRE ||
    matchesDiscounted20
  );

  // Si le montant enregistré correspond exactement au tarif officiel (plein ou -20%) du forfait actuel
  let finalAmount: number;
  if (hasDiscount20) {
    finalAmount = tariff.discounted20Price;
  } else if (matchesFull) {
    finalAmount = tariff.fullPrice;
  } else {
    finalAmount = tariff.fullPrice;
  }

  return {
    pack,
    fullPrice: tariff.fullPrice,
    discountedPrice: tariff.discounted20Price,
    hasDiscount20,
    amount: finalAmount,
  };
}


