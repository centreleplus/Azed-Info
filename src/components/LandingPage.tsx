import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ArrowRight, 
  Play, 
  HelpCircle, 
  CheckCircle, 
  Award, 
  Zap, 
  UserPlus, 
  LogIn, 
  ChevronDown, 
  Compass, 
  Clock, 
  Check, 
  Tv, 
  BookOpen, 
  Calendar, 
  MessageSquare, 
  Heart, 
  Smile, 
  ArrowDown, 
  Phone, 
  Globe,
  Sun,
  Moon,
  Bot,
  BookMarked,
  CheckSquare,
  Camera,
  User,
  Star,
  Quote,
  Sparkles,
  Eye,
  ShoppingBag
} from "lucide-react";
import { Language, translations } from "../lib/translations";
import { getLanguageFlag } from "./Flags";
import { HomeFeatureCard, INITIAL_HOME_CARDS } from "../types/homeCards";
import { compressImageFileToDataUrl } from "../utils/imageOptimizer";
import { safeLocalStorageSetItem } from "../utils/safeStorage";
import { HeroSection } from "./HeroSection";
import { WhyChooseUsSection } from "./WhyChooseUsSection";
import { SectionLayout } from "./SectionLayout";
import { HowItWorksSection } from "./HowItWorksSection";

interface LandingPageProps {
  currentLanguage: Language;
  onLanguageChange: (lang: Language) => void;
  onLoginClick: () => void;
  onRegisterClick: () => void;
  heroImageUrl?: string;
  studentImageUrl?: string;
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
  theme: "light" | "dark";
  toggleTheme: () => void;
  isAdmin?: boolean;
  landingUpdatesConfig?: any;
}

