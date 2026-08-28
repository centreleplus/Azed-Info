import React, { useState, useEffect, useRef } from "react";
import { ProfileDropdown } from "./components/ProfileDropdown";
import { FloatingNavControls } from "./components/FloatingNavControls";
import PDFLibraryView, { BibliothequeWrapper } from "./components/PDFLibraryView";
import { useAuth } from "./components/AuthContext";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { motion, AnimatePresence } from "motion/react";
import { useRealtimeSync } from "./lib/useRealtimeSync";
import { useNotifications } from "./lib/useNotifications";
import {
  User as UserIcon,
  LogOut,
  Video,
  Calendar as CalendarIcon,
  Code,
  Lock,
  BookOpen,
  ShoppingBag,
  Bell,
  Search,
  AlertTriangle,
  Menu,
  Grid,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  ShieldAlert,
  ShieldCheck,
  Clock,
  HelpCircle,
  Upload,
  History,
  Trash2,
  X,
  ChevronLeft,
  ChevronRight,
  Users,
  UserCheck,
  DollarSign,
  PlusCircle,
  Package,
  BookMarked,
  Layers,
  ChevronDown,
  RefreshCw,
  Eye,
  EyeOff,
  CheckCircle,
  Check,
  Save,
  ListTodo,
  Palette,
  Contrast,
  Maximize2,
  Minimize2,
  Sun,
  Moon,
  FileText,
  ArrowUp,
  ChevronUp,
  ChevronsUp,
  PlayCircle
} from "lucide-react";
import { User as UserType, EBook, Notification, Product, CartItem, AuthHeroImageConfig, DEFAULT_AUTH_HERO_CONFIG } from "./types";
import AuthHeroBanner from "./components/AuthHeroBanner";
import EBookReader from "./components/EBookReader";
import SandboxPython from "./components/SandboxPython";
import ChallengeTimer from "./components/ChallengeTimer";
import RegisterMultiStep from "./components/RegisterMultiStep";
import ShopView from "./components/ShopView";
import ProfileView from "./components/ProfileView";
import StudentDemoView from "./components/StudentDemoView";
import { LicenseBadge } from "./components/ui/LicenseBadge";
import CoursView from "./components/CoursView";
import CalendrierView from "./components/CalendrierView";
import TodoCalendrierView from "./components/TodoCalendrierView";
import CalendrierAnnuelView from "./components/CalendrierAnnuelView";
import NotificationsDropdown from "./components/NotificationsDropdown";
import AdminConsole from "./components/AdminConsole";
import AdminSidebar from "./components/AdminSidebar";
import AgentConsole from "./components/AgentConsole";
import Footer from "./components/Footer";
import FreemiumLockOverlay from "./components/FreemiumLockOverlay";
import InteractiveQuizModule from "./components/InteractiveQuizModule";
import DevoirsView from "./components/DevoirsView";
import CorrectionView from "./components/CorrectionView";
import PythonViewerPage from "./components/PythonViewerPage";
import TextViewerPage from "./components/TextViewerPage";
import DocumentViewerPage from "./components/DocumentViewerPage";
import StudentDashboard from "./components/StudentDashboard";
import { getDefaultRouteForRole, isValidRouteForRole } from "./components/AppRoutes";
import { 
  getStoredMediaItems, 
  getMenuIconMediaItem, 
  getCollapsedSidebarMediaItem,
  getRandomCollapsedSidebarImage, 
  IconMediaItem 
} from "./components/mediaIconsStore";
import { ExerciseItem } from "./components/ExerciceDetailModal";
import BackButton from "./components/BackButton";
import LandingPage from "./components/LandingPage";
import { Language, translations } from "./lib/translations";
import { getLanguageFlag } from "./components/Flags";

const languageOptions = [
  { code: "ar" as Language, name: "العربية", flag: getLanguageFlag("ar") },
  { code: "fr" as Language, name: "Français", flag: getLanguageFlag("fr") },
  { code: "en" as Language, name: "English", flag: getLanguageFlag("en") }
];

interface EyelashEyeIconProps {
  isOpen: boolean;
}

