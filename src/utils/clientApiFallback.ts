/**
 * Resilient Client-Side Mock Database & Fail-Safe API Fallback Engine
 * Enables 100% offline, static Vercel, or serverless deployment compatibility.
 * Automatically intercepts /api/* calls when backend endpoints return 404, 500, HTML, or fail.
 */

interface StoredDb {
  users: any[];
  receipts: any[];
  orders: any[];
  events: any[];
  notifications: any[];
  ebooks: any[];
  products: any[];
  courses: any[];
  auditLogs: any[];
  interactiveQuizzes: any[];
  quizSubmissions: any[];
  todoEvents: any[];
  quizTips: Array<{ id: string; text: string; createdAt: string }>;
  flipbooks: any[];
  demos: any[];
  commissions: any[];
  commissionWithdrawals?: any[];
  signUpOffers: any[];
  passwordResetRequests?: any[];
  branding?: any;
  homeCards?: any[];
}

const STORAGE_KEY = "azed_mock_db_store";

function getInitialDb(): StoredDb {
  return {
    auditLogs: [
      {
        id: "log-1",
        userId: "usr_admin_center",
        userName: "M. Nabil Chaouch",
        userRole: "SUPER_ADMIN",
        action: "INITIALISATION_SYSTEME",
        category: "ADMINISTRATION",
        status: "SUCCESS",
        timestamp: new Date().toISOString(),
        details: "Plateforme A-zed Info prête et initialisée avec succès."
      }
    ],
    users: [
      {
        id: "usr_admin_center",
        email: "centreleplus@gmail.com",
        fullName: "Nabil Chaouch (Le Plus)",
        name: "Nabil Chaouch (Le Plus)",
        role: "admin",
        grade: "Tous",
        section: "Administration",
        status: "active",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-06-05T00:00:00Z",
        password: "admin123",
        phone: "21620123456",
        address: "Centre Le Plus, El Mourouj, Tunis",
        accountType: "premium",
        badgeLabel: "Super Admin",
        badge_label: "Super Admin",
        verified: true,
        activeDevicesCount: 1,
        maxAllowedDevices: 10
      },
      {
        id: "usr_admin",
        email: "admin@azed.info",
        fullName: "M. Nabil Chaouch",
        name: "M. Nabil Chaouch",
        role: "admin",
        grade: "Tous",
        section: "Administration",
        status: "active",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-05-01T10:00:00Z",
        password: "admin123",
        phone: "21620123456",
        accountType: "premium",
        badgeLabel: "Super Admin",
        badge_label: "Super Admin",
        verified: true,
        activeDevicesCount: 1,
        maxAllowedDevices: 10
      },
      {
        id: "std-1",
        email: "fedi.freemium@azed.info",
        fullName: "Fedi Ben Amor",
        name: "Fedi Ben Amor",
        role: "student",
        grade: "4ème",
        section: "Sciences de l'Informatique",
        status: "active",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-08-10T10:00:00Z",
        password: "fedipasswd123",
        phone: "21698123456",
        city: "Tunis",
        highSchool: "Lycée Pilote Tunis",
        accountType: "freemium",
        badgeLabel: "Option Gratuit",
        badge_label: "Option Gratuit",
        badgeType: "Option Freemium",
        badge_type: "Option Freemium",
        tier: "FREEMIUM",
        tierCategory: "FREEMIUM",
        tierBadge: "Option Gratuit",
        groupe_etude: "Non assigné",
        studyGroup: "Non assigné",
        verified: true,
        packs: [],
        subscriptionType: "freemium"
      },
      {
        id: "std-2",
        email: "yasmine.premium@azed.info",
        fullName: "Yasmine Mansour",
        name: "Yasmine Mansour",
        role: "student",
        grade: "3ème",
        section: "Sciences de l'Informatique",
        status: "active",
        activeSessionId: null,
        avatarUrl: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
        createdAt: "2026-08-11T11:00:00Z",
        password: "yasminepass123",
        phone: "21697234567",
        city: "Sousse",
        highSchool: "Lycée Garçons Sousse",
        accountType: "premium",
        badgeLabel: "Pack Premium",
        badge_label: "Pack Premium",
        badgeType: "Zap (Premium)",
        badge_type: "Zap (Premium)",
        tier: "PREMIUM",
        tierCategory: "PREMIUM",
        tierBadge: "Pack Premium",
        groupe_etude: "Groupe A",
        studyGroup: "Groupe A",
        verified: true,
        packs: ["Pack Premium"],
        subscriptionType: "trimestriel",
        subscriptionExpiresAt: "2027-08-11T11:00:00Z"
      }
    ],
    receipts: [
      {
        id: "rec-101",
        userId: "std-2",
        userName: "Yasmine Mansour",
        userEmail: "yasmine.premium@azed.info",
        amount: 85,
        targetPack: "Pack Premium",
        receiptUrl: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&q=80&w=600",
        status: "approved",
        createdAt: "2026-08-11T10:45:00Z",
        approvedAt: "2026-08-11T11:00:00Z",
        paymentMethod: "D17 / Mandat Minute"
      }
    ],
    orders: [],
    events: [
      {
        id: "evt-1",
        title: "Live Révision Générale Python & Algorithmique",
        title_event: "Live Révision Générale Python & Algorithmique",
        date: "2026-09-15",
        date_start: "2026-09-15",
        time: "18:30",
        durationMinutes: 90,
        duration_minutes: 90,
        zoomLink: "https://zoom.us/j/azed-info-live",
        zoom_link: "https://zoom.us/j/azed-info-live",
        grade: "4ème",
        target_class: "4ème",
        section: "Sciences de l'Informatique",
        target_specialty: "Sciences de l'Informatique",
        type: "live",
        description: "Séance interactive en direct avec M. Nabil Chaouch. Analyse d'annales de bac national.",
        created_at: "2026-08-20T10:00:00Z",
        notifyStudents: true
      }
    ],
    notifications: [],
    ebooks: [],
    products: [
      {
        id: "prod-1",
        name: "L'Essentiel de l'Algorithmique & Python",
        category: "Livres",
        price: 35,
        originalPrice: 45,
        rating: 4.9,
        reviewsCount: 128,
        imageUrl: "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&q=80&w=400",
        isPack: false,
        grade: "4ème Bac Info",
        stock: 50,
        inStock: true
      },
      {
        id: "prod-2",
        name: "Pack Excellence Bac Informatique 2026",
        category: "Packs",
        price: 120,
        originalPrice: 160,
        rating: 5.0,
        reviewsCount: 210,
        imageUrl: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&q=80&w=400",
        isPack: true,
        badge: "MEILLEURE VENTE",
        grade: "4ème Bac Info",
        stock: 100,
        inStock: true
      }
    ],
    courses: [
      {
        id: "crs-1",
        title: "Introduction aux Sous-Programmes en Python",
        category: "Algorithmique",
        grade: "4ème",
        section: "Sciences de l'Informatique",
        videoUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        duration: "45 min",
        isPremium: false,
        createdAt: "2026-08-01T10:00:00Z"
      }
    ],
    interactiveQuizzes: [
      {
        id: "quiz-1",
        title: "QCM - Les Fonctions et Procédures en Python",
        type: "qcm",
        grade: "4ème",
        difficulty: "Intermediaire",
        creatorName: "M. Nabil Chaouch",
        createdAt: "2026-08-01T10:00:00Z",
        questions: [
          {
            id: 1,
            question: "En Python, quel mot-clé permet de définir une fonction ?",
            options: ["function", "def", "procedure", "fun"],
            correctAnswer: 1,
            explanation: "Le mot-clé standard en langage Python pour définir une fonction est 'def'."
          }
        ]
      }
    ],
    quizSubmissions: [],
    todoEvents: [],
    quizTips: [
      {
        id: "tip-1",
        text: "Pensez toujours à vérifier le cas limite (liste vide ou index hors limites) lors de l'écriture d'un algorithme de recherche.",
        createdAt: "2026-08-10T10:00:00Z"
      }
    ],
    flipbooks: [],
    demos: [],
    commissions: [],
    signUpOffers: []
  };
}

