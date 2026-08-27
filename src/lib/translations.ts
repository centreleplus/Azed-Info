export type Language = "ar" | "fr" | "en";

export interface TranslationDict {
  // Navigation / Common
  academyName: string;
  subTitle: string;
  directorName: string;
  home: string;
  aboutUs: string;
  whatWeOffer: string;
  ourOffers: string;
  howToUse: string;
  testimonialsTitle: string;
  contactUs: string;
  login: string;
  signUp: string;
  logout: string;
  profile: string;
  shop: string;
  searchPlaceholder: string;
  search_placeholder: string;
  search_button: string;
  menu_student: string;
  recent_history: string;
  clear_all: string;
  search_suggestions: string;
  menu: string;
  back: string;

  // Banner & Main Messages
  banner_title: string;
  banner_subtitle: string;
  empty_courses_title: string;
  empty_courses_desc: string;
  empty_devoirs_title: string;
  empty_devoirs_desc: string;
  empty_corrections_title: string;
  empty_corrections_desc: string;

  // Tabs & Categories
  courses_and_videos: string;
  trimester_1: string;
  trimester_2: string;
  trimester_3: string;
  homework_exercises: string;
  correction_zone: string;
  revision: string;

  // Hero Section
  heroTitle: string;
  heroHighlight: string;
  heroSubtext: string;
  heroCtaPrimary: string;
  heroCtaSecondary: string;

  // About Section
  aboutTitle: string;
  aboutText: string;
  videoPlaceholder: string;

  // Educational Content Section
  contentTitle: string;
  contentSubtitle: string;
  feat1Title: string;
  feat1Desc: string;
  feat2Title: string;
  feat2Desc: string;
  feat3Title: string;
  feat3Desc: string;
  feat4Title: string;
  feat4Desc: string;
  feat5Title: string;
  feat5Desc: string;
  feat6Title: string;
  feat6Desc: string;
  feat7Title: string;
  feat7Desc: string;
  feat8Title: string;
  feat8Desc: string;

  // Why Choose Us
  whyChooseUsTitle: string;
  why1: string;
  why2: string;
  why3: string;
  why4: string;

  // Steps Section
  stepsTitle: string;
  stepsSubtitle: string;
  step1: string;
  step1Desc: string;
  step2: string;
  step2Desc: string;
  step3: string;
  step3Desc: string;
  step4: string;
  step4Desc: string;

  // Main App Tabs Translation
  tabCours: string;
  tabDevoirs: string;
  tabBibliotheque: string;
  tabQuiz: string;
  tabPython: string;
  tabCalendrier: string;
  tabDemos?: string;
  tabAssistant: string;
  tabShop: string;
  tabProfile: string;

  // Trimesters & Subsections
  trim1: string;
  trim2: string;
  trim3: string;
  trimRevision: string;

  // Footer / Miscellaneous
  footerCopyright: string;
  footerTagline: string;

  // Login / Student Space keys
  loginTitle: string;
  login_title: string;
  register_title: string;
  emailLabel: string;
  email_label: string;
  emailPlaceholder: string;
  passwordLabel: string;
  password_label: string;
  passwordPlaceholder: string;
  loginButton: string;
  newCandidate: string;
  registerLink: string;
  backToHome: string;
  calDevoirs: string;
  calAnnuel: string;
  zoneCorrection: string;

  // Dashboards & Footer keys
  admin_dashboard_title: string;
  agent_dashboard_title: string;
  pending_receipts: string;
  commissions_tab: string;
  footer_tagline: string;
  footer_rights: string;
  footer_privacy: string;
  footer_terms: string;
  discover: string;
  close: string;
  show: string;
  view_maps: string;
  institution_title: string;
  location_el_mourouj: string;
  location_morneg: string;
}