function EyelashEyeIcon({ isOpen }: EyelashEyeIconProps) {
  return (
    <motion.svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      initial={{
        scale: 1,
        rotate: 0,
      }}
      animate={{
        scale: isOpen ? [1, 1.2, 1] : [1, 0.85, 1],
        rotate: isOpen ? 0 : 360,
      }}
      transition={{ duration: 0.45, ease: "easeInOut" }}
      className="w-[18px] h-[18px] select-none pointer-events-none text-gray-400 hover:text-gray-600 transition-colors"
    >
      {/* Upper/Lower Lid Arc Morphing */}
      <motion.path
        initial={{
          d: "M3 12 Q12 4 21 12 Q12 20 3 12",
          opacity: 1,
        }}
        animate={{
          d: isOpen
            ? "M3 12 Q12 4 21 12 Q12 20 3 12" // Open Eye Shape (Double Arc)
            : "M3 11 Q12 17 21 11 Q12 17 3 11", // Closed Eye Shape (Collapsed to single downward arc)
          opacity: 1,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      />

      {/* Pupil Circle (fades and shrinks out when closed) */}
      <motion.circle
        cx="12"
        cy="12"
        initial={{
          r: 0,
          opacity: 0,
        }}
        animate={{
          r: isOpen ? 3 : 0,
          opacity: isOpen ? 1 : 0,
        }}
        transition={{ duration: 0.25, ease: "easeInOut" }}
        fill="currentColor"
      />

      {/* Dynamic Animated Eyelashes */}
      {/* Lash 1: Outer Left */}
      <motion.path
        initial={{
          d: "M6.5 8 L4.5 5",
          opacity: 1,
        }}
        animate={{
          d: isOpen
            ? "M6.5 8 L4.5 5" // Upper left lash pointing up-left
            : "M6.5 13.5 L4.5 16.5", // Lower left lash pointing down-left
          opacity: 1,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      />

      {/* Lash 2: Inner Left */}
      <motion.path
        initial={{
          d: "M10 5.5 L9.5 2",
          opacity: 1,
        }}
        animate={{
          d: isOpen
            ? "M10 5.5 L9.5 2" // Middle-left lash pointing up
            : "M10 15.5 L9.5 19", // Middle-left lash pointing down
          opacity: 1,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      />

      {/* Lash 3: Inner Right */}
      <motion.path
        initial={{
          d: "M14 5.5 L14.5 2",
          opacity: 1,
        }}
        animate={{
          d: isOpen
            ? "M14 5.5 L14.5 2" // Middle-right lash pointing up
            : "M14 15.5 L14.5 19", // Middle-right lash pointing down
          opacity: 1,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      />

      {/* Lash 4: Outer Right */}
      <motion.path
        initial={{
          d: "M17.5 8 L19.5 5",
          opacity: 1,
        }}
        animate={{
          d: isOpen
            ? "M17.5 8 L19.5 5" // Upper right lash pointing up-right
            : "M17.5 13.5 L19.5 16.5", // Lower right lash pointing down-right
          opacity: 1,
        }}
        transition={{ duration: 0.35, ease: "easeInOut" }}
      />
    </motion.svg>
  );
}

export default function App() {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem("user_preferred_language");
      if (saved === "ar" || saved === "fr" || saved === "en") {
        return saved as Language;
      }
    } catch (e) {
      console.error("Error reading preferred language from localStorage:", e);
    }
    return "fr";
  });

  useEffect(() => {
    try {
      localStorage.setItem("user_preferred_language", currentLanguage);
    } catch (e) {
      console.error("Error writing preferred language to localStorage:", e);
    }
    document.documentElement.dir = currentLanguage === "ar" ? "rtl" : "ltr";
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved === "light" || saved === "dark") {
        return saved as "light" | "dark";
      }
    } catch (e) {
      console.error("Error reading theme from localStorage:", e);
    }
    // Fallback to system OS preference on startup if no manual preference exists
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    return "light";
  });

  useEffect(() => {
    try {
      localStorage.setItem("theme", theme);
    } catch (e) {
      console.error("Error writing theme to localStorage:", e);
    }
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Listen to OS prefers-color-scheme changes dynamically without page refresh
  useEffect(() => {
    if (typeof window === "undefined" || !window.matchMedia) return;
    
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = (e: MediaQueryListEvent) => {
      setTheme(e.matches ? "dark" : "light");
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      mediaQuery.addListener(handleChange);
    }

    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        mediaQuery.removeListener(handleChange);
      }
    };
  }, []);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isScrollHovered, setIsScrollHovered] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 300) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);
  const [showLandingPage, setShowLandingPage] = useState<boolean>(true);
  const { user: currentUser, setUser: setCurrentUser } = useAuth();
  const [isManualsMenuOpen, setIsManualsMenuOpen] = useState(false);
  const [sessionToken, setSessionToken] = useState<string | null>(null);

  const [scrollTopPosition, setScrollTopPosition] = useState<'bottom-right' | 'bottom-left' | 'top-right' | 'top-left'>("bottom-right");
  const [scrollTopIcon, setScrollTopIcon] = useState<'arrow' | 'chevron' | 'chevrons'>("arrow");
  const [hideScrollTopOnMobile, setHideScrollTopOnMobile] = useState<boolean>(false);

  // Sync scroll preferences based on current authenticated user to prevent leakage
  useEffect(() => {
    if (!currentUser) {
      // Unauthenticated visitors (landing page) get default standard values
      setScrollTopPosition("bottom-right");
      setScrollTopIcon("arrow");
      setHideScrollTopOnMobile(false);
    } else {
      // Authenticated users load customized settings from localStorage keyed by user ID or role
      const userId = currentUser.id || currentUser.role || "user";
      try {
        const savedPos = localStorage.getItem(`scroll_top_position_${userId}`);
        setScrollTopPosition((savedPos as any) || "bottom-right");
      } catch {
        setScrollTopPosition("bottom-right");
      }

      try {
        const savedIcon = localStorage.getItem(`scroll_top_icon_${userId}`);
        setScrollTopIcon((savedIcon as any) || "arrow");
      } catch {
        setScrollTopIcon("arrow");
      }

      try {
        const savedHide = localStorage.getItem(`scroll_top_hide_on_mobile_${userId}`);
        setHideScrollTopOnMobile(savedHide === "true");
      } catch {
        setHideScrollTopOnMobile(false);
      }
    }
  }, [currentUser?.id, currentUser?.role]);

  const handleUpdateScrollTopPosition = (pos: 'bottom-right' | 'bottom-left' | 'top-right' | 'top-left') => {
    setScrollTopPosition(pos);
    if (currentUser) {
      const userId = currentUser.id || currentUser.role || "user";
      try {
        localStorage.setItem(`scroll_top_position_${userId}`, pos);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateScrollTopIcon = (icon: 'arrow' | 'chevron' | 'chevrons') => {
    setScrollTopIcon(icon);
    if (currentUser) {
      const userId = currentUser.id || currentUser.role || "user";
      try {
        localStorage.setItem(`scroll_top_icon_${userId}`, icon);
      } catch (e) {
        console.error(e);
      }
    }
  };

  const handleUpdateHideScrollTopOnMobile = (hide: boolean) => {
    setHideScrollTopOnMobile(hide);
    if (currentUser) {
      const userId = currentUser.id || currentUser.role || "user";
      try {
        localStorage.setItem(`scroll_top_hide_on_mobile_${userId}`, String(hide));
      } catch (e) {
        console.error(e);
      }
    }
  };

  const getScrollBtnPositionStyles = () => {
    switch (scrollTopPosition) {
      case "bottom-left":
        return {
          btnClass: "fixed bottom-6 left-6",
          tooltipClass: "fixed bottom-[1.75rem] left-20",
          arrowClass: "absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-800 border-l border-b border-slate-800 dark:border-slate-700",
          initialX: -10,
          initialY: 24,
        };
      case "top-right":
        return {
          btnClass: "fixed top-24 right-6",
          tooltipClass: "fixed top-[6.25rem] right-20",
          arrowClass: "absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-t border-slate-800 dark:border-slate-700",
          initialX: 10,
          initialY: -24,
        };
      case "top-left":
        return {
          btnClass: "fixed top-24 left-6",
          tooltipClass: "fixed top-[6.25rem] left-20",
          arrowClass: "absolute left-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-800 border-l border-b border-slate-800 dark:border-slate-700",
          initialX: -10,
          initialY: -24,
        };
      case "bottom-right":
      default:
        return {
          btnClass: "fixed bottom-6 right-6",
          tooltipClass: "fixed bottom-[1.75rem] right-20",
          arrowClass: "absolute right-[-4px] top-1/2 -translate-y-1/2 w-2 h-2 rotate-45 bg-slate-900 dark:bg-slate-800 border-r border-t border-slate-800 dark:border-slate-700",
          initialX: 10,
          initialY: 24,
        };
    }
  };

  const posStyles = getScrollBtnPositionStyles();
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Forgot Password modal state & anti-spam timer
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState("");
  const [forgotPasswordSubmitting, setForgotPasswordSubmitting] = useState(false);
  const [forgotPasswordSuccessMsg, setForgotPasswordSuccessMsg] = useState<string | null>(null);
  const [forgotPasswordErrorMsg, setForgotPasswordErrorMsg] = useState<string | null>(null);
  const [antiSpamTimer, setAntiSpamTimer] = useState(0);

  useEffect(() => {
    if (antiSpamTimer <= 0) return;
    const interval = setInterval(() => {
      setAntiSpamTimer((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(interval);
  }, [antiSpamTimer]);

  const handleOpenForgotPassword = () => {
    setForgotPasswordEmail(email || "");
    setForgotPasswordErrorMsg(null);
    setForgotPasswordSuccessMsg(null);
    setShowForgotPasswordModal(true);
  };

  const handleForgotPasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!forgotPasswordEmail.trim()) {
      setForgotPasswordErrorMsg("Veuillez saisir votre adresse e-mail.");
      return;
    }
    if (antiSpamTimer > 0) {
      setForgotPasswordErrorMsg(`Veuillez patienter encore ${antiSpamTimer} secondes avant de renvoyer une demande.`);
      return;
    }

    setForgotPasswordSubmitting(true);
    setForgotPasswordErrorMsg(null);
    setForgotPasswordSuccessMsg(null);

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: forgotPasswordEmail })
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.message || "Erreur lors de la transmission de la demande.");
      }

      setForgotPasswordSuccessMsg(data.message || "Votre demande a bien été transmise à l'administration. Un e-mail d'assistance ou un lien de réinitialisation vous sera envoyé très rapidement sur votre adresse e-mail.");
      setAntiSpamTimer(60);
    } catch (err: any) {
      setForgotPasswordErrorMsg(err.message || "Impossible de traiter votre demande. Veuillez réessayer.");
    } finally {
      setForgotPasswordSubmitting(false);
    }
  };

  const [searchQuery, setSearchQuery] = useState("");
  const [appMediaItems, setAppMediaItems] = useState<IconMediaItem[]>(() => getStoredMediaItems());

  useEffect(() => {
    const handleMediaSync = (e?: any) => {
      if (e?.detail) {
        setAppMediaItems(e.detail);
      } else {
        setAppMediaItems(getStoredMediaItems());
      }
    };
    window.addEventListener("media-icons-updated", handleMediaSync);
    window.addEventListener("azed_assets_updated", handleMediaSync);
    window.addEventListener("azed_config_updated", handleMediaSync);
    window.addEventListener("storage", handleMediaSync);
    return () => {
      window.removeEventListener("media-icons-updated", handleMediaSync);
      window.removeEventListener("azed_assets_updated", handleMediaSync);
      window.removeEventListener("azed_config_updated", handleMediaSync);
      window.removeEventListener("storage", handleMediaSync);
    };
  }, []);

  const renderNavIcon = (
    key: 'fiches' | 'devoirs' | 'corrections' | 'revision' | 'quiz',
    DefaultIcon: React.ElementType,
    defaultColorClass: string
  ) => {
    const visual = getMenuIconMediaItem(key, appMediaItems);
    if (visual && visual.visible && visual.url) {
      return (
        <img
          src={visual.url}
          alt={visual.name}
          style={{ width: `${Math.min(visual.size || 18, 20)}px`, height: `${Math.min(visual.size || 18, 20)}px` }}
          className={`object-contain shrink-0 ${visual.shape || "rounded-md"}`}
        />
      );
    }
    return <DefaultIcon size={13} className={defaultColorClass} />;
  };

  const [searchHistory, setSearchHistory] = useState<string[]>(() => {
    try {
      const stored = localStorage.getItem("search_history_items");
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [showHistoryDropdown, setShowHistoryDropdown] = useState(false);

  const addToSearchHistory = (query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setSearchHistory((prev) => {
      const filtered = prev.filter((item) => item.toLowerCase() !== trimmed.toLowerCase());
      const updated = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("search_history_items", JSON.stringify(updated));
      return updated;
    });
  };

  const removeHistoryItem = (itemToRemove: string, e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSearchHistory((prev) => {
      const updated = prev.filter((item) => item !== itemToRemove);
      localStorage.setItem("search_history_items", JSON.stringify(updated));
      return updated;
    });
  };

  const clearAllHistory = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setSearchHistory([]);
    localStorage.removeItem("search_history_items");
  };

  // Navigation page paths (hash routing enabled of distinct paths)
  const isViewerTab = (tab: string) => {
    return (
      tab.startsWith("student/viewer") ||
      tab.startsWith("document-viewer") ||
      tab.startsWith("student/code-viewer") ||
      tab.startsWith("python-code-viewer") ||
      tab.startsWith("student/text-viewer") ||
      tab.startsWith("text-document-viewer") ||
      tab.startsWith("student/pdf-viewer") ||
      tab.startsWith("student/video-viewer")
    );
  };

  const [currentTab, setCurrentTab] = useState<string>("cours");
  const [lastNonViewerTab, setLastNonViewerTab] = useState<string>(() => {
    try {
      return (typeof sessionStorage !== "undefined" && sessionStorage.getItem("lastStudentTab")) || "cours";
    } catch {
      return "cours";
    }
  });

  // Track the origin view/section whenever a non-viewer tab is active
  useEffect(() => {
    if (!isViewerTab(currentTab)) {
      setLastNonViewerTab(currentTab);
      try {
        sessionStorage.setItem("lastStudentTab", currentTab);
      } catch {
        // ignore
      }
    }
  }, [currentTab]);

  // Dynamic and universal "Retour" handler for all viewers
  const handleViewerBack = () => {
    let targetTab = lastNonViewerTab;
    if (!targetTab || isViewerTab(targetTab)) {
      try {
        const stored = typeof sessionStorage !== "undefined" ? sessionStorage.getItem("lastStudentTab") : null;
        if (stored && !isViewerTab(stored)) {
          targetTab = stored;
        } else {
          targetTab = "cours";
        }
      } catch {
        targetTab = "cours";
      }
    }

    setCurrentTab(targetTab);
    setActivePythonExercise(null);
    setActiveTxtExercise(null);
    setActiveDocExercise(null);

    if (typeof window !== "undefined") {
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.location.hash = `#/${targetTab}`;
      }
    }
  };
  const [activePythonExercise, setActivePythonExercise] = useState<ExerciseItem | null>(null);
  const [pythonExerciseId, setPythonExerciseId] = useState<string>("");
  const [activeTxtExercise, setActiveTxtExercise] = useState<ExerciseItem | null>(null);
  const [txtExerciseId, setTxtExerciseId] = useState<string>("");
  const [activeDocExercise, setActiveDocExercise] = useState<ExerciseItem | null>(null);
  const [docExerciseId, setDocExerciseId] = useState<string>("");
  const [selectedTrimestre, setSelectedTrimestre] = useState<string>("1ere trimestre");
  const [revisionSubTab, setRevisionSubTab] = useState<"enonce" | "correction">("enonce");
  const [shopCategoryFilter, setShopCategoryFilter] = useState<string>("All");
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(true);
  const [collapsedSidebarImage, setCollapsedSidebarImage] = useState<string>(() => getRandomCollapsedSidebarImage());

  const handleToggleSidebar = (open: boolean) => {
    if (!open) {
      try {
        const storedList = typeof localStorage !== 'undefined' ? JSON.parse(localStorage.getItem('azed_collapsed_images_list') || '[]') : [];
        if (Array.isArray(storedList) && storedList.length > 0) {
          const randomIndex = Math.floor(Math.random() * storedList.length);
          setCollapsedSidebarImage(storedList[randomIndex]);
        } else {
          setCollapsedSidebarImage(getRandomCollapsedSidebarImage(appMediaItems));
        }
      } catch {
        setCollapsedSidebarImage(getRandomCollapsedSidebarImage(appMediaItems));
      }
    }
    setIsSidebarOpen(open);
  };

  // Interactive Live overlay states
  const [isCalendarOverlayOpen, setIsCalendarOverlayOpen] = useState(false);

  // Notifications management hook with real-time WebSocket sync and 5s polling
  const {
    notifications,
    unreadCount,
    markAllRead: handleMarkNotificationsRead,
    deleteOne: handleDeleteOneNotification,
    clearAll: handleClearAllNotifications,
    refreshNotifications: fetchNotifications
  } = useNotifications(
    currentUser?.role,
    currentUser?.id,
    currentUser?.study_group || (currentUser as any)?.groupe_etude
  );

  // Connect to real-time WebSockets to refresh notification state across roles
  useRealtimeSync((msg) => {
    if (msg.type === "NOTIFICATION_CREATED" && msg.notification) {
      fetchNotifications();
    } else if (msg.type === "EVENT_CREATED" || msg.type === "TODO_CREATED" || msg.type === "EVENT_UPDATED" || msg.type === "EVENT_DELETED") {
      fetchNotifications();
    }
  });

  // Ebooks list
  const [ebooks, setEbooks] = useState<EBook[]>([]);

  // Courses list for search suggestions
  const [coursesList, setCoursesList] = useState<any[]>([]);

  // Boutique purchase cart/favorites (avec dédoublonnage automatique strict)
  const [cart, setCart] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem("azed_cart");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Conserver une seule occurrence par produit
          return Array.from(
            new Map(
              parsed.map((item: any) => [
                item.product ? item.product.id : item.id,
                {
                  ...item,
                  quantity: 1
                }
              ])
            ).values()
          );
        }
      }
    } catch (e) {
      console.error("Erreur de chargement du panier:", e);
    }
    return [];
  });

  useEffect(() => {
    try {
      localStorage.setItem("azed_cart", JSON.stringify(cart));
    } catch (e) {
      console.error("Erreur d'enregistrement du panier:", e);
    }
  }, [cart]);

  const [wishlist, setWishlist] = useState<Product[]>([]);

  // Admin isolation user list
  const [allUsersList, setAllUsersList] = useState<UserType[]>([]);
  const [profileDropdownOpen, setProfileDropdownOpen] = useState<boolean>(false);
  const profileDropdownRef = useRef<HTMLDivElement>(null);

  // Click-outside listener to close user profile dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        profileDropdownRef.current &&
        !profileDropdownRef.current.contains(event.target as Node)
      ) {
        setProfileDropdownOpen(false);
      }
    };

    if (profileDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      document.addEventListener("touchstart", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [profileDropdownOpen]);

  // Reset profile dropdown state on route or role change
  useEffect(() => {
    setProfileDropdownOpen(false);
  }, [currentTab, currentUser?.role, currentUser?.id]);

  // Brand organization settings
  const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoFileBase64, setLogoFileBase64] = useState<string>("");
  const [logoText, setLogoText] = useState<string>("A-Zed Info");
  const [isEditingLogo, setIsEditingLogo] = useState<boolean>(false);
  const [primaryColor, setPrimaryColor] = useState<string>("#0F1E36");
  const [secondaryColor, setSecondaryColor] = useState<string>("#10B981");
  const [heroImageUrl, setHeroImageUrl] = useState<string>("https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=500");
  const [studentImageUrl, setStudentImageUrl] = useState<string>("https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400");
  const [loginImageUrl, setLoginImageUrl] = useState<string>("");
  const [registerImageUrl, setRegisterImageUrl] = useState<string>("");
  const [platformIcon, setPlatformIcon] = useState<string>("");

  // Landing page customizations
  const [landingHeroTitle, setLandingHeroTitle] = useState<string>("");
  const [landingHeroHighlight, setLandingHeroHighlight] = useState<string>("");
  const [landingHeroSubtext, setLandingHeroSubtext] = useState<string>("");
  const [overlayAlAdmisText, setOverlayAlAdmisText] = useState<string>("");
  const [overlayAlAdmisBg, setOverlayAlAdmisBg] = useState<string>("");
  const [overlayAlAdmisTextColor, setOverlayAlAdmisTextColor] = useState<string>("");
  const [overlayKhaliaAlaynaText, setOverlayKhaliaAlaynaText] = useState<string>("");
  const [overlayKhaliaAlaynaBg, setOverlayKhaliaAlaynaBg] = useState<string>("");
  const [overlayKhaliaAlaynaTextColor, setOverlayKhaliaAlaynaTextColor] = useState<string>("");
  const [overlayPlatformActiveHeader, setOverlayPlatformActiveHeader] = useState<string>("");
  const [overlayPlatformActiveSubtext, setOverlayPlatformActiveSubtext] = useState<string>("");
  const [overlayPlatformActiveIcon, setOverlayPlatformActiveIcon] = useState<string>("");
  const [overlayPlatformActiveBg, setOverlayPlatformActiveBg] = useState<string>("");
  const [overlayPlatformActiveTextColor, setOverlayPlatformActiveTextColor] = useState<string>("");
  const [headingFont, setHeadingFont] = useState<string>("Inter");
  const [bodyFont, setBodyFont] = useState<string>("Inter");
  const [authHeroImageConfig, setAuthHeroImageConfig] = useState<AuthHeroImageConfig>(() => {
    try {
      const saved = localStorage.getItem("auth_hero_image_config");
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_AUTH_HERO_CONFIG;
  });

  // CMS Updates configurations states
  const [landingUpdatesConfig, setLandingUpdatesConfig] = useState<any>(null);
  const [studentUpdatesConfig, setStudentUpdatesConfig] = useState<any>(null);

  const loadUpdatesConfig = () => {
    fetch("/api/config/updates")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP-error");
        return res.json();
      })
      .then((data) => {
        if (data.landingPageConfig) setLandingUpdatesConfig(data.landingPageConfig);
        if (data.studentDashboardConfig) setStudentUpdatesConfig(data.studentDashboardConfig);
      })
      .catch((err) => console.warn("Error loading updates config:", err));
  };

  useEffect(() => {
    loadUpdatesConfig();
    window.addEventListener("updates_config_changed", loadUpdatesConfig);
    return () => window.removeEventListener("updates_config_changed", loadUpdatesConfig);
  }, []);

  // Dynamically update root typography font variables
  useEffect(() => {
    const fontMapping: Record<string, string> = {
      "Inter": '"Inter", sans-serif',
      "Space Grotesk": '"Space Grotesk", sans-serif',
      "Outfit": '"Outfit", sans-serif',
      "Playfair Display": '"Playfair Display", serif',
      "Plus Jakarta Sans": '"Plus Jakarta Sans", sans-serif',
      "Cinzel": '"Cinzel", serif',
      "Syne": '"Syne", sans-serif',
      "JetBrains Mono": '"JetBrains Mono", monospace',
      "Roboto": '"Roboto", sans-serif',
      "Lora": '"Lora", serif',
      "Open Sans": '"Open Sans", sans-serif',
      "Fira Code": '"Fira Code", monospace',
      "Montserrat": '"Montserrat", sans-serif',
      "Lato": '"Lato", sans-serif',
      "Ubuntu": '"Ubuntu", sans-serif'
    };

    const hFont = fontMapping[headingFont] || `"${headingFont}", sans-serif`;
    const bFont = fontMapping[bodyFont] || `"${bodyFont}", sans-serif`;

    document.documentElement.style.setProperty('--font-heading', hFont);
    document.documentElement.style.setProperty('--font-body', bFont);
  }, [headingFont, bodyFont]);

  // Admin Console subtab selection state (par défaut 1er sous-menu: receipts / Frais d'Inscription)
  const [adminSubTab, setAdminSubTab] = useState<"users" | "receipts" | "shop" | "courses-upload" | "quizzes-upload" | "quizzes-history" | "courses-history" | "events" | "calendar" | "agents" | "audits" | "packs" | "signup-offers" | "todo-events" | "branding" | "updates" | "acceptances" | "demos">("receipts");

  // Security Interception Banner Alert
  const [securityAlert, setSecurityAlert] = useState<string | null>(null);

  // Expanded/collapsed state for python sandbox description text
  const [isSandboxDescExpanded, setIsSandboxDescExpanded] = useState(true);
  const [isInstructionsMaximized, setIsInstructionsMaximized] = useState(false);
  const [sandboxSyntaxStatus, setSandboxSyntaxStatus] = useState<{ isValid: boolean; error: string | null }>({ isValid: true, error: null });
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState<number>(0);

  // Help modal state for python sandbox
  const [isHelpModalOpen, setIsHelpModalOpen] = useState(false);
  const [activeHelpTab, setActiveHelpTab] = useState<"shortcuts" | "syntax">("shortcuts");
  const [sandboxResetTrigger, setSandboxResetTrigger] = useState(0);
  const [sandboxFormatTrigger, setSandboxFormatTrigger] = useState(0);
  const [sandboxSaveTrigger, setSandboxSaveTrigger] = useState(0);
  const [sandboxConsoleOpen, setSandboxConsoleOpen] = useState(false);
  const [sandboxSharedCode, setSandboxSharedCode] = useState<string>("");

  // High Contrast Mode State
  const [isHighContrast, setIsHighContrast] = useState<boolean>(() => {
    try {
      return localStorage.getItem("sandbox-high-contrast") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isHighContrast) {
        document.documentElement.classList.add("high-contrast");
        localStorage.setItem("sandbox-high-contrast", "true");
      } else {
        document.documentElement.classList.remove("high-contrast");
        localStorage.setItem("sandbox-high-contrast", "false");
      }
    } catch (e) {
      console.error("High Contrast Mode state set failed", e);
    }
  }, [isHighContrast]);

  // Expanded/collapsed state for sidebar collapsible submenus
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({
    cours: true,
    devoirs: true,
    corrections: true,
    revision: true,
    qcm: true,
    calendrier: true,
  });

  // Auto-expand submenu when tab changes
  useEffect(() => {
    if (["cours", "devoirs", "corrections", "revision", "qcm", "calendrier", "todo-calendrier", "calendrier-annuel"].includes(currentTab)) {
      const menuKey = (currentTab === "todo-calendrier" || currentTab === "calendrier-annuel") ? "calendrier" : currentTab;
      setExpandedMenus(prev => ({ ...prev, [menuKey]: true }));
    }
  }, [currentTab]);

  // Prevent student from accessing the Python compiler tab
  useEffect(() => {
    if (currentUser?.role === "student" && currentTab === "editeur-python") {
      setCurrentTab("cours");
    }
  }, [currentUser, currentTab]);

  // Prevent non-student (admin/teacher/agent) from accessing the PDF library / reader tabs
  useEffect(() => {
    if (currentUser && currentUser.role !== "student" && (currentTab === "bibliotheque" || currentTab === "student/pdf-viewer")) {
      const targetTab = currentUser.role === "admin" ? "admin" : (currentUser.role === "agent" ? "agent" : "cours");
      setCurrentTab(targetTab);
      setSecurityAlert("Accès Refusé : Le lecteur PDF et la bibliothèque sont exclusivement réservés aux élèves.");
      setTimeout(() => setSecurityAlert(null), 4000);
    }
  }, [currentUser, currentTab]);

  // Redirect away if assistant-ai tab is selected
  useEffect(() => {
    if (currentTab === "assistant-ai") {
      setCurrentTab("cours");
    }
  }, [currentTab]);

  // Role Guard Enforcement: ADMIN and AGENT must never land on student views
  useEffect(() => {
    if (!currentUser) return;
    const role = currentUser.role ? currentUser.role.toUpperCase() : "";

    if (role === "ADMIN") {
      if (currentTab !== "admin" && currentTab !== "profile") {
        setCurrentTab("admin");
        if (!adminSubTab) setAdminSubTab("receipts");
        window.location.hash = "#/admin/frais-inscription";
      }
    } else if (role === "AGENT") {
      if (currentTab !== "agent" && currentTab !== "profile") {
        setCurrentTab("agent");
        window.location.hash = "#/agent/validation-comptes";
      }
    } else if (role === "STUDENT") {
      if (currentTab === "admin" || currentTab === "agent") {
        setCurrentTab("cours");
        window.location.hash = "#/student/courses";
      }
    }
  }, [currentUser?.role, currentTab]);

  // Hash-based custom router sync
  useEffect(() => {
    const handleHashChange = () => {
      const rawHash = window.location.hash.replace(/^#\/?/, "").trim();
      const userRole = currentUser?.role ? currentUser.role.toUpperCase() : null;

      if (userRole === "ADMIN") {
        if (rawHash === "profile" || rawHash === "profil" || rawHash === "admin/profile" || rawHash === "admin/profil") {
          setCurrentTab("profile");
          return;
        }

        if (!rawHash || rawHash === "" || rawHash === "/" || !rawHash.startsWith("admin")) {
          setCurrentTab("admin");
          setAdminSubTab("receipts");
          window.location.hash = "#/admin/frais-inscription";
          return;
        }

        if (rawHash === "admin") {
          setCurrentTab("admin");
          setAdminSubTab("receipts");
          window.location.hash = "#/admin/frais-inscription";
          return;
        }

        if (rawHash.startsWith("admin/")) {
          const subPath = rawHash.replace("admin/", "");

          if (subPath === "profile" || subPath === "profil") {
            setCurrentTab("profile");
            return;
          }

          setCurrentTab("admin");

          const adminTabMap: Record<string, typeof adminSubTab> = {
            "frais-inscription": "receipts",
            "frais_inscription": "receipts",
            "receipts": "receipts",
            "etats-rapports": "reporting",
            "etats_rapports": "reporting",
            "reporting": "reporting",
            "validation-comptes": "acceptances",
            "validation_comptes": "acceptances",
            "acceptances": "acceptances",
            "audit": "audits",
            "audits": "audits",
            "users": "users",
            "lyceens": "users",
            "agents": "agents",
            "nouveau-doc": "courses-upload",
            "courses-upload": "courses-upload",
            "gestion-docs": "courses-history",
            "courses-history": "courses-history",
            "demos": "demos",
            "videos-demo": "demos",
            "quiz": "quizzes-upload",
            "quizzes-upload": "quizzes-upload",
            "todo": "todo-events",
            "todo-events": "todo-events",
            "planning": "events",
            "events": "events",
            "calendar": "calendar",
            "calendrier": "calendar",
            "boutique": "shop",
            "shop": "shop",
            "packs": "packs",
            "offres-packs": "packs",
            "signup-offers": "signup-offers",
            "offres-signup": "signup-offers",
            "branding": "branding",
            "design-branding": "branding",
            "media-icons": "media-icons",
            "updates": "updates"
          };

          if (adminTabMap[subPath]) {
            setAdminSubTab(adminTabMap[subPath]);
          } else {
            setAdminSubTab("receipts");
            window.location.hash = "#/admin/frais-inscription";
          }
          return;
        }

        // Redirect any other route accessed by ADMIN to /admin/frais-inscription
        setCurrentTab("admin");
        setAdminSubTab("receipts");
        window.location.hash = "#/admin/frais-inscription";
        return;
      }

      if (userRole === "AGENT") {
        if (!rawHash || !rawHash.startsWith("agent")) {
          setCurrentTab("agent");
          window.location.hash = "#/agent/validation-comptes";
          return;
        }
        setCurrentTab("agent");
        return;
      }

      // For STUDENT / guest users:
      if (rawHash.startsWith("admin") || rawHash.startsWith("agent")) {
        setCurrentTab("cours");
        window.location.hash = "#/student/courses";
        return;
      }

      const validStudentTabs = [
        "dashboard", "student/dashboard", "student/courses", "cours", "devoirs", "corrections", 
        "revision", "bibliotheque", "student/pdf-viewer", "student/code-viewer", 
        "python-code-viewer", "student/text-viewer", "text-document-viewer", 
        "student/viewer", "document-viewer", "qcm", "editeur-python", 
        "calendrier", "todo-calendrier", "calendrier-annuel", "shop", "profile"
      ];

      if (rawHash.startsWith("student/code-viewer") || rawHash.startsWith("python-code-viewer") || rawHash.startsWith("student/devoirs/python")) {
        const parts = rawHash.split("/");
        if (parts.length > 2) setPythonExerciseId(parts[parts.length - 1]);
        setCurrentTab("student/code-viewer");
        return;
      }

      if (rawHash.startsWith("student/text-viewer") || rawHash.startsWith("text-document-viewer") || rawHash.startsWith("student/devoirs/text")) {
        const parts = rawHash.split("/");
        if (parts.length > 2) setTxtExerciseId(parts[parts.length - 1]);
        setCurrentTab("student/text-viewer");
        return;
      }

      if (rawHash.startsWith("student/viewer") || rawHash.startsWith("document-viewer")) {
        const parts = rawHash.split("/");
        if (parts.length > 2) setDocExerciseId(parts[parts.length - 1]);
        setCurrentTab("student/viewer");
        return;
      }

      if (validStudentTabs.includes(rawHash)) {
        setCurrentTab(rawHash === "student/courses" ? "cours" : rawHash);
      } else {
        setCurrentTab("cours");
      }
    };

    window.addEventListener("hashchange", handleHashChange);
    handleHashChange();
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, [currentUser?.role]);

  // Sync event listener to open full-screen Python code viewer
  useEffect(() => {
    const handleOpenPythonViewer = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (typeof detail === "string") {
          setPythonExerciseId(detail);
          setActivePythonExercise(null);
        } else {
          setActivePythonExercise(detail);
          setPythonExerciseId(detail.id || "");
        }
        setCurrentTab("student/code-viewer");
      }
    };
    window.addEventListener("open-python-code-viewer", handleOpenPythonViewer);
    return () => window.removeEventListener("open-python-code-viewer", handleOpenPythonViewer);
  }, []);

  // Sync event listener to open full-screen Text document viewer
  useEffect(() => {
    const handleOpenTxtViewer = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (typeof detail === "string") {
          setTxtExerciseId(detail);
          setActiveTxtExercise(null);
        } else {
          setActiveTxtExercise(detail);
          setTxtExerciseId(detail.id || "");
        }
        setCurrentTab("student/text-viewer");
      }
    };
    window.addEventListener("open-txt-document-viewer", handleOpenTxtViewer);
    return () => window.removeEventListener("open-txt-document-viewer", handleOpenTxtViewer);
  }, []);

  // Sync event listener to open unified full-screen Document viewer
  useEffect(() => {
    const handleOpenDocViewer = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail) {
        if (typeof detail === "string") {
          setDocExerciseId(detail);
          setActiveDocExercise(null);
        } else {
          setActiveDocExercise(detail);
          setDocExerciseId(detail.id || "");
        }
        setCurrentTab("student/viewer");
      }
    };
    window.addEventListener("open-document-viewer", handleOpenDocViewer);
    return () => window.removeEventListener("open-document-viewer", handleOpenDocViewer);
  }, []);

  // Update hash when current tab state transitions
  useEffect(() => {
    if (!currentUser) {
      window.location.hash = `#/${currentTab}`;
      return;
    }

    const role = currentUser.role ? currentUser.role.toUpperCase() : "";

    if (role === "ADMIN") {
      const subMap: Record<string, string> = {
        receipts: "frais-inscription",
        reporting: "etats-rapports",
        acceptances: "validation-comptes",
        audits: "audit",
        users: "users",
        agents: "agents",
        "courses-upload": "nouveau-doc",
        "courses-history": "gestion-docs",
        demos: "videos-demo",
        "quizzes-upload": "quiz",
        "todo-events": "todo",
        events: "planning",
        calendar: "calendar",
        shop: "boutique",
        packs: "offres-packs",
        "signup-offers": "offres-signup",
        branding: "branding",
        "media-icons": "media-icons",
        updates: "updates"
      };
      const pathSuffix = subMap[adminSubTab] || "frais-inscription";
      window.location.hash = `#/admin/${pathSuffix}`;
      return;
    }

    if (role === "AGENT") {
      window.location.hash = "#/agent/validation-comptes";
      return;
    }

    window.location.hash = `#/${currentTab === "cours" ? "student/courses" : currentTab}`;
  }, [currentTab, adminSubTab, currentUser?.role]);

  // Listen to custom tab change events from quick actions
  useEffect(() => {
    const handleCustomTabChange = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail && typeof detail === "string") {
        setCurrentTab(detail);
      }
    };
    window.addEventListener("change-tab", handleCustomTabChange);
    return () => window.removeEventListener("change-tab", handleCustomTabChange);
  }, []);

  // Sync organization logo and brand typography identity
  useEffect(() => {
    fetch("/api/config/logo")
      .then((res) => {
        if (!res.ok) throw new Error("HTTP-error");
        return res.json();
      })
      .then((data) => {
        if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
        if (data.logoText !== undefined) setLogoText(data.logoText);
        if (data.primaryColor !== undefined) setPrimaryColor(data.primaryColor);
        if (data.secondaryColor !== undefined) setSecondaryColor(data.secondaryColor);
        if (data.heroImageUrl !== undefined) setHeroImageUrl(data.heroImageUrl);
        if (data.studentImageUrl !== undefined) setStudentImageUrl(data.studentImageUrl);
        if (data.loginImageUrl !== undefined) setLoginImageUrl(data.loginImageUrl);
        if (data.registerImageUrl !== undefined) setRegisterImageUrl(data.registerImageUrl);
        if (data.platformIcon !== undefined) setPlatformIcon(data.platformIcon);
        if (data.landingHeroTitle !== undefined) setLandingHeroTitle(data.landingHeroTitle);
        if (data.landingHeroHighlight !== undefined) setLandingHeroHighlight(data.landingHeroHighlight);
        if (data.landingHeroSubtext !== undefined) setLandingHeroSubtext(data.landingHeroSubtext);
        if (data.overlayAlAdmisText !== undefined) setOverlayAlAdmisText(data.overlayAlAdmisText);
        if (data.overlayAlAdmisBg !== undefined) setOverlayAlAdmisBg(data.overlayAlAdmisBg);
        if (data.overlayAlAdmisTextColor !== undefined) setOverlayAlAdmisTextColor(data.overlayAlAdmisTextColor);
        if (data.overlayKhaliaAlaynaText !== undefined) setOverlayKhaliaAlaynaText(data.overlayKhaliaAlaynaText);
        if (data.overlayKhaliaAlaynaBg !== undefined) setOverlayKhaliaAlaynaBg(data.overlayKhaliaAlaynaBg);
        if (data.overlayKhaliaAlaynaTextColor !== undefined) setOverlayKhaliaAlaynaTextColor(data.overlayKhaliaAlaynaTextColor);
        if (data.overlayPlatformActiveHeader !== undefined) setOverlayPlatformActiveHeader(data.overlayPlatformActiveHeader);
        if (data.overlayPlatformActiveSubtext !== undefined) setOverlayPlatformActiveSubtext(data.overlayPlatformActiveSubtext);
        if (data.overlayPlatformActiveIcon !== undefined) setOverlayPlatformActiveIcon(data.overlayPlatformActiveIcon);
        if (data.overlayPlatformActiveBg !== undefined) setOverlayPlatformActiveBg(data.overlayPlatformActiveBg);
        if (data.overlayPlatformActiveTextColor !== undefined) setOverlayPlatformActiveTextColor(data.overlayPlatformActiveTextColor);
        if (data.headingFont !== undefined) setHeadingFont(data.headingFont);
        if (data.bodyFont !== undefined) setBodyFont(data.bodyFont);
        if (data.authHeroImageConfig) {
          setAuthHeroImageConfig(data.authHeroImageConfig);
          try {
            localStorage.setItem("auth_hero_image_config", JSON.stringify(data.authHeroImageConfig));
          } catch {}
        }
      })
      .catch((err) => console.error("Error loading logo config:", err));
  }, []);

  const handleSaveBrandingConfig = (config: {
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
  }) => {
    if (config.authHeroImageConfig) {
      setAuthHeroImageConfig(config.authHeroImageConfig);
      try {
        localStorage.setItem("auth_hero_image_config", JSON.stringify(config.authHeroImageConfig));
      } catch {}
    }
    return fetch("/api/admin/config/logo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(config)
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          if (data.logoUrl !== undefined) setLogoUrl(data.logoUrl);
          if (data.logoText !== undefined) setLogoText(data.logoText);
          if (data.primaryColor !== undefined) setPrimaryColor(data.primaryColor);
          if (data.secondaryColor !== undefined) setSecondaryColor(data.secondaryColor);
          if (data.heroImageUrl !== undefined) setHeroImageUrl(data.heroImageUrl);
          if (data.studentImageUrl !== undefined) setStudentImageUrl(data.studentImageUrl);
          if (data.loginImageUrl !== undefined) setLoginImageUrl(data.loginImageUrl);
          if (data.registerImageUrl !== undefined) setRegisterImageUrl(data.registerImageUrl);
          if (data.platformIcon !== undefined) setPlatformIcon(data.platformIcon);
          if (data.landingHeroTitle !== undefined) setLandingHeroTitle(data.landingHeroTitle);
          if (data.landingHeroHighlight !== undefined) setLandingHeroHighlight(data.landingHeroHighlight);
          if (data.landingHeroSubtext !== undefined) setLandingHeroSubtext(data.landingHeroSubtext);
          if (data.overlayAlAdmisText !== undefined) setOverlayAlAdmisText(data.overlayAlAdmisText);
          if (data.overlayAlAdmisBg !== undefined) setOverlayAlAdmisBg(data.overlayAlAdmisBg);
          if (data.overlayAlAdmisTextColor !== undefined) setOverlayAlAdmisTextColor(data.overlayAlAdmisTextColor);
          if (data.overlayKhaliaAlaynaText !== undefined) setOverlayKhaliaAlaynaText(data.overlayKhaliaAlaynaText);
          if (data.overlayKhaliaAlaynaBg !== undefined) setOverlayKhaliaAlaynaBg(data.overlayKhaliaAlaynaBg);
          if (data.overlayKhaliaAlaynaTextColor !== undefined) setOverlayKhaliaAlaynaTextColor(data.overlayKhaliaAlaynaTextColor);
          if (data.overlayPlatformActiveHeader !== undefined) setOverlayPlatformActiveHeader(data.overlayPlatformActiveHeader);
          if (data.overlayPlatformActiveSubtext !== undefined) setOverlayPlatformActiveSubtext(data.overlayPlatformActiveSubtext);
          if (data.overlayPlatformActiveIcon !== undefined) setOverlayPlatformActiveIcon(data.overlayPlatformActiveIcon);
          if (data.overlayPlatformActiveBg !== undefined) setOverlayPlatformActiveBg(data.overlayPlatformActiveBg);
          if (data.overlayPlatformActiveTextColor !== undefined) setOverlayPlatformActiveTextColor(data.overlayPlatformActiveTextColor);
          if (data.headingFont !== undefined) setHeadingFont(data.headingFont);
          if (data.bodyFont !== undefined) setBodyFont(data.bodyFont);
          if (data.authHeroImageConfig) {
            setAuthHeroImageConfig(data.authHeroImageConfig);
            try {
              localStorage.setItem("auth_hero_image_config", JSON.stringify(data.authHeroImageConfig));
            } catch {}
          }
          setLogoFileBase64("");
          setIsEditingLogo(false);
          return true;
        }
        return false;
      })
      .catch((err) => {
        console.error("Error saving brand config:", err);
        throw err;
      });
  };

  const handleSaveLogoConfig = (newUrl: string, newText: string) => {
    handleSaveBrandingConfig({ logoUrl: newUrl, logoText: newText });
  };

  // Load backend static dataset
  const fetchAllUsersAndData = () => {
    fetch("/api/users", {
      headers: {
        "x-user-role": currentUser?.role || ""
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Expected JSON but received non-JSON for users.");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setAllUsersList(data);
      })
      .catch((err) => console.error("Error loading users:", err));

    fetch("/api/ebooks", {
      headers: {
        "x-user-grade": currentUser?.grade || "",
        "x-user-role": currentUser?.role || ""
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          console.warn("Expected JSON but received non-JSON for ebooks.");
          return [];
        }
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setEbooks(data);
      })
      .catch((err) => console.error("Error loading ebooks:", err));

    fetch("/api/courses", {
      headers: {
        "x-user-grade": currentUser?.grade || "",
        "x-user-section": currentUser?.section || "",
        "x-user-role": currentUser?.role || ""
      }
    })
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data)) setCoursesList(data);
      })
      .catch((err) => console.error("Error loading courses for suggestions:", err));
  };

  useEffect(() => {
    if (currentUser) {
      if (currentUser.role === "student") {
        document.documentElement.classList.add("student-mode");
      } else {
        document.documentElement.classList.remove("student-mode");
      }
      fetchAllUsersAndData();
      fetchNotifications();

      const handleCustomRefresh = () => {
        fetchNotifications();
      };
      window.addEventListener("refresh-notifications", handleCustomRefresh);

      return () => {
        window.removeEventListener("refresh-notifications", handleCustomRefresh);
        document.documentElement.classList.remove("student-mode");
      };
    } else {
      document.documentElement.classList.remove("student-mode");
    }
  }, [currentUser]);

  // Cyber security context controls: restrict right-click inspect and keyboard saving shortcuts
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
      setSecurityAlert("Protection Cyber-Architect : Inspecteur & Clic-droit désactivés sur l'Espace A-Zed.");
      setTimeout(() => setSecurityAlert(null), 3000);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && (e.key === "c" || e.key === "p" || e.key === "s")) {
        e.preventDefault();
        setSecurityAlert("Sécurité Cryptographique : Copie et impression désactivées sur ce document.");
        setTimeout(() => setSecurityAlert(null), 3000);
      }
    };

    document.addEventListener("contextmenu", handleContextMenu);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  // Submit Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    })
      .then(async (res) => {
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error(`Le serveur de connexion a retourné une réponse invalide (Code ${res.status})`);
        }
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.msg || "Identifiants invalides");
        }
        setCurrentUser(data.user);
        setSessionToken(data.token);
        const role = data.user.role ? data.user.role.toUpperCase() : "";
        if (role === "ADMIN") {
          try {
            localStorage.setItem("is_admin_device", "true");
          } catch (e) {}
          setCurrentTab("admin");
          setAdminSubTab("receipts");
          window.location.hash = "#/admin/frais-inscription";
        } else if (role === "AGENT") {
          try {
            localStorage.setItem("is_admin_device", "false");
          } catch (e) {}
          setCurrentTab("agent");
          window.location.hash = "#/agent/validation-comptes";
        } else {
          try {
            localStorage.setItem("is_admin_device", "false");
          } catch (e) {}
          setCurrentTab("cours");
          window.location.hash = "#/student/courses";
        }
      })
      .catch((err: any) => {
        setErrorMsg(err.message || "Impossible de se connecter. Veuillez réessayer.");
      });
  };

  const handleSignout = () => {
    setProfileDropdownOpen(false);
    setCurrentUser(null);
    setSessionToken(null);
    setCart([]);
    setWishlist([]);
    setCurrentTab("cours");
    setShowLandingPage(true);
  };

  const isPremiumUser = !!(
    currentUser &&
    currentUser.accountType === "premium" &&
    currentUser.subscriptionExpiresAt &&
    new Date(currentUser.subscriptionExpiresAt).getTime() > Date.now()
  );

  const handlePreparePremiumUpgrade = () => {
    setShopCategoryFilter("Full Access");
    setCurrentTab("shop");
  };

  // 24H Subscription expiration banner counter
  const getSubscriptionExpirationText = () => {
    if (!currentUser || !currentUser.subscriptionExpiresAt) return null;
    const expiration = new Date(currentUser.subscriptionExpiresAt).getTime();
    const diff = expiration - Date.now();

    if (diff <= 0) {
      return "🕒 Votre forfait annuel est arrivé à échéance. Veuillez régulariser l'inscription de 120 DT auprès du secrétariat d'administration scolaire.";
    }
    if (diff <= 24 * 60 * 60 * 1000) {
      return "🕒 Important : Accès annuel restreint dans moins de 24 heures. Téléversez le justificatif de transaction dans votre Profil.";
    }
    return null;
  };

  // Generate autocomplete suggestions matching current search query
  const autocompleteSuggestions = (() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return [];

    const suggestions: { text: string; type: "course" | "category" | "ebook" }[] = [];
    const seen = new Set<string>();

    // 1. Static Categories / Modules
    const categoriesList = ["Bases Logiques", "Logique Conditionnelle", "Algorithmes Avancés", "Bases de Données", "Algorithmique", "Python", "SQL"];
    categoriesList.forEach((cat) => {
      if (cat.toLowerCase().includes(query) && !seen.has(cat.toLowerCase())) {
        seen.add(cat.toLowerCase());
        suggestions.push({ text: cat, type: "category" });
      }
    });

    // 2. Static level course syllabus items
    const STATIC_COURSES = [
      { title: "Introduction et Fondamentaux d'Algorithmique", module: "Bases Logiques" },
      { title: "Les Constantes, Variables et Types simples sous Python", module: "Bases Logiques" },
      { title: "Maîtriser les Structures Alternatives et Itératives complexes", module: "Logique Conditionnelle" },
      { title: "La Récursivité : Principes mathématiques et Fonctions Récurrentes", module: "Algorithmes Avancés" },
      { title: "Bases de Données Relationnelles : Modèle Conceptuel et Requêtes SQL", module: "Bases de Données" },
      { title: "Les Algorithmes de Tris Compliqués : Tri par Sélection & Tri Bulle récursif", module: "Algorithmes Avancés" },
    ];

    STATIC_COURSES.forEach((c) => {
      if (c.title.toLowerCase().includes(query) && !seen.has(c.title.toLowerCase())) {
        seen.add(c.title.toLowerCase());
        suggestions.push({ text: c.title, type: "course" });
      }
      if (c.module && c.module.toLowerCase().includes(query) && !seen.has(c.module.toLowerCase())) {
        seen.add(c.module.toLowerCase());
        suggestions.push({ text: c.module, type: "category" });
      }
    });

    // 3. Dynamic course syllabus items
    coursesList.forEach((c) => {
      if (c.title && c.title.toLowerCase().includes(query) && !seen.has(c.title.toLowerCase())) {
        seen.add(c.title.toLowerCase());
        suggestions.push({ text: c.title, type: "course" });
      }
      if (c.module && c.module.toLowerCase().includes(query) && !seen.has(c.module.toLowerCase())) {
        seen.add(c.module.toLowerCase());
        suggestions.push({ text: c.module, type: "category" });
      }
    });

    // 4. Dynamic books / manuals
    ebooks.forEach((eb) => {
      if (eb.title && eb.title.toLowerCase().includes(query) && !seen.has(eb.title.toLowerCase())) {
        seen.add(eb.title.toLowerCase());
        suggestions.push({ text: eb.title, type: "ebook" });
      }
    });

    return suggestions.slice(0, 7); // Max 7 items
  })();

  const subscriptionBannerText = getSubscriptionExpirationText();

  const getNavLinkClass = (tab: string) => {
    const base = "px-4 py-2 text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border ";
    const isActive = currentTab === tab || 
                     (tab === "calendrier" && (currentTab === "todo-calendrier" || currentTab === "calendrier-annuel"));
    if (isActive) {
      if (currentUser?.role === "student") {
        return base + "bg-[#069812] text-white border-[#069812]";
      }
      return base + "bg-[#10B981] text-white border-[#10B981]";
    }
    return base + "bg-white text-[#0F1E36] border-[#E5E7EB] hover:bg-gray-50";
  };

  const t = translations[currentLanguage];

  return (
    <div className="min-h-screen bg-white text-[#1F2937] flex flex-col justify-between" dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
      
      <style>{`
        [class*="bg-[#0F1E36]"] {
          background-color: ${primaryColor} !important;
        }
        [class*="text-[#0F1E36]"] {
          color: ${primaryColor} !important;
        }
        [class*="border-[#0F1E36]"] {
          border-color: ${primaryColor} !important;
        }
        [class*="caret-[#0F1E36]"] {
          caret-color: ${primaryColor} !important;
        }
        [class*="bg-[#10B981]"] {
          background-color: ${secondaryColor} !important;
        }
        [class*="text-[#10B981]"] {
          color: ${secondaryColor} !important;
        }
        [class*="border-[#10B981]"] {
          border-color: ${secondaryColor} !important;
        }
        [class*="text-emerald-500"] {
          color: ${secondaryColor} !important;
        }
        [class*="text-emerald-650"] {
          color: ${secondaryColor} !important;
        }
        [class*="text-emerald-600"] {
          color: ${secondaryColor} !important;
        }
        [class*="bg-emerald-500"] {
          background-color: ${secondaryColor} !important;
        }
        [class*="border-emerald-500"] {
          border-color: ${secondaryColor} !important;
        }
        [class*="bg-emerald-50"] {
          background-color: ${secondaryColor}15 !important;
        }
        [class*="bg-emerald-100"] {
          background-color: ${secondaryColor}25 !important;
        }
        [class*="hover:bg-[#1a2d4b]"]:hover {
          filter: brightness(115%) !important;
        }
        [class*="hover:bg-[#15294a]"]:hover {
          filter: brightness(115%) !important;
        }
      `}</style>
      
      {/* Dynamic Security Warnings overlay */}
      {securityAlert && (
        <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 p-4 rounded-xl bg-[#0F1E36] text-white border border-red-500 shadow-2xl flex items-center gap-2 max-w-md text-xs font-semibold select-none animate-bounce">
          <ShieldAlert size={18} className="text-[#EF4444] shrink-0" />
          <span>{securityAlert}</span>
        </div>
      )}

      {/* PLATFORM NAVIGATION WEB FRAME HEADER */}
      {currentUser ? (
        <header className="bg-white border-b border-[#E5E7EB] sticky top-0 z-30 shadow-xs select-none">
          <div className="max-w-7xl mx-auto px-6 min-h-[4rem] py-2 flex flex-wrap items-center justify-between gap-4">
            
            {/* Logo */}
            <div 
              className={`flex flex-wrap items-center gap-2.5 relative group ${currentUser?.role === 'admin' ? 'cursor-pointer hover:border-blue-300 border border-dashed border-transparent p-1 rounded-lg transition-all' : ''}`}
              onClick={() => {
                if (currentUser?.role === 'admin') {
                  setIsEditingLogo(true);
                }
              }}
              title={currentUser?.role === 'admin' ? "Cliquez ici pour changer le logo ou le nom de l'organisation" : undefined}
            >
              <div 
                className="w-8 h-8 rounded-lg flex items-center justify-center text-white font-mono text-base font-bold relative overflow-hidden"
                style={{ backgroundColor: '#000080' }}
              >
                {logoUrl ? (
                  <img src={logoUrl} className="w-full h-full object-cover rounded-lg" referrerPolicy="no-referrer" alt="Logo" />
                ) : (
                  "A"
                )}
                {currentUser?.role === 'admin' && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity" title="Upload New Logo">
                    <Upload size={14} className="text-white" />
                  </div>
                )}
              </div>
              <div className="text-start relative rtl:pl-6 rtl:pr-0 ltr:pr-6 ltr:pl-0">
                <h1 
                  className="text-sm font-semibold tracking-tight leading-none"
                  style={{ color: '#e81818' }}
                >
                  {logoText}
                </h1>
                <span 
                  className="text-gray-400 uppercase tracking-widest block mt-0.5"
                  style={{
                    fontSize: "12.5px",
                    fontWeight: "bold",
                    lineHeight: "14.85px"
                  }}
                >
                  {t.directorName}
                </span>
                
                {/* Float 'Upload New Logo' overlay icon for admins */}
                {currentUser?.role === 'admin' && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setIsEditingLogo(true);
                    }}
                    className="absolute right-0 rtl:left-0 rtl:right-auto top-1/2 -translate-y-1/2 bg-[#000080] hover:bg-blue-800 text-white rounded-full p-1 shadow-xs opacity-0 group-hover:opacity-100 transition-all transform hover:scale-110 active:scale-95 cursor-pointer z-10 flex items-center justify-center"
                    title="Upload New Logo"
                  >
                    <Upload size={10} className="stroke-[2.5]" />
                  </button>
                )}
              </div>
            </div>

            {/* Centralised search engine */}
            <div className="hidden md:flex items-center gap-2 flex-1 max-w-sm mx-4">
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  addToSearchHistory(searchQuery);
                  setShowHistoryDropdown(false);
                  if (currentTab !== "cours" && currentTab !== "bibliotheque") {
                    setCurrentTab("cours");
                  }
                }}
                className="p-2 bg-[#10B981] hover:bg-emerald-600 text-white rounded-lg shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
                title={t.search_button}
              >
                <Search size={14} className="stroke-[2.5]" />
              </button>
              <div className="relative w-full">
                <input
                  type="text"
                  placeholder={t.search_placeholder}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onFocus={() => setShowHistoryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowHistoryDropdown(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      addToSearchHistory(searchQuery);
                      setShowHistoryDropdown(false);
                      if (currentTab !== "cours" && currentTab !== "bibliotheque") {
                        setCurrentTab("cours");
                      }
                    }
                  }}
                  className="w-full text-xs font-medium py-1.5 px-3 rounded-lg border border-[#E5E7EB] dark:border-slate-850 bg-white dark:bg-slate-950 text-slate-900 dark:text-slate-100 focus:border-[#10B981] outline-hidden placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-xs rtl:text-right ltr:text-left"
                />

                {/* Clear text button */}
                {searchQuery && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      setSearchQuery("");
                    }}
                    className="absolute end-2.5 top-2 rtl:left-2.5 rtl:right-auto ltr:right-2.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 transition-colors cursor-pointer rounded-full p-0.5 hover:bg-gray-100 dark:hover:bg-slate-800 flex items-center justify-center"
                    title="Effacer la recherche"
                  >
                    <X size={12} />
                  </button>
                )}

                {/* Search History & Autocomplete Popover */}
                <AnimatePresence>
                  {showHistoryDropdown && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95, y: -8 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.95, y: -8 }}
                      transition={{ type: "spring", duration: 0.25, bounce: 0.1 }}
                      className="absolute left-0 rtl:right-0 mt-2 w-full border border-gray-150 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md rounded-2xl shadow-xl z-50 p-1.5 text-start text-xs divide-y divide-gray-100 dark:divide-slate-900"
                    >
                      {searchQuery.trim() === "" ? (
                        searchHistory.length > 0 ? (
                          <div className="py-1">
                            <div className="px-3 py-1.5 font-extrabold text-[#0F1E36] dark:text-slate-300 flex items-center justify-between text-[10px] uppercase tracking-wider">
                              <span className="flex items-center gap-1">
                                <History size={12} className="text-[#10B981]" />
                                <span>{t.recent_history}</span>
                              </span>
                              <button
                                onMouseDown={clearAllHistory}
                                className="text-red-500 hover:text-red-700 dark:hover:text-red-400 cursor-pointer flex items-center gap-1 text-[9px] font-bold bg-none border-none outline-none hover:bg-red-50 dark:hover:bg-red-950/20 px-1.5 py-0.5 rounded-lg transition-colors"
                                title="Vider l'historique"
                              >
                                <Trash2 size={10} />
                                <span>{t.clear_all}</span>
                              </button>
                            </div>
                            <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
                              {searchHistory.map((item, idx) => (
                                <div
                                  key={idx}
                                  onMouseDown={() => {
                                    setSearchQuery(item);
                                    addToSearchHistory(item); // Refresh priority order
                                    setShowHistoryDropdown(false);
                                    if (currentTab !== "cours" && currentTab !== "bibliotheque") {
                                      setCurrentTab("cours");
                                    }
                                  }}
                                  className="px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-900 flex items-center justify-between cursor-pointer rounded-xl transition-colors text-slate-700 dark:text-slate-300 group/item"
                                >
                                  <div className="flex items-center gap-2.5 min-w-0">
                                    <Search size={12} className="text-gray-400 group-hover/item:text-[#10B981] group-hover/item:scale-110 transition-transform shrink-0" />
                                    <span className="font-semibold text-gray-700 dark:text-slate-300 group-hover/item:text-[#0F1E36] dark:group-hover/item:text-white truncate">{item}</span>
                                  </div>
                                  <button
                                    onMouseDown={(e) => removeHistoryItem(item, e)}
                                    className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all cursor-pointer shrink-0 opacity-0 group-hover/item:opacity-100"
                                    title="Supprimer la recherche"
                                  >
                                    <X size={11} />
                                  </button>
                                </div>
                              ))}
                            </div>
                          </div>
                        ) : (
                          <div className="p-4 text-center text-xs text-gray-400 dark:text-gray-500">
                            <span className="block font-semibold mb-1">Recherche intelligente</span>
                            <span className="text-[10px]">Saisissez un mot pour voir les suggestions de chapitres, guides, ou codes.</span>
                          </div>
                        )
                      ) : (
                        <div className="py-1">
                          <div className="px-3 py-1.5 font-extrabold text-[#0F1E36] dark:text-slate-300 text-[10px] uppercase tracking-wider flex items-center gap-1">
                            <Sparkles size={11} className="text-[#10B981]" />
                            <span>{t.search_suggestions}</span>
                          </div>
                          <div className="py-1 max-h-60 overflow-y-auto space-y-0.5">
                            {autocompleteSuggestions.length === 0 ? (
                              <div className="px-3 py-4 text-gray-400 dark:text-gray-500 italic text-center">
                                Aucune suggestion... Appuyez sur <kbd className="font-mono text-[9px] bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-1 py-0.5 rounded border border-gray-200 dark:border-slate-700">Entrée</kbd> pour rechercher
                              </div>
                            ) : (
                              autocompleteSuggestions.map((item, idx) => {
                                // Dynamically pick a beautiful icon based on match category
                                const SuggestionIcon = item.type === "category" ? Grid : item.type === "ebook" ? BookOpen : Code;
                                return (
                                  <div
                                    key={idx}
                                    onMouseDown={() => {
                                      setSearchQuery(item.text);
                                      addToSearchHistory(item.text);
                                      setShowHistoryDropdown(false);
                                      if (item.type === "ebook") {
                                        setCurrentTab("bibliotheque");
                                      } else {
                                        if (currentTab !== "cours" && currentTab !== "bibliotheque") {
                                          setCurrentTab("cours");
                                        }
                                      }
                                    }}
                                    className="px-3 py-2 hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 flex items-center gap-2.5 cursor-pointer rounded-xl transition-all text-slate-700 dark:text-slate-300 group/item"
                                  >
                                    <div className="p-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-950/30 text-[#10B981] group-hover/item:scale-110 transition-transform shrink-0">
                                      <SuggestionIcon size={12} />
                                    </div>
                                    <div className="flex flex-col min-w-0 flex-1">
                                      <span className="font-semibold text-gray-750 dark:text-slate-200 group-hover/item:text-[#0F1E36] dark:group-hover/item:text-white truncate">
                                        {item.text}
                                      </span>
                                      <span className="text-[9px] text-gray-400 dark:text-slate-500 font-bold tracking-wider uppercase mt-0.5">
                                        {item.type === "category" ? "Catégorie / Module" : item.type === "ebook" ? "Syllabus / Guide PDF" : "Chapitre de cours"}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })
                            )}
                          </div>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Profiles & drop menus */}
            <div className="flex items-center gap-3.5 md:gap-5 ms-4 md:ms-8 lg:ms-12">

              {/* Language Selector Dropdown with Logo flags */}
              <div className="relative">
                <button
                  onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm bg-white dark:bg-slate-950"
                >
                  <span className="flex items-center shrink-0 rounded-full object-cover border border-gray-150 dark:border-slate-800 overflow-hidden w-5 h-5 shadow-xs">
                    {getLanguageFlag(currentLanguage)}
                  </span>
                  <span className="uppercase tracking-wider">{currentLanguage}</span>
                  <motion.div
                    initial={{ rotate: 0 }}
                    animate={{ rotate: langDropdownOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="flex items-center justify-center opacity-60"
                  >
                    <ChevronDown size={14} />
                  </motion.div>
                </button>

                <AnimatePresence>
                  {langDropdownOpen && (
                    <motion.div
                      key="lang-backdrop"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="fixed inset-0 z-40"
                      onClick={() => setLangDropdownOpen(false)}
                    />
                  )}
                  {langDropdownOpen && (
                    <motion.div
                      key="lang-dropdown"
                      initial={{ opacity: 0, scale: 0.92, y: -12 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.92, y: -10 }}
                      transition={{ type: "spring", duration: 0.3, bounce: 0.15 }}
                      className={`absolute ${currentLanguage === "ar" ? "left-0" : "right-0"} mt-2.5 w-44 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-gray-100 dark:border-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 z-50 py-1.5 p-1 overflow-hidden text-xs text-slate-750`}
                    >
                      <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-50 dark:border-slate-900 mb-1">
                        {currentLanguage === "ar" ? "اختر اللغة" : "Choisir la langue"}
                      </div>
                      {languageOptions.map((lang) => {
                        const isActive = currentLanguage === lang.code;
                        return (
                          <button
                            key={lang.code}
                            onClick={() => {
                              setCurrentLanguage(lang.code);
                              setLangDropdownOpen(false);
                            }}
                            className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-left font-bold transition-all cursor-pointer ${
                              isActive 
                                ? "text-[#10B981] bg-emerald-50/50 dark:bg-emerald-950/20 font-extrabold" 
                                : "text-slate-700 dark:text-slate-350 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
                            }`}
                            dir={lang.code === "ar" ? "rtl" : "ltr"}
                          >
                            <span className="flex items-center shrink-0 rounded-full object-cover border border-gray-150 dark:border-slate-800 overflow-hidden w-5 h-5 shadow-xs">
                              {lang.flag}
                            </span>
                            <span className="flex-1">{lang.name}</span>
                            {isActive && (
                              <motion.span 
                                initial={{ scale: 0.6 }}
                                animate={{ scale: 1 }}
                                className="inline-block"
                              >
                                <Check size={14} className="text-[#10B981]" />
                              </motion.span>
                            )}
                          </button>
                        );
                      })}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              {/* Interactive Calendar Overlay Panel Hook */}
              {currentUser?.role !== "agent" && (
                <button
                  onClick={() => {
                    if (currentUser?.role === "admin") {
                      setAdminSubTab("calendar");
                      setCurrentTab("admin");
                    } else {
                      setCurrentTab("calendrier");
                    }
                  }}
                  className="p-2.5 rounded-xl border border-[#E5E7EB] text-gray-650 hover:bg-gray-50 transition-colors cursor-pointer relative"
                  title="Mon Agenda Lives"
                >
                  <CalendarIcon size={18} />
                </button>
              )}

              {/* Dynamic Multi-Role Notification Engine */}
              <NotificationsDropdown
                userId={currentUser.id}
                userRole={currentUser.role}
                notifications={notifications}
                onMarkRead={handleMarkNotificationsRead}
                onClearAll={handleClearAllNotifications}
                onDeleteOne={handleDeleteOneNotification}
                onNavigate={(path) => setCurrentTab(path)}
              />

              {/* User Avatar Identity drop */}
              <div className="relative" ref={profileDropdownRef}>
                <button
                  onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                  className="flex items-center gap-2 border border-[#E5E7EB] p-1 pr-2.5 rounded-xl hover:bg-gray-50 cursor-pointer transition-colors"
                >
                  <div className="w-7 h-7 rounded-full border border-[#10B981] bg-gray-50 flex items-center justify-center text-[#10B981] font-bold text-xs">
                    {currentUser.fullName.charAt(0)}
                  </div>
                  <div className="text-left hidden sm:block text-xs">
                    <p className="font-semibold text-[#0F1E36] max-w-[100px] truncate">{currentUser.fullName}</p>
                    <p className="text-[8px] font-bold text-gray-400 uppercase leading-none mt-0.5">
                      {currentUser.role}
                    </p>
                  </div>
                </button>

                {profileDropdownOpen && (
                  <div className="absolute right-0 mt-2 z-50">
                    <ProfileDropdown
                      user={currentUser}
                      onLogout={handleSignout}
                      onNavigate={(tab) => {
                        setCurrentTab(tab);
                        setProfileDropdownOpen(false);
                      }}
                      onOpenShop={() => {
                        if (typeof setShopCategoryFilter === "function") setShopCategoryFilter("All");
                        setCurrentTab("shop");
                        setProfileDropdownOpen(false);
                      }}
                    />
                  </div>
                )}
              </div>

            </div>
          </div>
        </header>
      ) : null}

      {/* DYNAMIC CALENDAR OVERLAY PANEL */}
      {isCalendarOverlayOpen && currentUser?.role !== "agent" && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex justify-end">
          <motion.div 
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            className="w-full max-w-md bg-white h-screen shadow-2xl p-6 relative flex flex-col justify-between overflow-y-auto"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-center border-b border-[#E5E7EB] pb-3">
                <div className="flex items-center gap-2">
                  <CalendarIcon size={18} className="text-[#10B981]" />
                  <h3 className="font-semibold text-sm text-[#0F1E36]">Agenda Interactif Live Zoom</h3>
                </div>
                <button 
                  onClick={() => setIsCalendarOverlayOpen(false)}
                  className="text-xs p-1 rounded-md text-gray-400 hover:bg-gray-100 cursor-pointer"
                >
                  ✕ Fermer
                </button>
              </div>

              <div className="space-y-4">
                <p className="text-[11px] text-gray-400 leading-normal">
                  Suivez en temps réel la planification des webinaires organisés par M. Nabil Chaouch.
                </p>

                <div className="space-y-3">
                  <div className="p-3 border border-[#E5E7EB] rounded-xl flex items-start gap-3 bg-[#F9FAFB]">
                    <Clock size={16} className="text-[#10B981] mt-0.5" />
                    <div className="text-xs text-left">
                      <p className="font-semibold text-[#0F1E36]">Algorithmique & Graphe</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Lundi à 18h30 | Live Zoom</p>
                    </div>
                  </div>
                  <div className="p-3 border border-[#E5E7EB] rounded-xl flex items-start gap-3 bg-[#F9FAFB]">
                    <Clock size={16} className="text-[#10B981] mt-0.5" />
                    <div className="text-xs text-left">
                      <p className="font-semibold text-[#0F1E36]">Python MySQL Pratique Bac</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Mercredi à 19h00 | Zoom</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <button 
              onClick={() => {
                setCurrentTab("calendrier");
                setIsCalendarOverlayOpen(false);
              }}
              className="w-full mt-6 py-2 bg-[#0F1E36] hover:bg-[#1a2d4b] text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer text-center"
            >
              Consulter l'emploi du temps complet
            </button>
          </motion.div>
        </div>
      )}

      {/* AUTHENTICATED OR GUEST MAIN CONTAINERS */}
      <main className="flex-grow">
        {currentUser && currentUser.status === "disabled" && currentUser.role !== "admin" ? (
          /* BLACKLISTED / BLOCKED VIEW */
          <div className="max-w-md mx-auto my-16 p-8 border border-red-200 rounded-2xl bg-red-50/30 text-center space-y-5 shadow-sm">
            <div className="inline-flex w-16 h-16 bg-red-100 text-red-600 rounded-full items-center justify-center font-bold text-2xl animate-bounce">
              🔒
            </div>
            <h2 className="text-red-950 font-black text-lg tracking-tight">Accès Suspendu & Liste Noire</h2>
            <p className="text-xs text-red-700 leading-relaxed font-semibold">
              Votre compte élève a été suspendu par la direction et placé sur la liste noire.
              Toute connexion à l'interface d'apprentissage, aux cours vidéo, ainsi qu'au compilateur Python est révoquée.
            </p>
            <div className="pt-2">
              <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block mb-4">ID ÉLÈVE : {currentUser.id}</span>
              <button
                onClick={handleSignout}
                className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer inline-flex items-center gap-1.5"
              >
                <LogOut size={13} />
                <span>Retour à l'accueil</span>
              </button>
            </div>
          </div>
        ) : currentUser ? (
          /* AUTHENTICATED FRAMEWORK WORKSPACE */
          <div className="max-w-7xl mx-auto px-6 py-6 flex flex-col md:flex-row gap-6 items-start animate-fade-in w-full">
            
            {/* Unified Workspace Sidebar */}
            <AnimatePresence mode="wait">
              {isSidebarOpen ? (
                <motion.aside
                  key="workspace-sidebar"
                  initial={{ opacity: 0, x: -40 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -40 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                  className="w-full md:w-[314px] shrink-0 flex flex-col gap-2 bg-slate-55/40 backdrop-blur-md border border-gray-200 p-5 rounded-2xl md:sticky md:top-6 shadow-sm overflow-visible relative"
                >
                <div className="pb-3 border-b border-gray-200/50 mb-3 flex items-center justify-between text-left relative">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#0F1E36] block">
                      {currentUser.role === "admin" ? "Menu Direction" : currentUser.role === "agent" ? "Espace Validateur" : "Menu Apprenti"}
                    </span>
                    <div className="mt-1 flex items-center gap-1.5">
                      {currentUser.role === "admin" ? (
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-200/60">
                          Administrateur
                        </span>
                      ) : currentUser.role === "agent" ? (
                        <span className="text-[10px] font-bold text-sky-600 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
                          Agent Académique
                        </span>
                      ) : (
                        <LicenseBadge size="sm" type={isPremiumUser ? "premium" : "freemium"} />
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleSidebar(false)}
                    className="absolute -right-8 top-1 z-40 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-500 rounded-full p-1.5 shadow-md hover:bg-slate-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Masquer la barre"
                    id="hide-sidebar-btn"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                </div>
                <nav className="flex flex-col gap-2 w-full">
                  {currentUser.role === "admin" ? (
                    /* ADMIN SPECIFIC CATEGORIZED & FILTERABLE SIDEBAR */
                    <AdminSidebar
                      activeTab={currentTab === "profile" ? "profile" : adminSubTab}
                      setActiveTab={(subTabId) => {
                        if (subTabId === "profile" || subTabId === "profil") {
                          setCurrentTab("profile");
                          window.location.hash = "#/admin/profile";
                        } else {
                          setCurrentTab("admin");
                          setAdminSubTab(subTabId as any);
                        }
                      }}
                    />
                  ) : (
                    /* STUDENT & AGENT REGULAR MENUS */
                    <>
                      {/* AGENT DIRECT ACCESS ITEM */}
                      {currentUser.role === "agent" && (
                        <button 
                          onClick={() => setCurrentTab("agent")} 
                          className={getNavLinkClass("agent") + " w-full justify-start py-2.5 transition-all transform active:scale-95 duration-100 flex items-center"}
                        >
                          <ShieldCheck size={13} className={currentTab === "agent" ? "text-white" : "text-violet-600"} />
                          <span className="font-bold">Espace Validateur</span>
                        </button>
                      )}

                      {currentUser.role !== "agent" && (
                        <>
                          {/* Section 1: Apprentissage & Révisions */}
                          <div className="pb-1 mb-1 border-b border-gray-200/50">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block px-1">
                              Apprentissage & Révisions
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {/* Fiche & cours */}
                            <div>
                              <button 
                                onClick={() => { 
                                  if (currentTab === "cours") {
                                    setExpandedMenus(prev => ({ ...prev, cours: !prev.cours }));
                                  } else {
                                    setCurrentTab("cours");
                                    if (selectedTrimestre === "revision") setSelectedTrimestre("1ere trimestre");
                                    setExpandedMenus(prev => ({ ...prev, cours: true }));
                                  }
                                }} 
                                className={getNavLinkClass("cours") + " w-full justify-between py-2.5 transition-all transform active:scale-95 duration-100 flex items-center"}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {renderNavIcon('fiches', Video, "text-[#069812]")}
                                  <span className="truncate">{t.tabCours}</span>
                                </div>
                                <ChevronDown 
                                  size={14} 
                                  className={`transform transition-transform duration-200 ${
                                    currentTab === "cours" && expandedMenus.cours ? "rotate-180" : ""
                                  }`} 
                                />
                              </button>
                              {currentTab === "cours" && expandedMenus.cours && (
                                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-emerald-500/40 rtl:border-r-2 rtl:border-l-0 rtl:mr-3 rtl:ml-0 rtl:pr-6 rtl:pl-1">
                                  {[
                                    { id: "1ere trimestre", name: t.trim1 },
                                    { id: "2eme trimestre", name: t.trim2 },
                                    { id: "3eme trimestre", name: t.trim3 }
                                  ].map((trim) => {
                                    const isSelected = currentTab === "cours" && selectedTrimestre === trim.id;
                                    return (
                                      <button
                                        key={trim.id}
                                        onClick={() => {
                                          setCurrentTab("cours");
                                          setSelectedTrimestre(trim.id);
                                        }}
                                        className={`w-full text-start py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between ${
                                          isSelected
                                            ? "bg-[#2563EB] text-white shadow-xs"
                                            : "text-gray-550 hover:text-gray-950 hover:bg-slate-100/70"
                                        }`}
                                      >
                                        <span>{trim.name}</span>
                                        <span className={`text-[7px] px-1 rounded uppercase font-extrabold ${
                                          isSelected ? "bg-white/20 text-white" : "bg-emerald-500/10 text-emerald-700"
                                        }`}>
                                          Cours
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Devoirs & Exercices */}
                            <div>
                              <button 
                                onClick={() => { 
                                  if (currentTab === "devoirs") {
                                    setExpandedMenus(prev => ({ ...prev, devoirs: !prev.devoirs }));
                                  } else {
                                    setCurrentTab("devoirs");
                                    setExpandedMenus(prev => ({ ...prev, devoirs: true }));
                                  }
                                }} 
                                className={getNavLinkClass("devoirs") + " w-full justify-between py-2.5 transition-all transform active:scale-95 duration-100 flex items-center"}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {renderNavIcon('devoirs', BookOpen, "text-[#069812]")}
                                  <span className="truncate">{t.tabDevoirs}</span>
                                </div>
                                <ChevronDown 
                                  size={14} 
                                  className={`transform transition-transform duration-200 ${
                                    currentTab === "devoirs" && expandedMenus.devoirs ? "rotate-180" : ""
                                  }`} 
                                />
                              </button>
                              {currentTab === "devoirs" && expandedMenus.devoirs && (
                                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-emerald-500/40 rtl:border-r-2 rtl:border-l-0 rtl:mr-3 rtl:ml-0 rtl:pr-6 rtl:pl-1">
                                  {[
                                    { id: "1ere trimestre", name: t.trim1 },
                                    { id: "2eme trimestre", name: t.trim2 },
                                    { id: "3eme trimestre", name: t.trim3 },
                                    { id: "revision", name: "Énoncé live" }
                                  ].map((trim) => {
                                    const isSelected = currentTab === "devoirs" && selectedTrimestre === trim.id;
                                    return (
                                      <button
                                        key={trim.id}
                                        onClick={() => {
                                          setCurrentTab("devoirs");
                                          setSelectedTrimestre(trim.id);
                                        }}
                                        className={`w-full text-start py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between ${
                                          isSelected
                                            ? "bg-[#2563EB] text-white shadow-xs"
                                            : "text-gray-550 hover:text-gray-950 hover:bg-slate-100/70"
                                        }`}
                                      >
                                        <span>{trim.name}</span>
                                        <span className={`text-[7px] px-1 rounded uppercase font-extrabold ${
                                          isSelected ? "bg-white/20 text-white" : trim.id === "revision" ? "bg-amber-500/10 text-amber-700" : "bg-emerald-500/10 text-emerald-700"
                                        }`}>
                                          {trim.id === "revision" ? "Live" : "Dev"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Zone Correction */}
                            <div>
                              <button 
                                onClick={() => { 
                                  if (currentTab === "corrections") {
                                    setExpandedMenus(prev => ({ ...prev, corrections: !prev.corrections }));
                                  } else {
                                    setCurrentTab("corrections");
                                    setExpandedMenus(prev => ({ ...prev, corrections: true }));
                                  }
                                }} 
                                className={getNavLinkClass("corrections") + " w-full justify-between py-2.5 transition-all transform active:scale-95 duration-100 flex items-center"}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {renderNavIcon('corrections', FileText, "text-[#069812]")}
                                  <span className="truncate">{t.zoneCorrection}</span>
                                </div>
                                <ChevronDown 
                                  size={14} 
                                  className={`transform transition-transform duration-200 ${
                                    currentTab === "corrections" && expandedMenus.corrections ? "rotate-180" : ""
                                  }`} 
                                />
                              </button>
                              {currentTab === "corrections" && expandedMenus.corrections && (
                                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-emerald-500/40 rtl:border-r-2 rtl:border-l-0 rtl:mr-3 rtl:ml-0 rtl:pr-6 rtl:pl-1">
                                  {[
                                    { id: "1ere trimestre", name: t.trim1 },
                                    { id: "2eme trimestre", name: t.trim2 },
                                    { id: "3eme trimestre", name: t.trim3 },
                                    { id: "revision", name: "Live enregistré" }
                                  ].map((trim) => {
                                    const isSelected = currentTab === "corrections" && selectedTrimestre === trim.id;
                                    return (
                                      <button
                                        key={"corr-" + trim.id}
                                        onClick={() => {
                                          setCurrentTab("corrections");
                                          setSelectedTrimestre(trim.id);
                                        }}
                                        className={`w-full text-start py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between ${
                                          isSelected
                                            ? "bg-[#2563EB] text-white shadow-xs"
                                            : "text-gray-550 hover:text-gray-950 hover:bg-slate-100/70"
                                        }`}
                                      >
                                        <span>{trim.name}</span>
                                        <span className={`text-[7px] px-1 rounded uppercase font-extrabold ${
                                          isSelected ? "bg-white/20 text-white" : trim.id === "revision" ? "bg-amber-500/10 text-amber-700" : "bg-blue-500/10 text-[#2563EB]"
                                        }`}>
                                          {trim.id === "revision" ? "Replay" : "Corr"}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Menu Révision */}
                            <div>
                              <button 
                                onClick={() => { 
                                  if (currentTab === "revision") {
                                    setExpandedMenus(prev => ({ ...prev, revision: !prev.revision }));
                                  } else {
                                    setCurrentTab("revision");
                                    setRevisionSubTab("enonce");
                                    setSelectedTrimestre("revision");
                                    setExpandedMenus(prev => ({ ...prev, revision: true }));
                                  }
                                }} 
                                className={getNavLinkClass("revision") + " w-full justify-between py-2.5 transition-all transform active:scale-95 duration-100 flex items-center"}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {renderNavIcon('revision', Sparkles, "text-amber-500")}
                                  <span className="truncate">Révision</span>
                                </div>
                                <ChevronDown 
                                  size={14} 
                                  className={`transform transition-transform duration-200 ${
                                    currentTab === "revision" && expandedMenus.revision ? "rotate-180" : ""
                                  }`} 
                                />
                              </button>
                              {currentTab === "revision" && expandedMenus.revision && (
                                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-amber-500/40">
                                  {[
                                    { id: "enonce", name: "énoncé", badge: "Live" },
                                    { id: "correction", name: "correction", badge: "Corr" }
                                  ].map((sub) => {
                                    const isSelected = currentTab === "revision" && revisionSubTab === sub.id;
                                    return (
                                      <button
                                        key={"rev-" + sub.id}
                                        onClick={() => {
                                          setCurrentTab("revision");
                                          setRevisionSubTab(sub.id as "enonce" | "correction");
                                          setSelectedTrimestre("revision");
                                        }}
                                        className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer flex items-center justify-between ${
                                          isSelected
                                            ? "bg-[#2563EB] text-white shadow-xs"
                                            : "text-gray-550 hover:text-gray-950 hover:bg-slate-100/70"
                                        }`}
                                      >
                                        <span>{sub.name}</span>
                                        <span className={`text-[7px] px-1 rounded uppercase font-extrabold ${
                                          isSelected ? "bg-white/20 text-white" : "bg-amber-500/10 text-amber-700"
                                        }`}>
                                          {sub.badge}
                                        </span>
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Section 2: Entraînement & Outils */}
                          <div className="pb-1 mb-1 mt-3 border-b border-gray-200/50">
                            <span className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 block px-1">
                              Entraînement & Outils
                            </span>
                          </div>
                          <div className="flex flex-col gap-1.5">
                            {/* Quiz */}
                            <div>
                              <button 
                                onClick={() => { 
                                  if (currentTab === "qcm") {
                                    setExpandedMenus(prev => ({ ...prev, qcm: !prev.qcm }));
                                  } else {
                                    setCurrentTab("qcm");
                                    if (selectedTrimestre === "revision") setSelectedTrimestre("1ere trimestre");
                                    setExpandedMenus(prev => ({ ...prev, qcm: true }));
                                  }
                                }} 
                                className={getNavLinkClass("qcm") + " w-full justify-between py-2.5 transition-all transform active:scale-95 duration-100 flex items-center"}
                              >
                                <div className="flex items-center gap-1.5 min-w-0">
                                  {renderNavIcon('quiz', Grid, "text-emerald-600")}
                                  <span className="truncate">{t.tabQuiz}</span>
                                </div>
                                <ChevronDown 
                                  size={14} 
                                  className={`transform transition-transform duration-200 ${
                                    currentTab === "qcm" && expandedMenus.qcm ? "rotate-180" : ""
                                  }`} 
                                />
                              </button>
                              {currentTab === "qcm" && expandedMenus.qcm && (
                                <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-emerald-500/40">
                                  {[
                                    { id: "1ere trimestre", name: t.trim1 },
                                    { id: "2eme trimestre", name: t.trim2 },
                                    { id: "3eme trimestre", name: t.trim3 }
                                  ].map((trim) => {
                                    const isSelected = selectedTrimestre === trim.id;
                                    return (
                                      <button
                                        key={trim.id}
                                        onClick={() => setSelectedTrimestre(trim.id)}
                                        className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                          isSelected
                                            ? "bg-[#2563EB] text-white shadow-xs"
                                            : "text-gray-550 hover:text-gray-950 hover:bg-slate-100/70"
                                        }`}
                                      >
                                        {trim.name}
                                      </button>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Python Compiler */}
                            {currentUser && currentUser.role !== "student" && (
                              <button onClick={() => setCurrentTab("editeur-python")} className={getNavLinkClass("editeur-python") + " w-full justify-start py-2.5 transition-all transform active:scale-95 duration-100"}>
                                <Code size={13} />
                                <span>{t.tabPython}</span>
                              </button>
                            )}

                            {/* Calendrier & Live */}
                            {currentUser?.role !== "agent" && (
                              <div>
                                <button 
                                  onClick={() => { 
                                    if (currentTab === "calendrier" || currentTab === "todo-calendrier" || currentTab === "calendrier-annuel") {
                                      setExpandedMenus(prev => ({ ...prev, calendrier: !prev.calendrier }));
                                    } else {
                                      setCurrentTab("calendrier");
                                      setExpandedMenus(prev => ({ ...prev, calendrier: true }));
                                    }
                                  }} 
                                  className={getNavLinkClass("calendrier") + " w-full justify-between py-2.5 transition-all transform active:scale-95 duration-100 flex items-center"}
                                >
                                  <div className="flex items-center gap-1.5">
                                    <CalendarIcon size={13} />
                                    <span>{t.tabCalendrier}</span>
                                  </div>
                                  <ChevronDown 
                                    size={14} 
                                    className={`transform transition-transform duration-200 ${
                                      (currentTab === "calendrier" || currentTab === "todo-calendrier" || currentTab === "calendrier-annuel") && expandedMenus.calendrier ? "rotate-180" : ""
                                    }`} 
                                  />
                                </button>
                                {(currentTab === "calendrier" || currentTab === "todo-calendrier" || currentTab === "calendrier-annuel") && expandedMenus.calendrier && (
                                  <div className="pl-6 pr-1 py-1 flex flex-col gap-1 mt-1 border-l-2 ml-3 border-emerald-500/40">
                                    {currentUser?.role !== "student" && [
                                      { id: "1ere trimestre", name: t.trim1 },
                                      { id: "2eme trimestre", name: t.trim2 },
                                      { id: "3eme trimestre", name: t.trim3 },
                                      { id: "revision", name: t.trimRevision }
                                    ].map((trim) => {
                                      const isSelected = currentTab === "calendrier" && selectedTrimestre === trim.id;
                                      return (
                                        <button
                                          key={trim.id}
                                          onClick={() => {
                                            setCurrentTab("calendrier");
                                            setSelectedTrimestre(trim.id);
                                          }}
                                          className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                            isSelected
                                              ? "bg-[#2563EB] text-white shadow-xs"
                                              : "text-gray-550 hover:text-gray-950 hover:bg-slate-100/70"
                                          }`}
                                        >
                                          {trim.name}
                                        </button>
                                      );
                                    })}
                                    
                                    <button
                                      onClick={() => setCurrentTab("todo-calendrier")}
                                      className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                        currentTab === "todo-calendrier"
                                          ? "bg-[#2563EB] text-white shadow-xs"
                                          : "text-gray-550 hover:text-gray-950 hover:bg-slate-100/70"
                                      }`}
                                    >
                                      {t.calDevoirs}
                                    </button>

                                    <button
                                      onClick={() => setCurrentTab("calendrier-annuel")}
                                      className={`w-full text-left py-1.5 px-2 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all cursor-pointer ${
                                        currentTab === "calendrier-annuel"
                                          ? "bg-[#2563EB] text-white shadow-xs"
                                          : "text-gray-550 hover:text-gray-950 hover:bg-slate-100/70"
                                      }`}
                                    >
                                      {t.calAnnuel}
                                    </button>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>

                          {/* SECTION ESPACE PERSONNEL */}
                          <div className="space-y-1.5 pt-4 border-t border-slate-200/60 mt-3">
                            <span className="px-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">ESPACE PERSONNEL</span>

                            {/* Bouton Démo & Extraits */}
                            <button 
                              onClick={() => setCurrentTab("demos")} 
                              className={`w-full flex items-center gap-3 px-3 py-2.5 font-bold text-xs rounded-xl transition cursor-pointer text-left ${
                                currentTab === "demos"
                                  ? "bg-purple-600 text-white shadow-md shadow-purple-600/20"
                                  : "bg-white hover:bg-purple-50 text-slate-700 hover:text-purple-700 border border-slate-200/80 group"
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg transition ${
                                currentTab === "demos"
                                  ? "bg-white/20 text-white"
                                  : "bg-purple-100 text-purple-600 group-hover:bg-purple-200"
                              }`}>
                                <PlayCircle className="w-4 h-4 stroke-[2]"/>
                              </div>
                              <span>{t.tabDemos || "Démo & Extraits"}</span>
                            </button>

                            {/* Bouton Abonnements / Shop */}
                            <button 
                              onClick={() => { setShopCategoryFilter("All"); setCurrentTab("shop"); }} 
                              className={`w-full flex items-center gap-3 px-3 py-2.5 font-bold text-xs rounded-xl transition cursor-pointer text-left ${
                                currentTab === "shop"
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 group"
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg transition ${
                                currentTab === "shop"
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600"
                              }`}>
                                <ShoppingBag className="w-4 h-4 stroke-[2]"/>
                              </div>
                              <span>{t.tabShop || "Abonnements / Shop"}</span>
                            </button>

                            {/* Bouton Mon Espace Profil */}
                            <button 
                              onClick={() => setCurrentTab("profile")} 
                              className={`w-full flex items-center gap-3 px-3 py-2.5 font-bold text-xs rounded-xl transition cursor-pointer text-left ${
                                currentTab === "profile"
                                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20"
                                  : "bg-white hover:bg-slate-50 text-slate-700 border border-slate-200/80 group"
                              }`}
                            >
                              <div className={`p-1.5 rounded-lg transition ${
                                currentTab === "profile"
                                  ? "bg-white/20 text-white"
                                  : "bg-slate-100 text-slate-600 group-hover:bg-emerald-50 group-hover:text-emerald-600"
                              }`}>
                                <UserIcon className="w-4 h-4 stroke-[2]"/>
                              </div>
                              <span>{t.tabProfile || "Mon Espace Profil"}</span>
                            </button>
                          </div>
                        </>
                      )}
                    </>
                  )}
                </nav>
                </motion.aside>
              ) : (
                <motion.aside
                  key="collapsed-sidebar-btn"
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="w-[314px] h-[1043.86px] min-h-[1043.86px] shrink-0 bg-white border border-slate-200 rounded-2xl p-0 shadow-sm overflow-visible relative md:sticky md:top-6 select-none transition-all duration-300 flex items-center justify-center"
                >
                  {/* Bouton de bascule */}
                  <button 
                    onClick={() => setIsSidebarOpen(true)}
                    className="absolute -right-3 top-6 z-40 bg-white border border-slate-200 text-slate-600 hover:text-emerald-600 hover:border-emerald-500 rounded-full p-1.5 shadow-md hover:bg-slate-50 flex items-center justify-center hover:scale-110 active:scale-95 transition-all cursor-pointer"
                    title="Afficher le menu"
                    id="show-sidebar-btn"
                  >
                    <ChevronRight className="w-4 h-4 text-[#196aed]" />
                  </button>

                  {/* Image occupant toute la largeur et longueur du menu */}
                  {(() => {
                    const colImgUrl = collapsedSidebarImage || getRandomCollapsedSidebarImage(appMediaItems);
                    return (
                      <div 
                        onClick={() => setIsSidebarOpen(true)}
                        className="w-full h-full flex items-center justify-center overflow-hidden rounded-2xl cursor-pointer"
                        title="Cliquez pour déplier le menu"
                      >
                        <img 
                          src={colImgUrl} 
                          alt="Visuel Menu Réduit" 
                          className="w-full h-full object-cover rounded-2xl"
                        />
                      </div>
                    );
                  })()}
                </motion.aside>
              )}
            </AnimatePresence>

            {/* TAB RENDERING VIEWPORTS WITH POLISHED TRANSITION */}
            <div id="route-panel-viewport" className="flex-1 w-full overflow-hidden">
              {currentUser?.role === "student" && currentUser?.accountType === "premium" && currentUser?.subscriptionExpiresAt && (() => {
                const expiresAt = new Date(currentUser.subscriptionExpiresAt).getTime();
                const timeLeft = expiresAt - Date.now();
                const soon = timeLeft > 0 && timeLeft <= 24 * 60 * 60 * 1000;
                if (!soon) return null;
                return (
                  <div className="mb-4 bg-red-50 border-2 border-red-500 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-left animate-pulse">
                    <div className="flex items-center gap-3">
                      <span className="text-xl">🚨</span>
                      <div>
                        <h4 className="font-extrabold text-[#E31B23] text-xs">Attention, votre accès Premium expire bientôt !</h4>
                        <p className="text-[11px] text-red-700 mt-0.5 font-medium">
                          Votre forfait Premium expire dans moins de 24 heures (Fin de validité : <span className="font-extrabold">{new Date(currentUser.subscriptionExpiresAt).toLocaleString()}</span>).
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => {
                        if (typeof setShopCategoryFilter === "function") setShopCategoryFilter("All");
                        setCurrentTab("shop");
                      }}
                      className="px-4 py-2 font-black bg-[#E31B23] hover:bg-red-700 text-white rounded-xl text-xs transition-all active:scale-95 cursor-pointer whitespace-nowrap shrink-0"
                    >
                      S'abonner / Renouveler 🚀
                    </button>
                  </div>
                );
              })()}

              <AnimatePresence mode="wait">
                <motion.div
                  key={currentTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {currentTab === "agent" && currentUser.role === "agent" && (
                    <AgentConsole
                      currentUser={currentUser}
                      onSignout={handleSignout}
                      currentLanguage={currentLanguage}
                    />
                  )}

                  {currentTab === "admin" && currentUser.role === "admin" && (
                    <AdminConsole
                      currentUser={currentUser}
                      currentLanguage={currentLanguage}
                      onAdminActionRefetch={fetchAllUsersAndData}
                      allUsersList={allUsersList}
                      initialActiveSubTab={adminSubTab}
                      onSubTabChange={(tab) => setAdminSubTab(tab)}
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
                      onSaveBranding={handleSaveBrandingConfig}
                    />
                  )}

                  {(currentTab === "dashboard" || currentTab === "student/dashboard") && (
                    <StudentDashboard
                      onNavigateToCourse={() => setCurrentTab("cours")}
                    />
                  )}

                  {currentTab === "cours" && (
                    <CoursView
                      isPremiumUser={isPremiumUser}
                      userGrade={currentUser.grade}
                      userSection={currentUser.section}
                      userRole={currentUser.role}
                      selectedTrimestre={selectedTrimestre}
                      currentLanguage={currentLanguage}
                      studentUpdatesConfig={studentUpdatesConfig}
                      onGoToShop={handlePreparePremiumUpgrade}
                    />
                  )}

                  {currentTab === "devoirs" && (
                    <DevoirsView
                      isPremiumUser={isPremiumUser}
                      userGrade={currentUser.grade}
                      userSection={currentUser.section}
                      selectedTrimestre={selectedTrimestre}
                      userRole={currentUser.role}
                      currentLanguage={currentLanguage}
                      onGoToShop={handlePreparePremiumUpgrade}
                    />
                  )}

                  {currentTab === "corrections" && (
                    <CorrectionView
                      isPremiumUser={isPremiumUser}
                      userGrade={currentUser.grade}
                      userSection={currentUser.section}
                      selectedTrimestre={selectedTrimestre}
                      userRole={currentUser.role}
                      currentLanguage={currentLanguage}
                      onGoToShop={handlePreparePremiumUpgrade}
                    />
                  )}

                  {currentTab === "revision" && revisionSubTab === "enonce" && (
                    <DevoirsView
                      isPremiumUser={isPremiumUser}
                      userGrade={currentUser.grade}
                      userSection={currentUser.section}
                      selectedTrimestre="revision"
                      userRole={currentUser.role}
                      currentLanguage={currentLanguage}
                      onGoToShop={handlePreparePremiumUpgrade}
                    />
                  )}

                  {currentTab === "revision" && revisionSubTab === "correction" && (
                    <CorrectionView
                      isPremiumUser={isPremiumUser}
                      userGrade={currentUser.grade}
                      userSection={currentUser.section}
                      selectedTrimestre="revision"
                      userRole={currentUser.role}
                      currentLanguage={currentLanguage}
                      onGoToShop={handlePreparePremiumUpgrade}
                    />
                  )}

                  {currentTab === "bibliotheque" && (
                    <ProtectedRoute
                      allowedRole="student"
                      fallbackTab="cours"
                      onUnauthorized={(msg) => {
                        setSecurityAlert(msg);
                        setTimeout(() => setSecurityAlert(null), 4000);
                      }}
                    >
                      {currentUser?.role === "student" && !isPremiumUser ? (
                        <FreemiumLockOverlay
                          sectionName="Bibliothèque E-Book"
                          onGoToShop={handlePreparePremiumUpgrade}
                        />
                      ) : (
                        <BibliothequeWrapper
                          ebooks={ebooks}
                          isPremiumUser={isPremiumUser}
                          searchQuery={searchQuery}
                          userRole={currentUser?.role}
                          onGoToShop={handlePreparePremiumUpgrade}
                        />
                      )}
                    </ProtectedRoute>
                  )}

                  {currentTab === "student/pdf-viewer" && (
                    <ProtectedRoute
                      allowedRole="student"
                      fallbackTab="cours"
                      onUnauthorized={(msg) => {
                        setSecurityAlert(msg);
                        setTimeout(() => setSecurityAlert(null), 4000);
                      }}
                    >
                      <BibliothequeWrapper
                        ebooks={ebooks}
                        isPremiumUser={isPremiumUser}
                        searchQuery={searchQuery}
                        userRole={currentUser?.role}
                        onGoToShop={handlePreparePremiumUpgrade}
                        initialSubTab="pdf"
                      />
                    </ProtectedRoute>
                  )}

                  {currentTab === "qcm" && currentUser.role !== "agent" && (
                    <InteractiveQuizModule
                      currentUser={currentUser}
                      handlePreparePremiumUpgrade={handlePreparePremiumUpgrade}
                      isPremiumUser={isPremiumUser}
                      selectedTrimestre={selectedTrimestre}
                      currentLanguage={currentLanguage}
                    />
                  )}

                  {(currentTab === "student/code-viewer" || currentTab === "python-code-viewer") && (
                    <PythonViewerPage
                      exercise={activePythonExercise}
                      exerciseId={pythonExerciseId}
                      onBack={handleViewerBack}
                      isPremiumUser={isPremiumUser}
                    />
                  )}

                  {(currentTab === "student/text-viewer" || currentTab === "text-document-viewer") && (
                    <TextViewerPage
                      exercise={activeTxtExercise}
                      exerciseId={txtExerciseId}
                      onBack={handleViewerBack}
                      isPremiumUser={isPremiumUser}
                    />
                  )}

                  {(currentTab === "student/viewer" || currentTab === "document-viewer") && (
                    <DocumentViewerPage
                      exercise={activeDocExercise}
                      resourceId={docExerciseId}
                      onBack={handleViewerBack}
                      isPremiumUser={isPremiumUser}
                    />
                  )}

                  {currentTab === "editeur-python" && currentUser?.role !== "student" && (
                    <div className="space-y-6">


                      {/* HELP & SHORTCUTS MODAL */}
                      <AnimatePresence>
                        {isHelpModalOpen && (
                          <div className="fixed inset-0 z-[110] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
                            <motion.div
                              initial={{ scale: 0.95, opacity: 0 }}
                              animate={{ scale: 1, opacity: 1 }}
                              exit={{ scale: 0.95, opacity: 0 }}
                              transition={{ duration: 0.2, ease: "easeOut" }}
                              className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col max-h-[85vh]"
                            >
                              {/* Header */}
                              <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
                                <h3 className="font-bold text-[#0F1E36] text-sm uppercase tracking-wider flex items-center gap-2">
                                  <HelpCircle size={18} className="text-blue-600" />
                                  <span>Guide & Raccourcis Sandbox Python</span>
                                </h3>
                                <button
                                  onClick={() => setIsHelpModalOpen(false)}
                                  className="text-gray-400 hover:text-gray-650 hover:bg-gray-100 p-1.5 rounded-full transition-colors cursor-pointer text-xs"
                                >
                                  ✕
                                </button>
                              </div>

                              {/* Tabs selector */}
                              <div className="flex border-b border-gray-100 bg-white">
                                <button
                                  type="button"
                                  onClick={() => setActiveHelpTab("shortcuts")}
                                  className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                                    activeHelpTab === "shortcuts"
                                      ? "border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5"
                                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  ⌨ Raccourcis Clavier
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setActiveHelpTab("syntax")}
                                  className={`flex-1 py-3 text-center text-xs font-semibold border-b-2 transition-all cursor-pointer ${
                                    activeHelpTab === "syntax"
                                      ? "border-[#2563EB] text-[#2563EB] bg-[#2563EB]/5"
                                      : "border-transparent text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                                  }`}
                                >
                                  🐍 Syntaxe Essentielle Python
                                </button>
                              </div>

                              {/* Content */}
                              <div className="p-6 overflow-y-auto flex-1 space-y-4">
                                {activeHelpTab === "shortcuts" && (
                                  <div className="space-y-4">
                                    <p className="text-xs text-gray-550 leading-normal">
                                      Optimisez votre flux de travail de programmation avec ces raccourcis clavier intégrés conçus spécifiquement pour l'éditeur Sandbox :
                                    </p>
                                    <div className="divide-y divide-gray-100 border border-gray-100 rounded-xl overflow-hidden bg-white">
                                      <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-xs font-semibold text-gray-800">Compiler & Exécuter</span>
                                          <span className="text-[10px] text-gray-400">Lance l'exécution et vérifie les cas d'arrêt</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-mono text-[10px]">
                                          <kbd className="px-2 py-1 bg-gray-150 border border-gray-250 rounded shadow-xs text-gray-700 font-bold">Ctrl</kbd>
                                          <span className="text-gray-400">+</span>
                                          <kbd className="px-2 py-1 bg-gray-150 border border-gray-250 rounded shadow-xs text-gray-700 font-bold">Entrée</kbd>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-xs font-semibold text-gray-800">Réinitialiser le code</span>
                                          <span className="text-[10px] text-gray-400">Recharge le code de départ de l'exercice</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-mono text-[10px]">
                                          <kbd className="px-2 py-1 bg-gray-150 border border-gray-250 rounded shadow-xs text-gray-700 font-bold">Ctrl</kbd>
                                          <span className="text-gray-400">+</span>
                                          <kbd className="px-2 py-1 bg-gray-150 border border-gray-250 rounded shadow-xs text-gray-700 font-bold">Alt</kbd>
                                          <span className="text-gray-400">+</span>
                                          <kbd className="px-2 py-1 bg-gray-150 border border-gray-250 rounded shadow-xs text-gray-700 font-bold">R</kbd>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-xs font-semibold text-gray-800">Afficher/Masquer Explications</span>
                                          <span className="text-[10px] text-gray-400">Pli ou dépli le volet de l'exercice</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-mono text-[10px]">
                                          <kbd className="px-2 py-1 bg-gray-150 border border-gray-250 rounded shadow-xs text-gray-700 font-bold">Alt</kbd>
                                          <span className="text-gray-400">+</span>
                                          <kbd className="px-2 py-1 bg-gray-150 border border-gray-250 rounded shadow-xs text-gray-700 font-bold">D</kbd>
                                        </div>
                                      </div>

                                      <div className="flex items-center justify-between p-3.5 hover:bg-gray-50 transition-colors">
                                        <div className="flex flex-col gap-0.5">
                                          <span className="text-xs font-semibold text-gray-800">Indentation Python</span>
                                          <span className="text-[10px] text-gray-400">Insère 4 espaces pour respecter la syntaxe</span>
                                        </div>
                                        <div className="flex items-center gap-1 font-mono text-[10px]">
                                          <kbd className="px-2 py-1 bg-gray-150 border border-gray-250 rounded shadow-xs text-gray-700 font-bold">Tab</kbd>
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}

                                {activeHelpTab === "syntax" && (
                                  <div className="space-y-4">
                                    <p className="text-xs text-gray-550 leading-normal">
                                      Rappels rapides pour structurer vos algorithmes en Python. L'indentation est requise à chaque bloc :
                                    </p>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                                        <h4 className="text-xs font-bold text-[#0F1E36] mb-2 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                          Variables & Affichage
                                        </h4>
                                        <pre className="text-[10px] sm:text-xs font-mono bg-[#09111e] text-emerald-400 p-2.5 rounded-lg overflow-x-auto leading-normal">
{`# Déclaration de variables
nom = "Amir"
age = 17
notes = [12.5, 14.0, 16.5]

# Affichage standard
print("Bonjour", nom)
print("Moyenne :", sum(notes)/len(notes))`}
                                        </pre>
                                      </div>

                                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                                        <h4 className="text-xs font-bold text-[#0F1E36] mb-2 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                          Conditions (Si / Sinon)
                                        </h4>
                                        <pre className="text-[10px] sm:text-xs font-mono bg-[#09111e] text-emerald-400 p-2.5 rounded-lg overflow-x-auto leading-normal">
{`# Structure conditionnelle
if age >= 18:
    print("Majeur")
elif age >= 16:
    print("Presque majeur")
else:
    print("Mineur")`}
                                        </pre>
                                      </div>

                                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                                        <h4 className="text-xs font-bold text-[#0F1E36] mb-2 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                          Boucle Pour (Loops)
                                        </h4>
                                        <pre className="text-[10px] sm:text-xs font-mono bg-[#09111e] text-emerald-400 p-2.5 rounded-lg overflow-x-auto leading-normal">
{`# Boucle de 0 à 4 (range)
for i in range(5):
    print(i)

# Parcourir une liste
fruits = ["pomme", "banane", "orange"]
for f in fruits:
    print("Fruit :", f)`}
                                        </pre>
                                      </div>

                                      <div className="bg-slate-50 border border-slate-100 rounded-xl p-3.5">
                                        <h4 className="text-xs font-bold text-[#0F1E36] mb-2 flex items-center gap-1.5">
                                          <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                          Définir une Fonction
                                        </h4>
                                        <pre className="text-[10px] sm:text-xs font-mono bg-[#09111e] text-emerald-400 p-2.5 rounded-lg overflow-x-auto leading-normal">
{`# Fonction simple avec retour
def calculer_carre(n):
    return n * n

resultat = calculer_carre(5)
print(resultat) # Affiche 25`}
                                        </pre>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>

                              {/* Footer */}
                              <div className="px-5 py-4 border-t border-gray-150 flex justify-end bg-gray-50 gap-2.5">
                                <button
                                  type="button"
                                  onClick={() => setIsHelpModalOpen(false)}
                                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-xs shadow-sm cursor-pointer transition-all"
                                >
                                  Compris !
                                </button>
                              </div>
                            </motion.div>
                          </div>
                        )}
                      </AnimatePresence>
                      <SandboxPython
                        userId={currentUser.id}
                        theme="light"
                        onStatsUpdated={() => {}}
                        mode="compiler"
                        isDescriptionExpanded={isSandboxDescExpanded}
                        onDescriptionExpandedChange={setIsSandboxDescExpanded}
                        isInstructionsMaximized={isInstructionsMaximized}
                        onInstructionsMaximizedChange={setIsInstructionsMaximized}
                        resetCodeTrigger={sandboxResetTrigger}
                        formatCodeTrigger={sandboxFormatTrigger}
                        saveCodeTrigger={sandboxSaveTrigger}
                        isConsoleOpen={sandboxConsoleOpen}
                        onConsoleOpenChange={setSandboxConsoleOpen}
                        onSyntaxChange={setSandboxSyntaxStatus}
                        onExerciseChange={setCurrentExerciseIndex}
                        userRole={currentUser.role}
                        userTier={isPremiumUser ? "pro" : "freemium"}
                        sharedCodeString={sandboxSharedCode}
                      />
                    </div>
                  )}

                  {currentTab === "calendrier" && currentUser?.role !== "agent" && (
                    <CalendrierView 
                      isPremiumUser={isPremiumUser} 
                      userId={currentUser?.id} 
                      userRole={currentUser?.role} 
                      userGrade={currentUser?.grade}
                      selectedTrimestre={selectedTrimestre}
                      currentLanguage={currentLanguage}
                      notifications={notifications}
                    />
                  )}

                  {currentTab === "todo-calendrier" && currentUser?.role !== "agent" && (
                    <TodoCalendrierView 
                      userId={currentUser?.id} 
                      userRole={currentUser?.role} 
                    />
                  )}

                  {currentTab === "calendrier-annuel" && currentUser?.role !== "agent" && (
                    <CalendrierAnnuelView 
                      isPremiumUser={isPremiumUser} 
                      userId={currentUser?.id} 
                      userRole={currentUser?.role} 
                      userGrade={currentUser?.grade}
                    />
                  )}

                  {(currentTab === "shop" || currentTab === "panier" || currentTab === "wishlist") && (
                    <ShopView
                      userId={currentUser.id}
                      userGrade={currentUser.grade}
                      userSection={currentUser.section}
                      userRole={currentUser.role}
                      cart={cart}
                      setCart={setCart}
                      wishlist={wishlist}
                      setWishlist={setWishlist}
                      currentTab={currentTab}
                      setCurrentTab={setCurrentTab}
                      initialCategory={shopCategoryFilter}
                    />
                  )}

                  {currentTab === "demos" && (
                    <StudentDemoView
                      onGoToShop={() => {
                        setShopCategoryFilter("All");
                        setCurrentTab("shop");
                      }}
                      onGoToCourse={() => setCurrentTab("cours")}
                      isPremiumUser={isPremiumUser}
                    />
                  )}

                  {currentTab === "profile" && (
                    <ProfileView
                      currentUser={currentUser}
                      setCurrentUser={setCurrentUser}
                      onAdminActionRefetch={fetchAllUsersAndData}
                      allUsersList={allUsersList}
                      scrollTopPosition={scrollTopPosition}
                      onScrollTopPositionChange={handleUpdateScrollTopPosition}
                      scrollTopIcon={scrollTopIcon}
                      onScrollTopIconChange={handleUpdateScrollTopIcon}
                      hideScrollTopOnMobile={hideScrollTopOnMobile}
                      onHideScrollTopOnMobileChange={handleUpdateHideScrollTopOnMobile}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

          </div>
        ) : showLandingPage ? (
          <LandingPage
            theme={theme}
            toggleTheme={toggleTheme}
            currentLanguage={currentLanguage}
            onLanguageChange={(lang) => setCurrentLanguage(lang)}
            heroImageUrl={heroImageUrl}
            studentImageUrl={studentImageUrl}
            onLoginClick={() => {
              setShowLandingPage(false);
              setIsRegistering(false);
            }}
            onRegisterClick={() => {
              setShowLandingPage(false);
              setIsRegistering(true);
            }}
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
            isAdmin={currentUser?.role === "admin" || localStorage.getItem("is_admin_device") === "true"}
            landingUpdatesConfig={landingUpdatesConfig}
          />
        ) : (
          /* GUEST ACCOUNT CREDENTIAL SIGN IN AND REGISTER WORKSPACE */
          <div className="min-h-screen w-full flex flex-col lg:flex-row bg-[#F8FAFC]">
            
            {/* LEFT SIDE: Student Banner / Illustration Panel (Controlled by Admin authHeroImageConfig) */}
            <AuthHeroBanner
              config={authHeroImageConfig}
              imageUrl={
                isRegistering 
                  ? (registerImageUrl || studentImageUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400")
                  : (loginImageUrl || studentImageUrl || "https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&q=80&w=400")
              }
              isRegistering={isRegistering}
              className={`hidden lg:flex ${isRegistering ? "lg:w-[35%]" : "lg:w-[42%]"} shrink-0`}
            />

            {/* RIGHT SIDE: Auth forms container */}
            <div className="flex-1 min-h-screen bg-white flex flex-col justify-between relative overflow-y-auto">
              
              {/* Back to home / Revenir à l'accueil in upper right (affiché uniquement sur l'écran de connexion pour éviter la duplication avec l'en-tête d'inscription) */}
              {!isRegistering && (
                <div className="absolute top-6 right-6 z-20">
                  <BackButton
                    onClick={() => setShowLandingPage(true)}
                    label={t.backToHome}
                  />
                </div>
              )}

              {/* Main centered content area */}
              <div className={`flex-1 w-full ${isRegistering ? "max-w-xl md:max-w-2xl lg:max-w-3xl" : "max-w-md md:max-w-lg"} mx-auto flex flex-col justify-center px-6 py-12 md:px-10 transition-all duration-500`} dir={currentLanguage === "ar" ? "rtl" : "ltr"}>
                
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                  className="w-full"
                >
                  {isRegistering ? (
                    <RegisterMultiStep
                      onSuccess={() => setIsRegistering(false)}
                      onBackToLogin={() => setIsRegistering(false)}
                      onBackToLanding={() => setShowLandingPage(true)}
                      currentLanguage={currentLanguage}
                    />
                  ) : (
                    <div className="space-y-6 w-full">
                      
                      {/* Logo and Greeting */}
                      <div className="text-center space-y-2 pb-2">
                        <h2 className="text-[26px] text-[#133F85] font-black tracking-tight leading-tight">
                          {currentLanguage === "ar" ? "مرحباً بكم في" : currentLanguage === "en" ? "Welcome to" : "Bienvenue Chez"} <span className="block text-[#133F85] text-3xl font-black mt-1">A-Zed <span className="text-[#10B981]">info</span></span>
                        </h2>
                        <p className="text-gray-400 text-xs font-semibold">{t.login_title}</p>
                      </div>

                      {errorMsg && (
                        <div className="p-3.5 rounded-2xl border border-red-150 text-[#EF4444] bg-red-50/40 text-xs font-bold leading-relaxed flex items-center gap-2">
                          <AlertTriangle size={15} className="shrink-0" />
                          <span>{errorMsg}</span>
                        </div>
                      )}

                      <form onSubmit={handleLoginSubmit} className="space-y-5">
                        {/* Email input with outline-cut label style */}
                        <div className="relative text-start">
                          <span className="absolute left-4 rtl:right-4 rtl:left-auto -top-2 px-1 bg-white text-[9px] font-bold text-gray-400 uppercase tracking-wider select-none">
                            {t.email_label}
                          </span>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t.emailPlaceholder}
                            className="w-full text-xs px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-[#133F85] outline-none text-[#0F1E36] font-bold bg-white transition-all shadow-xs"
                          />
                        </div>

                        {/* Password input with outline-cut label style */}
                        <div className="relative text-start">
                          <span className="absolute left-4 rtl:right-4 rtl:left-auto -top-2 px-1 bg-white text-[9px] font-bold text-gray-400 uppercase tracking-wider select-none">
                            {t.password_label}
                          </span>
                          <div className="relative">
                            <input
                              type={showPassword ? "text" : "password"}
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder={t.passwordPlaceholder}
                              className="w-full text-xs pl-4 pr-11 rtl:pr-4 rtl:pl-11 py-3.5 border border-gray-200 rounded-2xl focus:border-[#133F85] outline-none text-[#0F1E36] font-bold bg-white transition-all shadow-xs"
                            />
                            <button
                              type="button"
                              onClick={() => setShowPassword(!showPassword)}
                              className="absolute right-3.5 rtl:left-3.5 rtl:right-auto top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-650 focus:outline-none p-1.5 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-center"
                              title={showPassword ? "Masquer le mot de passe" : "Afficher le mot de passe"}
                            >
                              <EyelashEyeIcon isOpen={showPassword} />
                            </button>
                          </div>
                        </div>

                        {/* Forgot password link */}
                        <div className="text-end">
                          <button
                            type="button"
                            onClick={handleOpenForgotPassword}
                            className="text-[#133F85] hover:underline font-bold text-xs cursor-pointer"
                          >
                            {currentLanguage === "ar" ? "نسيت كلمة السر؟" : currentLanguage === "en" ? "Forgot password?" : "Mot de passe oublié ?"}
                          </button>
                        </div>

                        <button
                          type="submit"
                          className="w-full py-4 bg-[#133F85] hover:bg-[#10326d] text-[#ffffff] rounded-2xl text-xs font-extrabold uppercase tracking-widest transition-all duration-200 cursor-pointer flex items-center justify-center gap-2 mt-6 shadow-md hover:shadow-lg active:scale-[0.99]"
                        >
                          <span>{t.loginButton}</span>
                          <ArrowRight size={14} className={currentLanguage === "ar" ? "rotate-180" : ""} />
                        </button>
                      </form>

                      {/* Footer with sign up redirection */}
                      <div className="pt-6 border-t border-slate-100 text-center text-xs text-gray-400 space-y-3">
                        <p className="font-semibold text-gray-500">{t.newCandidate}</p>
                        <button
                          onClick={() => setIsRegistering(true)}
                          className="text-[#10B981] hover:text-[#0da673] hover:underline font-extrabold uppercase tracking-widest text-xs cursor-pointer block w-full text-center"
                        >
                          {t.registerLink}
                        </button>
                      </div>

                    </div>
                  )}
                </motion.div>

              </div>

              {/* Little spacer/footer */}
              <div className="pb-6 text-center text-[10px] text-gray-400 font-mono">
                &copy; {new Date().getFullYear()} A-Zed Info - Tous droits réservés.
              </div>
            </div>

          </div>
        )}
      </main>

      {/* FORGOT PASSWORD MODAL */}
      {showForgotPasswordModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-[#0F1E36]/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 shadow-2xl border border-slate-100 relative space-y-5 text-start">
            <button
              onClick={() => setShowForgotPasswordModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer"
            >
              <X size={18} />
            </button>

            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-100 flex items-center justify-center text-[#133F85] text-xl shrink-0 shadow-xs">
                🔑
              </div>
              <div>
                <h3 className="text-lg font-black text-[#0F1E36]">Mot de passe oublié ?</h3>
                <p className="text-xs text-slate-500 font-semibold mt-0.5">Demande de réinitialisation d'accès</p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed font-medium">
              Saisissez l'adresse e-mail associée à votre compte élève. Notre équipe administrative recevra immédiatement une notification pour traiter votre demande.
            </p>

            {forgotPasswordSuccessMsg && (
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold leading-relaxed space-y-1 shadow-xs animate-fade-in">
                <div className="flex items-center gap-1.5 text-emerald-900 font-extrabold text-xs">
                  <span>✅ Demande transmise !</span>
                </div>
                <p className="text-[11px] text-emerald-800 font-semibold">{forgotPasswordSuccessMsg}</p>
              </div>
            )}

            {forgotPasswordErrorMsg && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold leading-relaxed flex items-center gap-2">
                <AlertTriangle size={16} className="shrink-0 text-rose-600" />
                <span>{forgotPasswordErrorMsg}</span>
              </div>
            )}

            <form onSubmit={handleForgotPasswordSubmit} className="space-y-4 pt-1">
              <div className="relative text-start">
                <span className="absolute left-4 -top-2 px-1 bg-white text-[9px] font-bold text-gray-400 uppercase tracking-wider select-none">
                  Adresse E-mail
                </span>
                <input
                  type="email"
                  required
                  value={forgotPasswordEmail}
                  onChange={(e) => setForgotPasswordEmail(e.target.value)}
                  placeholder="votre.email@exemple.com"
                  className="w-full text-xs px-4 py-3.5 border border-gray-200 rounded-2xl focus:border-[#133F85] outline-none text-[#0F1E36] font-bold bg-white transition-all shadow-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowForgotPasswordModal(false)}
                  className="px-4 py-3 rounded-2xl border border-slate-200 text-slate-600 font-bold text-xs hover:bg-slate-50 transition-colors cursor-pointer"
                >
                  Fermer
                </button>
                <button
                  type="submit"
                  disabled={forgotPasswordSubmitting || antiSpamTimer > 0}
                  className={`px-5 py-3 rounded-2xl font-extrabold text-xs text-white uppercase tracking-wider transition-all flex items-center gap-2 shadow-md ${
                    antiSpamTimer > 0 || forgotPasswordSubmitting
                      ? "bg-slate-400 cursor-not-allowed opacity-80"
                      : "bg-[#133F85] hover:bg-[#10326d] active:scale-95 cursor-pointer"
                  }`}
                >
                  {forgotPasswordSubmitting ? (
                    <span>Envoi en cours...</span>
                  ) : antiSpamTimer > 0 ? (
                    <span>Patienter ({antiSpamTimer}s)</span>
                  ) : (
                    <span>Envoyer la demande</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* BRAND & LOGO CONFIGURATION MODAL FOR ADMINISTRATORS */}
      {isEditingLogo && (
        <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100"
          >
            <div className="px-5 py-3.5 border-b border-gray-100 flex justify-between items-center bg-gray-50 select-none">
              <h2 className="font-semibold text-[#0F1E36] text-xs uppercase tracking-wider flex items-center gap-2">
                <span className="text-sm">🏢</span> Paramètres de l'identité
              </h2>
              <button
                onClick={() => {
                  setLogoFileBase64("");
                  setIsEditingLogo(false);
                }}
                className="text-gray-400 hover:text-gray-650 font-bold p-1 rounded-full text-xs hover:bg-gray-100 transition-colors cursor-pointer"
              >
                ✕
              </button>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              const name = formData.get("brandName") as string;
              const url = formData.get("brandLogoUrl") as string;
              handleSaveLogoConfig(logoFileBase64 || url || logoUrl, name);
            }} className="p-5 space-y-4 text-left text-xs">
              <div>
                <label className="block text-gray-500 font-bold mb-1.5 uppercase tracking-wider text-[9px]">
                  Nom de marque / Identité visuelle
                </label>
                <input
                  type="text"
                  name="brandName"
                  defaultValue={logoText}
                  placeholder="Ex: A-Zed Info"
                  className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-xs focus:border-[#10B981] outline-hidden text-[#0F1E36] font-semibold"
                  required
                />
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1.5 uppercase tracking-wider text-[9px]">
                  Miniature du logo (Fichier local)
                </label>
                <div 
                  className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors relative"
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={(e) => {
                    e.preventDefault();
                    const file = e.dataTransfer.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onload = (evt) => {
                        if (evt.target?.result) {
                          setLogoFileBase64(evt.target.result as string);
                        }
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  onClick={() => {
                    document.getElementById("logo-upload-input")?.click();
                  }}
                >
                  <input
                    type="file"
                    accept="image/*"
                    id="logo-upload-input"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        const reader = new FileReader();
                        reader.onload = (evt) => {
                          if (evt.target?.result) {
                            setLogoFileBase64(evt.target.result as string);
                          }
                        };
                        reader.readAsDataURL(file);
                      }
                    }}
                  />
                  <div className="space-y-1 select-none pointer-events-none">
                    <div className="text-xl">📁</div>
                    <p className="text-xs font-semibold text-blue-600">Sélectionner ou glisser un fichier</p>
                    <p className="text-[9px] text-gray-400 font-medium">PNG, JPG, SVG de dimension carrée</p>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-500 font-bold mb-1.5 uppercase tracking-wider text-[9px]">
                  Ou insérer l'URL d'un logo tiers
                </label>
                <input
                  type="text"
                  name="brandLogoUrl"
                  placeholder="https://images.unsplash.com/... (optionnel)"
                  className="w-full border border-gray-200 bg-white rounded-lg px-3 py-1.5 text-xs focus:border-[#10B981] outline-hidden text-[#0F1E36]"
                  defaultValue={logoUrl && !logoUrl.startsWith("data:") ? logoUrl : ""}
                />
              </div>

              {/* Logo preview */}
              {(logoFileBase64 || logoUrl) && (
                <div className="p-3 bg-gray-55/30 border border-gray-200 rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <img 
                      src={logoFileBase64 || logoUrl} 
                      className="w-10 h-10 object-cover rounded-lg bg-white border border-gray-150"
                      referrerPolicy="no-referrer"
                      alt="Logo Brand Info" 
                    />
                    <div>
                      <p className="font-semibold text-gray-700 text-[10px]">Aperçu de la marque</p>
                      <p className="text-gray-400 text-[8px] uppercase tracking-wider">Échelle automatique 1:1</p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setLogoFileBase64("");
                      setLogoUrl("");
                    }}
                    className="text-[9px] text-red-500 font-bold uppercase hover:underline cursor-pointer"
                  >
                    Effacer
                  </button>
                </div>
              )}

              <div className="pt-3 border-t border-gray-150 flex justify-end gap-2 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setLogoFileBase64("");
                    setIsEditingLogo(false);
                  }}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-[#0F1E36] hover:bg-[#15294a] text-white rounded-lg font-bold transition-colors cursor-pointer"
                >
                  Enregistrer l'identité
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* UNIVERSAL SYSTEM FOOTER */}
      <Footer currentLanguage={currentLanguage} />

      {/* FLOATING ACTION CONTROLS */}
      <FloatingNavControls />
    </div>
  );
}