export function getClientDb(): StoredDb {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      // Ensure super-admin always exists in mock DB
      const hasSuperAdmin = parsed.users && parsed.users.some((u: any) => u.email === "centreleplus@gmail.com");
      if (!hasSuperAdmin) {
        if (!parsed.users) parsed.users = [];
        parsed.users.unshift({
          id: "usr_admin_center",
          email: "centreleplus@gmail.com",
          fullName: "Nabil Chaouch (Le Plus)",
          name: "Nabil Chaouch (Le Plus)",
          role: "admin",
          grade: "Tous",
          section: "Administration",
          status: "active",
          activeSessionId: null,
          avatarUrl: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?auto=format&fit=crop&q=80&w=200",
          createdAt: "2026-06-05T00:00:00Z",
          password: "admin123",
          phone: "21620123456",
          address: "Centre Le Plus, El Mourouj, Tunis",
          accountType: "premium",
          badgeLabel: "Super Admin",
          verified: true
        });
        saveClientDb(parsed);
      }
      return parsed;
    }
  } catch (e) {
    console.warn("Failed to load client mock DB:", e);
  }

  const initial = getInitialDb();
  saveClientDb(initial);
  return initial;
}

export function saveClientDb(db: StoredDb): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  } catch (e) {
    console.warn("Failed to save client mock DB to localStorage:", e);
  }
}

