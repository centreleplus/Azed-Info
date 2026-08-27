import { StudentTier } from "./types/access";
export * from "./constants/academic";

// Types representing the revamped A-Zed Info architecture (No Gamification or Activity Stats)

export interface User {
  id: string;
  email: string;
  fullName: string;
  role: "student" | "admin" | "agent";
  grade: string;
  section: string;
  status: "pending" | "active";
  activeSessionId: string | null;
  avatarUrl: string;
  createdAt: string;
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
  subscriptionType?: "freemium" | "mensuel" | "trimestriel" | "annuel" | "revision";
  expirationWarningSent?: boolean;
  agentType?: "professeur" | "assistant";
  paymentMethod?: string;
  groupe_etude?: string; // Groupe d'étude de A à Z ou vide pour Non assigné
  studyGroup?: string; // Alias pour groupe_etude
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

export interface CourseItem {
  id: string;
  title: string;
  duration: string;
  grade: string;
  section?: string;
  module: string; // Dynamic section or chapter
  isPremium: boolean;
  targetTiers?: StudentTier[];
  allowedTiers?: StudentTier[];
  videoUrl?: string; // Optional raw URL or MP4 source
  attachmentName?: string; // e.g. PDF manual or text sheet filename
  fileType: "mp4" | "pdf" | "txt" | "py" | "png" | "jpg" | string;
  contentType: "course" | "exercise" | "quiz" | "exercise_corrected" | "devoirs_exercices_fiches_cours" | "revision";
  textContent?: string;
  solutionCode?: string;
  trimestre?: string;
}

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

// Shopping & Marketplace Schema Models
export interface Product {
  id: string;
  title: string;
  description: string;
  price: number;
  oldPrice?: number;
  promoBadge?: string;
  promoBadgeType?: "auto" | "custom";
  showPromoBadge?: boolean;
  image: string;
  category: "Cours Video" | "Pack PDF" | "Full Access" | "Hardware";
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

export type CategoryType = 'Freemium' | 'Premium' | 'Premium+' | 'Premium++';

export interface CampaignPack {
  id: string;
  category: 'Freemium' | 'Premium' | 'Premium+' | 'Premium++';
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


