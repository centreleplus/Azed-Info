// storeSeedData.ts
export interface StoreProduct {
  id: string;
  productId?: string;
  title: string;
  badgeLabel: "ESSENTIEL" | "PREMIUM" | "PREMIUM PLUS" | "OFFRE SPÉCIALE" | string;
  autoAccessBadge?: string | null; // ex: "Auto-Accès"
  price: number; // Prix actuel en DT
  originalPrice: number; // Prix d'origine / barré en DT
  oldPrice?: number;
  billingPeriod: string; // ex: "Annuel" ou "Avril/Mai"
  discountText?: string;
  description: string;
  features: string[];
  isPublic: boolean; // Accessible et visible par tous les élèves
  isGlobalDefault?: boolean;
  createdAt: string;
  updatedAt?: string;
  image?: string;
  category?: string;
  icon?: string;
  promoBadge?: string;
  promoBadgeType?: "custom" | "discount" | "new" | "popular";
  showPromoBadge?: boolean;
}

export const DEFAULT_STORE_PRODUCTS: StoreProduct[] = [
  {
    id: "pack-essentiel",
    productId: "pack-essentiel",
    title: "Pack Essentiel",
    badgeLabel: "ESSENTIEL",
    autoAccessBadge: "Auto-Accès",
    price: 120,
    originalPrice: 240,
    oldPrice: 240,
    billingPeriod: "Annuel",
    discountText: "-50%",
    promoBadge: "-50%",
    promoBadgeType: "custom",
    showPromoBadge: true,
    description: "L'accompagnement idéal pour maîtriser son programme d'études ! Profitez de ressources ciblées entièrement corrigées.",
    features: [
      "Série d'exercices 100% corrigés",
      "Fiches de cours synthétiques",
      "Ensemble de quiz 100% corrigé avec évaluation",
      "Devoirs 100% corrigés"
    ],
    isPublic: true,
    isGlobalDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400",
    category: "Abonnement",
    icon: "Award"
  },
  {
    id: "pack-premium",
    productId: "pack-premium",
    title: "Pack Premium",
    badgeLabel: "PREMIUM",
    autoAccessBadge: null,
    price: 150,
    originalPrice: 300,
    oldPrice: 300,
    billingPeriod: "Annuel",
    discountText: "-50%",
    promoBadge: "-50%",
    promoBadgeType: "custom",
    showPromoBadge: true,
    description: "Une solution sur mesure pensée pour vous aider à maîtriser l'intégralité de votre programme d'études grâce à :",
    features: [
      "Des cours interactifs en direct",
      "Le replay de toutes les séances disponible en illimité",
      "Un espace d'échange entre professeurs et élèves"
    ],
    isPublic: true,
    isGlobalDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&q=80&w=400",
    category: "Abonnement",
    icon: "Crown"
  },
  {
    id: "pack-revision",
    productId: "pack-revision",
    title: "Pack Révision",
    badgeLabel: "PREMIUM PLUS",
    autoAccessBadge: null,
    price: 140,
    originalPrice: 280,
    oldPrice: 280,
    billingPeriod: "Avril/Mai",
    discountText: "-50%",
    promoBadge: "-50%",
    promoBadgeType: "custom",
    showPromoBadge: true,
    description: "Que vous soyez dans la dernière droite avant vos examens nationaux pour viser la mention, ou que vous souhaitiez profiter de l'été pour consolider vos bases et aborder l'année prochaine avec une longueur d'avance.",
    features: [
      "Pack Essentiel (Ressources pédagogiques)",
      "Espace d'échange direct avec les professeurs",
      "Séances interactives en direct (Lives)",
      "Replays enregistrés, réviser à votre rythme"
    ],
    isPublic: true,
    isGlobalDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1457369804613-52c61a468e7d?auto=format&fit=crop&q=80&w=400",
    category: "Révision",
    icon: "Sparkles"
  },
  {
    id: "forfait-annuel-integral",
    productId: "forfait-annuel-integral",
    title: "Forfait Annuel Intégral",
    badgeLabel: "OFFRE SPÉCIALE",
    autoAccessBadge: "Auto-Accès",
    price: 350,
    originalPrice: 820,
    oldPrice: 820,
    billingPeriod: "Annuel",
    discountText: "-57%",
    promoBadge: "OFFRE SPÉCIALE",
    promoBadgeType: "custom",
    showPromoBadge: true,
    description: "Pack Économique : une formule Tout-en-Un regroupant l'intégralité de nos services Que ce soit pour exceller aux examens nationaux ou pour prendre de l'avance pendant les révisions estivales. Solution la plus complète.",
    features: [
      "Ressources 100% Corrigées (Fiches, séries, quiz & devoirs)",
      "Lives Interactifs + Replays Vidéo Illimités",
      "Espace d'Échange Éleve-Professeur",
      "Révision Suivi (Dernière Ligne Droite) ou Révisions Estivales"
    ],
    isPublic: true,
    isGlobalDefault: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=400",
    category: "Intégral",
    icon: "Zap"
  }
];
