import { StudentTier } from "./types/access";
export * from "./constants/academic";

// Standardized Unified Subscription Tiers - 5 Paliers Officiels Exclusifs
export type SubscriptionTier = 'FREEMIUM' | 'ESSENTIEL' | 'LIVE+' | 'REVISION+' | 'INTEGRAL';
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['FREEMIUM', 'ESSENTIEL', 'LIVE+', 'REVISION+', 'INTEGRAL'];

export const USER_RANK: Record<string, number> = {
  'FREEMIUM': 0,
  'ESSENTIEL': 1,
  'LIVE+': 2,
  'REVISION+': 3,
  'INTEGRAL': 4
};

export type CanonicalGrade = "1ère" | "2ème" | "3ème" | "4ème" | "ALL";
export type CanonicalStream =
  | "Sciences de l'Informatique"
  | "Mathématiques"
  | "Sciences Expérimentales"
  | "Sciences Techniques"
  | "Économie & Gestion"
  | "Lettres"
  | "Sport"
  | "ALL";
export type CanonicalTrimester = "1er Trimestre" | "2ème Trimestre" | "3ème Trimestre" | "Live Enregistré" | "ALL";
export type CanonicalCategory = "Fiches & cours" | "Devoirs & Exercices" | "Zone Correction" | "Révision" | "Quiz Interactifs" | "ALL";

export interface DocumentModel {
  _id?: string;
  id?: string;
  title: string;
  fileUrl: string;
  grade: CanonicalGrade | string;
  stream: CanonicalStream | string;
  minBadge: SubscriptionTier;
  allowedTiers: SubscriptionTier[]; // Must store EXACT array selected by admin
  category: CanonicalCategory | string;
  trimester: CanonicalTrimester | string;
  isPublished: boolean;
  createdAt: string;
}

export interface UserProfile {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  badge: SubscriptionTier; // Primary active subscription tier
  grade?: CanonicalGrade | string;
  stream?: CanonicalStream | string;
  role?: string;
  quizHistory: any[];
  purchaseHistory: any[];
}

// Types representing the revamped A-Zed Info architecture (No Gamification or Activity Stats)

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "admin" | "agent";
  grade: string;
  section: string;
  stream?: string;
  status: "pending" | "active" | "disabled";
  activeSessionId: string | null;
  avatarUrl: string;
  createdAt: string;
  activeBadge?: SubscriptionTier | string;
  badge?: SubscriptionTier; // Primary active subscription tier
  quizHistory?: any[];
  purchaseHistory?: any[];
  password?: string;
  subscriptionExpiresAt?: string; // ISO string representing pack validation end timestamp
  packs?: string[]; // list of active digital packs
  address?: string; // Home or billing address
  phone?: string; // Contact phone number
  verified?: boolean; // Manual administrative verification status
  city?: string;
  highSchool?: string;
  accountType?: "freemium" | "premium"; // 'freemium' (free with restrictions and unlocks) or 'premium'
  tier?: StudentTier;
  tierCategory?: StudentTier;
  tierBadge?: string;
  badgeLabel?: string;
  badgeType?: string;
  badge_label?: string;
  badge_type?: string;
  packId?: string;
  pack_id?: string;
  finalPrice?: number;
  originalPrice?: number;
  discountPercentage?: number;
  savedPythonCode?: Record<number, string>; // Maps exercise index to saved source code
  subscriptionType?: SubscriptionTier | string;
  expirationWarningSent?: boolean;
  agentType?: "professeur" | "assistant";
  commissionRate?: number;
  rate?: number;
  paymentMethod?: string;
  groupe_etude?: string; // Groupe d'étude de A à Z ou vide pour Non assigné
  subscriptionPlan?: string;
  forfait?: string;
  studyGroup?: string; // Alias pour groupe_etude
  level?: string;
  userCategory?: string;
  badgeStyle?: { bg: string; text: string; border: string };
  offerType?: string;
}

export interface Commission {
  id: string;
  agentId: string;
  studentName: string;
  studentEmail: string;
  subType: string;
  amount: number;
  rate: number;
  earnedCommission: number;
  validationDate: string;
  status: "pending" | "paid" | "approved" | "rejected" | string;
  type?: "COMMISSION" | "DEDUCTION" | string;
  description?: string;
  receiptId?: string;
}