export const translations: Record<Language, TranslationDict> = {
  ar: {
    academyName: "A-Zed Info",
    subTitle: "المختص في الإعلامية والتحضير للبكالوريا",
    directorName: "م. نبيل الشاوش",
    home: "الرئيسية",
    aboutUs: "مقدمة",
    whatWeOffer: "ماذا نقدم؟",
    ourOffers: "عروضنا",
    howToUse: "كيفية الإستعمال",
    testimonialsTitle: "شهادات التلاميذ",
    contactUs: "إتصل بنا",
    login: "تسجيل الدخول",
    signUp: "سجل مجاناً",
    logout: "إنهاء الجلسة",
    profile: "ملفي الشخصي",
    shop: "المتجر المدرسي",
    searchPlaceholder: "...ابحث عن الفصول، الأدلة، الأكواد",
    search_placeholder: "...ابحث عن الفصول، الأدلة، الأكواد",
    search_button: "بحث",
    menu_student: "فضاء التلميذ المخصص",
    recent_history: "السجل الحديث",
    clear_all: "مسح الكل",
    search_suggestions: "مقترحات البحث",
    menu: "القائمة",
    back: "رجوع",

    // Banner & Main Messages
    banner_title: "جاهز للنجاح؟",
    banner_subtitle: "تجد جميع دروسك الثلاثية، فروضك ومواردك الممتازة المخصصة مباشرة في فضائك الخاص.",
    empty_courses_title: "لم يتم العثور على أي درس",
    empty_courses_desc: "لا يظهر أي درس من البرنامج المدرسي الرسمي للمستوى {{level}}.",
    empty_devoirs_title: "لا توجد فروض متاحة حاليا",
    empty_devoirs_desc: "لم يتم نشر الفروض لهذه الفترة الدراسية بعد أو هي قيد التقييم التربوي.",
    empty_corrections_title: "لا توجد تمارين مصلحة حاليا",
    empty_corrections_desc: "الإصلاحات لهذه الفترة لم يتم مشاركتها بعد أو هي في انتظار النشر.",

    // Tabs & Categories
    courses_and_videos: "الدروس والفيديوهات",
    trimester_1: "الثلاثي الأول",
    trimester_2: "الثلاثي الثاني",
    trimester_3: "الثلاثي الثالث",
    homework_exercises: "الفروض والتمارين",
    correction_zone: "فضاء الإصلاحات والحلول",
    revision: "المراجعة",

    // Hero Section
    heroTitle: "المنصة الأولى باش",
    heroHighlight: "تضمن الباك وتنجح بامتياز !",
    heroSubtext: "ملخصات ذكية، فيديوهات قصيرة، لايف تفاعلي وكويزات سريعة. راجع بذكاء مع نخبة من أفضل الأساتذة في تونس.",
    heroCtaPrimary: "ابدأ مجاناً توّة",
    heroCtaSecondary: "عرض تجريبي",

    // About Section
    aboutTitle: "علاش تراجع معانا؟",
    aboutText: "أ-زيد إنفو هي الطريقة الأمثل اللي صممها الأستاذ نبيل الشاوش باش تسهلك المراجعة من الأولى ثانوي للبكالوريا. دروس مبسطة، إصلاح امتحانات خطوة بخطوة، ومترجم بايثون تفاعلي في بلاصة واحدة للتميز والنجاح الدراسي.",
    videoPlaceholder: "ما هي أكاديميتنا؟ شاهد الفيديو التعريفي",

    // Educational Content Section
    contentTitle: "تحضير على قياسك",
    contentSubtitle: "كل ما تحتاجه باش تطير في قرايتك",
    feat1Title: "كويزات وتحديات سريعة",
    feat1Desc: "ثبت معلوماتك في دقيقة مع تمارين تفاعلية مصلحة بالفيديو.",
    feat2Title: "لايف تفاعلي متميز",
    feat2Desc: "اسأل أستاذك مباشرة ونحي الغموض على أي مفهوم صعيب.",
    feat3Title: "فيديوهات كبسولة قصيرة",
    feat3Desc: "فيديوهات مركزة ومبسطة تفهم بيها 100% من الدرس في 10 دقائق.",
    feat4Title: "إعادة غير محدودة للدروس",
    feat4Desc: "فاتك لايف؟ رصيدك يسمحلك تتفرج في التسجيلات في أي وقت وبكل راحة.",
    feat5Title: "مساعدة مباشرة مع الأساتذة",
    feat5Desc: "وحلت في تمرين؟ ابعث سؤالك وخذ الإجابة والشرح من أستاذك مباشرة.",
    feat6Title: "مرافقة وتنظيم",
    feat6Desc: "تعلم كيفاش تنظم وقتك، وتتخلص من ضغط الامتحانات وتراجع بذكاء.",
    feat7Title: "المتجر والكتب الرسمية",
    feat7Desc: "اطلب مباشرة كتبك المدرسية، سلاسل التمارين المطبوعة ودفاتر المراجعة بقلم الأستاذ نبيل الشاوش.",
    feat8Title: "تنوع كبير في التمارين",
    feat8Desc: "مجموعة واسعة ومتنوعة من التمارين التطبيقية، الفروض والتحديات لكل المستويات.",

    // Why Choose Us
    whyChooseUsTitle: "لماذا تختارنا ؟",
    why1: "مكتبة ضخمة من تمارين الإعلامية",
    why2: "حلول مبسطة ومثالية",
    why3: "محتوى مطابق للبرنامج الرسمي",
    why4: "فيديوهات تفسيرية وجذاذات عملية",

    // Steps Section
    stepsTitle: "كيفاش تبدأ معانا؟",
    stepsSubtitle: "4 خطوات ساهلة وسريعة تبدأ بيهم طريق النجاح وتحقيق حلمك",
    step1: "اعمل حسابك",
    step1Desc: "سجل مجاناً في أقل من 30 ثانية.",
    step2: "اختار عرضك",
    step2Desc: "تصفح واختار الباقة المثالية اللي تناسب مستواك وقرايتك.",
    step3: "اشحن رصيدك",
    step3Desc: "فعل دروسك، ملخصاتك والأدوات المتقدمة بكل سهولة.",
    step4: "راجع و تميز !",
    step4Desc: "جرب كود بايثون، احضر اللايفات واضمن ميزتك !",

    // Main App Tabs Translation
    tabCours: "الدروس والفيديوهات",
    tabDevoirs: "الفروض والتمارين",
    tabBibliotheque: "المكتبة الرقمية",
    tabQuiz: "الاختبارات الذكية",
    tabPython: "مترجم بايثون",
    tabCalendrier: "البث المباشر والأجندة",
    tabDemos: "فيديوهات العرض التجريبي",
    tabAssistant: "المتجر والكتب",
    tabShop: "الاشتراكات والاشتراء",
    tabProfile: "حسابي واشتراكاتي",

    trim1: "الثلاثي الأول",
    trim2: "الثلاثي الثاني",
    trim3: "الثلاثي الثالث",
    trimRevision: "المراجعة",

    footerCopyright: "جميع الحقوق محفوظة. مركز Le Plus & A-Zed Info",
    footerTagline: "شريكك المثالي للتميز الدراسي والنجاح في البكالوريا.",

    // Login / Student Space keys
    loginTitle: "فضاء التلميذ A-Zed Info",
    login_title: "تسجيل الدخول إلى فضائك",
    register_title: "إنشاء حساب تلميذ جديد",
    emailLabel: "البريد الإلكتروني للمترشح",
    email_label: "البريد الإلكتروني",
    emailPlaceholder: "مثال: eleve@azed.info",
    passwordLabel: "مفتاح الأمان (كلمة المرور)",
    password_label: "كلمة السر",
    passwordPlaceholder: "أدخل مفتاح الأمان أو كلمة المرور",
    loginButton: "تسجيل الدخول إلى الفضاء الخاص بي",
    newCandidate: "مترشح جديد على المنصة؟",
    registerLink: "أنشئ حسابك مجاناً ←",
    backToHome: "الرجوع إلى الصفحة الرئيسية",
    calDevoirs: "جدول الفروض (مهام)",
    calAnnuel: "الجدول السنوي",
    zoneCorrection: "فضاء الإصلاحات والحلول",

    // Dashboards & Footer
    admin_dashboard_title: "لوحة التحكم والإدارة الأكاديمية",
    agent_dashboard_title: "مُدقق الفواتير والإيصالات المدرسية",
    pending_receipts: "بطاقات الدفع والإيصالات",
    commissions_tab: "عمولاتي والتسجيلات",
    footer_tagline: "المنصة التعليمية التونسية المرجعية لعلوم الحاسوب والتكنولوجيا.",
    footer_rights: "جميع الحقوق محفوظة.",
    footer_privacy: "سياسة الخصوصية",
    footer_terms: "شروط الاستخدام",
    discover: "اكتشف",
    close: "إغلاق",
    show: "عرض",
    view_maps: "عرض الخرائط",
    institution_title: "المؤسسة: مركز Le Plus للغات والدعم المدرسي",
    location_el_mourouj: "الموقع: المروج",
    location_morneg: "الموقع: مرناق"
  },
  fr: {
    academyName: "A-Zed Info",
    subTitle: "Le spécialiste en informatique",
    directorName: "M. Nabil Chaouch",
    home: "Accueil",
    aboutUs: "Intro",
    whatWeOffer: "Nos Offres",
    ourOffers: "Nos offres",
    howToUse: "Demo",
    testimonialsTitle: "Témoignages",
    contactUs: "Contactez-nous",
    login: "Se connecter",
    signUp: "S'inscrire gratuitement",
    logout: "Terminer la Session",
    profile: "Mon Espace Profil",
    shop: "Boutique Scolaire",
    searchPlaceholder: "Rechercher chapitres, guides, codes...",
    search_placeholder: "Rechercher chapitres, guides, codes...",
    search_button: "Rechercher",
    menu_student: "Espace Élève Personnalisé",
    recent_history: "Historique récent",
    clear_all: "Effacer tout",
    search_suggestions: "Suggestions de recherche",
    menu: "Menu",
    back: "Retour",

    // Banner & Main Messages
    banner_title: "Prêt pour votre réussite ?",
    banner_subtitle: "Retrouvez vos cours trimestriels, vos devoirs et vos ressources premium personnalisées directement dans votre espace.",
    empty_courses_title: "Aucun cours trouvé",
    empty_courses_desc: "Aucun cours du programme scolaire officiel n'apparaît pour le niveau {{level}}.",
    empty_devoirs_title: "Aucun devoir disponible actuellement",
    empty_devoirs_desc: "Les devoirs de cette période d'études ne sont pas encore publiés par la direction ou sont en cours d'évaluation pédagogique.",
    empty_corrections_title: "Aucun exercice corrigé pour le moment",
    empty_corrections_desc: "Les corrections pour cette période ne sont pas encore partagées ou sont en attente de publication.",

    // Tabs & Categories
    courses_and_videos: "Fiches & cours",
    trimester_1: "1ère Trimestre",
    trimester_2: "2ème Trimestre",
    trimester_3: "3ème Trimestre",
    homework_exercises: "Devoirs & Exercices",
    correction_zone: "Zone Correction",
    revision: "Révision",

    // Hero Section
    heroTitle: "",
    heroHighlight: "L'informatique n'est pas une matiére c'est votre avenir",
    heroSubtext: "Fiches claires, vidéos courtes, lives interactifs et quiz rapides. Révise intelligemment avec les meilleurs profs de Tunisie.",
    heroCtaPrimary: "Commencer gratuitement",
    heroCtaSecondary: "Demo",

    // About Section
    aboutTitle: "Pourquoi réviser avec nous ?",
    aboutText: "A-Zed Info c'est la méthode créée par professeur Nabil Chaouch pour simplifier la révision en informatique vous pouvez accéder a un cours simplifié quiz exercices et bac corrigé et un compilateur Python.",
    videoPlaceholder: "Qu'est-ce que notre Académie ? Regardez la vidéo",

    // Educational Content Section
    contentTitle: "Une réussite assurée",
    contentSubtitle: "Tout pour cartonner dans tes examens",
    feat1Title: "Quiz express & défis",
    feat1Desc: "Valide tes connaissances instantanément avec des exercices interactifs corrigés.",
    feat2Title: "Lives interactifs",
    feat2Desc: "Pose tes questions en direct à tes profs et lève tes doutes immédiatement.",
    feat3Title: "Vidéos capsules",
    feat3Desc: "Des vidéos courtes et percutantes pour comprendre 100% du cours en 10 minutes.",
    feat4Title: "Replays illimités",
    feat4Desc: "Un cours manqué ou mal compris ? Revois tous les enregistrements quand tu veux.",
    feat5Title: "Support H24 avec nos profs",
    feat5Desc: "Bloqué sur un exercice ? Échange directement avec tes enseignants sur l'espace d'entraide.",
    feat6Title: "Méthode & Mental",
    feat6Desc: "Gère ton stress, planifie tes révisions et reste motivé toute l'année.",
    feat7Title: "Boutique & Livres Officiels",
    feat7Desc: "Commande directement tes manuels scolaires, séries d'exercices imprimées et carnets de révision rédigés par M. Nabil Chaouch.",
    feat8Title: "Diversité des exercices",
    feat8Desc: "Une large gamme d'exercices pratiques, de devoirs et de défis interactifs pour tester tes compétences.",

    // Why Choose Us
    whyChooseUsTitle: "Nos qualités",
    why1: "Bibliothèque énorme d'exercices d'informatique",
    why2: "Solutions simplifiées et optimales",
    why3: "Contenu conforme au programme officiel",
    why4: "Vidéos explicatives et fiches pratiques",

    // Steps Section
    stepsTitle: "Demo : Rejoins l'aventure !",
    stepsSubtitle: "Seulement 4 étapes rapides pour lancer ta réussite",
    step1: "Crée ton compte",
    step1Desc: "Inscription gratuite en 30 secondes chrono.",
    step2: "Choisis ta formule",
    step2Desc: "Sélectionne le pack idéal selon tes besoins et ton niveau.",
    step3: "Recharge ton solde",
    step3Desc: "Active tes cours, fiches et outils premium en un clic.",
    step4: "Révise & Brille !",
    step4Desc: "Pratique le Python, suis les lives et assure ta mention !",

    // Main App Tabs Translation
    tabCours: "Fiches & cours",
    tabDevoirs: "Devoirs & Exercices",
    tabBibliotheque: "Bibliothèque E-Book",
    tabQuiz: "Quiz Interactifs",
    tabPython: "Python Compiler",
    tabCalendrier: "Calendrier & Live",
    tabDemos: "Démo & Extraits",
    tabAssistant: "Boutique & Livres",
    tabShop: "Abonnements / Shop",
    tabProfile: "Mon Espace Profil",

    trim1: "1ère Trimestre",
    trim2: "2ème Trimestre",
    trim3: "3ème Trimestre",
    trimRevision: "Révision",

    footerCopyright: "Tous droits réservés. Centre Le Plus & A-Zed Info",
    footerTagline: "Votre partenaire idéal pour l'excellence académique et la réussite au Baccalauréat.",

    // Login / Student Space keys
    loginTitle: "Espace Élève A-Zed Info",
    login_title: "Connexion à votre espace",
    register_title: "Créer un compte étudiant",
    emailLabel: "Adresse E-mail du Candidat",
    email_label: "Adresse E-mail",
    emailPlaceholder: "Ex : eleve@azed.info",
    passwordLabel: "Clé d'Accès de Sécurité (Mot de Passe)",
    password_label: "Mot de passe",
    passwordPlaceholder: "Saisissez votre clé ou mot de passe",
    loginButton: "Se connecter à mon espace",
    newCandidate: "Nouveau candidat sur la plateforme ?",
    registerLink: "Créer un profil gratuitement →",
    backToHome: "Retour à la page d'accueil",
    calDevoirs: "Calendrier Devoirs (To-Do)",
    calAnnuel: "Calendrier Annuel",
    zoneCorrection: "Zone Correction",

    // Dashboards & Footer
    admin_dashboard_title: "Console d'Administration Académique",
    agent_dashboard_title: "Validateur de Factures & Reçus Scolaires",
    pending_receipts: "Fiches de Paiement & Reçus",
    commissions_tab: "Mes Commissions & Inscriptions",
    footer_tagline: "Plateforme éducative tunisienne de référence pour l'informatique et les sciences.",
    footer_rights: "Tous droits réservés.",
    footer_privacy: "Politique de confidentialité",
    footer_terms: "Conditions d'utilisation",
    discover: "Découvrir",
    close: "Fermer",
    show: "Afficher",
    view_maps: "Voir Cartes",
    institution_title: "Institution : Le Plus - Centre de langues et assistance scolaire",
    location_el_mourouj: "Localisation : El Mourouj",
    location_morneg: "Localisation : Morneg"
  },
  en: {
    academyName: "A-Zed Info",
    subTitle: "Academic & Computer Science Support",
    directorName: "Mr. Nabil Chaouch",
    home: "Home",
    aboutUs: "Intro",
    whatWeOffer: "What We Offer",
    ourOffers: "Our Offers",
    howToUse: "How It Works",
    testimonialsTitle: "Testimonials",
    contactUs: "Contact Us",
    login: "Log In",
    signUp: "Register for Free",
    logout: "Log Out",
    profile: "My Profile",
    shop: "School Shop",
    searchPlaceholder: "Search chapters, guides, codes...",
    search_placeholder: "Search chapters, guides, codes...",
    search_button: "Search",
    menu_student: "Personalized Student Portal",
    recent_history: "Recent History",
    clear_all: "Clear All",
    search_suggestions: "Search Suggestions",
    menu: "Menu",
    back: "Back",

    // Banner & Main Messages
    banner_title: "Ready for success?",
    banner_subtitle: "Find your quarterly courses, homework, and personalized premium resources directly in your dashboard.",
    empty_courses_title: "No courses found",
    empty_courses_desc: "No official curriculum courses are currently available for level {{level}}.",
    empty_devoirs_title: "No homework available currently",
    empty_devoirs_desc: "Homework for this study period has not been published yet or is under pedagogical evaluation.",
    empty_corrections_title: "No corrected exercises at the moment",
    empty_corrections_desc: "Corrections for this period have not been shared yet or are awaiting publication.",

    // Tabs & Categories
    courses_and_videos: "Study Guides & Courses",
    trimester_1: "1st Trimester",
    trimester_2: "2nd Trimester",
    trimester_3: "3rd Trimester",
    homework_exercises: "Homework & Exercises",
    correction_zone: "Correction Zone",
    revision: "Revision",

    // Hero Section
    heroTitle: "A complete educational experience for ",
    heroHighlight: "your path to excellence",
    heroSubtext: "We provide an outstanding and fully integrated distance learning experience across various subjects for students from junior high to high school graduation (Baccalaureate).",
    heroCtaPrimary: "Join Now for Free",
    heroCtaSecondary: "Demo",

    // About Section
    aboutTitle: "About Us",
    aboutText: "A-Zed Info is a leading online learning platform, offering everything high school and Baccalaureate students need to excel: comprehensive notes, recorded explanation videos, and interactive live classes taught by highly elite educators.",
    videoPlaceholder: "What is our academy? Watch our introduction video",

    // Educational Content Section
    contentTitle: "Educational Content",
    contentSubtitle: "High-Quality and Complete",
    feat1Title: "Interactive Quizzes",
    feat1Desc: "Test your knowledge and track your progress instantly with our advanced question bank.",
    feat2Title: "Interactive Live Classes",
    feat2Desc: "Attend live webinars with top-tier teachers, ask questions, and engage in discussions.",
    feat3Title: "Concept Explanations",
    feat3Desc: "High-definition video lectures breaking down complex topics in accordance with official syllabus guidelines.",
    feat4Title: "Recorded Live Sessions",
    feat4Desc: "Access recordings of live classes anytime to review challenging material whenever you need.",
    feat5Title: "Teacher Support Space",
    feat5Desc: "Communicate directly with dedicated instructors to resolve homework questions and study doubts.",
    feat6Title: "Psychological Mentorship",
    feat6Desc: "Expert psychological guidance to build confidence, manage stress, and schedule your studying effectively.",
    feat7Title: "Official Shop & Books",
    feat7Desc: "Order your printed textbooks, exercise series, and revision booklets written by Mr. Nabil Chaouch directly with fast delivery.",
    feat8Title: "Diversity of Exercises",
    feat8Desc: "A wide range of practical exercises, assignments, and interactive challenges for all levels.",

    // Why Choose Us
    whyChooseUsTitle: "Why Choose Our Academy?",
    why1: "Huge library of computer science exercises",
    why2: "Simplified and optimal solutions",
    why3: "Content compliant with official curriculum",
    why4: "Explanatory videos and practical sheets",

    // Steps Section
    stepsTitle: "How to Use the Platform",
    stepsSubtitle: "Get started on your learning journey in just 4 simple steps",
    step1: "Register for Free",
    step1Desc: "Create your personal account in less than a minute at no cost",
    step2: "Select Your Plan",
    step2Desc: "Browse and select the perfect educational package for your study goals",
    step3: "Top Up Your Wallet",
    step3Desc: "Safely recharge your account to activate full course and feature access",
    step4: "Learn & Succeed",
    step4Desc: "Study hard, stay focused, revise courses, and excel in your exams",

    // Main App Tabs Translation
    tabCours: "Study Guides & Courses",
    tabDevoirs: "Homework & Exercises",
    tabBibliotheque: "Digital E-Book Library",
    tabQuiz: "Interactive Quizzes",
    tabPython: "Python Compiler",
    tabCalendrier: "Live Calendar & Events",
    tabDemos: "Demo & Sample Videos",
    tabAssistant: "Shop & Books",
    tabShop: "Subscriptions & Shop",
    tabProfile: "My Profile Space",

    trim1: "1st Trimester",
    trim2: "2nd Trimester",
    trim3: "3rd Trimester",
    trimRevision: "Revision",

    footerCopyright: "All rights reserved. Centre Le Plus & A-Zed Info",
    footerTagline: "Your ideal partner for academic excellence and Baccalaureate success.",

    // Login / Student Space keys
    loginTitle: "A-Zed Info Student Space",
    login_title: "Log in to your account",
    register_title: "Create a student account",
    emailLabel: "Candidate Email Address",
    email_label: "Email Address",
    emailPlaceholder: "E.g.: student@azed.info",
    passwordLabel: "Security Access Key (Password)",
    password_label: "Password",
    passwordPlaceholder: "Enter your access key or password",
    loginButton: "Log in to my workspace",
    newCandidate: "New candidate on the platform?",
    registerLink: "Create a profile for free →",
    backToHome: "Back to Homepage",
    calDevoirs: "Homework Calendar (To-Do)",
    calAnnuel: "Annual Calendar",
    zoneCorrection: "Correction Zone",

    // Dashboards & Footer
    admin_dashboard_title: "Academic Administration Console",
    agent_dashboard_title: "School Invoices & Receipts Validator",
    pending_receipts: "Payment Cards & Receipts",
    commissions_tab: "My Commissions & Enrollments",
    footer_tagline: "The leading Tunisian educational platform for computer science and tech.",
    footer_rights: "All rights reserved.",
    footer_privacy: "Privacy Policy",
    footer_terms: "Terms of Service",
    discover: "Discover",
    close: "Close",
    show: "Show",
    view_maps: "View Maps",
    institution_title: "Institution: Le Plus - Language & Academic Support Center",
    location_el_mourouj: "Location: El Mourouj",
    location_morneg: "Location: Morneg"
  }
};