const testimonialsData = {
  ar: [
    {
      name: "د. ياسين بن علي",
      score: "بكالوريا 2008",
      quote: "بيداغوجية الأستاذ نبيل استثنائية للغاية. كتبه وطريقته الحضورية في المركز لم تمكنّي فقط من النجاح بامتياز في الإعلامية بالبكالوريا، بل صقلت تفكيري العلمي بالكامل كطبيب حالياً. أستاذ لا يُنسى!",
      role: "طبيب مختص - تلميذ سابق"
    },
    {
      name: "المهندسة سارة الماجري",
      score: "بكالوريا 2012",
      quote: "الحصص المباشرة والكتب القيمة للأستاذ هي مراجع حقيقية لكل طالب. طريقته المبتكرة في التدريس تجمع بين النظرية والتطبيق بكل سلاسة. بفضله اخترت مسيرتي كمهندسة برمجيات.",
      role: "مهندسة برمجيات أولى"
    },
    {
      name: "الأستاذ أحمد بن رمضان",
      score: "بكالوريا 2002",
      quote: "بصفتي مدرساً اليوم، أحيي بيداغوجية الأستاذ نبيل الحديثة والملهمة. دروسه الحضورية وحصص اللايف الأسبوعية تعتبر نموذجاً يُحتذى به في تدريس تكنولوجيا المعلومات.",
      role: "أستاذ تكنولوجيا المعلومات"
    },
    {
      name: "د. أمين غراب",
      score: "بكالوريا 2015",
      quote: "حتى في دراسة الطب، فإن التفكير المنطقي الذي زرعه فينا الأستاذ نبيل من خلال كتبه وطريقته الصارمة يرافقني يومياً. بيداغوجيته تظل الأفضل والأرقى في تونس.",
      role: "طبيب مقيم"
    },
    {
      name: "سلمى رقيق",
      score: "بكالوريا 2021",
      quote: "حصص اللايف على المنصة في غاية الوضوح والدقة، وطريقته الحضورية في القسم ساحرة وتبسط أصعب المسائل. كتب الأستاذ نبيل الشاوش لا غنى عنها لكل مترشح للبكالوريا!",
      role: "طالبة ماجستير علوم البيانات"
    },
    {
      name: "فادي بن عمر",
      score: "بكالوريا 2024",
      quote: "تأطير متكامل يفوق التوقعات: كتبه المنهجية المحررة بدقة متناهية، وحصص المباشر التفاعلية الممتعة، مع بيداغوجيا تجمع بين اللطف والتميز الأكاديمي.",
      role: "طالب هندسة إعلامية"
    }
  ],
  fr: [
    {
      name: "Dr. Yassine Ben Ali",
      score: "Bac 2008",
      quote: "La pédagogie de M. Nabil est exceptionnelle. Ses livres et sa méthode en présentiel m'ont non seulement permis de réussir l'informatique au bac avec brio, mais ont aussi structuré ma pensée scientifique. Un professeur inoubliable !",
      role: "Médecin Spécialiste - Ex-élève"
    },
    {
      name: "Ing. Sarra Mejri",
      score: "Bac 2012",
      quote: "Les sessions lives interactives et les livres de cours du professeur sont de véritables références. Sa méthode allie parfaitement la rigueur théorique à la pratique. Grâce à lui, j'ai embrassé une brillante carrière d'ingénieure.",
      role: "Ingénieure Principale en Logiciel"
    },
    {
      name: "Prof. Ahmed Ben Romdhane",
      score: "Bac 2002",
      quote: "En tant que collègue enseignant aujourd'hui, je salue la pédagogie moderne et hautement inspirante de M. Nabil. Ses cours en présentiel et ses lives hebdomadaires sont un modèle absolu de transmission du savoir.",
      role: "Professeur d'Informatique"
    },
    {
      name: "Dr. Amine Ghrab",
      score: "Bac 2015",
      quote: "Même en médecine, l'esprit logique et structuré que M. Nabil nous a transmis à travers ses livres rigoureux et sa méthode claire me sert au quotidien. Sa pédagogie reste inégalée en Tunisie.",
      role: "Médecin Résident"
    },
    {
      name: "Salma Rekik",
      score: "Bac 2021",
      quote: "Ses lives sont d'une clarté absolue, et sa méthode d'enseignement en présentiel est tout simplement magique. Les livres de Nabil Chaouch sont absolument indispensables pour tout bachelier !",
      role: "Étudiante en Master Data Science"
    },
    {
      name: "Fedi Ben Amor",
      score: "Bac 2024",
      quote: "Une formation complète d'excellence : des livres rédigés avec une précision chirurgicale, des cours en ligne passionnants et une pédagogie bienveillante qui pousse chaque élève vers le haut.",
      role: "Étudiant Élève-Ingénieur"
    }
  ],
  en: [
    {
      name: "Dr. Yassine Ben Ali",
      score: "Bac 2008",
      quote: "Mr. Nabil's pedagogy is exceptional. His books and in-person center sessions not only helped me score an excellent grade in Computer Science at the Bac, but also fully structured my scientific thinking. An unforgettable mentor!",
      role: "Medical Specialist - Alumnus"
    },
    {
      name: "Ing. Sarra Mejri",
      score: "Bac 2012",
      quote: "The interactive live sessions and textbook references are gold standards. His method perfectly blends deep theory with practical coding. Thanks to him, I embraced a successful software engineering career.",
      role: "Senior Software Engineer"
    },
    {
      name: "Prof. Ahmed Ben Romdhane",
      score: "Bac 2002",
      quote: "As a fellow teacher today, I deeply admire Mr. Nabil's modern and inspiring pedagogy. His in-person courses and weekly live sessions set a perfect benchmark for teaching computer science.",
      role: "Computer Science Professor"
    },
    {
      name: "Dr. Amine Ghrab",
      score: "Bac 2015",
      quote: "Even in the medical field, the structured logical mindset Mr. Nabil instilled in us through his rigorous textbooks and clear methods serves me daily. His pedagogy remains the ultimate best in Tunisia.",
      role: "Medical Resident"
    },
    {
      name: "Salma Rekik",
      score: "Bac 2021",
      quote: "His live sessions are incredibly clear, and his in-person teaching method is magical. Nabil Chaouch's textbooks are absolutely mandatory for any bachelier striving for excellence!",
      role: "Data Science Master's Student"
    },
    {
      name: "Fedi Ben Amor",
      score: "Bac 2024",
      quote: "A comprehensive premium package: textbooks written with unmatched precision, exciting interactive online lives, and a caring pedagogy that brings out the absolute best in every single student.",
      role: "Engineering Student"
    }
  ]
};

const getRatingFromScore = (scoreStr: string): number => {
  if (!scoreStr) return 5;
  const match = scoreStr.match(/(\d+(?:\.\d+)?)\s*\/\s*20/);
  if (match) {
    const scoreVal = parseFloat(match[1]);
    return (scoreVal / 20) * 5;
  }
  return 5;
};

interface StarRatingProps {
  rating: number;
}