export interface CommissionWithdrawal {
  id: string;
  agentId: string;
  agentName: string;
  amount: number;
  requestDate: string; // YYYY-MM-DD HH:mm
  status: "pending" | "approved" | "rejected";
}

export type GradeLevel = "Tous les niveaux" | "1ère" | "1er" | "2ème" | "3ème" | "4ème" | "ALL";

export type SectionStream = 
  | "Toutes les sections"
  | "Sciences de l'Informatique"
  | "Mathématiques"
  | "Sciences Expérimentales"
  | "Sciences Techniques"
  | "Économie & Gestion"
  | "Lettres"
  | "Sport"
  | "Tronc Commun"
  | "ALL";

export type StudentCategory = SubscriptionTier;

export interface TargetAudience {
  gradeLevels: GradeLevel[] | string[];
  streams: SectionStream[] | string[];
  userCategories?: StudentCategory[] | string[];
}

// Fonction de nettoyage universelle
export const normalizeString = (str: string = ""): string => {
  return String(str || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]/g, "");     // Ne garde que les caractères alphanumériques
};

export const normalizeCanonicalGrade = (val?: string | null): CanonicalGrade => {
  const clean = normalizeString(val || "");
  if (!clean || clean.includes("tous") || clean.includes("toutes") || clean === "all") return "ALL";
  if (clean.includes("4") || clean.includes("bac") || clean.includes("terminale")) return "4ème";
  if (clean.includes("3")) return "3ème";
  if (clean.includes("2")) return "2ème";
  if (clean.includes("1")) return "1ère";
  return "ALL";
};

export const normalizeCanonicalStream = (val?: string | null, fallbackGrade?: string | null): CanonicalStream => {
  const clean = normalizeString(val || "");
  if (!clean || clean.includes("tous") || clean.includes("toutes") || clean === "all" || clean.includes("tronc") || clean.includes("commun")) {
    if (!clean && fallbackGrade && normalizeString(fallbackGrade).includes("info")) {
      return "Sciences de l'Informatique";
    }
    return "ALL";
  }
  if (clean.includes("info") || clean === "sti") return "Sciences de l'Informatique";
  if (clean.includes("math")) return "Mathématiques";
  if (clean.includes("exp") || clean === "svt") return "Sciences Expérimentales";
  if (clean.includes("tech")) return "Sciences Techniques";
  if (clean.includes("eco") || clean.includes("gest")) return "Économie & Gestion";
  if (clean.includes("lettr")) return "Lettres";
  if (clean.includes("sport")) return "Sport";
  return "ALL";
};

export const normalizeCanonicalTrimester = (val?: string | null): CanonicalTrimester => {
  if (!val) return "1er Trimestre";
  const t = String(val).toLowerCase().trim();
  if (t === "all" || t.includes("tous") || t.includes("toutes")) return "ALL";
  if (t.includes("1er") || t.includes("1ère") || t.includes("1ere") || t === "t1" || t === "1") return "1er Trimestre";
  if (t.includes("2eme") || t.includes("2ème") || t === "t2" || t === "2") return "2ème Trimestre";
  if (t.includes("3eme") || t.includes("3ème") || t === "t3" || t === "3") return "3ème Trimestre";
  if (t.includes("revision") || t.includes("révision") || t.includes("live") || t.includes("énoncé") || t.includes("enonce") || t.includes("replay")) return "Live Enregistré";
  return "1er Trimestre";
};

export const normalizeCanonicalCategory = (input: any): CanonicalCategory => {
  if (!input) return "Fiches & cours";
  if (typeof input === "string") {
    const s = input.toLowerCase().trim();
    if (s === "all" || s === "tous" || s === "toutes") return "ALL";
    if (s === "correction" || s === "exercise_corrected" || s.includes("correction")) return "Zone Correction";
    if (s === "quiz" || s.includes("quiz") || s.includes("qcm")) return "Quiz Interactifs";
    if (s === "devoir" || s === "exercise" || (s.includes("devoir") && !s.includes("fiche")) || s.includes("exercice")) return "Devoirs & Exercices";
    if (s === "revision" || s.includes("revision") || s.includes("révision") || s.includes("live")) return "Révision";
    if (s === "course" || s.includes("fiche") || s.includes("cours")) return "Fiches & cours";
    return "Fiches & cours";
  }

  const ct = String(input.contentType || "").toLowerCase().trim();
  const cat = String(input.category || "").toLowerCase().trim();
  const rawTrim = String(input.trimestre || input.trimester || "").toLowerCase().trim();

  if (ct === "exercise_corrected" || cat.includes("correction") || (ct === "revision" && rawTrim === "correction")) {
    return "Zone Correction";
  }
  if (ct === "quiz" || cat.includes("quiz") || cat.includes("qcm") || Array.isArray(input.questions)) {
    return "Quiz Interactifs";
  }
  if (ct === "exercise" || (cat.includes("devoir") && !cat.includes("fiche")) || (cat.includes("exercice") && !cat.includes("fiche"))) {
    return "Devoirs & Exercices";
  }
  if (ct === "revision" || cat.includes("revision") || cat.includes("révision")) {
    return "Révision";
  }
  return "Fiches & cours";
};

