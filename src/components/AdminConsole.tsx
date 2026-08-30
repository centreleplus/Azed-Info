// Refactored AdminConsole component - Clean UTF-8 build
import { supabase, PRESEEDED_USERS } from "../lib/supabase";
import React, { useState, useEffect, useRef } from "react";
import { ImagePickerInput } from "./ImagePickerInput";
import { Language, translations } from "../lib/translations";
import { extractYouTubeId, getYouTubeEmbedUrl } from "../lib/youtube";
import { motion, AnimatePresence } from "motion/react";
import { 
  UserPlus, 
  Check, 
  X, 
  Trash2, 
  Ban, 
  Plus, 
  Calendar, 
  ArrowRight, 
  BookOpen, 
  Video, 
  FileText, 
  HelpCircle, 
  PlusCircle, 
  Search, 
  DollarSign, 
  Users, 
  Package, 
  BookMarked,
  ShieldCheck,
  AlertCircle,
  AlertTriangle,
  Clock,
  ExternalLink,
  Edit,
  Eye,
  EyeOff,
  Key,
  History,
  Lock,
  Unlock,
  Code,
  Sparkles,
  Layers,
  Award,
  Gift,
  Zap,
  Shield,
  Terminal,
  Activity,
  Paperclip,
  Download,
  Upload,
  ListTodo,
  Palette,
  Image,
  RefreshCw,
  Sliders,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Save,
  Coins,
  Bell,
  Repeat,
  GraduationCap,
  KeyRound,
  CalendarDays,
  Clock3,
  Filter,
  MapPin,
  Crown,
  Edit3,
  Loader2
} from "lucide-react";
import { User, PaymentReceipt, Product, CourseItem, LiveEvent, AuditLogItem, Commission, CommissionWithdrawal, getPromoBadgeLabel, AuthHeroImageConfig, DEFAULT_AUTH_HERO_CONFIG } from "../types";
import AuthHeroBanner from "./AuthHeroBanner";
import { publishAdminEvent } from "../lib/useRealtimeSync";
import CalendrierView from "./CalendrierView";
import UpdatesDashboard from "./UpdatesDashboard";
import CmsManager from "./CmsManager";
import AdminSignUpOffers from "./AdminSignUpOffers";
import { AdminCampaignsView } from "./AdminCampaignsView";
import AdminDemoManager from "./AdminDemoManager";
import AdminFraisInscription from "./AdminFraisInscription";
import MetricCard from "./MetricCard";
import usePagination from "../hooks/usePagination";
import { safeLocalStorageSetItem } from "../utils/safeStorage";
import { compressImageFileToDataUrl } from "../utils/imageOptimizer";
import PaginationControls from "./PaginationControls";
import DeleteConfirmModal from "./DeleteConfirmModal";
import { deleteStudentFromDB } from "../services/studentService";
import { AccessTierSelector } from "./AccessTierSelector";
import { StudentTier } from "../types/access";
import { StudentBadgeTag } from "./StudentBadgeTag";
import { AdminReportingView } from "./AdminReportingView";
import { MediaIconsManager } from "./MediaIconsManager";
import AdminProfileSecurityView from "./AdminProfileSecurityView";
import { isEligibleForRE, calculatePriceWithRE } from "../utils/pricingDiscount";

const GRADES_OPTIONS = [
  "1ère",
  "2ème",
  "3ème",
  "4éme"
];

const SECTIONS_OPTIONS = [
  "Sciences de l'Informatique",
  "Mathématiques",
  "Sciences Expérimentales",
  "Sciences Techniques",
  "Économie & Gestion",
  "Lettres",
  "Sport",
  "Tronc Commun"
];

const STUDY_GROUPS = Array.from({length: 26}, (_, i) => String.fromCharCode(65 + i));

export function BadgeGroup({ group }: { group?: string | null }) {
  const g = group && group !== "Sans groupe" && group !== "Non assigné" ? group : null;
  if (!g) {
    return (
      <span className="text-[9px] font-semibold text-gray-500 bg-gray-100 border border-gray-200 rounded px-1.5 py-0.5 shrink-0 inline-flex items-center">
        Sans groupe
      </span>
    );
  }
  return (
    <span className="text-[9px] font-bold uppercase text-indigo-700 bg-indigo-50/90 border border-indigo-200/90 rounded px-1.5 py-0.5 shrink-0 inline-flex items-center gap-0.5 shadow-2xs">
      📚 Groupe {g}
    </span>
  );
}

export function filterStudents(studentsList: any[], selectedGroup: string) {
  if (!selectedGroup || selectedGroup === "Tous" || selectedGroup === "Tous les groupes" || selectedGroup === "ALL") {
    return studentsList;
  }
  if (selectedGroup === "Non assigné" || selectedGroup === "Sans groupe") {
    return studentsList.filter(s => !s.study_group && !s.groupe_etude && !s.studyGroup);
  }
  return studentsList.filter(s => {
    const studentGroup = s.study_group || s.groupe_etude || s.studyGroup;
    return studentGroup === selectedGroup;
  });
}

const UNIFIED_BRANCHES_LIST = [
  "Sciences de l'Informatique",
  "Mathématiques",
  "Sciences Expérimentales",
  "Sciences Techniques",
  "Économie & Gestion",
  "Lettres",
  "Sport"
];

const SECTIONS_BY_GRADE: Record<string, string[]> = {
  "1ère": ["Tronc Commun"],
  "1ère Année": ["Tronc Commun"],
  "2ème": UNIFIED_BRANCHES_LIST,
  "2ème Année": UNIFIED_BRANCHES_LIST,
  "3ème": UNIFIED_BRANCHES_LIST,
  "3ème Année": UNIFIED_BRANCHES_LIST,
  "4éme": UNIFIED_BRANCHES_LIST,
  "4ème Année": UNIFIED_BRANCHES_LIST
};

interface AdminConsoleProps {
  currentUser: User;
  setCurrentUser?: React.Dispatch<React.SetStateAction<User | null>>;
  onAdminActionRefetch: () => void;
  allUsersList: User[];
  initialActiveSubTab?: "users" | "receipts" | "reporting" | "shop" | "courses-upload" | "quizzes-upload" | "quizzes-history" | "courses-history" | "events" | "calendar" | "agents" | "audits" | "packs" | "signup-offers" | "todo-events" | "branding" | "media-icons" | "updates" | "acceptances" | "demos" | "profil-securite" | "profile";
  onSubTabChange?: (tab: any) => void;
  logoUrl?: string;
  logoText?: string;
  primaryColor?: string;
  secondaryColor?: string;
  heroImageUrl?: string;
  studentImageUrl?: string;
  loginImageUrl?: string;
  registerImageUrl?: string;
  platformIcon?: string;
  landingHeroTitle?: string;
  landingHeroHighlight?: string;
  landingHeroSubtext?: string;
  overlayAlAdmisText?: string;
  overlayAlAdmisBg?: string;
  overlayAlAdmisTextColor?: string;
  overlayKhaliaAlaynaText?: string;
  overlayKhaliaAlaynaBg?: string;
  overlayKhaliaAlaynaTextColor?: string;
  overlayPlatformActiveHeader?: string;
  overlayPlatformActiveSubtext?: string;
  overlayPlatformActiveIcon?: string;
  overlayPlatformActiveBg?: string;
  overlayPlatformActiveTextColor?: string;
  headingFont?: string;
  bodyFont?: string;
  authHeroImageConfig?: AuthHeroImageConfig | null;
  currentLanguage?: Language;
  onSaveBranding?: (config: {
    logoUrl?: string;
    logoText?: string;
    primaryColor?: string;
    secondaryColor?: string;
    heroImageUrl?: string;
    studentImageUrl?: string;
    loginImageUrl?: string;
    registerImageUrl?: string;
    platformIcon?: string;
    landingHeroTitle?: string;
    landingHeroHighlight?: string;
    landingHeroSubtext?: string;
    overlayAlAdmisText?: string;
    overlayAlAdmisBg?: string;
    overlayAlAdmisTextColor?: string;
    overlayKhaliaAlaynaText?: string;
    overlayKhaliaAlaynaBg?: string;
    overlayKhaliaAlaynaTextColor?: string;
    overlayPlatformActiveHeader?: string;
    overlayPlatformActiveSubtext?: string;
    overlayPlatformActiveIcon?: string;
    overlayPlatformActiveBg?: string;
    overlayPlatformActiveTextColor?: string;
    headingFont?: string;
    bodyFont?: string;
    authHeroImageConfig?: AuthHeroImageConfig | null;
  }) => Promise<boolean>;
}

export function AdminConsole({ 
  currentUser, 
  setCurrentUser,
  onAdminActionRefetch, 
  allUsersList,
  initialActiveSubTab,
  onSubTabChange,
  logoUrl = "",
  logoText = "A-Zed Info",
  primaryColor = "#0F1E36",
  secondaryColor = "#10B981",
  heroImageUrl = "",
  studentImageUrl = "",
  loginImageUrl = "",
  registerImageUrl = "",
  platformIcon = "",
  landingHeroTitle = "",
  landingHeroHighlight = "",
  landingHeroSubtext = "",
  overlayAlAdmisText = "",
  overlayAlAdmisBg = "",
  overlayAlAdmisTextColor = "",
  overlayKhaliaAlaynaText = "",
  overlayKhaliaAlaynaBg = "",
  overlayKhaliaAlaynaTextColor = "",
  overlayPlatformActiveHeader = "",
  overlayPlatformActiveSubtext = "",
  overlayPlatformActiveIcon = "",
  overlayPlatformActiveBg = "",
  overlayPlatformActiveTextColor = "",
  headingFont = "Inter",
  bodyFont = "Inter",
  authHeroImageConfig = null,
  currentLanguage = "fr",
  onSaveBranding
}: AdminConsoleProps) {
  const t = translations[currentLanguage];
  const [activeSubTab, setActiveSubTab] = useState<"users" | "receipts" | "reporting" | "shop" | "courses-upload" | "quizzes-upload" | "quizzes-history" | "courses-history" | "events" | "calendar" | "agents" | "audits" | "packs" | "signup-offers" | "todo-events" | "branding" | "media-icons" | "updates" | "acceptances" | "demos" | "profil-securite" | "profile">(initialActiveSubTab || "users");
  const [cmsMode, setCmsMode] = useState<"standard" | "manager">("manager");

  useEffect(() => {
    if (initialActiveSubTab) {
      setActiveSubTab(initialActiveSubTab);
    }
  }, [initialActiveSubTab]);

  const handleSubTabClick = (tab: any) => {
    setActiveSubTab(tab);
    if (onSubTabChange) {
      onSubTabChange(tab);
    }
  };
  const [users, setUsers] = useState<User[]>([]);
  const [usersLoading, setUsersLoading] = useState<boolean>(true);
  const [usersError, setUsersError] = useState<string | null>(null);
  const students = users;
  const setStudents = setUsers;
  const [receipts, setReceipts] = useState<PaymentReceipt[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [events, setEvents] = useState<LiveEvent[]>([]);
  const [todoEvents, setTodoEvents] = useState<any[]>([]);
  const [newTodo, setNewTodo] = useState({
    name: "",
    date: "",
    hour: "",
    dueDate: "",
    notes: "",
    pdfContent: "",
    pdfName: "",
    reminder: "",
    isPremium: false,
    allowedTiers: ['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS'] as StudentTier[],
    targetClass: "Tous"
  });
  const [todoSearch, setTodoSearch] = useState("");
  const [isSubmittingTodo, setIsSubmittingTodo] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [auditSearch, setAuditSearch] = useState("");
  const [auditAgentFilter, setAuditAgentFilter] = useState("all");
  const [commissions, setCommissions] = useState<Commission[]>([]);
  const [withdrawals, setWithdrawals] = useState<CommissionWithdrawal[]>([]);
  const [withdrawalToConfirm, setWithdrawalToConfirm] = useState<CommissionWithdrawal | null>(null);
  const [visibleAgentPasswords, setVisibleAgentPasswords] = useState<Record<string, boolean>>({});
  const [selectedAgentForWithdrawals, setSelectedAgentForWithdrawals] = useState<User | null>(null);

  // Password reset requests state
  const [passwordResets, setPasswordResets] = useState<any[]>([]);
  const [userSubTab, setUserSubTab] = useState<"students" | "resets">("students");
  const [resetFilterStatus, setResetFilterStatus] = useState<"all" | "pending" | "resolved">("pending");

  // Agent management states
  const [newAgent, setNewAgent] = useState({
    fullName: "",
    email: "",
    password: "",
    city: "",
    highSchool: "",
    address: "",
    agentType: "assistant" as "assistant" | "professeur"
  });
  const [editingAgent, setEditingAgent] = useState<User | null>(null);

  // General User Profile editing states
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editUserForm, setEditUserForm] = useState<Partial<User>>({});
  const [studentToDelete, setStudentToDelete] = useState<User | null>(null);
  const [isDeletingStudent, setIsDeletingStudent] = useState<boolean>(false);

  const renderPackIcon = (iconName: string | undefined, size = 16, className = "") => {
    switch (iconName) {
      case "Award": return <Award size={size} className={className} />;
      case "Gift": return <Gift size={size} className={className} />;
      case "Zap": return <Zap size={size} className={className} />;
      case "Shield": return <Shield size={size} className={className} />;
      case "Sparkles": return <Sparkles size={size} className={className} />;
      case "Layers": return <Layers size={size} className={className} />;
      case "BookOpen": return <BookOpen size={size} className={className} />;
      case "Video": return <Video size={size} className={className} />;
      case "Terminal": return <Terminal size={size} className={className} />;
      case "Activity": return <Activity size={size} className={className} />;
      default: return <Award size={size} className={className} />;
    }
  };

  // Custom confirmation modal to avoid iframe Confirm blocks
  const [confirmModal, setConfirmModal] = useState<{
    title: string;
    message: string;
    onConfirm: () => void;
  } | null>(null);

  // Search & Filter state for Users
  const [userSearch, setUserSearch] = useState("");
  const [gradeFilter, setGradeFilter] = useState("Tous");
  const [statusFilter, setStatusFilter] = useState("Tous");
  const [sectionFilter, setSectionFilter] = useState("Tous");
  const [groupFilter, setGroupFilter] = useState("Tous");
  const [cityFilter, setCityFilter] = useState("");
  const [dateRegFilter, setDateRegFilter] = useState("");
  const [hourRegFilter, setHourRegFilter] = useState("");
  const [userPage, setUserPage] = useState(1);
  const [userPageSize, setUserPageSize] = useState(15);

  useEffect(() => {
    setUserPage(1);
  }, [userSearch, gradeFilter, statusFilter, sectionFilter, groupFilter, cityFilter, dateRegFilter, hourRegFilter]);

  // Search & Filter state for Upload History
  const [courseFileTypeFilter, setCourseFileTypeFilter] = useState("Tous");
  const [courseGradeFilter, setCourseGradeFilter] = useState("Tous");
  const [coursePremiumFilter, setCoursePremiumFilter] = useState("Tous");
  const [courseSearchText, setCourseSearchText] = useState("");

  // Edit / Event Planners
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [isSubmittingLive, setIsSubmittingLive] = useState(false);
  const liveFormRef = useRef<HTMLDivElement>(null);

  // Success/Error notifications
  const [feedback, setFeedback] = useState<{ msg: string; type: "success" | "error" } | null>(null);

  const getSubMenuOptionsForType = (type: string) => {
    switch (type) {
      case "exercise":
        return [
          { value: "1ere trimestre", label: "1er Trimestre" },
          { value: "2eme trimestre", label: "2ème Trimestre" },
          { value: "3eme trimestre", label: "3ème Trimestre" },
          { value: "revision", label: "Énoncé Live" },
        ];
      case "exercise_corrected":
        return [
          { value: "1ere trimestre", label: "1er Trimestre" },
          { value: "2eme trimestre", label: "2ème Trimestre" },
          { value: "3eme trimestre", label: "3ème Trimestre" },
          { value: "revision", label: "Live Enregistré" },
        ];
      case "revision":
        return [
          { value: "enonce", label: "Énoncé" },
          { value: "correction", label: "Correction" },
        ];
      case "course":
      case "quiz":
      default:
        return [
          { value: "1ere trimestre", label: "1er Trimestre" },
          { value: "2eme trimestre", label: "2ème Trimestre" },
          { value: "3eme trimestre", label: "3ème Trimestre" },
        ];
    }
  };

  const getContentTypeLabel = (type: string) => {
    switch (type) {
      case "course": return "Fiches & cours";
      case "exercise": return "Devoirs & Exercices";
      case "exercise_corrected": return "Zone Correction";
      case "revision": return "Révision";
      case "quiz": return "Quiz Interactifs";
      case "devoirs_exercices_fiches_cours": return "Fiche & Exercice";
      default: return type;
    }
  };

  // Form states for new Material (Course, Exercise, Quiz)
  const [newMaterial, setNewMaterial] = useState({
    title: "",
    duration: "45 min",
    grade: "4ème Année",
    section: "Sciences de l'Informatique",
    module: "Algorithmes Avancés",
    isPremium: true,
    targetTiers: ['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS'] as StudentTier[],
    fileType: "pdf" as "mp4" | "pdf" | "txt" | "py",
    contentType: "course" as "course" | "exercise" | "quiz" | "exercise_corrected" | "devoirs_exercices_fiches_cours" | "revision",
    videoUrl: "",
    attachmentName: "",
    textContent: "",
    solutionCode: "",
    trimestre: "1ere trimestre",
    fileData: ""
  });

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);

  // States for dynamic academic material title history suggestions
  const [showMaterialTitleHistory, setShowMaterialTitleHistory] = useState(false);
  const [materialTitleHistory, setMaterialTitleHistory] = useState<string[]>([]);

  // Form states for new Quiz
  const [newQuizTitle, setNewQuizTitle] = useState("");
  const [showTitleHistory, setShowTitleHistory] = useState(false);
  const [newQuizGrade, setNewQuizGrade] = useState("4ème Année");
  const [newQuizSection, setNewQuizSection] = useState("Sciences de l'Informatique");
  const [newQuizDifficulty, setNewQuizDifficulty] = useState<"Debutant" | "Intermediaire" | "Avance">("Intermediaire");
  const [newQuizIsPremium, setNewQuizIsPremium] = useState(true);
  const [newQuizAllowedTiers, setNewQuizAllowedTiers] = useState<StudentTier[]>(['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS']);
  const [newQuizScore, setNewQuizScore] = useState(20);
  const [newQuizTrimester, setNewQuizTrimester] = useState("1er trimestre");

  // Editing quiz states
  const [editingQuiz, setEditingQuiz] = useState<any | null>(null);
  const [editingQuizTitle, setEditingQuizTitle] = useState("");
  const [editingQuizGrade, setEditingQuizGrade] = useState("4ème Année");
  const [editingQuizSection, setEditingQuizSection] = useState("Sciences de l'Informatique");
  const [editingQuizDifficulty, setEditingQuizDifficulty] = useState<"Debutant" | "Intermediaire" | "Avance">("Intermediaire");
  const [editingQuizIsPremium, setEditingQuizIsPremium] = useState(true);
  const [editingQuizAllowedTiers, setEditingQuizAllowedTiers] = useState<StudentTier[]>(['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS']);
  const [editingQuizScore, setEditingQuizScore] = useState(20);
  const [editingQuizTrimester, setEditingQuizTrimester] = useState("1er trimestre");
  const [editingQuizQuestions, setEditingQuizQuestions] = useState<any[]>([]);

  // Quiz preview state
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewAnswers, setPreviewAnswers] = useState<{ [qIdx: number]: number }>({});
  const [previewChecked, setPreviewChecked] = useState<{ [qIdx: number]: boolean }>({});

  // Quiz tips list and edit states
  const [quizTipsList, setQuizTipsList] = useState<any[]>([]);
  const [editingTipId, setEditingTipId] = useState<string | null>(null);
  const [editingTipText, setEditingTipText] = useState("");
  const [newTipText, setNewTipText] = useState("");
  const [newQuizQuestions, setNewQuizQuestions] = useState<Array<{
    id: string;
    questionText: string;
    options: string[];
    correctAnswerIndex: number;
    explanation: string;
  }>>([
    {
      id: "q_1",
      questionText: "",
      options: ["", "", "", ""],
      correctAnswerIndex: 0,
      explanation: ""
    }
  ]);

  const SECTIONS_FOR_QUIZ = [
    { value: "Sciences de l'Informatique", label: "Sciences de l'Informatique" },
    { value: "Mathématiques", label: "Mathématiques" },
    { value: "Sciences Expérimentales", label: "Sciences Expérimentales" },
    { value: "Sciences Techniques", label: "Sciences Techniques" },
    { value: "Économie & Gestion", label: "Économie & Gestion" },
    { value: "Lettres", label: "Lettres" },
    { value: "Sport", label: "Sport" }
  ];

  const handleSectionToggle = (val: string) => {
    setIsQuizValidated(false);
    let current = newQuizSection ? newQuizSection.split(",").map(s => s.trim()) : [];
    if (val === "Tous") {
      if (current.includes("Tous")) {
        setNewQuizSection("");
      } else {
        setNewQuizSection("Tous");
      }
      return;
    }
    
    // If "Tous" is active, remove it
    current = current.filter(s => s !== "Tous" && s !== "");
    
    if (current.includes(val)) {
      const updated = current.filter(s => s !== val);
      setNewQuizSection(updated.join(", "));
    } else {
      const updated = [...current, val];
      setNewQuizSection(updated.join(", "));
    }
  };

  // AI Extraction States
  const [aiPasteText, setAiPasteText] = useState("");
  const [aiSelectedFile, setAiSelectedFile] = useState<File | null>(null);
  const [aiFileBase64, setAiFileBase64] = useState<string | null>(null);
  const [aiFileType, setAiFileType] = useState<"pdf" | "txt" | null>(null);
  const [isAiGenerating, setIsAiGenerating] = useState(false);
  const [aiSuccessMsg, setAiSuccessMsg] = useState<string | null>(null);
  const [aiErrorMsg, setAiErrorMsg] = useState<string | null>(null);

  const handleAiFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAiSelectedFile(file);
      const isPdf = file.name.toLowerCase().endsWith(".pdf");
      const isTxt = file.name.toLowerCase().endsWith(".txt");
      if (isPdf) {
        setAiFileType("pdf");
      } else if (isTxt) {
        setAiFileType("txt");
      } else {
        setAiErrorMsg("Seuls les fichiers PDF ou TXT sont supportés.");
        return;
      }
      setAiErrorMsg(null);

      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        const base64Data = base64String.split(",")[1];
        setAiFileBase64(base64Data);
      };
      reader.readAsDataURL(file);
    }
  };

  // Preview states
  const [isPreviewQuizActive, setIsPreviewQuizActive] = useState(false);
  const [previewSelectedAnswers, setPreviewSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [previewSubmitted, setPreviewSubmitted] = useState(false);
  const [previewScore, setPreviewScore] = useState(0);

  // Validation state for custom Quiz generator
  const [isQuizValidated, setIsQuizValidated] = useState(false);

  // Form states for new Product
  const [newProduct, setNewProduct] = useState({
    title: "",
    description: "",
    price: "",
    oldPrice: "",
    promoBadge: "",
    promoBadgeType: "auto" as "auto" | "custom",
    showPromoBadge: true,
    image: "",
    category: "Pack PDF" as "Cours Video" | "Pack PDF" | "Full Access" | "Hardware"
  });

  // Form states for new Premium Pack
  const [newPack, setNewPack] = useState({
    title: "",
    description: "",
    price: "",
    oldPrice: "",
    promoBadge: "",
    promoBadgeType: "auto" as "auto" | "custom",
    showPromoBadge: true,
    image: "",
    category: "Full Access" as "Cours Video" | "Pack PDF" | "Full Access" | "Hardware",
    icon: "Award"
  });

  // Form states for new Live Event
  const [newEvent, setNewEvent] = useState({
    title: "",
    instructor: "M. Nabil Chaouch",
    date: "",
    time: "",
    durationMinutes: "90",
    zoomLink: "",
    grade: "Tous",
    section: "Tous",
    targetGroups: ["ALL"] as string[],
    type: "live" as "live" | "exam" | "event" | "homework",
    event_type: "live_session" as "live_session" | "homework" | "exam" | "event",
    description: "",
    notify_students: true,
    notification_timing: "30min" as "now" | "15min" | "30min" | "1hour" | "2hours" | "1day" | "custom",
    custom_notification_time: "",
    frequency_type: "single" as "single" | "recurring",
    date_debut: "",
    date_fin: "",
    recurrence_pattern: "weekly" as "daily" | "weekly" | "every_2_days" | "mon_wed_fri"
  });

  // Shared active dynamic sections list (to allow administrative creation of sections/chapters)
  const [dynamicModules, setDynamicModules] = useState<string[]>([
    "Bases Logiques",
    "Logique Conditionnelle",
    "Algorithmes Avancés",
    "Bases de Données",
    "Traitement Graphique",
    "Dossier de Révision"
  ]);
  const [newSectionInput, setNewSectionInput] = useState("");

  const showFeedback = (msg: string, type: "success" | "error" = "success") => {
    setFeedback({ msg, type });
    setTimeout(() => {
      setFeedback(null);
    }, 4000);
  };

  // Load users dynamically from Supabase profiles table
  const loadUsers = async () => {
    setUsersLoading(true);
    setUsersError(null);
    try {
      if (supabase) {
        const { data, error } = await supabase.from("profiles").select("*");
        if (error) {
          setUsersError(error.message);
        } else if (data) {
          const mappedUsers: User[] = data.map((p: any) => ({
            id: p.id,
            email: p.email || "",
            fullName: p.full_name || p.fullName || p.email || "Utilisateur",
            role: p.role || "student",
            grade: p.grade || "4ème Année",
            section: p.section || "Sciences de l'Informatique",
            status: p.status || "active",
            activeSessionId: null,
            avatarUrl: p.avatar_url || "",
            createdAt: p.created_at || new Date().toISOString(),
            accountType: p.account_type || "freemium",
            verified: p.verified !== undefined ? p.verified : true,
            phone: p.phone,
            city: p.city,
            highSchool: p.high_school || p.highSchool,
            tier: p.tier || (p.account_type === "premium" ? "PREMIUM" : "FREEMIUM"),
            badgeLabel: p.badge_label || (p.account_type === "premium" ? "⭐ Premium" : "Option Gratuit")
          }));

          PRESEEDED_USERS.forEach((admin) => {
            if (!mappedUsers.some((u) => u.email.toLowerCase() === admin.email.toLowerCase())) {
              mappedUsers.unshift(admin);
            }
          });

          setUsers(mappedUsers);
        }
      } else {
        const res = await fetch("/api/users", {
          headers: { "x-user-role": currentUser.role }
        });
        if (!res.ok) {
          throw new Error("Erreur de chargement des utilisateurs.");
        }
        const data = await res.json();
        if (Array.isArray(data)) setUsers(data);
      }
    } catch (err: any) {
      console.error("Error loading users:", err);
      setUsersError(err?.message || "Impossible de charger les utilisateurs.");
    } finally {
      setUsersLoading(false);
    }
  };

  // Synchronize all dataset lists
  const refreshData = () => {
    // 1. Fetch Users dynamically from Supabase profiles table
    loadUsers();

    // 2. Fetch Receipts
    fetch("/api/admin/receipts")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setReceipts(data);
      })
      .catch((err) => console.error(err));

    // 3. Fetch Products
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setProducts(data);
      })
      .catch((err) => console.error(err));

    // 4. Fetch Courses
    fetch("/api/courses", {
      headers: {
        "x-user-grade": "Tous",
        "x-user-role": "admin"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCourses(data);
          // Auto collect unique chapter/modules names dynamically to preserve admin settings
          const modules = Array.from(new Set(data.map((c: any) => c.module as string)));
          if (modules.length > 0) {
            setDynamicModules((prev) => Array.from(new Set([...prev, ...modules])));
          }
        }
      })
      .catch((err) => console.error(err));

    // 5. Fetch Events
    fetch("/api/events", {
      headers: {
        "x-user-role": "admin",
        "x-user-grade": "Tous"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setEvents(data);
      })
      .catch((err) => console.error(err));

    // 6. Fetch Complete Audit Logs
    fetch("/api/admin/audit-logs")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setAuditLogs(data);
      })
      .catch((err) => console.error("Error loading audit logs:", err));

    // 7. Fetch Todo Events
    fetch("/api/todo-events")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setTodoEvents(data);
      })
      .catch((err) => console.error("Error loading todo events:", err));

    // 8. Fetch Quizzes
    fetch("/api/quizzes", {
      headers: {
        "x-user-role": "admin"
      }
    })
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuizzes(data);
      })
      .catch((err) => console.error("Error loading quizzes:", err));

    // 9. Fetch Quiz Tips
    fetch("/api/quizzes/tips")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setQuizTipsList(data);
      })
      .catch((err) => console.error("Error loading quiz tips:", err));

    // 10. Fetch Commissions
    fetch("/api/commissions")
      .then(async (res) => {
        const ct = res.headers.get("content-type");
        if (!ct || !ct.includes("application/json")) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setCommissions(data);
      })
      .catch((err) => {
        if (err.message?.includes("Failed to fetch") || err.message?.includes("Unexpected token") || err.message?.includes("is not valid JSON")) return;
        console.error("Error loading commissions:", err);
      });

    // 11. Fetch Withdrawal Requests
    fetch("/api/commissions/withdrawals")
      .then(async (res) => {
        const ct = res.headers.get("content-type");
        if (!ct || !ct.includes("application/json")) return null;
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setWithdrawals(data);
      })
      .catch((err) => {
        if (err.message?.includes("Failed to fetch") || err.message?.includes("Unexpected token") || err.message?.includes("is not valid JSON")) return;
        console.error("Error loading withdrawals:", err);
      });
      
    // 12. Fetch Password Reset Requests
    fetch("/api/admin/password-resets")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) setPasswordResets(data);
      })
      .catch((err) => console.error("Error loading password resets:", err));

    onAdminActionRefetch();
  };

  const handleSendResetMail = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/password-resets/${id}/send-mail`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'envoi de l'e-mail");
      showFeedback(data.message || "E-mail de réinitialisation envoyé avec succès !");
      refreshData();
    } catch (err: any) {
      showFeedback(err.message || "Erreur de traitement", "error");
    }
  };

  const handleRegenerateTempPassword = async (id: string) => {
    const customPass = prompt("Saisissez un mot de passe temporaire pour l'élève (Laissez vide pour générer un mot de passe automatique) :");
    if (customPass === null) return; // User cancelled prompt

    try {
      const res = await fetch(`/api/admin/password-resets/${id}/temp-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempPassword: customPass })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de la régénération");
      showFeedback(data.message || `Mot de passe temporaire (${data.tempPassword}) attribué !`);
      refreshData();
    } catch (err: any) {
      showFeedback(err.message || "Erreur de traitement", "error");
    }
  };

  const handleMarkResolved = async (id: string) => {
    try {
      const res = await fetch(`/api/admin/password-resets/${id}/resolve`, {
        method: "POST"
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur lors de l'action");
      showFeedback("Demande marquée comme traitée.");
      refreshData();
    } catch (err: any) {
      showFeedback(err.message || "Erreur de traitement", "error");
    }
  };

  const handleWithdrawalAction = (id: string, action: "approved" | "rejected") => {
    fetch("/api/commissions/withdrawals/action", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        withdrawalId: id,
        action
      })
    })
      .then((res) => {
        if (!res.ok) {
          return res.json().then(data => { throw new Error(data.msg || "Erreur de traitement."); });
        }
        return res.json();
      })
      .then(() => {
        showFeedback(`La demande a été ${action === "approved" ? "approuvée" : "rejetée"} avec succès !`, "success");
        refreshData();
      })
      .catch((err) => {
        showFeedback(err.message || "Erreur de connexion lors du traitement.", "error");
      });
  };

  useEffect(() => {
    refreshData();
    try {
      const saved = localStorage.getItem("admin_material_title_history");
      if (saved) {
        setMaterialTitleHistory(JSON.parse(saved));
      }
    } catch (e) {
      console.error("Failed to load material title history", e);
    }
  }, []);

  // --- ACTIONS FOR USERS ---

  const handleUpdateStatus = (userId: string, status: "pending" | "active" | "disabled", verified?: boolean) => {
    fetch("/api/admin/users/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, status, verified })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not update");
        return res.json();
      })
      .then((data) => {
        showFeedback("Statut du profil mis à jour !");
        refreshData();
      })
      .catch((err) => showFeedback(err.message, "error"));
  };

  const handleUpdateSubscriptionType = (userId: string, subscriptionType: "freemium" | "mensuel" | "trimestriel" | "annuel" | "revision") => {
    fetch("/api/admin/users/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, subscriptionType })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not update subscription");
        return res.json();
      })
      .then((data) => {
        showFeedback("Forfait d'abonnement mis à jour avec succès !");
        refreshData();
      })
      .catch((err) => showFeedback(err.message, "error"));
  };

  const handleGroupChange = (userId: string, group: string) => {
    const newGroupValue = (group === "Non assigné" || !group) ? "" : group;

    // 1. Immediate local state update for instant UI response (immutable update)
    setStudents((prevStudents) =>
      prevStudents.map((student) =>
        student.id === userId
          ? {
              ...student,
              study_group: newGroupValue === "" ? null : newGroupValue,
              groupe_etude: newGroupValue,
              studyGroup: newGroupValue
            }
          : student
      )
    );

    // Update current_user in localStorage if modifying current session user
    try {
      const storedUser = localStorage.getItem("current_user");
      if (storedUser) {
        const currentUser = JSON.parse(storedUser);
        if (currentUser.id === userId) {
          currentUser.groupe_etude = newGroupValue;
          currentUser.studyGroup = newGroupValue;
          currentUser.study_group = newGroupValue;
          localStorage.setItem("current_user", JSON.stringify(currentUser));
        }
      }
    } catch (e) {}

    // 2. Save in Database / API
    fetch(`/api/admin/students/${userId}/group`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        study_group: newGroupValue,
        groupe_etude: newGroupValue,
        studyGroup: newGroupValue,
        group: newGroupValue
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur de mise à jour du groupe");
        return res.json();
      })
      .then(() => {
        showFeedback(`Groupe d'étude mis à jour : ${newGroupValue ? "Groupe " + newGroupValue : "Non assigné"}`);
      })
      .catch((err) => showFeedback(err.message, "error"));
  };

  const handleUpdateStudyGroup = handleGroupChange;

  const getExpirationStatus = (user: any) => {
    if (user.accountType !== "premium" || !user.subscriptionExpiresAt) return null;
    const expiresAt = new Date(user.subscriptionExpiresAt).getTime();
    const timeLeft = expiresAt - Date.now();
    
    if (timeLeft <= 0) {
      return { status: "expired", label: "Expiré", className: "bg-red-100 text-red-800 border-red-350" };
    }
    if (timeLeft <= 24 * 60 * 60 * 1000) {
      return { status: "soon", label: "⏳ Expiré < 24h", className: "bg-rose-100 text-rose-800 border-rose-300 animate-pulse font-extrabold" };
    }
    return { status: "active", label: "Actif", className: "bg-emerald-100 text-emerald-800 border-emerald-300" };
  };

  const askConfirmation = (title: string, message: string, onConfirm: () => void) => {
    setConfirmModal({ title, message, onConfirm });
  };

  const handleDisableUser = (userId: string) => {
    askConfirmation(
      "Bloquer un Lycéen",
      "Voulez-vous vraiment désactiver ce compte élève ? Son accès au Sandbox sera immédiatement banni.",
      () => {
        fetch("/api/admin/users/disable", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId })
        })
          .then((res) => res.json())
          .then(() => {
            showFeedback("Accès élève bloqué 🔒");
            refreshData();
          })
          .catch((err) => showFeedback("Erreur", "error"));
      }
    );
  };

  const handleRefuseUser = (userId: string) => {
    askConfirmation(
      "Refuser l'admission",
      "Voulez-vous refuser cette demande d'inscription d'élève ?",
      () => {
        fetch("/api/admin/users/status", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ userId, status: "pending", verified: false })
        })
          .then((res) => {
            if (!res.ok) throw new Error("Could not reject");
            return res.json();
          })
          .then(() => {
            showFeedback("Demande d'inscription refusée.");
            refreshData();
          })
          .catch((err) => showFeedback(err.message, "error"));
      }
    );
  };

  const handleRequestDelete = (student: User) => {
    setStudentToDelete(student);
  };

  const handleConfirmDelete = async () => {
    if (!studentToDelete) return;
    const targetId = studentToDelete.id;
    const targetName = studentToDelete.fullName;

    try {
      setIsDeletingStudent(true);
      await deleteStudentFromDB(targetId);
      setUsers((prev) => prev.filter((s) => s.id !== targetId));
      showFeedback(`✅ Le compte élève ${targetName} a été supprimé avec succès.`);
      setStudentToDelete(null);
      refreshData();
    } catch (err: any) {
      showFeedback(err.message || "Erreur de suppression du compte", "error");
    } finally {
      setIsDeletingStudent(false);
    }
  };

  const handleDeleteUser = (userId: string) => {
    const student = users.find(u => u.id === userId);
    if (student) {
      handleRequestDelete(student);
    } else {
      askConfirmation(
        "Supprimer définitivement",
        "⚠️ Action irréversible. Êtes-vous sûr d'effacer COMPLÈTEMENT le compte de cet élève ainsi que tous ses justificatifs financiers ?",
        () => {
          fetch(`/api/admin/users/${userId}`, {
            method: "DELETE"
          })
            .then((res) => res.json())
            .then(() => {
              showFeedback("Compte effacé de la base de données.");
              refreshData();
            })
            .catch((err) => showFeedback("Erreur de suppression", "error"));
        }
      );
    }
  };

  const formatDateTime = (isoString?: string) => {
    if (!isoString) return "Non spécifiée";
    try {
      const date = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `Le ${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} à ${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch (e) {
      return isoString;
    }
  };

  const formatDateOnly = (isoString?: string) => {
    if (!isoString) return "Non spécifiée";
    try {
      const date = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()}`;
    } catch (e) {
      return "Non spécifiée";
    }
  };

  const formatTimeOnly = (isoString?: string) => {
    if (!isoString) return "Non spécifiée";
    try {
      const date = new Date(isoString);
      const pad = (n: number) => n.toString().padStart(2, "0");
      return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
    } catch (e) {
      return "Non spécifiée";
    }
  };

  const handleUpdateCity = (userId: string, newCity: string) => {
    fetch("/api/admin/users/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, city: newCity })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not update city");
        return res.json();
      })
      .then(() => {
        showFeedback("Ville de l'élève mise à jour ! ✅");
        refreshData();
      })
      .catch(() => showFeedback("Erreur de mise à jour de la ville", "error"));
  };

  const handleUpdateHighSchool = (userId: string, newHighSchool: string) => {
    fetch("/api/admin/users/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, highSchool: newHighSchool })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not update high school");
        return res.json();
      })
      .then(() => {
        showFeedback("Lycée de l'élève mis à jour ! ✅");
        refreshData();
      })
      .catch(() => showFeedback("Erreur de mise à jour du lycée", "error"));
  };

  const handleUpdatePassword = (userId: string, newPass: string) => {
    fetch("/api/admin/users/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, password: newPass })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Could not update password");
        return res.json();
      })
      .then(() => {
        showFeedback("Mot de passe mis à jour ! ✅");
        refreshData();
      })
      .catch(() => showFeedback("Erreur de mise à jour du mot de passe", "error"));
  };

  const handleRevokePack = (userId: string, packName: string) => {
    fetch("/api/admin/users/cancel-pack", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, packName })
    })
      .then((res) => res.json())
      .then(() => {
        showFeedback("Pack annulé chez le lycéen.");
        refreshData();
      })
      .catch((err) => showFeedback("Erreur", "error"));
  };

  const handleAddPackToUser = (userId: string) => {
    const pack = prompt("Saisissez le nom du Pack à accorder manuellement (ex: Pack Trimestriel Tunisien, Full Access, etc.) :");
    if (!pack) return;
    const user = users.find(u => u.id === userId);
    if (!user) return;
    const packs = Array.from(new Set([...(user.packs || []), pack]));
    
    fetch("/api/admin/users/status", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, packs })
    })
      .then((res) => res.json())
      .then(() => {
        showFeedback("Nouveau Pack ajouté à l'étudiant !");
        refreshData();
      });
  };

  // --- ACTIONS FOR RECEIPTS ---

  const handleApproveReceipt = (receiptId: string) => {
    fetch("/api/admin/receipts/approve", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ receiptId })
    })
      .then((res) => res.json())
      .then(() => {
        showFeedback("Reçu approuvé ! Notification de félicitations envoyée.");
        refreshData();
      })
      .catch((err) => showFeedback("Erreur", "error"));
  };

  const handleRejectReceipt = (receiptId: string) => {
    askConfirmation(
      "Rejeter / Annuler la commande",
      "Voulez-vous rejeter cette commande ? Si elle avait été validée par un agent, la commission correspondante sera automatiquement retranchée de son solde et l'agent sera notifié.",
      () => {
        fetch("/api/admin/receipts/reject", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ receiptId })
        })
          .then((res) => res.json())
          .then(() => {
            showFeedback("Commande rejetée. Statut mis à jour et commissions déduites si applicable.");
            refreshData();
          })
          .catch((err) => showFeedback("Erreur lors du rejet", "error"));
      }
    );
  };

  // --- ACTIONS FOR PRODUCTS ---

  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProduct.title || !newProduct.price) {
      showFeedback("Veuillez remplir les informations obligatoires.", "error");
      return;
    }
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newProduct)
    })
      .then((res) => res.json())
      .then(() => {
        showFeedback("Produit ajouté avec succès !");
        setNewProduct({ title: "", description: "", price: "", oldPrice: "", promoBadge: "", promoBadgeType: "auto", showPromoBadge: true, image: "", category: "Pack PDF" });
        refreshData();
      })
      .catch((err) => showFeedback("Erreur de création", "error"));
  };

  const handleDeleteProduct = (productId: string) => {
    askConfirmation(
      "Retirer le produit",
      "Voulez-vous retirer ce produit du catalogue boutique ?",
      () => {
        fetch(`/api/admin/products/${productId}`, {
          method: "DELETE"
        })
          .then((res) => res.json())
          .then(() => {
            showFeedback("Produit retiré du catalogue.");
            refreshData();
          });
      }
    );
  };

  const handleCreatePack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPack.title || !newPack.price) {
      showFeedback("Veuillez remplir les informations obligatoires.", "error");
      return;
    }
    fetch("/api/admin/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(newPack)
    })
      .then((res) => res.json())
      .then(() => {
        showFeedback("Offre Premium / Pack créé avec succès !");
        setNewPack({ title: "", description: "", price: "", oldPrice: "", promoBadge: "", promoBadgeType: "auto", showPromoBadge: true, image: "", category: "Full Access", icon: "Award" });
        refreshData();
      })
      .catch((err) => showFeedback("Erreur de création du pack", "error"));
  };

  const handleDeletePack = (packId: string) => {
    askConfirmation(
      "Retirer l'offre Premium",
      "Voulez-vous retirer cette offre Premium du catalogue boutique ?",
      () => {
        fetch(`/api/admin/products/${packId}`, {
          method: "DELETE"
        })
          .then((res) => res.json())
          .then(() => {
            showFeedback("Offre Premium retirée.");
            refreshData();
          });
      }
    );
  };

  // --- ACTIONS FOR QUIZ CREATION & AI EXTRACTION ---

  const handleAddQuestionManual = () => {
    setIsQuizValidated(false);
    setNewQuizQuestions((prev) => [
      ...prev,
      {
        id: `q_${Math.random().toString(36).substring(2, 9)}`,
        questionText: "",
        options: ["", "", "", ""],
        correctAnswerIndex: 0,
        explanation: ""
      }
    ]);
  };

  const handleDeleteQuestionManual = (id: string) => {
    if (newQuizQuestions.length <= 1) {
      showFeedback("Le quiz doit contenir au moins une question.", "error");
      return;
    }
    setIsQuizValidated(false);
    setNewQuizQuestions((prev) => prev.filter((q) => q.id !== id));
  };

  const handleUpdateQuestionManual = (id: string, field: string, value: any) => {
    setIsQuizValidated(false);
    setNewQuizQuestions((prev) =>
      prev.map((q) => {
        if (q.id === id) {
          if (field === "options") {
            return { ...q, options: value };
          } else {
            return { ...q, [field]: value };
          }
        }
        return q;
      })
    );
  };

  const handleExtractQuestions = async () => {
    if (!aiPasteText.trim() && !aiFileBase64) {
      setAiErrorMsg("Veuillez coller du texte ou sélectionner un fichier PDF/TXT à extraire.");
      return;
    }

    setIsAiGenerating(true);
    setAiErrorMsg(null);
    setAiSuccessMsg(null);

    try {
      const res = await fetch("/api/quizzes/extract", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: aiPasteText || undefined,
          fileBase64: aiFileBase64 || undefined,
          fileType: aiFileType || undefined
        })
      });

      if (!res.ok) {
        const errData = await res.json();
        throw new Error(errData.error || "Une erreur s'est produite lors de l'extraction.");
      }

      const data = await res.json();
      if (data.questions && data.questions.length > 0) {
        const mapped = data.questions.map((q: any, idx: number) => ({
          id: `q_ai_${idx}_${Math.random().toString(36).substring(2, 5)}`,
          questionText: q.questionText || "Question sans titre",
          options: q.options && q.options.length === 4 ? q.options : ["Option A", "Option B", "Option C", "Option D"],
          correctAnswerIndex: typeof q.correctAnswerIndex === "number" ? q.correctAnswerIndex : 0,
          explanation: q.explanation || ""
        }));
        setIsQuizValidated(false);
        setNewQuizQuestions(mapped);
        setAiSuccessMsg(`L'intelligence artificielle a extrait ${mapped.length} questions avec succès ! Vous pouvez les réviser, les modifier ou en ajouter ci-dessous.`);
        setAiPasteText("");
        setAiSelectedFile(null);
        setAiFileBase64(null);
        setAiFileType(null);
      } else {
        setAiErrorMsg("Aucune question n'a pu être extraite. Veuillez vérifier le contenu fourni.");
      }
    } catch (err: any) {
      console.error(err);
      setAiErrorMsg(err.message || "Erreur de connexion avec le service d'IA.");
    } finally {
      setIsAiGenerating(false);
    }
  };

  const handleValidateQuiz = () => {
    // 1. Check title
    if (!newQuizTitle.trim()) {
      showFeedback("Le titre du quiz est requis.", "error");
      setIsQuizValidated(false);
      return false;
    }

    // 2. Check target audience
    if (!newQuizGrade || !newQuizGrade.trim()) {
      showFeedback("Le niveau scolaire cible (Audience) est requis.", "error");
      setIsQuizValidated(false);
      return false;
    }
    if (!newQuizSection || !newQuizSection.trim()) {
      showFeedback("La filière cible (Audience) est requise.", "error");
      setIsQuizValidated(false);
      return false;
    }

    // 3. Check score
    if (!newQuizScore || isNaN(newQuizScore) || newQuizScore <= 0) {
      showFeedback("Le barème / score maximum doit être un nombre supérieur à 0.", "error");
      setIsQuizValidated(false);
      return false;
    }

    // 4. Check questions and answers
    if (!newQuizQuestions || newQuizQuestions.length === 0) {
      showFeedback("Le quiz doit contenir au moins une question.", "error");
      setIsQuizValidated(false);
      return false;
    }

    for (let i = 0; i < newQuizQuestions.length; i++) {
      const q = newQuizQuestions[i];
      const qNum = i + 1;

      // Check question text
      if (!q.questionText || !q.questionText.trim()) {
        showFeedback(`L'énoncé de la Question ${qNum} est vide.`, "error");
        setIsQuizValidated(false);
        return false;
      }

      // Check all 4 options
      for (let j = 0; j < q.options.length; j++) {
        if (!q.options[j] || !q.options[j].trim()) {
          const letter = String.fromCharCode(65 + j);
          showFeedback(`L'option ${letter} de la Question ${qNum} est vide.`, "error");
          setIsQuizValidated(false);
          return false;
        }
      }

      // Check correct answer index is set and valid
      if (q.correctAnswerIndex === undefined || q.correctAnswerIndex < 0 || q.correctAnswerIndex > 3 || isNaN(q.correctAnswerIndex)) {
        showFeedback(`Veuillez sélectionner une option de bonne réponse valide pour la Question ${qNum}.`, "error");
        setIsQuizValidated(false);
        return false;
      }
    }

    // If successful
    setIsQuizValidated(true);
    showFeedback("Validation réussie ! Toutes les questions, réponses, barème et publics cibles sont valides. Vous pouvez maintenant publier le quiz.", "success");
    return true;
  };

  const handlePublishCustomQuiz = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isQuizValidated) {
      showFeedback("Veuillez d'abord valider le quiz à l'aide du bouton de validation.", "error");
      return;
    }

    if (!newQuizTitle.trim()) {
      showFeedback("Veuillez saisir un titre de quiz.", "error");
      return;
    }

    const invalidQuestion = newQuizQuestions.find(q => !q.questionText.trim() || q.options.some(opt => !opt.trim()));
    if (invalidQuestion) {
      showFeedback("Toutes les questions et leurs 4 options doivent être remplies.", "error");
      return;
    }

    try {
      const isPrem = !newQuizAllowedTiers.includes('FREEMIUM');
      const payload = {
        title: newQuizTitle,
        type: "qcm" as const,
        grade: newQuizGrade,
        section: newQuizSection,
        difficulty: newQuizDifficulty,
        creatorName: currentUser.fullName,
        isPremium: isPrem,
        allowedTiers: newQuizAllowedTiers,
        targetTiers: newQuizAllowedTiers,
        score: newQuizScore,
        trimestre: newQuizTrimester,
        questions: newQuizQuestions.map(q => ({
          questionText: q.questionText,
          options: q.options,
          correctAnswerIndex: q.correctAnswerIndex,
          explanation: q.explanation
        }))
      };

      const res = await fetch("/api/quizzes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        throw new Error("Échec de la publication.");
      }

      showFeedback("Le quiz interactif a été publié avec succès !");
      
      setNewQuizTitle("");
      setNewQuizScore(20);
      setIsQuizValidated(false);
      setNewQuizQuestions([
        {
          id: "q_1",
          questionText: "",
          options: ["", "", "", ""],
          correctAnswerIndex: 0,
          explanation: ""
        }
      ]);
      
      refreshData();
      setActiveSubTab("courses-history");
    } catch (err) {
      console.error(err);
      showFeedback("Erreur de publication du quiz.", "error");
    }
  };

  // --- ACTIONS FOR QUIZZES HISTORY & EDITING ---

  const handleDeleteQuizFromHistory = (quizId: string) => {
    askConfirmation(
      "Supprimer un quiz",
      "Voulez-vous supprimer définitivement ce quiz interactif de la plateforme ?",
      () => {
        fetch(`/api/quizzes/${quizId}`, {
          method: "DELETE"
        })
          .then((res) => res.json())
          .then(() => {
            showFeedback("Le quiz a été supprimé avec succès.");
            refreshData();
          })
          .catch((err) => console.error(err));
      }
    );
  };

  const handleStartEditQuiz = (quiz: any) => {
    setEditingQuiz(quiz);
    setEditingQuizTitle(quiz.title || "");
    setEditingQuizGrade(quiz.grade || "4ème Année");
    setEditingQuizSection(quiz.section || "Sciences de l'Informatique");
    setEditingQuizDifficulty(quiz.difficulty || "Intermediaire");
    setEditingQuizIsPremium(quiz.isPremium ?? true);
    setEditingQuizAllowedTiers(quiz.allowedTiers || (quiz.isPremium ? ['PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS'] : ['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS']));
    setEditingQuizScore(quiz.score ?? 20);
    setEditingQuizTrimester(quiz.trimestre || "1er trimestre");
    setEditingQuizQuestions(quiz.questions ? [...quiz.questions] : []);
  };

  const handleSaveEditedQuiz = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingQuiz) return;

    if (!editingQuizTitle.trim()) {
      showFeedback("Veuillez entrer un titre pour le quiz.", "error");
      return;
    }

    const invalidQuestion = editingQuizQuestions.find(q => !q.questionText?.trim() || q.options?.some((opt: any) => !opt.trim()));
    if (invalidQuestion) {
      showFeedback("Chaque question doit avoir un texte et ses 4 options renseignées.", "error");
      return;
    }

    const isPrem = !editingQuizAllowedTiers.includes('FREEMIUM');

    fetch(`/api/quizzes/${editingQuiz.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: editingQuizTitle,
        grade: editingQuizGrade,
        section: editingQuizSection,
        difficulty: editingQuizDifficulty,
        isPremium: isPrem,
        allowedTiers: editingQuizAllowedTiers,
        targetTiers: editingQuizAllowedTiers,
        score: editingQuizScore,
        trimestre: editingQuizTrimester,
        questions: editingQuizQuestions
      })
    })
      .then(res => {
        if (!res.ok) throw new Error("Erreur");
        return res.json();
      })
      .then(() => {
        showFeedback("Le quiz a été mis à jour avec succès !");
        setEditingQuiz(null);
        refreshData();
      })
      .catch(() => {
        showFeedback("Erreur lors de la mise à jour du quiz.", "error");
      });
  };

  // --- ACTIONS FOR QUIZ TIPS ---

  const handleAddTipSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTipText.trim()) return;

    fetch("/api/quizzes/tips", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newTipText })
    })
      .then(res => res.json())
      .then(() => {
        showFeedback("L'astuce de révision a été ajoutée !");
        setNewTipText("");
        refreshData();
      })
      .catch(err => console.error(err));
  };

  const handleSaveTipEdit = (id: string) => {
    if (!editingTipText.trim()) return;

    fetch(`/api/quizzes/tips/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: editingTipText })
    })
      .then(res => res.json())
      .then(() => {
        showFeedback("L'astuce a été mise à jour !");
        setEditingTipId(null);
        setEditingTipText("");
        refreshData();
      })
      .catch(err => console.error(err));
  };

  const handleDeleteTip = (id: string) => {
    askConfirmation(
      "Supprimer l'astuce",
      "Voulez-vous supprimer cette astuce de révision ?",
      () => {
        fetch(`/api/quizzes/tips/${id}`, {
          method: "DELETE"
        })
          .then(res => res.json())
          .then(() => {
            showFeedback("Astuce supprimée.");
            refreshData();
          })
          .catch(err => console.error(err));
      }
    );
  };

  // --- ACTIONS FOR COURSES & MATERIALS ---

  const handleAddMaterial = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMaterial.title) {
      showFeedback("Titre manquant", "error");
      return;
    }
    const uploadedTitle = newMaterial.title.trim();
    const isPrem = !newMaterial.targetTiers.includes('FREEMIUM');
    const payload = {
      ...newMaterial,
      isPremium: isPrem,
      allowedTiers: newMaterial.targetTiers,
      targetTiers: newMaterial.targetTiers
    };

    fetch("/api/admin/courses", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => res.json())
      .then(() => {
        showFeedback("Matériel pédagogique téléversé avec succès !");
        
        // Update local history storage
        if (uploadedTitle) {
          setMaterialTitleHistory((prev) => {
            const updated = [uploadedTitle, ...prev.filter(t => t !== uploadedTitle)].slice(0, 50);
            try {
              localStorage.setItem("admin_material_title_history", JSON.stringify(updated));
            } catch (err) {
              console.error(err);
            }
            return updated;
          });
        }

        setNewMaterial((prev) => ({
          ...prev,
          title: "",
          videoUrl: "",
          attachmentName: "",
          textContent: "",
          solutionCode: "",
          trimestre: getSubMenuOptionsForType(prev.contentType)[0].value,
          fileData: ""
        }));
        setSelectedFile(null);
        refreshData();
        setActiveSubTab("courses-history");
      })
      .catch((err) => showFeedback("Erreur de téléversement", "error"));
  };

  const handleFileImport = (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const allowedExtensions = ["pdf", "mp4", "py", "txt", "png", "jpg", "jpeg"];
    const isAllowedMime = ["video/mp4", "image/png", "image/jpeg"].includes(file.type);

    if (!ext || (!allowedExtensions.includes(ext) && !isAllowedMime)) {
      showFeedback("Format non supporté. Veuillez sélectionner un fichier PDF, PNG, JPG/JPEG, TXT, PY ou MP4.", "error");
      return;
    }

    // Validation de la taille : 100 Mo pour MP4, 10 Mo pour le reste
    const maxMb = (ext === 'mp4' || file.type === 'video/mp4') ? 100 : 10;
    if (file.size > maxMb * 1024 * 1024) {
      showFeedback(`Le fichier est trop volumineux. Limite : ${maxMb} Mo pour ce format.`, "error");
      return;
    }

    setSelectedFile(file);

    // Read files accordingly to prefill content:
    const reader = new FileReader();
    if (ext === "png" || ext === "jpg" || ext === "jpeg" || file.type.startsWith("image/")) {
      reader.onload = (e) => {
        setNewMaterial((prev) => ({
          ...prev,
          fileType: ext === "png" ? "png" : "jpg",
          attachmentName: file.name,
          videoUrl: "",
          fileData: (e.target?.result as string) || ""
        }));
      };
      reader.readAsDataURL(file);
    } else if (ext === "py") {
      reader.onload = (e) => {
        setNewMaterial((prev) => ({
          ...prev,
          fileType: "py",
          attachmentName: file.name,
          solutionCode: e.target?.result as string || ""
        }));
      };
      reader.readAsText(file);
    } else if (ext === "txt") {
      reader.onload = (e) => {
        setNewMaterial((prev) => ({
          ...prev,
          fileType: "txt",
          attachmentName: file.name,
          textContent: e.target?.result as string || ""
        }));
      };
      reader.readAsText(file);
    } else if (ext === "mp4") {
      reader.onload = (e) => {
        setNewMaterial((prev) => ({
          ...prev,
          fileType: "mp4",
          attachmentName: file.name,
          videoUrl: "",
          fileData: e.target?.result as string || ""
        }));
      };
      reader.readAsDataURL(file);
    } else if (ext === "pdf") {
      reader.onload = (e) => {
        setNewMaterial((prev) => ({
          ...prev,
          fileType: "pdf",
          attachmentName: file.name,
          videoUrl: "",
          fileData: e.target?.result as string || ""
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteCourse = (courseId: string) => {
    askConfirmation(
      "Retirer la ressource",
      "Voulez-vous retirer définitivement cette ressource ou document d'évaluation pour cette classe ?",
      () => {
        fetch(`/api/admin/courses/${courseId}`, {
          method: "DELETE"
        })
          .then((res) => res.json())
          .then(() => {
            showFeedback("Ressource retirée.");
            refreshData();
          });
      }
    );
  };

  const handleAddSection = () => {
    if (!newSectionInput.trim()) return;
    setDynamicModules((prev) => Array.from(new Set([...prev, newSectionInput.trim()])));
    setNewSectionInput("");
    showFeedback("Nouveau chapitre / zone ajouté(e) avec succès !");
  };

  // --- ACTIONS FOR WEB EVENTS (LIVE CALENDAR) ---

  // Helper function to systematically add live session, persist to localStorage (AZED_EVENTS, AZED_NOTIFS), and trigger BroadcastChannel
  const addLiveSession = (sessionData: any) => {
    const tempId = sessionData.id || `evt_${Math.random().toString(36).substring(2, 9)}`;
    const finalDate = sessionData.date || (sessionData.date_start ? sessionData.date_start.split("T")[0] : new Date().toISOString().split("T")[0]);
    const finalTime = sessionData.time || (sessionData.date_start ? sessionData.date_start.split("T")[1]?.substring(0, 5) : "18:00");
    let isoDateStart = sessionData.date_start;
    if (!isoDateStart && finalDate) {
      try {
        isoDateStart = new Date(`${finalDate}T${finalTime}:00.000Z`).toISOString();
      } catch (e) {
        isoDateStart = new Date().toISOString();
      }
    }

    const dur = Number(sessionData.durationMinutes || sessionData.duration_minutes || sessionData.duration) || 90;
    const rawType = sessionData.event_type || sessionData.type || "live_session";
    let mappedEventType: 'live_session' | 'homework' | 'exam' | 'event' = 'live_session';
    if (rawType === 'homework' || rawType === 'devoir') mappedEventType = 'homework';
    else if (rawType === 'exam' || rawType === 'examen') mappedEventType = 'exam';
    else if (rawType === 'event' || rawType === 'présentiel') mappedEventType = 'event';

    const groups = sessionData.target_groups || sessionData.targetGroups || sessionData.selectedGroups || ["ALL"];
    const nowIso = new Date().toISOString();

    const createdEvtObj: LiveEvent = {
      id: tempId,
      title: sessionData.title,
      instructor: sessionData.instructor || "M. Nabil Chaouch",
      teacher: sessionData.instructor || "M. Nabil Chaouch",
      event_type: mappedEventType,
      date_start: isoDateStart || nowIso,
      date: finalDate,
      time: finalTime,
      duration_minutes: dur,
      durationMinutes: dur,
      zoom_link: sessionData.zoomLink || sessionData.zoom_link || "",
      zoomLink: sessionData.zoomLink || sessionData.zoom_link || "",
      target_class: sessionData.grade || sessionData.target_class || sessionData.classe || "Tous",
      grade: sessionData.grade || sessionData.target_class || sessionData.classe || "Tous",
      target_specialty: sessionData.section || sessionData.target_specialty || sessionData.specialite || "Tous",
      section: sessionData.section || sessionData.target_specialty || sessionData.specialite || "Tous",
      target_groups: groups,
      targetGroups: groups,
      type: mappedEventType === 'live_session' ? 'live' : (mappedEventType === 'homework' ? 'homework' : mappedEventType as any),
      instructions: sessionData.description || sessionData.instructions || sessionData.notes || "",
      description: sessionData.description || sessionData.instructions || sessionData.notes || "",
      action_url: sessionData.action_url || sessionData.zoomLink || sessionData.zoom_link || "#",
      created_at: nowIso,
      updated_at: nowIso
    };

    setEvents((prev) => [createdEvtObj, ...prev]);

    // Explicitly update AZED_EVENTS in localStorage
    try {
      const currentEvents = JSON.parse(localStorage.getItem("AZED_EVENTS") || "[]");
      const updatedEvents = [createdEvtObj, ...currentEvents.filter((e: any) => e.id !== tempId)];
      localStorage.setItem("AZED_EVENTS", JSON.stringify(updatedEvents));
    } catch (e) {}

    // Systematically create notification, update AZED_NOTIFS in localStorage, and broadcast via BroadcastChannel if enabled
    if (sessionData.notify_students !== false && sessionData.notifyStudents !== false) {
      publishAdminEvent(createdEvtObj);
    }

    return { createdEvtObj, tempId };
  };

  const handleAddEventSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isSubmittingLive) return;

    if (!newEvent.title || !newEvent.date || !newEvent.time) {
      showFeedback("Champs obligatoires manquants !", "error");
      return;
    }

    setIsSubmittingLive(true);

    const finalDate = newEvent.date;
    const finalTime = newEvent.time;
    let isoDateStart = "";
    try {
      isoDateStart = new Date(`${finalDate}T${finalTime}:00.000Z`).toISOString();
    } catch (err) {
      isoDateStart = new Date().toISOString();
    }

    const dur = Number(newEvent.durationMinutes) || 90;
    const rawType = newEvent.event_type || newEvent.type;
    let mappedEventType: 'live_session' | 'homework' | 'exam' | 'event' = 'live_session';
    if (rawType === 'homework' || rawType === 'devoir') mappedEventType = 'homework';
    else if (rawType === 'exam' || rawType === 'examen') mappedEventType = 'exam';
    else if (rawType === 'event' || rawType === 'présentiel') mappedEventType = 'event';

    const eventId = editingEventId || `evt_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    const payload = {
      ...newEvent,
      id: eventId,
      frequency_type: newEvent.frequency_type,
      date_debut: newEvent.date_debut || newEvent.date,
      date_fin: newEvent.date_fin || newEvent.date,
      recurrence_pattern: newEvent.recurrence_pattern,
      notify_students: newEvent.notify_students,
      notifyStudents: newEvent.notify_students,
      notification_timing: newEvent.notification_timing,
      custom_notification_time: newEvent.custom_notification_time,
      event_type: mappedEventType,
      date_start: isoDateStart,
      date: finalDate,
      time: finalTime,
      duration_minutes: dur,
      durationMinutes: dur,
      zoom_link: newEvent.zoomLink,
      target_class: newEvent.grade,
      target_specialty: newEvent.section,
      target_groups: newEvent.targetGroups,
      instructions: newEvent.description,
      action_url: newEvent.zoomLink || "#"
    };

    if (editingEventId) {
      const updatedEvtObj: LiveEvent = {
        id: editingEventId,
        title: newEvent.title,
        instructor: newEvent.instructor || "M. Nabil Chaouch",
        teacher: newEvent.instructor || "M. Nabil Chaouch",
        event_type: mappedEventType,
        date_start: isoDateStart,
        date: finalDate,
        time: finalTime,
        duration_minutes: dur,
        durationMinutes: dur,
        zoom_link: newEvent.zoomLink,
        zoomLink: newEvent.zoomLink,
        target_class: newEvent.grade || "Tous",
        grade: newEvent.grade || "Tous",
        target_specialty: newEvent.section || "Tous",
        section: newEvent.section || "Tous",
        target_groups: newEvent.targetGroups || ["ALL"],
        targetGroups: newEvent.targetGroups || ["ALL"],
        type: newEvent.type || "live",
        instructions: newEvent.description || "",
        description: newEvent.description || "",
        action_url: newEvent.zoomLink || "#",
        updated_at: new Date().toISOString(),
        notify_students: newEvent.notify_students,
        notifyStudents: newEvent.notify_students,
        notification_timing: newEvent.notification_timing,
        frequency_type: newEvent.frequency_type,
        date_debut: newEvent.date_debut || newEvent.date,
        date_fin: newEvent.date_fin || newEvent.date,
        recurrence_pattern: newEvent.recurrence_pattern
      };
      setEvents((prev) => prev.map((e) => (e.id === editingEventId ? updatedEvtObj : e)));

      showFeedback("Séance enregistrée avec succès à l'agenda ! ✅");
      const activeEditId = editingEventId;
      setEditingEventId(null);
      setNewEvent({ title: "", instructor: "M. Nabil Chaouch", date: "", time: "", durationMinutes: "90", zoomLink: "", grade: "Tous", section: "Tous", targetGroups: ["ALL"], type: "live", event_type: "live_session", description: "", notify_students: true, notification_timing: "30min", custom_notification_time: "", frequency_type: "single", date_debut: "", date_fin: "", recurrence_pattern: "weekly" });

      // Modify active schedule event on server
      fetch(`/api/admin/events/${activeEditId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erreur de modification");
          return res.json();
        })
        .then(() => {
          refreshData();
        })
        .catch(() => showFeedback("Erreur lors de la mise à jour de la séance", "error"))
        .finally(() => setIsSubmittingLive(false));
    } else {
      // Systematically create session, persist to AZED_EVENTS and AZED_NOTIFS (if enabled), and broadcast via BroadcastChannel
      const { createdEvtObj, tempId } = addLiveSession(payload);

      showFeedback(newEvent.frequency_type === "recurring" ? "Série d'événements récurrents planifiée et diffusée ! 📅" : "Nouvel événement planifié et propagé aux élèves en temps réel ! 📅");
      setNewEvent({ title: "", instructor: "M. Nabil Chaouch", date: "", time: "", durationMinutes: "90", zoomLink: "", grade: "Tous", section: "Tous", targetGroups: ["ALL"], type: "live", event_type: "live_session", description: "", notify_students: true, notification_timing: "30min", custom_notification_time: "", frequency_type: "single", date_debut: "", date_fin: "", recurrence_pattern: "weekly" });

      // Create new event on server
      fetch("/api/admin/events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })
        .then((res) => {
          if (!res.ok) throw new Error("Erreur");
          return res.json();
        })
        .then((data) => {
          if (data.event) {
            setEvents((prev) => prev.map((e) => (e.id === tempId ? data.event : e)));
          }
          refreshData();
        })
        .catch(() => {
          showFeedback("Erreur lors de la planification", "error");
        })
        .finally(() => setIsSubmittingLive(false));
    }
  };

  const handleEditEventClick = (event: LiveEvent) => {
    setEditingEventId(event.id);
    const eventGroups = event.targetGroups || event.target_groups || ["ALL"];
    setNewEvent({
      title: event.title || "",
      instructor: event.instructor || event.teacher || "M. Nabil Chaouch",
      date: event.date || "",
      time: event.time || "",
      durationMinutes: String(event.durationMinutes ?? 90),
      zoomLink: event.zoomLink || "",
      grade: event.grade || "Tous",
      section: event.section || "Tous",
      targetGroups: Array.isArray(eventGroups) && eventGroups.length > 0 ? eventGroups : ["ALL"],
      type: event.type || "live",
      event_type: event.event_type || "live_session",
      description: event.description || "",
      notify_students: event.notify_students !== false && event.notifyStudents !== false,
      notification_timing: (event.notification_timing as any) || "30min",
      custom_notification_time: event.custom_notification_time || "",
      frequency_type: event.frequency_type || "single",
      date_debut: event.date_debut || event.date || "",
      date_fin: event.date_fin || event.date || "",
      recurrence_pattern: (event.recurrence_pattern as any) || "weekly"
    });
    
    // Auto scroll smooth to form
    setTimeout(() => {
      liveFormRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 50);
  };

  const handleDeleteEvent = (eventId: string) => {
    askConfirmation(
      "Annuler un cours live",
      "Voulez-vous annuler définitivement cette séance de cours live Zoom planifiée ?",
      () => {
        fetch(`/api/admin/events/${eventId}`, {
          method: "DELETE"
        })
          .then((res) => res.json())
          .then(() => {
            showFeedback("Séance live annulée.");
            refreshData();
          });
      }
    );
  };

  // --- ACTIONS FOR TODO EVENTS ---

  const handleTodoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const allowedTypes = ["application/pdf", "image/png", "image/jpeg", "image/jpg"];
      if (!allowedTypes.includes(file.type)) {
        showFeedback("Format de fichier non supporté (Uniquement PDF, PNG, JPG).", "error");
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        showFeedback("La taille du fichier ne doit pas dépasser 5 Mo.", "error");
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        setNewTodo((prev) => ({
          ...prev,
          pdfContent: reader.result as string,
          pdfName: file.name
        }));
        showFeedback(`Fichier "${file.name}" attaché avec succès !`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCreateTodoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTodo.name || !newTodo.date || !newTodo.hour || !newTodo.dueDate) {
      showFeedback("Veuillez remplir tous les champs obligatoires (Nom de l'exercice, Date, Heure, Date d'échéance).", "error");
      return;
    }

    setIsSubmittingTodo(true);
    const isPrem = !newTodo.allowedTiers.includes('FREEMIUM');
    const payload = {
      ...newTodo,
      isPremium: isPrem,
      allowedTiers: newTodo.allowedTiers,
      targetTiers: newTodo.allowedTiers
    };

    fetch("/api/todo-events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    })
      .then((res) => {
        if (!res.ok) throw new Error("Erreur");
        return res.json();
      })
      .then(() => {
        showFeedback("Devoir To-Do créé avec succès ! 📝");
        setNewTodo({
          name: "",
          date: "",
          hour: "",
          dueDate: "",
          notes: "",
          pdfContent: "",
          pdfName: "",
          reminder: "",
          isPremium: false,
          allowedTiers: ['FREEMIUM', 'PREMIUM', 'PREMIUM_PLUS', 'PREMIUM_PLUS_PLUS'] as StudentTier[],
          targetClass: "Tous"
        });
        refreshData();
      })
      .catch(() => showFeedback("Erreur lors de la création du devoir", "error"))
      .finally(() => setIsSubmittingTodo(false));
  };

  const handleDeleteTodo = (todoId: string) => {
    askConfirmation(
      "Supprimer un devoir (To-Do)",
      "Voulez-vous supprimer définitivement ce devoir / exercice (To-Do) ?",
      () => {
        fetch(`/api/todo-events/${todoId}`, {
          method: "DELETE"
        })
          .then((res) => {
            if (!res.ok) throw new Error("Erreur");
            return res.json();
          })
          .then(() => {
            showFeedback("Devoir To-Do supprimé avec succès.");
            refreshData();
          })
          .catch(() => showFeedback("Erreur lors de la suppression", "error"));
      }
    );
  };

  // Users lookup filter & KPI calculations
  const studentList = users.filter((u) => u.role === "student");
  const activeStudents = studentList.filter((student) => student.status === "active" || student.status === "actif" || !student.isBlocked);
  const totalActive = activeStudents.length;
  const freemiumCount = activeStudents.filter((student) => student.plan === "FREEMIUM" || (student as any).isFreemium || student.accountType === "freemium").length;
  const premiumCount = activeStudents.filter((student) => student.plan === "PREMIUM" || (student as any).isPremium || student.accountType === "premium").length;

  const filteredUsers = users.filter((u) => {
    if (u.role !== "student") return false;
    const matchesKeyword = u.fullName.toLowerCase().includes(userSearch.toLowerCase()) || 
                           u.email.toLowerCase().includes(userSearch.toLowerCase()) || 
                           (u.address && u.address.toLowerCase().includes(userSearch.toLowerCase())) ||
                           (u.city && u.city.toLowerCase().includes(userSearch.toLowerCase())) ||
                           (u.highSchool && u.highSchool.toLowerCase().includes(userSearch.toLowerCase())) ||
                           (u.section && u.section.toLowerCase().includes(userSearch.toLowerCase()));
    
    const matchesGrade = gradeFilter === "Tous" || u.grade === gradeFilter;
    const matchesStatus = statusFilter === "Tous" || u.status === statusFilter;
    const matchesSection = sectionFilter === "Tous" || u.section === sectionFilter;
    const matchesGroup = groupFilter === "Tous" || groupFilter === "Tous les groupes" || (groupFilter === "Non assigné" || groupFilter === "Sans groupe" ? (!u.groupe_etude && !u.studyGroup && !(u as any).study_group) : ((u.groupe_etude || u.studyGroup || (u as any).study_group) === groupFilter));
    const matchesCity = !cityFilter || (u.city && u.city.toLowerCase().includes(cityFilter.toLowerCase()));

    const matchesDate = !dateRegFilter || (() => {
      if (!u.createdAt) return false;
      const d = new Date(u.createdAt);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const localDate = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`; // "YYYY-MM-DD"
      return localDate === dateRegFilter;
    })();

    const matchesHour = !hourRegFilter || (() => {
      if (!u.createdAt) return false;
      const d = new Date(u.createdAt);
      const pad = (n: number) => n.toString().padStart(2, "0");
      const localHour = `${pad(d.getHours())}:${pad(d.getMinutes())}`; // "HH:MM"
      return localHour.includes(hourRegFilter) || `${pad(d.getHours())}` === hourRegFilter;
    })();
    
    return matchesKeyword && matchesGrade && matchesStatus && matchesSection && matchesGroup && matchesCity && matchesDate && matchesHour;
  });

  const {
    paginatedData: paginatedUsers,
    currentPage: userCurrentPage,
    totalPages: userTotalPages,
    totalItems: userTotalItems,
    startIndex: userStartIndex,
    endIndex: userEndIndex,
    itemsPerPage: userItemsPerPage,
    goToPage: userGoToPage,
    setItemsPerPage: setUserItemsPerPage,
  } = usePagination({ data: filteredUsers, initialItemsPerPage: 10 });

  return (
    <div className="space-y-6" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
      
      {feedback && (
        <div className={`p-4 rounded-xl text-xs font-bold transition-all border outline-hidden ${
          feedback.type === "success" 
            ? "bg-[#10B981]/10 text-[#10B981] border-[#10B981]/20" 
            : "bg-[#EF4444]/10 text-[#EF4444] border-[#EF4444]/20"
        }`}>
          {feedback.msg}
        </div>
      )}

      {/* Admin Navigations Bar Panel Split deleted since all options are in the side menu */}

      {/* --- RENDER VIEWPORTS --- */}

      <AnimatePresence mode="popLayout">
        {/* VIEWPORT 1: USER REGISTRIES DIRECTORY STATS */}
        {activeSubTab === "users" && (
          editingUser ? (
            <motion.div
              key="edit-user-page"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="bg-white rounded-2xl border border-gray-200 shadow-sm p-6 space-y-6 text-left"
            >
              {/* Return header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-5">
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-gray-50 hover:bg-gray-100 border border-gray-200 text-gray-700 hover:text-black rounded-lg text-xs font-bold transition-all cursor-pointer select-none"
                  >
                    <ArrowLeft size={14} />
                    <span>Retour à la liste</span>
                  </button>
                  <div className="h-6 w-[1px] bg-gray-250 hidden sm:block"></div>
                  <div>
                    <h2 className="text-base font-black text-[#0F1E36] leading-tight flex items-center gap-1.5">
                      <span>✏️</span> Modifier la fiche de l'élève : <span className="text-blue-600 font-extrabold">{editingUser.fullName}</span>
                    </h2>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      ID unique : <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-[10px] text-gray-700">{editingUser.id}</code>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                    editUserForm.accountType === "premium" ? "bg-amber-105 text-amber-800 border border-amber-250 animate-pulse" : "bg-gray-100 text-gray-600 border border-gray-250"
                  }`}>
                    👑 {editUserForm.accountType === "premium" ? "Abonné Premium" : "Compte Gratuit"}
                  </span>
                  <span className={`px-2.5 py-1 text-[10px] font-black uppercase tracking-wider rounded-full ${
                    editUserForm.status === "active" ? "bg-emerald-100 text-emerald-800 border border-emerald-250" :
                    editUserForm.status === "disabled" ? "bg-red-100 text-red-800 border border-red-250" :
                    "bg-amber-100 text-amber-800 border border-amber-250"
                  }`}>
                    ● {editUserForm.status === "active" ? "Actif" : editUserForm.status === "disabled" ? "Bloqué" : "En attente"}
                  </span>
                </div>
              </div>

              {/* Form editing page */}
              <form onSubmit={(e) => {
                e.preventDefault();
                fetch("/api/admin/users/status", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({
                    userId: editingUser.id,
                    ...editUserForm
                  })
                })
                  .then(res => {
                    if (!res.ok) throw new Error();
                    return res.json();
                  })
                  .then(() => {
                    showFeedback("Le profil de l'élève a été mis à jour avec succès !");
                    setEditingUser(null);
                    refreshData();
                  })
                  .catch(() => showFeedback("Erreur lors de la mise à jour du profil", "error"));
              }} className="space-y-6">
                
                {/* Grid of sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Section A: Connexion & Authentification */}
                  <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                      <span className="text-base">🔐</span>
                      <h3 className="font-extrabold text-xs text-[#0F1E36] uppercase tracking-wider">Identifiants de Connexion</h3>
                    </div>
                    
                    <div className="space-y-3.5">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Nom Complet</label>
                        <input 
                          type="text" 
                          required 
                          value={editUserForm.fullName || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Nom Complet"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Adresse E-mail (Identifiant de connexion)</label>
                        <input 
                          type="email" 
                          required 
                          value={editUserForm.email || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Ex: eleve@gmail.com"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Mot de Passe (en clair pour l'assistance)</label>
                        <input 
                          type="text" 
                          required 
                          value={editUserForm.password || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white font-mono text-xs text-blue-700 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Mot de passe"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Rôle Système</label>
                          <select 
                            value={editUserForm.role || "student"} 
                            onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="student">Élève (Student)</option>
                            <option value="agent">Agent de direction</option>
                            <option value="admin">Administrateur</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Type d'abonnement (Forfait)</label>
                          <select 
                            value={editUserForm.subscriptionType || (editUserForm.accountType === "premium" ? "trimestriel" : "freemium")} 
                            onChange={e => setEditUserForm({ 
                              ...editUserForm, 
                              subscriptionType: e.target.value as any,
                              accountType: e.target.value === "freemium" ? "freemium" : "premium"
                            })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="freemium">🌱 Freemium (Accès Gratuit Limité)</option>
                            <option value="mensuel">📅 Forfait Mensuel (1 Mois exact)</option>
                            <option value="trimestriel">🏫 Forfait Trimestriel (3 Mois exacts)</option>
                            <option value="annuel">🎓 Forfait Annuel (9 Mois exacts)</option>
                            <option value="revision">🚀 Pack Révision (Date sur-mesure)</option>
                          </select>
                        </div>
                      </div>

                      {/* Render custom date-time selector for Pack Révision or Premium custom dates */}
                      {editUserForm.subscriptionType === "revision" && (
                        <div className="space-y-1 pt-1">
                          <label className="block text-[11px] font-bold text-[#E31B23] uppercase tracking-wide">
                            📅 Date & Heure de fin (Pack Révision)
                          </label>
                          <input 
                            type="datetime-local"
                            required
                            value={
                              editUserForm.subscriptionExpiresAt 
                                ? new Date(editUserForm.subscriptionExpiresAt).toISOString().slice(0, 16) 
                                : new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString().slice(0, 16)
                            }
                            onChange={e => setEditUserForm({ 
                              ...editUserForm, 
                              subscriptionExpiresAt: new Date(e.target.value).toISOString() 
                            })}
                            className="w-full p-2.5 border border-[#E31B23]/30 bg-red-50/20 text-[#E31B23] font-bold rounded-lg outline-none text-xs focus:border-red-500 focus:ring-1 focus:ring-red-500"
                          />
                        </div>
                      )}

                      {/* Render custom agent type selector for agents */}
                      {editUserForm.role === "agent" && (
                        <div className="space-y-1 pt-1">
                          <label className="block text-[11px] font-bold text-violet-700 uppercase tracking-wide">
                            🧑‍🏫 Catégorie d'Agent de Direction
                          </label>
                          <select 
                            value={editUserForm.agentType || "assistant"} 
                            onChange={e => setEditUserForm({ 
                              ...editUserForm, 
                              agentType: e.target.value as any 
                            })}
                            className="w-full p-2.5 border border-violet-200 bg-violet-50/20 text-violet-800 font-bold rounded-lg outline-none text-xs focus:border-violet-500 focus:ring-1 focus:ring-violet-500"
                          >
                            <option value="professeur">Professeur (Taux de commission : 20%)</option>
                            <option value="assistant">Assistant (Taux de commission : 10%)</option>
                          </select>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Section B: Détails Académiques */}
                  <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/80 space-y-4">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                      <span className="text-base">🎓</span>
                      <h3 className="font-extrabold text-xs text-[#0F1E36] uppercase tracking-wider">Cursus Scolaire & Lycée</h3>
                    </div>

                    <div className="space-y-3.5">
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Niveau Scolaire</label>
                          <select 
                            value={
                              editUserForm.grade === "1ère année" ? "1ère Année" :
                              editUserForm.grade === "2ème année" ? "2ème Année" :
                              editUserForm.grade === "3ème année" ? "3ème Année" :
                              editUserForm.grade === "4ème année" || editUserForm.grade === "4ème Année (Bac)" ? "4ème Année" :
                              editUserForm.grade || ""
                            } 
                            onChange={e => setEditUserForm({ ...editUserForm, grade: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            {GRADES_OPTIONS.map(g => (
                              <option key={g} value={g}>{g}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Section / Filière</label>
                          <select 
                            value={editUserForm.section || ""} 
                            onChange={e => setEditUserForm({ ...editUserForm, section: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            {SECTIONS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s}</option>
                            ))}
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Groupe d'étude (A-Z)</label>
                          <select 
                            value={editUserForm.groupe_etude || editUserForm.studyGroup || ""} 
                            onChange={e => setEditUserForm({ ...editUserForm, groupe_etude: e.target.value, studyGroup: e.target.value })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-bold text-[#0F1E36]"
                          >
                            <option value="">Non assigné</option>
                            {STUDY_GROUPS.map(letter => (
                              <option key={letter} value={letter}>Groupe {letter}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Lycée d'Origine</label>
                        <input 
                          type="text" 
                          value={editUserForm.highSchool || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, highSchool: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Ex: Lycée Pilote Bourguiba"
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-3 pt-1">
                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Statut du Compte</label>
                          <select 
                            value={editUserForm.status || "pending"} 
                            onChange={e => setEditUserForm({ ...editUserForm, status: e.target.value as any })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="pending">En Attente (Hold)</option>
                            <option value="active">Actif (Validé)</option>
                            <option value="disabled">Bloqué / Suspendu</option>
                          </select>
                        </div>

                        <div className="space-y-1">
                          <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Vérifié par Admin</label>
                          <select 
                            value={editUserForm.verified ? "true" : "false"} 
                            onChange={e => setEditUserForm({ ...editUserForm, verified: e.target.value === "true" })}
                            className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="false">Non Vérifié ❌</option>
                            <option value="true">Vérifié et Approuvé ✅</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Section C: Informations Personnelles & Contacts */}
                  <div className="bg-slate-50/50 p-5 rounded-xl border border-slate-200/80 space-y-4 lg:col-span-2">
                    <div className="flex items-center gap-2 pb-2 border-b border-slate-150">
                      <span className="text-base">📞</span>
                      <h3 className="font-extrabold text-xs text-[#0F1E36] uppercase tracking-wider">Coordonnées de Contact & Localisation</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Numéro de Téléphone</label>
                        <input 
                          type="text" 
                          value={editUserForm.phone || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Numéro de téléphone"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Gouvernorat / Ville</label>
                        <input 
                          type="text" 
                          value={editUserForm.city || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, city: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Ex: Tunis, Nabeul..."
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="block text-[11px] font-bold text-gray-500 uppercase tracking-wide">Adresse Résidentielle</label>
                        <input 
                          type="text" 
                          value={editUserForm.address || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, address: e.target.value })}
                          className="w-full p-2.5 border border-gray-200 rounded-lg outline-none bg-white text-xs font-semibold text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                          placeholder="Adresse postale complète..."
                        />
                      </div>
                    </div>
                  </div>

                </div>

                {/* Form Buttons */}
                <div className="flex items-center justify-between border-t border-gray-200 pt-5 mt-2">
                  <button
                    type="button"
                    onClick={() => setEditingUser(null)}
                    className="px-5 py-2.5 bg-white hover:bg-gray-50 text-gray-700 rounded-xl border border-gray-300 font-bold text-xs cursor-pointer transition-all flex items-center gap-1.5"
                  >
                    <span>Abandonner les modifications</span>
                  </button>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => setEditingUser(null)}
                      className="px-4 py-2.5 text-gray-500 hover:text-gray-800 font-extrabold text-xs cursor-pointer transition-all"
                    >
                      Annuler
                    </button>
                    <button
                      type="submit"
                      className="px-6 py-2.5 bg-[#2563EB] hover:bg-blue-700 text-white rounded-xl font-black text-xs cursor-pointer transition-all shadow-md flex items-center gap-2 hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Save size={14} />
                      <span>Enregistrer et appliquer toutes les modifications</span>
                    </button>
                  </div>
                </div>

              </form>
            </motion.div>
          ) : (
            <motion.div
              key="users"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="space-y-4"
            >
              {/* Sub-Tabs: Tous les Lycéens VS Demandes de Réinitialisation & Action Reset/Seed */}
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 border border-slate-200 rounded-2xl w-fit">
                  <button
                    type="button"
                    onClick={() => setUserSubTab("students")}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer ${
                      userSubTab === "students"
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <Users className="w-4 h-4 stroke-[2]" />
                    <span>Tous les Lycéens & Comptes</span>
                    <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-200 rounded-full font-mono">
                      {studentList.length}
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setUserSubTab("resets")}
                    className={`flex items-center gap-2.5 px-5 py-2.5 rounded-xl font-bold text-sm transition-all cursor-pointer relative ${
                      userSubTab === "resets"
                        ? "bg-slate-900 text-white shadow-md shadow-slate-900/20"
                        : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
                    }`}
                  >
                    <KeyRound className="w-4 h-4 stroke-[2] text-amber-400" />
                    <span>Demandes de Réinitialisation</span>
                    {passwordResets.length > 0 && (
                      <span className="px-2 py-0.5 text-xs bg-amber-500 text-white font-bold rounded-full animate-pulse">
                        {passwordResets.length}
                      </span>
                    )}
                  </button>
                </div>
              </div>

              {userSubTab === "resets" ? (
                <div className="space-y-4 text-left">
                  {/* Status Filters & Header */}
                  <div className="border border-[#E5E7EB] p-4 rounded-2xl bg-white shadow-xs flex flex-wrap gap-4 items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-[#0F1E36] text-sm flex items-center gap-2">
                        <span>🔑 Centre de Gestion des Mots de Passe Oubliés</span>
                      </h3>
                      <p className="text-[11px] text-gray-500 font-semibold mt-0.5">
                        Traitez les demandes de réinitialisation émises par les élèves.
                      </p>
                    </div>

                    <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-bold">
                      <button
                        type="button"
                        onClick={() => setResetFilterStatus("pending")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          resetFilterStatus === "pending"
                            ? "bg-amber-500 text-white shadow-xs font-black"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        En attente ({passwordResets.filter((r: any) => r.status === "pending").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetFilterStatus("resolved")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          resetFilterStatus === "resolved"
                            ? "bg-emerald-600 text-white shadow-xs font-black"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Traitées ({passwordResets.filter((r: any) => r.status === "resolved").length})
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetFilterStatus("all")}
                        className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                          resetFilterStatus === "all"
                            ? "bg-[#0F1E36] text-white shadow-xs font-black"
                            : "text-slate-600 hover:text-slate-900"
                        }`}
                      >
                        Toutes ({passwordResets.length})
                      </button>
                    </div>
                  </div>

                  {/* Requests Table */}
                  <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-[#F8FAFC] text-[#0F1E36] font-extrabold uppercase text-[10px] tracking-wider border-b border-[#E5E7EB]">
                        <tr>
                          <th className="px-4 py-3.5">Élève / Demandeur</th>
                          <th className="px-4 py-3.5">Date de demande</th>
                          <th className="px-4 py-3.5">Statut</th>
                          <th className="px-4 py-3.5 text-right">Actions de Gestion</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[#E5E7EB] text-slate-700 font-semibold">
                        {passwordResets
                          .filter((r: any) => {
                            if (resetFilterStatus === "pending") return r.status === "pending";
                            if (resetFilterStatus === "resolved") return r.status === "resolved";
                            return true;
                          })
                          .length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-12 text-center text-slate-400 font-bold text-xs">
                              Aucune demande de réinitialisation trouvée dans cette catégorie.
                            </td>
                          </tr>
                        ) : (
                          passwordResets
                            .filter((r: any) => {
                              if (resetFilterStatus === "pending") return r.status === "pending";
                              if (resetFilterStatus === "resolved") return r.status === "resolved";
                              return true;
                            })
                            .map((r: any) => (
                              <tr key={r.id} className="hover:bg-slate-50/70 transition-colors">
                                <td className="px-4 py-4">
                                  <div className="font-black text-[#0F1E36] text-xs">{r.userName || "Élève Inconnu"}</div>
                                  <div className="text-[11px] text-blue-600 font-bold">{r.email}</div>
                                </td>
                                <td className="px-4 py-4 text-xs font-medium text-slate-600">
                                  {r.createdAt ? new Date(r.createdAt).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" }) : "N/A"}
                                </td>
                                <td className="px-4 py-4">
                                  {r.status === "pending" ? (
                                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-amber-50 text-amber-700 border border-amber-200">
                                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping"></span>
                                      En attente
                                    </span>
                                  ) : (
                                    <div className="space-y-0.5">
                                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black bg-emerald-50 text-emerald-700 border border-emerald-200">
                                        ✓ Traité / Résolu
                                      </span>
                                      {r.tempPassword && (
                                        <div className="text-[10px] font-mono font-bold text-slate-500">
                                          Temp: <span className="text-emerald-700 font-black">{r.tempPassword}</span>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </td>
                                <td className="px-4 py-4 text-right">
                                  <div className="flex items-center justify-end gap-2 flex-wrap">
                                    <button
                                      type="button"
                                      onClick={() => handleSendResetMail(r.id)}
                                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[11px] font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                      title="Envoyer un e-mail avec un lien de réinitialisation"
                                    >
                                      <span>📧 Envoyer mail de réinitialisation</span>
                                    </button>

                                    <button
                                      type="button"
                                      onClick={() => handleRegenerateTempPassword(r.id)}
                                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-[11px] font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                      title="Attribuer un mot de passe temporaire à l'élève"
                                    >
                                      <span>🔑 Régénérer mot de passe temporaire</span>
                                    </button>

                                    {r.status === "pending" && (
                                      <button
                                        type="button"
                                        onClick={() => handleMarkResolved(r.id)}
                                        className="px-3 py-1.5 bg-[#0F1E36] hover:bg-slate-800 text-white rounded-xl text-[11px] font-black transition-all shadow-xs flex items-center gap-1 cursor-pointer active:scale-95"
                                        title="Marquer la demande comme traitée"
                                      >
                                        <span>✅ Marquer comme Traité</span>
                                      </button>
                                    )}
                                  </div>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <>
                  {/* Dynamic KPI Cards Stats */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Card 1 : Total Lycéens Actifs */}
                    <MetricCard
                      title="Total Lycéens Actifs"
                      count={totalActive}
                      badgeText={`${studentList.length} Inscrits`}
                      icon={GraduationCap}
                      variant="indigo"
                    />

                    {/* Card 2 : Comptes Freemium */}
                    <MetricCard
                      title="Comptes Freemium"
                      count={freemiumCount}
                      badgeText="Freemium"
                      icon={Sparkles}
                      variant="emerald"
                    />

                    {/* Card 3 : Comptes Premium */}
                    <MetricCard
                      title="Comptes Premium"
                      count={premiumCount}
                      badgeText="Premium"
                      icon={Crown}
                      variant="amber"
                    />
                  </div>

                  {/* Filter Bar with Icons */}
                  <div className="border border-slate-200 p-4 rounded-2xl bg-slate-50/70 backdrop-blur-sm flex flex-wrap gap-4 items-center justify-between shadow-2xs">
                    <div className="flex items-center gap-2.5 flex-1 min-w-[220px] bg-white border border-slate-200 rounded-xl px-3 py-2 shadow-2xs focus-within:border-emerald-500 transition-all">
                      <Search className="text-slate-400 shrink-0 w-4 h-4 stroke-[2]" />
                      <input 
                        type="text"
                        placeholder="Rechercher par nom, email, clés, adresses..."
                        value={userSearch}
                        onChange={(e) => setUserSearch(e.target.value)}
                        className="w-full text-xs font-medium border-0 bg-transparent focus:outline-none placeholder:text-slate-400 text-slate-800"
                      />
                    </div>

                    <div className="flex gap-2.5 flex-wrap items-center text-xs">
                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500 font-extrabold uppercase text-[10px]">Niveau :</span>
                        <select 
                          value={gradeFilter} 
                          onChange={(e) => setGradeFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="Tous">Tous les Niveaux</option>
                          {GRADES_OPTIONS.map((g) => (
                            <option key={g} value={g}>{g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500 font-extrabold uppercase text-[10px]">Filière :</span>
                        <select 
                          value={sectionFilter} 
                          onChange={(e) => setSectionFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="Tous">Toutes les sections</option>
                          {SECTIONS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{s}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <Filter className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="text-slate-500 font-extrabold uppercase text-[10px]">Groupe :</span>
                        <select 
                          value={groupFilter} 
                          onChange={(e) => setGroupFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="Tous">Tous les groupes</option>
                          <option value="Non assigné">Non assigné</option>
                          {STUDY_GROUPS.map((g) => (
                            <option key={g} value={g}>Groupe {g}</option>
                          ))}
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <MapPin className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-500 font-extrabold uppercase text-[10px]">Ville :</span>
                        <input 
                          type="text"
                          placeholder="Rechercher Ville..."
                          value={cityFilter}
                          onChange={(e) => setCityFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 w-28 focus:outline-none"
                        />
                        {cityFilter && (
                          <button 
                            onClick={() => setCityFilter("")} 
                            className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <span className="text-slate-500 font-extrabold uppercase text-[10px]">Statut :</span>
                        <select 
                          value={statusFilter} 
                          onChange={(e) => setStatusFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none"
                        >
                          <option value="Tous">Tous les statuts</option>
                          <option value="pending">En attente (No pay)</option>
                          <option value="active">Active (Premium)</option>
                          <option value="disabled">Désactivé (Banni)</option>
                        </select>
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <CalendarDays className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-500 font-extrabold uppercase text-[10px]">Date :</span>
                        <input 
                          type="date" 
                          value={dateRegFilter}
                          onChange={(e) => setDateRegFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 focus:outline-none cursor-pointer"
                        />
                        {dateRegFilter && (
                          <button 
                            onClick={() => setDateRegFilter("")} 
                            className="text-[10px] text-red-500 hover:text-red-700 font-black px-1 shrink-0" 
                            title="Effacer le filtre date"
                          >
                            ✕
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-slate-200 shadow-2xs">
                        <Clock3 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="text-slate-500 font-extrabold uppercase text-[10px]">Heure :</span>
                        <input 
                          type="text" 
                          placeholder="Ex: 14:30"
                          value={hourRegFilter}
                          onChange={(e) => setHourRegFilter(e.target.value)}
                          className="bg-transparent text-xs font-bold text-slate-800 w-20 focus:outline-none"
                        />
                        {hourRegFilter && (
                          <button 
                            onClick={() => setHourRegFilter("")} 
                            className="text-[10px] text-red-500 hover:text-red-700 font-black px-1 shrink-0"
                            title="Effacer le filtre heure"
                          >
                            ✕
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

          <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-[#1F2937]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-400 font-bold">
                    <th className="p-4 whitespace-nowrap">Élève & Localité</th>
                    <th className="p-4 whitespace-nowrap text-[#0F1E36] font-extrabold transition-all duration-300 hover:scale-[1.02] hover:bg-slate-100 ease-out cursor-pointer origin-left text-left" id="headers-city-school">
                      📍 Ville
                    </th>
                    <th className="p-4 whitespace-nowrap text-[#0F1E36] font-extrabold transition-all duration-300 hover:scale-[1.02] hover:bg-slate-100 ease-out cursor-pointer origin-left text-left">
                      🏫 Établissement
                    </th>
                    <th className="p-4 whitespace-nowrap">Niveau / Filière</th>
                    <th className="p-4 whitespace-nowrap text-[#0F1E36] font-extrabold bg-blue-50/50">📚 Groupe d'étude</th>
                    <th className="p-4 whitespace-nowrap text-center bg-slate-50">Date Inscription</th>
                    <th className="p-4 whitespace-nowrap text-center bg-slate-50">Heure Inscription</th>
                    <th className="p-4 whitespace-nowrap">Clé d'Accès (Pass)</th>
                    <th className="p-4 whitespace-nowrap">Forfaits Actifs</th>
                    <th className="p-4 text-center whitespace-nowrap">Statut</th>
                    <th className="p-4 text-center whitespace-nowrap">État Accès</th>
                    <th className="p-4 text-center whitespace-nowrap">Actions de Direction</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {usersLoading ? (
                    <tr>
                      <td colSpan={12} className="p-12 text-center text-slate-500 font-semibold">
                        <div className="flex flex-col items-center justify-center space-y-3">
                          <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
                          <span>Chargement des comptes lycéens depuis Supabase (profiles)...</span>
                        </div>
                      </td>
                    </tr>
                  ) : usersError ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-red-600 bg-red-50/50">
                        <div className="flex flex-col items-center justify-center space-y-2">
                          <AlertCircle className="w-6 h-6 text-red-500" />
                          <span className="font-bold text-xs">{usersError}</span>
                          <button
                            type="button"
                            onClick={() => loadUsers()}
                            className="mt-2 px-4 py-1.5 bg-red-600 text-white font-bold text-xs rounded-xl hover:bg-red-700 cursor-pointer shadow-xs"
                          >
                            Réessayer
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : filteredUsers.length === 0 ? (
                    <tr>
                      <td colSpan={12} className="p-8 text-center text-gray-400">
                        Aucun membre trouvé correspondant à la requête.
                      </td>
                    </tr>
                  ) : (
                    filteredUsers.map((u) => (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors cursor-pointer">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-[#0F1E36] uppercase border border-gray-150 shrink-0">
                              {u.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 text-xs leading-tight flex items-center gap-1.5 flex-wrap">
                                <span>{u.fullName}</span>
                              </p>
                              <StudentBadgeTag 
                                badgeLabel={u.badgeLabel || u.badge_label || (u.accountType === "premium" ? "⭐ Premium" : "Option Gratuit")}
                                packCategory={(u as any).packCategory || (u as any).category || (u.accountType === "premium" ? "Premium" : "Freemium")}
                                isGroupAssigned={Boolean(u.groupe_etude && u.groupe_etude !== "Non assigné" || u.studyGroup && u.studyGroup !== "Non assigné" || (u as any).study_group)}
                              />
                              <p className="text-[10px] text-gray-400 font-mono mt-0.5">{u.email}</p>
                              {u.address && <p className="text-[10px] text-slate-500 mt-1">📍 {u.address}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-xs font-semibold text-gray-800 whitespace-nowrap">
                          {u.role === "admin" ? (
                            <span className="text-gray-400 italic font-medium">N/A</span>
                          ) : (
                            u.city || "Non spécifiée"
                          )}
                        </td>
                        <td className="p-4 text-xs font-semibold text-gray-850 whitespace-nowrap">
                          {u.role === "admin" ? (
                            <span className="text-gray-400 italic font-medium">N/A</span>
                          ) : (
                            u.highSchool || "Non spécifié"
                          )}
                        </td>
                        <td className="p-4 whitespace-nowrap">
                          <p className="font-semibold text-gray-700 text-xs">{u.grade}</p>
                          <p className="text-[10px] text-[#0F1E36] font-mono mt-0.5">{u.section || "Générale"}</p>
                        </td>
                        <td className="p-4 whitespace-nowrap bg-blue-50/20">
                          <select
                            value={(u as any).study_group || u.groupe_etude || u.studyGroup || ""}
                            onChange={(e) => handleGroupChange(u.id, e.target.value)}
                            onClick={(e) => e.stopPropagation()}
                            className="text-xs border border-gray-300 rounded-lg py-1 px-2 bg-white text-[#0F1E36] focus:ring-2 focus:ring-[#0F1E36] font-bold cursor-pointer shadow-2xs hover:border-[#0F1E36] transition-all"
                          >
                            <option value="">Non assigné</option>
                            {STUDY_GROUPS.map((letter) => (
                              <option key={letter} value={letter}>Groupe {letter}</option>
                            ))}
                          </select>
                        </td>
                        <td className="p-4 text-xs font-semibold text-slate-700 whitespace-nowrap text-center bg-slate-50/30">
                          {formatDateOnly(u.createdAt)}
                        </td>
                        <td className="p-4 text-xs font-mono text-slate-500 whitespace-nowrap text-center bg-slate-50/30">
                          {formatTimeOnly(u.createdAt)}
                        </td>
                        <td className="p-4">
                          <div className="min-w-[125px]">
                            <span className="text-[9px] text-gray-400 font-bold block uppercase mb-0.5">CLÉ / PASS :</span>
                            <span className="text-[11px] font-mono font-bold bg-slate-100/80 border border-gray-200 rounded px-2 py-1 text-gray-700 block text-center select-all">
                              {u.password || "Aucun"}
                            </span>
                          </div>
                        </td>
                        <td className="p-4">
                          <div className="space-y-2">
                            <div className="flex flex-wrap gap-1 max-w-[155px]">
                              {u.accountType === "premium" && (
                                <span className={`text-[10px] font-black uppercase border px-2 py-0.5 rounded flex items-center gap-1 ${
                                  u.subscriptionType === "mensuel" ? "bg-purple-50 text-purple-700 border-purple-200" :
                                  u.subscriptionType === "trimestriel" ? "bg-sky-50 text-sky-700 border-sky-200" :
                                  u.subscriptionType === "annuel" ? "bg-amber-50 text-amber-700 border-amber-200" :
                                  u.subscriptionType === "revision" ? "bg-rose-50 text-rose-700 border-rose-200" :
                                  "bg-blue-50 text-blue-700 border-blue-200"
                                }`}>
                                  <span>
                                    {u.subscriptionType === "mensuel" ? "📅 Mensuel" :
                                     u.subscriptionType === "trimestriel" ? "🏫 Trimestriel" :
                                     u.subscriptionType === "annuel" ? "🎓 Annuel" :
                                     u.subscriptionType === "revision" ? "🚀 Révision" :
                                     "⭐ Premium"}
                                  </span>
                                  <button 
                                    onClick={() => handleUpdateSubscriptionType(u.id, "freemium")}
                                    className="hover:text-red-600 text-[11px] leading-none shrink-0 font-bold ml-1 cursor-pointer" 
                                    title="Révoquer l'abonnement"
                                  >
                                    ✕
                                  </button>
                                </span>
                              )}

                              {u.packs && u.packs.length > 0 && u.packs.map((p, pIdx) => (
                                <span key={pIdx} className="text-[9px] font-semibold bg-blue-50/50 text-blue-600 border border-blue-100/50 px-1.5 py-0.5 rounded flex items-center gap-1">
                                  <span>{p}</span>
                                  <button onClick={() => handleRevokePack(u.id, p)} className="hover:text-red-500 text-[9px] leading-none shrink-0 cursor-pointer">✕</button>
                                </span>
                              ))}
                            </div>

                            {/* Direct actions for subscription activation / modification */}
                            <div className="flex items-center gap-1 flex-wrap">
                              {u.accountType === "freemium" ? (
                                <div className="flex items-center gap-1 flex-wrap">
                                  <span className="text-[9px] text-gray-400 font-bold">Activer :</span>
                                  <button 
                                    onClick={() => handleUpdateSubscriptionType(u.id, "mensuel")}
                                    className="px-1.5 py-0.5 bg-purple-50 hover:bg-purple-100 text-purple-700 border border-purple-200 rounded text-[9px] font-bold cursor-pointer"
                                  >
                                    Mensuel
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateSubscriptionType(u.id, "trimestriel")}
                                    className="px-1.5 py-0.5 bg-sky-50 hover:bg-sky-100 text-sky-700 border border-sky-200 rounded text-[9px] font-bold cursor-pointer"
                                  >
                                    Trimestriel
                                  </button>
                                  <button 
                                    onClick={() => handleUpdateSubscriptionType(u.id, "annuel")}
                                    className="px-1.5 py-0.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded text-[9px] font-bold cursor-pointer"
                                  >
                                    Annuel
                                  </button>
                                  <button 
                                    onClick={() => {
                                      setEditingUser(u);
                                      setEditUserForm({
                                        ...u,
                                        subscriptionType: "revision",
                                        accountType: "premium",
                                        subscriptionExpiresAt: new Date(Date.now() + 15 * 24 * 60 * 60 * 1000).toISOString()
                                      });
                                    }}
                                    className="px-1.5 py-0.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[9px] font-bold cursor-pointer"
                                  >
                                    Révision
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-1.5">
                                  <button 
                                    onClick={() => {
                                      setEditingUser(u);
                                      setEditUserForm({
                                        ...u,
                                        subscriptionType: u.subscriptionType || "trimestriel",
                                        accountType: "premium",
                                        subscriptionExpiresAt: u.subscriptionExpiresAt
                                      });
                                    }}
                                    className="text-[9px] font-bold text-blue-600 hover:underline cursor-pointer"
                                  >
                                    ✏️ Ajuster la fin
                                  </button>
                                  <span className="text-gray-300">|</span>
                                  <button 
                                    onClick={() => handleUpdateSubscriptionType(u.id, "freemium")}
                                    className="text-[9px] font-bold text-red-500 hover:underline cursor-pointer"
                                  >
                                    Révoquer
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="p-4 text-center">
                          <div className="flex flex-col items-center gap-1.5">
                            {/* Type d'abonnement */}
                            {u.accountType === "freemium" ? (
                              <span className="text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-700 border border-emerald-250 px-2 py-0.5 rounded-full">
                                🌱 Freemium
                              </span>
                            ) : (() => {
                              const subType = u.subscriptionType || "trimestriel";
                              let label = "Premium";
                              let badgeColor = "bg-blue-50 text-blue-700 border-blue-200";
                              if (subType === "mensuel") {
                                label = "Premium Mensuel";
                                badgeColor = "bg-purple-50 text-purple-700 border-purple-200";
                              } else if (subType === "trimestriel") {
                                label = "Premium Trimestriel";
                                badgeColor = "bg-sky-50 text-sky-700 border-sky-200";
                              } else if (subType === "annuel") {
                                label = "Premium Annuel";
                                badgeColor = "bg-amber-50 text-amber-700 border-amber-200";
                              } else if (subType === "revision") {
                                label = "Pack Révision";
                                badgeColor = "bg-rose-50 text-rose-700 border-rose-200";
                              }
                              return (
                                <span className={`text-[10px] font-extrabold uppercase border px-2 py-0.5 rounded-full ${badgeColor}`}>
                                  ⭐ {label}
                                </span>
                              );
                            })()}

                            {/* Temps restant ou badge d'avertissement rouge avec icône AlertTriangle */}
                            {(() => {
                              if (u.accountType !== "premium" || !u.subscriptionExpiresAt) {
                                return <span className="text-[10px] text-gray-400 font-medium italic">Illimité</span>;
                              }
                              const expiresAt = new Date(u.subscriptionExpiresAt).getTime();
                              const timeLeft = expiresAt - Date.now();
                              
                              if (timeLeft <= 0) {
                                return (
                                  <span className="text-[9px] font-black uppercase bg-red-100 text-red-700 border border-red-300 px-1.5 py-0.5 rounded flex items-center gap-0.5">
                                    <AlertTriangle size={9} className="text-red-600" />
                                    Expiré
                                  </span>
                                );
                              }

                              const oneDayMs = 24 * 60 * 60 * 1000;
                              if (timeLeft <= oneDayMs) {
                                // Expiration < 24h : Red warning badge with AlertTriangle
                                return (
                                  <span className="inline-flex items-center gap-1 bg-red-100 text-red-800 border-2 border-red-500 rounded px-2 py-0.5 text-[9px] font-black animate-pulse shadow-xs">
                                    <AlertTriangle size={11} className="text-red-700 animate-bounce shrink-0" />
                                    <span>&lt; 24h restants !</span>
                                  </span>
                                );
                              }

                              // Format elegant remaining time
                              const days = Math.floor(timeLeft / (24 * 60 * 60 * 1000));
                              const hours = Math.floor((timeLeft % (24 * 60 * 60 * 1000)) / (60 * 60 * 1000));
                              const minutes = Math.floor((timeLeft % (60 * 60 * 1000)) / (60 * 1000));

                              if (days > 0) {
                                return (
                                  <span className="text-[10px] text-gray-500 font-semibold flex items-center gap-1">
                                    <Clock size={10} className="text-slate-400 shrink-0" />
                                    {days}j {hours}h
                                  </span>
                                );
                              }
                              return (
                                <span className="text-[10px] text-amber-600 font-extrabold flex items-center gap-1 animate-pulse">
                                  <Clock size={10} className="text-amber-500 shrink-0" />
                                  {hours}h {minutes}m
                                </span>
                              );
                            })()}
                          </div>
                        </td>
                        <td className="p-4 text-center whitespace-nowrap">
                          {u.accountType === "freemium" ? (
                            <span className="text-[10px] font-bold uppercase bg-emerald-50 text-emerald-600 border border-emerald-250 px-2 py-1 rounded">
                              🌱 Freemium
                            </span>
                          ) : (() => {
                            const exp = getExpirationStatus(u);
                            return (
                              <div className="flex flex-col items-center gap-1">
                                {exp?.status === "soon" ? (
                                  <span className="text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-400 px-2 py-1 rounded animate-pulse flex items-center gap-1 shadow-xs">
                                    <AlertTriangle size={11} className="text-red-700 animate-bounce shrink-0" />
                                    <span>Alerte &lt; 24h</span>
                                  </span>
                                ) : u.status === "active" ? (
                                  <span className="text-[10px] font-bold uppercase bg-amber-50 text-amber-700 border border-amber-200 px-2 py-1 rounded">
                                    ⭐ Premium Actif
                                  </span>
                                ) : u.status === "disabled" ? (
                                  <span className="text-[10px] font-bold uppercase bg-red-100 text-red-600 border border-red-250 px-2 py-1 rounded">
                                    🔒 Bloqué
                                  </span>
                                ) : (
                                  <span className="text-[10px] font-bold uppercase bg-yellow-50 text-yellow-600 border border-yellow-250 px-2 py-1 rounded">
                                    En attente pay
                                  </span>
                                )}
                                
                                {u.subscriptionExpiresAt && (
                                  <span className="text-[9px] text-gray-500 font-bold block mt-0.5">
                                    Fin : {new Date(u.subscriptionExpiresAt).toLocaleString()}
                                  </span>
                                )}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-center">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* BOUTON BLOQUER / DÉBLOQUER */}
                            <button
                              type="button"
                              onClick={() => {
                                if (u.status === "disabled") {
                                  handleUpdateStatus(u.id, "active", true);
                                } else {
                                  handleDisableUser(u.id);
                                }
                              }}
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold transition-all border cursor-pointer ${
                                u.status === "disabled"
                                  ? 'bg-amber-500 text-white border-amber-600 hover:bg-amber-600 shadow-sm'
                                  : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100'
                              }`}
                              title={u.status === "disabled" ? "Débloquer le compte" : "Bloquer le compte"}
                            >
                              {u.status === "disabled" ? <Unlock className="w-3.5 h-3.5"/> : <Lock className="w-3.5 h-3.5"/>}
                              <span>{u.status === "disabled" ? "Débloquer" : "Bloquer"}</span>
                            </button>

                            {/* BOUTON MODIFIER */}
                            <button
                              type="button"
                              onClick={() => {
                                setEditingUser(u);
                                setEditUserForm({
                                  fullName: u.fullName || "",
                                  email: u.email || "",
                                  password: u.password || "",
                                  role: u.role || "student",
                                  grade: u.grade || "",
                                  section: u.section || "",
                                  phone: u.phone || "",
                                  address: u.address || "",
                                  city: u.city || "",
                                  highSchool: u.highSchool || "",
                                  accountType: u.accountType || "freemium",
                                  status: u.status || "pending",
                                  verified: u.verified ?? false
                                });
                              }}
                              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-50 text-blue-600 border border-blue-200 hover:bg-blue-600 hover:text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                              title="Modifier l'élève"
                            >
                              <Edit3 className="w-3.5 h-3.5"/>
                              <span>Modifier</span>
                            </button>

                            {/* BOUTON SUPPRIMER (RED DESIGN) */}
                            <button
                              type="button"
                              onClick={() => handleRequestDelete(u)}
                              className="p-1.5 bg-red-50 text-red-600 border border-red-200 hover:bg-red-600 hover:text-white rounded-lg transition-all cursor-pointer"
                              title="Supprimer définitivement"
                            >
                              <Trash2 className="w-4 h-4"/>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <PaginationControls
              currentPage={userCurrentPage}
              totalPages={userTotalPages}
              totalItems={userTotalItems}
              startIndex={userStartIndex}
              endIndex={userEndIndex}
              itemsPerPage={userItemsPerPage}
              onPageChange={userGoToPage}
              onItemsPerPageChange={setUserItemsPerPage}
            />
          </div>
                </>
              )}
        </motion.div>
          )
        )}

      {/* VIEWPORT 1b: ACCOUNT ACCEPTANCES MANAGER */}
      {activeSubTab === "acceptances" && (
        <motion.div
          key="acceptances"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs text-left">
            <div className="p-5 border-b border-[#E5E7EB] bg-gray-50/50">
              <h3 className="font-extrabold text-[#0F1E36] text-sm">Validation manuelle des inscriptions d'élèves</h3>
              <p className="text-[11px] text-gray-500 mt-0.5">
                Les comptes ci-dessous sont en attente d'acceptation par un administrateur ou un agent de direction avant de pouvoir se connecter.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-500 font-bold text-[10px] uppercase">
                    <th className="p-4">Élève & Contact</th>
                    <th className="p-4">Niveau / Filière</th>
                    <th className="p-4">Ville & Établissement</th>
                    <th className="p-4">Formule Choisie</th>
                    <th className="p-4 text-center">Date d'inscription</th>
                    <th className="p-4 text-right">Actions de Validation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {users.filter(u => u.role === "student" && (u.status === "pending" || !u.verified)).length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-8 text-center text-gray-400 italic">
                        Aucun compte élève en attente de validation pour le moment. 🎉
                      </td>
                    </tr>
                  ) : (
                    users.filter(u => u.role === "student" && (u.status === "pending" || !u.verified)).map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="p-4">
                          <div className="flex items-center gap-2.5">
                            <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center font-bold text-blue-700 uppercase border border-blue-200">
                              {u.fullName.charAt(0)}
                            </div>
                            <div>
                              <p className="font-semibold text-gray-900 leading-tight">{u.fullName}</p>
                              <p className="text-[10px] text-gray-500 font-mono mt-0.5">{u.email}</p>
                              {u.phone && <p className="text-[10px] text-gray-400 font-mono">📞 {u.phone}</p>}
                            </div>
                          </div>
                        </td>
                        <td className="p-4">
                          <span className="bg-slate-100 px-2 py-0.5 rounded text-[10px] font-bold text-gray-600 block w-fit">{u.grade}</span>
                          <span className="text-[10px] text-gray-400 block mt-0.5">{u.section}</span>
                        </td>
                        <td className="p-4">
                          <p className="font-semibold text-gray-800">{u.city || "N/A"}</p>
                          <p className="text-[10px] text-gray-400">{u.highSchool || "N/A"}</p>
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold ${
                            u.accountType === "premium"
                              ? "bg-amber-50 text-amber-700 border border-amber-200"
                              : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          }`}>
                            {u.accountType === "premium" ? "⭐ Premium" : "🍃 Freemium"}
                          </span>
                        </td>
                        <td className="p-4 text-center text-gray-500">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString("fr-FR") : "N/A"}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex justify-end gap-2">
                            <button
                              onClick={() => {
                                handleUpdateStatus(u.id, "active", true);
                              }}
                              className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[10px] font-black cursor-pointer flex items-center gap-1 shadow-sm transition-all hover:scale-105"
                            >
                              <Check size={11} />
                              <span>Valider l'accès</span>
                            </button>
                            <button
                              onClick={() => {
                                handleRefuseUser(u.id);
                              }}
                              className="px-3 py-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 border border-rose-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors"
                            >
                              Refuser
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEWPORT 2: TRANSACTION RECEIPTS FOR FORFAITS SIGNATURES / FRAIS D'INSCRIPTION */}
      {activeSubTab === "receipts" && (
        <motion.div
          key="receipts"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs">
            <div className="p-5 border-b border-[#E5E7EB] bg-gray-50/50">
              <h3 className="font-semibold text-[#0F1E36] text-sm">Frais d'Inscription — Décision Finale Administrateur</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Toutes les soumissions de fiches de paiement des étudiants. Seul l'administrateur peut effectuer la validation finale ou le rejet définitif.</p>
            </div>
            <div className="p-4">
              <AdminFraisInscription
                receipts={receipts}
                onFinalApprove={(receiptId) => handleApproveReceipt(receiptId)}
                onFinalReject={(receiptId) => handleRejectReceipt(receiptId)}
              />
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEWPORT 2B: REPORTING & EXPORT EXCEL STATISTIQUES */}
      {(activeSubTab === "reporting" || activeSubTab === "reports" || activeSubTab === "stats") && (
        <motion.div
          key="reporting"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-4"
        >
          <AdminReportingView users={users} auditLogs={auditLogs} />
        </motion.div>
      )}

      {/* VIEWPORT 3A: UPLOAD COURSES & LIVRES - UPLOAD */}
      {activeSubTab === "courses-upload" && (
        <motion.div
          key="courses-upload"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border border-[#E5E7EB] rounded-2xl p-5 space-y-4 bg-white shadow-xs max-w-2xl mx-auto"
        >
          <div className="flex items-center gap-3 border-b border-gray-100 pb-3">
            <div className="p-2.5 bg-[#2563EB]/10 text-[#2563EB] rounded-xl shrink-0">
              <Upload size={20} />
            </div>
            <div>
              <h3 className="font-bold text-[#0F1E36] text-sm">Téléverser un Nouveau Document</h3>
              <p className="text-[11px] text-gray-400">Ajoutez et classez vos cours, fiches de TD, devoirs ou quiz interactifs au programme.</p>
            </div>
          </div>
          
          <form onSubmit={handleAddMaterial} className="space-y-5 text-xs pt-1">
            <div className="space-y-1.5 relative">
              <label className="block font-bold text-gray-700 text-xs flex items-center gap-1.5">
                <FileText size={14} className="text-[#2563EB]" />
                <span>Titre de la ressource ou examen</span>
                <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-extrabold uppercase ml-auto">Requis</span>
              </label>
              <input 
                type="text" 
                placeholder="Ex : Récursivité algorithmique approfondie / Sujet Bac 2026..."
                required
                value={newMaterial.title}
                onFocus={() => setShowMaterialTitleHistory(true)}
                onBlur={() => setTimeout(() => setShowMaterialTitleHistory(false), 250)}
                onChange={(e) => setNewMaterial({ ...newMaterial, title: e.target.value })}
                className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl shadow-2xs font-medium text-gray-800 placeholder:text-gray-400 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
              />

              {showMaterialTitleHistory && (
                <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 text-left">
                  <div className="p-2 bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                    <Clock size={10} />
                    <span>Suggestions & Historique des titres</span>
                  </div>
                  {(() => {
                    const dbTitles = courses.map((c) => String(c.title || "")).filter(Boolean);
                    const allSuggested = Array.from(new Set([...materialTitleHistory, ...dbTitles]));
                    const filtered = allSuggested.filter(t => 
                      t.toLowerCase().includes(newMaterial.title.toLowerCase())
                    );
                    
                    if (filtered.length === 0) {
                      return (
                        <div className="p-3 text-xs text-gray-400 italic">
                          Aucun titre correspondant dans l'historique ou la base. Continuez à saisir pour en créer un nouveau.
                        </div>
                      );
                    }

                    return filtered.map((t, idx) => {
                      const isFromHistory = materialTitleHistory.includes(t);
                      return (
                        <button
                          key={idx}
                          type="button"
                          onMouseDown={() => {
                            setNewMaterial((prev) => ({ ...prev, title: t }));
                            setShowMaterialTitleHistory(false);
                            
                            // Auto-fill other fields if a match is found in courses
                            const matchingCourse = courses.find(c => String(c.title || "") === t);
                            if (matchingCourse) {
                              setNewMaterial((prev) => ({
                                ...prev,
                                grade: matchingCourse.grade || prev.grade,
                                section: matchingCourse.section || prev.section,
                                module: matchingCourse.module || prev.module,
                                isPremium: matchingCourse.isPremium !== undefined ? matchingCourse.isPremium : prev.isPremium,
                                fileType: matchingCourse.fileType || prev.fileType,
                                contentType: matchingCourse.contentType || prev.contentType,
                                videoUrl: matchingCourse.videoUrl || prev.videoUrl,
                                attachmentName: matchingCourse.attachmentName || prev.attachmentName,
                                textContent: matchingCourse.textContent || prev.textContent,
                                trimestre: matchingCourse.trimestre || prev.trimestre
                              }));
                            }
                          }}
                          className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors flex items-center justify-between gap-2"
                        >
                          <span className="truncate">{t}</span>
                          <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0 font-bold">
                            {isFromHistory ? "Historique" : "Base"}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="block font-bold text-gray-700 text-xs flex items-center gap-1.5">
                <BookOpen size={14} className="text-amber-500" />
                <span>Chapitre / Section d'interfaçage</span>
                <span className="text-[9px] bg-amber-50 text-amber-600 px-1.5 py-0.5 rounded font-extrabold uppercase ml-auto">Module</span>
              </label>
              <div className="flex gap-2.5">
                <select 
                  value={newMaterial.module}
                  onChange={(e) => setNewMaterial({ ...newMaterial, module: e.target.value })}
                  className="flex-1 text-xs px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl shadow-2xs font-semibold text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all cursor-pointer"
                >
                  {dynamicModules.map((m, idx) => (
                    <option key={idx} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              {/* Dynamically register new sections */}
              <div className="flex items-center gap-2 mt-2">
                <input 
                  type="text"
                  placeholder="Créer un nouveau chapitre..."
                  value={newSectionInput}
                  onChange={(e) => setNewSectionInput(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all"
                />
                <button 
                  type="button"
                  onClick={handleAddSection}
                  className="px-3.5 py-2 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-xl text-xs font-bold transition-colors cursor-pointer flex items-center gap-1 shrink-0 shadow-2xs"
                >
                  <Plus size={13} />
                  <span>Ajouter zone</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700 text-xs flex items-center gap-1.5">
                  <Award size={14} className="text-indigo-600" />
                  <span>Niveau Académique</span>
                </label>
                <select 
                  value={newMaterial.grade}
                  onChange={(e) => {
                    const nextGrade = e.target.value;
                    const dynamicSecs = SECTIONS_BY_GRADE[nextGrade] || ["Tous"];
                    setNewMaterial({
                      ...newMaterial,
                      grade: nextGrade,
                      section: dynamicSecs[0] || "Tous"
                    });
                  }}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl shadow-2xs font-semibold text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer"
                >
                  <option value="Tous">Tous les élèves (Général)</option>
                  {GRADES_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700 text-xs flex items-center gap-1.5">
                  <Users size={14} className="text-indigo-600" />
                  <span>Section / Spécialité</span>
                </label>
                <select 
                  value={newMaterial.section}
                  onChange={(e) => setNewMaterial({ ...newMaterial, section: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl shadow-2xs font-semibold text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all cursor-pointer disabled:bg-gray-100 disabled:text-gray-400"
                  disabled={newMaterial.grade === "Tous"}
                >
                  {newMaterial.grade === "Tous" ? (
                    <option value="Tous">Tous</option>
                  ) : (
                    (SECTIONS_BY_GRADE[newMaterial.grade] || ["Tous"]).map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))
                  )}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left">
              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700 text-xs flex items-center gap-1.5">
                  <Layers size={14} className="text-[#2563EB]" />
                  <span>Catégorie & Type de ressource</span>
                  <span className="text-[9px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-extrabold uppercase ml-auto">Nouveau</span>
                </label>
                <select 
                  value={newMaterial.contentType}
                  onChange={(e) => {
                    const newType = e.target.value as any;
                    const options = getSubMenuOptionsForType(newType);
                    const isCurrentValid = options.some(opt => opt.value === newMaterial.trimestre);
                    setNewMaterial({
                      ...newMaterial,
                      contentType: newType,
                      trimestre: isCurrentValid ? newMaterial.trimestre : options[0].value
                    });
                  }}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl shadow-2xs font-semibold text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all cursor-pointer"
                >
                  <option value="course">📚 Fiches & cours</option>
                  <option value="exercise">📝 Devoirs & Exercices</option>
                  <option value="exercise_corrected">✅ Zone Correction</option>
                  <option value="revision">🎯 Révision (Live Énoncé / Replay)</option>
                  <option value="quiz">⚡ Quiz Interactifs</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700 text-xs flex items-center gap-1.5">
                  <FileText size={14} className="text-violet-600" />
                  <span>Format du Fichier</span>
                </label>
                <select 
                  value={newMaterial.fileType}
                  onChange={(e) => setNewMaterial({ ...newMaterial, fileType: e.target.value as any })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl shadow-2xs font-semibold text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-violet-500/20 focus:border-violet-500 transition-all cursor-pointer"
                >
                  <option value="pdf">📄 Document PDF (.pdf)</option>
                  <option value="mp4">🎬 Vidéo MP4 (.mp4)</option>
                  <option value="png">🖼️ Image PNG (.png)</option>
                  <option value="jpg">🖼️ Image JPG / JPEG (.jpg, .jpeg)</option>
                  <option value="txt">📝 Fichier Texte (.txt)</option>
                  <option value="py">🐍 Script Code Python (.py)</option>
                </select>
              </div>
            </div>

            {/* Dynamic Content Section: YouTube URL Field vs Dropzone */}
            {newMaterial.fileType === "mp4" ? (
              <div className="space-y-3 bg-purple-50/50 p-4 rounded-xl border border-purple-200 text-left">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-purple-900 text-xs flex items-center gap-1.5">
                    <Video size={16} className="text-purple-600" />
                    <span>Lien de la Vidéo YouTube</span>
                  </label>
                  <span className="text-[10px] font-bold bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">
                    Ressource Médias
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="relative">
                    <input
                      type="url"
                      placeholder="https://www.youtube.com/watch?v=... ou https://youtu.be/..."
                      value={newMaterial.videoUrl || ""}
                      onChange={(e) => setNewMaterial({ ...newMaterial, videoUrl: e.target.value })}
                      className={`w-full text-xs pl-3 pr-9 py-2.5 bg-white border rounded-xl font-mono outline-none transition-all ${
                        extractYouTubeId(newMaterial.videoUrl)
                          ? "border-emerald-500 ring-2 ring-emerald-500/20"
                          : newMaterial.videoUrl && newMaterial.videoUrl.trim().length > 0
                          ? "border-rose-500 ring-2 ring-rose-500/20"
                          : "border-slate-200 focus:border-purple-500"
                      }`}
                    />
                    {extractYouTubeId(newMaterial.videoUrl) ? (
                      <Check size={16} className="absolute right-3 top-3 text-emerald-500" />
                    ) : newMaterial.videoUrl && newMaterial.videoUrl.trim().length > 0 ? (
                      <AlertTriangle size={16} className="absolute right-3 top-3 text-rose-500" />
                    ) : null}
                  </div>

                  {/* Real-time YouTube Validation Feedback & Preview */}
                  {(() => {
                    const ytId = extractYouTubeId(newMaterial.videoUrl);
                    if (ytId) {
                      const embedUrl = getYouTubeEmbedUrl(ytId);
                      return (
                        <div className="p-3 bg-white border border-emerald-200 rounded-xl space-y-2 mt-2">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-bold text-emerald-700 flex items-center gap-1">
                              <Check size={13} />
                              <span>Vidéo YouTube Validée (ID: {ytId})</span>
                            </span>
                            <span className="text-[10px] text-slate-400">Intégration youtube-nocookie</span>
                          </div>
                          {embedUrl && (
                            <div className="aspect-video w-full rounded-lg overflow-hidden bg-black border border-slate-200 shadow-xs">
                              <iframe
                                src={embedUrl}
                                title="Aperçu vidéo YouTube"
                                className="w-full h-full border-0"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      );
                    }
                    if (newMaterial.videoUrl && newMaterial.videoUrl.trim().length > 0) {
                      return (
                        <p className="text-[11px] font-semibold text-rose-600 flex items-center gap-1 mt-1">
                          <AlertTriangle size={13} />
                          <span>Format de lien YouTube non reconnu. Exemples : https://www.youtube.com/watch?v=... ou https://youtu.be/...</span>
                        </p>
                      );
                    }
                    return (
                      <p className="text-[10px] text-slate-500 italic mt-1">
                        Saisissez le lien d'une vidéo YouTube (ou basculez sur un fichier local MP4 ci-dessous).
                      </p>
                    );
                  })()}
                </div>

                <div className="pt-2 border-t border-purple-100 flex items-center justify-between text-[10px]">
                  <span className="text-slate-500 font-medium">Ou téléversez un fichier MP4 direct (jusqu'à 100 Mo) :</span>
                  <button
                    type="button"
                    onClick={() => document.getElementById("academic-file-upload")?.click()}
                    className="font-bold text-purple-700 hover:underline cursor-pointer"
                  >
                    Choisir un fichier MP4
                  </button>
                </div>
              </div>
            ) : (
              /* Visual File Drag and Drop Zone for Non-Video Files */
              <div className="space-y-1 text-left">
                <label className="block font-bold text-gray-500 uppercase">Pièce jointe du document académique</label>
                
                <div
                  onDragOver={(e) => {
                    e.preventDefault();
                    setDragActive(true);
                  }}
                  onDragLeave={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragActive(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleFileImport(file);
                  }}
                  onClick={() => document.getElementById("academic-file-upload")?.click()}
                  className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center space-y-2 bg-slate-50/50 hover:bg-slate-50 ${
                    dragActive ? "border-[#10B981] bg-emerald-50/10" : "border-gray-300 hover:border-gray-400"
                  }`}
                >
                  <input
                    id="academic-file-upload"
                    type="file"
                    className="hidden"
                    accept={
                      newMaterial.fileType === "pdf" ? ".pdf" :
                      newMaterial.fileType === "png" ? ".png,image/png" :
                      newMaterial.fileType === "jpg" ? ".jpg,.jpeg,image/jpeg" :
                      newMaterial.fileType === "txt" ? ".txt" :
                      newMaterial.fileType === "py" ? ".py" :
                      ".pdf,.png,.jpg,.jpeg,image/png,image/jpeg,.txt,.py,.mp4,video/mp4"
                    }
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleFileImport(file);
                    }}
                  />
                  
                  <Upload size={32} className="text-gray-400 group-hover:text-gray-600 transition-colors" />
                  
                  <div className="space-y-1">
                    <p className="font-semibold text-[#0F1E36] text-[11px]">
                      Glissez-déposez votre document ici, ou <span className="text-[#10B981] hover:underline">parcourez</span>
                    </p>
                    <p className="text-[10px] text-gray-400 leading-normal">
                      Formats autorisés : PDF (.pdf), Images (.png, .jpg, .jpeg), Script Python (.py), Fichier Texte (.txt)
                    </p>
                  </div>
                </div>

                {/* Selected File Status Banner & Image Preview */}
                {selectedFile && (
                  <div className="space-y-2 mt-2">
                    <div className="flex items-center justify-between p-3 bg-emerald-50/50 border border-emerald-100 rounded-xl">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="p-2 bg-emerald-500/10 text-emerald-600 rounded-lg shrink-0">
                          <FileText size={16} />
                        </div>
                        <div className="min-w-0">
                          <p className="font-semibold text-gray-800 text-[11px] truncate" title={selectedFile.name}>
                            {selectedFile.name}
                          </p>
                          <p className="text-[10px] text-gray-400">
                            {(selectedFile.size / (1024 * 1024)).toFixed(2)} MB • {selectedFile.name.split('.').pop()?.toUpperCase()}
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedFile(null);
                          setNewMaterial({
                            ...newMaterial,
                            attachmentName: "",
                            textContent: "",
                            solutionCode: "",
                            fileData: ""
                          });
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-gray-100 rounded-lg transition-all cursor-pointer"
                        title="Retirer le fichier"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>

                    {/* Real-time Image Preview in Admin Console */}
                    {(newMaterial.fileType === "png" || newMaterial.fileType === "jpg" || selectedFile.type.startsWith("image/")) && (
                      <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-center space-y-1">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Aperçu de l'image importée</p>
                        <div className="max-h-48 overflow-hidden flex items-center justify-center bg-white rounded-lg border border-slate-200 p-1">
                          <img
                            src={newMaterial.fileData || URL.createObjectURL(selectedFile)}
                            alt="Aperçu document"
                            className="max-h-44 object-contain rounded-md"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Collapsible / Optional Advanced Fields */}
            <details className="text-left bg-gray-50/50 p-2.5 rounded-xl border border-gray-100 space-y-2">
              <summary className="text-[10px] font-bold text-gray-500 cursor-pointer hover:text-gray-700 select-none uppercase tracking-wide flex items-center gap-1">
                <span>⚙️ Optionnel : Ajuster les liens et noms de fichiers manuellement</span>
              </summary>
              <div className="pt-2 space-y-2.5">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-400 uppercase text-[9px]">Lien interactif média (mp4 / pdf / txt)</label>
                  <input 
                    type="text" 
                    placeholder="Lien de la vidéo (ou vide pour exemple)"
                    value={newMaterial.videoUrl}
                    onChange={(e) => setNewMaterial({ ...newMaterial, videoUrl: e.target.value })}
                    className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-400 uppercase text-[9px]">Nom de la pièce jointe téléchargeable</label>
                  <input 
                    type="text" 
                    placeholder="Ex : Memento_Bac_2026.pdf"
                    value={newMaterial.attachmentName}
                    onChange={(e) => setNewMaterial({ ...newMaterial, attachmentName: e.target.value })}
                    className="w-full text-xs p-1.5 bg-white border border-gray-200 rounded"
                  />
                </div>
              </div>
            </details>

            {newMaterial.fileType === "py" && (
              <div className="space-y-1 bg-violet-50/50 p-3 rounded-lg border border-violet-150 text-left">
                <label className="block font-bold text-violet-750 uppercase text-[10px] tracking-wide">🐍 Script Python (.py) de Résolution</label>
                <textarea 
                  rows={6}
                  placeholder="def factorielle(n): ... # Votre code Python ici"
                  value={newMaterial.solutionCode}
                  onChange={(e) => setNewMaterial({ ...newMaterial, solutionCode: e.target.value })}
                  className="w-full text-xs font-mono h-32 p-3 bg-white border border-violet-200 rounded focus:outline-hidden"
                />
                <span className="text-[9px] text-violet-500 italic block mt-1">
                  L'élève disposera d'un bouton d'exécution lié à l'éditeur / compilateur interactif en ligne.
                </span>
              </div>
            )}

            {newMaterial.fileType === "txt" && (
              <div className="space-y-1 bg-blue-50/50 p-3 rounded-lg border border-blue-150 text-left">
                <label className="block font-bold text-blue-750 uppercase text-[10px] tracking-wide">📝 Correction et Explications (.txt)</label>
                <textarea 
                  rows={6}
                  placeholder="Saisissez les étapes textuelles de l'exercice..."
                  value={newMaterial.textContent}
                  onChange={(e) => setNewMaterial({ ...newMaterial, textContent: e.target.value })}
                  className="w-full text-xs h-32 p-3 bg-white border border-blue-200 rounded focus:outline-hidden"
                />
              </div>
            )}

            <div className="space-y-4 pb-2 text-left">
              <AccessTierSelector
                selectedTiers={newMaterial.targetTiers}
                onChange={(updatedTiers) => setNewMaterial({ ...newMaterial, targetTiers: updatedTiers, isPremium: !updatedTiers.includes('FREEMIUM') })}
                label="Tarif / Audience visée (Cocher les catégories autorisées)"
              />

              <div className="space-y-1.5">
                <label className="block font-bold text-gray-700 text-xs flex items-center gap-1.5">
                  <Calendar size={14} className="text-[#10B981]" />
                  <span>Période académique / Sous-menu</span>
                  <span className="text-[9px] bg-emerald-50 text-emerald-600 px-1.5 py-0.5 rounded font-extrabold uppercase ml-auto">Dynamique</span>
                </label>
                <select
                  value={newMaterial.trimestre}
                  onChange={(e) => setNewMaterial({ ...newMaterial, trimestre: e.target.value })}
                  className="w-full text-xs px-3.5 py-2.5 bg-slate-50/70 hover:bg-white border border-slate-200 rounded-xl shadow-2xs font-semibold text-gray-800 focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-[#10B981]/20 focus:border-[#10B981] transition-all cursor-pointer"
                >
                  {getSubMenuOptionsForType(newMaterial.contentType).map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <button 
              type="submit"
              className="w-full py-3 bg-[#10B981] hover:bg-[#0da673] text-white font-bold rounded-xl uppercase tracking-wider cursor-pointer shadow-md shadow-[#10B981]/20 transition-all flex items-center justify-center gap-2 text-xs"
            >
              <Upload size={16} />
              <span>Intégrer au programme académique</span>
            </button>
          </form>
        </motion.div>
      )}

      {/* VIEWPORT 3AB: QUIZZES UPLOAD & AI EXTRACTION */}
      {activeSubTab === "quizzes-upload" && (
        <motion.div
          key="quizzes-upload"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-6 max-w-4xl mx-auto"
        >
          {/* Header with Mode Switcher */}
          <div className="border border-slate-100 rounded-2xl p-5 bg-white text-left flex flex-col md:flex-row md:items-center md:justify-between gap-4 shadow-xs">
            <div className="space-y-1">
              <h3 className="font-extrabold text-[#0F1E36] text-base flex items-center gap-2">
                <HelpCircle className="text-[#10B981]" size={18} />
                Générateur & Concepteur de Quiz Interactifs
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                Créez des évaluations interactives (QCM) manuellement ou utilisez la puissance de l'Intelligence Artificielle Gemini pour extraire automatiquement des questions à partir de vos supports de cours (PDF, TXT).
              </p>
            </div>

            {/* Preview Toggle Button */}
            <div className="flex items-center gap-2 shrink-0 bg-slate-100 p-1 rounded-xl">
              <button
                type="button"
                onClick={() => {
                  setIsPreviewQuizActive(false);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  !isPreviewQuizActive
                    ? "bg-white text-[#0F1E36] shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Edit size={13} />
                Mode Édition
              </button>
              <button
                type="button"
                onClick={() => {
                  setPreviewSelectedAnswers({});
                  setPreviewSubmitted(false);
                  setPreviewScore(0);
                  setIsPreviewQuizActive(true);
                }}
                className={`px-3.5 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isPreviewQuizActive
                    ? "bg-[#10B981] text-white shadow-xs"
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Eye size={13} />
                Aperçu étudiant ({newQuizQuestions.length} Q)
              </button>
            </div>
          </div>

          {isPreviewQuizActive ? (
            <div className="space-y-6 text-left">
              {/* Alert Mode active */}
              <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center justify-between text-xs text-amber-800 font-medium">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                  </span>
                  <span><strong>Mode Prévisualisation Actif</strong> — Testez l'évaluation comme si vous étiez un élève. Vos réponses ne seront pas enregistrées.</span>
                </div>
                <button
                  type="button"
                  onClick={() => setIsPreviewQuizActive(false)}
                  className="px-2.5 py-1 bg-white border border-amber-200 hover:bg-amber-100 text-amber-900 rounded-lg text-[10px] font-bold transition-all"
                >
                  Retour à l'édition
                </button>
              </div>

              {/* Quiz Info card */}
              <div className="border border-slate-100 rounded-2xl p-6 bg-white space-y-4 shadow-xs">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 font-bold text-[10px] uppercase tracking-wider rounded-full">
                      {newQuizDifficulty}
                    </span>
                    <h2 className="font-extrabold text-lg text-[#0F1E36]">
                      {newQuizTitle || "Quiz interactif sans titre"}
                    </h2>
                    <p className="text-xs text-gray-400 font-semibold">
                      Niveau ciblé : {newQuizGrade} • Filière : {newQuizSection}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Barème Total</p>
                    <p className="text-xl font-black text-[#0F1E36]">{newQuizScore} <span className="text-xs text-gray-500 font-normal">pts</span></p>
                  </div>
                </div>

                {/* Progress bar / Answers indicator */}
                {(() => {
                  const answeredCount = Object.keys(previewSelectedAnswers).length;
                  const totalCount = newQuizQuestions.length;
                  const percent = totalCount > 0 ? Math.round((answeredCount / totalCount) * 100) : 0;
                  return (
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px] text-gray-500 font-semibold">
                        <span>Progression : {answeredCount} sur {totalCount} questions répondues</span>
                        <span>{percent}%</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#10B981] h-full transition-all duration-300"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })()}
              </div>

              {/* Score Results Card when submitted */}
              {previewSubmitted && (() => {
                const correctCount = newQuizQuestions.filter(
                  (q) => previewSelectedAnswers[q.id] === q.correctAnswerIndex
                ).length;
                const totalCount = newQuizQuestions.length;
                const finalRatio = totalCount > 0 ? (correctCount / totalCount) : 0;
                const computed = (finalRatio * newQuizScore).toFixed(1);
                const scorePercent = Math.round(finalRatio * 100);
                
                let feedbackTitle = "Peut mieux faire !";
                let feedbackDesc = "Examinez les explications sous chaque question pour bien comprendre vos erreurs et progressez.";
                let feedbackBg = "bg-red-50 text-red-800 border-red-100";
                
                if (scorePercent >= 85) {
                  feedbackTitle = "Excellent travail !";
                  feedbackDesc = "Vous maîtrisez parfaitement ce sujet. Vos questions de quiz sont rigoureuses et prêtes à être publiées.";
                  feedbackBg = "bg-emerald-50 text-emerald-800 border-emerald-100";
                } else if (scorePercent >= 50) {
                  feedbackTitle = "Bon résultat !";
                  feedbackDesc = "La majorité des réponses sont correctes. Ajustez les dernières notions pour viser le sans-faute.";
                  feedbackBg = "bg-blue-50 text-blue-800 border-blue-100";
                }

                return (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className={`border rounded-2xl p-5 ${feedbackBg} flex flex-col md:flex-row items-center gap-5`}
                  >
                    <div className="w-20 h-20 rounded-full bg-white flex flex-col items-center justify-center border-4 border-current shadow-xs shrink-0">
                      <span className="text-xl font-black">{Math.round(Number(computed))}</span>
                      <span className="text-[10px] font-bold text-gray-400 uppercase">/ {newQuizScore}</span>
                    </div>
                    <div className="space-y-1 text-center md:text-left">
                      <h4 className="font-extrabold text-sm">{feedbackTitle} ({scorePercent}%)</h4>
                      <p className="text-xs opacity-90 leading-relaxed max-w-xl">{feedbackDesc}</p>
                      <div className="flex flex-wrap gap-2 pt-2 justify-center md:justify-start">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewSelectedAnswers({});
                            setPreviewSubmitted(false);
                            setPreviewScore(0);
                          }}
                          className="px-3 py-1 bg-white hover:bg-slate-50 border border-slate-200 text-[#0F1E36] text-[11px] font-bold rounded-lg transition-all"
                        >
                          Recommencer le test
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPreviewQuizActive(false)}
                          className="px-3 py-1 bg-[#0F1E36] hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg transition-all"
                        >
                          Retourner à l'édition & Publier
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })()}

              {/* Questions Render */}
              <div className="space-y-5">
                {newQuizQuestions.map((q, qIdx) => {
                  const selectedIdx = previewSelectedAnswers[q.id];
                  const isCorrect = selectedIdx === q.correctAnswerIndex;
                  
                  return (
                    <div
                      key={q.id}
                      className={`border rounded-2xl p-5 bg-white transition-all space-y-4 shadow-2xs ${
                        previewSubmitted
                          ? isCorrect
                            ? "border-emerald-200 bg-emerald-50/5"
                            : "border-red-200 bg-red-50/5"
                          : "border-slate-100 hover:border-slate-200"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                            Question {qIdx + 1}
                          </span>
                          <h4 className="font-bold text-[#0F1E36] text-sm">
                            {q.questionText || "Énoncé de question vide"}
                          </h4>
                        </div>
                        {previewSubmitted && (
                          <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            isCorrect ? "bg-emerald-100 text-emerald-800" : "bg-red-100 text-red-800"
                          }`}>
                            {isCorrect ? "Correct" : "Incorrect"}
                          </span>
                        )}
                      </div>

                      {/* Options Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                        {q.options.map((opt, oIdx) => {
                          const isOptionSelected = selectedIdx === oIdx;
                          const isCurrentCorrect = q.correctAnswerIndex === oIdx;
                          
                          let optStyle = "border-slate-200 hover:bg-slate-50";
                          if (isOptionSelected) {
                            optStyle = "border-indigo-600 bg-indigo-50/20 ring-1 ring-indigo-600";
                          }
                          
                          if (previewSubmitted) {
                            if (isCurrentCorrect) {
                              optStyle = "border-emerald-500 bg-emerald-50 text-emerald-900 font-semibold ring-1 ring-emerald-500";
                            } else if (isOptionSelected && !isCorrect) {
                              optStyle = "border-red-500 bg-red-50 text-red-900 font-semibold ring-1 ring-red-500";
                            } else {
                              optStyle = "border-slate-200 opacity-60";
                            }
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              disabled={previewSubmitted}
                              onClick={() => {
                                setPreviewSelectedAnswers(prev => ({
                                  ...prev,
                                  [q.id]: oIdx
                                }));
                              }}
                              className={`w-full p-3.5 rounded-xl border text-left transition-all flex items-center justify-between gap-2 cursor-pointer ${optStyle}`}
                            >
                              <div className="flex items-center gap-2.5">
                                <span className={`w-6 h-6 rounded-lg text-[10px] font-bold flex items-center justify-center shrink-0 ${
                                  isOptionSelected 
                                    ? "bg-indigo-600 text-white" 
                                    : previewSubmitted && isCurrentCorrect
                                      ? "bg-emerald-600 text-white"
                                      : "bg-slate-100 text-[#0F1E36]"
                                }`}>
                                  {String.fromCharCode(65 + oIdx)}
                                </span>
                                <span className="font-medium leading-relaxed">{opt || "Option vide"}</span>
                              </div>
                              
                              {/* Icon feedback */}
                              <div className="shrink-0">
                                {isOptionSelected && !previewSubmitted && (
                                  <div className="w-2.5 h-2.5 rounded-full bg-indigo-600"></div>
                                )}
                                {previewSubmitted && isCurrentCorrect && (
                                  <Check className="text-emerald-600" size={14} />
                                )}
                                {previewSubmitted && isOptionSelected && !isCorrect && (
                                  <span className="text-red-600 font-black text-xs">✕</span>
                                )}
                              </div>
                            </button>
                          );
                        })}
                      </div>

                      {/* Explanation box */}
                      {previewSubmitted && (
                        <motion.div
                          initial={{ opacity: 0, y: 4 }}
                          animate={{ opacity: 1, y: 0 }}
                          className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-gray-600 leading-relaxed"
                        >
                          <p className="font-bold text-[#0F1E36] mb-1 flex items-center gap-1.5">
                            💡 Explication Pédagogique
                          </p>
                          <p className="font-medium">
                            {q.explanation ? q.explanation : "Aucune explication spécifique n'a été rédigée pour cette question."}
                          </p>
                        </motion.div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Submit / Finish testing */}
              {!previewSubmitted && (
                <button
                  type="button"
                  onClick={() => {
                    setPreviewSubmitted(true);
                  }}
                  className="w-full py-3 bg-[#0F1E36] hover:bg-slate-800 text-white font-extrabold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer text-xs animate-fade-in"
                >
                  <Check size={16} />
                  Valider et corriger le test
                </button>
              )}
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left: AI Extraction Tool */}
              <div className="lg:col-span-4 space-y-6">
                <div className="border border-slate-100 rounded-2xl p-5 bg-white space-y-4 shadow-xs text-left">
                  <div className="space-y-1">
                    <h4 className="font-bold text-[#0F1E36] text-xs uppercase tracking-wide flex items-center gap-1.5">
                      <Sparkles className="text-[#10B981]" size={14} />
                      Génération par IA (Gemini)
                    </h4>
                    <p className="text-[11px] text-gray-400">
                      Importez votre support de cours ou collez votre texte pour en faire des questions de quiz instantanément.
                    </p>
                  </div>

                  {/* Paste Text */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#0F1E36] font-bold uppercase tracking-wider block">
                      Copier-Coller le Texte source
                    </label>
                    <textarea
                      rows={4}
                      value={aiPasteText}
                      onChange={(e) => setAiPasteText(e.target.value)}
                      placeholder="Collez ici les notions de cours, formules ou résumés à partir desquels générer des questions..."
                      className="w-full p-2.5 border border-[#CBD5E1] rounded-lg text-xs focus:ring-1 focus:ring-[#10B981] focus:outline-none placeholder-gray-400"
                    />
                  </div>

                  {/* File Upload */}
                  <div className="space-y-1.5">
                    <label className="text-[10px] text-[#0F1E36] font-bold uppercase tracking-wider block">
                      Ou téléverser un document (PDF / TXT)
                    </label>
                    <div className="relative border border-dashed border-[#CBD5E1] rounded-lg p-4 text-center hover:bg-slate-50 transition-colors">
                      <input
                        type="file"
                        accept=".pdf,.txt"
                        onChange={handleAiFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <FileText className="mx-auto text-gray-300 mb-1" size={24} />
                      {aiSelectedFile ? (
                        <p className="text-[11px] font-semibold text-emerald-600 truncate">{aiSelectedFile.name}</p>
                      ) : (
                        <p className="text-[10px] text-gray-400">Cliquez pour téléverser (.pdf, .txt)</p>
                      )}
                    </div>
                  </div>

                  {/* Extract Button */}
                  <button
                    type="button"
                    onClick={handleExtractQuestions}
                    disabled={isAiGenerating}
                    className="w-full py-2 bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 disabled:from-gray-300 disabled:to-gray-400 text-white text-xs font-bold rounded-lg transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-sm"
                  >
                    {isAiGenerating ? (
                      <>
                        <RefreshCw size={12} className="animate-spin" />
                        Extraction en cours...
                      </>
                    ) : (
                      <>
                        <Sparkles size={12} />
                        Extraire le Quiz avec l'IA
                      </>
                    )}
                  </button>

                  {/* Status Messages */}
                  {aiSuccessMsg && (
                    <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-xl text-[11px] text-emerald-800 leading-relaxed font-medium">
                      {aiSuccessMsg}
                    </div>
                  )}

                  {aiErrorMsg && (
                    <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-[11px] text-red-800 leading-relaxed font-medium">
                      {aiErrorMsg}
                    </div>
                  )}
                </div>
              </div>

              {/* Right: Manual Configuration & Editing List */}
              <form onSubmit={handlePublishCustomQuiz} className="lg:col-span-8 space-y-6">
                {/* General Config parameters */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-white space-y-4 shadow-xs text-left">
                  <h4 className="font-bold text-[#0F1E36] text-xs uppercase tracking-wide border-b border-slate-100 pb-2">
                    ⚙️ Configuration Générale du Quiz
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                    {/* Quiz Title */}
                    <div className="space-y-1.5 md:col-span-2 relative">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                        Titre de l'évaluation / Quiz
                      </label>
                      <input
                        type="text"
                        required
                        value={newQuizTitle}
                        onFocus={() => setShowTitleHistory(true)}
                        onBlur={() => setTimeout(() => setShowTitleHistory(false), 250)}
                        onChange={(e) => { setNewQuizTitle(e.target.value); setIsQuizValidated(false); }}
                        placeholder="ex: Devoir : Algorithmes récursifs et récursion mutuelle"
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
                      />

                      {showTitleHistory && (
                        <div className="absolute left-0 right-0 mt-1 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-slate-100 text-left">
                          <div className="p-2 bg-slate-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex items-center gap-1">
                            <Clock size={10} />
                            <span>Historique des chapitres et titres passés</span>
                          </div>
                          {(() => {
                            const pastTitles: string[] = Array.from(new Set(quizzes.map((q) => String(q.title || "")).filter(Boolean)));
                            const filtered = pastTitles.filter(t => 
                              t.toLowerCase().includes(newQuizTitle.toLowerCase())
                            );
                            
                            if (filtered.length === 0) {
                              return (
                                <div className="p-3 text-xs text-gray-400 italic">
                                  Aucun titre correspondant dans l'historique. Continuez à taper pour en créer un nouveau.
                                </div>
                              );
                            }

                            return filtered.map((t, idx) => (
                              <button
                                key={idx}
                                type="button"
                                onMouseDown={() => {
                                  setNewQuizTitle(t);
                                  setIsQuizValidated(false);
                                  setShowTitleHistory(false);
                                  
                                  // Auto-fill other fields if a match is found in quizzes
                                  const matchingQuiz = quizzes.find(q => String(q.title || "") === t);
                                  if (matchingQuiz) {
                                    if (matchingQuiz.grade) setNewQuizGrade(matchingQuiz.grade);
                                    if (matchingQuiz.section) setNewQuizSection(matchingQuiz.section);
                                    if (matchingQuiz.difficulty) setNewQuizDifficulty(matchingQuiz.difficulty);
                                    if (matchingQuiz.score) setNewQuizScore(matchingQuiz.score);
                                    if (matchingQuiz.trimestre) setNewQuizTrimester(matchingQuiz.trimestre);
                                    if (matchingQuiz.isPremium !== undefined) setNewQuizIsPremium(matchingQuiz.isPremium);
                                  }
                                }}
                                className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-slate-50 hover:text-emerald-700 transition-colors flex items-center justify-between gap-2"
                              >
                                <span className="truncate">{t}</span>
                                <span className="text-[9px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded shrink-0 font-bold">
                                  Réutiliser
                                </span>
                              </button>
                            ));
                          })()}
                        </div>
                      )}
                    </div>

                    {/* Level / Grade Selection */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                        Niveau Scolaire
                      </label>
                      <select
                        value={newQuizGrade}
                        onChange={(e) => { setNewQuizGrade(e.target.value); setIsQuizValidated(false); }}
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
                      >
                        <option value="4ème Année">4ème Année</option>
                        <option value="3ème Année">3ème Année</option>
                        <option value="2ème Année">2ème Année</option>
                        <option value="1ère Année">1ère Année</option>
                        <option value="Tous">Tous les niveaux</option>
                      </select>
                    </div>

                    {/* Section / Classes as Checklist */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                        Filière / Niveau d'études (Cochez pour publier dans plusieurs filières)
                      </label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                        <label className="flex items-center gap-2 text-xs font-bold text-gray-700 cursor-pointer hover:bg-slate-100 p-1 rounded transition-all select-none">
                          <input
                            type="checkbox"
                            id="section-check-tous"
                            checked={newQuizSection === "Tous" || newQuizSection.split(",").map(s => s.trim()).includes("Tous")}
                            onChange={() => handleSectionToggle("Tous")}
                            className="rounded text-[#10B981] focus:ring-[#10B981] w-4 h-4 border-gray-300"
                          />
                          <span className="text-emerald-700">Toutes les filières</span>
                        </label>
                        {SECTIONS_FOR_QUIZ.map((sec) => {
                          const isChecked = newQuizSection !== "Tous" && newQuizSection.split(",").map(s => s.trim()).includes(sec.value);
                          return (
                            <label key={sec.value} className="flex items-center gap-2 text-xs font-semibold text-gray-700 cursor-pointer hover:bg-slate-100 p-1 rounded transition-all select-none">
                              <input
                                type="checkbox"
                                id={`section-check-${sec.value.replace(/\s+/g, '-').toLowerCase()}`}
                                checked={isChecked}
                                onChange={() => handleSectionToggle(sec.value)}
                                className="rounded text-[#10B981] focus:ring-[#10B981] w-4 h-4 border-gray-300"
                              />
                              <span>{sec.label}</span>
                            </label>
                          );
                        })}
                      </div>
                    </div>

                    {/* Difficulty level */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                        Niveau de Difficulté
                      </label>
                      <select
                        value={newQuizDifficulty}
                        onChange={(e) => { setNewQuizDifficulty(e.target.value as any); setIsQuizValidated(false); }}
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
                      >
                        <option value="Debutant">Débutant (Facile)</option>
                        <option value="Intermediaire">Intermédiaire (Standard)</option>
                        <option value="Avance">Avancé (Difficile)</option>
                      </select>
                    </div>

                    {/* Score global */}
                    <div className="space-y-1.5">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                        Barème / Score Maximum
                      </label>
                      <input
                        type="number"
                        min={1}
                        max={100}
                        value={newQuizScore}
                        onChange={(e) => { setNewQuizScore(Number(e.target.value)); setIsQuizValidated(false); }}
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
                      />
                    </div>

                    {/* Premium status / Access Tiers */}
                    <div className="md:col-span-2">
                      <AccessTierSelector
                        selectedTiers={newQuizAllowedTiers}
                        onChange={(updatedTiers) => {
                          setNewQuizAllowedTiers(updatedTiers);
                          setNewQuizIsPremium(!updatedTiers.includes('FREEMIUM'));
                          setIsQuizValidated(false);
                        }}
                        label="Catégories d'élèves autorisées pour ce Quiz"
                      />
                    </div>

                    {/* Trimester selection */}
                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">
                        Période académique (Trimestre)
                      </label>
                      <select
                        value={newQuizTrimester}
                        onChange={(e) => { setNewQuizTrimester(e.target.value); setIsQuizValidated(false); }}
                        className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white"
                      >
                        <option value="1er trimestre">1er trimestre</option>
                        <option value="2eme trimestre">2eme trimestre</option>
                        <option value="3eme trimestre">3eme trimestre</option>
                        <option value="révision">révision</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Questions Management List */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-white space-y-4 shadow-xs text-left">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-[#0F1E36] text-xs uppercase tracking-wide">
                      📝 Questions du Quiz ({newQuizQuestions.length})
                    </h4>
                    <button
                      type="button"
                      onClick={handleAddQuestionManual}
                      className="px-2.5 py-1 bg-slate-50 border border-slate-200 text-[#0F1E36] hover:bg-slate-100 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer"
                    >
                      <Plus size={11} />
                      Ajouter une question
                    </button>
                  </div>

                  <div className="space-y-5 max-h-[600px] overflow-y-auto pr-1">
                    {newQuizQuestions.map((q, qIdx) => (
                      <div key={q.id} className="p-4 border border-slate-100 rounded-xl space-y-3.5 bg-[#F8FAFC]/50 relative">
                        <button
                          type="button"
                          onClick={() => handleDeleteQuestionManual(q.id)}
                          className="absolute top-3 right-3 text-red-500 hover:text-red-700 transition-colors p-1 bg-white border border-slate-100 shadow-xs rounded-lg cursor-pointer"
                          title="Supprimer la question"
                        >
                          <Trash2 size={13} />
                        </button>

                        <div className="text-xs font-bold text-[#0F1E36] flex items-center gap-1">
                          <span className="w-5 h-5 rounded-full bg-[#10B981]/10 text-[#10B981] flex items-center justify-center text-[10px]">
                            {qIdx + 1}
                          </span>
                          Question {qIdx + 1}
                        </div>

                        {/* Question text */}
                        <div className="space-y-1 text-xs">
                          <label className="block font-bold text-gray-400 uppercase text-[9px]">Énoncé de la question</label>
                          <input
                            type="text"
                            required
                            value={q.questionText}
                            onChange={(e) => handleUpdateQuestionManual(q.id, "questionText", e.target.value)}
                            placeholder="Saisissez l'énoncé de la question ici..."
                            className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                          />
                        </div>

                        {/* Options */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          {q.options.map((opt, oIdx) => (
                            <div key={oIdx} className="space-y-1">
                              <label className="block font-bold text-gray-400 uppercase text-[9px]">Option {String.fromCharCode(65 + oIdx)}</label>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => {
                                  const newOpts = [...q.options];
                                  newOpts[oIdx] = e.target.value;
                                  handleUpdateQuestionManual(q.id, "options", newOpts);
                                }}
                                placeholder={`Option de réponse ${oIdx + 1}`}
                                className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                              />
                            </div>
                          ))}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                          {/* Correct Option Dropdown */}
                          <div className="space-y-1 md:col-span-1">
                            <label className="block font-bold text-gray-400 uppercase text-[9px]">Bonne Réponse</label>
                            <select
                              value={q.correctAnswerIndex}
                              onChange={(e) => handleUpdateQuestionManual(q.id, "correctAnswerIndex", Number(e.target.value))}
                              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg font-semibold bg-white focus:outline-none"
                            >
                              <option value={0}>Option A</option>
                              <option value={1}>Option B</option>
                              <option value={2}>Option C</option>
                              <option value={3}>Option D</option>
                            </select>
                          </div>

                          {/* Explanation */}
                          <div className="space-y-1 md:col-span-2">
                            <label className="block font-bold text-gray-400 uppercase text-[9px]">Explication pédagogique (Optionnelle)</label>
                            <input
                              type="text"
                              value={q.explanation}
                              onChange={(e) => handleUpdateQuestionManual(q.id, "explanation", e.target.value)}
                              placeholder="Pourquoi cette réponse est correcte..."
                              className="w-full px-3 py-1.5 border border-[#CBD5E1] rounded-lg font-semibold bg-white focus:outline-none focus:ring-1 focus:ring-[#10B981]"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Publish & Validate Action Section */}
                <div className="border border-slate-100 rounded-2xl p-5 bg-slate-50 space-y-4 text-left">
                  <div className="flex flex-col md:flex-row items-center gap-4">
                    {/* Validate Button */}
                    <button
                      type="button"
                      onClick={handleValidateQuiz}
                      className={`w-full md:w-1/2 py-3 px-4 rounded-xl font-extrabold uppercase tracking-wider text-xs transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm ${
                        isQuizValidated
                          ? "bg-emerald-50 border border-emerald-300 text-emerald-800 hover:bg-emerald-100"
                          : "bg-indigo-600 hover:bg-indigo-700 text-white"
                      }`}
                    >
                      {isQuizValidated ? (
                        <>
                          <Check className="text-emerald-600 animate-pulse" size={16} />
                          Quiz Validé avec Succès (Re-valider)
                        </>
                      ) : (
                        <>
                          <ShieldCheck size={16} />
                          1. Vérifier & Valider le Quiz
                        </>
                      )}
                    </button>

                    {/* Publish Submit Button */}
                    <button
                      type="submit"
                      disabled={!isQuizValidated}
                      className={`w-full md:w-1/2 py-3 px-4 font-extrabold rounded-xl uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md text-xs ${
                        isQuizValidated
                          ? "bg-[#10B981] hover:bg-[#0da673] text-white cursor-pointer"
                          : "bg-slate-100 border border-slate-200 text-slate-400 cursor-not-allowed"
                      }`}
                    >
                      <Check size={16} />
                      2. Publier le quiz interactif
                    </button>
                  </div>

                  {!isQuizValidated ? (
                    <p className="text-[11px] text-amber-600 font-semibold flex items-center gap-1.5 animate-pulse">
                      <AlertCircle size={12} />
                      Remarque : La validation est requise avant la publication. Elle vérifie que toutes les questions, réponses, barème et publics cibles sont correctement complétés.
                    </p>
                  ) : (
                    <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1.5">
                      <Check size={12} />
                      Quiz prêt pour la publication ! Toutes les exigences sont validées.
                    </p>
                  )}
                </div>
              </form>
            </div>
          )}
        </motion.div>
      )}

      {/* VIEWPORT 3B: UPLOAD COURSES & LIVRES - HISTORY */}
      {activeSubTab === "courses-history" && (() => {
        // Calculate filtered list inside an IIFE for clean isolated rendering
        const filteredCourses = courses.filter((c) => {
          // 1. Filter by file type
          if (courseFileTypeFilter !== "Tous" && c.fileType !== courseFileTypeFilter) {
            return false;
          }
          // 2. Filter by grade / level
          if (courseGradeFilter !== "Tous" && c.grade !== courseGradeFilter) {
            return false;
          }
          // 3. Filter by premium status
          if (coursePremiumFilter !== "Tous") {
            const isPremiumType = coursePremiumFilter === "Premium";
            if (c.isPremium !== isPremiumType) {
              return false;
            }
          }
          // 4. Text query filter
          if (courseSearchText && !c.title.toLowerCase().includes(courseSearchText.toLowerCase())) {
            return false;
          }
          return true;
        });

        const getFileTypeIcon = (fileType: string) => {
          switch (fileType?.toLowerCase()) {
            case "pdf":
              return <FileText size={11} className="text-red-500 shrink-0" />;
            case "mp4":
              return <Video size={11} className="text-blue-500 shrink-0" />;
            case "py":
              return <Code size={11} className="text-[#10B981] shrink-0" />;
            default:
              return <FileText size={11} className="text-slate-500 shrink-0" />;
          }
        };

        return (
          <motion.div
            key="courses-history"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs space-y-5 max-w-4xl mx-auto"
          >
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-gray-100 pb-3">
              <div className="text-left">
                <h3 className="font-semibold text-[#0F1E36] text-sm">Documents enregistrés au programme</h3>
                <p className="text-[11px] text-gray-400">Totalité des chapitres d'études configurés pour l'apprentissage sélectif.</p>
              </div>
              <span className="text-[10px] font-bold bg-[#0F1E36] text-white px-2.5 py-1 rounded-full self-start sm:self-auto uppercase tracking-wider">
                {filteredCourses.length !== courses.length 
                  ? `${filteredCourses.length} filtrés sur ${courses.length}` 
                  : `${courses.length} documents`
                }
              </span>
            </div>

            {/* Rechercher et Filtres interactifs */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-xl border border-gray-100 text-xs text-left">
              {/* Recherche textuelle */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">🔍 Recherche par titre</label>
                <input 
                  type="text"
                  placeholder="Saisir un mot-clé..."
                  value={courseSearchText}
                  onChange={(e) => setCourseSearchText(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-slate-950 focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                />
              </div>

              {/* Type de Fichier */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">📁 Type de fichier</label>
                <select
                  value={courseFileTypeFilter}
                  onChange={(e) => setCourseFileTypeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-slate-950 focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                >
                  <option value="Tous">Tous les types</option>
                  <option value="pdf">📄 Document PDF (.pdf)</option>
                  <option value="mp4">🎥 Vidéo de cours (.mp4)</option>
                  <option value="py">🐍 Script Python (.py)</option>
                  <option value="txt">📝 Exercice texte (.txt)</option>
                </select>
              </div>

              {/* Niveau Élève */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">🎓 Niveau Élève</label>
                <select
                  value={courseGradeFilter}
                  onChange={(e) => setCourseGradeFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-slate-950 focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                >
                  <option value="Tous">Tous les niveaux</option>
                  {GRADES_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              {/* Offre Premium vs Gratuit */}
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wide">💎 Offre d'accès</label>
                <select
                  value={coursePremiumFilter}
                  onChange={(e) => setCoursePremiumFilter(e.target.value)}
                  className="w-full px-2.5 py-1.5 bg-white border border-[#CBD5E1] rounded-lg text-slate-950 focus:ring-1 focus:ring-[#10B981] focus:outline-none"
                >
                  <option value="Tous">Tous (Premium & Free)</option>
                  <option value="Premium">👑 Premium Uniquement</option>
                  <option value="Gratuit">🌱 Gratuit (Free)</option>
                </select>
              </div>
            </div>
            
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {filteredCourses.length === 0 ? (
                <div className="text-center p-8 bg-gray-55/40 rounded-xl space-y-3 border border-dashed border-[#CBD5E1]">
                  <p className="text-gray-400 italic font-mono text-xs">
                    Aucun matériel ne correspond aux filtres sélectionnés.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setCourseFileTypeFilter("Tous");
                      setCourseGradeFilter("Tous");
                      setCoursePremiumFilter("Tous");
                      setCourseSearchText("");
                    }}
                    className="px-3.5 py-1.5 bg-[#10B981] hover:bg-emerald-600 text-white rounded-lg text-[10.5px] font-bold uppercase transition cursor-pointer"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              ) : (
                filteredCourses.map((c) => (
                  <div key={c.id} className="p-3.5 border border-[#E5E7EB] rounded-xl hover:border-violet-300 transition-all bg-[#F9FAFB] flex justify-between items-center gap-4 text-xs">
                    <div className="text-left space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[9px] bg-[#0F1E36] text-white px-2 py-0.5 rounded font-bold uppercase">
                          {getContentTypeLabel(c.contentType)}
                        </span>
                        <span className="text-[9px] bg-violet-55 border border-violet-200 text-violet-750 px-2 py-0.5 rounded font-bold uppercase flex items-center gap-1">
                          {getFileTypeIcon(c.fileType || "")}
                          <span>{c.fileType}</span>
                        </span>
                        <span className="text-[9px] bg-blue-50 text-blue-600 px-2 py-0.5 rounded font-mono">
                          {c.grade}
                        </span>
                        <span className="text-[9px] bg-[#10B981]/15 text-[#10B981] px-1.5 rounded font-bold">
                          {c.module}
                        </span>
                        {c.trimestre && (
                          <span className="text-[9px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 rounded font-bold uppercase">
                            {c.trimestre === "revision" ? "Révision" : c.trimestre === "1ere trimestre" ? "1er Trim" : c.trimestre === "2eme trimestre" ? "2ème Trim" : "3ème Trim"}
                          </span>
                        )}
                        {c.isPremium ? (
                          <span className="text-[9.5px] bg-amber-500/10 border border-amber-500/25 text-amber-700 px-2 py-0.5 rounded-full font-extrabold flex items-center gap-1 shadow-2xs">
                            <Sparkles size={11} className="fill-amber-500 text-amber-500" />
                            <span>Premium</span>
                          </span>
                        ) : (
                          <span className="text-[9.5px] bg-emerald-500/10 border border-emerald-500/25 text-emerald-700 px-2 py-0.5 rounded-full font-bold flex items-center gap-1 shadow-2xs">
                            <Unlock size={11} className="text-emerald-600" />
                            <span>Gratuit</span>
                          </span>
                        )}
                      </div>
                      <p className="font-semibold text-gray-900 text-sm">{c.title}</p>
                      {c.attachmentName && (
                        <p className="text-[10px] text-gray-400">Support : {c.attachmentName}</p>
                      )}
                    </div>
                    <button 
                      onClick={() => handleDeleteCourse(c.id)}
                      className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 rounded-lg cursor-pointer shrink-0 transition-colors border border-red-100"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </motion.div>
        );
      })()}

      {/* VIEWPORT 3BC: QUIZZES HISTORY & REVISION TIPS */}
      {activeSubTab === "quizzes-history" && (
        <motion.div
          key="quizzes-history"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-6 max-w-6xl mx-auto"
        >
          {editingQuiz ? (
            <>
              {/* MODAL DE PREVISUALISATION INTERACTIVE POUR L'ADMIN */}
              <AnimatePresence>
                {isPreviewOpen && (
                  <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-[100] overflow-y-auto">
                    <div className="fixed inset-0" onClick={() => setIsPreviewOpen(false)} />
                    <motion.div
                      initial={{ scale: 0.95, y: 15, opacity: 0 }}
                      animate={{ scale: 1, y: 0, opacity: 1 }}
                      exit={{ scale: 0.95, y: 15, opacity: 0 }}
                      transition={{ type: "spring", duration: 0.4 }}
                      className="bg-slate-50 rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden text-left relative z-[101]"
                    >
                      {/* Top Dark Header */}
                      <div className="bg-[#0F1E36] text-white p-5 lg:p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="bg-indigo-600 text-white px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase animate-pulse flex items-center gap-1">
                              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full inline-block animate-ping"></span>
                              Aperçu Étudiant
                            </span>
                            <span className="text-slate-400 font-mono text-[11px]">Simulation interactive</span>
                          </div>
                          <h3 className="font-extrabold text-base md:text-lg uppercase tracking-wider flex items-center gap-2 text-indigo-200">
                            👁️ {editingQuizTitle || "Quiz sans titre"}
                          </h3>
                          <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-300 font-semibold">
                            <span>Niveau : {editingQuizGrade}</span>
                            <span>•</span>
                            <span>Filière : {editingQuizSection}</span>
                            <span>•</span>
                            <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 uppercase text-[9px] font-extrabold">
                              {editingQuizDifficulty}
                            </span>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => setIsPreviewOpen(false)}
                          className="absolute top-4 right-4 md:static p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-all cursor-pointer"
                          title="Fermer l'aperçu"
                        >
                          <X size={16} />
                        </button>
                      </div>

                      {/* Sticky Score Banner */}
                      <div className="bg-white border-b border-slate-150 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs">
                        <div className="flex items-center gap-4 flex-wrap">
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-500">Progrès :</span>
                            <span className="bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full font-bold">
                              {editingQuizQuestions.reduce((acc, _, idx) => acc + (previewChecked[idx] ? 1 : 0), 0)} / {editingQuizQuestions.length} validées
                            </span>
                          </div>
                          <div className="h-4 w-px bg-slate-200 hidden sm:block"></div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-bold text-slate-500">Score de simulation :</span>
                            <span className="bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                              <Award size={13} />
                              {editingQuizQuestions.reduce((acc, q, idx) => acc + (previewChecked[idx] && previewAnswers[idx] === q.correctAnswerIndex ? 1 : 0), 0)} / {editingQuizQuestions.length} correct
                            </span>
                          </div>
                        </div>

                        {/* Visual Progress Bar */}
                        <div className="w-full sm:w-48 bg-slate-100 rounded-full h-2 overflow-hidden">
                          <div
                            className="bg-indigo-600 h-full transition-all duration-300"
                            style={{
                              width: `${editingQuizQuestions.length > 0 ? (editingQuizQuestions.reduce((acc, _, idx) => acc + (previewChecked[idx] ? 1 : 0), 0) / editingQuizQuestions.length) * 100 : 0}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Scrollable Questions list */}
                      <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-slate-50 max-h-[60vh]">
                        {editingQuizQuestions.length === 0 ? (
                          <div className="text-center py-12 text-slate-400 italic">
                            Aucune question n'a été configurée pour le moment. Ajoutez des questions dans l'éditeur pour les tester ici.
                          </div>
                        ) : (
                          editingQuizQuestions.map((q, idx) => {
                            const isChecked = previewChecked[idx];
                            const selectedOptIdx = previewAnswers[idx];
                            const isCorrect = isChecked && selectedOptIdx === q.correctAnswerIndex;

                            return (
                              <div
                                key={q.id || idx}
                                className={`bg-white border transition-all rounded-2xl p-5 space-y-4 shadow-2xs ${
                                  isChecked
                                    ? isCorrect
                                      ? "border-emerald-200 bg-emerald-50/10 shadow-emerald-50/50"
                                      : "border-rose-200 bg-rose-50/10 shadow-rose-50/50"
                                    : selectedOptIdx !== undefined
                                    ? "border-indigo-200 ring-1 ring-indigo-100"
                                    : "border-slate-200"
                                }`}
                              >
                                {/* Question Header */}
                                <div className="flex justify-between items-center border-b border-slate-100 pb-2.5">
                                  <span className="px-2.5 py-1 bg-slate-100 text-slate-700 text-[10px] rounded-md font-mono font-bold">
                                    QUESTION {idx + 1} SUR {editingQuizQuestions.length}
                                  </span>
                                  {isChecked ? (
                                    isCorrect ? (
                                      <span className="flex items-center gap-1 text-[10px] bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-extrabold uppercase">
                                        <Check size={11} /> Correct
                                      </span>
                                    ) : (
                                      <span className="flex items-center gap-1 text-[10px] bg-rose-100 text-rose-800 px-2 py-0.5 rounded-full font-extrabold uppercase">
                                        <X size={11} /> Incorrect
                                      </span>
                                    )
                                  ) : (
                                    selectedOptIdx !== undefined && (
                                      <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full font-bold uppercase animate-pulse">
                                        Choix sélectionné
                                      </span>
                                    )
                                  )}
                                </div>

                                {/* Prompt */}
                                <p className="font-extrabold text-xs md:text-sm text-slate-900 leading-relaxed text-left">
                                  {q.questionText || <span className="text-slate-400 italic">Sans énoncé</span>}
                                </p>

                                {/* Options */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  {q.options?.map((opt: string, optIdx: number) => {
                                    const isSelected = selectedOptIdx === optIdx;
                                    const isThisCorrect = q.correctAnswerIndex === optIdx;

                                    let optionStyle = "border-slate-200 bg-white hover:bg-slate-50 text-slate-700";
                                    if (isChecked) {
                                      if (isThisCorrect) {
                                        optionStyle = "border-emerald-400 bg-emerald-50 text-emerald-950 font-semibold ring-1 ring-emerald-300";
                                      } else if (isSelected) {
                                        optionStyle = "border-rose-400 bg-rose-50 text-rose-950 ring-1 ring-rose-300";
                                      } else {
                                        optionStyle = "border-slate-150 bg-slate-50/50 text-slate-400";
                                      }
                                    } else if (isSelected) {
                                      optionStyle = "border-indigo-500 bg-indigo-50/70 text-indigo-950 font-bold ring-2 ring-indigo-500/25";
                                    }

                                    return (
                                      <button
                                        key={optIdx}
                                        type="button"
                                        disabled={isChecked}
                                        onClick={() => {
                                          setPreviewAnswers({
                                            ...previewAnswers,
                                            [idx]: optIdx
                                          });
                                        }}
                                        className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-3 ${
                                          isChecked ? "cursor-not-allowed" : "cursor-pointer"
                                        } ${optionStyle}`}
                                      >
                                        <div className="flex items-center gap-2.5 flex-1">
                                          <span className={`w-5 h-5 rounded-lg flex items-center justify-center font-bold text-[10px] shrink-0 ${
                                            isSelected
                                              ? "bg-indigo-600 text-white"
                                              : isChecked && isThisCorrect
                                              ? "bg-emerald-600 text-white"
                                              : "bg-slate-100 text-slate-600"
                                          }`}>
                                            {String.fromCharCode(65 + optIdx)}
                                          </span>
                                          <span className="font-semibold leading-snug break-words">{opt || <span className="text-slate-300 italic">Option vide</span>}</span>
                                        </div>
                                        {isChecked && isThisCorrect && (
                                          <Check size={14} className="text-emerald-600 shrink-0" />
                                        )}
                                      </button>
                                    );
                                  })}
                                </div>

                                {/* Check / Explanation Feedback */}
                                <div className="pt-2">
                                  {!isChecked ? (
                                    <button
                                      type="button"
                                      disabled={selectedOptIdx === undefined}
                                      onClick={() => {
                                        setPreviewChecked({
                                          ...previewChecked,
                                          [idx]: true
                                        });
                                      }}
                                      className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                                        selectedOptIdx === undefined
                                          ? "bg-slate-100 text-slate-400 cursor-not-allowed"
                                          : "bg-[#0F1E36] hover:bg-slate-800 text-white cursor-pointer shadow-xs"
                                      }`}
                                    >
                                      <Check size={13} />
                                      <span>Valider ma réponse</span>
                                    </button>
                                  ) : (
                                    <motion.div
                                      initial={{ opacity: 0, y: 5 }}
                                      animate={{ opacity: 1, y: 0 }}
                                      className={`p-4 rounded-xl border text-xs space-y-2 text-left ${
                                        isCorrect
                                          ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-900"
                                          : "bg-rose-500/5 border-rose-500/20 text-rose-900"
                                      }`}
                                    >
                                      <p className="font-extrabold flex items-center gap-1.5">
                                        {isCorrect ? "🎉 Bonne réponse !" : "❌ Mauvaise réponse."}
                                      </p>
                                      {q.explanation && (
                                        <p className="leading-relaxed text-slate-600 pl-4 border-l-2 border-amber-300 mt-1 font-medium">
                                          <span className="font-bold text-amber-800 block text-[10px] uppercase tracking-wider mb-0.5">💡 Explication pédagogique :</span>
                                          {q.explanation}
                                        </p>
                                      )}
                                    </motion.div>
                                  )}
                                </div>
                              </div>
                            );
                          })
                        )}
                      </div>

                      {/* Footer Actions */}
                      <div className="p-4 border-t border-slate-200 bg-white flex flex-col sm:flex-row justify-between items-center gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setPreviewAnswers({});
                            setPreviewChecked({});
                          }}
                          className="w-full sm:w-auto px-4 py-2 border border-slate-200 text-slate-600 hover:bg-slate-50 font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer"
                        >
                          <RefreshCw size={13} />
                          <span>Recommencer le test</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsPreviewOpen(false)}
                          className="w-full sm:w-auto px-5 py-2.5 bg-[#0F1E36] hover:bg-slate-800 text-white font-extrabold rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs cursor-pointer shadow-md"
                        >
                          <X size={13} />
                          <span>Fermer la prévisualisation</span>
                        </button>
                      </div>
                    </motion.div>
                  </div>
                )}
              </AnimatePresence>

              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-slate-200 rounded-3xl shadow-md overflow-hidden text-left"
              >
              {/* Header section with back button and main actions */}
              <div className="bg-[#0F1E36] text-white p-6 lg:p-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setEditingQuiz(null)}
                    className="group mb-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
                    <span>Retour à la liste des Quiz</span>
                  </button>
                  <h3 className="font-extrabold text-lg md:text-xl uppercase tracking-wider flex items-center gap-2">
                    ✏️ Modifier le Quiz
                  </h3>
                  <p className="text-[11px] text-slate-300">
                    Ajustez le titre, le barème, le public cible, et gérez les questions interactives.
                  </p>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto self-stretch md:self-auto justify-end flex-wrap">
                  <button
                    type="button"
                    onClick={() => {
                      setPreviewAnswers({});
                      setPreviewChecked({});
                      setIsPreviewOpen(true);
                    }}
                    className="px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center gap-1.5 shadow-md"
                  >
                    <Eye size={14} />
                    <span>👁️ Prévisualiser</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingQuiz(null)}
                    className="px-4 py-2.5 border border-slate-700 hover:bg-slate-800 text-slate-300 hover:text-white font-bold rounded-xl transition-all cursor-pointer text-xs"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSaveEditedQuiz}
                    type="button"
                    className="px-5 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center gap-2 cursor-pointer text-xs"
                  >
                    💾 Sauvegarder les modifications
                  </button>
                </div>
              </div>

              {/* Stat summary banner */}
              <div className="bg-slate-50 border-b border-slate-150 px-6 py-4 flex flex-wrap items-center gap-6 text-xs text-slate-600">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">Quiz sélectionné :</span>
                  <span className="bg-slate-200 px-2 py-0.5 rounded text-slate-800 font-mono text-[10px]">{editingQuiz.id}</span>
                </div>
                <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">Total questions :</span>
                  <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-bold">{editingQuizQuestions.length}</span>
                </div>
                <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">Barème cumulé :</span>
                  <span className="bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">{editingQuizScore} pts</span>
                </div>
                <div className="h-4 w-px bg-slate-300 hidden sm:block"></div>
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">Public :</span>
                  <span className={`px-2 py-0.5 rounded-full font-bold ${editingQuizIsPremium ? 'bg-amber-500/10 text-amber-700' : 'bg-slate-150 text-slate-700'}`}>
                    {editingQuizIsPremium ? '👑 Premium' : '🌱 Gratuit'}
                  </span>
                </div>
              </div>

              <form onSubmit={handleSaveEditedQuiz} className="p-6 lg:p-8 space-y-6">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Left Column: Paramètres du Quiz (Metadata) */}
                  <div className="lg:col-span-1 space-y-6">
                    <div className="border border-slate-200 rounded-2xl p-5 bg-slate-50/50 space-y-4">
                      <h4 className="font-bold text-[#0F1E36] text-xs uppercase tracking-wider border-b border-slate-200 pb-2 flex items-center gap-1.5">
                        <Sliders size={14} className="text-slate-500" />
                        <span>Configuration générale</span>
                      </h4>

                      {/* Title */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Titre du Quiz</label>
                        <input
                          type="text"
                          required
                          value={editingQuizTitle}
                          onChange={(e) => setEditingQuizTitle(e.target.value)}
                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] bg-white text-xs text-slate-900"
                        />
                      </div>

                      {/* Grade */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Niveau Scolaire</label>
                        <select
                          value={editingQuizGrade}
                          onChange={(e) => setEditingQuizGrade(e.target.value)}
                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] bg-white text-xs text-slate-900"
                        >
                          <option value="4ème Année">4ème Année</option>
                          <option value="3ème Année">3ème Année</option>
                          <option value="Tous">Tous les niveaux</option>
                        </select>
                      </div>

                      {/* Section */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Filière d'étude</label>
                        <select
                          value={editingQuizSection}
                          onChange={(e) => setEditingQuizSection(e.target.value)}
                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] bg-white text-xs text-slate-900"
                        >
                          <option value="Tous">Toutes les filières</option>
                          <option value="Sciences de l'Informatique">Sciences de l'Informatique</option>
                          <option value="Mathématiques">Mathématiques</option>
                          <option value="Sciences Expérimentales">Sciences Expérimentales</option>
                          <option value="Sciences Techniques">Sciences Techniques</option>
                          <option value="Économie & Gestion">Économie & Gestion</option>
                          <option value="Lettres">Lettres</option>
                          <option value="Sport">Sport</option>
                        </select>
                      </div>

                      {/* Difficulty */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Difficulté</label>
                        <select
                          value={editingQuizDifficulty}
                          onChange={(e) => setEditingQuizDifficulty(e.target.value as any)}
                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] bg-white text-xs text-slate-900"
                        >
                          <option value="Debutant">Débutant</option>
                          <option value="Intermediaire">Intermédiaire</option>
                          <option value="Avance">Avancé</option>
                        </select>
                      </div>

                      {/* Score */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Barème global (points)</label>
                        <input
                          type="number"
                          min={1}
                          value={editingQuizScore}
                          onChange={(e) => setEditingQuizScore(Number(e.target.value))}
                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] bg-white text-xs text-slate-900"
                        />
                      </div>

                      {/* Premium / Access Tiers */}
                      <div className="md:col-span-2">
                        <AccessTierSelector
                          selectedTiers={editingQuizAllowedTiers}
                          onChange={(updatedTiers) => {
                            setEditingQuizAllowedTiers(updatedTiers);
                            setEditingQuizIsPremium(!updatedTiers.includes('FREEMIUM'));
                          }}
                          label="Catégories d'élèves autorisées pour ce Quiz"
                        />
                      </div>

                      {/* Trimester */}
                      <div className="space-y-1.5">
                        <label className="text-[10px] text-gray-500 font-bold uppercase tracking-wider block">Trimestre académique</label>
                        <select
                          value={editingQuizTrimester}
                          onChange={(e) => setEditingQuizTrimester(e.target.value)}
                          className="w-full px-3 py-2 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] bg-white text-xs text-slate-900"
                        >
                          <option value="1er trimestre">1er trimestre</option>
                          <option value="2eme trimestre">2eme trimestre</option>
                          <option value="3eme trimestre">3eme trimestre</option>
                          <option value="révision">révision</option>
                        </select>
                      </div>
                    </div>

                    <div className="border border-indigo-100 rounded-2xl p-5 bg-gradient-to-br from-indigo-50/50 to-sky-50/30 text-xs text-slate-600 space-y-3">
                      <h5 className="font-extrabold text-indigo-950 uppercase tracking-wide text-[10px] flex items-center gap-1">
                        <HelpCircle size={13} className="text-indigo-600" />
                        <span>Aide à la mise en page</span>
                      </h5>
                      <p className="leading-relaxed">
                        Chaque question doit posséder un énoncé clair et avoir ses 4 options renseignées. Sélectionnez l'option correcte à l'aide des boutons radios verts correspondants.
                      </p>
                      <p className="leading-relaxed font-semibold text-slate-700">
                        L'explication est fortement recommandée pour aider l'élève à progresser lors de sa correction.
                      </p>
                    </div>
                  </div>

                  {/* Right Column: Questions List & Live Editor (span 2) */}
                  <div className="lg:col-span-2 space-y-6">
                    <div className="border border-slate-200 rounded-2xl p-6 bg-white space-y-5">
                      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-slate-100 pb-4">
                        <div>
                          <h4 className="font-extrabold text-[#0F1E36] text-sm uppercase tracking-wider flex items-center gap-2">
                            <span>📝 Liste des Questions</span>
                            <span className="bg-slate-100 text-[#0F1E36] px-2.5 py-0.5 rounded-full text-xs font-mono font-extrabold">
                              {editingQuizQuestions.length}
                            </span>
                          </h4>
                          <p className="text-[11px] text-gray-500">Ajoutez, modifiez ou ordonnez les questions QCM.</p>
                        </div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuizQuestions([
                                ...editingQuizQuestions,
                                {
                                  id: `q_edit_${Date.now()}`,
                                  questionText: "Quelle est la valeur de x après l'exécution ?",
                                  options: ["x = 5", "x = 10", "x = 15", "x = 20"],
                                  correctAnswerIndex: 0,
                                  explanation: "Démonstration de l'exécution pas à pas."
                                }
                              ]);
                            }}
                            className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-3xs"
                          >
                            💡 Insérer exemple
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuizQuestions([
                                ...editingQuizQuestions,
                                {
                                  id: `q_edit_${Date.now()}`,
                                  questionText: "",
                                  options: ["", "", "", ""],
                                  correctAnswerIndex: 0,
                                  explanation: ""
                                }
                              ]);
                            }}
                            className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] rounded-lg flex items-center gap-1 transition-all cursor-pointer shadow-xs"
                          >
                            <PlusCircle size={13} />
                            <span>Ajouter une question</span>
                          </button>
                          {editingQuizQuestions.length > 0 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (confirm("Voulez-vous vraiment vider toutes les questions de ce quiz ?")) {
                                  setEditingQuizQuestions([]);
                                }
                              }}
                              className="px-2.5 py-1.5 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 font-bold text-[11px] rounded-lg transition-all cursor-pointer"
                              title="Tout vider"
                            >
                              <Trash2 size={13} />
                            </button>
                          )}
                        </div>
                      </div>

                      {editingQuizQuestions.length === 0 ? (
                        <div className="text-center py-16 bg-slate-50 border-2 border-dashed border-slate-200 rounded-2xl space-y-3">
                          <HelpCircle size={32} className="mx-auto text-slate-400" />
                          <div className="space-y-1">
                            <p className="font-bold text-slate-700 text-xs">Aucune question dans ce quiz</p>
                            <p className="text-[11px] text-slate-400">Cliquez sur le bouton ci-dessus pour insérer votre première question interactive.</p>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingQuizQuestions([
                                {
                                  id: `q_edit_${Date.now()}`,
                                  questionText: "",
                                  options: ["", "", "", ""],
                                  correctAnswerIndex: 0,
                                  explanation: ""
                                }
                              ]);
                            }}
                            className="px-4 py-2 bg-[#0F1E36] hover:bg-slate-800 text-white rounded-lg font-bold text-xs cursor-pointer shadow-xs"
                          >
                            + Ajouter la première question
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-6">
                          {editingQuizQuestions.map((q, idx) => (
                            <div key={q.id || idx} className="p-5 bg-white border border-slate-200 hover:border-indigo-200 transition-all rounded-2xl relative space-y-4 shadow-3xs">
                              {/* Header question card */}
                              <div className="flex justify-between items-center bg-slate-50 -mx-5 -mt-5 px-5 py-3 rounded-t-2xl border-b border-slate-150">
                                <span className="px-3 py-1 bg-[#0F1E36] text-white text-[10px] rounded-full uppercase font-mono font-extrabold tracking-wider">
                                  Question n° {idx + 1}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingQuizQuestions(editingQuizQuestions.filter((_, qIdx) => qIdx !== idx));
                                  }}
                                  className="p-1.5 text-rose-500 hover:text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg transition-colors border border-rose-100 cursor-pointer"
                                  title="Supprimer la question"
                                >
                                  <Trash2 size={13} />
                                </button>
                              </div>

                              {/* Question title / prompt */}
                              <div className="space-y-1.5">
                                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Énoncé de la question</label>
                                <textarea
                                  required
                                  rows={2}
                                  placeholder="Ex: Quel algorithme utilise un parcours en largeur ?"
                                  value={q.questionText || ""}
                                  onChange={(e) => {
                                    const newQ = [...editingQuizQuestions];
                                    newQ[idx].questionText = e.target.value;
                                    setEditingQuizQuestions(newQ);
                                  }}
                                  className="w-full px-3 py-2 border border-slate-200 rounded-lg bg-white text-xs focus:ring-1 focus:ring-indigo-500 text-slate-900 font-semibold"
                                />
                              </div>

                              {/* Options grid */}
                              <div className="space-y-2">
                                <label className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider block">Choix multiples (Cochez la bonne réponse)</label>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
                                  {q.options?.map((opt: string, optIdx: number) => {
                                    const isCorrect = q.correctAnswerIndex === optIdx;
                                    return (
                                      <div
                                        key={optIdx}
                                        className={`p-3 rounded-xl border transition-all ${
                                          isCorrect
                                            ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-300'
                                            : 'bg-slate-50/50 border-slate-200 hover:bg-slate-50'
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2 mb-1.5">
                                          <div className="flex items-center gap-1.5">
                                            <input
                                              type="radio"
                                              id={`correct_q_${idx}_opt_${optIdx}`}
                                              name={`correct_q_${idx}`}
                                              checked={isCorrect}
                                              onChange={() => {
                                                const newQ = [...editingQuizQuestions];
                                                newQ[idx].correctAnswerIndex = optIdx;
                                                setEditingQuizQuestions(newQ);
                                              }}
                                              className="text-emerald-600 focus:ring-emerald-500 w-3.5 h-3.5"
                                            />
                                            <label
                                              htmlFor={`correct_q_${idx}_opt_${optIdx}`}
                                              className="text-[10px] font-bold text-slate-500 uppercase cursor-pointer"
                                            >
                                              Option {optIdx + 1}
                                            </label>
                                          </div>
                                          {isCorrect && (
                                            <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-extrabold uppercase tracking-wide">
                                              Bonne réponse
                                            </span>
                                          )}
                                        </div>
                                        <input
                                          type="text"
                                          required
                                          placeholder={`Saisir l'option ${optIdx + 1}...`}
                                          value={opt || ""}
                                          onChange={(e) => {
                                            const newQ = [...editingQuizQuestions];
                                            const updatedOpts = [...(q.options || ["", "", "", ""])];
                                            updatedOpts[optIdx] = e.target.value;
                                            newQ[idx].options = updatedOpts;
                                            setEditingQuizQuestions(newQ);
                                          }}
                                          className="w-full px-2.5 py-1.5 border border-slate-200 rounded-lg bg-white text-xs text-slate-900 focus:ring-1 focus:ring-emerald-400"
                                        />
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>

                              {/* Explanation block */}
                              <div className="space-y-1.5 bg-amber-500/5 p-4 rounded-xl border border-amber-500/10">
                                <label className="text-[10px] font-extrabold uppercase text-amber-800 tracking-wider block">💡 Explication pédagogique (Optionnelle)</label>
                                <input
                                  type="text"
                                  placeholder="Explication : Le parcours en largeur utilise une file (FIFO) pour explorer les voisins d'un nœud..."
                                  value={q.explanation || ""}
                                  onChange={(e) => {
                                    const newQ = [...editingQuizQuestions];
                                    newQ[idx].explanation = e.target.value;
                                    setEditingQuizQuestions(newQ);
                                  }}
                                  className="w-full px-3 py-2 border border-slate-200 focus:ring-1 focus:ring-amber-500 rounded-lg bg-white text-xs text-slate-900"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Bottom sticky styled save bar */}
                <div className="flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 pt-6 bg-slate-50 p-6 -mx-8 -mb-8 rounded-b-3xl gap-4">
                  <button
                    type="button"
                    onClick={() => setEditingQuiz(null)}
                    className="w-full sm:w-auto px-5 py-2.5 border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 font-bold rounded-xl transition-colors cursor-pointer text-xs"
                  >
                    Annuler et retourner
                  </button>
                  <div className="w-full sm:w-auto flex items-center justify-end gap-3 flex-wrap">
                    <button
                      type="button"
                      onClick={() => {
                        setPreviewAnswers({});
                        setPreviewChecked({});
                        setIsPreviewOpen(true);
                      }}
                      className="w-full sm:w-auto px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all cursor-pointer text-xs flex items-center justify-center gap-1.5 shadow-md"
                    >
                      <Eye size={14} />
                      <span>👁️ Prévisualiser</span>
                    </button>
                    <button
                      type="submit"
                      className="w-full sm:w-auto px-6 py-2.5 bg-[#10B981] hover:bg-emerald-600 text-white font-extrabold rounded-xl transition-all cursor-pointer shadow-md flex items-center justify-center gap-2 text-xs"
                    >
                      💾 Sauvegarder les modifications
                    </button>
                  </div>
                </div>
              </form>
            </motion.div>
          </>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Left/Middle Column: List of saved Quizzes */}
              <div className="lg:col-span-2 space-y-4">
                <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs space-y-4 text-xs">
                  <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                    <div className="text-left">
                      <h3 className="font-semibold text-[#0F1E36] text-sm">Répertoire des Quiz interactifs</h3>
                      <p className="text-[11px] text-gray-400">Modifiez le barème, les questions ou supprimez les quiz obsolètes.</p>
                    </div>
                    <span className="text-[10px] font-bold bg-[#0F1E36] text-white px-2.5 py-1 rounded-full uppercase">
                      {quizzes.length} Quiz
                    </span>
                  </div>

                  <div className="space-y-3.5 max-h-[600px] overflow-y-auto pr-1">
                    {quizzes.length === 0 ? (
                      <div className="text-center py-12 text-gray-400 italic">
                        Aucun quiz disponible dans la base de données.
                      </div>
                    ) : (
                      quizzes.map((q) => (
                        <div key={q.id} className="p-4 border border-[#E5E7EB] rounded-xl hover:border-emerald-500 transition-all bg-[#F9FAFB] flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-left">
                          <div className="space-y-1.5 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="px-1.5 py-0.5 bg-emerald-100 text-emerald-800 text-[8.5px] rounded uppercase font-extrabold">
                                {q.difficulty}
                              </span>
                              <span className="text-[9px] bg-sky-50 text-sky-700 border border-sky-200 px-1.5 rounded font-bold uppercase">
                                {q.trimestre === "revision" ? "Révision" : q.trimestre === "1ere trimestre" ? "1er Trim" : q.trimestre === "2eme trimestre" ? "2ème Trim" : q.trimestre || "1er trimestre"}
                              </span>
                              <span className="text-[9.5px] font-mono text-gray-400">
                                Niveau : {q.grade} • Filière : {q.section}
                              </span>
                              {q.isPremium ? (
                                <span className="text-[8.5px] bg-amber-100 text-amber-800 px-1.5 rounded uppercase font-extrabold font-mono">
                                  Premium
                                </span>
                              ) : (
                                <span className="text-[8.5px] bg-slate-100 text-slate-700 px-1.5 rounded uppercase font-extrabold font-mono">
                                  Gratuit
                                </span>
                              )}
                            </div>
                            <h4 className="font-extrabold text-sm text-gray-900 leading-tight">{q.title}</h4>
                            <div className="flex items-center gap-4 text-[10px] text-gray-500 font-medium">
                              <span>📝 {q.questions?.length || 0} questions</span>
                              <span>🎯 Barème : {q.score || 20} pts</span>
                              <span>✍️ Par {q.creatorName || "A-Zed"}</span>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() => handleStartEditQuiz(q)}
                              className="p-1.5 text-gray-600 bg-white border border-gray-200 hover:bg-slate-50 hover:text-emerald-600 rounded-lg cursor-pointer transition-colors"
                              title="Modifier ce quiz"
                            >
                              ✏️ Modifier
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteQuizFromHistory(q.id)}
                              className="p-1.5 text-red-500 bg-red-50 hover:bg-red-100 border border-red-100 rounded-lg cursor-pointer transition-colors"
                              title="Supprimer ce quiz"
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>

              {/* Right Column: Manage Revision Tips */}
              <div className="lg:col-span-1 space-y-4 text-xs text-left">
                <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs space-y-4">
                  <div>
                    <h3 className="font-semibold text-[#0F1E36] text-sm">💡 Astuces de Révision</h3>
                    <p className="text-[11px] text-gray-400">Ajoutez et gérez les conseils affichés dans l'espace Quiz des élèves.</p>
                  </div>

                  {/* Form to add a new Tip */}
                  <form onSubmit={handleAddTipSubmit} className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-bold uppercase text-gray-500">Nouvelle astuce de révision</label>
                      <textarea
                        required
                        rows={3}
                        value={newTipText}
                        onChange={(e) => setNewTipText(e.target.value)}
                        placeholder="Ex: L'épreuve pratique dure 1h30, entraînez-vous sans éditeur..."
                        className="w-full px-2.5 py-1.5 border border-[#CBD5E1] rounded-lg font-semibold focus:ring-1 focus:ring-[#10B981] focus:outline-none bg-white text-xs"
                      />
                    </div>
                    <button
                      type="submit"
                      className="w-full py-2 bg-[#0F1E36] hover:bg-[#1a2d4b] text-white font-bold rounded-lg transition-colors cursor-pointer"
                    >
                      Ajouter l'astuce
                    </button>
                  </form>

                  {/* List of current tips */}
                  <div className="space-y-3.5 border-t border-slate-100 pt-4">
                    <h4 className="font-bold text-gray-500 text-[10px] uppercase tracking-wider">Astuces Actuelles ({quizTipsList.length})</h4>
                    <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1">
                      {quizTipsList.length === 0 ? (
                        <div className="text-center py-6 text-gray-400 italic">
                          Aucune astuce personnalisée enregistrée. (Le système utilise l'astuce par défaut).
                        </div>
                      ) : (
                        quizTipsList.map((tip) => (
                          <div key={tip.id} className="p-3 bg-slate-50 border border-slate-150 rounded-xl space-y-2 relative">
                            {editingTipId === tip.id ? (
                              <div className="space-y-2">
                                <textarea
                                  value={editingTipText}
                                  onChange={(e) => setEditingTipText(e.target.value)}
                                  className="w-full p-2 border border-slate-300 rounded bg-white text-xs"
                                  rows={3}
                                />
                                <div className="flex justify-end gap-1.5">
                                  <button
                                    type="button"
                                    onClick={() => { setEditingTipId(null); setEditingTipText(""); }}
                                    className="px-2 py-1 bg-white border border-slate-200 text-gray-600 rounded text-[10px] font-bold"
                                  >
                                    Annuler
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleSaveTipEdit(tip.id)}
                                    className="px-2 py-1 bg-emerald-600 text-white hover:bg-emerald-700 rounded text-[10px] font-bold"
                                  >
                                    Enregistrer
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <>
                                <p className="text-[11px] text-slate-700 leading-relaxed font-medium">{tip.text}</p>
                                <div className="flex gap-2 justify-end pt-1">
                                  <button
                                    type="button"
                                    onClick={() => { setEditingTipId(tip.id); setEditingTipText(tip.text); }}
                                    className="text-[10px] font-bold text-[#0F1E36] hover:underline"
                                  >
                                    ✏️ Modifier
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteTip(tip.id)}
                                    className="text-[10px] font-bold text-red-500 hover:underline"
                                  >
                                    Supprimer
                                  </button>
                                </div>
                              </>
                            )}
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      )}

      {/* VIEWPORT 4: LIVE CALENDAR MANAGEMENT (FULL WIDTH FORM) */}
      {activeSubTab === "events" && (
        <motion.div
          key="events"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full border border-[#E5E7EB] rounded-3xl p-6 bg-white shadow-2xs text-xs space-y-6"
        >
          <div ref={liveFormRef} className="space-y-6">
            {/* Header row with Title and Calendar button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
              <div>
                <h3 className="font-extrabold text-[#0F1E36] text-base flex items-center gap-2">
                  <span>{editingEventId ? "✏️ Modifier la séance Live Zoom" : "Planifier une séance Live Zoom"}</span>
                  {editingEventId && (
                    <span className="px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-extrabold text-[10px] animate-pulse">
                      Mode Édition
                    </span>
                  )}
                </h3>
                <p className="text-xs text-gray-400 mt-0.5">
                  {editingEventId 
                    ? "Ajustez les paramètres de cette séance planifiée (date, heure, lien Zoom, enseignant, groupes)."
                    : "Organisez de nouveaux cours en visioconférence pour un niveau scolaire spécifique."}
                </p>
              </div>

              <button
                type="button"
                onClick={() => handleSubTabClick("calendar")}
                className="py-2.5 px-4 bg-[#0F1E36] hover:bg-[#1a2d4b] text-white font-bold text-xs rounded-xl cursor-pointer flex items-center gap-2 transition-all shadow-xs self-start sm:self-auto shrink-0"
              >
                <Calendar size={14} />
                <span>Consulter le Calendrier Complet →</span>
              </button>
            </div>
            
            <form onSubmit={handleAddEventSubmit} className="space-y-5 text-xs">
              
              {/* Row 1: Title & Instructor */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[11px]">Intitulé du Live</label>
                  <input 
                    type="text" 
                    placeholder="Ex : Correction de l'épreuve pratique Bac 2026"
                    required
                    value={newEvent.title}
                    onChange={(e) => setNewEvent({ ...newEvent, title: e.target.value })}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 focus:ring-1 focus:ring-emerald-500 outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[11px]">Enseignant / Professeur</label>
                  <input 
                    type="text" 
                    placeholder="Ex : M. Nabil Chaouch"
                    required
                    value={newEvent.instructor}
                    onChange={(e) => setNewEvent({ ...newEvent, instructor: e.target.value })}
                    className="w-full text-xs font-semibold p-2.5 rounded-xl border border-gray-200 focus:ring-1 focus:ring-emerald-500 outline-hidden bg-slate-50/50"
                  />
                </div>
              </div>

              {/* FRÉQUENCE & DATES DE LA SÉANCE (Session Unique vs Récurrence) */}
              <div className="space-y-3 p-4 bg-slate-50/80 border border-slate-200 rounded-2xl">
                <div className="flex items-center justify-between">
                  <label className="block font-extrabold text-[#0F1E36] uppercase text-[11px] tracking-wide">
                    FRÉQUENCE & DATES DE LA SÉANCE
                  </label>
                  <span className="text-[10px] font-extrabold px-2.5 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                    {newEvent.frequency_type === "recurring" ? "🔁 Récurrence / Plage" : "📅 Session unique"}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 max-w-md">
                  <button
                    type="button"
                    onClick={() => setNewEvent({ ...newEvent, frequency_type: "single" })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      newEvent.frequency_type !== "recurring"
                        ? "bg-[#0F1E36] text-white border-[#0F1E36] shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Calendar size={13} />
                    <span>Une seule fois</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewEvent({
                      ...newEvent,
                      frequency_type: "recurring",
                      date_debut: newEvent.date_debut || newEvent.date || new Date().toISOString().split("T")[0],
                      date_fin: newEvent.date_fin || newEvent.date || new Date(Date.now() + 14 * 86400000).toISOString().split("T")[0]
                    })}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border flex items-center justify-center gap-1.5 cursor-pointer ${
                      newEvent.frequency_type === "recurring"
                        ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                        : "bg-white text-slate-700 border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Repeat size={13} />
                    <span>Récurrence (Plage)</span>
                  </button>
                </div>

                {newEvent.frequency_type === "recurring" ? (
                  <div className="space-y-3 pt-2 border-t border-slate-200/80">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-600 uppercase text-[10px]">Date de début</label>
                        <input 
                          type="date" 
                          required
                          value={newEvent.date_debut || newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date_debut: e.target.value, date: e.target.value })}
                          className="w-full text-xs bg-white rounded-xl border border-gray-300 p-2.5 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-600 uppercase text-[10px]">Date de fin</label>
                        <input 
                          type="date" 
                          required
                          value={newEvent.date_fin || newEvent.date}
                          onChange={(e) => setNewEvent({ ...newEvent, date_fin: e.target.value })}
                          className="w-full text-xs bg-white rounded-xl border border-gray-300 p-2.5 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-600 uppercase text-[10px]">Répétition / Fréquence</label>
                        <select
                          value={newEvent.recurrence_pattern}
                          onChange={(e) => setNewEvent({ ...newEvent, recurrence_pattern: e.target.value as any })}
                          className="w-full text-xs bg-white rounded-xl border border-gray-300 p-2.5 focus:ring-1 focus:ring-indigo-500 outline-hidden font-medium text-slate-800"
                        >
                          <option value="weekly">📆 Hebdomadaire (Chaque semaine)</option>
                          <option value="daily">☀️ Tous les jours</option>
                          <option value="every_2_days">⏭️ Tous les 2 jours</option>
                          <option value="mon_wed_fri">📅 Lundi, Mercredi et Vendredi</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-600 uppercase text-[10px]">Heure du cours</label>
                        <input 
                          type="time" 
                          required
                          value={newEvent.time}
                          onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                          className="w-full text-xs bg-white rounded-xl border border-gray-300 p-2.5 focus:ring-1 focus:ring-indigo-500 outline-hidden"
                        />
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    <div className="space-y-1">
                      <label className="block font-bold text-gray-600 uppercase text-[10px]">Date de la séance</label>
                      <input 
                        type="date" 
                        required
                        value={newEvent.date}
                        onChange={(e) => setNewEvent({ ...newEvent, date: e.target.value, date_debut: e.target.value, date_fin: e.target.value })}
                        className="w-full text-xs bg-white rounded-xl border border-gray-300 p-2.5 outline-hidden"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="block font-bold text-gray-600 uppercase text-[10px]">Heure de début</label>
                      <input 
                        type="time" 
                        required
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full text-xs bg-white rounded-xl border border-gray-300 p-2.5 outline-hidden"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Row 2: Duration & Event Type */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[11px]">Durée (Minutes)</label>
                  <input 
                    type="number" 
                    value={newEvent.durationMinutes}
                    onChange={(e) => setNewEvent({ ...newEvent, durationMinutes: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[11px]">Type Séance / Événement</label>
                  <select 
                    value={newEvent.type}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      const mappedEvtType = val === "homework" ? "homework" : (val === "exam" ? "exam" : (val === "event" ? "event" : "live_session"));
                      setNewEvent({ ...newEvent, type: val, event_type: mappedEvtType });
                    }}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
                  >
                    <option value="live">🎥 Live Zoom / Visio-conférence</option>
                    <option value="homework">📝 Devoir & Exercice à rendre</option>
                    <option value="exam">🏆 Session d'Examen blanc</option>
                    <option value="event">📍 Séance Présentielle au Centre</option>
                  </select>
                </div>
              </div>

              {/* Row 3: Zoom / Meeting link */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[11px]">Lien de la visioconférence (Zoom, Meet, Maps)</label>
                <input 
                  type="text" 
                  placeholder="https://zoom.us/j/..."
                  value={newEvent.zoomLink}
                  onChange={(e) => setNewEvent({ ...newEvent, zoomLink: e.target.value })}
                  className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
                />
              </div>

              {/* Row 4: Class & Section */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[11px]">Classe visée</label>
                  <select 
                    value={newEvent.grade}
                    onChange={(e) => setNewEvent({ ...newEvent, grade: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
                  >
                    <option value="Tous">Tous les lycéens</option>
                    {GRADES_OPTIONS.map((g) => (
                      <option key={g} value={g}>{g}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-600 uppercase text-[11px]">Spécialité / Option</label>
                  <select 
                    value={newEvent.section}
                    onChange={(e) => setNewEvent({ ...newEvent, section: e.target.value })}
                    className="w-full text-xs p-2.5 rounded-xl border border-gray-200"
                  >
                    <option value="Tous">Toutes les sections</option>
                    {SECTIONS_OPTIONS.map((s) => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* GROUPES CIBLÉS / DESTINATAIRES (Checklist A à Z) */}
              <div className="space-y-2.5 pt-3 border-t border-gray-200">
                <div className="flex items-center justify-between gap-2">
                  <label className="block font-extrabold text-[#0F1E36] uppercase text-[11px] tracking-wide">
                    GROUPES CIBLÉS / DESTINATAIRES
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const isAllActive = newEvent.targetGroups.includes("ALL") || newEvent.targetGroups.length === 26;
                      if (isAllActive) {
                        setNewEvent({ ...newEvent, targetGroups: [] });
                      } else {
                        setNewEvent({ ...newEvent, targetGroups: ["ALL"] });
                      }
                    }}
                    className={`text-[10px] font-bold px-2.5 py-1 rounded-lg border transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                      newEvent.targetGroups.includes("ALL") || newEvent.targetGroups.length === 26
                        ? "bg-[#0F1E36] text-white border-[#0F1E36] shadow-2xs"
                        : "bg-gray-50 text-gray-700 border-gray-300 hover:bg-gray-100"
                    }`}
                  >
                    <Check size={11} className={newEvent.targetGroups.includes("ALL") || newEvent.targetGroups.length === 26 ? "opacity-100" : "opacity-0"} />
                    <span>Tous les groupes</span>
                  </button>
                </div>

                <p className="text-[11px] text-gray-500">
                  Cochez les groupes d'étude autorisés à visualiser ce Live.
                </p>

                {/* Checklist grid of Groups A to Z */}
                <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-9 gap-1.5 p-3 bg-slate-50 border border-slate-200 rounded-2xl">
                  {STUDY_GROUPS.map((letter) => {
                    const isAll = newEvent.targetGroups.includes("ALL");
                    const isSelected = isAll || newEvent.targetGroups.includes(letter);

                    return (
                      <button
                        key={letter}
                        type="button"
                        onClick={() => {
                          let current = isAll ? [...STUDY_GROUPS] : [...newEvent.targetGroups];
                          if (current.includes(letter)) {
                            current = current.filter((g) => g !== letter);
                          } else {
                            current.push(letter);
                          }
                          if (current.length === 26) {
                            setNewEvent({ ...newEvent, targetGroups: ["ALL"] });
                          } else {
                            setNewEvent({ ...newEvent, targetGroups: current });
                          }
                        }}
                        className={`flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl text-[10px] font-bold transition-all border cursor-pointer select-none ${
                          isSelected
                            ? "bg-emerald-600 text-white border-emerald-600 shadow-2xs"
                            : "bg-white text-gray-700 border-gray-200 hover:border-emerald-400 hover:bg-emerald-50/40"
                        }`}
                      >
                        {isSelected && <Check size={10} className="stroke-[3] shrink-0" />}
                        <span>Gr. {letter}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Badges Summary */}
                <div className="flex flex-wrap gap-1.5 text-[10px] items-center pt-1">
                  <span className="text-gray-400 font-bold uppercase text-[9px]">Badges actifs :</span>
                  {newEvent.targetGroups.includes("ALL") || newEvent.targetGroups.length === 26 ? (
                    <span className="bg-blue-50 text-blue-700 font-bold px-2.5 py-0.5 rounded-full border border-blue-200">
                      🌐 Tous les groupes (A à Z)
                    </span>
                  ) : newEvent.targetGroups.length === 0 ? (
                    <span className="bg-rose-50 text-rose-600 font-bold px-2.5 py-0.5 rounded-full border border-rose-200">
                      ⚠️ Aucun groupe (Inaccessible)
                    </span>
                  ) : (
                    newEvent.targetGroups.map((g) => (
                      <span key={g} className="bg-emerald-50 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                        <Check size={10} className="text-emerald-600" />
                        <span>Groupe {g}</span>
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Instructions / Notes */}
              <div className="space-y-1">
                <label className="block font-bold text-gray-600 uppercase text-[11px]">Notes aux stagiaires / Consignes</label>
                <textarea 
                  rows={2}
                  placeholder="Matériels requis, fiches à imprimer..."
                  value={newEvent.description}
                  onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                  className="w-full text-xs bg-white rounded-xl border border-gray-200 p-2.5 focus:ring-0 outline-hidden"
                />
              </div>

              {/* Automatic notification info badge */}
              <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-2xl flex items-center gap-2.5 text-emerald-900">
                <Bell size={15} className="text-emerald-600 shrink-0" />
                <span className="text-xs font-semibold">
                  <strong>Notification automatique active :</strong> Les étudiants visés recevront une notification en temps réel sur leur espace dès la publication de ce cours.
                </span>
              </div>

              {/* Action buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-2">
                <button 
                  type="submit"
                  disabled={isSubmittingLive}
                  className={`flex-1 py-3 px-6 font-black rounded-xl uppercase tracking-wider cursor-pointer text-center text-xs transition-all shadow-md ${
                    isSubmittingLive
                      ? "opacity-50 cursor-not-allowed bg-slate-400 text-white"
                      : editingEventId
                      ? "bg-blue-600 hover:bg-blue-700 text-white"
                      : "bg-[#10B981] hover:bg-[#0da673] text-white"
                  }`}
                >
                  {isSubmittingLive
                    ? "PUBLICATION EN COURS..."
                    : editingEventId
                    ? "💾 ENREGISTRER LES MODIFICATIONS"
                    : "PUBLIER SÉANCE AU CALENDRIER"}
                </button>
                {editingEventId && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingEventId(null);
                      setNewEvent({ title: "", instructor: "M. Nabil Chaouch", date: "", time: "", durationMinutes: "90", zoomLink: "", grade: "Tous", section: "Tous", targetGroups: ["ALL"], type: "live", event_type: "live_session", description: "", notify_students: true, notification_timing: "30min", custom_notification_time: "", frequency_type: "single", date_debut: "", date_fin: "", recurrence_pattern: "weekly" });
                    }}
                    className="px-5 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-300 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                  >
                    Annuler la modification
                  </button>
                )}
              </div>

            </form>
          </div>
        </motion.div>
      )}

      {/* VIEWPORT 4.5: INTEGRATED STUDENT CALENDAR PREVIEW */}
      {activeSubTab === "calendar" && (
        <motion.div
          key="calendar"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="border border-[#E5E7EB] rounded-2xl p-6 bg-white shadow-xs"
        >
          <CalendrierView isPremiumUser={true} />
        </motion.div>
      )}

      {/* VIEWPORT 4.6: STUDENT TO-DO EVENTS & FILE UPLOADS MANAGEMENT */}
      {activeSubTab === "todo-events" && (
        <motion.div
          key="todo-events"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Create Todo Event Form */}
          <div className="lg:col-span-1 border border-[#E5E7EB] rounded-2xl p-5 space-y-4 bg-white shadow-xs text-xs">
            <div className="flex items-center gap-2 border-b border-gray-150 pb-3">
              <div className="p-2 bg-pink-50 text-pink-600 rounded-lg">
                <ListTodo size={18} />
              </div>
              <div>
                <h3 className="font-semibold text-[#0F1E36] text-sm">Nouveau Devoir (To-Do)</h3>
                <p className="text-[11px] text-gray-400">Créez des tâches et exercices avec fichiers joints.</p>
              </div>
            </div>

            <form onSubmit={handleCreateTodoSubmit} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Intitulé du devoir / exercice *</label>
                <input 
                  type="text" 
                  placeholder="Ex : Série d'exercices sur la récursion"
                  required
                  value={newTodo.name}
                  onChange={(e) => setNewTodo({ ...newTodo, name: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Date d'assignation *</label>
                  <input 
                    type="date" 
                    required
                    value={newTodo.date}
                    onChange={(e) => setNewTodo({ ...newTodo, date: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>

                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase tracking-wider">Heure de début *</label>
                  <input 
                    type="time" 
                    required
                    value={newTodo.hour}
                    onChange={(e) => setNewTodo({ ...newTodo, hour: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Date d'échéance (Due Date) *</label>
                <input 
                  type="date" 
                  required
                  value={newTodo.dueDate}
                  onChange={(e) => setNewTodo({ ...newTodo, dueDate: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Filtre par classe</label>
                <select
                  value={newTodo.targetClass}
                  onChange={(e) => setNewTodo({ ...newTodo, targetClass: e.target.value })}
                  className="w-full text-xs"
                >
                  <option value="Tous">Toutes les classes</option>
                  {GRADES_OPTIONS.map((g) => (
                    <option key={g} value={g}>{g}</option>
                  ))}
                </select>
              </div>

              <AccessTierSelector
                selectedTiers={newTodo.allowedTiers}
                onChange={(updatedTiers) => setNewTodo({ ...newTodo, allowedTiers: updatedTiers, isPremium: !updatedTiers.includes('FREEMIUM') })}
                label="Audiences autorisées pour ce devoir"
              />

              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Rappel / Notification</label>
                <input 
                  type="text" 
                  placeholder="Ex : Alerte J-1 avant l'échéance"
                  value={newTodo.reminder}
                  onChange={(e) => setNewTodo({ ...newTodo, reminder: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Consignes / Notes additionnelles</label>
                <textarea 
                  placeholder="Notes facultatives pour guider les élèves..."
                  rows={3}
                  value={newTodo.notes}
                  onChange={(e) => setNewTodo({ ...newTodo, notes: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-300 rounded-lg focus:ring-1 focus:ring-blue-500"
                />
              </div>

              {/* Attaching file zone (pdf, png, jpg) */}
              <div className="space-y-2">
                <label className="block font-bold text-gray-500 uppercase tracking-wider">Fichier Joint (PDF, PNG, JPG)</label>
                
                {!newTodo.pdfName ? (
                  <div className="border border-dashed border-gray-300 rounded-xl p-4 text-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer relative">
                    <input 
                      type="file" 
                      accept=".pdf,.png,.jpg,.jpeg"
                      onChange={handleTodoFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="mx-auto text-gray-400 mb-2" size={18} />
                    <span className="block font-medium text-gray-700 text-[11px]">Cliquez ou glissez un fichier</span>
                    <span className="block text-[10px] text-gray-400 mt-1">PDF, PNG, JPG (max 5 Mo)</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-between border border-emerald-200 bg-emerald-50 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <Paperclip size={14} className="text-emerald-600 shrink-0" />
                      <span className="font-semibold text-emerald-800 truncate text-[11px]">{newTodo.pdfName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => setNewTodo({ ...newTodo, pdfContent: "", pdfName: "" })}
                      className="p-1 text-emerald-700 hover:bg-emerald-100 rounded-full transition-colors cursor-pointer shrink-0"
                    >
                      <X size={14} />
                    </button>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={isSubmittingTodo}
                className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer text-white ${
                  isSubmittingTodo 
                    ? "bg-gray-400 cursor-not-allowed" 
                    : "bg-pink-600 hover:bg-pink-700 active:scale-95"
                }`}
              >
                <PlusCircle size={14} />
                <span>{isSubmittingTodo ? "Enregistrement..." : "Créer le Devoir (To-Do)"}</span>
              </button>
            </form>
          </div>

          {/* Todo Events List (col-span-2) */}
          <div className="lg:col-span-2 border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs space-y-4 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-150 pb-3">
              <div>
                <h3 className="font-semibold text-[#0F1E36] text-sm">Liste des devoirs & exercices planifiés</h3>
                <p className="text-[11px] text-gray-400">Visualisez et supprimez les devoirs assignés aux élèves.</p>
              </div>

              {/* Search input */}
              <div className="relative w-full sm:w-64">
                <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Rechercher un devoir..."
                  value={todoSearch}
                  onChange={(e) => setTodoSearch(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-xs"
                />
              </div>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              {todoEvents.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <ListTodo size={32} className="mx-auto text-gray-300 mb-2" />
                  <p className="font-medium">Aucun devoir programmé pour le moment.</p>
                  <p className="text-[10px] text-gray-400">Utilisez le formulaire de gauche pour en créer un.</p>
                </div>
              ) : (
                (() => {
                  const filteredTodos = todoEvents.filter(t => 
                    t.name?.toLowerCase().includes(todoSearch.toLowerCase()) || 
                    t.notes?.toLowerCase().includes(todoSearch.toLowerCase()) ||
                    t.targetClass?.toLowerCase().includes(todoSearch.toLowerCase())
                  );

                  if (filteredTodos.length === 0) {
                    return (
                      <div className="text-center py-8 text-gray-400">
                        <p className="font-medium">Aucun résultat pour cette recherche.</p>
                      </div>
                    );
                  }

                  return filteredTodos.map((todo) => (
                    <div 
                      key={todo.id} 
                      className="border border-gray-200 hover:border-pink-200 p-4 rounded-xl bg-white hover:shadow-xs transition-all duration-200 flex flex-col md:flex-row md:items-center justify-between gap-4"
                    >
                      <div className="space-y-2 overflow-hidden flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-bold text-gray-800 text-sm">{todo.name}</span>
                          
                          {/* Grade Badge */}
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-50 text-pink-700 border border-pink-100">
                            {todo.targetClass || "Toutes les classes"}
                          </span>

                          {/* Premium Access Badge */}
                          {todo.isPremium ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 flex items-center gap-1">
                              <Award size={10} className="shrink-0" />
                              <span>Premium</span>
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-gray-100 text-gray-600 border border-gray-200">
                              Gratuit
                            </span>
                          )}
                        </div>

                        {/* Event Details Row */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-y-1 gap-x-4 text-[11px] text-gray-500">
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-gray-400 shrink-0" />
                            <span>Assigné : {todo.date}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock size={12} className="text-gray-400 shrink-0" />
                            <span>Heure : {todo.hour}</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar size={12} className="text-pink-500 shrink-0" />
                            <span className="font-medium text-pink-600">Échéance : {todo.dueDate}</span>
                          </div>
                        </div>

                        {/* Reminder & Notes */}
                        {todo.reminder && (
                          <div className="bg-amber-50/50 border border-amber-100 p-2 rounded-lg text-[11px] text-amber-800 flex items-start gap-1">
                            <Clock size={12} className="text-amber-600 shrink-0 mt-0.5" />
                            <span><strong>Rappel :</strong> {todo.reminder}</span>
                          </div>
                        )}

                        {todo.notes && (
                          <p className="text-gray-600 text-[11px] bg-gray-50 p-2.5 rounded-lg border border-gray-100 italic">
                            {todo.notes}
                          </p>
                        )}

                        {/* File Link */}
                        {todo.pdfUrl && (
                          <div className="pt-1">
                            <a 
                              href={todo.pdfUrl} 
                              target="_blank" 
                              rel="noreferrer"
                              className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-pink-600 hover:text-pink-700 bg-pink-50 hover:bg-pink-100 border border-pink-100 px-3 py-1.5 rounded-lg cursor-pointer transition-colors"
                            >
                              <Download size={12} className="shrink-0" />
                              <span>Télécharger {todo.pdfName || "le fichier joint"}</span>
                            </a>
                          </div>
                        )}
                      </div>

                      {/* Delete actions */}
                      <div className="flex items-center gap-2 self-end md:self-auto border-t md:border-t-0 pt-2 md:pt-0 shrink-0">
                        <button 
                          onClick={() => handleDeleteTodo(todo.id)}
                          className="p-2 text-[#EF4444] hover:bg-red-50 hover:text-red-700 border border-red-100 rounded-xl cursor-pointer transition-all flex items-center gap-1 font-semibold text-[11px] bg-white shadow-2xs"
                          title="Supprimer ce devoir"
                        >
                          <Trash2 size={13} />
                          <span>Supprimer</span>
                        </button>
                      </div>
                    </div>
                  ));
                })()
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* VIEWPORT 5: SHOP & BOOK PRODUCTS INITIATION */}
      {activeSubTab === "shop" && (
        <motion.div
          key="shop"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          
          {/* Add product form */}
          <div className="lg:col-span-1 border border-[#E5E7EB] rounded-2xl p-5 space-y-4 bg-white shadow-xs text-xs">
            <h3 className="font-semibold text-[#0F1E36] text-sm">Ajouter un produit ou pack d'abonnement</h3>
            <p className="text-[11px] text-gray-400">Présentez une nouvelle offre commerciale aux lycéens.</p>
            
            <form onSubmit={handleAddProduct} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase">Intitulé de l'offre</label>
                <input 
                  type="text" 
                  placeholder="Ex : Fiches de cours Trimestre 2"
                  required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  className="w-full text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase">Tarif Promo / Actuel (DT) *</label>
                  <input 
                    type="number" 
                    placeholder="Ex : 45"
                    required
                    value={newProduct.price}
                    onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block font-bold text-gray-500 uppercase">Prix d'origine barré (DT)</label>
                  <input 
                    type="number" 
                    placeholder="Ex : 60 (optionnel)"
                    value={newProduct.oldPrice || ""}
                    onChange={(e) => setNewProduct({ ...newProduct, oldPrice: e.target.value })}
                    className="w-full text-xs"
                  />
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newProduct.showPromoBadge}
                      onChange={(e) => setNewProduct({ ...newProduct, showPromoBadge: e.target.checked })}
                      className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4"
                    />
                    <span>Afficher le badge de promotion sur la carte</span>
                  </label>
                  <span className="text-[10px] bg-amber-100 text-amber-800 px-2 py-0.5 rounded font-extrabold uppercase">Marketing</span>
                </div>

                {newProduct.showPromoBadge && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-600 uppercase">Type de badge</label>
                      <select
                        value={newProduct.promoBadgeType}
                        onChange={(e) => setNewProduct({ ...newProduct, promoBadgeType: e.target.value as "auto" | "custom" })}
                        className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 font-semibold"
                      >
                        <option value="auto">⚡ Calcul auto (ex: -20%)</option>
                        <option value="custom">✍️ Badge personnalisé (ex: SOLDE)</option>
                      </select>
                    </div>
                    {newProduct.promoBadgeType === "custom" && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-600 uppercase">Libellé du badge</label>
                        <input
                          type="text"
                          placeholder="Ex: PROMO ÉTÉ, OFFRE LIMITÉE..."
                          value={newProduct.promoBadge || ""}
                          onChange={(e) => setNewProduct({ ...newProduct, promoBadge: e.target.value })}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 font-semibold"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase">Catégorie</label>
                <select 
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value as any })}
                  className="w-full text-xs"
                >
                  <option value="Full Access">Abonnement Annuel / Full Access</option>
                  <option value="Pack PDF">Matériels PDF téléchargeables</option>
                  <option value="Cours Video">Cours Vidéo exclusifs</option>
                  <option value="Hardware">Hardware / Équipement pratique</option>
                </select>
              </div>

              <ImagePickerInput
                label="Visuel du produit / Pack"
                value={newProduct.image}
                onChange={(val) => setNewProduct({ ...newProduct, image: val })}
                placeholder="https://images.unsplash.com/photo-..."
                quickTemplates={[
                  { name: "Gold Premium", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
                  { name: "Scolaire PDF", url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80" },
                  { name: "Classes Vidéo", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80" }
                ]}
              />

              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase">Description de l'offre</label>
                <textarea 
                  rows={3}
                  placeholder="Détails du pack d'étude..."
                  value={newProduct.description}
                  onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
                  className="w-full text-xs bg-white rounded-lg border border-[#E5E7EB] p-2 focus:ring-0 outline-hidden"
                />
              </div>

              <button 
                type="submit"
                className="w-full py-2 bg-[#10B981] hover:bg-[#0da673] text-white font-bold rounded-lg uppercase tracking-wider cursor-pointer text-center"
              >
                Ajouter produit
              </button>
            </form>
          </div>

          {/* List of current catalog */}
          <div className="lg:col-span-2 border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs space-y-4">
            <h3 className="font-semibold text-[#0F1E36] text-sm">Produits figurant en boutique</h3>
            <p className="text-[11px] text-gray-400">La grille tarifaire affichée dans le rayon des achats scolaires de l'élève.</p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[500px] overflow-y-auto pr-1">
              {products.map((p) => {
                const badgeLabel = getPromoBadgeLabel(p);
                return (
                  <div key={p.id} className="p-3 border border-[#E5E7EB] rounded-xl bg-[#F9FAFB] flex flex-col justify-between hover:border-[#10B981] transition-all text-xs relative">
                    {badgeLabel && (
                      <span className="absolute top-2.5 left-2.5 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs z-10">
                        {badgeLabel}
                      </span>
                    )}
                    <div className="space-y-2">
                      <img src={p.image} alt={p.title} className="w-full h-24 object-cover rounded-lg border border-gray-100" />
                      <div className="text-left">
                        <div className="flex justify-between items-center text-[9px] font-bold text-gray-400 uppercase">
                          <span>{p.category}</span>
                          <div className="flex items-center gap-1.5">
                            {p.oldPrice && p.oldPrice > p.price && (
                              <span className="line-through text-gray-400 font-normal">{p.oldPrice} TND</span>
                            )}
                            <span className="text-[#10B981] font-extrabold">{p.price} TND</span>
                          </div>
                        </div>
                        <h4 className="font-semibold text-gray-900 mt-1">{p.title}</h4>
                        <p className="text-[10px] text-gray-500 mt-0.5 line-clamp-2">{p.description}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => handleDeleteProduct(p.id)}
                      className="w-full mt-3 py-1.5 bg-red-50 text-red-650 hover:bg-red-100 rounded-lg font-semibold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-red-100"
                    >
                      <Trash2 size={12} />
                      <span>Retirer</span>
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </motion.div>
      )}

      {/* VIEWPORT 6: AGENT MANAGEMENT PANEL */}
      {activeSubTab === "agents" && (
        <motion.div
          key="agents"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          
          {/* Create or Edit form */}
          <div className="border border-[#E5E7EB] rounded-2xl p-6 bg-white shadow-xs h-fit space-y-4">
            <h3 className="font-extrabold text-[#0F1E36] text-sm flex items-center gap-1.5 border-b border-[#E5E7EB] pb-3">
              <ShieldCheck className="text-[#10B981]" size={16} />
              <span>{editingAgent ? "Modifier l'Agent" : "Nouveau Compte Agent"}</span>
            </h3>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (editingAgent) {
                  // Update existing agent
                  fetch(`/api/admin/agents/${editingAgent.id}`, {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newAgent)
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error("Erreur");
                      return res.json();
                    })
                    .then(() => {
                      showFeedback("Compte Agent mis à jour !");
                      setNewAgent({ fullName: "", email: "", password: "", city: "", highSchool: "", address: "", agentType: "assistant" });
                      setEditingAgent(null);
                      refreshData();
                    })
                    .catch(() => showFeedback("Erreur lors de la mise à jour", "error"));
                } else {
                  // Create new agent
                  fetch("/api/admin/agents", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(newAgent)
                  })
                    .then((res) => {
                      if (!res.ok) throw new Error("Erreur");
                      return res.json();
                    })
                    .then(() => {
                      showFeedback("Agent créé avec succès et activé !");
                      setNewAgent({ fullName: "", email: "", password: "", city: "", highSchool: "", address: "", agentType: "assistant" });
                      refreshData();
                    })
                    .catch(() => showFeedback("Erreur lors de la création de l'agent", "error"));
                }
              }}
              className="space-y-4 text-xs text-left"
            >
              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase">Nom Complet</label>
                <input 
                  type="text"
                  required
                  placeholder="Ex: Ahmed Ben Salem"
                  value={newAgent.fullName}
                  onChange={(e) => setNewAgent({ ...newAgent, fullName: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-400 uppercase">Adresse mail / Login</label>
                <input 
                  type="email"
                  required
                  placeholder="Ex: ahmed@azed.info"
                  value={newAgent.email}
                  disabled={editingAgent !== null}
                  onChange={(e) => setNewAgent({ ...newAgent, email: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-hidden disabled:bg-slate-50 disabled:text-gray-450 focus:border-[#0F1E36] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-550 uppercase">Mot de Passe</label>
                <input 
                  type="text"
                  required
                  placeholder="Min 6 caractères recommandé"
                  value={newAgent.password}
                  onChange={(e) => setNewAgent({ ...newAgent, password: e.target.value })}
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-hidden font-mono focus:border-[#0F1E36] transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="block font-bold text-gray-500 uppercase">Catégorie / Rôle d'Agent</label>
                <select
                  value={newAgent.agentType || "assistant"}
                  onChange={(e) => setNewAgent({ ...newAgent, agentType: e.target.value as "assistant" | "professeur" })}
                  className="w-full text-xs p-2 border border-gray-200 rounded-lg outline-hidden bg-white focus:border-[#0F1E36] transition-colors font-bold text-gray-700"
                >
                  <option value="assistant">Assistant (10% commission)</option>
                  <option value="professeur">Professeur (20% commission)</option>
                </select>
              </div>

              <div className="pt-2 flex gap-1.5">
                <button 
                  type="submit"
                  className="flex-1 py-2 bg-[#10B981] hover:bg-[#0da673] text-white font-bold rounded-lg uppercase tracking-wider cursor-pointer text-center text-[10px]"
                >
                  {editingAgent ? "Enregistrer" : "Créer l'Agent"}
                </button>
                {editingAgent && (
                  <button 
                    type="button"
                    onClick={() => {
                      setEditingAgent(null);
                      setNewAgent({ fullName: "", email: "", password: "", city: "", highSchool: "", address: "", agentType: "assistant" });
                    }}
                    className="px-3 py-2 bg-gray-150 hover:bg-gray-250 text-gray-700 font-bold rounded-lg cursor-pointer text-center text-[10px]"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </form>
          </div>

          {/* List of Agents */}
          <div className="lg:col-span-2 border border-[#E5E7EB] rounded-2xl p-6 bg-white shadow-xs space-y-4 text-left">
            <div>
              <h3 className="font-extrabold text-[#0F1E36] text-sm">Registre des Agents de Direction</h3>
              <p className="text-[11px] text-gray-400 mt-0.5">Ces agents disposent d'un accès séparé limité à la page de validation des reçus étudiants et des paniers.</p>
            </div>

            <div className="overflow-x-auto border border-slate-200/80 rounded-xl bg-white shadow-2xs">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                    <th className="p-3.5 pl-4">Agent & Contact</th>
                    <th className="p-3.5">Catégorie / Taux</th>
                    <th className="p-3.5">Suivi des Commissions & Solde</th>
                    <th className="p-3.5 text-right pr-4">Actions & Payouts</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-150">
                  {users.filter(u => u.role === "agent").length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-slate-400 italic font-medium">
                        Aucun agent de direction enregistré actuellement. Utilisez le formulaire de gauche pour en créer un.
                      </td>
                    </tr>
                  ) : (
                    users.filter(u => u.role === "agent").map((ag) => {
                      const agentComms = commissions.filter(c => c.agentId === ag.id);
                      const totalEarned = agentComms.reduce((sum, c) => sum + c.earnedCommission, 0);
                      const inscrCount = agentComms.length;

                      const agentWithdrawals = withdrawals.filter(w => w.agentId === ag.id);
                      const approvedWithdrawals = agentWithdrawals
                        .filter(w => w.status === "approved")
                        .reduce((sum, w) => sum + w.amount, 0);
                      const pendingWithdrawals = agentWithdrawals
                        .filter(w => w.status === "pending")
                        .reduce((sum, w) => sum + w.amount, 0);

                      const totalDeducted = approvedWithdrawals + pendingWithdrawals;
                      const remainingCommission = Math.max(0, totalEarned - totalDeducted);
                      const isPasswordVisible = visibleAgentPasswords[ag.id] || false;

                      return (
                        <tr key={ag.id} className="hover:bg-slate-50/70 transition-colors">
                          {/* 1. AGENT & CONTACT */}
                          <td className="p-3.5 pl-4 align-top">
                            <div className="flex items-start gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-100 text-[#0F1E36] flex items-center justify-center font-black text-xs shrink-0 uppercase border border-slate-200 mt-0.5 shadow-2xs">
                                {ag.fullName.charAt(0)}
                              </div>
                              <div className="space-y-1">
                                <span className="font-extrabold text-[#0F1E36] text-xs block">{ag.fullName}</span>
                                <span className="text-[11px] text-slate-500 font-mono block">{ag.email}</span>
                                
                                {/* Password reveal toggle */}
                                <div className="flex items-center gap-1.5 text-[10px] text-slate-500 pt-1">
                                  <span className="font-semibold text-slate-400">🔑 Mot de passe :</span>
                                  <span className="font-mono font-bold text-slate-700 bg-slate-100 border border-slate-200/60 px-1.5 py-0.5 rounded text-[10px] tracking-wider">
                                    {isPasswordVisible ? (ag.password || "N/A") : "••••••••"}
                                  </span>
                                  <button
                                    type="button"
                                    onClick={() => setVisibleAgentPasswords(prev => ({ ...prev, [ag.id]: !prev[ag.id] }))}
                                    className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded transition-colors cursor-pointer"
                                    title={isPasswordVisible ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                                  >
                                    {isPasswordVisible ? <EyeOff size={13} /> : <Eye size={13} />}
                                  </button>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* 2. CATEGORIE / TAUX */}
                          <td className="p-3.5 align-top">
                            <div className="space-y-1">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-extrabold rounded-lg border uppercase tracking-wider ${
                                ag.agentType === "professeur"
                                  ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                                  : "bg-indigo-50 text-indigo-800 border-indigo-200"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${ag.agentType === "professeur" ? "bg-emerald-500" : "bg-indigo-500"}`}></span>
                                {ag.agentType === "professeur" ? "Professeur (20%)" : "Assistant (10%)"}
                              </span>
                              <p className="text-[10px] text-slate-400 font-medium">Commission auto</p>
                            </div>
                          </td>

                          {/* 3. SUIVI DES COMMISSIONS (Structured KPI Cards) */}
                          <td className="p-3.5 align-top">
                            <div className="space-y-2.5">
                              {/* Mini KPI Cards Grid */}
                              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                                {/* Accumulé */}
                                <div className="p-2 rounded-xl bg-slate-50 border border-slate-200/80 space-y-0.5">
                                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Accumulé</span>
                                  <span className="text-xs font-black text-slate-800 font-mono block">
                                    {totalEarned.toFixed(2)} <span className="text-[9px] font-bold text-slate-400">DT</span>
                                  </span>
                                </div>

                                {/* Avances Déduites */}
                                <div className={`p-2 rounded-xl border space-y-0.5 ${
                                  totalDeducted > 0 
                                    ? "bg-rose-50/70 border-rose-200/80 text-rose-900" 
                                    : "bg-slate-50/60 border-slate-200/60 text-slate-400"
                                }`}>
                                  <span className="text-[9px] font-bold uppercase tracking-wider block opacity-75">Avances Déduites</span>
                                  <span className={`text-xs font-black font-mono block ${totalDeducted > 0 ? "text-rose-700" : "text-slate-400"}`}>
                                    {totalDeducted.toFixed(2)} <span className="text-[9px] font-bold opacity-60">DT</span>
                                  </span>
                                </div>

                                {/* Solde Disponible (Highlighted KPI) */}
                                <div className="p-2 rounded-xl bg-emerald-50/90 border border-emerald-200/90 space-y-0.5 shadow-2xs">
                                  <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">Solde Disponible</span>
                                  <span className="text-xs font-black text-emerald-700 font-mono block">
                                    {remainingCommission.toFixed(2)} <span className="text-[9px] font-bold text-emerald-800">DT</span>
                                  </span>
                                </div>
                              </div>

                              {/* Secondary details */}
                              <div className="flex flex-wrap items-center justify-between gap-2 text-[10px] pt-1.5 border-t border-slate-100">
                                <div className="flex items-center gap-3">
                                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                                    En attente : <strong className="text-amber-700 font-mono font-bold">{pendingWithdrawals.toFixed(2)} DT</strong>
                                  </span>
                                  <span className="flex items-center gap-1 font-semibold text-slate-600">
                                    <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                                    Déjà réglé : <strong className="text-blue-700 font-mono font-bold">{approvedWithdrawals.toFixed(2)} DT</strong>
                                  </span>
                                </div>
                                <span className="text-slate-500 font-semibold bg-slate-100 border border-slate-200/60 px-2 py-0.5 rounded-md text-[9.5px]">
                                  {inscrCount} inscription(s)
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* 4. ACTIONS & PAYOUTS */}
                          <td className="p-3.5 pr-4 align-top text-right">
                            <div className="flex justify-end items-center gap-1.5 flex-wrap">
                              {/* Pay action */}
                              {pendingWithdrawals > 0 ? (
                                <>
                                  <button
                                    onClick={() => {
                                      fetch("/api/admin/commissions/pay", {
                                        method: "POST",
                                        headers: { "Content-Type": "application/json" },
                                        body: JSON.stringify({ agentId: ag.id })
                                      })
                                        .then(res => {
                                          if (!res.ok) throw new Error("Erreur");
                                          return res.json();
                                        })
                                        .then((data) => {
                                          showFeedback(data.msg || `Commissions de ${ag.fullName} réglées avec succès !`);
                                          refreshData();
                                        })
                                        .catch(() => showFeedback("Erreur lors du règlement", "error"));
                                    }}
                                    className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold cursor-pointer transition-colors shadow-2xs flex items-center gap-1"
                                    title="Payer et valider toutes les demandes en attente de cet agent"
                                  >
                                    <Coins size={12} />
                                    <span>Payer tout ({pendingWithdrawals.toFixed(2)} DT)</span>
                                  </button>

                                  <button
                                    onClick={() => setSelectedAgentForWithdrawals(ag)}
                                    className="px-2 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                                    title="Examiner les demandes de retrait individuelles"
                                  >
                                    <Eye size={12} />
                                    <span>Détails</span>
                                  </button>
                                </>
                              ) : (
                                <button
                                  onClick={() => setSelectedAgentForWithdrawals(ag)}
                                  className="px-2 py-1 bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200 rounded-lg text-[10px] font-medium cursor-pointer transition-colors flex items-center gap-1"
                                  title="Consulter l'historique des retraits de cet agent"
                                >
                                  <Eye size={12} />
                                  <span>Détails</span>
                                </button>
                              )}

                              {/* Reset action */}
                              {totalEarned > 0 && (
                                <button
                                  onClick={() => {
                                    askConfirmation(
                                      "Réinitialiser les commissions",
                                      `Voulez-vous vraiment réinitialiser et vider tout l'historique des commissions de l'agent "${ag.fullName}" ? Cette action est irréversible.`,
                                      () => {
                                        fetch("/api/admin/commissions/reset", {
                                          method: "POST",
                                          headers: { "Content-Type": "application/json" },
                                          body: JSON.stringify({ agentId: ag.id })
                                        })
                                          .then(res => {
                                            if (!res.ok) throw new Error("Erreur");
                                            return res.json();
                                          })
                                          .then(() => {
                                            showFeedback(`Commissions de ${ag.fullName} réinitialisées.`);
                                            refreshData();
                                          })
                                          .catch(() => showFeedback("Erreur lors de la réinitialisation", "error"));
                                      }
                                    );
                                  }}
                                  className="px-2.5 py-1.5 bg-amber-50 hover:bg-amber-100 text-amber-700 border border-amber-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1"
                                  title="Réinitialiser l'historique des gains de cet agent"
                                >
                                  <RefreshCw size={12} />
                                  <span>Reset</span>
                                </button>
                              )}

                              {/* Edit action */}
                              <button
                                onClick={() => {
                                  setEditingAgent(ag);
                                  setNewAgent({
                                    fullName: ag.fullName,
                                    email: ag.email,
                                    password: ag.password || "student123",
                                    city: ag.city || "",
                                    highSchool: ag.highSchool || "",
                                    address: ag.address || "",
                                    agentType: ag.agentType || "assistant"
                                  });
                                }}
                                className="px-2.5 py-1.5 bg-white hover:bg-slate-100 text-slate-700 border border-slate-200 rounded-lg text-[10px] font-bold cursor-pointer transition-colors flex items-center gap-1 shadow-2xs"
                                title="Modifier les détails de cet agent"
                              >
                                <Edit size={12} />
                                <span>Modifier</span>
                              </button>

                              {/* Delete action */}
                              <button
                                onClick={() => {
                                  askConfirmation(
                                    "Supprimer un agent",
                                    `Voulez-vous vraiment supprimer définitivement l'agent administratif "${ag.fullName}" ? Cet agent perdra immédiatement ses accès à l'espace de validation.`,
                                    () => {
                                      fetch(`/api/admin/users/${ag.id}`, {
                                        method: "DELETE"
                                      })
                                        .then((res) => res.json())
                                        .then(() => {
                                          showFeedback("Agent supprimé de la base de données.");
                                          refreshData();
                                        })
                                        .catch(() => showFeedback("Erreur", "error"));
                                    }
                                  );
                                }}
                                className="p-1.5 text-rose-600 bg-white hover:bg-rose-50 border border-slate-200 hover:border-rose-200 rounded-lg cursor-pointer transition-colors shadow-2xs"
                                title="Retirer ce compte définitivement"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

          </div>



        </motion.div>
      )}

      {/* VIEWPORT 7: AGENT COMPREHENSIVE AUDIT LOGS HISTORY */}
      {activeSubTab === "audits" && (
        <motion.div
          key="audits"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-6"
        >
          
          {/* Audit Dashboard Overview Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs text-left">
              <span className="text-[10px] uppercase font-black text-gray-400 tracking-wider">Total Actions des Agents</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-[#0F1E36]">{auditLogs.length}</span>
                <span className="text-xs text-slate-500 font-semibold">actions consignées</span>
              </div>
            </div>
            <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs text-left">
              <span className="text-[10px] uppercase font-black text-green-700 tracking-wider">Approbations Validées</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-green-600">
                  {auditLogs.filter(l => l.action === "approved").length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">reçus acceptés</span>
              </div>
            </div>
            <div className="border border-[#E5E7EB] rounded-2xl p-5 bg-white shadow-xs text-left">
              <span className="text-[10px] uppercase font-black text-red-700 tracking-wider">Rejets Consignés</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-black text-red-600">
                  {auditLogs.filter(l => l.action === "rejected").length}
                </span>
                <span className="text-xs text-slate-500 font-semibold">reçus déclinés</span>
              </div>
            </div>
          </div>

          {/* Table Container & Filter Control Panel */}
          <div className="border border-[#E5E7EB] rounded-2xl overflow-hidden bg-white shadow-xs">
            
            {/* Header / Controls */}
            <div className="p-6 bg-slate-50 border-b border-[#E5E7EB] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
              <div className="space-y-1 text-left">
                <div className="flex items-center gap-2">
                  <History size={16} className="text-violet-600" />
                  <h3 className="text-[#0F1E36] font-black text-sm tracking-tight m-0">
                    Registre complet de traçabilité des validations
                  </h3>
                </div>
                <p className="text-[11px] text-gray-450 max-w-xl leading-relaxed">
                  Consultez en temps réel l'historique complet des actions effectuées par vos agents administratifs. Chaque approbation ou rejet de paiement est daté et signé électroniquement.
                </p>
              </div>

              {/* Real-time search/filters */}
              <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
                <div className="relative flex-1 md:flex-initial min-w-[200px]">
                  <Search size={14} className="absolute left-3 top-2.5 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Chercher élève, e-mail, agent..."
                    value={auditSearch}
                    onChange={(e) => setAuditSearch(e.target.value)}
                    className="w-full text-xs pl-8 pr-3 py-1.5 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36] transition-colors bg-white text-[#1F2937]"
                  />
                </div>

                <select
                  value={auditAgentFilter}
                  onChange={(e) => setAuditAgentFilter(e.target.value)}
                  className="text-xs p-1.5 border border-gray-200 rounded-lg outline-hidden font-bold bg-white text-[#1F2937] shrink-0"
                >
                  <option value="all">Tous les agents validateurs</option>
                  {Array.from(new Set(auditLogs.map(l => l.agentId))).map(id => {
                    const agentName = auditLogs.find(l => l.agentId === id)?.agentName || id;
                    return (
                      <option key={id} value={id}>
                        {agentName}
                      </option>
                    );
                  })}
                </select>
              </div>
            </div>

            {/* Audit Log Table */}
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-xs text-[#1F2937]">
                <thead>
                  <tr className="bg-[#F9FAFB] border-b border-[#E5E7EB] text-gray-400 font-bold uppercase text-[9px]">
                    <th className="p-4 whitespace-nowrap">Date & heure</th>
                    <th className="p-4 whitespace-nowrap">Agent validateur</th>
                    <th className="p-4 whitespace-nowrap">Lycéen / Éléve ciblé</th>
                    <th className="p-4 whitespace-nowrap">Montant & Méthode</th>
                    <th className="p-4 whitespace-nowrap">Action consignée</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#E5E7EB]">
                  {(() => {
                    const filtered = auditLogs.filter((log) => {
                      const matchesSearch = 
                        log.studentName.toLowerCase().includes(auditSearch.toLowerCase()) ||
                        log.studentEmail.toLowerCase().includes(auditSearch.toLowerCase()) ||
                        log.agentName.toLowerCase().includes(auditSearch.toLowerCase()) ||
                        log.paymentMethod.toLowerCase().includes(auditSearch.toLowerCase());
                      
                      const matchesAgent = auditAgentFilter === "all" || log.agentId === auditAgentFilter;

                      return matchesSearch && matchesAgent;
                    });

                    if (filtered.length === 0) {
                      return (
                        <tr>
                          <td colSpan={5} className="p-12 text-center text-gray-400 font-medium italic">
                            Aucune transaction ou action correspondante dans l'historique d'audit.
                          </td>
                        </tr>
                      );
                    }

                    return filtered.map((log) => {
                      return (
                        <tr key={log.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="p-4 font-mono text-[11px] text-gray-550 font-semibold">
                            {new Date(log.timestamp).toLocaleString("fr-FR")}
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <div className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center font-bold text-[9px] uppercase border border-violet-200">
                                {log.agentName.charAt(0)}
                              </div>
                              <div className="text-left">
                                <span className="font-bold text-gray-800 block leading-tight">{log.agentName}</span>
                                <span className="text-[9px] text-gray-400 font-mono block">ID: {log.agentId}</span>
                              </div>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5 text-left">
                              {(() => {
                                const matchedUser = users.find(u => 
                                  (u.email && log.studentEmail && u.email.toLowerCase() === log.studentEmail.toLowerCase()) ||
                                  (u.fullName && log.studentName && u.fullName.toLowerCase() === log.studentName.toLowerCase()) ||
                                  u.id === log.receiptId
                                );
                                const grade = matchedUser?.grade || (log as any).grade || '';
                                const section = matchedUser?.section || (log as any).section || '';
                                const isRE = isEligibleForRE(grade, section);

                                return (
                                  <>
                                    <div className="flex items-center gap-1.5 flex-wrap">
                                      <p className="font-bold text-gray-900">{log.studentName}</p>
                                      {isRE && (
                                        <span className="px-1.5 py-0.2 bg-red-100 text-red-700 font-extrabold text-[9px] rounded uppercase">
                                          RE -20%
                                        </span>
                                      )}
                                    </div>
                                    <p className="text-[10px] text-gray-450 font-mono">{log.studentEmail}</p>
                                    {grade && (
                                      <p className="text-[10px] text-slate-500 font-medium">
                                        {grade} {section ? `• ${section}` : ''}
                                      </p>
                                    )}
                                  </>
                                );
                              })()}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="space-y-0.5 text-left">
                              <p className="font-extrabold text-[#0F1E36]">{log.amount} DT</p>
                              <span className="text-[9px] uppercase font-bold text-violet-600 bg-violet-50 inline-block px-1.5 py-0.2 rounded border border-violet-100">
                                {log.paymentMethod}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 whitespace-nowrap">
                            {log.action === "approved" ? (
                              <span className="text-[10px] font-bold text-green-700 bg-green-50 border border-green-200 px-2.5 py-1 rounded inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-600 animate-pulse" />
                                Approbation validée
                              </span>
                            ) : (
                              <span className="text-[10px] font-bold text-red-700 bg-red-50 border border-red-200 px-2.5 py-1 rounded inline-flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-600" />
                                Rejet consigné
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    });
                  })()}
                </tbody>
              </table>
            </div>

          </div>

        </motion.div>
      )}

      {/* VIEWPORT 10: PREMIUM PACKS & OFFERS MANAGEMENT */}
      {activeSubTab === "packs" && (
        <motion.div
          key="packs"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        >
          {/* Creation Form Column */}
          <div className="lg:col-span-1 border border-[#E5E7EB] rounded-2xl p-6 bg-white shadow-xs space-y-5 text-left text-xs">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-violet-600 bg-violet-50 px-2 py-0.5 rounded">
                PANEL DE CONTRÔLE
              </span>
              <h3 className="font-extrabold text-[#0F1E36] text-base mt-2 flex items-center gap-1.5">
                <Layers size={18} className="text-violet-600" />
                Créer un Pack Premium
              </h3>
              <p className="text-[11px] text-gray-500 mt-1 leading-normal">
                Ajoutez une nouvelle offre d'abonnement ou un forfait d'accès premium au catalogue visible par les élèves.
              </p>
            </div>

            <form onSubmit={handleCreatePack} className="space-y-4">
              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Nom de l'offre / du Pack *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Forfait Intégral Bac Info (Trimestre 1 & 2)"
                  value={newPack.title}
                  onChange={(e) => setNewPack({ ...newPack, title: e.target.value })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-250 rounded-xl bg-gray-50/50 focus:bg-white transition-all focus:ring-1 focus:ring-violet-500 outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Tarif Promo / Actuel (DT) *
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="Ex: 60"
                    value={newPack.price}
                    onChange={(e) => setNewPack({ ...newPack, price: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 border border-gray-250 rounded-xl bg-gray-50/50 focus:bg-white transition-all focus:ring-1 focus:ring-violet-500 outline-hidden"
                  />
                </div>
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                    Prix d'origine barré (DT)
                  </label>
                  <input
                    type="number"
                    placeholder="Ex: 80 (optionnel)"
                    value={newPack.oldPrice || ""}
                    onChange={(e) => setNewPack({ ...newPack, oldPrice: e.target.value })}
                    className="w-full text-xs font-semibold px-3 py-2 border border-gray-250 rounded-xl bg-gray-50/50 focus:bg-white transition-all focus:ring-1 focus:ring-violet-500 outline-hidden"
                  />
                </div>
              </div>

              <div className="p-3 bg-violet-50/60 border border-violet-200/80 rounded-xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="font-bold text-gray-800 text-xs flex items-center gap-1.5 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={newPack.showPromoBadge}
                      onChange={(e) => setNewPack({ ...newPack, showPromoBadge: e.target.checked })}
                      className="rounded text-violet-600 focus:ring-violet-500 w-4 h-4"
                    />
                    <span>Afficher le badge de promotion</span>
                  </label>
                  <span className="text-[10px] bg-violet-100 text-violet-800 px-2 py-0.5 rounded font-extrabold uppercase">Marketing</span>
                </div>

                {newPack.showPromoBadge && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 pt-1">
                    <div className="space-y-1">
                      <label className="block text-[10px] font-bold text-gray-600 uppercase">Type de badge</label>
                      <select
                        value={newPack.promoBadgeType}
                        onChange={(e) => setNewPack({ ...newPack, promoBadgeType: e.target.value as "auto" | "custom" })}
                        className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 font-semibold"
                      >
                        <option value="auto">⚡ Remise % automatique</option>
                        <option value="custom">✍️ Texte personnalisé</option>
                      </select>
                    </div>
                    {newPack.promoBadgeType === "custom" && (
                      <div className="space-y-1">
                        <label className="block text-[10px] font-bold text-gray-600 uppercase">Libellé du badge</label>
                        <input
                          type="text"
                          placeholder="Ex: PROMO SPÉCIALE, -30 DT..."
                          value={newPack.promoBadge || ""}
                          onChange={(e) => setNewPack({ ...newPack, promoBadge: e.target.value })}
                          className="w-full text-xs bg-white border border-gray-200 rounded-lg p-2 font-semibold"
                        />
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Catégorie de l'offre
                </label>
                <select
                  value={newPack.category}
                  onChange={(e) => setNewPack({ ...newPack, category: e.target.value as any })}
                  className="w-full text-xs font-semibold px-3 py-2 border border-gray-250 rounded-xl bg-gray-50/50 focus:bg-white transition-all focus:ring-1 focus:ring-violet-500 outline-hidden"
                >
                  <option value="Full Access">🏆 Accès Illimité / Premium Global</option>
                  <option value="Pack PDF">📚 Collection de documents / Livres PDF</option>
                  <option value="Cours Video">🎥 Cours Vidéos et Séances enregistrées</option>
                  <option value="Hardware">💻 Matériel informatique ou kits TP</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Sélecteur d'Icône du Pack *
                </label>
                <div className="grid grid-cols-5 gap-1.5 p-2 bg-gray-50 rounded-xl border border-gray-250">
                  {["Award", "Gift", "Zap", "Shield", "Sparkles", "Layers", "BookOpen", "Video", "Terminal", "Activity"].map((iconName) => (
                    <button
                      key={iconName}
                      type="button"
                      onClick={() => setNewPack({ ...newPack, icon: iconName })}
                      className={`flex flex-col items-center justify-center p-2 rounded-lg border transition-all cursor-pointer ${
                        newPack.icon === iconName 
                          ? "bg-violet-600 text-white border-violet-600 shadow-xs" 
                          : "bg-white text-gray-650 hover:bg-gray-100 border-gray-200"
                      }`}
                      title={iconName}
                    >
                      {renderPackIcon(iconName, 16)}
                      <span className="text-[8px] mt-1 font-semibold truncate max-w-full">{iconName}</span>
                    </button>
                  ))}
                </div>
              </div>

              <ImagePickerInput
                label="Visuel du Pack (Optionnel)"
                value={newPack.image}
                onChange={(val) => setNewPack({ ...newPack, image: val })}
                placeholder="https://images.unsplash.com/photo-..."
                quickTemplates={[
                  { name: "Gold Premium", url: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80" },
                  { name: "Scolaire PDF", url: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&w=400&q=80" },
                  { name: "Classes Vidéo", url: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=400&q=80" }
                ]}
              />

              <div className="space-y-1">
                <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                  Description & Contenu du pack *
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Quelles fonctionnalités ou documents cet achat déverrouille-t-il ?"
                  value={newPack.description}
                  onChange={(e) => setNewPack({ ...newPack, description: e.target.value })}
                  className="w-full text-xs bg-gray-50/50 rounded-xl border border-gray-250 p-2.5 focus:bg-white transition-all focus:ring-1 focus:ring-violet-500 outline-hidden leading-relaxed"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-violet-650 hover:bg-violet-755 text-white font-extrabold rounded-xl uppercase tracking-wider cursor-pointer text-center transition-all shadow-xs active:scale-95 duration-100"
              >
                🚀 Publier l'Offre Premium
              </button>
            </form>
          </div>

          {/* Existing Packs Directory Column */}
          <div className="lg:col-span-2 border border-[#E5E7EB] rounded-2xl p-6 bg-white shadow-xs space-y-5 text-left">
            <div>
              <h3 className="font-extrabold text-[#0F1E36] text-base flex items-center gap-1.5">
                🎯 Offres de Forfaits Actives
              </h3>
              <p className="text-xs text-gray-500 mt-1">
                Ces offres apparaissent actuellement au niveau de l'Espace Shop des élèves pour achat par versement D17 ou RIB.
              </p>
            </div>

            {/* Statistical overview card */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-50 border border-slate-150 p-4 rounded-xl text-xs">
              <div className="space-y-0.5">
                <span className="text-gray-400 font-semibold block uppercase text-[9px] tracking-wider">Nombre total d'offres</span>
                <span className="text-lg font-bold text-[#0F1E36]">{products.length} Forfaits</span>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-400 font-semibold block uppercase text-[9px] tracking-wider">Gamme de Prix</span>
                <span className="text-lg font-bold text-violet-650">
                  {products.length > 0 ? Math.min(...products.map(p => p.price)) : 0} DT - {products.length > 0 ? Math.max(...products.map(p => p.price)) : 0} DT
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-gray-400 font-semibold block uppercase text-[9px] tracking-wider">Catégories d'Accès</span>
                <span className="text-lg font-bold text-emerald-600">
                  {Array.from(new Set(products.map(p => p.category))).length} Types
                </span>
              </div>
            </div>

            {/* Grid List */}
            {products.length === 0 ? (
              <div className="p-16 text-center border border-dashed border-[#E5E7EB] rounded-2xl max-w-sm mx-auto bg-gray-50/50">
                <Layers size={32} className="text-gray-300 mx-auto mb-3" />
                <p className="font-extrabold text-sm text-gray-800">Aucun produit premium</p>
                <p className="text-xs text-gray-500 mt-1">Utilisez l'échantillonneur de gauche pour éditer votre première offre premium.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[600px] overflow-y-auto pr-1">
                {products.map((p) => {
                  const badgeLabel = getPromoBadgeLabel(p);
                  return (
                    <div
                      key={p.id}
                      className="p-4 border border-[#E5E7EB] rounded-xl bg-white flex flex-col justify-between hover:border-violet-500 transition-all text-xs shadow-xs hover:shadow-sm"
                    >
                      <div className="space-y-3">
                        <div className="relative">
                          <img
                            src={p.image || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80"}
                            alt={p.title}
                            className="w-full h-28 object-cover rounded-lg border border-gray-150 shadow-xs"
                          />
                          <span className="absolute top-2.5 left-2.5 bg-[#0F1E36] text-white text-[9px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider select-none">
                            {p.category}
                          </span>
                          {badgeLabel && (
                            <span className="absolute top-2.5 right-2.5 bg-rose-600 text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs animate-pulse">
                              {badgeLabel}
                            </span>
                          )}
                        </div>
                        
                        <div className="text-left space-y-1">
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-extrabold text-gray-900 text-sm leading-tight line-clamp-1 flex items-center gap-1.5">
                              {renderPackIcon(p.icon, 14, "text-violet-600 shrink-0")}
                              {p.title}
                            </h4>
                            <div className="flex items-center gap-1 shrink-0">
                              {p.oldPrice && p.oldPrice > p.price && (
                                <span className="line-through text-gray-400 font-normal text-xs">{p.oldPrice} DT</span>
                              )}
                              <span className="text-violet-750 bg-violet-50 border border-violet-150 rounded-lg px-2 py-0.5 font-black text-xs">
                                {p.price} DT
                              </span>
                            </div>
                          </div>
                          <p className="text-[11px] text-gray-550 leading-relaxed font-semibold line-clamp-3">
                            {p.description}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-3.5 border-t border-[#E5E7EB] flex items-center justify-between">
                        <span className="text-[9px] text-gray-400 font-mono">ID: {p.id}</span>
                        <button
                          onClick={() => handleDeletePack(p.id)}
                          className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-bold flex items-center justify-center gap-1 cursor-pointer transition-colors border border-rose-100 text-[10px]"
                        >
                          <Trash2 size={11} />
                          <span>Retirer l'offre</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </motion.div>
      )}

      {/* VIEWPORT: SIGN-UP OFFERS & 4 FORMULES CAMPAIGNS */}
      {activeSubTab === "signup-offers" && (
        <motion.div
          key="signup-offers"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <AdminCampaignsView />
        </motion.div>
      )}

      {/* VIEWPORT 11: DESIGN & BRANDING CUSTOMIZATION */}
      {activeSubTab === "branding" && (
        <motion.div
          key="branding"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="bg-white border border-[#E5E7EB] rounded-2xl p-6 md:p-8 space-y-8 shadow-sm text-left"
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-gray-150 pb-5">
            <div>
              <h2 className="text-lg font-black text-[#0F1E36] tracking-tight flex items-center gap-2">
                <Palette className="text-violet-600" size={22} />
                Personnalisation & Design de la Plateforme
              </h2>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Modifiez les logos, les couleurs principales, les icônes ainsi que les illustrations de la page d'accueil de la plateforme d'apprentissage.
              </p>
            </div>
            
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  if (onSaveBranding) {
                    onSaveBranding({
                      logoUrl: "",
                      logoText: "A-Zed Info",
                      primaryColor: "#0F1E36",
                      secondaryColor: "#10B981",
                      heroImageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500",
                      studentImageUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400",
                      platformIcon: ""
                    }).then((ok) => {
                      if (ok) {
                        alert("Le design a été réinitialisé aux valeurs d'usine !");
                        onAdminActionRefetch();
                      }
                    });
                  }
                }}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold transition-all cursor-pointer"
              >
                Réinitialiser
              </button>
            </div>
          </div>

          <BrandingForm
            logoUrl={logoUrl}
            logoText={logoText}
            primaryColor={primaryColor}
            secondaryColor={secondaryColor}
            heroImageUrl={heroImageUrl}
            studentImageUrl={studentImageUrl}
            loginImageUrl={loginImageUrl}
            registerImageUrl={registerImageUrl}
            platformIcon={platformIcon}
            landingHeroTitle={landingHeroTitle}
            landingHeroHighlight={landingHeroHighlight}
            landingHeroSubtext={landingHeroSubtext}
            overlayAlAdmisText={overlayAlAdmisText}
            overlayAlAdmisBg={overlayAlAdmisBg}
            overlayAlAdmisTextColor={overlayAlAdmisTextColor}
            overlayKhaliaAlaynaText={overlayKhaliaAlaynaText}
            overlayKhaliaAlaynaBg={overlayKhaliaAlaynaBg}
            overlayKhaliaAlaynaTextColor={overlayKhaliaAlaynaTextColor}
            overlayPlatformActiveHeader={overlayPlatformActiveHeader}
            overlayPlatformActiveSubtext={overlayPlatformActiveSubtext}
            overlayPlatformActiveIcon={overlayPlatformActiveIcon}
            overlayPlatformActiveBg={overlayPlatformActiveBg}
            overlayPlatformActiveTextColor={overlayPlatformActiveTextColor}
            headingFont={headingFont}
            bodyFont={bodyFont}
            authHeroImageConfig={authHeroImageConfig}
            onSave={async (newConfig) => {
              if (onSaveBranding) {
                const ok = await onSaveBranding(newConfig);
                if (ok) {
                  onAdminActionRefetch();
                  return true;
                }
              }
              return false;
            }}
          />
        </motion.div>
      )}

      {/* VIEWPORT: MEDIA ICONS & GIFS MANAGEMENT */}
      {activeSubTab === "media-icons" && (
        <motion.div
          key="media-icons"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          <MediaIconsManager />
        </motion.div>
      )}

      {/* VIEWPORT 12: CMS UPDATES MANAGEMENT */}
      {activeSubTab === "updates" && (
        <motion.div
          key="updates"
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -15 }}
          transition={{ duration: 0.2 }}
          className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6"
        >
          <div className="border-b border-gray-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded">
                Console CMS
              </span>
              <h2 className="text-[#0F1E36] font-extrabold text-xl mt-1 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center text-emerald-600 shrink-0 shadow-xs">
                  <RefreshCw className="w-4 h-4" />
                </span>
                <span>Mises à jour & Configuration du Contenu</span>
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Gérez la structure, la typographie, les visuels et les textes de la page d'accueil et de l'espace élève.
              </p>
            </div>

            {/* Toggle between CmsManager and UpdatesDashboard */}
            <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
              <button
                type="button"
                onClick={() => setCmsMode("manager")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  cmsMode === "manager" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Sliders className="w-3.5 h-3.5" />
                Moteur CmsManager
              </button>
              <button
                type="button"
                onClick={() => setCmsMode("standard")}
                className={`px-4 py-2 text-xs font-bold rounded-lg transition-all flex items-center gap-1.5 ${
                  cmsMode === "standard" 
                    ? "bg-white text-blue-600 shadow-xs" 
                    : "text-gray-500 hover:text-gray-800"
                }`}
              >
                <Palette className="w-3.5 h-3.5" />
                Tableau complet
              </button>
            </div>
          </div>

          {cmsMode === "manager" ? (
            <CmsManager onSaved={onAdminActionRefetch} />
          ) : (
            <UpdatesDashboard onConfigSaved={onAdminActionRefetch} />
          )}
        </motion.div>
      )}

      {/* VIEWPORT: DEMOS & EXTRAITS VIDEO MANAGER */}
      {activeSubTab === "demos" && (
        <motion.div
          key="demos-manager-page"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="space-y-6 text-left"
        >
          <AdminDemoManager onSuccessToast={(msg) => showFeedback(msg)} />
        </motion.div>
      )}

      {/* VIEWPORT: PROFIL & SÉCURITÉ ADMIN */}
      {(activeSubTab === "profil-securite" || activeSubTab === "profile" || (activeSubTab as string) === "profil") && (
        <motion.div
          key="profil-securite-page"
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -12 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
        >
          <AdminProfileSecurityView
            currentUser={currentUser}
            setCurrentUser={setCurrentUser}
            onAdminActionRefetch={onAdminActionRefetch}
          />
        </motion.div>
      )}
    </AnimatePresence>

      {/* CUSTOM STATE CONFIRMATION OVERLAY */}
      {confirmModal && (
        <div className="fixed inset-0 z-[99] flex items-center justify-center bg-[#0F1E36]/50 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-sm w-full p-6 shadow-2xl border border-gray-150 space-y-4 text-left">
            <h3 className="text-sm font-extrabold text-[#0F1E36] flex items-center gap-1.5">
              ⚠️ Confirmation requise
            </h3>
            
            <p className="text-xs text-gray-650 leading-relaxed font-semibold">
              {confirmModal.message}
            </p>

            <div className="flex justify-end gap-2 pt-1.5">
              <button
                onClick={() => setConfirmModal(null)}
                className="px-3.5 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-xs font-bold cursor-pointer transition-colors"
              >
                Annuler
              </button>
              
              <button
                onClick={() => {
                  confirmModal.onConfirm();
                  setConfirmModal(null);
                }}
                className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold cursor-pointer transition-colors shadow-xs"
              >
                Confirmer l'action
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AGENT WITHDRAWALS DETAIL MODAL */}
      {selectedAgentForWithdrawals && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0F1E36]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 shadow-2xl border border-slate-200 flex flex-col max-h-[85vh] text-left">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-slate-100 pb-4 shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center font-black text-sm uppercase">
                  {selectedAgentForWithdrawals.fullName.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-black text-[#0F1E36]">
                    Demandes d'Avances & Retraits — {selectedAgentForWithdrawals.fullName}
                  </h3>
                  <p className="text-[11px] text-slate-500 font-mono">
                    {selectedAgentForWithdrawals.email}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedAgentForWithdrawals(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Body */}
            <div className="py-4 space-y-4 overflow-y-auto flex-1 pr-1">
              {(() => {
                const agentComms = commissions.filter(c => c.agentId === selectedAgentForWithdrawals.id);
                const totalEarned = agentComms.reduce((sum, c) => sum + c.earnedCommission, 0);
                const agentWiths = withdrawals.filter(w => w.agentId === selectedAgentForWithdrawals.id);
                
                const pendingWiths = agentWiths.filter(w => w.status === "pending" || w.status === "EN_ATTENTE");
                const totalPendingAmt = pendingWiths.reduce((sum, w) => sum + w.amount, 0);

                const approvedWiths = agentWiths.filter(w => w.status === "approved" || w.status === "paid" || w.status === "APPROUVE" || w.status === "PAYE");
                const totalApprovedAmt = approvedWiths.reduce((sum, w) => sum + w.amount, 0);

                const remaining = Math.max(0, totalEarned - (totalApprovedAmt + totalPendingAmt));

                return (
                  <div className="space-y-4">
                    {/* KPI Recap */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-xl space-y-0.5">
                        <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Total Accumulé</span>
                        <span className="text-xs font-black text-slate-800 font-mono">{totalEarned.toFixed(2)} DT</span>
                      </div>
                      <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-xl space-y-0.5">
                        <span className="text-[9px] font-bold text-amber-700 uppercase tracking-wider block">En Attente</span>
                        <span className="text-xs font-black text-amber-800 font-mono">{totalPendingAmt.toFixed(2)} DT</span>
                      </div>
                      <div className="p-3 bg-blue-50/70 border border-blue-200/80 rounded-xl space-y-0.5">
                        <span className="text-[9px] font-bold text-blue-700 uppercase tracking-wider block">Déjà Réglé</span>
                        <span className="text-xs font-black text-blue-800 font-mono">{totalApprovedAmt.toFixed(2)} DT</span>
                      </div>
                      <div className="p-3 bg-emerald-50/90 border border-emerald-200/90 rounded-xl space-y-0.5">
                        <span className="text-[9px] font-bold text-emerald-800 uppercase tracking-wider block">Solde Restant</span>
                        <span className="text-xs font-black text-emerald-700 font-mono">{remaining.toFixed(2)} DT</span>
                      </div>
                    </div>

                    {/* Bulk Pay banner */}
                    {totalPendingAmt > 0 && (
                      <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
                        <div>
                          <h4 className="text-xs font-extrabold text-emerald-950">
                            ⚡ Règlement global disponible
                          </h4>
                          <p className="text-[10px] text-emerald-700 font-medium">
                            Approuver et régler toutes les demandes en attente ({pendingWiths.length} demande(s) pour un total de {totalPendingAmt.toFixed(2)} DT).
                          </p>
                        </div>
                        <button
                          onClick={() => {
                            fetch("/api/admin/commissions/pay", {
                              method: "POST",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ agentId: selectedAgentForWithdrawals.id })
                            })
                              .then(res => {
                                if (!res.ok) throw new Error();
                                return res.json();
                              })
                              .then((data) => {
                                showFeedback(data.msg || "Toutes les demandes ont été approuvées et réglées !");
                                refreshData();
                              })
                              .catch(() => showFeedback("Erreur lors du règlement global", "error"));
                          }}
                          className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors shadow-2xs cursor-pointer shrink-0 flex items-center gap-1.5"
                        >
                          <Coins size={14} />
                          <span>Tout Payer ({totalPendingAmt.toFixed(2)} DT)</span>
                        </button>
                      </div>
                    )}

                    {/* Table */}
                    <div className="border border-slate-200/80 rounded-xl overflow-hidden bg-white">
                      <table className="w-full text-left text-xs border-collapse">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold text-[10px] uppercase tracking-wider">
                            <th className="p-3 pl-4">Date & Heure</th>
                            <th className="p-3">Montant</th>
                            <th className="p-3 text-center">Statut</th>
                            <th className="p-3 text-right pr-4">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-150">
                          {agentWiths.length === 0 ? (
                            <tr>
                              <td colSpan={4} className="p-6 text-center text-slate-400 italic font-medium">
                                Aucune demande d'avance enregistrée pour cet agent.
                              </td>
                            </tr>
                          ) : (
                            agentWiths.map((w) => {
                              const isPending = w.status === "pending" || w.status === "EN_ATTENTE";
                              const isApproved = w.status === "approved" || w.status === "paid" || w.status === "APPROUVE" || w.status === "PAYE";
                              const isRejected = w.status === "rejected" || w.status === "REJETE";

                              return (
                                <tr key={w.id} className="hover:bg-slate-50/60 transition-colors">
                                  <td className="p-3 pl-4 font-mono text-[11px] text-slate-600">
                                    {w.requestDate}
                                  </td>
                                  <td className="p-3 font-mono font-black text-slate-900 text-xs">
                                    {w.amount.toFixed(2)} TND
                                  </td>
                                  <td className="p-3 text-center">
                                    <span className={`inline-block px-2.5 py-0.5 text-[10px] font-extrabold rounded-full border uppercase ${
                                      isApproved
                                        ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                        : isRejected
                                        ? "bg-rose-50 text-rose-700 border-rose-200"
                                        : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                                    }`}>
                                      {isApproved ? "Approuvé" : isRejected ? "Refusé" : "En attente"}
                                    </span>
                                  </td>
                                  <td className="p-3 pr-4 text-right">
                                    {isPending ? (
                                      <div className="flex items-center justify-end gap-1.5">
                                        <button
                                          onClick={() => handleWithdrawalAction(w.id, "approved")}
                                          className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold cursor-pointer transition-colors shadow-2xs"
                                          title="Approuver cette demande spécifique"
                                        >
                                          Approuver
                                        </button>
                                        <button
                                          onClick={() => handleWithdrawalAction(w.id, "rejected")}
                                          className="px-2.5 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded text-[10px] font-bold cursor-pointer transition-colors"
                                          title="Refuser cette demande spécifique"
                                        >
                                          Refuser
                                        </button>
                                      </div>
                                    ) : (
                                      <span className="text-[10px] text-slate-400 font-semibold italic">Traitée</span>
                                    )}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Footer */}
            <div className="pt-3 border-t border-slate-100 flex justify-end shrink-0">
              <button
                onClick={() => setSelectedAgentForWithdrawals(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-xs font-bold transition-colors cursor-pointer"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT USER PROFILE MODAL - DISABLED AS WE NOW USE A DEDICATED COMFORTABLE PAGE */}
      {false && editingUser && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-[#0F1E36]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-gray-150 flex flex-col max-h-[90vh] text-left my-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3 shrink-0">
              <h3 className="text-sm font-extrabold text-[#0F1E36] flex items-center gap-1.5">
                ✏️ Modifier le Profil Utilisateur
              </h3>
              <button 
                onClick={() => setEditingUser(null)}
                className="text-gray-400 hover:text-gray-650 transition-colors"
              >
                <X size={16} />
              </button>
            </div>

            <form onSubmit={(e) => {
              e.preventDefault();
              fetch("/api/admin/users/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  userId: editingUser.id,
                  ...editUserForm
                })
              })
                .then(res => {
                  if (!res.ok) throw new Error();
                  return res.json();
                })
                .then(() => {
                  showFeedback("Profil utilisateur modifié avec succès !");
                  setEditingUser(null);
                  refreshData();
                })
                .catch(() => showFeedback("Erreur lors de la mise à jour", "error"));
            }} className="flex flex-col flex-1 overflow-hidden min-h-0 text-xs mt-3">
              <div className="space-y-3.5 overflow-y-auto pr-1 flex-1 py-1">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-500 uppercase text-[10px]">Nom Complet</label>
                    <input 
                      type="text" 
                      required 
                      value={editUserForm.fullName || ""} 
                      onChange={e => setEditUserForm({ ...editUserForm, fullName: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-500 uppercase text-[10px]">E-mail / Login</label>
                    <input 
                      type="email" 
                      required 
                      value={editUserForm.email || ""} 
                      onChange={e => setEditUserForm({ ...editUserForm, email: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-500 uppercase text-[10px]">Mot de Passe</label>
                    <input 
                      type="text" 
                      required 
                      value={editUserForm.password || ""} 
                      onChange={e => setEditUserForm({ ...editUserForm, password: e.target.value })}
                      className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36] font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-500 uppercase text-[10px]">Rôle</label>
                    <select 
                      value={editUserForm.role || "student"} 
                      onChange={e => setEditUserForm({ ...editUserForm, role: e.target.value as any })}
                      className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                    >
                      <option value="student">Élève (Student)</option>
                      <option value="agent">Agent de direction</option>
                      <option value="admin">Administrateur</option>
                    </select>
                  </div>
                </div>

                {editUserForm.role === "student" && (
                  <>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-500 uppercase text-[10px]">Niveau</label>
                        <select 
                          value={
                            editUserForm.grade === "1ère année" ? "1ère Année" :
                            editUserForm.grade === "2ème année" ? "2ème Année" :
                            editUserForm.grade === "3ème année" ? "3ème Année" :
                            editUserForm.grade === "4ème année" || editUserForm.grade === "4ème Année (Bac)" ? "4ème Année" :
                            editUserForm.grade || ""
                          } 
                          onChange={e => setEditUserForm({ ...editUserForm, grade: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                        >
                          <option value="1ère Année">1ère année</option>
                          <option value="2ème Année">2ème année</option>
                          <option value="3ème Année">3ème année</option>
                          <option value="4ème Année">4ème année</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-500 uppercase text-[10px]">Section / Filière</label>
                        <select 
                          value={editUserForm.section || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, section: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                        >
                          {SECTIONS_OPTIONS.map((sec) => (
                            <option key={sec} value={sec}>{sec}</option>
                          ))}
                        </select>
                      </div>

                      <div className="space-y-1">
                        <label className="block font-bold text-gray-500 uppercase text-[10px]">Groupe d'étude (A-Z)</label>
                        <select 
                          value={editUserForm.groupe_etude || editUserForm.studyGroup || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, groupe_etude: e.target.value, studyGroup: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36] font-bold text-[#0F1E36]"
                        >
                          <option value="">Non assigné</option>
                          {STUDY_GROUPS.map(letter => (
                            <option key={letter} value={letter}>Groupe {letter}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-500 uppercase text-[10px]">Téléphone</label>
                        <input 
                          type="text" 
                          value={editUserForm.phone || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, phone: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-500 uppercase text-[10px]">Type d'abonnement</label>
                        <select 
                          value={editUserForm.accountType || "freemium"} 
                          onChange={e => setEditUserForm({ ...editUserForm, accountType: e.target.value as any })}
                          className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                        >
                          <option value="freemium">Freemium (Gratuit)</option>
                          <option value="premium">Premium (Abonné)</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-500 uppercase text-[10px]">Ville / Région</label>
                        <input 
                          type="text" 
                          value={editUserForm.city || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, city: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block font-bold text-gray-500 uppercase text-[10px]">Lycée d'origine</label>
                        <input 
                          type="text" 
                          value={editUserForm.highSchool || ""} 
                          onChange={e => setEditUserForm({ ...editUserForm, highSchool: e.target.value })}
                          className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-gray-100">
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-500 uppercase text-[10px]">Statut du Compte</label>
                    <select 
                      value={editUserForm.status || "pending"} 
                      onChange={e => setEditUserForm({ ...editUserForm, status: e.target.value as any })}
                      className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                    >
                      <option value="pending">En Attente (Hold)</option>
                      <option value="active">Actif (Validé)</option>
                      <option value="disabled">Bloqué / Suspendu</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="block font-bold text-gray-500 uppercase text-[10px]">Vérifié par Admin/Agent</label>
                    <select 
                      value={editUserForm.verified ? "true" : "false"} 
                      onChange={e => setEditUserForm({ ...editUserForm, verified: e.target.value === "true" })}
                      className="w-full p-2 border border-gray-200 rounded-lg outline-hidden focus:border-[#0F1E36]"
                    >
                      <option value="false">Non Vérifié ❌</option>
                      <option value="true">Vérifié et Approuvé de Suite ✅</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100 shrink-0 mt-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg font-bold cursor-pointer transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#2563EB] hover:bg-blue-700 text-white rounded-lg font-bold cursor-pointer transition-colors shadow-xs"
                >
                  Sauvegarder et appliquer toutes les modifications
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALE DE CONFIRMATION DE SUPPRESSION D'ÉLÈVE */}
      <DeleteConfirmModal
        isOpen={!!studentToDelete}
        studentName={studentToDelete?.fullName || ""}
        isDeleting={isDeletingStudent}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          if (!isDeletingStudent) {
            setStudentToDelete(null);
          }
        }}
      />

    </div>
  );
}

function BrandingForm({
  logoUrl,
  logoText,
  primaryColor,
  secondaryColor,
  heroImageUrl,
  studentImageUrl,
  loginImageUrl,
  registerImageUrl,
  platformIcon,
  landingHeroTitle,
  landingHeroHighlight,
  landingHeroSubtext,
  overlayAlAdmisText,
  overlayAlAdmisBg,
  overlayAlAdmisTextColor,
  overlayKhaliaAlaynaText,
  overlayKhaliaAlaynaBg,
  overlayKhaliaAlaynaTextColor,
  overlayPlatformActiveHeader,
  overlayPlatformActiveSubtext,
  overlayPlatformActiveIcon,
  overlayPlatformActiveBg,
  overlayPlatformActiveTextColor,
  headingFont,
  bodyFont,
  authHeroImageConfig,
  onSave
}: {
  logoUrl: string;
  logoText: string;
  primaryColor: string;
  secondaryColor: string;
  heroImageUrl: string;
  studentImageUrl: string;
  loginImageUrl: string;
  registerImageUrl: string;
  platformIcon: string;
  landingHeroTitle: string;
  landingHeroHighlight: string;
  landingHeroSubtext: string;
  overlayAlAdmisText: string;
  overlayAlAdmisBg: string;
  overlayAlAdmisTextColor: string;
  overlayKhaliaAlaynaText: string;
  overlayKhaliaAlaynaBg: string;
  overlayKhaliaAlaynaTextColor: string;
  overlayPlatformActiveHeader: string;
  overlayPlatformActiveSubtext: string;
  overlayPlatformActiveIcon: string;
  overlayPlatformActiveBg: string;
  overlayPlatformActiveTextColor: string;
  headingFont: string;
  bodyFont: string;
  authHeroImageConfig?: AuthHeroImageConfig | null;
  onSave: (config: any) => Promise<boolean>;
}) {
  const [formText, setFormText] = useState(logoText);
  const [formLogo, setFormLogo] = useState(logoUrl);
  const [formPrimary, setFormPrimary] = useState(primaryColor);
  const [formSecondary, setFormSecondary] = useState(secondaryColor);
  const [formHero, setFormHero] = useState(heroImageUrl);
  const [formStudent, setFormStudent] = useState(studentImageUrl);
  const [formLogin, setFormLogin] = useState(loginImageUrl || "");
  const [formRegister, setFormRegister] = useState(registerImageUrl || "");
  const [formIcon, setFormIcon] = useState(platformIcon);
  const [formHeadingFont, setFormHeadingFont] = useState(headingFont || "Inter");
  const [formBodyFont, setFormBodyFont] = useState(bodyFont || "Inter");
  const [authHeroConfig, setAuthHeroConfig] = useState<AuthHeroImageConfig>(() => {
    try {
      const saved = localStorage.getItem("auth_hero_image_config");
      if (saved) return { ...DEFAULT_AUTH_HERO_CONFIG, ...JSON.parse(saved) };
    } catch {}
    return authHeroImageConfig || DEFAULT_AUTH_HERO_CONFIG;
  });
  const [formTeacherAvatar, setFormTeacherAvatar] = useState<string>(() => {
    try {
      return localStorage.getItem("teacher_avatar") || "";
    } catch {
      return "";
    }
  });
  
  const [formHeroTitle, setFormHeroTitle] = useState(landingHeroTitle || "");
  const [formHeroHighlight, setFormHeroHighlight] = useState(landingHeroHighlight || "");
  const [formHeroSubtext, setFormHeroSubtext] = useState(landingHeroSubtext || "");
  const [formAlAdmisText, setFormAlAdmisText] = useState(overlayAlAdmisText || "");
  const [formAlAdmisBg, setFormAlAdmisBg] = useState(overlayAlAdmisBg || "");
  const [formAlAdmisTextColor, setFormAlAdmisTextColor] = useState(overlayAlAdmisTextColor || "");
  const [formKhaliaAlaynaText, setFormKhaliaAlaynaText] = useState(overlayKhaliaAlaynaText || "");
  const [formKhaliaAlaynaBg, setFormKhaliaAlaynaBg] = useState(overlayKhaliaAlaynaBg || "");
  const [formKhaliaAlaynaTextColor, setFormKhaliaAlaynaTextColor] = useState(overlayKhaliaAlaynaTextColor || "");
  const [formPlatformActiveHeader, setFormPlatformActiveHeader] = useState(overlayPlatformActiveHeader || "");
  const [formPlatformActiveSubtext, setFormPlatformActiveSubtext] = useState(overlayPlatformActiveSubtext || "");
  const [formPlatformActiveIcon, setFormPlatformActiveIcon] = useState(overlayPlatformActiveIcon || "");
  const [formPlatformActiveBg, setFormPlatformActiveBg] = useState(overlayPlatformActiveBg || "");
  const [formPlatformActiveTextColor, setFormPlatformActiveTextColor] = useState(overlayPlatformActiveTextColor || "");

  const [isSaving, setIsSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [previewMode, setPreviewMode] = useState<"desktop" | "mobile">("desktop");

  // Sync state with props when props change
  useEffect(() => {
    setFormText(logoText);
    setFormLogo(logoUrl);
    setFormPrimary(primaryColor);
    setFormSecondary(secondaryColor);
    setFormHero(heroImageUrl);
    setFormStudent(studentImageUrl);
    setFormIcon(platformIcon);
    setFormHeadingFont(headingFont || "Inter");
    setFormBodyFont(bodyFont || "Inter");
    setFormHeroTitle(landingHeroTitle || "");
    setFormHeroHighlight(landingHeroHighlight || "");
    setFormHeroSubtext(landingHeroSubtext || "");
    setFormAlAdmisText(overlayAlAdmisText || "");
    setFormAlAdmisBg(overlayAlAdmisBg || "");
    setFormAlAdmisTextColor(overlayAlAdmisTextColor || "");
    setFormKhaliaAlaynaText(overlayKhaliaAlaynaText || "");
    setFormKhaliaAlaynaBg(overlayKhaliaAlaynaBg || "");
    setFormKhaliaAlaynaTextColor(overlayKhaliaAlaynaTextColor || "");
    setFormPlatformActiveHeader(overlayPlatformActiveHeader || "");
    setFormPlatformActiveSubtext(overlayPlatformActiveSubtext || "");
    setFormPlatformActiveIcon(overlayPlatformActiveIcon || "");
    setFormPlatformActiveBg(overlayPlatformActiveBg || "");
    setFormPlatformActiveTextColor(overlayPlatformActiveTextColor || "");
  }, [
    logoUrl, logoText, primaryColor, secondaryColor, heroImageUrl, studentImageUrl, platformIcon,
    landingHeroTitle, landingHeroHighlight, landingHeroSubtext,
    overlayAlAdmisText, overlayAlAdmisBg, overlayAlAdmisTextColor,
    overlayKhaliaAlaynaText, overlayKhaliaAlaynaBg, overlayKhaliaAlaynaTextColor,
    overlayPlatformActiveHeader, overlayPlatformActiveSubtext, overlayPlatformActiveIcon,
    overlayPlatformActiveBg, overlayPlatformActiveTextColor, headingFont, bodyFont
  ]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const compressed = await compressImageFileToDataUrl(file, 400, 400, 0.88);
      setter(compressed);
    } catch {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === "string") {
          setter(reader.result);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setStatusMsg(null);
    try {
      const ok = await onSave({
        logoText: formText,
        logoUrl: formLogo,
        primaryColor: formPrimary,
        secondaryColor: formSecondary,
        heroImageUrl: formHero,
        studentImageUrl: formStudent,
        loginImageUrl: formLogin,
        registerImageUrl: formRegister,
        platformIcon: formIcon,
        landingHeroTitle: formHeroTitle,
        landingHeroHighlight: formHeroHighlight,
        landingHeroSubtext: formHeroSubtext,
        overlayAlAdmisText: formAlAdmisText,
        overlayAlAdmisBg: formAlAdmisBg,
        overlayAlAdmisTextColor: formAlAdmisTextColor,
        overlayKhaliaAlaynaText: formKhaliaAlaynaText,
        overlayKhaliaAlaynaBg: formKhaliaAlaynaBg,
        overlayKhaliaAlaynaTextColor: formKhaliaAlaynaTextColor,
        overlayPlatformActiveHeader: formPlatformActiveHeader,
        overlayPlatformActiveSubtext: formPlatformActiveSubtext,
        overlayPlatformActiveIcon: formPlatformActiveIcon,
        overlayPlatformActiveBg: formPlatformActiveBg,
        overlayPlatformActiveTextColor: formPlatformActiveTextColor,
        headingFont: formHeadingFont,
        bodyFont: formBodyFont,
        authHeroImageConfig: authHeroConfig
      });
      if (ok) {
        safeLocalStorageSetItem("auth_hero_image_config", JSON.stringify(authHeroConfig));
        if (formTeacherAvatar) {
          safeLocalStorageSetItem("teacher_avatar", formTeacherAvatar);
        }
        setStatusMsg({ type: "success", text: "Modifications de branding enregistrées avec succès !" });
      } else {
        setStatusMsg({ type: "error", text: "Erreur lors de l'enregistrement." });
      }
    } catch (err) {
      setStatusMsg({ type: "error", text: "Erreur de communication avec le serveur." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {statusMsg && (
        <div className={`p-4 rounded-xl text-xs font-bold border ${
          statusMsg.type === "success" ? "bg-green-50 text-green-800 border-green-200" : "bg-red-50 text-red-800 border-red-200"
        }`}>
          {statusMsg.text}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Side: Inputs */}
        <div className="space-y-6">
          
          {/* Brand Identity Section */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🏷️ Identité & En-tête</span>
            </h3>

            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Nom de la Plateforme (Texte)</label>
                <input
                  type="text"
                  value={formText}
                  onChange={(e) => setFormText(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500"
                  placeholder="A-Zed Info"
                  required
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Logo Officiel de l'Établissement</label>
                <div className="flex items-center gap-3">
                  {formLogo && (
                    <img src={formLogo} className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-xs shrink-0" alt="Logo preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormLogo)}
                      className="hidden"
                      id="branding-logo-file"
                    />
                    <label
                      htmlFor="branding-logo-file"
                      className="px-3.5 py-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1.5 shadow-xs transition-all"
                    >
                      <Upload size={13} />
                      Choisir une image
                    </label>
                    <p className="text-[10px] text-gray-400">Recommandé : PNG transparent carré ou paysage court (Max 2 Mo)</p>
                  </div>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-550 font-bold block">Ou spécifier une URL absolue :</span>
                  <input
                    type="text"
                    value={formLogo}
                    onChange={(e) => setFormLogo(e.target.value)}
                    className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Color Palettes Section */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎨 Thème & Nuanciers de Couleurs</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Couleur Primaire (Fonds, Titres)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formPrimary}
                    onChange={(e) => setFormPrimary(e.target.value)}
                    className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer shrink-0 p-0.5"
                  />
                  <input
                    type="text"
                    value={formPrimary}
                    onChange={(e) => setFormPrimary(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-250 rounded-xl text-xs font-mono font-bold uppercase"
                    placeholder="#0F1E36"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Couleur Secondaire (Accents, Réussite)</label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={formSecondary}
                    onChange={(e) => setFormSecondary(e.target.value)}
                    className="w-10 h-10 border border-gray-200 rounded-lg cursor-pointer shrink-0 p-0.5"
                  />
                  <input
                    type="text"
                    value={formSecondary}
                    onChange={(e) => setFormSecondary(e.target.value)}
                    className="flex-1 px-3 py-2 border border-gray-250 rounded-xl text-xs font-mono font-bold uppercase"
                    placeholder="#10B981"
                  />
                </div>
              </div>
            </div>

            {/* Presets */}
            <div className="space-y-1.5 pt-1">
              <span className="text-[10px] text-gray-500 font-bold block">Palettes Prédéfinies suggérées :</span>
              <div className="flex flex-wrap gap-2">
                {[
                  { name: "Default Classique", primary: "#0F1E36", secondary: "#10B981" },
                  { name: "Minuit Royal", primary: "#1E1B4B", secondary: "#F59E0B" },
                  { name: "Océan Profond", primary: "#0C4A6E", secondary: "#38BDF8" },
                  { name: "Forêt Émeraude", primary: "#064E3B", secondary: "#34D399" },
                  { name: "Saphir & Rose", primary: "#0F172A", secondary: "#EC4899" }
                ].map((p, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => {
                      setFormPrimary(p.primary);
                      setFormSecondary(p.secondary);
                    }}
                    className="px-2.5 py-1 bg-white hover:bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-semibold flex items-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                  >
                    <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300" style={{ backgroundColor: p.primary }} />
                    <span className="w-2.5 h-2.5 rounded-full inline-block border border-gray-300" style={{ backgroundColor: p.secondary }} />
                    <span className="text-gray-600 text-[9px] font-bold">{p.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Typography Customization Section */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>✍️ Styles de Typographie (Police de Caractères)</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Polices des Titres (Headings)</label>
                <select
                  value={formHeadingFont}
                  onChange={(e) => setFormHeadingFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="Inter">Inter (Sans-serif Moderne)</option>
                  <option value="Space Grotesk">Space Grotesk (Tech, Géométrique)</option>
                  <option value="Outfit">Outfit (Moderne, Arrondi)</option>
                  <option value="Playfair Display">Playfair Display (Élégant, Serif)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Moderne, Propre)</option>
                  <option value="Cinzel">Cinzel (Classique, Dramatique)</option>
                  <option value="Syne">Syne (Artistique, Expressif)</option>
                </select>
                <span className="text-[9px] text-gray-400 block font-medium">Applique la police aux titres (H1, H2, H3, etc.) de la plateforme.</span>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Police du Corps (Body Text)</label>
                <select
                  value={formBodyFont}
                  onChange={(e) => setFormBodyFont(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-violet-500 bg-white"
                >
                  <option value="Inter">Inter (Sans-serif Neutre)</option>
                  <option value="JetBrains Mono">JetBrains Mono (Tech, Monospace)</option>
                  <option value="Roboto">Roboto (Polyvalent, Lisible)</option>
                  <option value="Lora">Lora (Littéraire, Sérif élégant)</option>
                  <option value="Plus Jakarta Sans">Plus Jakarta Sans (Moderne & Net)</option>
                  <option value="Open Sans">Open Sans (Ultra lisible)</option>
                  <option value="Fira Code">Fira Code (Code, Monospace)</option>
                </select>
                <span className="text-[9px] text-gray-400 block font-medium">Applique la police aux paragraphes, listes, et textes d'information.</span>
              </div>
            </div>

            {/* Live Typography Preview */}
            <div className="p-4 bg-white border border-gray-150 rounded-xl space-y-2 mt-2">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider block">Aperçu direct de la typographie sélectionnée :</span>
              <div className="space-y-1 border-t border-dashed border-gray-100 pt-2">
                <h4 
                  style={{ fontFamily: formHeadingFont === 'Playfair Display' || formHeadingFont === 'Cinzel' ? `"${formHeadingFont}", serif` : `"${formHeadingFont}", sans-serif` }}
                  className="text-sm font-black text-gray-850"
                >
                  Voici un exemple de grand titre ({formHeadingFont})
                </h4>
                <p 
                  style={{ fontFamily: formBodyFont === 'Lora' ? `"${formBodyFont}", serif` : formBodyFont === 'JetBrains Mono' || formBodyFont === 'Fira Code' ? `"${formBodyFont}", monospace` : `"${formBodyFont}", sans-serif` }}
                  className="text-[11px] text-gray-500 leading-relaxed font-semibold"
                >
                  Ceci est un paragraphe de démonstration utilisant la police "{formBodyFont}". Il s'ajuste dynamiquement à la sélection de l'administrateur pour garantir la cohérence visuelle.
                </p>
              </div>
            </div>
          </div>

          {/* Landing Page Pictures */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🖼️ Illustrations de la Page d'Accueil</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Illustration Principale (Hero Banner)</label>
                <div className="flex items-center gap-3">
                  {formHero && (
                    <img src={formHero} className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Hero banner preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormHero)}
                      className="hidden"
                      id="branding-hero-file"
                    />
                    <label
                      htmlFor="branding-hero-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formHero}
                  onChange={(e) => setFormHero(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL de l'image de couverture"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Photo Section Élève (Témoignage/Portrait)</label>
                <div className="flex items-center gap-3">
                  {formStudent && (
                    <img src={formStudent} className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Student preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormStudent)}
                      className="hidden"
                      id="branding-student-file"
                    />
                    <label
                      htmlFor="branding-student-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formStudent}
                  onChange={(e) => setFormStudent(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL du portrait élève"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Photo de l'enseignant (M. Nabil Chaouch)</label>
                <div className="flex items-center gap-3">
                  {formTeacherAvatar ? (
                    <img src={formTeacherAvatar} className="w-12 h-12 object-cover rounded-xl border border-gray-200 shadow-xs shrink-0" alt="Teacher preview" />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 shrink-0">
                      <Users size={16} />
                    </div>
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormTeacherAvatar)}
                      className="hidden"
                      id="branding-teacher-avatar-file"
                    />
                    <label
                      htmlFor="branding-teacher-avatar-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formTeacherAvatar}
                  onChange={(e) => setFormTeacherAvatar(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL ou Base64 de la photo de l'enseignant"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Photo de la page de Connexion (Login)</label>
                <div className="flex items-center gap-3">
                  {formLogin && (
                    <img src={formLogin} className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Login preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormLogin)}
                      className="hidden"
                      id="branding-login-file"
                    />
                    <label
                      htmlFor="branding-login-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formLogin}
                  onChange={(e) => setFormLogin(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL du visuel de connexion"
                />
              </div>

              <div className="space-y-2">
                <label className="text-[11px] font-bold text-gray-600 block">Photo de la page d'Inscription (Register)</label>
                <div className="flex items-center gap-3">
                  {formRegister && (
                    <img src={formRegister} className="w-16 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Register preview" />
                  )}
                  <div className="flex-1 space-y-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, setFormRegister)}
                      className="hidden"
                      id="branding-register-file"
                    />
                    <label
                      htmlFor="branding-register-file"
                      className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                    >
                      <Upload size={11} />
                      Choisir une image
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={formRegister}
                  onChange={(e) => setFormRegister(e.target.value)}
                  className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                  placeholder="URL du visuel d'inscription"
                />
              </div>

              {/* SECTION: Advanced Auth Hero Illustration Customizer */}
              <div className="space-y-5 bg-gradient-to-br from-indigo-50/80 via-white to-blue-50/60 p-5 rounded-2xl border border-indigo-150 shadow-xs mt-4">
                <div className="flex items-center justify-between border-b border-indigo-100 pb-3">
                  <div>
                    <h4 className="font-extrabold text-xs text-indigo-950 flex items-center gap-2 uppercase tracking-wide">
                      <Sliders className="w-4 h-4 text-indigo-600" />
                      <span>Personnalisation de l'Illustration d'Inscription & Connexion</span>
                    </h4>
                    <p className="text-[11px] text-gray-500 font-medium mt-0.5">
                      Ajustez la taille, la forme du cadre (rounded), la couleur de fond Hex et l'ajustement de l'image.
                    </p>
                  </div>
                </div>

                {/* 1. Taille, Hauteur, Échelle & Object Fit */}
                <div className="space-y-3">
                  <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                    1. Dimensions & Échelle (Taille & Scale)
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {/* Width */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-bold text-gray-700">Largeur du Cadre (%)</label>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {authHeroConfig.width || 85}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={100}
                        step={5}
                        value={authHeroConfig.width || 85}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, width: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Height */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-bold text-gray-700">Hauteur de l'Image (px)</label>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {authHeroConfig.height || 480}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={220}
                        max={700}
                        step={10}
                        value={authHeroConfig.height || 480}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, height: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Scale */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-bold text-gray-700">Échelle / Zoom (%)</label>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {authHeroConfig.scale || 100}%
                        </span>
                      </div>
                      <input
                        type="range"
                        min={50}
                        max={150}
                        step={5}
                        value={authHeroConfig.scale || 100}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, scale: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Object Fit */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <label className="font-bold text-[11px] text-gray-700 block">Mode d'Ajustement</label>
                      <div className="grid grid-cols-2 gap-1.5 pt-0.5">
                        <button
                          type="button"
                          onClick={() => setAuthHeroConfig({ ...authHeroConfig, objectFit: "object-cover" })}
                          className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                            (authHeroConfig.objectFit || "object-cover") === "object-cover"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          Cover (Remplir)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAuthHeroConfig({ ...authHeroConfig, objectFit: "object-contain" })}
                          className={`px-2 py-1.5 text-[11px] font-bold rounded-lg border transition-all ${
                            authHeroConfig.objectFit === "object-contain"
                              ? "bg-indigo-600 text-white border-indigo-600 shadow-2xs"
                              : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                          }`}
                        >
                          Contain (Entier)
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. Sélection de la Forme (Bordures & Contours) */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                    2. Style de la Forme & Contours (Rounded & Borders)
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                    {[
                      { id: "rounded-none", label: "Bords Droits", desc: "Rectangulaire" },
                      { id: "rounded-xl", label: "Arrondi XL", desc: "Standard (12px)" },
                      { id: "rounded-2xl", label: "Grand Arrondi", desc: "Marqué (16px)" },
                      { id: "rounded-3xl", label: "3XL Grand", desc: "Recommandé (24px)" },
                      { id: "rounded-[2.5rem]", label: "Style Carte Pill", desc: "Pill Card (40px)" },
                      { id: "rounded-full", label: "Forme Ellipse", desc: "Circulaire Intégral" }
                    ].map((shape) => (
                      <button
                        key={shape.id}
                        type="button"
                        onClick={() => setAuthHeroConfig({ ...authHeroConfig, shapeClass: shape.id })}
                        className={`p-2 text-left rounded-xl border transition-all ${
                          (authHeroConfig.shapeClass || "rounded-3xl") === shape.id
                            ? "bg-indigo-100/80 border-indigo-600 text-indigo-950 font-black ring-2 ring-indigo-500/20 shadow-2xs"
                            : "bg-white border-gray-200 text-gray-700 hover:bg-gray-50 font-semibold"
                        }`}
                      >
                        <div className="text-[11px]">{shape.label}</div>
                        <div className="text-[9px] text-gray-400 font-medium">{shape.desc}</div>
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Border width */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <div className="flex justify-between items-center text-[11px]">
                        <label className="font-bold text-gray-700">Épaisseur de Bordure (px)</label>
                        <span className="font-extrabold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded text-[10px]">
                          {authHeroConfig.borderWidth ?? 4}px
                        </span>
                      </div>
                      <input
                        type="range"
                        min={0}
                        max={12}
                        step={1}
                        value={authHeroConfig.borderWidth ?? 4}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, borderWidth: Number(e.target.value) })}
                        className="w-full accent-indigo-600 cursor-pointer"
                      />
                    </div>

                    {/* Border color */}
                    <div className="space-y-1 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                      <label className="font-bold text-[11px] text-gray-700 block">Couleur de Bordure</label>
                      <div className="flex items-center gap-2">
                        <input
                          type="color"
                          value={authHeroConfig.borderColor || "#FFFFFF"}
                          onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, borderColor: e.target.value })}
                          className="w-8 h-8 rounded-lg cursor-pointer border border-gray-300 p-0.5"
                        />
                        <input
                          type="text"
                          value={authHeroConfig.borderColor || "#FFFFFF"}
                          onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, borderColor: e.target.value })}
                          className="flex-1 px-2.5 py-1 border border-gray-200 rounded-lg text-xs font-mono font-bold text-gray-800 uppercase"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* 3. Couleur de fond du panneau latéral */}
                <div className="space-y-2 pt-1">
                  <span className="text-[11px] font-extrabold text-indigo-900 uppercase tracking-wider block">
                    3. Couleur de Fond du Panneau Latéral (Container Background Color)
                  </span>

                  <div className="flex items-center gap-3 bg-white p-3 rounded-xl border border-gray-200 shadow-2xs">
                    <input
                      type="color"
                      value={authHeroConfig.backgroundColor || "#133F85"}
                      onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, backgroundColor: e.target.value })}
                      className="w-10 h-10 rounded-xl cursor-pointer border border-gray-300 shadow-2xs shrink-0"
                    />
                    <div className="flex-1 space-y-0.5">
                      <label className="text-[11px] font-bold text-gray-700 block">Code Couleur Hexadécimal</label>
                      <input
                        type="text"
                        value={authHeroConfig.backgroundColor || "#133F85"}
                        onChange={(e) => setAuthHeroConfig({ ...authHeroConfig, backgroundColor: e.target.value })}
                        className="w-full px-3 py-1 border border-gray-200 rounded-lg text-xs font-mono font-black text-gray-800 uppercase"
                        placeholder="#133F85"
                      />
                    </div>
                  </div>

                  {/* Palette de couleurs rapide */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {[
                      { name: "Bleu A-Zed", hex: "#133F85" },
                      { name: "Bleu Royal", hex: "#1D4ED8" },
                      { name: "Bleu Nuit", hex: "#0F1E36" },
                      { name: "Émeraude", hex: "#047857" },
                      { name: "Indigo", hex: "#4F46E5" },
                      { name: "Violet", hex: "#7C3AED" },
                      { name: "Anthracite", hex: "#111827" }
                    ].map((palette) => (
                      <button
                        key={palette.hex}
                        type="button"
                        onClick={() => setAuthHeroConfig({ ...authHeroConfig, backgroundColor: palette.hex })}
                        className="flex items-center gap-1.5 px-2 py-1 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 text-[10px] font-bold text-gray-700 transition-all shadow-2xs"
                      >
                        <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: palette.hex }} />
                        <span>{palette.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Aperçu Réactif Interactif en Temps Réel */}
                <div className="space-y-2 pt-3 border-t border-indigo-100">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-extrabold text-indigo-950 uppercase tracking-wider">
                      👁️ Aperçu Temps Réel de l'Illustration
                    </span>
                    <span className="text-[10px] bg-indigo-100 text-indigo-800 px-2 py-0.5 rounded font-bold">Live Admin</span>
                  </div>

                  <div className="w-full h-[380px] rounded-2xl overflow-hidden border border-indigo-200 shadow-md">
                    <AuthHeroBanner
                      config={authHeroConfig}
                      imageUrl={formRegister || formLogin || studentImageUrl}
                      showDetails={true}
                    />
                  </div>
                </div>
              </div>

            </div>
          </div>
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>✨ Icône de l'Application (Platform Icon)</span>
            </h3>

            <div className="space-y-2">
              <label className="text-[11px] font-bold text-gray-600 block">Icône personnalisée</label>
              <div className="flex items-center gap-3">
                {formIcon && (
                  <img src={formIcon} className="w-10 h-10 object-cover rounded-lg border border-gray-200 shadow-xs shrink-0" alt="Icon preview" />
                )}
                <div className="flex-1 space-y-1">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, setFormIcon)}
                    className="hidden"
                    id="branding-icon-file"
                  />
                  <label
                    htmlFor="branding-icon-file"
                    className="px-3 py-1.5 bg-white hover:bg-gray-50 text-gray-800 border border-gray-250 rounded-xl text-xs font-bold cursor-pointer inline-flex items-center gap-1 shadow-xs transition-all"
                  >
                    <Upload size={11} />
                    Choisir l'icône
                  </label>
                </div>
              </div>
              <input
                type="text"
                value={formIcon}
                onChange={(e) => setFormIcon(e.target.value)}
                className="w-full px-3.5 py-1.5 border border-gray-250 rounded-lg text-[11px] font-medium text-gray-600 focus:outline-none"
                placeholder="URL de l'icône (ou base64)"
              />
            </div>
          </div>

          {/* Landing Page Content Customizer Section */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>📢 Textes & Couleurs de la Page d'Accueil</span>
            </h3>

            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Titre Principal du Hero</label>
                <input
                  type="text"
                  value={formHeroTitle}
                  onChange={(e) => setFormHeroTitle(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="Ex: Prêt à dompter le Python ?"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Surlignement du Titre (Highlight)</label>
                <input
                  type="text"
                  value={formHeroHighlight}
                  onChange={(e) => setFormHeroHighlight(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none"
                  placeholder="Ex: Rejoignez l'élite des lycéens"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-gray-600 block">Description du Hero (Paragraphe)</label>
                <textarea
                  value={formHeroSubtext}
                  onChange={(e) => setFormHeroSubtext(e.target.value)}
                  className="w-full px-3.5 py-2 border border-gray-250 rounded-xl text-xs font-semibold focus:outline-none h-20"
                  placeholder="Texte de présentation de la plateforme..."
                />
              </div>
            </div>
          </div>

          {/* Floating Components and Overlays Customizer */}
          <div className="space-y-4 bg-slate-50/55 p-5 rounded-2xl border border-gray-150">
            <h3 className="font-extrabold text-xs text-gray-800 uppercase tracking-wider flex items-center gap-1.5">
              <span>🎯 Composants Flottants de l'Image Hero</span>
            </h3>

            <div className="space-y-6 divide-y divide-gray-100">
              
              {/* Overlay 1: Al Admis */}
              <div className="space-y-3 pt-2">
                <span className="text-[11px] font-extrabold text-pink-600 block">● Composant 1 : Al Admis (★)</span>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Texte affiché</label>
                    <input
                      type="text"
                      value={formAlAdmisText}
                      onChange={(e) => setFormAlAdmisText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs"
                      placeholder="Al Admis الـ"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Fond (CSS/Couleur)</label>
                      <input
                        type="text"
                        value={formAlAdmisBg}
                        onChange={(e) => setFormAlAdmisBg(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs font-mono"
                        placeholder="linear-gradient(...)"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Texte (Couleur)</label>
                      <input
                        type="color"
                        value={formAlAdmisTextColor.startsWith('#') ? formAlAdmisTextColor : '#ffffff'}
                        onChange={(e) => setFormAlAdmisTextColor(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay 2: خليها علينا */}
              <div className="space-y-3 pt-4">
                <span className="text-[11px] font-extrabold text-blue-600 block">● Composant 2 : خليها علينا 🎓</span>
                <div className="space-y-2">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Texte affiché</label>
                    <input
                      type="text"
                      value={formKhaliaAlaynaText}
                      onChange={(e) => setFormKhaliaAlaynaText(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs"
                      placeholder="خليها علينا 🎓"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Fond (Couleur/Hex)</label>
                      <input
                        type="color"
                        value={formKhaliaAlaynaBg.startsWith('#') ? formKhaliaAlaynaBg : '#0047AB'}
                        onChange={(e) => setFormKhaliaAlaynaBg(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Texte (Couleur/Hex)</label>
                      <input
                        type="color"
                        value={formKhaliaAlaynaTextColor.startsWith('#') ? formKhaliaAlaynaTextColor : '#ffffff'}
                        onChange={(e) => setFormKhaliaAlaynaTextColor(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Overlay 3: Platform Active */}
              <div className="space-y-3 pt-4">
                <span className="text-[11px] font-extrabold text-emerald-600 block">● Composant 3 : Platform Active 💻</span>
                <div className="space-y-2">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="space-y-1 col-span-2">
                      <label className="text-[10px] font-bold text-gray-500">Titre</label>
                      <input
                        type="text"
                        value={formPlatformActiveHeader}
                        onChange={(e) => setFormPlatformActiveHeader(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs"
                        placeholder="Platform Active"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Émoticône</label>
                      <input
                        type="text"
                        value={formPlatformActiveIcon}
                        onChange={(e) => setFormPlatformActiveIcon(e.target.value)}
                        className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs text-center"
                        placeholder="💻"
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-gray-500">Sous-titre</label>
                    <input
                      type="text"
                      value={formPlatformActiveSubtext}
                      onChange={(e) => setFormPlatformActiveSubtext(e.target.value)}
                      className="w-full px-3 py-1.5 border border-gray-250 rounded-lg text-xs"
                      placeholder="Interactive Dashboard"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Fond (Couleur/Hex)</label>
                      <input
                        type="color"
                        value={formPlatformActiveBg.startsWith('#') ? formPlatformActiveBg : '#ffffff'}
                        onChange={(e) => setFormPlatformActiveBg(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-500">Texte (Couleur/Hex)</label>
                      <input
                        type="color"
                        value={formPlatformActiveTextColor.startsWith('#') ? formPlatformActiveTextColor : '#1e293b'}
                        onChange={(e) => setFormPlatformActiveTextColor(e.target.value)}
                        className="w-full h-8 border border-gray-200 rounded-lg cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Visual Mockup Preview */}
        <div className="space-y-6">
          <div className="bg-slate-100 border border-slate-200 p-5 rounded-2xl sticky top-6 space-y-4 text-left">
            <span className="text-[9px] font-extrabold text-slate-500 uppercase tracking-wider block">👁️ Aperçu temps réel (Simulateur d'Écran)</span>
            
            {/* Header Simulator */}
            <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-2xs space-y-2 text-xs">
              <span className="text-[8px] font-bold text-gray-400 block uppercase">Barre de Navigation</span>
              <div className="flex items-center justify-between border-b pb-2">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-md overflow-hidden bg-slate-150 flex items-center justify-center font-bold text-white" style={{ backgroundColor: formPrimary }}>
                    {formLogo ? <img src={formLogo} className="w-full h-full object-cover" alt="logo" /> : (formText ? formText[0] : "P")}
                  </div>
                  <span className="font-extrabold text-gray-800 text-[11px]">{formText || "Platform"}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-3 h-3 rounded bg-gray-100 block" />
                  <span className="w-6 h-3 rounded block" style={{ backgroundColor: formPrimary }} />
                </div>
              </div>
            </div>

            {/* Main Interactive Button Simulator */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3 text-xs">
              <span className="text-[8px] font-bold text-gray-400 block uppercase">Composants Interactifs</span>
              <div className="space-y-2">
                <button type="button" className="w-full py-2 text-white font-extrabold rounded-lg text-center transition-all shadow-xs" style={{ backgroundColor: formPrimary }}>
                  Bouton Principal (Primaire)
                </button>
                <button type="button" className="w-full py-2 text-white font-extrabold rounded-lg text-center transition-all shadow-xs" style={{ backgroundColor: formSecondary }}>
                  Bouton de Réussite (Secondaire)
                </button>
              </div>
            </div>

            {/* Landing Hero Simulator */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-3 text-xs">
              <span className="text-[8px] font-bold text-gray-400 block uppercase">Maquette Landing Page</span>
              <div className="flex gap-3 items-center">
                <div className="flex-1 space-y-1">
                  <h4 className="font-extrabold text-gray-850 text-[10px] leading-tight" style={{ color: formPrimary }}>
                    {formHeroTitle || "Prêt à dompter le Python ?"}
                  </h4>
                  <p className="text-[8px] text-gray-550 leading-tight">
                    {formHeroSubtext || "Rejoignez l'élite des lycéens en Tunisie."}
                  </p>
                  <div className="w-12 h-3.5 rounded" style={{ backgroundColor: formSecondary }} />
                </div>
                <div className="w-16 h-12 rounded-lg overflow-hidden border shrink-0">
                  <img src={formHero || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500"} className="w-full h-full object-cover" alt="Hero portrait" />
                </div>
              </div>
            </div>

            {/* Float Components Simulator */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-2xs space-y-2.5 text-xs text-left">
              <span className="text-[8px] font-bold text-gray-400 block uppercase">Composants Flottants</span>
              <div className="space-y-1.5">
                <div className="text-[9px] font-bold px-2.5 py-1 rounded-lg border inline-block" style={{ background: formAlAdmisBg || "linear-gradient(to right, #f43f5e, #ec4899)", color: formAlAdmisTextColor || "#ffffff", borderColor: formAlAdmisTextColor || "#f43f5e" }}>
                  <span>{formAlAdmisText || "Al Admis الـ"}</span> <span className="text-yellow-350">★</span>
                </div>
                <div className="text-[9px] font-bold px-2.5 py-1 rounded-lg border block" style={{ backgroundColor: formKhaliaAlaynaBg || "#0047AB", color: formKhaliaAlaynaTextColor || "#ffffff", borderColor: formKhaliaAlaynaTextColor ? `${formKhaliaAlaynaTextColor}33` : "rgba(59, 130, 246, 0.3)" }}>
                  <span>{formKhaliaAlaynaText || "خليها علينا 🎓"}</span>
                </div>
                <div className="text-[9px] font-bold px-2.5 py-1 rounded-lg border flex items-center gap-1.5" style={{ backgroundColor: formPlatformActiveBg || "#ffffff", color: formPlatformActiveTextColor || "#1e293b", borderColor: formPlatformActiveTextColor ? `${formPlatformActiveTextColor}22` : "rgba(229, 231, 235, 1)" }}>
                  <span>{formPlatformActiveIcon || "💻"}</span>
                  <div>
                    <p className="font-extrabold text-[9px] leading-tight">{formPlatformActiveHeader || "Platform Active"}</p>
                    <p className="text-[7px] opacity-70 leading-none mt-0.5">{formPlatformActiveSubtext || "Interactive Dashboard"}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setShowPreviewModal(true)}
                className="w-full py-2.5 bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-extrabold rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer text-xs"
              >
                👁️ Aperçu plein écran (Landing Page)
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="w-full py-3 bg-[#0F1E36] hover:opacity-90 text-white font-extrabold rounded-xl transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                style={{ backgroundColor: formPrimary }}
              >
                {isSaving ? "Enregistrement en cours..." : "💾 Enregistrer le design de la plateforme"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {showPreviewModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-[#0F172A]/90 backdrop-blur-md flex flex-col justify-start overflow-y-auto"
          >
            {/* Modal Controls Header */}
            <div className="sticky top-0 z-50 bg-[#0F1E36] text-white border-b border-slate-800 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-lg">
              <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-400 font-bold border border-emerald-500/20">👁️</span>
                <div className="text-left">
                  <h3 className="font-extrabold text-sm tracking-tight">Aperçu interactif haute fidélité</h3>
                  <p className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Simulateur de Page d'Accueil</p>
                </div>
              </div>

              {/* Specs & Device Switcher */}
              <div className="flex flex-wrap items-center gap-3 bg-slate-900/50 p-1.5 rounded-xl border border-slate-800">
                <div className="hidden lg:flex items-center gap-3 px-3 py-1 border-r border-slate-800 text-[10px] font-bold text-slate-400">
                  <span>Police Titres : <span className="text-emerald-400 font-bold">{formHeadingFont}</span></span>
                  <span>•</span>
                  <span>Police Corps : <span className="text-emerald-400 font-bold">{formBodyFont}</span></span>
                  <span>•</span>
                  <span>Couleur Primaire : <span className="px-1.5 py-0.5 rounded text-white" style={{ backgroundColor: formPrimary }}>{formPrimary}</span></span>
                </div>

                <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg">
                  <button
                    type="button"
                    onClick={() => setPreviewMode("desktop")}
                    className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${previewMode === "desktop" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    🖥️ Bureau
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewMode("mobile")}
                    className={`px-3 py-1 rounded-md text-[10px] font-extrabold transition-all cursor-pointer ${previewMode === "mobile" ? "bg-slate-800 text-white shadow-xs" : "text-slate-400 hover:text-slate-200"}`}
                  >
                    📱 Mobile
                  </button>
                </div>
              </div>

              {/* Close Button */}
              <button
                type="button"
                onClick={() => setShowPreviewModal(false)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white text-xs font-extrabold rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <X size={14} />
                Quitter l'aperçu
              </button>
            </div>

            {/* Modal Body / Landing Page Workspace */}
            <div className="flex-1 p-4 md:p-8 bg-slate-100/50 flex justify-center items-start min-h-[calc(100vh-80px)]">
              <div 
                className={`w-full bg-white transition-all duration-300 rounded-3xl shadow-2xl border border-slate-250/60 overflow-hidden ${
                  previewMode === "mobile" ? "max-w-md min-h-[750px] my-6" : "max-w-7xl"
                }`}
                style={{ 
                  fontFamily: formBodyFont === "Lora" ? '"Lora", serif' : formBodyFont === "JetBrains Mono" ? '"JetBrains Mono", monospace' : formBodyFont === "Fira Code" ? '"Fira Code", monospace' : `"${formBodyFont}", sans-serif`
                }}
              >
                {/* 1. Header simulator inside mockup */}
                <header className="bg-white border-b border-gray-100 shadow-xs px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#0047AB] flex items-center justify-center text-white font-black text-xl shadow-md cursor-pointer" style={{ backgroundColor: formPrimary }}>
                        {formLogo ? <img src={formLogo} className="w-full h-full object-cover rounded-xl" alt="logo" /> : (formText ? formText[0] : "A")}
                      </div>
                      <div className="text-left">
                        <h1 
                          className="text-sm font-black tracking-tight text-[#0047AB] leading-none" 
                          style={{ 
                            fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`,
                            color: formPrimary 
                          }}
                        >
                          {formText || "A-Zed Info"}
                        </h1>
                        <span className="text-[8px] font-bold text-emerald-600 uppercase tracking-wider block mt-1">
                          Le spécialiste en informatique
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:flex items-center gap-4 text-xs font-bold text-gray-600">
                      <span className="hover:text-emerald-600 transition-colors cursor-pointer">À propos</span>
                      <span className="hover:text-emerald-600 transition-colors cursor-pointer">Fonctionnalités</span>
                      <span className="hover:text-emerald-600 transition-colors cursor-pointer">Nos qualités</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button type="button" className="px-3.5 py-1.5 text-xs font-bold text-gray-700 hover:bg-gray-50 rounded-xl transition-all cursor-pointer">
                        Connexion
                      </button>
                      <button type="button" className="px-3.5 py-1.5 text-xs font-bold text-white rounded-xl transition-all shadow-xs cursor-pointer" style={{ backgroundColor: formPrimary }}>
                        S'inscrire
                      </button>
                    </div>
                  </div>
                </header>

                {/* 2. Hero banner mockup inside mockup */}
                <section className="px-6 py-12 md:py-16 bg-gradient-to-br from-slate-50 to-white relative overflow-hidden">
                  <div className="absolute top-10 left-10 w-64 h-64 bg-emerald-400/5 rounded-full blur-3xl pointer-events-none" />
                  
                  <div className={`grid grid-cols-1 ${previewMode === "mobile" ? "gap-8" : "md:grid-cols-12 gap-12"} items-center max-w-6xl mx-auto`}>
                    
                    {/* Left hero column info */}
                    <div className={`${previewMode === "mobile" ? "text-center" : "md:col-span-7"} space-y-6 text-left`}>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 inline-block">
                        ✨ Excellence Académique & Algorithmes
                      </span>

                      <h2 
                        className="text-2xl md:text-4xl font-black text-[#0047AB] leading-tight tracking-tight"
                        style={{ 
                          fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                        }}
                      >
                        {formHeroTitle || "Prêt à dompter le Python ?"} <span className="relative inline-block text-transparent bg-clip-text" style={{ backgroundImage: `linear-gradient(135deg, ${formPrimary}, ${formSecondary})` }}>{formHeroHighlight || "Rejoignez l'élite"}</span>
                      </h2>

                      <p className="text-xs md:text-sm text-gray-550 leading-relaxed font-semibold">
                        {formHeroSubtext || "Rejoignez la plateforme leader en Tunisie pour exceller en informatique, algorithmique et matières scientifiques."}
                      </p>

                      <div className={`flex flex-wrap items-center gap-3 ${previewMode === "mobile" ? "justify-center" : "justify-start"}`}>
                        <button 
                          type="button" 
                          className="px-6 py-3 text-white font-extrabold rounded-xl text-xs transition-all shadow-md hover:scale-102 flex items-center gap-2 cursor-pointer"
                          style={{ 
                            backgroundColor: formPrimary, 
                            fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                          }}
                        >
                          <span>Découvrir les cours</span>
                          <ArrowRight size={14} />
                        </button>
                        <button 
                          type="button" 
                          className="px-6 py-3 bg-white border border-gray-250 text-gray-700 hover:bg-gray-50 font-extrabold rounded-xl text-xs transition-all shadow-xs cursor-pointer"
                          style={{ 
                            fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                          }}
                        >
                          Espace Parent
                        </button>
                      </div>

                      {/* Trust indicators */}
                      <div className={`pt-4 border-t border-gray-100 flex items-center gap-4 text-[10px] text-gray-450 font-semibold ${previewMode === "mobile" ? "justify-center" : "justify-start"}`}>
                        <span className="flex items-center gap-1">✅ +1,200 Élèves Admis</span>
                        <span>•</span>
                        <span className="flex items-center gap-1">⭐ Note Globale 4.9/5</span>
                      </div>
                    </div>

                    {/* Right hero column visuals with student portrait overlays */}
                    <div className={`${previewMode === "mobile" ? "md:col-span-12" : "md:col-span-5"} flex justify-center`}>
                      <div className="relative w-full max-w-sm aspect-square bg-slate-50 border border-gray-150 rounded-3xl overflow-hidden p-6 shadow-xl flex items-center justify-center">
                        {/* Background Hero design */}
                        <div className="absolute inset-0 z-0">
                          <img 
                            src={formHero || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500"} 
                            className="w-full h-full object-cover opacity-85" 
                            alt="Background Hero" 
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-transparent to-transparent" />
                        </div>

                        {/* Interactive Float Overlays */}
                        <div className="absolute inset-0 z-10 p-5 pointer-events-none flex flex-col justify-between">
                          
                          {/* Al Admis Badge */}
                          <div className="self-start">
                            <span 
                              className="px-3.5 py-1.5 rounded-xl border font-bold text-[10px] shadow-lg inline-block transform -rotate-2"
                              style={{ 
                                background: formAlAdmisBg || "linear-gradient(to right, #f43f5e, #ec4899)", 
                                color: formAlAdmisTextColor || "#ffffff",
                                borderColor: formAlAdmisTextColor ? `${formAlAdmisTextColor}33` : "#f43f5e"
                              }}
                            >
                              <span>{formAlAdmisText || "Al Admis الـ"}</span> <span className="text-yellow-350">★</span>
                            </span>
                          </div>

                          {/* Middle Overlay - Student Portrait Container */}
                          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 flex justify-center">
                            <div className="w-20 h-20 rounded-full border-4 border-white shadow-2xl overflow-hidden bg-slate-200">
                              <img 
                                src={formStudent || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=300"} 
                                className="w-full h-full object-cover" 
                                alt="Student portrait" 
                              />
                            </div>
                          </div>

                          {/* Bottom floating components */}
                          <div className="space-y-1.5 self-stretch mt-auto">
                            
                            {/* Khalia Alayna Dialect Banner */}
                            <div 
                              className="px-3.5 py-2 rounded-xl border font-extrabold text-[10px] shadow-lg text-center backdrop-blur-xs transform rotate-1"
                              style={{ 
                                backgroundColor: formKhaliaAlaynaBg || "#0047AB", 
                                color: formKhaliaAlaynaTextColor || "#ffffff",
                                borderColor: formKhaliaAlaynaTextColor ? `${formKhaliaAlaynaTextColor}33` : "rgba(255,255,255,0.15)"
                              }}
                            >
                              {formKhaliaAlaynaText || "خليها علينا 🎓"}
                            </div>

                            {/* Platform Active overlay */}
                            <div 
                              className="px-3 py-2 rounded-xl border text-[10px] shadow-xl flex items-center gap-2.5"
                              style={{ 
                                backgroundColor: formPlatformActiveBg || "#ffffff", 
                                color: formPlatformActiveTextColor || "#1e293b",
                                borderColor: formPlatformActiveTextColor ? `${formPlatformActiveTextColor}11` : "rgba(229, 231, 235, 1)"
                              }}
                            >
                              <span className="text-xs">{formPlatformActiveIcon || "💻"}</span>
                              <div className="text-left">
                                <p className="font-extrabold leading-none">{formPlatformActiveHeader || "Platform Active"}</p>
                                <p className="text-[8px] opacity-70 mt-0.5 leading-none">{formPlatformActiveSubtext || "Interactive Dashboard"}</p>
                              </div>
                            </div>

                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                </section>

                {/* 3. Sample Course Offerings section mockup */}
                <section className="px-6 py-12 bg-slate-50 border-t border-gray-100">
                  <div className="max-w-4xl mx-auto text-center space-y-8">
                    <div className="space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-emerald-600 block">📚 Nos Programmes Phares</span>
                      <h3 
                        className="text-xl md:text-2xl font-black text-[#0047AB]" 
                        style={{ 
                          fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                        }}
                      >
                        Améliorez vos compétences informatiques
                      </h3>
                      <p className="text-xs text-gray-500 max-w-md mx-auto">
                        Explorez nos packages de cours d'algorithmique et programmation Python pensés pour votre réussite.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
                      {/* Card 1 */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: formPrimary }}>
                          💡
                        </div>
                        <div className="space-y-1.5">
                          <h4 
                            className="text-sm font-extrabold text-gray-800" 
                            style={{ 
                              fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                            }}
                          >
                            Python Fondamentaux (Bac Tunisien)
                          </h4>
                          <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                            Apprenez les bases solides : variables, boucles conditionnelles, et fonctions avec un compilateur Python interactif intégré.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-gray-600">
                          <span>⏱️ 12h de vidéos</span>
                          <span className="text-emerald-600" style={{ color: formSecondary }}>Gratuit / Premium</span>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all space-y-4">
                        <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: formSecondary }}>
                          🚀
                        </div>
                        <div className="space-y-1.5">
                          <h4 
                            className="text-sm font-extrabold text-gray-800" 
                            style={{ 
                              fontFamily: formHeadingFont === "Playfair Display" ? '"Playfair Display", serif' : formHeadingFont === "Cinzel" ? '"Cinzel", serif' : `"${formHeadingFont}", sans-serif`
                            }}
                          >
                            Algorithmique Avancée & Structures
                          </h4>
                          <p className="text-xs text-gray-550 leading-relaxed font-semibold">
                            Maîtrisez les structures de données, le tri, la recherche dichotomique et préparez brillamment vos examens d'informatique.
                          </p>
                        </div>
                        <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] font-extrabold text-gray-600">
                          <span>⏱️ 20h de vidéos</span>
                          <span className="text-emerald-600" style={{ color: formSecondary }}>Recommandé ⭐</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </section>

                {/* 4. Footer mockup */}
                <footer className="bg-[#0047AB] text-slate-300 py-8 px-6 text-center text-xs space-y-4" style={{ backgroundColor: formPrimary }}>
                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4 max-w-4xl mx-auto">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded bg-white text-[#0047AB] flex items-center justify-center font-bold text-xs" x�|S]k�0}ﯸ��
k����nE���/���[H��ď���7�?���p�؇p��ܓ�{�69ǰ(`&�T��H��K�ʡ,��|�	|�Qa�j��3N�~�)�$�¸��`pm��^/[�5��$v}�de ��#�2�7���L�GU�02�4O(S0d:�j��:�^�FŒXdL|"o����Ȕ\����B�;��j�,-�=��U�j��� ����Q$�ؤ.e�1[Z��8�}|���4�ݛn�؞���B�
�����hFΟ��v��`Ã�\h��dF���V;\V�gq��{��X�'RT��3��V��0)�?��a���38V�Q̰��7���;}�t\gR�1�n �S&Rhɱ��   �� ��