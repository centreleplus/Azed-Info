import React, { useState, useRef, useEffect } from "react";
import { Language, translations } from "../lib/translations";
import { ArrowRight, ArrowLeft, Upload as CloudArrowUp, ShieldCheck, CreditCard, Landmark as Bank, Building2, Send, MapPin, Clock, AlertCircle, RefreshCw } from "lucide-react";
import { useSettings } from "./SettingsContext";
import { PaymentMethodIcon } from "./PaymentMethodIcon";
import BackButton from "./BackButton";
import { CircleBackButton } from "./CircleBackButton";
import SignUpStep1 from "./SignUpStep1";
import SignUpStep2 from "./SignUpStep2";
import SignUpStep3 from "./SignUpStep3";
import { INITIAL_CAMPAIGN_PACKS, CampaignPack } from "./campaignsData";
import { OfferPack, INITIAL_OFFERS } from "../types/offers";
import { STUDENT_TIERS } from "../types/access";
import { calculateDiscountedAmount, isEligibleFor20Discount } from "../utils/pricingDiscount";

interface RegisterMultiStepProps {
  onSuccess: () => void;
  onBackToLogin: () => void;
  onBackToLanding?: () => void;
  currentLanguage?: Language;
}

export default function RegisterMultiStep({ onSuccess, onBackToLogin, onBackToLanding, currentLanguage = "fr" }: RegisterMultiStepProps) {
  const { settings } = useSettings();
  const t = translations[currentLanguage];
  const [step, setStep] = useState(1);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  
  // Step 1: Profil State (mapped to exact spec & backend expectations)
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    level: "4ème Année",
    grade: "4ème Année",
    niveau: "4ème Année",
    section: "Sciences de l'Informatique",
    branche: "Sciences de l'Informatique",
    school: "",
    highSchool: "",
    governorate: "Tunis",
    city: "Tunis"
  });

  // Selected Offer/Pack State
  const [offersList, setOffersList] = useState<OfferPack[]>(INITIAL_OFFERS);
  const [selectedPack, setSelectedPack] = useState<OfferPack>(INITIAL_OFFERS[1]); // Default to Premium

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    try {
      const res = await fetch("/api/signup-offers");
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          const normalized: OfferPack[] = data.map((o: any) => {
            const finalP = o.finalPrice !== undefined ? Number(o.finalPrice) : (o.price !== undefined ? Number(o.price) : 0);
            const origP = o.originalPrice !== undefined ? Number(o.originalPrice) : finalP;
            const discountP = (origP && origP > finalP) ? Math.round(((origP - finalP) / origP) * 100) : 0;

            if (o.category && o.badgeLabel) {
              return {
                ...o,
                price: finalP,
                finalPrice: finalP,
                originalPrice: origP,
                discountPercentage: discountP
              } as OfferPack;
            }
            const isFree = finalP === 0;
            const category = (isFree ? "FREEMIUM" : (o.id === "pack_annual" || o.category === "PREMIUM_PLUS_PLUS" ? "PREMIUM_PLUS_PLUS" : o.category === "PREMIUM_PLUS" ? "PREMIUM_PLUS" : "PREMIUM")) as any;
            const tierInfo = STUDENT_TIERS[category] || STUDENT_TIERS.PREMIUM;
            return {
              id: o.id || `pack-${Date.now()}`,
              category,
              title: o.title || "Offre",
              badgeLabel: o.badge || o.badgeLabel || tierInfo.label,
              badgeBg: o.badgeBg || tierInfo.badgeBg,
              badgeText: o.badgeText || tierInfo.badgeText,
              badgeBorder: o.badgeBorder || tierInfo.badgeBorder,
              iconName: o.iconName || tierInfo.iconName,
              price: finalP,
              finalPrice: finalP,
              originalPrice: origP,
              discountPercentage: discountP,
              period: o.period || (isFree ? "Gratuit" : "Trimestre"),
              description: o.description || "",
              features: Array.isArray(o.features) ? o.features.map((f: any) => ({
                text: typeof f === "string" ? f : f.text,
                included: typeof f === "string" ? true : (f.included !== undefined ? f.included : !f.isLocked)
              })) : [],
              isPopular: Boolean(o.isPopular || o.isBest),
              isActive: o.isActive !== undefined ? Boolean(o.isActive) : true
            };
          });
          setOffersList(normalized);
        }
      }
    } catch (err) {
      console.error("Error fetching signup offers in RegisterMultiStep:", err);
    }
  };

  // Step 4: Payment Offline Receipt State (when choosing Premium)
  const [paymentMethod, setPaymentMethod] = useState<"RIB" | "D17" | "Wafacash" | "Direct">("D17");
  const [receiptPreview, setReceiptPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("Le fichier est trop volumineux. La taille maximale est de 10 Mo.");
      return;
    }
    setIsUploading(true);
    const reader = new FileReader();
    reader.onload = () => {
      setReceiptPreview(reader.result as string);
      setIsUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const validateStep1 = () => {
    const fullName = formData.fullName?.trim();
    const phone = formData.phone?.trim();
    const email = formData.email?.trim();
    const password = formData.password;
    const confirmPassword = formData.confirmPassword;
    const level = formData.level || formData.grade || (formData as any).niveau;
    const branch = formData.section || (formData as any).branche || (formData as any).branch;
    const schoolYear = (formData as any).schoolYear || "2026 / 2027";
    const school = formData.school?.trim() || formData.highSchool?.trim() || (formData as any).option?.trim();
    const governorate = formData.governorate?.trim() || formData.city?.trim();

    // Vérification que tous les champs obligatoires sont remplis
    if (!fullName || !phone || !email || !password || !confirmPassword || !level || !branch || !schoolYear || !school || !governorate) {
      setErrorMsg("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    // Validation numéro de téléphone (exactement 8 chiffres)
    if (!/^\d{8}$/.test(phone)) {
      setErrorMsg("Le numéro de téléphone doit comporter exactement 8 chiffres.");
      return;
    }

    if (password.length < 6) {
      setErrorMsg("Le mot de passe doit comporter au moins 6 caractères.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg("Les mots de passe ne correspondent pas. Veuillez vérifier votre confirmation.");
      return;
    }

    setErrorMsg(null);
    setStep(2);
  };

  // Step 2 Action A: Direct Freemium
  const handleRequestFreemium = (pack?: OfferPack) => {
    const freemiumPack = pack || offersList.find(p => p.isActive && (p.category === 'FREEMIUM' || p.price === 0)) || {
      id: "pack-freemium",
      category: "FREEMIUM",
      title: "Accès Libre (Freemium)",
      badgeLabel: "Freemium",
      badgeBg: "bg-slate-100",
      badgeText: "text-slate-700",
      badgeBorder: "border-slate-300",
      iconName: "User",
      price: 0,
      period: "Gratuit",
      description: "Donne quelques droits d'accès à l'utilisateur : généralement des démos de cours, de fiches, d'exercices et de quizs.",
      features: [
        { text: "Démos de cours et résumés", included: true },
        { text: "Accès standard au Sandbox Python", included: true },
        { text: "Extraits d'exercices et quizs", included: true },
        { text: "Examens blancs complets", included: false }
      ],
      isActive: true
    };
    setSelectedPack(freemiumPack);
    handleFinalSubmit(freemiumPack);
  };

  // Step 2 Action B: Go to Step 3 (Premium Tiers)
  const handleGoToPremium = () => {
    setErrorMsg(null);
    setStep(3);
  };

  // Step 3 Action: Select specific Premium Tier -> Go to Step 4 (Payment/Receipt)
  const handleSelectPremiumPack = (packOption: CampaignPack | any) => {
    if (packOption.originalPack) {
      setSelectedPack(packOption.originalPack);
      setErrorMsg(null);
      setStep(4);
      return;
    }

    const isEssentiel = packOption.category === 'Essentiel' || packOption.category === 'ESSENTIEL' || packOption.id === 'pack-4' || packOption.id === 'pack-essentiel';
    const isAnnual = packOption.category === 'Annuel' || packOption.id === 'pack-3' || packOption.id === 'pack_annual' || packOption.id === 'PREMIUM_PLUS_PLUS' || packOption.category === 'PREMIUM_PLUS_PLUS';
    const isPython = packOption.category === 'Python' || packOption.id === 'pack-2' || packOption.id === 'PREMIUM_PLUS' || packOption.category === 'PREMIUM_PLUS';

    const categoryKey = (
      isEssentiel 
        ? 'ESSENTIEL' 
        : isAnnual 
          ? 'PREMIUM_PLUS_PLUS' 
          : isPython 
            ? 'PREMIUM_PLUS' 
            : 'PREMIUM'
    ) as any;
    
    const tInfo = STUDENT_TIERS[categoryKey] || STUDENT_TIERS.PREMIUM;
    const is20 = isEligibleFor20Discount(formData.level || formData.grade, formData.section);

    let finalP: number;
    let origP: number;

    if (packOption.finalPrice !== undefined && packOption.originalPrice !== undefined && Number(packOption.originalPrice) > Number(packOption.finalPrice)) {
      // Le pack a déjà été calculé avec précision lors de la sélection
      finalP = Number(packOption.finalPrice);
      origP = Number(packOption.originalPrice);
    } else {
      const baseP = packOption.finalPrice !== undefined 
        ? Number(packOption.finalPrice) 
        : (packOption.price !== undefined ? Number(packOption.price) : (isAnnual ? 290 : 120));
      finalP = is20 ? calculateDiscountedAmount(baseP, formData.level || formData.grade, formData.section) : baseP;
      origP = is20 
        ? (packOption.originalPrice && Number(packOption.originalPrice) > baseP ? Number(packOption.originalPrice) : baseP) 
        : (packOption.originalPrice !== undefined ? Number(packOption.originalPrice) : baseP);
    }

    const rawFeatures = Array.isArray(packOption.features)
      ? packOption.features.map((f: any) => typeof f === 'string' ? { text: f, included: true } : f)
      : [
          { text: "Tous les cours, fiches, devoirs et corrigés", included: true },
          { text: "Sandbox Python BAC & Sauvegarde Cloud", included: true },
          { text: "Accès aux Séances Live & Corrigés", included: categoryKey !== 'PREMIUM' },
          { text: "Séances de révisions finales BAC & Suivi", included: categoryKey === 'PREMIUM_PLUS_PLUS' || categoryKey === 'ESSENTIEL' }
        ];

    const fullPack: OfferPack = {
      id: packOption.id || `pack-${Date.now()}`,
      category: categoryKey,
      title: packOption.title || (isAnnual ? 'Forfait Annuel Intégral' : 'Pack Python & Trimestre'),
      badgeLabel: packOption.badgeLabel || packOption.badge || tInfo.label,
      badgeBg: isEssentiel ? 'bg-amber-100' : tInfo.badgeBg,
      badgeText: isEssentiel ? 'text-amber-800' : tInfo.badgeText,
      badgeBorder: isEssentiel ? 'border-amber-300' : tInfo.badgeBorder,
      iconName: isEssentiel ? 'Crown' : tInfo.iconName,
      price: finalP,
      finalPrice: finalP,
      originalPrice: origP,
      discountPercentage: origP > finalP ? Math.round(((origP - finalP) / origP) * 100) : 0,
      period: packOption.period || (isAnnual ? 'Annuel' : 'Trimestre'),
      description: packOption.description || '',
      features: rawFeatures,
      isPopular: Boolean(packOption.isPopular),
      isActive: true,
      autoFullAccess: Boolean(packOption.autoAccessAllResources || isEssentiel || categoryKey === 'PREMIUM_PLUS_PLUS')
    };

    setSelectedPack(fullPack);
    setErrorMsg(null);
    setStep(4);
  };

  const handleFinalSubmit = async (packToSubmit?: OfferPack) => {
    const activePack = packToSubmit || selectedPack;
    const isFreemium = activePack.category === "FREEMIUM" || activePack.price === 0;

    if (!isFreemium && paymentMethod !== "Direct" && !receiptPreview) {
      setErrorMsg("Veuillez téléverser une photo claire ou un PDF de votre reçu de paiement pour finaliser l'inscription (non requis pour le Paiement Direct au Centre).");
      return;
    }

    try {
      // Valeur numérique exacte et finale du pack sélectionné (232 DT pour Annuel, 96 DT pour Trimestre avec RE)
      const exactFinalAmount = isFreemium 
        ? 0 
        : (activePack.finalPrice !== undefined && Number(activePack.finalPrice) > 0 
            ? Number(activePack.finalPrice) 
            : (activePack.price !== undefined ? Number(activePack.price) : 120));

      const payload = {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        phone: formData.phone.trim(),
        password: formData.password,
        grade: formData.level || formData.grade || (formData as any).niveau || "4ème Année",
        section: formData.section || (formData as any).branche || "Sciences de l'Informatique",
        city: formData.governorate || formData.city || "Tunis",
        highSchool: formData.school || formData.highSchool || "Lycée",
        amount: exactFinalAmount,
        paymentMethod: isFreemium ? "D17" : paymentMethod,
        receiptUrl: isFreemium ? "" : (receiptPreview || (paymentMethod === "Direct" ? "Paiement Direct - Espèces au centre" : "")),
        accountType: isFreemium ? "freemium" : "premium",
        tier: activePack.category,
        tierCategory: activePack.category,
        tierBadge: activePack.badgeLabel,
        packTitle: activePack.title,
        packId: activePack.id
      };

      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.msg || "Une erreur s'est produite.");
      }

      if (isFreemium) {
        alert("Félicitations ! Votre compte Freemium gratuit a été créé avec succès ! Connectez-vous dès maintenant.");
      } else {
        alert(`Votre demande d'inscription d'élève (${activePack.badgeLabel}) a été soumise avec succès ! Vous êtes redirigé vers l'écran de connexion.`);
      }
      onSuccess();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const handleBack = () => {
    if (step === 1) {
      if (onBackToLanding) {
        onBackToLanding();
      } else {
        onBackToLogin();
      }
    } else if (step === 2) {
      setStep(1);
    } else if (step === 3) {
      setStep(2);
    } else if (step === 4) {
      setStep(3);
    }
  };

  return (
    <div className="w-full bg-white text-black select-none max-w-5xl mx-auto px-4 py-2" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
      {errorMsg && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center justify-between shadow-xs max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <AlertCircle size={16} className="shrink-0 text-red-500" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-red-500 hover:text-red-700 font-bold ml-2 cursor-pointer">✕</button>
        </div>
      )}

      {/* ÉTAPE 1: Profil */}
      {step === 1 && (
        <SignUpStep1
          formData={formData}
          setFormData={setFormData}
          onNext={validateStep1}
          onBackToLogin={onBackToLogin}
        />
      )}

      {/* ÉTAPE 2: Choix de l'accès (Freemium vs Premium) */}
      {step === 2 && (
        <SignUpStep2
          packs={offersList}
          onRequestFreemium={handleRequestFreemium}
          onGoToPremium={handleGoToPremium}
          onBack={() => setStep(1)}
        />
      )}

      {/* ÉTAPE 3: Sélection de la formule Premium détaillée */}
      {step === 3 && (
        <SignUpStep3
          packs={offersList}
          onSelectPack={handleSelectPremiumPack}
          onBack={() => setStep(2)}
          grade={formData.level || formData.grade}
          section={formData.section}
        />
      )}

      {/* ÉTAPE 4 (Paiement pour formule Premium choisie) */}
      {step === 4 && (
        <div className="max-w-2xl mx-auto space-y-6 bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm text-left">
          <div className="flex justify-between items-center pb-2 border-b border-slate-100">
            <span className="px-3 py-1 bg-emerald-700 text-white font-black text-[10px] rounded-full uppercase tracking-wider">
              Règlement & Confirmation
            </span>
            <CircleBackButton onClick={() => setStep(3)} label="Retour aux formules" />
          </div>

          <div className="p-4 border-2 border-emerald-500 bg-emerald-50 rounded-2xl text-slate-800 flex items-center justify-between flex-wrap gap-2">
            <div>
              <span className="text-xs text-slate-500 font-medium block">Formule sélectionnée :</span>
              <span className="font-black text-[#0A2540] text-base">{selectedPack.title}</span>
              <div className="flex items-center gap-2 mt-1">
                <span className="text-emerald-700 font-black text-sm">{selectedPack.price} DT / {selectedPack.period}</span>
                {selectedPack.originalPrice && selectedPack.originalPrice > selectedPack.price && (
                  <span className="text-xs text-slate-400 font-bold line-through">
                    {selectedPack.originalPrice} DT
                  </span>
                )}
                {selectedPack.originalPrice && selectedPack.originalPrice > selectedPack.price && (
                  <span className="px-2 py-0.5 bg-red-600 text-white font-black text-[9px] rounded-md uppercase">
                    -{Math.round(((selectedPack.originalPrice - selectedPack.price) / selectedPack.originalPrice) * 100)}%
                  </span>
                )}
              </div>
            </div>
            <span className={`px-3 py-1 rounded-xl text-xs font-black uppercase border ${selectedPack.badgeBg} ${selectedPack.badgeText} ${selectedPack.badgeBorder}`}>
              {selectedPack.badgeLabel}
            </span>
          </div>

          {/* Radio Cards for Payment Methods */}
          <div>
            <label className="block text-xs font-black text-slate-800 uppercase mb-3 tracking-wider">
              Choisissez votre mode de règlement :
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Option 1: D17 */}
              <div
                onClick={() => setPaymentMethod("D17")}
                className={`p-4 border-2 rounded-2xl cursor-pointer flex items-start gap-3.5 transition-all relative ${
                  paymentMethod === "D17"
                    ? "border-[#10B981] bg-emerald-50/40 shadow-md ring-2 ring-[#10B981]/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-xl overflow-hidden ${paymentMethod === "D17" ? "bg-[#10B981] text-white" : "bg-slate-100 text-[#0A2540]"}`}>
                  <PaymentMethodIcon 
                    methodId="d17" 
                    fallbackIconSize={22}
                    fallbackIconClassName={paymentMethod === "D17" ? "text-white" : "text-[#0A2540]"} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#0A2540]">D17 Poste Mobile</h4>
                    {paymentMethod === "D17" && <span className="text-[9px] bg-[#10B981] text-white font-black px-2 py-0.5 rounded-full uppercase">Choisi</span>}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-normal">
                    Numéro Mobile : <span className="font-mono font-black text-rose-600 select-all">{settings.payments.d17.phone}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">{settings.payments.d17.notes || "Application D17 (La Poste Tunisienne)"}</p>
                </div>
              </div>

              {/* Option 2: RIB */}
              <div
                onClick={() => setPaymentMethod("RIB")}
                className={`p-4 border-2 rounded-2xl cursor-pointer flex items-start gap-3.5 transition-all relative ${
                  paymentMethod === "RIB"
                    ? "border-[#10B981] bg-emerald-50/40 shadow-md ring-2 ring-[#10B981]/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-xl overflow-hidden ${paymentMethod === "RIB" ? "bg-[#10B981] text-white" : "bg-slate-100 text-[#0A2540]"}`}>
                  <PaymentMethodIcon 
                    methodId="rib" 
                    fallbackIconSize={22}
                    fallbackIconClassName={paymentMethod === "RIB" ? "text-white" : "text-[#0A2540]"} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#0A2540]">Virement RIB</h4>
                    {paymentMethod === "RIB" && <span className="text-[9px] bg-[#10B981] text-white font-black px-2 py-0.5 rounded-full uppercase">Choisi</span>}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-normal">
                    Banque {settings.payments.rib.bankName} : <span className="font-mono font-black text-rose-600 select-all">{settings.payments.rib.ribNumber}</span>
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">À l'ordre de {settings.payments.rib.accountOrder}</p>
                </div>
              </div>

              {/* Option 3: Wafacash */}
              <div
                onClick={() => setPaymentMethod("Wafacash")}
                className={`p-4 border-2 rounded-2xl cursor-pointer flex items-start gap-3.5 transition-all relative ${
                  paymentMethod === "Wafacash"
                    ? "border-[#10B981] bg-emerald-50/40 shadow-md ring-2 ring-[#10B981]/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-xl overflow-hidden ${paymentMethod === "Wafacash" ? "bg-[#10B981] text-white" : "bg-slate-100 text-[#0A2540]"}`}>
                  <PaymentMethodIcon 
                    methodId="wafacash" 
                    fallbackIconSize={22}
                    fallbackIconClassName={paymentMethod === "Wafacash" ? "text-white" : "text-[#0A2540]"} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#0A2540]">Wafacash Express</h4>
                    {paymentMethod === "Wafacash" && <span className="text-[9px] bg-[#10B981] text-white font-black px-2 py-0.5 rounded-full uppercase">Choisi</span>}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 leading-normal">
                    Destinataire : <span className="font-bold text-slate-900">{settings.payments.wafacash.recipient}</span>
                  </p>
                  <p className="text-[10px] text-amber-700 bg-amber-50 p-1.5 rounded-lg mt-1 font-medium">
                    ⚠️ Conservez votre reçu de transfert.
                  </p>
                </div>
              </div>

              {/* Option 4: Paiement Direct */}
              <div
                onClick={() => {
                  setPaymentMethod("Direct");
                  window.dispatchEvent(new CustomEvent('open-footer-location'));
                }}
                className={`p-4 border-2 rounded-2xl cursor-pointer flex items-start gap-3.5 transition-all relative ${
                  paymentMethod === "Direct"
                    ? "border-[#00b87c] bg-emerald-50/60 shadow-md ring-2 ring-[#00b87c]/20"
                    : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50"
                }`}
              >
                <div className={`w-12 h-12 flex items-center justify-center shrink-0 rounded-xl overflow-hidden ${paymentMethod === "Direct" ? "bg-[#00b87c] text-white" : "bg-emerald-100 text-[#00b87c]"}`}>
                  <PaymentMethodIcon 
                    methodId="direct" 
                    fallbackIconSize={22}
                    fallbackIconClassName={paymentMethod === "Direct" ? "text-white" : "text-[#00b87c]"} 
                  />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-black text-sm text-[#0A2540]">Paiement Direct Espèces</h4>
                    {paymentMethod === "Direct" && (
                      <span className="text-[9px] bg-[#00b87c] text-white font-black px-2 py-0.5 rounded-full uppercase">
                        Choisi
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 mt-1 flex items-center gap-1">
                    <MapPin size={12} className="text-[#00b87c] shrink-0" /> <span className="font-semibold text-slate-900">{settings.payments.cash.location}</span>
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5 flex items-center gap-1">
                    <Clock size={11} className="shrink-0 text-slate-400" /> {settings.payments.cash.hours}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Upload Section */}
          {paymentMethod === "Direct" ? (
            <div className="p-6 border-2 border-dashed border-blue-200 bg-blue-50/40 rounded-2xl text-center space-y-2">
              <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center mx-auto mb-1">
                <Building2 size={20} />
              </div>
              <h4 className="font-bold text-sm text-[#0A2540]">Aucun reçu requis immédiatement</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
                Réglez en espèces au <strong className="text-[#0A2540]">Centre Le Plus / Al Idhafa</strong>. Votre compte sera activé dès votre passage au centre.
              </p>
            </div>
          ) : (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-black text-[#0A2540] uppercase tracking-wider">
                  Téléversez votre reçu de paiement ({paymentMethod === "RIB" ? "Virement bancaire" : paymentMethod === "D17" ? "Capture D17" : "Mandat Wafacash"}) :
                </label>
                <span className="text-[10px] font-bold text-rose-600 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">Requis</span>
              </div>

              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-40 relative group ${
                  receiptPreview
                    ? "border-[#10B981] bg-emerald-50/15"
                    : "border-slate-300 hover:border-[#1A2B6D] bg-slate-50/50 hover:bg-blue-50/20"
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />

                {receiptPreview ? (
                  <div className="w-full flex flex-col items-center justify-center space-y-2 py-2">
                    <div className="w-16 h-16 rounded-xl overflow-hidden border-2 border-[#10B981] shadow-sm relative bg-white flex items-center justify-center">
                      <img src={receiptPreview} alt="Aperçu reçu" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex items-center gap-1.5 text-xs font-bold text-[#10B981] bg-emerald-50 px-3 py-1 rounded-full border border-emerald-200">
                      <ShieldCheck size={15} /> Justificatif téléversé avec succès
                    </div>
                    <span className="text-[11px] text-slate-500 hover:text-[#1A2B6D] underline font-semibold flex items-center gap-1">
                      <RefreshCw size={12} /> Cliquer pour modifier
                    </span>
                  </div>
                ) : (
                  <>
                    <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-200 flex items-center justify-center mb-2 text-[#1A2B6D]">
                      <CloudArrowUp size={24} />
                    </div>
                    <div className="text-xs font-bold text-slate-800">
                      Glissez votre reçu ici, ou <span className="text-[#1A2B6D] underline">parcourez</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      Formats PNG, JPG ou PDF (Max 10 Mo).
                    </p>
                  </>
                )}
              </div>
            </div>
          )}

          <p className="text-xs text-slate-500 leading-relaxed text-center font-medium bg-slate-50 p-3 rounded-xl border border-slate-200/60">
            🔒 Validation manuelle par M. Nabil Chaouch sous 24h ouvrées.
          </p>

          <div className="pt-4 border-t border-slate-100 flex flex-col-reverse sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => setStep(3)}
              className="w-full sm:w-auto px-5 py-3 border border-slate-200 text-slate-700 rounded-xl text-xs font-bold hover:bg-slate-50 cursor-pointer flex items-center justify-center gap-2 transition-all"
            >
              <ArrowLeft size={15} /> Étape précédente
            </button>

            <button
              id="submit-register-btn"
              onClick={() => handleFinalSubmit()}
              disabled={isUploading}
              className="w-full sm:w-auto px-7 py-3.5 bg-gradient-to-r from-[#00A859] to-[#0da673] hover:from-[#008f4c] hover:to-[#00A859] text-white text-xs font-black uppercase tracking-wider rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              <span>Soumettre mon dossier</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