export const normalizeGradeKey = (val: string = ""): string => {
  const g = normalizeCanonicalGrade(val);
  if (g === "4ème") return "4";
  if (g === "3ème") return "3";
  if (g === "2ème") return "2";
  if (g === "1ère") return "1";
  return "ALL";
};

export const normalizeStreamKey = (val: string = ""): string => {
  const clean = normalizeString(val);
  if (!clean || clean.includes("tous") || clean.includes("toutes") || clean === "all") return "ALL";
  if (clean.includes("info") || clean === "sti") return "INFO";
  if (clean.includes("math")) return "MATH";
  if (clean.includes("exp") || clean === "svt") return "EXP";
  if (clean.includes("tech")) return "TECH";
  if (clean.includes("eco") || clean.includes("gest")) return "ECO";
  if (clean.includes("lettr")) return "LETTRES";
  if (clean.includes("sport")) return "SPORT";
  if (clean.includes("tronc") || clean.includes("commun")) return "TRONC_COMMUN";
  return clean;
};

export const canStudentAccessContent = (
  target: { gradeLevels?: string[]; streams?: string[]; userCategories?: string[] } | TargetAudience | null | undefined,
  studentProfile: { gradeLevel: string; stream: string; category?: string }
): boolean => {
  if (!target) return true;

  const userGrade = normalizeCanonicalGrade(studentProfile.gradeLevel || "");
  const userStream = normalizeCanonicalStream(studentProfile.stream || "", studentProfile.gradeLevel || "");

  const rawGrades = Array.isArray(target.gradeLevels) && target.gradeLevels.length > 0
    ? target.gradeLevels
    : ["ALL"];
  const docGrades = rawGrades.map((g: any) => normalizeCanonicalGrade(String(g)));

  const rawStreams = Array.isArray(target.streams) && target.streams.length > 0
    ? target.streams
    : ["ALL"];
  const docStreams = rawStreams.map((s: any) => normalizeCanonicalStream(String(s), rawGrades.join(" ")));

  // 1. Validation stricte du Niveau Scolaire: doc.grade === user.grade || doc.grade === "ALL"
  const matchGrade = docGrades.includes("ALL") || (userGrade !== "ALL" && docGrades.includes(userGrade));
  if (!matchGrade) return false;

  // 2. Validation stricte de la Filière: doc.stream === user.stream || doc.stream === "ALL"
  const matchStream =
    docStreams.includes("ALL") ||
    (userStream !== "ALL" && docStreams.includes(userStream)) ||
    (userGrade === "1ère" && docGrades.includes("1ère"));
  return matchStream;
};

