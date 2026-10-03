import { StudentTier } from "./types/access";
export * from "./constants/academic";

// Standardized Unified Subscription Tiers
export type SubscriptionTier = 'FREEMIUM' | 'ESSENTIEL' | 'LIVE +' | 'RÉVISION +' | 'INTÉGRALE';
export const SUBSCRIPTION_TIERS: SubscriptionTier[] = ['FREEMIUM', 'ESSENTIEL', 'LIVE +', 'RÉVISION +', 'INTÉGRALE'];

export interface DocumentModel {
  _id?: string;
  id?: string;
  title: string;
  fileUrl: string;
  allowedTiers: SubscriptionTier[]; // Must store EXACT array selected by admin
  category: string;
  trimester: string;
  isPublished: boolean;
  createdAt: string;
}

export interface UserProfile {
  _id?: string;
  id?: string;
  fullName: string;
  email: string;
  badge: SubscriptionTier; // Primary active subscription tier
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
  status: "pending" | "active" | "disabled";
  activeSessionId: string | null;
  avatarUrl: string;
  createdAt: string;
  activeBadge?: "Freemium" | "Essentiel" | "Live +" | "Révision +" | "Intégrale" | string;
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
  subscriptionType?: "freemium" | "mensuel" | "trimestriel" | "annuel" | "revision" | "Freemium" | "Essentiel" | "Live +" | "Révision +" | "Intégrale" | string;
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

export type GradeLevel = "Tous les niveaux" | "1ère" | "1er" | "2ème" | "3ème" | "4ème";

export type SectionStream = 
  | "Toutes les sections"
  | "Sciences de l'Informatique"
  | "Mathématiques"
  | "Sciences Expérimentales"
  | "Sciences Techniques"
  | "Économie & Gestion"
  | "Lettres"
  | "Sport"
  | "Tronc Commun";

export type StudentCategory = "Freemium" | "Essentiel" | "Live +" | "Révision +" | "Intégrale";

export interface TargetAudience {
  gradeLevels: GradeLevel[] | string[];
  streams: SectionStream[] | string[];
  userCategories?: StudentCategory[] | string[];
}

// Fonction de nettoyage universelle
export const normalizeString = (str: string = ""): string => {
  return str
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Supprime les accents
    .replace(/[^a-z0-9]/g, "");     // Ne garde que les caractères alphanumériques
};

export const canStudentAccessContent = (
  target: { gradeLevels?: string[]; streams?: string[]; userCategories?: string[] } | TargetAudience | null | undefined,
  studentProfile: { gradeLevel: string; stream: string; category?: string }
): boolean => {
  if (!target) return true;

  const studentGrade = (studentProfile.gradeLevel || "").trim();
  const studentStream = (studentProfile.stream || "").trim();
  const studentGradeNorm = normalizeString(studentGrade);
  const studentStreamNorm = normalizeString(studentStream);

  const gradeList = (target.gradeLevels || []) as any[];
  const streamList = (target.streams || []) as any[];

  // 1. Validation du Niveau Scolaire
  const matchGrade = 
    !target.gradeLevels || 
    target.gradeLevels.length === 0 || 
    gradeList.includes("Tous les niveaux") || 
    gradeList.includes("Tous") ||
    !studentGrade ||
    studentGrade === "Tous" ||
    studentGrade === "Tous les niveaux" ||
    gradeList.includes(studentGrade) ||
    gradeList.some((g: any) => {
      const gNorm = normalizeString(String(g));
      if (!gNorm || gNorm.includes("tous") || gNorm.includes("all")) return true;
      if (studentGradeNorm && gNorm === studentGradeNorm) return true;
      if (studentGradeNorm.includes("4") && (gNorm.includes("4") || gNorm.includes("bac"))) return true;
      if (studentGradeNorm.includes("bac") && (gNorm.includes("4") || gNorm.includes("bac"))) return true;
      if (studentGradeNorm.includes("3") && gNorm.includes("3")) return true;
      if (studentGradeNorm.includes("2") && gNorm.includes("2")) return true;
      if (studentGradeNorm.includes("1") && gNorm.includes("1")) return true;
      return false;
    });

  // 2. Validation de la Filière
  const matchStream = 
    !target.streams || 
    target.streams.length === 0 || 
    streamList.includes("Toutes les filières") || 
    streamList.includes("Toutes les sections") || 
    streamList.includes("Tous") ||
    !studentStream ||
    studentStream === "Tous" ||
    studentStream === "Toutes les filières" ||
    studentStream === "Toutes les sections" ||
    streamList.includes(studentStream) ||
    streamList.some((s: any) => {
      const sNorm = normalizeString(String(s));
      if (!sNorm || sNorm.includes("toutes") || sNorm.includes("tous") || sNorm.includes("all")) return true;
      if (studentStreamNorm && sNorm === studentStreamNorm) return true;
      if (studentStreamNorm && (sNorm.includes(studentStreamNorm) || studentStreamNorm.includes(sNorm))) return true;
      return false;
    });

  return matchGrade && matchStream;
};

export const isContentAccessibleToStudent = (
  target?: TargetAudience | null,
  student?: { gradeLevel?: string; grade?: string; stream?: string; section?: string; category?: string; tier?: string; accountType?: string } | null,
  fallbackLegacy?: { grade?: string; section?: string; allowedTiers?: string[]; isPremium?: boolean }
): boolean => {
  if (!student) return true;

  const studentGrade = (student.gradeLevel || student.grade || "").trim();
  const studentStream = (student.stream || student.section || "").trim();
  const studentCategory = (student.category || student.tier || student.accountType || "freemium").trim();

  if (target) {
    return canStudentAccessContent(target, {
      gradeLevel: studentGrade,
      stream: studentStream,
      category: studentCategory
    });
  }

  // Legacy fallback evaluation
  if (fallbackLegacy) {
    const legacyGrade = (fallbackLegacy.grade || "").trim().toLowerCase();
    const legacySection = (fallbackLegacy.section || "").trim().toLowerCase();

    let matchGrade = true;
    if (legacyGrade && legacyGrade !== "tous" && legacyGrade !== "all" && legacyGrade !== "tous les niveaux") {
      const gList = legacyGrade.split(",").map(s => s.trim().toLowerCase());
      const stGradeLower = studentGrade.toLowerCase();
      matchGrade = gList.some(g => g === stGradeLower || (stGradeLower.includes("4ème") && g.includes("bac")) || (stGradeLower.includes("bac") && g.includes("4ème")));
    }

    let matchStream = true;
    if (legacySection && legacySection !== "tous" && legacySection !== "all" && legacySection !== "toutes les sections" && legacySection !== "toutes les filières") {
      const sList = legacySection.split(",").map(s => s.trim().toLowerCase());
      const stStreamLower = studentStream.toLowerCase();
      matchStream = sList.some(s => s === stStreamLower || stStreamLower.includes(s) || s.includes(stStreamLower));
    }

    return matchGrade && matchStream;
  }

  return true;
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
  targetTiers?: StudentTier[];
  allowedTiers?: StudentTier[];
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

export type CategoryType = 'Freemium' | 'Essentiel' | 'Live +' | 'Révision +' | 'Intégrale';

export interface CampaignPack {
  id: string;
  category: 'Freemium' | 'Essentiel' | 'Live +' | 'Révision +' | 'Intégrale';
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


