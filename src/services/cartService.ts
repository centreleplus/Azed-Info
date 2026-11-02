import { Product, CartItem, OrderDiscountMetadata } from "../types";
import {
  check20PercentDiscountEligibility,
  SPECIAL_DISCOUNT_20_BADGE,
} from "../utils/pricingDiscount";

export interface ItemizedProductPrice {
  basePrice: number;
  finalPrice: number;
  catalogOldPrice?: number;
  savedAmount20: number;
  isEligibleSpecialDiscount20: boolean;
  discountPercentage: number;
  specialBadgeLabel: string | null;
}

export interface CartSummaryCalculation {
  items: Array<{
    item: CartItem;
    baseUnitPrice: number;
    finalUnitPrice: number;
    savedUnitAmount: number;
    lineBaseTotal: number;
    lineFinalTotal: number;
    lineSavedTotal: number;
    hasSpecialDiscount20: boolean;
  }>;
  subtotalBeforeSpecial20: number;
  totalSpecialDiscount20: number;
  finalCartTotal: number;
  isEligibleSpecialDiscount20: boolean;
  specialDiscountBadge: string | null;
  discountMetadata: OrderDiscountMetadata;
}

/**
 * Vérifie si un étudiant est éligible à la remise spéciale de 20%
 * via son profil (flag DB / badge) ou son niveau et sa filière.
 */
export const isStudentEligibleForSpecial20 = (params: {
  role?: string;
  level?: string;
  branch?: string;
  hasSpecialDiscount20?: boolean;
  isEligibleSpecialDiscount20?: boolean;
  specialDiscountBadge?: string | null;
}): boolean => {
  const roleLower = String(params.role || "student").toLowerCase();
  if (roleLower !== "student") return false;

  if (params.hasSpecialDiscount20 === true || params.isEligibleSpecialDiscount20 === true) {
    return true;
  }
  if (params.specialDiscountBadge === SPECIAL_DISCOUNT_20_BADGE) {
    return true;
  }
  return check20PercentDiscountEligibility(params.level || "", params.branch || "");
};

/**
 * Calcule le prix d'un article dans le Shop et le Panier :
 * Prix final = Prix d'origine ou prix réduit * 0.80
 */
export const calculateShopItemPrice = (
  product: Product,
  isEligible20: boolean
): ItemizedProductPrice => {
  // Si le produit dans le panier contient déjà basePriceBeforeSpecial20, l'utiliser comme base pour éviter une double réduction
  const rawBasePrice =
    product.basePriceBeforeSpecial20 !== undefined && Number(product.basePriceBeforeSpecial20) > 0
      ? Number(product.basePriceBeforeSpecial20)
      : Number(product.price) || 0;

  const finalPrice = isEligible20 ? Math.round(rawBasePrice * 0.8 * 100) / 100 : rawBasePrice;
  const savedAmount20 = isEligible20 ? Math.max(0, Math.round((rawBasePrice - finalPrice) * 100) / 100) : 0;

  const catalogOldPrice =
    product.oldPrice && Number(product.oldPrice) > rawBasePrice
      ? Number(product.oldPrice)
      : isEligible20 && rawBasePrice > finalPrice
      ? rawBasePrice
      : product.oldPrice;

  return {
    basePrice: rawBasePrice,
    finalPrice,
    catalogOldPrice,
    savedAmount20,
    isEligibleSpecialDiscount20: isEligible20,
    discountPercentage: isEligible20 ? 20 : 0,
    specialBadgeLabel: isEligible20 ? "-20% Spécial" : null,
  };
};

/**
 * Calcule le récapitulatif détaillé du panier avec remise de 20% par article (itemized discount)
 */
export const calculateCartSummaryWith20Discount = (
  cart: CartItem[],
  studentContext: {
    role?: string;
    level?: string;
    branch?: string;
    hasSpecialDiscount20?: boolean;
    isEligibleSpecialDiscount20?: boolean;
    specialDiscountBadge?: string | null;
  }
): CartSummaryCalculation => {
  const isEligible = isStudentEligibleForSpecial20(studentContext);

  const detailedItems = (cart || []).map((cartItem) => {
    const qty = Math.max(1, Number(cartItem.quantity) || 1);
    const pricing = calculateShopItemPrice(cartItem.product, isEligible);
    const lineBaseTotal = Math.round(pricing.basePrice * qty * 100) / 100;
    const lineFinalTotal = Math.round(pricing.finalPrice * qty * 100) / 100;
    const lineSavedTotal = Math.max(0, Math.round((lineBaseTotal - lineFinalTotal) * 100) / 100);

    return {
      item: {
        ...cartItem,
        product: {
          ...cartItem.product,
          basePriceBeforeSpecial20: pricing.basePrice,
          price: pricing.finalPrice,
          oldPrice: pricing.catalogOldPrice,
          hasSpecialDiscount20: isEligible,
          specialDiscountSaved: pricing.savedAmount20,
        },
        quantity: qty,
      },
      baseUnitPrice: pricing.basePrice,
      finalUnitPrice: pricing.finalPrice,
      savedUnitAmount: pricing.savedAmount20,
      lineBaseTotal,
      lineFinalTotal,
      lineSavedTotal,
      hasSpecialDiscount20: isEligible,
    };
  });

  const subtotalBeforeSpecial20 = Math.round(
    detailedItems.reduce((sum, entry) => sum + entry.lineBaseTotal, 0) * 100
  ) / 100;

  const finalCartTotal = Math.round(
    detailedItems.reduce((sum, entry) => sum + entry.lineFinalTotal, 0) * 100
  ) / 100;

  const totalSpecialDiscount20 = Math.max(
    0,
    Math.round((subtotalBeforeSpecial20 - finalCartTotal) * 100) / 100
  );

  const discountMetadata: OrderDiscountMetadata = {
    applied: isEligible && totalSpecialDiscount20 > 0,
    rate: isEligible ? 0.2 : 0,
    percentage: isEligible ? 20 : 0,
    badge: isEligible ? SPECIAL_DISCOUNT_20_BADGE : null,
    studentLevel: studentContext.level || "",
    studentBranch: studentContext.branch || "",
    subtotalBeforeDiscount: subtotalBeforeSpecial20,
    discountAmount: totalSpecialDiscount20,
    finalTotal: finalCartTotal,
    items: detailedItems.map((entry) => ({
      productId: String(entry.item.product.id),
      title: entry.item.product.title,
      basePrice: entry.baseUnitPrice,
      discountedPrice: entry.finalUnitPrice,
      savedAmount: entry.savedUnitAmount,
      quantity: entry.item.quantity,
    })),
  };

  return {
    items: detailedItems,
    subtotalBeforeSpecial20,
    totalSpecialDiscount20,
    finalCartTotal,
    isEligibleSpecialDiscount20: isEligible,
    specialDiscountBadge: isEligible ? SPECIAL_DISCOUNT_20_BADGE : null,
    discountMetadata,
  };
};