export const isContentAccessibleToStudent = (
  target?: TargetAudience | null,
  student?: { gradeLevel?: string; grade?: string; stream?: string; section?: string; category?: string; tier?: string; accountType?: string } | null,
  fallbackLegacy?: { grade?: string; section?: string; stream?: string; allowedTiers?: string[]; isPremium?: boolean }
): boolean => {
  if (!student) return true;

  const studentGrade = (student.gradeLevel || student.grade || "").trim();
  const studentStream = (student.stream || student.section || "").trim();
  const studentCategory = (student.category || student.tier || student.accountType || "freemium").trim();

  const resolvedGrades: string[] = (target?.gradeLevels && Array.isArray(target.gradeLevels) && target.gradeLevels.length > 0)
    ? target.gradeLevels
    : (fallbackLegacy?.grade ? fallbackLegacy.grade.split(",").map(s => s.trim()).filter(Boolean) : ["ALL"]);

  const rawFallbackStream = fallbackLegacy?.stream || fallbackLegacy?.section || "";
  let resolvedStreams: string[] = (target?.streams && Array.isArray(target.streams) && target.streams.length > 0)
    ? target.streams
    : (rawFallbackStream ? rawFallbackStream.split(",").map(s => s.trim()).filter(Boolean) : []);

  if (resolvedStreams.length === 0) {
    const gradeRawLower = (fallbackLegacy?.grade || resolvedGrades.join(" ")).toLowerCase();
    if (gradeRawLower.includes("info")) {
      resolvedStreams = ["Sciences de l'Informatique"];
    } else {
      resolvedStreams = ["ALL"];
    }
  }

  return canStudentAccessContent(
    {
      gradeLevels: resolvedGrades,
      streams: resolvedStreams,
      userCategories: target?.userCategories
    },
    {
      gradeLevel: studentGrade,
      stream: studentStream,
      category: studentCategory
    }
  );
};

export interface DocumentMetadata {
  uploadedAt: string;          // ISO Date String
  studentSectionPath: string;  // ex: "Apprentissage & Révisions > Fiches & cours"
  downloadsCount?: number;     // Compteur de téléchargements élèves (optionnel)
}

export interface PublicationDocument {
  id: string;
  title: string;
  chapterTitle: string;
  fileName: string;
  fileUrl: string;
  fileFormat: string;          // ex: "PNG", "PDF"
  category: string;            // ex: "FICHES & COURS"
  trimester: string;           // ex: "1ER TRIM"
  accessType: string;          // ex: "Gratuit", "Premium"
  target: {
    gradeLevels: string[];
    streams: string[];
    userCategories?: string[];
  };
  metadata: DocumentMetadata;
  // Optional compatibility fields
  chapterId?: string;
  module?: string;
  grade?: string;
  section?: string;
  isPremium?: boolean;
  duration?: string;
  videoUrl?: string;
  attachmentName?: string;
  fileType?: string;
  contentType?: string;
  textContent?: string;
  solutionCode?: string;
  trimestre?: string;
  targetAudience?: string[];
  targetTiers?: (StudentTier | string)[];
  allowedTiers?: (StudentTier | string)[];
  accessTiers?: (StudentTier | string)[];
  tiers?: (StudentTier | string)[];
  allowedBadges?: string[];
  createdAt?: string;
}

export interface CourseItem {
  id: string;
  title: string;
  duration: string;
  grade: string;
  section?: string;
  module: string; // Dynamic section or chapter
  chapterTitle?: string;
  fileName?: string;
  fileFormat?: string;
  category?: string;
  trimester?: string;
  accessType?: string;
  isPremium: boolean;
  target?: TargetAudience;
  targetAudience?: string[];
  targetTiers?: StudentTier[];
  allowedTiers?: StudentTier[];
  allowedBadges?: string[];
  accessTiers?: string[];
  tiers?: string[];
  [key: string]: any;
  videoUrl?: string; // Optional raw URL or MP4 source
  fileUrl?: string;
  attachmentName?: string; // e.g. PDF manual or text sheet filename
  fileType: "mp4" | "pdf" | "txt" | "py" | "png" | "jpg" | string;
  contentType: "course" | "exercise" | "quiz" | "exercise_corrected" | "devoirs_exercices_fiches_cours" | "revision";
  textContent?: string;
  solutionCode?: string;
  trimestre?: string;
  metadata?: DocumentMetadata;
  createdAt?: string;
}

export type Document = CourseItem;

export interface PaymentReceipt {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  grade: string;
  amount: number;
  paymentMethod: "RIB" | "D17" | "Wafacash" | "Direct" | string;
  receiptUrl: string;
  status: "pending" | "approved" | "rejected" | "suspended_admin" | "SUSPENDED_ADMIN" | string;
  uploadedAt: string;
  handledBy?: string;
  handledByName?: string;
  rejectionReason?: string;
  suspendedReason?: string;
}

