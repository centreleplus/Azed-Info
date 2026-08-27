import React, { useState, useEffect, useRef } from "react";
import { ShoppingCart, ShoppingBag, Store, Heart, Plus, Minus, Trash2, CreditCard, Banknote, HelpCircle, ArrowLeft, ArrowRight, Check, AlertCircle, Award, Crown, Cpu, Package, Gift, Zap, Shield, Sparkles, Layers, BookOpen, Video, Terminal, Activity, Landmark as Bank, Send, Building2, MapPin, Clock, Upload as CloudArrowUp, FileText, RefreshCw, User, UserCheck, ChevronDown } from "lucide-react";
import { Product, CartItem, getPromoBadgeLabel } from "../types";
import { useSettings } from "./SettingsContext";
import { PaymentMethodIcon } from "./PaymentMethodIcon";
import { isEligibleFor20Discount, calculateDiscountedAmount } from "../utils/pricingDiscount";

interface ShopViewProps {
  userId: string;
  userGrade: string;
  userSection?: string;
  userRole: string;
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  wishlist: Product[];
  setWishlist: React.Dispatch<React.SetStateAction<Product[]>>;
  currentTab: string;
  setCurrentTab: React.Dispatch<React.SetStateAction<string>>;
  initialCategory?: string;
}

export default function ShopView({
  userId,
  userGrade,
  userSection,
  userRole,
  cart,
  setCart,
  wishlist,
  setWishlist,
  currentTab,
  setCurrentTab,
  initialCategory
}: ShopViewProps) {
  const { settings } = useSettings();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const renderPackIcon = (iconName: string | undefined, category?: string, size = 16, className = "") => {
    const nameLower = (iconName || "").toLowerCase();
    const catLower = (category || "").toLowerCase();

    if (nameLower.includes("cpu") || nameLower.includes("package") || catLower.includes("hardware") || catLower.includes("kit") || catLower.includes("iot")) {
      return <Cpu size={size} className={className} />;
    }
    if (nameLower.includes("crown") || nameLower.includes("award") || catLower.includes("full access") || catLower.includes("annuel")) {
      return <Crown size={size} className={className} />;
    }
    if (nameLower.includes("video") || catLower.includes("video") || catLower.includes("cours") || catLower.includes("live")) {
      return <Video size={size} className={className} />;
    }
    if (nameLower.includes("book") || nameLower.includes("file") || catLower.includes("pdf") || catLower.includes("fiche")) {
      return <BookOpen size={size} className={className} />;
    }

    switch (iconName) {
      case "Cpu": return <Cpu size={size} className={className} />;
      case "Package": return <Package size={size} className={className} />;
      case "Crown": return <Crown size={size} className={className} />;
      case "Award": return <Award size={size} className={className} />;
      case "Video": return <Video size={size} className={className} />;
      case "Sparkles": return <Sparkles size={size} className={className} />;
      case "BookOpen": return <BookOpen size={size} className={className} />;
      case "FileText": return <FileText size={size} className={className} />;
      case "Gift": return <Gift size={size} className={className} />;
      case "Zap": return <Zap size={size} className={className} />;
      case "Shield": return <Shield size={size} className={className} />;
      case "Layers": return <Layers size={size} className={className} />;
      case "Terminal": return <Terminal size={size} className={className} />;
      case "Activity": return <Activity size={size} className={className} />;
      case "ShoppingBag": return <ShoppingBag size={size} className={className} />;
      case "Store": return <Store size={size} className={className} />;
      default: return <Sparkles size={size} className={className} />;
    }
  };
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || "All");

  useEffect(() => {
    if (initialCategory) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);
  const [searchQuery, setSearchQuery] = useState("");
  const [checkoutStep, setCheckoutStep] = useState<"cart" | "payment" | "success">("cart");
  const [paymentMethod, setPaymentMethod] = useState<"D17" | "RIB" | "Wafacash" | "Direct">("D17");
  const [invoiceId, setInvoiceId] = useState<string | null>(null);

  // Receipt Upload state
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // Compact bento grid sizing.

  useEffect(() => {
    fetch("/api/products")
      .then((res) => {
        if (!res.ok) {
          throw new Error(`HTTP error ${res.status}`);
        }
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("La réponse du serveur n'est pas du JSON valide");
        }
        return res.json();
      })
      .then((data) => {
        setProducts(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error loading products:", err);
        setLoading(false);
      });
  }, []);

  const isStudent = userRole === "student";

  // Filter and search with strict data filtering to match exactly the student's grade/specialty
  const filteredProducts = products.filter((p) => {
    // 1. Category Filter
    const matchesCategory = selectedCategory === "All" || p.category === selectedCategory;
    
    // 2. Search Text
    const matchesSearch = p.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.description.toLowerCase().includes(searchQuery.toLowerCase());
                          
    // 3. Strict Student Isolation:
    // If a student, hide packs of other grades. For example:
    // If user's grade is Bac or 4ème and pack says 1ère or 3ème, hide it. 
    // If user's grade is 1ère and pack says Bac/4ème/3ème, hide it.
    if (isStudent) {
      const studentLower = userGrade.toLowerCase();
      const titleLower = p.title.toLowerCase();
      const descLower = p.description.toLowerCase();
      
      const contains1ere = titleLower.includes("1ère") || descLower.includes("1ère") || titleLower.includes("première") || descLower.includes("première");
      const contains3eme = titleLower.includes("3ème") || descLower.includes("3ème") || titleLower.includes("troisième") || descLower.includes("troisième");
      const contains4emeOrBac = titleLower.includes("4ème") || descLower.includes("4ème") || titleLower.includes("bac") || descLower.includes("bac");

      if (studentLower.includes("1ère")) {
        if (contains3eme || contains4emeOrBac) return false;
      } else if (studentLower.includes("3ème")) {
        if (contains1ere || contains4emeOrBac) return false;
      } else if (studentLower.includes("4ème") || studentLower.includes("bac")) {
        if (contains1ere || contains3eme) return false;
      }
    }
    
    return matchesCategory && matchesSearch;
  });

  // Calculate dynamic pagination
  const totalItems = filteredProducts.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedProducts = filteredProducts.slice(startIndex, startIndex + itemsPerPage);

  // Reset to first page when query parameters change
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedCategory, searchQuery]);

  const isStudentEligible = isStudent && isEligibleFor20Discount(userGrade, userSection);

  const getProductPricing = (prod: Product) => {
    const rawPrice = Number(prod.price) || 0;
    const finalPrice = isStudentEligible ? calculateDiscountedAmount(rawPrice, userGrade, userSection) : rawPrice;
    const originalPrice = prod.oldPrice && Number(prod.oldPrice) > rawPrice 
      ? Number(prod.oldPrice) 
      : (isStudentEligible && rawPrice > finalPrice ? rawPrice : prod.oldPrice);
    const hasDiscount = (originalPrice !== undefined && originalPrice > finalPrice);
    const discountPercent = hasDiscount && originalPrice ? Math.round(((originalPrice - finalPrice) / originalPrice) * 100) : 0;

    return {
      finalPrice,
      originalPrice,
      hasDiscount,
      discountPercent,
      is20Discount: isStudentEligible
    };
  };

  const addToCart = (product: Product) => {
    const existing = cart.some((item) => String(item.product.id) === String(product.id));
    if (existing) {
      // Produit déjà présent : conserver une seule occurrence (quantité = 1) sans dupliquer
      return;
    }

    const pricing = getProductPricing(product);
    const productWithPricing: Product = {
      ...product,
      price: pricing.finalPrice,
      oldPrice: pricing.originalPrice
    };

    setCart([...cart, { product: productWithPricing, quantity: 1 }]);

    // ❌ SÉCURITÉ : Ne pas notifier si AGENT ou ADMIN, ni si userId non défini
    const roleUpper = (userRole || "").toUpperCase();
    if (!userId || roleUpper === "AGENT" || roleUpper === "ADMIN") {
      return;
    }

    // Trigger AJAX notification uniquement pour l'élève concerné
    fetch("/api/notifications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId,
        target_user_id: userId,
        target_role: "STUDENT",
        title: "Article ajouté au panier",
        content: `Vous avez ajouté "${product.title}" à votre panier.`,
        type: "shopping"
      })
    })
      .then(() => window.dispatchEvent(new CustomEvent("refresh-notifications")))
      .catch((err) => console.error("Notification feedback failed:", err));
  };

  const removeFromCart = (productId: string) => {
    setCart(cart.filter((item) => String(item.product.id) !== String(productId)));
  };

  // Toggle wishlist state
  const toggleWishlist = (product: Product) => {
    const inWishlist = wishlist.some((p) => p.id === product.id);
    if (inWishlist) {
      setWishlist(wishlist.filter((p) => p.id !== product.id));
    } else {
      setWishlist([...wishlist, product]);

      // ❌ SÉCURITÉ : Ne pas notifier si AGENT ou ADMIN, ni si userId non défini
      const roleUpper = (userRole || "").toUpperCase();
      if (!userId || roleUpper === "AGENT" || roleUpper === "ADMIN") {
        return;
      }

      // Trigger AJAX notification
      fetch("/api/notifications", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId,
          target_user_id: userId,
          target_role: "STUDENT",
          title: "❤️ Ajouté à la liste d'envies",
          content: `"${product.title}" a été ajouté à vos favoris.`,
          type: "wishlist"
        })
      })
        .then(() => window.dispatchEvent(new CustomEvent("refresh-notifications")))
        .catch((err) => console.error("Notification feedback failed:", err));
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processReceiptFile(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      processReceiptFile(file);
    }
  };

  const processReceiptFile = (file: File) => {
    setUploadError(null);
    if (file.size > 10 * 1024 * 1024) {
      setUploadError("Le fichier sélectionné dépasse la taille maximale autorisée (10 Mo).");
      return;
    }
    setReceiptFile(file);
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result as string);
      setIsUploading(false);
    };
    reader.onerror = () => {
      setUploadError("Erreur lors de la lecture du fichier.");
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const totalCartPrice = cart.reduce((acc, item) => acc + item.product.price * item.quantity, 0);

  const handleCheckoutSubmit = async () => {
    if (cart.length === 0) return;
    setUploadError(null);

    if (paymentMethod !== "Direct" && !receiptPreview && !receiptFile) {
      setUploadError("Veuillez téléverser une numérisation ou photo de votre reçu de paiement (Optionnel uniquement pour Paiement Direct).");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("userId", userId);
      formData.append("cartItems", JSON.stringify(cart));
      formData.append("totalAmount", totalCartPrice.toString());
      formData.append("paymentMethod", paymentMethod);
      if (receiptFile) {
        formData.append("receiptFile", receiptFile);
      } else if (receiptPreview) {
        formData.append("receiptUrl", receiptPreview);
      } else if (paymentMethod === "Direct") {
        formData.append("receiptUrl", "Paiement Direct - Espèces au centre");
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        body: formData
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.msg || "Erreur lors de l'enregistrement de votre commande.");
      }
      const newInvoiceId = data.receiptId || "rcpt_sim_" + Math.random().toString(36).substring(2, 5);
      setInvoiceId(newInvoiceId);
      setCheckoutStep("success");
      setCart([]); // Reset basket
      setReceiptFile(null);
      setReceiptPreview(null);

      // Broadcast Real-time Notification to AGENT accounts & refresh general notifications
      try {
        const currentUserData = (() => {
          try {
            const raw = localStorage.getItem("current_user");
            return raw ? JSON.parse(raw) : null;
          } catch {
            return null;
          }
        })();

        const studentDisplayName = currentUserData?.fullName || currentUserData?.name || `Élève (#${userId})`;
        const paymentData = {
          studentName: studentDisplayName,
          studentId: userId,
          amount: totalCartPrice,
          method: paymentMethod,
          receiptId: newInvoiceId,
          timestamp: new Date().toISOString()
        };

        window.dispatchEvent(
          new CustomEvent("new-student-payment", {
            detail: {
              title: "💳 Nouveau paiement reçu",
              message: `${studentDisplayName} a effectué un paiement de ${totalCartPrice} DT (${paymentMethod}).`,
              data: paymentData
            }
          })
        );
      } catch (err) {
        console.error("Error dispatching payment notification:", err);
      }

      window.dispatchEvent(new CustomEvent("refresh-notifications"));
    } catch (err: any) {
      console.error("Checkout failed:", err);
      setUploadError(err.message || "Une erreur s'est produite lors de la transmission.");
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20 bg-white">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-[#10B981]" />
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-white text-[#1F2937] min-h-[500px]">
      
      {/* Top action buttons instead of full header */}
      <div className="flex justify-end gap-2.5 pb-2">
        <button
          onClick={() => {
            setCurrentTab("wishlist");
            setCheckoutStep("cart");
          }}
          className={`px-3 py-1.5 border border-[#E5E7EB] rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors ${
            currentTab === "wishlist" ? "bg-[#0F1E36] text-white" : "bg-white hover:bg-gray-50 text-gray-600"
          }`}
        >
          <Heart size={14} className={currentTab === "wishlist" ? "fill-current" : ""} />
          <span>Favoris ({wishlist.length})</span>
        </button>
        
        <button
          onClick={() => {
            setCurrentTab("panier");
            setCheckoutStep("cart");
          }}
          className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#0da673] text-white rounded-lg text-xs font-medium flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <ShoppingCart size={14} />
          <span>Panier ({cart.length}) - {totalCartPrice} DT</span>
        </button>
      </div>

      {currentTab === "wishlist" ? (
        /* FAVORITES VIEW */
        <div className="space-y-4">
          <h3 className="text-[#0F1E36] font-semibold text-sm">Ma Liste de Souhaits ({wishlist.length})</h3>
          {wishlist.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#E5E7EB] rounded-xl bg-white max-w-md mx-auto">
              <Heart size={24} className="text-gray-300 mx-auto mb-2" />
              <p className="font-semibold text-sm text-[#0F1E36]">Aucun coup de cœur</p>
              <p className="text-xs text-gray-400 mt-0.5">Visitez l'annuaire du shop et cliquez sur l'icône cœur.</p>
              <button
                onClick={() => setCurrentTab("shop")}
                className="mt-3.5 px-4 py-2 bg-[#10B981] text-white rounded-lg text-xs font-medium transition-colors cursor-pointer"
              >
                Retourner à l'inventaire
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
              {wishlist.map((prod) => {
                const badgeLabel = getPromoBadgeLabel(prod);
                const pricing = getProductPricing(prod);
                return (
                  <div key={prod.id} className="border border-[#E5E7EB] rounded-xl overflow-hidden bg-white flex flex-col justify-between relative">
                    <div className="relative">
                      {pricing.is20Discount ? (
                        <span className="absolute top-2 left-2 bg-red-600 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                          -20% Remise
                        </span>
                      ) : badgeLabel ? (
                        <span className="absolute top-2 left-2 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                          {badgeLabel}
                        </span>
                      ) : null}
                      <img src={prod.image} alt={prod.title} className="w-full h-36 object-cover border-b border-[#E5E7EB]" />
                    </div>
                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
                      <div>
                        <span className="text-[10px] font-semibold text-[#10B981] uppercase">{prod.category}</span>
                        <h4 className="font-bold text-[#0F1E36] text-sm mt-0.5 line-clamp-1 flex items-center gap-1.5">
                          {renderPackIcon(prod.icon, prod.category, 15, "text-[#10B981] shrink-0")}
                          {prod.title}
                        </h4>
                        <p className="text-gray-500 text-xs mt-1 line-clamp-2">{prod.description}</p>
                      </div>
                      <div className="mt-4 pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                        <div className="flex items-baseline gap-1">
                          {pricing.hasDiscount && pricing.originalPrice && (
                            <span className="text-[10px] font-bold text-gray-400 line-through">~~{pricing.originalPrice} DT~~</span>
                          )}
                          <span className={`font-extrabold text-sm ${pricing.hasDiscount ? "text-[#E31B23]" : "text-[#0F1E36]"}`}>{pricing.finalPrice} DT</span>
                        </div>
                        <div className="flex gap-1.5">
                          <button
                            onClick={() => addToCart(prod)}
                            className="p-1.5 bg-[#10B981] text-white rounded hover:bg-[#0da673] cursor-pointer"
                            title="Prendre cet article"
                          >
                            <ShoppingCart size={13} />
                          </button>
                          <button
                            onClick={() => toggleWishlist(prod)}
                            className="p-1.5 border border-[#E5E7EB] text-[#EF4444] rounded hover:bg-red-50 cursor-pointer"
                            title="Retirer"
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      ) : currentTab === "panier" ? (
        /* SHOPPING BASKET CHECKOUT WORKFLOW */
        <div className="space-y-4">
          <h3 className="text-[#0F1E36] font-semibold text-sm">Mon Panier d'Achat</h3>
          
          {checkoutStep === "cart" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-3">
                {cart.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-[#E5E7EB] rounded-xl max-w-md mx-auto bg-[#F9FAFB]">
                    <ShoppingCart size={24} className="text-gray-300 mx-auto mb-2" />
                    <p className="font-semibold text-sm text-[#0F1E36]">Votre panier est vide</p>
                    <p className="text-xs text-gray-500 mt-0.5">Ajoutez un guide ou un cours pour continuer.</p>
                    <button
                      onClick={() => setCurrentTab("shop")}
                      className="mt-3 px-4 py-2 bg-[#10B981] text-white rounded-lg text-xs font-medium cursor-pointer"
                    >
                      Aller au catalogue
                    </button>
                  </div>
                ) : (
                  cart.map((item) => (
                    <div
                      key={item.product.id}
                      className="border border-[#E5E7EB] rounded-xl p-3.5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white"
                    >
                      <img src={item.product.image} alt={item.product.title} className="w-14 h-14 rounded-lg object-cover border border-[#E5E7EB]" />
                      <div className="flex-1 min-w-0 text-xs">
                        <span className="text-[9px] font-semibold text-[#10B981] uppercase">{item.product.category}</span>
                        <h4 className="font-semibold text-[#0F1E36] text-sm truncate mt-0.5">{item.product.title}</h4>
                        <p className="text-gray-400 mt-0.5 truncate">{item.product.description}</p>
                      </div>
                      
                      <div className="flex items-center gap-3">
                        <div className="flex items-center px-2 py-1 border border-[#E5E7EB] rounded-lg bg-gray-50 text-[11px] font-semibold text-gray-700">
                          Qté : 1
                        </div>
                        
                        <div className="text-right min-w-[65px]">
                          <span className="font-semibold text-xs text-[#0F1E36]">{item.product.price} DT</span>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => removeFromCart(item.product.id)}
                          className="p-1.5 text-gray-400 hover:text-[#EF4444] rounded cursor-pointer transition-colors"
                          title="Supprimer du panier"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {cart.length > 0 && (
                <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-[#F9FAFB] space-y-4">
                  <h3 className="text-[#0F1E36] font-semibold text-sm border-b border-[#E5E7EB] pb-2">
                    Résumé de l'Évaluation
                  </h3>
                  <div className="space-y-2 text-xs text-[#1F2937]">
                    <div className="flex justify-between text-gray-500">
                      <span>Compteurs d'articles :</span>
                      <span>{cart.length}</span>
                    </div>
                    <div className="flex justify-between text-gray-500">
                      <span>Frais de dossier :</span>
                      <span className="text-[#10B981] font-mono">0 TND (Offert)</span>
                    </div>
                    <hr className="border-[#E5E7EB]" />
                    <div className="flex justify-between text-sm font-semibold text-[#10B981]">
                      <span>Montant global :</span>
                      <span>{totalCartPrice} TND</span>
                    </div>
                  </div>
                  
                  <button
                    onClick={() => setCheckoutStep("payment")}
                    className="w-full text-center py-2.5 bg-[#10B981] hover:bg-[#0da673] text-white rounded-lg text-xs font-semibold uppercase tracking-wider cursor-pointer transition-colors"
                  >
                    Valider mon Choix de Paiement
                  </button>
                </div>
              )}
            </div>
          )}

          {checkoutStep === "payment" && (
            <div className="max-w-2xl mx-auto border border-[#E5E7EB] rounded-2xl p-6 bg-[#F9FAFB] space-y-6 shadow-sm">
              <div className="flex items-center justify-between border-b border-gray-200 pb-3">
                <h3 className="text-[#0F1E36] font-extrabold text-base flex items-center gap-2">
                  <CreditCard size={20} className="text-[#10B981]" /> Mode de Règlement National
                </h3>
                <span className="text-xs bg-[#0F1E36] text-white font-bold px-2.5 py-1 rounded-full">
                  Total à payer : {totalCartPrice} DT
                </span>
              </div>
              
              <div className="p-3.5 bg-blue-50/40 border border-blue-200/60 rounded-xl text-xs text-gray-600 leading-relaxed">
                <p className="font-bold text-[#0A2540] mb-0.5">Instructions Administratives :</p>
                <p>Sélectionnez votre mode de règlement préféré ci-dessous pour activer vos cours et packs informatiques.</p>
              </div>

              {/* Radio Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {/* Option 1: D17 */}
                <div
                  onClick={() => setPaymentMethod("D17")}
                  className={`p-4 border-2 rounded-2xl cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === "D17"
                      ? "border-[#10B981] bg-emerald-50/30 shadow-md ring-2 ring-[#10B981]/20"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${paymentMethod === "D17" ? "bg-[#10B981] text-white" : "bg-gray-100 text-[#0A2540]"}`}>
                    <PaymentMethodIcon 
                      methodId="d17" 
                      fallbackIconSize={20}
                      fallbackIconClassName={paymentMethod === "D17" ? "text-white" : "text-[#0A2540]"}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#0A2540]">D17 Mobile</h4>
                      {paymentMethod === "D17" && <span className="text-[9px] bg-[#10B981] text-white font-black px-1.5 py-0.5 rounded uppercase">Choisi</span>}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">La Poste Tunisienne</p>
                  </div>
                </div>

                {/* Option 2: RIB */}
                <div
                  onClick={() => setPaymentMethod("RIB")}
                  className={`p-4 border-2 rounded-2xl cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === "RIB"
                      ? "border-[#10B981] bg-emerald-50/30 shadow-md ring-2 ring-[#10B981]/20"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${paymentMethod === "RIB" ? "bg-[#10B981] text-white" : "bg-gray-100 text-[#0A2540]"}`}>
                    <PaymentMethodIcon 
                      methodId="rib" 
                      fallbackIconSize={20}
                      fallbackIconClassName={paymentMethod === "RIB" ? "text-white" : "text-[#0A2540]"}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#0A2540]">Virement RIB</h4>
                      {paymentMethod === "RIB" && <span className="text-[9px] bg-[#10B981] text-white font-black px-1.5 py-0.5 rounded uppercase">Choisi</span>}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Banque BIAT</p>
                  </div>
                </div>

                {/* Option 3: Wafacash */}
                <div
                  onClick={() => setPaymentMethod("Wafacash")}
                  className={`p-4 border-2 rounded-2xl cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === "Wafacash"
                      ? "border-[#10B981] bg-emerald-50/30 shadow-md ring-2 ring-[#10B981]/20"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${paymentMethod === "Wafacash" ? "bg-[#10B981] text-white" : "bg-gray-100 text-[#0A2540]"}`}>
                    <PaymentMethodIcon 
                      methodId="wafacash" 
                      fallbackIconSize={20}
                      fallbackIconClassName={paymentMethod === "Wafacash" ? "text-white" : "text-[#0A2540]"}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-xs text-[#0A2540]">Wafacash</h4>
                      {paymentMethod === "Wafacash" && <span className="text-[9px] bg-[#10B981] text-white font-black px-1.5 py-0.5 rounded uppercase">Choisi</span>}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Mandat Express</p>
                  </div>
                </div>

                {/* Option 4: Direct */}
                <div
                  onClick={() => {
                    setPaymentMethod("Direct");
                    window.dispatchEvent(new CustomEvent('open-footer-location'));
                  }}
                  className={`p-4 border-2 rounded-2xl cursor-pointer flex items-start gap-3 transition-all ${
                    paymentMethod === "Direct"
                      ? "border-[#00b87c] bg-emerald-50/70 shadow-md ring-2 ring-[#00b87c]/20 scale-[1.01]"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50/50"
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl shrink-0 flex items-center justify-center overflow-hidden ${paymentMethod === "Direct" ? "bg-[#00b87c] text-white" : "bg-emerald-100 text-[#00b87c]"}`}>
                    <PaymentMethodIcon 
                      methodId="direct" 
                      fallbackIconSize={20}
                      fallbackIconClassName={paymentMethod === "Direct" ? "text-white" : "text-[#00b87c]"}
                    />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-bold text-xs text-[#0A2540]">Paiement Direct</h4>
                        <span className="text-[9px] text-emerald-700 font-extrabold bg-emerald-100 px-1.5 py-0.5 rounded-full">
                          📍 Adresse
                        </span>
                      </div>
                      {paymentMethod === "Direct" && (
                        <span className="text-[9px] bg-[#00b87c] text-white font-black px-2 py-0.5 rounded-lg uppercase shadow-xs flex items-center gap-0.5">
                          <Check size={10} /> CHOISI
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-gray-500 mt-0.5">Espèces au Centre</p>
                  </div>
                </div>
              </div>

              {/* Dynamic Details Panel based on selected payment method */}
              {paymentMethod === "D17" && (
                <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs space-y-1.5 shadow-2xs">
                  <p className="font-bold text-[#0F1E36] text-xs flex items-center gap-1.5">
                    💳 Application D17 (La Poste Tunisienne) :
                  </p>
                  <p className="font-mono text-sm text-[#10B981] font-extrabold select-all">
                    Transférer au numéro : {settings.payments.d17.phone}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    {settings.payments.d17.notes || `Notez bien le numéro ou le nom de l'élève dans le mémo de transaction D17 pour validation instantanée par ${settings.contact.author}.`}
                  </p>
                </div>
              )}

              {paymentMethod === "RIB" && (
                <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs space-y-1.5 shadow-2xs">
                  <p className="font-bold text-[#0F1E36] text-xs flex items-center gap-1.5">
                    🏦 Coordonnées Bancaires (RIB {settings.payments.rib.bankName}) :
                  </p>
                  <p className="font-mono text-sm text-[#E31B23] font-extrabold select-all">
                    {settings.payments.rib.ribNumber}
                  </p>
                  <p className="text-[11px] text-gray-500 leading-relaxed">
                    À l'ordre de : {settings.payments.rib.accountOrder}. Conservez votre reçu de virement pour activation.
                  </p>
                </div>
              )}

              {paymentMethod === "Wafacash" && (
                <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs space-y-2 shadow-2xs">
                  <p className="font-bold text-[#0F1E36] text-xs flex items-center gap-1.5">
                    ⚡ Wafacash / Mandat Express :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-gray-50 p-3 rounded-lg border border-gray-150 font-mono text-xs">
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-sans font-bold">Destinataire</span>
                      <strong className="text-[#0A2540]">{settings.payments.wafacash.recipient}</strong>
                    </div>
                    <div>
                      <span className="text-gray-400 block text-[10px] uppercase font-sans font-bold">Institution</span>
                      <strong className="text-[#0A2540]">{settings.contact.institution}</strong>
                    </div>
                  </div>
                  <p className="text-[11px] text-amber-700 font-semibold bg-amber-50/80 p-2 rounded border border-amber-200/60 leading-normal">
                    👉 {settings.payments.wafacash.instructions || "Conservez votre reçu de transfert Wafacash et téléversez-le ci-dessous pour validation."}
                  </p>
                </div>
              )}

              {paymentMethod === "Direct" && (
                <div className="p-4 bg-white border border-gray-200 rounded-xl text-xs space-y-2.5 shadow-2xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <p className="font-bold text-[#0F1E36] text-xs flex items-center gap-1.5">
                      🏢 Paiement Direct / Espèces au Centre :
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        window.dispatchEvent(new CustomEvent('open-footer-location'));
                        const el = document.getElementById('footer-location');
                        if (el) {
                          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                          el.classList.add('ring-4', 'ring-[#00b87c]', 'transition-all', 'duration-500');
                          setTimeout(() => el.classList.remove('ring-4', 'ring-[#00b87c]'), 2000);
                        }
                      }}
                      className="text-[11px] font-extrabold text-[#00b87c] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>Afficher dans le footer</span>
                      <ChevronDown size={14} />
                    </button>
                  </div>
                  <div className="space-y-1.5 bg-gray-50 p-3 rounded-lg border border-gray-150 text-xs">
                    <p className="flex items-center gap-2 text-[#0A2540] font-semibold">
                      <MapPin size={14} className="text-[#00b87c] shrink-0" />
                      <span>Adresse : <strong className="text-black">{settings.payments.cash.location}</strong></span>
                    </p>
                    <p className="flex items-center gap-2 text-[#0A2540] font-semibold">
                      <Clock size={14} className="text-slate-500 shrink-0" />
                      <span>Horaires : <strong className="text-black">{settings.payments.cash.hours}</strong></span>
                    </p>
                  </div>
                  <p className="text-[11px] text-emerald-800 font-medium bg-emerald-50 p-2 rounded border border-emerald-200/80 leading-normal">
                    ℹ️ Votre demande sera mise en attente et automatiquement activée dès votre règlement sur place.
                  </p>
                </div>
              )}

              {/* Upload Section - Hidden/Optional for Direct payment */}
              {paymentMethod === "Direct" ? (
                <div className="p-5 border-2 border-dashed border-blue-300 bg-blue-50/50 rounded-2xl text-center space-y-1.5">
                  <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1">
                    <Building2 size={20} />
                  </div>
                  <h4 className="font-bold text-xs text-[#0A2540]">Aucun reçu requis immédiatement</h4>
                  <p className="text-[11px] text-gray-600 max-w-md mx-auto leading-relaxed">
                    Vous avez choisi de régler en espèces au <strong className="text-[#0A2540]">Centre Le Plus / Al Idhafa</strong>. Vous pouvez enregistrer votre commande directement sans téléverser de fichier.
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-black text-[#0A2540] uppercase tracking-wider">
                      Numérisation du reçu de paiement (IMAGE / PDF) :
                    </label>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded border border-red-150">Requis</span>
                  </div>

                  <div
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onClick={() => !receiptPreview && fileInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-40 relative overflow-hidden group ${
                      receiptPreview
                        ? "border-[#10B981] bg-emerald-50/10 cursor-default"
                        : "border-gray-300 hover:border-[#133F85] bg-gray-50/50 hover:bg-blue-50/20 cursor-pointer"
                    }`}
                  >
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/png,image/jpeg,image/jpg,image/webp,application/pdf"
                      onChange={handleFileSelect}
                      className="hidden"
                    />

                    {receiptPreview ? (
                      <div className="w-full flex flex-col items-center justify-center space-y-3 py-2">
                        {receiptFile?.type === "application/pdf" || receiptFile?.name?.endsWith(".pdf") ? (
                          <div className="flex items-center gap-3 bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm max-w-sm w-full">
                            <div className="p-2.5 bg-red-50 text-red-600 rounded-lg shrink-0">
                              <FileText size={24} />
                            </div>
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-xs font-extrabold text-[#0A2540] truncate">{receiptFile?.name || "Document.pdf"}</p>
                              <p className="text-[10px] text-gray-400">PDF • {( (receiptFile?.size || 0) / 1024 / 1024 ).toFixed(2)} Mo</p>
                            </div>
                          </div>
                        ) : (
                          <div className="w-24 h-24 rounded-2xl overflow-hidden border-2 border-[#10B981] shadow-md relative bg-white flex items-center justify-center">
                            <img src={receiptPreview} alt="Aperçu reçu" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#10B981] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                          <Check size={14} /> Justificatif téléversé avec succès
                        </div>
                        <div className="flex items-center gap-2 pt-1">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              fileInputRef.current?.click();
                            }}
                            className="text-[11px] text-[#133F85] hover:bg-blue-50 font-bold px-3 py-1.5 rounded-xl border border-blue-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <RefreshCw size={12} /> Remplacer
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setReceiptFile(null);
                              setReceiptPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = "";
                            }}
                            className="text-[11px] text-red-600 hover:bg-red-50 font-bold px-3 py-1.5 rounded-xl border border-red-200 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                          >
                            <Trash2 size={12} /> Supprimer
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="w-12 h-12 rounded-2xl bg-white shadow-sm border border-gray-100 flex items-center justify-center mb-2.5 group-hover:scale-110 group-hover:border-[#133F85]/30 transition-all text-[#133F85]">
                          <CloudArrowUp size={24} />
                        </div>
                        <div className="text-xs font-extrabold text-[#0A2540]">
                          Déposez votre reçu de paiement ici ou <span className="text-[#133F85] underline">parcourez vos fichiers</span>
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1 max-w-sm leading-relaxed">
                          Formats acceptés : PNG, JPG, JPEG, WEBP et PDF (Max 10 Mo).
                        </p>
                      </>
                    )}
                  </div>
                </div>
              )}

              {uploadError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-xs font-bold flex items-center gap-2">
                  <AlertCircle size={16} className="shrink-0" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button
                  onClick={() => setCheckoutStep("cart")}
                  className="w-full sm:w-auto px-6 py-3 border border-gray-300 rounded-xl text-gray-700 font-bold hover:bg-gray-50 cursor-pointer transition-all text-xs"
                >
                  Modifier le Panier
                </button>
                <button
                  onClick={handleCheckoutSubmit}
                  className="w-full sm:flex-1 py-3.5 bg-gradient-to-r from-[#00A859] to-[#0da673] hover:from-[#008f4c] hover:to-[#00A859] text-white rounded-xl font-extrabold hover:shadow-lg hover:shadow-emerald-500/20 cursor-pointer transition-all uppercase tracking-wider text-xs flex items-center justify-center gap-2"
                >
                  Enregistrer Ma Demande <ArrowRight size={15} />
                </button>
              </div>
            </div>
          )}

          {checkoutStep === "success" && (
            <div className="max-w-md mx-auto bg-white p-8 rounded-3xl border border-slate-100 shadow-sm text-center space-y-5">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <Check className="w-6 h-6 stroke-[2.5]" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-black text-slate-800 flex items-center justify-center gap-2">
                  <span>🎉</span> Demande Enregistrée !
                </h3>
                <p className="text-xs text-slate-500 font-medium leading-relaxed">
                  Votre demande d'acquisition est sécurisée sous le jeton d'authentification unique :
                </p>
              </div>
              <div className="py-2.5 px-4 bg-slate-50 border border-slate-100 rounded-xl text-xs font-mono font-bold text-slate-700 tracking-wider">
                {invoiceId || 'rcpt_ry576ct'}
              </div>
              <p className="text-xs text-slate-500 font-medium leading-relaxed max-w-xs mx-auto">
                Une fois le versement physique validé par le service commercial, vos acquis s'activeront instantanément.
              </p>
              <button
                type="button"
                onClick={() => {
                  setCheckoutStep("cart");
                  setCurrentTab("shop");
                }}
                className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl text-xs transition-all shadow-sm active:scale-95 cursor-pointer"
              >
                Retourner à la boutique
              </button>
            </div>
          )}
        </div>
      ) : (
        /* SHOP CATALOGUE */
        <div className="space-y-4">
          {/* Notification Remise 20% si éligible */}
          {isStudentEligible && (
            <div className="bg-gradient-to-r from-red-500 to-rose-600 text-white rounded-xl p-3.5 flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-1 bg-white text-red-600 font-black text-[11px] rounded-lg uppercase shadow-xs">
                  -20% Remise
                </span>
                <div>
                  <p className="font-extrabold text-xs">
                    Tarif préférentiel appliqué automatiquement
                  </p>
                  <p className="text-[11px] text-red-100">
                    Filière éligible ({userGrade}{userSection ? ` - ${userSection}` : ''}) : 20% de réduction immédiate sur tous les packs et articles.
                  </p>
                </div>
              </div>
              <Sparkles size={18} className="text-white/80 shrink-0 hidden sm:block" />
            </div>
          )}

          {/* Filters Bar */}
          <div className="flex flex-col md:flex-row gap-3 justify-between items-center bg-[#F9FAFB] p-3 border border-[#E5E7EB] rounded-xl text-xs">
            <div className="flex flex-wrap gap-1.5">
              {["All", "Full Access", "Pack PDF", "Cours Video", "Hardware"].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-[#0F1E36] text-white border-[#0F1E36]"
                      : "bg-white text-gray-600 border-[#E5E7EB] hover:bg-gray-50"
                  }`}
                >
                  {cat === "All" ? "Tous les produits" : cat}
                </button>
              ))}
            </div>

            <input
              type="text"
              placeholder="Chercher par mot-clé..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-56 text-xs"
            />
          </div>

          {/* Grid list of catalog items with 6-product dynamic pagination */}
          {paginatedProducts.length === 0 ? (
            <div className="p-8 text-center border border-dashed border-[#E5E7EB] rounded-xl bg-white max-w-sm mx-auto">
              <AlertCircle size={28} className="text-gray-300 mx-auto " />
              <p className="font-semibold text-sm text-[#0F1E36] mt-1">Aucun produit ne correspond</p>
              <p className="text-xs text-gray-400">Il n'y a aucun coffret disponible pour votre niveau scolaire.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
              {paginatedProducts.map((prod) => {
                const isItemInWishlist = wishlist.some((w) => w.id === prod.id);
                const badgeLabel = getPromoBadgeLabel(prod);
                const pricing = getProductPricing(prod);
                return (
                  <div
                    key={prod.id}
                    className="border border-[#E5E7EB] dark:border-slate-700 rounded-2xl overflow-hidden hover:border-slate-350 dark:hover:border-slate-500 transition-all duration-300 bg-white dark:bg-slate-800 flex flex-col justify-between hover:shadow-md hover:-translate-y-0.5 group relative"
                  >
                    <div className="relative">
                      {pricing.is20Discount ? (
                        <span className="absolute top-2.5 left-2.5 bg-red-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md z-10 flex items-center gap-1">
                          🔥 -20% Remise
                        </span>
                      ) : badgeLabel ? (
                        <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-md z-10 flex items-center gap-1 animate-pulse">
                          🔥 {badgeLabel}
                        </span>
                      ) : null}
                      <img src={prod.image} alt={prod.title} className="w-full h-40 object-cover border-b border-[#E5E7EB]" />
                      <button
                        onClick={() => toggleWishlist(prod)}
                        className="absolute top-2.5 right-2.5 p-1.5 bg-white rounded-full border border-gray-150 shadow-xs cursor-pointer hover:bg-red-50 text-[#EF4444] z-10"
                      >
                        <Heart size={13} className={isItemInWishlist ? "fill-current animate-pulse" : ""} />
                      </button>
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between space-y-3 bg-white">
                      <div>
                        <div className="flex justify-between items-center text-[9px] font-semibold text-[#10B981] uppercase">
                          <span>{prod.category}</span>
                          <span className="bg-emerald-50 px-1 py-0.5 rounded text-[8px]">Licence active</span>
                        </div>
                        <h4 className="font-semibold text-[#0F1E36] text-sm mt-0.5 line-clamp-1 group-hover:text-[#10B981] transition-colors flex items-center gap-1.5">
                          {renderPackIcon(prod.icon, prod.category, 15, "text-[#10B981] shrink-0")}
                          {prod.title}
                        </h4>
                        <p className="text-gray-400 text-[11px] mt-0.5 leading-normal line-clamp-2">
                          {prod.description}
                        </p>
                      </div>

                      <div className="pt-3 border-t border-[#E5E7EB] flex items-center justify-between text-xs">
                        <div className="flex items-baseline gap-1.5">
                          {pricing.hasDiscount && pricing.originalPrice && (
                            <span className="text-xs font-bold text-gray-400 line-through">~~{pricing.originalPrice} DT~~</span>
                          )}
                          <span className={`font-extrabold text-base ${pricing.hasDiscount ? "text-[#E31B23]" : "text-[#0F1E36]"}`}>
                            {pricing.finalPrice} DT
                          </span>
                        </div>
                        
                        <button
                          onClick={() => addToCart(prod)}
                          className="px-3 py-1.5 bg-[#10B981] hover:bg-[#0da673] text-white rounded-lg font-semibold flex items-center gap-1 cursor-pointer transition-colors text-xs"
                        >
                          <ShoppingCart size={11} />
                          <span>Sélectionner</span>
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Dynamic Pagination Footer Control Area */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-[#E5E7EB] text-xs font-semibold">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-3.5 py-1.5 border border-[#E5E7EB] text-gray-600 rounded-lg disabled:opacity-40 cursor-pointer hover:bg-gray-50 transition-colors"
              >
                ◀ Précédent
              </button>

              <span className="text-[10px] text-gray-400 font-mono">
                Page {currentPage} de {totalPages}
              </span>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-3.5 py-1.5 bg-[#10B981] hover:bg-[#0da673] text-white rounded-lg disabled:opacity-40 cursor-pointer transition-colors"
              >
                Suivant ▶
              </button>
            </div>
          )}

        </div>
      )}

    </div>
  );
}