const StarRating: React.FC<StarRatingProps> = ({ rating }) => {
  return (
    <div className="flex items-center gap-1" style={{ direction: "ltr" }} aria-label={`Rating: ${rating.toFixed(2)} out of 5`}>
      {[...Array(5)].map((_, i) => {
        const starIndex = i + 1;
        let fillPercent = 0;
        if (rating >= starIndex) {
          fillPercent = 100;
        } else if (rating > starIndex - 1) {
          fillPercent = (rating - (starIndex - 1)) * 100;
        }

        return (
          <div key={i} className="relative inline-block text-slate-200 dark:text-slate-700 w-3.5 h-3.5">
            {/* Empty base star */}
            <Star size={14} className="text-slate-200 dark:text-slate-700 absolute top-0 left-0" />
            {/* Filled overlay star */}
            <div 
              className="absolute top-0 left-0 overflow-hidden text-amber-400 fill-amber-400 h-full"
              style={{ width: `${fillPercent}%` }}
            >
              <Star size={14} className="text-amber-400 fill-amber-400 absolute top-0 left-0" />
            </div>
          </div>
        );
      })}
      <span className="text-[10px] font-bold text-amber-500 ml-1 bg-amber-500/10 px-1.5 py-0.5 rounded">
        {rating.toFixed(1)}
      </span>
    </div>
  );
};