export interface Order {
  id: string;
  student_id: string;
  student_name?: string;
  student_email?: string;
  pack_title: string;
  amount: number;
  payment_method: string;
  receipt_url?: string;
  status: "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED_ADMIN" | "suspended_admin" | string;
  rejection_reason?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuditLogItem {
  id: string;
  receiptId: string;
  studentName: string;
  studentEmail: string;
  amount: number;
  paymentMethod: string;
  action: "approved" | "rejected" | "suspended_admin" | string;
  agentId: string;
  agentName: string;
  timestamp: string;
}

export interface UnifiedCalendarEvent {
  id: string;
  title: string;
  event_type: 'live_session' | 'homework' | 'exam' | 'event';
  date_start: string; // UTC ISO format string
  date?: string; // "YYYY-MM-DD"
  time?: string; // "HH:mm"
  duration_minutes: number;
  durationMinutes?: number;
  zoom_link?: string;
  zoomLink?: string;
  target_class?: string;
  grade?: string;
  target_specialty?: string;
  section?: string;
  instructor?: string;
  teacher?: string;
  target_groups: string[];
  targetGroups?: string[];
  instructions?: string;
  description?: string;
  action_url?: string;
  created_at?: string;
  updated_at?: string;
  type?: "live" | "exam" | "event" | "homework" | "live_session";
  notify_students?: boolean;
  notifyStudents?: boolean;
  notification_timing?: "now" | "15min" | "30min" | "1hour" | "2hours" | "1day" | "custom" | string;
  notification_scheduled_at?: string;
  notification_delay_minutes?: number;
  frequency_type?: "single" | "recurring";
  date_debut?: string;
  date_fin?: string;
  recurrence_pattern?: "daily" | "weekly" | "every_2_days" | "mon_wed_fri" | string;
  recurrence_days?: string[];
  custom_notification_time?: string;
}

export type LiveEvent = UnifiedCalendarEvent;

export interface StudentNotification {
  id: string;
  studentId: string;
  type?: 'FILE' | 'QUIZ' | 'CALENDAR' | 'SHOP_NEW' | 'CART' | 'WISHLIST' | 'ORDER';
  categoryBadge?: string; // Ex: "COMMANDE", "QUIZ", "COURS", "CALENDRIER", "BOUTIQUE", "PANIER", "FAVORIS"
  title: string;
  message?: string;
  locationOrTime?: string; // Ex: "Fiches & cours > Algorithmique" ou "Prévu le 12 Oct à 18h00"
  location?: string;
  time?: string;
  timestamp?: string;
  targetUrl?: string;       // Redirection au clic (ex: "#/qcm", "#/shop", "#/calendar")
  isRead?: boolean;
  read?: boolean;
  createdAt?: string;       // ISO Timestamp
  targetClasse?: string;
  targetSpecialite?: string;
  targetGroups?: string[];
  eventData?: any;
}

export interface Notification {
  id: string;
  userId: string;
  target_user_id?: string;
  sender?: string;
  target_role?: "STUDENT" | "ADMIN" | "AGENT" | "ALL" | string;
  targetRole?: string;
  target_group?: string;
  icon?: string;
  title: string;
  content: string;
  message?: string;
  link?: string;
  targetClasse?: string;
  targetSpecialite?: string;
  targetGroups?: string[];
  type: string;
  createdAt: string;
  isRead: boolean;
  read?: boolean;
  readBy?: string[];
  deletedBy?: string[];
  event_date?: string;
  event_time?: string;
  title_event?: string;
  target_groups?: string[];
  eventId?: string;
  status?: "DELIVERED" | "SCHEDULED" | string;
  scheduled_at?: string;
  notification_timing?: string;
  notification_scheduled_at?: string;
  custom_notification_time?: string;
  eventData?: {
    id: string;
    title: string;
    description?: string;
    date: string;
    time?: string;
    duration?: string;
    recurrence?: string;
    instructor?: string;
    level?: string;
    type?: string;
    status?: string;
    groups?: string[];
    zoom_link?: string;
    link?: string;
  };
}

export interface EBook {
  id: string;
  title: string;
  description: string;
  grade: string;
  pdfUrl: string;
  chapters: string[];
  isPremium: boolean;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation: string;
}

export interface Chapter {
  id?: string;
  title: string;
  description?: string;
  grade?: string;
}

export interface InteractiveQuiz {
  id: string;
  title: string;
  chapterTitle?: string;
  chapter?: string;
  target?: TargetAudience;
  type: "qcm" | "fllblanks" | "coding_challenge";
  grade: string;
  difficulty: "Debutant" | "Intermediaire" | "Avance";
  creatorName: string;
  createdAt: string;
  questions: QuizQuestion[];
  trimestre?: string;
  isPremium?: boolean;
  section?: string;
  score?: number;
  allowedTiers?: string[];
  allowedBadges?: string[];
  targetTiers?: string[];
  [key: string]: any;
}

export type Quiz = InteractiveQuiz;

// Shopping & Marketplace Schema Models
export type { StoreProduct } from "./data/storeSeedData";
export { DEFAULT_STORE_PRODUCTS } from "./data/storeSeedData";

export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  originalPrice?: number;
  badgeLabel?: "ESSENTIEL" | "PREMIUM" | "PREMIUM PLUS" | "OFFRE SPÉCIALE" | string;
  autoAccessBadge?: string;
  billingPeriod?: string;
  discountText?: string;
  features?: string[];
  isPublic?: boolean;
  createdAt?: string;
  promoBadge?: string;
  promoBadgeType?: "auto" | "custom";
  showPromoBadge?: boolean;
  image?: string;
  category?: "Cours Video" | "Pack PDF" | "Full Access" | "Hardware" | "Abonnement" | "Révision" | "Intégral" | string;
  icon?: string;
}

