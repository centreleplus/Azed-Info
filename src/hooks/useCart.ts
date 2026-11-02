import { useCart as useCartContext } from "../components/CartContext";
import {
  check20PercentDiscountEligibility,
  SPECIAL_DISCOUNT_20_BADGE,
} from "../utils/pricingDiscount";
import {
  calculateShopItemPrice,
  calculateCartSummaryWith20Discount,
  isStudentEligibleForSpecial20,
} from "../services/cartService";

export {
  useCartContext as useCart,
  check20PercentDiscountEligibility,
  SPECIAL_DISCOUNT_20_BADGE,
  calculateShopItemPrice,
  calculateCartSummaryWith20Discount,
  isStudentEligibleForSpecial20,
};

export default useCartContext;