export default function LandingPage({
  currentLanguage,
  onLanguageChange,
  onLoginClick,
  onRegisterClick,
  heroImageUrl,
  studentImageUrl,
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
  theme,
  toggleTheme,
  isAdmin = false,
  landingUpdatesConfig,
}: LandingPageProps) {
  const t = translations[currentLanguage];
  const isRtl = currentLanguage === "ar";

  const renderSelectedIcon = (iconName: string, className = "w-4 h-4") => {
    switch (iconName) {
      case "Sparkles": return <Sparkles className={className} />;
      case "Grid": return <Compass className={className} />;
      case "Heart": return <Heart className={className} />;
      case "Bell": return <Smile className={className} />;
      case "Clock": return <Clock className={className} />;
      case "BookOpen": return <BookOpen className={className} />;
      case "Terminal": return <Bot className={className} />;
      case "Palette": return <Sun className={className} />;
      default: return <Sparkles className={className} />;
    }
  };
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [homeCards, setHomeCards] = useState<HomeFeatureCard[]>(INITIAL_HOME_CARDS);

  useEffect(() => {
    fetch("/api/home-cards")
      .then((res) => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        const contentType = res.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          throw new Error("Response is not JSON");
        }
        return res.json();
      })
      .then((data) => {
        if (data && data.success && Array.isArray(data.cards) && data.cards.length > 0) {
          setHomeCards(data.cards);
        }
      })
      .catch((err) => {
        // Silently fallback to INITIAL_HOME_CARDS
        console.warn("Using default homeCards fallback:", err?.message || err);
      });
  }, []);

  const renderCardIcon = (iconName: string, id: string) => {
    const key = (iconName || "").toLowerCase();
    if (key.includes("bookmark") || id === "quiz") return <Award size={24} />;
    if (key.includes("calendar") || id === "lives") return <Calendar size={24} />;
    if (key.includes("book") || id === "videos") return <BookOpen size={24} />;
    if (key.includes("tv") || id === "replays") return <Tv size={24} />;
    if (key.includes("shop") || id === "shop") return <ShoppingBag size={24} />;
    if (key.includes("check") || id === "exercises") return <CheckSquare size={24} />;
    return <Sparkles size={24} />;
  };

  const getCardGradient = (card: HomeFeatureCard, index: number) => {
    if (card.colorTheme?.includes("sky") || card.id === "quiz") return "from-cyan-400 to-blue-500 shadow-blue-500/20";
    if (card.colorTheme?.includes("emerald") || card.id === "lives") return "from-[#10B981] to-emerald-600 shadow-emerald-500/20";
    if (card.colorTheme?.includes("pink") || card.id === "videos") return "from-pink-500 to-rose-500 shadow-rose-500/20";
    if (card.colorTheme?.includes("amber") || card.id === "replays") return "from-amber-400 to-orange-500 shadow-orange-500/20";
    if (card.colorTheme?.includes("purple") || card.id === "shop") return "from-purple-500 to-indigo-600 shadow-purple-500/20";
    if (card.colorTheme?.includes("amber") || card.id === "exercises") return "from-yellow-400 to-amber-600 shadow-amber-500/20";
    
    const defaultGradients = [
      "from-cyan-400 to-blue-500 shadow-blue-500/20",
      "from-[#10B981] to-emerald-600 shadow-emerald-500/20",
      "from-pink-500 to-rose-500 shadow-rose-500/20",
      "from-amber-400 to-orange-500 shadow-orange-500/20",
      "from-purple-500 to-indigo-600 shadow-purple-500/20",
      "from-yellow-400 to-amber-600 shadow-amber-500/20",
    ];
    return defaultGradients[index % defaultGradients.length];
  };

  const [teacherAvatar, setTeacherAvatar] = useState<string | null>(() => {
    try {
      return localStorage.getItem("teacher_avatar");
    } catch {
      return null;
    }
  });

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFileToDataUrl(file, 200, 200, 0.88);
        setTeacherAvatar(compressed);
        safeLocalStorageSetItem("teacher_avatar", compressed);
      } catch {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64String = reader.result as string;
          setTeacherAvatar(base64String);
          safeLocalStorageSetItem("teacher_avatar", base64String);
        };
        reader.readAsDataURL(file);
      }
    }
  };

  // Active steps in Arabic Tunisian dialect & French as requested
  const stepIcons = [UserPlus, Compass, Zap, Award];

  // Language options with flags as logos for each language
  const languageOptions = [
    { code: "ar" as Language, name: "العربية", flag: getLanguageFlag("ar") },
    { code: "fr" as Language, name: "Français", flag: getLanguageFlag("fr") },
    { code: "en" as Language, name: "English", flag: getLanguageFlag("en") }
  ];

  const [langDropdownOpen, setLangDropdownOpen] = useState(false);

  // Feature card icons
  const featureIcons = [
    Award, // Quiz
    Calendar, // Live classes
    BookOpen, // Videos
    Tv, // Recorded lives
    MessageSquare, // Teacher communication
    Heart // Psychological support
  ];

  const handleScrollToId = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    const order = landingUpdatesConfig?.order;
    if (!order || order.length === 0) return;
    const container = document.getElementById("landing-sections-container");
    if (!container) return;

    const keyToId: Record<string, string> = {
      hero: "section-hero",
      about: "about-section",
      features: "features-section",
      whyChooseUs: "why-section",
      testimonials: "testimonials-section",
      howItWorks: "how-section"
    };

    const elements = order
      .map(key => document.getElementById(keyToId[key]))
      .filter((el): el is HTMLElement => !!el);

    elements.forEach(el => {
      container.appendChild(el);
    });
  }, [landingUpdatesConfig?.order]);

  return (
    <div id="landing-sections-container" className="bg-[#f1f8f6] dark:bg-slate-950 min-h-screen font-sans overflow-x-hidden selection:bg-[#10B981] selection:text-white transition-colors duration-300 relative" dir={isRtl ? "rtl" : "ltr"}>
      {/* Halo lumineux décoratif subtil en arrière-plan */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] bg-gradient-to-b from-emerald-100/40 via-teal-50/20 to-transparent dark:from-emerald-950/20 dark:via-transparent dark:to-transparent pointer-events-none blur-3xl -z-10" />

      {/* 1. TOP NAVBAR */}
      <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border-b border-emerald-100/60 dark:border-slate-900 shadow-xs transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          
          {/* Logo & Brand Name */}
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-[#0047AB] flex items-center justify-center text-white font-black text-xl shadow-md shadow-blue-900/10 hover:scale-105 transition-transform cursor-pointer">
              A
            </div>
            <div className="flex flex-col justify-center items-center text-center">
              <h1 className="text-base font-extrabold tracking-tight text-[#AB2330] leading-tight mb-0.5 text-center w-full">
                {t.academyName}
              </h1>
              <span 
                className="font-bold uppercase tracking-wider block text-center mx-auto" 
                style={{ 
                  color: "#a0aaa7",
                  width: "111px",
                  lineHeight: "15px",
                  textAlign: "center",
                  fontSize: "11px"
                }}
              >
                {t.subTitle}
              </span>
            </div>
          </div>

          {/* Center Navigation menu links (hidden on mobile) */}
          <nav className="hidden md:flex items-center gap-12 text-sm font-semibold text-slate-700 dark:text-slate-300 tracking-wide">
            <button onClick={() => handleScrollToId("about-section")} className="hover:text-[#10B981] transition-colors cursor-pointer">
              {t.aboutUs}
            </button>
            <button onClick={() => handleScrollToId("features-section")} className="hover:text-[#10B981] transition-colors cursor-pointer">
              {t.whatWeOffer}
            </button>
            <button onClick={() => handleScrollToId("why-section")} className="hover:text-[#10B981] transition-colors cursor-pointer">
              {t.whyChooseUsTitle}
            </button>
            <button onClick={() => handleScrollToId("testimonials-section")} className="hover:text-[#10B981] transition-colors cursor-pointer">
              {t.testimonialsTitle}
            </button>
            <button onClick={() => handleScrollToId("how-section")} className="hover:text-[#10B981] transition-colors cursor-pointer">
              {t.howToUse}
            </button>
          </nav>

          {/* Right/Left Controls: Buttons + Language Selector */}
          <div className="flex items-center gap-3.5 md:gap-5 ms-4 md:ms-8 lg:ms-12">
            
            {/* Language Selector Dropdown with Logo flags */}
            <div className="relative">
              <button
                onClick={() => setLangDropdownOpen(!langDropdownOpen)}
                className="flex items-center gap-2 px-3.5 py-2 border border-gray-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 hover:border-[#0047AB]/55 transition-all text-xs font-bold text-slate-700 dark:text-slate-300 cursor-pointer shadow-sm bg-white dark:bg-slate-950"
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
                    className={`absolute ${isRtl ? "left-0" : "right-0"} mt-2.5 w-44 bg-white/95 dark:bg-slate-950/95 backdrop-blur-md border border-gray-100 dark:border-slate-900 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/40 z-50 py-1.5 p-1 overflow-hidden`}
                  >
                    <div className="px-3 py-1.5 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest border-b border-gray-50 dark:border-slate-900 mb-1">
                      {isRtl ? "اختر اللغة" : "Choisir la langue"}
                    </div>
                    {languageOptions.map((lang) => {
                      const isActive = currentLanguage === lang.code;
                      return (
                        <button
                          key={lang.code}
                          onClick={() => {
                            onLanguageChange(lang.code);
                            setLangDropdownOpen(false);
                          }}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs text-left font-bold transition-all cursor-pointer ${
                            isActive 
                              ? "text-[#10B981] bg-emerald-50/50 dark:bg-emerald-950/20 font-extrabold" 
                              : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white"
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

            {/* Login button */}
            <button
              onClick={onLoginClick}
              className="px-4 py-2 text-xs font-bold text-slate-700 hover:text-[#10B981] transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogIn size={14} />
              <span>{t.login}</span>
            </button>

            {/* Sign Up button */}
            <button
              onClick={onRegisterClick}
              className="px-4 py-2.5 bg-[#0047AB] hover:bg-[#143068] text-white rounded-xl text-xs font-bold transition-all shadow-md shadow-blue-900/15 cursor-pointer flex items-center gap-1.5 hover:scale-[1.02] active:scale-[0.98]"
            >
              <UserPlus size={14} />
              <span>{t.signUp}</span>
            </button>

          </div>

        </div>
      </header>

      {/* 2. HERO BANNER */}
      <HeroSection 
        onRegisterClick={onRegisterClick}
        heroImageUrl={heroImageUrl}
        subTitle={landingUpdatesConfig?.hero?.icon ? undefined : t.subTitle}
        heroTitle={landingUpdatesConfig?.hero?.title || landingHeroTitle}
        heroHighlight={landingHeroHighlight || t.heroHighlight}
        heroParagraph={landingUpdatesConfig?.hero?.paragraph || t.heroSubtext}
        ctaText={t.heroCtaPrimary}
        isRtl={isRtl}
      />



      {/* 3. ABOUT US SECTION */}
      <section 
        id="about-section" 
        className="py-20"
        style={{
          backgroundColor: landingUpdatesConfig?.about?.backgroundColor || undefined,
          color: landingUpdatesConfig?.about?.textColor || undefined,
          fontFamily: landingUpdatesConfig?.about?.fontFamily || undefined
        }}
      >
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col lg:flex-row items-center gap-16">
            
            {/* Visual Column (mockup video player) */}
            <div className="flex-1 w-full relative">
              <div className="relative rounded-2xl overflow-hidden border border-emerald-100/60 dark:border-slate-800 shadow-xl bg-slate-900 group aspect-video flex items-center justify-center">
                
                {isVideoPlaying ? (
                  <iframe
                    className="w-full h-full absolute inset-0"
                    src={landingUpdatesConfig?.about?.linkUrl || "https://www.youtube.com/embed/dQw4w9WgXcQ?autoplay=1"}
                    title="Introduction Academy Video"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                ) : (
                  <>
                    <img
                      src={landingUpdatesConfig?.about?.imageUrl || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=800"}
                      alt="Academy introduction video preview"
                      className="w-full h-full object-cover opacity-75 group-hover:scale-[1.02] transition-transform duration-500"
                    />
                    
                    {/* Pulsing play button */}
                    <div className="absolute inset-0 flex items-center justify-center bg-black/30 backdrop-blur-xs">
                      <button
                        onClick={() => setIsVideoPlaying(true)}
                        className="w-16 h-16 rounded-full bg-[#10B981] hover:bg-emerald-600 text-white flex items-center justify-center shadow-2xl transform group-hover:scale-110 active:scale-95 transition-all cursor-pointer border-4 border-white/25"
                      >
                        <Play size={24} className={isRtl ? "mr-1" : "ml-1"} fill="currentColor" />
                      </button>
                    </div>

                    <div className="absolute bottom-4 left-4 right-4 bg-black/60 backdrop-blur-md border border-white/15 px-4 py-2.5 rounded-xl text-left">
                      <p className="text-white text-xs font-bold leading-normal truncate">{t.videoPlaceholder}</p>
                    </div>
                  </>
                )}

              </div>
            </div>

            {/* Texts Column */}
            <div className="flex-1 space-y-6">
              <div className="inline-flex items-center gap-1.5 text-emerald-800 dark:text-emerald-300 font-black text-[11px] uppercase tracking-wider bg-emerald-100/80 dark:bg-emerald-950/60 px-3 py-1 rounded-full">
                <Compass size={14} />
                <span>{t.aboutTitle}</span>
              </div>

               <h3 
                 className={`font-extrabold ${landingUpdatesConfig?.about?.fontSize || "text-2xl md:text-3xl"}`}
                 style={{ color: landingUpdatesConfig?.about?.textColor || "#0047AB" }}
               >
                {landingUpdatesConfig?.about?.title || (isRtl ? "من نحن ؟ منصتكم للتميز والتفوق" : "Qui sommes-nous ?")}
              </h3>

              <p 
                className="text-slate-600 text-sm md:text-base leading-relaxed tracking-wide font-medium"
                style={{ color: landingUpdatesConfig?.about?.textColor ? `${landingUpdatesConfig.about.textColor}cc` : undefined }}
              >
                {landingUpdatesConfig?.about?.paragraph || t.aboutText}
              </p>

              <div className="pt-4 text-left">
                <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-emerald-100/60 dark:border-slate-800 shadow-sm shadow-emerald-900/5 flex items-start gap-3 max-w-sm">
                  {/* Uploadable Profile Photo Area */}
                  {isAdmin ? (
                    <label htmlFor="teacher-avatar-input" className="relative w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center cursor-pointer group/avatar shrink-0 transition-all hover:border-[#10B981] shadow-inner">
                      <input 
                        type="file" 
                        id="teacher-avatar-input" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={handleAvatarChange} 
                      />
                      {teacherAvatar ? (
                        <img 
                          src={teacherAvatar} 
                          alt="M. Nabil Chaouch" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-emerald-500 flex flex-col items-center">
                          <User size={20} className="text-slate-400 dark:text-slate-500" />
                        </div>
                      )}
                      {/* Hover Overlay */}
                      <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover/avatar:opacity-100 transition-opacity duration-200">
                        <Camera size={14} className="text-white" />
                      </div>
                    </label>
                  ) : (
                    <div className="relative w-12 h-12 rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden bg-slate-50 dark:bg-slate-800 flex items-center justify-center shrink-0 shadow-inner">
                      {teacherAvatar ? (
                        <img 
                          src={teacherAvatar} 
                          alt="M. Nabil Chaouch" 
                          className="w-full h-full object-cover" 
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="text-slate-400 dark:text-slate-500">
                          <User size={20} />
                        </div>
                      )}
                    </div>
                  )}
                  <div>
                    <h4 className="font-bold text-slate-800 dark:text-slate-100 text-xs">
                      {isRtl ? "أ. نبيل الشاوش" : "M. Nabil Chaouch"}
                    </h4>
                    <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">
                      {isRtl ? "أستاذ ومؤلف المنصة" : currentLanguage === "fr" ? "Professeur & Auteur de la plateforme" : "Professor & Creator of the platform"}
                    </p>
                  </div>
                </div>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* 4. EDUCATIONAL CONTENT (FEATURES GRID) */}
      <section 
        id="features-section" 
        className="py-24"
        style={{
          backgroundColor: landingUpdatesConfig?.features?.backgroundColor || undefined,
          color: landingUpdatesConfig?.features?.textColor || undefined,
          fontFamily: landingUpdatesConfig?.features?.fontFamily || undefined
        }}
      >
        <div className="max-w-7xl mx-auto px-6 text-center space-y-16">
          
          <div className="space-y-3">
            <span className="inline-block px-3 py-1 bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider rounded-full">
              {t.contentTitle}
            </span>
            <h3 
              className={`font-extrabold ${landingUpdatesConfig?.features?.fontSize || "text-2xl md:text-3xl lg:text-4xl"}`}
              style={{ color: landingUpdatesConfig?.features?.textColor || "#0047AB" }}
            >
              {landingUpdatesConfig?.features?.title ? (
                landingUpdatesConfig.features.title
              ) : isRtl ? (
                <>محتوى تعليمي <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">متكامل بجودة عالية</span></>
              ) : (
                <>High-Quality & <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-rose-500">Integrated Content</span></>
              )}
            </h3>
            {landingUpdatesConfig?.features?.paragraph && (
              <p 
                className="text-xs md:text-sm text-slate-500 max-w-lg mx-auto leading-relaxed" 
                style={{ color: landingUpdatesConfig?.features?.textColor ? `${landingUpdatesConfig.features.textColor}cc` : undefined }}
              >
                {landingUpdatesConfig.features.paragraph}
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {homeCards.map((card, idx) => {
              // Multilingual fallback mapping if applicable
              const translatedTitle = currentLanguage === "fr" 
                ? card.title 
                : card.id === "quiz" ? t.feat1Title 
                : card.id === "lives" ? t.feat2Title 
                : card.id === "videos" ? t.feat3Title 
                : card.id === "replays" ? t.feat4Title 
                : card.id === "shop" ? t.feat7Title 
                : card.id === "exercises" ? t.feat8Title 
                : card.title;

              const translatedDesc = currentLanguage === "fr" 
                ? card.description 
                : card.id === "quiz" ? t.feat1Desc 
                : card.id === "lives" ? t.feat2Desc 
                : card.id === "videos" ? t.feat3Desc 
                : card.id === "replays" ? t.feat4Desc 
                : card.id === "shop" ? t.feat7Desc 
                : card.id === "exercises" ? t.feat8Desc 
                : card.description;

              const gradientClass = getCardGradient(card, idx);

              return (
                <div
                  key={card.id || idx}
                  className="bg-white dark:bg-slate-900 rounded-2xl p-6 sm:p-8 border border-emerald-100/60 dark:border-slate-800 shadow-sm shadow-emerald-900/5 hover:shadow-md transition-all duration-300 text-center flex flex-col items-center gap-4 group"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${gradientClass} text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform`}>
                    {renderCardIcon(card.iconName, card.id)}
                  </div>
                  <h4 className="font-extrabold text-sm text-[#0047AB] dark:text-blue-400">
                    {translatedTitle}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed tracking-wide font-medium">
                    {translatedDesc}
                  </p>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* 5. WHY CHOOSE US */}
      <WhyChooseUsSection
        title={landingUpdatesConfig?.whyChooseUs?.title || (isRtl ? "لماذا تختارنا ؟" : "Pourquoi nous choisir ?")}
        badge={isRtl ? "المميزات" : "AVANTAGES"}
        reasons={[
          { icon: BookOpen, title: t.why1 || "Bibliothèque énorme", desc: isRtl ? "آلاف التمارين والامتحانات السابقة مع الإصلاح المفصل" : "Des milliers d'exercices corrigés et d'annales de bac." },
          { icon: Zap, title: t.why2 || "Solutions optimales", desc: isRtl ? "طرق مبسطة وخوارزميات مفسرة خطوة بخطوة" : "Méthodes simplifiées et algorithmes expliqués pas à pas." },
          { icon: CheckCircle, title: t.why3 || "Programme officiel", desc: isRtl ? "محتوى مطابق تماماً للبرنامج الوزاري التونسي" : "Contenu 100% conforme au programme ministériel." },
          { icon: Clock, title: t.why4 || "Vidéos & Fiches", desc: isRtl ? "فيديوهات قصيرة وتلخيصات ذكية للمراجعة السريعة" : "Des capsules courtes et fiches synthétiques de révision." },
        ]}
        isRtl={isRtl}
      />

      {/* 5.5 TESTIMONIALS (TÉMOIGNAGES) SECTION */}
      <section 
        id="testimonials-section" 
        className="py-24 transition-colors duration-300 overflow-hidden relative"
        style={{
          backgroundColor: landingUpdatesConfig?.testimonials?.backgroundColor || undefined,
          color: landingUpdatesConfig?.testimonials?.textColor || undefined,
          fontFamily: landingUpdatesConfig?.testimonials?.fontFamily || undefined
        }}
      >
        {/* Abstract subtle background decorations */}
        <div className="absolute top-1/4 right-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/4 left-0 w-80 h-80 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 text-center space-y-16 relative z-10">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="space-y-3"
          >
            <span className="inline-block px-3 py-1 bg-emerald-100/80 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-black uppercase tracking-wider rounded-full">
              {t.testimonialsTitle}
            </span>
            <h3 
              className={`font-extrabold ${landingUpdatesConfig?.testimonials?.fontSize || "text-2xl md:text-3xl lg:text-4xl"}`}
              style={{ color: landingUpdatesConfig?.testimonials?.textColor || "#0047AB" }}
            >
              {landingUpdatesConfig?.testimonials?.title ? (
                landingUpdatesConfig.testimonials.title
              ) : isRtl ? (
                <>قصص نجاح <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">تلامذتنا في البكالوريا</span></>
              ) : (
                <>Our Students' <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-500">Success Stories</span></>
              )}
            </h3>
            <p 
              className="text-slate-500 dark:text-slate-400 text-xs font-semibold max-w-lg mx-auto leading-relaxed"
              style={{ color: landingUpdatesConfig?.testimonials?.textColor ? `${landingUpdatesConfig.testimonials.textColor}cc` : undefined }}
            >
              {landingUpdatesConfig?.testimonials?.paragraph ? (
                landingUpdatesConfig.testimonials.paragraph
              ) : isRtl ? (
                "اكتشف كيف ساعدت منصة A-Zed Info المئات من التلاميذ على تحقيق التميز الدراسي واجتياز امتحانات الإعلامية بأعلى المعدلات."
              ) : (
                "Découvrez comment la plateforme A-Zed Info a aidé des centaines d'élèves à exceller et décrocher les meilleures notes à leurs examens d'informatique."
              )}
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {(() => {
              const baseList = testimonialsData[currentLanguage] || testimonialsData.fr;
              const hasCustomTestimonial = !!(landingUpdatesConfig?.testimonials?.author || landingUpdatesConfig?.testimonials?.quote);
              
              const listToRender = hasCustomTestimonial ? [
                {
                  name: landingUpdatesConfig.testimonials.author || "Élève Excellence",
                  score: "Baccalauréat - Excellence ⭐",
                  quote: landingUpdatesConfig.testimonials.quote || "Une expérience d'apprentissage extraordinaire !",
                  role: "Élève A-Zed Info",
                  customAvatar: landingUpdatesConfig.testimonials.imageUrl
                },
                ...baseList
              ] : baseList;

              return listToRender.map((item: any, idx: number) => {
                const initials = item.name.split(" ").map((n: string) => n[0]).join("");
                const avatarGradients = [
                  "from-teal-400 to-emerald-500",
                  "from-blue-400 to-indigo-500",
                  "from-amber-400 to-orange-500"
                ];
                const gradient = avatarGradients[idx % avatarGradients.length];

                return (
                  <motion.div
                    key={"testimonial-" + idx}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: idx * 0.15 }}
                    whileHover={{ y: -8 }}
                    className="p-6 sm:p-8 rounded-2xl border border-emerald-100/60 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-sm shadow-emerald-900/5 hover:shadow-xl hover:shadow-emerald-500/10 transition-all duration-300 text-right flex flex-col justify-between gap-6 relative"
                    style={{ direction: isRtl ? "rtl" : "ltr", textAlign: isRtl ? "right" : "left" }}
                  >
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <StarRating rating={getRatingFromScore(item.score)} />
                        <Quote size={28} className="text-emerald-500/20 transform rotate-180" />
                      </div>

                      <p className="text-slate-600 dark:text-slate-300 text-xs font-semibold leading-relaxed italic">
                        "{item.quote}"
                      </p>
                    </div>

                    <div className="flex items-center gap-3.5 pt-4 border-t border-emerald-100/60 dark:border-slate-800/80">
                      {item.customAvatar ? (
                        <img 
                          src={item.customAvatar} 
                          alt={item.name} 
                          referrerPolicy="no-referrer"
                          className="w-10 h-10 rounded-full object-cover shadow-xs shrink-0"
                        />
                      ) : (
                        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${gradient} text-white flex items-center justify-center font-bold text-xs shadow-xs shrink-0 uppercase`}>
                          {initials}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-extrabold text-xs text-slate-800 dark:text-slate-200">
                          {item.name}
                        </h4>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-bold truncate">
                          {item.role}
                        </p>
                        <span className="inline-block mt-1 text-[9px] font-extrabold px-2 py-0.5 rounded bg-emerald-500/10 text-[#10B981] uppercase tracking-wider">
                          {item.score}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                );
              });
            })()}
          </div>

        </div>
      </section>

      {/* 6. HOW TO USE / PROCESS STEPS (INTERACTIVE DEMO WITH VIDEO PLAYER) */}
      <HowItWorksSection
        onRegisterClick={onRegisterClick}
        badge={isRtl ? "عرض تفاعلي" : "DEMO INTERACTIVE"}
        title={landingUpdatesConfig?.howItWorks?.title || (isRtl ? "طريقة إستعمال المنصة" : (currentLanguage === "fr" ? "Comment ça marche ?" : "How it Works ?"))}
        subtitle={landingUpdatesConfig?.howItWorks?.paragraph || (isRtl ? "طريقة تعليمية تفاعلية ومنظمة لمرافقتك خطوة بخطوة نحو النجاح والتميز في البكالوريا." : t.stepsSubtitle)}
        ctaText={t.heroCtaPrimary}
        isRtl={isRtl}
      />

    </div>
  );
}