export function getPromoBadgeLabel(prod: {
  price: number;
  oldPrice?: number;
  promoBadge?: string;
  promoBadgeType?: "auto" | "custom";
  showPromoBadge?: boolean;
}): string | null {
  if (!prod.showPromoBadge) return null;
  if (prod.promoBadgeType === "custom" && prod.promoBadge?.trim()) {
    return prod.promoBadge.trim();
  }
  if (prod.oldPrice && Number(prod.oldPrice) > Number(prod.price) && Number(prod.oldPrice) > 0) {
    const discount = Math.round(((Number(prod.oldPrice) - Number(prod.price)) / Number(prod.oldPrice)) * 100);
    return `-${discount}%`;
  }
  if (prod.promoBadge?.trim()) {
    return prod.promoBadge.trim();
  }
  return "SOLDE";
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface OfferFeature {
  text: string;
  isLocked?: boolean;
}

export interface SignUpOffer {
  id: string;
  step: "step2" | "step3";
  title: string;
  description: string;
  badge?: string;
  oldPrice?: number;
  price: number;
  period: string;
  features: OfferFeature[];
  ctaText: string;
  theme: "emerald" | "red" | "blue" | "violet" | "amber" | "slate";
  isActive: boolean;
  isBest?: boolean;
  targetAction?: "freemium" | "premium_packs";
}

export type CategoryType = SubscriptionTier;

export interface CampaignPack {
  id: string;
  category: SubscriptionTier;
  title: string;
  badgeLabel: string;
  badgeType?: 'Zap (Premium)' | 'Option Freemium' | 'Recommandé' | 'Populaire' | string;
  description: string;
  originalPrice?: number;    // Tarif initial (ex: 150 DT)
  finalPrice: number;       // Tarif final après remise (ex: 120 DT)
  price?: number;           // Pour rétrocompatibilité
  discountPercentage?: number; // Calculé dynamiquement ex: 20%
  period: string;           // ex: "/ Trimestre"
  features: string[];
  isActive: boolean;
  isPopular?: boolean;
}

export * from "./types/demo";

export interface AuthHeroImageConfig {
  width?: number; // 50% to 100% of container width
  height?: number; // 200px to 700px height
  scale?: number; // 50% to 150% image zoom scale
  shapeClass?: string; // 'rounded-none' | 'rounded-xl' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full' | 'rounded-[2rem]'
  backgroundColor?: string; // Hex color e.g. '#133F85' or '#1D4ED8'
  objectFit?: 'object-cover' | 'object-contain';
  borderWidth?: number; // border width e.g. 0 to 8 px
  borderColor?: string; // hex or rgba border color
  imageUrl?: string; // optional custom hero image override
}

export const DEFAULT_AUTH_HERO_CONFIG: AuthHeroImageConfig = {
  width: 85,
  height: 480,
  scale: 100,
  shapeClass: "rounded-3xl",
  backgroundColor: "#133F85",
  objectFit: "object-cover",
  borderWidth: 4,
  borderColor: "#FFFFFF"
};