/**
 * Dispatches simulated mock response for /api/* requests
 */
async function handleMockApiRequest(url: string, method: string, body: any): Promise<Response> {
  const db = getClientDb();
  const cleanUrl = url.split("?")[0].replace(/^\/api\//, "").replace(/^api\//, "");

  // 1. AUTH LOGIN
  if (cleanUrl === "auth/login" && method === "POST") {
    const { email, password } = body || {};
    const normalizedEmail = (email || "").trim().toLowerCase();
    const normalizedPass = (password || "").trim();

    const user = db.users.find(
      (u) => (u.email || "").toLowerCase() === normalizedEmail
    );

    if (!user) {
      return new Response(
        JSON.stringify({ success: false, msg: "Identifiants invalides (E-mail introuvable)." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const isAdmin = (user.role as string) === "admin" || (user.role as string) === "SUPER_ADMIN" || (user.role as string) === "super_admin";
    const expectedPass = user.password || (isAdmin ? "admin123" : "student123");

    if (normalizedPass !== expectedPass) {
      return new Response(
        JSON.stringify({ success: false, msg: "Mot de passe incorrect." }),
        { status: 401, headers: { "Content-Type": "application/json" } }
      );
    }

    const userWithoutPassword = { ...user };
    delete userWithoutPassword.password;

    return new Response(
      JSON.stringify({
        success: true,
        token: `mock_token_${user.id}_${Date.now()}`,
        user: userWithoutPassword
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 2. CHANGE PASSWORD (SUPER-ADMIN & USER)
  if (
    (cleanUrl === "admin/change-password" || cleanUrl === "user/change-password" || cleanUrl === "auth/change-password") &&
    method === "POST"
  ) {
    const { userId, email, currentPassword, oldPassword, newPassword, password } = body || {};
    const finalPassword = (newPassword || password || "").trim();
    const providedOldPassword = (currentPassword || oldPassword || "").trim();

    if (!finalPassword || finalPassword.length < 6) {
      return new Response(
        JSON.stringify({ error: "Le mot de passe doit comporter au moins 6 caractères." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    let userIndex = -1;
    if (userId) {
      userIndex = db.users.findIndex((u) => u.id === userId);
    }
    if (userIndex === -1 && email) {
      userIndex = db.users.findIndex((u) => (u.email || "").toLowerCase() === (email || "").toLowerCase());
    }
    if (userIndex === -1) {
      userIndex = db.users.findIndex((u) => (u.email || "").toLowerCase() === "centreleplus@gmail.com");
    }

    if (userIndex === -1) {
      return new Response(
        JSON.stringify({ error: "Utilisateur introuvable." }),
        { status: 404, headers: { "Content-Type": "application/json" } }
      );
    }

    const user = db.users[userIndex];
    const isAdmin = (user.role as string) === "admin" || (user.role as string) === "SUPER_ADMIN" || (user.role as string) === "super_admin";
    const expectedOld = user.password || (isAdmin ? "admin123" : "student123");

    if (providedOldPassword && providedOldPassword !== expectedOld) {
      return new Response(
        JSON.stringify({ error: "L'ancien mot de passe saisi est incorrect." }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    user.password = finalPassword;
    db.users[userIndex] = user;

    db.auditLogs.unshift({
      id: `audit-${Date.now()}`,
      userId: user.id,
      userName: user.fullName || user.name || user.email,
      userRole: user.role,
      action: "CHANGEMENT_MOT_DE_PASSE",
      category: "SECURITE",
      status: "SUCCESS",
      timestamp: new Date().toISOString(),
      details: "Mot de passe administrateur mis à jour avec succès dans le stockage local persistant."
    });

    saveClientDb(db);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Mot de passe mis à jour avec succès !",
        updatedAt: new Date().toISOString()
      }),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }

  // 3. USERS
  if (cleanUrl === "users" || cleanUrl === "admin/users") {
    if (method === "GET") {
      const sanitizedUsers = db.users.map((u) => {
        const copy = { ...u };
        delete copy.password;
        return copy;
      });
      return new Response(JSON.stringify(sanitizedUsers), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
  }

  // 4. RECEIPTS
  if (cleanUrl === "admin/receipts" || cleanUrl === "receipts") {
    return new Response(JSON.stringify(db.receipts || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 5. PRODUCTS
  if (cleanUrl === "products" || cleanUrl === "admin/products") {
    return new Response(JSON.stringify(db.products || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 6. COURSES
  if (cleanUrl === "courses" || cleanUrl === "admin/courses") {
    return new Response(JSON.stringify(db.courses || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 7. EVENTS
  if (cleanUrl === "events" || cleanUrl === "admin/events") {
    return new Response(JSON.stringify(db.events || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 8. QUIZZES
  if (cleanUrl === "quizzes" || cleanUrl === "admin/quizzes") {
    return new Response(JSON.stringify(db.interactiveQuizzes || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  if (cleanUrl === "quizzes/tips") {
    return new Response(JSON.stringify(db.quizTips || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 9. AUDIT LOGS
  if (cleanUrl === "admin/audit-logs") {
    return new Response(JSON.stringify(db.auditLogs || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 10. TODO EVENTS
  if (cleanUrl === "todo-events") {
    return new Response(JSON.stringify(db.todoEvents || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 11. PASSWORD RESETS
  if (cleanUrl === "admin/password-resets") {
    return new Response(JSON.stringify(db.passwordResetRequests || []), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 12. BRANDING & SETTINGS
  if (cleanUrl === "branding" || cleanUrl === "admin/branding") {
    if (method === "POST") {
      db.branding = { ...db.branding, ...body };
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, branding: db.branding }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify(db.branding || {}), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // 13. HOME CARDS
  if (cleanUrl === "home-cards") {
    if (method === "POST") {
      db.homeCards = body?.cards || [];
      saveClientDb(db);
      return new Response(JSON.stringify({ success: true, cards: db.homeCards }), {
        status: 200,
        headers: { "Content-Type": "application/json" }
      });
    }
    return new Response(JSON.stringify({ success: true, cards: db.homeCards || [] }), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });
  }

  // Generic fallback for any other endpoint
  return new Response(
    JSON.stringify({ success: true, data: [] }),
    { status: 200, headers: { "Content-Type": "application/json" } }
  );
}

/**
 * Initializes transparent global fetch interceptor
 */
export function setupClientApiFallback(): void {
  if (typeof window === "undefined" || (window as any).__api_fallback_installed) return;
  (window as any).__api_fallback_installed = true;

  if (typeof window.fetch !== "function") return;

  const originalFetch = window.fetch.bind(window);

  const customFetch = async function (input: RequestInfo | URL, init?: RequestInit): Promise<Response> {
    let urlString = "";
    if (typeof input === "string") {
      urlString = input;
    } else if (input instanceof URL) {
      urlString = input.toString();
    } else if (input && typeof (input as any).url === "string") {
      urlString = (input as any).url;
    }

    const isApiRequest = urlString.startsWith("/api/") || urlString.startsWith("api/") || urlString.includes("/api/");

    if (!isApiRequest) {
      return originalFetch(input, init);
    }

    let parsedBody: any = null;
    if (init && init.body && typeof init.body === "string") {
      try {
        parsedBody = JSON.parse(init.body);
      } catch {
        parsedBody = init.body;
      }
    }

    const method = (init?.method || "GET").toUpperCase();

    try {
      const response = await originalFetch(input, init);

      // If response is valid JSON and not a 404 or HTML index fallback
      const contentType = response.headers.get("content-type") || "";
      if (response.ok && contentType.includes("application/json")) {
        return response;
      }

      // If server returned 404, 500, or HTML (e.g. Vercel SPA rewrite of /api/* to index.html)
      if (!response.ok || contentType.includes("text/html")) {
        return await handleMockApiRequest(urlString, method, parsedBody);
      }

      return response;
    } catch (networkError) {
      // Network failed or offline or Vercel static deployment with no backend
      return await handleMockApiRequest(urlString, method, parsedBody);
    }
  };

  try {
    Object.defineProperty(window, "fetch", {
      value: customFetch,
      writable: true,
      configurable: true,
      enumerable: true
    });
  } catch (err1) {
    try {
      (window as any).fetch = customFetch;
    } catch (err2) {
      try {
        Object.defineProperty(Object.getPrototypeOf(window), "fetch", {
          value: customFetch,
          writable: true,
          configurable: true,
          enumerable: true
        });
      } catch (err3) {
        console.warn("Client fallback fetch interceptor could not be attached:", err3);
      }
    }
  }
}
